# Chuẩn bị QL2 chạy production trên Cloud Run

Ngày rà soát: 09/09/2026. Source nền: `d921682d88378fe4b64aaba9814ec849bab28e38`, lấy bằng `git fetch origin` từ repo private **2shousefly-creator/QL2**. Branch làm việc: `codex/cloud-run-production`. Working tree sạch trước khi sửa. Không tạo repo/fork/mirror, không sửa main.

**Đây là source và hướng dẫn chuẩn bị, chưa phải hệ thống đã triển khai.** Chưa truy cập project GCP, chưa xác minh billing/API/IAM/secret, chưa tạo trigger, cloud resource, đổi DNS hay dữ liệu production. Xem [thay đổi và kiểm chứng](CHANGELOG.md), [chuyển save](save-migration.md), [Push riêng](push-migration.md).

## 1. Kiến trúc và audit HEAD

```text
GitHub QL2 -> Cloud Build (Dockerfile gốc) -> Artifact Registry
           -> Cloud Run quan-lo-web, asia-southeast1 -> URL run.app thực tế
           -> sau khi duyệt: Firebase Hosting / HTTPS dungha.xyz

Trình duyệt -> localStorage + IndexedDB (save cá nhân theo origin)
Backend Push cũ + Firestore + Cloud Tasks: tiếp tục độc lập, chưa chuyển.
```

| Thành phần | Source/hành vi hiện tại | Phân loại và xử lý |
| --- | --- | --- |
| Frontend | `index.html` -> `src/main.tsx` -> `src/App.tsx`; React/Vite/TypeScript; routes chủ yếu theo state UI | Giữ; web build base `/`, hỗ trợ refresh đường dẫn SPA |
| Server legacy | `server.ts`, Express; port 3000; import Vite và khởi tạo Push ngay từ đầu | Giữ nguyên; KHÔNG chạy trong image mới |
| Scripts legacy | `dev=tsx server.ts`; `build=vite build && esbuild ... dist/server.cjs`; `start=node dist/server.cjs` | Giữ nguyên; `dist` của legacy còn chứa bundle server nên không dùng làm static root web mới |
| Web riêng | `server.web.ts` -> `dist-web/server.mjs`; static root `dist-web/client` relative to server module | Mới; Node built-ins, không có dependency npm runtime; không Vite/HMR/watchers/ADC |
| Package manager | Chỉ `bun.lock` (text lock v1/config v1); không package-lock | Bun 1.3.3 frozen install; không thay dependency/lockfile. Vite khai báo trùng dependencies/devDependencies là cảnh báo có sẵn |
| Static | `public/**` gồm sprites Tăng Gia, uniforms/rank badges, Mobi Army manifest/assets, version, SW; `assets/**` là nguồn tài nguyên | Giữ, Vite copy public và bundle imports; font Nunito từ Google Fonts; âm thanh game có Web Audio |
| AI | Có `@google/genai` trong package/lock, không tìm thấy import/lời gọi GenAI hoặc GEMINI_API_KEY trong app/server trên HEAD này | Giữ dependency; web chưa cần AI secret hoặc adapter. Gomoku AI là thuật toán/worker local, không Gemini |
| Google Cloud | `src/server/{config,firestore,cloudTasks,oidcAuth,webPushService}.ts` | Phải chờ migration riêng; đây là GCP API, không phải AI Studio hosting |
| AI Studio | `vite.config.ts` DISABLE_HMR, preview watcher; `.ai-studio-sync-ping.txt`; CORS host cũ trong server | Chỉ dev/legacy. Config web riêng không nạp config legacy; chưa tắt integration/sync |
| Build/version | Legacy Vite sửa `public/version.json`, có K_REVISION tùy chọn | Không thay legacy. Config web chỉ emit manifest tại build, cùng buildId với bundle; không dựa K_REVISION, không tạo ID lúc restart |
| SW/PWA | `public/sw.js`, scope `/` qua đăng ký `/sw.js`; `manifest.webmanifest`; cache `quan-lo-v5` | Giữ. Navigation/assets network-first; `/api/`, version và connectivity network-only. Click Push dùng payload URL/default `/`, có thể focus tab sẵn có |
| Mandatory update | `src/app-update/*`, App khôi phục pending backup trước version gate, sau đó settlement XP | Giữ nguyên cơ chế, schema 11/catalog 17, XP/rewards. Không chuyển installed-build marker giữa origin |
| CSP/CORS/redirect | CORS chỉ trong Push legacy; không thấy CSP/host callback bắt buộc hay auth redirect mới | Web không cần CORS/credential API; không đoán CSP có thể chặn font/audio/worker. Không bật trust proxy, không tin Forwarded headers |

### Request và endpoint đầy đủ theo source đã tìm

| Request/route | Caller và tác động | Web mới |
| --- | --- | --- |
| GET `/api/health` | Liveness web, status/app/version/timestamp; không kiểm tra readiness GCP | Có, không secret, no-store |
| GET `/version.json?ts=...` | versionService + buildInfo | Có, manifest cùng build, no-store |
| GET `/connectivity-check.txt?t=...` | useConnectivity, xác minh online | Có, no-store |
| GET static `/assets/**`, `/sw.js`, manifest và Google Fonts | sprites/audio/font/worker/Mobi Army loader | Giữ |
| GET `/api/push/vapid-public-key` | Lấy public VAPID | Không expose; client web không gọi |
| POST `/api/push/register` | Subscription -> Firestore | Không expose; client web không gọi |
| POST `/api/push/xp-full/schedule` | Ghi schedule/tạo task | Không expose; client web không gọi |
| POST `/api/push/xp-full/cancel` | Xóa task/đổi schedule | Không expose; client web không gọi |
| POST `/api/push/test` | Gửi Push thật | Không expose; trả trạng thái chưa bật tại UI |
| GET `/api/push/status?devicePushId=...` | Đọc diagnostics thiết bị | Không expose; trả trạng thái disabled tại client |
| POST `/internal/push/xp-full` | Worker OIDC, checkpoint/lease/gửi Push | Không expose |
| API khác, kể cả `/api` và `/internal` | Không có contract game khác được tìm thấy | JSON 404 trước SPA fallback; POST static 405 |

URL legacy được giữ trong `pushManager.ts` và `src/server/config.ts`: backend `quan-lo-push-api-953163983006.asia-southeast1.run.app`, project `gen-lang-client-0052121673`. CORS cũ gồm `https://quanlo.ai.studio`, hai preview `qu-n-l-h-nh-tr-nh-th-ng-c-p-kigpbzmhfq-as.a.run.app` / `...kigpbzmhiq-as.a.run.app`, localhost 3000/5173. Chỉ là tham chiếu source; không phải bằng chứng hạ tầng còn chạy hay quyền truy cập. Xem kế hoạch Push trước khi thêm origin mới.

`PUBLIC_URL`/`API_BASE_URL` không có consumer thực tế trên HEAD. `APP_URL` legacy ưu tiên trước `PUSH_TASK_TARGET_URL`, dùng target và OIDC audience; tuyệt đối không gán `dungha.xyz` vào biến đó để chuyển website. Source không có VITE_* consumer cần cấu hình; config web tắt envDir/envPrefix để không đưa env vào client. Giá trị public của build mới là build metadata và cờ `__WEB_PRODUCTION__`; cờ này chặn mọi đường gọi mạng Push và được tree-shake. Không có switch runtime cho phép vô tình bật lại Push.

### Kho dữ liệu

| Kho | Phân loại |
| --- | --- |
| `quan_lo_game_state_v1` | Save chính: player/avatar/settings, XP, energy/time, training, farm, Chiến Tuyến V2, Mobi Army, medals/mastery/journal/coupons theo GameState |
| `quan_lo_game_state_backup_v1` | Bản đồng bộ save, không phải lịch sử độc lập |
| IndexedDB `quan_lo_db` / `game_state` / `current` | Bản save dự phòng; không nằm trên server |
| `quan_lo_manual_update_backup`, `quan_lo_app_update_backup_v1` | Backup manual/emergency update |
| `quan_lo_app_update_pending_v1`, `quan_lo_just_updated` | Marker phục hồi/trạng thái cập nhật |
| `quan_lo_installed_build_v1`, `quan-lo-installed-build-v1` | Marker phiên bản đã chấp nhận |
| `quan_lo_air_combat_v1`, `quan_lo_tank_battle_v1` | Save minigame riêng, đưa vào export mới |
| `quan_lo_chien_tuyen_v1` | Hồ sơ Chiến Tuyến legacy; giữ nguyên raw, không tự chuyển thành V2 |
| `quanlo_notified_rank_indices_v1` | Lịch sử chống trùng thông báo local, không chuyển giữa origin |
| `quan-lo-device-push-id-v1`, browser Push subscription | Identity/subscription riêng từng origin, không export |
| Cache Storage `quan-lo-v5` | Cache app shell/assets, không save; không chuyển |
| `quan_lo_import_archive_<uuid>` (mới) | Bản nguyên văn input và snapshots đích trước mỗi import, không ghi đè archive trước |
| sessionStorage | Không tìm thấy sử dụng trong source app trên HEAD |
| Firestore `pushDevices` + Cloud Tasks `xp-full-push` | Dữ liệu Push server; không có cloud save người chơi được tìm thấy |

## 2. Build/image và kiểm chứng local

Dockerfile đặt đúng root QL2, context là root QL2 (không phải repo QuanLo1 cha). Multi-stage: Bun 1.3.3 chỉ để frozen install/run scripts, Node 24 bookworm-slim dùng builder/runtime. Node 24 đang LTS theo [lịch chính thức](https://nodejs.org/en/about/previous-releases); major + distro được cố định để nhận patch bảo mật, không dùng latest. Khi release chính thức nên ghi lại/pin digest đã kiểm tra trong quy trình review; không tuyên bố image bit-for-bit reproducible khi tag chưa pin digest. Bun 1.3.3 được chọn có chủ đích và frozen install đã được kiểm tra local, theo [hướng dẫn Bun](https://bun.com/guides/ecosystem/docker).

Runtime chỉ copy `dist-web`; dùng user `node`, NODE_ENV=production, EXPOSE 8080. Server đọc PORT 1..65535, bind 0.0.0.0, static path theo module, không phụ thuộc cwd. Không có express/Vite/SDK node_modules ở runtime. `.dockerignore` chặn env, keys, secrets, source maps, test artifacts, save/backup và local tools; Dockerfile còn dùng COPY allowlist. Không đặt dữ liệu riêng trong public/assets/src. Không ARG/ENV secret. Chưa build được Docker image vì máy không có Docker; frozen install/build trên Windows không thay thế kiểm chứng Linux container.

```sh
bun install --frozen-lockfile
bun run build:web
bun run verify:web
bun run verify:save-transfer
bun run lint
# Tùy chọn, khi máy có Playwright/browser (không cài thêm vào dependency game):
# PLAYWRIGHT_MODULE có thể trỏ tới file URL của Playwright đã cài;
# BROWSER_CHANNEL=msedge nếu muốn dùng Edge thay Chromium mặc định.
bun run verify:save-browser
# Chỉ chạy khi có Docker cục bộ; không phải deploy:
docker build --build-arg BUILD_ID=reviewed-release-id -t quan-lo-web:review .
docker run --rm -p 8080:8080 -e PORT=8080 quan-lo-web:review
```

Build metadata tùy chọn được truyền bằng Docker build args; Cloud Build substitution không tự trở thành Docker ARG. UI Dockerfile chạy được khi để trống: buildId `web-<build timestamp>` tạo đúng một lần lúc build, cố định trong image. BUILD_ID phải đổi khi nội dung release đổi; các replica phải dùng cùng image. Không chia traffic nhiều build trong giai đoạn mandatory update vì manifest có thể luân phiên gây lặp cập nhật.

HTML/version/SW/manifest/connectivity: no-store; hash assets: một năm immutable; sprites tên cố định: một giờ, ETag revalidate. Có MIME, HEAD, byte range audio, JSON 404 cho API/file thiếu, không phục vụ hidden path. Không log body/URL/subscription/env/stack. Liveness không hứa Firestore/AI sẵn sàng. SIGTERM đóng request và thoát tối đa 8 giây; cần xác minh signal thực tế trong Linux container. Theo [container contract](https://docs.cloud.google.com/run/docs/container-contract), filesystem không bền, instance có thể về 0 và scale song song; không dùng process timer/filesystem làm save hoặc lịch Push bền vững. CPU/request lifecycle và timeout không phù hợp worker timer tùy ý.

## 3. Những gì người dùng phải xác minh trong quanloweb

Mục tiêu đã biết: project ID `quanloweb`, tên QuanLoWeb, service `quan-lo-web`, region `asia-southeast1`, domain `dungha.xyz`. Chưa xác nhận bất kỳ tài nguyên/quyền/billing nào đã có.

1. Kiểm tra đúng project và billing account, chủ tài khoản duyệt chi phí trước Save/Create.
2. APIs tối thiểu của luồng build: Cloud Run (`run.googleapis.com`), Cloud Build (`cloudbuild.googleapis.com`), Artifact Registry (`artifactregistry.googleapis.com`); Logging và IAM/Service Usage phục vụ quản trị. Kiểm tra source connection GitHub và quyền repo private trong UI. Nếu UI dùng kết nối thế hệ mới, kiểm tra thêm API/quyền kết nối mà UI yêu cầu; không bật đại trà.
3. Dùng runtime SA riêng, ví dụ tên đề xuất `quan-lo-web-runtime` trong quanloweb; web hiện tại không cần Firestore/Tasks/GenAI/secretAccessor. Không cấp Editor/Owner và không tạo JSON key. Public access của service chỉ cho UI/health, không làm endpoint internal trở nên public.
4. Chọn build SA riêng trong trigger, đừng đoán SA mặc định: Google đã [thay đổi mặc định Cloud Build SA](https://docs.cloud.google.com/build/docs/cloud-build-service-account-updates). Nếu cùng job build + deploy: Artifact Registry Writer trên đúng repository, Logs Writer theo cách lưu log, quyền đọc source staging nếu flow dùng bucket, Cloud Run Developer theo scope cho phép deploy và Service Account User (`iam.serviceAccounts.actAs`) trên đúng runtime SA. Kết nối GitHub/trigger cần quyền quản trị nguồn riêng. Người cấu hình public/IAM cần quyền setIamPolicy tương ứng, không trao cho runtime chỉ để chạy web. Đối chiếu quyền cụ thể với UI/organization policy và [hướng dẫn continuous deployment](https://docs.cloud.google.com/run/docs/continuous-deployment).
5. Secret Manager API chỉ cần nếu bổ sung tính năng dùng secret; Firestore/Tasks APIs và IAM chỉ khi migration Push được duyệt. Không sao chép mặc định project/queue/keys cũ sang web.

### Biến môi trường

| Tên | Phạm vi | Bắt buộc/mặc định | Ví dụ/mục đích |
| --- | --- | --- | --- |
| `PORT` | Runtime kỹ thuật | Cloud Run tự cấp, local 8080 | Cổng ingress; chọn Container port trong UI, không cần tự thêm biến reserved |
| `NODE_ENV` | Runtime | Image đặt production | Web production; không đổi sang development |
| `BUILD_ID` | Build, public | Tùy chọn, timestamp build nếu trống | Commit SHA hoặc release ID; không secret |
| `BUILD_PUBLISHED_AT` | Build, public | Tùy chọn, ISO tại build | `2026-09-09T00:00:00.000Z` |
| `__WEB_PRODUCTION__` | Compile-time public, không phải env runtime | Config web luôn true | Push server bị tắt; legacy không định nghĩa nên giữ behavior cũ |
| `GEMINI_API_KEY` | Private runtime, chỉ tính năng tương lai | Web hiện không cần | Chưa thêm adapter/call; không đưa vào VITE_* hoặc build args |
| `APP_URL`, `PUSH_TASK_TARGET_URL` | Legacy private runtime config (URL không phải secret) | Không đặt trên web | Target/audience Push cũ; không phải public origin |
| `GOOGLE_CLOUD_PROJECT`, `GCP_PROJECT_ID`, `CLOUD_TASKS_SERVICE_ACCOUNT_EMAIL`, `TASK_INVOKER_SERVICE_ACCOUNT` | Legacy runtime | Không cần trên web | Giữ config cũ; không xác nhận identity thực tế |
| `WEB_PUSH_VAPID_PUBLIC_KEY`, `WEB_PUSH_VAPID_PRIVATE_KEY`, `WEB_PUSH_VAPID_SUBJECT` | Legacy runtime; private key là secret | Không cần trên web | Không đổi key/subject hiện tại |
| `CLOUD_TASKS_LOCATION`, `CLOUD_TASKS_QUEUE` | Legacy example | Không cần trên web | HEAD config đang cố định region/queue; sửa example env không tự thay config |
| `ALLOW_DEV_UNAUTH_TASKS`, `ALLOW_IN_MEMORY_PUSH_FALLBACK` | Legacy dev | Không bật production | Không dùng memory store làm DB |

`.env.example` có phần legacy được giữ rõ nhãn, không phải bộ env để paste nguyên vào service mới. Không có public runtime-config endpoint vì hiện không cần. Public host lấy same-origin, không cần PUBLIC_URL. Cần endpoint/flag khác thì review riêng thay vì tái sử dụng APP_URL.

### Secret Manager khi có tính năng cần secret

Với sự đồng ý riêng, tạo/chọn secret trong đúng project; ở Cloud Run → Edit & deploy new revision → Variables & Secrets → Reference a secret, chọn secret và **version số cụ thể**, ví dụ `1`, không mặc định latest. Chỉ cấp `roles/secretmanager.secretAccessor` trên từng secret cho runtime SA cần nó. Không cấp cho frontend/build SA nếu không cần; không lưu giá trị vào Git, Docker layer, screenshot hay log. Xem [hướng dẫn chính thức](https://docs.cloud.google.com/run/docs/configuring/services/secrets). AI tương lai phải qua adapter server có validation/body limit/auth/ownership/quota và error redaction; chưa kích hoạt API trả phí. Subscription ChatGPT/Gemini không phải bằng chứng có API quota miễn phí.

## 4. Tiếp tục màn hình Cloud Build khi đã duyệt source

**Chưa bấm Save/Create trước review và merge có kiểm soát.** Trigger main đang tồn tại (nếu có) có thể deploy ngay khi merge; không tự đổi regex hoặc tạo pipeline thứ hai. Không thêm cloudbuild.yaml trong đợt này.

1. Cloud Run → Create service → Continuously deploy from a repository → Set up with Cloud Build.
2. Chọn **2shousefly-creator/QL2**, branch **`^main$`**, Build Type **Dockerfile**, Source location **`/Dockerfile`**, context root QL2. Source phải có các thay đổi đã duyệt trên main trước khi thực hiện.
3. Các giá trị ban đầu để duyệt, chưa áp dụng: service quan-lo-web; Singapore asia-southeast1; public web; request-based billing; autoscale min **0**, max **2**; ingress **All** để kiểm tra run.app; container port **8080**, CPU **1**, RAM **1 GiB**; runtime SA riêng.
4. Không cần secret cho web này. Không thêm project/Push env cũ; giữ CMD của image, không override bằng `dev`/legacy `start`.
5. Kiểm tra region/build identity/source connection, ngân sách, tác động trigger rồi mới Save/Create. Đây là bước người dùng thực hiện sau duyệt, không được thực hiện bởi nhiệm vụ chuẩn bị.

### Xác minh sau deployment được duyệt

Copy URL **thực tế** do Cloud Run trả về; không suy ra URL từ tên service. Mở `/api/health`: status ok, app quan-lo-web, version khớp `/version.json`. Health không chứng minh backend Push/AI kết nối. Mở game, refresh một đường dẫn SPA; kiểm tra DevTools assets/worker/font, không có request tới Push cũ. UI phải báo Push máy chủ chưa bật, local notification vẫn có thể dùng. Dùng save tổng hợp để thử export/import và mandatory update trên staging; không tải save thật vào logs/API.

Chỉ dùng một build nhận 100% traffic khi kiểm tra update. Không coi chơi trên run.app là đã chuyển save sang dungha.xyz: hai origin độc lập; run.app dành thử nghiệm trước domain.

## 5. Logs, lỗi và rollback

Cloud Build → History → build details xem install/build stages; Cloud Run → service → Revisions/Logs xem revision và startup. Không đưa secret/env dump hoặc save vào log để debug.

| Dấu hiệu | Kiểm tra |
| --- | --- |
| Frozen install thất bại | Lock/package lệch hoặc registry/network; không chuyển sang install không khóa để che lỗi |
| Container không listen | CMD phải là `node dist-web/server.mjs`; port UI 8080, PORT hợp lệ, bind 0.0.0.0; xem generic startup log |
| Missing module | Không chạy dist/server.cjs legacy; web bundle Node built-ins. Linux image/build còn phải verify |
| Startup thiếu manifest | Docker COPY/output root và build:web; không chạy file server.ts dev |
| Sprite/audio/worker 404 | Kiểm tra public assets và hash references; test verifier so byte public assets; file thiếu không trả index.html |
| API 404 | `/api/push/*` và `/internal/*` trên web trả 404 là có chủ đích, không sửa thành SPA/proxy |
| Secret/permission lỗi | Web không cần secret/GCP API; nếu có lỗi loại này, kiểm tra có chạy nhầm legacy image hoặc thêm tính năng chưa duyệt |
| Update liên tục | BuildId/bundle/manifest phải đồng bộ; no-store HTML/version; kiểm tra SW, CDN và traffic nhiều revision; không clear localStorage/IndexedDB |
| Cold start/chậm | Đo trên staging; chưa tăng min instance để che lỗi. Bundle chính ~5.74 MB uncompressed được ghi nhận, chưa đổi gameplay/bundling lớn |

Rollback: Cloud Run → Revisions → Manage traffic → chuyển 100% về revision tốt đã ghi nhận; không xóa service/revision cũ. Giữ bộ manifest + assets cùng image. Nếu có Firebase pinTag, rollback Hosting version tương ứng (traffic Cloud Run riêng không thay pinned route). Không rebuild một version cũ với buildId mới rồi gọi đó là cùng release. Save chỉ rollback bằng file người chơi chủ động chọn, không rollback database/cloud task trong đợt web.

## 6. Domain ở giai đoạn riêng

Ưu tiên xem xét Firebase Hosting làm HTTPS/domain proxy tới Cloud Run, không viết lại game. [Tài liệu Firebase](https://firebase.google.com/docs/hosting/cloud-run) xác nhận rewrite hỗ trợ asia-southeast1; pinTag gắn revision với Hosting release, timeout proxy 60 giây. Ví dụ **chỉ tham khảo**, chưa tạo firebase.json/Hosting:

```json
{"hosting":{"public":"hosting-public","rewrites":[{"source":"**","run":{"serviceId":"quan-lo-web","region":"asia-southeast1","pinTag":true}}]}}
```

Thư mục Hosting public nên rỗng ở phương án proxy toàn bộ; file static Hosting tồn tại có ưu tiên hơn rewrite và có thể che index/version mới. Nếu sau này chia static/CDN, phải phát hành HTML/assets/manifest đồng bộ và giữ cache headers. Firebase/Cloud Run cùng đúng project, bật Firebase/Blaze và quyền Hosting nếu được duyệt; Hosting thêm quota/chi phí storage và transfer, Cloud Run/build vẫn tính riêng. pinTag tiêu thụ tag quota; ghi nhận revision/version và kiểm tra rollback thực tế.

Cloud Run [domain mapping trực tiếp](https://docs.cloud.google.com/run/docs/mapping-custom-domains) hiện là Preview/limited availability và không được Google khuyến nghị cho production; Google còn có phương án external Application Load Balancer. Không tự tạo phương án nào trong lần này.

Sau khi source/save flow đã duyệt và staging ổn: Firebase Console → Hosting → Add custom domain → dungha.xyz; kiểm tra nameserver authoritative đang ở Matbao hay nơi khác trước khi chỉnh DNS. Chỉ dùng TXT/A/AAAA/CNAME **Google thực sự cung cấp**, không đoán IP/records. Không thay NS/MX/SPF/DKIM/DMARC hoặc email records. Làm theo [hướng dẫn domain Firebase](https://firebase.google.com/docs/hosting/custom-domain), chờ ownership verification, DNS propagation và chứng chỉ HTTPS Active. Chọn apex dungha.xyz canonical; nếu dùng www, đăng ký/verify cả hai rồi cấu hình redirect www → apex ở lớp Hosting. Không redirect origin cũ của người chơi trước khi họ sao lưu/nhập và đồng ý cutover. Kiểm tra deep link, HTTPS, SW scope và cache sau proxy.

## 7. Ngân sách và phát hành

Trước deploy, người dùng kiểm tra billing và tự thiết lập budget alerts phù hợp trong Billing → Budgets & alerts, chọn project và người nhận. [Budget alerts không phải hard cap](https://docs.cloud.google.com/billing/docs/how-to/budgets); max instances cũng không giới hạn chi phí tuyệt đối. Theo dõi Cloud Run requests/CPU/RAM, Cloud Build phút build, Artifact Registry storage, logs, outbound/CDN/Hosting transfer, Secret Manager và khi có migration: Firestore, Cloud Tasks, AI API. Free tier không đồng nghĩa tất cả dịch vụ miễn phí; chưa ước lượng số tiền khi chưa có traffic và giá/quota tài khoản.

Thứ tự release: review source + kiểm tra Docker Linux → backup save ở origin cũ → staging/new web service → kiểm tra tính năng/mandatory update bằng dữ liệu tổng hợp → triển khai exporter ở origin cũ có kiểm soát → người chơi xuất và xác minh file → chuẩn bị domain HTTPS → nhập dữ liệu ở origin đích ổn định → đối chiếu tiến trình → theo dõi/rollback. Không tắt origin cũ, tự chuyển Push hoặc xóa dữ liệu.

**Lưu ý GitHub:** `phase6-pr-patch.yml` và `phase6-complete-pr.yml` chạy trên PR vào main, checkout cố định branch `codex/chien-tuyen-phase-6` và có contents:write. Đợt này giữ nguyên workflow, không mở PR để tránh khởi chạy patch không liên quan. Các workflow validation cũng chạy gameplay test khi mở PR; nhiệm vụ này không chạy bộ đó. Kiểm tra riêng automation/sync đang hoạt động trước PR/merge; sau khi cutover được duyệt mới lập lịch ngừng AI Studio sync, chưa sửa integration/settings hiện tại.

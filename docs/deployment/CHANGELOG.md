# Thay đổi chuẩn bị Cloud Run — 09/09/2026

## Phạm vi

Repo QL2, base `d921682d88378fe4b64aaba9814ec849bab28e38`, branch `codex/cloud-run-production`. Source được fetch mới nhất trước sửa. Repo QuanLo1 cha không bị chỉnh sửa; không tạo repo khác. Thay đổi này chuẩn bị review, chưa deploy hoặc chuyển dữ liệu.

| File | Vai trò |
| --- | --- |
| `Dockerfile`, `.dockerignore` | Multi-stage root-context, Bun frozen lock + Node 24, non-root runtime chỉ chứa web bundle/assets; loại credentials/local artifacts |
| `server.web.ts` | Static/SPA/health, PORT/0.0.0.0, cache/MIME/range/ETag, API/internal JSON 404, SIGTERM; không npm runtime/Push SDK |
| `vite.web.config.ts` | Build riêng, manifest đồng bộ bundle, không nạp env/legacy dev config |
| `package.json`, `.gitignore`, `.env.example` | Scripts web/verification, ignore output/tools, phân biệt env web và legacy; không đổi dependency/lock |
| `src/game/webDeployment.ts`, `src/game/pushManager.ts` | Web build chặn mạng Push, legacy giữ endpoint và hoạt động; có thông báo trạng thái |
| `src/storage/saveTransfer.ts`, `src/storage/LocalGameRepository.ts` | Xuất save thật + side saves; validate/migrate, archive nguyên văn input/đích, rollback, đợi IndexedDB commit, chặn autosave cũ khi import |
| `src/features/profile/ProfileScreen.tsx` | Tải file backup, chọn file/paste JSON, confirm ghi đè, báo lỗi và trạng thái Push; không đổi UI game ngoài các điểm cần thiết |
| `scripts/verify-web.mjs` | HTTP local, metadata, route, cache/range, assets, cách ly Push và invalid PORT |
| `scripts/verify-save-transfer.ts` | Kiểm chứng save tổng hợp, JSON/schema, absence/quota/rollback/archive/autosave |
| `scripts/verify-save-browser.mjs` | Kiểm chứng tùy chọn với browser/Playwright có sẵn, IndexedDB thật + file UI; profile tạm, chặn external requests |
| `docs/deployment/{README,save-migration,push-migration,CHANGELOG}.md` | Audit và hướng dẫn tiếng Việt, IAM/secrets/budget/domain/release/rollback |

## Kiểm chứng đã thực hiện

- Bun **1.3.3** `install --frozen-lockfile`: thành công, 292 packages; lockfile không đổi. Ban đầu sandbox chặn network; chạy lại sau cấp quyền mới hoàn tất. Cảnh báo Vite khai báo trùng là có sẵn.
- Node **24.19.0**, Vite **6.4.3**, esbuild **0.25.12**: `bun run build:web` thành công, 2366 modules; server ESM ~5.8 KB. Ban đầu sandbox chặn esbuild đọc đường dẫn; chạy lại ngoài sandbox thành công.
- `node node_modules/typescript/bin/tsc --noEmit`: thành công.
- `node scripts/verify-web.mjs`: thành công; health/version/bundle nhất quán, SPA refresh, API/internal không mở, hidden/file 404, HEAD/range/ETag/cache, đối chiếu byte **toàn bộ public assets** (version manifest được tạo mới), PORT sai bị từ chối.
- `node node_modules/tsx/dist/cli.mjs scripts/verify-save-transfer.ts`: thành công với storage giả; vắng save/backup-only không xuất state trắng, raw unknown fields giữ ở export, input cũ hỗ trợ, lỗi schema/JSON/pending update/quota, rollback/archives/autosave guard.
- Edge headless + Playwright có sẵn, dữ liệu tổng hợp: thành công với **IndexedDB thật**, backup đích, ghi save mới, autosave guard; UI **download JSON → chọn file → confirm → reload** giữ tên người chơi nhập. Profile tạm và chặn mọi request ngoài localhost; không gọi Push cũ. Script ban đầu có lỗi đường dẫn module/selector kiểm tra, đã sửa trước lần chạy thành công; không sửa gameplay để làm test qua.
- `git diff --check`: qua. So diff xác nhận `server.ts`, `src/server/*`, `bun.lock`, migrations, App bootstrap, public SW, vite legacy không đổi.
- Quét tên file credentials và mẫu private-key/Gemini-key/GitHub-token trong tracked text source: chưa tìm thấy mẫu khớp; chỉ `.env.example` rỗng secret. Đây không phải chứng nhận không có mọi dạng secret, không in giá trị nhạy cảm.

## Giới hạn và việc chưa thực hiện

- **Chưa build/run Docker Linux**: máy không có Docker CLI/engine. Không tuyên bố Cloud Build/image đã pass. Cần `docker build` và chạy image, kiểm tra non-root/SIGTERM/khởi động trên Linux trước chấp nhận deploy.
- Bundle chính ~5.74 MB uncompressed, ~1.28 MB gzip theo build output; Vite cảnh báo chunk >500 KB. Chưa code-split/tối ưu gameplay; server không tự nén response, cần đo transfer ở hạ tầng/CDN khi staging.
- Không chạy QA gameplay, benchmark, simulation hoặc test suite minigame. Không kiểm tra Push delivery/AI API/quota thật.
- Chưa chạy mandatory update giữa hai revision/container, proxy Firebase/DNS/HTTPS thực tế, lỗi quota thật, nhiều tab ghi cạnh tranh hoặc nhiều browser khác. Người chơi phải đóng các tab khác và giữ file backup độc lập.
- Chưa dùng Cloud Run/Build/Artifact Registry/Secret Manager/Firestore/Tasks APIs để sửa hạ tầng; chưa DNS, billing, IAM, secret, subscription, save production, task target hay data migration.
- Giữ nguyên backend Push, keys/defaults legacy, schema/catalog/XP/energy/gameplay/assets, main, workflows và AI Studio sync. Không tạo cloudbuild.yaml/trigger/pipeline thứ hai.
- Không mở PR tự động: hai workflow PR vào main có contents:write và checkout branch cố định `codex/chien-tuyen-phase-6`, có thể tác động ngoài phạm vi. Branch riêng được bàn giao để review; kiểm tra workflow trước mở PR/merge. Không merge hoặc force-push.

## Trước khi người dùng bấm Save/Create

Review source, kiểm chứng Docker, quyết định exporter ở origin cũ và phương án rollback save; kiểm tra billing/API/build/runtime SA trong quanloweb. Web này không cần AI/Push secrets; các tính năng đó chờ migration riêng. Giữ UI branch `^main$`, Dockerfile, `/Dockerfile`; chỉ tiếp tục khi main đã chứa source được duyệt và đã hiểu merge có thể kích hoạt deploy. Tài liệu domain đã đối chiếu Google/Firebase ngày 09/09/2026; cần kiểm tra lại trước thao tác thật.

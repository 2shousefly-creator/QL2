# Kế hoạch chuyển Push riêng — chưa thực hiện

## Ranh giới hiện tại

Giữ nguyên `server.ts` và `src/server/*`, hợp đồng legacy, queue `xp-full-push`, Firestore `pushDevices`, project tham chiếu `gen-lang-client-0052121673`, backend tham chiếu `quan-lo-push-api-953163983006.asia-southeast1.run.app`, VAPID/identity/lease/generation/checkpoint. Không xác minh hay truy cập các tài nguyên đó. Không đổi task URL/audience, không hủy lịch đang tồn tại.

`quan-lo-web` chỉ là static web + health, không expose `/api/push/*` hay `/internal/*`, không import Google SDK. `build:web` luôn chặn request Push ở client; giao diện giải thích máy chủ chưa bật, thông báo local giữ nguyên. Dev/legacy build vẫn sử dụng endpoint cũ và behavior cũ. Không có runtime env bật lại Push trên web mới. CORS legacy chưa thêm dungha.xyz vì đó là thay đổi backend production riêng.

## Rủi ro cần xử lý trước migration

| Source/endpoint | Rủi ro quan sát từ code, chưa kiểm chứng production | Điều kiện trước đưa sang đường mới |
| --- | --- | --- |
| register | Subscription validation sơ bộ; devicePushId chưa chứng minh ownership | Auth/session hoặc device credential kiểm chứng quyền sở hữu, giới hạn body và quota |
| schedule/cancel | Caller dựa device ID, tạo/xóa task/ghi Firestore | Ownership, validation generation/epoch/rank, rate limit bền, chống replay và abuse/cost |
| test | Endpoint public gửi Push thật | Disable public test hoặc auth/authorization/limit chặt |
| status | Public query diagnostics bằng device ID | Không lộ subscription/diagnostics, auth ownership, không log query nhạy cảm |
| CORS | Allowlist không chặn client ngoài browser và không thay auth | Origin chính xác, giữ origin cũ, không wildcard credentials |
| lỗi/log | Legacy có `err.message` responses và logs error/device/generation | Error redaction, log metadata tối thiểu, không in key/subscription/save |
| OIDC task | Guard audience + allowed SA, có dev bypass ngoài production | Pin target/audience/issuer/invoker, kiểm thử token âm/dương trên môi trường riêng |
| memory fallback | Firestore fallback phụ thuộc env | Không bật ALLOW_IN_MEMORY_PUSH_FALLBACK hoặc ALLOW_DEV_UNAUTH_TASKS production |

CORS cũ cho quanlo.ai.studio, hai preview run.app và localhost. Không xóa origins cũ còn người chơi. Nếu cho frontend mới dùng backend cũ sau này, chỉ thêm origin run.app thực tế cần dùng và https://dungha.xyz sau khi auth/ownership và quyền thay production được duyệt. Không thêm mọi *.run.app/*.ai.studio. Allow public access Cloud Run không bỏ được authorization app.

## Phương án được duyệt riêng sau này

1. Người vận hành xác minh actual old/new project, Firestore/database/region, queue, SA runtime/task invoker, VAPID fingerprint/version, origin active, task retention/checkpoint và quota. Chỉ lấy metadata cần thiết, không export subscription/private key ra tài liệu.
2. Quyết định **giữ backend cũ với origin mới** hay **backend Push mới**. Web hiện không cần truy cập GCP; không gán IAM Push cho web để làm đường tắt. Thiết kế backend mới với auth/ownership/validation/body limit/rate limit trước bật public routes. Web chỉ thêm endpoint config sau review; không proxy nội bộ qua website.
3. Giữ VAPID key nếu muốn compatibility và có quyền dùng; không rotate key ngầm. Secret private key được pin **version thực tế đã xác minh** (source example nhắc version 1, không có bằng chứng đây là version live). Với key mới, cần người dùng resubscribe có chủ động; bảo quản key cũ cho subscription cũ.
4. Dù giữ VAPID, subscription/SW permission gắn origin: new domain yêu cầu permission và subscription mới, new device identity; không copy device ID gây đè document/lịch cũ. Save import không mang Push keys. Thiết kế liên kết identity/migration marker sau auth nếu cần, không suy đoán hai browser subscriptions là một người.
5. SW scope `/`, click URL phải về domain canonical và kiểm tra tab đang focus; payload URL hiện mặc định `/`. Giữ SW trên origin cũ để lịch cũ còn giao được. Test background, foreground, denied permission, unsubscribe/expired 410 và nhiều thiết bị trên staging.
6. Tách `PUBLIC_WEB_ORIGIN`, `PUSH_API_BASE_URL`, task target và OIDC audience trong thiết kế tương lai. Contract legacy `APP_URL` hiện dùng cho cả target/audience và ưu tiên hơn `PUSH_TASK_TARGET_URL`; giữ nguyên khi chưa chuyển. New audience phải khớp verifier, không tự đặt dungha.xyz làm audience của task cũ.
7. IAM least privilege: runtime Push dùng ADC/service identity, quyền datastore vừa đủ, Tasks enqueuer theo queue; task invoker run.invoker trên worker cụ thể; quyền actAs đúng task SA và Cloud Tasks service-agent token minting được xác minh theo cơ chế GCP thật. Không Owner/Editor, không JSON key. Xem [Cloud Tasks HTTP authentication](https://docs.cloud.google.com/tasks/docs/creating-http-target-tasks) trước thiết lập.
8. Ghi sổ checkpoint/final task đang tồn tại, generation, lease đang gửi, trạng thái sent/canceled và target revision. Tách namespace/new queue/DB nếu được duyệt; không trộn old/new worker xử lý cùng lịch. Giữ idempotency, 25-day checkpoint logic và chống duplicate theo generation/lease. Chỉ dừng/hủy old task cho device đã migration thành công với đồng ý riêng; không bulk delete.
9. Canary new subscription trên backend riêng, kiểm tra thời điểm/throttle/cancel/retry/OIDC/CORS và chi phí. Chỉ chuyển từng cohort sau xác nhận, theo dõi duplicate/missed notification, permission errors, invalid subscriptions.

## Rollback

Giữ old worker/queue/VAPID/SA/SW trong khoảng bảo lưu đã thống nhất, không xóa service/revision/subscription. Nếu new flow lỗi, tắt đăng ký/schedule **mới** qua rollout được duyệt, giữ lịch đã tạo được ghi sổ để tránh gửi trùng; chuyển traffic backend mới về revision tốt nếu phù hợp. Không tự retarget lịch còn tồn tại hoặc đồng thời bật old/new schedule cho cùng người. Revert web config không tự khôi phục permission/subscription giữa origin; cần đăng ký có chủ động ở origin phù hợp.

Không bước nào trong kế hoạch này được thực hiện trên Google Cloud trong nhiệm vụ chuẩn bị web. Chi phí/IAM/secrets và cutover Push cần xác nhận riêng sau review triển khai cụ thể.

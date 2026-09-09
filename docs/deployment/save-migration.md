# Bảo toàn save khi chuyển origin

Chưa di chuyển save thật. SchemaVersion **11**, catalogVersion **17**, storage keys/migrations/XP được giữ. localStorage, IndexedDB, Cache Storage, SW và Push subscription ràng buộc theo origin (scheme + host + port). `quanlo.ai.studio`, URL preview/run.app, `dungha.xyz`, `www.dungha.xyz` là các kho độc lập. Web mới không đọc được dữ liệu origin cũ và không có tài khoản/cloud save.

## Dữ liệu nào nằm trong file

Luồng Profile/Hồ sơ → Xuất Dữ Liệu hiện tải file JSON xuống máy thay cho chỉ clipboard. Nó đọc save **hiện tại** từ `quan_lo_game_state_v1`, fallback IndexedDB `quan_lo_db/game_state/current` khi thiếu primary. Không gọi `load()` (vốn sanitize và ghi lại), không xuất state khởi tạo nếu trống, không coi backup là save hiện tại. Nếu chỉ còn backup, phải phục hồi và kiểm tra trước khi xuất. Primary bị lỗi thì báo lỗi, không tự chọn save khác để che lỗi.

Envelope `quan-lo-save-transfer`, formatVersion 1 giữ gameState nguyên văn theo JSON (bao gồm trường chưa nhận diện), exportedAt/source và raw extraSaves của `quan_lo_air_combat_v1`, `quan_lo_tank_battle_v1`, `quan_lo_chien_tuyen_v1` nếu tồn tại. Farm, Chiến Tuyến V2, Mobi Army và các trường GameState đi theo save chính. Chiến Tuyến V1 chỉ bảo quản raw theo logic hiện có, không tự chuyển bộ bài cũ thành V2.

Không export identity/subscription Push, installed-build/update markers, caches, trạng thái tạm và lịch sử thông báo local. Backup update/save mirror không phải file lịch sử tự động. Avatar có thể nằm trong save; giữ file riêng tư, không dán vào chat/log/server.

## Quy trình người chơi

1. **Chưa chuyển domain cho tới khi bản exporter này được phát hành có kiểm soát ở origin cũ.** Trên bản cũ chưa cập nhật, nút Xuất chỉ có GameState và không có các minigame riêng; không gọi đó là backup đầy đủ. Giữ origin cũ hoạt động cho đến khi có exporter và người chơi kiểm tra đủ dữ liệu.
2. Mở đúng origin/trình duyệt/profile cũ, kiểm tra tên, quân hàm, XP, năng lượng, vàng/nông trại, lịch sử và minigame. Đóng tab/PWA game khác trên cùng origin, tránh hai tiến trình ghi đè nhau. Kết thúc hoạt động đang mở trước khi sao lưu.
3. Hồ sơ → Xuất Dữ Liệu. Kiểm tra file `quan-lo-save-<timestamp>.json` thực sự tải xong, dung lượng khác 0. Giữ ít nhất một bản gốc an toàn. Không dùng chế độ riêng tư cho phiên chính.
4. Khi domain HTTPS dungha.xyz đã được duyệt/sẵn sàng, mở domain đó. Nếu đã chơi ở domain mới, **xuất save đích trước**. run.app staging cũng là origin khác, không tự mang tiến trình qua domain.
5. Hồ sơ → Nhập Dữ Liệu → chọn file `.json` hoặc dán JSON cũ. Giới hạn 20 MiB. App đọc file tại máy, kiểm tra JSON, identity/progression/time và version hỗ trợ; bản schema/catalog tương lai bị từ chối. Pending update recovery phải hoàn tất trước import.
6. Nhấn Xác Nhận Nhập, đọc cảnh báo ghi đè. Chỉ sau xác nhận mới tạo archive độc lập của toàn bộ input và snapshot đích (primary/mirror/manual/emergency/minigames/IndexedDB), rồi chạy migration hiện có và ghi. File cũ dạng GameState vẫn nhập được; kho minigame không có trong file **giữ nguyên ở đích**, không bị xóa. Mọi trường không được sanitizer hỗ trợ được giữ trong input gốc/ archive và đã cảnh báo, không hứa được gameplay sử dụng.
7. Sau thành công trang reload. Kiểm tra tên/ID, rank/XP, energy, farm, tiền, minigame và bản ghi trước khi ngừng chơi ở origin cũ. Offline XP vẫn do settlement hiện có xử lý, nên số liệu có thể tăng theo thời gian. Không tiếp tục chơi song song rồi mong tự merge tiến trình.
8. Xuất thêm file ở domain mới sau khi kiểm tra. Origin cũ và các file backup tiếp tục giữ cho rollback. Đăng ký Push ở origin mới là migration riêng; không copy devicePushId/subscription.

## Import lỗi và rollback

JSON/version/minigame lạ bị từ chối trước khi ghi. Nếu không thể tạo archive do quota/storage bị chặn thì dừng, không thay save. Import đợi transaction IndexedDB complete, có backup/rollback khi ghi lỗi; trước khi snapshot IndexedDB phải đọc thành công nếu trình duyệt hỗ trợ. Khi import thành công, autosave/beforeunload của state cũ bị chặn cho đến reload để không đè save nhập. Guard chỉ thuộc trang hiện tại, **không thay thế việc đóng các tab khác**.

Archive key `quan_lo_import_archive_<uuid>` chứa `before` (raw localStorage values), `indexedDB` (raw save), `incoming` (nguyên văn file), `createdAt`. Không xóa/ghi đè archive cũ. Để phục hồi thông thường, nhập **file export đích đã tải trước bước 5**. Nếu cần chuyên viên phục hồi archive: chỉ đọc trong DevTools tại đúng origin, lấy `before.quan_lo_game_state_v1` hoặc `indexedDB` làm gameState, kèm ba extraSaves tương ứng để tạo envelope v1 và nhập qua UI; giữ nguyên archive gốc. Nếu primary archive bị hỏng, đối chiếu mirror/manual backup, không tự chọn ghi đè.

Nếu rollback nội bộ cũng thất bại, UI yêu cầu dừng chơi, giữ file/archive và phục hồi; không xóa website data, không reset game để sửa. Archive lưu trên máy vẫn phụ thuộc quota/browser retention, nên không thay thế file tải xuống. Không tự dọn archive trong đợt này.

**Tương thích rollback phiên bản cũ:** importer cũ không hiểu envelope mới, có thể sanitize thành state trắng nếu dán cả envelope. Chỉ dùng UI mới để nhập envelope. Nếu buộc quay về app cũ, người hỗ trợ trích `gameState` từ file và kiểm tra schema/catalog tương thích trước; extraSaves cần hỗ trợ riêng. Không nhập save schema mới vào game cũ không hỗ trợ. Giữ origin cũ là đường rollback tốt nhất trước cutover, không chuyển state ngược tự động.

## Mandatory update và giới hạn kiểm chứng

Giữ nguyên `versionService`, `updateBackupService`, `MandatoryUpdateModal`, `appUpdateService` và bootstrap App; update backup/recovery trước XP settlement. SW/update hiện có dọn Cache Storage, không dọn localStorage/IndexedDB save; cache API/version network-only. Không đưa installed marker cũ vào file import; marker domain mới thuộc build mới. Web build không sửa public/version.json và mọi replica dùng cùng manifest.

Đã kiểm tra import/export bằng dữ liệu tổng hợp (vắng save, sai JSON/schema, quota, rollback, raw archive, chặn autosave); không dùng save người chơi. Đã chạy Edge headless với profile tạm: IndexedDB thật, archive đích, UI tải file/chọn file/xác nhận/reload; chặn mọi request ngoài loopback. Có script tùy chọn `scripts/verify-save-browser.mjs`, dùng Playwright đã cài sẵn và browser tương ứng. Còn cần quota lỗi thật và một chu kỳ mandatory update giữa hai image Linux trên staging trước cutover. Không chạy QA gameplay/benchmark trong nhiệm vụ này.

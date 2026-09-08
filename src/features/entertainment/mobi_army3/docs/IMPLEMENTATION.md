# Mobi Army 3 — bản PVE đầu tiên

Mở **Giải Trí → Mobi Army 3**, xoay điện thoại ngang, chọn nhiệm vụ/trang bị rồi vào trận. Tên hiển thị nằm tại `config.ts::ARMY_TITLE`.

## Kiến trúc và tích hợp

- Dùng Canvas 2D + TypeScript theo kiến trúc runtime/canvas của Không Kích và Bắn Xe Tăng hiện có; không thêm Phaser hay dependency runtime. Các game cũ không bị viết lại. Canvas phù hợp với số đơn vị nhỏ và mask CPU, giúp không thêm một engine nặng cho một module artillery.
- Hub tải `MobiArmy3Screen` bằng React.lazy, có Suspense/error boundary. Runtime, AI, renderer và ảnh chỉ tải khi mở game. Các định nghĩa nhỏ cần cho sanitize profile đi cùng đường đọc save; không kéo renderer/ảnh vào khởi động.
- `ExclusiveFullscreenOverlay` cung cấp portal, safe area, body scroll lock và khôi phục focus; callback game-active ẩn chrome QL2 như các game khác. Giữ nguyên `TANK_BATTLE_ENABLED = false`.
- React quản lý menu, trang bị, tải asset, kết quả. `ArmyRuntime` quản lý RAF và publish HUD tối đa 10 lần/giây. Domain dùng fixed timestep 1/60 giây, accumulator tối đa 0,12 giây; seed nằm trong ticket và RNG có state rõ ràng.
- `core/` chia ballistics, movement, turn, projectile, damage events, units và objectives. Không đưa canvas/DOM/audio/terrain mask vào GameState. `TerrainMask` nằm ngoài Battle save vì không hỗ trợ checkpoint giữa trận.
- 1 world unit là đơn vị logical, không phải CSS pixel. X sang phải, Y xuống, góc tính lên từ hướng nhìn. Viewport 1280×720; world 1920–2400 rộng, 900–960 cao. Canvas FIT bằng object-fit contain, camera pan/focus/zoom độc lập tọa độ domain.

## Các phần đã có trong code

1. Planning/charge/flight/resolve/finished; một phát chính đóng lượt, timeout bỏ lượt. Lệnh kiểm tra phase, grounded, quyền điều khiển, lượng đạo cụ và giới hạn lượt.
2. Giữ/thả lấy lực, A/D hoặc mũi tên di chuyển, W/S chỉnh góc, Space bắn, 1–3 dùng đạo cụ mang theo. Pointer capture, pointer cancel, blur, visibility, pause/resume, portrait gate; RAF/listener/audio/canvas được thu hồi khi thoát.
3. Đạn dùng vận tốc, gió, gravity và swept collision theo mask cell 2 world units. Có đạn chuẩn/nặng, nhiều viên, split ba viên, khoan, nảy, hẹn giờ và vùng cháy. Giới hạn projectile count/lifetime/split/bounce; direct + splash không cộng trùng một impact.
4. Terrain CPU Uint8Array (không khí/đất/đá), texture renderer đọc cùng mask, dirty rectangles, hố tròn, chống xóa đá. Probe chân, rơi có gravity và sát thương, loại khi rơi ra ngoài map. Hình nền không tham gia collision.
5. AI tìm 81 góc/lực thô rồi 25 candidate tinh, tối đa 3 candidate mỗi tick. Dùng chung `advanceProjectile`/stepTrajectory/sweep với đạn thật, gồm split, nảy, khoan và fuse. `TerrainPreview` ghi các cell bị xóa vào overlay riêng để dự báo không phá terrain thật. Chấm sát thương, kết liễu, phá nền và tự bắn/đồng đội; chọn target yếu/trạm, có di chuyển chiến thuật và sai số seed theo độ khó. Chưa dự báo đầy đủ vị trí đơn vị sau rơi/knockback, status và hazard nhiều vòng; không khẳng định AI tối ưu.
6. 4 archetype AI, 2 mini-boss, 2 Boss lớn có phase HP, weapon rotation theo phase, khiên theo chu kỳ, điểm yếu thân trên, vùng nguy hiểm báo trước, phá nền và tối đa 2 pháo phụ. Boss death/finish hủy pending hazards. Định nghĩa Boss chủ động tái sử dụng những cơ chế này; chưa có các encounter cinematic/di chuyển bộ phận riêng.
7. 3 class có HP/attack/defense/mobility/crater khác nhau, 6 vũ khí, 8 đạo cụ và 3 màu cosmetic. Nâng cấp cố định tối đa 3 cấp. Cường hóa/đa đạn/ổn định có scope phát kế tiếp. `statusEngine` có registry, source, duration theo lượt đơn vị, refresh/strongest stack, tick trước giảm duration, dispel và miễn stun cho Boss. Burn và barrier đã nối vào combat; slow/stun là khả năng framework chưa được cấp trong loadout. Khiên đạo cụ hết hạn sau 3 lượt của chủ thể, khiên Boss vẫn theo chu kỳ phase.
8. 2 chương, 15 màn trên 5 hình học bản đồ; mục tiêu hạ địch, Boss, phòng thủ, sống sót, phá công trình, giải cứu bằng tiếp cận trạm, nhiều wave và puzzle giới hạn vòng. Màn đầu hướng dẫn theo action đã thực hiện; có replay, mở khóa tuần tự, tiêu chí sao công khai.
9. Campaign/detail/loadout/inventory/shop/achievement/result/settings/help, thông báo lock và nhiệm vụ tiếp tục dựa trên hồ sơ. Thành tích nội bộ được suy ra từ stage records; không tạo reward hay huân chương QL2 giả.

## Save và phần thưởng

`GameState.mobiArmy3` là trường tùy chọn, profile schema v1; sanitizer trong đường migration hiện có, không đổi schema hoặc dữ liệu các tính năng khác. Save cũ không có trường này vẫn hợp lệ. Profile phiên bản tương lai được giữ nguyên và shell chặn sửa.

Tất cả sửa đổi dùng callback latest draft của App, lưu qua LocalGameRepository hiện có. Mỗi lần bắt đầu trận cấp ticket gồm player ID + sequence tăng đơn điệu, seed và snapshot loadout/level/upgrade. Mỗi loại đạo cụ đã chọn và còn trong kho được cấp một cái, trừ ở thời điểm xuất kích. Có thể bỏ hết đạo cụ, đạn thường không giới hạn. Khi tải lại, ticket vẫn đánh dấu trận dang dở và chỉ cho rút lui; không dựng lại trận rồi phát thưởng. Đạo cụ đã cấp không hoàn lại, kể cả chưa dùng.

Settlement chỉ chấp nhận runId/stageId trùng activeRun, ghi receipt, tiến trình và phần thưởng trên cùng draft, rồi xóa activeRun. Gọi trùng không có activeRun nên không cộng lại. Sequence vẫn được giữ khi migrate. Không lưu toàn bộ lịch sử runId vô hạn. Receipt thể hiện lượng XP/tiền thực được cộng sau cap; receipt trên màn hình không được dùng làm nguồn phát thưởng sau reload.

Mặc định: hoàn thành lần đầu 75 Quân Phiếu +100 XP Pháo Thủ; chơi lại 15 +25. Cấp riêng tối đa 15. Thắng trận thưởng chung tối đa 5 Vàng +1 XP, trần 25 Vàng/5 XP một ngày; `applyEarnedXpCapped` giữ giới hạn rank hiện có. Không cộng Giờ Chiến Thuật, không sửa bộ đếm earning/delegation. Ngày nhỏ hơn ngày budget đã ghi không mở lại hạn mức.

Đây là tính idempotent trên model/draft và cùng save JSON, không phải transaction server. LocalGameRepository đang có giới hạn báo lỗi lưu và đồng bộ nhiều tab của QL2; module không tuyên bố cloud sync, lưu bền tuyệt đối khi ổ đầy, hoặc chống chỉnh sửa local save. Không có thanh toán/PvP/multiplayer.

## Đồ họa và phần còn lại

Hai PNG được tạo mới bằng image_gen tích hợp; atlas có alpha thật, metadata frame và animation fallback. Danh mục nguồn/prompt và yêu cầu thay asset ở `public/assets/mobi_army3/ART_NOTES.md`.

World đã dùng raster qua pipeline, nhưng đây là **art khởi đầu**: 1 tranh nền, 1 texture đất, 1 hình pháo dùng chung; nhân vật có ít keyframe, enemies/Boss có pose đơn, VFX nổ dùng biến đổi cutout. Chưa có sheet animation đầy đủ, mỗi vũ khí một sprite, theme/parallax riêng từng map, nhạc hay SFX chuyên biệt. Chưa có guided steering, enemy healer, đạo cụ dispel, escort di chuyển, checkpoint giữa trận hoặc backend. Không dựng các tab/nút giả cho những phần này.

Phần tương ứng phase 0–6 đã có đường code tích hợp; các nhánh chuyên sâu AI/status/Boss và phase 7 về mỹ thuật/âm thanh chưa hoàn tất toàn bộ master scope. Chưa có bằng chứng runtime/device hay cân bằng; theo yêu cầu chỉ thực hiện kiểm tra TypeScript, build và rà soát tĩnh, không chạy test/QA/playtest/benchmark/mô phỏng.

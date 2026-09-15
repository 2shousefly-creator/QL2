# Không Kích — Hardcore Combat / Visual Overhaul

Baseline: `8b798dde212af9b4304f3a7157833652b6160f86` trên `origin/main`.

## Chiến đấu

- Threat Director: ngân sách đặc biệt W1–W5 là 1/2/3/4/5 điểm; đòn nhẹ 1, đòn diện rộng 2. Đạn cơ bản không tốn điểm.
- Scout: Needle Pair từ W3, Needle Burst ba viên cách 0,12s ở W5. Fighter: Scissor khóa điểm hội tụ. Attacker: Gate bảy hướng chừa một khe.
- Kamikaze: tối đa hai lần lao từ W4, khóa hướng từng lần; W5 bắn năm mảnh sau lần lao cuối. XP của máy bay thoát được chuyển vào phần thưởng còn lại của đợt.
- Bomber: thảm 2/3/5 điểm; Sniper: hai đường Rail khóa riêng; Jammer: EMP khóa kỹ năng 1s và hồi tài nguyên ×0,5 trong 2,5s, vẫn giữ khiên đồng minh.
- Crimson: 3 hit/4s (Elite1), 2 hit/3,5s (Elite2) kích hoạt cảnh báo Execution Dive, lao khóa mục tiêu, hồi 0,45s rồi quạt bảy viên. Elite2 giữ burst bốn viên, sau 0,5s quạt bảy viên.
- Iron Fortress: 4/3 cộng dồn Áp chế trong 4s kích hoạt Shock Clamp; cảnh báo 0,8s, choáng 1,25/1,75s. Phá khiên kích hoạt một lần Retaliation trong mỗi chu kỳ; vòng đạn chừa hai hướng.
- Acid: mỗi vùng có bộ đếm riêng. Vào vùng → 0,25s tick đầu → mỗi 1s tick sau; ra ngoài đặt lại bộ đếm. Chỉ sát thương thực nhận mới cộng Ăn mòn. Ba cộng dồn gây -35% Giáp, ngừng hồi HP theo thời gian, hồi tài nguyên ×0,5 trong 4s. Elite2 có Acid Cage và đợt tiếp sau cảnh báo.
- Radar: trúng Rail tạo Target Lock 4s; trúng tiếp đạn bám gây choáng 1,5s, khóa kỹ năng 2,2s, hồi tài nguyên ×0,4 trong 2,5s; ba tên lửa nối tiếp sau 0,6s.
- Lịch Elite giới hạn đòn đặc biệt đang bắt đầu; đòn đã kích hoạt vẫn có thể nối khống chế khi người chơi trúng tiếp.

## Trạng thái và Boss

- Trạng thái tập trung trong `airCombatStatus.ts`: choáng, khóa kỹ năng, nhiễu tài nguyên, vỡ giáp, ngừng tái tạo và dấu cộng dồn có cửa sổ thời gian.
- Choáng khóa di chuyển/bắn thường/kỹ năng; bộ đếm buff và HawkEye đang hoạt động tiếp tục chạy. Không thêm giới hạn choáng toàn cục hoặc miễn nhiễm sau choáng. Core 024/098 đi qua hàm kháng hiệu ứng hiện có.
- Leviathan: **125.000 HP, 120 Giáp**. Giữ Reactive Aegis, tắt dưới 15% HP; không thêm pha yếu điểm hay hệ số tăng sát thương nhận.
- Combo: Pincer → Sweep, Lane + Wing, EMP → Pincer → Fan, Sonic + Wing, Ram → Fan; P3 thêm Sonic → EMP và Lane → Double Ram. Lịch không chờ toàn bộ đạn địch biến mất; các vùng Sonic/Lane/Dash không tương thích được tuần tự hóa.
- Sonic: **42°/1 vòng, 30°/2, 22°/3, 18°/3**. Mỗi vòng lấy góc ngẫu nhiên liên tục riêng trong vùng phía dưới Boss; chỉ hiện khe của vòng đang cảnh báo. Tốc độ vòng 190/205/220/235.
- Lane Shift: P2 hai bước, hai làn an toàn; P3/enrage ba bước, một làn an toàn. Khóa từng bước, không xem trước bước sau.
- Pincer: 4/6/6 tên lửa, hai họ tốc độ/quay hữu hạn trái–phải. Fan quét ba/năm loạt nhỏ. P3 Double Ram khóa lại vị trí mới sau hồi 0,6s.
- EMP Prison: P2/P3/enrage bán kính 48/44/40; cảnh báo 0,85/0,70/0,60s, choáng 1,4/1,8/2s. Hai hit lớn trong 5s ở P3+ kích hoạt Hunted: trường EMP khóa vị trí, cảnh báo 0,75s trước trừng phạt.

## Cân bằng và kỹ năng

| Hạng mục | Giá trị |
| --- | --- |
| Viper tốc độ bắn Lv1 / tăng mỗi cấp / Lv30 | 4 / +0,05 / 5,45 |
| Điên Cuồng / có Core 023 | ×1,40 / ×1,75 |
| Nảy Điên Cuồng | 50%, rồi 25% |
| Phantom tốc độ bắn Lv1 / tăng mỗi cấp / Lv30 | 3,5 / +0,045 / 4,805 |
| Core 015 | +1 Tốc độ bắn |
| Core 023 | +35% Tốc độ bắn trong Điên Cuồng |
| Core 080 | 30% xác suất nảy, 40% sát thương |
| Core 092 | Hồi 1% HP tối đa/s sau 5s không nhận sát thương |
| Core 106 | 195% Hỏa lực/Tomahawk, tối đa 3 quả mỗi 1,5s |
| BigBang | Fuse 3s bắt đầu khi chuyển sang powered; va chạm nổ ngay |
| Mồi Bẫy | 0,45s bay cong; sau khi bung hút 1,5s hoặc 2,5s với Core 019 |

Flare: năm trái + năm phải hướng lên trước, ba đợt cách 0,75s; Core 019 thêm một đợt. Chỉ flare đã bung mới hút/hấp thụ đạn; giữ xác suất chú ý thông thường 68%. Phân thân Phantom giữ nhận diện riêng.

## Hình ảnh / UI

- `hardcore-ammo-atlas.svg` và `airCombatAmmo.ts`: bốn mẫu tên lửa độc lập cùng mười hai mẫu đạn; Pixi và Canvas dùng chung định nghĩa hình dáng. Viper/Tomahawk ×0,80, BigBang ×1,50 theo kích thước khung Pixi cũ; không đổi bán kính va chạm.
- Khói lấy mẫu theo khoảng cách, giữ vệt cong trong không gian thế giới. Màu/độ dày/ngọn lửa/impact riêng từng họ; BigBang có nổ phụ, sóng xung kích và khói dày.
- Laser Phantom: vòng hội tụ, hạt xoắn vào mũi, lóe trước bắn, quầng tím và lõi sáng, dòng năng lượng, bloom tại nòng/điểm trúng. Hình ảnh không mở rộng va chạm.
- Nổ chuyển lớp/frame, muzzle nhiều lớp, sét nhiều đoạn, hồi HP hút vào thân, shield ripple tại tiếp xúc. Giữ afterimage, khí xả, khói HP thấp và hỗ trợ giảm chuyển động.
- Địa hình: cuộn dưới pixel, mép chồng một pixel, cache ba đoạn; thêm nhà/kho/sân/hàng rào, bốn biến thể tán cây, bờ nước/gợn sáng, đường/cầu/trụ/bóng và đá núi. Giữ mây/parallax.
- HUD, XP, HP, thanh kỹ năng và thẻ Core dùng góc cắt; Boss có mốc 70/35/15% và lớp khiên. Giữ tooltip nhấn giữ, hồi chiêu, thời lượng, chi phí, thao tác và bố cục vùng HUD.
- Viết lại mô tả cả 106 Core trong catalog, giữ điều kiện/số liệu ngoài các thay đổi chỉ định. `CoreSemanticIcon.tsx` ánh xạ rõ từng ID theo hiệu ứng, Core kỹ năng dùng icon gốc + huy hiệu nâng cấp.
- Status strip hiển thị trạng thái mới, bộ đếm giây và cộng dồn. Canvas có cảnh báo EMP/Clamp, Acid, Sonic, Lane, flare và mẫu tên lửa tương ứng.

## Phạm vi và xác nhận

Không sửa test, save/schema, chế độ khác, mốc chọn Core, số lượng/cap/nhịp spawn đợt thường, ngân sách XP, Lv1–30 hay AI HawkEye. Không thêm Move Speed hoặc phụ thuộc dịch vụ.

Lệnh xác nhận duy nhất: `npm run build:web`. Không chạy QA, gameplay test, mô phỏng, browser test, lint, typecheck riêng hoặc benchmark. Build thành công không xác nhận độ khó, FPS hoặc trải nghiệm hình ảnh thực tế.

Kết quả build ngày 15/09/2026: thành công (exit 0); Vite 6.4.3 có cảnh báo chunk lớn. Build cuối sau thay đổi gameplay/UI hoàn thành trong 11,36s.

### Tệp thay đổi

- Runtime/cân bằng: `airCombatRuntime.ts`, `airCombatStatus.ts`, `airCombatBoss.ts`, `airCombatAircraft.ts`, `airCombatTypes.ts`, `airCombatConfig.ts`, `airCombatCoreEffects.ts`.
- Core/UI: `airCombatCoreCatalog.ts`, `CoreSemanticIcon.tsx`, `CombatUiIcon.tsx`, `AirCombatBattle.tsx`, `AirCombatStatusStrip.tsx`, `AirCombatOverlayFeedback.ts`, `airCombatPresentation.ts`, `combat-ui.css`.
- Hình ảnh: `airCombatAmmo.ts`, `airCombatTerrain.ts`, `AirCombatLegacyRenderer.ts`, `CanvasCombatAccents.ts`, `pixi/AirCombatPixiAssets.ts`, `pixi/AirCombatPixiRenderer.ts`, `pixi/AirCombatSky.ts`, `pixi/AirCombatVfx.ts`, `pixi/airCombatPixiTypes.ts`, `src/assets/khong-kich/v2/hardcore-ammo-atlas.svg`.
- Báo cáo: `HARDCORE_UPDATE.md`.

Release theo `AGENTS.md`: commit/push `main`, GitHub Actions tự triển khai Firebase Hosting; không deploy Firebase thủ công.

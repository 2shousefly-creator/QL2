# Không Kích: cập nhật sau playtest

Baseline: `758900f0bf0c0bd2b3824e2e7ddd2ae8455d254c`, đồng bộ từ `origin/main` khi bắt đầu.

## Thay đổi

### Oanh Tạc

`fireBasic` luôn gán `ammoVisualKey: BASIC_AMMO_KEYS[state.aircraftId]`.
Với Titan, cả đạn thường và quạt Oanh Tạc dùng cùng hình đạn vàng hiện hành.
Giữ `skillId: sweeping_cannon`, 5/7 tia, góc bắn, sát thương, luật sát thương cùng loạt,
bán kính va chạm 3,2, tốc độ, xuyên, thời gian, chi phí và hồi chiêu.
Không tạo bản sao hình đạn; giữ kích thước và hướng xoay theo vận tốc của hệ thống hiện tại.

### Boss

`BOSS_DAMAGE_MULTIPLIER = 1.10` trong `airCombatBoss.ts` được nhân đúng một lần
trong `hitPlayer`, theo `sourceEnemyType` (hoặc tra nguồn bằng `sourceEnemyId`),
trước giáp, vùng va chạm, giảm sát thương và khiên.
`BOSS_TUNING` và `ENEMY_CONFIGS` giữ nguyên số nền để tránh nhân chồng.

Các đường sát thương Boss lên Player đã đối chiếu bằng đọc mã nguồn:

| Đường sát thương | Nguồn đi vào `hitPlayer` |
| --- | --- |
| Đạn cơ bản, wing, fan, suppressive | Projectile giữ `sourceEnemyType: boss` |
| Tên lửa, crossfire/curtain, combo tiếp nối | Projectile giữ `sourceEnemyType: boss` |
| Va chạm thân | `ENEMY_CONFIGS.boss.collisionDamage`, metadata loại Boss |
| Dash/ram, kể cả va chạm quét | `dashDamage`, metadata loại Boss |
| Sonic và lane laser | Warning giữ metadata loại Boss |
| EMP | Warning mang 140 sát thương nền và metadata loại Boss |

Ví dụ sát thương thô: 180 → 198; 140 → 154; 575 → 632,5.
HP, giáp, tốc độ, nhịp đánh, cảnh báo, hình học và số lượng đòn Boss không đổi.

### Bão Sét Bạo Kích

Pixi dùng 8 đoạn gấp khúc với glow cyan rộng 6,5 và lõi trắng rộng 2,7 trên cùng đường.
Thời gian 0,23 giây; có chớp nhỏ tại nguồn, chớp và tia điện ở đích.
Reduced Motion dùng 5 đoạn, vẫn đủ hai lớp và chớp đích. Legacy dùng cùng hình học.
Hình học lấy từ ID sự kiện, không dùng RNG chiến đấu.
Tái sử dụng pool Pixi giới hạn 80 phần tử và Legacy giới hạn 40 hiệu ứng.
Giữ nguyên +15% chí mạng, tối đa 3 mục tiêu khác, 70% Firepower và ICD 0,5 giây mỗi mục tiêu.

### Hồi HP

Sự kiện `player_heal` mang lượng HP thực hồi và nguồn `core`, `skill`, hoặc `skill_core`.
`healPlayerWithFeedback` giữ nguyên xử lý overheal của `healAircraft`.
Callback của `tickAircraftState` báo riêng hồi dần Core 038 và hồi từ Core 005/011/017.

- `coreContext.heal`: Core 062, 064, 077, 092 và các hook hồi máu sử dụng helper này về sau.
- Đường trực tiếp: Core 090 và nhặt mảnh Core 108.
- Core 038: phản hồi hồi dần khi tàng hình.
- Core 005/011/017: chỉ phản hồi khi HP thực tăng.
- Hồi thụ động bẩm sinh đơn thuần không phát sự kiện; cả hai renderer đã bỏ polling `healingTotal`.
- Hồi thực bằng 0 hoặc overheal chỉ thành khiên không phát dấu cộng.
- Hồi liên tục giới hạn một xung mỗi 0,25 giây; hồi tức thời phản hồi ngay.

Mỗi xung tạo 3 dấu cộng xanh mint (Reduced Motion: 1), trôi lên và mờ trong 0,7 giây.
Kích thước 7–11, vị trí xác định từ ID sự kiện; không dùng chữ DOM hoặc RNG chiến đấu.

### Sửa chữa khẩn cấp

`castSkill` lưu `coreState.emergencyRepair` với `remaining = missingHpAtCast × 0.18`
và `durationRemaining` bằng thời gian Phản Ảnh thực tế.
Mỗi tick tiêu ngân sách theo phần thời gian đã trôi, kể cả phần tick cuối trước khi kết thúc kỹ năng.
Sát thương mới không tăng ngân sách; lượng hồi dự kiến vẫn bị trừ nếu HP đầy.
Kết thúc hoặc hủy Phản Ảnh xóa ngân sách. Đây là hồi trực tiếp, không phụ thuộc chặn hồi thụ động.
Các trường mới là tùy chọn trong trạng thái trận, không đổi schema lưu tiến trình.

Với 1.000 HP thiếu lúc bật: tổng dự kiến 180 HP, phân bổ 90 HP/s trong 2 giây
hoặc khoảng 51,4286 HP/s trong 3,5 giây khi có Core 037.

Mô tả mới: “Phản Ảnh: hồi dần 18% HP đã mất tại lúc kích hoạt trong suốt thời gian tàng hình.”

### Pin Xung Kích

- Giữ ID `core_086`; Gold → Diamond, một mục duy nhất trong catalog.
- Max Resource ×0,80 → ×0,65; Resource Regen giữ ×1,70.
- Mô tả: “-35% tài nguyên tối đa; +70% hồi tài nguyên.”
- Giữ clamp tài nguyên hiện hành khi nhận Core và mỗi tick; không bù tài nguyên hoặc sửa chi phí kỹ năng.
- Không sửa cơ chế chọn Core hay tỷ lệ Silver/Gold/Diamond 40%/40%/20%.

## Phạm vi tệp

Trong `src/features/entertainment/khong_kich/`:

- Gameplay: `airCombatRuntime.ts`, `airCombatAircraft.ts`, `airCombatTypes.ts`, `airCombatBoss.ts`, `airCombatCoreEffects.ts`, `airCombatCoreCatalog.ts`.
- Hình học dùng chung: `airCombatProcVisuals.ts`.
- Pixi: `pixi/AirCombatPixiRenderer.ts`, `pixi/AirCombatVfx.ts`, `pixi/AirCombatPixiAssets.ts`, `pixi/airCombatPixiTypes.ts`.
- Legacy: `CanvasCombatAccents.ts` (được `AirCombatLegacyRenderer` sử dụng).
- Asset: `src/assets/khong-kich/v2/healing-cross.svg`.
- Tài liệu: tệp này.

## Giới hạn xác nhận

Chỉ dùng `npm run build:web` để validation. Không chạy QA, test gameplay, mô phỏng,
kiểm tra trình duyệt, screenshot, lint, typecheck riêng hoặc script kiểm chứng.
Build thành công (exit 0); Vite hoàn thành trong 7,04 giây, có cảnh báo chunk lớn.
Các xác nhận logic ở trên dựa trên đọc mã nguồn; không phải kết quả playtest hay nghiệm thu hình ảnh.
Phát hành theo GitHub Actions khi push `main`; không deploy Firebase thủ công.

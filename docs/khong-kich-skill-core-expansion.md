# Không Kích: lựa chọn nâng cấp và 27 Skill Core

Phạm vi: nâng lửa động cơ, giao diện chọn Core, reroll từng slot, Core 122–148 và trạng thái chiến đấu. Các ID 001–121, hitbox, di chuyển và schema save được giữ nguyên.

- Catalog bổ sung ba Core cho từng kỹ năng. Milestone 9/18/27 chỉ rút ba lựa chọn trong sáu Core của đúng kỹ năng, vẫn tối đa một Skill Core mỗi kỹ năng.
- Reroll được quản lý bởi `CoreSelectionEvent` trong world: original/current IDs, slot đã dùng và context thường/kỹ năng/thay thế Core 097. Không có candidate thì không tiêu lượt; chọn xong hủy event.
- `airCombatSkillCores.ts` chứa tuning dùng chung cho runtime, mô tả và HUD. State theo cast/volley/salvo thuộc lượt chơi, không ghi vào save.
- Mana refund dùng số thực tế đã hồi và giới hạn 50% Max Mana hiện tại mỗi cast. Dash refund móc vào cơ chế kamikaze thực sự bị decoy chặn; không biến va chạm thân hay các dash vốn không tương tác với decoy thành thao tác hấp thụ.
- Missile salvo giữ riêng danh sách chờ phóng và tập missile còn sống; mọi đường recycle gỡ ID. Buff Data chỉ giải quyết sau khi cả hai rỗng.
- EMP, missile intercept, Hố Đen và Electronic Guard dùng chung predicate hostile ballistic. Hố Đen chụp trạng thái chuyển động/lifetime, điều khiển vị trí độc lập và khôi phục khi thả tại vị trí hiện tại, không tua lại damage/allegiance.
- Dư Chấn clamp theo hitbox và dịch các điểm dash đang cam kết để AI không nhảy về quỹ đạo cũ. Các mark có timer riêng theo enemy ID; hacked damage không nhận bonus Titan/Phantom trực tiếp.
- Execute Laser đặt HP về 0 ngay sau damage trong cùng tick rồi đi qua death/reward pipeline chuẩn. Hồi Oanh Tạc dùng damage sau mitigation và giới hạn HP còn lại.
- HawkEye hoàn Điện chỉ trong nhánh thu hồi chủ động. Upkeep ghi số thực tế đã trừ; tự tắt, bị phá và cleanup không hoàn Điện.
- HUD đọc timer/charge từ runtime. Enemy nhận nhãn hiệu ứng/timer gắn với sprite và reticle sync độc nhất; Pixi và Canvas dùng chung geometry.
- Lửa Viper dùng một nozzle; Titan/Phantom dùng cặp nozzle đối xứng theo artwork. Mount được chuyển qua anchor/scale presentation. Ba lớp exhaust và nội suy thrust có Reduced Motion, không tác động collision.

Validation được phép: chỉ `npm run build:web`. Không chạy hoặc sửa test; không QA, mô phỏng, browser/device check, lint, typecheck, benchmark hay verification script. Build thành công chỉ chứng minh bundle, không chứng minh kết quả gameplay/visual khi chạy.

Release: branch → PR → main → GitHub Actions Firebase Hosting; không deploy Firebase thủ công.

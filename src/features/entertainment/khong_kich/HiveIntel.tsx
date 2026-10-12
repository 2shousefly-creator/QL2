import React from 'react';
import { stageEnemyConfig } from './airCombatConfig';
import { HIVE_NORMALS,HIVE_ELITES,HIVE_MOTHERS } from './airCombatHiveWaves';
import { HiveThumbnail } from './HiveThumbnail';
import type { EnemyType } from './airCombatTypes';

const tactics:Partial<Record<EnemyType,string>>={
 swarm_needler:'Quạt 5 viên lệch trái/phải; chu kỳ 22,4–29,6 giây trong wave thường, vận tốc 100. Mỗi viên bằng 50% Hỏa lực.',
 razor_glider:'Cảnh báo tuyến lao 0,95 giây; lao trong 0,65 giây và rải 7 viên lưỡi liềm. Chu kỳ 5,6–7,4 giây trong wave thường; đổi hướng theo vị trí mục tiêu đã quan sát.',
 aegis_beetle:'Khiên trước bằng 35% Máu tối đa. Phá khiên khiến nó phản kích bằng quạt 9 viên; bắn từ phía sau bỏ qua tấm chắn. Bắn thường mỗi 22,4–29,6 giây trong wave thường.',
 siege_spitter:'Đánh dấu vị trí trong 1,25 giây, bán kính nổ 32; nổ gây 65% Hỏa lực, sau đó tỏa 6 viên bằng 30% sát thương vụ nổ. Chu kỳ kỹ năng 5,6–7,4 giây trong wave thường.',
 signal_weaver:'Báo trước 1,2 giây, hành lang rộng 24; trúng chịu 70% Hỏa lực và choáng 0,5 giây. Trong wave thường: hành lang mỗi 5,6–7,4 giây; quạt hỗ trợ 5 viên mỗi 22,4–29,6 giây.',
 repair_wasp:'Sửa 0,5% Máu tối đa mỗi giây cho một mục tiêu trong 190 đơn vị. Liên kết ngắt khi bị choáng, khóa kỹ năng hoặc bị hạ. Bắn thường mỗi 36 giây trong wave thường.',
 razor_marshal:'Luân phiên truy kích ba thành viên; cảnh báo 0,95 giây, lao 0,65 giây. Chu kỳ kỹ năng lớn 3,4 giây.',
 aegis_regent:'Khiên trước 35% Máu tối đa; quạt 7 viên qua tuyến bảo vệ, tăng thành 9 viên khi khiên vỡ. Chu kỳ 3,4 giây.',
 bombard_prelate:'Ba điểm pháo kích bán kính 48; lần lượt nổ sau 1,25 / 1,6 / 1,95 giây, tỏa 6 / 8 / 10 viên. Chu kỳ 3,4 giây.',
 disruptor_monarch:'Hành lang nhiễu rộng 44, báo trước 1,2 giây; 70% Hỏa lực và choáng 0,5 giây. Chu kỳ 3,4 giây.',
 forge_matron:'Sửa 0,9% Máu tối đa mỗi giây trong 190 đơn vị; gọi tối đa 1 Thợ Vá Tổ và 1 Bọ Đạn mỗi đời. Hỗ trợ không cấp XP hoặc loot.',
 brood_ark:'So với Pháo Bầy cùng wave: Máu ×10, Hỏa lực ×6, Giáp ×8; tốc độ 12. Chu kỳ 7 giây: quạt 13 viên và 3 tên lửa tách thành 5 viên sau 1,25 giây. Lõi lộ 3 giây.',
 crucible_ark:'So với Pháo Bầy cùng wave: Máu ×10, Hỏa lực ×6, Giáp ×8; tốc độ 12. Chu kỳ 7 giây: 3 điểm pháo kích và 3 tuyến công thành rộng 24, báo trước 2 / 2,4 / 2,8 giây. Lõi lộ 3,5 giây.',
 boss:'Chuyển phase ở 75% / 50% / 25% Máu. Phòng tuyến → Săn tổ đội → Công thành → Lõi quá tải. Phase 2 mở 14 hỗ trợ hữu hạn; phase 4 lộ lõi 1,6 giây mỗi đòn. Chu kỳ 3,05 / 2,7 / 2,35 / 2 giây.',
};

export function HiveIntel(){
 return <details className="mt-4 text-xs text-slate-300"><summary className="cursor-pointer font-semibold text-amber-200">Hồ sơ chiến trường · cơ chế và chỉ số</summary>
  <div className="mt-2 max-h-72 space-y-3 overflow-y-auto pr-2">
   <p>Cả ba chiến cơ hồi sinh tại vị trí bị hạ, đầy Máu và tài nguyên, miễn sát thương 3 giây. Thời gian chờ chốt lúc bị hạ: 15 giây + 5 giây cho mỗi 30 giây trận đấu đã qua (phút thứ 5: 65 giây). Dừng đếm khi trận tạm dừng. Hồi chiêu tiếp tục trong lúc chờ; kỹ năng bật/tắt tự dừng. Chỉ thua khi cả đội không còn chiến cơ sống.</p>
   <p>580 quái thường và 12 Tinh Anh cấp 7.000 XP chiến đấu; cấp 18 cần tổng 6.900 XP. Lõi ở cấp 1 / 7 / 11 / 15. Các hỗ trợ của Forge Matron và Boss không cấp XP.</p>
   <p>Chỉ số nền quái thường Màn 5 bằng ×2 loại tương ứng ở Màn 4. Quái thường nhân tiếp ×0,5 / ×1 / ×1,5 / ×2 theo wave; Tinh Anh không nhân thêm. Hỏa lực là cơ sở để nhân hệ số của từng đòn.</p>
   {[...HIVE_NORMALS,...HIVE_ELITES,...HIVE_MOTHERS,'boss' as const].map(type=>{const c=stageEnemyConfig(type,5);return <article key={type}>
    <div className="flex items-center gap-2"><span className="h-9 w-9 shrink-0"><HiveThumbnail id={type==='boss'?'hive_tyrant':type}/></span><strong>{c.name}</strong></div>
    <p className="text-amber-100">Máu {Math.round(c.baseHp).toLocaleString('vi-VN')} · Giáp {c.baseArmor.toFixed(1)} · Hỏa lực {c.projectileDamage.toFixed(1)}</p>
    <p>{tactics[type]}</p>
   </article>;})}
   <p>Đòn trúng tâm lõi đang lộ bỏ qua Giáp. Mẹ bị hạ nổ trong bán kính 320: sát thương chuẩn bằng 100% Máu tối đa của mẹ, chỉ lên quái thường khác. Công thuộc người giết mẹ, không nhân chí mạng hoặc kích hoạt thêm proc kết liễu.</p>
   <p>Các đòn lớn cách nhau ít nhất 1,4 giây. Đồng minh tính lại đường né mỗi 0,10–0,11 giây từ đạn và cảnh báo đã xuất hiện, ưu tiên phòng thủ khi nguy hiểm. Terra canh Địa Áp, Phantom giữ Điện cho kỹ năng thoát hiểm.</p>
  </div>
 </details>;
}

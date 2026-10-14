import React from 'react';
import { stageEnemyConfig } from './airCombatConfig';
import { FOREST_SPEC, FOREST_NORMALS, type ForestEnemyType } from './airCombatForestCatalog';
import { FOREST_BOSS_SKILLS } from './airCombatForest';
import { ForestThumbnail } from './ForestThumbnail';

const tactics:Record<ForestEnemyType,string>={
 forest_mantis:'Chu kỳ 5,8 giây: tàng hình 0,62 giây, khóa tuyến chém rộng 20 và báo trước 0,8 giây. Chém 80% Hỏa lực; vị trí khóa không đổi theo mục tiêu. Không gây tiếp xúc trong nhịp phục kích.',
 forest_stinger:'Chu kỳ 5,8 giây: quạt 5 ngòi bằng 40% Hỏa lực, cảnh báo tuyến lao 0,85 giây rồi lao 0,65 giây. Mỗi actor chỉ nhận một hit tiếp xúc mỗi cú lao; sau đó rút về đội hình.',
 forest_fae_moth:'Chu kỳ 5,8 giây: luân phiên 2 / 3 lớp quạt, mỗi lớp 7 hạt bằng 35% Hỏa lực, cách nhau 0,28 giây. Hạt tách sau 1,25 giây thành 5 viên bằng 50% sát thương hạt mẹ.',
 forest_acid_bat:'Chu kỳ 5,8 giây: 3 giọt bằng 65% Hỏa lực. Mỗi giọt giảm 30% Giáp và 35% hồi phục trong 3 giây; mức giảm cùng loại không cộng dồn.',
 forest_web_spider:'Chu kỳ 5,8 giây: khóa hai đầu tuyến tơ rộng 14, báo trước 1,1 giây, xung gây 70% Hỏa lực. Tơ thường không Trói Chân.',
 forest_spirit_firefly:'Hồi 0,5% Máu tối đa mỗi giây cho một đồng loại trong 190 đơn vị; không hồi quá trần hoặc hồi entity chết. Mỗi 7 giây phát vòng 12 viên bằng 35% Hỏa lực.',
 forest_mantis_lord:'Ba nhịp dịch chuyển/chém sau 0,8 / 1,65 / 2,5 giây, mỗi nhịp 80% Hỏa lực. Hai nhịp đầu Câm Lặng 1,4 giây; cuối Choáng 0,5 giây. Ba tàn ảnh lần lượt phóng 7 liềm cong bằng 35% Hỏa lực, liềm lớn Câm Lặng 1,2 giây.',
 forest_moth_queen:'Luân phiên 3 lớp quạt từ hai cánh (22 hạt/lớp), xoáy hai chiều (5 nhịp ×32 hạt), hành lang phấn rộng trống 88. Phấn lớn giảm 50% hồi tài nguyên trong 3 giây; phấn độc/tách giảm 35% hồi phục 3,5 giây, màn phấn 4 giây.',
 forest_bat_lord:'Hai hàng axit chừa lối đi, bán kính cụm 24, báo trước 0,85 / 1,4 giây, tồn tại 1,5 giây, tick 0,6 giây. Luân phiên gói axit 3 / 4 giây. Quạt chéo 9 giọt/tách gây giảm hồi phục 4 giây; tuyến chéo rộng 18 ở nhịp chẵn.',
 forest_weaver_matriarch:'Hai tuyến giao nhau rộng 18 kích hoạt sau 1,1 / 1,75 giây, gây 70% Hỏa lực và Trói 1 giây. Phá một trong hai nút đầu tuyến để hủy tuyến đó. Kén khóa vị trí nổ sau 2,3 giây, bán kính 30, gây Câm Lặng 1,6 giây và tỏa 12 hạt.',
 forest_firefly_ancient:'Hồi 0,9% Máu tối đa/giây trong 190 đơn vị. Mỗi đời gọi tối đa 1 Đom Đóm Tinh Linh và 1 Ong Sát Thủ, không XP/loot. Vòng 20 viên luân phiên Nhiễu Sinh Học 3 giây và giảm hồi phục 4 giây; xung báo trước 1,1 giây giảm 50% hồi tài nguyên 3 giây.',
 forest_brood_queen:'Chu kỳ 7 giây: 15 ngòi quạt bằng 30% Hỏa lực, vòng 24 ngòi bằng 25%, hai tuyến báo trước 1,2 giây bằng 70%. Lộ lõi 3 giây. Giữ tỷ lệ mẹ so với tham chiếu Màn 5.',
 forest_ancient_cocoon:'Chu kỳ 7 giây: 3 lớp phấn, 3 cụm nổ bán kính 28 sau 1,2 / 1,6 / 2 giây, mỗi cụm tỏa 12 hạt. Tuyến tơ chừa hành lang 100 kích hoạt sau 2,6 giây. Lộ lõi 3,5 giây.',
};
const number=(v:number)=>v.toLocaleString('vi-VN',{maximumFractionDigits:2});
export function ForestIntel(){return <details className="mt-4 text-xs text-slate-300"><summary className="cursor-pointer font-semibold text-lime-200">Hồ sơ chiến trường · Cánh Rừng Bí Ẩn</summary><div className="mt-2 max-h-80 space-y-3 overflow-y-auto pr-2">
 <p>580 quái thường + 12 Tinh Anh = 7.000 XP; cấp 18 cần 6.900 XP. Lõi ở cấp 1 / 7 / 11 / 15. Hỗ trợ, điểm lưới và Boss không cấp thêm XP. Tối đa 30 quái thường; Boss + 14 hỗ trợ hữu hạn tối đa 15 actor. Boss gọi hỗ trợ từ phase 2.</p>
 <p>Cả đội giữ chiến cơ/build khi hồi sinh. Thời gian chờ: 15 giây + 5 giây mỗi 30 giây trận, tối đa 60 giây; hồi sinh tại vị trí bị hạ, đầy Máu/tài nguyên và bảo vệ 3 giây. Thua tức thời khi cả đội cùng bị hạ. Loot chung nhận đủ một bản mỗi thành viên đủ điều kiện, kể cả đang chờ hồi sinh; Core224 tính theo người kết liễu, Core228 chỉ khóa chủ sở hữu.</p>
 <p>Chỉ số dưới đây là chỉ số thật trước hệ số wave. Máu, Giáp, Hỏa lực và tiếp xúc bằng đúng quái Màn 5 đối chiếu ×1,10. Quái thường/mẹ nhân ×0,5 / ×1 / ×1,5 / ×2 theo wave; Tinh Anh và Boss không nhân thêm. Đạn thường/special tốc độ nền 105 → 136,5; ngòi chéo 120 → 156; homing 135 → 175,5; đạn tách 145 → 188,5 đơn vị/giây, theo cùng pipeline tốc độ Màn 5.</p>
 {Object.entries(FOREST_SPEC).map(([id,[,name]])=>{const c=stageEnemyConfig(id as ForestEnemyType,6);return <article key={id}><div className="flex items-center gap-2"><span className="h-10 w-10 shrink-0"><ForestThumbnail id={id}/></span><strong>{name}</strong></div><p className="text-lime-100">Máu {number(c.baseHp)} · Giáp {number(c.baseArmor)} · Hỏa lực {number(c.projectileDamage)} · Tiếp xúc {number(c.collisionDamage)}</p><p>{tactics[id as ForestEnemyType]}</p>{FOREST_NORMALS.includes(id as ForestEnemyType)&&<p>Máu theo wave: {[.5,1,1.5,2].map(k=>number(c.baseHp*k)).join(' / ')}.</p>}</article>;})}
 <article><div className="flex items-center gap-2"><span className="h-12 w-12"><ForestThumbnail id="nyxara"/></span><strong>NYXARA Ω — Nữ Hoàng Dạ Lâm</strong></div>{(()=>{const c=stageEnemyConfig('boss',6);return <p className="text-lime-100">Máu {number(c.baseHp)} · Giáp {number(c.baseArmor)} · Hỏa lực {number(c.projectileDamage)} · Tiếp xúc {number(c.collisionDamage)}</p>;})()}<p>Bốn phase ở 75% / 50% / 25% Máu. Cadence 2,4 / 2 / 1,6 / 1,25 giây; chuỗi đang thi triển hoàn tất trước đòn kế. Phase 1 có 9 nhóm chiêu, thêm phục kích/homing ở phase 2, lớp quạt phối hợp ở phase 3 và Nhật Thực ở phase 4.</p><ol className="list-decimal pl-4">{FOREST_BOSS_SKILLS.map(s=><li key={s.name}><strong>{s.name}:</strong> {s.detail}</li>)}</ol></article>
 <p>Trói/Choáng Màn 6 không nối dài khi đang chịu khống chế; khi hết hoặc được giải có 1 giây kháng Trói/Choáng Màn 6. Trói vẫn cho bắn/cast. Mọi thời lượng đi qua miễn/giảm/giải hiện có; trạng thái, cảnh báo và animation dừng theo thời gian trận khi pause.</p>
 <p>Mẹ nổ bán kính 320, sát thương chuẩn bằng 100% Máu tối đa của mẹ lên quái thường khác đang sống; giữ người giết mẹ, không đánh đội mình, Tinh Anh, Boss, mẹ khác hoặc queue. Chỉ đòn trúng tâm lõi đang lộ bỏ qua Giáp.</p>
 </div></details>;}

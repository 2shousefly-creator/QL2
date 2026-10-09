import type { SkillId } from './airCombatTypes';

export const SYLVA_SKILLS = ['sylva_symbiosis','sylva_acid_burst','sylva_parasitic_seed','sylva_deathbloom'] as const;
export type SylvaSkillId = typeof SYLVA_SKILLS[number];
export const isSylvaSkill = (id:SkillId|string):id is SylvaSkillId => (SYLVA_SKILLS as readonly string[]).includes(id);
export const SYLVA_NAMES = ['Cộng Sinh','Nổ Axit','Ký Sinh','Đại Thụ Diệt Sinh'] as const;
export const SYLVA_DESCRIPTION = 'Chiến cơ sát thủ dùng axit bào mòn Giáp và Ký Sinh để khuếch đại sát thương, rồi kết liễu bằng Đại Thụ Diệt Sinh. Căn thời điểm Cộng Sinh để tích trữ sinh lực và hồi phục giữa giao tranh.';
export const SYLVA_PASSIVE = 'Đạn thường chính và đạn phụ từ bắn thường của Sylva ăn mòn mục tiêu, giảm 1/2/3/4 Giáp mỗi lần trúng ở cấp chiến cơ 1/6/11/16. Mỗi lần trúng làm mới toàn bộ lượng ăn mòn về 5 giây. Tối đa giảm 120 Giáp lên Tinh Anh và 80 Giáp lên Boss; không thể làm Giáp xuống dưới 0.';
export const SYLVA_UPGRADES = [
 ['Cộng Sinh','Dưỡng Sinh','Ý Chí Sinh Tồn','Mộc Giáp','Sinh Lực Bùng Nở'],
 ['Nổ Axit','Độc Tố Cô Đặc','Độc Trệ','Độc Lực Tăng Cường','Axit Bám Dính'],
 ['Ký Sinh','Hạt Giống Độc','Rễ Siết','Mầm Độc Trưởng Thành','Bộc Mầm'],
 ['Đại Thụ Diệt Sinh','Sinh Trưởng Áp Chế','Sinh Diệt Tuần Hoàn'],
] as const;
export const SYLVA = {duration:6,recast:.5,radius:170,zoneDuration:5,tick:.5,tail:2,armorPct:.25,armorDuration:5,markDuration:5,ultimateRadius:200,cycle:8} as const;
export function sylvaValues(id:SylvaSkillId,rank:number){
 const n=Math.max(0,Math.min(id==='sylva_deathbloom'?2:4,rank-1)),i=SYLVA_SKILLS.indexOf(id);
 return {cost:i===3?150+50*n:(i===1?100:90)+10*n,cooldown:i===3?90-5*n:[32,25,23][i]-n,
  duration:i===0||i===3?6:i===1?5:1,damageMultiplier:i===0?0:i===1?1.5+.2*n:i===2?2.5+.5*n:1+.5*n,
  capture:.6+.05*n,dps:.4+.1*n,amplification:.12+.02*n,root:1+.25*n,record:i===3?[.6,.8,1][n]:.9+.3*n,
  count:1,upkeepPerSecond:0,sideProjectileMultiplier:1,radiusMultiplier:1,damageTakenMultiplier:1,charge:0};
}
export function sylvaDescription(id:SylvaSkillId,rank:number){
 const v=sylvaValues(id,rank),pct=(n:number)=>Math.round(n*100);
 if(id==='sylva_symbiosis')return `Sylva bước vào Cộng Sinh trong tối đa 6 giây, ghi nhận ${pct(v.capture)}% lượng Máu thực tế mất do sát thương thành Sinh Lực Tích Trữ, hiển thị bằng Máu Xám. Sau 0,5 giây, có thể tái kích hoạt để kết thúc và hồi 50% Hỏa Lực cộng toàn bộ Sinh Lực Tích Trữ. Khi hết thời gian, kỹ năng tự kết thúc và hồi phục theo cùng công thức. Hồi chiêu bắt đầu khi Cộng Sinh kết thúc.`+(rank>=3?' Có thể tái kích hoạt khi đang bị khống chế cứng; không xóa hiệu ứng khống chế.':'')+(rank>=4?' Trong Cộng Sinh, Sylva tăng 30% Giáp.':'')+(rank>=5?' Sylva gây thêm 25% toàn bộ sát thương trong Cộng Sinh và 4 giây sau khi kết thúc.':'')+' Máu Xám là lượng Sinh Lực có thể hồi khi Cộng Sinh kết thúc. Sylva vẫn mất Máu ngay khi nhận sát thương và có thể bị hạ gục trước lúc hồi phục.';
 if(id==='sylva_acid_burst')return `Sylva phóng tên lửa hóa học tới cụm đông địch nhất, gây ${pct(v.damageMultiplier)}% Hỏa Lực trong bán kính 170 và tạo vùng axit trong 5 giây. Vùng gây ${pct(v.dps)}% Hỏa Lực mỗi giây, theo nhịp 0,5 giây. Mục tiêu trúng vụ nổ hoặc tiếp xúc vùng bị giảm 25% Giáp trong 5 giây; tiếp tục ở trong vùng sẽ làm mới thời gian. Hồi chiêu bắt đầu khi vùng axit kết thúc.`+(rank>=3?' Vùng làm chậm mọi mục tiêu 30%, Tinh Anh 15% và Boss 10%; làm chậm kéo dài thêm 1 giây sau khi rời vùng.':'')+(rank>=5?' Mục tiêu trúng vụ nổ tiếp tục chịu sát thương axit trong 2 giây sau khi rời vùng hoặc vùng kết thúc. Sát thương bám dính không cộng dồn với sát thương vùng.':'');
 if(id==='sylva_parasitic_seed')return `Sylva phóng hạt ký sinh vào cụm địch, gây ${pct(v.damageMultiplier)}% Hỏa Lực trong bán kính 170, Trói mục tiêu trong ${v.root.toLocaleString('vi-VN')} giây và đặt Dấu Ký Sinh trong 5 giây. Mục tiêu mang dấu nhận thêm ${pct(v.amplification)}% toàn bộ sát thương từ Sylva. Thời gian Trói còn 75% với Tinh Anh và 50% với Boss. Hồi chiêu bắt đầu khi hạt phát nổ.`+(rank>=5?' Lần đầu Nổ Axit hoặc vụ nổ Đại Thụ Diệt Sinh gây sát thương lên mục tiêu mang dấu, Bộc Mầm gây thêm 200% Hỏa Lực lên mục tiêu đó. Mỗi dấu chỉ kích hoạt một lần và không bị tiêu hao.':'');
 return `Sylva gieo Mầm Diệt Sinh lên địch trong bán kính 200 quanh mục tiêu hiện tại. Trong 6 giây, mỗi mầm ghi nhận toàn bộ Máu thực tế mục tiêu mất do sát thương từ Sylva. Khi kết thúc, mầm hóa thành đại thụ gai và nổ, gây ${pct(v.damageMultiplier)}% Hỏa Lực cộng ${pct(v.record)}% lượng Máu đã ghi nhận; cả hai phần sát thương đều chịu Giáp. Mầm tự nổ sớm nếu vụ nổ đủ hạ gục mục tiêu. Không thể tái kích hoạt; các mầm biến mất nếu Sylva bị hạ gục. Hồi chiêu bắt đầu khi mầm cuối cùng kết thúc.`+(rank>=2?' Khi được gieo mầm, mục tiêu bị giảm 50% tốc độ di chuyển và 25% tổng tốc độ bắn trong 3 giây.':'')+(rank>=3?' Khi lượt kỹ năng kết thúc, giảm 8 giây hồi chiêu còn lại của Nổ Axit và Ký Sinh, một lần mỗi lượt.':'')+' Không ghi nhận sát thương vào Khiên. Cần có mục tiêu hiện tại hợp lệ để kích hoạt.';
}
export function sylvaUpgradeDescription(id:SylvaSkillId,rank:number){
 if(rank<=1)return sylvaDescription(id,rank);
 const v=sylvaValues(id,rank),p=sylvaValues(id,rank-1),pct=(n:number)=>Math.round(n*100),i=SYLVA_SKILLS.indexOf(id);
 const extras=[['','Có thể tái kích hoạt khi bị khống chế cứng sau 0,5 giây; không xóa khống chế.','Tăng 30% Giáp trong Cộng Sinh.','Gây thêm 25% toàn bộ sát thương trong Cộng Sinh và 4 giây sau khi kết thúc.'],['','Vùng làm chậm mọi mục tiêu 30%, Tinh Anh 15%, Boss 10%; còn 1 giây sau khi rời vùng.','','Mục tiêu trúng vụ nổ chịu axit bám dính 2 giây sau khi rời vùng hoặc vùng kết thúc; không cộng DPS với vùng.'],['','','','Thêm Bộc Mầm 200% Hỏa Lực, một lần mỗi dấu khi Nổ Axit hoặc vụ nổ ultimate gây sát thương.'],['Gieo mầm giảm 50% tốc độ di chuyển và 25% tổng tốc độ bắn trong 3 giây.','Khi lượt kết thúc, giảm 8 giây hồi chiêu còn lại Nổ Axit/Ký Sinh, một lần mỗi lượt; áp dụng cả hồi chiêu chưa bắt đầu của lượt đang chạy.']];
 const numbers=i===0?`Tỷ lệ ghi nhận Sinh Lực: ${pct(p.capture)}% → ${pct(v.capture)}%.`:i===1?`Sát thương nổ: ${pct(p.damageMultiplier)}% → ${pct(v.damageMultiplier)}% Hỏa Lực. Sát thương vùng: ${pct(p.dps)}% → ${pct(v.dps)}% Hỏa Lực/giây.`:i===2?`Sát thương: ${pct(p.damageMultiplier)}% → ${pct(v.damageMultiplier)}% Hỏa Lực. Nhận thêm sát thương từ Sylva: ${pct(p.amplification)}% → ${pct(v.amplification)}%. Trói: ${p.root.toLocaleString('vi-VN')} → ${v.root.toLocaleString('vi-VN')} giây; Tinh Anh/Boss giữ hệ số 75%/50%.`:`Nổ cơ bản: ${pct(p.damageMultiplier)}% → ${pct(v.damageMultiplier)}% Hỏa Lực. Sát thương cộng thêm từ lượng ghi nhận: ${pct(p.record)}% → ${pct(v.record)}%.`;
 return `${numbers} ${extras[i][rank-2]}\nMana: ${p.cost} → ${v.cost}. Hồi chiêu cơ bản: ${p.cooldown} → ${v.cooldown} giây.`;
}

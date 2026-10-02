import type { SkillId } from './airCombatTypes';
export const CINDER_SKILLS = ["cinder_fire_shield","cinder_fuel_barrage","cinder_heat_wave","cinder_inferno_beam"] as const;
export type CinderSkillId = typeof CINDER_SKILLS[number];
export const isCinderSkill = (id: SkillId): id is CinderSkillId => (CINDER_SKILLS as readonly string[]).includes(id);
export const CINDER_BURN = { cap:6, duration:6, interval:.5, tick:.05 } as const;
export const cinderValues = (id:CinderSkillId, rank:number) => {
 const r=Math.max(1,rank), i=r-1;
 const common={cost:0,cooldown:0,duration:0,damageMultiplier:0,radius:0,charge:0,width:0,perStack:0,shieldMultiplier:0};
 switch(id){
 case 'cinder_fire_shield':return {...common,cost:[80,85,90,95,100][i],cooldown:[30,29,28,27,26][i],duration:[5,5,6,6,7][i],shieldMultiplier:[1,1.5,2,2.5,3][i],radius:80};
 case 'cinder_fuel_barrage':return {...common,cost:[100,110,120,130,140][i],cooldown:[24,23,22,21,20][i],duration:r>=3?5:4,damageMultiplier:[.45,.55,.55,.55,.65][i],radius:[36,40,40,40,44][i]};
 case 'cinder_heat_wave':return {...common,cost:[90,100,110,120,130][i],cooldown:[22,21,20,19,18][i],duration:.8,damageMultiplier:[.4,.5,.6,.7,.8][i],perStack:[.3,.3,.35,.35,.4][i]};
 case 'cinder_inferno_beam':return {...common,cost:[150,200,250][i],cooldown:90,duration:[2,1.75,1.5][i]+.45,charge:[2,1.75,1.5][i],damageMultiplier:[24,30,36][i],width:[84,84,96][i],radius:[45,55,65][i]};
 }
};
export const CINDER_NAMES = ['Khiên Lửa','Rải Nhiên Liệu','Quầng Nhiệt','Hỏa Quang Hủy Diệt'] as const;
export function cinderDescription(id:CinderSkillId,r:number){const v=cinderValues(id,r);
 switch(id){
 case 'cinder_fire_shield':return 'Tạo khiên '+v.shieldMultiplier*100+'% Hỏa Lực trong '+v.duration+' giây; không tăng tốc độ. '+(r>=3?'Phản Nhiệt: hấp thụ sát thương phát quầng bán kính 80 đặt 1 Cháy, hồi chiêu riêng 1 giây. ':'')+(r>=4?'Thu Hồi Nhiệt: quầng trúng mục tiêu đã Cháy hồi 2% Mana tối đa, tối đa 10% mỗi khiên. ':'')+(r>=5?'Vỏ Lửa Gia Cố: nguồn có ít nhất 3 Cháy gây ít hơn 35% sát thương thông thường lên khiên; không giảm sát thương chuẩn hoặc phần dư vào Máu. ':'')+'Hồi chiêu bắt đầu khi khiên hết hoặc vỡ.';
 case 'cinder_fuel_barrage':return 'Bốn khối nhiên liệu bay 0,6 giây, tạo hàng ngang cách tâm 84; bán kính '+v.radius+', tồn tại '+v.duration+' giây. Mỗi 0,5 giây gây '+v.damageMultiplier*100+'% Hỏa Lực thông thường; vào vùng nhận 1 Cháy, tiếp tục thêm 1 mỗi 0,5 giây. Vùng chồng không nhân sát thương hoặc Cháy. '+(r>=3?'Mục tiêu đủ 6 Cháy nhận thêm 25% sát thương trực tiếp mỗi nhịp. ':'')+(r>=4?'Bùng Nhiên Liệu: Quầng Nhiệt hoặc luồng Hỏa Quang chính chạm vùng gây 180% Hỏa Lực và 1 Cháy, mỗi mục tiêu trúng tối đa một lần mỗi đợt, không xóa vùng. ':'')+(r>=5?'Tường Lửa nối khoảng trống giữa bốn vùng. ':'')+'Hồi chiêu khi vùng kết thúc.';
 case 'cinder_heat_wave':return 'Quầng lan khắp vùng chiến đấu trong 0,8 giây; mỗi mục tiêu trúng một lần: '+v.damageMultiplier*100+'% + '+v.perStack*100+'% × n Hỏa Lực, n là Cháy trước khi trúng. Chưa Cháy: +1, không làm chậm. Đã Cháy: +'+(r>=4?2:1)+', làm chậm 15% + 3% × n trong '+(r>=4?4:3)+' giây. '+(r>=3?'Sẵn 6 Cháy: trói chân 0,75 giây (Boss miễn trói chân), vẫn tấn công và dùng kỹ năng. ':'')+(r>=5?'Cháy Lan: đủ 6 sau khi trúng phát 4 xung, mỗi giây 60% Hỏa Lực trong bán kính 55; địch quanh nhận 1 Cháy, nguồn không tự làm mới Cháy; nguồn chết hủy xung; không sinh nguồn lan mới; mỗi mục tiêu chỉ trúng một xung mỗi giây. ':'')+'Hồi chiêu khi quầng chính kết thúc.';
 case 'cinder_inferno_beam':return 'Tụ '+v.charge+' giây vẫn di chuyển, chỉ được dùng Khiên Lửa; ngừng bắn thường. Khai hỏa khóa di chuyển và kỹ năng 0,45 giây: luồng hỏa năng rộng '+v.width+' gây '+v.damageMultiplier*100+'% Hỏa Lực một lần và +1 Cháy, xuyên mọi mục tiêu. Đã Cháy trước luồng chính: nổ (120% + 100% × n) Hỏa Lực bán kính '+v.radius+', không tiêu hao Cháy. Nổ không đệ quy; sát thương nổ từ các mục tiêu khác tối đa 720% Hỏa Lực lên mỗi mục tiêu mỗi lần dùng, nổ bản thân tính riêng. '+(r>=2?'Các vụ nổ xung quanh thêm tối đa 1 Cháy lên mỗi mục tiêu mỗi lần dùng. ':'')+(r>=3?'Vệt Hỏa Năng cố định 3 giây: 60% Hỏa Lực mỗi 0,5 giây, +1 Cháy mỗi giây; không kích nổ nhiên liệu. ':'')+'Hồi chiêu khi kết thúc khai hỏa.';
 }
}

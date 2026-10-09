import type { SkillId } from './airCombatTypes';
export const CINDER_SKILLS = ["cinder_fire_shield","cinder_fuel_barrage","cinder_heat_wave","cinder_inferno_beam"] as const;
export type CinderSkillId = typeof CINDER_SKILLS[number];
export const isCinderSkill = (id: SkillId): id is CinderSkillId => (CINDER_SKILLS as readonly string[]).includes(id);
export const CINDER_BURN = { cap:6, duration:6, interval:.5, dpsAtCap:[.35,.4,.45,.5] } as const;
export const cinderValues = (id:CinderSkillId, rank:number) => {
 const r=Math.max(1,rank), i=r-1;
 const common={cost:0,cooldown:0,duration:0,damageMultiplier:0,radius:0,charge:0,width:0,perStack:0,beamPerBurn:0,shieldMultiplier:0};
 switch(id){
 case 'cinder_fire_shield':return {...common,cost:[80,85,90,95,100][i],cooldown:[30,29,28,27,26][i],duration:[5,5,6,6,7][i],shieldMultiplier:[1,1.75,2.5,3.25,4][i],radius:80};
 case 'cinder_fuel_barrage':return {...common,cost:[100,110,120,130,140][i],cooldown:[24,23,22,21,20][i],duration:[5,5.5,6,6.5,7][i],damageMultiplier:[.45,.55,.55,.55,.65][i],radius:[36,40,40,40,44][i]};
 case 'cinder_heat_wave':return {...common,cost:[90,100,110,120,130][i],cooldown:[22,21,20,19,18][i],duration:.8,damageMultiplier:[.4,.5,.6,.7,.8][i],perStack:[.3,.3,.35,.35,.4][i]};
 case 'cinder_inferno_beam':return {...common,cost:[150,200,250][i],cooldown:[90,85,80][i],duration:1.25+.45,charge:1.25,damageMultiplier:[4,6,8][i],beamPerBurn:[3.5,4,4.5][i],width:100};
 }
};
export const CINDER_NAMES = ['Khiên Lửa','Rải Nhiên Liệu','Quầng Nhiệt','Hỏa Quang Hủy Diệt'] as const;
export function cinderDescription(id:CinderSkillId,r:number){const v=cinderValues(id,r);
 switch(id){
 case 'cinder_fire_shield':return 'Cinder tạo khiên bảo vệ bản thân bằng '+v.shieldMultiplier*100+'% Hỏa lực trong '+v.duration+' giây; không tăng tốc độ. '+(r>=3?'Phản Nhiệt: hấp thụ sát thương phát quầng bán kính 80 đặt 1 Cháy, hồi chiêu riêng 1 giây. ':'')+(r>=4?'Thu Hồi Nhiệt: quầng trúng mục tiêu đã Cháy hồi 2% Mana tối đa, tối đa 10% mỗi khiên. ':'')+(r>=5?'Vỏ Lửa Gia Cố: nguồn có ít nhất 3 Cháy gây ít hơn 35% sát thương thông thường lên khiên; không giảm sát thương chuẩn hoặc phần dư vào Máu. ':'')+'Hồi chiêu bắt đầu khi khiên hết hoặc vỡ.';
 case 'cinder_fuel_barrage':return 'Cinder phóng bốn khối nhiên liệu bay 0,6 giây, tạo hàng ngang cách tâm 84; bán kính '+v.radius+', tồn tại '+v.duration+' giây. Mỗi 0,5 giây gây '+v.damageMultiplier*100+'% Hỏa lực thông thường; vào vùng nhận 1 Cháy, tiếp tục thêm 1 mỗi 0,5 giây. Vùng chồng không nhân sát thương hoặc Cháy. '+(r>=3?'Mục tiêu đủ 6 Cháy nhận thêm 25% sát thương trực tiếp mỗi nhịp. ':'')+(r>=4?'Bùng Nhiên Liệu: Quầng Nhiệt hoặc luồng Hỏa Quang chính chạm vùng gây 180% Hỏa lực và 1 Cháy, mỗi mục tiêu trúng tối đa một lần mỗi đợt, không xóa vùng. ':'')+(r>=5?'Tường Lửa nối khoảng trống giữa bốn vùng. ':'')+'Hồi chiêu khi vùng kết thúc.';
 case 'cinder_heat_wave':return 'Cinder phát quầng nhiệt quét kẻ địch khắp vùng chiến đấu trong 0,8 giây; mỗi mục tiêu trúng một lần: '+v.damageMultiplier*100+'% + '+v.perStack*100+'% × n Hỏa lực, n là Cháy trước khi trúng. Chưa Cháy: +1, không làm chậm. Đã Cháy: +'+(r>=4?2:1)+', làm chậm 15% + 3% × n trong '+(r>=4?4:3)+' giây. '+(r>=3?'Sẵn 6 Cháy: trói chân 0,75 giây (Boss miễn trói chân), vẫn tấn công và dùng kỹ năng. ':'')+(r>=5?'Cháy Lan: đủ 6 sau khi trúng phát 4 xung, mỗi giây 60% Hỏa lực trong bán kính 55; địch quanh nhận 1 Cháy, nguồn không tự làm mới Cháy; nguồn chết hủy xung; không sinh nguồn lan mới; mỗi mục tiêu chỉ trúng một xung mỗi giây. ':'')+'Hồi chiêu khi quầng chính kết thúc.';
 case 'cinder_inferno_beam':return 'Cinder tụ hỏa năng trong '+v.charge+' giây; vẫn di chuyển, tạm ngừng bắn thường và chỉ được dùng Khiên Lửa. Khi khai hỏa, khóa di chuyển và kỹ năng trong 0,45 giây. Luồng hỏa năng rộng '+v.width+', xuyên mọi mục tiêu và gây sát thương một lần: '+v.damageMultiplier*100+'% Hỏa lực cộng '+v.beamPerBurn*100+'% Hỏa lực với mỗi cộng dồn Cháy mục tiêu đang có trước khi trúng. Với 6 Cháy, sát thương luồng chính đạt '+((v.damageMultiplier+6*v.beamPerBurn)*100)+'% Hỏa lực. Luồng chính đặt thêm 1 Cháy và làm mới thời gian Cháy về 6 giây, tối đa 6 cộng dồn. Không còn vụ nổ phụ trên mục tiêu đang Cháy. '+(r>=2?'Mục tiêu có ít nhất 3 Cháy trước khi trúng luồng chính bị Choáng 2 giây; còn 1,5 giây với Tinh Anh và 1 giây với Boss. ':'')+(r>=3?'Bùng Cháy: mục tiêu trúng sát thương chiêu cuối chịu sát thương Cháy tăng 50% trong 8 giây; áp dụng lại chỉ làm mới thời gian. Để lại vệt Hỏa Năng cố định rộng 100 trong 3 giây từ lúc khai hỏa, gây 60% Hỏa lực mỗi 0,5 giây và đặt 1 Cháy mỗi giây. Vệt không gây choáng, không kích nổ nhiên liệu; sát thương vệt cũng có thể làm mới Bùng Cháy. ':'')+'Mana: '+v.cost+'. Hồi chiêu cơ bản: '+v.cooldown+' giây, bắt đầu khi kết thúc khai hỏa.';
 }
}

const formatDeltaNumber=(n:number)=>n.toLocaleString('vi-VN',{maximumFractionDigits:2});
function valueDeltas(previous:Record<string,number>,next:Record<string,number>,fields:readonly (readonly [string,string,number,string])[]){
 return fields.filter(([key])=>previous[key]!==next[key]).map(([key,label,scale,unit])=>label+': '+formatDeltaNumber(previous[key]*scale)+' → '+formatDeltaNumber(next[key]*scale)+unit+'.').join('\n');
}

export function cinderUpgradeDescription(id:CinderSkillId,rank:number){
 if(rank===1)return cinderDescription(id,rank);
 const effects:Record<CinderSkillId,readonly string[]>={
 cinder_fire_shield:['','','Phản Nhiệt: khi hấp thụ sát thương, phát quầng bán kính 80 đặt 1 Cháy; hai lần cách nhau ít nhất 1 giây.','Thu Hồi Nhiệt: quầng trúng địch đã Cháy hồi 2% Mana tối đa, tối đa 10% mỗi khiên.','Vỏ Lửa Gia Cố: nguồn có ít nhất 3 Cháy gây ít hơn 35% sát thương thông thường lên khiên; không giảm sát thương chuẩn hoặc phần dư vào Máu.'],
 cinder_fuel_barrage:['','','Địch đủ 6 Cháy nhận thêm 25% sát thương trực tiếp mỗi nhịp.','Bùng Nhiên Liệu: Quầng Nhiệt hoặc luồng Hỏa Quang chính chạm vùng gây 180% Hỏa lực và 1 Cháy; mỗi mục tiêu tối đa một lần mỗi đợt, không xóa vùng.','Tường Lửa nối khoảng trống giữa bốn vùng nhiên liệu.'],
 cinder_heat_wave:['','','Mục tiêu sẵn 6 Cháy bị Trói 0,75 giây nhưng vẫn tấn công và dùng kỹ năng; Boss miễn Trói.','Mục tiêu đã Cháy nhận thêm 2 cộng dồn thay cho 1; thời gian làm chậm: 3 → 4 giây.','Cháy Lan: địch đủ 6 Cháy sau khi trúng phát 4 xung cách nhau 1 giây, mỗi xung 60% Hỏa lực trong bán kính 55 và đặt 1 Cháy lên địch quanh. Nguồn không tự làm mới Cháy; nguồn chết hủy xung, không sinh nguồn lan mới; mỗi mục tiêu tối đa một xung mỗi giây.'],
 cinder_inferno_beam:['','Mục tiêu có ít nhất 3 Cháy trước luồng chính bị Choáng 2 giây; Tinh Anh 1,5 giây, Boss 1 giây. Không tính 1 Cháy do luồng chính đặt.','Kế thừa Choáng cấp 2. Bùng Cháy: mục tiêu trúng sát thương luồng chính hoặc vệt chịu sát thương Cháy ×1,5 trong 8 giây, làm mới không cộng dồn. Vệt Hỏa Năng cố định rộng 100 tồn tại 3 giây từ lúc khai hỏa, gây 60% Hỏa lực mỗi 0,5 giây và đặt 1 Cháy mỗi giây; không gây choáng, không kích nổ nhiên liệu.']};
 return [effects[id][rank-1],valueDeltas(cinderValues(id,rank-1),cinderValues(id,rank),[
 ['shieldMultiplier','Khiên',100,'% Hỏa lực'],['duration','Thời gian',1,' giây'],['radius','Bán kính',1,''],['damageMultiplier','Sát thương',100,'% Hỏa lực'],['perStack','Sát thương mỗi cộng dồn Cháy sẵn có',100,'% Hỏa lực'],['beamPerBurn','Sát thương luồng chính mỗi Cháy trước khi trúng',100,'% Hỏa lực'],['cost','Mana',1,''],['cooldown','Hồi chiêu cơ bản',1,' giây']])].filter(Boolean).join('\n');
}

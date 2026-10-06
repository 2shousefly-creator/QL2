import type { SkillId } from './airCombatTypes';

export const RIPTIDE_SKILLS = ['riptide_wellspring', 'riptide_tidal_blades', 'riptide_confluence', 'riptide_waterform'] as const;
export type RiptideSkillId = typeof RIPTIDE_SKILLS[number];
export const isRiptideSkill = (id: SkillId): id is RiptideSkillId => (RIPTIDE_SKILLS as readonly string[]).includes(id);
export const RIPTIDE_NAMES = ['Mạch Nguồn', 'Song Nhận Thủy Triều', 'Hội Thủy', 'Thủy Thể'] as const;
export const RIPTIDE_UPGRADES = [
 ['Mạch Nguồn', 'Nguồn Tuôn', 'Thanh Lưu', 'Thủy Hộ', 'Mạch Sinh Tồn'],
 ['Song Nhận Thủy Triều', 'Sắc Nhận', 'Trùng Trảm', 'Triều Hãm', 'Hồi Lưu'],
 ['Hội Thủy', 'Cường Lưu', 'Nghịch Lưu', 'Áp Chế Thủy Lực', 'Trùng Triều'],
 ['Thủy Thể', 'Triều Dâng', 'Hải Uy'],
] as const;
export const RIPTIDE = { afterwashRadius:45, afterwash:[.2,.25,.3,.35], bladeRadius:170, bladeInner:48, bladeHalfWidth:14,
 bladePass:.6, confluenceRadius:170, pullDuration:1.5, pullSpeed:120, pullUpgrade:1.3, pullGap:6,
 secondDelay:.8, secondRadius:340, secondDamage:2.25, waterRadius:190, waterDuration:12, waterInterval:.5,
 recastAfter:2, maxCharge:24, healCap:.35, survivalThreshold:.15, survivalHeal:1.5 } as const;
export function riptideValues(id:RiptideSkillId, rank:number) {
 const i=Math.max(0,Math.min(id==='riptide_waterform'?2:4,rank-1));
 const common={cost:0,cooldown:0,duration:0,damageMultiplier:0,radius:0,instantHeal:0,tickHeal:0,armorBonus:0,chargeRatio:0,lifesteal:0,pull:0};
 switch(id) {
 case 'riptide_wellspring':return {...common,cost:[100,115,130,145,160][i],cooldown:[33,32,31,30,29][i],duration:4,instantHeal:[.05,.07,.09,.11,.13][i],tickHeal:[.5,.6,.7,.8,.9][i]};
 case 'riptide_tidal_blades':return {...common,cost:[90,100,110,120,130][i],cooldown:[25,24,23,22,21][i],duration:1.2,radius:RIPTIDE.bladeRadius,damageMultiplier:[2.5,3,3.5,4,4.5][i]};
 case 'riptide_confluence':return {...common,cost:[100,110,120,130,140][i],cooldown:[24,23,22,21,20][i],duration:i===4?2.3:1.5,radius:RIPTIDE.confluenceRadius,damageMultiplier:[2,2.25,2.5,2.75,3][i],pull:RIPTIDE.pullSpeed*(i>=1?RIPTIDE.pullUpgrade:1)};
 case 'riptide_waterform':return {...common,cost:[150,200,250][i],cooldown:85,duration:RIPTIDE.waterDuration,radius:RIPTIDE.waterRadius,damageMultiplier:[.75,.9,1.15][i],armorBonus:[.4,.8,1.2][i],chargeRatio:[.4,.5,.6][i],lifesteal:[.02,.025,.03][i]};
 }
}
const pct=(v:number)=>Math.round(v*10000)/100;
export function riptideDescription(id:RiptideSkillId, rank:number) {
 const v=riptideValues(id,rank);
 const tail=' Hồi chiêu bắt đầu sau khi kỹ năng kết thúc. Riptide vẫn di chuyển, bắn thường và dùng kỹ năng khác.';
 switch(id) {
 case 'riptide_wellspring':return `Riptide hồi ngay ${pct(v.instantHeal)}% Máu tối đa; tại 1/2/3/4 giây, mỗi nhịp hồi ${pct(v.tickHeal)}% Hỏa lực. `+(rank>=3?'Thanh Lưu xóa làm chậm di chuyển đang có, không xóa Choáng/Trói/Cháy, không miễn làm chậm mới. ':'')+(rank>=4?'Thủy Hộ giảm 25% sát thương nhận trong 4 giây. ':'')+(rank>=5?'Mạch Sinh Tồn thường trực: mọi nguồn hồi Máu tăng 50% khi Máu ngay trước từng lần hồi <15% Máu tối đa, kể cả khi Mạch Nguồn không hoạt động. Từ 15% không tăng; hồi dư mất đi. ':'')+tail;
 case 'riptide_tidal_blades':return `Riptide tạo hai lưỡi nước quét kẻ địch quanh chiến cơ, bán kính ${v.radius}; hai lượt trong 1,2 giây, mỗi lượt ${pct(v.damageMultiplier)}% Hỏa lực, mỗi địch tối đa một lần trúng mỗi lượt. `+(rank>=3?'Trùng Trảm: địch trúng lượt đầu nhận thêm 20% sát thương lượt hai trong cùng lần dùng. ':'')+(rank>=4?'Triều Hãm: lượt hai làm chậm 25% trong 2 giây, Boss 10%. ':'')+(rank>=5?'Hồi Lưu: mỗi địch trúng đủ hai lượt hồi 5% Mana tối đa, tối đa 30% mỗi lần dùng. ':'')+`Tổng trúng cả hai: ${pct(v.damageMultiplier*(rank>=3?2.2:2))}% Hỏa lực.`+tail;
 case 'riptide_confluence':return `Riptide tạo vùng hút kẻ địch bán kính ${v.radius} đi theo vị trí hiện tại của Riptide trong 1,5 giây, sau đó nổ ${pct(v.damageMultiplier)}% Hỏa lực. Không gây sát thương khi hút, không lõi nén hoặc phá đạn. Quái thường chịu đầy đủ lực, Tinh Anh 50%, Boss miễn kéo; vẫn tấn công. `+(rank>=2?'Cường Lưu tăng lực kéo 30% so với C1. ':'')+(rank>=3?'Nghịch Lưu: làm chậm 50%, Tinh Anh/Boss 15%, 2 giây làm mới trong vùng hút. ':'')+(rank>=4?'Áp Chế Thủy Lực: địch còn trong 170 khi lần dùng hoạt động gây ít hơn 25% sát thương lên đúng Riptide này; ra vùng hết giảm sát thương. ':'')+(rank>=5?'Trùng Triều: 0,8 giây sau nổ chính, nổ 225% Hỏa lực bán kính 340 ở vị trí hiện tại; không hút lại, không mở rộng làm chậm/giảm sát thương. ':'')+tail;
 case 'riptide_waterform':return `Riptide hóa thành thủy thể trong ${v.duration} giây, tạo vùng nước bán kính ${v.radius} đi theo chiến cơ. Mỗi 0,5 giây, vùng nước gây ${pct(v.damageMultiplier)}% Hỏa lực lên kẻ địch bên trong, tối đa ${RIPTIDE.maxCharge} nhịp. Riptide nhận thêm ${pct(v.armorBonus)}% Giáp và hồi Máu bằng ${pct(v.lifesteal)}% sát thương vùng thực tế gây lên Máu kẻ địch; tổng lượng Máu thực hồi tối đa 35% Máu tối đa mỗi lần dùng, gồm cả Mạch Sinh Tồn. Mỗi nhịp gây sát thương hợp lệ tích ${pct(v.chargeRatio)}% Hỏa lực cho vụ nước vỡ, tối đa ${RIPTIDE.maxCharge} lần; nhiều mục tiêu vẫn chỉ tích một lần, không trúng không tích. Tái kích hoạt sau ít nhất 2 giây để kết thúc sớm và nổ lượng đã tích trong bán kính 190. Khi hết thời gian, nhịp cuối được xử lý trước vụ nước vỡ. Vụ nước vỡ không hồi Máu; không tích từ nguồn sát thương khác.`+tail;
 }
}

const formatDeltaNumber=(n:number)=>n.toLocaleString('vi-VN',{maximumFractionDigits:2});
function valueDeltas(previous:Record<string,number>,next:Record<string,number>,fields:readonly (readonly [string,string,number,string])[]){
 return fields.filter(([key])=>previous[key]!==next[key]).map(([key,label,scale,unit])=>label+': '+formatDeltaNumber(previous[key]*scale)+' → '+formatDeltaNumber(next[key]*scale)+unit+'.').join('\n');
}

export function riptideUpgradeDescription(id:RiptideSkillId,rank:number){
 if(rank===1)return riptideDescription(id,rank);
 const effects:Record<RiptideSkillId,readonly string[]>={
 riptide_wellspring:['','','Thanh Lưu xóa làm chậm di chuyển đang có; không xóa Choáng, Trói hoặc Cháy và không miễn làm chậm mới.','Thủy Hộ giảm 25% sát thương nhận trong 4 giây.','Mạch Sinh Tồn: mọi nguồn hồi Máu tăng 50% khi Máu trước lần hồi dưới 15% Máu tối đa, kể cả ngoài Mạch Nguồn; hồi dư mất đi.'],
 riptide_tidal_blades:['','','Trùng Trảm: địch trúng lượt đầu nhận thêm 20% sát thương lượt hai trong cùng lần dùng.','Triều Hãm: lượt hai làm chậm 25% trong 2 giây, Boss 10%.','Hồi Lưu: mỗi địch trúng cả hai lượt hồi 5% Mana tối đa, tối đa 30% mỗi lần dùng.'],
 riptide_confluence:['','Cường Lưu tăng lực kéo 30%.','Nghịch Lưu làm chậm 50%, Tinh Anh/Boss 15%, trong 2 giây và làm mới khi còn trong vùng hút.','Áp Chế Thủy Lực: địch còn trong bán kính 170 khi Hội Thủy hoạt động gây ít hơn 25% sát thương lên Riptide này.','Trùng Triều: sau vụ nổ chính 0,8 giây, nổ thêm 225% Hỏa lực trong bán kính 340 tại vị trí hiện tại, không hút lại hoặc mở rộng làm chậm/giảm sát thương.'],
 riptide_waterform:['','','']};
 return [effects[id][rank-1],valueDeltas(riptideValues(id,rank-1),riptideValues(id,rank),[
 ['instantHeal','Hồi ngay',100,'% Máu tối đa'],['tickHeal','Hồi mỗi nhịp',100,'% Hỏa lực'],['damageMultiplier','Sát thương',100,'% Hỏa lực'],['armorBonus','Giáp tăng thêm',100,'%'],['chargeRatio','Tích nổ mỗi nhịp',100,'% Hỏa lực'],['lifesteal','Hồi Máu từ sát thương vùng thực tế',100,'%'],['cost','Mana',1,''],['cooldown','Hồi chiêu cơ bản',1,' giây']])].filter(Boolean).join('\n');
}

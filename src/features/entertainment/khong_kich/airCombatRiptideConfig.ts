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
 secondDelay:.8, secondRadius:340, secondDamage:2.25, waterRadius:190, waterDuration:8, waterInterval:.5,
 recastAfter:2, maxCharge:16, healCap:.35, survivalThreshold:.15, survivalHeal:1.5 } as const;
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
 const tail=` Mana: ${v.cost}. Hồi chiêu ${v.cooldown} giây, bắt đầu sau khi kỹ năng kết thúc. Vẫn di chuyển, bắn thường và dùng kỹ năng khác.`;
 switch(id) {
 case 'riptide_wellspring':return `Hồi ngay ${pct(v.instantHeal)}% Máu tối đa; tại 1/2/3/4 giây, mỗi nhịp hồi ${pct(v.tickHeal)}% Hỏa Lực. `+(rank>=3?'Thanh Lưu xóa slow di chuyển đang có, không xóa Choáng/Trói/Cháy, không miễn slow mới. ':'')+(rank>=4?'Thủy Hộ giảm 25% sát thương nhận trong 4 giây. ':'')+(rank>=5?'Mạch Sinh Tồn thường trực: mọi nguồn hồi Máu tăng 50% khi Máu ngay trước từng lần hồi <15% Máu tối đa, kể cả khi Mạch Nguồn không hoạt động. Từ 15% không tăng; hồi dư mất đi. ':'')+tail;
 case 'riptide_tidal_blades':return `Hai lưỡi nước quét theo thân, bán kính ${v.radius}; hai lượt trong 1,2 giây, mỗi lượt ${pct(v.damageMultiplier)}% Hỏa Lực, mỗi địch tối đa một hit/lượt. `+(rank>=3?'Trùng Trảm: địch trúng lượt đầu nhận thêm 20% sát thương lượt hai trong cùng cast. ':'')+(rank>=4?'Triều Hãm: lượt hai slow 25% trong 2 giây, Boss 10%. ':'')+(rank>=5?'Hồi Lưu: mỗi địch trúng đủ hai lượt hồi 5% Mana tối đa, tối đa 30% mỗi cast. ':'')+`Tổng trúng cả hai: ${pct(v.damageMultiplier*(rank>=3?2.2:2))}% Hỏa Lực.`+tail;
 case 'riptide_confluence':return `Vùng hút bán kính ${v.radius} đi theo vị trí hiện tại của Riptide trong 1,5 giây, sau đó nổ ${pct(v.damageMultiplier)}% Hỏa Lực. Không gây damage khi hút, không lõi nén hoặc phá đạn. Quái thường chịu đầy đủ lực, Tinh Anh 50%, Boss miễn kéo; vẫn tấn công. `+(rank>=2?'Cường Lưu tăng lực kéo 30% so với C1. ':'')+(rank>=3?'Nghịch Lưu: slow 50%, Tinh Anh/Boss 15%, 2 giây làm mới trong vùng hút. ':'')+(rank>=4?'Áp Chế Thủy Lực: địch còn trong 170 khi cast hoạt động gây ít hơn 25% sát thương lên đúng Riptide này; ra vùng hết giảm damage. ':'')+(rank>=5?'Trùng Triều: 0,8 giây sau nổ chính, nổ 225% Hỏa Lực bán kính 340 ở vị trí hiện tại; không hút lại, không mở rộng slow/giảm damage. ':'')+tail;
 case 'riptide_waterform':return `Thủy thể theo thân ${v.duration} giây, bán kính ${v.radius}; mỗi 0,5 giây gây ${pct(v.damageMultiplier)}% Hỏa Lực, tối đa 16 nhịp. Mỗi nhịp gây damage hợp lệ tích một lần ${pct(v.chargeRatio)}% Hỏa Lực cho nổ cuối, nhiều địch vẫn chỉ +1, tối đa 16; không trúng không tích. Giáp +${pct(v.armorBonus)}% trong khi hoạt động. Hồi ${pct(v.lifesteal)}% damage vùng thực tế, tổng HP thực hồi tối đa 35% Máu tối đa/cast, kể cả Mạch Sinh Tồn. Sau 2 giây tái kích hoạt miễn phí để nổ bán kính 190 rồi kết thúc. Hết 8 giây xử lý nhịp 16 trước nổ. Nổ không hồi Máu, không tích từ nguồn khác. Không tăng tốc hoặc miễn thương.`+tail;
 }
}

import type { SkillId } from './airCombatTypes';

export const ARGENT_SKILLS=['argent_guard_stance','argent_blade_cast','argent_blade_recall','argent_heavenly_blade_array'] as const;
export type ArgentSkillId=typeof ARGENT_SKILLS[number];
export const isArgentSkill=(id:SkillId):id is ArgentSkillId=>(ARGENT_SKILLS as readonly string[]).includes(id);
export const ARGENT_NAMES=['Thế Đỡ','Phóng Nhận','Thu Nhận','Thiên La Kiếm Trận'] as const;
export const ARGENT_UPGRADES=[['Thế Đỡ','Phản Nhận','Tam Thủ','Tôi Kim','Phá Thế'],['Phóng Nhận','Sắc Nhận','Xuyên Tuyến','Lưu Nhận','Đan Nhận'],['Thu Nhận','Tốc Thu','Ghim Chặt','Kim Lực Tuần Hoàn','Vạn Nhận Xuyên Tâm'],['Thiên La Kiếm Trận','Ngũ Kiếm Đồng Tâm','Vạn Kiếm Quy Tông']] as const;
export const ARGENT={cap:12,ttl:6,extendedTtl:8,speed:600,recallSpeed:720,recallUpgrade:1.2,width:12,range:360,counterRange:240,heavySpeed:800,heavyWidth:24,guardDuration:8,beat:.75,guardFactor:.01,temperDuration:6,temperBonus:.4,breakDamage:2.5,genesis:[.4,.5,.6,.7],genesisGap:1,fan:[-20,-10,0,10,20],arrayDuration:10,arrayCount:5,arrayShots:4,arraySpeed:1200,markArmor:.85,markDuration:4,recallFloor:.6,refund:.015,refundCap:.12} as const;
export function argentValues(id:ArgentSkillId,rank:number){
 const i=Math.max(0,Math.min(id===ARGENT_SKILLS[3]?2:4,rank-1));
 const base={cost:0,cooldown:0,duration:0,damageMultiplier:0,count:0,radius:0};
 switch(id){
 case 'argent_guard_stance':return {...base,cost:90+i*10,cooldown:32-i,duration:ARGENT.guardDuration,count:[2,2,3,3,4][i]};
 case 'argent_blade_cast':return {...base,cost:100+i*10,cooldown:24-i,duration:ARGENT.range/ARGENT.speed,damageMultiplier:[1.1,1.3,1.5,1.7,1.9][i],count:5};
 case 'argent_blade_recall':return {...base,cost:90+i*10,cooldown:22-i,duration:1,damageMultiplier:[1.4,1.7,2,2.3,2.6][i]};
 case 'argent_heavenly_blade_array':return {...base,cost:150+i*50,cooldown:90-i*5,duration:ARGENT.arrayDuration,damageMultiplier:[.7,.9,1.1][i],count:ARGENT.arrayCount};
 }
}
export function argentDescription(id:ArgentSkillId,rank:number){
 const v=argentValues(id,rank),tail=` Mana ${v.cost}; hồi chiêu ${v.cooldown} giây sau khi kết thúc. Vẫn di chuyển, bắn thường và dùng kỹ năng khác.`;
 switch(id){
 case 'argent_guard_stance':return `Thế tối đa 8 giây, ${v.count} lượt. Đòn trực tiếp mở nhịp 0,75 giây và được giảm 99%; đòn cùng nhịp không tiêu lượt/kéo dài. Hết nhịp mở ngay nhịp mới khi bị đánh; lượt cuối bảo vệ hết nhịp, bị cắt ở giây 8. Không đỡ Cháy/DoT/sát thương chuẩn, không miễn khống chế, không tạo lá chắn Máu. `+(rank>=2?'Phản Nhận: nhịp đầu phóng một Phiến 100% Hỏa Lực về nguồn địch, hướng cố định, tầm 240, tốc độ 600, rộng 12, chờ 6 giây; không rõ nguồn thì thẳng trước. ':'')+(rank>=4?'Tôi Kim: mỗi nhịp mới +1 tầng, tối đa 3, trong 6 giây từ nhịp gần nhất. S3 kế tiếp tiêu tầng, thêm 40% Hỏa Lực/tầng đúng một lần mỗi mục tiêu. ':'')+(rank>=5?'Phá Thế: dùng đủ bốn lượt thì lúc kết thúc phóng đại kiếm 250% Hỏa Lực, tầm 360, tốc độ 800, rộng 24, xuyên mỗi địch một lần, không tạo Phiến. ':'')+tail;
 case 'argent_blade_cast':return `Phóng 5 Phiến quạt 40° (-20/-10/0/+10/+20°), tầm 360, tốc độ 600, rộng 12; mỗi Phiến ${Math.round(v.damageMultiplier*100)}% Hỏa Lực. ${rank>=3?'Xuyên toàn sát thương.':'Mục tiêu đầu 100%, các mục tiêu sau 75%, không giảm lũy tiến.'} Chờ cố định ${rank>=4?8:6} giây. `+(rank>=5?'Đan Nhận: trúng ít nhất hai Phiến chiều đi cùng cast thêm 100% Hỏa Lực một lần mỗi mục tiêu. ':'')+tail;
 case 'argent_blade_recall':return `Chỉ thu Phiến đang chờ lúc bấm; không Phiến không tiêu Mana/tầng/hồi chiêu. Bay về vị trí hiện tại của Argent, tốc độ ${rank>=2?864:720}, rộng 12; mỗi Phiến ${Math.round(v.damageMultiplier*100)}% Hỏa Lực. Riêng từng mục tiêu, Phiến 1–3/4–6/7–12 gây ${rank>=5?'100/60/30':'100/50/25'}%. `+(rank>=3?'Ghim Chặt: đủ ba Phiến cùng cast Trói 0,8 giây, Tinh Anh 0,4; Boss slow 15% trong 1 giây, một lần/mục tiêu. ':'')+(rank>=4?'Kim Lực Tuần Hoàn: mỗi Phiến gây damage thực tế hoàn 1,5% Mana tối đa một lần; cap 12%/cast. ':'')+'Riêng Phiến từ ultimate cấp 3 có sàn hệ số nhiều hit 60%, kể cả sau khi kiếm trận hết. Tôi Kim chỉ cộng lần đầu mỗi mục tiêu; không cast chồng lượt thu.'+tail;
 case 'argent_heavenly_blade_array':return `Năm kiếm neo cố định cách đều ở đáy sân trong ${v.duration} giây. Mỗi bốn lần bắn thường chính thực sự khai hỏa phóng đồng thời năm Phiến, không cần trúng địch; không đợt phóng miễn phí. Mỗi Phiến xuyên đầy đủ ${Math.round(v.damageMultiplier*100)}% Hỏa Lực, rộng 12, tốc độ 1200, bay thẳng theo hướng chốt lúc phóng đến mép sân đầu tiên rồi chờ 6 giây; chung giới hạn 12 Phiến. Ưu tiên mục tiêu hiện tại, sau đó địch gần Argent nhất; không có địch phóng thẳng trước. Sinh Nhận tạm ngừng, giữ tiến độ cũ; đạn bắn trong trận không tích nội tại kể cả trúng muộn. Hết trận giữ Phiến, không tự thu. `+(rank>=2?'Ngũ Kiếm Đồng Tâm: ba Phiến khác nhau cùng đợt trúng một mục tiêu tạo Kim Ấn giảm 15% Giáp trong 4 giây, làm mới không cộng dồn. ':'')+(rank>=3?'Vạn Kiếm Quy Tông: riêng Phiến tạo bởi ultimate cấp 3 có sàn hệ số nhiều hit 60% sát thương Thu Nhận, vẫn dùng chung thứ tự hit mỗi mục tiêu. ':'')+tail;
 }
}

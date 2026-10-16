import coreRows from './cores.json';

export const OWNERS = ['archer','crossbow','fire','ice','lightning','wind','earth','poison','sniper','scythe','stars'] as const;
export type Owner = typeof OWNERS[number];
export type Status = 'slow'|'burn'|'poison'|'bleed'|'hard'|'freeze';
export interface Core { id:string; owner:Owner|'wall'; index:number; name:string; description:string; situation:string; kind:'upgrade'|'summon'|'wall'; requires?:Status; ownSource?:boolean }
export interface Fighter { name:string; skill:string; range:number; cooldown:number; action:number; damage:number; color:string; role:string }
export const FIGHTERS:Record<Owner,Fighter> = {
 archer:{name:'Cung thủ',skill:'Thủ Thành Tiễn',range:1.25,cooldown:1,action:0.3,damage:100,color:'#f5cf75',role:'Chủ lực ổn định · 100 sát thương/tên, 30 tên, 1 phát/giây; nạp 5 giây.'},
 crossbow:{name:'Liên Nỏ',skill:'Liên Tiễn',range:0.7,cooldown:2.4,action:0.4,damage:75,color:'#d3b351',role:'Dồn đơn mục tiêu · 3 tên × 75 sát thương; tự đổi sang địch gần nhất nếu mục tiêu chết giữa loạt.'},
 fire:{name:'Hỏa Pháo',skill:'Pháo Viêm Bạo',range:0.85,cooldown:4,action:0.5,damage:190,color:'#ff965c',role:'Phá bầy tập trung · 190 sát thương vùng bán kính 0,11H; đạn pháo bay cầu vồng rồi nổ lớn.'},
 ice:{name:'Băng Pháp Sư',skill:'Hàn Ngục',range:0.65,cooldown:3.2,action:0.35,damage:90,color:'#9de7ff',role:'Khống chế diện rộng · 90 sát thương; chậm 40% trong 2,5 giây. Mỗi lần dùng thứ 3 đóng băng 0,65 giây.'},
 lightning:{name:'Lôi Sư',skill:'Lôi Liên Hoàn',range:0.9,cooldown:3.7,action:0.35,damage:105,color:'#c6a5ff',role:'Đánh bầy phân tán · 4 mắt xích, bắt đầu 105 sát thương, giảm 15% mỗi mắt. Mỗi mắt xích không dùng được dồn 20% sát thương cơ bản vào địch cuối.'},
 wind:{name:'Phong Kiếm Sư',skill:'Phong Nhận Trảm',range:0.42,cooldown:3,action:0.4,damage:185,color:'#85efd3',role:'Giữ tuyến sát thành · quạt 70° gây 185 sát thương và đẩy lùi 0,06H; chặn địch đang áp sát.'},
 earth:{name:'Địa Thuật Sư',skill:'Địa Mạch Quang Tuyến',range:0.8,cooldown:3.5,action:1,damage:80,color:'#e8bd7e',role:'Laser xuyên hàng · 3 nhịp × 80 sát thương trên một đường thẳng dài 0,8H, rộng 0,056H; nhịp đầu choáng 0,2 giây. Lõi Nhánh Quang mở thêm hai tia song song.'},
 poison:{name:'Độc Dược Sư',skill:'Bình Độc Vân',range:0.7,cooldown:4.2,action:0.4,damage:84,color:'#bbe885',role:'Bào mòn lâu dài · 84 sát thương va chạm và độc 35 sát thương/giây trong 4 giây; các lần trúng mới làm mới độc.'},
 sniper:{name:'Thiện Xạ',skill:'Xuyên Tâm Tiễn',range:1,cooldown:3.85,action:0.45,damage:400,color:'#e6edf6',role:'Hạ mục tiêu nặng · một phát 400 sát thương, bỏ qua 30% giáp; ưu tiên địch gần nhất trong tầm dài.'},
 scythe:{name:'Huyết Liêm',skill:'Hồi Liêm',range:0.6,cooldown:3.5,action:0.7,damage:135,color:'#f68fab',role:'Đánh hai lượt · lưỡi liêm xuyên hàng gây 135 sát thương lượt đi và 135 lượt về; mỗi địch chỉ trúng một lần mỗi lượt.'},
 stars:{name:'Tinh Tượng Sư',skill:'Tam Tinh Giáng',range:0.9,cooldown:4.4,action:0.6,damage:90,color:'#aab8ff',role:'Phủ nhiều điểm · 3 thiên thạch × 90 sát thương, cách nhau 0,25 giây, nổ bán kính 0,08H; dồn vào một địch khi không có địch khác.'},
};
const needs:Partial<Record<Owner,Partial<Record<number,Status>>>>={archer:{21:'slow'},crossbow:{29:'slow'},fire:{10:'burn',11:'burn',28:'slow'},ice:{7:'hard',14:'freeze',29:'burn'},lightning:{26:'slow',27:'burn'},wind:{26:'slow',27:'burn'},earth:{26:'slow',27:'burn'},poison:{23:'slow',24:'burn',25:'burn'},sniper:{26:'slow',27:'burn'},scythe:{11:'bleed',27:'slow'},stars:{26:'slow',27:'burn'}};
export const CORES:Core[]=coreRows.map(row=>({...row,owner:row.owner as Owner,kind:'upgrade',requires:needs[row.owner as Owner]?.[row.index],ownSource:(row.owner==='ice'&&row.index===14)||(row.owner==='fire'&&row.index===11)}));
export const SUMMONS:Core[]=OWNERS.slice(1).map((owner,index)=>({id:'summon:'+owner,owner,index,kind:'summon',name:'Triệu Hồi '+FIGHTERS[owner].name,description:FIGHTERS[owner].skill+' — '+FIGHTERS[owner].role,situation:'Tự vào ô trống đầu tiên theo thứ tự #1 → #4. Tồn tại đến hết trận.',}));
export const WALL_CORES:Core[]=[{id:'wall:guard',owner:'wall',index:1,kind:'wall',name:'Bất Hoại',description:'Thêm 5 lớp chặn. Một lớp miễn sát thương thành trong 0,25 giây.',situation:'Cộng dồn lớp; các đòn cùng cửa sổ chỉ tốn một lớp.'},{id:'wall:repair',owner:'wall',index:2,kind:'wall',name:'Tu Bổ',description:'Hồi 400 HP cho thành, tối đa 2.000 HP.',situation:'Chỉ xuất hiện khi thiếu ít nhất 400 HP.'}];
export const ENEMIES=[
 {name:'Bộ Binh Xương',hp:80,armor:0,damage:12,period:1.2,speed:.022},
 {name:'Tiểu Quỷ',hp:60,armor:0,damage:8,period:1,speed:.025},
 {name:'Kỵ Binh Mục',hp:120,armor:.1,damage:16,period:1.4,speed:.021},
 {name:'Thiết Giáp',hp:160,armor:.25,damage:20,period:1.8,speed:.018},
 {name:'Cự Nhân Đá',hp:260,armor:0,damage:28,period:2,speed:.018},
 {name:'Hộ Vệ Thiết Giáp',hp:2500,armor:.15,damage:80,period:2.5,speed:.014},
 {name:'Bạo Chúa Công Thành',hp:4500,armor:.2,damage:120,period:3,speed:.018},
];
export const FIELD={width:450,height:800,left:22,right:382,top:106,wall:545,H:500,W:360};
// Feet align to the four painted tower decks in the 450 × 800 background.
export const FORMATION={slots:[75,175,275,375],allyY:568,archerX:225,archerY:716,hpY:740} as const;
export const slotX=(slot:number)=>FORMATION.slots[slot];
export const GAME_VERSION='1.2.0';
export const coreId=(owner:Owner,n:number)=>owner+':'+String(n).padStart(2,'0');

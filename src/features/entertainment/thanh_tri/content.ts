import archerRows from './cores.json';
export const ELEMENTS=['metal','wood','water','fire','earth'] as const;
export type Element=typeof ELEMENTS[number];
export const ELEMENT_INFO:Record<Element,{name:string;symbol:string;color:string}>={metal:{name:'Kim',symbol:'◆',color:'#f4d27b'},wood:{name:'Mộc',symbol:'♣',color:'#91e29a'},water:{name:'Thủy',symbol:'≋',color:'#86ddff'},fire:{name:'Hỏa',symbol:'♨',color:'#ff9a73'},earth:{name:'Thổ',symbol:'▲',color:'#d9b295'}};
export const BEASTS=['thunder_bull','thunder_dragon','venom_serpent','spirit_deer','frost_fox','water_dragon','flame_tiger','phoenix','stone_rhino','black_tortoise'] as const;
export type BeastOwner=typeof BEASTS[number];
export const OWNERS=['archer',...BEASTS] as const;
export type Owner=typeof OWNERS[number];
export type Status='slow'|'burn'|'poison'|'root'|'stun'|'paralysis'|'freeze';
export type CoreGroup='damage'|'cooldown'|'critical'|'width'|'count'|'chain'|'duration'|'healing'|'pierce'|'angle'|'burning'|'shielding';
export interface Core {id:string;owner:Owner|'wall';index:number;name:string;description:string;situation:string;kind:'upgrade'|'summon'|'wall';group?:CoreGroup;requires?:Status}
export interface Fighter {name:string;skill:string;element:Element|null;range:number;cooldown:number;action:number;hitAt:number;damage:number;color:string;role:string;groups:readonly CoreGroup[]}
export const FIGHTERS:Record<Owner,Fighter>={
 archer:{name:'Cung thủ',skill:'Thủ Thành Tiễn',element:null,range:1.25,cooldown:1,action:.3,hitAt:.16,damage:100,color:'#f5cf75',groups:[],role:'100 sát thương/tên · 1 phát/giây · 30 tên · nạp 5 giây. Tất cả nguồn sát thương đều Vô hệ.'},
 thunder_bull:{name:'Trâu Sét',skill:'Lôi Liên Hoàn',element:'metal',range:.85,cooldown:4,action:.65,hitAt:.25,damage:300,color:'#f4d27b',groups:['chain','count'],role:'Sét nối tối đa 4 địch, 300 sát thương mỗi địch; tê liệt 1s. Bán kính truyền 0,20H, không giảm sát thương qua mắt xích.'},
 thunder_dragon:{name:'Rồng Sét',skill:'Thiên Lôi Giáng',element:'metal',range:.85,cooldown:7,action:.8,hitAt:.35,damage:180,color:'#c9acff',groups:['width','count'],role:'Giáng sét vào vùng đường kính 0,20W, 180 sát thương và tê liệt 1s. Các lần giáng cách nhau 0,2s, cùng điểm ngắm.'},
 venom_serpent:{name:'Rắn Độc',skill:'Độc Nha',element:'wood',range:.75,cooldown:4,action:.65,hitAt:.3,damage:40,color:'#a9e47a',groups:['duration','count'],role:'40 sát thương va chạm + 25 sát thương/giây trong 6s. Mỗi đạn tạo một lớp độc riêng, tăng thời gian giữ nguyên DPS.'},
 spirit_deer:{name:'Hươu Linh',skill:'Linh Mộc Kết Giới',element:'wood',range:.6,cooldown:6,action:.8,hitAt:.3,damage:45,color:'#a0edb6',groups:['width','healing'],role:'Vùng đường kính 0,20W: 3 nhịp ×45 sát thương, cách 0,25s. Nhịp đầu trói 1,5s. Hồi thành 20 HP một lần khi có địch trúng.'},
 frost_fox:{name:'Cáo Băng',skill:'Hàn Châm Xuyên Thấu',element:'water',range:.8,cooldown:5,action:.7,hitAt:.3,damage:200,color:'#b5ecff',groups:['pierce','count'],role:'Châm băng rộng 0,035W xuyên tối đa 2 địch, mỗi địch chịu 200 sát thương và đóng băng 1,5s. Không làm chậm sau đóng băng.'},
 water_dragon:{name:'Thủy Long',skill:'Băng Châm',element:'water',range:.85,cooldown:7,action:.8,hitAt:.4,damage:180,color:'#82d5ff',groups:['width','count'],role:'Cọc băng rơi vào vùng đường kính 0,20W, gây 180 sát thương/đợt và đóng băng 1,5s. Thêm đợt không giảm sát thương, không đẩy lùi.'},
 flame_tiger:{name:'Hổ Lửa',skill:'Hỏa Tức',element:'fire',range:.4,cooldown:5,action:1.05,hitAt:.2,damage:45,color:'#ffa06d',groups:['angle','burning'],role:'Phun nón 30°, dài 0,40H trong 0,8s: 4 nhịp ×45 sát thương và burn 20/giây trong 3s. Burn cùng nguồn làm mới, không cộng lớp.'},
 phoenix:{name:'Phượng Hoàng',skill:'Hỏa Vũ Thiên Giáng',element:'fire',range:.9,cooldown:8,action:.85,hitAt:.4,damage:180,color:'#ffc77f',groups:['width','count'],role:'180 sát thương va chạm trong vùng đường kính 0,20W. Mỗi hỏa vũ để lại vùng lửa 4s, 35 sát thương ở +1/+2/+3/+4s; các vùng cộng dồn.'},
 stone_rhino:{name:'Tê Giác Đá',skill:'Địa Chấn Xung Kích',element:'earth',range:.4,cooldown:5,action:.7,hitAt:.3,damage:220,color:'#dfb88d',groups:['width','count'],role:'220 sát thương trong hành lang dài 0,40H, rộng 0,18W; choáng 1s một lần/địch/cast. Thêm xung không tăng chiều dài.'},
 black_tortoise:{name:'Huyền Vũ',skill:'Huyền Nham Kết Giới',element:'earth',range:.65,cooldown:8,action:.85,hitAt:.4,damage:120,color:'#b7c7a7',groups:['width','shielding'],role:'Ấn đá đường kính 0,20W gây 120 sát thương. Có địch trúng thì thêm 40 HP khiên một lần/cast, cộng dồn tối đa 400.'},
};
const names:Record<CoreGroup,string>={damage:'Cường Hóa',cooldown:'Tốc Pháp',critical:'Bạo Kích',width:'Khuếch Vực',count:'Liên Pháp',chain:'Dẫn Điện',duration:'Kịch Độc',healing:'Sinh Cơ',pierce:'Băng Xuyên',angle:'Hỏa Khẩu',burning:'Dư Hỏa',shielding:'Thiết Bích'};
export const groupsFor=(owner:BeastOwner):readonly CoreGroup[]=>['damage','cooldown','critical',...FIGHTERS[owner].groups];
export function groupDescription(owner:BeastOwner,group:CoreGroup){switch(group){
 case 'damage':return '+80% sát thương kỹ năng.';
 case 'cooldown':return 'Giảm 20% hồi chiêu gốc.';
 case 'critical':return '+20% tỉ lệ chí mạng. +25% sát thương chí mạng.';
 case 'width':return '+70% bề rộng kỹ năng.';
 case 'count':return owner==='water_dragon'?'+1 đợt Băng Châm.':'+1 tia/đạn/đợt. Sát thương mỗi tia/đợt còn 70% (áp dụng một lần).';
 case 'chain':return 'Sét lan thêm 2 mục tiêu.';
 case 'duration':return '+2 giây duy trì độc.';
 case 'healing':return '+16 HP hồi thành mỗi lần dùng trúng địch.';
 case 'pierce':return 'Mỗi châm xuyên thêm 1 địch.';
 case 'angle':return '+21° góc phun lửa.';
 case 'burning':return '+80% sát thương thiêu đốt gốc.';
 case 'shielding':return '+32 khiên thành mỗi lần dùng trúng địch.';
}}
export const CORES:Core[]=[...archerRows.map(row=>({...row,owner:'archer' as const,kind:'upgrade' as const,requires:row.index===21?'slow' as const:undefined})),...BEASTS.flatMap(owner=>groupsFor(owner).flatMap((group,g)=>[1,2,3,4].map(rank=>({id:`beast:${owner}:${group}:${rank}`,owner,index:g*4+rank,group,kind:'upgrade' as const,name:`${names[group]} ${['I','II','III','IV'][rank-1]}`,description:groupDescription(owner,group),situation:''}))))];
const summonEffects:Record<BeastOwner,string>={thunder_bull:'Sét lan 4 địch, gây 300 sát thương và tê liệt 1 giây.',thunder_dragon:'Sét diện rộng: 180 sát thương và tê liệt 1 giây.',venom_serpent:'40 sát thương. Gây độc 25 sát thương/giây trong 6 giây.',spirit_deer:'3 nhịp ×45 sát thương. Trói 1,5 giây. Hồi thành 20 HP.',frost_fox:'200 sát thương, xuyên 2 địch và đóng băng 1,5 giây.',water_dragon:'Băng diện rộng: 180 sát thương và đóng băng 1,5 giây.',flame_tiger:'Phun lửa 4 nhịp ×45 sát thương. Thiêu đốt 20 sát thương/giây trong 3 giây.',phoenix:'180 sát thương. Để lại vùng lửa 35 sát thương/giây trong 4 giây.',stone_rhino:'Sóng chấn động gây 220 sát thương và choáng 1 giây.',black_tortoise:'120 sát thương diện rộng. Tạo 40 khiên thành khi trúng địch.'};
export const SUMMONS:Core[]=BEASTS.map((owner,index)=>({id:'summon:'+owner,owner,index,kind:'summon',name:'Triệu Hồi '+FIGHTERS[owner].name,description:summonEffects[owner],situation:''}));
export const WALL_CORES:Core[]=[{id:'wall:guard',owner:'wall',index:1,kind:'wall',name:'Bất Hoại',description:'+5 lớp chặn. Mỗi lớp miễn sát thương thành trong 0,25 giây.',situation:''},{id:'wall:repair',owner:'wall',index:2,kind:'wall',name:'Tu Bổ',description:'Hồi 400 HP thành (tối đa 2.000 HP).',situation:''}];
export const ENEMIES=[
 {name:'Bộ Binh Xương',hp:80,armor:0,damage:12,period:1.2,speed:.022},
 {name:'Tiểu Quỷ',hp:60,armor:0,damage:8,period:1,speed:.025},
 {name:'Kỵ Binh Mục',hp:120,armor:.1,damage:16,period:1.4,speed:.021},
 {name:'Thiết Giáp',hp:160,armor:.25,damage:20,period:1.8,speed:.018},
 {name:'Cự Nhân Đá',hp:260,armor:0,damage:28,period:2,speed:.018},
 {name:'Hộ Vệ Thiết Giáp',hp:2500,armor:.15,damage:80,period:2.5,speed:.018},
];
export const FIELD={width:450,height:800,left:22,right:382,top:106,wall:545,H:500,W:360};
export const FORMATION={slots:[75,175,275,375],allyY:568,archerX:225,archerY:716,hpY:740} as const;
export const slotX=(slot:number)=>FORMATION.slots[slot];
export const GAME_VERSION='2.0.1';
export const coreId=(owner:Owner,n:number)=>owner==='archer'?`archer:${String(n).padStart(2,'0')}`:`beast:${owner}:${groupsFor(owner)[Math.floor((n-1)/4)]}:${(n-1)%4+1}`;
export const elementLabel=(owner:Owner)=>FIGHTERS[owner].element?ELEMENT_INFO[FIGHTERS[owner].element!].name:'Vô hệ';

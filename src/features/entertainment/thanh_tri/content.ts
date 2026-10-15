import coreRows from './cores.json';

export const OWNERS = ['archer','crossbow','fire','ice','lightning','wind','earth','poison','sniper','scythe','stars'] as const;
export type Owner = typeof OWNERS[number];
export type Status = 'slow'|'burn'|'poison'|'bleed'|'hard'|'freeze';
export interface Core { id:string; owner:Owner|'wall'; index:number; name:string; description:string; situation:string; kind:'upgrade'|'summon'|'wall'; requires?:Status; ownSource?:boolean }
export interface Fighter { name:string; skill:string; range:number; cooldown:number; action:number; damage:number; color:string; role:string }
export const FIGHTERS:Record<Owner,Fighter> = {
 archer:{name:'Cung thủ',skill:'Thủ Thành Tiễn',range:1.25,cooldown:1,action:.3,damage:100,color:'#f5cf75',role:'30 tên · 1 phát/giây · nạp 5 giây'},
 crossbow:{name:'Liên Nỏ',skill:'Liên Tiễn',range:.65,cooldown:2.4,action:.4,damage:60,color:'#d3b351',role:'3 tên × 60% · đổi mục tiêu giữa loạt'},
 fire:{name:'Hỏa Pháo',skill:'Pháo Viêm Bạo',range:.85,cooldown:4,action:.5,damage:140,color:'#ff965c',role:'140% · nổ bán kính 0,10H'},
 ice:{name:'Băng Pháp Sư',skill:'Hàn Cầu',range:.55,cooldown:3.5,action:.35,damage:100,color:'#9de7ff',role:'100% · chậm 30% trong 2 giây'},
 lightning:{name:'Lôi Sư',skill:'Lôi Liên Hoàn',range:.9,cooldown:3.5,action:.35,damage:80,color:'#c6a5ff',role:'4 mắt xích · giảm 15% mỗi mắt'},
 wind:{name:'Phong Kiếm Sư',skill:'Phong Nhận Trảm',range:.35,cooldown:3.2,action:.4,damage:160,color:'#85efd3',role:'160% · quạt 70° · đẩy lùi'},
 earth:{name:'Địa Thuật Sư',skill:'Địa Mạch Chấn',range:.4,cooldown:4.5,action:.6,damage:60,color:'#e8bd7e',role:'3 xung × 60% · choáng xung đầu'},
 poison:{name:'Độc Dược Sư',skill:'Bình Độc Vân',range:.65,cooldown:4.5,action:.4,damage:60,color:'#bbe885',role:'60% va chạm · độc 25%/giây × 4 giây'},
 sniper:{name:'Thiện Xạ',skill:'Xuyên Tâm Tiễn',range:1,cooldown:4.2,action:.45,damage:330,color:'#e6edf6',role:'330% · bỏ qua 30% giáp'},
 scythe:{name:'Huyết Liêm',skill:'Hồi Liêm',range:.55,cooldown:3.5,action:.7,damage:120,color:'#f68fab',role:'120% lượt đi + 120% lượt về'},
 stars:{name:'Tinh Tượng Sư',skill:'Tam Tinh Giáng',range:.9,cooldown:5,action:.6,damage:70,color:'#aab8ff',role:'3 thiên thạch × 70% · cách nhau 0,25 giây'},
};
const needs:Partial<Record<Owner,Partial<Record<number,Status>>>>={archer:{21:'slow'},crossbow:{29:'slow'},fire:{10:'burn',11:'burn',28:'slow'},ice:{7:'hard',14:'freeze',29:'burn'},lightning:{26:'slow',27:'burn'},wind:{26:'slow',27:'burn'},earth:{26:'slow',27:'burn'},poison:{23:'slow',24:'burn',25:'burn'},sniper:{26:'slow',27:'burn'},scythe:{11:'bleed',27:'slow'},stars:{26:'slow',27:'burn'}};
export const CORES:Core[]=coreRows.map(row=>({...row,owner:row.owner as Owner,kind:'upgrade',requires:needs[row.owner as Owner]?.[row.index],ownSource:(row.owner==='ice'&&row.index===14)||(row.owner==='fire'&&row.index===11)}));
export const SUMMONS:Core[]=OWNERS.slice(1).map((owner,index)=>({id:'summon:'+owner,owner,index,kind:'summon',name:'Triệu Hồi '+FIGHTERS[owner].name,description:FIGHTERS[owner].skill+' — '+FIGHTERS[owner].role,situation:'Chọn một ô trống trên tường. Tồn tại đến hết trận.',}));
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
export const FIELD={width:450,height:800,left:22,right:382,top:106,wall:606,H:500,W:360};
export const slotX=(slot:number)=>65+slot*91;
export const coreId=(owner:Owner,n:number)=>owner+':'+String(n).padStart(2,'0');

import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';
import type { CombatWorld, EnemyEntity } from './airCombatRuntime';
import { hiveActors, type HiveHazard, type HiveHooks } from './airCombatHive';

export const HIVE_BOSS_INTERVALS = [2.4, 2, 1.6, 1.25] as const;
export const HIVE_BOSS_SKILLS = [
 {name:'Thiên La Hỏa Võng', dodge:'Luồn qua 30 nan quạt đạn, rời các tuyến pháo ở hai biên.'},
 {name:'Truy Sát Lục Điểm', dodge:'Rời hai dấu khóa quanh mỗi chiến cơ trước khi đạn nổ tỏa.'},
 {name:'Thảm Pháo Công Thành', dodge:'Luồn qua 18 cụm nổ nối tiếp, tránh đạn tỏa sau vụ nổ.'},
 {name:'Hành Lang Hủy Diệt', dodge:'Tìm hai cột trống liền nhau giữa tám tuyến pháo đã khóa.'},
 {name:'Vòng Xoáy Bầy Đàn', dodge:'Lách qua 88 viên đạn lệch góc và hai xung quanh lõi.'},
 {name:'Lưới Cắt Giao Thoa', dodge:'Rời bốn tuyến chéo, rồi tránh bốn tuyến ngang nối tiếp.'},
 {name:'Sóng Quét Lò Phản Ứng', dodge:'Đi theo khe giữa mười làn quét từ trên xuống.'},
 {name:'Bàn Cờ Tận Diệt', dodge:'Đổi ô trống giữa hai nhịp nổ của bàn cờ 24 ô.'},
 {name:'Thiên Phạt Phong Tỏa', dodge:'Vào hành lang hẹp không có cảnh báo đỏ; hai bên sân cùng bị thiêu hủy.'},
 {name:'Bầy Săn Khóa Hồn', dodge:'Sáu đạn khóa mỗi chiến cơ, bẻ lái trong 2,2 giây rồi bay thẳng; dùng mồi hoặc tàng hình để cắt khóa.'},
 {name:'Giao Điểm Tử Địa', dodge:'Vào ô giao nhau của hai hành lang trống gần vị trí vừa bị khóa.'},
] as const;

type Warn = (kind:HiveHazard['kind'],x:number,y:number,endX:number,endY:number,radius:number,delay:number,damage:number,pattern?:number,style?:number)=>void;
/** Geometry and warning deadlines are authoritative; renderers consume these same hazards. */
export function castHiveBoss(w:CombatWorld,e:EnemyEntity,actors:CombatWorld[],target:CombatWorld,hooks:HiveHooks,warn:Warn,damage:number) {
 const skill=(e.hive!.attack-1)%HIVE_BOSS_SKILLS.length,cycle=Math.floor((e.hive!.attack-1)/HIVE_BOSS_SKILLS.length);
 const shot=(angle:number,speed:number,raw:number,x=e.x,y=e.y)=>hooks.projectile(w,{owner:'enemy',x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,rawDamage:raw,radius:3.2,sourceEnemyId:e.id,sourceEnemyType:'boss',hiveAmmo:skill===4?1:0,criticalAttack:true,color:'#ffad38',lifetime:7});
 const lane=(x:number,y:number,ex:number,ey:number,r:number,delay:number,scale:number,style=1)=>warn('lane',x,y,ex,ey,r,delay*.5,damage*scale,0,style);
 const blast=(x:number,y:number,r:number,delay:number,scale:number,pattern=0,style=0)=>warn('blast',x,y,0,0,r,delay*.5,damage*scale,pattern,style);
 // Two lane capsules cover the field except one fixed, readable safe corridor.
 const corridor=(center:number,gap:number,vertical:boolean,delay:number)=>{
  const low=vertical?R.left:R.top,high=vertical?R.right:R.bottom;
  for(const [from,to] of [[low,center-gap/2],[center+gap/2,high]]){
   const radius=(to-from)/2;if(radius<=0)continue;
   const mid=(from+to)/2;
   if(vertical)warn('lane',mid,R.top,mid,R.bottom,radius,delay,damage*1.05,0,1);
   else warn('lane',R.left,mid,R.right,mid,radius,delay,damage*1.05,0,2);
  }
 };
 switch(skill){
  case 0: {
   const aim=Math.atan2(target.playerY-e.y,target.playerX-e.x);
   for(let i=0;i<30;i++)shot(aim+(i-14.5)*.08,112,damage*.42);
   for(const x of [R.left+12,R.left+42,R.right-42,R.right-12])lane(x,R.top,x,R.bottom,12,1.4,.65,0);
   break;
  }
  case 1:
   for(const [i,a] of actors.entries())for(const side of [-1,1])blast(Math.max(R.left,Math.min(R.right,a.playerX+side*28)),a.playerY,46,1.5+i*.25,.8,i);
   break;
  case 2:
   for(let row=0;row<3;row++)for(let col=0;col<6;col++)blast(R.left+R.width*(col+.5)/6,R.top+R.height*(.3+row*.25),40,1.3+row*.55,.65,0,0);
   break;
  case 3: {
   const gap=(cycle%5)*2;
   for(let i=0;i<10;i++)if(i!==gap&&i!==gap+1){const x=R.left+R.width*(i+.5)/10;lane(x,R.top,x,R.bottom,13,1.55,.95);}
   break;
  }
  case 4:
   for(let ring=0;ring<2;ring++)for(let i=0;i<44;i++)shot(i*Math.PI*2/44+cycle*.19+ring*.05,82+ring*38,damage*.3);
   for(const side of [-1,1])warn('pulse',e.x+side*42,e.y,0,0,64,.6,damage*.65,0,2);
   break;
  case 5:
   for(const offset of [0,65]){
    lane(R.left,R.top+45+offset,R.right,R.bottom-30-offset,12,1.4,.85,1);
    lane(R.right,R.top+45+offset,R.left,R.bottom-30-offset,12,1.4,.85,1);
   }
   for(const ratio of [.32,.46,.66,.8]){const y=R.top+R.height*ratio;lane(R.left,y,R.right,y,12,2.1,.7,2);}
   break;
  case 6:
   for(let i=0;i<10;i++){const y=R.top+R.height*(.16+i*.085);lane(R.left,y,R.right,y,16,1.2+i*.18,.7,2);}
   break;
  case 7:
   for(let row=0;row<4;row++)for(let col=0;col<6;col++){
    const parity=(row+col+cycle)%2;
    blast(R.left+R.width*(col+.5)/6,R.top+R.height*(.22+row*.21),43,1.5+parity*1.2,.8,0,1);
   }
   break;
  case 8:
   corridor(Math.max(R.left+42,Math.min(R.right-42,target.playerX)),64,true,.8);
   break;
  case 9:
   for(const actor of actors)warn('homing',actor.playerX,actor.playerY,0,0,24,.6,damage*.42,hiveActors(w).indexOf(actor),3);
   break;
  case 10:
   corridor(Math.max(R.left+44,Math.min(R.right-44,target.playerX)),72,true,.85);
   corridor(Math.max(R.top+48,Math.min(R.bottom-48,target.playerY)),80,false,.85);
   break;
 }
 return skill;
}

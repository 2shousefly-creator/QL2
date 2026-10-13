import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';
import type { CombatWorld, EnemyEntity } from './airCombatRuntime';
import type { HiveHazard, HiveHooks } from './airCombatHive';

export const HIVE_BOSS_INTERVALS = [4.8, 4, 3.2, 2.5] as const;
export const HIVE_BOSS_SKILLS = [
 {name:'Thiên La Hỏa Võng', dodge:'Luồn giữa các nan quạt đạn; rời hai biên đang bị pháo khóa.'},
 {name:'Truy Sát Tam Điểm', dodge:'Rời vị trí bị đánh dấu, tránh luồng đạn tỏa sau vụ nổ.'},
 {name:'Thảm Pháo Công Thành', dodge:'Đi qua khe giữa các cụm nổ nối tiếp từ trên xuống.'},
 {name:'Hành Lang Hủy Diệt', dodge:'Đọc khe trống giữa bốn tuyến pháo dọc đã khóa vị trí.'},
 {name:'Vòng Xoáy Bầy Đàn', dodge:'Lách qua các vòng đạn lệch góc, giữ khoảng cách với lõi.'},
 {name:'Lưới Cắt Giao Thoa', dodge:'Rời các tuyến chéo trước, rồi tránh tuyến ngang kích nổ sau.'},
 {name:'Sóng Quét Lò Phản Ứng', dodge:'Vượt qua tuyến vừa nổ, tránh làn quét tiếp theo từ trên xuống.'},
 {name:'Bàn Cờ Tận Diệt', dodge:'Đổi ô trống sau nhịp nổ đầu; hai màu ô nổ luân phiên.'},
] as const;

type Warn = (kind:HiveHazard['kind'],x:number,y:number,endX:number,endY:number,radius:number,delay:number,damage:number,pattern?:number,style?:number)=>void;
/** All eight casts are available at full geometry in phase one. Only cadence accelerates. */
export function castHiveBoss(w:CombatWorld,e:EnemyEntity,actors:CombatWorld[],target:CombatWorld,hooks:HiveHooks,warn:Warn,damage:number) {
 const skill=(e.hive!.attack-1)%HIVE_BOSS_SKILLS.length,cycle=Math.floor((e.hive!.attack-1)/8);
 const shot=(angle:number,speed:number,raw:number,x=e.x,y=e.y)=>hooks.projectile(w,{owner:'enemy',x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,rawDamage:raw,radius:3.2,sourceEnemyId:e.id,sourceEnemyType:'boss',hiveAmmo:skill===4?1:0,color:'#ffad38',lifetime:7});
 const lane=(x:number,y:number,ex:number,ey:number,r:number,delay:number,scale:number,style=1)=>warn('lane',x,y,ex,ey,r,delay,damage*scale,0,style);
 const blast=(x:number,y:number,r:number,delay:number,scale:number,pattern=0,style=0)=>warn('blast',x,y,0,0,r,delay,damage*scale,pattern,style);
 switch(skill){
  case 0: {
   const aim=Math.atan2(target.playerY-e.y,target.playerX-e.x);
   for(let i=-7;i<=7;i++)shot(aim+i*.16,112,damage*.42);
   for(const x of [R.left+15,R.right-15])lane(x,R.top,x,R.bottom,18,1.4,.65,0);
   break;
  }
  case 1:
   for(const [i,a] of actors.entries())blast(a.playerX,a.playerY,46,1.5+i*.25,.8,i);
   break;
  case 2:
   for(let row=0;row<3;row++)for(let col=0;col<3;col++)blast(R.left+R.width*(.17+col*.33),R.top+R.height*(.3+row*.25),40,1.3+row*.55,.65,0,0);
   break;
  case 3: {
   const gap=cycle%5;
   for(let i=0;i<5;i++)if(i!==gap){const x=R.left+R.width*(i+.5)/5;lane(x,R.top,x,R.bottom,19,1.55,.95);}
   break;
  }
  case 4:
   for(let ring=0;ring<2;ring++)for(let i=0;i<22;i++)shot(i*Math.PI*2/22+cycle*.19+ring*.10,82+ring*38,damage*.3);
   warn('pulse',e.x,e.y,0,0,74,1.2,damage*.65,0,2);
   break;
  case 5:
   lane(R.left,R.top+45,R.right,R.bottom-30,14,1.4,.85,3);
   lane(R.right,R.top+45,R.left,R.bottom-30,14,1.4,.85,3);
   for(const ratio of [.42,.72]){const y=R.top+R.height*ratio;lane(R.left,y,R.right,y,16,2.1,.7,3);}
   break;
  case 6:
   for(let i=0;i<5;i++){const y=R.top+R.height*(.22+i*.17);lane(R.left,y,R.right,y,21,1.2+i*.36,.7,2);}
   break;
  case 7:
   for(let row=0;row<4;row++)for(let col=0;col<3;col++){
    const parity=(row+col+cycle)%2;
    blast(R.left+R.width*(col+.5)/3,R.top+R.height*(.22+row*.21),43,1.5+parity*1.2,.8,0,3);
   }
 }
 return skill;
}

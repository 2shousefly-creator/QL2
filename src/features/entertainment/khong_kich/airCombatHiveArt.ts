import enemyUrl from '../../../assets/khong-kich/26.31.0/enemies.png';
import effectUrl from '../../../assets/khong-kich/26.31.0/effects.png';
import backgroundUrl from '../../../assets/khong-kich/26.31.0/background.png';
import ammoUrl from '../../../assets/khong-kich/26.31.0/ammunition.png';
import type { CombatWorld } from './airCombatRuntime';

export const HIVE_ART={enemyUrl,effectUrl,backgroundUrl,ammoUrl};
export const HIVE_ENTITY_CELLS=['swarm_needler','razor_glider','aegis_beetle','siege_spitter','signal_weaver','repair_wasp','razor_marshal','aegis_regent','bombard_prelate','disruptor_monarch','forge_matron','brood_ark','crucible_ark','hive_tyrant','stage5_fortress','stage5_core'];
export interface HiveFrame {url:string;rect:readonly number[]}
const cell=(url:string,index:number,cols=4,rows=4):HiveFrame=>({url,rect:[index%cols/cols,Math.floor(index/cols)/rows,1/cols,1/rows]});
const enemies=HIVE_ENTITY_CELLS.map((_,i)=>cell(enemyUrl,i)),ammo=Array.from({length:16},(_,i)=>cell(ammoUrl,i)),effects=Array.from({length:64},(_,i)=>cell(effectUrl,i,8,8));
const bg:HiveFrame={url:backgroundUrl,rect:[0,0,1,1]};
export interface HivePainter {
 sprite(f:HiveFrame,x:number,y:number,w:number,h:number,rotation?:number,alpha?:number,additive?:boolean):void;
 circle(x:number,y:number,radius:number,color:number,alpha:number,fill?:boolean,width?:number):void;
 line(x:number,y:number,endX:number,endY:number,width:number,color:number,alpha:number):void;
}
export const hiveArtUrls=()=>Object.values(HIVE_ART);

/** Only Hive scenery and enemies are custom; aircraft use the campaign renderer. */
export function paintHive(w:CombatWorld,p:HivePainter){
 const now=w.elapsed,scroll=(now*18)%640;
 p.sprite(bg,180,scroll+320,360,640);p.sprite(bg,180,scroll-320,360,640);
 for(const e of w.enemies){if(e.hp<=0)continue;const index=e.type==='boss'?13:HIVE_ENTITY_CELLS.indexOf(e.type);if(index<0)continue;
  const size=e.radius*2.8;p.sprite(ammo[7],e.x,e.y-size*.37,size*.23,size*.4,Math.PI,.75);
  p.sprite(enemies[index],e.x,e.y,size,size);
  if((e.hive?.shield??0)>0)p.sprite(ammo[11],e.x,e.y+e.radius*.55,size*.8,size*.35,Math.PI/2,.8);
  if((e.hive?.exposedUntil??0)>now)p.sprite(effects[40+Math.floor(now*10)%8],e.x,e.y,e.radius*.9,e.radius*.9);
  if(e.hive?.repairTarget){const t=w.enemies.find(n=>n.id===e.hive!.repairTarget);if(t&&e.stun<=0)p.line(e.x,e.y,t.x,t.y,3,0x86efac,.65);}
  if(e.stun>0)p.sprite(effects[48+Math.floor(now*12)%8],e.x,e.y,size,size,0,.7);
 }
 for(const fx of w.hive?.effects??[]){const t=(now-fx.at)/fx.duration;if(t<0||t>=1)continue;if(fx.row===1)p.sprite(ammo[10],fx.x,fx.y,fx.size,fx.size,t*Math.PI*2,Math.sin(t*Math.PI));else p.sprite(effects[fx.row*8+Math.min(7,Math.floor(t*8))],fx.x,fx.y,fx.size,fx.size);}
}

/** Keep hostile rounds and exact damage boundaries readable above aircraft VFX. */
export function paintHiveThreats(w:CombatWorld,p:HivePainter){
 const now=w.elapsed;
 for(const z of w.hive?.hazards??[]){
  if(z.cancelled)continue;
  const progress=Math.max(0,Math.min(1,(now-z.start)/Math.max(.01,z.at-z.start))),active=z.fired;
  const color=active?0xffe2a3:0xffa63d;
  if(z.kind==='lane'||z.kind==='dash'){
   p.line(z.x,z.y,z.endX,z.endY,z.radius*2,color,active?.3:.12);
   const angle=Math.atan2(z.endY-z.y,z.endX-z.x),dx=Math.sin(angle)*z.radius,dy=-Math.cos(angle)*z.radius;
   for(const side of [-1,1])p.line(z.x+side*dx,z.y+side*dy,z.endX+side*dx,z.endY+side*dy,1.5,color,.9);
   p.circle(z.x,z.y,z.radius,color,.85);p.circle(z.endX,z.endY,z.radius,color,.85);
   p.line(z.x,z.y,z.x+(z.endX-z.x)*progress,z.y+(z.endY-z.y)*progress,2,0xfff3cb,.95);
  }else{
   // The fixed outer radius is the exact AOE hitbox, independent of animation.
   p.circle(z.x,z.y,z.radius,color,active?.24:.09,true);
   p.circle(z.x,z.y,z.radius,0x190b08,.85,false,4);
   p.circle(z.x,z.y,z.radius,color,1,false,2);
   if(!active)p.circle(z.x,z.y,z.radius*progress,0xffefb2,.75,false,1.5);
   p.line(z.x-4,z.y,z.x+4,z.y,1.5,color,1);p.line(z.x,z.y-4,z.x,z.y+4,1.5,color,1);
  }
 }
 for(const shot of w.projectiles){if(shot.owner!=='enemy'||shot.lifetime<=0)continue;
  const mother=shot.sourceEnemyType==='brood_ark'||shot.sourceEnemyType==='crucible_ark';
  const size=Math.max(9,shot.radius*3)*(mother?1.5:1),rotation=Math.atan2(shot.vy,shot.vx)+Math.PI/2;
  const frame=ammo[shot.hiveAmmo??(shot.projectileKind==='bullet'?0:2)];
  p.sprite(frame,shot.x,shot.y,size*1.65,size*2.5,rotation,mother?.7:.45,true);
  p.sprite(frame,shot.x,shot.y,size,size*1.6,rotation);
  p.sprite(frame,shot.x,shot.y,size,size*1.6,rotation,mother?.95:.7,true);
 }
}

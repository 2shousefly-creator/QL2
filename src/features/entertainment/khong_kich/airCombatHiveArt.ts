import bossUrl from '../../../assets/khong-kich/26.31.1/hive-tyrant-idle.png';
import bossSkillUrl from '../../../assets/khong-kich/26.31.1/hive-boss-skills.png';
import enemyUrl from '../../../assets/khong-kich/26.31.0/enemies.png';
import effectUrl from '../../../assets/khong-kich/26.31.0/effects.png';
import backgroundUrl from '../../../assets/khong-kich/26.31.0/background.png';
import ammoUrl from '../../../assets/khong-kich/26.31.0/ammunition.png';
import explosionUrl from '../../../assets/khong-kich/26.31.0/hive-detonation-v2.png';
import type { CombatWorld } from './airCombatRuntime';
import type { HiveHazard } from './airCombatHive';

export const HIVE_ART={enemyUrl,effectUrl,backgroundUrl,ammoUrl,explosionUrl,bossUrl,bossSkillUrl};
export const HIVE_ENTITY_CELLS=['swarm_needler','razor_glider','aegis_beetle','siege_spitter','signal_weaver','repair_wasp','razor_marshal','aegis_regent','bombard_prelate','disruptor_monarch','forge_matron','brood_ark','crucible_ark','hive_tyrant','stage5_fortress','stage5_core'];
export interface HiveFrame {url:string;rect:readonly number[]}
const cell=(url:string,index:number,cols=4,rows=4):HiveFrame=>({url,rect:[index%cols/cols,Math.floor(index/cols)/rows,1/cols,1/rows]});
const enemies=HIVE_ENTITY_CELLS.map((_,i)=>cell(enemyUrl,i)),ammo=Array.from({length:16},(_,i)=>cell(ammoUrl,i)),effects=Array.from({length:64},(_,i)=>cell(effectUrl,i,8,8));
const bossFrames=Array.from({length:16},(_,i)=>cell(bossUrl,i));
const bossEffects=Array.from({length:16},(_,i)=>cell(bossSkillUrl,i));
const bg:HiveFrame={url:backgroundUrl,rect:[0,0,1,1]};
const detonations=Array.from({length:16},(_,i)=>cell(explosionUrl,i));
export interface HivePainter {
 sprite(f:HiveFrame,x:number,y:number,w:number,h:number,rotation?:number,alpha?:number,additive?:boolean):void;
 circle(x:number,y:number,radius:number,color:number,alpha:number,fill?:boolean,width?:number):void;
 line(x:number,y:number,endX:number,endY:number,width:number,color:number,alpha:number):void;
 polygon(points:number[],color:number,alpha:number,fill?:boolean,width?:number):void;
}
export const hiveArtUrls=()=>Object.values(HIVE_ART);

interface HazardShape {outline:number[];fill:number[];top:number;bottom:number}
const hazardShapes=new WeakMap<HiveHazard,HazardShape>();
function warningShape(z:HiveHazard,progress:number):HazardShape {
 let shape=hazardShapes.get(z);
 if(!shape){
  const outline:number[]=[],lane=z.kind==='lane'||z.kind==='dash';
  const arc=(x:number,y:number,start:number,sweep:number,steps:number)=>{
   for(let i=0;i<=steps;i++){const a=start+sweep*i/steps;outline.push(x+Math.cos(a)*z.radius,y+Math.sin(a)*z.radius);}
  };
  if(lane){
   const angle=Math.atan2(z.endY-z.y,z.endX-z.x);
   arc(z.x,z.y,angle+Math.PI/2,Math.PI,32);arc(z.endX,z.endY,angle-Math.PI/2,Math.PI,32);
  }else arc(z.x,z.y,0,Math.PI*2,64);
  const ys=outline.filter((_,i)=>i%2===1);
  shape={outline,fill:[],top:Math.min(...ys),bottom:Math.max(...ys)};hazardShapes.set(z,shape);
 }
 const {outline,fill,top,bottom}=shape,cut=top+(bottom-top)*progress;fill.length=0;
 if(progress<=0)return shape;
 // Circular warnings expand radially and reach the fixed rim when the cast fires.
 if(z.kind==='blast'||z.kind==='pulse'){
  for(let i=0;i<outline.length;i+=2)fill.push(z.x+(outline[i]-z.x)*progress,z.y+(outline[i+1]-z.y)*progress);
  return shape;
 }
 // Lane and dash warnings retain their top-to-bottom fill, even when diagonal.
 for(let i=0,j=outline.length-2;i<outline.length;j=i,i+=2){
  const ax=outline[j],ay=outline[j+1],bx=outline[i],by=outline[i+1];
  if((ay<=cut)!==(by<=cut))fill.push(ax+(bx-ax)*(cut-ay)/(by-ay),cut);
  if(by<=cut)fill.push(bx,by);
 }
 return shape;
}

/** Only Hive scenery and enemies are custom; aircraft use the campaign renderer. */
export function paintHive(w:CombatWorld,p:HivePainter,reduced=false){
 const now=w.elapsed,scroll=(now*18)%640;
 p.sprite(bg,180,scroll+320,360,640);p.sprite(bg,180,scroll-320,360,640);
 for(const e of w.enemies){if(e.hp<=0)continue;const index=e.type==='boss'?13:HIVE_ENTITY_CELLS.indexOf(e.type);if(index<0)continue;
  const size=e.radius*2.8;p.sprite(ammo[7],e.x,e.y-size*.37,size*.23,size*.4,Math.PI,.75);
  // A dedicated full-frame sheet prevents the wide Tyrant being cut by an enemy atlas cell.
  const boss=e.type==='boss',frame=boss?bossFrames[reduced?0:Math.floor(now*9)%16]:enemies[index];
  const bodySize=boss?Math.min(192,Math.max(160,size)):size;
  p.sprite(frame,e.x,e.y,bodySize,bodySize);
  if((e.hive?.shield??0)>0)p.sprite(ammo[11],e.x,e.y+e.radius*.55,size*.8,size*.35,Math.PI/2,.8);
  if((e.hive?.exposedUntil??0)>now)p.sprite(effects[40+Math.floor(now*10)%8],e.x,e.y,e.radius*.9,e.radius*.9);
  if(e.hive?.repairTarget){const t=w.enemies.find(n=>n.id===e.hive!.repairTarget);if(t&&e.stun<=0)p.line(e.x,e.y,t.x,t.y,3,0x86efac,.65);}
  if(e.stun>0)p.sprite(effects[48+Math.floor(now*12)%8],e.x,e.y,size,size,0,.7);
 }
 for(const fx of w.hive?.effects??[]){if(fx.blast||fx.bossStyle!==undefined||fx.row===7||fx.row===6)continue;const t=(now-fx.at)/fx.duration;if(t<0||t>=1)continue;if(fx.row===1)p.sprite(ammo[10],fx.x,fx.y,fx.size,fx.size,t*Math.PI*2,Math.sin(t*Math.PI));else p.sprite(effects[fx.row*8+Math.min(7,Math.floor(t*8))],fx.x,fx.y,fx.size,fx.size);}
}

/** Generated raster frames use the warning's diameter, never a generic impact size. */
export function paintHiveExplosions(w:CombatWorld,p:HivePainter){
 for(const fx of w.hive?.effects??[]){
  const z=fx.blast,t=(w.elapsed-fx.at)/fx.duration;if((!z&&fx.bossStyle===undefined&&fx.row!==7&&fx.row!==6)||t<0||t>=1)continue;
  const style=z?.bossStyle??fx.bossStyle;
  const frame=style===undefined?detonations[Math.min(15,Math.floor(Math.pow(t,.78)*16))]:bossEffects[style*4+Math.min(3,Math.floor(t*4))];
  const diameter=z?z.radius*2:fx.size,alpha=Math.min(1,(1-t)*4);
  const draw=(x:number,y:number)=>{
   p.sprite(frame,x,y,diameter,diameter,0,alpha);
   // A short additive ignition boosts the authored fire texture, without vector flashes.
   if(t<.26)p.sprite(frame,x,y,diameter,diameter,0,(1-t/.26)*.65,true);
  };
  if(z?.kind==='lane'){
   const length=Math.hypot(z.endX-z.x,z.endY-z.y),count=Math.max(1,Math.ceil(length/(diameter*.8)));
   for(let i=0;i<=count;i++)draw(z.x+(z.endX-z.x)*i/count,z.y+(z.endY-z.y)*i/count);
  }else draw(fx.x,fx.y);
 }
}

/** Bounded recoil on combat layers only; elapsed time naturally respects pause. */
export function hiveExplosionShake(w:CombatWorld,reduced:boolean){
 let strength=0;
 if(!reduced)for(const fx of w.hive?.effects??[]){
  const age=w.elapsed-fx.at;
  if((fx.blast||fx.row===7||fx.row===6)&&age>=0&&age<.34){
   const impulse=(fx.blast?2.4:Math.min(1.4,fx.size/50))*.5;
   strength=Math.max(strength,impulse*(1-age/.34)**2);
  }
 }
 return {x:Math.sin(w.elapsed*113)*strength,y:Math.cos(w.elapsed*97)*strength*.7};
}

/** Keep hostile rounds and exact damage boundaries readable above aircraft VFX. */
export function paintHiveThreats(w:CombatWorld,p:HivePainter){
 const now=w.elapsed;
 for(const z of w.hive?.hazards??[]){
  if(z.cancelled)continue;
  const progress=Math.max(0,Math.min(1,(now-z.start)/Math.max(.01,z.at-z.start))),active=z.fired;
  const shape=warningShape(z,active?1:progress),lane=z.kind==='lane'||z.kind==='dash';
  p.polygon(shape.outline,0xff354b,.035,true);
  p.polygon(shape.fill,0xff354b,active?.32:.24,true);
  // Halve border thickness without shrinking the actual damage footprint.
  if(!lane)p.polygon(shape.outline,0x190b08,.85,false,2);
  p.polygon(shape.outline,0xff5263,1,false,lane?.75:1);
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


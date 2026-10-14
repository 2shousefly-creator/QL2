import mantis from '../../../assets/khong-kich/26.32.0/mantis.png';
import stingerMoth from '../../../assets/khong-kich/26.32.0/stinger-moth.png';
import acidBat from '../../../assets/khong-kich/26.32.0/acid_bat.png';
import webSpider from '../../../assets/khong-kich/26.32.0/web_spider.png';
import firefly from '../../../assets/khong-kich/26.32.0/spirit_firefly.png';
import mantisLord from '../../../assets/khong-kich/26.32.0/mantis_lord.png';
import mothQueen from '../../../assets/khong-kich/26.32.0/moth_queen.png';
import batLord from '../../../assets/khong-kich/26.32.0/bat_lord.png';
import matriarch from '../../../assets/khong-kich/26.32.0/weaver_matriarch.png';
import ancient from '../../../assets/khong-kich/26.32.0/firefly_ancient.png';
import brood from '../../../assets/khong-kich/26.32.0/brood_queen.png';
import cocoon from '../../../assets/khong-kich/26.32.0/ancient_cocoon.png';
import nyxara from '../../../assets/khong-kich/26.32.0/nyxara_idle.png';
import fan from '../../../assets/khong-kich/26.32.0/nyxara_fan.png';
import slash from '../../../assets/khong-kich/26.32.0/nyxara_slash.png';
import spore from '../../../assets/khong-kich/26.32.0/nyxara_spore.png';
import phase from '../../../assets/khong-kich/26.32.0/nyxara_phase.png';
import background from '../../../assets/khong-kich/26.32.0/background.png';
import ammo from '../../../assets/khong-kich/26.32.0/ammo.png';
import explosion from '../../../assets/khong-kich/26.32.0/vfx_explosion.png';
import acid from '../../../assets/khong-kich/26.32.0/vfx_acid.png';
import pollen from '../../../assets/khong-kich/26.32.0/vfx_pollen.png';
import web from '../../../assets/khong-kich/26.32.0/vfx_web.png';
import teleport from '../../../assets/khong-kich/26.32.0/vfx_teleport.png';
import type { HiveFrame, HivePainter } from './airCombatHiveArt';
import type { CombatWorld, EnemyEntity } from './airCombatRuntime';
import type { ForestAmmo } from './airCombatForest';
import { hiveActors } from './airCombatHive';

export const FOREST_ART={mantis,stingerMoth,acidBat,webSpider,firefly,mantisLord,mothQueen,batLord,matriarch,ancient,brood,cocoon,nyxara,fan,slash,spore,phase,background,ammo,explosion,acid,pollen,web,teleport};
const cell=(url:string,n:number,cols:number,rows:number):HiveFrame=>({url,rect:[n%cols/cols,Math.floor(n/cols)/rows,1/cols,1/rows]});
const sheet=(url:string,cols:number,rows:number)=>Array.from({length:cols*rows},(_,i)=>cell(url,i,cols,rows));
const combined=sheet(stingerMoth,8,6);
export const FOREST_FRAMES:Record<string,HiveFrame[]>={
 forest_mantis:sheet(mantis,4,6),forest_stinger:Array.from({length:24},(_,i)=>combined[Math.floor(i/4)*8+i%4]),forest_fae_moth:Array.from({length:24},(_,i)=>combined[Math.floor(i/4)*8+i%4+4]),
 forest_acid_bat:sheet(acidBat,4,6),forest_web_spider:sheet(webSpider,4,6),forest_spirit_firefly:sheet(firefly,4,6),
 forest_mantis_lord:sheet(mantisLord,4,8),forest_moth_queen:sheet(mothQueen,4,8),forest_bat_lord:sheet(batLord,4,8),forest_weaver_matriarch:sheet(matriarch,4,8),forest_firefly_ancient:sheet(ancient,4,8),forest_brood_queen:sheet(brood,4,8),forest_ancient_cocoon:sheet(cocoon,4,8),
 nyxara:sheet(nyxara,4,6),fan:sheet(fan,4,6),slash:sheet(slash,4,6),spore:sheet(spore,4,6),phase:sheet(phase,4,6),
 explosion:sheet(explosion,4,4),acid:sheet(acid,4,4),pollen:sheet(pollen,4,4),web:sheet(web,4,4),teleport:sheet(teleport,4,4),ammo:sheet(ammo,4,6),
};
const bg:HiveFrame={url:background,rect:[0,0,1,1]},ammoRow:Record<ForestAmmo,number>={stinger:0,pollen:1,acid:2,web:3,slash:4,spore:5};
export const forestArtUrls=()=>Object.values(FOREST_ART);
export function forestIconFrame(id:string):HiveFrame{
 if(id==='stage6'||id==='forest_background')return bg;
 if(FOREST_FRAMES[id])return FOREST_FRAMES[id][0];
 const map:Record<string,HiveFrame>={forest_web_node:FOREST_FRAMES.web[6],forest_stinger_ammo:FOREST_FRAMES.ammo[0],forest_slash:FOREST_FRAMES.ammo[17],forest_root:FOREST_FRAMES.web[7],forest_cocoon:FOREST_FRAMES.forest_ancient_cocoon[22],forest_acid:FOREST_FRAMES.acid[6],forest_poison:FOREST_FRAMES.acid[9],forest_pollen:FOREST_FRAMES.pollen[6],forest_spore:FOREST_FRAMES.ammo[21],forest_resource_jam:FOREST_FRAMES.pollen[9],forest_silence:FOREST_FRAMES.teleport[6],forest_stun:FOREST_FRAMES.ammo[18],forest_control_resist:FOREST_FRAMES.web[12],forest_eclipse:FOREST_FRAMES.phase[16],forest_squad:FOREST_FRAMES.forest_spirit_firefly[0]};
 return map[id]??FOREST_FRAMES.nyxara[0];
}
const scrolls=new WeakMap<CombatWorld,{at:number;distance:number}>();
function creatureFrame(e:EnemyEntity,now:number):HiveFrame{
 const f=e.forest!,boss=e.type==='boss',casting=now<f.castUntil;
 if(e.type==='forest_web_node')return FOREST_FRAMES.web[Math.floor(now*10)%16];
 if(boss){
  if(now<f.phaseAt+1.6)return FOREST_FRAMES.phase[Math.min(23,Math.floor((now-f.phaseAt)/1.6*24))];
  if(casting){const frames=FOREST_FRAMES[['fan','slash','spore'][f.castKind%3]];return frames[Math.min(23,Math.floor((now-f.castAt)/Math.max(.01,f.castUntil-f.castAt)*24))];}
  return FOREST_FRAMES.nyxara[Math.floor(now*12)%24];
 }
 const frames=FOREST_FRAMES[e.type];
 if(casting)return frames[16+Math.min(frames.length-17,Math.floor((now-f.castAt)/Math.max(.01,f.castUntil-f.castAt)*(frames.length-16)))];
 return frames[Math.floor(now*12+e.id*.73)%16];
}
export function paintForest(w:CombatWorld,p:HivePainter,reduced=false){
 const now=w.elapsed;let scroll=scrolls.get(w);if(!scroll||now<scroll.at){scroll={at:now,distance:0};scrolls.set(w,scroll);}
 scroll.distance=(scroll.distance+Math.max(0,now-scroll.at)*(reduced?3:12))%1280;scroll.at=now;
 const offset=scroll.distance%640,flip=scroll.distance>=640;
 p.sprite(bg,180,320+offset,364,644,0,1,false,flip);p.sprite(bg,180,-320+offset,364,644,0,1,false,!flip);
 for(const e of w.enemies){if(e.hp<=0||!e.forest)continue;const f=e.forest,size=e.type==='boss'?180:e.radius*2.8;
  if(f.hiddenUntil>now){p.sprite(FOREST_FRAMES.teleport[Math.floor(now*14)%16],e.x,e.y,size,size,0,.5);continue;}
  p.sprite(creatureFrame(e,now),e.x,e.y,size,size,e.airframeRotation??0);
  if((e.hive?.exposedUntil??0)>now)p.sprite(FOREST_FRAMES.pollen[Math.floor(now*12)%16],e.x,e.y,e.radius*.8,e.radius*.8,0,.65,true);
  if(e.hive?.repairTarget){const other=w.enemies.find(n=>n.id===e.hive!.repairTarget&&n.hp>0);if(other&&e.stun<=0&&(e.skillLockedUntil??0)<=now){const d=Math.hypot(other.x-e.x,other.y-e.y),count=Math.min(12,Math.ceil(d/16));for(let i=0;i<count;i++){const t=(i/count+now*.4)%1;p.sprite(FOREST_FRAMES.ammo[20+Math.floor(now*8)%4],e.x+(other.x-e.x)*t,e.y+(other.y-e.y)*t,9,9,0,.7);}}}
 }
}
export function paintForestEffects(w:CombatWorld,p:HivePainter,reduced=false){
 let used=0;
 for(const fx of w.hive?.effects??[]){const t=(w.elapsed-fx.at)/fx.duration;if(t<0||t>=1)continue;
  const z=fx.blast,key=z?.forest?.ammo==='acid'?'acid':z?.forest?.ammo==='web'?'web':z?.forest?.ammo==='slash'?'teleport':z?.forest?'pollen':fx.row===0?'explosion':['explosion','acid','pollen','web','teleport'][fx.row%5];
  const frame=FOREST_FRAMES[key][Math.min(15,Math.floor(t*16))],diameter=z?Math.max(22,z.radius*2):fx.size;
  const draw=(x:number,y:number)=>{if(used++<240)p.sprite(frame,x,y,diameter,diameter,0,reduced?.65:.85);};
  if(z?.kind==='lane'){const count=Math.min(32,Math.ceil(Math.hypot(z.endX-z.x,z.endY-z.y)/Math.max(20,diameter*.8)));for(let i=0;i<=count;i++)draw(z.x+(z.endX-z.x)*i/count,z.y+(z.endY-z.y)*i/count);}else draw(fx.x,fx.y);
 }
}
export function paintForestAmmo(w:CombatWorld,p:HivePainter){
 for(const shot of w.projectiles){if(shot.owner!=='enemy'||shot.lifetime<=0)continue;const row=ammoRow[shot.forestAmmo??'stinger'],frame=FOREST_FRAMES.ammo[row*4+Math.floor(w.elapsed*12)%4],size=Math.max(10,shot.radius*3),angle=Math.atan2(shot.vy,shot.vx)-Math.PI/2;
  p.sprite(frame,shot.x,shot.y,size,size*1.35,angle);
  // Special rounds carry a second, different silhouette, not merely a tint.
  if(shot.payload)p.sprite(FOREST_FRAMES.ammo[20+Math.floor(w.elapsed*10)%4],shot.x,shot.y,size*.5,size*.5,0,.9);
 }
 for(const actor of hiveActors(w)){const s=actor.aircraft.status,now=actor.aircraft.coreState.time;if(actor.aircraft.currentHp<=0)continue;
  if((s.forestRootUntil??0)>now)p.sprite(FOREST_FRAMES.web[Math.floor(w.elapsed*12)%16],actor.playerX,actor.playerY,48,48,0,.65);
  if((s.forestStunUntil??0)>now)p.sprite(FOREST_FRAMES.ammo[16+Math.floor(w.elapsed*10)%4],actor.playerX,actor.playerY-24,18,18);
 }
}

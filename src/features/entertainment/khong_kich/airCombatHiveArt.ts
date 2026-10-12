import enemyUrl from '../../../assets/khong-kich/26.31.0/enemies.png';
import effectUrl from '../../../assets/khong-kich/26.31.0/effects.png';
import backgroundUrl from '../../../assets/khong-kich/26.31.0/background.png';
import ammoUrl from '../../../assets/khong-kich/26.31.0/ammunition.png';
import phantomBeamUrl from '../../../assets/khong-kich/26.25.0/compat/v2-phantom-firing-beam.png';
import { phantomLaserBounds,PHANTOM_LASER_VISUAL_WIDTH } from './airCombatPhantom';
import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';
import { getAmmoVisualKey } from './airCombatAmmo';
import basicUrl from '../../../assets/khong-kich/26.25.0/compat/v2-player-basic-ammo-atlas.png';
import vfxUrl from '../../../assets/khong-kich/v2/vfx-atlas.png';
import { GENERATED_ART, generatedFrameId } from './airCombatGeneratedArt';
import { TERRA_SOURCES,TERRA_FRAMES,paintTerra } from './airCombatTerraArt';
import { SYLVA_SOURCES,SYLVA_FRAMES,paintSylva,paintSylvaSeeds } from './airCombatSylvaArt';
import { ARGENT_ART,ARGENT_FRAMES,paintArgent } from './airCombatArgentArt';
import { RIPTIDE_ART,RIPTIDE_FRAMES,paintRiptide } from './airCombatRiptideArt';
import { CINDER_ART,CINDER_RASTER_SOURCES,CINDER_FRAMES,paintCinder } from './airCombatCinderArt';
import { ASTRA_ART,ASTRA_VFX_FRAMES,paintAstra } from './airCombatAstraArt';
import { RANKED_ART,RANKED_VFX_FRAMES,paintRankSkills,rankProjectileVisual } from './airCombatRankArt';
import { ULTIMATE_ART,ULTIMATE_FRAMES,paintUltimates } from './airCombatUltimateArt';
import { BIGBANG_ART,BIGBANG_FRAMES,paintBigBang } from './airCombatBigBangArt';
import { EQUIPMENT_ART,paintEquipment } from './airCombatEquipmentArt';
import { equipmentState } from './airCombatEquipmentState';
import { getPlayerHitbox } from './airCombatHitboxes';
import { activeShieldAmount } from './airCombatFeedback';
import { getBasicAmmoVisual } from './airCombatAmmo';
import { hiveActors } from './airCombatHive';
import type { CombatWorld } from './airCombatRuntime';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';

export const HIVE_ART={enemyUrl,effectUrl,backgroundUrl,ammoUrl};
export const HIVE_ENTITY_CELLS=['swarm_needler','razor_glider','aegis_beetle','siege_spitter','signal_weaver','repair_wasp','razor_marshal','aegis_regent','bombard_prelate','disruptor_monarch','forge_matron','brood_ark','crucible_ark','hive_tyrant','stage5_fortress','stage5_core'];
export interface HiveFrame {url:string;rect:readonly number[];pixels?:boolean}
const cell=(url:string,index:number,cols=4,rows=4):HiveFrame=>({url,rect:[index%cols/cols,Math.floor(index/cols)/rows,1/cols,1/rows]});
const enemies=HIVE_ENTITY_CELLS.map((_,i)=>cell(enemyUrl,i)),ammo=Array.from({length:16},(_,i)=>cell(ammoUrl,i)),effects=Array.from({length:64},(_,i)=>cell(effectUrl,i,8,8));
const bg:HiveFrame={url:backgroundUrl,rect:[0,0,1,1]};
const sources:Record<string,string>={...TERRA_SOURCES,...SYLVA_SOURCES,...CINDER_RASTER_SOURCES,
 argentVfx:ARGENT_ART.vfx,argentAircraft:ARGENT_ART.aircraft,riptideVfx:RIPTIDE_ART.vfx,riptideAircraft:RIPTIDE_ART.aircraft,
 cinderVfx:CINDER_ART.vfx,cinderProjectiles:CINDER_ART.projectiles,cinderFeedback:CINDER_ART.feedback,guardianVfx:CINDER_ART.guardianVfx,
 astraVfx:ASTRA_ART.combatVfx,astraEffects:ASTRA_ART.effects,vfx:vfxUrl,rankedVfx:RANKED_ART.vfx,rankedProjectiles:RANKED_ART.projectiles,
 ultimateVfx:ULTIMATE_ART,bigBangVfx:BIGBANG_ART,equipmentVfx:EQUIPMENT_ART.vfx,equipmentIcons:EQUIPMENT_ART.icons,basicAmmo:basicUrl};
const cached=new Map<AtlasFrame,HiveFrame>();const generated=new Map<string,HiveFrame>();
function generatedFrame(id:string):HiveFrame|undefined {let f=generated.get(id);if(f)return f;const item=GENERATED_ART.items[id]?.frames.flat;if(item){f={url:GENERATED_ART.pages[item.page].url,rect:item.rect,pixels:true};generated.set(id,f);}return f;}
function atlas(f:AtlasFrame):HiveFrame|undefined {let result=cached.get(f);if(result)return result;const id=generatedFrameId(f);result=id?generatedFrame(id):undefined;if(!result&&sources[f.atlas])result={url:sources[f.atlas],rect:f.rect};if(result)cached.set(f,result);return result;}
export interface HivePainter {sprite(f:HiveFrame,x:number,y:number,w:number,h:number,rotation?:number,alpha?:number):void;text(value:string,x:number,y:number,size:number,color:string):void}
export function hiveArtUrls(w:CombatWorld){
 const urls=new Set([enemyUrl,effectUrl,backgroundUrl,ammoUrl,basicUrl,phantomBeamUrl,...Object.values(sources)]);
 const owners=new Set(hiveActors(w).map(a=>a.aircraft.aircraftId));
 for(const page of Object.values(GENERATED_ART.pages))if(page.bundle==='shared'||[...owners].some(id=>page.bundle===`aircraft-${id}`))urls.add(page.url);
 return [...urls];
}
export function paintHive(w:CombatWorld,p:HivePainter,reduced:boolean){
 const now=w.elapsed,scroll=(now*18)%640;
 p.sprite(bg,180,scroll+320,360,640);p.sprite(bg,180,scroll-320,360,640);
 for(let i=0;i<3;i++){const y=((now*30+i*260)%850)-90;p.sprite(enemies[14],i%2?350:10,y,95,130,0,.55);}
 const line=(x:number,y:number,ex:number,ey:number,width:number,index=6,alpha=1)=>p.sprite(ammo[index],(x+ex)/2,(y+ey)/2,width,Math.hypot(ex-x,ey-y),Math.atan2(ey-y,ex-x)-Math.PI/2,alpha);
 for(const z of w.hive?.hazards??[]){const alpha=z.fired?1:.45+.25*Math.sin(now*15);
  if(z.kind==='lane'||z.kind==='dash')line(z.x,z.y,z.endX,z.endY,z.radius*2,z.fired?4:5,alpha);
  else p.sprite(effects[24+Math.floor(now*9)%8],z.x,z.y,z.radius*2,z.radius*2,0,alpha);
 }
 for(const e of w.enemies){if(e.hp<=0)continue;const index=e.type==='boss'?13:HIVE_ENTITY_CELLS.indexOf(e.type);if(index<0)continue;
  const size=e.radius*2.8;p.sprite(ammo[7],e.x,e.y-size*.37,size*.23,size*.4,Math.PI,.75);
  p.sprite(enemies[index],e.x,e.y,size,size);
  if((e.hive?.shield??0)>0)p.sprite(ammo[11],e.x,e.y+e.radius*.55,size*.8,size*.35,Math.PI/2,.8);
  if((e.hive?.exposedUntil??0)>now)p.sprite(effects[40+Math.floor(now*10)%8],e.x,e.y,e.radius*.9,e.radius*.9);
  if(e.hive?.repairTarget){const t=w.enemies.find(n=>n.id===e.hive!.repairTarget);if(t&&e.stun<=0)line(e.x,e.y,t.x,t.y,6);}
  if(e.stun>0)p.sprite(effects[48+Math.floor(now*12)%8],e.x,e.y,size,size,0,.7);
 }
 for(const actor of hiveActors(w)){
  const s=actor.aircraft,live=s.currentHp>0&&!actor.destruction;
  const draw=(f:AtlasFrame,x:number,y:number,width:number,height:number,r=0,alpha=1)=>{const frame=atlas(f);if(frame)p.sprite(frame,x,y,width,height,r,alpha);};
  if(live){const size=getPlayerHitbox(actor).size??46.92,body=generatedFrame(s.aircraftId);
   const exhaust=generatedFrame(`${s.aircraftId}_exhaust`)??ammo[s.aircraftId==='cinder'||s.aircraftId==='terra'?7:8];
   p.sprite(exhaust,actor.playerX,actor.playerY+size*.48,size*.22,size*.45,0,.8);
   if(body)p.sprite(body,actor.playerX,actor.playerY,size,size);
   if(actor.playerInvulnerability>0||activeShieldAmount(s)>0)p.sprite(effects[32+Math.floor(now*9)%8],actor.playerX,actor.playerY,size*1.5,size*1.5,0,.65);
   if(actor!==w)p.text(`AI ${w.hive!.allies.find(a=>a.world===actor)!.slot+1}`,actor.playerX,actor.playerY-size*.6,7,'#a5f3fc');
  }
  for(const d of actor.decoys){const f=generatedFrame(s.aircraftId);if(f)p.sprite(f,d.x,d.y,30,30,0,.5);}
  if(s.droneActive){const f=generatedFrame('escort_drone')??generatedFrame('phantom');if(f)p.sprite(f,actor.droneX,actor.droneY,24,24);}
  const painted=(frames:Record<string,AtlasFrame>)=>(_id:number,key:string,x:number,y:number,width:number,height:number,r:number,alpha:number)=>{if(frames[key])draw(frames[key],x,y,width,height,r,alpha);};
  paintTerra(actor,painted(TERRA_FRAMES),reduced);paintSylva(actor,painted(SYLVA_FRAMES),reduced);paintSylvaSeeds(actor,painted(SYLVA_FRAMES),reduced);
  paintArgent(actor,painted(ARGENT_FRAMES),reduced);paintRiptide(actor,painted(RIPTIDE_FRAMES),reduced);paintCinder(actor,painted(CINDER_FRAMES),reduced,(_id,text,x,y)=>p.text(text,x,y,8,'#ffcf83'));
  paintRankSkills(actor,painted(RANKED_VFX_FRAMES),reduced);paintUltimates(actor,painted(ULTIMATE_FRAMES),reduced);
  paintBigBang(actor,(_id,key,x,y,width,height,alpha)=>draw(BIGBANG_FRAMES[key],x,y,width,height,0,alpha),reduced);
  paintAstra(actor,{sprite:painted(ASTRA_VFX_FRAMES),line:(x,y,ex,ey,_color,alpha,width)=>line(x,y,ex,ey,width,4,alpha),circle:(x,y,r,_color,alpha)=>p.sprite(effects[40+Math.floor(now*10)%8],x,y,r*2,r*2,0,alpha)},reduced);
  paintEquipment(actor,(_id,f,x,y,width,height,r,alpha)=>draw(f,x,y,width,height,r,alpha),reduced,(x,y,ex,ey,_color,alpha,width)=>line(x,y,ex,ey,width,6,alpha));
  for(const warning of actor.warnings){if(warning.owner!=='player')continue;const radius=warning.radius;const f=generatedFrame(s.aircraftId==='breaker'?'gravity_anchor':'focus_laser')??effects[32+Math.floor(now*9)%8];p.sprite(f,warning.x,warning.y,radius*2,radius*2,0,.6);}
  if(live&&s.status.stunnedUntil>s.coreState.time)p.sprite(effects[48+Math.floor(now*10)%8],actor.playerX,actor.playerY,60,60);
  if(actor.laserCharge>0){const f=generatedFrame('charge')??effects[32+Math.floor(now*9)%8];p.sprite(f,actor.playerX,actor.playerY-22,45,45);}
  if(actor.laserCharge<=0&&actor.laserRemaining>0){const bounds=phantomLaserBounds(actor.playerX,actor.playerY);p.sprite({url:phantomBeamUrl,rect:[0,0,1,1]},actor.playerX,R.top+bounds.height/2,PHANTOM_LASER_VISUAL_WIDTH,bounds.height);}
  for(const shot of actor.projectiles){if(actor!==w&&shot.owner==='enemy')continue;
   let f:HiveFrame|undefined;const rank=rankProjectileVisual(shot);if(rank)f=atlas(RANKED_VFX_FRAMES[rank]);
   if(!f&&shot.owner!=='enemy'){
    const id=getAmmoVisualKey(shot)??({black_eagle:'viper_basic_ammo',breaker:'titan_basic_ammo',phantom:'phantom_basic_ammo'} as Record<string,string>)[s.aircraftId]??`${s.aircraftId}_basic_ammo`;
    f=generatedFrame(id);
    if(!f){const visual=getBasicAmmoVisual(shot.ammoVisualKey);if(visual)f={url:basicUrl,rect:[visual.cell[0]/3,0,1/3,1/2]};}
   }
   f??=ammo[shot.hiveAmmo??(shot.projectileKind==='bullet'?0:2)];
   const size=shot.projectileKind==='bullet'?Math.max(9,shot.radius*3):Math.max(18,shot.radius*3);
   p.sprite(f,shot.x,shot.y,size,size*1.6,Math.atan2(shot.vy,shot.vx)+Math.PI/2);
  }
  for(const smoke of actor.particles){if(smoke.kind!=='missile_smoke')continue;const f=generatedFrame('shared_smoke')??effects[7];p.sprite(f,smoke.x,smoke.y,smoke.size,smoke.size,0,Math.min(.4,smoke.life/smoke.maxLife));}
  for(const v of actor.visualEvents){const age=now-(v.at??now);if(age<0||age>.65)continue;
   if(v.kind==='damage_number')continue; // The shared campaign damage-label renderer owns these events.
   const row=v.kind==='aircraft_destroyed'||v.kind==='explosion'?0:v.kind==='shield_ripple'?4:7;
   p.sprite(effects[row*8+Math.min(7,Math.floor(age/.65*8))],v.x,v.y,v.size,v.size,0,1-age/.65);
  }
 }
 for(const fx of w.hive?.effects??[]){const t=(now-fx.at)/fx.duration;if(fx.row===1)p.sprite(ammo[10],fx.x,fx.y,fx.size,fx.size,t*Math.PI*2,Math.sin(t*Math.PI));else p.sprite(effects[fx.row*8+Math.min(7,Math.floor(t*8))],fx.x,fx.y,fx.size,fx.size);}
}

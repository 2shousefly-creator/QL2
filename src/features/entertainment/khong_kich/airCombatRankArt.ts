import { ULTIMATE_FRAMES } from "./airCombatUltimateArt";
import type { CombatWorld, ProjectileEntity } from "./airCombatRuntime";
import { INTERFERENCE_WAVE_THICKNESS } from "./airCombatRankRuntime";
import { skillRank } from "./airCombatSkillRanks";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import vfx from "../../../assets/khong-kich/v2/ranked-skill-vfx-atlas.svg";
import projectiles from "../../../assets/khong-kich/v2/ranked-skill-projectiles.svg";

export const RANKED_ART = { vfx, projectiles };
const cell = (index:number):AtlasFrame => ({atlas:"rankedVfx",rect:[index%4/4,Math.floor(index/4)/4,1/4,1/4]});
const shot = (index:number):AtlasFrame => ({atlas:"rankedProjectiles",rect:[index/4,0,1/4,1]});
export const RANKED_VFX_FRAMES = {
 rankDestructiveBand:{atlas:"ultimateVfx",rect:[1/4,800/896,1/4,64/896]} as AtlasFrame,rankDisintegrate:ULTIMATE_FRAMES.ultimateDisintegrate,
 rankLock:cell(0), rankLockPips:cell(1), rankMicroImpact:cell(2), rankAnchor:cell(3),
 rankAnchorRings:cell(4), rankCompression:cell(5), rankImplosion:cell(6), rankCrystal:cell(7),
 rankConvergence:cell(8), rankSignalBand:{atlas:"rankedVfx",rect:[1/4,9/16,1/4,1/8]} as AtlasFrame, rankRelay:cell(10), rankGlitch:cell(11),
 rankNoise:cell(12), rankDebris:cell(13), rankCrystalCharge:cell(14), rankInterferenceMark:cell(15),
 rankMicroMissile:shot(0), rankMicroTrail:shot(1), rankTwinShot:shot(2), rankMiniLance:shot(3),
};
export type RankVisualKey = keyof typeof RANKED_VFX_FRAMES;
export type RankSpritePainter = (id:number,key:RankVisualKey,x:number,y:number,width:number,height:number,rotation:number,alpha:number)=>void;
export function rankProjectileVisual(p:ProjectileEntity):RankVisualKey|undefined {
 if(p.skillId==="predator_lock")return "rankMicroMissile";
 if(p.skillId==="twin_reflection"&&p.twinSide!==undefined)return "rankTwinShot";
 if(p.skillId==="stellar_lance"&&p.procFree&&p.astraLance)return "rankMiniLance";
 return undefined;
}

/** Read-only sprite transforms shared by Pixi's bounded pool and Canvas fallback. */
export function paintRankSkills(w:CombatWorld,draw:RankSpritePainter,reducedMotion:boolean) {
 const r=w.rankRuntime,t=w.elapsed;
 if(r?.lock){
  const lock=r.lock,e=w.enemies.find(e=>e.id===lock.target&&e.hp>0);
  if(e){
   const threshold=skillRank(w.aircraft,"predator_lock")>=5?4:5,ratio=lock.stacks/threshold;
   const size=(e.radius+15)*2,flash=(lock.flashUntil??0)>t;
   draw(-1,"rankLock",e.x,e.y,size,size,reducedMotion?0:Math.sin(t*.8)*.08,.65+ratio*.3);
   draw(-2,"rankLockPips",e.x,e.y,size*.88,size*.88,reducedMotion?0:t*.2,.22+ratio*.78);
   if(flash)draw(-3,"rankMicroImpact",e.x,e.y,size*.8,size*.8,0,.8);
  }
 }
 if(r?.anchor){
  const a=r.anchor,radius=120*(a.rank>=2?1.25:1),mass=a.rank>=4?Math.min(4,a.affected.size*.25+a.destroyed*.1)/4:0;
  draw(-10,"rankAnchorRings",a.x,a.y,radius*2,radius*2,reducedMotion?0:t*.3,.55+mass*.4);
  draw(-11,"rankCompression",a.x,a.y,radius*1.7,radius*1.7,reducedMotion?0:-t*.45,a.rank>=3?.8:.4);
  draw(-12,"rankAnchor",a.x,a.y,48+mass*12,48+mass*12,reducedMotion?0:Math.sin(t)*.035,1);
  draw(-13,"rankCrystalCharge",a.x,a.y,42,42,0,.25+mass*.6);
  if(!reducedMotion)for(let n=0;n<8;n++){
   const progress=(t*.65+n/8)%1,angle=n*Math.PI/4+t*.25,distance=radius*(1-progress);
   draw(-20-n,"rankDebris",a.x+Math.cos(angle)*distance,a.y+Math.sin(angle)*distance,5+progress*3,7+progress*3,angle+t,Math.sin(progress*Math.PI)*.65);
  }
 }
 if(r)for(const wave of r.waves){
  const radius=wave.radius;if(radius<1)continue;
  // Tangential authored bands keep the SAME 32px wavefront as the hit annulus,
  // even near the origin. No scaled filled disk or cast-time full-screen flash.
  const segments=48,arc=2*Math.PI/segments,thickness=Math.min(INTERFERENCE_WAVE_THICKNESS,radius*2);
  for(let n=0;n<segments;n++){
   const angle=n*arc;
   draw(wave.id*128+n,wave.rank>=5&&wave.wave===2?"rankDestructiveBand":"rankSignalBand",wave.originX+Math.cos(angle)*radius,wave.originY+Math.sin(angle)*radius,
    Math.max(1,2*radius*Math.tan(arc/2)+1),thickness,angle+Math.PI/2,.85);
  }
  if(!reducedMotion)for(let n=0;n<12;n++){
   const angle=n*Math.PI/6-t*.45,distance=Math.max(0,radius-7);
   draw(wave.id*128+50+n,"rankNoise",wave.originX+Math.cos(angle)*distance,wave.originY+Math.sin(angle)*distance,18,18,angle,.55);
  }
 }
 if(r)for(const [id,i] of r.interference){
  if(i.until<=t)continue;const e=w.enemies.find(e=>e.id===id&&e.hp>0);if(!e)continue;
  draw(id*128+90,"rankInterferenceMark",e.x,e.y-e.radius-8,24,18,0,.8);
 }
 if((w.aircraft.activeEffects.twin_reflection??0)>0){
  const charge=skillRank(w.aircraft,"twin_reflection")>=4&&(r?.twinShots??0)>0&&(r?.twinShots??0)%5===0;
  for(let n=0;n<2;n++){
   const side=n===0?-1:1,x=w.playerX+side*27,y=w.playerY-12+(reducedMotion?0:Math.sin(t*3)*2);
   if(charge)draw(-42-n,"rankCrystalCharge",x,y,36,36,0,.8);
   draw(-40-n,"rankCrystal",x,y,18,31,reducedMotion?0:side*.06+Math.sin(t*2)*.03,1);
  }
 }
 for(const p of w.projectiles){
  const key=rankProjectileVisual(p);if(!key)continue;
  const angle=Math.atan2(p.vy,p.vx)+Math.PI/2,speed=Math.max(1,Math.hypot(p.vx,p.vy));
  const micro=key==="rankMicroMissile",mini=key==="rankMiniLance",empowered=!micro&&!mini&&p.radius>4;
  const width=micro?13:mini?13:empowered?12:8,height=micro?28:mini?58:empowered?38:25;
  draw(p.id*128+80,key,p.x,p.y,width,height,angle,1);
  draw(p.id*128+81,micro?"rankMicroTrail":"rankTwinShot",p.x-p.vx/speed*height*.7,p.y-p.vy/speed*height*.7,width*.75,height*(reducedMotion?.7:1.2),angle,micro?.85:.4);
 }
 // Visual events already have a bounded runtime history. IDs are recycled by the
 // renderer pool; no per-frame sprite construction, timers or retained ID sets.
 let bursts=0;
 for(let index=w.visualEvents.length-1;index>=0&&bursts<20;index--){
  const e=w.visualEvents[index];if(e.kind!=="rank_effect"||!e.rankEffect)continue;
  const age=t-(e.at??t),collapse=e.rankEffect==="anchor_collapse",duration=collapse?.62:.26;
  if(age<0||age>=duration)continue;bursts++;
  const id=-100000-e.id*4,progress=age/duration,alpha=1-progress;
  if(collapse){
   const contraction=Math.max(.06,1-age/.22);
   if(age<.22)draw(id,"rankAnchorRings",e.x,e.y,e.size*contraction,e.size*contraction,reducedMotion?0:age*2,1);
   if(age>=.16){const spread=Math.min(1,(age-.16)/.25);draw(id+1,"rankImplosion",e.x,e.y,e.size*(.2+spread*.85),e.size*(.2+spread*.85),0,alpha*1.3);}
   draw(id+2,"rankAnchor",e.x,e.y,48*contraction,48*contraction,0,alpha);
  }else{
   const key:RankVisualKey=e.rankEffect==="interference_destroy"?"rankDisintegrate":e.rankEffect==="interference_hit"?"rankGlitch":e.rankEffect==="twin_convergence"?"rankConvergence":e.rankEffect==="lock_complete"?"rankLockPips":"rankMicroImpact";
   const size=e.size*(reducedMotion?1:.8+progress*.3);
   draw(id,key,e.x,e.y,size,size,0,alpha);
  }
 }
}

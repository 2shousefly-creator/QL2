import { GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { SkillId } from "./airCombatTypes";
import { observeExpansionResource } from "./airCombatExpansion";
import { skillRank } from "./airCombatSkillRanks";
import { getEffectiveAircraftStats, getSkillRuntimeValues, endAircraftSkill } from "./airCombatAircraft";
import { expansionState, finishExpansionSkill } from "./airCombatExpansion";
export interface RankRuntimeHooks {
 hostile(w:CombatWorld,e:EnemyEntity):boolean;
 elite(e:EnemyEntity):boolean;
 priority(w:CombatWorld):EnemyEntity|null;
 projectile(w:CombatWorld,p:Partial<ProjectileEntity>&Pick<ProjectileEntity,"owner"|"x"|"y"|"vx"|"vy"|"rawDamage">):ProjectileEntity|null;
 damage(w:CombatWorld,e:EnemyEntity,raw:number,id:SkillId,procFree?:boolean):number;
 remove(w:CombatWorld,index:number):void;
 blockable(p:ProjectileEntity):boolean;
 displace(w:CombatWorld,e:EnemyEntity,x:number,y:number):void;
 effect(w:CombatWorld,x:number,y:number,size:number,effect:RankEffect):void;
}
export type RankEffect = "lock_complete" | "micro_impact" | "anchor_collapse" | "twin_convergence" | "interference_destroy" | "interference_hit";
export const INTERFERENCE_WAVE_SPEED = 720;
export const INTERFERENCE_WAVE_THICKNESS = 32;
interface Interference {until:number; movement:number; firing:number; projectile:number; waves:Set<number>;cast:number}
interface Pulse {at:number;wave:number;cast:number;rank:number}
export interface InterferenceWave {
 id:number; cast:number; wave:number; rank:number; startsAt:number;
 originX:number; originY:number; radius:number; previousRadius:number; maxRadius:number;
 energyBudget:number; hitEnemies:Set<number>; hitProjectiles:Set<number>;
 enemyDistances:Map<number,number>; projectileDistances:Map<number,number>;
}
export interface RankRuntime {
 lock?:{target:number;until:number;stacks:number;extended:number;cast:number;flashUntil?:number;killed?:boolean};
 anchor?:{x:number;y:number;until:number;next:number;rank:number;affected:Set<number>;destroyed:number;inner:Map<number,number>};
 interference:Map<number,Interference>;
 projectileSlows:Map<number,{until:number;multiplier:number}>;
 pulses:Pulse[];
 waves:InterferenceWave[];
 twinVolleys:Map<number,Map<number,{side:number;at:number;done:boolean}>>;
 twinShots:number; interferenceEnergyRestored:number;
}
export const rankRuntime=(w:CombatWorld):RankRuntime=>w.rankRuntime??={interference:new Map(),projectileSlows:new Map(),pulses:[],waves:[],twinVolleys:new Map(),twinShots:0,interferenceEnergyRestored:0};
export function beginRankSkill(w:CombatWorld,id:SkillId,h:RankRuntimeHooks) {
 const r=rankRuntime(w),rank=skillRank(w.aircraft,id),target=h.priority(w);
 if(id==="predator_lock"){r.lock=target?{target:target.id,until:w.elapsed+getSkillRuntimeValues(w.aircraft,id).duration,stacks:0,extended:0,cast:w.nextId++}:undefined;if(!r.lock)endAircraftSkill(w.aircraft,id);}
 if(id==="gravity_anchor")r.anchor={x:target?.x??w.playerX,y:target?.y??w.playerY-140,until:w.elapsed+getSkillRuntimeValues(w.aircraft,id).duration,next:w.elapsed+.5,rank,affected:new Set(),destroyed:0,inner:new Map()};
 if(id==="electronic_interference") {
  const cast=w.nextId++,times=rank>=5?[0,.8,1.6]:rank>=2?[0,1]:[0];
  const duration=times[times.length-1]+(Math.hypot(GAMEPLAY_SAFE_RECT.width,GAMEPLAY_SAFE_RECT.height)+INTERFERENCE_WAVE_THICKNESS)/INTERFERENCE_WAVE_SPEED;
  w.aircraft.activeEffects.electronic_interference=duration;
  (w.aircraft.activeEffectDurations??={}).electronic_interference=duration;
  times.forEach((delay,wave)=>{
   const scheduled:Pulse={at:w.elapsed+delay,wave,cast,rank};
   if(delay===0)emitInterferenceWave(w,scheduled);else r.pulses.push(scheduled);
  });
 }
 if(id==="twin_reflection")r.twinShots=0;
}
export function collapseAnchor(w:CombatWorld,h:RankRuntimeHooks,natural:boolean) {
 const r=rankRuntime(w),a=r.anchor;if(!a)return;
 const radius=120*(a.rank>=2?1.25:1),power=getEffectiveAircraftStats(w.aircraft).firepower;
 const mass=a.rank>=4?Math.min(4,a.affected.size*.25+a.destroyed*.10):0;
 for(const e of w.enemies)if(h.hostile(w,e)&&Math.hypot(e.x-a.x,e.y-a.y)<=radius+e.radius){
  if(natural&&a.rank>=5&&e.type!=="boss")h.displace(w,e,(a.x-e.x)*(h.elite(e)?.45:.8),(a.y-e.y)*(h.elite(e)?.45:.8));
  h.damage(w,e,power*(2.5+mass)*(a.rank>=5&&(a.inner.get(e.id)??0)>=2?1.5:1),"gravity_anchor");
 }
 h.effect(w,a.x,a.y,radius*2,"anchor_collapse");r.anchor=undefined;endAircraftSkill(w.aircraft,"gravity_anchor");
}
export function rankEnemyMovement(w:CombatWorld,e:EnemyEntity) {
 const r=rankRuntime(w),i=r.interference.get(e.id),a=r.anchor;
 return Math.min(i&&i.until>w.elapsed?i.movement:1,a&&Math.hypot(e.x-a.x,e.y-a.y)<=120*(a.rank>=2?1.25:1)?.65:1);
}
export function rankEnemyFireRate(w:CombatWorld,e:EnemyEntity) {const i=rankRuntime(w).interference.get(e.id);return i&&i.until>w.elapsed?i.firing:1;}
export function rankProjectileSpeed(w:CombatWorld,p:ProjectileEntity,h:RankRuntimeHooks) {
 if(p.owner!=="enemy"||p.allegiance==="friendly_hacked")return 1;
 const r=rankRuntime(w),i=p.sourceEnemyId===undefined?undefined:r.interference.get(p.sourceEnemyId),slow=r.projectileSlows.get(p.id),a=r.anchor;
 return Math.min(i&&i.until>w.elapsed?i.projectile:1,slow&&slow.until>w.elapsed?slow.multiplier:1,a&&h.blockable(p)&&Math.hypot(p.x-a.x,p.y-a.y)<=120*(a.rank>=2?1.25:1)?.6:1);
}
export function rankDirectMultiplier(w:CombatWorld,e:EnemyEntity,id?:SkillId) {
 const l=rankRuntime(w).lock,s=w.aircraft;
 let m=l&&l.target===e.id&&l.until>w.elapsed&&skillRank(s,"predator_lock")>=2?1.15:1;
 if(id==="predator_lock"&&skillRank(s,id)>=4&&e.hp<e.maxHp*.4)m*=1.5;
 return m;
}
export function rankArmorMultiplier(w:CombatWorld,e:EnemyEntity) {
 const until=e.expansionMarks?.gravityArmorUntil??0;
 return until>w.elapsed?1-(e.expansionMarks?.gravityArmor??0):1;
}
export function predatorBasicHit(w:CombatWorld,e:EnemyEntity,h:RankRuntimeHooks,belowThreshold:boolean) {
 const l=rankRuntime(w).lock,rank=skillRank(w.aircraft,"predator_lock");
 if(!l||l.until<=w.elapsed||l.target!==e.id||!h.hostile(w,e))return;
 l.stacks+=rank>=4&&belowThreshold?2:1;
 if(l.stacks<(rank>=5?4:5))return;l.stacks=0;l.flashUntil=w.elapsed+.22;h.effect(w,e.x,e.y,(e.radius+12)*2,"lock_complete");
 const power=getEffectiveAircraftStats(w.aircraft).firepower*(rank>=2?2.4:2);
 for(let i=0;i<(rank>=3?2:1);i++)h.projectile(w,{owner:"player",source:"skill",skillId:"predator_lock",x:w.playerX+(i?12:-12),y:w.playerY-20,vx:0,vy:-320,rawDamage:power*(i?.7:1),radius:4.5,homing:true,targetId:e.id,turnRate:8,color:"#7dd3fc",rankCast:l.cast});
}
export function rankProjectileHit(w:CombatWorld,p:ProjectileEntity,e:EnemyEntity,h:RankRuntimeHooks) {
 const r=rankRuntime(w),l=r.lock;
 if(p.skillId==="predator_lock")h.effect(w,e.x,e.y,30,"micro_impact");
 if(p.skillId==="predator_lock"&&l&&p.rankCast===l.cast&&l.target===e.id&&skillRank(w.aircraft,"predator_lock")>=5&&(h.elite(e)||e.type==="boss")){
  const extra=Math.min(.4,4-l.extended);l.extended+=extra;l.until+=extra;
 }
 if(p.twinSide!==undefined&&p.rankVolley!==undefined&&skillRank(w.aircraft,"twin_reflection")>=3){
  const volley=r.twinVolleys.get(p.rankVolley);if(!volley)return;
  const old=volley.get(e.id);
  if(old&&!old.done&&old.side!==p.twinSide&&w.elapsed-old.at<=.6){old.done=true;h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*1.2,"twin_reflection",true);h.effect(w,e.x,e.y,42,"twin_convergence");}
  else if(!old)volley.set(e.id,{side:p.twinSide,at:w.elapsed,done:false});
 }
}
export function echoTwinShot(w:CombatWorld,main:ProjectileEntity,h:RankRuntimeHooks) {
 const s=w.aircraft,r=rankRuntime(w),rank=skillRank(s,"twin_reflection");
 if(!rank||(s.activeEffects.twin_reflection??0)<=0)return;
 const empowered=rank>=4&&r.twinShots>0&&r.twinShots%5===0;r.twinShots++;
 const volley=w.nextId++;r.twinVolleys.set(volley,new Map());
 for(const side of [-1,1])h.projectile(w,{owner:"player",source:"basic",skillId:"twin_reflection",x:main.x+side*27,y:main.y+8,vx:main.vx*(empowered?1.4:1),vy:main.vy*(empowered?1.4:1),rawDamage:main.rawDamage,echoScale:(rank>=2?.30:.25)*(empowered?1.75:1),radius:empowered?4.2:2.8,penetrationRemaining:rank>=2?1:0,penetrationMultiplier:.6,color:"#fdba74",twinSide:side,rankVolley:volley,procFree:true});
}
export function tickRankSkills(w:CombatWorld,dt:number,h:RankRuntimeHooks) {
 const r=rankRuntime(w),s=w.aircraft,now=w.elapsed;
 if(r.lock){const l=r.lock,target=w.enemies.find(e=>e.id===l.target&&h.hostile(w,e));
  if(l.until<=now)r.lock=undefined;
  else if(!target){const next=l.killed&&skillRank(s,"predator_lock")>=5?h.priority(w):null;if(next){l.target=next.id;l.until+=3;l.stacks=0;l.killed=false;}else r.lock=undefined;}
  if(r.lock)s.activeEffects.predator_lock=Math.max(.001,r.lock.until-now);else endAircraftSkill(s,"predator_lock");
 }
 const a=r.anchor;
 if(a){
  s.activeEffects.gravity_anchor=Math.max(.001,a.until-now);
  const radius=120*(a.rank>=2?1.25:1),inner=radius*.3;
  for(const e of w.enemies)if(h.hostile(w,e)){
   const d=Math.hypot(e.x-a.x,e.y-a.y);if(d>radius+e.radius)continue;
   if(d<=inner) a.inner.set(e.id,(a.inner.get(e.id)??0)+dt);
   if(a.rank>=3){const m=e.expansionMarks??={};m.gravityArmorUntil=now+1.5;m.gravityArmor=d<=inner?.35:.25;}
   if(e.type!=="boss"&&d>.01){a.affected.add(e.id);const force=(a.rank>=2?40+100*(1-d/radius):35)*(h.elite(e)?.3:1)*dt,step=Math.min(d,force);h.displace(w,e,(a.x-e.x)/d*step,(a.y-e.y)/d*step);}
  }
  for(let i=w.projectiles.length-1;i>=0;i--){const p=w.projectiles[i],d=Math.hypot(p.x-a.x,p.y-a.y);if(!h.blockable(p)||d>radius)continue;
   if(a.rank>=2&&d<=inner&&a.destroyed<20){a.destroyed++;h.remove(w,i);continue;}
   if(d>0){p.vx+=(a.x-p.x)/d*24*dt;p.vy+=(a.y-p.y)/d*24*dt;}
  }
  while(a.next<=Math.min(now,a.until)+1e-8){a.next+=.5;for(const e of w.enemies)if(h.hostile(w,e)&&Math.hypot(e.x-a.x,e.y-a.y)<=radius+e.radius)h.damage(w,e,getEffectiveAircraftStats(s).firepower*.35,"gravity_anchor");}
  if(now>=a.until)collapseAnchor(w,h,true);
 }
 // Each scheduled main wave captures Phantom's position at emission.
 for(let index=r.pulses.length-1;index>=0;index--){
  const p=r.pulses[index];if(p.at>now)continue;r.pulses.splice(index,1);emitInterferenceWave(w,p);
 }
 for(let index=r.waves.length-1;index>=0;index--){
  const wave=r.waves[index];wave.previousRadius=wave.radius;
  wave.radius=Math.min(wave.maxRadius,Math.max(0,now-wave.startsAt)*INTERFERENCE_WAVE_SPEED);
  for(const e of w.enemies){
   if(!h.hostile(w,e)||wave.hitEnemies.has(e.id))continue;
   const distance=Math.hypot(e.x-wave.originX,e.y-wave.originY),previous=wave.enemyDistances.get(e.id)??distance;
   wave.enemyDistances.set(e.id,distance);
   if(!crossesWave(wave,previous,distance,e.radius))continue;
   wave.hitEnemies.add(e.id);wave.enemyDistances.delete(e.id);
   applyInterference(w,e,wave,h);
   if(wave.rank>=4&&wave.energyBudget<15){
    const budget=Math.min(5,15-wave.energyBudget);wave.energyBudget+=budget;
    const max=getEffectiveAircraftStats(s).maxResource,actual=Math.max(0,Math.min(budget,max-s.currentResource));
    s.currentResource+=actual;r.interferenceEnergyRestored+=actual;observeExpansionResource(s,max);
   }
  }
  for(let projectileIndex=w.projectiles.length-1;projectileIndex>=0;projectileIndex--){
   const bullet=w.projectiles[projectileIndex];
   if(bullet.owner!=="enemy"||bullet.allegiance==="friendly_hacked"||wave.hitProjectiles.has(bullet.id))continue;
   const distance=Math.hypot(bullet.x-wave.originX,bullet.y-wave.originY),previous=wave.projectileDistances.get(bullet.id)??Math.hypot(bullet.previousX-wave.originX,bullet.previousY-wave.originY);
   wave.projectileDistances.set(bullet.id,distance);
   if(!crossesWave(wave,previous,distance,bullet.radius))continue;
   wave.hitProjectiles.add(bullet.id);wave.projectileDistances.delete(bullet.id);
   if(wave.rank>=5&&wave.wave===2){
    if(h.blockable(bullet)){h.effect(w,bullet.x,bullet.y,26,"interference_destroy");h.remove(w,projectileIndex);}
   }else slowCrossedProjectile(w,bullet);
  }
  // Removing the wave releases all per-wave IDs, including any already-dead entities.
  if(wave.radius>=wave.maxRadius)r.waves.splice(index,1);
 }
 if(r.pulses.length||r.waves.length){
  let remaining=.001;
  for(const p of r.pulses)remaining=Math.max(remaining,p.at-now);
  for(const wave of r.waves)remaining=Math.max(remaining,(wave.maxRadius-wave.radius)/INTERFERENCE_WAVE_SPEED);
  s.activeEffects.electronic_interference=remaining;
 }else{endAircraftSkill(s,"electronic_interference");finishExpansionSkill(s,expansionState(s).casts.electronic_interference);}
 for(const [id,i] of r.interference)if(i.until<=now||!w.enemies.some(e=>e.id===id&&e.hp>0))r.interference.delete(id);
 for(const [id,i] of r.projectileSlows)if(i.until<=now||!w.projectiles.some(p=>p.id===id))r.projectileSlows.delete(id);
 for(const [id] of r.twinVolleys)if(!w.projectiles.some(p=>p.rankVolley===id))r.twinVolleys.delete(id);
}

function emitInterferenceWave(w:CombatWorld,p:Pulse) {
 const x=w.playerX,y=w.playerY,rect=GAMEPLAY_SAFE_RECT;
 const maxRadius=Math.hypot(Math.max(Math.abs(x-rect.left),Math.abs(x-rect.right)),Math.max(Math.abs(y-rect.top),Math.abs(y-rect.bottom)))+INTERFERENCE_WAVE_THICKNESS;
 rankRuntime(w).waves.push({id:w.nextId++,cast:p.cast,wave:p.wave,rank:p.rank,startsAt:p.at,originX:x,originY:y,radius:0,previousRadius:0,maxRadius,
  energyBudget:0,hitEnemies:new Set(),hitProjectiles:new Set(),enemyDistances:new Map(),projectileDistances:new Map()});
}
function crossesWave(wave:InterferenceWave,previousDistance:number,distance:number,support:number):boolean {
 const before=previousDistance-wave.previousRadius,after=distance-wave.radius,edge=INTERFERENCE_WAVE_THICKNESS/2+support;
 return Math.min(before,after)<=edge&&Math.max(before,after)>=-edge;
}
function applyInterference(w:CombatWorld,e:EnemyEntity,p:Pick<Pulse,"cast"|"wave"|"rank">,h:RankRuntimeHooks) {
 const r=rankRuntime(w),now=w.elapsed;
 let i=r.interference.get(e.id);
 if(!i||i.cast!==p.cast){i={until:now+3,movement:.75,firing:.8,projectile:.7,waves:new Set(),cast:p.cast};r.interference.set(e.id,i);}
 i.waves.add(p.wave);
 const max=p.rank>=5&&i.waves.size>=3,resonant=p.rank>=3&&i.waves.size>=2;
 Object.assign(i,{until:now+3,movement:max?.45:resonant?.6:.75,firing:max?.55:resonant?.65:.8,projectile:max?1:resonant?.5:.7});
 h.effect(w,e.x,e.y,e.radius*2+12,"interference_hit");
 h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*(p.wave===0?1:.7),"electronic_interference");
}
function slowCrossedProjectile(w:CombatWorld,bullet:ProjectileEntity) {
 const r=rankRuntime(w),emitter=bullet.sourceEnemyId===undefined?undefined:r.interference.get(bullet.sourceEnemyId);
 r.projectileSlows.set(bullet.id,{until:emitter?.until??w.elapsed+3,multiplier:emitter?.projectile??.7});
}

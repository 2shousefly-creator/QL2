import { reduceRunningSkillCooldown } from "./airCombatCooldowns";
import { statusExpiry, extendStatusRemaining } from './airCombatStatusTiming';
import type { CombatWorld, EnemyEntity } from './airCombatRuntime';
import type { AircraftCombatState, SkillId } from './airCombatTypes';
import { endAircraftSkill, getEffectiveAircraftStats, getSkillRuntimeValues } from './airCombatAircraft';
import { resolveSkillCooldown } from './airCombatStatResolvers';
import { skillRank } from './airCombatSkillRanks';
import { TERRA as T, TERRA_SKILLS as IDS, terraValues, terraPressureLimit, terraCannonDamage, type TerraSkillId } from './airCombatTerraConfig';
import { canTargetEnemy } from './airCombatTargetability';
import { celestialProtection, createAbsorbShield } from './airCombatExpansion';
import { negativeStatusDuration } from './airCombatCoreEffects';
import { applyPlayerStatus, hardControlImmune } from './airCombatStatus';
import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';

export interface TerraHooks {
 hostile(w:CombatWorld,e:EnemyEntity):boolean;
 elite(e:EnemyEntity):boolean;
 damage(w:CombatWorld,e:EnemyEntity,raw:number,id:TerraSkillId,castId:number,trueDamage:boolean,reflection?:boolean):{hp:number;total:number};
 heal(w:CombatWorld,raw:number,skillId:SkillId):number;
 displace(w:CombatWorld,e:EnemyEntity,dx:number,dy:number,knockback?:boolean):void;
 cleanse(w:CombatWorld):void;
 controlled(w:CombatWorld,e:EnemyEntity):boolean;
}
interface Cast {id:number;rank:number;at:number;until:number;cooldown:number}
interface Armor extends Cast {initial:number;reserve:number;regenerated:boolean;icd:Map<EnemyEntity,number>}
interface Cannon extends Cast {spent:number;cap:number;firepower:number;multiplier:number;halved:boolean}
interface Clamp extends Cast {x:number;y:number;firepower:number;stun:boolean;closed:boolean;cleansed:Set<EnemyEntity>}
interface Debuff {entity:EnemyEntity;rootUntil:number;stunUntil:number;suppressUntil:number;markUntil:number}
interface Shard {id:number;target:EnemyEntity;x:number;y:number;raw:number;rank:number;until:number;castId:number}
export interface TerraEffect {kind:string;x:number;y:number;at:number;life:number;size:number;height?:number;fromX?:number;fromY?:number;center?:number}
export interface TerraState {pressure:number;lastHpLoss:number;updated:number;armor?:Armor;cannon?:Cannon;clamp?:Clamp;ultimate?:Cast & {tick:number};targets:Map<number,Debuff>;shards:Shard[];effects:TerraEffect[]}
const states=new WeakMap<CombatWorld,TerraState>();
export function terraState(w:CombatWorld):TerraState {let s=states.get(w);if(!s){s={pressure:0,lastHpLoss:-Infinity,updated:w.elapsed,targets:new Map(),shards:[],effects:[]};states.set(w,s);}return s;}
const live=(w:CombatWorld)=>w.aircraft.currentHp>0&&!w.ended&&!w.destruction&&!w.aftermath;
const boss=(e:EnemyEntity)=>!e.aircraftTarget&&e.type==='boss';
const exists=(w:CombatWorld,e:EnemyEntity)=>e.hp>0&&w.enemies.includes(e);
const immune=(e:EnemyEntity)=>!!e.aircraftTarget&&celestialProtection(e.aircraftTarget.world.aircraft);
const duration=(e:EnemyEntity,n:number)=>e.aircraftTarget?negativeStatusDuration(e.aircraftTarget.world.aircraft,n):n;
const valid=(w:CombatWorld,e:EnemyEntity,h:TerraHooks)=>exists(w,e)&&h.hostile(w,e)&&canTargetEnemy(w,e)&&e.x+e.radius>=R.left&&e.x-e.radius<=R.right&&e.y+e.radius>=R.top&&e.y-e.radius<=R.bottom;
const hittable=(w:CombatWorld,e:EnemyEntity,h:TerraHooks)=>exists(w,e)&&h.hostile(w,e)&&canTargetEnemy(w,e,'untargeted')&&!immune(e);
export const terraPressureCap=(w:CombatWorld)=>terraPressureLimit(getEffectiveAircraftStats(w.aircraft).maxHp,w.aircraft.level);
export const terraKnockbackImmune=(s:AircraftCombatState)=>s.aircraftId==='terra'&&(s.coreState.timers.terraArmor??0)>s.coreState.time&&(s.coreState.stacks.terraArmorRank??0)>=3&&(s.coreState.stacks.terraReserve??0)>0;
export function terraFx(w:CombatWorld,kind:string,x=w.playerX,y=w.playerY,size=48,life=.4,at=w.elapsed){const s=terraState(w),e={kind,x,y,size,life,at};s.effects.push(e);if(s.effects.length>128)s.effects.splice(0,s.effects.length-128);return e;}
function activate(w:CombatWorld,id:TerraSkillId,c:Cast){w.aircraft.activeEffects[id]=c.until-w.elapsed;(w.aircraft.activeEffectDurations??={})[id]=c.until-c.at;}
function finish(w:CombatWorld,id:TerraSkillId,c:Cast,at=c.until){
 // End through the common lifecycle, then retain the rank/haste snapshot of this cast.
 endAircraftSkill(w.aircraft,id,c.cooldown);
 w.aircraft.cooldowns[id]=Math.max(0,(w.aircraft.cooldowns[id]??c.cooldown)-Math.max(0,w.elapsed-at));
}
function endArmor(w:CombatWorld,at=w.elapsed){const s=terraState(w),a=s.armor;if(!a)return;s.armor=undefined;delete w.aircraft.coreState.timers.terraArmor;delete w.aircraft.coreState.stacks.terraReserve;delete w.aircraft.coreState.stacks.terraArmorRank;finish(w,IDS[0],a,at);terraFx(w,'armorDissolve');}
function replenish(w:CombatWorld){const a=states.get(w)?.armor;if(!a||a.rank<5||a.regenerated||!live(w)||w.elapsed>=a.until||w.aircraft.currentHp>=getEffectiveAircraftStats(w.aircraft).maxHp*.3)return;const gain=Math.min(a.initial-a.reserve,a.initial*.2);if(gain>0){a.reserve+=gain;a.regenerated=true;w.aircraft.coreState.stacks.terraReserve=a.reserve;terraFx(w,'regenerate',w.playerX,w.playerY,75,.55);}}
/** Called once, after mitigation and full shields, before HP settlement. */
export function terraAbsorb(w:CombatWorld,remaining:number,sourceId?:number,reflection=false){
 const s=states.get(w),a=s?.armor;if(!a||!live(w)||w.elapsed>=a.until||remaining<=0)return 0;
 const absorbed=Math.min(a.reserve,remaining*terraValues(IDS[0],a.rank).absorbRatio);if(absorbed<=0)return 0;
 a.reserve-=absorbed;w.aircraft.coreState.stacks.terraReserve=a.reserve;terraFx(w,'armorHit');
 const source=w.enemies.find(e=>e.id===sourceId);
 if(!reflection&&source&&exists(w,source)&&canTargetEnemy(w,source)&&(a.icd.get(source)??-Infinity)<=w.elapsed){
  a.icd.set(source,w.elapsed+T.reflectIcd);const stats=getEffectiveAircraftStats(w.aircraft),v=terraValues(IDS[0],a.rank);
  s!.shards.push({id:w.nextId++,target:source,x:w.playerX,y:w.playerY,raw:stats.firepower*v.shardFirepower+stats.armor*v.shardArmor,rank:a.rank,until:w.elapsed+4,castId:a.id});
 }
 return absorbed;
}
/** Actual damage HP loss only: never costs, shields, max-HP changes or heal. */
export function terraIncomingHp(w:CombatWorld,hpLost:number,reflection=false){
 if(w.aircraft.aircraftId!=='terra')return;const s=terraState(w);
 if(hpLost>0){s.lastHpLoss=w.elapsed;if(!reflection)s.pressure=Math.min(terraPressureCap(w),s.pressure+hpLost*T.pressureGain);}
 if(!live(w)){cancelTerra(w);return;}replenish(w);if(s.armor&&s.armor.reserve<=0)endArmor(w);
}
export function terraCluster(w:CombatWorld,h:TerraHooks){const list=w.enemies.filter(e=>valid(w,e,h));return list.find(e=>e.id===w.playerTargetId)??list.map(e=>({e,n:list.filter(t=>Math.hypot(e.x-t.x,e.y-t.y)<=T.clampRadius).length})).sort((a,b)=>b.n-a.n||a.e.id-b.e.id)[0]?.e;}
export function terraAllowed(w:CombatWorld,id:SkillId,h:TerraHooks){return id!==IDS[2]||!!terraCluster(w,h);}
export function beginTerraSkill(w:CombatWorld,id:TerraSkillId,h:TerraHooks){
 const s=terraState(w),rank=skillRank(w.aircraft,id),v=terraValues(id,rank),stats=getEffectiveAircraftStats(w.aircraft),now=w.elapsed;
 const c:Cast={id:w.nextId++,rank,at:now,until:now+v.duration,cooldown:resolveSkillCooldown(getSkillRuntimeValues(w.aircraft,id).cooldown,stats.skillHaste,w.aircraft.coreState.deferredCooldowns[id]??1)};
 activate(w,id,c);
 if(id===IDS[0]){s.armor={...c,initial:stats.maxHp*v.reserveRatio,reserve:stats.maxHp*v.reserveRatio,regenerated:false,icd:new Map()};w.aircraft.coreState.timers.terraArmor=c.until;w.aircraft.coreState.stacks.terraArmorRank=rank;w.aircraft.coreState.stacks.terraReserve=s.armor.reserve;replenish(w);return;}
 if(id===IDS[1]){
  const cap=terraPressureCap(w),spent=Math.min(cap,s.pressure),ult=s.ultimate&&now<s.ultimate.until?s.ultimate:undefined;
  s.pressure=0;s.cannon={...c,spent,cap,firepower:stats.firepower,multiplier:ult?terraValues(IDS[3],ult.rank).cannonMultiplier:1,halved:!!ult,cooldown:c.cooldown*(ult?.5:1)};
  if(spent>0)createAbsorbShield(w.aircraft,'terraSeismic',spent*v.shieldRatio,v.shieldDuration,'terra_seismic_cannon');return;
 }
 if(id===IDS[2]){const e=terraCluster(w,h);if(e)s.clamp={...c,x:e.x,y:e.y,firepower:stats.firepower,stun:rank>=3&&s.pressure>=terraPressureCap(w)*.5,closed:false,cleansed:new Set()};return;}
 s.ultimate={...c,tick:1};w.aircraft.coreState.timers.terraUltimate=c.until;w.aircraft.coreState.stacks.terraUltimateRank=rank;
 const pending=s.cannon;
 if(pending){if(!pending.halved){pending.cooldown*=.5;pending.halved=true;}}
 else if((w.aircraft.cooldowns[IDS[1]]??0)>0){reduceRunningSkillCooldown(w.aircraft,IDS[1],(w.aircraft.cooldowns[IDS[1]]??0)*.5);}
 terraFx(w,'coreOpen',w.playerX,w.playerY,75,.6);
 if(rank>=2){h.cleanse(w);terraFx(w,'cleanse',w.playerX,w.playerY,100,.6);}
 if(rank>=3&&live(w))h.heal(w,Math.max(0,getEffectiveAircraftStats(w.aircraft).maxHp-w.aircraft.currentHp)*.25,IDS[3]);
}
function target(w:CombatWorld,e:EnemyEntity){const s=terraState(w);let d=s.targets.get(e.id);if(d?.entity!==e){d={entity:e,rootUntil:0,stunUntil:0,suppressUntil:0,markUntil:0};s.targets.set(e.id,d);}return d;}
function control(w:CombatWorld,e:EnemyEntity,seconds:number,stun:boolean,h:TerraHooks,at:number){
 const actor=e.aircraftTarget?.world;if(immune(e)||actor&&hardControlImmune(actor.aircraft))return;
 const base=seconds*(boss(e)?.5:!actor&&h.elite(e)?.75:1),d=target(w,e),until=at+duration(e,base);
 const key=stun?'stunUntil':'rootUntil';if(until>d[key])statusExpiry(d,key,at,duration(e,base));
 if(stun){d.stunUntil=Math.max(d.stunUntil,until);if(actor)applyPlayerStatus(actor.aircraft,{stun:Math.max(0,base-Math.max(0,w.elapsed-at))});else e.stun=extendStatusRemaining(e,"stun",e.stun,until-w.elapsed,w.elapsed);}
 else d.rootUntil=Math.max(d.rootUntil,until);
}
export function terraMovement(w:CombatWorld,e:EnemyEntity){const d=states.get(w)?.targets.get(e.id);return d?.entity===e&&!immune(e)&&!(e.aircraftTarget&&hardControlImmune(e.aircraftTarget.world.aircraft))&&Math.max(d.rootUntil,d.stunUntil)>w.elapsed?0:1;}
export function terraSuppression(w:CombatWorld,e:EnemyEntity){const d=states.get(w)?.targets.get(e.id);return d?.entity===e&&d.suppressUntil>w.elapsed?.8:1;}
export function clearTerraTarget(w:CombatWorld,e:EnemyEntity){const s=states.get(w);s?.targets.delete(e.id);if(s?.clamp&&w.elapsed>=s.clamp.at+T.clampTelegraph)s.clamp.cleansed.add(e);}
function fire(w:CombatWorld,c:Cannon,h:TerraHooks){
 const s=terraState(w),v=terraValues(IDS[1],c.rank),raw=terraCannonDamage(c.firepower,c.spent,c.rank,c.multiplier);
 const beam=terraFx(w,'cannon',w.playerX,w.playerY-T.cannonRange/2,T.cannonWidth,.45,c.until);Object.assign(beam,{height:T.cannonRange,center:v.centerWidth});
 for(const e of [...w.enemies]){
  const ahead=w.playerY-e.y,side=Math.abs(e.x-w.playerX);if(!hittable(w,e,h)||ahead<0||ahead>T.cannonRange||side>T.cannonWidth/2)continue;
  const center=side<=v.centerWidth/2,d=s.targets.get(e.id),marked=d?.entity===e&&d.markUntil>w.elapsed;
  const hit=h.damage(w,e,raw,IDS[1],c.id,center);
  terraFx(w,'cannonImpact',e.x,e.y,60,.4,c.until);
  if(hit.total>0&&marked){d!.markUntil=0;h.heal(w,.8*getEffectiveAircraftStats(w.aircraft).firepower,IDS[2]);Object.assign(terraFx(w,'healLink',w.playerX,w.playerY,12,.45),{fromX:e.x,fromY:e.y});}
  if(center&&c.rank>=5&&c.spent>=c.cap*.75&&hit.total>0&&e.hp>0){control(w,e,2,true,h,c.until);if(!boss(e))h.displace(w,e,0,e.aircraftTarget||!h.elite(e)?-60:-30);terraFx(w,'knockback',e.x,e.y,55,.4);}
 }
 finish(w,IDS[1],c);
}
export function tickTerra(w:CombatWorld,dt:number,h:TerraHooks){
 const s=states.get(w);if(!s)return;if(w.aircraft.aircraftId!=='terra'||!live(w)){cancelTerra(w);return;}
 const now=w.elapsed,cap=terraPressureCap(w),start=s.updated;s.updated=now;s.pressure=Math.min(cap,s.pressure);
 const u=s.ultimate;
 if(u){while(u.tick<=40&&u.at+u.tick*T.healTick<=Math.min(now,u.until)+1e-8){h.heal(w,getEffectiveAircraftStats(w.aircraft).maxHp*terraValues(IDS[3],u.rank).healPerSecond*T.healTick,IDS[3]);terraFx(w,'heal',w.playerX,w.playerY,52,.4,u.at+u.tick*T.healTick);u.tick++;}
  if(now>=u.until){s.ultimate=undefined;delete w.aircraft.coreState.timers.terraUltimate;delete w.aircraft.coreState.stacks.terraUltimateRank;finish(w,IDS[3],u);terraFx(w,'coreEnd',w.playerX,w.playerY,65,.5,u.until);}else activate(w,IDS[3],u);
 }
 const decayFrom=Math.max(start,s.lastHpLoss+T.decayDelay,u?u.until:-Infinity);
 if(now>decayFrom)s.pressure=Math.max(0,s.pressure-cap*T.decayPerSecond*(now-decayFrom));
 if(s.armor){replenish(w);if(now>=s.armor.until||s.armor.reserve<=0)endArmor(w,Math.min(now,s.armor.until));else activate(w,IDS[0],s.armor);}
 if(s.cannon){if(now>=s.cannon.until){const c=s.cannon;s.cannon=undefined;fire(w,c,h);}else activate(w,IDS[1],s.cannon);}
 const c=s.clamp;
 if(c){
  const close=c.at+T.clampTelegraph,step=Math.max(0,Math.min(now,c.until)-Math.max(start,close)),v=terraValues(IDS[2],c.rank);
  if(step>0)for(const e of w.enemies)if(hittable(w,e,h)&&!boss(e)&&!c.cleansed.has(e)&&Math.hypot(e.x-c.x,e.y-c.y)<=T.clampRadius){const dx=c.x-e.x,max=320*(c.rank>=2?1.2:1)*step;h.displace(w,e,Math.sign(dx)*Math.min(Math.abs(dx),max),0,false);}
  if(now>=c.until&&!c.closed){c.closed=true;terraFx(w,'clampImpact',c.x,c.y,190,.45,c.until);
   for(const e of [...w.enemies])if(hittable(w,e,h)&&Math.hypot(e.x-c.x,e.y-c.y)<=T.clampRadius){
    const hit=h.damage(w,e,c.firepower*v.damageMultiplier,IDS[2],c.id,false);if(hit.total<=0||e.hp<=0)continue;
    control(w,e,v.control,c.stun,h,c.until);const d=target(w,e);
    if(c.rank>=4)d.suppressUntil=statusExpiry(d,'suppressUntil',c.until,duration(e,5));if(c.rank>=5)d.markUntil=statusExpiry(d,'markUntil',c.until,duration(e,3));
   }finish(w,IDS[2],c);s.clamp=undefined;
  }else activate(w,IDS[2],c);
 }
 s.shards=s.shards.filter(p=>{const e=p.target;if(!valid(w,e,h)||now>=p.until)return false;const dx=e.x-p.x,dy=e.y-p.y,dist=Math.hypot(dx,dy),step=650*dt;
  if(dist<=step+e.radius){h.damage(w,e,p.raw*(p.rank>=4&&h.controlled(w,e)?1.25:1),IDS[0],p.castId,false,true);terraFx(w,'shardImpact',e.x,e.y,36,.3);return false;}
  p.x+=dx/dist*step;p.y+=dy/dist*step;return true;
 });
 for(const [id,d] of s.targets)if(!exists(w,d.entity)||Math.max(d.rootUntil,d.stunUntil,d.suppressUntil,d.markUntil)<=now)s.targets.delete(id);
 s.effects=s.effects.filter(e=>e.at+e.life>now);
}
export function terraHud(w:CombatWorld){if(w.aircraft.aircraftId!=='terra'||!live(w))return;const s=terraState(w);return {pressure:Math.min(s.pressure,terraPressureCap(w)),cap:terraPressureCap(w),reserve:s.armor?.reserve??0,initialReserve:s.armor?.initial??0,armorRemaining:Math.max(0,(s.armor?.until??0)-w.elapsed),windup:Math.max(0,(s.cannon?.until??0)-w.elapsed),ultimate:Math.max(0,(s.ultimate?.until??0)-w.elapsed)};}
export function cancelTerra(w:CombatWorld){const s=states.get(w);if(!s)return;states.delete(w);for(const id of IDS){delete w.aircraft.activeEffects[id];delete w.aircraft.activeEffectDurations?.[id];delete w.aircraft.coreState.deferredCooldowns[id];}for(const key of ['terraArmor','terraUltimate'])delete w.aircraft.coreState.timers[key];for(const key of ['terraReserve','terraArmorRank','terraUltimateRank'])delete w.aircraft.coreState.stacks[key];delete w.aircraft.coreState.shields.terraSeismic;}

export function terraHealingRate(w:CombatWorld,maxHp:number):number {const u=states.get(w)?.ultimate;return u&&u.until>w.elapsed&&u.tick<=40?maxHp*terraValues(IDS[3],u.rank).healPerSecond:0;}

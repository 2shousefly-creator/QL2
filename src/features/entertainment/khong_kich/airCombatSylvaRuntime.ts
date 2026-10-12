import { reduceRunningSkillCooldown } from "./airCombatCooldowns";
import { statusExpiry } from './airCombatStatusTiming';
import { terraMovement } from './airCombatTerraRuntime';
import { getHealingReceivedMultiplier } from './airCombatRecovery';
import type { CombatWorld, EnemyEntity } from './airCombatRuntime';
import type { SkillId } from './airCombatTypes';
import { endAircraftSkill, getEffectiveAircraftStats } from './airCombatAircraft';
import { skillRank } from './airCombatSkillRanks';
import { SYLVA as S, SYLVA_SKILLS, sylvaValues, type SylvaSkillId } from './airCombatSylvaConfig';
import { canTargetEnemy } from './airCombatTargetability';
import { celestialProtection } from './airCombatExpansion';
import { hardControlImmune } from './airCombatStatus';
import { negativeStatusDuration } from './airCombatCoreEffects';
import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';

export interface SylvaHooks {
 hostile(w:CombatWorld,e:EnemyEntity):boolean;
 elite(e:EnemyEntity):boolean;
 armor(w:CombatWorld,e:EnemyEntity):number;
 damage(w:CombatWorld,e:EnemyEntity,raw:number,id:SylvaSkillId,bonus?:boolean):{hp:number;total:number};
 lethal(w:CombatWorld,e:EnemyEntity,raw:number):boolean;
 heal(w:CombatWorld,raw:number,skillId:SkillId):number;
}
interface Cast {id:number;rank:number;at:number;until:number}
interface Symbiosis extends Cast {recastAt:number;capture:number;storedVitality:number}
interface Debuff {entity:EnemyEntity;flat:number;flatUntil:number;acidUntil:number;markUntil:number;markRank:number;markUsed:boolean;rootUntil:number;slowUntil:number;slow:number;suppressUntil:number;suppressMoveUntil:number}
interface Flight extends Cast {skill:'sylva_acid_burst'|'sylva_parasitic_seed';x:number;y:number;fromX:number;fromY:number;hitAt:number}
interface Zone extends Cast {x:number;y:number;next:number;initial:Set<EnemyEntity>;inside:Set<EnemyEntity>;tails:Map<EnemyEntity,{until:number;next:number}>;ended:boolean}
interface Seed {entity:EnemyEntity;recordedHpLoss:number}
interface Bloom extends Cast {seeds:Map<number,Seed>;checking:boolean}
export type SylvaEffectKind='muzzle'|'impact'|'storage'|'heal'|'acidExplosion'|'skull'|'root'|'bloom'|'tree'|'wither'|'link';
export interface SylvaEffect {kind:SylvaEffectKind;x:number;y:number;at:number;life:number;size:number;fromX?:number;fromY?:number}
export interface SylvaState {symbiosis?:Symbiosis;flights:Flight[];zones:Zone[];bloom?:Bloom;targets:Map<number,Debuff>;effects:SylvaEffect[];outgoingUntil:number}
const states=new WeakMap<CombatWorld,SylvaState>();
export function sylvaState(w:CombatWorld):SylvaState {let s=states.get(w);if(!s){s={flights:[],zones:[],targets:new Map(),effects:[],outgoingUntil:0};states.set(w,s);}return s;}
const live=(w:CombatWorld)=>w.aircraft.currentHp>0&&!w.ended&&!w.destruction&&!w.aftermath;
const exists=(w:CombatWorld,e:EnemyEntity)=>e.hp>0&&w.enemies.includes(e);
const valid=(w:CombatWorld,e:EnemyEntity,h:SylvaHooks)=>exists(w,e)&&h.hostile(w,e)&&canTargetEnemy(w,e)&&e.x+e.radius>=R.left&&e.x-e.radius<=R.right&&e.y+e.radius>=R.top&&e.y-e.radius<=R.bottom;
// Acquisition respects invisibility; an already committed area hit still connects.
const damageable=(w:CombatWorld,e:EnemyEntity,h:SylvaHooks)=>exists(w,e)&&h.hostile(w,e)&&canTargetEnemy(w,e,'untargeted');
const inside=(e:EnemyEntity,x:number,y:number,r:number)=>Math.hypot(e.x-x,e.y-y)<=r;
const boss=(e:EnemyEntity)=>!e.aircraftTarget&&e.type==='boss';
const duration=(e:EnemyEntity,n:number)=>e.aircraftTarget?negativeStatusDuration(e.aircraftTarget.world.aircraft,n):n;
const immune=(e:EnemyEntity)=>!!e.aircraftTarget&&celestialProtection(e.aircraftTarget.world.aircraft);
function target(w:CombatWorld,e:EnemyEntity){const s=sylvaState(w);let d=s.targets.get(e.id);if(d?.entity!==e){d={entity:e,flat:0,flatUntil:0,acidUntil:0,markUntil:0,markRank:0,markUsed:false,rootUntil:0,slowUntil:0,slow:1,suppressUntil:0,suppressMoveUntil:0};s.targets.set(e.id,d);}return d;}
function fx(w:CombatWorld,kind:SylvaEffectKind,x:number,y:number,size=35,life=.35,at=w.elapsed){const s=sylvaState(w);s.effects.push({kind,x,y,size,life,at});if(s.effects.length>128)s.effects.splice(0,s.effects.length-128);}
function finish(w:CombatWorld,id:SylvaSkillId,at=w.elapsed){endAircraftSkill(w.aircraft,id);w.aircraft.cooldowns[id]=Math.max(0,(w.aircraft.cooldowns[id]??0)-Math.max(0,w.elapsed-at));}
export function sylvaCurrentTarget(w:CombatWorld,h:SylvaHooks){return w.enemies.find(e=>e.id===w.playerTargetId&&valid(w,e,h));}
/** Enemy-centered density search, matching Gravity Anchor's bounded candidate convention. */
export function sylvaCluster(w:CombatWorld,h:SylvaHooks){
 const list=w.enemies.filter(e=>valid(w,e,h)),current=sylvaCurrentTarget(w,h);
 return list.map(e=>({e,count:list.filter(t=>inside(t,e.x,e.y,S.radius)).length,current:current&&inside(current,e.x,e.y,S.radius)?1:0,density:list.reduce((n,t)=>n+(inside(t,e.x,e.y,S.radius)?1-Math.hypot(t.x-e.x,t.y-e.y)/S.radius:0),0)})).sort((a,b)=>b.count-a.count||b.current-a.current||b.density-a.density||Math.hypot(a.e.x-w.playerX,a.e.y-w.playerY)-Math.hypot(b.e.x-w.playerX,b.e.y-w.playerY)||a.e.id-b.e.id)[0]?.e;
}
export function sylvaAllowed(w:CombatWorld,id:SkillId,h:SylvaHooks){return id==='sylva_deathbloom'?!!sylvaCurrentTarget(w,h):id==='sylva_acid_burst'||id==='sylva_parasitic_seed'?!!sylvaCluster(w,h):true;}
export function sylvaRecastReady(w:CombatWorld){const a=states.get(w)?.symbiosis;return !!a&&live(w)&&w.elapsed>=a.recastAt;}
export function sylvaHud(w:CombatWorld){
 const a=states.get(w)?.symbiosis;
 if(!live(w)||!a)return undefined;
 return {
  ...a,
  remaining:Math.max(0,a.until-w.elapsed),
  heal:w.aircraft.duel?.healingBlocked?0:
   (.5*getEffectiveAircraftStats(w.aircraft).firepower+a.storedVitality)*getHealingReceivedMultiplier(w.aircraft),
 };
}
export function sylvaGrayHealth(w:CombatWorld){return live(w)?states.get(w)?.symbiosis?.storedVitality??0:0;}
export function endSylvaSymbiosis(w:CombatWorld,h:SylvaHooks,at=w.elapsed){
 const s=states.get(w),a=s?.symbiosis;if(!s||!a)return;
 s.symbiosis=undefined;delete w.aircraft.coreState.timers.sylvaArmor;delete w.aircraft.coreState.stacks.sylvaSymbiosisRank;
 if(a.rank>=5)s.outgoingUntil=at+4;
 finish(w,SYLVA_SKILLS[0],at);
 if(live(w)){const healed=h.heal(w,.5*getEffectiveAircraftStats(w.aircraft).firepower+a.storedVitality,'sylva_symbiosis');if(healed>0)fx(w,'heal',w.playerX,w.playerY,72,.65,at);}
}
export function sylvaIncomingHp(w:CombatWorld,hpLost:number){
 const a=states.get(w)?.symbiosis;if(a&&hpLost>0&&w.elapsed<=a.until){a.storedVitality+=hpLost*a.capture;fx(w,'storage',w.playerX,w.playerY,24,.35);}
 if(w.aircraft.currentHp<=0)cancelSylva(w);
}
export function sylvaArmor(w:CombatWorld,e:EnemyEntity,armor:number){const d=states.get(w)?.targets.get(e.id);if(!d||d.entity!==e)return armor;const now=w.elapsed;return d.acidUntil>now||d.flatUntil>now?Math.max(0,armor*(d.acidUntil>now?.75:1)-(d.flatUntil>now?d.flat:0)):armor;}
export function sylvaOutgoing(w:CombatWorld,e:EnemyEntity){const s=states.get(w),d=s?.targets.get(e.id);return ((s?.outgoingUntil??0)>w.elapsed?1.25:1)*(d?.entity===e&&d.markUntil>w.elapsed?1+sylvaValues(SYLVA_SKILLS[2],d.markRank).amplification:1);}
export function sylvaMovement(w:CombatWorld,e:EnemyEntity){const d=states.get(w)?.targets.get(e.id);if(!d||d.entity!==e||immune(e))return terraMovement(w,e);const now=w.elapsed;if(d.rootUntil>now&&(!e.aircraftTarget||!hardControlImmune(e.aircraftTarget.world.aircraft)))return 0;return Math.min(terraMovement(w,e),d.slowUntil>now?d.slow:1,d.suppressMoveUntil>now?.5:1);}
export function sylvaFireRate(w:CombatWorld,e:EnemyEntity){const d=states.get(w)?.targets.get(e.id);return d?.entity===e&&d.suppressUntil>w.elapsed&&!immune(e)?.75:1;}
export function clearSylvaSlow(w:CombatWorld,e:EnemyEntity){const d=states.get(w)?.targets.get(e.id);if(d){d.slowUntil=0;d.slow=1;/* Suppression also slows fire, so only its movement component is cleansed. */d.suppressMoveUntil=0;} }
export function sylvaAcidHit(w:CombatWorld,e:EnemyEntity,h:SylvaHooks){
 if(w.aircraft.aircraftId!=='sylva'||!live(w)||!exists(w,e)||immune(e))return;
 const d=target(w,e),amount=1+Math.min(3,Math.floor((w.aircraft.level-1)/5));if(d.flatUntil<=w.elapsed)d.flat=0;
 const cap=boss(e)?80:!e.aircraftTarget&&h.elite(e)?120:Infinity;
 d.flat+=Math.max(0,Math.min(amount,cap-d.flat,h.armor(w,e)));d.flatUntil=statusExpiry(d,'flatUntil',w.elapsed,duration(e,5));fx(w,'impact',e.x,e.y,25,.25);
}
export function sylvaMuzzle(w:CombatWorld){if(w.aircraft.aircraftId==='sylva')fx(w,'muzzle',w.playerX,w.playerY-20,22,.13);}
function acid(w:CombatWorld,e:EnemyEntity,rank:number,h:SylvaHooks,at:number,slow:boolean){if(immune(e))return;const d=target(w,e);d.acidUntil=statusExpiry(d,'acidUntil',at,duration(e,5));if(slow&&rank>=3){d.slow=boss(e)?.9:!e.aircraftTarget&&h.elite(e)?.85:.7;d.slowUntil=statusExpiry(d,'slowUntil',at,duration(e,1));}}
function settleBloom(w:CombatWorld,at=w.elapsed){
 const s=states.get(w),a=s?.bloom;if(!s||!a||a.seeds.size)return;s.bloom=undefined;finish(w,SYLVA_SKILLS[3],at);
 if(a.rank===3&&live(w))for(const id of [SYLVA_SKILLS[1],SYLVA_SKILLS[2]]){
  if(w.aircraft.coreState.deferredCooldowns[id]!==undefined)w.aircraft.coreState.stacks[`sylvaCycle:${id}`]=(w.aircraft.coreState.stacks[`sylvaCycle:${id}`]??0)+8;
  else reduceRunningSkillCooldown(w.aircraft,id,8);
 }
}
function checkBloom(w:CombatWorld,h:SylvaHooks){
 const a=states.get(w)?.bloom;if(!a||a.checking)return;if(!live(w)&&!w.hiveHost){cancelSylva(w);return;}a.checking=true;
 try{for(const [id,seed] of a.seeds){const e=seed.entity;if(!exists(w,e)){a.seeds.delete(id);fx(w,'wither',e.x,e.y,65,.4);continue;}
  const v=sylvaValues(SYLVA_SKILLS[3],a.rank),raw=getEffectiveAircraftStats(w.aircraft).firepower*v.damageMultiplier+seed.recordedHpLoss*v.record;
  if(w.elapsed>=a.until||h.lethal(w,e,raw)){
   a.seeds.delete(id);fx(w,'tree',e.x,e.y,110,.75);h.damage(w,e,raw,SYLVA_SKILLS[3]);
  }
 }}finally{a.checking=false;}settleBloom(w,Math.min(w.elapsed,a.until));
}
/** One call at each actual HP delivery, before nested proc dispatch. */
export function sylvaDealt(w:CombatWorld,e:EnemyEntity,hp:number,total:number,id:SkillId|undefined,h:SylvaHooks,bonus=false){
 const s=states.get(w);if(!s||!live(w))return;const seed=s.bloom?.seeds.get(e.id);
 if(seed?.entity===e&&hp>0&&w.elapsed<=s.bloom!.until)seed.recordedHpLoss+=hp;
 const d=s.targets.get(e.id);
 if(!bonus&&total>0&&e.hp>0&&d?.entity===e&&d.markUntil>w.elapsed&&d.markRank===5&&!d.markUsed&&(id===SYLVA_SKILLS[1]||id===SYLVA_SKILLS[3])){
  d.markUsed=true;fx(w,'bloom',e.x,e.y,58,.4);h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*2,SYLVA_SKILLS[2],true);
 }
 checkBloom(w,h);
}
export function beginSylvaSkill(w:CombatWorld,id:SylvaSkillId,h:SylvaHooks){
 const s=sylvaState(w),rank=skillRank(w.aircraft,id),v=sylvaValues(id,rank),now=w.elapsed,c:Cast={id:w.nextId++,rank,at:now,until:now+v.duration};
 w.aircraft.activeEffects[id]=v.duration;(w.aircraft.activeEffectDurations??={})[id]=v.duration;
 if(id===SYLVA_SKILLS[0]){s.symbiosis={...c,recastAt:now+.5,capture:v.capture,storedVitality:0};w.aircraft.coreState.stacks.sylvaSymbiosisRank=rank;if(rank>=4)w.aircraft.coreState.timers.sylvaArmor=c.until;if(rank>=5)s.outgoingUntil=c.until;return;}
 if(id===SYLVA_SKILLS[3]){
  const center=sylvaCurrentTarget(w,h);if(!center){finish(w,id);return;}
  s.bloom={...c,seeds:new Map(),checking:false};
  for(const e of w.enemies)if(valid(w,e,h)&&inside(e,center.x,center.y,S.ultimateRadius)){
   s.bloom.seeds.set(e.id,{entity:e,recordedHpLoss:0});fx(w,'link',e.x,e.y,40,.4);Object.assign(s.effects[s.effects.length-1],{fromX:center.x,fromY:center.y});
   if(rank>=2&&!immune(e)){const d=target(w,e);d.suppressUntil=statusExpiry(d,'suppressUntil',now,duration(e,3));d.suppressMoveUntil=d.suppressUntil;if(e.aircraftTarget)e.aircraftTarget.world.aircraft.coreState.timers.sylvaFireSlow=d.suppressUntil;}
  }checkBloom(w,h);return;
 }
 const center=sylvaCluster(w,h);if(!center){finish(w,id);return;}
 const hitAt=now+Math.max(.12,Math.hypot(center.x-w.playerX,center.y-w.playerY)/600);
 s.flights.push({...c,skill:id,x:center.x,y:center.y,fromX:w.playerX,fromY:w.playerY,hitAt});
}
function impact(w:CombatWorld,f:Flight,h:SylvaHooks){
 const s=sylvaState(w),v=sylvaValues(f.skill,f.rank),enemies=w.enemies.filter(e=>damageable(w,e,h)&&inside(e,f.x,f.y,170));
 fx(w,f.skill===SYLVA_SKILLS[1]?'acidExplosion':'root',f.x,f.y,170,.5,f.hitAt);
 for(const e of enemies){h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*v.damageMultiplier,f.skill);if(!exists(w,e)||immune(e))continue;
  if(f.skill===SYLVA_SKILLS[1])acid(w,e,f.rank,h,f.hitAt,false);
  else {const d=target(w,e);d.markUntil=statusExpiry(d,'markUntil',f.hitAt,duration(e,5));d.markRank=f.rank;d.markUsed=false;const actor=e.aircraftTarget?.world;if(!actor||!hardControlImmune(actor.aircraft))d.rootUntil=statusExpiry(d,'rootUntil',f.hitAt,duration(e,v.root*(boss(e)?.5:!actor&&h.elite(e)?.75:1)));}
 }
 if(f.skill===SYLVA_SKILLS[1]){s.zones.push({...f,at:f.hitAt,until:f.hitAt+5,next:f.hitAt+.5,initial:new Set(enemies),inside:new Set(enemies),tails:new Map(),ended:false});fx(w,'skull',f.x,f.y,82,.95,f.hitAt);}
 else finish(w,f.skill,f.hitAt);
 checkBloom(w,h);
}
export function tickSylva(w:CombatWorld,dt:number,h:SylvaHooks){
 const s=states.get(w);if(!s)return;if(!live(w)&&!w.hiveHost){cancelSylva(w);return;}const now=w.elapsed;
 if(!live(w))s.symbiosis=undefined;
 if(s.symbiosis){if(now>=s.symbiosis.until)endSylvaSymbiosis(w,h,s.symbiosis.until);else w.aircraft.activeEffects[SYLVA_SKILLS[0]]=s.symbiosis.until-now;}
 const arrived=s.flights.filter(f=>f.hitAt<=now);s.flights=s.flights.filter(f=>f.hitAt>now);for(const f of arrived)impact(w,f,h);
 for(const z of s.zones){
  const present=new Set(w.enemies.filter(e=>damageable(w,e,h)&&inside(e,z.x,z.y,170)&&now<=z.until));
  for(const e of present){acid(w,e,z.rank,h,Math.min(now,z.until),true);z.tails.delete(e);}
  if(z.rank>=5)for(const e of z.inside)if(!present.has(e)&&z.initial.has(e)&&exists(w,e)&&!z.tails.has(e)){const at=Math.min(now,z.until);z.tails.set(e,{until:at+2,next:at+.5});}
  while(z.next<=Math.min(now,z.until)+1e-8){
   for(const e of w.enemies)if(damageable(w,e,h)&&inside(e,z.x,z.y,170)){
    acid(w,e,z.rank,h,z.next,true);h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*sylvaValues(SYLVA_SKILLS[1],z.rank).dps*.5,SYLVA_SKILLS[1]);
   }z.next+=.5;
  }
  z.inside=present;
  if(now>=z.until&&!z.ended){z.ended=true;finish(w,SYLVA_SKILLS[1],z.until);if(z.rank>=5)for(const e of present)if(z.initial.has(e)&&exists(w,e))z.tails.set(e,{until:z.until+2,next:z.until+.5});z.inside.clear();}
  for(const [e,tail] of z.tails){if(!exists(w,e)){z.tails.delete(e);continue;}while(tail.next<=Math.min(now,tail.until)+1e-8){acid(w,e,z.rank,h,tail.next,false);h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*sylvaValues(SYLVA_SKILLS[1],z.rank).dps*.5,SYLVA_SKILLS[1]);tail.next+=.5;}if(now>=tail.until)z.tails.delete(e);}
  if(!z.ended)w.aircraft.activeEffects[SYLVA_SKILLS[1]]=Math.max(.00001,z.until-now);
 }
 s.zones=s.zones.filter(z=>!z.ended||z.tails.size>0);checkBloom(w,h);
 if(s.bloom)w.aircraft.activeEffects[SYLVA_SKILLS[3]]=Math.max(.00001,s.bloom.until-now);
 for(const [id,d] of s.targets)if(!exists(w,d.entity)||Math.max(d.flatUntil,d.acidUntil,d.markUntil,d.rootUntil,d.slowUntil,d.suppressUntil)<=now)s.targets.delete(id);
 s.effects=s.effects.filter(e=>e.at+e.life>now);
}
/** Remove hostile effects at their owner without detonating the retired seed. */
export function clearSylvaTarget(w:CombatWorld,e:EnemyEntity){
 const s=states.get(w);if(!s)return;s.targets.delete(e.id);
 for(const z of s.zones){z.tails.delete(e);z.inside.delete(e);z.initial.delete(e);}
 const seed=s.bloom?.seeds.get(e.id);if(seed?.entity===e){s.bloom!.seeds.delete(e.id);fx(w,'wither',e.x,e.y,65,.5);settleBloom(w);}
 if(e.aircraftTarget)delete e.aircraftTarget.world.aircraft.coreState.timers.sylvaFireSlow;
}
export function cancelSylva(w:CombatWorld){
 const s=states.get(w);if(!s)return;
 for(const seed of s.bloom?.seeds.values()??[])fx(w,'wither',seed.entity.x,seed.entity.y,65,.35);
 for(const d of s.targets.values())if(d.entity.aircraftTarget){const c=d.entity.aircraftTarget.world.aircraft.coreState;if(c.timers.sylvaFireSlow===d.suppressUntil)delete c.timers.sylvaFireSlow;}s.targets.clear();
 s.symbiosis=undefined;s.bloom=undefined;s.flights=[];s.zones=[];s.outgoingUntil=0;
 delete w.aircraft.coreState.timers.sylvaArmor;delete w.aircraft.coreState.stacks.sylvaSymbiosisRank;
 for(const id of SYLVA_SKILLS){delete w.aircraft.activeEffects[id];delete w.aircraft.activeEffectDurations?.[id];delete w.aircraft.coreState.deferredCooldowns[id];delete w.aircraft.coreState.stacks[`sylvaCycle:${id}`];}
 s.effects=s.effects.filter(e=>e.kind==='wither'&&e.at+e.life>w.elapsed);
}

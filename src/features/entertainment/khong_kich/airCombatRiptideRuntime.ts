import type { CombatWorld, EnemyEntity } from './airCombatRuntime';
import type { SkillId } from './airCombatTypes';
import { endAircraftSkill, getEffectiveAircraftStats } from './airCombatAircraft';
import { RIPTIDE, RIPTIDE_SKILLS, riptideValues, type RiptideSkillId } from './airCombatRiptideConfig';
import { skillRank } from './airCombatSkillRanks';
import { passiveTier } from './airCombatPassives';
import { circleVsAircraft, getEnemyHitbox, getPlayerHitbox, segmentVsAircraft, createHitResult } from './airCombatHitboxes';
import { AIR_COMBAT_WORLD, GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';
import { celestialProtection } from './airCombatExpansion';
import { negativeStatusDuration } from './airCombatCoreEffects';

export interface RiptideHooks {
 hostile(w:CombatWorld,e:EnemyEntity):boolean;
 elite(e:EnemyEntity):boolean;
 damage(w:CombatWorld,e:EnemyEntity,raw:number,skill:RiptideSkillId|undefined,castId:number):{hp:number;total:number};
 heal(w:CombatWorld,raw:number,skillId:SkillId):number;
 displace(w:CombatWorld,e:EnemyEntity,dx:number,dy:number):void;
 cleanseSlow(w:CombatWorld):void;
}
interface Cast { id:number; rank:number; at:number; until:number }
interface Blades extends Cast { x:number;y:number;previous:number;hits:[Set<number>,Set<number>];refund:number;positions:Map<number,{x:number;y:number}> }
export interface Waterform extends Cast { tick:number;charge:number;healed:number }
export interface RiptideEffect { id:number;kind:'heal'|'cleanse'|'impact'|'burst'|'afterwash'|'refund'|'pulse'|'leech';x:number;y:number;at:number;life:number;radius:number;strength:number }
export interface RiptideRuntime {
 wellspring?:Cast & {tick:number}; blades?:Blades; confluence?:Cast & {exploded:boolean}; waterform?:Waterform;
 slows:Map<number,{entity:EnemyEntity;sources:Map<SkillId,{until:number;multiplier:number;duration:number}>}>;
 effects:RiptideEffect[];
}
const states=new WeakMap<CombatWorld,RiptideRuntime>();
export function riptideState(w:CombatWorld):RiptideRuntime {
 let s=states.get(w);if(!s){s={slows:new Map(),effects:[]};states.set(w,s);}return s;
}
function fx(w:CombatWorld,kind:RiptideEffect['kind'],x:number,y:number,radius:number,strength=1,life=.4) {
 const s=riptideState(w);s.effects.push({id:w.nextId++,kind,x,y,radius,strength,at:w.elapsed,life});
 if(s.effects.length>64)s.effects.splice(0,s.effects.length-64);
}
function valid(w:CombatWorld,e:EnemyEntity,h:RiptideHooks) {
 return w.aircraft.currentHp>0&&!w.destruction&&!w.aftermath&&e.hp>0&&h.hostile(w,e)&&e.x+e.radius>=0&&e.x-e.radius<=AIR_COMBAT_WORLD.width&&e.y+e.radius>=R.top&&e.y-e.radius<=R.bottom;
}
const within=(w:CombatWorld,e:EnemyEntity,r:number)=>circleVsAircraft(w.playerX,w.playerY,r,getEnemyHitbox(e));
function damage(w:CombatWorld,e:EnemyEntity,ratio:number,id:RiptideSkillId,c:Cast,h:RiptideHooks) {
 return h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*ratio,id,c.id);
}
function slow(w:CombatWorld,e:EnemyEntity,id:SkillId,amount:number,h:RiptideHooks) {
 const actor=e.aircraftTarget?.world;
 if(actor&&(celestialProtection(actor.aircraft)||(skillRank(actor.aircraft,'afterburner')>=5&&(actor.aircraft.activeEffects.afterburner??0)>0)))return;
 const s=riptideState(w);let t=s.slows.get(e.id);
 if(!t||t.entity!==e){t={entity:e,sources:new Map()};s.slows.set(e.id,t);}
 t.sources.set(id,{until:w.elapsed+(actor?negativeStatusDuration(actor.aircraft,2):2),multiplier:1-amount,duration:actor?negativeStatusDuration(actor.aircraft,2):2});
}
export function riptideMovement(w:CombatWorld,e:EnemyEntity) {
 const t=states.get(w)?.slows.get(e.id);return t?.entity===e?Math.min(1,...[...t.sources.values()].filter(s=>s.until>w.elapsed).map(s=>s.multiplier)):1;
}
export function clearRiptideSlow(w:CombatWorld,e:EnemyEntity){states.get(w)?.slows.delete(e.id);}
/** Source identity is evaluated in the defender's coordinate frame at damage time.
 * The independent S1/S3 factors multiply: .75 * .75, never additive DR. */
export function riptideIncoming(w:CombatWorld,sourceId?:number) {
 const s=states.get(w);if(!s)return 1;
 let factor=s.wellspring&&s.wellspring.rank>=4&&w.elapsed<s.wellspring.until?.75:1;
 const c=s.confluence,e=sourceId===undefined?undefined:w.enemies.find(e=>e.id===sourceId);
 if(c&&c.rank>=4&&w.elapsed<c.until&&e&&within(w,e,RIPTIDE.confluenceRadius))factor*=.75;
 return factor;
}
export function riptideSuppressed(w:CombatWorld,e:EnemyEntity) {
 const c=states.get(w)?.confluence;return !!c&&c.rank>=4&&w.elapsed<c.until&&within(w,e,RIPTIDE.confluenceRadius);
}
export const riptideRecastReady=(w:CombatWorld)=>{const c=states.get(w)?.waterform;return !!c&&w.elapsed-c.at>=RIPTIDE.recastAfter;};
function activate(w:CombatWorld,id:RiptideSkillId,seconds:number) {
 w.aircraft.activeEffects[id]=seconds;(w.aircraft.activeEffectDurations??={})[id]=seconds;
}
export function beginRiptideSkill(w:CombatWorld,id:RiptideSkillId,h:RiptideHooks) {
 const s=riptideState(w),rank=skillRank(w.aircraft,id),v=riptideValues(id,rank);
 const c:Cast={id:w.nextId++,rank,at:w.elapsed,until:w.elapsed+v.duration};activate(w,id,v.duration);
 if(id==='riptide_wellspring') {
  s.wellspring={...c,tick:1};h.heal(w,getEffectiveAircraftStats(w.aircraft).maxHp*v.instantHeal,'riptide_wellspring');
  fx(w,'heal',w.playerX,w.playerY,45);
  if(rank>=3){h.cleanseSlow(w);fx(w,'cleanse',w.playerX,w.playerY,60);}
 } else if(id==='riptide_tidal_blades') {
  s.blades={...c,x:w.playerX,y:w.playerY,previous:0,hits:[new Set(),new Set()],refund:0,positions:new Map(w.enemies.map(e=>[e.id,{x:e.x,y:e.y}]))};
 } else if(id==='riptide_confluence')s.confluence={...c,exploded:false};
 else {s.waterform={...c,tick:1,charge:0,healed:0};w.aircraft.coreState.stacks.riptideArmor=v.armorBonus;}
}
/** The shot object is shared by all main bullets of the volley and dies with them.
 * No global target cache, recursive proc or cooldown; secondary provenance never calls this. */
export function riptideAfterwash(w:CombatWorld,direct:EnemyEntity,raw:number,shot:{afterwashHits?:Set<number>},x:number,y:number,h:RiptideHooks) {
 if(w.aircraft.aircraftId!=='riptide')return;
 const hits=shot.afterwashHits??=new Set<number>(),ratio=RIPTIDE.afterwash[passiveTier(w.aircraft.level)];
 const castId=w.nextId++;
 for(const e of w.enemies)if(e.id!==direct.id&&!hits.has(e.id)&&valid(w,e,h)&&circleVsAircraft(x,y,RIPTIDE.afterwashRadius,getEnemyHitbox(e))) {
  hits.add(e.id);h.damage(w,e,raw*ratio,undefined,castId);
 }
 fx(w,'afterwash',x,y,RIPTIDE.afterwashRadius,1,.28);
}
/** Curved radial blades, two opposite arms. Collision and paint use these same points. */
export function riptideBladePoints(x:number,y:number,elapsed:number,side:number) {
 const angle=elapsed/RIPTIDE.bladePass*Math.PI+side*Math.PI;
 return Array.from({length:9},(_,i)=>{const t=i/8,r=RIPTIDE.bladeInner+(RIPTIDE.bladeRadius-RIPTIDE.bladeHalfWidth-RIPTIDE.bladeInner)*t,a=angle+.45*Math.sin(t*Math.PI);
  return {x:x+Math.cos(a)*r,y:y+Math.sin(a)*r};});
}
function sweepBlades(w:CombatWorld,c:Blades,to:number,h:RiptideHooks) {
 const elapsed=Math.min(1.2,to-c.at),start=c.previous,span=Math.max(1e-9,elapsed-start);
 const oldX=c.x,oldY=c.y;
 for(let pass=0;pass<2;pass++) {
  const lo=Math.max(start,pass*.6),hi=Math.min(elapsed,(pass+1)*.6);if(hi<lo||hi===lo&&elapsed!==0)continue;
  for(const e of w.enemies) {
   if(c.hits[pass].has(e.id)||!valid(w,e,h))continue;
   const before=c.positions.get(e.id)??e,box=getEnemyHitbox(e);let hit=false;
   const steps=Math.max(1,Math.ceil((hi-lo)/.006),Math.ceil(Math.hypot(w.playerX-oldX-e.x+before.x,w.playerY-oldY-e.y+before.y)*(hi-lo)/span/4));
   for(let j=0;j<=steps&&!hit;j++) {
    const at=lo+(hi-lo)*j/steps,t=(at-start)/span;
    // Relative-motion sweep includes both caster movement and target movement.
    const x=oldX+(w.playerX-oldX)*t+(e.x-before.x)*(1-t),y=oldY+(w.playerY-oldY)*t+(e.y-before.y)*(1-t);
    for(let side=0;side<2&&!hit;side++) {
     const points=riptideBladePoints(x,y,at,side);
     for(let k=1;k<points.length&&!hit;k++)hit=segmentVsAircraft(points[k-1].x,points[k-1].y,points[k].x,points[k].y,RIPTIDE.bladeHalfWidth,box,createHitResult()).hit;
    }
   }
   if(!hit)continue;c.hits[pass].add(e.id);
   const twice=pass===1&&c.hits[0].has(e.id),v=riptideValues('riptide_tidal_blades',c.rank);
   damage(w,e,v.damageMultiplier*(twice&&c.rank>=3?1.2:1),'riptide_tidal_blades',c,h);fx(w,'impact',e.x,e.y,24,twice?1.2:1,.22);
   if(pass===1&&c.rank>=4&&e.hp>0)slow(w,e,'riptide_tidal_blades',e.type==='boss'&&!e.aircraftTarget?.world ? .1 : .25,h);
   if(twice&&c.rank>=5&&c.refund<.3-1e-8) {
    const fraction=Math.min(.05,.3-c.refund),max=getEffectiveAircraftStats(w.aircraft).maxResource;c.refund+=fraction;
    w.aircraft.currentResource=Math.min(max,w.aircraft.currentResource+max*fraction);fx(w,'refund',e.x,e.y,15);
   }
  }
 }
 c.previous=elapsed;c.x=w.playerX;c.y=w.playerY;c.positions=new Map(w.enemies.map(e=>[e.id,{x:e.x,y:e.y}]));
}
function burst(w:CombatWorld,c:Cast,ratio:number,radius:number,id:RiptideSkillId,h:RiptideHooks,strength=1) {
 if(ratio>0)for(const e of w.enemies)if(valid(w,e,h)&&within(w,e,radius))damage(w,e,ratio,id,c,h);
 fx(w,'burst',w.playerX,w.playerY,radius,strength,.5);
}
function tickWaterform(w:CombatWorld,water:Waterform,to:number,h:RiptideHooks) {
  const v=riptideValues('riptide_waterform',water.rank);
  for(;water.tick<=RIPTIDE.maxCharge&&water.at+water.tick*RIPTIDE.waterInterval<=Math.min(to,water.until)+1e-8;water.tick++) {
   let dealt=0,validDamage=0;const droplets:{x:number;y:number}[]=[];
   for(const e of w.enemies)if(valid(w,e,h)&&within(w,e,RIPTIDE.waterRadius)){const hit=damage(w,e,v.damageMultiplier,'riptide_waterform',water,h);dealt+=hit.hp;validDamage+=hit.total;if(hit.hp>0&&droplets.length<3)droplets.push({x:e.x,y:e.y});}
   if(validDamage>0){water.charge=Math.min(RIPTIDE.maxCharge,water.charge+1);const healed=h.heal(w,dealt*v.lifesteal,'riptide_waterform');water.healed+=healed;if(healed>0)for(const p of droplets)fx(w,'leech',p.x,p.y,8,1,.35);}
   fx(w,'pulse',w.playerX,w.playerY,RIPTIDE.waterRadius,water.charge/RIPTIDE.maxCharge,.25);
  }
}
export function endRiptideWaterform(w:CombatWorld,h:RiptideHooks) {
 const s=riptideState(w),c=s.waterform;if(!c)return;
 tickWaterform(w,c,Math.min(w.elapsed,c.until),h);
 s.waterform=undefined; // Clear before damage/procs so input + expiry can only end once.
 burst(w,c,c.charge*riptideValues('riptide_waterform',c.rank).chargeRatio,RIPTIDE.waterRadius,'riptide_waterform',h,c.charge/RIPTIDE.maxCharge);
 delete w.aircraft.coreState.stacks.riptideArmor;
 endAircraftSkill(w.aircraft,'riptide_waterform');
}
export function tickRiptide(w:CombatWorld,dt:number,h:RiptideHooks) {
 const s=states.get(w);if(!s)return;
 if(w.aircraft.currentHp<=0||w.destruction||w.aftermath){cancelRiptide(w);return;}
 const now=w.elapsed;s.effects=s.effects.filter(e=>e.at+e.life>now);
 for(const [id,t] of s.slows){if(t.entity.hp<=0||!w.enemies.includes(t.entity)){s.slows.delete(id);continue;}for(const [key,v] of t.sources)if(v.until<=now)t.sources.delete(key);if(!t.sources.size)s.slows.delete(id);}
 const well=s.wellspring;
 if(well) {
  for(;well.tick<=4&&well.at+well.tick<=now+1e-8;well.tick++) {h.heal(w,getEffectiveAircraftStats(w.aircraft).firepower*riptideValues('riptide_wellspring',well.rank).tickHeal,'riptide_wellspring');fx(w,'heal',w.playerX,w.playerY,38);}
  if(now>=well.until){s.wellspring=undefined;endAircraftSkill(w.aircraft,'riptide_wellspring');}else w.aircraft.activeEffects.riptide_wellspring=well.until-now;
 }
 const blades=s.blades;if(blades){sweepBlades(w,blades,now,h);if(now>=blades.until){s.blades=undefined;endAircraftSkill(w.aircraft,'riptide_tidal_blades');}else w.aircraft.activeEffects.riptide_tidal_blades=blades.until-now;}
 const con=s.confluence;if(con) {
  const v=riptideValues('riptide_confluence',con.rank),pullDt=Math.max(0,Math.min(now,con.at+RIPTIDE.pullDuration)-Math.max(con.at,now-dt));
  if(pullDt>0)for(const e of w.enemies)if(valid(w,e,h)&&within(w,e,RIPTIDE.confluenceRadius)) {
   const boss=e.type==='boss'&&!e.aircraftTarget,elite=!e.aircraftTarget&&h.elite(e);
   if(con.rank>=3)slow(w,e,'riptide_confluence',boss||elite?.15:.5,h);
   const dx=w.playerX-e.x,dy=w.playerY-e.y,d=Math.hypot(dx,dy),stop=getPlayerHitbox(w).radius+getEnemyHitbox(e).radius+RIPTIDE.pullGap;
   if(!boss&&d>stop){const step=Math.min(d-stop,v.pull*(elite?.5:1)*pullDt);h.displace(w,e,dx/d*step,dy/d*step);}
  }
  if(!con.exploded&&now>=con.at+RIPTIDE.pullDuration){con.exploded=true;burst(w,con,v.damageMultiplier,RIPTIDE.confluenceRadius,'riptide_confluence',h);}
  if(now>=con.until){if(con.rank>=5)burst(w,con,RIPTIDE.secondDamage,RIPTIDE.secondRadius,'riptide_confluence',h);s.confluence=undefined;endAircraftSkill(w.aircraft,'riptide_confluence');}else w.aircraft.activeEffects.riptide_confluence=con.until-now;
 }
 const water=s.waterform;if(water) {
  tickWaterform(w,water,now,h);
  if(now>=water.until)endRiptideWaterform(w,h);else w.aircraft.activeEffects.riptide_waterform=water.until-now;
 }
}
export function cancelRiptide(w:CombatWorld) {
 if(!states.has(w))return;states.delete(w);
 delete w.aircraft.coreState.stacks.riptideArmor;
 const cancelling=w.aircraft.coreState.stacks.cancellingSkills;w.aircraft.coreState.stacks.cancellingSkills=1;
 for(const id of RIPTIDE_SKILLS)endAircraftSkill(w.aircraft,id);
 if(cancelling===undefined)delete w.aircraft.coreState.stacks.cancellingSkills;else w.aircraft.coreState.stacks.cancellingSkills=cancelling;
}
export function riptideThreatNearby(w:CombatWorld,x:number,y:number,r:number) {
 const s=states.get(w);if(!s)return false;const radius=s.waterform?190:s.confluence||s.blades?170:0;
 return radius>0&&Math.hypot(x-w.playerX,y-w.playerY)<=radius+r;
}

export function riptideHealingRate(w:CombatWorld,firepower:number):number {const a=states.get(w)?.wellspring;return a&&a.until>w.elapsed&&a.tick<=4?firepower*riptideValues('riptide_wellspring',a.rank).tickHeal:0;}

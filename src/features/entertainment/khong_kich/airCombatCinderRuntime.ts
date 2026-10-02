import { DAMAGE_LABEL_SECONDS } from './airCombatFeedback';
import type { CombatWorld, EnemyEntity } from './airCombatRuntime';
import type { SkillId } from './airCombatTypes';
import { getEffectiveAircraftStats, endAircraftSkill } from './airCombatAircraft';
import { GAMEPLAY_SAFE_RECT as R, AIR_COMBAT_WORLD } from './airCombatConfig';
import { cinderValues, CINDER_BURN, type CinderSkillId } from './airCombatCinderConfig';
import { passiveCoefficient, passiveTier } from './airCombatPassives';
import { skillRank } from './airCombatSkillRanks';
import { circleVsAircraft, getEnemyHitbox, rectVsAircraft, segmentVsAircraft, createHitResult } from './airCombatHitboxes';
import { celestialProtection, createAbsorbShield } from './airCombatExpansion';
import { negativeStatusDuration } from './airCombatCoreEffects';
import { canTargetEnemy } from './airCombatTargetability';

export interface IntrinsicDamage { trueDamage:boolean; castId:number; source?:"cinder_burn"; ownerId?:number; burnSession?:number; rawBudget?:{remaining:number} }
export interface CinderHooks {
 hostile:(w:CombatWorld,e:EnemyEntity)=>boolean;
 damage:(w:CombatWorld,e:EnemyEntity,raw:number,skill:SkillId|undefined,provenance:IntrinsicDamage)=>number;
}
interface TargetState { entity:EnemyEntity; session:number; burn:number; until:number; nextTick:number; passiveReady:number; markUntil:number; markReady:number; blazeUntil:number; slowUntil:number; slow:number; rootUntil:number }
interface Fuel { id:number; rank:number; x:number; y:number; fromX:number; fromY:number; at:number; land:number; until:number; nextTick:number; entered:Map<number,number>; detonated:Map<number,Set<number>> }
export const cinderWaveRadius=(x:number,y:number)=>Math.hypot(Math.max(x-R.left,R.right-x),Math.max(y-R.top,R.bottom-y));
interface Wave { id:number; rank:number; x:number; y:number; at:number; until:number; hits:Set<number> }
interface Beam { id:number; rank:number; at:number; fire:number; until:number; x:number; y:number; fired:boolean }
interface Lane { id:number; rank:number; x:number;y:number;at:number;until:number;nextTick:number;nextBurn:number }
interface Spread { id:number; sources:{id:number;next:number;remaining:number}[]; recipients:Map<number,{damageAt:number;burnAt:number}> }
export interface CinderEffect { id:number;kind:'ring'|'burst'|'impact'|'mark'|'alloy'|'followup'|'muzzle'|'splash'|'charge'|'battery';x:number;y:number;at:number;life:number;size:number }
export interface CinderBurnTotal { session:number;entity:EnemyEntity;entityId:number;total:number;x:number;y:number;endedAt?:number }
export interface CinderRuntime {
 ownerId:number; nextBurnSession:number; targets:Map<number,TargetState>; burnTotals:Map<number,CinderBurnTotal>; followReady:number;
 battery:{charge:number;phase:'charging'|'ready'|'feeding'|'cooling';remaining:number};
 followups:{id:number;target:number;x:number;y:number;previousX:number;previousY:number;raw:number;until:number;angle:number}[];
 shield?:{id:number;rank:number;until:number;ready:number;refund:number};
 fuel?:Fuel; wave?:Wave; waveAfterglow?:Wave & {hideAt:number}; beam?:Beam; lanes:Lane[]; spreads:Spread[]; effects:CinderEffect[];
}
let nextOwnerId=1;
const states=new WeakMap<CombatWorld,CinderRuntime>();
export function cinderState(w:CombatWorld):CinderRuntime {let s=states.get(w);if(!s){s={ownerId:nextOwnerId++,nextBurnSession:0,targets:new Map(),burnTotals:new Map(),followReady:0,battery:{charge:0,phase:'charging',remaining:0},followups:[],lanes:[],spreads:[],effects:[]};states.set(w,s);}return s;}
const targetState=(w:CombatWorld,id:number)=>{const s=cinderState(w),entity=w.enemies.find(e=>e.id===id)!;let t=s.targets.get(id);if(!t||t.entity!==entity){t={entity,session:0,burn:0,until:0,nextTick:0,passiveReady:0,markUntil:0,markReady:0,blazeUntil:0,slowUntil:0,slow:1,rootUntil:0};s.targets.set(id,t);}return t;};
export const cinderStacks=(w:CombatWorld,id:number,at=w.elapsed)=>{const t=cinderState(w).targets.get(id);return t&&t.until>=at?t.burn:0;};
export function cinderMovement(w:CombatWorld,e:EnemyEntity){const t=cinderState(w).targets.get(e.id);return !t?1:t.rootUntil>w.elapsed?0:t.slowUntil>w.elapsed?t.slow:1;}
export const cinderMovementLocked=(w:CombatWorld)=>{const b=cinderState(w).beam;return !!b&&b.fired&&w.elapsed<b.until;};
export function cinderSkillAllowed(w:CombatWorld,id:SkillId){const b=cinderState(w).beam;return !b||(!b.fired&&id==='cinder_fire_shield');}
function fx(w:CombatWorld,kind:CinderEffect['kind'],x:number,y:number,size:number,life=.4){const s=cinderState(w);s.effects.push({id:w.nextId++,kind,x,y,size,life,at:w.elapsed});if(s.effects.length>96)s.effects.splice(0,s.effects.length-96);}
function valid(w:CombatWorld,e:EnemyEntity,h:CinderHooks){return e.hp>0&&h.hostile(w,e)&&e.x+e.radius>=0&&e.x-e.radius<=AIR_COMBAT_WORLD.width&&e.y+e.radius>=R.top&&e.y-e.radius<=R.bottom;}
export function addCinderBurn(w:CombatWorld,e:EnemyEntity,count:number,h:CinderHooks,at=w.elapsed){
 if(!valid(w,e,h))return;
 const t=targetState(w,e.id);if(t.until<at||t.burn===0){t.burn=0;t.nextTick=at+CINDER_BURN.interval;t.session=++cinderState(w).nextBurnSession;cinderState(w).burnTotals.set(e.id,{session:t.session,entity:e,entityId:e.id,total:0,x:e.x,y:e.y});}
 t.burn=Math.min(CINDER_BURN.cap,t.burn+count);t.until=at+CINDER_BURN.duration;
}
function deal(w:CombatWorld,e:EnemyEntity,ratio:number,skill:SkillId|undefined,id:number,h:CinderHooks,trueDamage=false){
 const damage=h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*ratio,skill,{trueDamage,castId:id});
 if(skill==='cinder_inferno_beam')applyBlaze(w,e);
 return damage;
}
export function passiveHit(w:CombatWorld,e:EnemyEntity,hit:{primary:boolean;skillDirect:boolean;critical:boolean;beforeCrit:number},h:CinderHooks){
 const s=cinderState(w),a=w.aircraft,t=targetState(w,e.id),now=w.elapsed,k=passiveCoefficient(a);
 if(hit.primary){
  if(a.aircraftId==='black_eagle'&&hit.critical&&now>=s.followReady&&e.hp>0&&canTargetEnemy(w,e,'homing')){
   s.followReady=now+.5;s.followups.push({id:w.nextId++,target:e.id,x:w.playerX,y:w.playerY-20,previousX:w.playerX,previousY:w.playerY-20,raw:hit.beforeCrit*k,until:now+4,angle:-Math.PI/2});fx(w,'muzzle',w.playerX,w.playerY-20,18,.18);
  }else if(a.aircraftId==='breaker'){
   h.damage(w,e,getEffectiveAircraftStats(a).armor*k,undefined,{trueDamage:false,castId:w.nextId++});fx(w,'alloy',e.x,e.y,22,.2);
  }else if(a.aircraftId==='astra'&&now>=t.markReady&&e.hp>0){t.markUntil=now+4;fx(w,'mark',e.x,e.y,24,.25);
  }else if(a.aircraftId==='cinder'&&now>=t.passiveReady){t.passiveReady=now+3;deal(w,e,k,undefined,w.nextId++,h);addCinderBurn(w,e,1,h);fx(w,'impact',e.x,e.y,32,.3);}
 }
 if(a.aircraftId==='astra'&&hit.skillDirect&&t.markUntil>now&&now>=t.markReady){t.markUntil=0;t.markReady=now+6;deal(w,e,k,undefined,w.nextId++,h);fx(w,'mark',e.x,e.y,54,.4);}
}
function fuelCenters(f:Fuel){return [-126,-42,42,126].map(dx=>({x:f.x+dx,y:f.y}));}
function inFuel(f:Fuel,e:EnemyEntity){const r=cinderValues('cinder_fuel_barrage',f.rank).radius,h=getEnemyHitbox(e);return f.rank>=5?rectVsAircraft(Math.max(R.left,f.x-126-r),f.y-r,Math.min(R.right,f.x+126+r),f.y+r,h):fuelCenters(f).some(p=>circleVsAircraft(p.x,p.y,r,h));}
function active(w:CombatWorld,id:CinderSkillId,seconds:number){w.aircraft.activeEffects[id]=Math.max(.00001,seconds);(w.aircraft.activeEffectDurations??={})[id]=seconds;}
export function beginCinderSkill(w:CombatWorld,id:CinderSkillId,h:CinderHooks){
 const s=cinderState(w),rank=skillRank(w.aircraft,id),v=cinderValues(id,rank),now=w.elapsed,cast=w.nextId++;
 if(id==='cinder_fire_shield'){
  const amount=getEffectiveAircraftStats(w.aircraft).firepower*v.shieldMultiplier;
  createAbsorbShield(w.aircraft,'cinder',amount,v.duration);
  s.shield={id:cast,rank,until:now+v.duration,ready:now,refund:0};active(w,id,v.duration);
 }else if(id==='cinder_fuel_barrage'){
  const targets=w.enemies.filter(e=>valid(w,e,h)&&e.y<w.playerY&&canTargetEnemy(w,e));
  let center={x:w.playerX,y:Math.max(R.top+v.radius,w.playerY-180)},score=-1;
  for(const e of targets){const n=targets.filter(t=>Math.abs(t.y-e.y)<=v.radius+t.radius&&Math.abs(t.x-e.x)<=126+v.radius).length;if(n>score){score=n;center=e;}}
  const half=126+v.radius, x=half*2>R.width?(R.left+R.right)/2:Math.max(R.left+half,Math.min(R.right-half,center.x));
  s.fuel={id:cast,rank,x,y:Math.max(R.top+v.radius,Math.min(R.bottom-v.radius,center.y)),fromX:w.playerX,fromY:w.playerY-20,at:now,land:now+.6,until:now+.6+v.duration,nextTick:now+1.1,entered:new Map(),detonated:new Map()};active(w,id,.6+v.duration);
 }else if(id==='cinder_heat_wave'){
  s.wave={id:cast,rank,x:w.playerX,y:w.playerY,at:now,until:now+.8,hits:new Set()};active(w,id,.8);
 }else {s.beam={id:cast,rank,at:now,fire:now+v.charge,until:now+v.charge+.45,x:w.playerX,y:w.playerY-20,fired:false};active(w,id,v.charge+.45);}
}
export function cinderShieldFactor(w:CombatWorld,sourceId:number|undefined,trueDamage:boolean){const sh=cinderState(w).shield;return sh&&sh.rank>=5&&!trueDamage&&sourceId!==undefined&&cinderStacks(w,sourceId)>=3?.65:1;}
export function cinderShieldAbsorbed(w:CombatWorld,amount:number,h:CinderHooks){const s=cinderState(w),sh=s.shield;if(!sh||amount<=0)return;
 fx(w,'impact',w.playerX,w.playerY-22,28,.18);
 if(sh.rank>=3&&w.elapsed>=sh.ready){sh.ready=w.elapsed+1;let burning=false;
  for(const e of w.enemies)if(valid(w,e,h)&&circleVsAircraft(w.playerX,w.playerY,80,getEnemyHitbox(e))){burning ||= cinderStacks(w,e.id)>0;addCinderBurn(w,e,1,h);}
  fx(w,'ring',w.playerX,w.playerY,160,.5);
  if(sh.rank>=4&&burning&&sh.refund<.10-1e-8){const gain=Math.min(.02,.10-sh.refund);sh.refund+=gain;const max=getEffectiveAircraftStats(w.aircraft).maxResource;w.aircraft.currentResource=Math.min(max,w.aircraft.currentResource+max*gain);}
 }
 if((w.aircraft.coreState.shields.cinder?.amount??0)<=0){fx(w,'burst',w.playerX,w.playerY,85,.45);s.shield=undefined;delete w.aircraft.coreState.shields.cinder;endAircraftSkill(w.aircraft,'cinder_fire_shield');}
}
function igniteFuel(w:CombatWorld,cast:number,touches:(x:number,y:number,r:number)=>boolean,h:CinderHooks){const f=cinderState(w).fuel;if(!f||f.rank<4||w.elapsed<f.land||w.elapsed>f.until)return;
 let hit=f.detonated.get(cast);if(!hit){hit=new Set();f.detonated.set(cast,hit);}const v=cinderValues('cinder_fuel_barrage',f.rank);
 fuelCenters(f).forEach((p,i)=>{if(hit!.has(-i-1)||!touches(p.x,p.y,v.radius))return;hit!.add(-i-1);fx(w,'burst',p.x,p.y,v.radius*2.4,.55);
 for(const e of w.enemies)if(valid(w,e,h)&&!hit!.has(e.id)&&circleVsAircraft(p.x,p.y,v.radius,getEnemyHitbox(e))){hit!.add(e.id);deal(w,e,1.8,'cinder_fuel_barrage',cast,h);addCinderBurn(w,e,1,h);}
 });
}
function applyBlaze(w:CombatWorld,e:EnemyEntity){
 if(e.hp>0&&skillRank(w.aircraft,'cinder_inferno_beam')>=3)targetState(w,e.id).blazeUntil=w.elapsed+8;
}
function fireBeam(w:CombatWorld,b:Beam,h:CinderHooks){
 const s=cinderState(w),v=cinderValues('cinder_inferno_beam',b.rank);b.fired=true;b.x=w.playerX;b.y=w.playerY-20;
 const snapshot=w.enemies.filter(e=>valid(w,e,h)&&rectVsAircraft(b.x-v.width/2,R.top,b.x+v.width/2,b.y,getEnemyHitbox(e))).map(e=>({e,id:e.id,x:e.x,y:e.y,n:cinderStacks(w,e.id)}));
 const recipients=w.enemies.filter(e=>valid(w,e,h));const collateral=new Map<number,{remaining:number}>(),stacked=new Set<number>();
 for(const {e} of snapshot){deal(w,e,v.damageMultiplier,'cinder_inferno_beam',b.id,h);addCinderBurn(w,e,1,h);fx(w,'impact',e.x,e.y,52,.35);}
 for(const source of snapshot){if(!source.n)continue;fx(w,'burst',source.x,source.y,v.radius*2,.55);const ratio=1.2+source.n;
  for(const e of recipients){if(!circleVsAircraft(source.x,source.y,v.radius,getEnemyHitbox(e)))continue;
   const self=e.id===source.id,firepower=getEffectiveAircraftStats(w.aircraft).firepower;
   if(self)deal(w,e,ratio,'cinder_inferno_beam',b.id,h);
   else {const budget=collateral.get(e.id)??{remaining:firepower*7.2};collateral.set(e.id,budget);if(budget.remaining>0){h.damage(w,e,firepower*ratio,'cinder_inferno_beam',{trueDamage:false,castId:b.id,rawBudget:budget});applyBlaze(w,e);}}
   if(!self&&b.rank>=2&&!stacked.has(e.id)){stacked.add(e.id);addCinderBurn(w,e,1,h);}
  }
 }
 igniteFuel(w,b.id,(x,y,r)=>x+r>=b.x-v.width/2&&x-r<=b.x+v.width/2&&y+r>=R.top&&y-r<=b.y,h);
 if(b.rank>=3)s.lanes.push({id:b.id,rank:b.rank,x:b.x,y:b.y,at:b.fire,until:b.fire+3,nextTick:b.fire+.5,nextBurn:b.fire+1});
}
function tickBattery(w:CombatWorld,dt:number){const b=cinderState(w).battery;if(w.aircraft.aircraftId!=='phantom')return;let left=dt;
 // At most a few phase boundaries per frame; elapsed simulation time is conserved.
 for(let guard=0;left>1e-8&&guard<12;guard++){
  if(b.phase==='charging'){const step=Math.min(left,(100-b.charge)/1.5);b.charge=Math.min(100,b.charge+step*1.5);left-=step;if(b.charge>=100-1e-8){b.charge=100;b.phase='ready';}else break;}
  else if(b.phase==='ready'){if(w.aircraft.currentResource<getEffectiveAircraftStats(w.aircraft).maxResource*.1){b.phase='feeding';b.remaining=5;}else break;}
  else if(b.phase==='feeding'){const step=Math.min(left,b.remaining);b.remaining-=step;b.charge=Math.max(0,b.charge-step*20);w.aircraft.currentResource=Math.min(getEffectiveAircraftStats(w.aircraft).maxResource,w.aircraft.currentResource+step*8);left-=step;if(b.remaining<=1e-8){b.phase='cooling';b.remaining=5;b.charge=0;}}
  else {const step=Math.min(left,b.remaining);b.remaining-=step;left-=step;if(b.remaining<=1e-8)b.phase='charging';}
 }
}
export function tickCinder(w:CombatWorld,dt:number,h:CinderHooks){
 const s=cinderState(w),now=w.elapsed;if(w.aircraft.currentHp<=0||w.destruction||w.aftermath){cancelCinder(w);return;}
 tickBattery(w,dt);s.effects=s.effects.filter(e=>e.at+e.life>now);
 for(const [id,t] of s.targets){const e=w.enemies.find(e=>e.id===id);if(!e||e!==t.entity||e.hp<=0||!h.hostile(w,e)){s.targets.delete(id);continue;}
  for(let guard=0;t.burn>0&&e.hp>0&&t.nextTick<=Math.min(now,t.until)+1e-8&&guard<12;guard++){
   const hp=h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*CINDER_BURN.dpsAtCap[passiveTier(w.aircraft.level)]/CINDER_BURN.cap*CINDER_BURN.interval*t.burn*(t.blazeUntil>t.nextTick?1.5:1),undefined,{trueDamage:true,castId:t.session,source:'cinder_burn',ownerId:s.ownerId,burnSession:t.session});
   const total=s.burnTotals.get(id);if(total&&total.session===t.session)total.total+=Math.max(0,hp);
   t.nextTick+=CINDER_BURN.interval;
  }
  if(t.until<now)t.burn=0;
  if(!t.burn&&t.markUntil<=now&&t.markReady<=now&&t.blazeUntil<=now&&t.passiveReady<=now&&t.slowUntil<=now&&t.rootUntil<=now)s.targets.delete(id);
 }
 for(const [id,total] of s.burnTotals){
  const t=s.targets.get(id),e=total.entity,live=e.id===id&&e.hp>0&&w.enemies.includes(e)&&h.hostile(w,e);
  if(live){total.x=e.x;total.y=e.y;}
  if(total.endedAt===undefined&&(!live||!t||!t.burn||t.session!==total.session))total.endedAt=live&&t?Math.min(now,t.until):now;
  if(total.endedAt!==undefined&&now-total.endedAt>=DAMAGE_LABEL_SECONDS)s.burnTotals.delete(id);
 }
 s.followups=s.followups.filter(p=>{const e=w.enemies.find(e=>e.id===p.target);if(!e||!valid(w,e,h)||!canTargetEnemy(w,e,'homing')||p.until<=now)return false;
  p.previousX=p.x;p.previousY=p.y;const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy),step=Math.min(d,600*dt);p.angle=Math.atan2(dy,dx);p.x+=Math.cos(p.angle)*step;p.y+=Math.sin(p.angle)*step;
  if(segmentVsAircraft(p.previousX,p.previousY,p.x,p.y,2.5,getEnemyHitbox(e),createHitResult()).hit){h.damage(w,e,p.raw,undefined,{trueDamage:false,castId:p.id});fx(w,'followup',p.x,p.y,20,.2);return false;}return true;
 });
 const sh=s.shield;if(sh){if(now>=sh.until||(w.aircraft.coreState.shields.cinder?.amount??0)<=0){fx(w,'burst',w.playerX,w.playerY,80,.4);s.shield=undefined;delete w.aircraft.coreState.shields.cinder;endAircraftSkill(w.aircraft,'cinder_fire_shield');}else w.aircraft.activeEffects.cinder_fire_shield=sh.until-now;}
 const f=s.fuel;if(f){const v=cinderValues('cinder_fuel_barrage',f.rank);
  if(now>=f.land){
   if(now-dt<f.land)for(const p of fuelCenters(f))fx(w,'splash',p.x,p.y,v.radius*2,.45);
   for(const e of w.enemies)if(valid(w,e,h)&&inFuel(f,e)&&!f.entered.has(e.id)){const entered=Math.max(f.land,now-dt);f.entered.set(e.id,entered+.5);addCinderBurn(w,e,1,h,entered);}
   // Damage uses one shared cast cadence; stacks use the target's first-entry cadence.
   for(let guard=0;f.nextTick<=Math.min(now,f.until)+1e-8&&guard<14;guard++,f.nextTick+=.5)for(const e of w.enemies)if(valid(w,e,h)&&inFuel(f,e))deal(w,e,v.damageMultiplier*(f.rank>=3&&cinderStacks(w,e.id,f.nextTick)>=6?1.25:1),'cinder_fuel_barrage',f.id,h);
   for(const [id,next] of f.entered){const e=w.enemies.find(e=>e.id===id);if(!e||e.hp<=0){f.entered.delete(id);continue;}let at=next;
    for(let guard=0;at<=Math.min(now,f.until)+1e-8&&guard<14;guard++,at+=.5)if(valid(w,e,h)&&inFuel(f,e))addCinderBurn(w,e,1,h,at);
    f.entered.set(id,at);
   }
  }
  if(now>=f.until){s.fuel=undefined;endAircraftSkill(w.aircraft,'cinder_fuel_barrage');}else w.aircraft.activeEffects.cinder_fuel_barrage=f.until-now;
 }
 const wave=s.wave;if(wave){const v=cinderValues('cinder_heat_wave',wave.rank),radius=cinderWaveRadius(wave.x,wave.y)*Math.min(1,(now-wave.at)/.8);
  for(const e of w.enemies)if(valid(w,e,h)&&!wave.hits.has(e.id)&&circleVsAircraft(wave.x,wave.y,radius,getEnemyHitbox(e))){wave.hits.add(e.id);const n=cinderStacks(w,e.id),t=targetState(w,e.id);
   deal(w,e,v.damageMultiplier+v.perStack*n,'cinder_heat_wave',wave.id,h);addCinderBurn(w,e,n>0&&wave.rank>=4?2:1,h);
   if(n>0){const actor=e.aircraftTarget?.world,immune=actor&&(celestialProtection(actor.aircraft)||(skillRank(actor.aircraft,'afterburner')>=5&&(actor.aircraft.activeEffects.afterburner??0)>0));
    if(!immune){t.slow=1-(.15+.03*n);t.slowUntil=now+(actor?negativeStatusDuration(actor.aircraft,wave.rank>=4?4:3):wave.rank>=4?4:3);if(n===6&&wave.rank>=3&&e.type!=='boss')t.rootUntil=now+(actor?negativeStatusDuration(actor.aircraft,.75):.75);}
   }
   if(wave.rank>=5&&cinderStacks(w,e.id)>=6&&e.hp>0){let spread=s.spreads.find(p=>p.id===wave.id);if(!spread){spread={id:wave.id,sources:[],recipients:new Map()};s.spreads.push(spread);}spread.sources.push({id:e.id,next:now+1,remaining:4});}
  }
  igniteFuel(w,wave.id,(x,y,r)=>Math.hypot(x-wave.x,y-wave.y)<=radius+r,h);
  if(now>=wave.until){s.waveAfterglow={...wave,hideAt:wave.until+.3};s.wave=undefined;endAircraftSkill(w.aircraft,'cinder_heat_wave');}else w.aircraft.activeEffects.cinder_heat_wave=wave.until-now;
 }
 for(const spread of s.spreads){
  const events=spread.sources.flatMap(source=>{const e=w.enemies.find(e=>e.id===source.id);if(!e||!valid(w,e,h)){source.remaining=0;return [];}
   const due:{source:EnemyEntity;at:number}[]=[];for(let guard=0;source.remaining>0&&source.next<=now+1e-8&&guard<4;guard++,source.remaining--,source.next++)due.push({source:e,at:source.next});return due;
  }).sort((a,b)=>a.at-b.at);
  for(const {source,at} of events){if(source.hp<=0)continue;fx(w,'ring',source.x,source.y,110,.45);
   for(const e of w.enemies)if(valid(w,e,h)&&circleVsAircraft(source.x,source.y,55,getEnemyHitbox(e))){const last=spread.recipients.get(e.id)??{damageAt:-Infinity,burnAt:-Infinity};
    if(at-last.damageAt>=1-1e-8){last.damageAt=at;deal(w,e,.6,'cinder_heat_wave',spread.id,h);}
    if(e.id!==source.id&&at-last.burnAt>=1-1e-8){last.burnAt=at;addCinderBurn(w,e,1,h,at);}spread.recipients.set(e.id,last);
   }
  }spread.sources=spread.sources.filter(source=>source.remaining>0&&w.enemies.some(e=>e.id===source.id&&e.hp>0));
 }s.spreads=s.spreads.filter(p=>p.sources.length>0);
 const b=s.beam;if(b){if(!b.fired&&now>=b.fire)fireBeam(w,b,h);if(now>=b.until){s.beam=undefined;endAircraftSkill(w.aircraft,'cinder_inferno_beam');}else w.aircraft.activeEffects.cinder_inferno_beam=b.until-now;}
 for(const lane of s.lanes){const v=cinderValues('cinder_inferno_beam',lane.rank);for(let guard=0;lane.nextTick<=Math.min(now,lane.until)+1e-8&&guard<6;guard++,lane.nextTick+=.5){const burn=lane.nextTick>=lane.nextBurn-1e-8;
  for(const e of w.enemies)if(valid(w,e,h)&&rectVsAircraft(lane.x-v.width/2,R.top,lane.x+v.width/2,lane.y,getEnemyHitbox(e))){deal(w,e,.6,'cinder_inferno_beam',lane.id,h);if(burn)addCinderBurn(w,e,1,h,lane.nextTick);}if(burn)lane.nextBurn++;
 }}s.lanes=s.lanes.filter(l=>l.until>now);
}
export function cancelCinder(w:CombatWorld){const s=states.get(w);if(!s)return;states.delete(w);delete w.aircraft.coreState.shields.cinder;for(const id of ['cinder_fire_shield','cinder_fuel_barrage','cinder_heat_wave','cinder_inferno_beam'] as const)endAircraftSkill(w.aircraft,id);}

export function cinderThreatNearby(w:CombatWorld,x:number,y:number,r:number){const s=cinderState(w),now=w.elapsed,f=s.fuel,b=s.beam;
 if(f&&now>=f.land&&now<f.until){const radius=cinderValues('cinder_fuel_barrage',f.rank).radius;if(f.rank>=5?Math.abs(x-f.x)<=126+radius+r&&Math.abs(y-f.y)<=radius+r:fuelCenters(f).some(p=>Math.hypot(x-p.x,y-p.y)<=radius+r))return true;}
 if(b?.fired&&now<b.until&&x+r>=b.x-cinderValues('cinder_inferno_beam',b.rank).width/2&&x-r<=b.x+cinderValues('cinder_inferno_beam',b.rank).width/2&&y+r>=R.top&&y-r<=b.y)return true;
 if(s.lanes.some(l=>now<l.until&&Math.abs(x-l.x)<=cinderValues('cinder_inferno_beam',l.rank).width/2+r&&y+r>=R.top&&y-r<=l.y))return true;
 if(s.followups.some(p=>p.until>now&&Math.hypot(x-p.x,y-p.y)<=r+2.5))return true;
 const wave=s.wave;if(wave){const radius=cinderWaveRadius(wave.x,wave.y)*Math.min(1,(now-wave.at)/.8);if(Math.abs(Math.hypot(x-wave.x,y-wave.y)-radius)<=r+8)return true;}
 return false;
}

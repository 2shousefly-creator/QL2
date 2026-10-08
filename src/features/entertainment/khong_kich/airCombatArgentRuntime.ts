import { statusExpiry } from './airCombatStatusTiming';
import type { AircraftCombatState } from './airCombatTypes';
import type { CombatWorld, EnemyEntity } from './airCombatRuntime';
import { argentInset, argentEmitterPositions } from './airCombatArgentGeometry';
import { endAircraftSkill, getEffectiveAircraftStats } from './airCombatAircraft';
import { ARGENT as A, ARGENT_SKILLS, argentValues, type ArgentSkillId } from './airCombatArgentConfig';
import { skillRank } from './airCombatSkillRanks';
import { passiveTier } from './airCombatPassives';
import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';
import { createHitResult, getEnemyHitbox, segmentVsAircraft } from './airCombatHitboxes';
import { celestialProtection } from './airCombatExpansion';
import { negativeStatusDuration } from './airCombatCoreEffects';
import { hardControlImmune } from './airCombatStatus';
import { canTargetEnemy } from './airCombatTargetability';

export interface ArgentHooks {
 hostile(w:CombatWorld,e:EnemyEntity):boolean;
 elite(e:EnemyEntity):boolean;
 damage(w:CombatWorld,e:EnemyEntity,raw:number,skill:ArgentSkillId|undefined,castId:number):{hp:number;total:number};
}
interface Cast {id:number;rank:number;at:number;hits:Map<number,number>}
interface Recall extends Cast {temper:number;refund:number;critSnapshot:number;critMultiplier:number;cooldownMultiplier:number}
interface ArrayCast extends Cast {until:number;fireCount:number;emitters:ReturnType<typeof argentEmitterPositions>;seen:WeakSet<object>}
interface ArrayWave {id:number;castId:number;rank:number;hits:Map<number,Set<number>>}
export interface ArgentBlade {
 id:number;owner:CombatWorld;source:ArgentSkillId|'genesis'|'break';cast:Cast;phase:'out'|'wait'|'recall';
 x:number;y:number;angle:number;distance:number;speed:number;width:number;ratio:number;ttl:number;at:number;waitAt:number;
 hits:Set<number>;returnHits:Set<number>;recall?:Recall;refunded:boolean;wave?:ArrayWave;emitterId?:number;ultimateRank?:number;stopX:number;stopY:number;trail:{x:number;y:number}[];
}
export interface ArgentEffect {id:number;kind:'stance'|'guard'|'impact'|'launch'|'recall'|'join'|'refund'|'root'|'slow'|'cross'|'mark'|'break'|'summon'|'wave'|'reunion'|'expire';x:number;y:number;at:number;life:number;size:number}
export interface ArgentState {
 blades:ArgentBlade[];guard?:{rank:number;at:number;until:number;beatUntil:number;remaining:number;used:number;id:number};
 temper:number;temperUntil:number;progress:number;genesisReady:number;seen:WeakSet<object>;
 launch?:Cast;recall?:Recall;array?:ArrayCast;effects:ArgentEffect[];armorMarks:Map<number,{entity:EnemyEntity;until:number;duration:number}>;
 controls:Map<number,{entity:EnemyEntity;rootUntil:number;slowUntil:number;slow:number}>;updated:number;
}
const recallSnapshots=new WeakMap<AircraftCombatState,Recall>();
export const argentRecallSnapshot=(state:AircraftCombatState)=>recallSnapshots.get(state);
const states=new WeakMap<CombatWorld,ArgentState>();
export function argentState(w:CombatWorld):ArgentState {let s=states.get(w);if(!s){s={blades:[],temper:0,temperUntil:0,progress:0,genesisReady:0,seen:new WeakSet(),effects:[],armorMarks:new Map(),controls:new Map(),updated:w.elapsed};states.set(w,s);}return s;}
export const argentWaiting=(w:CombatWorld)=>states.get(w)?.blades.filter(b=>b.phase==='wait').length??0;
export function argentHud(w:CombatWorld){
 const s=states.get(w),now=w.elapsed,g=s?.guard;
 const guard=g&&now<g.until&&(g.remaining>0||now<g.beatUntil)?g:undefined;
 const defending=!!guard&&guard.beatUntil>now;
 return {guard,defending,guardSeconds:guard?Math.max(0,(defending?guard.beatUntil:guard.until)-now):0,temper:s&&s.temperUntil>now?s.temper:0,array:s?.array&&now<s.array.until?s.array:undefined};
}
const live=(w:CombatWorld)=>w.aircraft.currentHp>0&&!w.destruction&&!w.aftermath&&!w.ended;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const point=(x:number,y:number)=>({x:clamp(x,R.left,R.right),y:clamp(y,R.top,R.bottom)});
/** Clip a line to the arena without bending its angle at an edge. */
export function argentClip(ax:number,ay:number,bx:number,by:number,rect:{left:number;right:number;top:number;bottom:number}=R){
 const dx=bx-ax,dy=by-ay;let lo=0,hi=1;
 for(const [p,q] of [[-dx,ax-rect.left],[dx,rect.right-ax],[-dy,ay-rect.top],[dy,rect.bottom-ay]]){
  if(Math.abs(p)<1e-9){if(q<0)return null;continue;}
  const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return null;
 }
 return {from:{x:ax+dx*lo,y:ay+dy*lo},to:{x:ax+dx*hi,y:ay+dy*hi}};
}
const valid=(w:CombatWorld,e:EnemyEntity,h:ArgentHooks)=>live(w)&&e.hp>0&&h.hostile(w,e)&&e.x+e.radius>=R.left&&e.x-e.radius<=R.right&&e.y+e.radius>=R.top&&e.y-e.radius<=R.bottom;
const boss=(e:EnemyEntity)=>!e.aircraftTarget&&e.type==='boss';
function fx(w:CombatWorld,kind:ArgentEffect['kind'],x:number,y:number,at=w.elapsed,size=32,life=.28){const s=argentState(w);s.effects.push({id:w.nextId++,kind,x,y,at,size,life});if(s.effects.length>96)s.effects.splice(0,s.effects.length-96);}
function finish(w:CombatWorld,id:ArgentSkillId,at:number){endAircraftSkill(w.aircraft,id);w.aircraft.cooldowns[id]=Math.max(0,(w.aircraft.cooldowns[id]??0)-Math.max(0,w.elapsed-at));}
function blade(w:CombatWorld,source:ArgentBlade['source'],cast:Cast,x:number,y:number,angle:number,range:number,ratio:number,at=w.elapsed,wave?:ArrayWave,emitterId?:number){
 const heavy=source==='break',p=point(x,y),rect=argentInset(angle,heavy);
 const clipped=argentClip(p.x,p.y,p.x+Math.cos(angle)*range,p.y+Math.sin(angle)*range,rect);
 // Choose the first exit along the actual straight ray. A spawn outside the inset
 // enters along that same ray; it is never bent to a separately clamped endpoint.
 // If the muzzle is already beyond its stopping plane there is no forward
 // segment inside the inset. Materialize at a contained endpoint without travel.
 if(!clipped){p.x=clamp(p.x,rect.left,rect.right);p.y=clamp(p.y,rect.top,rect.bottom);}
 const stop=clipped?.to??p;
 const b:ArgentBlade={id:w.nextId++,owner:w,source,cast,phase:'out',...p,angle,distance:Math.hypot(stop.x-p.x,stop.y-p.y),stopX:stop.x,stopY:stop.y,speed:wave?A.arraySpeed:heavy?A.heavySpeed:A.speed,width:heavy?A.heavyWidth:A.width,ratio,ttl:source===ARGENT_SKILLS[1]&&cast.rank>=4?A.extendedTtl:A.ttl,at,waitAt:0,hits:new Set(),returnHits:new Set(),refunded:false,wave,emitterId,ultimateRank:wave?.rank,trail:[]};
 argentState(w).blades.push(b);return b;
}
function wait(w:CombatWorld,b:ArgentBlade,at:number){
 const s=argentState(w);if(b.source==='break'){s.blades=s.blades.filter(v=>v!==b);return;}
 b.phase='wait';b.x=b.stopX;b.y=b.stopY;b.waitAt=at;b.trail=[];
 const waiting=s.blades.filter(v=>v.phase==='wait').sort((a,b)=>a.waitAt-b.waitAt||a.id-b.id);
 while(waiting.length>A.cap){const old=waiting.shift()!;s.blades=s.blades.filter(v=>v!==old);fx(w,'expire',old.x,old.y,at,18);}
}
function closeGuard(w:CombatWorld,at:number){const s=argentState(w),g=s.guard;if(!g)return;s.guard=undefined;finish(w,ARGENT_SKILLS[0],at);
 if(g.rank>=5&&g.used===4&&live(w)){blade(w,'break',{id:g.id,rank:g.rank,at,hits:new Map()},w.playerX,w.playerY,-Math.PI/2,A.range,A.breakDamage,at);fx(w,'break',w.playerX,w.playerY,at,65,.1);}
}
/** Called only after incoming faction/targetability/invulnerability early returns. */
export function argentIncoming(w:CombatWorld,attack:{trueDamage?:boolean;damageOverTime?:boolean;sourceEnemyId?:number},h:ArgentHooks){
 const s=states.get(w);if(!s?.guard||attack.trueDamage||attack.damageOverTime)return 1;
 const now=w.elapsed,g=s.guard;if(now>=g.until||g.remaining===0&&now>=g.beatUntil){closeGuard(w,Math.min(g.until,g.remaining===0?g.beatUntil:Infinity));return 1;}
 if(now>=g.beatUntil){g.remaining--;g.used++;g.beatUntil=Math.min(g.until,now+A.beat);
  if(g.rank>=4){s.temper=Math.min(3,(s.temperUntil>now?s.temper:0)+1);s.temperUntil=now+A.temperDuration;}
  if(g.rank>=2&&g.used===1){const e=w.enemies.find(e=>e.id===attack.sourceEnemyId&&valid(w,e,h)&&canTargetEnemy(w,e));const a=e?Math.atan2(e.y-w.playerY,e.x-w.playerX):-Math.PI/2;
   blade(w,ARGENT_SKILLS[0],{id:g.id,rank:g.rank,at:now,hits:new Map()},w.playerX,w.playerY,a,A.counterRange,1);}
  fx(w,'guard',w.playerX,w.playerY,now,55,.22);
 }else fx(w,'impact',w.playerX,w.playerY,now,18,.12);
 return A.guardFactor;
}
export function argentPrimaryHit(w:CombatWorld,shot:object & {argentGenesisEligible?:boolean},x=w.playerX,y=w.playerY){
 if(w.aircraft.aircraftId!=='argent'||!live(w))return;const s=argentState(w);if(s.seen.has(shot))return;s.seen.add(shot);fx(w,'impact',x,y,w.elapsed,20,.18);if(shot.argentGenesisEligible===false||argentArrayActive(w))return;
 s.progress=Math.min(4,s.progress+1);if(s.progress<4||w.elapsed<s.genesisReady)return;
 s.progress=0;s.genesisReady=w.elapsed+A.genesisGap;
 blade(w,'genesis',{id:w.nextId++,rank:1,at:w.elapsed,hits:new Map()},w.playerX,w.playerY,-Math.PI/2,A.range,A.genesis[passiveTier(w.aircraft.level)]);fx(w,'launch',w.playerX,w.playerY);
}
export function argentArrayActive(w:CombatWorld,at=w.elapsed){const a=states.get(w)?.array;return !!a&&live(w)&&at<a.until;}
function closeArray(w:CombatWorld,at:number){
 const s=argentState(w),a=s.array;if(!a)return;s.array=undefined;
 for(const e of a.emitters)fx(w,'expire',e.x,e.y,at,48,.45);
 finish(w,ARGENT_SKILLS[3],at);
}
export function argentArrayTarget(w:CombatWorld,h:ArgentHooks){
 const targets=w.enemies.filter(e=>valid(w,e,h)&&canTargetEnemy(w,e));
 return targets.find(e=>e.id===w.playerTargetId)??targets.sort((a,b)=>Math.hypot(a.x-w.playerX,a.y-w.playerY)-Math.hypot(b.x-w.playerX,b.y-w.playerY)||a.id-b.id)[0];
}
/** Called once after a real main volley has spawned, even when every shot misses. */
export function argentPrimaryFired(w:CombatWorld,shot:object,h:ArgentHooks,at=w.elapsed){
 if(w.aircraft.aircraftId!=='argent'||!live(w))return;
 const s=argentState(w),a=s.array;if(!a)return;
 if(at>=a.until){closeArray(w,a.until);return;}
 if(a.seen.has(shot))return;a.seen.add(shot);
 if(++a.fireCount<A.arrayShots)return;a.fireCount=0;
 const target=argentArrayTarget(w,h),wave:ArrayWave={id:w.nextId++,castId:a.id,rank:a.rank,hits:new Map()};
 for(const emitter of a.emitters){
  emitter.angle=target?Math.atan2(target.y-emitter.y,target.x-emitter.x):-Math.PI/2;emitter.firedAt=at;
  blade(w,ARGENT_SKILLS[3],a,emitter.x,emitter.y,emitter.angle,Math.hypot(R.right-R.left,R.bottom-R.top)*2,argentValues(ARGENT_SKILLS[3],a.rank).damageMultiplier,at,wave,emitter.id);
  fx(w,'wave',emitter.x+Math.cos(emitter.angle)*24,emitter.y+Math.sin(emitter.angle)*24,at,26,.16);
 }
}
export function argentArmorMultiplier(w:CombatWorld,e:EnemyEntity){const mark=states.get(w)?.armorMarks.get(e.id);return mark?.entity===e&&mark.until>w.elapsed?A.markArmor:1;}
function markArmor(w:CombatWorld,e:EnemyEntity,at:number){
 const actor=e.aircraftTarget?.world;if(actor&&celestialProtection(actor.aircraft))return;
 const duration=actor?negativeStatusDuration(actor.aircraft,A.markDuration):A.markDuration;
 argentState(w).armorMarks.set(e.id,{entity:e,until:at+duration,duration});fx(w,'mark',e.x,e.y,at,38,.5);
}
export function beginArgentSkill(w:CombatWorld,id:ArgentSkillId,h:ArgentHooks){
 const s=argentState(w),rank=skillRank(w.aircraft,id),v=argentValues(id,rank),c:Cast={id:w.nextId++,rank,at:w.elapsed,hits:new Map()};
 w.aircraft.activeEffects[id]=v.duration;(w.aircraft.activeEffectDurations??={})[id]=v.duration;
 if(id===ARGENT_SKILLS[0]){s.guard={...c,until:w.elapsed+A.guardDuration,beatUntil:0,remaining:v.count,used:0};fx(w,'stance',w.playerX,w.playerY);}
 else if(id===ARGENT_SKILLS[1]){s.launch=c;for(const degrees of A.fan)blade(w,id,c,w.playerX,w.playerY,-Math.PI/2+degrees*Math.PI/180,A.range,v.damageMultiplier);fx(w,'launch',w.playerX,w.playerY);}
 else if(id===ARGENT_SKILLS[2]){
  const critSnapshot=clamp(getEffectiveAircraftStats(w.aircraft).criticalChance,0,1);
  const cooldownMultiplier=s.array&&s.array.rank>=3&&w.elapsed<s.array.until?.5:1;
  const recall:Recall={...c,temper:s.temperUntil>w.elapsed?s.temper:0,refund:0,critSnapshot,critMultiplier:rank>=5?1+.75*critSnapshot:1,cooldownMultiplier};
  // Capture eligibility once, before deferred settlement; borrowed debt stays separate.
  const deferred=w.aircraft.coreState.deferredCooldowns[id];
  if(deferred!==undefined)w.aircraft.coreState.deferredCooldowns[id]=deferred*cooldownMultiplier;
  s.recall=recall;recallSnapshots.set(w.aircraft,recall);s.temper=0;s.temperUntil=0;
  for(const b of s.blades)if(b.phase==='wait'){b.phase='recall';b.recall=recall;b.at=w.elapsed;b.speed=A.recallSpeed*(rank>=2?A.recallUpgrade:1);b.width=A.width;fx(w,recall.critMultiplier>1?'reunion':'recall',b.x,b.y);}}
 else {s.array={...c,until:w.elapsed+v.duration,fireCount:0,emitters:argentEmitterPositions(),seen:new WeakSet()};for(const e of s.array.emitters)fx(w,'summon',e.x,e.y,w.elapsed,60,.4);}
}
function control(w:CombatWorld,e:EnemyEntity,root:number,slow:number,duration:number,at:number){
 const actor=e.aircraftTarget?.world;
 if(actor&&(celestialProtection(actor.aircraft)||hardControlImmune(actor.aircraft)))return;
 const s=argentState(w),old=s.controls.get(e.id),t=old?.entity===e?old:{entity:e,rootUntil:0,slowUntil:0,slow:1};
 const seconds=actor?negativeStatusDuration(actor.aircraft,root||duration):root||duration;
 if(root){if(at+seconds>t.rootUntil)t.rootUntil=statusExpiry(t,'rootUntil',at,seconds);}else {t.slow=t.slowUntil>at?Math.min(t.slow,1-slow):1-slow;if(at+seconds>t.slowUntil)t.slowUntil=statusExpiry(t,'slowUntil',at,seconds);}
 s.controls.set(e.id,t);fx(w,root?'root':'slow',e.x,e.y,at,32,seconds);
}
export function argentMovement(w:CombatWorld,e:EnemyEntity){const t=states.get(w)?.controls.get(e.id);return !t||t.entity!==e||e.aircraftTarget&&hardControlImmune(e.aircraftTarget.world.aircraft)?1:t.rootUntil>w.elapsed?0:t.slowUntil>w.elapsed?t.slow:1;}
export function clearArgentSlow(w:CombatWorld,e:EnemyEntity){const t=states.get(w)?.controls.get(e.id);if(t){t.slowUntil=0;t.slow=1;}}
function deal(w:CombatWorld,e:EnemyEntity,ratio:number,id:ArgentSkillId|undefined,c:Cast,h:ArgentHooks){return h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*ratio,id,c.id);}
function hit(w:CombatWorld,b:ArgentBlade,e:EnemyEntity,at:number,h:ArgentHooks){
 const recall=b.phase==='recall'?b.recall:undefined,hitset=recall?b.returnHits:b.hits;if(hitset.has(e.id)||!valid(w,e,h))return;hitset.add(e.id);
 const c=recall??b.cast,n=(c.hits.get(e.id)??0)+1;c.hits.set(e.id,n);
 let ratio=b.ratio,id=b.source==='genesis'?undefined:b.source==='break'?ARGENT_SKILLS[0]:b.source;
 if(recall){id=ARGENT_SKILLS[2];ratio=argentValues(id,recall.rank).damageMultiplier*recall.critMultiplier;}
 else if(b.source===ARGENT_SKILLS[1]&&b.cast.rank<3&&b.hits.size>1)ratio*=.75;
 const result=deal(w,e,ratio,id,c,h);fx(w,'impact',e.x,e.y,at,24);
 if(recall){
  if(n===1&&recall.temper>0){deal(w,e,recall.temper*A.temperBonus,id,c,h);fx(w,'cross',e.x,e.y,at,35);}
  if(n===3&&recall.rank>=3){if(boss(e))control(w,e,0,.15,1,at);else control(w,e,!e.aircraftTarget&&h.elite(e)?.4:.8,0,0,at);}
  if(recall.rank>=4&&!b.refunded&&result.total>0){b.refunded=true;const fraction=Math.min(A.refund,Math.max(0,A.refundCap-recall.refund));recall.refund+=fraction;const max=getEffectiveAircraftStats(w.aircraft).maxResource;w.aircraft.currentResource=Math.min(max,w.aircraft.currentResource+max*fraction);if(fraction>0)fx(w,'refund',e.x,e.y,at,20,.45);}
 }else if(b.source===ARGENT_SKILLS[1]&&b.cast.rank>=5&&n===2){deal(w,e,1,id,c,h);fx(w,'cross',e.x,e.y,at,42);}
 if(!recall&&b.wave&&b.wave.rank>=2&&b.emitterId!==undefined&&result.total>0){
  const emitters=b.wave.hits.get(e.id)??new Set<number>(),before=emitters.size;emitters.add(b.emitterId);b.wave.hits.set(e.id,emitters);
  if(before<3&&emitters.size===3)markArmor(w,e,at);
 }
}
function travel(w:CombatWorld,from:number,to:number,h:ArgentHooks){
 const s=argentState(w),events:{b:ArgentBlade;e:EnemyEntity;at:number}[]=[],ends:{b:ArgentBlade;at:number}[]=[];
 for(const b of s.blades){if(b.phase==='wait'){
   const dx=w.playerX-b.x,dy=w.playerY-b.y;
   if(Math.hypot(dx,dy)>1e-8)b.angle=Math.atan2(dy,dx);
   continue;
  }const start=Math.max(from,b.at),dt=to-start;if(dt<=0)continue;
  const recall=b.phase==='recall',dx=w.playerX-b.x,dy=w.playerY-b.y,d=Math.hypot(dx,dy);if(recall)b.angle=Math.atan2(dy,dx);
  const remaining=recall?d:b.distance,step=Math.min(remaining,b.speed*dt),ox=b.x,oy=b.y;
  const target=argentClip(ox,oy,ox+Math.cos(b.angle)*step,oy+Math.sin(b.angle)*step)?.to??point(ox,oy),actual=Math.hypot(target.x-ox,target.y-oy),duration=actual/b.speed;
  const hits=recall?b.returnHits:b.hits;
  for(const e of w.enemies){if(hits.has(e.id)||!valid(w,e,h))continue;const r=segmentVsAircraft(ox,oy,target.x,target.y,b.width/2,getEnemyHitbox(e),createHitResult());
   if(r.hit)events.push({b,e,at:start+duration*r.t});}
  b.trail.push({x:ox,y:oy});if(b.trail.length>10)b.trail.shift();b.x=target.x;b.y=target.y;b.distance=Math.max(0,b.distance-actual);
  if(step>=remaining-1e-7||actual<step-1e-7)ends.push({b,at:start+duration});
 }
 events.sort((a,b)=>a.at-b.at||a.b.id-b.b.id||a.e.id-b.e.id);for(const event of events)hit(w,event.b,event.e,event.at,h);
 for(const {b,at} of ends){if(b.phase==='recall'){s.blades=s.blades.filter(v=>v!==b);fx(w,'join',w.playerX,w.playerY,at,28);}else wait(w,b,at);}
 if(s.launch&&!s.blades.some(b=>b.phase==='out'&&b.cast===s.launch)){const ended=Math.max(from,...ends.filter(e=>e.b.cast===s.launch).map(e=>e.at));s.launch=undefined;finish(w,ARGENT_SKILLS[1],ended);}
 if(s.recall&&!s.blades.some(b=>b.phase==='recall'&&b.recall===s.recall)){const ended=Math.max(from,...ends.filter(e=>e.b.recall===s.recall).map(e=>e.at));s.recall=undefined;recallSnapshots.delete(w.aircraft);finish(w,ARGENT_SKILLS[2],ended);}
}
export function tickArgent(w:CombatWorld,dt:number,h:ArgentHooks){
 const s=states.get(w);if(!s)return;if(!live(w)){cancelArgent(w);return;}
 const now=w.elapsed,start=s.updated>now?now-dt:Math.max(s.updated,now-dt);s.updated=now;
 // Split only at real lifecycle deadlines; firing events are owned by fireBasic.
 const times=[start,now],g=s.guard,a=s.array;
 if(g){const end=Math.min(g.until,g.remaining===0?g.beatUntil:Infinity);if(end>=start&&end<=now)times.push(end);}
 if(a&&a.until>=start&&a.until<=now)times.push(a.until);
 const timeline=[...new Set(times)].sort((a,b)=>a-b);let previous=start;
 for(const t of timeline){travel(w,previous,t,h);previous=t;
  if(s.guard&&(t>=s.guard.until||s.guard.remaining===0&&t>=s.guard.beatUntil))closeGuard(w,t);
  if(s.array&&t>=s.array.until)closeArray(w,s.array.until);
 }
 s.blades=s.blades.filter(b=>{if(b.phase==='wait'&&b.waitAt+b.ttl<=now){fx(w,'expire',b.x,b.y,b.waitAt+b.ttl,18);return false;}return true;});
 s.effects=s.effects.filter(e=>e.at+e.life>now);if(s.temperUntil<=now)s.temper=0;
 for(const [id,c] of s.controls)if(c.entity.hp<=0||!w.enemies.includes(c.entity)||Math.max(c.rootUntil,c.slowUntil)<=now)s.controls.delete(id);
 for(const [id,m] of s.armorMarks)if(m.entity.hp<=0||!w.enemies.includes(m.entity)||m.until<=now)s.armorMarks.delete(id);
 if(s.array)w.aircraft.activeEffects[ARGENT_SKILLS[3]]=Math.max(.00001,s.array.until-now);
 if(s.guard)w.aircraft.activeEffects[ARGENT_SKILLS[0]]=Math.max(.00001,s.guard.until-now);
}
export function cancelArgent(w:CombatWorld){recallSnapshots.delete(w.aircraft);if(!states.has(w))return;states.delete(w);const c=w.aircraft.coreState,prior=c.stacks.cancellingSkills;c.stacks.cancellingSkills=1;for(const id of ARGENT_SKILLS)endAircraftSkill(w.aircraft,id);if(prior===undefined)delete c.stacks.cancellingSkills;else c.stacks.cancellingSkills=prior;}
export function argentRecallOpportunity(w:CombatWorld,x:number,y:number,radius=30){return states.get(w)?.blades.some(b=>b.phase==='wait'&&segmentDistance(x,y,b.x,b.y,w.playerX,w.playerY)<radius)??false;}
export function argentThreatNearby(w:CombatWorld,x:number,y:number,radius:number){
 const s=states.get(w);if(!s)return false;
 if(s.blades.some(b=>b.phase!=='wait'&&segmentDistance(x,y,b.x,b.y,b.x+Math.cos(b.angle)*Math.min(b.distance,b.speed*.35),b.y+Math.sin(b.angle)*Math.min(b.distance,b.speed*.35))<=radius+b.width/2))return true;
 if(s.array&&s.array.fireCount===A.arrayShots-1)for(const e of s.array.emitters)if(segmentDistance(x,y,e.x,e.y,e.x+Math.cos(e.angle)*A.arraySpeed*.35,e.y+Math.sin(e.angle)*A.arraySpeed*.35)<=radius+A.width/2)return true;
 return false;
}
function segmentDistance(x:number,y:number,ax:number,ay:number,bx:number,by:number){const dx=bx-ax,dy=by-ay,t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-ax-dx*t,y-ay-dy*t);}

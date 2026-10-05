import type { CombatWorld, EnemyEntity } from './airCombatRuntime';
import type { SkillId } from './airCombatTypes';
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
interface Recall extends Cast {temper:number;refund:number}
interface ArrayCast extends Cast {x:number;y:number;pair:number;pairs:Map<number,number>;double:Map<number,number>;endedAt?:number}
export interface ArgentBlade {
 id:number;owner:CombatWorld;source:ArgentSkillId|'genesis'|'break';cast:Cast;phase:'out'|'wait'|'recall';
 x:number;y:number;angle:number;distance:number;speed:number;width:number;ratio:number;ttl:number;at:number;waitAt:number;
 hits:Set<number>;returnHits:Set<number>;recall?:Recall;refunded:boolean;pair?:number;array?:ArrayCast;trail:{x:number;y:number}[];
}
export interface ArgentEffect {id:number;kind:'stance'|'guard'|'impact'|'launch'|'recall'|'join'|'refund'|'root'|'slow'|'cross'|'heart'|'break'|'pair'|'expire';x:number;y:number;at:number;life:number;size:number}
export interface ArgentState {
 blades:ArgentBlade[];guard?:{rank:number;at:number;until:number;beatUntil:number;remaining:number;used:number;id:number};
 temper:number;temperUntil:number;progress:number;genesisReady:number;seen:WeakSet<object>;
 launch?:Cast;recall?:Recall;array?:ArrayCast;effects:ArgentEffect[];
 controls:Map<number,{entity:EnemyEntity;rootUntil:number;slowUntil:number;slow:number}>;updated:number;
}
const states=new WeakMap<CombatWorld,ArgentState>();
export function argentState(w:CombatWorld):ArgentState {let s=states.get(w);if(!s){s={blades:[],temper:0,temperUntil:0,progress:0,genesisReady:0,seen:new WeakSet(),effects:[],controls:new Map(),updated:w.elapsed};states.set(w,s);}return s;}
export const argentWaiting=(w:CombatWorld)=>states.get(w)?.blades.filter(b=>b.phase==='wait').length??0;
const live=(w:CombatWorld)=>w.aircraft.currentHp>0&&!w.destruction&&!w.aftermath&&!w.ended;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const point=(x:number,y:number)=>({x:clamp(x,R.left,R.right),y:clamp(y,R.top,R.bottom)});
/** Clip a line to the arena without bending its angle at an edge. */
export function argentClip(ax:number,ay:number,bx:number,by:number){
 const dx=bx-ax,dy=by-ay;let lo=0,hi=1;
 for(const [p,q] of [[-dx,ax-R.left],[dx,R.right-ax],[-dy,ay-R.top],[dy,R.bottom-ay]]){
  if(Math.abs(p)<1e-9){if(q<0)return null;continue;}
  const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return null;
 }
 return {from:{x:ax+dx*lo,y:ay+dy*lo},to:{x:ax+dx*hi,y:ay+dy*hi}};
}
const valid=(w:CombatWorld,e:EnemyEntity,h:ArgentHooks)=>live(w)&&e.hp>0&&h.hostile(w,e)&&e.x+e.radius>=R.left&&e.x-e.radius<=R.right&&e.y+e.radius>=R.top&&e.y-e.radius<=R.bottom;
const boss=(e:EnemyEntity)=>!e.aircraftTarget&&e.type==='boss';
function fx(w:CombatWorld,kind:ArgentEffect['kind'],x:number,y:number,at=w.elapsed,size=32,life=.28){const s=argentState(w);s.effects.push({id:w.nextId++,kind,x,y,at,size,life});if(s.effects.length>96)s.effects.splice(0,s.effects.length-96);}
function finish(w:CombatWorld,id:ArgentSkillId,at:number){endAircraftSkill(w.aircraft,id);w.aircraft.cooldowns[id]=Math.max(0,(w.aircraft.cooldowns[id]??0)-Math.max(0,w.elapsed-at));}
function blade(w:CombatWorld,source:ArgentBlade['source'],cast:Cast,x:number,y:number,angle:number,range:number,ratio:number,at=w.elapsed,array?:ArrayCast,pair?:number){
 const heavy=source==='break'||!!array,p=point(x,y);
 const b:ArgentBlade={id:w.nextId++,owner:w,source,cast,phase:'out',...p,angle,distance:range,speed:heavy?A.heavySpeed:A.speed,width:heavy?A.heavyWidth:A.width,ratio,ttl:source===ARGENT_SKILLS[1]&&cast.rank>=4?A.extendedTtl:A.ttl,at,waitAt:0,hits:new Set(),returnHits:new Set(),refunded:false,array,pair,trail:[]};
 argentState(w).blades.push(b);return b;
}
function wait(w:CombatWorld,b:ArgentBlade,at:number){
 const s=argentState(w);if(b.source==='break'){s.blades=s.blades.filter(v=>v!==b);return;}
 b.phase='wait';b.waitAt=at;b.trail=[];
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
export function argentPrimaryHit(w:CombatWorld,shot:object){
 if(w.aircraft.aircraftId!=='argent'||!live(w))return;const s=argentState(w);if(s.seen.has(shot))return;s.seen.add(shot);
 s.progress=Math.min(4,s.progress+1);if(s.progress<4||w.elapsed<s.genesisReady)return;
 s.progress=0;s.genesisReady=w.elapsed+A.genesisGap;
 blade(w,'genesis',{id:w.nextId++,rank:1,at:w.elapsed,hits:new Map()},w.playerX,w.playerY,-Math.PI/2,A.range,A.genesis[passiveTier(w.aircraft.level)]);fx(w,'launch',w.playerX,w.playerY);
}
/** Exact disk candidates include target centers and both radius-r circle intersections.
 * Thus a cluster between targets can win even when no target is at its center. */
export function argentArrayCenter(w:CombatWorld,h:ArgentHooks){
 const targets=w.enemies.filter(e=>valid(w,e,h)&&canTargetEnemy(w,e)&&e.y<=w.playerY&&Math.hypot(e.x-w.playerX,e.y-w.playerY)<=A.arrayRange).sort((a,b)=>a.id-b.id);
 if(!targets.length)return point(w.playerX,w.playerY-A.arrayFallback);
 const candidates=targets.map(e=>({x:e.x,y:e.y,id:e.id}));
 candidates.push({x:w.playerX,y:w.playerY,id:targets[0].id});
 for(const e of targets){
  const dx=w.playerX-e.x,dy=w.playerY-e.y,d=Math.hypot(dx,dy),r=A.arrayRadius;
  if(d>r)candidates.push({x:e.x+dx*r/d,y:e.y+dy*r/d,id:e.id});
  // Boundary intersections also matter when the maximum-density disk is clipped.
  for(const x of [R.left,R.right]){const q=r*r-(x-e.x)**2;if(q>=0)for(const sign of [-1,1])candidates.push({x,y:e.y+sign*Math.sqrt(q),id:e.id});}
  for(const y of [R.top,Math.min(R.bottom,w.playerY)]){const q=r*r-(y-e.y)**2;if(q>=0)for(const sign of [-1,1])candidates.push({x:e.x+sign*Math.sqrt(q),y,id:e.id});}
 }
 for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++){const a=targets[i],b=targets[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<1e-8||d>A.arrayRadius*2)continue;const k=Math.sqrt(Math.max(0,A.arrayRadius*A.arrayRadius-d*d/4))/d;
  for(const sign of [-1,1])candidates.push({x:(a.x+b.x)/2-dy*k*sign,y:(a.y+b.y)/2+dx*k*sign,id:a.id});}
 return candidates.map(c=>{const p=point(c.x,c.y),inside=targets.filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<=A.arrayRadius+1e-7);return {...p,id:inside[0]?.id??c.id,count:inside.length,boss:inside.some(boss)?1:0,elite:inside.some(e=>!e.aircraftTarget&&h.elite(e))?1:0,d:Math.hypot(p.x-w.playerX,p.y-w.playerY)};}).filter(c=>c.y<=w.playerY&&c.d<=A.arrayRange+1e-7)
  .sort((a,b)=>b.count-a.count||b.boss-a.boss||b.elite-a.elite||a.d-b.d||a.id-b.id||a.x-b.x||a.y-b.y)[0];
}
export function beginArgentSkill(w:CombatWorld,id:ArgentSkillId,h:ArgentHooks){
 const s=argentState(w),rank=skillRank(w.aircraft,id),v=argentValues(id,rank),c:Cast={id:w.nextId++,rank,at:w.elapsed,hits:new Map()};
 w.aircraft.activeEffects[id]=v.duration;(w.aircraft.activeEffectDurations??={})[id]=v.duration;
 if(id===ARGENT_SKILLS[0]){s.guard={...c,until:w.elapsed+A.guardDuration,beatUntil:0,remaining:v.count,used:0};fx(w,'stance',w.playerX,w.playerY);}
 else if(id===ARGENT_SKILLS[1]){s.launch=c;for(const degrees of A.fan)blade(w,id,c,w.playerX,w.playerY,-Math.PI/2+degrees*Math.PI/180,A.range,v.damageMultiplier);fx(w,'launch',w.playerX,w.playerY);}
 else if(id===ARGENT_SKILLS[2]){const recall:Recall={...c,temper:s.temperUntil>w.elapsed?s.temper:0,refund:0};s.recall=recall;s.temper=0;s.temperUntil=0;
  for(const b of s.blades)if(b.phase==='wait'){b.phase='recall';b.recall=recall;b.at=w.elapsed;b.speed=A.recallSpeed*(rank>=2?A.recallUpgrade:1);b.width=A.width;fx(w,'recall',b.x,b.y);}}
 else {s.array={...c,...argentArrayCenter(w,h),pair:0,pairs:new Map(),double:new Map()};}
}
function control(w:CombatWorld,e:EnemyEntity,root:number,slow:number,duration:number,at:number){
 const actor=e.aircraftTarget?.world;
 if(actor&&(celestialProtection(actor.aircraft)||hardControlImmune(actor.aircraft)))return;
 const s=argentState(w),old=s.controls.get(e.id),t=old?.entity===e?old:{entity:e,rootUntil:0,slowUntil:0,slow:1};
 const seconds=actor?negativeStatusDuration(actor.aircraft,root||duration):root||duration;
 if(root)t.rootUntil=Math.max(t.rootUntil,at+seconds);else {t.slow=t.slowUntil>at?Math.min(t.slow,1-slow):1-slow;t.slowUntil=Math.max(t.slowUntil,at+seconds);}
 s.controls.set(e.id,t);fx(w,root?'root':'slow',e.x,e.y,at,32,seconds);
}
export function argentMovement(w:CombatWorld,e:EnemyEntity){const t=states.get(w)?.controls.get(e.id);return !t||t.entity!==e||e.aircraftTarget&&hardControlImmune(e.aircraftTarget.world.aircraft)?1:t.rootUntil>w.elapsed?0:t.slowUntil>w.elapsed?t.slow:1;}
export function clearArgentSlow(w:CombatWorld,e:EnemyEntity){const t=states.get(w)?.controls.get(e.id);if(t){t.slowUntil=0;t.slow=1;}}
function deal(w:CombatWorld,e:EnemyEntity,ratio:number,id:ArgentSkillId|undefined,c:Cast,h:ArgentHooks){return h.damage(w,e,getEffectiveAircraftStats(w.aircraft).firepower*ratio,id,c.id);}
function hit(w:CombatWorld,b:ArgentBlade,e:EnemyEntity,at:number,h:ArgentHooks){
 const recall=b.phase==='recall'?b.recall:undefined,hitset=recall?b.returnHits:b.hits;if(hitset.has(e.id)||!valid(w,e,h))return;hitset.add(e.id);
 const c=recall??b.cast,n=(c.hits.get(e.id)??0)+1;c.hits.set(e.id,n);
 let ratio=b.ratio,id=b.source==='genesis'?undefined:b.source==='break'?ARGENT_SKILLS[0]:b.source;
 if(recall){id=ARGENT_SKILLS[2];ratio=argentValues(id,recall.rank).damageMultiplier*(n<=3?1:n<=6?(recall.rank>=5?.6:.5):(recall.rank>=5?.3:.25));}
 else if(b.source===ARGENT_SKILLS[1]&&b.cast.rank<3&&b.hits.size>1)ratio*=.75;
 const result=deal(w,e,ratio,id,c,h);fx(w,'impact',e.x,e.y,at,24);
 if(recall){
  if(n===1&&recall.temper>0){deal(w,e,recall.temper*A.temperBonus,id,c,h);fx(w,'cross',e.x,e.y,at,35);}
  if(n===3&&recall.rank>=3){if(boss(e))control(w,e,0,.15,1,at);else control(w,e,!e.aircraftTarget&&h.elite(e)?.4:.8,0,0,at);}
  if(recall.rank>=4&&!b.refunded&&result.total>0){b.refunded=true;const fraction=Math.min(A.refund,Math.max(0,A.refundCap-recall.refund));recall.refund+=fraction;const max=getEffectiveAircraftStats(w.aircraft).maxResource;w.aircraft.currentResource=Math.min(max,w.aircraft.currentResource+max*fraction);if(fraction>0)fx(w,'refund',e.x,e.y,at,20,.45);}
 }else if(b.source===ARGENT_SKILLS[1]&&b.cast.rank>=5&&n===2){deal(w,e,1,id,c,h);fx(w,'cross',e.x,e.y,at,42);}
 if(b.array&&b.pair!==undefined){const a=b.array,mask=a.pairs.get(e.id)??0;a.pairs.set(e.id,mask|(1<<b.pair));const key=e.id*3+b.pair,count=(a.double.get(key)??0)+1;a.double.set(key,count);if(a.rank>=2&&count===2)control(w,e,0,boss(e)?.15:.3,2,at);}
}
function travel(w:CombatWorld,from:number,to:number,h:ArgentHooks){
 const s=argentState(w),events:{b:ArgentBlade;e:EnemyEntity;at:number}[]=[],ends:{b:ArgentBlade;at:number}[]=[];
 for(const b of s.blades){if(b.phase==='wait')continue;const start=Math.max(from,b.at),dt=to-start;if(dt<=0)continue;
  const recall=b.phase==='recall',dx=w.playerX-b.x,dy=w.playerY-b.y,d=Math.hypot(dx,dy);if(recall)b.angle=Math.atan2(dy,dx);
  const remaining=recall?d:b.distance,step=Math.min(remaining,b.speed*dt),ox=b.x,oy=b.y;
  const target=argentClip(ox,oy,ox+Math.cos(b.angle)*step,oy+Math.sin(b.angle)*step)?.to??point(ox,oy),actual=Math.hypot(target.x-ox,target.y-oy),duration=actual/b.speed;
  const hits=recall?b.returnHits:b.hits;
  for(const e of w.enemies){if(hits.has(e.id)||!valid(w,e,h))continue;const r=segmentVsAircraft(ox,oy,target.x,target.y,b.width/2,getEnemyHitbox(e),createHitResult());
   if(r.hit&&(!b.array||recall||Math.hypot(r.x-b.array.x,r.y-b.array.y)<=A.arrayRadius+1e-7))events.push({b,e,at:start+duration*r.t});}
  b.trail.push({x:ox,y:oy});if(b.trail.length>10)b.trail.shift();b.x=target.x;b.y=target.y;b.distance=Math.max(0,b.distance-actual);
  if(step>=remaining-1e-7||actual<step-1e-7)ends.push({b,at:start+duration});
 }
 events.sort((a,b)=>a.at-b.at||a.b.id-b.b.id||a.e.id-b.e.id);for(const event of events)hit(w,event.b,event.e,event.at,h);
 for(const {b,at} of ends){if(b.phase==='recall'){s.blades=s.blades.filter(v=>v!==b);fx(w,'join',w.playerX,w.playerY,at,28);}else wait(w,b,at);}
 if(s.array?.pair===3&&!s.blades.some(b=>b.array===s.array&&b.phase==='out'))s.array.endedAt=Math.max(from,...ends.filter(e=>e.b.array===s.array).map(e=>e.at));
 if(s.launch&&!s.blades.some(b=>b.phase==='out'&&b.cast===s.launch)){const ended=Math.max(from,...ends.filter(e=>e.b.cast===s.launch).map(e=>e.at));s.launch=undefined;finish(w,ARGENT_SKILLS[1],ended);}
 if(s.recall&&!s.blades.some(b=>b.phase==='recall'&&b.recall===s.recall)){const ended=Math.max(from,...ends.filter(e=>e.b.recall===s.recall).map(e=>e.at));s.recall=undefined;finish(w,ARGENT_SKILLS[2],ended);}
}
export function tickArgent(w:CombatWorld,dt:number,h:ArgentHooks){
 const s=states.get(w);if(!s)return;if(!live(w)){cancelArgent(w);return;}
 const now=w.elapsed,start=s.updated>now?now-dt:Math.max(s.updated,now-dt);s.updated=now;
 // Split at every scheduled event, so a long frame never moves a newly born pair
 // for time before it existed, or ends a cooldown twice.
 const times=[start,now],g=s.guard,a=s.array;
 if(g){const end=Math.min(g.until,g.remaining===0?g.beatUntil:Infinity);if(end>=start&&end<=now)times.push(end);}
 if(a)for(let pair=a.pair;pair<3;pair++){const t=a.at+A.arrayWarning+pair*A.arrayGap;if(t>=start&&t<=now)times.push(t);}
 if(a){const end=a.at+argentValues(ARGENT_SKILLS[3],a.rank).duration;if(end>=start&&end<=now)times.push(end);}
 const timeline=[...new Set(times)].sort((a,b)=>a-b);let previous=start;
 for(const t of timeline){travel(w,previous,t,h);previous=t;
  if(s.guard&&(t>=s.guard.until||s.guard.remaining===0&&t>=s.guard.beatUntil))closeGuard(w,t);
  if(s.array){const c=s.array;while(c.pair<3&&c.at+A.arrayWarning+c.pair*A.arrayGap<=t+1e-8){const pair=c.pair++,angle=pair*Math.PI/3,at=c.at+A.arrayWarning+pair*A.arrayGap;
    for(const sign of [-1,1]){const x=c.x+Math.cos(angle)*A.arrayRadius*sign,y=c.y+Math.sin(angle)*A.arrayRadius*sign;
     // Clip the diameter to the actual arena before measuring travel distance.
     const clipped=argentClip(x,y,c.x-Math.cos(angle)*A.arrayRadius*sign,c.y-Math.sin(angle)*A.arrayRadius*sign);
     const origin=clipped?.from??point(c.x,c.y),end=clipped?.to??origin;
     blade(w,ARGENT_SKILLS[3],c,origin.x,origin.y,Math.atan2(end.y-origin.y,end.x-origin.x),Math.hypot(end.x-origin.x,end.y-origin.y),argentValues(ARGENT_SKILLS[3],c.rank).damageMultiplier,at,c,pair);}
    fx(w,'pair',c.x,c.y,at,80,.1);
   }
   if(c.pair===3&&!s.blades.some(b=>b.array===c&&b.phase==='out')){const ended=c.endedAt??t;s.array=undefined;if(c.rank>=3)for(const e of w.enemies)if(c.pairs.get(e.id)===7&&valid(w,e,h)){deal(w,e,3,ARGENT_SKILLS[3],c,h);fx(w,'heart',e.x,e.y,ended,52,.4);}finish(w,ARGENT_SKILLS[3],ended);}
  }
 }
 s.blades=s.blades.filter(b=>{if(b.phase==='wait'&&b.waitAt+b.ttl<=now){fx(w,'expire',b.x,b.y,b.waitAt+b.ttl,18);return false;}return true;});
 s.effects=s.effects.filter(e=>e.at+e.life>now);if(s.temperUntil<=now)s.temper=0;
 for(const [id,c] of s.controls)if(c.entity.hp<=0||!w.enemies.includes(c.entity)||Math.max(c.rootUntil,c.slowUntil)<=now)s.controls.delete(id);
 if(s.guard)w.aircraft.activeEffects[ARGENT_SKILLS[0]]=Math.max(.00001,s.guard.until-now);
}
export function cancelArgent(w:CombatWorld){if(!states.has(w))return;states.delete(w);const c=w.aircraft.coreState,prior=c.stacks.cancellingSkills;c.stacks.cancellingSkills=1;for(const id of ARGENT_SKILLS)endAircraftSkill(w.aircraft,id);if(prior===undefined)delete c.stacks.cancellingSkills;else c.stacks.cancellingSkills=prior;}
export function argentRecallOpportunity(w:CombatWorld,x:number,y:number,radius=30){return states.get(w)?.blades.some(b=>b.phase==='wait'&&segmentDistance(x,y,b.x,b.y,w.playerX,w.playerY)<radius)??false;}
export function argentThreatNearby(w:CombatWorld,x:number,y:number,radius:number){
 const s=states.get(w);if(!s)return false;
 if(s.blades.some(b=>b.phase!=='wait'&&segmentDistance(x,y,b.x,b.y,b.x+Math.cos(b.angle)*Math.min(b.distance,b.speed*.35),b.y+Math.sin(b.angle)*Math.min(b.distance,b.speed*.35))<=radius+b.width/2))return true;
 if(s.array)for(let i=s.array.pair;i<3;i++){const a=i*Math.PI/3,c=s.array;if(segmentDistance(x,y,c.x-Math.cos(a)*A.arrayRadius,c.y-Math.sin(a)*A.arrayRadius,c.x+Math.cos(a)*A.arrayRadius,c.y+Math.sin(a)*A.arrayRadius)<=radius+A.heavyWidth/2)return true;}
 return false;
}
function segmentDistance(x:number,y:number,ax:number,ay:number,bx:number,by:number){const dx=bx-ax,dy=by-ay,t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-ax-dx*t,y-ay-dy*t);}

import { aircraftTargetability } from "./airCombatTargetability";
import { GAMEPLAY_SAFE_RECT as R, AIRCRAFT_CONFIGS } from "./airCombatConfig";
import { meteorSpearEndpoints } from "./airCombatAstra";
import { getEffectiveAircraftStats, getSkillRuntimeValues } from "./airCombatAircraft";
import { getWorldSkillAvailability, type CombatWorld } from "./airCombatRuntime";
import { skillRank } from "./airCombatSkillRanks";
import { playerAirframeScale } from "./airCombatReleaseState";
import { mirrorPoint } from "./airCombatMirrorTransform";
import type { AircraftCombatState, SkillId } from "./airCombatTypes";

type Point = { x: number; y: number };
type Intent = "evade" | "kite" | "pressure" | "reposition" | "hold-angle" | "combo-setup" | "recover-up";
export type DuelThreatKind = "ballistic" | "homing" | "beam" | "lane" | "aoe" | "persistent_zone" | "dash" | "full_screen";
interface Bullet extends Point { vx:number; vy:number; damage:number; homing:boolean; radius:number; turnRate:number }
interface Hazard extends Point { kind:DuelThreatKind; radius:number; cc:boolean; end?:Point }
interface Perception { targetVisible:boolean; at:number; player:Point; playerHp:number; velocity:Point; bullets:Bullet[]; hazards:Hazard[]; lastDefensiveCast:number; lastBurst:number }
interface DuelTacticalPlan { kind:string; startedAt:number; expiresAt:number; nextSkill?:SkillId; reservedResource?:number }
export interface MirrorAI {
  nextSense:number; nextDecision:number; history:Perception[]; observedCasts:Partial<Record<SkillId,number>>;
  lastPlayer:Point; goal:Point; vx:number; vy:number; intent:Intent; intentUntil:number;
  threat:number; incoming:number; lastHp:number; lastPlayerHp:number; losing:boolean;
  lastCast?:SkillId; lastCastAt?:number; lastSampleAt?:number; lastSampleWallMs?:number;
  targetLostAt?:number; lastKnownVelocity?:Point;
  readySince:Partial<Record<SkillId,number>>; plan?:DuelTacticalPlan;
  dodgeUntil:number; dodge?:Point; needsVerticalRecovery:boolean;
}
export const createMirrorAI = (x:number,y:number):MirrorAI => ({nextSense:0,nextDecision:0,history:[],observedCasts:{},lastPlayer:{x,y},goal:{x,y},vx:0,vy:0,intent:"hold-angle",intentUntil:0,threat:0,incoming:0,lastHp:0,lastPlayerHp:0,losing:false,readySince:{},dodgeUntil:0,needsVerticalRecovery:false});
export function observeMirrorCast(ai:MirrorAI,id:SkillId,at:number){ai.observedCasts[id]=at;}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const bounded=(p:Point):Point=>({x:clamp(p.x,R.left+25,R.right-25),y:clamp(p.y,R.top+25,R.bottom-25)});
const segmentDistance=(p:Point,a:Point,b:Point)=>{
  const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);
  return distance(p,{x:a.x+dx*t,y:a.y+dy*t});
};
export function ballisticTCA(p:Point,velocity:Point,b:Bullet) {
  const rx=b.x-p.x,ry=b.y-p.y,vx=b.vx-velocity.x,vy=b.vy-velocity.y;
  const t=clamp(-(rx*vx+ry*vy)/(vx*vx+vy*vy||1),0,.85);
  return {time:t,distance:Math.hypot(rx+vx*t,ry+vy*t)};
}
function homingAt(b:Bullet,target:Point,seconds:number):Point {
  let x=b.x,y=b.y,angle=Math.atan2(b.vy,b.vx);const speed=Math.hypot(b.vx,b.vy),step=seconds/6;
  for(let i=0;i<6;i++){
    const wanted=Math.atan2(target.y-y,target.x-x),diff=Math.atan2(Math.sin(wanted-angle),Math.cos(wanted-angle));
    angle+=clamp(diff,-b.turnRate*step,b.turnRate*step);x+=Math.cos(angle)*speed*step;y+=Math.sin(angle)*speed*step;
  }
  return {x,y};
}
function threatApproach(p:Point,velocity:Point,b:Bullet) {
  if(!b.homing)return ballisticTCA(p,velocity,b);
  let closest={time:0,distance:distance(p,b)};
  for(let i=1;i<=7;i++){
    const time=i*.12,target={x:p.x+velocity.x*time,y:p.y+velocity.y*time};
    const gap=distance(target,homingAt(b,target,time));
    if(gap<closest.distance)closest={time,distance:gap};
  }
  return closest;
}
function hazardCost(p:Point,h:Hazard,radius:number) {
  if(h.kind==="full_screen")return 0; // Defense policy, never pretend there is a dodge corridor.
  const d=h.end?segmentDistance(p,h,h.end):h.kind==="lane"?Math.abs(p.x-h.x):distance(p,h);
  return Math.max(0,1-d/(h.radius+radius+12))*(h.cc?7:5);
}
function trajectoryCost(from:Point,to:Point,seen:Perception,radius:number) {
  let danger=0;
  for(let i=1;i<=7;i++){
    const t=i/7*.55,p={x:from.x+(to.x-from.x)*i/7,y:from.y+(to.y-from.y)*i/7};
    for(const b of seen.bullets){
      const at=b.homing?homingAt(b,p,t):{x:b.x+b.vx*t,y:b.y+b.vy*t};
      danger+=Math.max(0,1-distance(p,at)/(radius+b.radius+(b.homing?22:10)))*(b.homing?2.5:1.5);
    }
    for(const h of seen.hazards)danger+=hazardCost(p,h,radius);
  }
  return danger/7;
}
function verticalBands(player:Point) {
  return {preferred:clamp(player.y-180,R.top+35,R.bottom-180),soft:Math.max(R.top+35,player.y-100),hard:Math.max(R.top+45,player.y-60)};
}
function positionalCost(p:Point,seen:Perception,intent:Intent) {
  const band=verticalBands(seen.player),edge=Math.min(p.x-R.left,R.right-p.x,p.y-R.top,R.bottom-p.y);
  const trap=Math.max(0,p.y-band.soft)/12+Math.max(0,p.y-band.hard)/5+Math.max(0,p.y-(R.top+R.height*.65))/18;
  const escape=Math.max(0,40-edge)/8;
  const vertical=Math.abs(p.y-band.preferred)/(intent==="recover-up"?35:150);
  const line=Math.abs(p.x-seen.player.x)/120;
  return trap+escape+vertical+(intent==="evade"?0:intent==="kite"?Math.max(0,180-distance(p,seen.player))/40:line*.6);
}
function skillUtility(id: SkillId, s: AircraftCombatState, ai: MirrorAI, p: Point, seen: Perception, actor: CombatWorld) {
  const ready = getWorldSkillAvailability(actor, id); if (!ready.available || (ready.toggle && !ready.manualAction)) return -Infinity;
  const leadSeconds = clamp(getSkillRuntimeValues(s, id).charge || .35, .12, .8);
  const predictedY = seen.player.y + seen.velocity.y * leadSeconds;
  const ahead = seen.player.y > p.y + 35 && predictedY > p.y + 25;
  // Only extrapolate already observed motion; actor state is our own public action.
  const predictedX = clamp(seen.player.x + seen.velocity.x * leadSeconds, R.left, R.right);
  const firing = ahead ? clamp(1 - Math.abs(p.x - predictedX) / 65, 0, 1) : 0;
  if (ready.manualAction) {
    if (id === "orbit_reversal") {
      const orbit = actor.astra?.orbit;
      return orbit && orbit.captured > 0 && firing > .45
        ? (orbit.captured >= 6 || orbit.until - actor.elapsed < .6 ? 1.8 : .4) : -Infinity;
    }
    if (id === "gravity_anchor") {
      const anchor = actor.rankRuntime?.anchor;
      if (!anchor) return -Infinity;
      const at = mirrorPoint(anchor.x, anchor.y);
      const inside = distance(at, seen.player) < 120 * (anchor.rank >= 2 ? 1.25 : 1);
      const charged = anchor.destroyed >= 4 || [...anchor.inner.values()].some(seconds => seconds >= 2);
      return inside && (charged || anchor.until - actor.elapsed < .65) ? 1.7 : -Infinity;
    }
    if (id === "heavy_bomb") {
      // Rank 5 and the 1-second arm gate come from getWorldSkillAvailability.
      // Current BigBang affects the whole gameplay area, not a new local radius.
      const targetInArea = seen.player.x >= R.left && seen.player.x <= R.right && seen.player.y >= R.top && seen.player.y <= R.bottom;
      return targetInArea ? 1.6 : -Infinity;
    }
    return -Infinity;
  }
  if (!seen.targetVisible && ["predator_lock", "missile_swarm", "focus_laser", "stellar_lance", "starfall"].includes(id)) return -Infinity;
  if (["focus_laser", "sweeping_cannon", "stellar_lance"].includes(id) && (!ahead || firing < .3)) return -Infinity;
  const combo = (setup: SkillId) => ai.lastCast === setup && ai.lastCastAt !== undefined && actor.elapsed - ai.lastCastAt <= 2;
  const stats = getEffectiveAircraftStats(s), values = getSkillRuntimeValues(s, id), hp = s.currentHp / stats.maxHp;
  const safe = 1 / (1 + ai.threat), line = clamp(1 - Math.abs(p.x - seen.player.x) / 90, 0, 1);
  const edge = Math.min(seen.player.x - R.left, R.right - seen.player.x) < 55 ? 1 : .2;
  const steady = 1 / (1 + Math.abs(seen.velocity.x) / 130), danger = clamp(ai.incoming / stats.maxHp / .12, 0, 2);
  const recentlyDefended = seen.at - seen.lastDefensiveCast < 2 ? 1 : .15;
  const committed = seen.at - seen.lastBurst < 1 ? 1 : .2;
  const density = Math.min(2, seen.bullets.reduce((n,b)=>n+(b.homing?3:1),0)/12);
  const defense = ({black_eagle:"decoy",breaker:"armor_shield",phantom:"invisibility",astra:"orbit_reversal"} as const)[s.aircraftId];
  const defenseReady = (s.skillRanks[defense]??0)>0 && (s.cooldowns[defense]??0)<1.5;
  const reserveCost = defenseReady && danger>.25 && id!==defense ? getSkillRuntimeValues(s,defense).cost : 0;
  const plannedCost = ai.plan?.nextSkill && ai.plan.nextSkill!==id && safe>.6 ? (ai.plan.reservedResource??0)*.4 : 0;
  const reserve = Math.max(0, values.cost + Math.max(reserveCost,plannedCost) - s.currentResource) / stats.maxResource;
  const fullScreen = seen.hazards.some(h=>h.kind==="full_screen") ? 1.5 : 0;
  const opportunity: Record<SkillId, number> = {
    decoy: danger + density * .35 + committed * .3,
    afterburner: ahead ? line * safe * (combo("predator_lock") ? 1.5 : 1) + (skillRank(s,id)>=5 ? danger*.25 : 0) : 0,
    predator_lock: line * safe * steady * (s.currentResource > stats.maxResource * .35 ? 1.3 : .2),
    missile_swarm: ahead ? .5 + safe * (recentlyDefended + edge * .5) : .15,
    armor_shield: danger + fullScreen + (ai.plan?.nextSkill === "sweeping_cannon" ? .55 : 0),
    gravity_anchor: .4 + edge*.4 + committed * .35,
    heavy_bomb: combo("gravity_anchor") ? 1.5 * line : (.45 + edge*.3) * steady,
    sweeping_cannon: firing * safe * steady * 1.3,
    invisibility: danger + fullScreen + (ai.intent === "combo-setup" ? .8 : .15),
    focus_laser: firing * steady * safe * (combo("invisibility") ? 1.7 : 1),
    electronic_interference: density * .6 + seen.bullets.filter(b => b.homing).length * .18,
    escort_drone: s.droneActive ? 0 : safe * (stats.resourceRegen > values.upkeepPerSecond ? 1.2 : .45),
    orbit_reversal: density * .8 + danger * .5 + (skillRank(s,id)>=4 ? fullScreen : 0),
    stellar_lance: firing * steady * safe * 1.3,
    twin_reflection: safe * 1.1,
    starfall: .4 + safe * (edge*.5 + committed * .4),
  };
  const ultimate = ["missile_swarm", "sweeping_cannon", "escort_drone", "starfall"].includes(id);
  const defensive = ["decoy", "armor_shield", "invisibility", "electronic_interference", "orbit_reversal"].includes(id);
  const phaseFit = hp < .3 && ultimate ? 1.3 : hp <= .6 && ai.losing && defensive ? 1.2 : 1;
  const waste = !defensive && values.damageMultiplier * stats.firepower > ai.lastPlayerHp * 2 ? .3 : 0;
  const castLockRisk = !defensive && ["focus_laser", "sweeping_cannon", "stellar_lance"].includes(id) ? danger * .8 : 0;
  const viable = opportunity[id] > .12;
  if (!viable) return -Infinity;
  const readyAge = Math.max(0, actor.elapsed - (ai.readySince[id] ?? actor.elapsed) - 1);
  const spendBonus = s.currentResource >= stats.maxResource * .82 ? .35 : 0;
  const planned = ai.plan?.nextSkill===id ? .4 : 0;
  return opportunity[id] * phaseFit + Math.min(.45,readyAge*.06) + spendBonus + planned - reserve * 2 - waste - castLockRisk;
}

function perceive(w:CombatWorld,ai:MirrorAI,p:Point) {
  const targetVisible = aircraftTargetability(w.aircraft).canTrackExactPosition && !w.destruction;
  const player = targetVisible ? {x:w.playerX,y:w.playerY} : {...ai.lastPlayer};
  const reacquired = targetVisible && ai.targetLostAt !== undefined;
  if (!targetVisible) ai.targetLostAt ??= w.elapsed;
  else ai.targetLostAt = undefined;
  const wall=performance.now(),sampleDt=ai.lastSampleAt===undefined?0:w.elapsed-ai.lastSampleAt;
  const reseed=sampleDt<=0||sampleDt>.3||ai.lastSampleWallMs===undefined||wall-ai.lastSampleWallMs>300;
  if(reseed){ai.history=[];ai.vx=ai.vy=0;ai.dodge=undefined;ai.plan=undefined;}
  const velocity = !targetVisible ? ai.lastKnownVelocity ?? {x:0,y:0} : reseed || reacquired ? {x:0,y:0} : {x:(player.x-ai.lastPlayer.x)/sampleDt,y:(player.y-ai.lastPlayer.y)/sampleDt};
  if (targetVisible) { ai.lastPlayer = player; ai.lastKnownVelocity = velocity; }
  const latest=(ids:SkillId[])=>Math.max(-Infinity,...ids.map(id=>ai.observedCasts[id]??-Infinity));
  // Spawned attacks only. Scan the already runtime-bounded pool; shortlist before path work.
  const visible=w.projectiles.filter(b=>b.owner!=="enemy"&&!b.mirrorBorrowed&&b.lifetime>0).sort((a,b)=>distance(a,p)-distance(b,p));
  let homing=0;
  const bullets=visible.filter(b=>!b.homing||homing++<16).slice(0,64).map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy,damage:b.rawDamage,homing:b.homing,radius:b.radius,turnRate:b.turnRate}));
  const hazards:Hazard[]=w.warnings.filter(z=>z.owner==="player").slice(0,16).map(z=>({x:z.x,y:z.y,radius:z.radius,cc:!!z.payload?.stun,
    kind:z.kind==="lane_laser"?"lane":z.kind==="rail"?"beam":z.kind==="dash"?"dash":"aoe",
    end:z.kind==="rail"||z.kind==="dash"?{x:z.fromX??z.x,y:z.fromY??z.y}:undefined}));
  if(w.laserCharge>0||w.laserRemaining>0)hazards.push({kind:"beam",x:w.playerX,y:w.playerY,end:{x:w.playerX,y:R.top},radius:30,cc:false});
  if(w.rankRuntime?.anchor)hazards.push({kind:"persistent_zone",x:w.rankRuntime.anchor.x,y:w.rankRuntime.anchor.y,radius:120,cc:true});
  for(const burn of (w.astra?.burns??[]).slice(0,4))hazards.push({kind:"persistent_zone",x:burn.x,y:burn.y,radius:burn.radius,cc:false});
  // BigBang's visible traveling missile is a full-arena threat, not a local circle.
  if(visible.some(b=>b.bigBang))hazards.push({kind:"full_screen",x:p.x,y:p.y,radius:Infinity,cc:true});
  for(const m of (w.astra?.starfall?.pending??[]).slice(0,4))hazards.push({kind:"aoe",x:m.x,y:m.y,radius:m.doom?110:skillRank(w.aircraft,"starfall")>=2?65:45,cc:false});
  for(const beam of (w.astra?.meteorSpears??[]).filter(b=>w.elapsed>=b.warningStartsAt&&w.elapsed<b.beamEndsAt).slice(0,2)){
    const path=meteorSpearEndpoints(beam);
    hazards.push({kind:"beam",...path.start,end:path.end,radius:beam.projectileHitboxWidth/2,cc:false});
  }
  if(w.astra?.charge)hazards.push({kind:"beam",x:w.playerX,y:w.playerY,end:{x:w.playerX,y:R.top},radius:22,cc:false});
  for(const b of visible.filter(b=>b.skillId==="stellar_lance").slice(0,2))hazards.push({kind:"beam",x:b.x,y:b.y,end:{x:b.x+b.vx*.6,y:b.y+b.vy*.6},radius:b.radius,cc:false});
  ai.history.push({targetVisible,at:w.elapsed,player,playerHp:targetVisible?w.aircraft.currentHp:ai.lastPlayerHp,velocity,bullets,hazards:hazards.slice(0,24),
    lastDefensiveCast:latest(["decoy","invisibility","armor_shield","orbit_reversal"]),lastBurst:latest(["missile_swarm","sweeping_cannon","focus_laser","starfall"])});
  ai.history=ai.history.slice(-10);ai.lastSampleAt=w.elapsed;ai.lastSampleWallMs=wall;ai.nextSense=w.elapsed+1/30;
}
function roleThreshold(id:SkillId,actor:CombatWorld,ai:MirrorAI) {
  if(getWorldSkillAvailability(actor,id).manualAction)return .2;
  if(["decoy","armor_shield","invisibility","orbit_reversal","electronic_interference"].includes(id))return ai.threat>1?.25:.30;
  if(["missile_swarm","sweeping_cannon","escort_drone","starfall"].includes(id))return .42;
  return .35;
}
function updatePlan(ai:MirrorAI,s:AircraftCombatState,now:number) {
  if(ai.plan&&ai.plan.expiresAt<=now)ai.plan=undefined;
  const follow:Partial<Record<SkillId,SkillId>>={predator_lock:"afterburner",gravity_anchor:"heavy_bomb",armor_shield:"sweeping_cannon",invisibility:"focus_laser",twin_reflection:"stellar_lance",orbit_reversal:"starfall"};
  if(ai.lastCast&&ai.lastCastAt!==undefined&&now-ai.lastCastAt<2){
    const next=follow[ai.lastCast];
    if(next&&(!ai.plan||ai.plan.startedAt<ai.lastCastAt))ai.plan={kind:`${ai.lastCast}:${next}`,startedAt:ai.lastCastAt,expiresAt:ai.lastCastAt+3,nextSkill:next,reservedResource:getSkillRuntimeValues(s,next).cost};
  }
}
/** The 160ms inbox gates both pilot and tactical reactions; own movement is current. */
export function updateMirrorAI(w:CombatWorld,ai:MirrorAI,s:AircraftCombatState,p:Point,dt:number,actor:CombatWorld):{x:number;y:number;skill?:SkillId} {
  if(w.elapsed>=ai.nextSense)perceive(w,ai,p);
  const seen=[...ai.history].reverse().find(snapshot=>snapshot.at<=w.elapsed-.16);
  let skill:SkillId|undefined,emergency=false;
  if(seen){
    const radius=17*playerAirframeScale(s),band=verticalBands(seen.player);
    // Refresh projectile positions from delayed observations only, never unspawned input.
    const danger=seen.bullets.map(b=>({b,...threatApproach(p,{x:ai.vx,y:ai.vy},b)})).filter(t=>t.distance<radius+t.b.radius+12);
    const first=danger.sort((a,b)=>a.time-b.time)[0];
    ai.incoming=danger.reduce((n,t)=>n+t.b.damage*(t.time<.25?1:t.time<.5?.75:.35),0);
    ai.threat=danger.reduce((n,t)=>n+(t.time<.25?3:t.time<.5?2:1),0)+seen.hazards.reduce((n,h)=>n+hazardCost(p,h,radius),0);
    emergency=ai.threat>1;
    ai.needsVerticalRecovery=p.y>band.soft||(ai.needsVerticalRecovery&&p.y>band.preferred+20);
    if(emergency){
      ai.intent="evade";
      const heading=first?Math.atan2(first.b.vy,first.b.vx):Math.atan2(ai.vy,ai.vx);
      const candidates=[heading+Math.PI/2,heading-Math.PI/2,-Math.PI/2,-Math.PI/4,-3*Math.PI/4,0,Math.PI,Math.PI/2]
        .map(a=>bounded({x:p.x+Math.cos(a)*120,y:p.y+Math.sin(a)*120}));
      const route=(q:Point)=>trajectoryCost(p,q,seen,radius);
      const safestUp=Math.min(...candidates.filter(q=>q.y<=p.y+1).map(route));
      const scored=candidates.map(q=>({q,risk:route(q)})).filter(({q,risk})=>p.y<band.hard||q.y<=p.y+1||risk+.5<safestUp)
        .map(({q,risk})=>({q,score:risk*12+positionalCost(q,seen,"evade")})).sort((a,b)=>a.score-b.score);
      const best=scored[0];
      if(best){
        const old=ai.dodge?route(ai.dodge)*12+positionalCost(ai.dodge,seen,"evade"):Infinity;
        if(!ai.dodge||w.elapsed>=ai.dodgeUntil||old>best.score+4){ai.dodge=best.q;ai.dodgeUntil=w.elapsed+.32;}
        ai.goal=ai.dodge!;
        if(ai.goal.y>band.soft)ai.needsVerticalRecovery=true;
      }
    }
    if(w.elapsed>=ai.nextDecision){
      ai.nextDecision=w.elapsed+.1;
      ai.losing=ai.lastHp-s.currentHp>ai.lastPlayerHp-seen.playerHp;ai.lastHp=s.currentHp;ai.lastPlayerHp=seen.playerHp;
      updatePlan(ai,s,w.elapsed);
      if(!emergency){
        ai.intent=ai.needsVerticalRecovery?"recover-up":ai.plan?"combo-setup":ai.losing?"kite":Math.abs(p.x-seen.player.x)>80?"reposition":Math.abs(p.x-seen.player.x)<25?"hold-angle":"pressure";
        const strafe=Math.sin(w.elapsed*1.8)*45;
        const desiredX=clamp(seen.player.x+strafe,R.left+35,R.right-35);
        const candidates=ai.intent==="recover-up"?[-85,0,85].map(dx=>bounded({x:p.x+dx,y:Math.min(p.y-100,band.preferred)})):
          [-65,0,65].flatMap(dx=>[-35,0,35].map(dy=>bounded({x:desiredX+dx,y:band.preferred+dy})));
        const legal=candidates.filter(q=>q.y<=band.hard&&(p.y<=band.soft||q.y<=p.y));
        legal.sort((a,b)=>(trajectoryCost(p,a,seen,radius)*6+positionalCost(a,seen,ai.intent)+distance(a,p)/300)-(trajectoryCost(p,b,seen,radius)*6+positionalCost(b,seen,ai.intent)+distance(b,p)/300));
        if(legal[0])ai.goal=legal[0];
        // Never retain a stale bottom goal after a dodge.
        else ai.goal=bounded({x:p.x,y:Math.min(p.y,band.soft)});
      }
      let bestUtility=0;
      for(const id of AIRCRAFT_CONFIGS[s.aircraftId].skillIds){
        const available=getWorldSkillAvailability(actor,id);
        if(available.available)ai.readySince[id]??=w.elapsed;else delete ai.readySince[id];
        const utility=skillUtility(id,s,ai,p,seen,actor)-roleThreshold(id,actor,ai);
        if(utility>bestUtility){bestUtility=utility;skill=id;}
      }
    }
  } else {
    ai.goal=bounded({x:R.left+R.width/2+Math.sin(w.elapsed*1.8)*40,y:R.top+80});
  }
  const dx=ai.goal.x-p.x,dy=ai.goal.y-p.y,length=Math.hypot(dx,dy),speed=emergency?310:250;
  const desiredX=dx/Math.max(1,length)*Math.min(speed,length*5),desiredY=dy/Math.max(1,length)*Math.min(speed,length*5);
  const dvx=desiredX-ai.vx,dvy=desiredY-ai.vy,turn=Math.min(1,1400*dt/(Math.hypot(dvx,dvy)||1));
  ai.vx+=dvx*turn;ai.vy+=dvy*turn;
  // Cast-lock is authoritative; the pilot does not slide while channeling a fixed beam.
  if(actor.laserCharge>0||actor.laserRemaining>0){ai.vx=ai.vy=0;}
  if (skill && !aircraftTargetability(w.aircraft).canAcquire && ["predator_lock","missile_swarm","focus_laser","stellar_lance","starfall"].includes(skill)) skill = undefined;
  if (actor.aftermath || actor.destruction || s.currentHp <= 0) return {...p};
  return {...bounded({x:p.x+ai.vx*dt,y:p.y+ai.vy*dt}),skill};
}

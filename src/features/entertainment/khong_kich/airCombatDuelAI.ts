import { cinderState, cinderStacks } from './airCombatCinderRuntime';
import { cinderValues } from './airCombatCinderConfig';
import { aircraftTargetability } from "./airCombatTargetability";
import { GAMEPLAY_SAFE_RECT as R, AIRCRAFT_CONFIGS } from "./airCombatConfig";
import { INTERFERENCE_WAVE_SPEED, INTERFERENCE_WAVE_THICKNESS } from "./airCombatRankRuntime";
import { meteorSpearEndpoints } from "./airCombatAstra";
import { getEffectiveAircraftStats, getSkillRuntimeValues } from "./airCombatAircraft";
import { getWorldSkillAvailability, type CombatWorld } from "./airCombatRuntime";
import { skillRank } from "./airCombatSkillRanks";
import { playerAirframeScale } from "./airCombatReleaseState";
import { mirrorPoint } from "./airCombatMirrorTransform";
import type { AircraftCombatState, SkillId } from "./airCombatTypes";

type Point = { x: number; y: number };
type Intent = "evade" | "kite" | "pressure" | "reposition" | "hold-angle" | "combo-setup" | "recover-up";
export type DuelThreatKind = "ballistic" | "homing" | "beam" | "lane" | "aoe" | "persistent_zone" | "dash" | "full_screen" | "wave";
interface Bullet extends Point { vx:number; vy:number; damage:number; homing:boolean; radius:number; turnRate:number; lifetime:number; capturable:boolean }
interface Hazard extends Point { kind:DuelThreatKind; radius:number; cc:boolean; end?:Point; startsAt:number; endsAt:number; tracksUntil?:number; velocity?:Point; wave?:{radius:number;at:number} }
interface Perception { hasStarfallTarget:boolean; targetProtected:boolean; targetVisible:boolean; at:number; player:Point; playerHp:number; velocity:Point; bullets:Bullet[]; hazards:Hazard[]; lastBurst:number }
interface DuelTacticalPlan { kind:string; startedAt:number; expiresAt:number; nextSkill?:SkillId }
export interface MirrorAI {
  nextSense:number; nextDecision:number; history:Perception[]; observedCasts:Partial<Record<SkillId,number>>;
  lastPlayer:Point; goal:Point; vx:number; vy:number; intent:Intent; intentUntil:number;
  threat:number; incoming:number; lastHp:number; lastPlayerHp:number; losing:boolean;
  lastCast?:SkillId; lastCastAt?:number; lastSampleAt?:number; lastSampleWallMs?:number;
  targetLostAt?:number; lastKnownVelocity?:Point;
  escapeRisk:number; plan?:DuelTacticalPlan;
  dodgeUntil:number; dodge?:Point; needsVerticalRecovery:boolean;
}
export const createMirrorAI = (x:number,y:number):MirrorAI => ({nextSense:0,nextDecision:0,history:[],observedCasts:{},lastPlayer:{x,y},goal:{x,y},vx:0,vy:0,intent:"hold-angle",intentUntil:0,threat:0,incoming:0,lastHp:0,lastPlayerHp:0,losing:false,escapeRisk:0,dodgeUntil:0,needsVerticalRecovery:false});
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
function hazardCost(p:Point,h:Hazard,radius:number,at:number,previous=at) {
  if(at<h.startsAt-.1 || previous>h.endsAt)return 0;
  if(h.kind==="full_screen")return 0; // No imaginary dodge corridor for arena-wide attacks.
  if(h.wave){
    const gap=distance(p,h),before=gap-h.wave.radius-(previous-h.wave.at)*INTERFERENCE_WAVE_SPEED,after=gap-h.wave.radius-(at-h.wave.at)*INTERFERENCE_WAVE_SPEED;
    const d=before*after<=0?0:Math.min(Math.abs(before),Math.abs(after));
    return Math.max(0,1-d/(radius+INTERFERENCE_WAVE_THICKNESS/2+12))*7;
  }
  const d=h.end?segmentDistance(p,h,h.end):h.kind==="lane"?Math.abs(p.x-h.x):distance(p,h);
  return Math.max(0,1-d/(h.radius+radius+12))*(h.cc?7:5);
}
/** Advance only the delayed public observation. This is prediction, not live aim-reading. */
function projectPerception(seen:Perception,now:number,p:Point):Perception {
  const age=Math.max(0,now-seen.at);
  return {...seen,at:now,player:seen.targetVisible?bounded({x:seen.player.x+seen.velocity.x*age,y:seen.player.y+seen.velocity.y*age}):seen.player,
    bullets:seen.bullets.filter(b=>b.lifetime>age).map(b=>{
      const at=b.homing?homingAt(b,p,age):{x:b.x+b.vx*age,y:b.y+b.vy*age};
      const speed=Math.hypot(b.vx,b.vy),angle=Math.atan2(p.y-at.y,p.x-at.x),old=Math.atan2(b.vy,b.vx);
      const turn=b.homing?clamp(Math.atan2(Math.sin(angle-old),Math.cos(angle-old)),-b.turnRate*age,b.turnRate*age):0;
      return {...b,...at,vx:Math.cos(old+turn)*speed,vy:Math.sin(old+turn)*speed,lifetime:b.lifetime-age};
    }),
    hazards:seen.hazards.filter(h=>h.endsAt>=now).map(h=>{
      const tracking=Math.max(0,Math.min(age,(h.tracksUntil??seen.at)-seen.at));
      return {...h,x:h.x+(h.velocity?.x??0)*tracking,y:h.y+(h.velocity?.y??0)*tracking};
    })};
}
/** Score reachable, accelerated paths and swept contacts, not just destination points. */
function trajectoryCost(from:Point,to:Point,seen:Perception,radius:number,velocity:Point,speed:number) {
  let danger=0,p={...from},v={...velocity};
  const step=.08;
  for(let i=1;i<=8;i++){
    const previous={...p},t=i*step,dx=to.x-p.x,dy=to.y-p.y,length=Math.hypot(dx,dy);
    const pace=Math.min(speed,length*5),dvx=dx/Math.max(1,length)*pace-v.x,dvy=dy/Math.max(1,length)*pace-v.y;
    const turn=Math.min(1,1400*step/(Math.hypot(dvx,dvy)||1));
    v.x+=dvx*turn;v.y+=dvy*turn;p=bounded({x:p.x+v.x*step,y:p.y+v.y*step});
    for(const b of seen.bullets){
      if(b.lifetime<(i-1)*step)continue;
      const before=b.homing?homingAt(b,previous,t-step):{x:b.x+b.vx*(t-step),y:b.y+b.vy*(t-step)};
      const at=b.homing?homingAt(b,p,t):{x:b.x+b.vx*t,y:b.y+b.vy*t};
      const gap=segmentDistance({x:0,y:0},{x:previous.x-before.x,y:previous.y-before.y},{x:p.x-at.x,y:p.y-at.y});
      danger+=Math.max(0,1-gap/(radius+b.radius+(b.homing?18:10)))*(b.homing?2.5:1.5);
    }
    for(const h of seen.hazards)danger+=hazardCost(p,h,radius,seen.at+t,seen.at+t-step);
  }
  return danger/8;
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
      return orbit && orbit.captured > 0 && firing > .45 && (ai.incoming <= 0 || orbit.until - actor.elapsed < .35)
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
      return targetInArea && !seen.targetProtected ? 1.6 : -Infinity;
    }
    return -Infinity;
  }
  const defensive = ["cinder_fire_shield", "decoy", "armor_shield", "invisibility", "electronic_interference", "orbit_reversal"].includes(id);
  if (!seen.targetVisible && !defensive && !(id==="starfall"&&seen.hasStarfallTarget)) return -Infinity;
  if (["cinder_inferno_beam", "focus_laser", "sweeping_cannon", "stellar_lance"].includes(id) && (!ahead || firing < .5)) return -Infinity;
  const combo = (setup: SkillId) => ai.lastCast === setup && ai.lastCastAt !== undefined && actor.elapsed - ai.lastCastAt <= 2;
  const stats = getEffectiveAircraftStats(s), values = getSkillRuntimeValues(s, id), hp = s.currentHp / stats.maxHp;
  const safe = 1 / (1 + ai.escapeRisk), line = clamp(1 - Math.abs(p.x - seen.player.x) / 90, 0, 1);
  const edge = Math.min(seen.player.x - R.left, R.right - seen.player.x) < 55 ? 1 : .2;
  const steady = 1 / (1 + Math.abs(seen.velocity.x) / 130), danger = clamp(ai.incoming / stats.maxHp / .1, 0, 3);
  const committed = seen.at - seen.lastBurst < 1 ? 1 : 0;
  const nearby=seen.bullets.filter(b=>{
    const approach=threatApproach(p,{x:ai.vx,y:ai.vy},b);
    return approach.time<Math.min(.75,b.lifetime)&&approach.distance<70+b.radius;
  });
  const density=Math.min(2,nearby.length/6),homing=nearby.filter(b=>b.homing).length;
  const capturable=nearby.filter(b=>b.capturable).length;
  const fullScreen=seen.hazards.some(h=>h.kind==="full_screen"&&h.startsAt<=seen.at+.65)?1:0;
  const areaDanger=seen.hazards.reduce((n,h)=>n+hazardCost(p,h,17*playerAirframeScale(s),seen.at+.4,seen.at),0);
  const needsDefense=danger>.12||density>=.5||areaDanger>1||fullScreen>0;
  const protectedNow=(s.activeEffects.armor_shield??0)>.6 || (skillRank(s,"orbit_reversal")>=4&&(s.activeEffects.orbit_reversal??0)>.6);
  // Hidden hulls can still be hit by beams/AoE; do not treat invisibility as immunity.
  if(defensive&&(!needsDefense || protectedNow&&danger<1.2&&areaDanger<3))return -Infinity;
  if(defensive&&ai.escapeRisk<.12&&danger<.9&&areaDanger<1&&!fullScreen&&!(id==="orbit_reversal"&&capturable>=3))return -Infinity;
  if(id==="decoy" && (nearby.length===0 || actor.decoys.some(d=>d.active&&d.remaining>.45)&&danger<1))return -Infinity;
  if(id==="orbit_reversal" && capturable===0 && !(skillRank(s,id)>=4&&(areaDanger>1||fullScreen)))return -Infinity;
  if(id==="electronic_interference" && nearby.length<2 && homing===0 && areaDanger<=1)return -Infinity;
  if(id==="invisibility" && homing===0 && areaDanger<=1 && danger<.35)return -Infinity;
  const sinceCast=actor.elapsed-(ai.lastCastAt??-Infinity),planned=ai.plan?.nextSkill===id;
  // Emergency defense may interrupt the offensive cadence, but casts do not cascade every decision.
  if(sinceCast<(defensive?.2:planned?.4:.85))return -Infinity;
  const defense = ({cinder:"cinder_fire_shield",black_eagle:"decoy",breaker:"armor_shield",phantom:"invisibility",astra:"orbit_reversal"} as const)[s.aircraftId];
  const defenseReady=skillRank(s,defense)>0&&(s.cooldowns[defense]??0)<3&&(s.activeEffects[defense]??0)<=0;
  const reserveCost=!defensive&&defenseReady?Math.min(getSkillRuntimeValues(s,defense).cost,Math.max(0,stats.maxResource-values.cost)):0;
  const lethalWindow=seen.playerHp>0&&seen.playerHp<stats.firepower*Math.max(1,values.damageMultiplier)&&firing>.7;
  if(!defensive&&s.currentResource-values.cost<reserveCost&&!lethalWindow&&hp>.25)return -Infinity;
  if(!defensive&&seen.targetProtected&&!["gravity_anchor","twin_reflection","escort_drone"].includes(id))return -Infinity;
  const burn=Math.max(0,...actor.enemies.filter(e=>e.hp>0).map(e=>cinderStacks(actor,e.id)));
  const opportunity: Record<SkillId, number> = {
    cinder_fire_shield:danger+fullScreen*1.8+areaDanger*.5,
    cinder_fuel_barrage:ahead?safe*(.6+steady*.5+committed*.4):0,
    cinder_heat_wave:safe*(burn>0?.8+burn*.15:.35),
    cinder_inferno_beam:firing*steady*safe*(burn>0?1.6:1.1),
    decoy: danger + density*.65 + homing*.3,
    afterburner: ahead ? line*safe*(combo("predator_lock")?1.5:1) : 0,
    predator_lock: ahead ? line*safe*steady*1.3 : 0,
    missile_swarm: ahead ? safe*(.65+edge*.35+committed*.4+steady*.25) : 0,
    armor_shield: danger + fullScreen*1.8 + areaDanger*.5,
    gravity_anchor: ahead ? .35+edge*.45+committed*.5+(steady>.7?.4:0) : 0,
    heavy_bomb: combo("gravity_anchor") ? 1.5 : .5+committed*.5+edge*.3,
    sweeping_cannon: firing*safe*steady*1.5,
    invisibility: danger + homing*.35 + areaDanger*.4,
    focus_laser: firing*steady*safe*(combo("invisibility")?1.7:1.4),
    electronic_interference: density*.8+homing*.25+areaDanger*.2,
    escort_drone: s.droneActive?0: safe*(stats.resourceRegen>=values.upkeepPerSecond || s.currentResource-values.cost-reserveCost>values.upkeepPerSecond*6?1.1:0),
    orbit_reversal: Math.min(2,capturable/3)+danger*.5+(skillRank(s,id)>=4?fullScreen*1.5+areaDanger*.4:0),
    stellar_lance: firing*steady*safe*1.5,
    twin_reflection: ahead&&line>.6 ? safe*(steady+.35) : 0,
    starfall: safe*(.35+edge*.4+committed*.45+steady*.5),
  };
  const ultimate=["missile_swarm","sweeping_cannon","escort_drone","starfall"].includes(id);
  const phaseFit=hp<.3&&ultimate?1.2:hp<=.6&&ai.losing&&defensive?1.2:1;
  // Readiness age and a full resource bar never create an opportunity on their own.
  if(opportunity[id]<.3)return -Infinity;
  const waste=!defensive&&!lethalWindow&&values.damageMultiplier*stats.firepower>seen.playerHp*2?.3:0;
  return opportunity[id]*phaseFit+(planned&&!defensive?.2:0)+(defensive&&ai.escapeRisk>.4?.5:0)-waste;
}

function perceive(w:CombatWorld,ai:MirrorAI,p:Point,actor:CombatWorld) {
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
  const bullets=visible.filter(b=>!b.homing||homing++<16).slice(0,64).map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy,damage:b.rawDamage,homing:b.homing,radius:b.radius,turnRate:b.turnRate,lifetime:b.lifetime,capturable:b.capturable}));
  const hazards:Hazard[]=w.warnings.filter(z=>z.owner==="player").slice(0,16).map(z=>({x:z.x,y:z.y,radius:z.radius,cc:!!z.payload?.stun,
    kind:z.kind==="lane_laser"?"lane":z.kind==="rail"?"beam":z.kind==="dash"?"dash":"aoe",
    end:z.kind==="rail"||z.kind==="dash"?{x:z.fromX??z.x,y:z.fromY??z.y}:undefined,
    startsAt:w.elapsed+(z.stage==="active"?0:z.remaining),endsAt:w.elapsed+z.remaining+(z.stage==="active"?0:z.activeDuration??.15)}));
  const cinder=cinderState(w),fuel=cinder.fuel,beam=cinder.beam;
  for(const shot of cinder.followups.slice(0,8))bullets.push({x:shot.x,y:shot.y,vx:Math.cos(shot.angle)*600,vy:Math.sin(shot.angle)*600,damage:shot.raw,homing:true,radius:2.5,turnRate:8,lifetime:shot.until-w.elapsed,capturable:false});
  if(fuel){const v=cinderValues('cinder_fuel_barrage',fuel.rank);for(const dx of [-126,-42,42,126])hazards.push({kind:'persistent_zone',x:fuel.x+dx,y:fuel.y,radius:v.radius,cc:false,startsAt:fuel.land,endsAt:fuel.until});if(fuel.rank>=5)for(const dx of [-84,0,84])hazards.push({kind:'persistent_zone',x:fuel.x+dx,y:fuel.y,radius:v.radius,cc:false,startsAt:fuel.land,endsAt:fuel.until});}
  if(beam){const x=beam.fired?beam.x:w.playerX,y=beam.fired?beam.y:w.playerY-20;hazards.push({kind:'beam',x,y,end:{x,y:R.top},radius:cinderValues('cinder_inferno_beam',beam.rank).width/2,cc:false,startsAt:beam.fire,endsAt:beam.until});}
  for(const lane of cinder.lanes)hazards.push({kind:'beam',x:lane.x,y:lane.y,end:{x:lane.x,y:R.top},radius:cinderValues('cinder_inferno_beam',lane.rank).width/2,cc:false,startsAt:lane.at,endsAt:lane.until});
  if(cinder.wave){const wave=cinder.wave,travel=Math.hypot(p.x-wave.x,p.y-wave.y)/Math.hypot(360,640)*.8;hazards.push({kind:'aoe',x:p.x,y:p.y,radius:20,cc:true,startsAt:wave.at+travel,endsAt:wave.at+travel+.05});}
  if(w.laserCharge>0||w.laserRemaining>0)hazards.push({kind:"beam",x:w.playerX,y:w.playerY,end:{x:w.playerX,y:R.top},radius:16,cc:false,startsAt:w.elapsed+w.laserCharge,endsAt:w.elapsed+w.laserCharge+w.laserRemaining});
  if(w.rankRuntime?.anchor)hazards.push({kind:"persistent_zone",x:w.rankRuntime.anchor.x,y:w.rankRuntime.anchor.y,radius:120*(w.rankRuntime.anchor.rank>=2?1.25:1),cc:true,startsAt:w.elapsed,endsAt:w.rankRuntime.anchor.until});
  for(const burn of (w.astra?.burns??[]).slice(0,4))hazards.push({kind:"persistent_zone",x:burn.x,y:burn.y,radius:burn.radius,cc:false,startsAt:w.elapsed,endsAt:burn.until});
  // BigBang's visible traveling missile is a full-arena threat, not a local circle.
  for(const bomb of visible.filter(b=>b.bigBang).slice(0,2))hazards.push({kind:"full_screen",x:p.x,y:p.y,radius:Infinity,cc:true,startsAt:w.elapsed+Math.max(0,1-bomb.missileAge),endsAt:w.elapsed+bomb.lifetime});
  for(const m of (w.astra?.starfall?.pending??[]).slice(0,4)){
    const followsPilot=!m.decoy&&!m.frozen&&w.enemies.some(e=>e.id===m.target&&e.aircraftTarget?.world===actor);
    hazards.push({kind:"aoe",x:m.x,y:m.y,radius:m.doom?110:skillRank(w.aircraft,"starfall")>=2?65:45,cc:false,
      startsAt:m.at,endsAt:m.at+.08,tracksUntil:followsPilot?m.at-m.fallDuration:undefined,velocity:followsPilot?{x:ai.vx,y:ai.vy}:undefined});
  }
  for(const beam of (w.astra?.meteorSpears??[]).filter(b=>w.elapsed>=b.warningStartsAt&&w.elapsed<b.beamEndsAt).slice(0,2)){
    const path=meteorSpearEndpoints(beam);
    hazards.push({kind:"beam",...path.start,end:path.end,radius:beam.projectileHitboxWidth,cc:false,startsAt:beam.beamStartsAt,endsAt:beam.beamEndsAt});
  }
  for(const wave of (w.rankRuntime?.waves??[]).slice(0,3)){
    if(w.enemies.some(e=>e.aircraftTarget?.world===actor&&wave.hitEnemies.has(e.id)))continue;
    hazards.push({kind:"wave",x:wave.originX,y:wave.originY,radius:0,cc:true,wave:{radius:wave.radius,at:w.elapsed},
      startsAt:w.elapsed,endsAt:w.elapsed+(wave.maxRadius-wave.radius)/INTERFERENCE_WAVE_SPEED});
  }
  if(w.astra?.charge)hazards.push({kind:"beam",x:w.playerX,y:w.playerY,end:{x:w.playerX,y:R.top},radius:6,cc:false,startsAt:w.astra.charge.at,endsAt:w.astra.charge.at+.6});
  for(const b of visible.filter(b=>b.skillId==="stellar_lance").slice(0,2))hazards.push({kind:"beam",x:b.x,y:b.y,end:{x:b.x+b.vx*.6,y:b.y+b.vy*.6},radius:b.radius,cc:false,startsAt:w.elapsed,endsAt:w.elapsed+Math.min(.6,b.lifetime)});
  ai.history.push({hasStarfallTarget:targetVisible||w.decoys.some(d=>d.active&&d.remaining>0),targetProtected:(w.aircraft.activeEffects.armor_shield??0)>.4||(skillRank(w.aircraft,"orbit_reversal")>=4&&(w.aircraft.activeEffects.orbit_reversal??0)>.4),targetVisible,at:w.elapsed,player,playerHp:targetVisible?w.aircraft.currentHp:ai.lastPlayerHp,velocity,bullets,hazards:hazards.slice(0,24),
    lastBurst:latest(["missile_swarm","sweeping_cannon","focus_laser","starfall"])});
  ai.history=ai.history.slice(-10);ai.lastSampleAt=w.elapsed;ai.lastSampleWallMs=wall;ai.nextSense=w.elapsed+1/30;
}
function roleThreshold(id:SkillId,actor:CombatWorld,ai:MirrorAI) {
  if(getWorldSkillAvailability(actor,id).manualAction)return .2;
  if(["cinder_fire_shield","decoy","armor_shield","invisibility","orbit_reversal","electronic_interference"].includes(id))return ai.threat>1?.55:.85;
  if(["missile_swarm","sweeping_cannon","escort_drone","starfall"].includes(id))return .85;
  return .7;
}
function updatePlan(ai:MirrorAI,s:AircraftCombatState,now:number) {
  if(ai.plan&&(ai.plan.expiresAt<=now||ai.lastCast===ai.plan.nextSkill))ai.plan=undefined;
  const follow:Partial<Record<SkillId,SkillId>>={cinder_fuel_barrage:"cinder_heat_wave",cinder_heat_wave:"cinder_inferno_beam",predator_lock:"afterburner",gravity_anchor:"heavy_bomb",armor_shield:"sweeping_cannon",invisibility:"focus_laser",twin_reflection:"stellar_lance",orbit_reversal:"starfall"};
  if(ai.lastCast&&ai.lastCastAt!==undefined&&now-ai.lastCastAt<2){
    const next=follow[ai.lastCast];
    if(next&&skillRank(s,next)>0&&(!ai.plan||ai.plan.startedAt<ai.lastCastAt))ai.plan={kind:`${ai.lastCast}:${next}`,startedAt:ai.lastCastAt,expiresAt:ai.lastCastAt+3,nextSkill:next};
  }
}
/** The 160ms inbox gates both pilot and tactical reactions; own movement is current. */
export function updateMirrorAI(w:CombatWorld,ai:MirrorAI,s:AircraftCombatState,p:Point,dt:number,actor:CombatWorld):{x:number;y:number;skill?:SkillId} {
  if(w.elapsed>=ai.nextSense)perceive(w,ai,p,actor);
  const observation=[...ai.history].reverse().find(snapshot=>snapshot.at<=w.elapsed-.16);
  const seen=observation?projectPerception(observation,w.elapsed,p):undefined;
  let skill:SkillId|undefined,emergency=false;
  if(seen){
    const radius=17*playerAirframeScale(s),band=verticalBands(seen.player);
    // Refresh projectile positions from delayed observations only, never unspawned input.
    const danger=seen.bullets.map(b=>({b,...threatApproach(p,{x:ai.vx,y:ai.vy},b)})).filter(t=>t.time<t.b.lifetime&&t.distance<radius+t.b.radius+12);
    const first=danger.sort((a,b)=>a.time-b.time)[0];
    ai.incoming=danger.reduce((n,t)=>n+t.b.damage*(t.time<.25?1:t.time<.5?.75:.35),0);
    ai.threat=danger.reduce((n,t)=>n+(t.time<.25?3:t.time<.5?2:1),0)+seen.hazards.reduce((n,h)=>n+hazardCost(p,h,radius,w.elapsed+.35,w.elapsed),0);
    emergency=ai.threat>1;
    ai.needsVerticalRecovery=p.y>band.soft||(ai.needsVerticalRecovery&&p.y>band.preferred+20);
    if(emergency){
      ai.intent="evade";
      const heading=first?Math.atan2(first.b.vy,first.b.vx):Math.atan2(ai.vy,ai.vx);
      const candidates=[heading+Math.PI/2,heading-Math.PI/2,-Math.PI/2,-Math.PI/4,-3*Math.PI/4,0,Math.PI,Math.PI/2]
        .flatMap(a=>[65,150].map(reach=>bounded({x:p.x+Math.cos(a)*reach,y:p.y+Math.sin(a)*reach})));
      const route=(q:Point)=>trajectoryCost(p,q,seen,radius,{x:ai.vx,y:ai.vy},310);
      const routes=candidates.map(q=>({q,risk:route(q)}));
      const safestUp=Math.min(...routes.filter(({q})=>q.y<=p.y+1).map(({risk})=>risk));
      const scored=routes.filter(({q,risk})=>p.y<band.hard||q.y<=p.y+1||risk+.5<safestUp)
        .map(({q,risk})=>({q,score:risk*12+positionalCost(q,seen,"evade")})).sort((a,b)=>a.score-b.score);
      const best=scored[0];
      if(best){
        const old=ai.dodge?route(ai.dodge)*12+positionalCost(ai.dodge,seen,"evade"):Infinity;
        if(!ai.dodge||w.elapsed>=ai.dodgeUntil||old>best.score+4){ai.dodge=best.q;ai.dodgeUntil=w.elapsed+.32;}
        ai.goal=ai.dodge!;
        ai.escapeRisk=route(ai.goal);
        if(ai.goal.y>band.soft)ai.needsVerticalRecovery=true;
      }
    }
    if(w.elapsed>=ai.nextDecision){
      ai.nextDecision=w.elapsed+.1;
      ai.losing=ai.lastHp-s.currentHp>ai.lastPlayerHp-seen.playerHp;ai.lastHp=s.currentHp;ai.lastPlayerHp=seen.playerHp;
      updatePlan(ai,s,w.elapsed);
      if(!emergency){
        ai.intent=ai.needsVerticalRecovery?"recover-up":ai.plan?"combo-setup":ai.losing?"kite":Math.abs(p.x-seen.player.x)>80?"reposition":Math.abs(p.x-seen.player.x)<25?"hold-angle":"pressure";
        const aimingLaser = (!!cinderState(actor).beam || actor.laserCharge > 0 || actor.laserRemaining > 0 || !!actor.astra?.charge || (s.activeEffects.sweeping_cannon??0)>0) && seen.targetVisible;
        // Aim from the delayed observation, including the remaining charge time.
        // Hidden targets keep the existing last-known-position movement policy.
        const leadSeconds = aimingLaser ? clamp((cinderState(actor).beam ? cinderState(actor).beam!.fire-actor.elapsed : 0) || actor.laserCharge || (actor.astra?.charge?.at??w.elapsed)-w.elapsed, 0, .8) : 0;
        const strafe = aimingLaser ? 0 : Math.sin(w.elapsed * 1.8) * 45;
        const desiredX = clamp(seen.player.x + seen.velocity.x * leadSeconds + strafe, R.left + 35, R.right - 35);
        const candidates=ai.intent==="recover-up"?[-85,0,85].map(dx=>bounded({x:p.x+dx,y:Math.min(p.y-100,band.preferred)})):
          [-65,0,65].flatMap(dx=>[-35,0,35].map(dy=>bounded({x:desiredX+dx,y:band.preferred+dy})));
        const legal=candidates.filter(q=>q.y<=band.hard&&(p.y<=band.soft||q.y<=p.y));
        const movementCost = (q: Point) => trajectoryCost(p, q, seen, radius, {x:ai.vx,y:ai.vy}, 250) * 6
          + positionalCost(q, seen, ai.intent) + distance(q, p) / 300
          + (aimingLaser ? Math.abs(q.x - desiredX) / 25 : 0);
        const scored=legal.map(q=>({q,cost:movementCost(q)})).sort((a,b)=>a.cost-b.cost);
        if(scored[0])ai.goal=scored[0].q;
        // Never retain a stale bottom goal after a dodge.
        else ai.goal=bounded({x:p.x,y:Math.min(p.y,band.soft)});
      }
      ai.escapeRisk=trajectoryCost(p,ai.goal,seen,radius,{x:ai.vx,y:ai.vy},emergency?310:250);
      let bestUtility=0;
      for(const id of AIRCRAFT_CONFIGS[s.aircraftId].skillIds){
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
  // Skill execution never locks the pilot. Runtime stun/dash rules still own movement.
  if (skill && !aircraftTargetability(w.aircraft).canAcquire && ["predator_lock","missile_swarm","focus_laser","stellar_lance"].includes(skill)) skill = undefined;
  if (skill==="starfall"&&!aircraftTargetability(w.aircraft).canAcquire&&!w.decoys.some(d=>d.active&&d.remaining>0)) skill=undefined;
  if (actor.aftermath || actor.destruction || s.currentHp <= 0) return {...p};
  return {...bounded({x:p.x+ai.vx*dt,y:p.y+ai.vy*dt}),skill};
}

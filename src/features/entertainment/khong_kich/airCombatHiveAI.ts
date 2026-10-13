import { expansionIncoming, celestialProtection } from './airCombatExpansion';
import { equipmentIncoming } from './airCombatEquipmentRuntime';
import { riptideIncoming } from './airCombatRiptideRuntime';
import { astraOrbitProtectionActive } from './airCombatAstra';
import { AIRCRAFT_CONFIGS, stageEnemyConfig, GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';
import { calculateDamage, getEffectiveAircraftStats, getSkillRuntimeValues } from './airCombatAircraft';
import { skillRank, isUltimate, ultimateCastDisabled } from './airCombatSkillRanks';
import { activeShieldAmount } from './airCombatFeedback';
import { equipmentState, equipmentRewardsLocked } from './airCombatEquipmentState';
import { canTargetEnemy } from './airCombatTargetability';
import { argentRecallOpportunity, argentState, argentWaiting } from './airCombatArgentRuntime';
import { CINDER_BURN, cinderValues } from './airCombatCinderConfig';
import { RIPTIDE, riptideValues } from './airCombatRiptideConfig';
import { cinderStacks, cinderState } from './airCombatCinderRuntime';
import { sylvaState } from './airCombatSylvaRuntime';
import { SYLVA } from './airCombatSylvaConfig';
import { riptideState } from './airCombatRiptideRuntime';
import { terraHud, terraState } from './airCombatTerraRuntime';
import { TERRA, terraValues, terraCannonDamage } from './airCombatTerraConfig';
import { getPlayerHitbox, getEnemyHitbox, segmentVsAircraft, circleVsAircraft, sweepAircraft, createHitResult } from './airCombatHitboxes';
import { hiveActors, hiveRoot, type HiveAlly } from './airCombatHive';
import { HIVE_MOTHERS } from './airCombatHiveWaves';
import { isElite } from './airCombatWaves';
import { castWorldSkill, getWorldSkillAvailability, movePlayerByDelta, isHostileToPlayer, type CombatWorld, type EnemyEntity } from './airCombatRuntime';
import type { SkillId } from './airCombatTypes';

interface Observation {entity:EnemyEntity;x:number;y:number;at:number;vx:number;vy:number}
interface PilotMemory {vx:number;vy:number;defendAt:number;enemies:Map<number,Observation>;urgent:boolean;comboTarget?:EnemyEntity;comboSince?:number}
const pilots=new WeakMap<HiveAlly,PilotMemory>();
const contact=createHitResult(),SPEED=250,HORIZON=.7;
function memory(a:HiveAlly){let m=pilots.get(a);if(!m){m={vx:0,vy:0,defendAt:0,enemies:new Map(),urgent:false};pilots.set(a,m);}return m;}
const clampX=(x:number)=>Math.max(R.left+25,Math.min(R.right-25,x));
const clampY=(y:number)=>Math.max(R.top+30,Math.min(R.bottom-35,y));
function sense(a:HiveAlly,m:PilotMemory){
 const w=a.world,root=hiveRoot(w),body=getPlayerHitbox(w),live=new Set<number>();
 const enemies=root.enemies.filter(e=>e.hp>0&&isHostileToPlayer(w,e)).map(e=>{
  live.add(e.id);const old=m.enemies.get(e.id),dt=old?.entity===e?root.elapsed-old.at:0;
  const vx=e.stun>0?0:dt>0?Math.max(-400,Math.min(400,(e.x-old!.x)/dt)):0;
  const vy=e.stun>0?0:dt>0?Math.max(-500,Math.min(500,(e.y-old!.y)/dt)):0;
  const observation={entity:e,x:e.x,y:e.y,at:root.elapsed,vx,vy};m.enemies.set(e.id,observation);
  return {...observation,body:getEnemyHitbox(e)};
 });
 for(const id of m.enemies.keys())if(!live.has(id))m.enemies.delete(id);
 const shots=root.projectiles.filter(p=>p.owner==='enemy'&&p.allegiance!=='friendly_hacked'&&p.lifetime>0&&Math.hypot(p.x-w.playerX,p.y-w.playerY)<Math.hypot(p.vx,p.vy)*HORIZON+SPEED*HORIZON+body.radius+35);
 const hazards=(root.hive?.hazards??[]).filter(z=>z.kind!=='homing'&&!z.cancelled&&!z.fired&&z.until>root.elapsed&&z.at-root.elapsed<=HORIZON+.25);
 return {w,root,body,enemies,shots,hazards,stats:getEffectiveAircraftStats(w.aircraft)};
}
type Scene=ReturnType<typeof sense>;

/** Follow the actual travel segment, then remain at the candidate for the rest of the horizon. */
function risk(c:Scene,x:number,y:number,horizon=HORIZON,estimateDamage=false){
 const {w,root,body}=c,dx=x-w.playerX,dy=y-w.playerY,travel=Math.min(horizon,Math.hypot(dx,dy)/SPEED);let score=0,damage=0;
 const incoming=(raw:number,source?:number)=>{damage+=calculateDamage(raw,c.stats.armor)*riptideIncoming(w,source);};
 for(const p of c.shots){
  const life=Math.min(horizon,p.lifetime),moving=Math.min(travel,life),fraction=travel>0?moving/travel:1;
  const ex=p.x+p.vx*moving-dx*fraction,ey=p.y+p.vy*moving-dy*fraction;
  const approaching=(p.x-w.playerX)*p.vx+(p.y-w.playerY)*p.vy<0;
  if(segmentVsAircraft(p.x,p.y,ex,ey,p.radius+4,body,contact).hit||
   (life>travel&&segmentVsAircraft(ex,ey,p.x+p.vx*life-dx,p.y+p.vy*life-dy,p.radius+4,body,contact).hit)){score+=120+Math.min(220,p.rawDamage);if(estimateDamage)incoming(p.rawDamage,p.sourceEnemyId); }
  else if(approaching){const distance=Math.hypot(p.x+p.vx*life-x,p.y+p.vy*life-y);if(distance<body.radius+28)score+=(body.radius+28-distance)*.8;}
 }
 for(const z of c.hazards){
  const time=Math.max(0,z.at-root.elapsed);if(time>horizon+.15)continue;
  const fraction=travel>0?Math.min(1,time/travel):1,ox=dx*fraction,oy=dy*fraction;
  const hit=z.kind==='lane'||z.kind==='dash'?segmentVsAircraft(z.x-ox,z.y-oy,z.endX-ox,z.endY-oy,z.radius+3,body,contact).hit:circleVsAircraft(z.x-ox,z.y-oy,z.radius+3,body);
  if(hit){score+=400+(time<.25?160:0);if(estimateDamage)incoming(z.damage,z.enemyId);}
 }
 for(const e of c.enemies){
  // sweepAircraft treats its body as the END pose. Reverse the relative path
  // to inspect current -> candidate without mutating the runtime's cached hitbox.
  if(sweepAircraft(body,e.vx*travel-dx,e.vy*travel-dy,e.body,contact).hit||
   (horizon>travel&&segmentVsAircraft(e.x+e.vx*travel-dx,e.y+e.vy*travel-dy,e.x+e.vx*horizon-dx,e.y+e.vy*horizon-dy,e.body.radius,body,contact).hit)){score+=400;if(estimateDamage)incoming(stageEnemyConfig(e.entity.type,5).collisionDamage*e.entity.damageScale,e.entity.id);}
  const dash=e.entity.hive?.dash;
  if(dash&&segmentVsAircraft(e.x-dx,e.y-dy,dash.endX-dx,dash.endY-dy,e.body.radius,body,contact).hit){score+=380;if(estimateDamage)incoming(stageEnemyConfig(e.entity.type,5).collisionDamage*e.entity.damageScale,e.entity.id);}
 }
 if(!estimateDamage)return score;
 const s=w.aircraft;
 if(w.playerInvulnerability>=horizon||celestialProtection(s))return 0;
 let factor=expansionIncoming(s)*equipmentIncoming(s);
 if((s.activeEffects.armor_shield??0)>0)factor*=getSkillRuntimeValues(s,'armor_shield').damageTakenMultiplier;
 if(astraOrbitProtectionActive(w))factor*=.65;
 damage=Math.max(0,damage*factor-activeShieldAmount(s));
 const armor=s.aircraftId==='terra'?terraState(w).armor:undefined;
 if(armor&&armor.until>w.elapsed)damage-=Math.min(armor.reserve,damage*terraValues('terra_reactive_rock_armor',armor.rank).absorbRatio);
 return damage;
}
function predict(c:Scene,e:EnemyEntity,time:number){const motion=c.enemies.find(n=>n.entity===e);return {x:clampX(e.x+(motion?.vx??0)*time),y:clampY(e.y+(motion?.vy??0)*time)};}
function chooseTarget(c:Scene,a:HiveAlly){
 let best:EnemyEntity|undefined,value=-Infinity;
 for(const {entity:e} of c.enemies){
  if(!canTargetEnemy(c.w,e)||e.y<R.top-e.radius||e.y>R.bottom+e.radius)continue;
  const support=['repair_wasp','forge_matron','signal_weaver'].includes(e.type),big=e.type==='boss'||HIVE_MOTHERS.includes(e.type);
  const score=(e.id===a.target?18:0)+(e.id===c.root.playerTargetId?12:0)+(support?20:0)+(big?10:0)-Math.abs(e.x-c.w.playerX)*.09-Math.hypot(e.x-c.w.playerX,e.y-c.w.playerY)*.025-(e.y>c.w.playerY?45:0);
  if(score>value){value=score;best=e;}
 }
 return best;
}
interface SkillChoice {id:SkillId;score:number;defensive:boolean}
function chooseSkill(c:Scene,a:HiveAlly,m:PilotMemory,target:EnemyEntity|undefined,threat:number,standingDamage:number,escapeDamage:number):SkillChoice|undefined{
 const w=c.w,s=w.aircraft,stats=getEffectiveAircraftStats(s),hp=s.currentHp/stats.maxHp,now=w.elapsed;
 // A dense volley that misses the planned route does not justify spending a shield.
 const unavoidable=escapeDamage/Math.max(1,stats.maxHp),currentDanger=standingDamage/Math.max(1,stats.maxHp);
 const critical=escapeDamage>=s.currentHp*.65||hp<.28&&escapeDamage>stats.maxHp*.025;
 const threatened=unavoidable>=(hp>.8?.10:.055)||escapeDamage>s.currentHp*.22;
 const hardToDodge=escapeDamage>standingDamage*.55&&currentDanger>.06;
 const terra=terraHud(w),shield=activeShieldAmount(s);
 const protectedNow=w.playerInvulnerability>.25||shield>stats.maxHp*.09||(s.activeEffects.invisibility??0)>.3||(terra?.armorRemaining??0)>.5;
 const defend=(threatened||critical||hardToDodge&&hp<.65)&&(!protectedNow||critical||unavoidable>.15),canDefend=critical||now>=m.defendAt,canAttack=now>=a.skillAt;
 const ids=AIRCRAFT_CONFIGS[s.aircraftId].skillIds,ultimate=ids.find(isUltimate)!;
 const ult=getWorldSkillAvailability(w,ultimate),learnedUltimate=skillRank(s,ultimate)>0&&!ultimateCastDisabled(s,ultimate);
 const regen=s.status.resourceJammedUntil>s.coreState.time?0:stats.resourceRegen;
 const defenseIds=['decoy','armor_shield','invisibility','cinder_fire_shield','argent_guard_stance','terra_reactive_rock_armor','riptide_wellspring','sylva_symbiosis','orbit_reversal'] as SkillId[];
 const defensiveCosts=ids.filter(id=>defenseIds.includes(id)&&skillRank(s,id)>0&&(s.cooldowns[id]??0)<3).map(id=>getWorldSkillAvailability(w,id).cost);
 const defenseReserve=protectedNow?0:Math.min(stats.maxResource*.32,defensiveCosts.length?Math.min(...defensiveCosts):0);
 // Bank enough to reach Ultimate when its cooldown ends. Active/toggle Ultimates
 // do not reserve a second cast; emergency defense always bypasses this budget.
 const ultRunning=(s.activeEffects[ultimate]??0)>0||s.coreState.deferredCooldowns[ultimate]!==undefined||ultimate==='escort_drone'&&s.droneActive;
 const sylvaFollowup=s.aircraftId==='sylva'?ids.filter(id=>['sylva_parasitic_seed','sylva_acid_burst'].includes(id)&&skillRank(s,id)>0&&(s.cooldowns[id]??0)<6).reduce((n,id)=>n+getWorldSkillAvailability(w,id).cost,0):0;
 const ultimateReserve=learnedUltimate&&!ultRunning&&!ult.free?Math.max(0,Math.min(stats.maxResource,ult.cost+sylvaFollowup)-regen*Math.min(18,ult.cooldown)):0;
 if(m.comboTarget!==target){m.comboTarget=target;m.comboSince=now;}
 const waited=now-(m.comboSince??now);
 const range=target?Math.hypot(target.x-w.playerX,target.y-w.playerY):Infinity;
 const ahead=!!target&&target.y<w.playerY,line=ahead&&Math.abs(target!.x-w.playerX)<target!.radius+20;
 const cluster=target?c.enemies.filter(e=>Math.hypot(e.x-target.x,e.y-target.y)<100).length:0;
 const durable=!!target&&target.hp>stats.firepower*2.5,big=!!target&&(target.type==='boss'||HIVE_MOTHERS.includes(target.type)||isElite(target.type));
 const invis=getWorldSkillAvailability(w,'invisibility'),escapeReserve=s.aircraftId==='phantom'&&skillRank(s,'invisibility')>0?getSkillRuntimeValues(s,'invisibility').cost:0;
 const battery=s.aircraftId==='phantom'?cinderState(w).battery:undefined;
 const feeding=battery?.phase==='feeding',safeBattery=!!battery&&(feeding||battery.phase==='ready')&&!threatened&&hp>.65;
 let best:SkillChoice|undefined;
 for(const id of AIRCRAFT_CONFIGS[s.aircraftId].skillIds){
  const available=getWorldSkillAvailability(w,id);if(!available.available)continue;
  const spend=available.manualAction||available.toggle?0:available.cost;
  let score=0,defensive=false;
  const protect=(value=80)=>{if(defend){score=value+(critical?40:0);defensive=true;}};
  switch(id){
   case 'decoy':case 'armor_shield':case 'invisibility':case 'cinder_fire_shield':case 'argent_guard_stance':case 'terra_reactive_rock_armor':protect();break;
   case 'afterburner':
    // This is Viper's firing-rate buff, not an evasive dash.
    if(durable&&ahead&&!threatened)score=24+((target?.burnArmorUntil??0)>now?15:0);break;
   case 'riptide_wellspring':if(hp<.45||hp<.7&&defend){score=hp<.3?130:80;defensive=true;}break;
   case 'sylva_symbiosis':{
    const active=sylvaState(w).symbiosis;
    if(active){if(hp<.55&&active.storedVitality>stats.maxHp*.035||active.until-now<.5&&hp<.9){score=125;defensive=true;}}
    else if(defend||hp<.45){score=90;defensive=true;}break;
   }
   case 'orbit_reversal':if(!w.astra?.orbit&&defend){score=95;defensive=true;}break;
   case 'electronic_interference':
    if(defend){score=75+(critical?25:0);defensive=true;}
    else if(skillRank(s,id)>=4&&c.enemies.length>=3&&s.currentResource<stats.maxResource*.7)score=32;
    break;
   case 'escort_drone':{
    const upkeep=getSkillRuntimeValues(s,id).upkeepPerSecond,net=Math.max(0,upkeep-stats.resourceRegen-(feeding?8:0));
    const laser=getWorldSkillAvailability(w,'focus_laser');
    const saveForLaser=durable&&line&&skillRank(s,'focus_laser')>0&&laser.cooldown<.5&&s.currentResource<laser.cost+escapeReserve+net*2&&!safeBattery;
    if(s.droneActive){
     if(!target||saveForLaser||s.currentResource<escapeReserve+net*2&&!safeBattery||threatened&&s.currentResource<escapeReserve+12){score=critical?110:60;defensive=true;}
    }else if(target&&durable&&!threatened&&s.currentResource-available.cost>=Math.max(escapeReserve,net*8)+(safeBattery?0:10))score=48;
    break;
   }
   case 'focus_laser':{
    const values=getSkillRuntimeValues(s,id),p=target?predict(c,target,values.charge):undefined;
    const aligned=p&&p.y<w.playerY&&Math.abs(p.x-w.playerX)<(target?.radius??0)+24;
    const reserve=safeBattery?8:escapeReserve;
    if(durable&&aligned&&!threatened&&s.currentResource-available.cost>=reserve)score=28+(big?8:0);
    break;
   }
   case 'terra_geocore_overdrive':{
    const rank=skillRank(s,id),pressure=terra?terra.pressure/Math.max(1,terra.cap):0;
    if(rank>=2&&s.status.skillLockedUntil>s.coreState.time&&defend||rank>=3&&hp<.45||hp<.3){score=115;defensive=true;}
    else if(big&&durable&&pressure>=.72&&line&&s.currentResource>=available.cost+getWorldSkillAvailability(w,'terra_seismic_cannon').cost)score=65;
    break;
   }
   case 'terra_seismic_cannon':{
    if(!terra||!target)break;
    const rank=skillRank(s,id),values=terraValues(id,rank),p=predict(c,target,TERRA.windup);
    const pressure=terra.pressure/Math.max(1,terra.cap),decaying=now-terraState(w).lastHpLoss>=TERRA.decayDelay-.3;
    const centered=Math.abs(p.x-w.playerX)<=values.centerWidth/2,aligned=Math.abs(p.x-w.playerX)<=TERRA.cannonWidth/2;
    const lethal=centered&&terraCannonDamage(stats.firepower,terra.pressure,rank,terra.ultimate>0?terraValues('terra_geocore_overdrive',skillRank(s,'terra_geocore_overdrive')).cannonMultiplier:1)>=target.hp;
    if(ahead&&w.playerY-p.y<TERRA.cannonRange&&aligned&&(centered||decaying||critical)&&
     (pressure>=.72||pressure>=.3&&(decaying||terra.ultimate>0)||pressure>=.15&&lethal||critical&&pressure>=.25)){
     const overdriveReady=getWorldSkillAvailability(w,'terra_geocore_overdrive').available;
     score=35+(centered?5:0)+(pressure>=.9?8:0)+(terra.ultimate>0?30:0);
     if(overdriveReady&&big&&pressure>=.72&&!decaying)score=15;
     if(critical){score=105;defensive=true;}
    }break;
   }
   case 'terra_strata_clamp':if(target&&(defend||cluster>=2||big)&&(critical||c.root.hive!.ccUntil<now)){score=defend?70:terra&&terra.pressure/terra.cap>=.5?42:22;defensive=defend;}break;
   case 'riptide_waterform':{
    const water=riptideState(w).waterform;
    if(!water&&(defend||range<RIPTIDE.waterRadius-20&&(big||cluster>=2))){score=defend?120:62;defensive=defend;}
    // Preserve the full 24 ticks unless the stored burst can finish the target
    // or it is moving out of range. Recast is free, never a blind on/off toggle.
    else if(water&&target&&range<RIPTIDE.waterRadius&&water.charge>0){
     const burst=calculateDamage(water.charge*riptideValues(id,water.rank).chargeRatio*stats.firepower,target.armor),p=predict(c,target,.5);
     if(burst>=target.hp||critical||water.until-now<1&&Math.hypot(p.x-w.playerX,p.y-w.playerY)>RIPTIDE.waterRadius){score=critical?140:68;defensive=critical;}
    }break;
   }
   case 'predator_lock':if(durable&&ahead)score=big?29:20;break;
   case 'missile_swarm':if(ahead&&(big&&durable||c.enemies.length>=4))score=62+((s.coreState.timers.decoyCounter??0)>s.coreState.time?10:0);break;
   case 'gravity_anchor':
    if(!w.rankRuntime?.anchor&&target&&(cluster>=2||defend)&&(critical||c.root.hive!.ccUntil<now)){score=defend?70:28;defensive=defend;}break;
   case 'heavy_bomb':if(target&&(big||cluster>=3))score=22;break;
   case 'sweeping_cannon':if(line&&(cluster>=2||big&&durable)){score=62;if(defend&&skillRank(s,id)>=2){score=105;defensive=true;}}break;
   case 'twin_reflection':if(line&&durable)score=20;break;
   case 'stellar_lance':if(line&&durable&&(!threatened||protectedNow))score=22;break;
   case 'starfall':if(cluster>=3||big&&durable)score=60+(target?.stun?8:0);break;
   case 'cinder_fuel_barrage':if(line&&target)score=cinderStacks(w,target.id)<CINDER_BURN.cap?42:22;break;
   case 'cinder_heat_wave':if(target){score=defend?82:cinderStacks(w,target.id)<CINDER_BURN.cap?40:24;defensive=defend;}break;
   case 'cinder_inferno_beam':{
    if(!target||!durable||threatened)break;
    const v=cinderValues(id,skillRank(s,id)),p=predict(c,target,v.charge),stacks=cinderStacks(w,target.id,now+v.charge);
    const lethal=calculateDamage(stats.firepower*(v.damageMultiplier+v.beamPerBurn*stacks),target.armor)>=target.hp;
    const aligned=p.y<w.playerY&&Math.abs(p.x-w.playerX)<v.width/2+target.radius*.5;
    if(aligned&&(stacks>=CINDER_BURN.cap||stacks>=4&&(lethal||waited>9)))score=76;
    break;
   }
   case 'riptide_tidal_blades':if(range<165&&durable)score=riptideState(w).waterform?42:22;break;
   case 'riptide_confluence':if(range<170&&(cluster>=2||defend)&&(critical||c.root.hive!.ccUntil<now)){score=defend?75:26;defensive=defend;}break;
   case 'argent_blade_cast':if(line&&durable&&argentWaiting(w)<8)score=22;break;
   case 'argent_blade_recall':{
    const state=argentState(w),waiting=state.blades.filter(b=>b.phase==='wait');
    if(target&&argentRecallOpportunity(w,target.x,target.y,target.radius)&&
      (waiting.length>=5||state.temper>=2||waiting.some(b=>b.ttl-(now-b.waitAt)<1.2)))score=state.array?55:42;
    break;
   }
   case 'argent_heavenly_blade_array':if(ahead&&(big&&durable||cluster>=3))score=65;break;
   case 'sylva_acid_burst':case 'sylva_parasitic_seed':{
    if(!target)break;
    const state=sylvaState(w),mark=state.targets.get(target.id),bloom=state.bloom;
    if(bloom){
     const seedFlight=Math.max(.12,range/600);
     if(id==='sylva_parasitic_seed'&&now+seedFlight+SYLVA.markDuration>=bloom.until+.12&&(mark?.markUntil??0)<bloom.until)score=72;
     if(id==='sylva_acid_burst'&&((mark?.markUntil??0)>now||!getWorldSkillAvailability(w,'sylva_parasitic_seed').available))score=64;
    }else score=id==='sylva_parasitic_seed'?30:24;
    break;
   }
   case 'sylva_deathbloom':{
    // Start recording BEFORE the expensive burst/seed combo, then refresh the
    // five-second mark late enough to amplify the six-second final detonation.
    const seed=getWorldSkillAvailability(w,'sylva_parasitic_seed'),acid=getWorldSkillAvailability(w,'sylva_acid_burst');
    const followup=Math.min(...[seed,acid].filter(v=>v.cooldown<3).map(v=>v.cost),stats.maxResource*.2);
    if(target&&(big&&durable||cluster>=3)&&s.currentResource-available.cost+regen*3>=followup)score=70;
    break;
   }
  }
  if(score<=0||(defensive?!canDefend:!canAttack))continue;
  if(defensive&&!critical&&!available.free&&available.cost>0){
   const healing=hp<.45&&['riptide_wellspring','sylva_symbiosis','terra_geocore_overdrive'].includes(id);
   // Discount costly prevention when the damage can be safely accepted.
   if(!healing&&available.cost>0&&escapeDamage<stats.maxHp*.04)continue;
  }
  if(!defensive){
   if(!target)continue;
   const reserve=s.aircraftId==='phantom'?(safeBattery?8:escapeReserve):defenseReserve;
   const comboSetup=['cinder_fuel_barrage','cinder_heat_wave','terra_strata_clamp','predator_lock'].includes(id);
   const bank=isUltimate(id)?0:ultimateReserve;
   const recovery=comboSetup?regen*3:0;
   // Casting a setup must leave the ultimate affordable within its short setup
   // window. Cheap filler can no longer spend down the bank every cooldown.
   const floor=Math.min(stats.maxResource-spend,Math.max(bank-recovery,reserve));
   if(spend>0&&s.currentResource-spend<floor&&!available.free)continue;
   if(critical)score*=.2;
  }
  if(!best||score>best.score)best={id,score,defensive};
 }
 return best;
}

export function thinkHiveAlly(a:HiveAlly,dt:number){
 const w=a.world,root=hiveRoot(w),m=memory(a);
 if(root.elapsed>=a.thinkAt){
  if(root.elapsed-a.thinkAt>1)m.vx=m.vy=0;
  a.thinkAt=root.elapsed+.1+a.slot*.008;
  const c=sense(a,m),target=chooseTarget(c,a),threat=risk(c,w.playerX,w.playerY),stats=getEffectiveAircraftStats(w.aircraft),hp=w.aircraft.currentHp/stats.maxHp;
  m.urgent=threat>90;a.target=target?.id;w.playerTargetId=target?.id;
  const close=w.aircraft.aircraftId==='riptide'&&(hp>.55||!!riptideState(w).waterform&&hp>.35)&&threat<90;
  const lead=w.aircraft.aircraftId==='terra'?Math.max(.2,terraHud(w)?.windup||TERRA.windup):cinderState(w).beam?Math.max(.1,cinderState(w).beam!.fire-w.elapsed):w.laserCharge>0?w.laserCharge:.3;
  const aim=target?predict(c,target,lead):undefined;
  let desiredX=aim?.x??R.left+R.width*(a.slot?.72:.28),desiredY=target?clampY(target.y+(close?115:hp<.4?265:205)):R.bottom-85;
  const loot=equipmentState(root.aircraft).loot.find(l=>!l.collection);
  if(loot&&hp>.6&&threat<30&&!equipmentRewardsLocked(w.aircraft)&&Math.hypot(loot.x-w.playerX,loot.y-w.playerY)<110&&risk(c,loot.x,loot.y)<25){desiredX=loot.x;desiredY=loot.y;}
  let best=Infinity,bx=w.playerX,by=w.playerY;
  const evaluate=(x:number,y:number)=>{
   x=clampX(x);y=clampY(y);
   const distance=Math.hypot(x-w.playerX,y-w.playerY),reach=SPEED*HORIZON;
   if(distance>reach){x=w.playerX+(x-w.playerX)*reach/distance;y=w.playerY+(y-w.playerY)*reach/distance;}
   let cost=risk(c,x,y)*(hp<.45?1.8:1.2);
   cost+=Math.abs(x-desiredX)*.16+Math.abs(y-desiredY)*.09+Math.hypot(x-a.x,y-a.y)*.025;
   for(const ally of hiveActors(root))if(ally!==w&&ally.aircraft.currentHp>0){const d=Math.hypot(ally.playerX-x,ally.playerY-y);if(d<45)cost+=(45-d)*.6;}
   const edge=Math.min(x-R.left,R.right-x,y-R.top,R.bottom-y);if(edge<40)cost+=(40-edge)*.5;
   if(cost<best){best=cost;bx=x;by=y;}
  };
  evaluate(w.playerX,w.playerY);evaluate(a.x,a.y);
  const dx=desiredX-w.playerX,dy=desiredY-w.playerY,d=Math.hypot(dx,dy),reach=SPEED*HORIZON;
  if(d>0)evaluate(w.playerX+dx/d*Math.min(d,reach),w.playerY+dy/d*Math.min(d,reach));
  for(let i=0;i<16;i++)for(const distance of [45,100,reach])evaluate(w.playerX+Math.cos(i*Math.PI/8)*distance,w.playerY+Math.sin(i*Math.PI/8)*distance);
  a.x=bx;a.y=by;
  const standingDamage=risk(c,w.playerX,w.playerY,HORIZON,true),escapeDamage=risk(c,bx,by,HORIZON,true);
  const choice=chooseSkill(c,a,m,target,threat,standingDamage,escapeDamage);
  if(choice){
   if(choice.id==='invisibility'){const dx=bx-w.playerX,dy=by-w.playerY,length=Math.hypot(dx,dy);w.moveDirectionX=length>1?dx/length:0;w.moveDirectionY=length>1?dy/length:0;}
   if(castWorldSkill(w,choice.id).cast){
    if(choice.defensive)m.defendAt=root.elapsed+(escapeDamage>=w.aircraft.currentHp*.65?.9:2.2);else a.skillAt=root.elapsed+.65;
    if(['gravity_anchor','electronic_interference','riptide_confluence','terra_strata_clamp'].includes(choice.id))root.hive!.ccUntil=root.elapsed+1;
   }
  }
 }
 const dx=a.x-w.playerX,dy=a.y-w.playerY,d=Math.hypot(dx,dy),speed=Math.min(SPEED,d*9),blend=1-Math.exp(-dt*(m.urgent?32:14));
 m.vx+=((d>.25?dx/d*speed:0)-m.vx)*blend;m.vy+=((d>.25?dy/d*speed:0)-m.vy)*blend;
 w.playerInputActive=true;
 if(w.dashRemaining>0){m.vx=m.vy=0;return;}
 movePlayerByDelta(w,m.vx*dt,m.vy*dt);
}

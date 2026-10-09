import { expansionHealingRate } from './airCombatHealingRates';
import { coreCooldownReady, deferCoreCooldown } from "./airCombatCooldowns";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { SkillId } from "./airCombatTypes";
import { getEffectiveAircraftStats, startDeferredSkillCooldown } from "./airCombatAircraft";
import { hasCore } from "./airCombatCoreEffects";
import { AIRCRAFT_CONFIGS } from "./airCombatConfig";
import { recordCoreMetric } from "./airCombatTelemetry";
import { expansionState, expansionActive, finishAbsorbShield, prepareAbsorbShield, finishExpansionSkill, observeExpansionResource, createAbsorbShield, hasAbsorbShield, type ExpansionCast } from "./airCombatExpansion";

export interface ExpansionHooks {
  hostile(w: CombatWorld, e: EnemyEntity): boolean;
  area(w: CombatWorld, x: number, y: number, radius: number, raw: number, row: number): void;
  shard(w: CombatWorld, x: number, y: number, raw: number, row: number): void;
  heal(w: CombatWorld, amount: number, row: number): void;
  threat(w: CombatWorld, radius: number, bodies: boolean): boolean;
  debt(w: CombatWorld, amount: number, sourceEnemyId?:number, reflection?:boolean): void;
}
const timer = (w: CombatWorld, key: string, seconds: number) => { w.aircraft.coreState.timers[key] = w.elapsed + seconds; };
const resource = (w: CombatWorld, amount: number, row: number) => { const s = w.aircraft,before=s.currentResource; s.currentResource = Math.min(getEffectiveAircraftStats(s).maxResource, s.currentResource + amount);recordCoreMetric(s,row,"resource",s.currentResource-before); };

export function castExpansion(w: CombatWorld, id: SkillId, spent: number, h: ExpansionHooks): ExpansionCast {
  const s = w.aircraft, c = s.coreState, r = expansionState(s), now = c.time;
  const prior = r.lastSkill;
  if (hasCore(s, 171)) timer(w, "safetyLatch", 2);
  const capacitor=hasCore(s,172)&&!!c.stacks.capacitorCharge;
  if (capacitor) {
    recordCoreMetric(s,172,"consumed",1);
    c.stacks.capacitorCharge = 0; r.fullSince = undefined;
    resource(w, spent * .25,172);
  }
  if (prior && prior.id !== id) {
    if (hasCore(s, 175) && now - prior.at <= 5 && coreCooldownReady(s,"alternatingCd")) {timer(w, "alternating", 5);deferCoreCooldown(s,"alternatingCd");recordCoreMetric(s,175,"procs",1);}
    if (hasCore(s, 186) && now - prior.at <= 4 && coreCooldownReady(s, "confluenceCd")) {
      timer(w, "confluence", 8); deferCoreCooldown(s,"confluenceCd");
      resource(w,getEffectiveAircraftStats(s).maxResource*.08,186);recordCoreMetric(s,186,"procs",1);
    }
  }
  r.lastSkill = { id, at: now };
  if(hasCore(s,200)&&!Object.values(c.shields).some(sh=>Number.isFinite(sh.until)&&sh.until>now&&sh.amount>0)&&coreCooldownReady(s,"recycleShieldCd")){
    const sh=createAbsorbShield(s,"recycled",getEffectiveAircraftStats(s).maxHp*.08,4);deferCoreCooldown(s,"recycleShieldCd");recordCoreMetric(s,200,"shieldCreated",sh.amount);
  }
  if(hasCore(s,197)&&!expansionActive(s,"debtCleanse")){let cleared=0;for(const debt of r.debt){cleared+=debt.amount*debt.ticks*.2;debt.amount*=.8;}recordCoreMetric(s,197,"debtCleared",cleared);timer(w,"debtCleanse",5);}
  if(hasCore(s,198)){const before=expansionActive(s,"satellites")?c.stacks.satellites??0:0;c.stacks.satellites=expansionActive(s,"satellites")?Math.min(5,before+1):5;recordCoreMetric(s,198,"granted",c.stacks.satellites-before);timer(w,"satellites",6);}
  const overclock = hasCore(s, 199) ? (c.stacks.overclock ?? 0) : 0;
  const cast:ExpansionCast = { skillId: id, resourceRatio:c.stacks.castResourceRatio??s.currentResource/getEffectiveAircraftStats(s).maxResource, skillShieldUntil:c.stacks.skillShieldCast===c.skillCasts?now+6:undefined, overclock: overclock * .12, capacitor, compressed:hasCore(s,102)&&!r.liveCasts.some(c=>!c.ended)&&now-Math.max(s.coreState.release?.lastSkillEnd??0,prior?.at??0)>=4 };
  // A refreshed duration remains one active effect; retired snapshots can still
  // belong to in-flight projectiles, but must not emit a second completion.
  const previous = r.casts[id];
  if (previous && !["decoy", "missile_swarm", "heavy_bomb"].includes(id)) previous.ended = true;
  r.casts[id] = cast; r.liveCasts.push(cast);
  if (hasCore(s, 199)) {
    c.stacks.overclock = overclock === 3 ? 0 : overclock + 1;
    if (overclock === 3) {recordCoreMetric(s,199,"procs",1);recordCoreMetric(s,199,"detonations",1);h.area(w, w.playerX, w.playerY, Infinity, getEffectiveAircraftStats(s).firepower * 2.5, 199);}
  }
  return cast;
}

export function expansionHpLoss(w: CombatWorld, amount: number, receivedDamage = true) {
  if (amount <= 0) return;
  const s = w.aircraft, c = s.coreState, r = expansionState(s), stats = getEffectiveAircraftStats(s);
  r.returns.length = 0;
  r.hpLoss.push({ at: c.time, amount });
  r.hpLoss = r.hpLoss.filter(hit => hit.at >= c.time - 3);
  c.stacks.recentThreeSecondLoss=r.hpLoss.reduce((n,hit)=>n+hit.amount,0);
  const recent = r.hpLoss.filter(hit=>hit.at>=c.time-2).reduce((n, hit) => n + hit.amount, 0);
  c.stacks.recentTwoSecondLoss=recent;
  if (hasCore(s, 174) && recent > stats.maxHp * .08 && coreCooldownReady(s, "shockPadCd")) {
    resource(w, stats.maxResource * .12,174); deferCoreCooldown(s,"shockPadCd");timer(w,"shockPadRegen",4);recordCoreMetric(s,174,"procs",1);
  }
  if (receivedDamage && hasCore(s, 187)) {const before=c.stacks.recoil??0;c.stacks.recoil = Math.min(stats.firepower * 5, before + amount * .50);recordCoreMetric(s,187,"damageStored",c.stacks.recoil-before);const entry=c.telemetry.core_187??={};entry.peak=Math.max(entry.peak??0,c.stacks.recoil);}
  if (hasCore(s, 195) && recent >= stats.maxHp * .12 && coreCooldownReady(s, "blackBoxCd")) {
    timer(w, "blackBox", 4); deferCoreCooldown(s,"blackBoxCd");
    recordCoreMetric(s,195,"procs",1);
  }
}
export function deferExpansionDamage(w: CombatWorld, damage: number, sourceEnemyId?:number, reflection=false): number {
  if (!hasCore(w.aircraft, 197) || damage <= 0) return damage;
  expansionState(w.aircraft).debt.push({ amount: damage * .35 / 4, next: w.elapsed + 1, ticks: 4, sourceEnemyId, reflection });
  recordCoreMetric(w.aircraft,197,"accumulated",damage*.35);
  const entry=w.aircraft.coreState.telemetry.core_197??={};entry.peak=Math.max(entry.peak??0,expansionState(w.aircraft).debt.reduce((n,d)=>n+d.amount*d.ticks,0));
  return damage * .65;
}

export function expansionKill(w: CombatWorld, enemy: EnemyEntity, h: ExpansionHooks) {
  const s = w.aircraft, c = s.coreState, r = expansionState(s), hit = enemy.expansionKillingHit;
  if (!hit || enemy.killProcEligible === false) return;
  const stats = getEffectiveAircraftStats(s);
  if(hasCore(s,168)&&enemy.type!=="boss"&&!hElite(enemy)){c.stacks.shiftKills=(c.stacks.shiftKills??0)+1;if(c.stacks.shiftKills>=10){c.stacks.shiftKills-=10;timer(w,"shiftDiscount",5);recordCoreMetric(s,168,"procs",1);}}
  if (hasCore(s, 197)) {
    const elite = enemy.type === "boss" || hElite(enemy);
    if (!elite) c.stacks.debtKills = (c.stacks.debtKills ?? 0) + 1;
    if (elite || c.stacks.debtKills >= 15) {
      if (!elite) c.stacks.debtKills = 0;
      recordCoreMetric(s,197,"debtCleared",r.debt.reduce((n,d)=>n+d.amount*d.ticks,0));r.debt.length = 0; h.heal(w, stats.maxHp * .04, 197);
    }
  }
}
// Runtime supplies explicit elite identity on the killing hit, including Stage 2.
const hElite = (e: EnemyEntity) => !!e.expansionKillingHit?.elite;

/** Refresh before resource regeneration as well as healing; never reuse last tick's safe zone. */
export function refreshBreathingRoom(w: CombatWorld, h: ExpansionHooks) {
  const s = w.aircraft;
  s.coreState.stacks.breathing = hasCore(s, 176) && s.currentHp > 0 && !h.threat(w, 150, true) ? 1 : 0;
}

export function tickExpansion(w: CombatWorld, dt: number, h: ExpansionHooks) {
  refreshBreathingRoom(w, h);
  const s = w.aircraft, c = s.coreState, r = expansionState(s), now = c.time, stats = getEffectiveAircraftStats(s);
  for(const enemy of w.enemies){
    const marks=enemy.expansionMarks,until=marks?.preliminary??0;
    if(marks&&until>0&&(until<=now||enemy.hp<=0)){
      marks.preliminary=0;marks.preliminaryReady=Math.min(now,until)+10;
    }
  }
  if(hasCore(s,72)&&!expansionActive(s,"coldGuard")&&now-Math.max(c.lastDamage,c.timers.coldGuard??0)>=4)c.stacks.coldCharges=1;
  if((c.timers.sameTarget??0)<now){c.stacks.sameTargetHits=0;delete c.stacks.sameTargetId;}
  if (hasCore(s, 184) && c.timers.celestialReady === undefined && !c.stacks["cooldownPending:celestialReady"]) timer(w, "celestialReady", 0);
  if (hasCore(s, 61) && coreCooldownReady(s, "reactiveArmorCd") && h.threat(w, 70, false)) {
    timer(w, "reactiveArmor", 5); deferCoreCooldown(s,"reactiveArmorCd");
    recordCoreMetric(s,61,"procs",1);
  }
  if (hasCore(s, 172) && !c.stacks.capacitorCharge) {
    if (s.currentResource >= stats.maxResource) {
      r.fullSince ??= now - dt;
      if (now - r.fullSince >= 2) {c.stacks.capacitorCharge = 1;recordCoreMetric(s,172,"procs",1);}
    } else r.fullSince = undefined;
  }
  if (hasCore(s, 176)) {
    if (c.stacks.breathing) {h.heal(w, expansionHealingRate(stats,176) * dt, 176);recordCoreMetric(s,176,"uptime",dt);}
  }
  if(hasCore(s,178)&&coreCooldownReady(s,"magneticBrakeCd")&&w.projectiles.some(p=>p.owner==="enemy"&&p.allegiance!=="friendly_hacked"&&Math.hypot(p.x-w.playerX,p.y-w.playerY)<=170)){
    deferCoreCooldown(s,"magneticBrakeCd");timer(w,"magneticBrake",3);c.stacks.magneticErase=3;recordCoreMetric(s,178,"procs",1);
  }
  observeExpansionResource(s, stats.maxResource);
  const activeStep = (key: string) => Math.max(0, Math.min(dt, (c.timers[key] ?? 0) - (now - dt)));
  if (hasCore(s,76)) h.heal(w, expansionHealingRate(stats,76) * activeStep("blackBox"),76);
  r.hpLoss = r.hpLoss.filter(hit => hit.at >= now - 3);
  c.stacks.recentTwoSecondLoss=r.hpLoss.filter(hit=>hit.at>=now-2).reduce((n,hit)=>n+hit.amount,0);
  if (c.stacks.satellites && !expansionActive(s, "satellites")) {
    for (let i = 0; i < c.stacks.satellites; i++) {h.shard(w, w.playerX, w.playerY, stats.firepower * 1.60, 198);recordCoreMetric(s,198,"shots",1);}
    c.stacks.satellites = 0;
  }
  for(const [row,fraction,duration] of [[2,.05,4],[8,.08,3],[14,.12,5]]){
    const key=`fortress:${row}`;
    if(hasCore(s,row)&&coreCooldownReady(s,key)){
      const shield=createAbsorbShield(s,key,stats.maxHp*fraction,duration);shield.coreRow=row;deferCoreCooldown(s,key);recordCoreMetric(s,row,"shieldCreated",shield.amount);
    }
  }
  if(hasCore(s,103)){
    const low=s.currentHp<stats.maxHp*.35;
    if(low&&!c.stacks.survivalLow&&coreCooldownReady(s,"survivalGuard")){
      const shield=createAbsorbShield(s,"survivalGuard",stats.maxHp*.08,4);shield.coreRow=103;deferCoreCooldown(s,"survivalGuard");recordCoreMetric(s,103,"shieldCreated",shield.amount);
    }
    c.stacks.survivalLow=Number(low);
  }
  if(hasCore(s,192)){
    if(hasAbsorbShield(s))c.timers.phaseUnshielded=now;
    else if(now-(c.timers.phaseUnshielded??0)>=12){const shield=createAbsorbShield(s,"phaseGuard",stats.maxHp*.06,4);shield.coreRow=192;recordCoreMetric(s,192,"shieldCreated",shield.amount);c.timers.phaseUnshielded=now;}
  }
  if(hasCore(s,90)&&expansionActive(s,"deathRefusalHeal"))h.heal(w,stats.maxHp*.40/3*activeStep("deathRefusalHeal"),90);
  if(hasCore(s,104)&&s.currentHp>=stats.maxHp&&!s.duel?.healingBlocked&&now-(c.timers.overhealSurplus??-Infinity)>=dt){
    const old=c.shields.overheal,capacity=old&&old.until>now?old.amount:0;
    const passive=old&&old.until>now?Math.min(capacity,c.stacks.overhealPassive??0):0;
    const gain=Math.min(stats.maxHp*.005*dt,Math.max(0,stats.maxHp*.08-passive),Math.max(0,stats.maxHp*.20-capacity));
    c.stacks.overhealPassive=passive+gain;
    if(gain>0){const sh=old&&old.until>now?old:createAbsorbShield(s,"overheal",0,8);sh.amount=capacity+gain;sh.capacity=Math.max(sh.capacity??0,sh.amount);sh.until=now+8;recordCoreMetric(s,104,"shieldCreated",gain);}
  }
  // Expiration and break share one exactly-once settlement path.
  for (const [key, sh] of Object.entries(c.shields)) {
    prepareAbsorbShield(s, sh);
    if (sh.until <= now || sh.amount <= 0) { finishAbsorbShield(s, sh); delete c.shields[key]; }
  }
  settleExpansionShields(w, h);
  for (const debt of r.debt) while (debt.ticks > 0 && now + 1e-8 >= debt.next && s.currentHp > 0) {
    debt.ticks--; debt.next += 1; h.debt(w, debt.amount, debt.sourceEnemyId, debt.reflection);
  }
  r.debt = r.debt.filter(debt => debt.ticks > 0);
  // Projectile/discrete skill lifetimes are world-owned rather than cooldown-owned.
  for (const cast of r.liveCasts) {
    if (!cast || cast.ended) continue;
    const id = cast.skillId;
    if (id === "decoy" && !(w.decoyVolleys && r.casts.decoy === cast) && !w.decoys.some(d => !d.clone && d.expansionCast === cast)) { finishExpansionSkill(s, cast); startDeferredSkillCooldown(s,id); }
    if (id === "missile_swarm" && !w.skillCores.salvos.some(salvo => salvo.expansionCast === cast && (salvo.pending))) { finishExpansionSkill(s, cast); startDeferredSkillCooldown(s,id); }
    if (id === "heavy_bomb" && (!w.bigBang || w.bigBang.resolved || w.bigBang.expansionCast !== cast)) { finishExpansionSkill(s, cast); startDeferredSkillCooldown(s,id); }
  }
  r.liveCasts = r.liveCasts.filter(cast => !cast.ended);
}
export function settleExpansionShields(w: CombatWorld, h: ExpansionHooks) {
  const s = w.aircraft, r = expansionState(s), stats = getEffectiveAircraftStats(s);
  for (const sh of r.endedShields.splice(0)) {
    if(sh.coreRow===14&&sh.broken&&hasCore(s,14)){h.area(w,w.playerX,w.playerY,120,stats.firepower*2,14);recordCoreMetric(s,14,"procs",1);}
    if (hasCore(s, 173)) {recordCoreMetric(s,173,"procs",1);h.heal(w, (sh.absorbed??0) * .25, 173);}
    if (hasCore(s, 200) && (sh.absorbed ?? 0) > (sh.reflectedAbsorbed??0)) {recordCoreMetric(s,200,"detonations",1);h.area(w, w.playerX, w.playerY, 120, (sh.absorbed!-(sh.reflectedAbsorbed??0)) * 1.60, 200);}
  }
}
export function satellitePositions(w: CombatWorld) {
  const c = w.aircraft.coreState;
  if (!expansionActive(w.aircraft, "satellites")) return [];
  return Array.from({ length: c.stacks.satellites ?? 0 }, (_, i) => {
    const angle = w.elapsed * 2.2 + i * Math.PI * 2 / Math.max(1,c.stacks.satellites??5);
    return { x: w.playerX + Math.cos(angle) * 36, y: w.playerY + Math.sin(angle) * 36 };
  });
}
export function slowExpansionProjectile(w: CombatWorld, p: ProjectileEntity): number {
  const s = w.aircraft;
  if (p.owner !== "enemy" || p.allegiance === "friendly_hacked" || p.rawDamage <= 0) return 1;
  return hasCore(s,178)&&expansionActive(s,"magneticBrake")&&Math.hypot(p.x-w.playerX,p.y-w.playerY)<=170 ? .40 : 1;
}

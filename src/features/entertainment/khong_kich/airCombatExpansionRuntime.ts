import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { SkillId } from "./airCombatTypes";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { hasCore } from "./airCombatCoreEffects";
import { AIRCRAFT_CONFIGS } from "./airCombatConfig";
import { expansionState, expansionActive, finishAbsorbShield, prepareAbsorbShield, finishExpansionSkill, observeExpansionResource, type ExpansionCast } from "./airCombatExpansion";

export interface ExpansionHooks {
  hostile(w: CombatWorld, e: EnemyEntity): boolean;
  area(w: CombatWorld, x: number, y: number, radius: number, raw: number, row: number): void;
  shard(w: CombatWorld, x: number, y: number, raw: number, row: number): void;
  heal(w: CombatWorld, amount: number, row: number): void;
  threat(w: CombatWorld, radius: number, bodies: boolean): boolean;
  debt(w: CombatWorld, amount: number): void;
}
const timer = (w: CombatWorld, key: string, seconds: number) => { w.aircraft.coreState.timers[key] = w.elapsed + seconds; };
const resource = (w: CombatWorld, amount: number) => { const s = w.aircraft; s.currentResource = Math.min(getEffectiveAircraftStats(s).maxResource, s.currentResource + amount); };

export function castExpansion(w: CombatWorld, id: SkillId, spent: number, h: ExpansionHooks): ExpansionCast {
  const s = w.aircraft, c = s.coreState, r = expansionState(s), now = c.time;
  const prior = r.lastSkill;
  if (hasCore(s, 171)) timer(w, "safetyLatch", 1.5);
  if (hasCore(s, 172) && c.stacks.capacitorCharge) {
    c.stacks.capacitorCharge = 0; r.fullSince = undefined;
    if (id === "escort_drone") timer(w, "capacitorHawk", 3);
    else resource(w, spent * .15);
  }
  if (prior && prior.id !== id) {
    if (hasCore(s, 175) && now - prior.at <= 5) timer(w, "alternating", 4);
    if (hasCore(s, 186) && now - prior.at <= 4 && !expansionActive(s, "confluenceCd")) {
      timer(w, "confluence", 6); timer(w, "confluenceCd", 20);
    }
  }
  r.lastSkill = { id, at: now };
  if (hasCore(s, 193)) {
    r.sequence = r.sequence.filter(cast => now - cast.at <= 7 && cast.id !== id);
    r.sequence.push({ id, at: now });
    if (r.sequence.length === 3) {
      for (const skill of AIRCRAFT_CONFIGS[s.aircraftId].skillIds) s.cooldowns[skill] = Math.max(0, (s.cooldowns[skill] ?? 0) - 3);
      r.sequence.length = 0; timer(w, "tripleRegen", 5);
    }
  }
  if (hasCore(s, 198)) {
    if (!expansionActive(s, "satellites") || !c.stacks.satellites) c.stacks.satellites = 3;
    timer(w, "satellites", 4);
  }
  const overclock = hasCore(s, 199) ? (c.stacks.overclock ?? 0) : 0;
  const cast = { skillId: id, overclock: overclock * .18 };
  // A refreshed duration remains one active effect; retired snapshots can still
  // belong to in-flight projectiles, but must not emit a second completion.
  const previous = r.casts[id];
  if (previous && !["decoy", "missile_swarm", "heavy_bomb"].includes(id)) previous.ended = true;
  r.casts[id] = cast; r.liveCasts.push(cast);
  if (hasCore(s, 199)) {
    c.stacks.overclock = overclock === 3 ? 0 : overclock + 1;
    if (overclock === 3) h.area(w, w.playerX, w.playerY, Infinity, getEffectiveAircraftStats(s).firepower * 2.5, 199);
  }
  return cast;
}

export function expansionHpLoss(w: CombatWorld, amount: number, receivedDamage = true) {
  if (amount <= 0) return;
  const s = w.aircraft, c = s.coreState, r = expansionState(s), stats = getEffectiveAircraftStats(s);
  r.returns.length = 0;
  r.hpLoss.push({ at: c.time, amount });
  r.hpLoss = r.hpLoss.filter(hit => hit.at >= c.time - 2);
  const recent = r.hpLoss.reduce((n, hit) => n + hit.amount, 0);
  if (hasCore(s, 174) && recent > stats.maxHp * .08 && !expansionActive(s, "shockPadCd")) {
    resource(w, stats.maxResource * .08); timer(w, "shockPadCd", 15);
  }
  if (receivedDamage && hasCore(s, 187)) c.stacks.recoil = Math.min(stats.firepower * 1.2, (c.stacks.recoil ?? 0) + amount * .20);
  if (hasCore(s, 195) && recent >= stats.maxHp * .15 && !expansionActive(s, "blackBoxCd")) {
    timer(w, "blackBox", 4); timer(w, "blackBoxCd", 24);
  }
}
export function deferExpansionDamage(w: CombatWorld, damage: number): number {
  if (!hasCore(w.aircraft, 197) || damage <= 0) return damage;
  expansionState(w.aircraft).debt.push({ amount: damage * .25 / 3, next: w.elapsed + 1, ticks: 3 });
  return damage * .75;
}

export function expansionKill(w: CombatWorld, enemy: EnemyEntity, h: ExpansionHooks) {
  const s = w.aircraft, c = s.coreState, r = expansionState(s), hit = enemy.expansionKillingHit;
  if (!hit || enemy.killProcEligible === false) return;
  const stats = getEffectiveAircraftStats(s);
  if (hasCore(s, 189) && hit.primary) h.shard(w, enemy.x, enemy.y, stats.firepower * 1.5, 189);
  if (hasCore(s, 191)) {
    if (hit.basic) { timer(w, "alternatingSkill", 5); c.timers.alternatingBasic = 0; }
    else if (hit.skill) { timer(w, "alternatingBasic", 4); c.timers.alternatingSkill = 0; }
  }
  if (hasCore(s, 196) && hit.critical && hit.direct) c.stacks.crimsonCrit = Math.min(20, (c.stacks.crimsonCrit ?? 0) + 1);
  if (hasCore(s, 197)) {
    const elite = enemy.type === "boss" || hElite(enemy);
    if (!elite) c.stacks.debtKills = (c.stacks.debtKills ?? 0) + 1;
    if (elite || c.stacks.debtKills >= 12) {
      if (!elite) c.stacks.debtKills = 0;
      r.debt.length = 0; h.heal(w, stats.maxHp * .02, 197);
    }
  }
}
// Runtime supplies explicit elite identity on the killing hit, including Stage 2.
const hElite = (e: EnemyEntity) => !!e.expansionKillingHit?.elite;

export function tickExpansion(w: CombatWorld, dt: number, h: ExpansionHooks) {
  const s = w.aircraft, c = s.coreState, r = expansionState(s), now = c.time, stats = getEffectiveAircraftStats(s);
  if (hasCore(s, 184) && c.timers.celestialReady === undefined) timer(w, "celestialReady", 18);
  if (hasCore(s, 170) && !expansionActive(s, "earlyArmorCd") && h.threat(w, 70, false)) {
    timer(w, "earlyArmor", 1.5); timer(w, "earlyArmorCd", 16.5);
  }
  if (hasCore(s, 172) && !c.stacks.capacitorCharge) {
    if (s.currentResource >= stats.maxResource) {
      r.fullSince ??= now - dt;
      if (now - r.fullSince >= 3) c.stacks.capacitorCharge = 1;
    } else r.fullSince = undefined;
  }
  if (hasCore(s, 176)) {
    c.stacks.breathing = h.threat(w, 100, true) ? 0 : 1;
    if (c.stacks.breathing) h.heal(w, stats.maxHp * .0035 * dt, 176);
  }
  observeExpansionResource(s, stats.maxResource);
  const activeStep = (key: string) => Math.max(0, Math.min(dt, (c.timers[key] ?? 0) - (now - dt)));
  if (hasCore(s, 182)) resource(w, stats.maxResource * .20 / 4 * activeStep("reserveBattery"));
  if (hasCore(s, 195)) h.heal(w, stats.maxHp * .10 / 4 * activeStep("blackBox"), 195);
  r.hpLoss = r.hpLoss.filter(hit => hit.at >= now - 2);
  for (const charge of r.charges) {
    const target = w.enemies.find(e => e.id === charge.target);
    if (target) { charge.x = target.x; charge.y = target.y; }
    if (now >= charge.at) h.area(w, charge.x, charge.y, 50, stats.firepower * .45, 168);
  }
  r.charges = r.charges.filter(charge => charge.at > now);
  if (c.stacks.satellites && !expansionActive(s, "satellites")) {
    for (let i = 0; i < c.stacks.satellites; i++) h.shard(w, w.playerX, w.playerY, stats.firepower * .90, 198);
    c.stacks.satellites = 0;
  }
  // Expiration and break share one exactly-once settlement path.
  for (const [key, sh] of Object.entries(c.shields)) {
    prepareAbsorbShield(s, sh);
    if (sh.until <= now || sh.amount <= 0) { finishAbsorbShield(s, sh); delete c.shields[key]; }
  }
  settleExpansionShields(w, h);
  for (const debt of r.debt) while (debt.ticks > 0 && now + 1e-8 >= debt.next && s.currentHp > 0) {
    debt.ticks--; debt.next += 1; h.debt(w, debt.amount);
  }
  r.debt = r.debt.filter(debt => debt.ticks > 0);
  for (const pending of r.returns) if (now >= pending.at) {
    const key = `return:${w.nextId++}`;
    // Capacity already includes Core200. Returning is not a second amplification.
    c.shields[key] = { amount: pending.capacity * .5, capacity: pending.capacity * .5, absorbed: 0,
      until: now + pending.duration, duration: pending.duration, returned: true };
  }
  r.returns = r.returns.filter(pending => pending.at > now);
  // Projectile/discrete skill lifetimes are world-owned rather than cooldown-owned.
  for (const cast of r.liveCasts) {
    if (!cast || cast.ended) continue;
    const id = cast.skillId;
    if (id === "decoy" && !(w.decoyVolleys && r.casts.decoy === cast) && !w.decoys.some(d => !d.clone && d.expansionCast === cast)) finishExpansionSkill(s, cast);
    if (id === "missile_swarm" && !w.skillCores.salvos.some(salvo => salvo.expansionCast === cast && (salvo.pending || salvo.live.size))) finishExpansionSkill(s, cast);
    if (id === "heavy_bomb" && !w.projectiles.some(p => p.expansionCast === cast)) finishExpansionSkill(s, cast);
  }
  r.liveCasts = r.liveCasts.filter(cast => !cast.ended);
}
export function settleExpansionShields(w: CombatWorld, h: ExpansionHooks) {
  const s = w.aircraft, r = expansionState(s), stats = getEffectiveAircraftStats(s);
  for (const sh of r.endedShields.splice(0)) {
    if (hasCore(s, 173)) h.heal(w, stats.maxHp * .025, 173);
    if (hasCore(s, 200) && (sh.absorbed ?? 0) > 0) h.area(w, w.playerX, w.playerY, 120, sh.absorbed! * 1.60, 200);
    if (hasCore(s, 204) && !sh.returned) r.returns.push({ at: w.elapsed + 2, capacity: sh.capacity!, duration: sh.duration! });
  }
}
export function satellitePositions(w: CombatWorld) {
  const c = w.aircraft.coreState;
  if (!expansionActive(w.aircraft, "satellites")) return [];
  return Array.from({ length: c.stacks.satellites ?? 0 }, (_, i) => {
    const angle = w.elapsed * 2.2 + i * Math.PI * 2 / 3;
    return { x: w.playerX + Math.cos(angle) * 36, y: w.playerY + Math.sin(angle) * 36 };
  });
}
export function slowExpansionProjectile(w: CombatWorld, p: ProjectileEntity): number {
  const s = w.aircraft;
  if (p.owner !== "enemy" || p.allegiance === "friendly_hacked" || p.rawDamage <= 0) return 1;
  if (hasCore(s, 178) && !expansionActive(s, "magneticBrakeCd") && Math.hypot(p.x - w.playerX, p.y - w.playerY) <= 40 + p.radius) {
    p.expansionSlowUntil = w.elapsed + 1.2; timer(w, "magneticBrake", 1.2); timer(w, "magneticBrakeCd", 12);
  }
  return (p.expansionSlowUntil ?? 0) > w.elapsed ? .40 : 1;
}

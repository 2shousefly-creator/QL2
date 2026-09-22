import { equipmentSkillEnd } from "./airCombatEquipmentRuntime";
import { releaseState, overheated } from "./airCombatReleaseState";
import type { AircraftCombatState, EffectiveAircraftStats, SkillId } from "./airCombatTypes";
import { CORE_DEFINITIONS } from "./airCombatCoreCatalog";
import { recordCoreMetric } from "./airCombatTelemetry";

const owns = (s: AircraftCombatState, n: number) => s.selectedCores.includes(`core_${n}`);
export interface ExpansionCast { skillId: SkillId; overclock: number; ended?: boolean }
export interface AbsorbShield {
  amount: number; until: number;
  capacity?: number; absorbed?: number; duration?: number; returned?: boolean; settled?: boolean;
}
export interface ExpansionState {
  lastSkill?: { id: SkillId; at: number };
  sequence: { id: SkillId; at: number }[];
  casts: Partial<Record<SkillId, ExpansionCast>>;
  liveCasts: ExpansionCast[];
  hpLoss: { at: number; amount: number }[];
  debt: { amount: number; next: number; ticks: number }[];
  charges: { target: number; x: number; y: number; at: number }[];
  returns: { at: number; capacity: number; duration: number }[];
  endedShields: AbsorbShield[];
  fullSince?: number;
  resourceRatio?: number;
  primarySkill?: SkillId;
  primaryPending?: boolean;
}
export const expansionState = (s: AircraftCombatState): ExpansionState => s.coreState.expansion ??= {
  sequence: [], casts: {}, liveCasts: [], hpLoss: [], debt: [], charges: [], returns: [], endedShields: [],
};
export const expansionActive = (s: AircraftCombatState, key: string) => (s.coreState.timers[key] ?? 0) > s.coreState.time;
export function activeNegativeStatusTypes(s: AircraftCombatState): Set<string> {
  const status = s.status, now = s.coreState.time, result = new Set<string>();
  for (const key of ["stunnedUntil", "skillLockedUntil", "resourceJammedUntil", "armorBrokenUntil", "regenDisabledUntil", "healingReceivedUntil"] as const)
    if (status[key] > now) result.add(key);
  for (const [key, mark] of Object.entries(status.marks)) if (mark && mark.until > now) result.add(key);
  if (expansionActive(s, "acidArmor")) result.add("acidArmor");
  return result;
}
export const hasAbsorbShield = (s: AircraftCombatState) => Object.values(s.coreState.shields).some(sh => sh.amount > 0 && sh.until > s.coreState.time);
export function arsenalBonuses(s: AircraftCombatState) {
  const counts = { attack: 0, defense: 0, resource: 0, utility: 0, skill: 0 };
  if (owns(s, 201)) for (const id of new Set(s.selectedCores)) {
    const core = CORE_DEFINITIONS.find(c => c.id === id);
    if (core && core.system !== "skill") counts[core.system]++;
  }
  const utility = Math.min(.12, counts.utility * .02);
  return { basic: Math.min(.30, counts.attack * .05) + utility, skill: Math.min(.30, counts.resource * .05) + utility,
    reduction: Math.min(.24, counts.defense * .04) + utility };
}
/** Runs after all legacy final stats, before canonical clamps/Fire Rate lock. */
export function applyExpansionStats(s: AircraftCombatState, stats: EffectiveAircraftStats, temporary: boolean) {
  const c = s.coreState;
  if (owns(s, 188)) stats.criticalChance += .15;
  if (owns(s, 194)) stats.criticalChance += .10;
  if (owns(s, 207)) stats.criticalChance += .25;
  if (owns(s, 196)) stats.criticalDamageMultiplier += Math.min(.50, (c.stacks.crimsonCrit ?? 0) * .025);
  if (temporary) {
    const negative = activeNegativeStatusTypes(s).size;
    if (owns(s, 169)) {
      const ratio = s.currentResource / stats.maxResource;
      if (ratio > .70) stats.firepower += 10;
      else if (ratio < .30) stats.hpRegen += .7;
      else stats.fireRate += .2;
    }
    if (owns(s, 170) && expansionActive(s, "earlyArmor")) stats.armor += 18;
    if (owns(s, 179)) stats.criticalChance += Math.min(10, c.stacks.error ?? 0) * .02;
    if (owns(s, 181) && expansionActive(s, "skillExhaust")) stats.resourceRegen *= 1.25;
    if (owns(s, 183)) stats.armor += Math.min(40, negative * 20);
    if (owns(s, 192) && !hasAbsorbShield(s)) stats.armor += 14;
    if (owns(s, 193) && expansionActive(s, "tripleRegen")) stats.resourceRegen *= 1.25;
    if (owns(s, 209)) {
      if (s.currentHp < stats.maxHp * .35) c.stacks.lastStand = 1;
      else if (s.currentHp > stats.maxHp * .35) c.stacks.lastStand = 0;
      if (c.stacks.lastStand) { stats.armor += 150; stats.resourceRegen *= 1.4; stats.cooldownReduction += .20; }
    }
  }
  // The locked final chance wins over every new flat/conditional contribution.
  if (owns(s, 95)) stats.criticalChance = .25;
  if (owns(s, 206)) { stats.fireRate *= .8; stats.weapon.penetration++; }
}
export function expansionOutgoing(s: AircraftCombatState, basic: boolean, skill: boolean, primary = false): number {
  let value = 1;
  if(owns(s,219)&&!overheated(s)&&releaseState(s).heat>=50&&releaseState(s).heat<100)value*=1.2;
  if (expansionActive(s, "alternating")) value *= 1.12;
  if (owns(s, 192) && hasAbsorbShield(s)) value *= 1.15;
  if (owns(s, 203) && activeNegativeStatusTypes(s).size) value *= 1.35;
  if (owns(s, 205)) value *= 1.25;
  if (owns(s, 209) && s.coreState.stacks.lastStand) value *= .85;
  const arsenal = arsenalBonuses(s);
  if (basic) {
    value *= 1 + arsenal.basic;
    if (expansionActive(s, "confluence")) value *= 1.35;
    if (expansionActive(s, "alternatingBasic")) value *= 1.20;
    if (primary && owns(s, 206)) value *= 1.70;
  }
  if (skill) { value *= 1 + arsenal.skill; if (owns(s, 190)) value *= 1.22; }
  return value;
}
export function expansionIncoming(s: AircraftCombatState): number {
  let value = 1 - arsenalBonuses(s).reduction;
  if (owns(s, 203) && activeNegativeStatusTypes(s).size) value *= .75;
  if (owns(s, 205)) value *= 1.18;
  return value;
}
export function expansionSkillCost(s: AircraftCombatState, id: SkillId): number {
  return (owns(s, 190) ? 1.15 : 1) * (expansionState(s).primarySkill === id ? .85 : 1);
}
export function finishExpansionSkill(s: AircraftCombatState, cast?: ExpansionCast) {
  if (!cast || cast.ended) return;
  cast.ended = true;
  equipmentSkillEnd(s);
  releaseState(s).lastSkillEnd=s.coreState.time;
  if (owns(s, 181)) {s.coreState.timers.skillExhaust = s.coreState.time + 3;recordCoreMetric(s,181,"procs",1);}
}
/** One charge blocks the triggering damage/control payload as well as the tail. */
export function celestialProtection(s: AircraftCombatState): boolean {
  if (!owns(s, 184)) return false;
  const c = s.coreState;
  if (expansionActive(s, "celestial")) return true;
  if (c.timers.celestialReady === undefined) { c.timers.celestialReady = c.time + 18; return false; }
  if (c.time < c.timers.celestialReady) return false;
  c.timers.celestial = c.time + 2.5;
  c.timers.celestialReady = c.time + 2.5 + 18;
  recordCoreMetric(s,184,"procs",1);
  return true;
}
/** Initialize exactly once per temporary shield instance, never on every tick. */
export function prepareAbsorbShield(s: AircraftCombatState, sh: AbsorbShield) {
  if (sh.capacity !== undefined) return;
  const temporary = Number.isFinite(sh.until);
  if (temporary && owns(s, 200)) {recordCoreMetric(s,200,"shieldCreated",sh.amount*.5);sh.amount *= 1.5;}
  sh.capacity = sh.amount; sh.absorbed = 0;
  sh.duration = temporary ? Math.max(0, sh.until - s.coreState.time) : Infinity;
}
export function finishAbsorbShield(s: AircraftCombatState, sh: AbsorbShield) {
  if (sh.settled) return;
  prepareAbsorbShield(s, sh);
  sh.settled = true;
  if (Number.isFinite(sh.until)) expansionState(s).endedShields.push(sh);
}
export function createAbsorbShield(s: AircraftCombatState, key: string, amount: number, seconds: number) {
  const sh: AbsorbShield = { amount, until: s.coreState.time + seconds };
  prepareAbsorbShield(s, sh);
  s.coreState.shields[key] = sh;
  return sh;
}

/** Observe actual spending before same-frame refunds/regen can mask a threshold crossing. */
export function observeExpansionResource(s: AircraftCombatState, maxResource: number) {
  const c=s.coreState,r=expansionState(s),ratio=s.currentResource/maxResource;
  if (ratio<1) r.fullSince=undefined;
  if (owns(s,182) && ratio<.20 && (r.resourceRatio??1)>=.20 && !expansionActive(s,"reserveBatteryCd")) {
    c.timers.reserveBattery=c.time+4;c.timers.reserveBatteryCd=c.time+22;
    recordCoreMetric(s,182,"procs",1);
  }
  r.resourceRatio=ratio;
}

import { startEquipmentCooldown } from "./airCombatEquipmentState";
import { externalNegativeStatusTypes } from './airCombatNegativeStatuses';
import { CELESTIAL_PROTECTION_TIMING, coreCooldownReady, deferCoreCooldown, startCoreCooldown } from "./airCombatCooldowns";
import { getRecoveryReceivedMultiplier, getShieldReceivedMultiplier } from "./airCombatRecovery";
import { equipmentSkillEnd } from "./airCombatEquipmentRuntime";
import { releaseState, overheated } from "./airCombatReleaseState";
import type { AircraftCombatState, EffectiveAircraftStats, SkillId } from "./airCombatTypes";
import { CORE_DEFINITIONS } from "./airCombatCoreCatalog";
import { recordCoreMetric } from "./airCombatTelemetry";

const owns = (s: AircraftCombatState, n: number) => s.selectedCores.includes(`core_${n}`);
export interface ExpansionCast { skillId: SkillId; overclock: number; skillShieldUntil?: number; resourceRatio?: number; compressed?: boolean; capacitor?: boolean; equipmentBonus?: number; cannonHealingSpent?: number; ended?: boolean }
export interface AbsorbShield {
  amount: number; until: number;
  coreRow?: number; broken?: boolean; capacity?: number; absorbed?: number; reflectedAbsorbed?: number; duration?: number; returned?: boolean; settled?: boolean;
}
export interface ExpansionState {
  lastSkill?: { id: SkillId; at: number };
  sequence: { id: SkillId; at: number }[];
  casts: Partial<Record<SkillId, ExpansionCast>>;
  liveCasts: ExpansionCast[];
  hpLoss: { at: number; amount: number }[];
  debt: { amount: number; next: number; ticks: number; sourceEnemyId?:number; reflection?:boolean }[];
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
  const status = s.status, now = s.coreState.time, result = externalNegativeStatusTypes(s);
  for(const key of ["forestRootUntil","forestStunUntil","forestArmorUntil"] as const)if((status[key]??0)>now)result.add(key);
  for (const key of ["stunnedUntil", "skillLockedUntil", "resourceJammedUntil", "armorBrokenUntil", "regenDisabledUntil", "healingReceivedUntil"] as const)
    if (status[key] > now && (key !== "healingReceivedUntil" || status.healingReceivedMultiplier < 1)
      && (key !== "resourceJammedUntil" || status.jams.some(j => j.until > now && j.multiplier < 1))) result.add(key);
  for (const [key, mark] of Object.entries(status.marks)) if (mark && mark.until > now) result.add(key);
  if (expansionActive(s, "acidArmor")) result.add("armorBrokenUntil");
  return result;
}
export const hasAbsorbShield = (s: AircraftCombatState) => ((s.coreState.timers.terraArmor??0)>s.coreState.time&&(s.coreState.stacks.terraReserve??0)>0)||Object.values(s.coreState.shields).some(sh => sh.amount > 0 && sh.until > s.coreState.time);
export function arsenalBonuses(s: AircraftCombatState) {
  const counts = { attack: 0, defense: 0, resource: 0, utility: 0, skill: 0 };
  if (owns(s, 201)) for (const id of new Set(s.selectedCores)) {
    const core = CORE_DEFINITIONS.find(c => c.id === id);
    if (core && core.system !== "skill") counts[core.system]++;
  }
  return { basic:(counts.attack? .18:0)+(counts.utility?.09:0), skill:(counts.resource?.18:0)+(counts.utility?.09:0), reduction:counts.defense?.12:0, resource:counts.utility?.15:0 };
}
/** Runs after all legacy final stats, before canonical clamps/Fire Rate lock. */
export function applyExpansionStats(s: AircraftCombatState, stats: EffectiveAircraftStats, temporary: boolean) {
  const c = s.coreState;
  if (owns(s, 188)) {stats.criticalChance += .20;stats.criticalDamageMultiplier+=.25;}
  stats.bonusResourceRegenPct+=arsenalBonuses(s).resource;
  stats.permanentResourceRegenPct+=arsenalBonuses(s).resource;
  if(temporary&&expansionActive(s,"timeRecovery"))stats.bonusResourceRegenPct+=.45;
  if (owns(s, 194)) stats.criticalChance += .15;
  if (owns(s, 207)) stats.criticalChance += .25;
  if (owns(s, 196)) stats.criticalDamageMultiplier += Math.min(.50, (c.stacks.crimsonCrit ?? 0) * .05);
  if(owns(s,196))stats.criticalChance+=.20;
  if(owns(s,182))stats.maxResource*=1.20;
  if(owns(s,183))stats.armor+=25;
  if(owns(s,208)){stats.hpRegen+=3;stats.permanentHpRegenBonus+=3;stats.bonusResourceRegenPct+=.30;stats.permanentResourceRegenPct+=.30;}
  if (temporary) {
    if(owns(s,114)&&expansionActive(s,"sameTarget"))stats.bonusFireRatePct+=Math.min(4,Math.floor((c.stacks.sameTargetHits??0)/4))*.25;
    
    if(owns(s,174)&&expansionActive(s,"shockPadRegen"))stats.bonusResourceRegenPct+=.20;
    if(owns(s,176)&&c.stacks.breathing)stats.bonusResourceRegenPct+=.25;
    if(owns(s,218)&&expansionActive(s,"ultimateAftershock"))stats.bonusResourceRegenPct+=.90;
    const negative = activeNegativeStatusTypes(s).size;
    if (owns(s, 169)) {
      const ratio = s.currentResource / stats.maxResource;
      if (ratio > .70) stats.firepower += 50;
      else if (ratio < .30) {stats.hpRegen += 4;stats.bonusResourceRegenPct+=.25;}
      else stats.bonusFireRatePct += .50;
    }
    if (owns(s, 170) && expansionActive(s, "earlyArmor")) stats.armor += 50;
    if (owns(s, 179)) stats.criticalChance += (c.stacks.error ?? 0) * .02;
    if (owns(s, 181) && expansionActive(s, "skillExhaust")) stats.bonusResourceRegenPct += .45;
    if (owns(s, 183)) stats.armor += Math.min(60, negative * 20);

    if (owns(s,192)&&!hasAbsorbShield(s))stats.armor+=25;
    if (owns(s, 209)) {
      if (s.currentHp < stats.maxHp * .35) c.stacks.lastStand = 1;
      else if (s.currentHp > stats.maxHp * .35) c.stacks.lastStand = 0;
      if (c.stacks.lastStand) { stats.armor += 250; stats.bonusResourceRegenPct += .4; stats.skillHaste -= 25;stats.hpRegen+=5; }
    }
  }
  // The locked final chance wins over every new flat/conditional contribution.
  
  if(temporary&&expansionActive(s,"comeback"))stats.bonusResourceRegenPct+=.20;
  if (owns(s, 206)) { stats.totalFireRateMultiplier *= .9; stats.weapon.penetration++; }
}
export function expansionOutgoing(s: AircraftCombatState, basic: boolean, skill: boolean, primary = false): number {
  let value = 1;
  if(owns(s,219)&&!overheated(s)&&releaseState(s).heat>=50&&releaseState(s).heat<100)value*=1.30;
  if (expansionActive(s, "alternating")) value *= 1.14;
  if (owns(s, 192) && hasAbsorbShield(s)) value *= 1.25;
  if (owns(s,203))value*=activeNegativeStatusTypes(s).size?1.30:1.12;
  if (owns(s, 205)) value *= 1.55;
  if (owns(s, 209) && s.coreState.stacks.lastStand) value *= .90;
  for(const [row,bonus] of [[212,.08]])if(owns(s,row))value*=1+bonus;
  if(owns(s,218)&&expansionActive(s,"ultimateAftershock"))value*=1.35;
  if(owns(s,114)&&(basic||skill)&&expansionActive(s,"sameTarget"))value*=1+.03*Math.min(4,Math.floor((s.coreState.stacks.sameTargetHits??0)/4));
  if(skill&&owns(s,119))value*=1.15;
  if(skill&&owns(s,187))value*=1.08;
  if(skill&&owns(s,218))value*=1.12;
  const arsenal = arsenalBonuses(s);
  if (basic) {
    value *= 1 + arsenal.basic;
    if(owns(s,186))value*=expansionActive(s,"confluence")?1.30:1.08;
    if (primary && owns(s, 206)) value *= 1.85;
  }
  if (skill) { value *= 1 + arsenal.skill; if (owns(s, 190)) value *= 1.25; if(owns(s,186))value*=expansionActive(s,"confluence")?1.15:1.04; }
  return value;
}
export function expansionIncoming(s: AircraftCombatState): number {
  let value = 1 - arsenalBonuses(s).reduction;
  if (owns(s, 203) && activeNegativeStatusTypes(s).size) value *= .75;
  if (owns(s, 205)) value *= 1.25;
  return value;
}
export function expansionSkillCost(s: AircraftCombatState, id: SkillId): number {
  return (owns(s, 190) ? 1.10 : 1) * (expansionState(s).primarySkill === id ? .75 : 1);
}
export function finishExpansionSkill(s: AircraftCombatState, cast?: ExpansionCast) {
  if (!cast || cast.ended) return;
  cast.ended = true;
  equipmentSkillEnd(s);
  releaseState(s).lastSkillEnd=s.coreState.time;
  if (s.selectedCores.includes("core_078")) {s.coreState.timers.reactor=s.coreState.time+5;recordCoreMetric(s,78,"procs",1);}
}
/** One charge blocks the triggering damage/control payload as well as the tail. */
export function celestialProtection(s: AircraftCombatState): boolean {
  if (!owns(s, 184)) return false;
  const c = s.coreState;
  if (expansionActive(s, "celestial")) return true;
  if (c.timers.celestialReady === undefined && !c.stacks["cooldownPending:celestialReady"]) { c.timers.celestialReady = c.time; }
  if (!coreCooldownReady(s, "celestialReady")) return false;
  c.timers.celestial = c.time + CELESTIAL_PROTECTION_TIMING.duration;
  deferCoreCooldown(s, "celestialReady");
  recordCoreMetric(s,184,"procs",1);
  return true;
}
/** Initialize exactly once per temporary shield instance, never on every tick. */
export function prepareAbsorbShield(s: AircraftCombatState, sh: AbsorbShield) {
  if (sh.capacity !== undefined) return;
  const temporary = Number.isFinite(sh.until);
  if (temporary && owns(s, 200)) recordCoreMetric(s,200,"shieldCreated",sh.amount * getRecoveryReceivedMultiplier(s)/1.5 * .5);
  sh.amount *= getShieldReceivedMultiplier(s, temporary);
  sh.capacity = sh.amount; sh.absorbed = 0;
  sh.duration = temporary ? Math.max(0, sh.until - s.coreState.time) : Infinity;
}
export function finishAbsorbShield(s: AircraftCombatState, sh: AbsorbShield) {
  if (sh.settled) return;
  prepareAbsorbShield(s, sh);
  sh.broken=sh.amount<=0 && s.coreState.time<sh.until;sh.settled = true;
  const key=Object.entries(s.coreState.shields).find(([,value])=>value===sh)?.[0];
  const endedAt = Math.min(s.coreState.time, sh.until);
  if(key==="skill")startCoreCooldown(s,"skillShieldCd",8,endedAt);
  if(key==="reactive")startCoreCooldown(s,"reactiveShieldCd",12,Math.max(endedAt,s.coreState.timers.blackBox??0));
  if(key==="reserve")startCoreCooldown(s,"reserveShieldCd",15,Math.max(endedAt,s.coreState.timers.reserveRegen??0));
  if(key?.startsWith("fortress:"))startCoreCooldown(s,key, key==="fortress:2"?15:12,endedAt);
  if(key==="hazardGuard")startCoreCooldown(s,"hazardGuard",12,endedAt);
  if(key==="depthGuard")startCoreCooldown(s,"depthGuard",8,endedAt);
  if(key==="survivalGuard")startCoreCooldown(s,"survivalGuard",18,endedAt);
  if(key==="recycled")startCoreCooldown(s,"recycleShieldCd",6,endedAt);
  // Only these families end with their shield. Lazarus remains active through its damage buff.
  if(key==="equipment:4"||key==="equipment:17") {
    const effect=s.equipment?.effects[key.slice(10)];
    if(effect?.cooldownPending){effect.until=endedAt;startEquipmentCooldown(s,Number(key.slice(10)),endedAt);}
  }
  if (Number.isFinite(sh.until)) expansionState(s).endedShields.push(sh);
}
export function createAbsorbShield(s: AircraftCombatState, key: string, amount: number, seconds: number, originSkill?: SkillId) {
  const previous = s.coreState.shields[key];
  if (previous) finishAbsorbShield(s, previous);
  const sh: AbsorbShield = { amount: amount * (originSkill && owns(s,202) && expansionState(s).primarySkill===originSkill ? 1.25 : 1), until: s.coreState.time + seconds };
  prepareAbsorbShield(s, sh);
  s.coreState.shields[key] = sh;
  return sh;
}

/** Observe actual spending before same-frame refunds/regen can mask a threshold crossing. */
export function observeExpansionResource(s: AircraftCombatState, maxResource: number) {
  const c=s.coreState,r=expansionState(s),ratio=s.currentResource/maxResource;
  if (ratio<1) r.fullSince=undefined;
  r.resourceRatio=ratio;
}

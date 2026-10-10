import type { AircraftCombatState, SkillId } from "./airCombatTypes";

/** Shared by Core 184 runtime, HUD and both battlefield renderers. */
export const CELESTIAL_PROTECTION_TIMING = { duration: 5, cooldown: 22 } as const;

/** Pending means the primary effect is active: no cooldown exists yet. */
export const CORE_ACTIVE_COOLDOWNS = [
  ["reactiveArmorCd", "reactiveArmor", 8],
  ["counterCd", "counterActive", 15],
  ["earlyArmorCd", "earlyArmor", 10],
  ["shockPadCd", "shockPadRegen", 15],
  ["alternatingCd", "alternating", 20],
  ["magneticBrakeCd", "magneticBrake", 12],
  ["celestialReady", "celestial", CELESTIAL_PROTECTION_TIMING.cooldown],
  ["confluenceCd", "confluence", 12],
  ["blackBoxCd", "blackBox", 18],
] as const;

export function deferCoreCooldown(s: AircraftCombatState, key: string) {
  delete s.coreState.timers[key];
  s.coreState.stacks[`cooldownPending:${key}`] = 1;
}
export function startCoreCooldown(s: AircraftCombatState, key: string, seconds: number, endedAt = s.coreState.time) {
  if (!s.coreState.stacks[`cooldownPending:${key}`]) return;
  delete s.coreState.stacks[`cooldownPending:${key}`];
  s.coreState.timers[key] = endedAt + seconds;
}
export function settleCoreCooldowns(s: AircraftCombatState) {
  for (const [key, active, seconds] of CORE_ACTIVE_COOLDOWNS) {
    const until = s.coreState.timers[active] ?? s.coreState.time;
    if (until <= s.coreState.time) startCoreCooldown(s, key, seconds, until);
  }
}
export function coreCooldownReady(s: AircraftCombatState, key: string) {
  settleCoreCooldowns(s);
  return !s.coreState.stacks[`cooldownPending:${key}`] && (s.coreState.timers[key] ?? 0) <= s.coreState.time;
}

/** Direct reductions can spend only the ordinary portion; debt expires by combat time. */
export function reduceRunningSkillCooldown(s:AircraftCombatState,id:SkillId,seconds:number):number {
 const before=s.cooldowns[id]??0;
 if(before<=0||s.coreState.deferredCooldowns[id]!==undefined)return 0;
 const debt=Math.min(before,s.coreState.stacks[`paidDebt:${id}`]??0);
 s.cooldowns[id]=Math.max(debt,before-Math.max(0,seconds));
 return before-s.cooldowns[id]!;
}

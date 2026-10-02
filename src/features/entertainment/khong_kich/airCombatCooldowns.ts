import type { AircraftCombatState } from "./airCombatTypes";

/** Pending means the primary effect is active: no cooldown exists yet. */
export const CORE_ACTIVE_COOLDOWNS = [
  ["reactiveArmorCd", "reactiveArmor", 10],
  ["counterCd", "counterActive", 15],
  ["earlyArmorCd", "earlyArmor", 10],
  ["shockPadCd", "shockPadRegen", 15],
  ["alternatingCd", "alternating", 20],
  ["magneticBrakeCd", "magneticBrake", 20],
  ["celestialReady", "celestial", 15],
  ["confluenceCd", "confluence", 16],
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

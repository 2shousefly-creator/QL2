import { AIR_COMBAT_LIMITS } from "./airCombatConfig";
import type { EffectiveAircraftStats } from "./airCombatTypes";

/** All additive bonuses resolve before total multipliers and the global cap. */
export function resolveFireRate(stats: Pick<EffectiveAircraftStats, "baseFireRate" | "fireRateRatio" | "bonusFireRatePct" | "totalFireRateMultiplier">, gatlingun = false): number {
  const rate = stats.baseFireRate * (1 + stats.fireRateRatio * stats.bonusFireRatePct) * stats.totalFireRateMultiplier * (gatlingun ? 2 : 1);
  return Number.isFinite(rate) ? Math.max(.1, gatlingun ? rate : Math.min(AIR_COMBAT_LIMITS.maxFireRate, rate)) : .1;
}

/** Base cooldown modifiers are already applied; cast penalties follow haste. */
export function resolveSkillCooldown(effectiveBaseCooldown: number, skillHaste: number, castMultiplier = 1): number {
  return effectiveBaseCooldown * 100 / (100 + Math.max(0, skillHaste)) * castMultiplier;
}

import { AIR_COMBAT_LIMITS } from "./airCombatConfig";
import type { EffectiveAircraftStats } from "./airCombatTypes";

/** All additive bonuses resolve before total multipliers and the global cap. */
export function resolveFireRate(stats: Pick<EffectiveAircraftStats, "baseFireRate" | "fireRateRatio" | "bonusFireRatePct" | "totalFireRateMultiplier">): number {
  const rate = stats.baseFireRate * (1 + stats.fireRateRatio * stats.bonusFireRatePct) * stats.totalFireRateMultiplier;
  return Math.max(.1, Math.min(AIR_COMBAT_LIMITS.maxFireRate, rate));
}

/** Base cooldown modifiers are already applied; cast penalties follow haste. */
export function resolveSkillCooldown(effectiveBaseCooldown: number, skillHaste: number, castMultiplier = 1): number {
  return effectiveBaseCooldown * 100 / (100 + Math.max(0, skillHaste)) * castMultiplier;
}

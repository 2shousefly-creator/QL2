import { EarningMode, GameState, EnergyState } from "./types";
import { RANK_STEPS } from "./rankBuilder";
import { gameConfig } from "./config";
import { getFinalJourneyXpTargetTicks, getRequiredXpTicksForTransition } from "./xpProgression";

/**
 * Returns YYYY-MM-DD for a given timestamp in local time.
 */
export function getLocalDateString(timestampMs: number = Date.now()): string {
  const d = new Date(timestampMs);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns start of day (00:00:00.000) timestamp in local time.
 */
export function getStartOfDayEpochMs(timestampMs: number = Date.now()): number {
  const d = new Date(timestampMs);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Calculates required XP ticks for rank transition.
 */
export function getRequiredXpTicksForTransitionInEnergy(rankIndex: number): number {
  return getRequiredXpTicksForTransition(rankIndex);
}

/**
 * Checks if current rank XP bar is full.
 */
export function isXpBarFullInEnergy(state: GameState): boolean {
  const currentRankIndex = state.progression.currentRankIndex;
  if (currentRankIndex >= RANK_STEPS.length - 1) {
    return state.progression.totalXpEarnedTicks >= getFinalJourneyXpTargetTicks();
  }
  const reqTicks = getRequiredXpTicksForTransitionInEnergy(currentRankIndex);
  return state.progression.xpIntoCurrentRankTicks >= reqTicks;
}

/**
 * Checks if Energy is currently active (draining & providing XP boost).
 * Energy is active ONLY when:
 * 1. Mode is direct_online (not delegation)
 * 2. If at max rank, total XP has not reached Final Journey Target
 * 3. XP for current rank is NOT full
 * 4. No promotion ceremony is pending
 */
export function isEnergyActive(state: GameState, mode: EarningMode): boolean {
  if (mode !== "direct_online") return false;
  const currentRankIndex = state.progression.currentRankIndex;
  if (currentRankIndex >= RANK_STEPS.length - 1) {
    return state.progression.totalXpEarnedTicks < getFinalJourneyXpTargetTicks();
  }
  if (isXpBarFullInEnergy(state)) return false;
  if (state.ui.pendingPromotionCeremony) return false;
  return true;
}

/**
 * Returns XP multiplier based on Energy percentage and active state.
 * Boundary conditions when active:
 * - energy <= 0  => x1
 * - energy < 33  => x2
 * - energy < 67  => x3
 * - energy >= 67 => x4
 * When NOT active:
 * - returns x1
 */
export function getEnergyMultiplier(energyPercent: number, active: boolean = true): number {
  if (!active) return 1;

  const clamped = Math.max(0, Math.min(100, energyPercent));
  if (clamped <= 0) return 1;
  if (clamped < 33) return 2;
  if (clamped < 67) return 3;
  return 4;
}

/**
 * Returns color classes and labels for UI rendering.
 */
export function getEnergyVisuals(percent: number, active: boolean = true) {
  const clamped = Math.max(0, Math.min(100, percent));
  const mult = getEnergyMultiplier(clamped, active);

  if (!active) {
    return {
      textColor: "text-amber-400",
      bgColor: "bg-gradient-to-r from-amber-500 to-yellow-400",
      borderColor: "border-amber-400/40",
      glowColor: "",
      label: "Boost tạm dừng",
      multiplier: 1,
    };
  }

  if (clamped >= 67) {
    return {
      textColor: "text-emerald-400",
      bgColor: "bg-gradient-to-r from-emerald-500 to-emerald-400",
      borderColor: "border-emerald-500/40",
      glowColor: "shadow-[0_0_8px_rgba(16,185,129,0.5)]",
      label: `XP x${mult}`,
      multiplier: mult,
    };
  }
  if (clamped >= 33) {
    return {
      textColor: "text-amber-400",
      bgColor: "bg-gradient-to-r from-amber-500 to-yellow-400",
      borderColor: "border-amber-400/40",
      glowColor: "shadow-[0_0_8px_rgba(245,158,11,0.5)]",
      label: `XP x${mult}`,
      multiplier: mult,
    };
  }
  if (clamped > 0) {
    return {
      textColor: "text-red-400",
      bgColor: "bg-gradient-to-r from-rose-500 to-red-500",
      borderColor: "border-red-500/40",
      glowColor: "shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      label: `XP x${mult}`,
      multiplier: mult,
    };
  }
  return {
    textColor: "text-slate-400",
    bgColor: "bg-slate-600",
    borderColor: "border-slate-700",
    glowColor: "",
    label: "XP x1",
    multiplier: 1,
  };
}

/**
 * Ensures state.energy exists and applies daily reset at 00:00.
 */
export function ensureEnergyState(state: GameState, nowEpochMs: number = Date.now()): EnergyState {
  const todayStr = getLocalDateString(nowEpochMs);
  if (!state.energy) {
    state.energy = {
      percent: 100,
      lastUpdatedAt: nowEpochMs,
      lastResetDate: todayStr,
    };
  } else if (state.energy.lastResetDate !== todayStr) {
    state.energy.percent = 100;
    state.energy.lastResetDate = todayStr;
    state.energy.lastUpdatedAt = nowEpochMs;
  }
  return state.energy;
}

/**
 * Piecewise integration for online XP calculation and Energy depletion capped at remTicks.
 * Depletion rate: 5% per minute (1% per 12,000 ms).
 * Base XP rate: 10 ticks/ms.
 * Multipliers:
 * - energy >= 67 => x4 (40 ticks/ms)
 * - energy >= 33 => x3 (30 ticks/ms)
 * - energy > 0  => x2 (20 ticks/ms)
 * - energy == 0 => x1 (10 ticks/ms)
 */
export function settleOnlineXpWithCapAndEnergy(
  startEnergy: number,
  elapsedMs: number,
  remTicks: number
): { earnedTicks: number; endEnergy: number } {
  if (elapsedMs <= 0 || remTicks <= 0) {
    return { earnedTicks: 0, endEnergy: Math.max(0, Math.min(100, startEnergy)) };
  }

  let remainingMs = elapsedMs;
  let remainingTicks = remTicks;
  let energy = Math.max(0, Math.min(100, startEnergy));
  let earnedTicks = 0;

  const MS_PER_PERCENT = 12000; // 12,000 ms per 1% energy (5% / minute)

  while (remainingMs > 0 && remainingTicks > 0) {
    if (energy >= 67) {
      // Tier 4: >=67% -> XP x4 (40 ticks/ms)
      const rate = 40;
      const percentToDrop = energy - 67;
      if (percentToDrop > 0) {
        const maxMsInTier = percentToDrop * MS_PER_PERCENT;
        const maxTicksInTier = maxMsInTier * rate;

        if (remainingTicks <= maxTicksInTier) {
          const msNeeded = Math.ceil(remainingTicks / rate);
          const actualMs = Math.min(remainingMs, msNeeded);
          const ticksFromThis = Math.min(remainingTicks, actualMs * rate);

          earnedTicks += ticksFromThis;
          remainingTicks -= ticksFromThis;
          energy -= actualMs / MS_PER_PERCENT;
          remainingMs -= actualMs;

          if (remainingTicks <= 0) {
            break; // XP bar full -> pause energy depletion immediately!
          }
        } else {
          const timeInTier = Math.min(remainingMs, maxMsInTier);
          const ticksFromThis = timeInTier * rate;

          earnedTicks += ticksFromThis;
          remainingTicks -= ticksFromThis;
          energy -= timeInTier / MS_PER_PERCENT;
          remainingMs -= timeInTier;
        }
      } else {
        energy = 66.999999;
      }
    } else if (energy >= 33) {
      // Tier 3: 33% to <67% -> XP x3 (30 ticks/ms)
      const rate = 30;
      const percentToDrop = energy - 33;
      if (percentToDrop > 0) {
        const maxMsInTier = percentToDrop * MS_PER_PERCENT;
        const maxTicksInTier = maxMsInTier * rate;

        if (remainingTicks <= maxTicksInTier) {
          const msNeeded = Math.ceil(remainingTicks / rate);
          const actualMs = Math.min(remainingMs, msNeeded);
          const ticksFromThis = Math.min(remainingTicks, actualMs * rate);

          earnedTicks += ticksFromThis;
          remainingTicks -= ticksFromThis;
          energy -= actualMs / MS_PER_PERCENT;
          remainingMs -= actualMs;

          if (remainingTicks <= 0) {
            break;
          }
        } else {
          const timeInTier = Math.min(remainingMs, maxMsInTier);
          const ticksFromThis = timeInTier * rate;

          earnedTicks += ticksFromThis;
          remainingTicks -= ticksFromThis;
          energy -= timeInTier / MS_PER_PERCENT;
          remainingMs -= timeInTier;
        }
      } else {
        energy = 32.999999;
      }
    } else if (energy > 0) {
      // Tier 2: >0% to <33% -> XP x2 (20 ticks/ms)
      const rate = 20;
      const percentToDrop = energy;
      const maxMsInTier = percentToDrop * MS_PER_PERCENT;
      const maxTicksInTier = maxMsInTier * rate;

      if (remainingTicks <= maxTicksInTier) {
        const msNeeded = Math.ceil(remainingTicks / rate);
        const actualMs = Math.min(remainingMs, msNeeded);
        const ticksFromThis = Math.min(remainingTicks, actualMs * rate);

        earnedTicks += ticksFromThis;
        remainingTicks -= ticksFromThis;
        energy -= actualMs / MS_PER_PERCENT;
        remainingMs -= actualMs;

        if (remainingTicks <= 0) {
          break;
        }
      } else {
        const timeInTier = Math.min(remainingMs, maxMsInTier);
        const ticksFromThis = timeInTier * rate;

        earnedTicks += ticksFromThis;
        remainingTicks -= ticksFromThis;
        energy -= timeInTier / MS_PER_PERCENT;
        remainingMs -= timeInTier;
      }
    } else {
      // Tier 1: 0% -> XP x1 (10 ticks/ms)
      const rate = 10;
      const msNeeded = Math.ceil(remainingTicks / rate);
      const actualMs = Math.min(remainingMs, msNeeded);
      const ticksFromThis = Math.min(remainingTicks, actualMs * rate);

      earnedTicks += ticksFromThis;
      remainingTicks -= ticksFromThis;
      remainingMs -= actualMs;
      energy = 0;

      if (remainingTicks <= 0) {
        break;
      }
    }
  }

  return {
    earnedTicks: Math.floor(earnedTicks),
    endEnergy: Math.max(0, Math.min(100, energy)),
  };
}

/**
 * Calculates the exact duration (ms) needed to earn `remTicks` in direct_online mode
 * given a starting energy percentage, taking into account energy depletion across tiers.
 */
export function calculateMsToEarnTicksWithEnergy(
  startEnergy: number,
  remTicks: number
): number {
  if (remTicks <= 0) return 0;

  let remainingTicks = remTicks;
  let energy = Math.max(0, Math.min(100, startEnergy));
  let totalMs = 0;

  const MS_PER_PERCENT = 12000; // 12,000 ms per 1% energy (5% / minute)

  if (energy >= 67) {
    const percentToDrop = energy - 67;
    const maxMs = percentToDrop * MS_PER_PERCENT;
    const maxTicks = maxMs * 40;
    if (remainingTicks <= maxTicks) {
      return totalMs + Math.ceil(remainingTicks / 40);
    }
    remainingTicks -= maxTicks;
    totalMs += maxMs;
    energy = 67;
  }

  if (energy >= 33) {
    const percentToDrop = energy - 33;
    const maxMs = percentToDrop * MS_PER_PERCENT;
    const maxTicks = maxMs * 30;
    if (remainingTicks <= maxTicks) {
      return totalMs + Math.ceil(remainingTicks / 30);
    }
    remainingTicks -= maxTicks;
    totalMs += maxMs;
    energy = 33;
  }

  if (energy > 0) {
    const percentToDrop = energy;
    const maxMs = percentToDrop * MS_PER_PERCENT;
    const maxTicks = maxMs * 20;
    if (remainingTicks <= maxTicks) {
      return totalMs + Math.ceil(remainingTicks / 20);
    }
    remainingTicks -= maxTicks;
    totalMs += maxMs;
    energy = 0;
  }

  totalMs += Math.ceil(remainingTicks / 10);
  return totalMs;
}

/**
 * Main energy & XP settlement function.
 * Handles single or cross-midnight time ranges.
 */
export function settleEnergyAndXp(
  state: GameState,
  previousSettledAt: number,
  nowEpochMs: number,
  mode: EarningMode
): { earnedTicks: number } {
  // Preserve the preceding day's energy until its interval has been credited.
  const energyState = ensureEnergyState(state, previousSettledAt);

  if (nowEpochMs <= previousSettledAt) {
    energyState.lastUpdatedAt = nowEpochMs;
    return { earnedTicks: 0 };
  }

  const currentRankIndex = state.progression.currentRankIndex;
  const isMaxRank = currentRankIndex >= RANK_STEPS.length - 1;

  const reqTicks = isMaxRank
    ? getFinalJourneyXpTargetTicks()
    : getRequiredXpTicksForTransitionInEnergy(currentRankIndex);
  const startOfDayMs = getStartOfDayEpochMs(nowEpochMs);
  let totalEarnedTicks = 0;

  const getRemTicks = () => {
    if (isMaxRank) {
      return Math.max(0, reqTicks - state.progression.totalXpEarnedTicks);
    }
    return Math.max(0, reqTicks - state.progression.xpIntoCurrentRankTicks);
  };

  // Check if we crossed midnight since previousSettledAt
  if (previousSettledAt < startOfDayMs) {
    // Phase 1: Settle from previousSettledAt up to midnight using yesterday's energy
    const msBeforeMidnight = startOfDayMs - previousSettledAt;
    if (msBeforeMidnight > 0) {
      const remTicks1 = getRemTicks();
      if (mode === "direct_online" && remTicks1 > 0 && !state.ui.pendingPromotionCeremony) {
        const res1 = settleOnlineXpWithCapAndEnergy(energyState.percent, msBeforeMidnight, remTicks1);
        totalEarnedTicks += res1.earnedTicks;
        state.progression.xpIntoCurrentRankTicks += res1.earnedTicks;
        state.progression.totalXpEarnedTicks += res1.earnedTicks;
        energyState.percent = res1.endEnergy;
      } else if (remTicks1 > 0 && !state.ui.pendingPromotionCeremony) {
        const maxEarnable = msBeforeMidnight * 10;
        const credited = Math.min(maxEarnable, remTicks1);
        totalEarnedTicks += credited;
        state.progression.xpIntoCurrentRankTicks += credited;
        state.progression.totalXpEarnedTicks += credited;
      }
    }

    // Daily Reset at midnight: 100%
    energyState.percent = 100;
    energyState.lastResetDate = getLocalDateString(nowEpochMs);

    // Phase 2: Settle from midnight to nowEpochMs using today's reset energy (100%)
    const msAfterMidnight = nowEpochMs - startOfDayMs;
    if (msAfterMidnight > 0) {
      const remTicks2 = getRemTicks();
      if (mode === "direct_online" && remTicks2 > 0 && !state.ui.pendingPromotionCeremony) {
        const res2 = settleOnlineXpWithCapAndEnergy(energyState.percent, msAfterMidnight, remTicks2);
        totalEarnedTicks += res2.earnedTicks;
        state.progression.xpIntoCurrentRankTicks += res2.earnedTicks;
        state.progression.totalXpEarnedTicks += res2.earnedTicks;
        energyState.percent = res2.endEnergy;
      } else if (remTicks2 > 0 && !state.ui.pendingPromotionCeremony) {
        const maxEarnable = msAfterMidnight * 10;
        const credited = Math.min(maxEarnable, remTicks2);
        totalEarnedTicks += credited;
        state.progression.xpIntoCurrentRankTicks += credited;
        state.progression.totalXpEarnedTicks += credited;
      }
    }
  } else {
    // Same day settlement
    const elapsedMs = nowEpochMs - previousSettledAt;
    const remTicks = getRemTicks();
    if (mode === "direct_online" && remTicks > 0 && !state.ui.pendingPromotionCeremony) {
      const res = settleOnlineXpWithCapAndEnergy(energyState.percent, elapsedMs, remTicks);
      totalEarnedTicks += res.earnedTicks;
      state.progression.xpIntoCurrentRankTicks += res.earnedTicks;
      state.progression.totalXpEarnedTicks += res.earnedTicks;
      energyState.percent = res.endEnergy;
    } else if (remTicks > 0 && !state.ui.pendingPromotionCeremony) {
      const maxEarnable = elapsedMs * 10;
      const credited = Math.min(maxEarnable, remTicks);
      totalEarnedTicks += credited;
      state.progression.xpIntoCurrentRankTicks += credited;
      state.progression.totalXpEarnedTicks += credited;
    }
  }

  energyState.lastUpdatedAt = nowEpochMs;
  return { earnedTicks: totalEarnedTicks };
}

import { RANK_STEPS } from "./rankBuilder";
import type { GameState } from "./types";
import { isXpBarFull, getFinalJourneyXpTargetTicks, getRequiredXpTicksForTransition } from "./xpProgression";
import { evaluateMedalUnlocks } from "./medals/medalEngine";

/**
 * Applies earned XP ticks strictly capped at 100%.
 * Discards any overflow ticks.
 */
export function applyEarnedXpCapped(
  state: GameState,
  earnedTicks: number
): { creditedTicks: number; isFullNow: boolean; wasFullBefore: boolean } {
  if (earnedTicks <= 0) {
    return {
      creditedTicks: 0,
      isFullNow: isXpBarFull(state),
      wasFullBefore: isXpBarFull(state),
    };
  }

  const currentRankIndex = state.progression.currentRankIndex;
  const isFinalRank = currentRankIndex >= RANK_STEPS.length - 1;

  if (isFinalRank) {
    const finalTargetTicks = getFinalJourneyXpTargetTicks();
    const currentTotalTicks = state.progression.totalXpEarnedTicks;
    const remainingTicks = Math.max(0, finalTargetTicks - currentTotalTicks);
    const wasFullBefore = currentTotalTicks >= finalTargetTicks;

    const creditedTicks = Math.min(earnedTicks, remainingTicks);

    state.progression.xpIntoCurrentRankTicks += creditedTicks;
    state.progression.totalXpEarnedTicks += creditedTicks;

    const isFullNow = state.progression.totalXpEarnedTicks >= finalTargetTicks;

    if (creditedTicks > 0) {
      evaluateMedalUnlocks(state);
    }

    return { creditedTicks, isFullNow, wasFullBefore };
  }

  const reqTicks = getRequiredXpTicksForTransition(currentRankIndex);
  const currentTicks = state.progression.xpIntoCurrentRankTicks;
  const remainingTicks = Math.max(0, reqTicks - currentTicks);
  const wasFullBefore = currentTicks >= reqTicks;

  // STRICT CAP: Only add up to remainingTicks. Any excess is DISCARDED completely!
  const creditedTicks = Math.min(earnedTicks, remainingTicks);

  state.progression.xpIntoCurrentRankTicks += creditedTicks;
  state.progression.totalXpEarnedTicks += creditedTicks;

  const isFullNow = state.progression.xpIntoCurrentRankTicks >= reqTicks;

  if (creditedTicks > 0) {
    evaluateMedalUnlocks(state);
  }

  return { creditedTicks, isFullNow, wasFullBefore };
}


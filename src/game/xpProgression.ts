import { familyTransitionXp } from "./legacyRankLayout";
import { gameConfig } from "./config";
import { RANK_STEPS } from "./rankBuilder";
import type { GameState, RankStep } from "./types";

export function getRequiredXpForTransition(rankIndex: number): number {
  return familyTransitionXp(rankIndex);
}

export function getRequiredXpTicksForTransition(rankIndex: number): number {
  return getRequiredXpForTransition(rankIndex) * gameConfig.xpTicksPerXp;
}

// Display completed tenths of a percent so a label never announces a milestone early.
export function getDisplayedXpPercentage(currentTicks: number, requiredTicks: number): number {
  if (requiredTicks <= 0) return 100;
  return Math.floor(Math.max(0, Math.min(currentTicks, requiredTicks)) * 1000 / requiredTicks) / 10;
}

export function getNextRank(rankIndex: number): RankStep | null {
  if (rankIndex < RANK_STEPS.length - 1) {
    return RANK_STEPS[rankIndex + 1];
  }
  return null;
}

export function getCurrentRank(rankIndex: number): RankStep {
  return RANK_STEPS[Math.min(Math.max(0, rankIndex), RANK_STEPS.length - 1)];
}

export function isMajorPromotion(currentRank: RankStep, nextRank: RankStep): boolean {
  return currentRank.familyId !== nextRank.familyId;
}

export function getPromotionChallengeDurationMs(currentRank: RankStep, nextRank: RankStep): number {
  return isMajorPromotion(currentRank, nextRank)
    ? gameConfig.majorPromotionChallengeMs
    : gameConfig.minorPromotionChallengeMs;
}

/**
 * Returns total XP required to reach a specific rank index from the start of the game (rank 0).
 * rankIndex 0 => 0 XP
 * rankIndex 1 => requiredXp(0)
 * rankIndex n => sum(requiredXp(i)), i = 0..n-1
 */
export function getTotalXpToReachRank(rankIndex: number): number {
  if (rankIndex <= 0) return 0;
  const maxTransition = Math.min(rankIndex, RANK_STEPS.length - 1);
  let total = 0;
  for (let i = 0; i < maxTransition; i++) {
    total += getRequiredXpForTransition(i);
  }
  return total;
}

export function getTotalXpTicksToReachRank(rankIndex: number): number {
  return getTotalXpToReachRank(rankIndex) * gameConfig.xpTicksPerXp;
}

export function getTotalXpToReachMaxRank(): number {
  return getTotalXpToReachRank(RANK_STEPS.length - 1);
}

export function getTotalXpTicksToReachMaxRank(): number {
  return getTotalXpTicksToReachRank(RANK_STEPS.length - 1);
}

export function getFinalJourneyXpTarget(): number {
  return getTotalXpToReachMaxRank() + 999_999;
}

export function getFinalJourneyXpTargetTicks(): number {
  return getFinalJourneyXpTarget() * gameConfig.xpTicksPerXp;
}

export function isXpBarFull(state: GameState): boolean {
  const currentRankIndex = state.progression.currentRankIndex;
  if (currentRankIndex >= RANK_STEPS.length - 1) {
    return state.progression.totalXpEarnedTicks >= getFinalJourneyXpTargetTicks();
  }
  const reqTicks = getRequiredXpTicksForTransition(currentRankIndex);
  return state.progression.xpIntoCurrentRankTicks >= reqTicks;
}


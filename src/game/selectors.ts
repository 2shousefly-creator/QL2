import { RANK_FAMILIES } from "./rankFamilies";
import {
  getCurrentRank,
  getDisplayedXpPercentage,
  getRequiredXpTicksForTransition,
  getFinalJourneyXpTarget,
  getFinalJourneyXpTargetTicks,
  getNextRank,
  getRequiredXpForTransition,
  isMajorPromotion,
  isXpBarFull,
} from "./xpProgression";
import { GameState, RankFamily, RankStep } from "./types";
import { RANK_STEPS } from "./rankBuilder";

export function getPlayerRank(state: GameState): RankStep {
  return getCurrentRank(state.progression.currentRankIndex);
}

export function getPlayerNextRank(state: GameState): RankStep | null {
  return getNextRank(state.progression.currentRankIndex);
}

export function getPlayerFamily(state: GameState): RankFamily {
  const currentRank = getPlayerRank(state);
  const fam = RANK_FAMILIES.find((f) => f.id === currentRank.familyId);
  if (!fam) {
    return RANK_FAMILIES[0];
  }
  return fam;
}

export function getRankTierProgressData(rankStep: RankStep): {
  currentTier: number;
  tierCount: number;
  litSegmentCount: number;
} | null {
  if (rankStep.tierCount === 1 || rankStep.tier === null) {
    return null;
  }
  return {
    currentTier: rankStep.tier,
    tierCount: rankStep.tierCount,
    litSegmentCount: rankStep.tier, // Rule: segments 1 to N lit at same brightness
  };
}

export function getXpProgressDetails(state: GameState): {
  currentXp: number;
  requiredXp: number;
  percentage: number;
  isFull: boolean;
  isMaxRank: boolean;
} {
  const currentRankIndex = state.progression.currentRankIndex;
  const isMaxRank = currentRankIndex >= RANK_STEPS.length - 1;

  if (isMaxRank) {
    const finalTargetXp = getFinalJourneyXpTarget();
    const finalTargetTicks = getFinalJourneyXpTargetTicks();
    const currXp = Math.floor(state.progression.totalXpEarnedTicks / 600_000);
    const isFull = state.progression.totalXpEarnedTicks >= finalTargetTicks;
    const percentage = Math.floor(getDisplayedXpPercentage(state.progression.totalXpEarnedTicks, finalTargetTicks));

    return {
      currentXp: currXp,
      requiredXp: finalTargetXp,
      percentage,
      isFull,
      isMaxRank: true,
    };
  }

  const reqXp = getRequiredXpForTransition(currentRankIndex);
  const currXp = Math.floor(state.progression.xpIntoCurrentRankTicks / 600_000);
  const isFull = isXpBarFull(state);
  const percentage = Math.floor(getDisplayedXpPercentage(state.progression.xpIntoCurrentRankTicks, getRequiredXpTicksForTransition(currentRankIndex)));

  return {
    currentXp: currXp,
    requiredXp: reqXp,
    percentage,
    isFull,
    isMaxRank: false,
  };
}

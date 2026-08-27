import { gameConfig } from "./config";
import { getCurrentRank, getNextRank, isMajorPromotion, isXpBarFull } from "./xpEngine";
import { GameState, PromotionHistoryEntry } from "./types";
import { RANK_STEPS } from "./rankBuilder";
import { recordJournalPromotion } from "./journal/journalEngine";
import { evaluateMedalUnlocks } from "./medals/medalEngine";
import { applyPromotionRewards } from "./promotionRewards";

export function createOnboardingHistoryEntry(createdAtMs: number): PromotionHistoryEntry {
  const academyStep = RANK_STEPS[0];
  return {
    id: `hist_onboarding_0`,
    rankIndex: 0,
    rankName: academyStep.displayName,
    familyId: academyStep.familyId,
    tier: null,
    achievedAt: createdAtMs,
    source: "onboarding",
    promotionKind: "onboarding",
    badgeCatalogVersionAtAchievement: 1,
    storyCatalogVersionAtAchievement: 1,
    challenge: null,
  };
}

export function canStartPromotionChallenge(state: GameState): boolean {
  if (state.ui.pendingPromotionCeremony) return false;
  return isXpBarFull(state);
}

export function completePromotionChallenge(
  state: GameState,
  completedAtEpochMs: number,
  completedChallengeStats: {
    configuredDurationMs: number;
    elapsedRealMs: number;
    bubbleHitCount: number;
    bubbleReductionMs: number;
    correctCount?: number;
    totalQuestions?: number;
  }
): { newRankIndex: number; promotionKind: "minor" | "major" } {
  const currentRankIndex = state.progression.currentRankIndex;
  const currentRank = getCurrentRank(currentRankIndex);
  const nextRank = getNextRank(currentRankIndex);

  if (!nextRank) {
    throw new Error("Cannot promote beyond final rank (Tổng Tư Lệnh)");
  }

  if (!isXpBarFull(state)) {
    throw new Error("Cannot complete promotion challenge before XP reaches 100%");
  }

  const kind: "minor" | "major" = isMajorPromotion(currentRank, nextRank)
    ? "major"
    : "minor";

  const newRankIndex = currentRankIndex + 1;

  // Idempotent check: check if entry for newRankIndex already exists in history
  if (!state.progression.promotionHistory) {
    state.progression.promotionHistory = [];
  }

  const existingEntry = state.progression.promotionHistory.find(
    (e) => e.rankIndex === newRankIndex
  );

  if (!existingEntry) {
    const retries = state.progression.rankRetries?.[newRankIndex] || 0;
    const historyEntry: PromotionHistoryEntry = {
      id: `hist_rank_${newRankIndex}_${completedAtEpochMs}`,
      rankIndex: newRankIndex,
      rankName: nextRank.displayName,
      familyId: nextRank.familyId,
      tier: nextRank.tier,
      achievedAt: completedAtEpochMs,
      source: "promotion",
      promotionKind: kind,
      badgeCatalogVersionAtAchievement: 1,
      storyCatalogVersionAtAchievement: 1,
      challenge: {
        configuredDurationMs: completedChallengeStats.configuredDurationMs,
        elapsedRealMs: Math.max(0, completedChallengeStats.elapsedRealMs),
        bubbleHitCount: Math.max(0, completedChallengeStats.bubbleHitCount),
        bubbleReductionMs: Math.max(0, completedChallengeStats.bubbleReductionMs),
        correctCount: completedChallengeStats.correctCount,
        totalQuestions: completedChallengeStats.totalQuestions,
        retries,
      },
    };

    state.progression.promotionHistory.unshift(historyEntry);
    applyPromotionRewards(state, nextRank);
    recordJournalPromotion(
      state,
      newRankIndex,
      nextRank.displayName,
      kind,
      completedAtEpochMs,
      completedChallengeStats.correctCount,
      completedChallengeStats.totalQuestions,
      retries
    );
  }

  // Update progression
  state.progression.currentRankIndex = newRankIndex;
  state.progression.xpIntoCurrentRankTicks = 0; // STRICT: Start at exactly 0 XP
  state.progression.lastPromotionAt = completedAtEpochMs;
  state.time.lastSettledAt = completedAtEpochMs;

  // Set pending ceremony
  state.ui.pendingPromotionCeremony = {
    promotedRankIndex: newRankIndex,
    promotedAt: completedAtEpochMs,
    promotionKind: kind,
  };

  evaluateMedalUnlocks(state);

  return { newRankIndex, promotionKind: kind };
}

export function dismissPromotionCeremony(state: GameState, nowEpochMs: number): void {
  state.ui.pendingPromotionCeremony = null;
  state.time.lastSettledAt = nowEpochMs;
}

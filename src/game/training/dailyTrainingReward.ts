import { gameConfig } from "../config";
import { getXpProgressDetails } from "../selectors";
import { GameState, TrainingDifficulty, TrainingGameId } from "../types";
import { TRAINING_DIFFICULTIES } from "./trainingConfig";
import { getTrainingDateKey } from "./trainingClock";

export type DailyTrainingClaimRequest = {
  runId: string;
  gameId: TrainingGameId;
  difficulty: TrainingDifficulty;
  completedAtEpochMs: number;
  victory: boolean;
};

export type DailyTrainingClaimResult =
  | {
      status: "claimed";
      nominalRewardXp: 10 | 30 | 50;
      creditedXpTicks: number;
      dateKey: string;
    }
  | {
      status: "already_claimed";
      dateKey: string;
    }
  | {
      status: "xp_bar_full_not_consumed";
      dateKey: string;
    }
  | {
      status: "duplicate_run";
      dateKey: string;
    }
  | {
      status: "not_eligible";
      reason: string;
    };

/**
 * Checks if the daily training reward is currently available for the user
 */
export function isDailyTrainingRewardAvailable(
  state: GameState,
  epochMs: number = Date.now()
): boolean {
  const currentDateKey = getTrainingDateKey(epochMs);
  return state.training.dailyReward.lastClaimDateKey !== currentDateKey;
}

/**
 * Process a daily reward claim for winning a training mini-game.
 * Idempotently mutates the provided draft GameState if eligible.
 */
export function claimDailyTrainingReward(
  state: GameState,
  request: DailyTrainingClaimRequest
): DailyTrainingClaimResult {
  const { runId, difficulty, completedAtEpochMs, victory } = request;

  if (!victory) {
    return { status: "not_eligible", reason: "Chưa đạt điều kiện chiến thắng" };
  }

  const currentDateKey = getTrainingDateKey(completedAtEpochMs);

  // Idempotency check for same run
  if (state.training.dailyReward.claimRunId === runId) {
    return { status: "duplicate_run", dateKey: currentDateKey };
  }

  // Already claimed today check
  if (state.training.dailyReward.lastClaimDateKey === currentDateKey) {
    return { status: "already_claimed", dateKey: currentDateKey };
  }

  // Check if XP bar is full
  const xpDetails = getXpProgressDetails(state);

  if (xpDetails.isFull) {
    return { status: "xp_bar_full_not_consumed", dateKey: currentDateKey };
  }

  const diffConfig = TRAINING_DIFFICULTIES[difficulty];
  const nominalRewardXp = diffConfig.rewardXp;
  const nominalRewardTicks = nominalRewardXp * gameConfig.xpTicksPerXp;

  const remainingTicksToFull = Math.max(
    0,
    (xpDetails.requiredXp - xpDetails.currentXp) * gameConfig.xpTicksPerXp
  );

  if (remainingTicksToFull <= 0) {
    return { status: "xp_bar_full_not_consumed", dateKey: currentDateKey };
  }

  const creditedXpTicks = Math.min(nominalRewardTicks, remainingTicksToFull);

  if (creditedXpTicks <= 0) {
    return { status: "xp_bar_full_not_consumed", dateKey: currentDateKey };
  }

  // Apply credited XP
  state.progression.xpIntoCurrentRankTicks += creditedXpTicks;
  state.progression.totalXpEarnedTicks += creditedXpTicks;

  // Mark daily reward as claimed
  state.training.dailyReward.lastClaimDateKey = currentDateKey;
  state.training.dailyReward.lastClaimedAt = completedAtEpochMs;
  state.training.dailyReward.lastClaimedGameId = request.gameId;
  state.training.dailyReward.lastClaimedDifficulty = difficulty;
  state.training.dailyReward.lastNominalRewardXp = nominalRewardXp;
  state.training.dailyReward.lastCreditedRewardXpTicks = creditedXpTicks;
  state.training.dailyReward.claimRunId = runId;
  state.training.dailyReward.lastObservedEpochMs = completedAtEpochMs;
  state.training.dailyReward.lastObservedTrainingDateKey = currentDateKey;

  return {
    status: "claimed",
    nominalRewardXp,
    creditedXpTicks,
    dateKey: currentDateKey,
  };
}

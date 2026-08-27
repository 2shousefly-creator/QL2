import { gameConfig } from "../../game/config";
import { GameState } from "../../game/types";
import { applyEarnedXpCapped } from "../../game/xpEngine";

export interface FarmXpRewardResult {
  displayedXp: number;
  creditedTicks: number;
  discardedTicks: number;
}

/**
 * Applies farm XP to rank progression while keeping the advertised farm reward
 * visible in the reward summary. XP beyond a full rank bar is intentionally
 * discarded and is never carried into the next rank.
 */
export function applyFarmXpReward(
  state: GameState,
  rewardXp: number
): FarmXpRewardResult {
  const displayedXp = Math.max(0, Math.floor(rewardXp));
  const rewardTicks = displayedXp * gameConfig.xpTicksPerXp;

  if (rewardTicks <= 0) {
    return {
      displayedXp: 0,
      creditedTicks: 0,
      discardedTicks: 0,
    };
  }

  const result = applyEarnedXpCapped(state, rewardTicks);

  return {
    displayedXp,
    creditedTicks: result.creditedTicks,
    discardedTicks: rewardTicks - result.creditedTicks,
  };
}

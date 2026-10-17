import { gameConfig } from "../../game/config";
import { GameState } from "../../game/types";
import { isXpBarFull } from "../../game/xpProgression";
import { applyEarnedXpCapped } from "../../game/xpRewards";

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
  const displayedXp = Math.max(0, rewardXp);
  const preciseTicks = displayedXp * gameConfig.xpTicksPerXp + (state.farm?.xpRemainder ?? 0);
  const rewardTicks = Math.floor(preciseTicks + 1e-7);
  if (state.farm) state.farm.xpRemainder = Math.max(0, preciseTicks - rewardTicks);

  if (rewardTicks <= 0) {
    if (state.farm && isXpBarFull(state)) state.farm.xpRemainder = 0;
    return {
      displayedXp: 0,
      creditedTicks: 0,
      discardedTicks: 0,
    };
  }

  const result = applyEarnedXpCapped(state, rewardTicks);
  if (state.farm && isXpBarFull(state)) state.farm.xpRemainder = 0;

  return {
    displayedXp,
    creditedTicks: result.creditedTicks,
    discardedTicks: rewardTicks - result.creditedTicks,
  };
}

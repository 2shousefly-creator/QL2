import { GameState } from "../../../../game/types";
import { claimDailyTrainingReward, DailyTrainingClaimResult } from "../../../../game/training/dailyTrainingReward";
import { GomokuDifficulty } from "../domain/gomokuTypes";

export function processGomokuResultReward(
  draftState: GameState,
  matchId: string,
  difficulty: GomokuDifficulty,
  victory: boolean,
  completedAtEpochMs: number = Date.now()
): DailyTrainingClaimResult {
  return claimDailyTrainingReward(draftState, {
    runId: matchId,
    gameId: "gomoku_infinite",
    difficulty,
    completedAtEpochMs,
    victory,
  });
}

import {
  FormationAssemblyStats,
  FormationDifficultyStats,
  GomokuDifficultyStats,
  GomokuStats,
  MarchRhythmDifficultyStats,
  RadarTrackingDifficultyStats,
  RadarTrackingStats,
  ShootingRangeDifficultyStats,
  ShootingRangeStats,
  SignalCommandDifficultyStats,
  SignalCommandStats,
  SupplyRouteDifficultyStats,
  SupplyRouteStats,
  TrainingState,
} from "../types";

export function createEmptyShootingRangeDifficultyStats(): ShootingRangeDifficultyStats {
  return {
    runsStarted: 0,
    runsFinished: 0,
    wins: 0,
    failures: 0,
    interruptions: 0,
    bestScore: 0,
    bestAccuracy: 0,
    targetsDestroyed: 0,
    fastestWinningRunMs: null,
    perfectWins: 0,
    lastPlayedAt: null,
    lastWonAt: null,
  };
}

export function createEmptyShootingRangeStats(): ShootingRangeStats {
  return {
    easy: createEmptyShootingRangeDifficultyStats(),
    medium: createEmptyShootingRangeDifficultyStats(),
    hard: createEmptyShootingRangeDifficultyStats(),
    lastRecordedRunId: null,
  };
}

export function createEmptyRadarTrackingDifficultyStats(): RadarTrackingDifficultyStats {
  return {
    runsStarted: 0,
    runsFinished: 0,
    wins: 0,
    failures: 0,
    interruptions: 0,
    bestScore: 0,
    bestAccuracy: 0,
    mostRoundsCompleted: 0,
    fastestWinningRunMs: null,
    perfectWins: 0,
    lastPlayedAt: null,
    lastWonAt: null,
  };
}

export function createEmptyRadarTrackingStats(): RadarTrackingStats {
  return {
    easy: createEmptyRadarTrackingDifficultyStats(),
    medium: createEmptyRadarTrackingDifficultyStats(),
    hard: createEmptyRadarTrackingDifficultyStats(),
    lastRecordedRunId: null,
  };
}
import { getTrainingDateKey } from "./trainingClock";

export function createEmptyGomokuDifficultyStats(): GomokuDifficultyStats {
  return {
    matchesStarted: 0,
    matchesFinished: 0,
    wins: 0,
    losses: 0,
    resignations: 0,
    interruptions: 0,
    winsAsX: 0,
    winsAsO: 0,
    winsGoingFirst: 0,
    winsGoingSecond: 0,
    lossesGoingFirst: 0,
    lossesGoingSecond: 0,
    shortestWinMoveCount: null,
    longestMatchMoveCount: 0,
    fastestWinMs: null,
    totalPlayerMoves: 0,
    totalAiMoves: 0,
    lastPlayedAt: null,
    lastWonAt: null,
  };
}

export function createEmptyGomokuStats(): GomokuStats {
  return {
    easy: createEmptyGomokuDifficultyStats(),
    medium: createEmptyGomokuDifficultyStats(),
    hard: createEmptyGomokuDifficultyStats(),
    lastRecordedRunId: null,
  };
}

export function createEmptyMarchRhythmDifficultyStats(): MarchRhythmDifficultyStats {
  return {
    plays: 0,
    wins: 0,
    bestScore: 0,
    bestAccuracy: 0,
    bestHitRate: 0,
    bestCombo: 0,
    lastPlayedAt: null,
    lastWonAt: null,
  };
}

export function createEmptySignalCommandDifficultyStats(): SignalCommandDifficultyStats {
  return {
    runsStarted: 0,
    runsFinished: 0,
    wins: 0,
    failures: 0,
    interruptions: 0,
    bestScore: 0,
    bestAccuracy: 0,
    longestSequenceCompleted: 0,
    mostRoundsCompleted: 0,
    perfectWins: 0,
    fastestWinningRunMs: null,
    lastPlayedAt: null,
    lastWonAt: null,
  };
}

export function createEmptySignalCommandStats(): SignalCommandStats {
  return {
    easy: createEmptySignalCommandDifficultyStats(),
    medium: createEmptySignalCommandDifficultyStats(),
    hard: createEmptySignalCommandDifficultyStats(),
    lastRecordedRunId: null,
  };
}

export function createEmptyFormationDifficultyStats(): FormationDifficultyStats {
  return {
    runsStarted: 0,
    runsFinished: 0,
    wins: 0,
    failures: 0,
    interruptions: 0,
    bestScore: 0,
    mostRoundsCompleted: 0,
    fastestWinningRunMs: null,
    perfectWins: 0,
    fewestActionsInWin: null,
    lastPlayedAt: null,
    lastWonAt: null,
  };
}

export function createEmptyFormationAssemblyStats(): FormationAssemblyStats {
  return {
    easy: createEmptyFormationDifficultyStats(),
    medium: createEmptyFormationDifficultyStats(),
    hard: createEmptyFormationDifficultyStats(),
    lastRecordedRunId: null,
  };
}

export function createEmptySupplyRouteDifficultyStats(): SupplyRouteDifficultyStats {
  return {
    runsStarted: 0,
    runsFinished: 0,
    wins: 0,
    failures: 0,
    interruptions: 0,
    bestScore: 0,
    mostRoundsCompleted: 0,
    fastestWinningRunMs: null,
    perfectWins: 0,
    fewestRotationsInWin: null,
    bestRotationEfficiency: 0,
    mostDepotsConnectedInRound: 0,
    lastPlayedAt: null,
    lastWonAt: null,
  };
}

export function createEmptySupplyRouteStats(): SupplyRouteStats {
  return {
    easy: createEmptySupplyRouteDifficultyStats(),
    medium: createEmptySupplyRouteDifficultyStats(),
    hard: createEmptySupplyRouteDifficultyStats(),
    lastRecordedRunId: null,
  };
}

export function createDefaultTrainingState(nowEpochMs: number = Date.now()): TrainingState {
  const dateKey = getTrainingDateKey(nowEpochMs);
  return {
    trainingTimingOffsetMs: 0,
    dailyReward: {
      lastClaimDateKey: null,
      lastClaimedAt: null,
      lastClaimedGameId: null,
      lastClaimedDifficulty: null,
      lastNominalRewardXp: 0,
      lastCreditedRewardXpTicks: 0,
      claimRunId: null,
      lastObservedEpochMs: nowEpochMs,
      lastObservedTrainingDateKey: dateKey,
    },
    marchRhythm: {
      easy: createEmptyMarchRhythmDifficultyStats(),
      medium: createEmptyMarchRhythmDifficultyStats(),
      hard: createEmptyMarchRhythmDifficultyStats(),
    },
    signalCommand: createEmptySignalCommandStats(),
    formationAssembly: createEmptyFormationAssemblyStats(),
    supplyRoute: createEmptySupplyRouteStats(),
    gomoku: createEmptyGomokuStats(),
    radarTracking: createEmptyRadarTrackingStats(),
    shootingRange: createEmptyShootingRangeStats(),
  };
}

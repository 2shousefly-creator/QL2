import { TRAINING_DIFFICULTIES, TrainingDifficultyConfig } from "./trainingConfig";
import { MarchRhythmNote, MarchRhythmNoteType } from "./marchRhythmChart";

export type NoteJudgementType = "perfect" | "good" | "miss";

export type JudgementResult = {
  judgement: NoteJudgementType;
  scoreEarned: number;
  offsetMs: number;
};

/**
 * Calculates judgement for a tap or chord hit based on timing offset
 */
export function judgeHitOffset(
  inputTimeMs: number,
  scheduledHitTimeMs: number,
  timingOffsetMs: number,
  config: TrainingDifficultyConfig
): JudgementResult {
  const correctedScheduledMs = scheduledHitTimeMs + timingOffsetMs;
  const offsetMs = inputTimeMs - correctedScheduledMs;
  const absOffsetMs = Math.abs(offsetMs);

  if (absOffsetMs <= config.perfectWindowMs) {
    return { judgement: "perfect", scoreEarned: 100, offsetMs };
  } else if (absOffsetMs <= config.goodWindowMs) {
    return { judgement: "good", scoreEarned: 70, offsetMs };
  } else {
    return { judgement: "miss", scoreEarned: 0, offsetMs };
  }
}

export type MarchRhythmGameResult = {
  score: number;
  accuracy: number;        // 0-100%
  hitRate: number;         // 0-100%
  maxCombo: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
  strayInputCount: number;
  holdCompletionRate: number;  // 0-100%
  chordCompletionRate: number; // 0-100%
  holdsAttempted: number;
  holdsCompleted: number;
  chordsAttempted: number;
  chordsCompleted: number;
  victory: boolean;
};

/**
 * Evaluates whether a game result satisfies difficulty win conditions
 */
export function evaluateWinConditions(
  result: Omit<MarchRhythmGameResult, "victory">,
  config: TrainingDifficultyConfig
): boolean {
  const { winConditions } = config;

  if (result.accuracy < winConditions.minAccuracy) return false;
  if (result.hitRate < winConditions.minHitRate) return false;
  if (result.missCount > winConditions.maxMiss) return false;

  if (winConditions.minHoldCompletion !== undefined && result.holdsAttempted > 0) {
    if (result.holdCompletionRate < winConditions.minHoldCompletion) return false;
  }

  if (winConditions.minChordCompletion !== undefined && result.chordsAttempted > 0) {
    if (result.chordCompletionRate < winConditions.minChordCompletion) return false;
  }

  return true;
}

import { TRAINING_DIFFICULTIES } from "./trainingConfig";
import { MarchRhythmChart } from "./marchRhythmChart";

export type ChartValidationResult = {
  isValid: boolean;
  errors: string[];
};

/**
 * Validates that a chart strictly respects difficulty rules & safety constraints
 */
export function validateMarchRhythmChart(chart: MarchRhythmChart): ChartValidationResult {
  const errors: string[] = [];
  const config = TRAINING_DIFFICULTIES[chart.difficulty];

  if (chart.laneCount !== config.laneCount) {
    errors.push(`Lane count mismatch: got ${chart.laneCount}, expected ${config.laneCount}`);
  }

  if (chart.notes.length < config.noteCountRange[0] - 2 || chart.notes.length > config.noteCountRange[1] + 2) {
    errors.push(`Note count out of range: got ${chart.notes.length}, expected [${config.noteCountRange.join(", ")}]`);
  }

  let lastTime = 0;

  for (let i = 0; i < chart.notes.length; i++) {
    const note = chart.notes[i];

    // Check lane index validity
    for (const l of note.laneIndices) {
      if (l < 0 || l >= chart.laneCount) {
        errors.push(`Invalid lane index ${l} in note ${note.id}`);
      }
    }

    // Check strict monotonicity
    if (note.scheduledHitTimeMs < lastTime) {
      errors.push(`Non-monotonic time at note ${note.id}: ${note.scheduledHitTimeMs} < ${lastTime}`);
    }
    lastTime = note.scheduledHitTimeMs;

    if ((note.type as string) !== "tap") {
      errors.push(`Only tap notes are allowed, got ${note.type}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}


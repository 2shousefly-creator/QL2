import { TrainingDifficulty } from "../types";
import { TRAINING_DIFFICULTIES, TrainingDifficultyConfig } from "./trainingConfig";

export type MarchRhythmNoteType = "tap";

export type MarchRhythmNote = {
  id: string;
  type: MarchRhythmNoteType;
  laneIndices: number[];
  scheduledHitTimeMs: number;
  holdDurationMs?: number;
};

export type MarchRhythmChart = {
  id: string;
  seed: string;
  difficulty: TrainingDifficulty;
  laneCount: 2 | 3 | 4;
  durationMs: number;
  notes: MarchRhythmNote[];
  bpmSegments: number[];
};

/**
 * Deterministic pseudo-random number generator (LCG)
 */
function createPrng(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let s = Math.abs(hash) || 123456789;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Creates a valid rhythm chart according to difficulty constraints (Tap notes only)
 */
export function createMarchRhythmChart(
  difficulty: TrainingDifficulty,
  seedStr: string = String(Date.now())
): MarchRhythmChart {
  const config = TRAINING_DIFFICULTIES[difficulty];
  const rand = createPrng(seedStr);

  const laneCount = config.laneCount;
  const targetNoteCount = Math.floor(
    config.noteCountRange[0] + rand() * (config.noteCountRange[1] - config.noteCountRange[0] + 1)
  );

  const notes: MarchRhythmNote[] = [];

  // Start initial time after pre-roll (2000ms countdown + travel buffer)
  let currentTimeMs = 2200;
  let lastLane = -1;

  for (let i = 0; i < targetNoteCount; i++) {
    // Select lane prefer different from last
    const allLanes = Array.from({ length: laneCount }, (_, l) => l);
    const preferred = allLanes.filter((l) => l !== lastLane);
    const candidates = preferred.length > 0 ? preferred : allLanes;
    const lane = candidates[Math.floor(rand() * candidates.length)];

    notes.push({
      id: `note_${i}_tap_${lane}`,
      type: "tap",
      laneIndices: [lane],
      scheduledHitTimeMs: Math.round(currentTimeMs),
    });

    lastLane = lane;

    // Advance time for next note based on difficulty gap rules
    let maxRandomGap = 400;
    if (difficulty === "medium") maxRandomGap = 280;
    if (difficulty === "hard") maxRandomGap = 180;

    const baseGapMs = Math.max(
      config.minimumNoteGapMs,
      Math.round(config.minimumNoteGapMs + rand() * maxRandomGap)
    );
    currentTimeMs += baseGapMs;
  }

  const totalDurationMs = Math.max(
    config.activeDurationRangeMs[0],
    currentTimeMs + 1500
  );

  return {
    id: `chart_${difficulty}_${seedStr}`,
    seed: seedStr,
    difficulty,
    laneCount,
    durationMs: totalDurationMs,
    notes,
    bpmSegments: config.bpmSegments,
  };
}


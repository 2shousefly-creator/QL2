import { TrainingDifficulty } from "../types";
import { TRAINING_DIFFICULTIES, TrainingDifficultyConfig } from "./trainingConfig";
import { MarchRhythmChart, MarchRhythmNote } from "./marchRhythmChart";
import { evaluateWinConditions, judgeHitOffset, MarchRhythmGameResult, NoteJudgementType } from "./marchRhythmJudgement";

export type MarchRhythmRunPhase =
  | "idle"
  | "countdown"
  | "playing"
  | "resolving"
  | "result"
  | "interrupted";

export type ActiveNoteState = {
  note: MarchRhythmNote;
  judgement: NoteJudgementType | "pending";
  hitOffsetMs?: number;
};

export type ActiveRunState = {
  runId: string;
  difficulty: TrainingDifficulty;
  config: TrainingDifficultyConfig;
  chart: MarchRhythmChart;
  phase: MarchRhythmRunPhase;
  startedAtPerformanceMs: number;
  activeNotesMap: Map<string, ActiveNoteState>;
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
  strayInputCount: number;
  holdsAttempted: number;
  holdsCompleted: number;
  chordsAttempted: number;
  chordsCompleted: number;
  lastJudgementText?: { text: string; color: string; key: number };
  result: MarchRhythmGameResult | null;
};

export function createActiveRun(
  chart: MarchRhythmChart,
  startedAtPerformanceMs: number
): ActiveRunState {
  const config = TRAINING_DIFFICULTIES[chart.difficulty];
  const activeNotesMap = new Map<string, ActiveNoteState>();

  for (const note of chart.notes) {
    activeNotesMap.set(note.id, {
      note,
      judgement: "pending",
    });
  }

  return {
    runId: `run_${chart.difficulty}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    difficulty: chart.difficulty,
    config,
    chart,
    phase: "countdown",
    startedAtPerformanceMs,
    activeNotesMap,
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    goodCount: 0,
    missCount: 0,
    strayInputCount: 0,
    holdsAttempted: 0,
    holdsCompleted: 0,
    chordsAttempted: 0,
    chordsCompleted: 0,
    lastJudgementText: undefined,
    result: null,
  };
}

/**
 * Handles input on a given lane
 */
export function processLaneInput(
  run: ActiveRunState,
  laneIndex: number,
  elapsedMs: number,
  timingOffsetMs: number
): NoteJudgementType | "stray" {
  if (run.phase !== "playing") return "stray";

  // Search for the closest pending note on this lane within good window
  let bestCandidate: ActiveNoteState | null = null;
  let minDistanceMs = Infinity;

  for (const state of run.activeNotesMap.values()) {
    if (state.judgement !== "pending") continue;

    if (state.note.laneIndices.includes(laneIndex)) {
      const scheduledMs = state.note.scheduledHitTimeMs + timingOffsetMs;
      const dist = Math.abs(elapsedMs - scheduledMs);

      if (dist <= run.config.goodWindowMs && dist < minDistanceMs) {
        minDistanceMs = dist;
        bestCandidate = state;
      }
    }
  }

  if (!bestCandidate) {
    // Stray tap outside hit window
    run.strayInputCount++;
    run.combo = 0;
    run.lastJudgementText = { text: "STRAY", color: "text-slate-500", key: Date.now() };
    return "stray";
  }

  const judgementRes = judgeHitOffset(
    elapsedMs,
    bestCandidate.note.scheduledHitTimeMs,
    timingOffsetMs,
    run.config
  );

  const jType = judgementRes.judgement;

  bestCandidate.judgement = jType;
  bestCandidate.hitOffsetMs = judgementRes.offsetMs;

  applyJudgementToRun(run, jType, judgementRes.scoreEarned);
  return jType;
}

/**
 * Legacy stub for hold notes
 */
export function updateHoldState(
  _run: ActiveRunState,
  _laneIndex: number,
  _isKeyDown: boolean,
  _elapsedMs: number,
  _deltaMs: number
) {
  // No-op (Hold notes removed)
}

/**
 * Resolves notes that passed the target line without input
 */
export function resolveExpiredNotes(
  run: ActiveRunState,
  elapsedMs: number,
  timingOffsetMs: number
) {
  if (run.phase !== "playing") return;

  for (const state of run.activeNotesMap.values()) {
    if (state.judgement !== "pending") continue;

    const scheduledMs = state.note.scheduledHitTimeMs + timingOffsetMs;

    if (elapsedMs > scheduledMs + run.config.goodWindowMs + 100) {
      state.judgement = "miss";
      applyJudgementToRun(run, "miss", 0);
    }
  }
}

function applyJudgementToRun(
  run: ActiveRunState,
  jType: NoteJudgementType,
  scoreEarned: number
) {
  run.score += scoreEarned;

  if (jType === "perfect") {
    run.perfectCount++;
    run.combo++;
    run.lastJudgementText = { text: "PERFECT!", color: "text-amber-400", key: Date.now() };
  } else if (jType === "good") {
    run.goodCount++;
    run.combo++;
    run.lastJudgementText = { text: "GOOD", color: "text-emerald-400", key: Date.now() };
  } else {
    run.missCount++;
    run.combo = 0;
    run.lastJudgementText = { text: "MISS", color: "text-rose-500", key: Date.now() };
  }

  if (run.combo > run.maxCombo) {
    run.maxCombo = run.combo;
  }
}

/**
 * Compiles final game stats and checks victory condition
 */
export function compileGameResult(run: ActiveRunState): MarchRhythmGameResult {
  const totalNotes = run.chart.notes.length;
  const judgedUnits = run.perfectCount + run.goodCount + run.missCount + run.strayInputCount;

  const earnedPoints = run.perfectCount * 100 + run.goodCount * 70;
  const maxPossiblePoints = Math.max(1, (run.perfectCount + run.goodCount + run.missCount + run.strayInputCount) * 100);

  const accuracy = Math.round(Math.min(100, Math.max(0, (earnedPoints / maxPossiblePoints) * 100)));
  const hitRate = Math.round(
    Math.min(100, Math.max(0, ((run.perfectCount + run.goodCount) / Math.max(1, run.perfectCount + run.goodCount + run.missCount)) * 100))
  );

  const holdCompletionRate =
    run.holdsAttempted > 0 ? Math.round((run.holdsCompleted / run.holdsAttempted) * 100) : 100;
  const chordCompletionRate =
    run.chordsAttempted > 0 ? Math.round((run.chordsCompleted / run.chordsAttempted) * 100) : 100;

  const baseResult: Omit<MarchRhythmGameResult, "victory"> = {
    score: run.score,
    accuracy,
    hitRate,
    maxCombo: run.maxCombo,
    perfectCount: run.perfectCount,
    goodCount: run.goodCount,
    missCount: run.missCount,
    strayInputCount: run.strayInputCount,
    holdCompletionRate,
    chordCompletionRate,
    holdsAttempted: run.holdsAttempted,
    holdsCompleted: run.holdsCompleted,
    chordsAttempted: run.chordsAttempted,
    chordsCompleted: run.chordsCompleted,
  };

  const victory = evaluateWinConditions(baseResult, run.config);

  const finalResult: MarchRhythmGameResult = {
    ...baseResult,
    victory,
  };

  run.result = finalResult;
  return finalResult;
}

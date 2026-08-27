import { GameState, JourneyChapterDefinition } from "./types";
import { JOURNEY_CHAPTERS } from "./journeyChapters";
import {
  getCurrentRank,
  getFinalJourneyXpTargetTicks,
  getRequiredXpTicksForTransition,
  getTotalXpTicksToReachMaxRank,
} from "./xpEngine";
import { RANK_STEPS } from "./rankBuilder";
import { RANK_FAMILIES } from "./rankFamilies";
import { getEstimatedEarningRate } from "./recentActivity";

export function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

export function getCurrentTransitionProgress(state: GameState): number {
  const currentRankIndex = state.progression.currentRankIndex;
  const maxIdx = RANK_STEPS.length - 1;
  if (currentRankIndex >= maxIdx) {
    const finalTargetTicks = getFinalJourneyXpTargetTicks();
    const startTicks = getTotalXpTicksToReachMaxRank();
    const range = finalTargetTicks - startTicks;
    if (range <= 0) return 1;
    const progressInFinalLeg = Math.max(0, state.progression.totalXpEarnedTicks - startTicks);
    return clamp01(progressInFinalLeg / range);
  }
  const reqTicks = getRequiredXpTicksForTransition(currentRankIndex);
  if (reqTicks <= 0) return 1;
  return clamp01(state.progression.xpIntoCurrentRankTicks / reqTicks);
}

export function getJourneyChapterForRank(rankIndex: number): JourneyChapterDefinition {
  const chapter = JOURNEY_CHAPTERS.find(
    (c) => rankIndex >= c.startRankIndex && rankIndex <= c.endRankIndex
  );
  return chapter || JOURNEY_CHAPTERS[JOURNEY_CHAPTERS.length - 1];
}

export function getJourneyChapterProgress(
  state: GameState,
  chapter: JourneyChapterDefinition
): number {
  const currentRankIndex = state.progression.currentRankIndex;
  const currentProgress = getCurrentTransitionProgress(state);
  const maxIdx = RANK_STEPS.length - 1;

  if (chapter.id === "supreme_command") {
    const totalTransitions = maxIdx - chapter.startRankIndex;
    if (currentRankIndex >= maxIdx) return 1;
    if (currentRankIndex < chapter.startRankIndex) return 0;

    const completedTransitions = currentRankIndex - chapter.startRankIndex;
    return clamp01((completedTransitions + currentProgress) / totalTransitions);
  }

  const nextChapter = JOURNEY_CHAPTERS.find(
    (c) => c.startRankIndex === chapter.endRankIndex + 1
  );

  if (!nextChapter) {
    return currentRankIndex >= chapter.endRankIndex ? 1 : 0;
  }

  if (currentRankIndex >= nextChapter.startRankIndex) return 1;
  if (currentRankIndex < chapter.startRankIndex) return 0;

  const totalTransitions = nextChapter.startRankIndex - chapter.startRankIndex;
  const completedTransitions = currentRankIndex - chapter.startRankIndex;

  return clamp01((completedTransitions + currentProgress) / totalTransitions);
}

export function getChapterStatus(
  state: GameState,
  chapter: JourneyChapterDefinition
): "completed" | "current" | "upcoming" {
  const currentRankIndex = state.progression.currentRankIndex;
  if (currentRankIndex > chapter.endRankIndex) return "completed";
  if (currentRankIndex >= chapter.startRankIndex && currentRankIndex <= chapter.endRankIndex) {
    return "current";
  }
  return "upcoming";
}

export function getNextFamilyStartRankIndex(currentRankIndex: number): number | null {
  const maxIdx = RANK_STEPS.length - 1;
  if (currentRankIndex >= maxIdx) return null;

  const currentStep = RANK_STEPS[currentRankIndex];
  for (let i = currentRankIndex + 1; i < RANK_STEPS.length; i++) {
    if (RANK_STEPS[i].familyId !== currentStep.familyId) {
      return i;
    }
  }
  return null;
}

export function getRemainingXpTicksToNextFamily(state: GameState): number | null {
  const currentRankIndex = state.progression.currentRankIndex;
  const maxIdx = RANK_STEPS.length - 1;
  if (currentRankIndex >= maxIdx) {
    const finalTargetTicks = getFinalJourneyXpTargetTicks();
    const rem = Math.max(0, finalTargetTicks - state.progression.totalXpEarnedTicks);
    return rem > 0 ? rem : null;
  }

  const nextFamilyStartIdx = getNextFamilyStartRankIndex(currentRankIndex);
  if (nextFamilyStartIdx === null) return null;

  const currentReqTicks = getRequiredXpTicksForTransition(currentRankIndex);
  const currentRemainingTicks = Math.max(
    0,
    currentReqTicks - state.progression.xpIntoCurrentRankTicks
  );

  let totalTicks = currentRemainingTicks;

  for (let idx = currentRankIndex + 1; idx < nextFamilyStartIdx; idx++) {
    totalTicks += getRequiredXpTicksForTransition(idx);
  }

  return totalTicks;
}

export function getNominalChallengeTimeToNextFamily(state: GameState): number | null {
  const currentRankIndex = state.progression.currentRankIndex;
  const maxIdx = RANK_STEPS.length - 1;
  if (currentRankIndex >= maxIdx) return null;

  const nextFamilyStartIdx = getNextFamilyStartRankIndex(currentRankIndex);
  if (nextFamilyStartIdx === null) return null;

  let totalChallengeMs = 0;

  for (let idx = currentRankIndex; idx < nextFamilyStartIdx; idx++) {
    const isMajor = idx === nextFamilyStartIdx - 1;
    totalChallengeMs += isMajor ? 180_000 : 120_000;
  }

  return totalChallengeMs;
}

export function getEtaToNextRankFamily(
  state: GameState,
  nowMs: number
): {
  etaMs: number;
  sourceLabel: "7_day" | "lifetime" | "initial_fallback";
  onlineRatio: number;
  remainingTicks: number;
  nominalChallengeMs: number;
} | null {
  const remainingTicks = getRemainingXpTicksToNextFamily(state);
  if (remainingTicks === null) return null;

  const nominalChallengeMs = getNominalChallengeTimeToNextFamily(state) || 0;
  const rateInfo = getEstimatedEarningRate(state, nowMs);

  const xpTimeMs = rateInfo.xpTicksPerMs > 0 ? remainingTicks / rateInfo.xpTicksPerMs : 0;
  const etaMs = Math.max(0, Math.round(xpTimeMs + nominalChallengeMs));

  return {
    etaMs,
    sourceLabel: rateInfo.sourceLabel,
    onlineRatio: rateInfo.onlineRatio,
    remainingTicks,
    nominalChallengeMs,
  };
}

export function formatApproximateEta(etaMs: number | null): string {
  if (etaMs === null) return "Đã đạt cấp tối đa";

  const totalMinutes = Math.round(etaMs / 60_000);
  if (totalMinutes < 1) return "Dưới 1 phút";
  if (totalMinutes < 60) return `${totalMinutes} phút`;

  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;

  if (totalHours < 24) {
    if (remMinutes === 0) return `${totalHours} giờ`;
    return `${totalHours} giờ ${remMinutes} phút`;
  }

  const totalDays = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;

  if (totalDays < 30) {
    if (remHours === 0) return `${totalDays} ngày`;
    return `${totalDays} ngày ${remHours} giờ`;
  }

  const totalWeeks = Math.floor(totalDays / 7);
  const remDays = totalDays % 7;
  if (remDays === 0) return `${totalWeeks} tuần`;
  return `${totalWeeks} tuần ${remDays} ngày`;
}

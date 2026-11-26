import { recordAppointments } from "./journal/journalEngine";
import { gameConfig } from "./config";
import { RANK_STEPS } from "./rankBuilder";
import { DelegationReportData, EarningMode, GameState } from "./types";
import {
  calculateMsToEarnTicksWithEnergy,
  ensureEnergyState,
  getEnergyMultiplier,
  isEnergyActive,
  settleEnergyAndXp,
} from "./energyEngine";
import { recordRecentEarningActivity } from "./recentActivity";
import { advanceFarmTimeline } from "../features/tang_gia/farmTimeline";
import { applyFarmXpReward } from "../features/tang_gia/farmXpReward";
import { captureDelegationStart, createDelegationReport } from "./delegationReport";
import { evaluateMedalUnlocks } from "./medals/medalEngine";

/**
 * Returns current effective XP rate in ticks per ms based on mode and energy percent.
 */
export function getEffectiveXpRateTicksPerMs(
  stateOrMode: GameState | EarningMode,
  modeOrEnergy?: EarningMode | number,
  nowMs: number = Date.now()
): number {
  if (typeof stateOrMode === "string") {
    const mode = stateOrMode as EarningMode;
    const energyPercent = typeof modeOrEnergy === "number" ? modeOrEnergy : 100;
    if (mode === "direct_online") {
      const mult = getEnergyMultiplier(energyPercent, true);
      return 10 * mult;
    }
    return 10;
  } else {
    const state = stateOrMode;
    const mode = modeOrEnergy as EarningMode;
    if (mode === "direct_online") {
      const energyState = ensureEnergyState(state, nowMs);
      const active = isEnergyActive(state, mode);
      const mult = getEnergyMultiplier(energyState.percent, active);
      return 10 * mult;
    }
    return 10;
  }
}

/**
 * Calculates required XP for transition n (0-indexed, where 0 is transition from rank 0 to rank 1).
 */
export * from "./xpProgression";
export { applyEarnedXpCapped } from "./xpRewards";
import { getCurrentRank, getRequiredXpForTransition, getRequiredXpTicksForTransition, getFinalJourneyXpTargetTicks, isXpBarFull } from "./xpProgression";

/**
 * Settles accumulated XP between state.time.lastSettledAt and nowEpochMs.
 * Advances a bounded event slice; the caller resumes until reaching nowEpochMs.
 */
export function settleEarning(
  state: GameState,
  nowEpochMs: number,
  mode: EarningMode
): { creditedTicks: number; elapsedMs: number; reportData?: DelegationReportData } {
  const reportStart = captureDelegationStart(state);
  const previousSettledAt = state.time.lastSettledAt;
  let elapsedMs = Math.max(0, nowEpochMs - previousSettledAt);

  state.time.currentEarningMode = mode;

  // Do not earn if pending ceremony
  const isCeremonyPending = !!state.ui.pendingPromotionCeremony;


  let earnedTicks = 0;
  const advanceEarning = (at: number) => {
    const from = state.time.lastSettledAt;
    const wasFull = isXpBarFull(state);
    if (!isCeremonyPending && at > from) {
      const before = state.progression.xpIntoCurrentRankTicks;
      earnedTicks += settleEnergyAndXp(state, from, at, mode).earnedTicks;
      recordAppointments(state, before, state.progression.xpIntoCurrentRankTicks, getRequiredXpTicksForTransition(state.progression.currentRankIndex), at);
      if (!wasFull) recordRecentEarningActivity(state, at - from, mode, at);
    } else ensureEnergyState(state, at);
    state.time.lastSettledAt = at;
    if (state.farm && isXpBarFull(state)) state.farm.xpRemainder = 0;
  };
  const reachedAt = advanceFarmTimeline(state, nowEpochMs, {
    rank: getCurrentRank(state.progression.currentRankIndex),
    xpFull: () => isXpBarFull(state),
    nextXpFullAt: () => {
      if (isCeremonyPending || isXpBarFull(state)) return null;
      const rankIndex = state.progression.currentRankIndex;
      const remaining = rankIndex >= RANK_STEPS.length - 1 ? getFinalJourneyXpTargetTicks() - state.progression.totalXpEarnedTicks : getRequiredXpTicksForTransition(rankIndex) - state.progression.xpIntoCurrentRankTicks;
      const at = state.time.lastSettledAt;
      const duration = mode === 'direct_online' && isEnergyActive(state, mode) ? calculateMsToEarnTicksWithEnergy(ensureEnergyState(state, at).percent, remaining) : Math.ceil(remaining / gameConfig.delegationXpTicksPerMs);
      return at + duration;
    },
    rewardXp: xp => applyFarmXpReward(state, xp).creditedTicks / gameConfig.xpTicksPerXp,
  }, advanceEarning);
  nowEpochMs = reachedAt;
  elapsedMs = Math.max(0, reachedAt - previousSettledAt);
  const creditedTicks = earnedTicks;
  evaluateMedalUnlocks(state);
  const reportData = mode === "delegation" ? createDelegationReport(state, reportStart) : undefined;

  return { creditedTicks, elapsedMs, reportData };
}

export function formatXp(ticks: number, compact: boolean = false): string {
  const xp = ticks / gameConfig.xpTicksPerXp;
  if (compact && xp >= 1000) {
    return Math.round(xp / 1000).toLocaleString("vi-VN") + "k XP";
  }
  return Math.max(0, Math.round(xp)).toLocaleString("vi-VN") + " XP";
}

export function formatDurationVi(ms: number): string {
  if (ms <= 0) return "0 phút";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ngày`);
  if (hours > 0) parts.push(`${hours.toString().padStart(2, "0")} giờ`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes.toString().padStart(2, "0")} phút`);

  return parts.join(" ");
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return "0s";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function formatCountdownTime(remainingMs: number): string {
  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getEtaDetailsToFullBar(state: GameState, nowMs: number = Date.now()): {
  isFull: boolean;
  isMaxRank: boolean;
  delegationEta: string | null;
  onlineEta: string | null;
  hasBoost: boolean;
  message?: string;
} {
  const currentRankIndex = state.progression.currentRankIndex;
  const isMaxRank = currentRankIndex >= RANK_STEPS.length - 1;

  if (isXpBarFull(state)) {
    if (isMaxRank) {
      return { isFull: true, isMaxRank: true, delegationEta: null, onlineEta: null, hasBoost: false, message: "Đã hoàn tất hành trình" };
    }
    return { isFull: true, isMaxRank: false, delegationEta: null, onlineEta: null, hasBoost: false, message: "Đã đạt 100% – Sẵn sàng xét thăng cấp" };
  }

  const reqTicks = isMaxRank
    ? getFinalJourneyXpTargetTicks()
    : getRequiredXpTicksForTransition(currentRankIndex);
  const currentTicks = isMaxRank
    ? state.progression.totalXpEarnedTicks
    : state.progression.xpIntoCurrentRankTicks;
  const remTicks = Math.max(0, reqTicks - currentTicks);

  if (remTicks <= 0) {
    if (isMaxRank) {
      return { isFull: true, isMaxRank: true, delegationEta: null, onlineEta: null, hasBoost: false, message: "Đã hoàn tất hành trình" };
    }
    return { isFull: true, isMaxRank: false, delegationEta: null, onlineEta: null, hasBoost: false, message: "Đã đạt 100% – Sẵn sàng xét thăng cấp" };
  }

  const energyState = ensureEnergyState(state, nowMs);
  const energyPercent = Math.max(0, Math.min(100, energyState.percent));
  const isOnline = state.time.currentEarningMode === "direct_online";
  const active = isEnergyActive(state, state.time.currentEarningMode);
  const mult = isOnline ? getEnergyMultiplier(energyPercent, active) : 1;
  const hasBoost = isOnline && mult > 1;

  const msRemainingDelegation = Math.ceil(remTicks / gameConfig.delegationXpTicksPerMs);
  const msRemainingOnline = calculateMsToEarnTicksWithEnergy(energyPercent, remTicks);

  return {
    isFull: false,
    isMaxRank,
    delegationEta: formatDuration(msRemainingDelegation),
    onlineEta: hasBoost ? formatDuration(msRemainingOnline) : null,
    hasBoost,
  };
}

export function getEtaToFullBar(state: GameState, currentRateTicksPerMs: number): string {
  const currentRankIndex = state.progression.currentRankIndex;
  const isMaxRank = currentRankIndex >= RANK_STEPS.length - 1;

  if (isXpBarFull(state)) {
    if (isMaxRank) {
      return "Đã hoàn tất hành trình";
    }
    return "Đã đạt 100% – Sẵn sàng xét thăng cấp";
  }

  const reqTicks = isMaxRank
    ? getFinalJourneyXpTargetTicks()
    : getRequiredXpTicksForTransition(currentRankIndex);
  const currentTicks = isMaxRank
    ? state.progression.totalXpEarnedTicks
    : state.progression.xpIntoCurrentRankTicks;
  const remTicks = Math.max(0, reqTicks - currentTicks);

  if (remTicks <= 0) {
    if (isMaxRank) {
      return "Đã hoàn tất hành trình";
    }
    return "Đã đạt 100% – Sẵn sàng xét thăng cấp";
  }

  const rate = currentRateTicksPerMs > 0 ? currentRateTicksPerMs : gameConfig.delegationXpTicksPerMs;
  const msRemaining = Math.ceil(remTicks / rate);
  return formatDuration(msRemaining);
}

import { gameConfig } from "./config";
import { RANK_STEPS } from "./rankBuilder";
import { DelegationReportData, EarningMode, GameState, NewlyUnlockedMedalInfo, RankStep } from "./types";
import {
  calculateMsToEarnTicksWithEnergy,
  ensureEnergyState,
  getEnergyMultiplier,
  isEnergyActive,
  settleEnergyAndXp,
} from "./energyEngine";
import { recordRecentEarningActivity } from "./recentActivity";
import { settleFarmState, getPendingWateringCount } from "../features/tang_gia/farmEngine";
import { MEDAL_CATALOG } from "./medals/medalCatalog";
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
export function getRequiredXpForTransition(rankIndex: number): number {
  if (rankIndex >= RANK_STEPS.length - 1) {
    return 0; // Final rank (Tổng Tư Lệnh)
  }
  const { base, linear, quadratic } = gameConfig.xpCurve;
  return Math.round(base + linear * rankIndex + quadratic * rankIndex * rankIndex);
}

export function getRequiredXpTicksForTransition(rankIndex: number): number {
  return getRequiredXpForTransition(rankIndex) * gameConfig.xpTicksPerXp;
}

export function getNextRank(rankIndex: number): RankStep | null {
  if (rankIndex < RANK_STEPS.length - 1) {
    return RANK_STEPS[rankIndex + 1];
  }
  return null;
}

export function getCurrentRank(rankIndex: number): RankStep {
  return RANK_STEPS[Math.min(Math.max(0, rankIndex), RANK_STEPS.length - 1)];
}

export function isMajorPromotion(currentRank: RankStep, nextRank: RankStep): boolean {
  return currentRank.familyId !== nextRank.familyId;
}

export function getPromotionChallengeDurationMs(currentRank: RankStep, nextRank: RankStep): number {
  return isMajorPromotion(currentRank, nextRank)
    ? gameConfig.majorPromotionChallengeMs
    : gameConfig.minorPromotionChallengeMs;
}

/**
 * Returns total XP required to reach a specific rank index from the start of the game (rank 0).
 * rankIndex 0 => 0 XP
 * rankIndex 1 => requiredXp(0)
 * rankIndex n => sum(requiredXp(i)), i = 0..n-1
 */
export function getTotalXpToReachRank(rankIndex: number): number {
  if (rankIndex <= 0) return 0;
  const maxTransition = Math.min(rankIndex, RANK_STEPS.length - 1);
  let total = 0;
  for (let i = 0; i < maxTransition; i++) {
    total += getRequiredXpForTransition(i);
  }
  return total;
}

export function getTotalXpTicksToReachRank(rankIndex: number): number {
  return getTotalXpToReachRank(rankIndex) * gameConfig.xpTicksPerXp;
}

export function getTotalXpToReachMaxRank(): number {
  return getTotalXpToReachRank(RANK_STEPS.length - 1);
}

export function getTotalXpTicksToReachMaxRank(): number {
  return getTotalXpTicksToReachRank(RANK_STEPS.length - 1);
}

export function getFinalJourneyXpTarget(): number {
  return getTotalXpToReachMaxRank() + 999_999;
}

export function getFinalJourneyXpTargetTicks(): number {
  return getFinalJourneyXpTarget() * gameConfig.xpTicksPerXp;
}

export function isXpBarFull(state: GameState): boolean {
  const currentRankIndex = state.progression.currentRankIndex;
  if (currentRankIndex >= RANK_STEPS.length - 1) {
    return state.progression.totalXpEarnedTicks >= getFinalJourneyXpTargetTicks();
  }
  const reqTicks = getRequiredXpTicksForTransition(currentRankIndex);
  return state.progression.xpIntoCurrentRankTicks >= reqTicks;
}

/**
 * Applies earned XP ticks strictly capped at 100%.
 * Discards any overflow ticks.
 */
export function applyEarnedXpCapped(
  state: GameState,
  earnedTicks: number
): { creditedTicks: number; isFullNow: boolean; wasFullBefore: boolean } {
  if (earnedTicks <= 0) {
    return {
      creditedTicks: 0,
      isFullNow: isXpBarFull(state),
      wasFullBefore: isXpBarFull(state),
    };
  }

  const currentRankIndex = state.progression.currentRankIndex;
  const isFinalRank = currentRankIndex >= RANK_STEPS.length - 1;

  if (isFinalRank) {
    const finalTargetTicks = getFinalJourneyXpTargetTicks();
    const currentTotalTicks = state.progression.totalXpEarnedTicks;
    const remainingTicks = Math.max(0, finalTargetTicks - currentTotalTicks);
    const wasFullBefore = currentTotalTicks >= finalTargetTicks;

    const creditedTicks = Math.min(earnedTicks, remainingTicks);

    state.progression.xpIntoCurrentRankTicks += creditedTicks;
    state.progression.totalXpEarnedTicks += creditedTicks;

    const isFullNow = state.progression.totalXpEarnedTicks >= finalTargetTicks;

    if (creditedTicks > 0) {
      evaluateMedalUnlocks(state);
    }

    return { creditedTicks, isFullNow, wasFullBefore };
  }

  const reqTicks = getRequiredXpTicksForTransition(currentRankIndex);
  const currentTicks = state.progression.xpIntoCurrentRankTicks;
  const remainingTicks = Math.max(0, reqTicks - currentTicks);
  const wasFullBefore = currentTicks >= reqTicks;

  // STRICT CAP: Only add up to remainingTicks. Any excess is DISCARDED completely!
  const creditedTicks = Math.min(earnedTicks, remainingTicks);

  state.progression.xpIntoCurrentRankTicks += creditedTicks;
  state.progression.totalXpEarnedTicks += creditedTicks;

  const isFullNow = state.progression.xpIntoCurrentRankTicks >= reqTicks;

  if (creditedTicks > 0) {
    evaluateMedalUnlocks(state);
  }

  return { creditedTicks, isFullNow, wasFullBefore };
}

/**
 * Settles accumulated XP between state.time.lastSettledAt and nowEpochMs.
 * ALWAYS updates state.time.lastSettledAt = nowEpochMs.
 */
export function settleEarning(
  state: GameState,
  nowEpochMs: number,
  mode: EarningMode
): { creditedTicks: number; elapsedMs: number; reportData?: DelegationReportData } {
  const previousSettledAt = state.time.lastSettledAt;
  const elapsedMs = Math.max(0, nowEpochMs - previousSettledAt);

  state.time.currentEarningMode = mode;

  // Do not earn if pending ceremony
  const isCeremonyPending = !!state.ui.pendingPromotionCeremony;

  const previousXpTicks = state.progression.xpIntoCurrentRankTicks;
  const wasFullBefore = isXpBarFull(state);

  let earnedTicks = 0;
  if (!isCeremonyPending && elapsedMs > 0) {
    const res = settleEnergyAndXp(state, previousSettledAt, nowEpochMs, mode);
    earnedTicks = res.earnedTicks;
  } else {
    ensureEnergyState(state, nowEpochMs);
  }

  const creditedTicks = earnedTicks;
  const isFullNow = isXpBarFull(state);

  // ALWAYS update lastSettledAt to nowEpochMs to prevent backlog accumulation!
  state.time.lastSettledAt = nowEpochMs;

  // Settle farm crops/eggs real-time
  if (state.farm) {
    settleFarmState(state.farm, nowEpochMs);
  }

  // Track total time stats and recent activity buckets (only when actively earning before 100% cap)
  if (!isCeremonyPending && !wasFullBefore && elapsedMs > 0) {
    recordRecentEarningActivity(state, elapsedMs, mode, nowEpochMs);
  }

  // Generate delegation report (BÁO CÁO TRỞ LẠI)
  let reportData: DelegationReportData | undefined = undefined;
  const currentRank = getCurrentRank(state.progression.currentRankIndex);
  const reqXp = getRequiredXpForTransition(state.progression.currentRankIndex);

  // 1. Calculate farm aggregate metrics
  const farm = state.farm;
  const readyCropCount = farm && farm.plots
    ? farm.plots.filter((p) => p.status === "ready").length
    : 0;
  const pendingWateringCount = farm && farm.plots
    ? farm.plots.reduce((sum, p) => sum + getPendingWateringCount(p, nowEpochMs), 0)
    : 0;
  const growingCropCount = farm && farm.plots
    ? farm.plots.filter((p) => p.status === "growing").length
    : 0;
  const eggInventoryTotal = farm && farm.inventory && farm.inventory.eggs
    ? Object.values(farm.inventory.eggs).reduce((a, b) => a + (b || 0), 0)
    : 0;
  const feedEmpty = farm && farm.penAnimals && farm.penAnimals.length > 0
    ? (farm.penFeedBuffValue || 0) <= 0
    : false;

  // 2. Evaluate medals unlocked during offline
  const newlyUnlockedIds = evaluateMedalUnlocks(state);
  const newlyUnlockedMedals: NewlyUnlockedMedalInfo[] = newlyUnlockedIds.map((id) => {
    const def = MEDAL_CATALOG.find((m) => m.id === id);
    return {
      id,
      name: def ? def.name : id,
      description: def ? def.conditionHint : "",
      iconSymbol: def ? def.iconSymbol : "🎖️",
    };
  });

  // 3. Check display threshold rules
  const TEN_MINS_MS = 600_000;
  const ONE_HOUR_MS = 3_600_000;

  const hasNotableEvent =
    isFullNow ||
    wasFullBefore ||
    readyCropCount > 0 ||
    pendingWateringCount > 0 ||
    eggInventoryTotal > 0 ||
    newlyUnlockedMedals.length > 0;

  const hasMeaningfulData =
    creditedTicks > 0 ||
    isFullNow ||
    wasFullBefore ||
    readyCropCount > 0 ||
    pendingWateringCount > 0 ||
    growingCropCount > 0 ||
    eggInventoryTotal > 0 ||
    feedEmpty ||
    newlyUnlockedMedals.length > 0;

  let shouldShowReport = false;
  if (mode === "delegation") {
    if (elapsedMs >= ONE_HOUR_MS) {
      shouldShowReport = hasMeaningfulData;
    } else if (elapsedMs >= TEN_MINS_MS) {
      shouldShowReport = hasNotableEvent;
    }
  }

  const reportId = `report_${previousSettledAt}_${nowEpochMs}`;
  if (state.ui.lastSeenDelegationReportAt === reportId) {
    shouldShowReport = false;
  }

  if (shouldShowReport) {
    let topPriority: DelegationReportData["topPriority"] = "continue";
    if (isFullNow || wasFullBefore) {
      topPriority = "xp_full";
    } else if (pendingWateringCount > 0) {
      topPriority = "watering";
    } else if (readyCropCount > 0) {
      topPriority = "harvest";
    } else if (eggInventoryTotal > 0) {
      topPriority = "animal_egg";
    } else if (newlyUnlockedMedals.length > 0) {
      topPriority = "medals";
    } else {
      topPriority = "continue";
    }

    reportData = {
      id: reportId,
      elapsedMs,
      earnedXp: Math.floor(creditedTicks / gameConfig.xpTicksPerXp),
      previousXp: Math.floor(previousXpTicks / gameConfig.xpTicksPerXp),
      newXp: Math.floor(state.progression.xpIntoCurrentRankTicks / gameConfig.xpTicksPerXp),
      requiredXp: reqXp,
      isFullNow,
      wasFullBefore,
      currentRankName: currentRank.displayName,
      readyCropCount,
      pendingWateringCount,
      growingCropCount,
      eggInventoryTotal,
      feedEmpty,
      newlyUnlockedMedals,
      topPriority,
    };
  }

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

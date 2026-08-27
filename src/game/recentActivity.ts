import { EarningActivityBucket, GameState } from "./types";
import { gameConfig } from "./config";

export const ETA_RECENT_WINDOW_DAYS = 7;
export const ETA_MINIMUM_SAMPLE_MS = 30 * 60 * 1_000; // 30 mins
export const ETA_REFRESH_INTERVAL_MS = 60 * 1_000; // 60s

export function getUtcDayKey(timestampMs: number): string {
  const date = new Date(timestampMs);
  return date.toISOString().split("T")[0];
}

export function recordRecentEarningActivity(
  state: GameState,
  durationMs: number,
  mode: "direct_online" | "delegation",
  nowMs: number
): void {
  if (durationMs <= 0) return;

  if (!state.time.recentEarningActivity) {
    state.time.recentEarningActivity = [];
  }

  const dayKey = getUtcDayKey(nowMs);
  let bucket = state.time.recentEarningActivity.find((b) => b.dayKeyUtc === dayKey);

  if (!bucket) {
    bucket = { dayKeyUtc: dayKey, directOnlineMs: 0, delegationMs: 0 };
    state.time.recentEarningActivity.push(bucket);
  }

  if (mode === "direct_online") {
    bucket.directOnlineMs += durationMs;
    state.time.directOnlineTimeMs = (state.time.directOnlineTimeMs || 0) + durationMs;
  } else {
    bucket.delegationMs += durationMs;
    state.time.delegationTimeMs = (state.time.delegationTimeMs || 0) + durationMs;
  }

  pruneRecentEarningActivity(state, nowMs);
}

export function pruneRecentEarningActivity(state: GameState, nowMs: number): void {
  if (!state.time.recentEarningActivity) {
    state.time.recentEarningActivity = [];
    return;
  }

  const cutoffDate = new Date(nowMs);
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - ETA_RECENT_WINDOW_DAYS);
  const cutoffKey = cutoffDate.toISOString().split("T")[0];

  state.time.recentEarningActivity = state.time.recentEarningActivity.filter(
    (b) => b.dayKeyUtc >= cutoffKey
  );
}

export function getRecentEarningMix(
  state: GameState,
  nowMs: number
): {
  directOnlineMs: number;
  delegationMs: number;
  totalMs: number;
  onlineRatio: number;
  sourceLabel: "7_day" | "lifetime" | "initial_fallback";
} {
  pruneRecentEarningActivity(state, nowMs);

  const buckets = state.time.recentEarningActivity || [];
  let recentDirect = 0;
  let recentDelegation = 0;

  for (const b of buckets) {
    recentDirect += b.directOnlineMs || 0;
    recentDelegation += b.delegationMs || 0;
  }

  const recentTotal = recentDirect + recentDelegation;

  if (recentTotal >= ETA_MINIMUM_SAMPLE_MS) {
    return {
      directOnlineMs: recentDirect,
      delegationMs: recentDelegation,
      totalMs: recentTotal,
      onlineRatio: recentDirect / recentTotal,
      sourceLabel: "7_day",
    };
  }

  const lifetimeDirect = state.time.directOnlineTimeMs || 0;
  const lifetimeDelegation = state.time.delegationTimeMs || 0;
  const lifetimeTotal = lifetimeDirect + lifetimeDelegation;

  if (lifetimeTotal >= ETA_MINIMUM_SAMPLE_MS) {
    return {
      directOnlineMs: lifetimeDirect,
      delegationMs: lifetimeDelegation,
      totalMs: lifetimeTotal,
      onlineRatio: lifetimeDirect / lifetimeTotal,
      sourceLabel: "lifetime",
    };
  }

  return {
    directOnlineMs: 0,
    delegationMs: 0,
    totalMs: 0,
    onlineRatio: 0, // Fallback to 1.0x delegation rate
    sourceLabel: "initial_fallback",
  };
}

export function getEstimatedEarningRate(
  state: GameState,
  nowMs: number
): {
  xpTicksPerMs: number;
  sourceLabel: "7_day" | "lifetime" | "initial_fallback";
  onlineRatio: number;
} {
  const mix = getRecentEarningMix(state, nowMs);

  const directRate = gameConfig.directOnlineXpTicksPerMs;
  const delegationRate = gameConfig.delegationXpTicksPerMs;

  const xpTicksPerMs =
    delegationRate + mix.onlineRatio * (directRate - delegationRate);

  return {
    xpTicksPerMs,
    sourceLabel: mix.sourceLabel,
    onlineRatio: mix.onlineRatio,
  };
}

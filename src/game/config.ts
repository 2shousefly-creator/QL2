export const gameConfig = {
  schemaVersion: 11,
  catalogVersion: 18,
  rankLayoutVersion: 24,
  xpTicksPerXp: 600_000,
  delegationXpTicksPerMs: 10,
  directOnlineXpTicksPerMs: 10,
  saveHeartbeatMs: 30_000,
  connectivityHeartbeatMs: 3_000,
  connectivityTimeoutMs: 5_000,
  connectivityGraceMs: 7_000,
  minorPromotionChallengeMs: 2 * 60 * 1_000, // 120,000 ms (2 mins)
  majorPromotionChallengeMs: 90_000,
  bubbleSpawnIntervalMs: 3_000,
  bubbleLifetimeMs: 1_000,
  bubbleRewardReductionMs: 1_000, // -1 second
  bubbleMinPerWave: 1,
  bubbleMaxPerWave: 3,
  offlineCapMinutes: null,
  xpCurve: {
    base: 60,
    linear: 12,
    quadratic: 0.7,
  },
} as const;

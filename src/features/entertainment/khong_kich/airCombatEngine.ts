import { AIR_COMBAT_REWARD_CONFIG, AIR_COMBAT_RANK_ORDER, CORE_TIER_LABELS, GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import type { AirCombatProfile, AirCombatRank, AirCombatReward, AirCombatRunSummary, CoreTier, EnemyType, GameplaySafeRect } from "./airCombatTypes";
import { isElite } from "./airCombatWaves";
export * from "./airCombatAircraft";
export * from "./airCombatCoreSelection";

export function clampCircleToGameplayRect(
  x: number,
  y: number,
  radius: number,
  rect: GameplaySafeRect = GAMEPLAY_SAFE_RECT
): { x: number; y: number } {
  return {
    x: Math.max(rect.left + radius, Math.min(rect.right - radius, x)),
    y: Math.max(rect.top + radius, Math.min(rect.bottom - radius, y)),
  };
}

export function getTargetPriority(type: EnemyType): number {
  return type === "boss" ? 0 : isElite(type) ? 1 : 3;
}

export function getComboMultiplier(comboKills: number): 1 | 2 | 3 | 5 {
  if (comboKills >= 50) return 5;
  if (comboKills >= 25) return 3;
  if (comboKills >= 10) return 2;
  return 1;
}

export function calculateRunRank(summary: Omit<AirCombatRunSummary, "rank">): AirCombatRank {
  let points = summary.bossDefeated ? 45 : 0;
  points += Math.min(25, summary.score / 2200);
  points += Math.min(15, summary.maxCombo / 3);
  points += Math.max(0, 15 - summary.hitsReceived * 1.5);
  if (summary.bossDefeated && summary.bossClearSeconds !== null) {
    points += Math.max(0, Math.min(10, (100 - summary.bossClearSeconds) / 4));
  }
  if (points >= 91) return "SS";
  if (points >= 78) return "S";
  if (points >= 62) return "A";
  if (points >= 42) return "B";
  return "C";
}

export function normalizeAircraftStat(
  stat: "hp" | "armor" | "firepower" | "fireRate" | "resource",
  value: number
): number {
  const caps = {
    hp: 2300,
    armor: 90,
    firepower: 180,
    fireRate: 6,
    resource: 180,
  };
  return Math.min(100, Math.max(3, Math.round((Math.max(0, value) / caps[stat]) * 100)));
}

export function createDefaultAirCombatProfile(): AirCombatProfile {
  return {
    version: 2,
    campaign: { version: 1, highestStageCleared: 0, lastSelectedStage: 1 },
    highScore: 0,
    highestCombo: 0,
    totalRuns: 0,
    bossClears: 0,
    bestRank: "C",
    bestBossClearSeconds: null,
    preferredAircraft: "black_eagle",
    lastRewardDate: "",
    rewardedRunsToday: 0,
    goldRewardedToday: 0,
    xpRewardedToday: 0,
  };
}

function betterRank(a: AirCombatRank, b: AirCombatRank): AirCombatRank {
  return AIR_COMBAT_RANK_ORDER.indexOf(a) >= AIR_COMBAT_RANK_ORDER.indexOf(b) ? a : b;
}

export function calculateRunReward(
  summary: AirCombatRunSummary,
  profile: AirCombatProfile,
  dateKey: string
): { reward: AirCombatReward; nextProfile: AirCombatProfile } {
  const isSameDay = profile.lastRewardDate === dateKey;
  const rewardedRunsToday = isSameDay ? profile.rewardedRunsToday : 0;
  const goldRewardedToday = isSameDay ? profile.goldRewardedToday : 0;
  const xpRewardedToday = isSameDay ? profile.xpRewardedToday : 0;
  const rewardRate = AIR_COMBAT_REWARD_CONFIG.rewardRates[
    Math.min(rewardedRunsToday, AIR_COMBAT_REWARD_CONFIG.rewardRates.length - 1)
  ];
  const rankIndex = AIR_COMBAT_RANK_ORDER.indexOf(summary.rank);
  const rawGold = Math.min(
    AIR_COMBAT_REWARD_CONFIG.maxGoldPerRun,
    1 + Math.floor(summary.enemiesDefeated / 25) + (summary.bossDefeated ? 2 : 0) + Math.floor(rankIndex / 2)
  );
  const rawXp = Math.min(
    AIR_COMBAT_REWARD_CONFIG.maxXpPerRun,
    1 + Math.floor(summary.survivalSeconds / 100) + (summary.bossDefeated ? 1 : 0)
  );
  const gold = Math.min(
    Math.floor(rawGold * rewardRate),
    Math.max(0, AIR_COMBAT_REWARD_CONFIG.dailyGoldCap - goldRewardedToday)
  );
  const xp = Math.min(
    Math.floor(rawXp * rewardRate),
    Math.max(0, AIR_COMBAT_REWARD_CONFIG.dailyXpCap - xpRewardedToday)
  );
  const nextProfile: AirCombatProfile = {
    ...profile,
    version: 2,
    highScore: Math.max(profile.highScore, summary.score),
    highestCombo: Math.max(profile.highestCombo, summary.maxCombo),
    totalRuns: profile.totalRuns + 1,
    bossClears: profile.bossClears + (summary.bossDefeated ? 1 : 0),
    bestRank: betterRank(profile.bestRank, summary.rank),
    bestBossClearSeconds:
      summary.bossClearSeconds === null
        ? profile.bestBossClearSeconds
        : profile.bestBossClearSeconds === null
          ? summary.bossClearSeconds
          : Math.min(profile.bestBossClearSeconds, summary.bossClearSeconds),
    preferredAircraft: summary.aircraftId,
    lastRewardDate: dateKey,
    rewardedRunsToday: rewardedRunsToday + 1,
    goldRewardedToday: goldRewardedToday + gold,
    xpRewardedToday: xpRewardedToday + xp,
  };
  return {
    reward: {
      gold,
      xp,
      rewardRate,
      dailyCapReached:
        nextProfile.goldRewardedToday >= AIR_COMBAT_REWARD_CONFIG.dailyGoldCap &&
        nextProfile.xpRewardedToday >= AIR_COMBAT_REWARD_CONFIG.dailyXpCap,
    },
    nextProfile,
  };
}

export function coreTierLabel(tier: CoreTier): string {
  return CORE_TIER_LABELS[tier];
}

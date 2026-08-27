import { TANK_BATTLE_RANK_ORDER } from "./tankBattleConfig";
import { createDefaultTankBattleProfile } from "./tankBattleEngine";
import { TankBattleProfile, TankBattleRank } from "./tankBattleTypes";

const STORAGE_KEY = "quan_lo_tank_battle_v1";

export function loadTankBattleProfile(): TankBattleProfile {
  if (typeof window === "undefined") return createDefaultTankBattleProfile();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") return createDefaultTankBattleProfile();
    const rank = String(parsed.bestRank || "C") as TankBattleRank;
    const bossTime = Number(parsed.bestBossClearSeconds);
    return {
      version: 1,
      highScore: Math.max(0, Number(parsed.highScore) || 0),
      bestRank: TANK_BATTLE_RANK_ORDER.includes(rank) ? rank : "C",
      bestBossClearSeconds:
        Number.isFinite(bossTime) && bossTime > 0 ? bossTime : null,
      bestAccuracy: Math.min(1, Math.max(0, Number(parsed.bestAccuracy) || 0)),
      totalRuns: Math.max(0, Number(parsed.totalRuns) || 0),
      bossClears: Math.max(0, Number(parsed.bossClears) || 0),
      tutorialSeen: Boolean(parsed.tutorialSeen),
      aimAssistEnabled: parsed.aimAssistEnabled !== false,
      lastRewardDate: String(parsed.lastRewardDate || ""),
      rewardedRunsToday: Math.max(0, Number(parsed.rewardedRunsToday) || 0),
      goldRewardedToday: Math.max(0, Number(parsed.goldRewardedToday) || 0),
      xpRewardedToday: Math.max(0, Number(parsed.xpRewardedToday) || 0),
    };
  } catch {
    return createDefaultTankBattleProfile();
  }
}

export function saveTankBattleProfile(profile: TankBattleProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Private/full storage must never block the result flow.
  }
}

export function getTankBattleRewardDateKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

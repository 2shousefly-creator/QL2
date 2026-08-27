import { createDefaultAirCombatProfile } from "./airCombatEngine";
import { AIRCRAFT_CONFIGS, AIR_COMBAT_RANK_ORDER } from "./airCombatConfig";
import { AirCombatProfile, AirCombatRank, AircraftId } from "./airCombatTypes";

const STORAGE_KEY = "quan_lo_air_combat_v1";

export function loadAirCombatProfile(): AirCombatProfile {
  if (typeof window === "undefined") return createDefaultAirCombatProfile();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") return createDefaultAirCombatProfile();
    const preferredAircraft = String(parsed.preferredAircraft || "black_eagle") as AircraftId;
    const parsedRank = String(parsed.bestRank || "C") as AirCombatRank;
    const bestBossClearSeconds = Number(parsed.bestBossClearSeconds);
    return {
      version: 2,
      highScore: Math.max(0, Number(parsed.highScore) || 0),
      highestCombo: Math.max(0, Number(parsed.highestCombo) || 0),
      totalRuns: Math.max(0, Number(parsed.totalRuns) || 0),
      bossClears: Math.max(0, Number(parsed.bossClears) || 0),
      bestRank: AIR_COMBAT_RANK_ORDER.includes(parsedRank) ? parsedRank : "C",
      bestBossClearSeconds:
        Number.isFinite(bestBossClearSeconds) && bestBossClearSeconds > 0
          ? bestBossClearSeconds
          : null,
      preferredAircraft: Object.prototype.hasOwnProperty.call(AIRCRAFT_CONFIGS, preferredAircraft)
        ? preferredAircraft
        : "black_eagle",
      lastRewardDate: String(parsed.lastRewardDate || ""),
      rewardedRunsToday: Math.max(0, Number(parsed.rewardedRunsToday) || 0),
      goldRewardedToday: Math.max(0, Number(parsed.goldRewardedToday) || 0),
      xpRewardedToday: Math.max(0, Number(parsed.xpRewardedToday) || 0),
    };
  } catch {
    return createDefaultAirCombatProfile();
  }
}

export function saveAirCombatProfile(profile: AirCombatProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // A full/private storage area must never block the result screen.
  }
}

export function getLocalRewardDateKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

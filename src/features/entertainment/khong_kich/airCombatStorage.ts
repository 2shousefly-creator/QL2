import { normalizeCampaign, canLaunchStage } from "./airCombatStages";
import { createDefaultAirCombatProfile, calculateRunReward } from "./airCombatEngine";
import { AIRCRAFT_CONFIGS, AIR_COMBAT_RANK_ORDER } from "./airCombatConfig";
import { AirCombatProfile, AirCombatRank, AircraftId, AirCombatRunSummary } from "./airCombatTypes";

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
      campaign: normalizeCampaign(parsed.campaign, Number.isFinite(parsed.bossClears) ? parsed.bossClears : 0),
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
    const stored = loadAirCombatProfile();
    profile.campaign = normalizeCampaign(profile.campaign);
    profile.campaign.highestStageCleared = Math.max(profile.campaign.highestStageCleared, stored.campaign.highestStageCleared);
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

/** Controller guard is also called by runtime construction, beyond disabled UI controls. */
export function assertStageLaunch(stageId: number): void {
  if (!canLaunchStage(stageId, loadAirCombatProfile().campaign)) throw new Error("Chiến trường chưa thể xuất kích.");
}

export function persistStageVictory(stageId: number): boolean {
  const profile = loadAirCombatProfile();
  if (!canLaunchStage(stageId, profile.campaign)) return false;
  const firstClear = profile.campaign.highestStageCleared < stageId;
  profile.campaign.highestStageCleared = Math.max(profile.campaign.highestStageCleared, stageId);
  saveAirCombatProfile(profile);
  return firstClear;
}

/** Persist the confirmed result before React can expose Results/Next Stage.
 * UI never owns progression arithmetic; old-stage replay is monotonic. */
export function settleAirCombatRun(summary: AirCombatRunSummary) {
  const profile = loadAirCombatProfile();
  const { reward, nextProfile } = calculateRunReward(summary, profile, getLocalRewardDateKey());
  const validVictory = summary.stageVictory && summary.bossDefeated && canLaunchStage(summary.stageId, profile.campaign);
  const firstClear = validVictory && summary.stageFirstClear;
  nextProfile.campaign = { ...profile.campaign, highestStageCleared: validVictory
    ? Math.max(profile.campaign.highestStageCleared, summary.stageId) : profile.campaign.highestStageCleared };
  saveAirCombatProfile(nextProfile);
  return { reward, nextProfile, previousHighScore: profile.highScore, firstClear };
}

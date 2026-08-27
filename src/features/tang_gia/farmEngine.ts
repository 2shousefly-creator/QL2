import { RANK_STEPS } from "../../game/rankBuilder";
import { RANK_FAMILIES } from "../../game/rankFamilies";
import { BadgeDefinition, RankStep } from "../../game/types";
import {
  ANIMAL_CATALOG,
  CROP_CATALOG,
  FEED_CATALOG,
  FERTILIZER_CATALOG,
  FARM_PLOT_UNLOCKS,
  EGG_INFO_MAP,
} from "./farmCatalog";
import {
  AnimalTypeId,
  CropId,
  EggTypeId,
  FeedTypeId,
  FertilizerTypeId,
  FarmPlotState,
  FarmSaveState,
  PenAnimalState,
  RankIdentity,
  WateringStageStatus,
  PlotWateringInfo,
  WeatherType,
  DayNightPhase,
  WeatherExposureData,
  ItemQuality,
  QualityBreakdown,
  EggQualityInventory,
  EggQualitySlotData,
  AnimalDeathCause,
  AnimalDeathNotificationSummary,
} from "./farmTypes";
import {
  getLivingAnimalCount,
  getNormalTroughDurationMs,
  getStarvationDeadlineAt,
  isAnimalDead,
} from "./animalLifecycle";
import {
  createDefaultEggQualityInventory,
  DEFAULT_FARM_WEATHER_SEED,
} from "./farmMigration";

export { createDefaultEggQualityInventory } from "./farmMigration";
import {
  deterministicRandom,
  getCropQualityRandom,
  getEggQualityRandom,
} from "./deterministicRandom";

/**
 * Creates an empty quality breakdown record with 0 quantity, 0 gold, 0 xp for all 4 tiers.
 */
export function createEmptyQualityBreakdown(): QualityBreakdown {
  return {
    thuong: {
      quantity: 0,
      baseGold: 0,
      qualityBonusGold: 0,
      gold: 0,
      baseXp: 0,
      qualityBonusXp: 0,
      xp: 0,
    },
    tot: {
      quantity: 0,
      baseGold: 0,
      qualityBonusGold: 0,
      gold: 0,
      baseXp: 0,
      qualityBonusXp: 0,
      xp: 0,
    },
    hiem: {
      quantity: 0,
      baseGold: 0,
      qualityBonusGold: 0,
      gold: 0,
      baseXp: 0,
      qualityBonusXp: 0,
      xp: 0,
    },
    hoan_my: {
      quantity: 0,
      baseGold: 0,
      qualityBonusGold: 0,
      gold: 0,
      baseXp: 0,
      qualityBonusXp: 0,
      xp: 0,
    },
  };
}

/**
 * Applies a quality multiplier while keeping farm rewards integer-valued.
 * A quality above Thường always grants at least one extra unit so a small
 * reward (for example 3 XP × 1.1) cannot round back to its base value.
 */
export function applyQualityMultiplier(
  baseValue: number,
  multiplier: number
): number {
  const normalizedBase = Math.max(0, Math.round(baseValue));
  const multipliedValue = Math.max(
    0,
    Math.round(normalizedBase * multiplier)
  );

  if (normalizedBase > 0 && multiplier > 1) {
    return Math.max(normalizedBase + 1, multipliedValue);
  }

  return multipliedValue;
}

import {
  calculateCropGrowthSchedule,
  checkRainInTimeRange,
  getCanonicalWeatherSlot,
  getDayNightPhase,
  getWeatherAt,
  getWeatherForSlot,
  WEATHER_METADATA,
  QUALITY_CONFIG,
  getQualityProbabilities,
  rollQualityWithExposure,
  calculateWeatherExposure,
  calculateNextEggCycle,
} from "./weatherEngine";

/**
 * Calculates the exact completion time for an egg cycle (or remaining work),
 * given the start time, base work needed (in ms), buff expiration timestamp, and speed bonus percent.
 *
 * Piecewise formula:
 * - In the interval [fromTimeMs, min(fromTimeMs + needed, buffExpiresAt)]: rate = 1 + bonus/100
 * - In the interval after buffExpiresAt: rate = 1.0
 */
export function computeEggCompletionTime(
  fromTimeMs: number,
  baseWorkNeededMs: number,
  buffExpiresAtMs: number,
  speedBonusPercent: number
): number {
  if (baseWorkNeededMs <= 0) return fromTimeMs;

  const multiplier = speedBonusPercent > 0 ? 1 + speedBonusPercent / 100 : 1.0;
  const buffDurationMs = Math.max(0, buffExpiresAtMs - fromTimeMs);

  if (buffDurationMs <= 0 || multiplier <= 1.0) {
    // No buff active in this window
    return fromTimeMs + Math.round(baseWorkNeededMs);
  }

  // Maximum base work that can be accomplished during the active buff window
  const maxBuffWorkMs = buffDurationMs * multiplier;

  if (baseWorkNeededMs <= maxBuffWorkMs) {
    // Entire remaining work completes while buff is active
    const timeNeededMs = Math.round(baseWorkNeededMs / multiplier);
    return fromTimeMs + timeNeededMs;
  } else {
    // Buff expires mid-cycle; remaining work completes at base speed (1.0)
    const remainingBaseWorkMs = baseWorkNeededMs - maxBuffWorkMs;
    const timeNeededMs = buffDurationMs + Math.round(remainingBaseWorkMs);
    return fromTimeMs + timeNeededMs;
  }
}

/**
 * Computes how much base work (in milliseconds) was completed in the interval [fromTimeMs, toTimeMs],
 * given buff expiration time and speed bonus percent.
 */
export function computeBaseWorkDone(
  fromTimeMs: number,
  toTimeMs: number,
  buffExpiresAtMs: number,
  speedBonusPercent: number,
  maxBaseWorkMs?: number
): number {
  if (toTimeMs <= fromTimeMs) return 0;

  const multiplier = speedBonusPercent > 0 ? 1 + speedBonusPercent / 100 : 1.0;
  
  // Buff overlap with [fromTimeMs, toTimeMs]
  const buffStart = fromTimeMs;
  const buffEnd = Math.min(toTimeMs, Math.max(fromTimeMs, buffExpiresAtMs));
  const buffDurationMs = Math.max(0, buffEnd - buffStart);
  
  const normalDurationMs = Math.max(0, toTimeMs - Math.max(fromTimeMs, buffExpiresAtMs));

  const workDoneMs = (buffDurationMs * multiplier) + (normalDurationMs * 1.0);
  
  if (maxBaseWorkMs !== undefined) {
    return Math.min(maxBaseWorkMs, workDoneMs);
  }
  return workDoneMs;
}

export {
  calculateCropGrowthSchedule,
  checkRainInTimeRange,
  getCanonicalWeatherSlot,
  getDayNightPhase,
  getWeatherAt,
  getWeatherForSlot,
  WEATHER_METADATA,
  QUALITY_CONFIG,
  getQualityProbabilities,
  rollQualityWithExposure,
  calculateWeatherExposure,
  calculateNextEggCycle,
};

const RANK_FAMILY_ALIAS_MAP: Record<string, string> = {
  hoc_vien: "academy",
  binh_bet: "enlisted_1",
  binh_nhi: "enlisted_2",
  binh_nhat: "enlisted_3",
  ha_si: "nco_1",
  trung_si: "nco_2",
  thuong_si: "nco_3",
  thieu_uy: "junior_1",
  trung_uy: "junior_2",
  thuong_uy: "junior_3",
  dai_uy: "junior_4",
  thieu_ta: "field_1",
  trung_ta: "field_2",
  thuong_ta: "field_3",
  dai_ta: "field_4",
  thieu_tuong: "general_1",
  trung_tuong: "general_2",
  thuong_tuong: "general_3",
  dai_tuong: "general_4",
  thong_soai: "endgame_1",
  nguyen_soai: "endgame_2",
  dai_nguyen_soai: "endgame_3",
  tong_tu_lenh: "endgame_4",
};

/**
 * Checks if current player rank is at least equal to requiredRank.
 */
export function rankAtLeast(
  currentRank: RankStep,
  requiredRank: RankIdentity | null
): boolean {
  if (!requiredRank) return true;

  const targetFamilyId =
    RANK_FAMILY_ALIAS_MAP[requiredRank.familyId] || requiredRank.familyId;

  const targetStep = RANK_STEPS.find((step) => {
    if (step.familyId !== targetFamilyId) return false;
    if (requiredRank.tier === null) return true;
    return step.tier === requiredRank.tier;
  });

  if (!targetStep) {
    if (targetFamilyId === "academy") return true;
    return false;
  }

  return currentRank.rankIndex >= targetStep.rankIndex;
}

/**
 * Gets human readable rank name for required rank.
 */
export function getRankNameForDisplay(
  requiredRank: RankIdentity | null
): string {
  if (!requiredRank) return "Tự do";
  const targetFamilyId =
    RANK_FAMILY_ALIAS_MAP[requiredRank.familyId] || requiredRank.familyId;

  const step = RANK_STEPS.find((s) => {
    if (s.familyId !== targetFamilyId) return false;
    if (requiredRank.tier === null) return true;
    return s.tier === requiredRank.tier;
  });

  return step ? step.displayName : requiredRank.familyId;
}

/**
 * Gets BadgeDefinition for a required rank.
 */
export function getRankBadgeDefinition(
  requiredRank: RankIdentity | null
): BadgeDefinition | null {
  if (!requiredRank) return null;
  const targetFamilyId =
    RANK_FAMILY_ALIAS_MAP[requiredRank.familyId] || requiredRank.familyId;
  const family = RANK_FAMILIES.find((f) => f.id === targetFamilyId);
  return family ? family.badge : null;
}

/**
 * Gets animal pen capacity based on player rank.
 * Default: 1
 * Binh Nhat 1: max 2
 * Trung Si 1: max 3
 * Thieu Uy 1: max 4
 * Thieu Ta 1: max 5
 */
export function getAnimalCapacity(currentRank: RankStep): number {
  if (rankAtLeast(currentRank, { familyId: "thieu_ta", tier: 1 })) return 5;
  if (rankAtLeast(currentRank, { familyId: "thieu_uy", tier: 1 })) return 4;
  if (rankAtLeast(currentRank, { familyId: "trung_si", tier: 1 })) return 3;
  if (rankAtLeast(currentRank, { familyId: "binh_nhat", tier: 1 })) return 2;
  return 1;
}

/**
 * Creates default initial egg quality inventory.
 */
/**
 * Ensures egg quality inventory is valid and backward-compatible with legacy saves.
 */
export function ensureEggQualityInventory(farm: FarmSaveState): EggQualityInventory {
  if (!farm.eggQualityInventory) {
    farm.eggQualityInventory = createDefaultEggQualityInventory();
  }

  (Object.keys(EGG_INFO_MAP) as EggTypeId[]).forEach((eggType) => {
    if (!farm.eggQualityInventory![eggType]) {
      farm.eggQualityInventory![eggType] = {
        thuong: { count: 0, rainGoldBonus: 0 },
        tot: { count: 0, rainGoldBonus: 0 },
        hiem: { count: 0, rainGoldBonus: 0 },
        hoan_my: { count: 0, rainGoldBonus: 0 },
      };
    }

    const slot = farm.eggQualityInventory![eggType];
    const recordedTotal =
      (slot.thuong?.count || 0) +
      (slot.tot?.count || 0) +
      (slot.hiem?.count || 0) +
      (slot.hoan_my?.count || 0);

    const inventoryTotal = farm.inventory?.eggs?.[eggType] || 0;

    // Backward-compatibility: if inventory has eggs not tracked in quality slots, assign to 'thuong'
    if (inventoryTotal > recordedTotal) {
      if (!slot.thuong) slot.thuong = { count: 0, rainGoldBonus: 0 };
      slot.thuong.count += inventoryTotal - recordedTotal;
    } else if (recordedTotal > inventoryTotal) {
      if (!farm.inventory.eggs) farm.inventory.eggs = {} as any;
      farm.inventory.eggs[eggType] = recordedTotal;
    }
  });

  return farm.eggQualityInventory;
}

/**
 * Creates default initial farm save state for Tăng Gia 2.0.
 */
export function createDefaultFarmState(now: number = Date.now()): FarmSaveState {
  return {
    schemaVersion: 5,
    gold: 30,
    inventory: {
      seeds: {
        carrot: 0,
        cabbage: 0,
        potato: 0,
        tomato: 0,
        strawberry: 0,
        corn: 0,
        pumpkin: 0,
        watermelon: 0,
        pineapple: 0,
        banana: 0,
        orange: 0,
        mango: 0,
        apple: 0,
        pear: 0,
        grape: 0,
        dragon_fruit: 0,
        avocado: 0,
        durian: 0,
        mangosteen: 0,
      },
      animals: {
        chicken: 0,
        duck: 0,
        quail: 0,
        goose: 0,
        muscovy_duck: 0,
        turkey: 0,
        guinea_fowl: 0,
        pheasant: 0,
        peafowl: 0,
        ostrich: 0,
      },
      feed: {
        feed_normal: 0,
        feed_good: 0,
        feed_super: 0,
      },
      fertilizer: {
        fertilizer_nutrition_normal: 0,
        fertilizer_growth_normal: 0,
        fertilizer_nutrition_medium: 0,
        fertilizer_growth_medium: 0,
        fertilizer_nutrition_good: 0,
        fertilizer_growth_good: 0,
        fertilizer_nutrition_super: 0,
        fertilizer_growth_super: 0,
        fertilizer_premium_3: 0,
        fertilizer_premium_2: 0,
        fertilizer_premium_1: 0,
      },
      eggs: {
        chicken_egg: 0,
        duck_egg: 0,
        quail_egg: 0,
        goose_egg: 0,
        muscovy_duck_egg: 0,
        turkey_egg: 0,
        guinea_fowl_egg: 0,
        pheasant_egg: 0,
        peafowl_egg: 0,
        ostrich_egg: 0,
      },
    },
    unlockedPlotCount: 2, // Plots 1 and 2 unlocked by default
    plots: [
      { status: "empty" },
      { status: "empty" },
      { status: "locked" },
      { status: "locked" },
      { status: "locked" },
      { status: "locked" },
      { status: "locked" },
      { status: "locked" },
      { status: "locked" },
    ],
    penAnimals: [],
    penFeedBuffValue: 0,
    penFeedBuffUpdatedAt: now,
    penStarvationStartedAt: null,
    pendingAnimalDeathNotification: null,
    lastSettledAt: now,
    weatherSeed: 133742,
    eggQualityInventory: createDefaultEggQualityInventory(),
  };
}

export interface FarmSettlementResult {
  newDeaths: AnimalDeathNotificationSummary;
  queuedOfflineDeathNotification: boolean;
}

const OFFLINE_DEATH_NOTICE_THRESHOLD_MS = 5_000;
const MAX_OFFLINE_EGG_PRODUCTION_MS = 48 * 60 * 60 * 1000;

function createEmptyAnimalDeathSummary(): AnimalDeathNotificationSummary {
  return { total: 0, oldAge: 0, starvation: 0 };
}

function mergeAnimalDeathSummary(
  current: AnimalDeathNotificationSummary | null | undefined,
  added: AnimalDeathNotificationSummary
): AnimalDeathNotificationSummary {
  return {
    total: (current?.total ?? 0) + added.total,
    oldAge: (current?.oldAge ?? 0) + added.oldAge,
    starvation: (current?.starvation ?? 0) + added.starvation,
  };
}

function materializeAnimalDeath(
  animal: PenAnimalState,
  deathAt: number,
  cause: AnimalDeathCause,
  summary: AnimalDeathNotificationSummary
): void {
  if (isAnimalDead(animal)) return;
  animal.deathAt = deathAt;
  animal.deathCause = cause;
  animal.isBuffed = false;
  summary.total += 1;
  if (cause === "old_age") summary.oldAge += 1;
  else summary.starvation += 1;
}

function settlePenAnimals(
  farm: FarmSaveState,
  startT: number,
  endT: number,
  weatherSeed: number
): AnimalDeathNotificationSummary {
  const newDeaths = createEmptyAnimalDeathSummary();
  const elapsedTotalMs = Math.max(0, endT - startT);
  const effectiveEndT = startT + Math.min(elapsedTotalMs, MAX_OFFLINE_EGG_PRODUCTION_MS);
  let feedValue = Math.min(100, Math.max(0, farm.penFeedBuffValue || 0));
  const initialBonus = feedValue > 0 ? Math.max(0, farm.activeFeedSpeedBonus || 0) : 0;
  let feedDepletedAt = feedValue <= 0 ? startT : Number.POSITIVE_INFINITY;
  let cursor = startT;

  if (feedValue > 0) farm.penStarvationStartedAt = null;
  if (feedValue <= 0 && getLivingAnimalCount(farm.penAnimals) > 0 && !Number.isFinite(farm.penStarvationStartedAt)) {
    farm.penStarvationStartedAt = startT;
  }

  // Process natural deaths, feed depletion and the starvation deadline in timestamp order.
  for (let guard = 0; guard < 32 && cursor <= endT; guard += 1) {
    const living = farm.penAnimals.filter((animal) => !isAnimalDead(animal));
    if (living.length === 0) {
      farm.penStarvationStartedAt = null;
      break;
    }

    const nextNaturalDeathAt = Math.min(...living.map((animal) => animal.lifeEndsAt));
    const starvationDeadlineAt = feedValue <= 0
      ? getStarvationDeadlineAt(farm.penStarvationStartedAt)
      : null;
    const troughDurationMs = feedValue > 0
      ? getNormalTroughDurationMs(living.length)
      : 0;
    const feedEmptyAt = troughDurationMs > 0
      ? cursor + (feedValue / 100) * troughDurationMs
      : Number.POSITIVE_INFINITY;
    const nextEventAt = Math.min(
      endT,
      nextNaturalDeathAt,
      starvationDeadlineAt ?? Number.POSITIVE_INFINITY,
      feedEmptyAt
    );

    if (feedValue > 0 && troughDurationMs > 0 && nextEventAt > cursor) {
      feedValue = Math.max(
        0,
        feedValue - ((nextEventAt - cursor) / troughDurationMs) * 100
      );
    }
    cursor = nextEventAt;

    // Old age wins an exact timestamp tie with starvation.
    if (nextNaturalDeathAt <= cursor) {
      living
        .filter((animal) => animal.lifeEndsAt <= cursor)
        .forEach((animal) => materializeAnimalDeath(animal, animal.lifeEndsAt, "old_age", newDeaths));
      // Feed depletion still starts danger for any survivors when it shares
      // the same timestamp as an old-age death.
      if (
        feedEmptyAt <= cursor &&
        feedValue <= 1e-7 &&
        getLivingAnimalCount(farm.penAnimals) > 0
      ) {
        feedValue = 0;
        feedDepletedAt = cursor;
        farm.penStarvationStartedAt = cursor;
      }
      if (getLivingAnimalCount(farm.penAnimals) === 0) {
        farm.penStarvationStartedAt = null;
        break;
      }
      if (cursor >= endT) break;
      continue;
    }

    if (feedEmptyAt <= cursor && feedValue <= 1e-7) {
      feedValue = 0;
      feedDepletedAt = cursor;
      farm.penStarvationStartedAt = cursor;
      if (cursor >= endT) break;
      continue;
    }

    if (starvationDeadlineAt !== null && starvationDeadlineAt <= cursor) {
      farm.penAnimals
        .filter((animal) => !isAnimalDead(animal))
        .forEach((animal) => materializeAnimalDeath(animal, starvationDeadlineAt, "starvation", newDeaths));
      farm.penStarvationStartedAt = null;
      break;
    }

    break;
  }

  feedValue = Math.max(0, Math.round(feedValue * 10_000) / 10_000);
  farm.penFeedBuffValue = feedValue;
  farm.penFeedBuffUpdatedAt = endT;
  if (feedValue <= 0) {
    farm.penFeedBuffValue = 0;
    farm.activeFeedSpeedBonus = 0;
    if (getLivingAnimalCount(farm.penAnimals) === 0) farm.penStarvationStartedAt = null;
  } else {
    farm.penStarvationStartedAt = null;
  }

  for (const animal of farm.penAnimals) {
    const animalDef = ANIMAL_CATALOG.find((entry) => entry.id === animal.animalTypeId);
    if (!animalDef) continue;
    const deathAt = isAnimalDead(animal) ? animal.deathAt! : Number.POSITIVE_INFINITY;
    if (deathAt <= startT) {
      animal.isBuffed = false;
      continue;
    }

    let cycleStartT = animal.cycleStartedAt ?? animal.addedAt ?? startT;
    animal.cycleStartedAt = cycleStartT;
    let iterations = 0;
    while (
      animal.nextEggAt <= effectiveEndT &&
      animal.nextEggAt < deathAt &&
      iterations < 2_000
    ) {
      iterations += 1;
      const eggDoneAt = animal.nextEggAt;
      const eggExposure = calculateWeatherExposure(cycleStartT, eggDoneAt, weatherSeed);
      const eggQuality = rollQualityWithExposure(
        eggExposure.cool,
        getEggQualityRandom(
          weatherSeed,
          animal.instanceId,
          cycleStartT,
          eggDoneAt
        )
      );
      const rainBonusGold = Math.round(animalDef.eggSellGold * (0.05 * eggExposure.rain));
      const slotData = farm.eggQualityInventory![animalDef.eggTypeId][eggQuality];
      slotData.count += 1;
      slotData.rainGoldBonus += rainBonusGold;
      farm.inventory.eggs[animalDef.eggTypeId] =
        (farm.inventory.eggs[animalDef.eggTypeId] || 0) + 1;

      cycleStartT = eggDoneAt;
      animal.cycleStartedAt = cycleStartT;
      animal.nextEggAt = computeEggCompletionTime(
        cycleStartT,
        animalDef.eggIntervalMs,
        feedDepletedAt,
        initialBonus
      );
    }

    if (!isAnimalDead(animal) && endT > effectiveEndT) {
      const remainingTimeTowardsNextEgg = Math.max(0, animal.nextEggAt - effectiveEndT);
      animal.nextEggAt = endT + remainingTimeTowardsNextEgg;
    }
    animal.isBuffed =
      !isAnimalDead(animal) &&
      farm.penFeedBuffValue > 0 &&
      (farm.activeFeedSpeedBonus || 0) > 0;
  }

  return newDeaths;
}

export function consumePendingAnimalDeathNotification(
  farm: FarmSaveState
): AnimalDeathNotificationSummary | null {
  const pending = farm.pendingAnimalDeathNotification;
  farm.pendingAnimalDeathNotification = null;
  return pending && pending.total > 0 ? pending : null;
}

/**
 * Settles farm state based on current time `now` (wall-clock timestamp).
 */
export function settleFarmState(farm: FarmSaveState, now: number): FarmSettlementResult {
  const currentNow = Math.max(farm.lastSettledAt || 0, now);

  if (!Number.isFinite(farm.weatherSeed)) {
    farm.weatherSeed = DEFAULT_FARM_WEATHER_SEED;
  }
  const weatherSeed = farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED;

  // 1. Settle Crops (Growth timeline, Weather Exposure, Auto-Watering under Rain, Quality pre-roll)
  for (let i = 0; i < farm.plots.length; i++) {
    const plot = farm.plots[i];

    if (plot.status === "growing") {
      const cropDef = CROP_CATALOG.find((c) => c.id === plot.cropId);
      const fertTimeRedPct = plot.growthTimeReductionPct || 0;
      const baseGrowthMs = cropDef
        ? Math.round(cropDef.growthMs * (1 - fertTimeRedPct))
        : Math.max(1, plot.growthEndsAt - plot.plantedAt);

      // Recalculate schedule & exposure if not set
      if (!plot.weatherExposure) {
        const sched = calculateCropGrowthSchedule(
          plot.plantedAt,
          baseGrowthMs,
          weatherSeed
        );
        plot.growthEndsAt = sched.growthEndsAt;
        plot.weatherExposure = sched.weatherExposure;
        plot.rainGoldBonusPct = sched.rainGoldBonusPct;
        plot.stageEndTimes = [
          sched.stageWindows[0][1],
          sched.stageWindows[1][1],
          sched.stageWindows[2][0],
        ];
      }

      const totalGrowthMs = Math.max(1, plot.growthEndsAt - plot.plantedAt);
      const stageWindows: [number, number][] = [
        [
          plot.plantedAt + Math.round(totalGrowthMs * 0.2),
          plot.plantedAt + Math.round(totalGrowthMs * 0.5),
        ],
        [
          plot.plantedAt + Math.round(totalGrowthMs * 0.5),
          plot.plantedAt + Math.round(totalGrowthMs * 0.8),
        ],
        [
          plot.plantedAt + Math.round(totalGrowthMs * 0.8),
          plot.growthEndsAt,
        ],
      ];

      const wateredStages: [boolean, boolean, boolean] = plot.wateredStages || [
        (plot.wateringCount || 0) >= 1 || !!plot.wateredBoostApplied,
        (plot.wateringCount || 0) >= 2,
        (plot.wateringCount || 0) >= 3,
      ];

      // Auto-water check for eligible stages during Rain
      for (let sIdx = 0; sIdx < 3; sIdx++) {
        if (!wateredStages[sIdx]) {
          const [wStart, wEnd] = stageWindows[sIdx];
          if (currentNow >= wStart) {
            const hasRain = checkRainInTimeRange(
              wStart,
              Math.min(currentNow, wEnd),
              weatherSeed
            );
            if (hasRain) {
              wateredStages[sIdx] = true;
              plot.wateredBoostApplied = true;
            }
          }
        }
      }

      plot.wateredStages = wateredStages;
      plot.wateringCount = wateredStages.filter(Boolean).length;

      if (currentNow >= plot.growthEndsAt) {
        const wateringCount = plot.wateringCount;
        const rolledQuality =
          plot.rolledQuality ||
          rollQualityWithExposure(
            plot.weatherExposure?.cool || 0,
            getCropQualityRandom(
              weatherSeed,
              i,
              plot.plantedAt,
              plot.growthEndsAt
            )
          );

        farm.plots[i] = {
          status: "ready",
          cropId: plot.cropId,
          plantedAt: plot.plantedAt,
          growthEndsAt: plot.growthEndsAt,
          fertilizerId: plot.fertilizerId,
          fertilizerXpBonusPct: plot.fertilizerXpBonusPct,
          growthTimeReductionPct: plot.growthTimeReductionPct,
          wateringCount,
          wateredStages,
          wateredBoostApplied: plot.wateredBoostApplied || wateringCount > 0,
          wateredBonusType: plot.wateredBonusType,
          weatherExposure: plot.weatherExposure,
          rainGoldBonusPct: plot.rainGoldBonusPct,
          rolledQuality,
        };
      }
    }
  }

  // 2. Settle livestock lifecycle, Feed/Danger and eggs along one timestamp timeline.
  const startT = farm.lastSettledAt || currentNow;
  const endT = currentNow;
  const newDeaths = settlePenAnimals(farm, startT, endT, weatherSeed);
  const queuedOfflineDeathNotification =
    newDeaths.total > 0 && endT - startT > OFFLINE_DEATH_NOTICE_THRESHOLD_MS;
  if (queuedOfflineDeathNotification) {
    farm.pendingAnimalDeathNotification = mergeAnimalDeathSummary(
      farm.pendingAnimalDeathNotification,
      newDeaths
    );
  }

  farm.lastSettledAt = endT;
  return { newDeaths, queuedOfflineDeathNotification };
}

/**
 * 3-Stage Watering Configuration:
 * Stage 0: 20% to <50% progress
 * Stage 1: 50% to <80% progress
 * Stage 2: 80% to <100% progress
 */
export const WATERING_STAGE_WINDOWS = [
  { index: 0, label: "Mốc 1 (20% - 50%)", startPct: 0.20, endPct: 0.50 },
  { index: 1, label: "Mốc 2 (50% - 80%)", startPct: 0.50, endPct: 0.80 },
  { index: 2, label: "Mốc 3 (80% - 100%)", startPct: 0.80, endPct: 1.00 },
] as const;

/**
 * Computes detailed watering stage status for a plot at time `now`.
 * Strict rule: No catch-up / tưới bù. If a window is passed without watering, it is marked missed permanently.
 */
export function getPlotWateringInfo(plot: FarmPlotState, now: number): PlotWateringInfo {
  if (plot.status !== "growing" && plot.status !== "ready") {
    return {
      stageStatuses: ["upcoming", "upcoming", "upcoming"],
      currentEligibleStageIndex: null,
      canWaterNow: false,
      wateredCount: 0,
      missedCount: 0,
    };
  }

  const plantedAt = plot.plantedAt || now;
  const growthEndsAt =
    plot.status === "growing" ? plot.growthEndsAt : plantedAt + 1;
  const totalGrowthMs = Math.max(1, growthEndsAt - plantedAt);
  const elapsedMs = Math.max(0, now - plantedAt);
  const progress = plot.status === "ready" ? 1.0 : Math.min(1.0, Math.max(0.0, elapsedMs / totalGrowthMs));

  const wateredStages: [boolean, boolean, boolean] = plot.wateredStages || [
    (plot.wateringCount || 0) >= 1 || !!plot.wateredBoostApplied,
    (plot.wateringCount || 0) >= 2,
    (plot.wateringCount || 0) >= 3,
  ];

  const stageStatuses: [WateringStageStatus, WateringStageStatus, WateringStageStatus] = [
    "upcoming",
    "upcoming",
    "upcoming",
  ];

  for (let i = 0; i < 3; i++) {
    const win = WATERING_STAGE_WINDOWS[i];
    if (wateredStages[i]) {
      stageStatuses[i] = "watered";
    } else {
      if (progress < win.startPct) {
        stageStatuses[i] = "upcoming";
      } else if (progress >= win.startPct && progress < win.endPct) {
        stageStatuses[i] = "ready";
      } else {
        // progress >= win.endPct and not watered -> permanently missed!
        stageStatuses[i] = "missed";
      }
    }
  }

  let currentEligibleStageIndex: number | null = null;
  if (plot.status === "growing") {
    for (let i = 0; i < 3; i++) {
      if (stageStatuses[i] === "ready") {
        currentEligibleStageIndex = i;
        break;
      }
    }
  }

  const canWaterNow = currentEligibleStageIndex !== null;
  const wateredCount = wateredStages.filter(Boolean).length;
  const missedCount = stageStatuses.filter((s) => s === "missed").length;

  return {
    stageStatuses,
    currentEligibleStageIndex,
    canWaterNow,
    wateredCount,
    missedCount,
  };
}

/**
 * Checks whether a plot can be watered right now at its current valid stage.
 */
export function canWaterPlotNow(plot: FarmPlotState, now: number): boolean {
  return getPlotWateringInfo(plot, now).canWaterNow;
}

/**
 * Gets count of pending waterings available for a plot (0 or 1, since each plot can only water its current valid window).
 */
export function getPendingWateringCount(plot: FarmPlotState, now: number): number {
  return canWaterPlotNow(plot, now) ? 1 : 0;
}

/**
 * Waters a single plot at its currently valid stage.
 * Strictly does NOT allow catch-up for past missed stages.
 */
export function waterSinglePlot(
  farm: FarmSaveState,
  plotIndex: number,
  now: number
): { success: boolean; stageIndex?: number; wateredCount?: number; message: string } {
  if (plotIndex < 0 || plotIndex >= farm.plots.length) {
    return { success: false, message: "Ô đất không hợp lệ!" };
  }

  const plot = farm.plots[plotIndex];
  if (!plot || plot.status !== "growing") {
    return { success: false, message: "Ô đất không có cây đang phát triển!" };
  }

  const info = getPlotWateringInfo(plot, now);
  if (!info.canWaterNow || info.currentEligibleStageIndex === null) {
    return { success: false, message: "Cây chưa đến mốc tưới hoặc mốc tưới đã trôi qua!" };
  }

  const stageIdx = info.currentEligibleStageIndex;
  const currentStages: [boolean, boolean, boolean] = plot.wateredStages || [
    (plot.wateringCount || 0) >= 1 || !!plot.wateredBoostApplied,
    (plot.wateringCount || 0) >= 2,
    (plot.wateringCount || 0) >= 3,
  ];

  currentStages[stageIdx] = true;
  plot.wateredStages = currentStages;
  plot.wateringCount = currentStages.filter(Boolean).length;
  plot.wateredBoostApplied = true;

  const stageLabel = WATERING_STAGE_WINDOWS[stageIdx]?.label || `Mốc ${stageIdx + 1}`;

  return {
    success: true,
    stageIndex: stageIdx,
    wateredCount: plot.wateringCount,
    message: `Đã tưới nước ${stageLabel} cho cây! (+2% Vàng & XP khi thu hoạch)`,
  };
}

/**
 * Waters all eligible plots that have a currently active valid watering window ("💧 Tưới tất cả").
 * Strictly does NOT allow catch-up for past missed stages.
 */
export function waterAllPlots(
  farm: FarmSaveState,
  now: number
): { success: boolean; wateredPlotCount: number; message: string } {
  let wateredPlotCount = 0;

  for (let i = 0; i < farm.plots.length; i++) {
    const plot = farm.plots[i];
    if (plot.status === "growing") {
      const info = getPlotWateringInfo(plot, now);
      if (info.canWaterNow && info.currentEligibleStageIndex !== null) {
        const stageIdx = info.currentEligibleStageIndex;
        const currentStages: [boolean, boolean, boolean] = plot.wateredStages || [
          (plot.wateringCount || 0) >= 1 || !!plot.wateredBoostApplied,
          (plot.wateringCount || 0) >= 2,
          (plot.wateringCount || 0) >= 3,
        ];
        currentStages[stageIdx] = true;
        plot.wateredStages = currentStages;
        plot.wateringCount = currentStages.filter(Boolean).length;
        plot.wateredBoostApplied = true;
        wateredPlotCount++;
      }
    }
  }

  if (wateredPlotCount === 0) {
    return {
      success: false,
      wateredPlotCount: 0,
      message: "Hiện chưa có cây nào ở mốc tưới nước hợp lệ!",
    };
  }

  return {
    success: true,
    wateredPlotCount,
    message: `Đã tưới nước cho ${wateredPlotCount} ô cây! (+2% Vàng & XP / mốc chăm sóc)`,
  };
}

/**
 * Single plot watering compatibility function.
 */
export function applyWaterBuff(
  farm: FarmSaveState,
  plotIndex: number,
  now: number
): { success: boolean; bonusType?: "speed" | "yield"; message: string } {
  const result = waterSinglePlot(farm, plotIndex, now);
  return {
    success: result.success,
    message: result.message,
  };
}

/**
 * Plants a seed on a plot with optional fertilizer.
 */
export function plantSeedWithFertilizer(
  farm: FarmSaveState,
  plotIndex: number,
  cropId: CropId,
  fertilizerId: FertilizerTypeId | null,
  now: number
): { success: boolean; message: string } {
  if (plotIndex < 0 || plotIndex >= farm.plots.length) {
    return { success: false, message: "Ô đất không hợp lệ!" };
  }

  const plot = farm.plots[plotIndex];
  if (!plot || plot.status !== "empty") {
    return { success: false, message: "Ô đất không trống!" };
  }

  const seedCount = farm.inventory.seeds[cropId] || 0;
  if (seedCount <= 0) {
    return { success: false, message: "Bạn không có hạt giống loại này trong kho!" };
  }

  const cropDef = CROP_CATALOG.find((c) => c.id === cropId);
  if (!cropDef) return { success: false, message: "Loại cây trồng không tồn tại!" };

  let xpBonusPct = 0;
  let timeReductionPct = 0;

  if (fertilizerId) {
    if (!farm.inventory.fertilizer) {
      farm.inventory.fertilizer = createDefaultFarmState().inventory.fertilizer;
    }
    const fertCount = farm.inventory.fertilizer[fertilizerId] || 0;
    if (fertCount <= 0) {
      return { success: false, message: "Bạn đã hết loại phân bón này!" };
    }
    const fertDef = FERTILIZER_CATALOG.find((f) => f.id === fertilizerId);
    if (fertDef) {
      xpBonusPct = fertDef.xpBonusPct;
      timeReductionPct = fertDef.growthTimeReductionPct;
      farm.inventory.fertilizer[fertilizerId] = fertCount - 1;
    }
  }

  // Deduct 1 seed
  farm.inventory.seeds[cropId] = seedCount - 1;

  const effectiveGrowthMs = Math.round(cropDef.growthMs * (1 - timeReductionPct));
  const weatherSeed = farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED;
  const sched = calculateCropGrowthSchedule(now, effectiveGrowthMs, weatherSeed);

  farm.plots[plotIndex] = {
    status: "growing",
    cropId,
    plantedAt: now,
    growthEndsAt: sched.growthEndsAt,
    fertilizerId,
    fertilizerXpBonusPct: xpBonusPct,
    growthTimeReductionPct: timeReductionPct,
    wateringCount: 0,
    wateredStages: [false, false, false],
    wateredBoostApplied: false,
    weatherExposure: sched.weatherExposure,
    rainGoldBonusPct: sched.rainGoldBonusPct,
    stageEndTimes: [
      sched.stageWindows[0][1],
      sched.stageWindows[1][1],
      sched.stageWindows[2][0],
    ],
  };

  return {
    success: true,
    message: fertilizerId
      ? `Đã gieo ${cropDef.name} cùng phân bón!`
      : `Đã gieo ${cropDef.name}!`,
  };
}

/**
 * Purchases a fertilizer type from shop.
 */
export function buyFertilizer(
  farm: FarmSaveState,
  fertilizerId: FertilizerTypeId,
  currentRank: RankStep
): { success: boolean; message: string } {
  const fertDef = FERTILIZER_CATALOG.find((f) => f.id === fertilizerId);
  if (!fertDef) return { success: false, message: "Loại phân bón không hợp lệ!" };

  if (!rankAtLeast(currentRank, fertDef.requiredRank)) {
    return { success: false, message: "Chưa đạt quân hàm yêu cầu!" };
  }

  if (farm.gold < fertDef.purchaseGold) {
    return { success: false, message: "Không đủ Vàng để mua!" };
  }

  farm.gold -= fertDef.purchaseGold;
  if (!farm.inventory.fertilizer) {
    farm.inventory.fertilizer = createDefaultFarmState().inventory.fertilizer;
  }
  farm.inventory.fertilizer[fertilizerId] =
    (farm.inventory.fertilizer[fertilizerId] || 0) + 1;

  return {
    success: true,
    message: `Đã mua 1 ${fertDef.name}!`,
  };
}

/**
 * Gets original purchase price of any farm item.
 */
export function getItemOriginalPrice(
  category: "seeds" | "fertilizer" | "animals" | "feed",
  itemId: string
): number {
  switch (category) {
    case "seeds": {
      const crop = CROP_CATALOG.find((c) => c.id === itemId);
      return crop ? crop.seedCostGold : 0;
    }
    case "fertilizer": {
      const fert = FERTILIZER_CATALOG.find((f) => f.id === itemId);
      return fert ? fert.purchaseGold : 0;
    }
    case "animals": {
      const animal = ANIMAL_CATALOG.find((a) => a.id === itemId);
      return animal ? animal.purchaseGold : 0;
    }
    case "feed": {
      const feed = FEED_CATALOG.find((f) => f.id === itemId);
      return feed ? feed.costGold : 0;
    }
    default:
      return 0;
  }
}

/**
 * Gets resale price of any farm item (70% of original price).
 */
export function getItemSellPrice(
  category: "seeds" | "fertilizer" | "animals" | "feed",
  itemId: string
): number {
  const original = getItemOriginalPrice(category, itemId);
  return Math.floor(original * 0.7);
}

/**
 * Sells items from inventory at 70% of original purchase price.
 */
export function sellInventoryItem(
  farm: FarmSaveState,
  category: "seeds" | "fertilizer" | "animals" | "feed",
  itemId: string,
  count: number
): { success: boolean; goldEarned: number; soldCount: number; message: string } {
  if (!farm.inventory) {
    farm.inventory = createDefaultFarmState().inventory;
  }

  const requestedCount = Math.max(0, Math.floor(count));
  if (requestedCount <= 0) {
    return { success: false, goldEarned: 0, soldCount: 0, message: "Số lượng không hợp lệ!" };
  }

  let ownedCount = 0;
  switch (category) {
    case "seeds":
      ownedCount = farm.inventory.seeds[itemId as CropId] || 0;
      break;
    case "fertilizer":
      ownedCount = farm.inventory.fertilizer?.[itemId as FertilizerTypeId] || 0;
      break;
    case "animals":
      ownedCount = farm.inventory.animals[itemId as AnimalTypeId] || 0;
      break;
    case "feed":
      ownedCount = farm.inventory.feed[itemId as FeedTypeId] || 0;
      break;
  }

  const soldCount = Math.min(ownedCount, requestedCount);
  if (soldCount <= 0) {
    return { success: false, goldEarned: 0, soldCount: 0, message: "Bạn không có đủ số lượng vật phẩm này trong kho!" };
  }

  const unitSellPrice = getItemSellPrice(category, itemId);
  const goldEarned = soldCount * unitSellPrice;

  // Deduct inventory
  switch (category) {
    case "seeds":
      farm.inventory.seeds[itemId as CropId] = ownedCount - soldCount;
      break;
    case "fertilizer":
      if (!farm.inventory.fertilizer) farm.inventory.fertilizer = createDefaultFarmState().inventory.fertilizer;
      farm.inventory.fertilizer[itemId as FertilizerTypeId] = ownedCount - soldCount;
      break;
    case "animals":
      farm.inventory.animals[itemId as AnimalTypeId] = ownedCount - soldCount;
      break;
    case "feed":
      farm.inventory.feed[itemId as FeedTypeId] = ownedCount - soldCount;
      break;
  }

  farm.gold += goldEarned;

  return {
    success: true,
    goldEarned,
    soldCount,
    message: `Đã bán ${soldCount} vật phẩm (+${goldEarned} Vàng)!`,
  };
}

export interface CropHarvestPreview {
  cropName: string;
  baseGold: number;
  baseXp: number;
  goldEarned: number;
  xpEarned: number;
  wateredBonusGold: number;
  wateredBonusXp: number;
  fertilizerBonusXp: number;
  rainBonusGold: number;
  quality: ItemQuality;
  qualityMultiplier: number;
  effectiveWaterings: number;
  hasFertilizer: boolean;
}

/** Pure reward selector used by both the Ready panel and harvest previews. */
export function getCropHarvestPreview(
  farm: FarmSaveState,
  plotIndex: number,
  plotOverride?: FarmPlotState
): CropHarvestPreview | null {
  const plot = plotOverride ?? farm.plots[plotIndex];
  if (!plot || plot.status !== "ready") return null;

  const cropDef = CROP_CATALOG.find((crop) => crop.id === plot.cropId);
  if (!cropDef) return null;

  const effectiveWaterings = Math.min(
    3,
    plot.wateringCount !== undefined
      ? plot.wateringCount
      : plot.wateredBoostApplied
        ? 1
        : 0
  );
  const wateredBonusGold = Math.round(
    cropDef.harvestGold * effectiveWaterings * 0.02
  );
  const wateredBonusXp = Math.round(
    cropDef.harvestXp * effectiveWaterings * 0.02
  );
  const fertilizerBonusXp = Math.round(
    cropDef.harvestXp * (plot.fertilizerXpBonusPct || 0)
  );
  const rainBonusGold = Math.round(
    cropDef.harvestGold *
      (plot.rainGoldBonusPct || 0.05 * (plot.weatherExposure?.rain || 0))
  );
  const quality =
    plot.rolledQuality ||
    rollQualityWithExposure(
      plot.weatherExposure?.cool || 0,
      getCropQualityRandom(
        farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED,
        plotIndex,
        plot.plantedAt,
        plot.growthEndsAt ?? plot.plantedAt
      )
    );
  const qualityMultiplier = QUALITY_CONFIG[quality].multiplier;
  const preQualityGold = cropDef.harvestGold + wateredBonusGold + rainBonusGold;
  const preQualityXp = cropDef.harvestXp + wateredBonusXp + fertilizerBonusXp;

  return {
    cropName: cropDef.name,
    baseGold: cropDef.harvestGold,
    baseXp: cropDef.harvestXp,
    goldEarned: applyQualityMultiplier(preQualityGold, qualityMultiplier),
    xpEarned: applyQualityMultiplier(preQualityXp, qualityMultiplier),
    wateredBonusGold,
    wateredBonusXp,
    fertilizerBonusXp,
    rainBonusGold,
    quality,
    qualityMultiplier,
    effectiveWaterings,
    hasFertilizer:
      Boolean(plot.fertilizerId) || (plot.fertilizerXpBonusPct || 0) > 0,
  };
}

/**
 * Harvests a single ready crop plot.
 */
export function harvestPlot(
  farm: FarmSaveState,
  plotIndex: number,
  _now: number
): {
  goldEarned: number;
  xpEarned: number;
  cropName: string;
  bonusGold: number;
  bonusXp: number;
  wateredBonusGold: number;
  wateredBonusXp: number;
  fertilizerBonusXp: number;
  rainBonusGold: number;
  quality: ItemQuality;
  qualityMultiplier: number;
  weatherExposure?: WeatherExposureData;
  effectiveWaterings: number;
  hasFertilizer: boolean;
  qualityBreakdown: QualityBreakdown;
} | null {
  const plot = farm.plots[plotIndex];
  if (!plot || plot.status !== "ready") return null;

  const cropDef = CROP_CATALOG.find((c) => c.id === plot.cropId);
  if (!cropDef) return null;

  const wateringCount = Math.min(
    3,
    plot.wateringCount !== undefined
      ? plot.wateringCount
      : plot.wateredBoostApplied
      ? 1
      : 0
  );
  const wateringXpBonusPct = wateringCount * 0.02;
  const wateringGoldBonusPct = wateringCount * 0.02;
  const fertXpBonusPct = plot.fertilizerXpBonusPct || 0;
  const hasFertilizer = !!plot.fertilizerId || fertXpBonusPct > 0;

  const baseGold = cropDef.harvestGold;
  const baseXp = cropDef.harvestXp;

  const wateredBonusGold = Math.round(baseGold * wateringGoldBonusPct);
  const wateredBonusXp = Math.round(baseXp * wateringXpBonusPct);
  const fertilizerBonusXp = Math.round(baseXp * fertXpBonusPct);
  const rainGoldBonusPct =
    plot.rainGoldBonusPct || 0.05 * (plot.weatherExposure?.rain || 0);
  const rainBonusGold = Math.round(baseGold * rainGoldBonusPct);

  // Quality calculation
  const quality: ItemQuality =
    plot.rolledQuality ||
    rollQualityWithExposure(
      plot.weatherExposure?.cool || 0,
      getCropQualityRandom(
        farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED,
        plotIndex,
        plot.plantedAt,
        plot.growthEndsAt ?? plot.plantedAt
      )
    );
  const qualityMultiplier = QUALITY_CONFIG[quality].multiplier;

  const preQualityGold = baseGold + wateredBonusGold + rainBonusGold;
  const preQualityXp = baseXp + wateredBonusXp + fertilizerBonusXp;

  const goldEarned = applyQualityMultiplier(preQualityGold, qualityMultiplier);
  const xpEarned = applyQualityMultiplier(preQualityXp, qualityMultiplier);

  const bonusGold = goldEarned - baseGold;
  const bonusXp = xpEarned - baseXp;

  const weatherExposure = plot.weatherExposure;

  const qualityBreakdown = createEmptyQualityBreakdown();
  qualityBreakdown[quality] = {
    quantity: 1,
    baseGold: preQualityGold,
    qualityBonusGold: goldEarned - preQualityGold,
    gold: goldEarned,
    baseXp: preQualityXp,
    qualityBonusXp: xpEarned - preQualityXp,
    xp: xpEarned,
  };

  farm.plots[plotIndex] = { status: "empty" };
  farm.gold += goldEarned;

  return {
    goldEarned,
    xpEarned,
    cropName: cropDef.name,
    bonusGold,
    bonusXp,
    wateredBonusGold,
    wateredBonusXp,
    fertilizerBonusXp,
    rainBonusGold,
    quality,
    qualityMultiplier,
    weatherExposure,
    effectiveWaterings: wateringCount,
    hasFertilizer,
    qualityBreakdown,
  };
}

/**
 * Harvests all ready crops at current time `now`.
 */
export function harvestAllReadyCrops(
  farm: FarmSaveState,
  _now: number
): {
  totalGold: number;
  totalXp: number;
  bonusGold: number;
  bonusXp: number;
  wateredBonusGold: number;
  wateredBonusXp: number;
  fertilizerBonusXp: number;
  rainBonusGold: number;
  harvestedCount: number;
  details: Array<{
    plotIndex: number;
    cropId: CropId;
    cropName: string;
    goldAwarded: number;
    xpAwarded: number;
    effectiveWaterings: number;
    hasFertilizer: boolean;
    rainBonusGold: number;
    quality: ItemQuality;
    qualityMultiplier: number;
    weatherExposure?: WeatherExposureData;
  }>;
  qualityBreakdown: QualityBreakdown;
} {
  let totalGold = 0;
  let totalXp = 0;
  let bonusGold = 0;
  let bonusXp = 0;
  let wateredBonusGold = 0;
  let wateredBonusXp = 0;
  let fertilizerBonusXp = 0;
  let rainBonusGold = 0;
  let harvestedCount = 0;
  const qualityBreakdown = createEmptyQualityBreakdown();
  const details: Array<{
    plotIndex: number;
    cropId: CropId;
    cropName: string;
    goldAwarded: number;
    xpAwarded: number;
    effectiveWaterings: number;
    hasFertilizer: boolean;
    rainBonusGold: number;
    quality: ItemQuality;
    qualityMultiplier: number;
    weatherExposure?: WeatherExposureData;
  }> = [];

  for (let i = 0; i < farm.plots.length; i++) {
    const plot = farm.plots[i];
    if (plot.status === "ready") {
      const cropDef = CROP_CATALOG.find((c) => c.id === plot.cropId);
      if (cropDef) {
        const wateringCount = Math.min(
          3,
          plot.wateringCount !== undefined
            ? plot.wateringCount
            : plot.wateredBoostApplied
            ? 1
            : 0
        );
        const wateringXpBonusPct = wateringCount * 0.02;
        const wateringGoldBonusPct = wateringCount * 0.02;
        const fertXpBonusPct = plot.fertilizerXpBonusPct || 0;
        const hasFertilizer = !!plot.fertilizerId || fertXpBonusPct > 0;

        const baseG = cropDef.harvestGold;
        const baseX = cropDef.harvestXp;

        const wG = Math.round(baseG * wateringGoldBonusPct);
        const wX = Math.round(baseX * wateringXpBonusPct);
        const fX = Math.round(baseX * fertXpBonusPct);
        const rGoldPct =
          plot.rainGoldBonusPct || 0.05 * (plot.weatherExposure?.rain || 0);
        const rG = Math.round(baseG * rGoldPct);

        const quality: ItemQuality =
          plot.rolledQuality ||
          rollQualityWithExposure(
            plot.weatherExposure?.cool || 0,
            getCropQualityRandom(
              farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED,
              i,
              plot.plantedAt,
              plot.growthEndsAt ?? plot.plantedAt
            )
          );
        const qualityMultiplier = QUALITY_CONFIG[quality].multiplier;

        const preQualityGold = baseG + wG + rG;
        const preQualityXp = baseX + wX + fX;

        const earnG = applyQualityMultiplier(preQualityGold, qualityMultiplier);
        const earnX = applyQualityMultiplier(preQualityXp, qualityMultiplier);

        totalGold += earnG;
        totalXp += earnX;
        bonusGold += earnG - baseG;
        bonusXp += earnX - baseX;
        wateredBonusGold += wG;
        wateredBonusXp += wX;
        fertilizerBonusXp += fX;
        rainBonusGold += rG;

        harvestedCount++;
        qualityBreakdown[quality].quantity += 1;
        qualityBreakdown[quality].baseGold += preQualityGold;
        qualityBreakdown[quality].qualityBonusGold += earnG - preQualityGold;
        qualityBreakdown[quality].gold += earnG;
        qualityBreakdown[quality].baseXp += preQualityXp;
        qualityBreakdown[quality].qualityBonusXp += earnX - preQualityXp;
        qualityBreakdown[quality].xp += earnX;

        details.push({
          plotIndex: i,
          cropId: plot.cropId,
          cropName: cropDef.name,
          goldAwarded: earnG,
          xpAwarded: earnX,
          effectiveWaterings: wateringCount,
          hasFertilizer,
          rainBonusGold: rG,
          quality,
          qualityMultiplier,
          weatherExposure: plot.weatherExposure,
        });
        farm.plots[i] = { status: "empty" };
      }
    }
  }

  if (harvestedCount > 0) {
    farm.gold += totalGold;
  }

  return {
    totalGold,
    totalXp,
    bonusGold,
    bonusXp,
    wateredBonusGold,
    wateredBonusXp,
    fertilizerBonusXp,
    rainBonusGold,
    harvestedCount,
    details,
    qualityBreakdown,
  };
}

/**
 * Calculates the maximum quantity of a feed type that can be loaded into the pen trough.
 * Takes into account the current trough fill percentage (penFeedBuffValue) and inventory count.
 * Allows filling the trough up to 100% (capping at 100% even if the last bag adds more than remaining space).
 */
export function calculateMaxFeedQuantity(
  farm: FarmSaveState,
  feedTypeId: FeedTypeId
): number {
  const feedDef = FEED_CATALOG.find((f) => f.id === feedTypeId);
  if (!feedDef || feedDef.buffAmount <= 0) return 0;

  const currentCount = farm.inventory?.feed?.[feedTypeId] || 0;
  if (currentCount <= 0) return 0;

  const currentBuff = farm.penFeedBuffValue || 0;
  if (currentBuff >= 100) return 0;

  const remaining = Math.max(0, 100 - currentBuff);
  const capacityQty = Math.ceil(remaining / feedDef.buffAmount);
  if (capacityQty <= 0) return 0;

  return Math.min(currentCount, capacityQty);
}

/**
 * Feeds the pen using owned feed, boosting food level.
 * Supports feeding multiple bags (quantity >= 1) up to the trough's 100% capacity.
 * Caps trough at 100% maximum. Blocks feeding if trough is already at 100%.
 */
export function feedPenBuff(
  farm: FarmSaveState,
  feedTypeId: FeedTypeId,
  quantity: number = 1,
  now: number = farm.lastSettledAt
): { success: boolean; message: string; quantityFed?: number } {
  const feedDef = FEED_CATALOG.find((f) => f.id === feedTypeId);
  if (!feedDef) return { success: false, message: "Loại thức ăn không hợp lệ!" };

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false, message: "Số lượng thức ăn phải là số nguyên dương!" };
  }

  if (!farm.inventory) {
    farm.inventory = createDefaultFarmState().inventory;
  }
  if (!farm.inventory.feed) {
    farm.inventory.feed = { feed_normal: 0, feed_good: 0, feed_super: 0 };
  }

  const currentCount = farm.inventory.feed[feedTypeId] || 0;
  if (currentCount <= 0) {
    return { success: false, message: `Bạn đã hết ${feedDef.name} trong kho!` };
  }

  if (currentCount < quantity) {
    return {
      success: false,
      message: `Không đủ ${feedDef.name} trong kho (yêu cầu ${quantity}, hiện có ${currentCount})!`,
    };
  }

  const currentBuff = farm.penFeedBuffValue || 0;
  if (currentBuff >= 100) {
    return {
      success: false,
      message: `Máng ăn đã đầy (100%), không thể nạp thêm thức ăn!`,
    };
  }

  const remaining = Math.max(0, 100 - currentBuff);
  const maxAllowedByCapacity = Math.ceil(remaining / feedDef.buffAmount);

  if (maxAllowedByCapacity <= 0) {
    return {
      success: false,
      message: `Máng ăn đã đầy (100%), không thể nạp thêm thức ăn!`,
    };
  }

  if (quantity > maxAllowedByCapacity) {
    return {
      success: false,
      message: `Không thể nạp ${quantity} bao vì chỉ cần thêm tối đa ${maxAllowedByCapacity} bao ${feedDef.name} là máng ăn đã đạt 100%!`,
    };
  }

  const oldBonus = farm.activeFeedSpeedBonus || 0;
  const newBonus = Math.max(oldBonus, feedDef.speedBonusPercent);

  // Deduct inventory
  farm.inventory.feed[feedTypeId] = currentCount - quantity;
  
  // Increase trough level safely without exceeding 100%
  const addedBuff = feedDef.buffAmount * quantity;
  farm.penFeedBuffValue = Math.min(100, Math.round((currentBuff + addedBuff) * 10000) / 10000);
  farm.activeFeedSpeedBonus = newBonus;
  farm.penFeedBuffUpdatedAt = now;
  farm.penStarvationStartedAt = null;

  const livingAnimalCount = getLivingAnimalCount(farm.penAnimals);
  const totalDurationMs = getNormalTroughDurationMs(livingAnimalCount);
  const newBuffExpiresAt = totalDurationMs > 0
    ? now + (farm.penFeedBuffValue / 100) * totalDurationMs
    : Number.POSITIVE_INFINITY;

  // Apply speed upgrade to all animals in pen
  if (farm.penAnimals && farm.penAnimals.length > 0) {
    farm.penAnimals.forEach((animal) => {
      const animalDef = ANIMAL_CATALOG.find((a) => a.id === animal.animalTypeId);
      if (!animalDef || isAnimalDead(animal)) {
        animal.isBuffed = false;
        return;
      }

      const currentRemainingMs = Math.max(0, animal.nextEggAt - now);
      if (newBonus > oldBonus && currentRemainingMs > 0) {
        const oldMult = oldBonus > 0 ? 1 + oldBonus / 100 : 1.0;
        const newMult = 1 + newBonus / 100;
        const rescaledRemaining = Math.round(currentRemainingMs * (oldMult / newMult));
        animal.nextEggAt = now + rescaledRemaining;
      }
      animal.isBuffed = newBuffExpiresAt > now && newBonus > 0;
    });
  }

  const boostMsg =
    newBonus > oldBonus
      ? `Nâng cấp tốc độ đẻ trứng lên +${newBonus}%!`
      : `Duy trì tăng tốc +${newBonus}%.`;

  const qtyLabel = quantity > 1 ? `${quantity} bao ` : "";

  return {
    success: true,
    quantityFed: quantity,
    message: `Đã cho ăn ${qtyLabel}${feedDef.name}! ${boostMsg} Máng ăn được cộng +${addedBuff}% (Hiện tại: ${Math.round(
      farm.penFeedBuffValue
    )}%).`,
  };
}

/**
 * Sells eggs from inventory respecting stored egg qualities and rain bonus gold.
 */
export function sellEggs(
  farm: FarmSaveState,
  eggTypeId: EggTypeId,
  count: number
): {
  goldEarned: number;
  xpEarned: number;
  soldCount: number;
  totalRainBonusGold: number;
  soldByQuality: Record<ItemQuality, number>;
  qualityBreakdown: QualityBreakdown;
} {
  ensureEggQualityInventory(farm);
  const currentCount = farm.inventory.eggs[eggTypeId] || 0;
  const soldCount = Math.min(currentCount, Math.max(0, count));

  if (soldCount <= 0) {
    return {
      goldEarned: 0,
      xpEarned: 0,
      soldCount: 0,
      totalRainBonusGold: 0,
      soldByQuality: { thuong: 0, tot: 0, hiem: 0, hoan_my: 0 },
      qualityBreakdown: createEmptyQualityBreakdown(),
    };
  }

  const info = EGG_INFO_MAP[eggTypeId];
  const qualitySlots = farm.eggQualityInventory![eggTypeId];
  const qualityTiers: ItemQuality[] = ["thuong", "tot", "hiem", "hoan_my"];

  let remainingToSell = soldCount;
  let goldEarned = 0;
  let xpEarned = 0;
  let totalRainBonusGold = 0;
  const soldByQuality: Record<ItemQuality, number> = {
    thuong: 0,
    tot: 0,
    hiem: 0,
    hoan_my: 0,
  };
  const qualityBreakdown = createEmptyQualityBreakdown();

  for (const q of qualityTiers) {
    if (remainingToSell <= 0) break;
    const slot = qualitySlots[q];
    if (slot && slot.count > 0) {
      const takeCount = Math.min(slot.count, remainingToSell);
      const mult = QUALITY_CONFIG[q].multiplier;

      const baseG = takeCount * info.sellGold;
      const baseX = takeCount * info.sellXp;

      // Proportional rain bonus gold for the eggs being sold
      const rainG = slot.count > 0 ? Math.round(slot.rainGoldBonus * (takeCount / slot.count)) : 0;
      totalRainBonusGold += rainG;

      const preQualityGold = baseG + rainG;
      const tierGold = applyQualityMultiplier(preQualityGold, mult);
      const tierXp = applyQualityMultiplier(baseX, mult);

      goldEarned += tierGold;
      xpEarned += tierXp;
      soldByQuality[q] += takeCount;

      qualityBreakdown[q].quantity += takeCount;
      qualityBreakdown[q].baseGold += preQualityGold;
      qualityBreakdown[q].qualityBonusGold += tierGold - preQualityGold;
      qualityBreakdown[q].gold += tierGold;
      qualityBreakdown[q].baseXp += baseX;
      qualityBreakdown[q].qualityBonusXp += tierXp - baseX;
      qualityBreakdown[q].xp += tierXp;

      slot.count -= takeCount;
      slot.rainGoldBonus = Math.max(0, slot.rainGoldBonus - rainG);
      remainingToSell -= takeCount;
    }
  }

  farm.inventory.eggs[eggTypeId] = Math.max(0, currentCount - soldCount);
  farm.gold += goldEarned;

  return {
    goldEarned,
    xpEarned,
    soldCount,
    totalRainBonusGold,
    soldByQuality,
    qualityBreakdown,
  };
}

/**
 * Sells all eggs in inventory.
 */
export function sellAllEggs(
  farm: FarmSaveState
): {
  totalGold: number;
  totalXp: number;
  totalCount: number;
  totalRainBonusGold: number;
  soldByQuality: Record<ItemQuality, number>;
  qualityBreakdown: QualityBreakdown;
} {
  let totalGold = 0;
  let totalXp = 0;
  let totalCount = 0;
  let totalRainBonusGold = 0;
  const soldByQuality: Record<ItemQuality, number> = {
    thuong: 0,
    tot: 0,
    hiem: 0,
    hoan_my: 0,
  };
  const qualityBreakdown = createEmptyQualityBreakdown();

  (Object.keys(EGG_INFO_MAP) as EggTypeId[]).forEach((eggType) => {
    const count = farm.inventory.eggs[eggType] || 0;
    if (count > 0) {
      const res = sellEggs(farm, eggType, count);
      totalGold += res.goldEarned;
      totalXp += res.xpEarned;
      totalCount += res.soldCount;
      totalRainBonusGold += res.totalRainBonusGold;
      (Object.keys(res.soldByQuality) as ItemQuality[]).forEach((q) => {
        soldByQuality[q] += res.soldByQuality[q];
      });
      (Object.keys(res.qualityBreakdown) as ItemQuality[]).forEach((q) => {
        qualityBreakdown[q].quantity += res.qualityBreakdown[q].quantity;
        qualityBreakdown[q].baseGold += res.qualityBreakdown[q].baseGold;
        qualityBreakdown[q].qualityBonusGold +=
          res.qualityBreakdown[q].qualityBonusGold;
        qualityBreakdown[q].gold += res.qualityBreakdown[q].gold;
        qualityBreakdown[q].baseXp += res.qualityBreakdown[q].baseXp;
        qualityBreakdown[q].qualityBonusXp +=
          res.qualityBreakdown[q].qualityBonusXp;
        qualityBreakdown[q].xp += res.qualityBreakdown[q].xp;
      });
    }
  });

  return { totalGold, totalXp, totalCount, totalRainBonusGold, soldByQuality, qualityBreakdown };
}

/**
 * Dismisses/Releases an animal from the pen.
 */
export function dismissAnimal(
  farm: FarmSaveState,
  instanceId: string
): boolean {
  const index = farm.penAnimals.findIndex((a) => a.instanceId === instanceId);
  if (index === -1) return false;

  farm.penAnimals.splice(index, 1);
  if (getLivingAnimalCount(farm.penAnimals) === 0) {
    farm.penStarvationStartedAt = null;
  }
  return true;
}

/**
 * Clears/Digs a plot (Xúc đất), removing any active crop.
 */
export function clearPlot(farm: FarmSaveState, plotIndex: number): boolean {
  if (plotIndex < 0 || plotIndex >= farm.plots.length) return false;
  const plot = farm.plots[plotIndex];
  if (plot.status === "locked") return false;

  farm.plots[plotIndex] = { status: "empty" };
  return true;
}

/**
 * Adds an animal from inventory into the livestock pen.
 * Computes initial egg interval respecting current active trough feed speed multiplier and weather cycles.
 */
export function addAnimalToPen(
  farm: FarmSaveState,
  animalId: AnimalTypeId,
  now: number,
  currentRank?: RankStep | null
): { success: boolean; message: string } {
  const capacity = currentRank ? getAnimalCapacity(currentRank) : 2;
  if (farm.penAnimals.length >= capacity) {
    return {
      success: false,
      message: `Chuồng đã đạt sức chứa tối đa (${capacity}/${capacity})!`,
    };
  }

  const ownedCount = farm.inventory.animals[animalId] || 0;
  if (ownedCount <= 0) {
    return {
      success: false,
      message: "Bạn không có vật nuôi này trong kho!",
    };
  }

  const animalDef = ANIMAL_CATALOG.find((a) => a.id === animalId);
  if (!animalDef) {
    return { success: false, message: "Loại vật nuôi không hợp lệ!" };
  }

  // Deduct 1 animal from inventory
  farm.inventory.animals[animalId] = ownedCount - 1;

  // Calculate speed multiplier if trough has feed
  const hasBuff = (farm.penFeedBuffValue || 0) > 0;
  const activeBonus = hasBuff ? (farm.activeFeedSpeedBonus || 0) : 0;
  const livingAnimalCount = getLivingAnimalCount(farm.penAnimals) + 1;
  const totalDurationMs = getNormalTroughDurationMs(livingAnimalCount);
  const buffUpdatedAt = farm.penFeedBuffUpdatedAt || now;
  const buffExpiresAt = hasBuff && activeBonus > 0 
    ? buffUpdatedAt + ((farm.penFeedBuffValue || 0) / 100) * totalDurationMs 
    : now;

  const nextEggAt = computeEggCompletionTime(
    now,
    animalDef.eggIntervalMs,
    buffExpiresAt,
    activeBonus
  );

  const newAnimal: PenAnimalState = {
    instanceId: `animal_${now}_${Math.floor(
      deterministicRandom(
        farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED,
        "animal-instance",
        animalId,
        now,
        farm.penAnimals.length
      ) * 36 ** 5
    )
      .toString(36)
      .padStart(5, "0")}`,
    animalTypeId: animalId,
    addedAt: now,
    cycleStartedAt: now,
    nextEggAt,
    lifeStartedAt: now,
    lifeEndsAt: now + animalDef.lifespanMs,
    deathAt: null,
    deathCause: null,
    isBuffed: hasBuff && activeBonus > 0 && buffExpiresAt > now,
  };

  farm.penAnimals.push(newAnimal);
  if (hasBuff) farm.penStarvationStartedAt = null;
  else if (!Number.isFinite(farm.penStarvationStartedAt)) farm.penStarvationStartedAt = now;

  return {
    success: true,
    message: `Đã thả 1 ${animalDef.name} vào chuồng nuôi!`,
  };
}

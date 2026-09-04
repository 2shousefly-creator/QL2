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
  createDefaultFarmState as createMigratedDefaultFarmState,
  DEFAULT_FARM_WEATHER_SEED,
} from "./farmMigration";

export { createDefaultEggQualityInventory } from "./farmMigration";
import {
  deterministicRandom,
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
  getCanonicalWeatherSlot,
  getDayNightPhase,
  getSoilMoistureRatePerHour,
  getWeatherGrowthRate,
  getWeatherAt,
  getWeatherForSlot,
  WEATHER_METADATA,
  QUALITY_CONFIG,
  getQualityProbabilities,
  rollQualityWithExposure,
  calculateWeatherExposure,
  calculateNextEggCycle,
} from "./weatherEngine";
import {
  clampSoilMoisture,
  getNextMoistureSegmentGrowthRate,
  getNextSoilMoistureThreshold,
  MANUAL_WATER_AMOUNT,
  MIN_PLANTING_SOIL_MOISTURE,
  snapSoilMoistureToThreshold,
} from "./soilMoistureEngine";
import {
  canTreatPest,
  clampPestPressure,
  escalatePestDamage,
  getNextPestDamageBoundaryAt,
  getPestGoldMultiplier,
  getPestGrowthRate,
  getPestRatePerHour,
  PEST_OUTBREAK_THRESHOLD,
  PEST_TREAT_RESET_PRESSURE,
} from "./pestEngine";

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

export function createDefaultFarmState(now: number = Date.now()): FarmSaveState {
  return createMigratedDefaultFarmState(now);
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
  animal.eggLastUpdatedAt = deathAt;
  animal.nextEggAt = deathAt;
  summary.total += 1;
  if (cause === "old_age") summary.oldAge += 1;
  else summary.starvation += 1;
}

// Egg work is stored as floating-point milliseconds. Around real epoch-sized
// timestamps, a sub-millisecond completion delta can round back to the current
// cursor. Treating <= 1 ms of work as complete keeps rollover monotonic without
// affecting any player-visible balance duration.
const EGG_WORK_TOLERANCE_MS = 1;
// Feed is a percentage, so it must not share the millisecond tolerance above.
const FEED_VALUE_TOLERANCE = 1e-6;
const MAX_PEN_TIMELINE_EVENTS = 20_000;

interface PenTimelineOptions {
  collectEggs: boolean;
  maxEggProgressMs: number;
  stopAfterAnimalEggId?: string;
}

interface PenTimelineResult {
  newDeaths: AnimalDeathNotificationSummary;
  feedDepletedAt: number | null;
  firstEggAtByAnimal: Record<string, number>;
}

function getSafeEggWorkTotal(animal: PenAnimalState): number {
  const definition = ANIMAL_CATALOG.find(
    (entry) => entry.id === animal.animalTypeId
  );
  return Math.max(1, definition?.eggIntervalMs || animal.eggWorkTotalMs || 1);
}

/**
 * Backfills legacy timestamp-only animals without moving an existing workload
 * anchor. eggWorkRemainingMs always belongs to eggLastUpdatedAt; callers must
 * advance the value before advancing that timestamp.
 */
function ensureAnimalEggWork(
  farm: FarmSaveState,
  animal: PenAnimalState,
  fallbackUpdatedAt: number,
  upperBoundAt: number = fallbackUpdatedAt
): void {
  const total = getSafeEggWorkTotal(animal);
  animal.eggWorkTotalMs = total;
  const workUpdatedAt = Number.isFinite(animal.eggLastUpdatedAt)
    ? Math.min(animal.eggLastUpdatedAt!, upperBoundAt)
    : fallbackUpdatedAt;

  if (!Number.isFinite(animal.eggWorkRemainingMs)) {
    const livingCount = getLivingAnimalCount(farm.penAnimals);
    const troughDurationMs = getNormalTroughDurationMs(livingCount);
    const feedValue = Math.max(0, Math.min(100, farm.penFeedBuffValue || 0));
    const feedUpdatedAt = Number.isFinite(farm.penFeedBuffUpdatedAt)
      ? Math.min(farm.penFeedBuffUpdatedAt, upperBoundAt)
      : workUpdatedAt;
    const feedEmptyAt = feedValue > 0 && troughDurationMs > 0
      ? feedUpdatedAt + (feedValue / 100) * troughDurationMs
      : feedUpdatedAt;
    const legacyNextEggAt = Number.isFinite(animal.nextEggAt)
      ? Math.max(workUpdatedAt, animal.nextEggAt)
      : workUpdatedAt + total;
    const workBeforeFeedSnapshot = Math.max(
      0,
      Math.min(legacyNextEggAt, feedUpdatedAt) - workUpdatedAt
    );
    const workFromFeedSnapshot = computeBaseWorkDone(
      Math.max(workUpdatedAt, feedUpdatedAt),
      legacyNextEggAt,
      feedEmptyAt,
      feedValue > 0 ? Math.max(0, farm.activeFeedSpeedBonus || 0) : 0
    );
    animal.eggWorkRemainingMs = Math.min(
      total,
      workBeforeFeedSnapshot + workFromFeedSnapshot
    );
  }

  animal.eggWorkRemainingMs = Math.min(
    total,
    Math.max(0, animal.eggWorkRemainingMs || 0)
  );
  animal.eggLastUpdatedAt = workUpdatedAt;
  const cycleStartedAt = Number.isFinite(animal.cycleStartedAt)
    ? animal.cycleStartedAt!
    : animal.addedAt;
  animal.cycleStartedAt = Math.min(workUpdatedAt, cycleStartedAt);
}

function cloneFarmForPenProjection(farm: FarmSaveState): FarmSaveState {
  return {
    ...farm,
    penAnimals: farm.penAnimals.map((animal) => ({ ...animal })),
  };
}

function recordProducedEgg(
  farm: FarmSaveState,
  animal: PenAnimalState,
  completedAt: number,
  weatherSeed: number
): void {
  const animalDefinition = ANIMAL_CATALOG.find(
    (entry) => entry.id === animal.animalTypeId
  );
  if (!animalDefinition) return;

  ensureEggQualityInventory(farm);
  const cycleStartedAt = animal.cycleStartedAt ?? animal.addedAt;
  const eggExposure = calculateWeatherExposure(
    cycleStartedAt,
    completedAt,
    weatherSeed
  );
  const eggQuality = rollQualityWithExposure(
    eggExposure.cool,
    getEggQualityRandom(
      weatherSeed,
      animal.instanceId,
      cycleStartedAt,
      completedAt
    )
  );
  const rainBonusGold = Math.round(
    animalDefinition.eggSellGold * (0.05 * eggExposure.rain)
  );
  const slotData = farm.eggQualityInventory![animalDefinition.eggTypeId][eggQuality];
  slotData.count += 1;
  slotData.rainGoldBonus += rainBonusGold;
  farm.inventory.eggs[animalDefinition.eggTypeId] =
    (farm.inventory.eggs[animalDefinition.eggTypeId] || 0) + 1;
}

/**
 * Canonical event timeline for feed consumption, egg workload, old age and
 * starvation. Feed and each egg workload enter the timeline at their own
 * authoritative updatedAt; current values are never treated as if they
 * belonged to farm.lastSettledAt. Presentation runs this on a clone while
 * settlement runs it on the persisted draft.
 */
function runPenTimeline(
  farm: FarmSaveState,
  startT: number,
  endT: number,
  weatherSeed: number,
  options: PenTimelineOptions
): PenTimelineResult {
  const newDeaths = createEmptyAnimalDeathSummary();
  const firstEggAtByAnimal: Record<string, number> = {};
  const safeStartT = Number.isFinite(startT) ? startT : endT;
  const safeEndT = Math.max(safeStartT, Number.isFinite(endT) ? endT : safeStartT);
  let feedValue = Number.isFinite(farm.penFeedBuffValue)
    ? Math.min(100, Math.max(0, farm.penFeedBuffValue || 0))
    : 0;
  const activeBonus = Number.isFinite(farm.activeFeedSpeedBonus)
    ? Math.max(0, farm.activeFeedSpeedBonus || 0)
    : 0;
  const feedUpdatedAt = Number.isFinite(farm.penFeedBuffUpdatedAt)
    ? Math.min(farm.penFeedBuffUpdatedAt, safeEndT)
    : safeStartT;
  let feedDepletedAt: number | null = feedValue <= FEED_VALUE_TOLERANCE
    ? Number.isFinite(farm.penStarvationStartedAt)
      ? farm.penStarvationStartedAt!
      : feedUpdatedAt
    : null;

  for (const animal of farm.penAnimals) {
    ensureAnimalEggWork(farm, animal, safeStartT, safeEndT);
  }

  const eggProgressBudgetMs = Number.isFinite(options.maxEggProgressMs)
    ? Math.max(0, options.maxEggProgressMs)
    : Number.POSITIVE_INFINITY;
  const eggProgressEndAtByAnimal = new Map<string, number>();
  for (const animal of farm.penAnimals) {
    const eggUpdatedAt = Number.isFinite(animal.eggLastUpdatedAt)
      ? Math.min(animal.eggLastUpdatedAt!, safeEndT)
      : safeStartT;
    animal.eggLastUpdatedAt = eggUpdatedAt;
    eggProgressEndAtByAnimal.set(
      animal.instanceId,
      Number.isFinite(eggProgressBudgetMs)
        ? Math.min(safeEndT, eggUpdatedAt + eggProgressBudgetMs)
        : safeEndT
    );
  }

  const eggAnchors = farm.penAnimals
    .filter((animal) => !isAnimalDead(animal))
    .map((animal) => animal.eggLastUpdatedAt!)
    .filter(Number.isFinite);
  const starvationAnchor = Number.isFinite(farm.penStarvationStartedAt)
    ? Math.min(farm.penStarvationStartedAt!, safeEndT)
    : safeEndT;
  let cursor = Math.min(
    safeStartT,
    feedUpdatedAt,
    starvationAnchor,
    ...(eggAnchors.length > 0 ? eggAnchors : [safeEndT])
  );

  let guard = 0;
  while (guard < MAX_PEN_TIMELINE_EVENTS) {
    guard += 1;
    let living = farm.penAnimals.filter(
      (animal) => !isAnimalDead(animal) && animal.addedAt <= cursor
    );
    if (living.length === 0) {
      if (cursor >= feedUpdatedAt) farm.penStarvationStartedAt = null;
      if (cursor >= safeEndT) break;
      const nextAnimalAddedAt = Math.min(
        ...farm.penAnimals
          .filter((animal) => !isAnimalDead(animal) && animal.addedAt > cursor)
          .map((animal) => animal.addedAt)
      );
      if (!Number.isFinite(nextAnimalAddedAt)) {
        // With no living or future livestock, both Feed and egg work are in an
        // intentional zero-rate segment through the requested end timestamp.
        cursor = safeEndT;
        break;
      }
      cursor = Math.min(safeEndT, nextAnimalAddedAt);
      continue;
    }

    // Old age wins an exact timestamp tie with starvation.
    const dueOldAge = living.filter((animal) => animal.lifeEndsAt <= cursor);
    if (dueOldAge.length > 0) {
      dueOldAge.forEach((animal) =>
        materializeAnimalDeath(animal, animal.lifeEndsAt, "old_age", newDeaths)
      );
      living = farm.penAnimals.filter(
        (animal) => !isAnimalDead(animal) && animal.addedAt <= cursor
      );
      if (living.length === 0) continue;
    }

    const feedClockActive = cursor >= feedUpdatedAt;
    if (feedClockActive) {
      if (feedValue <= FEED_VALUE_TOLERANCE) {
        feedValue = 0;
        feedDepletedAt ??= cursor;
        if (!Number.isFinite(farm.penStarvationStartedAt)) {
          farm.penStarvationStartedAt = cursor;
        }
      } else {
        farm.penStarvationStartedAt = null;
      }
    }

    const starvationDeadlineAt = feedClockActive && feedValue <= 0
      ? getStarvationDeadlineAt(farm.penStarvationStartedAt)
      : null;
    if (starvationDeadlineAt !== null && starvationDeadlineAt <= cursor) {
      living
        .filter((animal) => !isAnimalDead(animal))
        .forEach((animal) =>
          materializeAnimalDeath(
            animal,
            starvationDeadlineAt,
            "starvation",
            newDeaths
          )
        );
      farm.penStarvationStartedAt = null;
      // Continue so a future animal (or the no-living zero-rate segment) is
      // handled explicitly instead of relying on a blanket final rebase.
      continue;
    }

    // Egg completion is processed only after same-timestamp deaths, matching
    // the existing rule that an egg must complete strictly before death.
    living
      .filter((animal) => {
        const eggProgressEndAt =
          eggProgressEndAtByAnimal.get(animal.instanceId) ?? safeEndT;
        return (
          animal.eggLastUpdatedAt! <= cursor &&
          cursor <= eggProgressEndAt &&
          (animal.eggWorkRemainingMs || 0) <= EGG_WORK_TOLERANCE_MS
        );
      })
      .forEach((animal) => {
        firstEggAtByAnimal[animal.instanceId] ??= cursor;
        if (options.collectEggs) {
          recordProducedEgg(farm, animal, cursor, weatherSeed);
        }
        const total = getSafeEggWorkTotal(animal);
        animal.cycleStartedAt = cursor;
        animal.eggWorkTotalMs = total;
        animal.eggWorkRemainingMs = total;
        animal.eggLastUpdatedAt = cursor;
      });

    const targetId = options.stopAfterAnimalEggId;
    if (targetId && firstEggAtByAnimal[targetId] !== undefined) {
      break;
    }

    if (cursor >= safeEndT) break;

    living = farm.penAnimals.filter(
      (animal) => !isAnimalDead(animal) && animal.addedAt <= cursor
    );
    const troughDurationMs = feedClockActive && feedValue > 0
      ? getNormalTroughDurationMs(living.length)
      : 0;
    const feedEmptyAt = feedClockActive && feedValue > 0 && troughDurationMs > 0
      ? cursor + (feedValue / 100) * troughDurationMs
      : Number.POSITIVE_INFINITY;
    const nextNaturalDeathAt = Math.min(
      ...living.map((animal) => animal.lifeEndsAt)
    );
    const nextStarvationAt = feedClockActive && feedValue <= 0
      ? getStarvationDeadlineAt(farm.penStarvationStartedAt) ?? Number.POSITIVE_INFINITY
      : Number.POSITIVE_INFINITY;
    const eggRate = feedClockActive && feedValue > 0 && activeBonus > 0
      ? 1 + activeBonus / 100
      : 1;
    const activeEggAnimals = living.filter((animal) => {
      const eggProgressEndAt =
        eggProgressEndAtByAnimal.get(animal.instanceId) ?? safeEndT;
      return animal.eggLastUpdatedAt! <= cursor && cursor < eggProgressEndAt;
    });
    const nextEggAt = Math.min(
      ...activeEggAnimals.map(
        (animal) =>
          cursor + Math.max(0, animal.eggWorkRemainingMs || 0) / eggRate
      )
    );
    const nextEggAnchorAt = Math.min(
      ...living
        .filter((animal) => animal.eggLastUpdatedAt! > cursor)
        .map((animal) => animal.eggLastUpdatedAt!)
    );
    const nextEggProgressEndAt = Math.min(
      ...activeEggAnimals.map(
        (animal) => eggProgressEndAtByAnimal.get(animal.instanceId) ?? safeEndT
      )
    );
    const nextFeedAnchorAt = feedUpdatedAt > cursor
      ? feedUpdatedAt
      : Number.POSITIVE_INFINITY;
    const nextAnimalAddedAt = Math.min(
      ...farm.penAnimals
        .filter((animal) => !isAnimalDead(animal) && animal.addedAt > cursor)
        .map((animal) => animal.addedAt)
    );
    const nextEventAt = Math.min(
      safeEndT,
      nextNaturalDeathAt,
      feedEmptyAt,
      nextStarvationAt,
      nextEggAt,
      nextEggAnchorAt,
      nextEggProgressEndAt,
      nextFeedAnchorAt,
      nextAnimalAddedAt
    );

    if (!Number.isFinite(nextEventAt) || nextEventAt <= cursor) {
      // A tiny positive work remainder can produce `cursor + delta === cursor`
      // at epoch-sized timestamps. Materialize that due-now completion on the
      // next loop pass; never escape and then move its anchor without its work.
      const dueNowEggs = activeEggAnimals.filter((animal) => {
        const remainingWork = Math.max(0, animal.eggWorkRemainingMs || 0);
        const completionDelayMs = remainingWork / eggRate;
        return (
          completionDelayMs <= EGG_WORK_TOLERANCE_MS ||
          cursor + completionDelayMs <= cursor
        );
      });
      if (dueNowEggs.length > 0) {
        for (const animal of dueNowEggs) {
          animal.eggWorkRemainingMs = 0;
          animal.eggLastUpdatedAt = cursor;
        }
        continue;
      }

      // Preserve the last actually processed cursor on unexpected no-progress.
      // The next settlement can safely resume from the independent anchors.
      break;
    }
    const elapsedMs = nextEventAt - cursor;
    if (feedValue > 0 && troughDurationMs > 0) {
      feedValue = Math.max(
        0,
        feedValue - (elapsedMs / troughDurationMs) * 100
      );
    }
    for (const animal of activeEggAnimals) {
      const eggProgressEndAt =
        eggProgressEndAtByAnimal.get(animal.instanceId) ?? safeEndT;
      const eggElapsedMs = Math.max(
        0,
        Math.min(nextEventAt, eggProgressEndAt) - cursor
      );
      if (eggElapsedMs > 0) {
        animal.eggWorkRemainingMs = Math.max(
          0,
          (animal.eggWorkRemainingMs || 0) - eggElapsedMs * eggRate
        );
        animal.eggLastUpdatedAt = Math.min(nextEventAt, eggProgressEndAt);
      }
    }
    cursor = nextEventAt;
  }

  const timelineReachedEnd = cursor >= safeEndT;

  // Only livestock that actually reached the intentional production cap may
  // cross the remaining zero-rate segment with unchanged work. Normal, dead,
  // target-projection, stalled and guard-stopped animals keep their own anchor.
  if (timelineReachedEnd) {
    for (const animal of farm.penAnimals) {
      if (isAnimalDead(animal)) continue;
      const eggProgressEndAt =
        eggProgressEndAtByAnimal.get(animal.instanceId) ?? safeEndT;
      const reachedProductionCap =
        eggProgressEndAt < safeEndT &&
        (animal.eggLastUpdatedAt || 0) >=
          eggProgressEndAt - EGG_WORK_TOLERANCE_MS;
      if (reachedProductionCap) animal.eggLastUpdatedAt = safeEndT;
    }
  }
  // Keep full precision in the canonical value. Rounding here would make the
  // projected empty timestamp drift a few milliseconds on every render.
  feedValue = Math.max(0, feedValue);
  farm.penFeedBuffValue = feedValue;
  // Feed value and timestamp stay paired. A target projection or an unexpected
  // stall must not claim consumption through time the loop never processed.
  farm.penFeedBuffUpdatedAt = timelineReachedEnd
    ? safeEndT
    : Math.max(feedUpdatedAt, Math.min(cursor, safeEndT));
  if (feedValue <= 0) {
    farm.penFeedBuffValue = 0;
    farm.activeFeedSpeedBonus = 0;
    if (getLivingAnimalCount(farm.penAnimals) === 0) farm.penStarvationStartedAt = null;
  } else {
    farm.penStarvationStartedAt = null;
  }

  return { newDeaths, feedDepletedAt, firstEggAtByAnimal };
}

export function projectAnimalNextEggAt(
  farm: FarmSaveState,
  animalId: string,
  now: number,
  weatherSeed: number
): number {
  const sourceAnimal = farm.penAnimals.find(
    (animal) => animal.instanceId === animalId
  );
  if (!sourceAnimal || isAnimalDead(sourceAnimal)) {
    return Number.isFinite(sourceAnimal?.deathAt) ? sourceAnimal!.deathAt! : now;
  }
  const remainingWork = Math.max(0, sourceAnimal.eggWorkRemainingMs || 0);
  const horizon = now + Math.max(1, remainingWork + 1);
  const projected = cloneFarmForPenProjection(farm);
  const result = runPenTimeline(projected, now, horizon, weatherSeed, {
    collectEggs: false,
    maxEggProgressMs: Number.POSITIVE_INFINITY,
    stopAfterAnimalEggId: animalId,
  });
  const completedAt = result.firstEggAtByAnimal[animalId];
  if (Number.isFinite(completedAt)) return completedAt;
  const projectedAnimal = projected.penAnimals.find(
    (animal) => animal.instanceId === animalId
  );
  if (Number.isFinite(projectedAnimal?.deathAt)) return projectedAnimal!.deathAt!;
  return horizon;
}

function projectFeedEmptyAt(
  farm: FarmSaveState,
  now: number,
  weatherSeed: number
): number | null {
  if (farm.penFeedBuffValue <= 0 || getLivingAnimalCount(farm.penAnimals) <= 0) {
    return null;
  }
  const latestLifeEndsAt = Math.max(
    now,
    ...farm.penAnimals
      .filter((animal) => !isAnimalDead(animal))
      .map((animal) => Number.isFinite(animal.lifeEndsAt) ? animal.lifeEndsAt : now)
  );
  const projected = cloneFarmForPenProjection(farm);
  const result = runPenTimeline(
    projected,
    now,
    latestLifeEndsAt + 1,
    weatherSeed,
    { collectEggs: false, maxEggProgressMs: 0 }
  );
  return Number.isFinite(result.feedDepletedAt) ? result.feedDepletedAt : null;
}

function refreshPenDerivedState(
  farm: FarmSaveState,
  now: number,
  weatherSeed: number
): number | null {
  for (const animal of farm.penAnimals) {
    ensureAnimalEggWork(farm, animal, now);
  }
  for (const animal of farm.penAnimals) {
    animal.isBuffed =
      !isAnimalDead(animal) &&
      farm.penFeedBuffValue > 0 &&
      (farm.activeFeedSpeedBonus || 0) > 0;
    // nextEggAt is derived compatibility state. The remaining workload and
    // eggLastUpdatedAt above remain the authoritative cycle snapshot.
    animal.nextEggAt = projectAnimalNextEggAt(
      farm,
      animal.instanceId,
      now,
      weatherSeed
    );
  }
  return projectFeedEmptyAt(farm, now, weatherSeed);
}

/**
 * A canonical amount/workload must never be pulled into an untrusted future.
 * Preserve the value and move only impossible future anchors back to the
 * caller's trusted wall-clock before settlement or a pen transaction.
 */
function repairPenFutureClockSkew(
  farm: FarmSaveState,
  trustedAt: number
): void {
  if (Number.isFinite(farm.lastSettledAt) && farm.lastSettledAt > trustedAt) {
    farm.lastSettledAt = trustedAt;
  }
  if (
    Number.isFinite(farm.penFeedBuffUpdatedAt) &&
    farm.penFeedBuffUpdatedAt > trustedAt
  ) {
    farm.penFeedBuffUpdatedAt = trustedAt;
  }
  if (
    Number.isFinite(farm.penStarvationStartedAt) &&
    farm.penStarvationStartedAt! > trustedAt
  ) {
    farm.penStarvationStartedAt = trustedAt;
  }
  for (const animal of farm.penAnimals) {
    if (
      !isAnimalDead(animal) &&
      Number.isFinite(animal.eggLastUpdatedAt) &&
      animal.eggLastUpdatedAt! > trustedAt
    ) {
      animal.eggLastUpdatedAt = trustedAt;
    }
  }
}

function getPenTransactionTimestamp(
  farm: FarmSaveState,
  requestedAt: number
): number {
  const transactionAt = Number.isFinite(requestedAt)
    ? requestedAt
    : Date.now();
  repairPenFutureClockSkew(farm, transactionAt);
  return transactionAt;
}

function penTimelineNeedsSettlement(
  farm: FarmSaveState,
  transactionAt: number
): boolean {
  if (!Number.isFinite(farm.lastSettledAt) || farm.lastSettledAt < transactionAt) {
    return true;
  }
  if (
    !Number.isFinite(farm.penFeedBuffUpdatedAt) ||
    farm.penFeedBuffUpdatedAt < transactionAt
  ) {
    return true;
  }
  return farm.penAnimals.some(
    (animal) =>
      !isAnimalDead(animal) &&
      (!Number.isFinite(animal.eggLastUpdatedAt) ||
        animal.eggLastUpdatedAt! < transactionAt)
  );
}

function settlePenAnimals(
  farm: FarmSaveState,
  startT: number,
  endT: number,
  weatherSeed: number
): AnimalDeathNotificationSummary {
  const result = runPenTimeline(farm, startT, endT, weatherSeed, {
    collectEggs: true,
    maxEggProgressMs: MAX_OFFLINE_EGG_PRODUCTION_MS,
  });
  refreshPenDerivedState(farm, endT, weatherSeed);
  return result.newDeaths;
}

export interface PenPresentationProjection {
  penAnimals: PenAnimalState[];
  penFeedBuffValue: number;
  activeFeedSpeedBonus: number;
  penStarvationStartedAt: number | null;
  penFeedEmptyAt: number | null;
}

/** Pure pen projection backed by the same event timeline as settlement. */
export function projectPenState(
  farm: FarmSaveState,
  now: number
): PenPresentationProjection {
  const projected = cloneFarmForPenProjection(farm);
  const currentNow = Number.isFinite(now) ? now : farm.lastSettledAt;
  const startT = Number.isFinite(farm.lastSettledAt)
    ? Math.min(farm.lastSettledAt, currentNow)
    : currentNow;
  const weatherSeed = farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED;
  runPenTimeline(projected, startT, currentNow, weatherSeed, {
    collectEggs: false,
    maxEggProgressMs: MAX_OFFLINE_EGG_PRODUCTION_MS,
  });
  const penFeedEmptyAt = refreshPenDerivedState(
    projected,
    currentNow,
    weatherSeed
  );
  return {
    penAnimals: projected.penAnimals,
    penFeedBuffValue: projected.penFeedBuffValue,
    activeFeedSpeedBonus: projected.activeFeedSpeedBonus || 0,
    penStarvationStartedAt: projected.penStarvationStartedAt ?? null,
    penFeedEmptyAt,
  };
}

export function consumePendingAnimalDeathNotification(
  farm: FarmSaveState
): AnimalDeathNotificationSummary | null {
  const pending = farm.pendingAnimalDeathNotification;
  farm.pendingAnimalDeathNotification = null;
  return pending && pending.total > 0 ? pending : null;
}

const HOUR_MS = 60 * 60 * 1000;
const SETTLEMENT_EPSILON = 1e-7;
// Growth work is stored as floating-point milliseconds. At large wall-clock
// timestamps, sub-millisecond residuals can become smaller than the next
// representable timestamp delta and otherwise leave a crop stuck at "0s".
// Treat <= 1 ms of remaining work as complete; this is negligible for gameplay
// timing and makes the Growing -> Ready transition numerically stable.
const GROWTH_COMPLETION_TOLERANCE_MS = 1;
const MAX_PLOT_SETTLEMENT_SEGMENTS = 20_000;
const TIMELINE_BOUNDARY_TOLERANCE_MS = 1e-6;

function escalateMoisturePenalty(
  current: "none" | "no_rare_perfect" | "common_only",
  moisture: number
): "none" | "no_rare_perfect" | "common_only" {
  if (current === "common_only" || moisture <= SETTLEMENT_EPSILON) {
    return "common_only";
  }
  if (current === "no_rare_perfect" || moisture < 20) {
    return "no_rare_perfect";
  }
  return "none";
}

function getCropCoolExposure(plot: Extract<FarmPlotState, { status: "growing" | "ready" }>): number {
  if (plot.status === "ready") return plot.weatherExposure?.cool || 0;
  const totalExposureMs = Object.values(plot.weatherExposureMs).reduce(
    (sum, duration) => sum + duration,
    0
  );
  return totalExposureMs > 0 ? plot.weatherExposureMs.cool / totalExposureMs : 0;
}

export function resolveCropQuality(
  plot: Extract<FarmPlotState, { status: "growing" | "ready" }>
): ItemQuality {
  if (plot.qualityPenalty === "common_only") return "thuong";
  if (
    plot.qualityPenalty === "none" &&
    plot.pestDamageLevel === "none" &&
    plot.rolledQuality
  ) {
    return plot.rolledQuality;
  }
  return rollQualityWithExposure(
    getCropCoolExposure(plot),
    plot.qualityRoll,
    plot.qualityPenalty,
    plot.pestDamageLevel !== "none"
  );
}

function completeGrowingPlot(
  plot: Extract<FarmPlotState, { status: "growing" }>,
  completedAt: number
): Extract<FarmPlotState, { status: "ready" }> {
  const totalExposureMs = Math.max(
    1,
    Object.values(plot.weatherExposureMs).reduce((sum, duration) => sum + duration, 0)
  );
  const weatherExposure: WeatherExposureData = {
    sunny: plot.weatherExposureMs.sunny / totalExposureMs,
    calm: plot.weatherExposureMs.calm / totalExposureMs,
    rain: plot.weatherExposureMs.rain / totalExposureMs,
    cool: plot.weatherExposureMs.cool / totalExposureMs,
  };
  const readyPlot: Extract<FarmPlotState, { status: "ready" }> = {
    status: "ready",
    soilMoisture: plot.soilMoisture,
    soilMoistureUpdatedAt: completedAt,
    lastFertilizerId: plot.lastFertilizerId,
    cropId: plot.cropId,
    plantedAt: plot.plantedAt,
    growthCompletedAt: completedAt,
    fertilizerId: plot.fertilizerId,
    fertilizerXpBonusPct: plot.fertilizerXpBonusPct,
    growthTimeReductionPct: plot.growthTimeReductionPct,
    weatherExposure,
    rainGoldBonusPct: 0.05 * weatherExposure.rain,
    qualityPenalty: plot.qualityPenalty,
    qualityRoll: plot.qualityRoll,
    pestPressure: plot.pestPressure,
    pestUpdatedAt: plot.pestUpdatedAt,
    pestOutbreakAt: plot.pestOutbreakAt,
    pestDamageLevel: plot.pestDamageLevel,
  };
  readyPlot.rolledQuality = resolveCropQuality(readyPlot);
  return readyPlot;
}

type PlotTimelineTarget =
  | { kind: "timestamp"; endAt: number }
  | { kind: "crop_completion" };

/** Shared event-segment core for persisted settlement and pure ETA projection. */
function advancePlotTimeline(
  sourcePlot: FarmPlotState,
  target: PlotTimelineTarget,
  weatherSeed: number
): FarmPlotState {
  if (sourcePlot.status === "locked") return sourcePlot;

  let plot: FarmPlotState = sourcePlot.status === "growing"
    ? { ...sourcePlot, weatherExposureMs: { ...sourcePlot.weatherExposureMs } }
    : { ...sourcePlot };
  const latestStateAt = plot.status === "growing"
    ? Math.max(plot.soilMoistureUpdatedAt, plot.growthLastUpdatedAt)
    : plot.soilMoistureUpdatedAt;
  let cursor = target.kind === "timestamp"
    ? Math.min(target.endAt, latestStateAt)
    : latestStateAt;
  plot.soilMoisture = snapSoilMoistureToThreshold(plot.soilMoisture);
  plot.soilMoistureUpdatedAt = cursor;
  if (plot.status === "growing") plot.growthLastUpdatedAt = cursor;
  if (plot.status === "growing" || plot.status === "ready") {
    plot.pestPressure = clampPestPressure(plot.pestPressure);
    if (plot.pestPressure < PEST_OUTBREAK_THRESHOLD) {
      plot.pestOutbreakAt = null;
    } else if (plot.pestOutbreakAt === null && cursor >= plot.pestUpdatedAt) {
      plot.pestOutbreakAt = Math.min(cursor, plot.pestUpdatedAt);
    }
    if (cursor >= plot.pestUpdatedAt) {
      plot.pestDamageLevel = escalatePestDamage(
        plot.pestDamageLevel,
        plot.pestPressure,
        plot.pestOutbreakAt,
        cursor
      );
    }
    plot.qualityPenalty = escalateMoisturePenalty(
      plot.qualityPenalty,
      plot.soilMoisture
    );
  }

  // Recovery path for saves/presentation states already carrying a tiny
  // floating-point remainder: materialize Ready even when cursor === now and
  // the event loop below would not execute.
  if (
    plot.status === "growing" &&
    plot.growthWorkRemainingMs <= GROWTH_COMPLETION_TOLERANCE_MS
  ) {
    plot.growthWorkRemainingMs = 0;
    plot = completeGrowingPlot(plot, cursor);
  }

  for (
    let guard = 0;
    (target.kind === "crop_completion"
      ? plot.status === "growing"
      : cursor < target.endAt) &&
      guard < MAX_PLOT_SETTLEMENT_SEGMENTS;
    guard += 1
  ) {
    if (
      plot.status === "growing" &&
      plot.growthWorkRemainingMs <= GROWTH_COMPLETION_TOLERANCE_MS
    ) {
      plot.growthWorkRemainingMs = 0;
      plot = completeGrowingPlot(plot, cursor);
      if (target.kind === "crop_completion") break;
      continue;
    }

    const slot = getCanonicalWeatherSlot(cursor, weatherSeed);
    const moistureRatePerHour = getSoilMoistureRatePerHour(
      slot.season,
      slot.phase,
      slot.weather
    );
    const cropPlot = plot.status === "growing" || plot.status === "ready"
      ? plot
      : null;
    const pestIsActive = cropPlot !== null && cursor >= cropPlot.pestUpdatedAt;
    if (cropPlot && pestIsActive) {
      if (
        cropPlot.pestPressure >= PEST_OUTBREAK_THRESHOLD &&
        cropPlot.pestOutbreakAt === null
      ) {
        cropPlot.pestPressure = PEST_OUTBREAK_THRESHOLD;
        cropPlot.pestOutbreakAt = cursor;
      }
      cropPlot.pestDamageLevel = escalatePestDamage(
        cropPlot.pestDamageLevel,
        cropPlot.pestPressure,
        cropPlot.pestOutbreakAt,
        cursor
      );
    }
    const growthRate = plot.status === "growing"
      ? getNextMoistureSegmentGrowthRate(
          plot.soilMoisture,
          moistureRatePerHour
        ) *
        getWeatherGrowthRate(slot.weather) *
        (pestIsActive ? getPestGrowthRate(plot, cursor) : 1)
      : 0;
    const pestRatePerHour = cropPlot &&
      pestIsActive &&
      cropPlot.pestPressure < PEST_OUTBREAK_THRESHOLD
      ? getPestRatePerHour(slot.season, slot.weather)
      : 0;
    const nextThreshold = getNextSoilMoistureThreshold(
      plot.soilMoisture,
      moistureRatePerHour
    );
    const thresholdAt = nextThreshold === null || moistureRatePerHour === 0
      ? Number.POSITIVE_INFINITY
      : cursor + Math.abs((nextThreshold - plot.soilMoisture) / moistureRatePerHour) * HOUR_MS;
    const growthCompletesAt = plot.status === "growing" && growthRate > 0
      ? cursor + plot.growthWorkRemainingMs / growthRate
      : Number.POSITIVE_INFINITY;
    const pestStartsAt = cropPlot && cursor < cropPlot.pestUpdatedAt
      ? cropPlot.pestUpdatedAt
      : Number.POSITIVE_INFINITY;
    const pestReachesOutbreakAt = cropPlot && pestRatePerHour > 0
      ? cursor +
        ((PEST_OUTBREAK_THRESHOLD - cropPlot.pestPressure) / pestRatePerHour) * HOUR_MS
      : Number.POSITIVE_INFINITY;
    const pestDamageBoundaryAt = cropPlot && pestIsActive
      ? getNextPestDamageBoundaryAt(
          cropPlot.pestPressure,
          cropPlot.pestOutbreakAt,
          cursor
        )
      : Number.POSITIVE_INFINITY;
    const nextEventAt = Math.min(
      slot.endMs,
      thresholdAt,
      pestStartsAt,
      pestReachesOutbreakAt,
      pestDamageBoundaryAt,
      growthCompletesAt
    );
    const segmentEnd = target.kind === "timestamp"
      ? Math.min(target.endAt, nextEventAt)
      : nextEventAt;
    if (!Number.isFinite(segmentEnd)) break;

    if (segmentEnd <= cursor) {
      let materializedBoundary = false;

      if (
        nextThreshold !== null &&
        thresholdAt <= cursor + TIMELINE_BOUNDARY_TOLERANCE_MS
      ) {
        plot.soilMoisture = nextThreshold;
        plot.soilMoistureUpdatedAt = cursor;
        materializedBoundary = true;
      }

      if (
        cropPlot &&
        pestStartsAt <= cursor + TIMELINE_BOUNDARY_TOLERANCE_MS
      ) {
        cropPlot.pestUpdatedAt = cursor;
        materializedBoundary = true;
      }

      if (
        cropPlot &&
        pestReachesOutbreakAt <= cursor + TIMELINE_BOUNDARY_TOLERANCE_MS
      ) {
        cropPlot.pestPressure = PEST_OUTBREAK_THRESHOLD;
        cropPlot.pestOutbreakAt = cursor;
        cropPlot.pestUpdatedAt = cursor;
        materializedBoundary = true;
      }

      if (
        cropPlot &&
        pestDamageBoundaryAt <= cursor + TIMELINE_BOUNDARY_TOLERANCE_MS
      ) {
        cropPlot.pestDamageLevel = escalatePestDamage(
          cropPlot.pestDamageLevel,
          cropPlot.pestPressure,
          cropPlot.pestOutbreakAt,
          cursor
        );
        materializedBoundary = true;
      }

      if (
        plot.status === "growing" &&
        growthCompletesAt <= cursor + TIMELINE_BOUNDARY_TOLERANCE_MS
      ) {
        plot.growthWorkRemainingMs = 0;
        plot = completeGrowingPlot(plot, cursor);
        materializedBoundary = true;
      }

      if (!materializedBoundary) break;
      continue;
    }

    const durationMs = segmentEnd - cursor;
    const startingMoisture = plot.soilMoisture;
    if (plot.status === "growing") {
      plot.weatherExposureMs[slot.weather] += durationMs;
      plot.growthWorkRemainingMs = Math.max(
        0,
        plot.growthWorkRemainingMs - durationMs * growthRate
      );
      plot.growthLastUpdatedAt = segmentEnd;
    }
    const reachedMoistureThreshold = nextThreshold !== null &&
      Math.abs(segmentEnd - thresholdAt) <= TIMELINE_BOUNDARY_TOLERANCE_MS;
    plot.soilMoisture = reachedMoistureThreshold
      ? nextThreshold!
      : snapSoilMoistureToThreshold(
          startingMoisture + (durationMs / HOUR_MS) * moistureRatePerHour
        );
    plot.soilMoistureUpdatedAt = segmentEnd;

    if (cropPlot && pestIsActive) {
      const startingPressure = cropPlot.pestPressure;
      cropPlot.pestPressure = clampPestPressure(
        startingPressure + (durationMs / HOUR_MS) * pestRatePerHour
      );
      cropPlot.pestUpdatedAt = segmentEnd;
      if (
        startingPressure < PEST_OUTBREAK_THRESHOLD &&
        cropPlot.pestPressure >= PEST_OUTBREAK_THRESHOLD - SETTLEMENT_EPSILON
      ) {
        cropPlot.pestPressure = PEST_OUTBREAK_THRESHOLD;
        cropPlot.pestOutbreakAt = segmentEnd;
      }
      cropPlot.pestDamageLevel = escalatePestDamage(
        cropPlot.pestDamageLevel,
        cropPlot.pestPressure,
        cropPlot.pestOutbreakAt,
        segmentEnd
      );
    }

    if (plot.status === "growing" || plot.status === "ready") {
      const driestMoisture = moistureRatePerHour < 0
        ? plot.soilMoisture
        : startingMoisture;
      plot.qualityPenalty = escalateMoisturePenalty(
        plot.qualityPenalty,
        driestMoisture
      );
    }

    cursor = segmentEnd;
    if (
      plot.status === "growing" &&
      plot.growthWorkRemainingMs <= GROWTH_COMPLETION_TOLERANCE_MS
    ) {
      plot.growthWorkRemainingMs = 0;
      plot = completeGrowingPlot(plot, cursor);
      if (target.kind === "crop_completion") break;
    }
  }

  // Last-resort numerical recovery in case the loop ended exactly on `now`
  // with only a sub-millisecond floating-point remainder.
  if (
    plot.status === "growing" &&
    plot.growthWorkRemainingMs <= GROWTH_COMPLETION_TOLERANCE_MS
  ) {
    plot.growthWorkRemainingMs = 0;
    plot = completeGrowingPlot(plot, cursor);
  }

  const finalizedAt = target.kind === "timestamp"
    ? Math.min(target.endAt, cursor)
    : cursor;
  plot.soilMoistureUpdatedAt = finalizedAt;
  if (plot.status === "growing") plot.growthLastUpdatedAt = finalizedAt;
  if (plot.status === "growing" || plot.status === "ready") {
    if (finalizedAt >= plot.pestUpdatedAt) {
      plot.pestPressure = clampPestPressure(plot.pestPressure);
      if (
        plot.pestPressure >= PEST_OUTBREAK_THRESHOLD &&
        plot.pestOutbreakAt === null
      ) {
        plot.pestPressure = PEST_OUTBREAK_THRESHOLD;
        plot.pestOutbreakAt = plot.pestUpdatedAt;
      }
      plot.pestDamageLevel = escalatePestDamage(
        plot.pestDamageLevel,
        plot.pestPressure,
        plot.pestOutbreakAt,
        finalizedAt
      );
      plot.pestUpdatedAt = finalizedAt;
    }
    if (plot.status === "ready") plot.rolledQuality = resolveCropQuality(plot);
  }
  return plot;
}

function clampFuturePlotTimestamps(
  sourcePlot: FarmPlotState,
  now: number
): FarmPlotState {
  if (sourcePlot.status === "locked") return sourcePlot;

  const plot: FarmPlotState = sourcePlot.status === "growing"
    ? { ...sourcePlot, weatherExposureMs: { ...sourcePlot.weatherExposureMs } }
    : { ...sourcePlot };
  const clampTimestamp = (value: number): number =>
    Number.isFinite(value) ? Math.min(value, now) : now;
  plot.soilMoistureUpdatedAt = clampTimestamp(plot.soilMoistureUpdatedAt);

  if (plot.status === "growing") {
    plot.growthLastUpdatedAt = clampTimestamp(plot.growthLastUpdatedAt);
  }
  if (plot.status === "growing" || plot.status === "ready") {
    plot.plantedAt = clampTimestamp(plot.plantedAt);
    plot.pestUpdatedAt = clampTimestamp(plot.pestUpdatedAt);
    if (plot.pestOutbreakAt !== null) {
      plot.pestOutbreakAt = Number.isFinite(plot.pestOutbreakAt)
        ? Math.min(plot.pestOutbreakAt, now)
        : null;
    }
    if (plot.status === "ready") {
      plot.growthCompletedAt = clampTimestamp(plot.growthCompletedAt);
    }
  }
  return plot;
}

/**
 * Pure event-segment settlement for one unlocked plot. Boundaries are weather
 * slots, moisture bands, Pest outbreak/damage and growth completion; no
 * per-second/per-minute loop is used. Empty plots only settle soil moisture,
 * while Growing and Ready crops share the complete Pest timeline.
 */
export function settlePlotState(
  sourcePlot: FarmPlotState,
  _plotIndex: number,
  now: number,
  weatherSeed: number = DEFAULT_FARM_WEATHER_SEED
): FarmPlotState {
  const transactionNow = Number.isFinite(now) ? now : Date.now();
  return advancePlotTimeline(
    clampFuturePlotTimestamps(sourcePlot, transactionNow),
    { kind: "timestamp", endAt: transactionNow },
    weatherSeed
  );
}

export function getCropGrowthProgress(plot: FarmPlotState): number {
  if (plot.status === "ready") return 1;
  if (plot.status !== "growing") return 0;
  return Math.max(
    0,
    Math.min(1, 1 - plot.growthWorkRemainingMs / Math.max(1, plot.growthWorkTotalMs))
  );
}

export function getCurrentCropRemainingDurationMs(
  plot: FarmPlotState,
  now: number,
  weatherSeed: number = DEFAULT_FARM_WEATHER_SEED
): number | null {
  if (plot.status !== "growing") return 0;
  const transactionNow = Number.isFinite(now) ? now : Date.now();
  const completionAt = getProjectedCropCompletionAt(
    plot,
    transactionNow,
    weatherSeed
  );
  if (completionAt === null || !Number.isFinite(completionAt)) return null;
  return Math.max(0, completionAt - transactionNow);
}

/**
 * Forecasts crop completion without mutating the source plot. The projection
 * runs the same weather/moisture/Pest event segments used by settlement.
 */
export function getProjectedCropCompletionAt(
  plot: FarmPlotState,
  now: number,
  weatherSeed: number = DEFAULT_FARM_WEATHER_SEED
): number | null {
  const transactionNow = Number.isFinite(now) ? now : Date.now();
  if (plot.status === "ready") {
    return Number.isFinite(plot.growthCompletedAt)
      ? Math.min(plot.growthCompletedAt, transactionNow)
      : null;
  }
  if (plot.status !== "growing") return null;
  const currentPlot = settlePlotState(plot, 0, transactionNow, weatherSeed);
  if (currentPlot.status === "ready") {
    return Number.isFinite(currentPlot.growthCompletedAt)
      ? currentPlot.growthCompletedAt
      : null;
  }
  if (currentPlot.status !== "growing") return null;

  const projectedPlot = advancePlotTimeline(
    currentPlot,
    { kind: "crop_completion" },
    weatherSeed
  );
  return projectedPlot.status === "ready" &&
    Number.isFinite(projectedPlot.growthCompletedAt)
    ? projectedPlot.growthCompletedAt
    : null;
}

/** Settles the whole Farm to wall-clock `now`. */
export function settleFarmState(farm: FarmSaveState, now: number): FarmSettlementResult {
  const currentNow = Number.isFinite(now) ? now : Date.now();
  repairPenFutureClockSkew(farm, currentNow);
  const previousSettledAt = Number.isFinite(farm.lastSettledAt)
    ? Math.min(farm.lastSettledAt, currentNow)
    : currentNow;
  if (!Number.isFinite(farm.weatherSeed)) farm.weatherSeed = DEFAULT_FARM_WEATHER_SEED;
  const weatherSeed = farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED;

  for (let plotIndex = 0; plotIndex < farm.plots.length; plotIndex += 1) {
    farm.plots[plotIndex] = settlePlotState(
      farm.plots[plotIndex],
      plotIndex,
      currentNow,
      weatherSeed
    );
  }

  // Settle livestock lifecycle, Feed/Danger and eggs along one timestamp timeline.
  const startT = previousSettledAt;
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

export function canWaterPlot(plot: FarmPlotState): boolean {
  return plot.status !== "locked" && plot.soilMoisture < 100 - SETTLEMENT_EPSILON;
}

export function hasCropFertilizer(plot: FarmPlotState): boolean {
  return (
    (plot.status === "growing" || plot.status === "ready") &&
    Boolean(
      plot.fertilizerId ||
        (plot.fertilizerXpBonusPct || 0) > 0 ||
        (plot.growthTimeReductionPct || 0) > 0
    )
  );
}

/** Manual toolbar action for exactly one selected unlocked plot. */
export function waterSelectedPlot(
  farm: FarmSaveState,
  plotIndex: number,
  now: number
): { success: boolean; moistureAdded: number; message: string } {
  const plot = farm.plots[plotIndex];
  if (!plot || plot.status === "locked") {
    return { success: false, moistureAdded: 0, message: "Ô đất không hợp lệ!" };
  }
  const before = clampSoilMoisture(plot.soilMoisture);
  if (plot.status === "growing" || plot.status === "ready") {
    plot.qualityPenalty = escalateMoisturePenalty(
      plot.qualityPenalty,
      before
    );
  }
  if (before >= 100 - SETTLEMENT_EPSILON) {
    return { success: false, moistureAdded: 0, message: "Đất đã đủ ẩm 100%!" };
  }
  plot.soilMoisture = clampSoilMoisture(before + MANUAL_WATER_AMOUNT);
  plot.soilMoistureUpdatedAt = now;
  if (plot.status === "growing") plot.growthLastUpdatedAt = now;
  if (plot.status === "ready") plot.rolledQuality = resolveCropQuality(plot);
  const moistureAdded = plot.soilMoisture - before;
  return {
    success: true,
    moistureAdded,
    message: `Đã tưới Ô đất #${plotIndex + 1}: +${Math.round(moistureAdded)}% độ ẩm.`,
  };
}

/** Settles first, then treats only a selected crop whose pressure is actionable. */
export function treatPestOnSelectedPlot(
  farm: FarmSaveState,
  plotIndex: number,
  now: number
): { success: boolean; message: string } {
  const sourcePlot = farm.plots[plotIndex];
  if (!sourcePlot) {
    return { success: false, message: "Ô đất không hợp lệ!" };
  }

  const settledPlot = settlePlotState(
    sourcePlot,
    plotIndex,
    now,
    farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED
  );
  farm.plots[plotIndex] = settledPlot;
  if (
    (settledPlot.status !== "growing" && settledPlot.status !== "ready") ||
    !canTreatPest(settledPlot)
  ) {
    return { success: false, message: "Ô cây chưa cần diệt sâu!" };
  }

  settledPlot.pestPressure = PEST_TREAT_RESET_PRESSURE;
  settledPlot.pestUpdatedAt = now;
  settledPlot.pestOutbreakAt = null;
  if (settledPlot.status === "ready") {
    settledPlot.rolledQuality = resolveCropQuality(settledPlot);
  }
  return { success: true, message: "Đã diệt sâu cho cây trồng!" };
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
  if (plot.soilMoisture < MIN_PLANTING_SOIL_MOISTURE) {
    return {
      success: false,
      message: "Đất đang thiếu nước trầm trọng, hãy tưới nước trước rồi trồng cây sau",
    };
  }

  const seedCount = farm.inventory.seeds[cropId] || 0;
  if (seedCount <= 0) {
    return { success: false, message: "Bạn không có hạt giống loại này trong kho!" };
  }

  const cropDef = CROP_CATALOG.find((c) => c.id === cropId);
  if (!cropDef) return { success: false, message: "Loại cây trồng không tồn tại!" };

  const fertilizerDefinition = fertilizerId
    ? FERTILIZER_CATALOG.find((fertilizer) => fertilizer.id === fertilizerId)
    : null;
  if (fertilizerId && !fertilizerDefinition) {
    return { success: false, message: "Loại phân bón không hợp lệ!" };
  }

  if (fertilizerId) {
    if (!farm.inventory.fertilizer) {
      farm.inventory.fertilizer = createDefaultFarmState().inventory.fertilizer;
    }
    const fertCount = farm.inventory.fertilizer[fertilizerId] || 0;
    if (fertCount <= 0) {
      return { success: false, message: "Bạn đã hết loại phân bón này!" };
    }
    farm.inventory.fertilizer[fertilizerId] = fertCount - 1;
  }

  farm.inventory.seeds[cropId] = seedCount - 1;
  const xpBonusPct = fertilizerDefinition?.xpBonusPct || 0;
  const timeReductionPct = fertilizerDefinition?.growthTimeReductionPct || 0;
  // Fertilizer reduces workload first; dynamic moisture/weather rates are
  // multiplied over that effective workload during settlement.
  const effectiveGrowthMs = Math.max(
    1,
    Math.round(cropDef.growthMs * (1 - timeReductionPct))
  );
  const weatherSeed = farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED;

  farm.plots[plotIndex] = {
    status: "growing",
    soilMoisture: plot.soilMoisture,
    soilMoistureUpdatedAt: now,
    lastFertilizerId: fertilizerId,
    cropId,
    plantedAt: now,
    growthWorkTotalMs: effectiveGrowthMs,
    growthWorkRemainingMs: effectiveGrowthMs,
    growthLastUpdatedAt: now,
    fertilizerId,
    fertilizerXpBonusPct: xpBonusPct,
    growthTimeReductionPct: timeReductionPct,
    weatherExposureMs: { sunny: 0, calm: 0, rain: 0, cool: 0 },
    qualityPenalty: "none",
    qualityRoll: deterministicRandom(
      weatherSeed,
      "crop",
      plotIndex,
      cropId,
      now
    ),
    pestPressure: 0,
    pestUpdatedAt: now,
    pestOutbreakAt: null,
    pestDamageLevel: "none",
  };

  return {
    success: true,
    message: fertilizerId
      ? `Đã gieo ${cropDef.name} cùng phân bón!`
      : `Đã gieo ${cropDef.name}!`,
  };
}

/** Applies one owned fertilizer to only the remaining workload of a crop. */
export function applyFertilizerToGrowingCrop(
  farm: FarmSaveState,
  plotIndex: number,
  fertilizerId: FertilizerTypeId,
  now: number
): { success: boolean; message: string } {
  const plot = farm.plots[plotIndex];
  if (!plot || plot.status !== "growing") {
    return { success: false, message: "Chỉ có thể bón phân khi cây đang phát triển!" };
  }
  if (hasCropFertilizer(plot)) {
    return { success: false, message: "Cây này đã được bón phân và không thể bón lần hai!" };
  }
  const fertilizer = FERTILIZER_CATALOG.find((entry) => entry.id === fertilizerId);
  if (!fertilizer) return { success: false, message: "Loại phân bón không hợp lệ!" };
  const ownedCount = farm.inventory.fertilizer?.[fertilizerId] || 0;
  if (ownedCount <= 0) {
    return { success: false, message: "Bạn đã hết loại phân bón này!" };
  }

  farm.inventory.fertilizer[fertilizerId] = ownedCount - 1;
  const completedWork = Math.max(
    0,
    plot.growthWorkTotalMs - plot.growthWorkRemainingMs
  );
  const reducedRemainingWork = Math.max(
    0,
    plot.growthWorkRemainingMs * (1 - fertilizer.growthTimeReductionPct)
  );
  plot.growthWorkRemainingMs = reducedRemainingWork;
  plot.growthWorkTotalMs = completedWork + reducedRemainingWork;
  plot.growthLastUpdatedAt = now;
  plot.fertilizerId = fertilizerId;
  plot.lastFertilizerId = fertilizerId;
  plot.fertilizerXpBonusPct = fertilizer.xpBonusPct;
  plot.growthTimeReductionPct = fertilizer.growthTimeReductionPct;

  return { success: true, message: `Đã bón ${fertilizer.name} cho cây!` };
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
  fertilizerBonusXp: number;
  rainBonusGold: number;
  droughtPenaltyGold: number;
  pestPenaltyGold: number;
  quality: ItemQuality;
  qualityMultiplier: number;
  hasFertilizer: boolean;
}

function calculateCropHarvestReward(
  plot: Extract<FarmPlotState, { status: "ready" }>
): CropHarvestPreview | null {
  const cropDefinition = CROP_CATALOG.find((crop) => crop.id === plot.cropId);
  if (!cropDefinition) return null;
  const qualityPenalty = escalateMoisturePenalty(
    plot.qualityPenalty,
    plot.soilMoisture
  );
  const rewardPlot = qualityPenalty === plot.qualityPenalty
    ? plot
    : { ...plot, qualityPenalty };

  const fertilizerBonusXp = Math.round(
    cropDefinition.harvestXp * (plot.fertilizerXpBonusPct || 0)
  );
  const rainBonusGold = Math.round(
    cropDefinition.harvestGold *
      (plot.rainGoldBonusPct || 0.05 * (plot.weatherExposure?.rain || 0))
  );
  const quality = resolveCropQuality(rewardPlot);
  const qualityMultiplier = QUALITY_CONFIG[quality].multiplier;
  const preQualityGold = cropDefinition.harvestGold + rainBonusGold;
  const preQualityXp = cropDefinition.harvestXp + fertilizerBonusXp;
  const goldBeforeDroughtPenalty = applyQualityMultiplier(
    preQualityGold,
    qualityMultiplier
  );
  // Drought and historical Pest damage are independent Gold-only modifiers.
  const droughtGoldMultiplier = qualityPenalty === "common_only" ? 0.8 : 1;
  const goldAfterDroughtPenalty =
    goldBeforeDroughtPenalty * droughtGoldMultiplier;
  const pestGoldMultiplier = getPestGoldMultiplier(plot.pestDamageLevel);
  const goldEarned = Math.round(goldAfterDroughtPenalty * pestGoldMultiplier);
  const roundedGoldAfterDroughtPenalty = Math.round(goldAfterDroughtPenalty);

  return {
    cropName: cropDefinition.name,
    baseGold: cropDefinition.harvestGold,
    baseXp: cropDefinition.harvestXp,
    goldEarned,
    xpEarned: applyQualityMultiplier(preQualityXp, qualityMultiplier),
    fertilizerBonusXp,
    rainBonusGold,
    droughtPenaltyGold:
      goldBeforeDroughtPenalty - roundedGoldAfterDroughtPenalty,
    pestPenaltyGold: roundedGoldAfterDroughtPenalty - goldEarned,
    quality,
    qualityMultiplier,
    hasFertilizer: hasCropFertilizer(plot),
  };
}

/** Pure reward selector used by both the Ready panel and harvest previews. */
export function getCropHarvestPreview(
  farm: FarmSaveState,
  plotIndex: number,
  plotOverride?: FarmPlotState
): CropHarvestPreview | null {
  const plot = plotOverride ?? farm.plots[plotIndex];
  if (!plot || plot.status !== "ready") return null;

  return calculateCropHarvestReward(plot);
}

/**
 * Harvests a single ready crop plot.
 */
export function harvestPlot(
  farm: FarmSaveState,
  plotIndex: number,
  now: number
): {
  goldEarned: number;
  xpEarned: number;
  cropName: string;
  bonusGold: number;
  bonusXp: number;
  fertilizerBonusXp: number;
  rainBonusGold: number;
  droughtPenaltyGold: number;
  pestPenaltyGold: number;
  quality: ItemQuality;
  qualityMultiplier: number;
  weatherExposure?: WeatherExposureData;
  hasFertilizer: boolean;
  qualityBreakdown: QualityBreakdown;
} | null {
  const sourcePlot = farm.plots[plotIndex];
  if (!sourcePlot) return null;
  const plot = settlePlotState(
    sourcePlot,
    plotIndex,
    now,
    farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED
  );
  farm.plots[plotIndex] = plot;
  if (!plot || plot.status !== "ready") return null;

  const reward = calculateCropHarvestReward(plot);
  if (!reward) return null;
  const preQualityGold = reward.baseGold + reward.rainBonusGold;
  const preQualityXp = reward.baseXp + reward.fertilizerBonusXp;

  const weatherExposure = plot.weatherExposure;

  const qualityBreakdown = createEmptyQualityBreakdown();
  qualityBreakdown[reward.quality] = {
    quantity: 1,
    baseGold: preQualityGold,
    qualityBonusGold: reward.goldEarned - preQualityGold,
    gold: reward.goldEarned,
    baseXp: preQualityXp,
    qualityBonusXp: reward.xpEarned - preQualityXp,
    xp: reward.xpEarned,
  };

  farm.plots[plotIndex] = {
    status: "empty",
    soilMoisture: plot.soilMoisture,
    soilMoistureUpdatedAt: plot.soilMoistureUpdatedAt,
    lastFertilizerId: plot.lastFertilizerId,
  };
  farm.gold += reward.goldEarned;

  return {
    goldEarned: reward.goldEarned,
    xpEarned: reward.xpEarned,
    cropName: reward.cropName,
    bonusGold: reward.goldEarned - reward.baseGold,
    bonusXp: reward.xpEarned - reward.baseXp,
    fertilizerBonusXp: reward.fertilizerBonusXp,
    rainBonusGold: reward.rainBonusGold,
    droughtPenaltyGold: reward.droughtPenaltyGold,
    pestPenaltyGold: reward.pestPenaltyGold,
    quality: reward.quality,
    qualityMultiplier: reward.qualityMultiplier,
    weatherExposure,
    hasFertilizer: reward.hasFertilizer,
    qualityBreakdown,
  };
}

/**
 * Harvests all ready crops at current time `now`.
 */
export function harvestAllReadyCrops(
  farm: FarmSaveState,
  now: number
): {
  totalGold: number;
  totalXp: number;
  bonusGold: number;
  bonusXp: number;
  fertilizerBonusXp: number;
  rainBonusGold: number;
  droughtPenaltyGold: number;
  pestPenaltyGold: number;
  harvestedCount: number;
  details: Array<{
    plotIndex: number;
    cropId: CropId;
    cropName: string;
    goldAwarded: number;
    xpAwarded: number;
    hasFertilizer: boolean;
    rainBonusGold: number;
    droughtPenaltyGold: number;
    pestPenaltyGold: number;
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
  let fertilizerBonusXp = 0;
  let rainBonusGold = 0;
  let droughtPenaltyGold = 0;
  let pestPenaltyGold = 0;
  let harvestedCount = 0;
  const qualityBreakdown = createEmptyQualityBreakdown();
  const details: Array<{
    plotIndex: number;
    cropId: CropId;
    cropName: string;
    goldAwarded: number;
    xpAwarded: number;
    hasFertilizer: boolean;
    rainBonusGold: number;
    droughtPenaltyGold: number;
    pestPenaltyGold: number;
    quality: ItemQuality;
    qualityMultiplier: number;
    weatherExposure?: WeatherExposureData;
  }> = [];

  for (let i = 0; i < farm.plots.length; i++) {
    const plot = settlePlotState(
      farm.plots[i],
      i,
      now,
      farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED
    );
    farm.plots[i] = plot;
    if (plot.status === "ready") {
      const reward = calculateCropHarvestReward(plot);
      if (reward) {
        const preQualityGold = reward.baseGold + reward.rainBonusGold;
        const preQualityXp = reward.baseXp + reward.fertilizerBonusXp;

        totalGold += reward.goldEarned;
        totalXp += reward.xpEarned;
        bonusGold += reward.goldEarned - reward.baseGold;
        bonusXp += reward.xpEarned - reward.baseXp;
        fertilizerBonusXp += reward.fertilizerBonusXp;
        rainBonusGold += reward.rainBonusGold;
        droughtPenaltyGold += reward.droughtPenaltyGold;
        pestPenaltyGold += reward.pestPenaltyGold;

        harvestedCount++;
        qualityBreakdown[reward.quality].quantity += 1;
        qualityBreakdown[reward.quality].baseGold += preQualityGold;
        qualityBreakdown[reward.quality].qualityBonusGold += reward.goldEarned - preQualityGold;
        qualityBreakdown[reward.quality].gold += reward.goldEarned;
        qualityBreakdown[reward.quality].baseXp += preQualityXp;
        qualityBreakdown[reward.quality].qualityBonusXp += reward.xpEarned - preQualityXp;
        qualityBreakdown[reward.quality].xp += reward.xpEarned;

        details.push({
          plotIndex: i,
          cropId: plot.cropId,
          cropName: reward.cropName,
          goldAwarded: reward.goldEarned,
          xpAwarded: reward.xpEarned,
          hasFertilizer: reward.hasFertilizer,
          rainBonusGold: reward.rainBonusGold,
          droughtPenaltyGold: reward.droughtPenaltyGold,
          pestPenaltyGold: reward.pestPenaltyGold,
          quality: reward.quality,
          qualityMultiplier: reward.qualityMultiplier,
          weatherExposure: plot.weatherExposure,
        });
        farm.plots[i] = {
          status: "empty",
          soilMoisture: plot.soilMoisture,
          soilMoistureUpdatedAt: plot.soilMoistureUpdatedAt,
          lastFertilizerId: plot.lastFertilizerId,
        };
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
    fertilizerBonusXp,
    rainBonusGold,
    droughtPenaltyGold,
    pestPenaltyGold,
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
  now: number = Date.now()
): { success: boolean; message: string; quantityFed?: number } {
  const feedDef = FEED_CATALOG.find((f) => f.id === feedTypeId);
  if (!feedDef) return { success: false, message: "Loại thức ăn không hợp lệ!" };

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false, message: "Số lượng thức ăn phải là số nguyên dương!" };
  }

  // Materialize every independently anchored pen value with the old Feed and
  // old animal count before changing amount or speed. UI callers normally
  // arrive already settled, while direct calls and repaired v9 saves are safe.
  const transactionAt = getPenTransactionTimestamp(farm, now);
  if (penTimelineNeedsSettlement(farm, transactionAt)) {
    settleFarmState(farm, transactionAt);
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
  farm.penFeedBuffUpdatedAt = transactionAt;
  farm.penStarvationStartedAt = null;
  // A stronger feed and a same-bonus refill both change the future rate
  // segments. Remaining workload stays untouched; only the derived ETA moves.
  refreshPenDerivedState(
    farm,
    transactionAt,
    farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED
  );

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
  const requestedCount = Number.isFinite(count)
    ? Math.max(0, Math.floor(count))
    : 0;
  const soldCount = Math.min(currentCount, requestedCount);

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
  instanceId: string,
  now: number = Date.now()
): boolean {
  const transactionAt = getPenTransactionTimestamp(farm, now);
  if (penTimelineNeedsSettlement(farm, transactionAt)) {
    settleFarmState(farm, transactionAt);
  }
  const index = farm.penAnimals.findIndex((a) => a.instanceId === instanceId);
  if (index === -1) return false;

  farm.penAnimals.splice(index, 1);
  if (getLivingAnimalCount(farm.penAnimals) === 0) {
    farm.penStarvationStartedAt = null;
  }
  farm.penFeedBuffUpdatedAt = transactionAt;
  refreshPenDerivedState(
    farm,
    transactionAt,
    farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED
  );
  return true;
}

/**
 * Clears/Digs a plot (Xúc đất), removing any active crop.
 */
export function clearPlot(farm: FarmSaveState, plotIndex: number): boolean {
  if (plotIndex < 0 || plotIndex >= farm.plots.length) return false;
  const plot = farm.plots[plotIndex];
  if (plot.status === "locked") return false;

  const lastFertilizerId = plot.lastFertilizerId !== undefined
    ? plot.lastFertilizerId
    : plot.status === "growing" || plot.status === "ready"
      ? plot.fertilizerId
      : undefined;

  farm.plots[plotIndex] = {
    status: "empty",
    soilMoisture: plot.soilMoisture,
    soilMoistureUpdatedAt: plot.soilMoistureUpdatedAt,
    ...(lastFertilizerId !== undefined ? { lastFertilizerId } : {}),
  };
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
  const transactionAt = getPenTransactionTimestamp(farm, now);
  if (penTimelineNeedsSettlement(farm, transactionAt)) {
    settleFarmState(farm, transactionAt);
  }
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

  const hasBuff = (farm.penFeedBuffValue || 0) > 0;
  const activeBonus = hasBuff ? (farm.activeFeedSpeedBonus || 0) : 0;

  const newAnimal: PenAnimalState = {
    instanceId: `animal_${transactionAt}_${Math.floor(
      deterministicRandom(
        farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED,
        "animal-instance",
        animalId,
        transactionAt,
        farm.penAnimals.length
      ) * 36 ** 5
    )
      .toString(36)
      .padStart(5, "0")}`,
    animalTypeId: animalId,
    addedAt: transactionAt,
    cycleStartedAt: transactionAt,
    nextEggAt: transactionAt + animalDef.eggIntervalMs,
    eggWorkTotalMs: animalDef.eggIntervalMs,
    eggWorkRemainingMs: animalDef.eggIntervalMs,
    eggLastUpdatedAt: transactionAt,
    lifeStartedAt: transactionAt,
    lifeEndsAt: transactionAt + animalDef.lifespanMs,
    deathAt: null,
    deathCause: null,
    isBuffed: hasBuff && activeBonus > 0,
  };

  farm.penAnimals.push(newAnimal);
  farm.penFeedBuffUpdatedAt = transactionAt;
  if (hasBuff) farm.penStarvationStartedAt = null;
  else if (!Number.isFinite(farm.penStarvationStartedAt)) {
    farm.penStarvationStartedAt = transactionAt;
  }
  // Feed consumption changes from this exact count-change event. Existing
  // animals retain workload while all compatibility ETAs are re-derived.
  refreshPenDerivedState(
    farm,
    transactionAt,
    farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED
  );

  return {
    success: true,
    message: `Đã thả 1 ${animalDef.name} vào chuồng nuôi!`,
  };
}

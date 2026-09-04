import {
  ANIMAL_CATALOG,
  CROP_CATALOG,
  EGG_INFO_MAP,
  FEED_CATALOG,
  FERTILIZER_CATALOG,
} from "./farmCatalog";
import type {
  AnimalDeathCause,
  AnimalDeathNotificationSummary,
  AnimalTypeId,
  CropId,
  CropQualityPenalty,
  EggQualityInventory,
  EggTypeId,
  FarmInventory,
  FarmPlotState,
  FarmSaveState,
  FeedTypeId,
  FertilizerTypeId,
  ItemQuality,
  PestDamageLevel,
  PenAnimalState,
  WeatherExposureData,
  WeatherExposureMs,
} from "./farmTypes";
import { deterministicRandom } from "./deterministicRandom";
import { rollQualityWithExposure } from "./weatherEngine";
import {
  clampSoilMoisture,
  DEFAULT_SOIL_MOISTURE,
} from "./soilMoistureEngine";
import { clampPestPressure, PEST_OUTBREAK_THRESHOLD } from "./pestEngine";
import { getNormalTroughDurationMs } from "./animalLifecycle";

export const CURRENT_FARM_SCHEMA_VERSION = 9;
export const DEFAULT_FARM_WEATHER_SEED = 133742;

type MutableFarmRecord = Record<string, any>;

const QUALITY_TIERS: ItemQuality[] = ["thuong", "tot", "hiem", "hoan_my"];

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizePastTimestamp(
  value: unknown,
  now: number,
  fallback: number = now
): number {
  return isFiniteNumber(value) ? Math.min(value, now) : fallback;
}

function normalizeCount(value: unknown): number {
  return isFiniteNumber(value) && value >= 0 ? Math.floor(value) : 0;
}

function normalizeCountRecord<T extends string>(
  raw: unknown,
  canonicalKeys: readonly T[]
): Record<T, number> {
  const source = isRecord(raw) ? raw : {};
  const normalized: Record<string, number> = {};

  for (const [key, value] of Object.entries(source)) {
    if (isFiniteNumber(value) && value >= 0) {
      normalized[key] = Math.floor(value);
    }
  }
  for (const key of canonicalKeys) {
    normalized[key] ??= 0;
  }

  return normalized as Record<T, number>;
}

function createDefaultInventory(): FarmInventory {
  return {
    seeds: normalizeCountRecord(
      {},
      CROP_CATALOG.map((entry) => entry.id)
    ),
    animals: normalizeCountRecord(
      {},
      ANIMAL_CATALOG.map((entry) => entry.id)
    ),
    feed: normalizeCountRecord(
      {},
      FEED_CATALOG.map((entry) => entry.id)
    ),
    fertilizer: normalizeCountRecord(
      {},
      FERTILIZER_CATALOG.map((entry) => entry.id)
    ),
    eggs: normalizeCountRecord(
      {},
      Object.keys(EGG_INFO_MAP) as EggTypeId[]
    ),
  };
}

export function createDefaultEggQualityInventory(): EggQualityInventory {
  const inventory = {} as EggQualityInventory;
  for (const eggType of Object.keys(EGG_INFO_MAP) as EggTypeId[]) {
    inventory[eggType] = {
      thuong: { count: 0, rainGoldBonus: 0 },
      tot: { count: 0, rainGoldBonus: 0 },
      hiem: { count: 0, rainGoldBonus: 0 },
      hoan_my: { count: 0, rainGoldBonus: 0 },
    };
  }
  return inventory;
}

export function createDefaultFarmState(now: number = Date.now()): FarmSaveState {
  return {
    schemaVersion: CURRENT_FARM_SCHEMA_VERSION,
    gold: 30,
    inventory: createDefaultInventory(),
    unlockedPlotCount: 2,
    plots: Array.from({ length: 9 }, (_, index): FarmPlotState =>
      index < 2
        ? {
            status: "empty",
            soilMoisture: DEFAULT_SOIL_MOISTURE,
            soilMoistureUpdatedAt: now,
          }
        : { status: "locked" }
    ),
    penAnimals: [],
    penFeedBuffValue: 0,
    activeFeedSpeedBonus: 0,
    penFeedBuffUpdatedAt: now,
    penStarvationStartedAt: null,
    pendingAnimalDeathNotification: null,
    lastSettledAt: now,
    weatherSeed: DEFAULT_FARM_WEATHER_SEED,
    eggQualityInventory: createDefaultEggQualityInventory(),
  };
}

function cloneRawFarm(rawFarm: Record<string, any>): MutableFarmRecord {
  return {
    ...rawFarm,
    inventory: isRecord(rawFarm.inventory)
      ? {
          ...rawFarm.inventory,
          seeds: isRecord(rawFarm.inventory.seeds) ? { ...rawFarm.inventory.seeds } : rawFarm.inventory.seeds,
          animals: isRecord(rawFarm.inventory.animals) ? { ...rawFarm.inventory.animals } : rawFarm.inventory.animals,
          feed: isRecord(rawFarm.inventory.feed) ? { ...rawFarm.inventory.feed } : rawFarm.inventory.feed,
          fertilizer: isRecord(rawFarm.inventory.fertilizer) ? { ...rawFarm.inventory.fertilizer } : rawFarm.inventory.fertilizer,
          eggs: isRecord(rawFarm.inventory.eggs) ? { ...rawFarm.inventory.eggs } : rawFarm.inventory.eggs,
        }
      : {},
    plots: Array.isArray(rawFarm.plots)
      ? rawFarm.plots.map((plot: unknown) => (isRecord(plot) ? { ...plot } : plot))
      : rawFarm.plots,
    penAnimals: Array.isArray(rawFarm.penAnimals)
      ? rawFarm.penAnimals.map((animal: unknown) => (isRecord(animal) ? { ...animal } : animal))
      : rawFarm.penAnimals,
    eggQualityInventory: isRecord(rawFarm.eggQualityInventory)
      ? Object.fromEntries(
          Object.entries(rawFarm.eggQualityInventory).map(([eggType, slot]) => [
            eggType,
            isRecord(slot)
              ? Object.fromEntries(
                  Object.entries(slot).map(([quality, data]) => [
                    quality,
                    isRecord(data) ? { ...data } : data,
                  ])
                )
              : slot,
          ])
        )
      : rawFarm.eggQualityInventory,
  };
}

function migrateV1ToV2(farm: MutableFarmRecord): MutableFarmRecord {
  farm.inventory = isRecord(farm.inventory) ? farm.inventory : {};
  farm.inventory.fertilizer = isRecord(farm.inventory.fertilizer)
    ? farm.inventory.fertilizer
    : {};
  farm.inventory.eggs = isRecord(farm.inventory.eggs) ? farm.inventory.eggs : {};
  farm.schemaVersion = 2;
  return farm;
}

function migrateV2ToV3(farm: MutableFarmRecord): MutableFarmRecord {
  farm.plots = Array.isArray(farm.plots) ? farm.plots : [];
  farm.unlockedPlotCount = normalizeCount(farm.unlockedPlotCount) || 2;
  farm.weatherSeed = isFiniteNumber(farm.weatherSeed)
    ? farm.weatherSeed
    : DEFAULT_FARM_WEATHER_SEED;
  farm.schemaVersion = 3;
  return farm;
}

function migrateV3ToV4(
  farm: MutableFarmRecord,
  migrationNow: number
): MutableFarmRecord {
  farm.penAnimals = Array.isArray(farm.penAnimals) ? farm.penAnimals : [];
  farm.penStarvationStartedAt = isFiniteNumber(farm.penStarvationStartedAt)
    ? farm.penStarvationStartedAt
    : null;
  farm.pendingAnimalDeathNotification ??= null;
  farm.penFeedBuffUpdatedAt = isFiniteNumber(farm.penFeedBuffUpdatedAt)
    ? farm.penFeedBuffUpdatedAt
    : migrationNow;
  farm.schemaVersion = 4;
  return farm;
}

function migrateV4ToV5(farm: MutableFarmRecord): MutableFarmRecord {
  const legacyInventoryGold = isRecord(farm.inventory)
    ? farm.inventory.gold
    : undefined;
  farm.gold = isFiniteNumber(farm.gold) && farm.gold >= 0
    ? Math.floor(farm.gold)
    : isFiniteNumber(legacyInventoryGold) && legacyInventoryGold >= 0
      ? Math.floor(legacyInventoryGold)
      : 30;
  if (isRecord(farm.inventory)) delete farm.inventory.gold;
  farm.schemaVersion = 5;
  return farm;
}

function migrateV5ToV6(farm: MutableFarmRecord): MutableFarmRecord {
  // Plot fields are converted by normalizePlot below so migration stays
  // idempotent and never reconstructs inventory, animals or farm economy.
  farm.schemaVersion = 6;
  return farm;
}

function migrateV6ToV7(
  farm: MutableFarmRecord,
  migrationNow: number
): MutableFarmRecord {
  farm.plots = Array.isArray(farm.plots) ? farm.plots : [];
  for (const plot of farm.plots) {
    if (!isRecord(plot) || (plot.status !== "growing" && plot.status !== "ready")) {
      continue;
    }
    // Pest did not exist before v7. Start every existing crop at migration time
    // so no pre-feature offline interval can create retroactive damage.
    plot.pestPressure = 0;
    plot.pestUpdatedAt = migrationNow;
    plot.pestOutbreakAt = null;
    plot.pestDamageLevel = "none";
  }
  farm.schemaVersion = 7;
  return farm;
}

function normalizeFertilizerId(
  raw: unknown
): FertilizerTypeId | null | undefined {
  if (raw === null) return null;
  return FERTILIZER_CATALOG.some((entry) => entry.id === raw)
    ? raw as FertilizerTypeId
    : undefined;
}

function migrateV7ToV8(farm: MutableFarmRecord): MutableFarmRecord {
  farm.plots = Array.isArray(farm.plots) ? farm.plots : [];
  for (const plot of farm.plots) {
    if (!isRecord(plot)) {
      continue;
    }
    if (plot.status === "empty") {
      // V7 did not retain fertilizer history once a plot became empty.
      // Leave it unknown instead of guessing from unrelated farm state.
      delete plot.lastFertilizerId;
      continue;
    }
    if (plot.status !== "growing" && plot.status !== "ready") {
      continue;
    }

    const lastFertilizerId = normalizeFertilizerId(plot.fertilizerId);
    // An existing crop is the only V7 state that can reveal the plot's most
    // recent fertilizer choice, including an explicit no-fertilizer choice.
    if (lastFertilizerId === undefined) {
      delete plot.lastFertilizerId;
    } else {
      plot.lastFertilizerId = lastFertilizerId;
    }
  }
  farm.schemaVersion = 8;
  return farm;
}

function migrateV8ToV9(farm: MutableFarmRecord): MutableFarmRecord {
  // Egg workload and hardened livestock timestamps are materialized by the
  // canonical normalizer below so this migration remains idempotent.
  farm.schemaVersion = 9;
  return farm;
}

function normalizeWeatherExposure(raw: unknown): WeatherExposureData | undefined {
  if (!isRecord(raw)) return undefined;
  return {
    sunny: Math.max(0, Math.min(1, Number(raw.sunny) || 0)),
    calm: Math.max(0, Math.min(1, Number(raw.calm) || 0)),
    rain: Math.max(0, Math.min(1, Number(raw.rain) || 0)),
    cool: Math.max(0, Math.min(1, Number(raw.cool) || 0)),
  };
}

function normalizeWeatherExposureMs(raw: unknown): WeatherExposureMs | undefined {
  if (!isRecord(raw)) return undefined;
  return {
    sunny: Math.max(0, Number(raw.sunny) || 0),
    calm: Math.max(0, Number(raw.calm) || 0),
    rain: Math.max(0, Number(raw.rain) || 0),
    cool: Math.max(0, Number(raw.cool) || 0),
  };
}

function normalizeQualityPenalty(raw: unknown): CropQualityPenalty {
  if (raw === "common_only" || raw === "no_rare_perfect") return raw;
  return "none";
}

function normalizePestDamageLevel(raw: unknown): PestDamageLevel {
  if (raw === "damaged" || raw === "severe") return raw;
  return "none";
}

function createEmptyPlot(
  now: number,
  lastFertilizerId?: FertilizerTypeId | null
): FarmPlotState {
  return {
    status: "empty",
    soilMoisture: DEFAULT_SOIL_MOISTURE,
    soilMoistureUpdatedAt: now,
    ...(lastFertilizerId !== undefined ? { lastFertilizerId } : {}),
  };
}

function normalizePlot(
  raw: unknown,
  plotIndex: number,
  unlockedPlotCount: number,
  weatherSeed: number,
  now: number
): FarmPlotState {
  if (!isRecord(raw)) {
    return plotIndex < unlockedPlotCount ? createEmptyPlot(now) : { status: "locked" };
  }
  if (raw.status === "locked") return { status: "locked" };
  const lastFertilizerId = normalizeFertilizerId(raw.lastFertilizerId);
  const soilMoisture = isFiniteNumber(raw.soilMoisture)
    ? clampSoilMoisture(raw.soilMoisture)
    : DEFAULT_SOIL_MOISTURE;
  const soilMoistureUpdatedAt = normalizePastTimestamp(
    raw.soilMoistureUpdatedAt,
    now
  );
  if (raw.status === "empty") {
    return {
      status: "empty",
      soilMoisture,
      soilMoistureUpdatedAt,
      ...(lastFertilizerId !== undefined ? { lastFertilizerId } : {}),
    };
  }

  if (raw.status === "growing" || raw.status === "ready") {
    const crop = CROP_CATALOG.find((entry) => entry.id === raw.cropId);
    if (!crop) {
      return plotIndex < unlockedPlotCount
        ? createEmptyPlot(now, lastFertilizerId)
        : { status: "locked" };
    }

    const plantedAt = normalizePastTimestamp(raw.plantedAt, now);
    const weatherExposure = normalizeWeatherExposure(raw.weatherExposure);
    const persistedPenalty = normalizeQualityPenalty(raw.qualityPenalty);
    const qualityPenalty: CropQualityPenalty = soilMoisture <= 0
      ? "common_only"
      : soilMoisture < 20 && persistedPenalty === "none"
        ? "no_rare_perfect"
        : persistedPenalty;
    const qualityRoll = isFiniteNumber(raw.qualityRoll)
      ? Math.max(0, Math.min(1 - Number.EPSILON, raw.qualityRoll))
      : deterministicRandom(weatherSeed, "crop", plotIndex, crop.id, plantedAt);
    const fertilizerId = FERTILIZER_CATALOG.some((entry) => entry.id === raw.fertilizerId)
      ? raw.fertilizerId as FertilizerTypeId
      : raw.fertilizerId === null
        ? null
        : undefined;
    const fertilizerXpBonusPct = isFiniteNumber(raw.fertilizerXpBonusPct)
      ? raw.fertilizerXpBonusPct
      : undefined;
    const growthTimeReductionPct = isFiniteNumber(raw.growthTimeReductionPct)
      ? Math.max(0, Math.min(0.95, raw.growthTimeReductionPct))
      : 0;
    const pestPressure = clampPestPressure(Number(raw.pestPressure));
    const pestUpdatedAt = normalizePastTimestamp(raw.pestUpdatedAt, now);
    const pestOutbreakAt = pestPressure >= PEST_OUTBREAK_THRESHOLD
      ? isFiniteNumber(raw.pestOutbreakAt)
        ? Math.min(raw.pestOutbreakAt, now)
        : pestUpdatedAt
      : null;
    const pestDamageLevel = normalizePestDamageLevel(raw.pestDamageLevel);

    if (raw.status === "ready") {
      const growthCompletedAt = isFiniteNumber(raw.growthCompletedAt)
        ? Math.min(raw.growthCompletedAt, now)
        : isFiniteNumber(raw.growthEndsAt)
          ? Math.min(raw.growthEndsAt, now)
          : now;
      const rolledQuality = qualityPenalty === "none" &&
        pestDamageLevel === "none" &&
        QUALITY_TIERS.includes(raw.rolledQuality)
        ? raw.rolledQuality as ItemQuality
        : rollQualityWithExposure(
            weatherExposure?.cool || 0,
            qualityRoll,
            qualityPenalty,
            pestDamageLevel !== "none"
          );
      return {
        status: "ready",
        soilMoisture,
        soilMoistureUpdatedAt,
        ...(lastFertilizerId !== undefined ? { lastFertilizerId } : {}),
        cropId: crop.id,
        plantedAt,
        growthCompletedAt,
        ...(fertilizerId !== undefined ? { fertilizerId } : {}),
        ...(fertilizerXpBonusPct !== undefined ? { fertilizerXpBonusPct } : {}),
        ...(growthTimeReductionPct > 0 ? { growthTimeReductionPct } : {}),
        ...(weatherExposure ? { weatherExposure } : {}),
        ...(isFiniteNumber(raw.rainGoldBonusPct)
          ? { rainGoldBonusPct: raw.rainGoldBonusPct }
          : {}),
        qualityPenalty,
        qualityRoll,
        rolledQuality,
        pestPressure,
        pestUpdatedAt,
        pestOutbreakAt,
        pestDamageLevel,
      };
    }

    const growthWorkTotalMs = isFiniteNumber(raw.growthWorkTotalMs) && raw.growthWorkTotalMs > 0
      ? raw.growthWorkTotalMs
      : Math.max(1, Math.round(crop.growthMs * (1 - growthTimeReductionPct)));
    const legacyGrowthEndsAt = isFiniteNumber(raw.growthEndsAt)
      ? raw.growthEndsAt
      : plantedAt + growthWorkTotalMs;
    const legacyDuration = Math.max(1, legacyGrowthEndsAt - plantedAt);
    const legacyProgress = Math.max(0, Math.min(1, (now - plantedAt) / legacyDuration));
    const growthWorkRemainingMs = isFiniteNumber(raw.growthWorkRemainingMs)
      ? Math.max(0, Math.min(growthWorkTotalMs, raw.growthWorkRemainingMs))
      : growthWorkTotalMs * (1 - legacyProgress);
    const growthLastUpdatedAt = normalizePastTimestamp(
      raw.growthLastUpdatedAt,
      now
    );
    const elapsedLegacyMs = Math.max(0, Math.min(now, legacyGrowthEndsAt) - plantedAt);
    const weatherExposureMs = normalizeWeatherExposureMs(raw.weatherExposureMs) ?? {
      sunny: (weatherExposure?.sunny || 0) * elapsedLegacyMs,
      calm: (weatherExposure?.calm || 0) * elapsedLegacyMs,
      rain: (weatherExposure?.rain || 0) * elapsedLegacyMs,
      cool: (weatherExposure?.cool || 0) * elapsedLegacyMs,
    };

    return {
      status: "growing",
      soilMoisture,
      soilMoistureUpdatedAt,
      ...(lastFertilizerId !== undefined ? { lastFertilizerId } : {}),
      cropId: crop.id,
      plantedAt,
      growthWorkTotalMs,
      growthWorkRemainingMs,
      growthLastUpdatedAt,
      ...(FERTILIZER_CATALOG.some((entry) => entry.id === raw.fertilizerId)
        ? { fertilizerId: raw.fertilizerId as FertilizerTypeId }
        : raw.fertilizerId === null
          ? { fertilizerId: null }
          : {}),
      ...(fertilizerXpBonusPct !== undefined ? { fertilizerXpBonusPct } : {}),
      ...(growthTimeReductionPct > 0 ? { growthTimeReductionPct } : {}),
      weatherExposureMs,
      qualityPenalty,
      qualityRoll,
      pestPressure,
      pestUpdatedAt,
      pestOutbreakAt,
      pestDamageLevel,
      ...(QUALITY_TIERS.includes(raw.rolledQuality)
        ? { rolledQuality: raw.rolledQuality as ItemQuality }
        : {}),
    };
  }

  return plotIndex < unlockedPlotCount ? createEmptyPlot(now) : { status: "locked" };
}

function normalizeAnimal(
  raw: unknown,
  stateAt: number,
  index: number
): PenAnimalState | null {
  if (!isRecord(raw) || typeof raw.animalTypeId !== "string") return null;

  const definition = ANIMAL_CATALOG.find((entry) => entry.id === raw.animalTypeId);
  // Unknown catalog IDs used to survive as invisible, capacity-consuming
  // entities. Dropping only that invalid entry keeps the remainder of the save.
  if (!definition) return null;

  const rawAddedAt = isFiniteNumber(raw.addedAt) ? raw.addedAt : stateAt;
  const addedAt = Math.min(rawAddedAt, stateAt);
  const rawLifeStartedAt = isFiniteNumber(raw.lifeStartedAt)
    ? raw.lifeStartedAt
    : rawAddedAt;
  const lifeStartedAt = Math.min(rawLifeStartedAt, stateAt);
  const canonicalLifeEndsAt = lifeStartedAt + definition.lifespanMs;
  const hasCanonicalSavedLifespan =
    isFiniteNumber(raw.lifeEndsAt) &&
    isFiniteNumber(raw.lifeStartedAt) &&
    raw.lifeStartedAt <= stateAt &&
    Math.abs((raw.lifeEndsAt - raw.lifeStartedAt) - definition.lifespanMs) <= 1_000;
  // lifeEndsAt is a scheduled future event and may legitimately be in the
  // future. Rebuild it only when its canonical source timestamp was skewed or
  // the saved duration no longer matches the catalog lifespan.
  const lifeEndsAt = Math.max(
    lifeStartedAt,
    hasCanonicalSavedLifespan ? raw.lifeEndsAt : canonicalLifeEndsAt
  );
  // deathAt is materialized state, never a scheduled future timestamp.
  const deathAt = isFiniteNumber(raw.deathAt) && raw.deathAt <= stateAt
    ? Math.max(lifeStartedAt, raw.deathAt)
    : null;
  const deathCause: AnimalDeathCause | null = deathAt === null
    ? null
    : raw.deathCause === "starvation"
      ? "starvation"
      : "old_age";
  const cycleStartedAt = Math.max(
    addedAt,
    isFiniteNumber(raw.cycleStartedAt)
      ? Math.min(raw.cycleStartedAt, stateAt)
      : addedAt
  );
  const legacyNextEggAt = isFiniteNumber(raw.nextEggAt)
    ? raw.nextEggAt
    : cycleStartedAt + definition.eggIntervalMs;
  // A valid derived ETA cannot be more than one unbuffed cycle beyond the
  // persisted state timestamp. Rebuild extreme future values caused by clock
  // skew so egg production cannot be delayed indefinitely.
  const nextEggAt = legacyNextEggAt >= cycleStartedAt &&
    legacyNextEggAt <= stateAt + definition.eggIntervalMs
    ? legacyNextEggAt
    : stateAt + definition.eggIntervalMs;
  const eggWorkTotalMs = definition.eggIntervalMs;
  const eggWorkRemainingMs = isFiniteNumber(raw.eggWorkRemainingMs)
    ? Math.min(eggWorkTotalMs, Math.max(0, raw.eggWorkRemainingMs))
    : undefined;
  const eggLastUpdatedAt = isFiniteNumber(raw.eggLastUpdatedAt)
    ? Math.min(raw.eggLastUpdatedAt, stateAt)
    : stateAt;

  return {
    instanceId:
      typeof raw.instanceId === "string" && raw.instanceId
        ? raw.instanceId
        : `legacy_animal_${addedAt}_${index}`,
    animalTypeId: raw.animalTypeId as AnimalTypeId,
    addedAt,
    nextEggAt,
    eggWorkTotalMs,
    ...(eggWorkRemainingMs !== undefined ? { eggWorkRemainingMs } : {}),
    eggLastUpdatedAt,
    lifeStartedAt,
    lifeEndsAt,
    deathAt,
    deathCause,
    cycleStartedAt,
    ...(raw.isBuffed !== undefined ? { isBuffed: Boolean(raw.isBuffed) } : {}),
  };
}

function normalizeDeathNotification(raw: unknown): AnimalDeathNotificationSummary | null {
  if (!isRecord(raw)) return null;
  const oldAge = normalizeCount(raw.oldAge);
  const starvation = normalizeCount(raw.starvation);
  const total = Math.max(normalizeCount(raw.total), oldAge + starvation);
  return total > 0 ? { total, oldAge, starvation } : null;
}

function normalizeEggQualityInventory(
  raw: unknown,
  eggs: Record<EggTypeId, number>
): EggQualityInventory {
  const source = isRecord(raw) ? raw : {};
  const normalized = createDefaultEggQualityInventory();

  for (const eggType of Object.keys(EGG_INFO_MAP) as EggTypeId[]) {
    const rawSlot = isRecord(source[eggType]) ? source[eggType] : {};
    for (const quality of QUALITY_TIERS) {
      const rawData = isRecord(rawSlot[quality]) ? rawSlot[quality] : {};
      normalized[eggType][quality] = {
        count: normalizeCount(rawData.count),
        rainGoldBonus: normalizeCount(rawData.rainGoldBonus),
      };
    }

    const recordedTotal = QUALITY_TIERS.reduce(
      (sum, quality) => sum + normalized[eggType][quality].count,
      0
    );
    const inventoryTotal = eggs[eggType] || 0;
    if (inventoryTotal > recordedTotal) {
      normalized[eggType].thuong.count += inventoryTotal - recordedTotal;
    } else if (recordedTotal > inventoryTotal) {
      eggs[eggType] = recordedTotal;
    }
  }

  return normalized;
}

/**
 * Versioned, idempotent Farm migration. It only patches missing/legacy fields;
 * it never recreates an existing player's plots, inventory, animals or Feed.
 */
export function migrateFarmState(
  rawFarm: unknown,
  migrationNow: number = Date.now()
): FarmSaveState {
  if (!isRecord(rawFarm)) return createDefaultFarmState(migrationNow);

  const farm = cloneRawFarm(rawFarm);
  let version = Math.max(1, normalizeCount(farm.schemaVersion) || 1);
  while (version < CURRENT_FARM_SCHEMA_VERSION) {
    if (version === 1) migrateV1ToV2(farm);
    else if (version === 2) migrateV2ToV3(farm);
    else if (version === 3) migrateV3ToV4(farm, migrationNow);
    else if (version === 4) migrateV4ToV5(farm);
    else if (version === 5) migrateV5ToV6(farm);
    else if (version === 6) migrateV6ToV7(farm, migrationNow);
    else if (version === 7) migrateV7ToV8(farm);
    else if (version === 8) migrateV8ToV9(farm);
    version = normalizeCount(farm.schemaVersion);
  }

  // Canonical Gold: farm.gold wins whenever valid; inventory.gold is legacy input only.
  const legacyInventoryGold = isRecord(farm.inventory) ? farm.inventory.gold : undefined;
  const gold = isFiniteNumber(farm.gold) && farm.gold >= 0
    ? Math.floor(farm.gold)
    : isFiniteNumber(legacyInventoryGold) && legacyInventoryGold >= 0
      ? Math.floor(legacyInventoryGold)
      : 30;

  const rawInventory = isRecord(farm.inventory) ? farm.inventory : {};
  const inventory: FarmInventory = {
    seeds: normalizeCountRecord(
      rawInventory.seeds,
      CROP_CATALOG.map((entry) => entry.id as CropId)
    ),
    animals: normalizeCountRecord(
      rawInventory.animals,
      ANIMAL_CATALOG.map((entry) => entry.id as AnimalTypeId)
    ),
    feed: normalizeCountRecord(
      rawInventory.feed,
      FEED_CATALOG.map((entry) => entry.id as FeedTypeId)
    ),
    fertilizer: normalizeCountRecord(
      rawInventory.fertilizer,
      FERTILIZER_CATALOG.map((entry) => entry.id as FertilizerTypeId)
    ),
    eggs: normalizeCountRecord(
      rawInventory.eggs,
      Object.keys(EGG_INFO_MAP) as EggTypeId[]
    ),
  };

  const rawPlots = Array.isArray(farm.plots) ? farm.plots : [];
  const highestExistingUnlockedIndex = rawPlots.reduce(
    (highest: number, plot: unknown, index: number) =>
      isRecord(plot) && plot.status !== "locked" ? Math.max(highest, index) : highest,
    -1
  );
  const unlockedPlotCount = Math.min(
    9,
    Math.max(2, normalizeCount(farm.unlockedPlotCount), highestExistingUnlockedIndex + 1)
  );
  const weatherSeed = isFiniteNumber(farm.weatherSeed)
    ? farm.weatherSeed
    : DEFAULT_FARM_WEATHER_SEED;
  const plotCount = Math.max(9, rawPlots.length);
  const plots = Array.from({ length: plotCount }, (_, index) =>
    normalizePlot(rawPlots[index], index, unlockedPlotCount, weatherSeed, migrationNow)
  );
  const lastSettledAt = normalizePastTimestamp(
    farm.lastSettledAt,
    migrationNow
  );
  const penAnimals = (Array.isArray(farm.penAnimals) ? farm.penAnimals : [])
    .map((animal, index) => normalizeAnimal(animal, lastSettledAt, index))
    .filter((animal): animal is PenAnimalState => animal !== null);
  const penFeedBuffUpdatedAt = normalizePastTimestamp(
    farm.penFeedBuffUpdatedAt,
    lastSettledAt,
    lastSettledAt
  );
  const penFeedBuffValue = isFiniteNumber(farm.penFeedBuffValue)
    ? Math.max(0, Math.min(100, farm.penFeedBuffValue))
    : 0;
  const activeFeedSpeedBonus = isFiniteNumber(farm.activeFeedSpeedBonus)
    ? Math.max(0, farm.activeFeedSpeedBonus)
    : 0;
  const livingAnimalCount = penAnimals.reduce(
    (count, animal) => count + (animal.deathAt === null ? 1 : 0),
    0
  );
  const troughDurationMs = getNormalTroughDurationMs(livingAnimalCount);
  const feedEmptyAt = penFeedBuffValue > 0 && troughDurationMs > 0
    ? penFeedBuffUpdatedAt + (penFeedBuffValue / 100) * troughDurationMs
    : penFeedBuffUpdatedAt;
  const eggRate = penFeedBuffValue > 0 && activeFeedSpeedBonus > 0
    ? 1 + activeFeedSpeedBonus / 100
    : 1;
  // Convert timestamp-only legacy cycles once at their own workload anchor.
  // The current Feed amount begins at penFeedBuffUpdatedAt, never lastSettledAt.
  for (const animal of penAnimals) {
    if (Number.isFinite(animal.eggWorkRemainingMs)) continue;
    const total = animal.eggWorkTotalMs || 1;
    const workUpdatedAt = Number.isFinite(animal.eggLastUpdatedAt)
      ? animal.eggLastUpdatedAt!
      : lastSettledAt;
    const legacyEndAt = Math.max(workUpdatedAt, animal.nextEggAt);
    const normalBeforeFeedSnapshotMs = Math.max(
      0,
      Math.min(legacyEndAt, penFeedBuffUpdatedAt) - workUpdatedAt
    );
    const feedSegmentStartAt = Math.max(
      workUpdatedAt,
      penFeedBuffUpdatedAt
    );
    const buffDurationMs = Math.max(
      0,
      Math.min(legacyEndAt, feedEmptyAt) - feedSegmentStartAt
    );
    const normalDurationMs = Math.max(
      0,
      legacyEndAt - Math.max(feedSegmentStartAt, feedEmptyAt)
    );
    animal.eggWorkRemainingMs = Math.min(
      total,
      normalBeforeFeedSnapshotMs + buffDurationMs * eggRate + normalDurationMs
    );
    animal.eggLastUpdatedAt = workUpdatedAt;
  }

  const normalized: FarmSaveState = {
    schemaVersion: CURRENT_FARM_SCHEMA_VERSION,
    gold,
    inventory,
    unlockedPlotCount,
    plots,
    penAnimals,
    penFeedBuffValue,
    activeFeedSpeedBonus,
    penFeedBuffUpdatedAt,
    penStarvationStartedAt: isFiniteNumber(farm.penStarvationStartedAt) &&
      farm.penStarvationStartedAt <= lastSettledAt
      ? farm.penStarvationStartedAt
      : null,
    pendingAnimalDeathNotification: normalizeDeathNotification(
      farm.pendingAnimalDeathNotification
    ),
    lastSettledAt,
    weatherSeed,
    eggQualityInventory: createDefaultEggQualityInventory(),
  };
  normalized.eggQualityInventory = normalizeEggQualityInventory(
    farm.eggQualityInventory,
    normalized.inventory.eggs
  );

  return normalized;
}

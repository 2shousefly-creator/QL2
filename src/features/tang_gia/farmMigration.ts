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
  EggQualityInventory,
  EggTypeId,
  FarmInventory,
  FarmPlotState,
  FarmSaveState,
  FeedTypeId,
  FertilizerTypeId,
  ItemQuality,
  PenAnimalState,
  WeatherExposureData,
} from "./farmTypes";
import { getCropQualityRandom } from "./deterministicRandom";
import { rollQualityWithExposure } from "./weatherEngine";

export const CURRENT_FARM_SCHEMA_VERSION = 5;
export const DEFAULT_FARM_WEATHER_SEED = 133742;

type MutableFarmRecord = Record<string, any>;

const QUALITY_TIERS: ItemQuality[] = ["thuong", "tot", "hiem", "hoan_my"];

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
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
      index < 2 ? { status: "empty" } : { status: "locked" }
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

function normalizeWeatherExposure(raw: unknown): WeatherExposureData | undefined {
  if (!isRecord(raw)) return undefined;
  return {
    sunny: Math.max(0, Math.min(1, Number(raw.sunny) || 0)),
    calm: Math.max(0, Math.min(1, Number(raw.calm) || 0)),
    rain: Math.max(0, Math.min(1, Number(raw.rain) || 0)),
    cool: Math.max(0, Math.min(1, Number(raw.cool) || 0)),
  };
}

function normalizeBooleanTriple(raw: unknown): [boolean, boolean, boolean] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return [Boolean(raw[0]), Boolean(raw[1]), Boolean(raw[2])];
}

function normalizePlot(
  raw: unknown,
  plotIndex: number,
  unlockedPlotCount: number,
  weatherSeed: number,
  now: number
): FarmPlotState {
  if (!isRecord(raw)) {
    return plotIndex < unlockedPlotCount ? { status: "empty" } : { status: "locked" };
  }
  if (raw.status === "locked") return { status: "locked" };
  if (raw.status === "empty") return { status: "empty" };

  if (raw.status === "growing" || raw.status === "ready") {
    const crop = CROP_CATALOG.find((entry) => entry.id === raw.cropId);
    if (!crop) {
      return plotIndex < unlockedPlotCount ? { status: "empty" } : { status: "locked" };
    }

    const plantedAt = isFiniteNumber(raw.plantedAt) ? raw.plantedAt : now;
    const growthEndsAt = isFiniteNumber(raw.growthEndsAt)
      ? raw.growthEndsAt
      : plantedAt + crop.growthMs;
    const weatherExposure = normalizeWeatherExposure(raw.weatherExposure);
    const wateringCount = Math.min(3, normalizeCount(raw.wateringCount));
    const wateredStages = normalizeBooleanTriple(raw.wateredStages);
    const quality = QUALITY_TIERS.includes(raw.rolledQuality)
      ? raw.rolledQuality as ItemQuality
      : raw.status === "ready"
        ? rollQualityWithExposure(
            weatherExposure?.cool || 0,
            getCropQualityRandom(weatherSeed, plotIndex, plantedAt, growthEndsAt)
          )
        : undefined;

    return {
      status: raw.status,
      cropId: crop.id,
      plantedAt,
      growthEndsAt,
      ...(Array.isArray(raw.stageEndTimes) && raw.stageEndTimes.length >= 3
        ? {
            stageEndTimes: [
              Number(raw.stageEndTimes[0]),
              Number(raw.stageEndTimes[1]),
              Number(raw.stageEndTimes[2]),
            ] as [number, number, number],
          }
        : {}),
      ...(FERTILIZER_CATALOG.some((entry) => entry.id === raw.fertilizerId)
        ? { fertilizerId: raw.fertilizerId as FertilizerTypeId }
        : raw.fertilizerId === null
          ? { fertilizerId: null }
          : {}),
      ...(isFiniteNumber(raw.fertilizerXpBonusPct)
        ? { fertilizerXpBonusPct: raw.fertilizerXpBonusPct }
        : {}),
      ...(isFiniteNumber(raw.growthTimeReductionPct)
        ? { growthTimeReductionPct: raw.growthTimeReductionPct }
        : {}),
      wateringCount,
      ...(wateredStages ? { wateredStages } : {}),
      ...(raw.wateredBoostApplied !== undefined
        ? { wateredBoostApplied: Boolean(raw.wateredBoostApplied) }
        : {}),
      ...(raw.wateredBonusType === "speed" || raw.wateredBonusType === "yield"
        ? { wateredBonusType: raw.wateredBonusType }
        : {}),
      ...(weatherExposure ? { weatherExposure } : {}),
      ...(isFiniteNumber(raw.rainGoldBonusPct)
        ? { rainGoldBonusPct: raw.rainGoldBonusPct }
        : {}),
      ...(quality ? { rolledQuality: quality } : {}),
    } as FarmPlotState;
  }

  return plotIndex < unlockedPlotCount ? { status: "empty" } : { status: "locked" };
}

function normalizeAnimal(raw: unknown, now: number, index: number): PenAnimalState | null {
  if (!isRecord(raw) || typeof raw.animalTypeId !== "string") return null;

  const definition = ANIMAL_CATALOG.find((entry) => entry.id === raw.animalTypeId);
  const fallbackDefinition = definition ?? ANIMAL_CATALOG[0];
  const addedAt = isFiniteNumber(raw.addedAt) ? raw.addedAt : now;
  const lifeStartedAt = isFiniteNumber(raw.lifeStartedAt)
    ? raw.lifeStartedAt
    : addedAt;
  const lifeEndsAt = isFiniteNumber(raw.lifeEndsAt)
    ? raw.lifeEndsAt
    : lifeStartedAt + fallbackDefinition.lifespanMs;
  const deathAt = isFiniteNumber(raw.deathAt) ? raw.deathAt : null;
  const deathCause: AnimalDeathCause | null = deathAt === null
    ? null
    : raw.deathCause === "starvation"
      ? "starvation"
      : "old_age";
  const cycleStartedAt = isFiniteNumber(raw.cycleStartedAt)
    ? raw.cycleStartedAt
    : addedAt;
  const nextEggAt = isFiniteNumber(raw.nextEggAt)
    ? raw.nextEggAt
    : cycleStartedAt + fallbackDefinition.eggIntervalMs;

  return {
    instanceId:
      typeof raw.instanceId === "string" && raw.instanceId
        ? raw.instanceId
        : `legacy_animal_${addedAt}_${index}`,
    animalTypeId: raw.animalTypeId as AnimalTypeId,
    addedAt,
    nextEggAt,
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
  const penAnimals = (Array.isArray(farm.penAnimals) ? farm.penAnimals : [])
    .map((animal, index) => normalizeAnimal(animal, migrationNow, index))
    .filter((animal): animal is PenAnimalState => animal !== null);

  const lastSettledAt = isFiniteNumber(farm.lastSettledAt)
    ? farm.lastSettledAt
    : migrationNow;
  const penFeedBuffUpdatedAt = isFiniteNumber(farm.penFeedBuffUpdatedAt)
    ? farm.penFeedBuffUpdatedAt
    : lastSettledAt;

  const normalized: FarmSaveState = {
    schemaVersion: CURRENT_FARM_SCHEMA_VERSION,
    gold,
    inventory,
    unlockedPlotCount,
    plots,
    penAnimals,
    penFeedBuffValue: Math.max(0, Math.min(100, Number(farm.penFeedBuffValue) || 0)),
    activeFeedSpeedBonus: Math.max(0, Number(farm.activeFeedSpeedBonus) || 0),
    penFeedBuffUpdatedAt,
    penStarvationStartedAt: isFiniteNumber(farm.penStarvationStartedAt)
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

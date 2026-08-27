import type {
  CropId,
  FarmPlotState,
  FarmSaveState,
  ItemQuality,
  PenAnimalState,
} from "./farmTypes";
import { ANIMAL_CATALOG } from "./farmCatalog";
import {
  getLivingAnimalCount,
  getNormalTroughDurationMs,
  getStarvationDeadlineAt,
  isAnimalDead,
} from "./animalLifecycle";
import {
  checkRainInTimeRange,
  rollQualityWithExposure,
} from "./weatherEngine";
import { getCropQualityRandom } from "./deterministicRandom";
import { DEFAULT_FARM_WEATHER_SEED } from "./farmMigration";
import { computeEggCompletionTime } from "./farmEngine";

export const HARVEST_REWARD_FLOAT_DURATION_MS = 2_000;
export const HARVEST_ALL_CROP_GLOW_DURATION_MS = 1_000;

export interface PlotHarvestPresentation {
  id: string;
  plotIndex: number;
  cropId: CropId;
  quality: ItemQuality;
  goldAwarded: number;
  xpAwarded: number;
  startedAt: number;
  glowUntil: number;
}

export type FarmWaterActionMode = "disabled" | "single" | "all";
export type FarmHarvestAllActionMode = "clear_plot" | "harvest_all";

export interface FarmPresentationState {
  plots: FarmPlotState[];
  penAnimals: PenAnimalState[];
  penFeedBuffValue: number;
  activeFeedSpeedBonus: number;
  penStarvationStartedAt: number | null;
}

function derivePlotPresentation(
  plot: FarmPlotState,
  plotIndex: number,
  weatherSeed: number,
  now: number
): FarmPlotState {
  if (plot.status !== "growing") return plot;

  const totalGrowthMs = Math.max(1, plot.growthEndsAt - plot.plantedAt);
  const stageWindows: Array<[number, number]> = [
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
  const wateredStages: [boolean, boolean, boolean] = plot.wateredStages
    ? [...plot.wateredStages]
    : [
        (plot.wateringCount || 0) >= 1 || Boolean(plot.wateredBoostApplied),
        (plot.wateringCount || 0) >= 2,
        (plot.wateringCount || 0) >= 3,
      ];

  for (let stageIndex = 0; stageIndex < stageWindows.length; stageIndex += 1) {
    if (wateredStages[stageIndex]) continue;
    const [windowStart, windowEnd] = stageWindows[stageIndex];
    if (
      now >= windowStart &&
      checkRainInTimeRange(
        windowStart,
        Math.min(now, windowEnd),
        weatherSeed
      )
    ) {
      wateredStages[stageIndex] = true;
    }
  }

  const wateringCount = wateredStages.filter(Boolean).length;
  const projectedGrowingPlot: Extract<
    FarmPlotState,
    { status: "growing" }
  > = {
    ...plot,
    wateredStages,
    wateringCount,
    wateredBoostApplied: Boolean(plot.wateredBoostApplied) || wateringCount > 0,
  };
  if (now < plot.growthEndsAt) return projectedGrowingPlot;

  return {
    ...projectedGrowingPlot,
    status: "ready",
    rolledQuality:
      plot.rolledQuality ||
      rollQualityWithExposure(
        plot.weatherExposure?.cool || 0,
        getCropQualityRandom(
          weatherSeed,
          plotIndex,
          plot.plantedAt,
          plot.growthEndsAt
        )
      ),
  };
}

function getFeedPresentation(
  farm: FarmSaveState,
  now: number
): {
  value: number;
  speedBonus: number;
  starvationStartedAt: number | null;
  feedEmptyAt: number;
} {
  const persistedValue = Math.max(0, Math.min(100, farm.penFeedBuffValue || 0));
  const updatedAt = farm.penFeedBuffUpdatedAt || farm.lastSettledAt || now;
  const livingCount = getLivingAnimalCount(farm.penAnimals);
  const troughDurationMs = getNormalTroughDurationMs(livingCount);
  const feedEmptyAt =
    persistedValue > 0 && troughDurationMs > 0
      ? updatedAt + (persistedValue / 100) * troughDurationMs
      : updatedAt;
  const elapsedMs = Math.max(0, now - updatedAt);
  const consumedPercent =
    persistedValue > 0 && troughDurationMs > 0
      ? (elapsedMs / troughDurationMs) * 100
      : 0;
  const value = livingCount > 0
    ? Math.max(0, persistedValue - consumedPercent)
    : persistedValue;
  const starvationStartedAt =
    livingCount <= 0 || value > 0
      ? null
      : Number.isFinite(farm.penStarvationStartedAt)
        ? farm.penStarvationStartedAt!
        : feedEmptyAt;

  return {
    value,
    speedBonus: value > 0 ? Math.max(0, farm.activeFeedSpeedBonus || 0) : 0,
    starvationStartedAt,
    feedEmptyAt,
  };
}

function deriveAnimalPresentation(
  animal: PenAnimalState,
  farm: FarmSaveState,
  now: number,
  feed: ReturnType<typeof getFeedPresentation>
): PenAnimalState {
  if (isAnimalDead(animal)) return animal;

  const starvationDeadline = getStarvationDeadlineAt(feed.starvationStartedAt);
  const oldAgeAt = animal.lifeEndsAt;
  const projectedDeathAt = Math.min(
    oldAgeAt,
    starvationDeadline ?? Number.POSITIVE_INFINITY
  );
  if (projectedDeathAt <= now) {
    return {
      ...animal,
      deathAt: projectedDeathAt,
      deathCause:
        oldAgeAt <= (starvationDeadline ?? Number.POSITIVE_INFINITY)
          ? "old_age"
          : "starvation",
      isBuffed: false,
    };
  }

  const animalDefinition = ANIMAL_CATALOG.find(
    (entry) => entry.id === animal.animalTypeId
  );
  if (!animalDefinition || animal.nextEggAt > now) {
    return {
      ...animal,
      isBuffed: feed.value > 0 && feed.speedBonus > 0,
    };
  }

  let nextEggAt = animal.nextEggAt;
  let cycleStartedAt = animal.cycleStartedAt ?? animal.addedAt;
  for (let guard = 0; guard < 2_000 && nextEggAt <= now; guard += 1) {
    cycleStartedAt = nextEggAt;
    nextEggAt = computeEggCompletionTime(
      cycleStartedAt,
      animalDefinition.eggIntervalMs,
      feed.feedEmptyAt,
      Math.max(0, farm.activeFeedSpeedBonus || 0)
    );
  }

  return {
    ...animal,
    cycleStartedAt,
    nextEggAt,
    isBuffed: feed.value > 0 && feed.speedBonus > 0,
  };
}

/**
 * Pure, ephemeral view of wall-clock progress. It never mutates or persists Farm.
 */
export function getFarmPresentationState(
  farm: FarmSaveState,
  now: number
): FarmPresentationState {
  const weatherSeed = farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED;
  const feed = getFeedPresentation(farm, now);

  return {
    plots: farm.plots.map((plot, plotIndex) =>
      derivePlotPresentation(plot, plotIndex, weatherSeed, now)
    ),
    penAnimals: farm.penAnimals.map((animal) =>
      deriveAnimalPresentation(animal, farm, now, feed)
    ),
    penFeedBuffValue: feed.value,
    activeFeedSpeedBonus: feed.speedBonus,
    penStarvationStartedAt: feed.starvationStartedAt,
  };
}

export function getFarmWaterActionMode(
  needsWaterCount: number
): FarmWaterActionMode {
  const count = Math.max(
    0,
    Math.floor(Number.isFinite(needsWaterCount) ? needsWaterCount : 0)
  );
  if (count >= 2) return "all";
  if (count === 1) return "single";
  return "disabled";
}

export function getFarmWaterActionLabel(mode: FarmWaterActionMode): string {
  return mode === "all" ? "Tưới Tất Cả" : "Tưới Nước";
}

export function getFarmHarvestAllActionMode(
  harvestableCropCount: number
): FarmHarvestAllActionMode {
  const count = Math.max(
    0,
    Math.floor(
      Number.isFinite(harvestableCropCount) ? harvestableCropCount : 0
    )
  );
  return count >= 2 ? "harvest_all" : "clear_plot";
}

import type {
  CropId,
  FarmPlotState,
  FarmSaveState,
  ItemQuality,
  PenAnimalState,
} from "./farmTypes";
import { DEFAULT_FARM_WEATHER_SEED } from "./farmMigration";
import { projectPenState, settlePlotState } from "./farmEngine";
import { getLivingAnimalCount } from "./animalLifecycle";

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

export type FarmHarvestAllActionMode = "clear_plot" | "harvest_all";

export interface FarmPresentationState {
  plots: FarmPlotState[];
  penAnimals: PenAnimalState[];
  penFeedBuffValue: number;
  activeFeedSpeedBonus: number;
  penStarvationStartedAt: number | null;
  penFeedEmptyAt: number | null;
}

export interface FarmAttentionState {
  hasReadyCrop: boolean;
  hasDanger: boolean;
  hasPendingAnimalAlert: boolean;
  shouldShowNavigationBadge: boolean;
}

function derivePlotPresentation(
  plot: FarmPlotState,
  plotIndex: number,
  weatherSeed: number,
  now: number
): FarmPlotState {
  return settlePlotState(plot, plotIndex, now, weatherSeed);
}

/**
 * Pure, ephemeral view of wall-clock progress. It never mutates or persists Farm.
 */
export function getFarmPresentationState(
  farm: FarmSaveState,
  now: number
): FarmPresentationState {
  const weatherSeed = farm.weatherSeed ?? DEFAULT_FARM_WEATHER_SEED;
  const pen = projectPenState(farm, now);

  return {
    plots: farm.plots.map((plot, plotIndex) =>
      derivePlotPresentation(plot, plotIndex, weatherSeed, now)
    ),
    penAnimals: pen.penAnimals,
    penFeedBuffValue: pen.penFeedBuffValue,
    activeFeedSpeedBonus: pen.activeFeedSpeedBonus,
    penStarvationStartedAt: pen.penStarvationStartedAt,
    penFeedEmptyAt: pen.penFeedEmptyAt,
  };
}

/**
 * Formats the canonical/projected Feed amount without rounding a real decrease
 * back up to a visually stuck 100%.
 */
export function formatFeedPercentage(feedValue: number): string {
  const value = Number.isFinite(feedValue)
    ? Math.max(0, Math.min(100, feedValue))
    : 0;
  if (value >= 99.999) return "100%";
  if (value <= 0) return "0%";

  const visibleValue = Math.min(
    99.9,
    Math.floor(value * 10 + 1e-9) / 10
  );
  return `${visibleValue.toFixed(1)}%`;
}

/**
 * Pure navigation attention derived only from actions the player can take.
 * Stored eggs and compatibility ETA timestamps are inventory/history, not
 * pending collection state, so they deliberately do not participate.
 */
export function getFarmAttentionState(
  farm: FarmSaveState,
  now: number
): FarmAttentionState {
  const presentation = getFarmPresentationState(farm, now);
  const hasReadyCrop = presentation.plots.some(
    (plot) => plot.status === "ready"
  );
  const hasDanger =
    presentation.penFeedBuffValue <= 0 &&
    getLivingAnimalCount(presentation.penAnimals) > 0 &&
    Number.isFinite(presentation.penStarvationStartedAt);
  const hasPendingAnimalAlert =
    (farm.pendingAnimalDeathNotification?.total ?? 0) > 0;

  return {
    hasReadyCrop,
    hasDanger,
    hasPendingAnimalAlert,
    shouldShowNavigationBadge:
      hasReadyCrop || hasDanger || hasPendingAnimalAlert,
  };
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

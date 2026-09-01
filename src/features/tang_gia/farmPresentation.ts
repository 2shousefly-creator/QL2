import type {
  CropId,
  FarmPlotState,
  FarmSaveState,
  ItemQuality,
  PenAnimalState,
} from "./farmTypes";
import { DEFAULT_FARM_WEATHER_SEED } from "./farmMigration";
import { projectPenState, settlePlotState } from "./farmEngine";

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

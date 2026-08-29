import type {
  FarmPlotState,
  PestDamageLevel,
  SeasonType,
  WeatherType,
} from "./farmTypes";

export const BASE_PEST_PRESSURE_PER_HOUR = 2;
export const PEST_WARNING_THRESHOLD = 70;
export const PEST_OUTBREAK_THRESHOLD = 100;
export const PEST_TREAT_RESET_PRESSURE = 25;
export const PEST_DAMAGE_DELAY_MS = 3 * 60 * 60 * 1000;
export const PEST_SEVERE_DELAY_MS = 12 * 60 * 60 * 1000;

export const PEST_SEASON_MULTIPLIERS: Record<SeasonType, number> = {
  spring: 1.5,
  summer: 0.8,
  autumn: 1.4,
  winter: 0.5,
};

export const PEST_WEATHER_MULTIPLIERS: Record<WeatherType, number> = {
  rain: 0.8,
  cool: 1.2,
  sunny: 0.8,
  calm: 1.2,
};

export type PestStatus =
  | "normal"
  | "warning"
  | "outbreak"
  | "damaging"
  | "severe";

export interface PestPresentation {
  status: Exclude<PestStatus, "normal">;
  label: string;
  canTreat: boolean;
}

type CropPlot = Extract<FarmPlotState, { status: "growing" | "ready" }>;

export function clampPestPressure(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(PEST_OUTBREAK_THRESHOLD, value));
}

export function getPestRatePerHour(
  season: SeasonType,
  weather: WeatherType
): number {
  const weatherMultiplier =
    season === "summer" && weather === "sunny"
      ? 0.5
      : PEST_WEATHER_MULTIPLIERS[weather];
  return (
    BASE_PEST_PRESSURE_PER_HOUR *
    PEST_SEASON_MULTIPLIERS[season] *
    weatherMultiplier
  );
}

export function getPestStatus(
  pressure: number,
  outbreakAt: number | null,
  now: number
): PestStatus {
  const currentPressure = clampPestPressure(pressure);
  if (currentPressure < PEST_WARNING_THRESHOLD) return "normal";
  if (currentPressure < PEST_OUTBREAK_THRESHOLD) return "warning";

  const elapsedMs = outbreakAt === null ? 0 : Math.max(0, now - outbreakAt);
  if (elapsedMs >= PEST_SEVERE_DELAY_MS) return "severe";
  if (elapsedMs >= PEST_DAMAGE_DELAY_MS) return "damaging";
  return "outbreak";
}

export function escalatePestDamage(
  current: PestDamageLevel,
  pressure: number,
  outbreakAt: number | null,
  now: number
): PestDamageLevel {
  if (
    clampPestPressure(pressure) < PEST_OUTBREAK_THRESHOLD ||
    outbreakAt === null
  ) {
    return current;
  }

  const elapsedMs = Math.max(0, now - outbreakAt);
  if (elapsedMs >= PEST_SEVERE_DELAY_MS) return "severe";
  if (elapsedMs >= PEST_DAMAGE_DELAY_MS && current === "none") {
    return "damaged";
  }
  return current;
}

export function getNextPestDamageBoundaryAt(
  pressure: number,
  outbreakAt: number | null,
  now: number
): number {
  if (
    clampPestPressure(pressure) < PEST_OUTBREAK_THRESHOLD ||
    outbreakAt === null
  ) {
    return Number.POSITIVE_INFINITY;
  }
  if (now < outbreakAt + PEST_DAMAGE_DELAY_MS) {
    return outbreakAt + PEST_DAMAGE_DELAY_MS;
  }
  if (now < outbreakAt + PEST_SEVERE_DELAY_MS) {
    return outbreakAt + PEST_SEVERE_DELAY_MS;
  }
  return Number.POSITIVE_INFINITY;
}

export function getPestGrowthRate(plot: CropPlot, now: number): number {
  const status = getPestStatus(plot.pestPressure, plot.pestOutbreakAt, now);
  if (status === "severe") return 0.9;
  if (status === "damaging") return 0.95;
  return 1;
}

export function getPestGoldMultiplier(level: PestDamageLevel): number {
  if (level === "severe") return 0.85;
  if (level === "damaged") return 0.95;
  return 1;
}

export function canTreatPest(plot: FarmPlotState | null | undefined): boolean {
  return Boolean(
    plot &&
      (plot.status === "growing" || plot.status === "ready") &&
      clampPestPressure(plot.pestPressure) >= PEST_WARNING_THRESHOLD
  );
}

export function getPestPresentation(
  plot: FarmPlotState,
  now: number
): PestPresentation | null {
  if (plot.status !== "growing" && plot.status !== "ready") return null;
  const status = getPestStatus(plot.pestPressure, plot.pestOutbreakAt, now);
  if (status === "normal") return null;

  const label = status === "warning"
    ? "⚠️ Có dấu hiệu sâu bọ"
    : status === "outbreak"
      ? "🐛 Phát hiện sâu bọ"
      : status === "damaging"
        ? "🐛 Sâu đang phá cây"
        : "🐛🐛 Nhiễm sâu nặng";

  return { status, label, canTreat: canTreatPest(plot) };
}

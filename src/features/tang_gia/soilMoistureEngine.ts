import type { SoilMoistureBand } from "./farmTypes";

export const DEFAULT_SOIL_MOISTURE = 100;
export const MANUAL_WATER_AMOUNT = 40;
export const MIN_PLANTING_SOIL_MOISTURE = 20;
export const SUFFICIENT_SOIL_MOISTURE = 60;

const SOIL_MOISTURE_THRESHOLDS = [0, 20, 35, 60, 100] as const;

export function clampSoilMoisture(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SOIL_MOISTURE;
  return Math.max(0, Math.min(100, value));
}

export function getSoilMoistureBand(moisture: number): SoilMoistureBand {
  const value = clampSoilMoisture(moisture);
  if (value <= 0) return "barren";
  if (value < 20) return "thirsty";
  if (value < 35) return "drying";
  if (value < 60) return "normal";
  return "sufficient";
}

/**
 * The sufficient-moisture effect means 5% less duration, so its exact work
 * rate is 1 / 0.95. It is continuous and never applied as a threshold event.
 */
export function getMoistureGrowthRate(moisture: number): number {
  switch (getSoilMoistureBand(moisture)) {
    case "sufficient":
      return 1 / 0.95;
    case "normal":
    case "drying":
      return 1;
    case "thirsty":
      return 0.9;
    case "barren":
      return 0;
  }
}

export function getNextSoilMoistureThreshold(
  moisture: number,
  ratePerHour: number
): number | null {
  const value = clampSoilMoisture(moisture);
  if (ratePerHour > 0) {
    return SOIL_MOISTURE_THRESHOLDS.find((threshold) => threshold > value) ?? null;
  }
  if (ratePerHour < 0) {
    for (let index = SOIL_MOISTURE_THRESHOLDS.length - 1; index >= 0; index -= 1) {
      if (SOIL_MOISTURE_THRESHOLDS[index] < value) {
        return SOIL_MOISTURE_THRESHOLDS[index];
      }
    }
  }
  return null;
}

export const SOIL_MOISTURE_PRESENTATION: Record<
  SoilMoistureBand,
  { icon: string; label: string; barClass: string; textClass: string }
> = {
  sufficient: {
    icon: "💧",
    label: "Đủ Ẩm",
    barClass: "bg-sky-400",
    textClass: "text-sky-200",
  },
  normal: {
    icon: "🌱",
    label: "Bình Thường",
    barClass: "bg-emerald-400",
    textClass: "text-emerald-200",
  },
  drying: {
    icon: "⚠️",
    label: "Đất đang khô dần",
    barClass: "bg-amber-400",
    textClass: "text-amber-200",
  },
  thirsty: {
    icon: "🔴",
    label: "Thiếu Nước",
    barClass: "bg-rose-500",
    textClass: "text-rose-300",
  },
  barren: {
    icon: "🔴",
    label: "Khô cằn",
    barClass: "bg-red-700",
    textClass: "text-red-300",
  },
};

export function getSoilMoisturePresentation(moisture: number) {
  return SOIL_MOISTURE_PRESENTATION[getSoilMoistureBand(moisture)];
}

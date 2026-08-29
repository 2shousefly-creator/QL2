/**
 * Deterministic Season, Weather and Day/Night engine for Tăng Gia.
 * Canonical timezone: Asia/Ho_Chi_Minh (fixed UTC+7 for gameplay math).
 */

import type {
  CropQualityPenalty,
  DayNightPhase,
  ItemQuality,
  SeasonType,
  WeatherExposureData,
  WeatherType,
} from "./farmTypes";

export type { DayNightPhase, SeasonType, WeatherType } from "./farmTypes";

export const UTC7_OFFSET_MS = 7 * 60 * 60 * 1000;
export const WEATHER_SLOT_DURATION_MS = 6 * 60 * 60 * 1000;
export const SEASON_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
export const BASE_SOIL_MOISTURE_LOSS_PER_HOUR = 2;

/**
 * Fixed global epoch: 2024-01-01 00:00:00 in UTC+7 starts Mùa Xuân.
 * It is intentionally independent from account creation and save data.
 */
export const SEASON_EPOCH_MS = Date.UTC(2023, 11, 31, 17, 0, 0, 0);

const SEASON_ORDER: SeasonType[] = ["spring", "summer", "autumn", "winter"];

export const SEASON_METADATA: Record<
  SeasonType,
  { name: string; icon: string }
> = {
  spring: { name: "MÙA XUÂN", icon: "🌸" },
  summer: { name: "MÙA HẠ", icon: "☀️" },
  autumn: { name: "MÙA THU", icon: "🍂" },
  winter: { name: "MÙA ĐÔNG", icon: "❄️" },
};

export interface CanonicalWeatherSlot {
  slotIndex: number;
  startMs: number;
  endMs: number;
  phase: DayNightPhase;
  season: SeasonType;
  weather: WeatherType;
  remainingMs: number;
}
type DayWeatherProbabilities = Record<"sunny" | "rain" | "cool", number>;
type NightWeatherProbabilities = Record<"calm" | "rain", number>;

export const SEASON_WEATHER_PROBABILITIES: Record<
  SeasonType,
  { day: DayWeatherProbabilities; night: NightWeatherProbabilities }
> = {
  spring: {
    day: { sunny: 0.3, rain: 0.2, cool: 0.5 },
    night: { calm: 0.75, rain: 0.25 },
  },
  summer: {
    day: { sunny: 0.9, rain: 0.02, cool: 0.08 },
    night: { calm: 0.95, rain: 0.05 },
  },
  autumn: {
    day: { sunny: 0.35, rain: 0.3, cool: 0.35 },
    night: { calm: 0.65, rain: 0.35 },
  },
  winter: {
    day: { sunny: 0.15, rain: 0.6, cool: 0.25 },
    night: { calm: 0.2, rain: 0.8 },
  },
};

export const WEATHER_METADATA: Record<
  WeatherType,
  {
    name: string;
    icon: string;
    fullDesc: string;
    tagClass: string;
    bgClass: string;
  }
> = {
  sunny: {
    name: "Nắng",
    icon: "🌤️",
    fullDesc: "Nắng giúp cây phát triển nhanh hơn 2% nhưng làm đất mất ẩm theo mùa.",
    tagClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    bgClass: "from-amber-500/10 to-orange-500/5",
  },
  rain: {
    name: "Mưa",
    icon: "🌧️",
    fullDesc: "Mưa tăng độ ẩm đất 50 điểm mỗi giờ và vẫn duy trì thưởng Vàng theo mức tiếp xúc.",
    tagClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    bgClass: "from-sky-500/10 to-blue-500/5",
  },
  cool: {
    name: "Mát",
    icon: "☁️",
    fullDesc: "Thời tiết mát làm tăng cơ hội Phẩm Chất Hoàn Mỹ theo mức tiếp xúc.",
    tagClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    bgClass: "from-emerald-500/10 to-teal-500/5",
  },
  calm: {
    name: "Yên Ắng",
    icon: "🌙",
    fullDesc: "Đêm yên ắng giúp cây phát triển nhanh hơn 2% và làm đất mất ẩm theo mùa.",
    tagClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    bgClass: "from-indigo-500/10 to-purple-500/5",
  },
};

export function getSeasonAt(timestamp: number): SeasonType {
  const seasonIndex = Math.floor((timestamp - SEASON_EPOCH_MS) / SEASON_DURATION_MS);
  return SEASON_ORDER[((seasonIndex % SEASON_ORDER.length) + SEASON_ORDER.length) % SEASON_ORDER.length];
}

export function getDayNightPhase(timestamp: number): DayNightPhase {
  const slotIndex = Math.floor((timestamp + UTC7_OFFSET_MS) / WEATHER_SLOT_DURATION_MS);
  const slotMod = ((slotIndex % 4) + 4) % 4;
  return slotMod === 1 || slotMod === 3 ? "day" : "night";
}

export function getSeasonWeatherProbabilities(
  season: SeasonType,
  phase: "day"
): DayWeatherProbabilities;
export function getSeasonWeatherProbabilities(
  season: SeasonType,
  phase: "night"
): NightWeatherProbabilities;
export function getSeasonWeatherProbabilities(
  season: SeasonType,
  phase: DayNightPhase
): DayWeatherProbabilities | NightWeatherProbabilities {
  return SEASON_WEATHER_PROBABILITIES[season][phase];
}

export function getSlotRandom(seed: number, slotIndex: number): number {
  let hash = (seed ^ (slotIndex * 2654435761)) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

export function getWeatherForSlot(
  slotIndex: number,
  seed: number = 133742,
  explicitSeason?: SeasonType
): WeatherType {
  const slotStart = slotIndex * WEATHER_SLOT_DURATION_MS - UTC7_OFFSET_MS;
  const season = explicitSeason ?? getSeasonAt(slotStart);
  const slotMod = ((slotIndex % 4) + 4) % 4;
  const phase: DayNightPhase = slotMod === 1 || slotMod === 3 ? "day" : "night";
  const random = getSlotRandom(seed, slotIndex);

  if (phase === "day") {
    const probabilities = getSeasonWeatherProbabilities(season, "day");
    if (random < probabilities.sunny) return "sunny";
    if (random < probabilities.sunny + probabilities.rain) return "rain";
    return "cool";
  }

  const probabilities = getSeasonWeatherProbabilities(season, "night");
  return random < probabilities.calm ? "calm" : "rain";
}

export function getCanonicalWeatherSlot(
  timestamp: number,
  seed: number = 133742
): CanonicalWeatherSlot {
  const slotIndex = Math.floor((timestamp + UTC7_OFFSET_MS) / WEATHER_SLOT_DURATION_MS);
  const startMs = slotIndex * WEATHER_SLOT_DURATION_MS - UTC7_OFFSET_MS;
  const endMs = startMs + WEATHER_SLOT_DURATION_MS;
  const phase = getDayNightPhase(timestamp);
  const season = getSeasonAt(startMs);

  return {
    slotIndex,
    startMs,
    endMs,
    phase,
    season,
    weather: getWeatherForSlot(slotIndex, seed, season),
    remainingMs: Math.max(0, endMs - timestamp),
  };
}

export function getWeatherAt(
  timestamp: number,
  seed: number = 133742
): CanonicalWeatherSlot {
  return getCanonicalWeatherSlot(timestamp, seed);
}

export function getWeatherPresentation(weather: WeatherType, season: SeasonType) {
  if (weather === "sunny" && season === "summer") {
    return { ...WEATHER_METADATA.sunny, name: "Nắng Nóng", icon: "☀️" };
  }
  return WEATHER_METADATA[weather];
}

const DRY_WEATHER_MOISTURE_MULTIPLIERS: Record<
  SeasonType,
  Partial<Record<WeatherType, number>>
> = {
  spring: { sunny: 1.3, cool: 1, calm: 0.8 },
  summer: { sunny: 2, cool: 1.3, calm: 1.2 },
  autumn: { sunny: 1.3, cool: 1, calm: 0.8 },
  winter: { sunny: 1.1, cool: 0.7, calm: 0.5 },
};

export function getSoilMoistureRatePerHour(
  season: SeasonType,
  _phase: DayNightPhase,
  weather: WeatherType
): number {
  if (weather === "rain") return 50;
  const multiplier = DRY_WEATHER_MOISTURE_MULTIPLIERS[season][weather] ?? 1;
  return -BASE_SOIL_MOISTURE_LOSS_PER_HOUR * multiplier;
}

export function getWeatherMoistureDescription(
  season: SeasonType,
  phase: DayNightPhase,
  weather: WeatherType
): string {
  if (weather === "rain") return "Độ ẩm đất +50/giờ";
  const rate = getSoilMoistureRatePerHour(season, phase, weather);
  const changePct = Math.round((Math.abs(rate) / BASE_SOIL_MOISTURE_LOSS_PER_HOUR - 1) * 100);
  if (changePct === 0) return "Độ ẩm giảm ở tốc độ bình thường";
  return changePct > 0
    ? `Đất khô nhanh hơn ${changePct}%`
    : `Đất khô chậm hơn ${Math.abs(changePct)}%`;
}

export function getWeatherGrowthRate(weather: WeatherType): number {
  return weather === "sunny" || weather === "calm" ? 1 / 0.98 : 1;
}

export const QUALITY_CONFIG: Record<
  ItemQuality,
  {
    name: string;
    multiplier: number;
    icon: string;
    badgeClass: string;
    color: string;
    surfaceColor: string;
    glowColor: string;
  }
> = {
  thuong: {
    name: "Thường",
    multiplier: 1,
    icon: "⚪",
    badgeClass: "bg-white/10 text-slate-50 border-white/70",
    color: "#f8fafc",
    surfaceColor: "rgba(248, 250, 252, 0.08)",
    glowColor: "rgba(248, 250, 252, 0.16)",
  },
  tot: {
    name: "Tốt",
    multiplier: 1.1,
    icon: "🔵",
    badgeClass: "bg-sky-500/15 text-sky-300 border-sky-400/70",
    color: "#38bdf8",
    surfaceColor: "rgba(56, 189, 248, 0.10)",
    glowColor: "rgba(56, 189, 248, 0.20)",
  },
  hiem: {
    name: "Hiếm",
    multiplier: 1.3,
    icon: "🟣",
    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-400/70",
    color: "#c084fc",
    surfaceColor: "rgba(192, 132, 252, 0.10)",
    glowColor: "rgba(192, 132, 252, 0.20)",
  },
  hoan_my: {
    name: "Hoàn Mỹ",
    multiplier: 2,
    icon: "🟠",
    badgeClass: "bg-orange-500/15 text-orange-300 border-orange-400/70",
    color: "#fb923c",
    surfaceColor: "rgba(251, 146, 60, 0.10)",
    glowColor: "rgba(251, 146, 60, 0.22)",
  },
};

export function getQualityProbabilities(
  coolExposure: number = 0,
  penalty: CropQualityPenalty = "none"
): Record<ItemQuality, number> {
  if (penalty === "common_only") {
    return { thuong: 1, tot: 0, hiem: 0, hoan_my: 0 };
  }

  const clampedCool = Math.max(0, Math.min(1, coolExposure));
  const hoanMy = Math.round((0.01 + 0.03 * clampedCool) * 10_000) / 10_000;
  const base = {
    thuong: Math.round((1 - hoanMy - 0.3 - 0.09) * 10_000) / 10_000,
    tot: 0.3,
    hiem: 0.09,
    hoan_my: hoanMy,
  };

  if (penalty === "no_rare_perfect") {
    return {
      thuong: base.thuong + base.hiem + base.hoan_my,
      tot: base.tot,
      hiem: 0,
      hoan_my: 0,
    };
  }
  return base;
}

export function rollQualityWithExposure(
  coolExposure: number,
  deterministicRand: number,
  penalty: CropQualityPenalty = "none"
): ItemQuality {
  const probabilities = getQualityProbabilities(coolExposure, penalty);
  const random = Number.isFinite(deterministicRand)
    ? Math.max(0, Math.min(1 - Number.EPSILON, deterministicRand))
    : 0;

  if (random < probabilities.hoan_my) return "hoan_my";
  if (random < probabilities.hoan_my + probabilities.hiem) return "hiem";
  if (random < probabilities.hoan_my + probabilities.hiem + probabilities.tot) return "tot";
  return "thuong";
}

export function calculateWeatherExposure(
  startMs: number,
  endMs: number,
  seed: number = 133742
): WeatherExposureData {
  const duration = Math.max(1, endMs - startMs);
  const weatherMs: Record<WeatherType, number> = {
    sunny: 0,
    calm: 0,
    rain: 0,
    cool: 0,
  };
  if (endMs <= startMs) return weatherMs;

  const startSlot = Math.floor((startMs + UTC7_OFFSET_MS) / WEATHER_SLOT_DURATION_MS);
  const endSlot = Math.floor(((endMs - 1) + UTC7_OFFSET_MS) / WEATHER_SLOT_DURATION_MS);
  for (let slotIndex = startSlot; slotIndex <= endSlot; slotIndex += 1) {
    const slotStart = slotIndex * WEATHER_SLOT_DURATION_MS - UTC7_OFFSET_MS;
    const slotEnd = slotStart + WEATHER_SLOT_DURATION_MS;
    const overlapStart = Math.max(startMs, slotStart);
    const overlapEnd = Math.min(endMs, slotEnd);
    if (overlapEnd > overlapStart) {
      weatherMs[getWeatherForSlot(slotIndex, seed)] += overlapEnd - overlapStart;
    }
  }

  return {
    sunny: weatherMs.sunny / duration,
    calm: weatherMs.calm / duration,
    rain: weatherMs.rain / duration,
    cool: weatherMs.cool / duration,
  };
}

export function calculateNextEggCycle(
  startMs: number,
  baseIntervalMs: number,
  speedMultiplier: number = 1,
  seed: number = 133742
): {
  completionTime: number;
  durationMs: number;
  exposure: WeatherExposureData;
} {
  const durationMs = Math.round(baseIntervalMs / Math.max(0.1, speedMultiplier));
  const completionTime = startMs + durationMs;
  return {
    completionTime,
    durationMs,
    exposure: calculateWeatherExposure(startMs, completionTime, seed),
  };
}

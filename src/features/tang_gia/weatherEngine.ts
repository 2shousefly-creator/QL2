/**
 * Weather and Day/Night Engine for Tăng Gia (Farm)
 * Timezone canonical: Asia/Ho_Chi_Minh (UTC+7)
 * 12-hour full cycle: 6h Day, 6h Night
 * Fixed 6-hour slot boundaries:
 *   - 00:00 to <06:00: BAN ĐÊM (Night)
 *   - 06:00 to <12:00: BAN NGÀY (Day)
 *   - 12:00 to <18:00: BAN ĐÊM (Night)
 *   - 18:00 to <24:00: BAN NGÀY (Day)
 */

import { ItemQuality, WeatherExposureData } from "./farmTypes";

export type DayNightPhase = "day" | "night";

export type WeatherType = "sunny" | "rain" | "cool" | "calm";

export interface CanonicalWeatherSlot {
  slotIndex: number;
  startMs: number;
  endMs: number;
  phase: DayNightPhase;
  weather: WeatherType;
  remainingMs: number;
}

export interface CropExposure {
  sunny: number; // 0..1
  calm: number; // 0..1
  rain: number; // 0..1
  cool: number; // 0..1
}

export interface CropGrowthSchedule {
  growthEndsAt: number;
  totalLifecycleMs: number;
  stageWindows: [
    [number, number], // Stage 0 (20% - 50%)
    [number, number], // Stage 1 (50% - 80%)
    [number, number]  // Stage 2 (80% - 100%)
  ];
  weatherExposure: CropExposure;
  rainGoldBonusPct: number; // e.g. 0.05 * rainExposure
}

export const WEATHER_METADATA: Record<
  WeatherType,
  {
    name: string;
    icon: string;
    shortDesc: string;
    fullDesc: string;
    tagClass: string;
    bgClass: string;
  }
> = {
  sunny: {
    name: "Nắng",
    icon: "☀️",
    shortDesc: "Cây lớn nhanh hơn",
    fullDesc: "Thời tiết nắng ráo giúp đẩy nhanh quang hợp, rút ngắn tối đa 2% thời gian sinh trưởng của cây trồng.",
    tagClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    bgClass: "from-amber-500/10 to-orange-500/5",
  },
  rain: {
    name: "Mưa",
    icon: "🌧",
    shortDesc: "Tăng Vàng & Tự động tưới nước",
    fullDesc: "Mưa tưới mát ruộng đồng, tự động tưới nước khi cây bước vào mốc chăm sóc và tăng tối đa 5% Vàng khi thu hoạch.",
    tagClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    bgClass: "from-sky-500/10 to-blue-500/5",
  },
  cool: {
    name: "Mát",
    icon: "🍃",
    shortDesc: "Tiết trời mát mẻ",
    fullDesc: "Khí hậu ôn hòa mát dịu, nuôi dưỡng nông sản tươi tốt (sẽ mở rộng cơ chế Phẩm Chất ở giai đoạn tiếp theo).",
    tagClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    bgClass: "from-emerald-500/10 to-teal-500/5",
  },
  calm: {
    name: "Yên Ắng",
    icon: "🌙",
    shortDesc: "Cây lớn nhanh hơn",
    fullDesc: "Đêm quân ngũ tĩnh lặng, cây trồng hấp thụ sương đêm rút ngắn tối đa 2% thời gian sinh trưởng.",
    tagClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    bgClass: "from-indigo-500/10 to-purple-500/5",
  },
};

const UTC7_OFFSET_MS = 7 * 3600 * 1000;
const SLOT_DURATION_MS = 6 * 3600 * 1000; // 6 hours

/**
 * Returns Day or Night phase for a given timestamp in Asia/Ho_Chi_Minh (UTC+7).
 * Absolute slots:
 * - 00:00 to <06:00: BAN ĐÊM (Night)
 * - 06:00 to <12:00: BAN NGÀY (Day)
 * - 12:00 to <18:00: BAN ĐÊM (Night)
 * - 18:00 to <24:00: BAN NGÀY (Day)
 */
export function getDayNightPhase(timestamp: number): DayNightPhase {
  const localMs = timestamp + UTC7_OFFSET_MS;
  const slotIndex = Math.floor(localMs / SLOT_DURATION_MS);
  const slotMod = ((slotIndex % 4) + 4) % 4;
  return slotMod === 1 || slotMod === 3 ? "day" : "night";
}

/**
 * Deterministic pseudo-random number generator for a specific slot and seed.
 * Returns float in range [0, 1).
 */
export function getSlotRandom(seed: number, slotIndex: number): number {
  let h = (seed ^ (slotIndex * 2654435761)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Returns deterministic weather for a specific 6-hour slotIndex.
 * BAN NGÀY:
 * - Nắng: 60% (0.00 to <0.60)
 * - Mưa: 20% (0.60 to <0.80)
 * - Mát: 20% (0.80 to <1.00)
 *
 * BAN ĐÊM:
 * - Yên Ắng: 80% (0.00 to <0.80)
 * - Mưa: 20% (0.80 to <1.00)
 */
export function getWeatherForSlot(slotIndex: number, seed: number = 133742): WeatherType {
  const slotMod = ((slotIndex % 4) + 4) % 4;
  const isDay = slotMod === 1 || slotMod === 3;
  const rand = getSlotRandom(seed, slotIndex);

  if (isDay) {
    if (rand < 0.6) return "sunny";
    if (rand < 0.8) return "rain";
    return "cool";
  } else {
    if (rand < 0.8) return "calm";
    return "rain";
  }
}

/**
 * Returns canonical weather slot details at timestamp.
 */
export function getCanonicalWeatherSlot(
  timestamp: number,
  seed: number = 133742
): CanonicalWeatherSlot {
  const localMs = timestamp + UTC7_OFFSET_MS;
  const slotIndex = Math.floor(localMs / SLOT_DURATION_MS);
  const startMs = slotIndex * SLOT_DURATION_MS - UTC7_OFFSET_MS;
  const endMs = startMs + SLOT_DURATION_MS;
  const slotMod = ((slotIndex % 4) + 4) % 4;
  const phase: DayNightPhase = slotMod === 1 || slotMod === 3 ? "day" : "night";
  const weather = getWeatherForSlot(slotIndex, seed);
  const remainingMs = Math.max(0, endMs - timestamp);

  return {
    slotIndex,
    startMs,
    endMs,
    phase,
    weather,
    remainingMs,
  };
}

/**
 * Alias helper for getting weather state at timestamp.
 */
export function getWeatherAt(
  timestamp: number,
  seed: number = 133742
): CanonicalWeatherSlot {
  return getCanonicalWeatherSlot(timestamp, seed);
}

/**
 * Checks if any Rain slot overlaps the time range [startMs, endMs].
 */
export function checkRainInTimeRange(
  startMs: number,
  endMs: number,
  seed: number = 133742
): boolean {
  if (endMs <= startMs) return false;

  const startSlot = Math.floor((startMs + UTC7_OFFSET_MS) / SLOT_DURATION_MS);
  const endSlot = Math.floor(((endMs - 1) + UTC7_OFFSET_MS) / SLOT_DURATION_MS);

  for (let slot = startSlot; slot <= endSlot; slot++) {
    if (getWeatherForSlot(slot, seed) === "rain") {
      return true;
    }
  }

  return false;
}

/**
 * Calculates deterministic crop growth schedule and weather exposure.
 * - Nắng: max -2% growth duration (by exposure).
 * - Yên Ắng: max -2% growth duration (by exposure).
 * - Nắng + Yên Ắng accumulate speedup.
 * - Mưa: max +5% Gold on harvest (by exposure).
 * - Mát: records cool exposure.
 */
export function calculateCropGrowthSchedule(
  plantedAt: number,
  baseGrowthMs: number,
  seed: number = 133742
): CropGrowthSchedule {
  if (baseGrowthMs <= 0) {
    return {
      growthEndsAt: plantedAt,
      totalLifecycleMs: 0,
      stageWindows: [
        [plantedAt, plantedAt],
        [plantedAt, plantedAt],
        [plantedAt, plantedAt],
      ],
      weatherExposure: { sunny: 0, calm: 0, rain: 0, cool: 0 },
      rainGoldBonusPct: 0,
    };
  }

  // Determine exact growth milestones using progress accumulation
  // Speed multiplier in sunny or calm: 1 / 0.98 (~1.0204x)
  const targets = [0.2, 0.5, 0.8, 1.0];
  const milestoneTimes: number[] = [];
  let targetIdx = 0;

  let currentT = plantedAt;
  let accumulatedProgress = 0;

  let loopLimit = 0;
  while (targetIdx < targets.length && loopLimit < 500) {
    loopLimit++;
    const slot = getCanonicalWeatherSlot(currentT, seed);
    const weather = slot.weather;
    const speed = weather === "sunny" || weather === "calm" ? 1 / 0.98 : 1.0;

    const slotRemainingMs = slot.endMs - currentT;
    const maxSegmentProgress = (slotRemainingMs / baseGrowthMs) * speed;

    while (
      targetIdx < targets.length &&
      accumulatedProgress + maxSegmentProgress >= targets[targetIdx] - 1e-12
    ) {
      const neededProgress = targets[targetIdx] - accumulatedProgress;
      const timeNeededMs = Math.round((neededProgress / speed) * baseGrowthMs);
      milestoneTimes[targetIdx] = currentT + timeNeededMs;
      targetIdx++;
    }

    accumulatedProgress += maxSegmentProgress;
    currentT = slot.endMs;
  }

  const t20 = milestoneTimes[0] || plantedAt + Math.round(baseGrowthMs * 0.2);
  const t50 = milestoneTimes[1] || plantedAt + Math.round(baseGrowthMs * 0.5);
  const t80 = milestoneTimes[2] || plantedAt + Math.round(baseGrowthMs * 0.8);
  const growthEndsAt = milestoneTimes[3] || plantedAt + baseGrowthMs;

  const totalLifecycleMs = Math.max(1, growthEndsAt - plantedAt);

  // Compute exact exposure to each weather between plantedAt and growthEndsAt
  const weatherMs: Record<WeatherType, number> = {
    sunny: 0,
    calm: 0,
    rain: 0,
    cool: 0,
  };

  const startSlot = Math.floor((plantedAt + UTC7_OFFSET_MS) / SLOT_DURATION_MS);
  const endSlot = Math.floor(
    ((growthEndsAt - 1) + UTC7_OFFSET_MS) / SLOT_DURATION_MS
  );

  for (let slot = startSlot; slot <= endSlot; slot++) {
    const slotStart = slot * SLOT_DURATION_MS - UTC7_OFFSET_MS;
    const slotEnd = slotStart + SLOT_DURATION_MS;
    const weather = getWeatherForSlot(slot, seed);

    const overlapStart = Math.max(plantedAt, slotStart);
    const overlapEnd = Math.min(growthEndsAt, slotEnd);
    const overlapDuration = Math.max(0, overlapEnd - overlapStart);

    weatherMs[weather] += overlapDuration;
  }

  const sunnyExposure = weatherMs.sunny / totalLifecycleMs;
  const calmExposure = weatherMs.calm / totalLifecycleMs;
  const rainExposure = weatherMs.rain / totalLifecycleMs;
  const coolExposure = weatherMs.cool / totalLifecycleMs;

  const rainGoldBonusPct = 0.05 * rainExposure;

  return {
    growthEndsAt,
    totalLifecycleMs,
    stageWindows: [
      [t20, t50], // Stage 0 (20% - 50%)
      [t50, t80], // Stage 1 (50% - 80%)
      [t80, growthEndsAt], // Stage 2 (80% - 100%)
    ],
    weatherExposure: {
      sunny: sunnyExposure,
      calm: calmExposure,
      rain: rainExposure,
      cool: coolExposure,
    },
    rainGoldBonusPct,
  };
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
    multiplier: 1.0,
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
    multiplier: 2.0,
    icon: "🟠",
    badgeClass: "bg-orange-500/15 text-orange-300 border-orange-400/70",
    color: "#fb923c",
    surfaceColor: "rgba(251, 146, 60, 0.10)",
    glowColor: "rgba(251, 146, 60, 0.22)",
  },
};

/**
 * Calculates exposure percentages for weather types in any time range [startMs, endMs].
 */
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

  const startSlot = Math.floor((startMs + UTC7_OFFSET_MS) / SLOT_DURATION_MS);
  const endSlot = Math.floor(((endMs - 1) + UTC7_OFFSET_MS) / SLOT_DURATION_MS);

  for (let slot = startSlot; slot <= endSlot; slot++) {
    const slotStart = slot * SLOT_DURATION_MS - UTC7_OFFSET_MS;
    const slotEnd = slotStart + SLOT_DURATION_MS;
    const weather = getWeatherForSlot(slot, seed);

    const overlapStart = Math.max(startMs, slotStart);
    const overlapEnd = Math.min(endMs, slotEnd);
    const overlapDuration = Math.max(0, overlapEnd - overlapStart);

    weatherMs[weather] += overlapDuration;
  }

  return {
    sunny: weatherMs.sunny / duration,
    calm: weatherMs.calm / duration,
    rain: weatherMs.rain / duration,
    cool: weatherMs.cool / duration,
  };
}

/**
 * Returns Quality probabilities given coolExposure (0..1).
 * Base: Thường 60%, Tốt 30%, Hiếm 9%, Hoàn Mỹ 1%.
 * Bonus from cool weather: coolPerfectBonus = 3% * coolExposure.
 * Hoàn Mỹ = 1% + coolPerfectBonus.
 * Thường = 60% - coolPerfectBonus.
 * Tốt = 30% (constant).
 * Hiếm = 9% (constant).
 * Total is always strictly 100%.
 */
export function getQualityProbabilities(
  coolExposure: number = 0
): Record<ItemQuality, number> {
  const clampedCool = Math.max(0, Math.min(1, coolExposure));
  const coolPerfectBonus = 0.03 * clampedCool;

  // Round floating math safely to avoid tiny IEEE-754 precision artifacts
  const hoan_my = Math.round((0.01 + coolPerfectBonus) * 10000) / 10000;
  const tot = 0.30;
  const hiem = 0.09;
  const thuong = Math.round((1.0 - hoan_my - tot - hiem) * 10000) / 10000;

  return {
    thuong,
    tot,
    hiem,
    hoan_my,
  };
}

/**
 * Rolls an ItemQuality given coolExposure.
 */
export function rollQualityWithExposure(
  coolExposure: number,
  deterministicRand: number
): ItemQuality {
  const probs = getQualityProbabilities(coolExposure);
  const rand = Number.isFinite(deterministicRand)
    ? Math.max(0, Math.min(1 - Number.EPSILON, deterministicRand))
    : 0;

  if (rand < probs.hoan_my) {
    return "hoan_my";
  }
  if (rand < probs.hoan_my + probs.hiem) {
    return "hiem";
  }
  if (rand < probs.hoan_my + probs.hiem + probs.tot) {
    return "tot";
  }
  return "thuong";
}

/**
 * Calculates next egg completion cycle with feed speed multiplier.
 */
export function calculateNextEggCycle(
  startMs: number,
  baseIntervalMs: number,
  speedMultiplier: number = 1.0,
  seed: number = 133742
): {
  completionTime: number;
  durationMs: number;
  exposure: WeatherExposureData;
} {
  const mult = Math.max(0.1, speedMultiplier);
  const durationMs = Math.round(baseIntervalMs / mult);
  const completionTime = startMs + durationMs;
  const exposure = calculateWeatherExposure(startMs, completionTime, seed);

  return {
    completionTime,
    durationMs,
    exposure,
  };
}

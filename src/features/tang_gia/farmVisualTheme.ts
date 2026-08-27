import { QUALITY_CONFIG, type CanonicalWeatherSlot } from "./weatherEngine";
import type { ItemQuality } from "./farmTypes";

export type CropVisualStage = "seed" | "sprout" | "young" | "mature";

export const FARM_VISUAL_LAYERS = {
  rearFence: 6,
  eggNest: 9,
  animalBase: 12,
  frontFence: 40,
} as const;

export const HARVEST_CROP_QUALITY_COLORS: Record<ItemQuality, string> = {
  thuong: QUALITY_CONFIG.thuong.color,
  tot: QUALITY_CONFIG.tot.color,
  hiem: QUALITY_CONFIG.hiem.color,
  hoan_my: QUALITY_CONFIG.hoan_my.color,
};

export interface FarmVisualTheme {
  sceneBackground: string;
  sceneBorder: string;
  plotBackground: string;
  plotBorder: string;
  penBackground: string;
  penBorder: string;
  pathColor: string;
  pathEdgeColor: string;
  foliageColor: string;
  foliageShadow: string;
  furrowColor: string;
}

const SUNNY_THEME: FarmVisualTheme = {
  sceneBackground: "linear-gradient(155deg, #94d58f 0%, #76bd78 52%, #5f9d61 100%)",
  sceneBorder: "#3f8552",
  plotBackground: "linear-gradient(155deg, #775034 0%, #634026 58%, #4d301f 100%)",
  plotBorder: "#8b613b",
  penBackground: "linear-gradient(155deg, #72aa64 0%, #5b914f 58%, #456f3e 100%)",
  penBorder: "#6f8f48",
  pathColor: "rgba(181, 139, 86, 0.72)",
  pathEdgeColor: "rgba(113, 78, 45, 0.4)",
  foliageColor: "#2f7c45",
  foliageShadow: "#205a35",
  furrowColor: "rgba(48, 27, 16, 0.42)",
};

const RAIN_THEME: FarmVisualTheme = {
  sceneBackground: "linear-gradient(155deg, #729b7e 0%, #5f876f 52%, #4d705f 100%)",
  sceneBorder: "#486f5b",
  plotBackground: "linear-gradient(155deg, #5b4636 0%, #49382d 58%, #382c25 100%)",
  plotBorder: "#6f5a47",
  penBackground: "linear-gradient(155deg, #587a61 0%, #466650 58%, #354f40 100%)",
  penBorder: "#587764",
  pathColor: "rgba(126, 111, 88, 0.72)",
  pathEdgeColor: "rgba(62, 72, 62, 0.5)",
  foliageColor: "#376a4b",
  foliageShadow: "#294f3c",
  furrowColor: "rgba(32, 24, 21, 0.55)",
};

const COOL_THEME: FarmVisualTheme = {
  sceneBackground: "linear-gradient(155deg, #86b5a0 0%, #70a18c 52%, #5b8977 100%)",
  sceneBorder: "#4f806e",
  plotBackground: "linear-gradient(155deg, #66543e 0%, #554635 58%, #42372c 100%)",
  plotBorder: "#76654c",
  penBackground: "linear-gradient(155deg, #688b70 0%, #55775f 58%, #42604d 100%)",
  penBorder: "#65836c",
  pathColor: "rgba(166, 145, 108, 0.7)",
  pathEdgeColor: "rgba(77, 89, 69, 0.42)",
  foliageColor: "#3b7653",
  foliageShadow: "#2c5b43",
  furrowColor: "rgba(43, 33, 25, 0.48)",
};

const NIGHT_THEME: FarmVisualTheme = {
  sceneBackground: "linear-gradient(155deg, #294b35 0%, #203d2c 52%, #182f24 100%)",
  sceneBorder: "#355d43",
  plotBackground: "linear-gradient(155deg, #394131 0%, #303629 58%, #252b22 100%)",
  plotBorder: "#4c5a42",
  penBackground: "linear-gradient(155deg, #294734 0%, #213a2c 58%, #192d23 100%)",
  penBorder: "#3d5d47",
  pathColor: "rgba(104, 91, 70, 0.62)",
  pathEdgeColor: "rgba(20, 27, 23, 0.55)",
  foliageColor: "#28583b",
  foliageShadow: "#1b3f2d",
  furrowColor: "rgba(15, 20, 16, 0.6)",
};

const NIGHT_RAIN_THEME: FarmVisualTheme = {
  sceneBackground: "linear-gradient(155deg, #274553 0%, #213946 52%, #192e39 100%)",
  sceneBorder: "#385967",
  plotBackground: "linear-gradient(155deg, #35403c 0%, #2b3532 58%, #212a28 100%)",
  plotBorder: "#495c57",
  penBackground: "linear-gradient(155deg, #29443e 0%, #213832 58%, #192d29 100%)",
  penBorder: "#3c5a53",
  pathColor: "rgba(91, 87, 78, 0.62)",
  pathEdgeColor: "rgba(18, 29, 32, 0.6)",
  foliageColor: "#295344",
  foliageShadow: "#1b3c33",
  furrowColor: "rgba(13, 20, 20, 0.68)",
};

export function getFarmVisualTheme(
  slot?: Pick<CanonicalWeatherSlot, "phase" | "weather">,
): FarmVisualTheme {
  if (slot?.phase === "night") {
    return slot.weather === "rain" ? NIGHT_RAIN_THEME : NIGHT_THEME;
  }
  if (slot?.weather === "rain") return RAIN_THEME;
  if (slot?.weather === "cool") return COOL_THEME;
  return SUNNY_THEME;
}

export function getCropVisualStage(progress: number): CropVisualStage {
  const safeProgress = Number.isFinite(progress) ? progress : 0;
  if (safeProgress < 0.2) return "seed";
  if (safeProgress < 0.5) return "sprout";
  if (safeProgress < 0.8) return "young";
  return "mature";
}

export function getCropVisualScale(progress: number): number {
  const safeProgress = Number.isFinite(progress)
    ? Math.min(1, Math.max(0, progress))
    : 0;

  // Production sprites already encode the visible size difference between
  // stages, so runtime scaling stays restrained and only adds a gentle sense
  // of continuous growth between stage transitions.
  return 0.9 + safeProgress * 0.1;
}

/** Crop names stay readable at one fixed size while only the plant visual grows. */
export const CROP_NAME_FONT_SIZE_PX = 10;

function createSeededRandom(seedInput: number): () => number {
  let state = (Math.trunc(seedInput) ^ 0x9e3779b9) >>> 0;
  if (state === 0) state = 0x6d2b79f5;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSoilFurrowPaths(seed: number): string[] {
  const random = createSeededRandom(Number.isFinite(seed) ? seed : 1);

  return Array.from({ length: 5 }, (_, rowIndex) => {
    const baseY = 16 + rowIndex * 17 + (random() - 0.5) * 3;
    let x = 5;
    const y = baseY + (random() - 0.5) * 7;
    let path = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    let segmentIndex = 0;

    while (x < 95) {
      const nextX = Math.min(95, x + 9 + random() * 10);
      const nextY = baseY + (random() - 0.5) * 10;

      if (segmentIndex % 3 === 1) {
        // A deliberate hard kink among the softer wave sections.
        const kinkX = x + (nextX - x) * (0.38 + random() * 0.24);
        const kinkY = baseY + (random() - 0.5) * 14;
        path += ` L ${kinkX.toFixed(1)} ${kinkY.toFixed(1)} L ${nextX.toFixed(1)} ${nextY.toFixed(1)}`;
      } else {
        const controlX = x + (nextX - x) * 0.5;
        const controlY = baseY + (random() - 0.5) * 15;
        path += ` Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${nextX.toFixed(1)} ${nextY.toFixed(1)}`;
      }

      x = nextX;
      segmentIndex += 1;
    }

    return path;
  });
}

export function getDisplayedNestEggCount(totalEggCount: number): number {
  if (!Number.isFinite(totalEggCount)) return 0;
  return Math.min(3, Math.max(0, Math.floor(totalEggCount)));
}

export function getAnimalVisualLayer(yPercent: number): number {
  const safeY = Number.isFinite(yPercent)
    ? Math.min(100, Math.max(0, yPercent))
    : 0;
  return FARM_VISUAL_LAYERS.animalBase + Math.floor(safeY / 10);
}

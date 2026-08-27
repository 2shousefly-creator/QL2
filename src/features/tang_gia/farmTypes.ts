export type CropId =
  | "carrot"
  | "cabbage"
  | "potato"
  | "tomato"
  | "strawberry"
  | "corn"
  | "pumpkin"
  | "watermelon"
  | "pineapple"
  | "banana"
  | "orange"
  | "mango"
  | "apple"
  | "pear"
  | "grape"
  | "dragon_fruit"
  | "avocado"
  | "durian"
  | "mangosteen";

export type AnimalTypeId =
  | "chicken"
  | "duck"
  | "quail"
  | "goose"
  | "muscovy_duck"
  | "turkey"
  | "guinea_fowl"
  | "pheasant"
  | "peafowl"
  | "ostrich";

export type FeedTypeId = "feed_normal" | "feed_good" | "feed_super";

export type FertilizerTypeId =
  | "fertilizer_nutrition_normal"
  | "fertilizer_growth_normal"
  | "fertilizer_nutrition_medium"
  | "fertilizer_growth_medium"
  | "fertilizer_nutrition_good"
  | "fertilizer_growth_good"
  | "fertilizer_nutrition_super"
  | "fertilizer_growth_super"
  | "fertilizer_premium_3"
  | "fertilizer_premium_2"
  | "fertilizer_premium_1";

export type FertilizerCategory = "nutrition" | "growth" | "premium";

export type EggTypeId =
  | "chicken_egg"
  | "duck_egg"
  | "quail_egg"
  | "goose_egg"
  | "muscovy_duck_egg"
  | "turkey_egg"
  | "guinea_fowl_egg"
  | "pheasant_egg"
  | "peafowl_egg"
  | "ostrich_egg";

export type RankIdentity = {
  familyId: string;
  tier: number | null;
};

export type CropDefinition = {
  id: CropId;
  name: string;
  seedCostGold: number;
  harvestGold: number;
  growthMs: number;
  harvestXp: number;
  requiredRank: RankIdentity;
};

export type AnimalDefinition = {
  id: AnimalTypeId;
  name: string;
  purchaseGold: number;
  eggIntervalMs: number;
  lifespanMs: number;
  eggTypeId: EggTypeId;
  eggSellGold: number;
  eggSellXp: number;
  requiredRank: RankIdentity;
};

export type FeedDefinition = {
  id: FeedTypeId;
  name: string;
  costGold: number;
  buffAmount: number; // trough fill % increase (20, 25, 30)
  speedBonusPercent: number; // 15, 25, 40
  requiredRank: RankIdentity;
};

export type FertilizerDefinition = {
  id: FertilizerTypeId;
  name: string;
  category: FertilizerCategory;
  purchaseGold: number;
  xpBonusPct: number; // e.g. 0.04 -> +4% XP
  growthTimeReductionPct: number; // e.g. 0.04 -> -4% growth time
  requiredRank: RankIdentity;
  icon: string;
};

export type DayNightPhase = "day" | "night";
export type WeatherType = "sunny" | "rain" | "cool" | "calm";

export type ItemQuality = "thuong" | "tot" | "hiem" | "hoan_my";

export type QualityBreakdown = Record<
  ItemQuality,
  {
    quantity: number;
    baseGold: number;
    qualityBonusGold: number;
    gold: number;
    baseXp: number;
    qualityBonusXp: number;
    xp: number;
  }
>;

export type EggQualitySlotData = {
  count: number;
  rainGoldBonus: number;
};

export type EggQualityInventory = Record<
  EggTypeId,
  Record<ItemQuality, EggQualitySlotData>
>;

export type WeatherExposureData = {
  sunny: number; // 0..1
  calm: number; // 0..1
  rain: number; // 0..1
  cool: number; // 0..1
};

export type FarmPlotState =
  | { status: "locked" }
  | { status: "empty" }
  | {
      status: "growing";
      cropId: CropId;
      plantedAt: number;
      growthEndsAt: number;
      stageEndTimes?: [number, number, number];
      fertilizerId?: FertilizerTypeId | null;
      fertilizerXpBonusPct?: number;
      growthTimeReductionPct?: number;
      wateringCount?: number; // 0..3
      wateredStages?: [boolean, boolean, boolean]; // Stage 0 (20%), Stage 1 (50%), Stage 2 (80%)
      wateredBoostApplied?: boolean; // legacy
      wateredBonusType?: "speed" | "yield"; // legacy
      weatherExposure?: WeatherExposureData;
      rainGoldBonusPct?: number;
      rolledQuality?: ItemQuality;
    }
  | {
      status: "ready";
      cropId: CropId;
      plantedAt: number;
      growthEndsAt?: number;
      fertilizerId?: FertilizerTypeId | null;
      fertilizerXpBonusPct?: number;
      growthTimeReductionPct?: number;
      wateringCount?: number; // 0..3
      wateredStages?: [boolean, boolean, boolean]; // Stage 0 (20%), Stage 1 (50%), Stage 2 (80%)
      wateredBoostApplied?: boolean; // legacy
      wateredBonusType?: "speed" | "yield"; // legacy
      weatherExposure?: WeatherExposureData;
      rainGoldBonusPct?: number;
      rolledQuality?: ItemQuality;
    };

export type WateringStageStatus = "upcoming" | "ready" | "watered" | "missed";

export interface PlotWateringInfo {
  stageStatuses: [WateringStageStatus, WateringStageStatus, WateringStageStatus];
  currentEligibleStageIndex: number | null; // 0, 1, 2 or null if cannot water right now
  canWaterNow: boolean;
  wateredCount: number;
  missedCount: number;
}

export type AnimalDeathCause = "old_age" | "starvation";

export type PenAnimalState = {
  instanceId: string;
  animalTypeId: AnimalTypeId;
  addedAt: number;
  nextEggAt: number;
  lifeStartedAt: number;
  lifeEndsAt: number;
  deathAt: number | null;
  deathCause: AnimalDeathCause | null;
  isBuffed?: boolean;
  cycleStartedAt?: number;
};

export type AnimalDeathNotificationSummary = {
  total: number;
  oldAge: number;
  starvation: number;
};

// Type alias for backward compatibility across components
export type AnimalInstance = PenAnimalState;

export type FarmInventory = {
  seeds: Record<CropId, number>;
  animals: Record<AnimalTypeId, number>;
  feed: Record<FeedTypeId, number>;
  fertilizer: Record<FertilizerTypeId, number>;
  eggs: Record<EggTypeId, number>;
};

export type FarmSaveState = {
  schemaVersion: number;
  gold: number;
  inventory: FarmInventory;
  unlockedPlotCount: number;
  plots: FarmPlotState[];
  penAnimals: PenAnimalState[];
  penFeedBuffValue: number; // 0 to 100
  activeFeedSpeedBonus?: number; // 0, 15, 25, 40
  penFeedBuffUpdatedAt: number;
  penStarvationStartedAt?: number | null;
  pendingAnimalDeathNotification?: AnimalDeathNotificationSummary | null;
  lastSettledAt: number;
  weatherSeed?: number; // Deterministic seed for weather generation
  eggQualityInventory?: EggQualityInventory;
};

export type PlotUnlockDefinition = {
  plotIndex: number; // 0..8
  gold: number;
  requiredRank: RankIdentity | null;
  unlockedByDefault: boolean;
};

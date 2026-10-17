import {
  AnimalDefinition,
  CropDefinition,
  EggTypeId,
  FeedDefinition,
  FertilizerDefinition,
  PlotUnlockDefinition,
} from "./farmTypes";

export const CROP_CATALOG: CropDefinition[] = [
  {
    id: "carrot",
    name: "Cà Rốt",
    seedCostGold: 0,
    harvestGold: 10,
    growthMs: 5 * 60 * 60 * 1000, // 05h00m
    harvestXp: 5,
    requiredRank: { familyId: "hoc_vien", tier: null },
  },
  {
    id: "cabbage",
    name: "Cải Bắp",
    seedCostGold: 5,
    harvestGold: 14,
    growthMs: 7 * 60 * 60 * 1000, // 07h00m
    harvestXp: 8,
    requiredRank: { familyId: "binh_bet", tier: 1 },
  },
  {
    id: "potato",
    name: "Khoai Tây",
    seedCostGold: 8,
    harvestGold: 30,
    growthMs: 9 * 60 * 60 * 1000, // 09h00m
    harvestXp: 15,
    requiredRank: { familyId: "binh_nhi", tier: 1 },
  },
  {
    id: "tomato",
    name: "Cà Chua",
    seedCostGold: 11,
    harvestGold: 40,
    growthMs: 11 * 60 * 60 * 1000, // 11h00m
    harvestXp: 20,
    requiredRank: { familyId: "binh_nhat", tier: 1 },
  },
  {
    id: "strawberry",
    name: "Dâu Tây",
    seedCostGold: 15,
    harvestGold: 50,
    growthMs: 13 * 60 * 60 * 1000, // 13h00m
    harvestXp: 27,
    requiredRank: { familyId: "ha_si", tier: 1 },
  },
  {
    id: "corn",
    name: "Ngô",
    seedCostGold: 20,
    harvestGold: 70,
    growthMs: 15 * 60 * 60 * 1000, // 15h00m
    harvestXp: 37,
    requiredRank: { familyId: "trung_si", tier: 1 },
  },
  {
    id: "pumpkin",
    name: "Bí Đỏ",
    seedCostGold: 30,
    harvestGold: 100,
    growthMs: 18 * 60 * 60 * 1000, // 18h00m
    harvestXp: 48,
    requiredRank: { familyId: "thuong_si", tier: 1 },
  },
  {
    id: "watermelon",
    name: "Dưa Hấu",
    seedCostGold: 40,
    harvestGold: 140,
    growthMs: 21 * 60 * 60 * 1000, // 21h00m
    harvestXp: 60,
    requiredRank: { familyId: "thieu_uy", tier: 1 },
  },
  {
    id: "pineapple",
    name: "Dứa",
    seedCostGold: 55,
    harvestGold: 190,
    growthMs: 24 * 60 * 60 * 1000, // 24h00m
    harvestXp: 75,
    requiredRank: { familyId: "trung_uy", tier: 1 },
  },
  {
    id: "banana",
    name: "Chuối",
    seedCostGold: 80,
    harvestGold: 240,
    growthMs: 28 * 60 * 60 * 1000, // 28h00m
    harvestXp: 94,
    requiredRank: { familyId: "thuong_uy", tier: 1 },
  },
  {
    id: "orange",
    name: "Cam",
    seedCostGold: 100,
    harvestGold: 290,
    growthMs: 32 * 60 * 60 * 1000, // 32h00m
    harvestXp: 107,
    requiredRank: { familyId: "dai_uy", tier: 1 },
  },
  {
    id: "mango",
    name: "Xoài",
    seedCostGold: 125,
    harvestGold: 340,
    growthMs: 36 * 60 * 60 * 1000, // 36h00m
    harvestXp: 121,
    requiredRank: { familyId: "thieu_ta", tier: 1 },
  },
  {
    id: "apple",
    name: "Táo",
    seedCostGold: 148,
    harvestGold: 390,
    growthMs: 40 * 60 * 60 * 1000, // 40h00m
    harvestXp: 142,
    requiredRank: { familyId: "trung_ta", tier: 1 },
  },
  {
    id: "pear",
    name: "Lê",
    seedCostGold: 170,
    harvestGold: 440,
    growthMs: 44 * 60 * 60 * 1000, // 44h00m
    harvestXp: 167,
    requiredRank: { familyId: "thuong_ta", tier: 1 },
  },
  {
    id: "grape",
    name: "Nho",
    seedCostGold: 203,
    harvestGold: 500,
    growthMs: 48 * 60 * 60 * 1000, // 48h00m
    harvestXp: 198,
    requiredRank: { familyId: "dai_ta", tier: 1 },
  },
  {
    id: "dragon_fruit",
    name: "Lúa",
    seedCostGold: 230,
    harvestGold: 560,
    growthMs: 54 * 60 * 60 * 1000, // 54h00m
    harvestXp: 227,
    requiredRank: { familyId: "thieu_tuong", tier: 1 },
  },
  {
    id: "avocado",
    name: "Bơ",
    seedCostGold: 260,
    harvestGold: 620,
    growthMs: 60 * 60 * 60 * 1000, // 60h00m
    harvestXp: 264,
    requiredRank: { familyId: "trung_tuong", tier: 1 },
  },
  {
    id: "durian",
    name: "Sầu Riêng",
    seedCostGold: 290,
    harvestGold: 690,
    growthMs: 72 * 60 * 60 * 1000, // 72h00m
    harvestXp: 310,
    requiredRank: { familyId: "thuong_tuong", tier: 1 },
  },
  {
    id: "mangosteen",
    name: "Măng Cụt",
    seedCostGold: 330,
    harvestGold: 760,
    growthMs: 84 * 60 * 60 * 1000, // 84h00m
    harvestXp: 380,
    requiredRank: { familyId: "dai_tuong", tier: 1 },
  },
];

export const ANIMAL_CATALOG: AnimalDefinition[] = [
  {
    id: "chicken",
    name: "Gà",
    purchaseGold: 0,
    eggIntervalMs: 5 * 60 * 60 * 1000, // 05h00m
    lifespanMs: 200 * 60 * 60 * 1000,
    eggTypeId: "chicken_egg",
    eggSellGold: 9,
    eggSellXp: 3,
    requiredRank: { familyId: "hoc_vien", tier: null },
  },
  {
    id: "duck",
    name: "Vịt",
    purchaseGold: 6,
    eggIntervalMs: 6 * 60 * 60 * 1000, // 06h00m
    lifespanMs: 212 * 60 * 60 * 1000,
    eggTypeId: "duck_egg",
    eggSellGold: 15,
    eggSellXp: 5,
    requiredRank: { familyId: "binh_nhi", tier: 1 },
  },
  {
    id: "quail",
    name: "Chim Cút",
    purchaseGold: 9,
    eggIntervalMs: 7.5 * 60 * 60 * 1000, // 07h30m
    lifespanMs: 224 * 60 * 60 * 1000,
    eggTypeId: "quail_egg",
    eggSellGold: 21,
    eggSellXp: 7,
    requiredRank: { familyId: "ha_si", tier: 1 },
  },
  {
    id: "goose",
    name: "Ngỗng",
    purchaseGold: 14,
    eggIntervalMs: 9 * 60 * 60 * 1000, // 09h00m
    lifespanMs: 236 * 60 * 60 * 1000,
    eggTypeId: "goose_egg",
    eggSellGold: 45,
    eggSellXp: 15,
    requiredRank: { familyId: "thuong_si", tier: 1 },
  },
  {
    id: "muscovy_duck",
    name: "Ngan",
    purchaseGold: 20,
    eggIntervalMs: 10.5 * 60 * 60 * 1000, // 10h30m
    lifespanMs: 248 * 60 * 60 * 1000,
    eggTypeId: "muscovy_duck_egg",
    eggSellGold: 63,
    eggSellXp: 21,
    requiredRank: { familyId: "trung_uy", tier: 1 },
  },
  {
    id: "turkey",
    name: "Gà Tây",
    purchaseGold: 34,
    eggIntervalMs: 12 * 60 * 60 * 1000, // 12h00m
    lifespanMs: 260 * 60 * 60 * 1000,
    eggTypeId: "turkey_egg",
    eggSellGold: 87,
    eggSellXp: 29,
    requiredRank: { familyId: "dai_uy", tier: 1 },
  },
  {
    id: "guinea_fowl",
    name: "Gà Sao",
    purchaseGold: 46,
    eggIntervalMs: 14 * 60 * 60 * 1000, // 14h00m
    lifespanMs: 272 * 60 * 60 * 1000,
    eggTypeId: "guinea_fowl_egg",
    eggSellGold: 108,
    eggSellXp: 36,
    requiredRank: { familyId: "trung_ta", tier: 1 },
  },
  {
    id: "pheasant",
    name: "Chim Trĩ",
    purchaseGold: 60,
    eggIntervalMs: 16.5 * 60 * 60 * 1000, // 16h30m
    lifespanMs: 284 * 60 * 60 * 1000,
    eggTypeId: "pheasant_egg",
    eggSellGold: 129,
    eggSellXp: 43,
    requiredRank: { familyId: "dai_ta", tier: 1 },
  },
  {
    id: "peafowl",
    name: "Công",
    purchaseGold: 72,
    eggIntervalMs: 18 * 60 * 60 * 1000, // 18h00m
    lifespanMs: 296 * 60 * 60 * 1000,
    eggTypeId: "peafowl_egg",
    eggSellGold: 165,
    eggSellXp: 55,
    requiredRank: { familyId: "trung_tuong", tier: 1 },
  },
  {
    id: "ostrich",
    name: "Đà Điểu",
    purchaseGold: 90,
    eggIntervalMs: 21 * 60 * 60 * 1000, // 21h00m
    lifespanMs: 308 * 60 * 60 * 1000,
    eggTypeId: "ostrich_egg",
    eggSellGold: 189,
    eggSellXp: 63,
    requiredRank: { familyId: "dai_tuong", tier: 1 },
  },
];

export const FEED_CATALOG: FeedDefinition[] = [
  {
    id: "feed_normal",
    name: "Thức ăn loại thường",
    costGold: 10,
    buffAmount: 20,
    speedBonusPercent: 10,
    requiredRank: { familyId: "hoc_vien", tier: null },
  },
  {
    id: "feed_good",
    name: "Thức ăn loại tốt",
    costGold: 10,
    buffAmount: 20,
    speedBonusPercent: 16,
    requiredRank: { familyId: "ha_si", tier: 1 },
  },
  {
    id: "feed_super",
    name: "Thức ăn siêu tốt",
    costGold: 10,
    buffAmount: 20,
    speedBonusPercent: 25,
    requiredRank: { familyId: "thieu_uy", tier: 1 },
  },
];

export const FERTILIZER_CATALOG: FertilizerDefinition[] = [
  {
    id: "fertilizer_nutrition_normal",
    name: "Phân Dinh Dưỡng Loại Thường",
    category: "nutrition",
    purchaseGold: 3,
    xpBonusPct: 0.04,
    growthTimeReductionPct: 0,
    requiredRank: { familyId: "binh_nhi", tier: 1 },
    icon: "🌱",
  },
  {
    id: "fertilizer_growth_normal",
    name: "Phân Tăng Trưởng Loại Thường",
    category: "growth",
    purchaseGold: 3,
    xpBonusPct: 0,
    growthTimeReductionPct: 0.04,
    requiredRank: { familyId: "binh_nhi", tier: 1 },
    icon: "⏱",
  },
  {
    id: "fertilizer_nutrition_medium",
    name: "Phân Dinh Dưỡng Loại Vừa",
    category: "nutrition",
    purchaseGold: 6,
    xpBonusPct: 0.07,
    growthTimeReductionPct: 0,
    requiredRank: { familyId: "ha_si", tier: 1 },
    icon: "🌱",
  },
  {
    id: "fertilizer_growth_medium",
    name: "Phân Tăng Trưởng Loại Vừa",
    category: "growth",
    purchaseGold: 6,
    xpBonusPct: 0,
    growthTimeReductionPct: 0.07,
    requiredRank: { familyId: "ha_si", tier: 1 },
    icon: "⏱",
  },
  {
    id: "fertilizer_nutrition_good",
    name: "Phân Dinh Dưỡng Loại Tốt",
    category: "nutrition",
    purchaseGold: 20,
    xpBonusPct: 0.10,
    growthTimeReductionPct: 0,
    requiredRank: { familyId: "thieu_uy", tier: 1 },
    icon: "🌱",
  },
  {
    id: "fertilizer_growth_good",
    name: "Phân Tăng Trưởng Loại Tốt",
    category: "growth",
    purchaseGold: 20,
    xpBonusPct: 0,
    growthTimeReductionPct: 0.10,
    requiredRank: { familyId: "thieu_uy", tier: 1 },
    icon: "⏱",
  },
  {
    id: "fertilizer_nutrition_super",
    name: "Phân Dinh Dưỡng Loại Siêu Tốt",
    category: "nutrition",
    purchaseGold: 55,
    xpBonusPct: 0.15,
    growthTimeReductionPct: 0,
    requiredRank: { familyId: "thieu_ta", tier: 1 },
    icon: "🌱",
  },
  {
    id: "fertilizer_growth_super",
    name: "Phân Tăng Trưởng Loại Siêu Tốt",
    category: "growth",
    purchaseGold: 55,
    xpBonusPct: 0,
    growthTimeReductionPct: 0.15,
    requiredRank: { familyId: "thieu_ta", tier: 1 },
    icon: "⏱",
  },
  {
    id: "fertilizer_premium_3",
    name: "Phân Cao Cấp Loại 3",
    category: "premium",
    purchaseGold: 75,
    xpBonusPct: 0.15,
    growthTimeReductionPct: 0.15,
    requiredRank: { familyId: "dai_ta", tier: 1 },
    icon: "✨",
  },
  {
    id: "fertilizer_premium_2",
    name: "Phân Cao Cấp Loại 2",
    category: "premium",
    purchaseGold: 100,
    xpBonusPct: 0.2,
    growthTimeReductionPct: 0.2,
    requiredRank: { familyId: "trung_tuong", tier: 1 },
    icon: "✨",
  },
  {
    id: "fertilizer_premium_1",
    name: "Phân Cao Cấp Loại 1",
    category: "premium",
    purchaseGold: 130,
    xpBonusPct: 0.25,
    growthTimeReductionPct: 0.25,
    requiredRank: { familyId: "dai_tuong", tier: 1 },
    icon: "✨",
  },
];

const EGG_NAME_MAP: Record<EggTypeId, string> = {
  chicken_egg: "Trứng Gà",
  duck_egg: "Trứng Vịt",
  quail_egg: "Trứng Chim Cút",
  goose_egg: "Trứng Ngỗng",
  muscovy_duck_egg: "Trứng Ngan",
  turkey_egg: "Trứng Gà Tây",
  guinea_fowl_egg: "Trứng Gà Sao",
  pheasant_egg: "Trứng Chim Trĩ",
  peafowl_egg: "Trứng Công",
  ostrich_egg: "Trứng Đà Điểu",
};

/**
 * Egg prices are derived from ANIMAL_CATALOG so the store, pen and actual sale
 * always use the same source of truth.
 */
export const EGG_INFO_MAP = Object.fromEntries(
  ANIMAL_CATALOG.map((animal) => [
    animal.eggTypeId,
    {
      name: EGG_NAME_MAP[animal.eggTypeId],
      sellGold: animal.eggSellGold,
      sellXp: animal.eggSellXp,
      animalName: animal.name,
    },
  ])
) as Record<
  EggTypeId,
  { name: string; sellGold: number; sellXp: number; animalName: string }
>;

export const FARM_PLOT_COUNT = 24;
export const FARM_PLOT_UNLOCKS: PlotUnlockDefinition[] = [
  { plotIndex: 0, gold: 0, requiredRank: null, unlockedByDefault: true },
  { plotIndex: 1, gold: 0, requiredRank: null, unlockedByDefault: true },
  { plotIndex: 2, gold: 15, requiredRank: { familyId: "enlisted_3", tier: 3 }, unlockedByDefault: false },
  { plotIndex: 3, gold: 25, requiredRank: { familyId: "nco_1", tier: 5 }, unlockedByDefault: false },
  { plotIndex: 4, gold: 40, requiredRank: { familyId: "nco_2", tier: 6 }, unlockedByDefault: false },
  { plotIndex: 5, gold: 65, requiredRank: { familyId: "junior_1", tier: 1 }, unlockedByDefault: false },
  { plotIndex: 6, gold: 95, requiredRank: { familyId: "junior_1", tier: 7 }, unlockedByDefault: false },
  { plotIndex: 7, gold: 135, requiredRank: { familyId: "junior_2", tier: 6 }, unlockedByDefault: false },
  { plotIndex: 8, gold: 180, requiredRank: { familyId: "junior_3", tier: 4 }, unlockedByDefault: false },
  { plotIndex: 9, gold: 230, requiredRank: { familyId: "junior_4", tier: 3 }, unlockedByDefault: false },
  { plotIndex: 10, gold: 285, requiredRank: { familyId: "field_1", tier: 2 }, unlockedByDefault: false },
  { plotIndex: 11, gold: 350, requiredRank: { familyId: "field_1", tier: 8 }, unlockedByDefault: false },
  { plotIndex: 12, gold: 425, requiredRank: { familyId: "field_2", tier: 5 }, unlockedByDefault: false },
  { plotIndex: 13, gold: 500, requiredRank: { familyId: "field_3", tier: 2 }, unlockedByDefault: false },
  { plotIndex: 14, gold: 585, requiredRank: { familyId: "field_3", tier: 8 }, unlockedByDefault: false },
  { plotIndex: 15, gold: 680, requiredRank: { familyId: "field_4", tier: 5 }, unlockedByDefault: false },
  { plotIndex: 16, gold: 780, requiredRank: { familyId: "general_1", tier: 2 }, unlockedByDefault: false },
  { plotIndex: 17, gold: 885, requiredRank: { familyId: "general_1", tier: 8 }, unlockedByDefault: false },
  { plotIndex: 18, gold: 995, requiredRank: { familyId: "general_2", tier: 3 }, unlockedByDefault: false },
  { plotIndex: 19, gold: 1115, requiredRank: { familyId: "general_2", tier: 9 }, unlockedByDefault: false },
  { plotIndex: 20, gold: 1240, requiredRank: { familyId: "general_3", tier: 4 }, unlockedByDefault: false },
  { plotIndex: 21, gold: 1375, requiredRank: { familyId: "general_3", tier: 11 }, unlockedByDefault: false },
  { plotIndex: 22, gold: 1515, requiredRank: { familyId: "general_4", tier: 5 }, unlockedByDefault: false },
  { plotIndex: 23, gold: 1665, requiredRank: { familyId: "general_4", tier: 12 }, unlockedByDefault: false },
];

/**
 * Formats egg countdown timer for animal egg production display.
 * Rules:
 * - >= 1 hour: XXh:YYm
 * - < 1 hour and >= 1 minute: XXm:YYs
 * - < 1 minute: XXs
 */
export function formatEggCountdown(remainingMs: number): string {
  const ms = Math.max(0, remainingMs);
  const pad2 = (num: number) => String(num).padStart(2, "0");

  if (ms >= 3_600_000) {
    const hours = Math.floor(ms / 3_600_000);
    const minutes = Math.floor((ms % 3_600_000) / 60_000);
    return `${pad2(hours)}h:${pad2(minutes)}m`;
  }

  if (ms >= 60_000) {
    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.floor((ms % 60_000) / 1000);
    return `${pad2(minutes)}m:${pad2(seconds)}s`;
  }

  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${pad2(seconds)}s`;
}


import { ANIMAL_CATALOG, EGG_INFO_MAP } from "./farmCatalog";
import { gameConfig } from "../../game/config";
import { getRequiredXpTicksForTransition } from "../../game/xpEngine";
import { createInitialGameState } from "../../storage/GameRepository";
import {
  applyQualityMultiplier,
  createDefaultFarmState,
  harvestPlot,
  sellEggs,
} from "./farmEngine";
import { applyFarmXpReward } from "./farmXpReward";
import { HARVEST_CROP_QUALITY_COLORS } from "./farmVisualTheme";
import { QUALITY_CONFIG } from "./weatherEngine";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

console.log("=== QUALITY REWARD REGRESSION TESTS ===\n");

const canonicalQualityColors = {
  thuong: "#f8fafc",
  tot: "#38bdf8",
  hiem: "#c084fc",
  hoan_my: "#fb923c",
} as const;

for (const quality of Object.keys(canonicalQualityColors) as Array<keyof typeof canonicalQualityColors>) {
  assert(
    QUALITY_CONFIG[quality].color === canonicalQualityColors[quality] &&
      HARVEST_CROP_QUALITY_COLORS[quality] === QUALITY_CONFIG[quality].color,
    `${QUALITY_CONFIG[quality].name} uses one canonical text and frame color`,
  );
}

assert(
  EGG_INFO_MAP.chicken_egg.sellGold === 6 &&
    EGG_INFO_MAP.chicken_egg.sellXp === 3,
  "Trứng Gà uses the intended 6 Gold / 3 XP base price"
);

for (const animal of ANIMAL_CATALOG) {
  const eggInfo = EGG_INFO_MAP[animal.eggTypeId];
  assert(
    eggInfo.sellGold === animal.eggSellGold,
    `${eggInfo.name} uses the animal catalog Gold price`
  );
  assert(
    eggInfo.sellXp === animal.eggSellXp,
    `${eggInfo.name} uses the animal catalog XP price`
  );
}

assert(
  applyQualityMultiplier(3, 1.1) === 4,
  "Tốt quality grants a visible bonus for a 3-point reward"
);
assert(
  applyQualityMultiplier(10, 1.0) === 10,
  "Thường quality preserves the base reward"
);

const eggFarm = createDefaultFarmState();
eggFarm.inventory.eggs.chicken_egg = 1;
eggFarm.eggQualityInventory!.chicken_egg.tot.count = 1;
const eggSale = sellEggs(eggFarm, "chicken_egg", 1);

assert(
  eggSale.goldEarned ===
    applyQualityMultiplier(EGG_INFO_MAP.chicken_egg.sellGold, 1.1),
  "Tốt egg sale applies the Gold multiplier"
);
assert(
  eggSale.xpEarned ===
    applyQualityMultiplier(EGG_INFO_MAP.chicken_egg.sellXp, 1.1),
  "Tốt egg sale applies a visible XP multiplier"
);
assert(
  eggSale.qualityBreakdown.tot.quantity === 1,
  "Egg sale summary records the sold quality tier"
);
assert(
  eggSale.qualityBreakdown.tot.baseGold === 6 &&
    eggSale.qualityBreakdown.tot.qualityBonusGold === 1 &&
    eggSale.qualityBreakdown.tot.baseXp === 3 &&
    eggSale.qualityBreakdown.tot.qualityBonusXp === 1,
  "Egg sale separates base rewards from Tốt quality bonuses"
);

const mixedEggFarm = createDefaultFarmState();
mixedEggFarm.inventory.eggs.chicken_egg = 10;
mixedEggFarm.eggQualityInventory!.chicken_egg.thuong.count = 5;
mixedEggFarm.eggQualityInventory!.chicken_egg.tot.count = 2;
mixedEggFarm.eggQualityInventory!.chicken_egg.hiem.count = 3;
const mixedEggSale = sellEggs(mixedEggFarm, "chicken_egg", 10);

assert(
  mixedEggSale.goldEarned === 66 && mixedEggSale.xpEarned === 34,
  "Mixed 5 Thường / 2 Tốt / 3 Hiếm sale earns 66 Gold and 34 XP"
);
assert(
  mixedEggSale.qualityBreakdown.thuong.baseGold === 30 &&
    mixedEggSale.qualityBreakdown.thuong.qualityBonusGold === 0 &&
    mixedEggSale.qualityBreakdown.thuong.baseXp === 15 &&
    mixedEggSale.qualityBreakdown.thuong.qualityBonusXp === 0,
  "Thường row shows +30 Gold (+0) and +15 XP (+0)"
);
assert(
  mixedEggSale.qualityBreakdown.tot.baseGold === 12 &&
    mixedEggSale.qualityBreakdown.tot.qualityBonusGold === 1 &&
    mixedEggSale.qualityBreakdown.tot.baseXp === 6 &&
    mixedEggSale.qualityBreakdown.tot.qualityBonusXp === 1,
  "Tốt row shows +12 Gold (+1) and +6 XP (+1)"
);
assert(
  mixedEggSale.qualityBreakdown.hiem.baseGold === 18 &&
    mixedEggSale.qualityBreakdown.hiem.qualityBonusGold === 5 &&
    mixedEggSale.qualityBreakdown.hiem.baseXp === 9 &&
    mixedEggSale.qualityBreakdown.hiem.qualityBonusXp === 3,
  "Hiếm row shows +18 Gold (+5) and +9 XP (+3)"
);

const cropFarm = createDefaultFarmState();
cropFarm.plots[0] = {
  status: "ready",
  cropId: "carrot",
  plantedAt: 1,
  wateringCount: 0,
  wateredStages: [false, false, false],
  rolledQuality: "tot",
};
const cropHarvest = harvestPlot(cropFarm, 0, cropFarm.lastSettledAt);

assert(cropHarvest !== null, "Tốt crop can be harvested");
assert(cropHarvest!.goldEarned === 6, "Tốt crop applies ×1.1 to Gold");
assert(cropHarvest!.xpEarned === 6, "Tốt crop applies ×1.1 to XP");
assert(
  cropHarvest!.qualityBreakdown.tot.quantity === 1,
  "Crop harvest summary records the harvested quality tier"
);
assert(
  cropHarvest!.qualityBreakdown.tot.baseGold === 5 &&
    cropHarvest!.qualityBreakdown.tot.qualityBonusGold === 1 &&
    cropHarvest!.qualityBreakdown.tot.baseXp === 5 &&
    cropHarvest!.qualityBreakdown.tot.qualityBonusXp === 1,
  "Crop harvest separates base rewards from quality bonuses"
);

const fullXpCropState = createInitialGameState("Farm XP crop QA");
const rankXpCap = getRequiredXpTicksForTransition(
  fullXpCropState.progression.currentRankIndex
);
fullXpCropState.progression.xpIntoCurrentRankTicks = rankXpCap;
fullXpCropState.progression.totalXpEarnedTicks = rankXpCap;
const totalXpBeforeFullCropReward =
  fullXpCropState.progression.totalXpEarnedTicks;
const fullXpCropReward = applyFarmXpReward(
  fullXpCropState,
  cropHarvest!.xpEarned
);

assert(
  fullXpCropReward.displayedXp === cropHarvest!.xpEarned,
  "Full XP bar still displays the complete crop harvest XP reward"
);
assert(
  fullXpCropReward.creditedTicks === 0 &&
    fullXpCropReward.discardedTicks ===
      cropHarvest!.xpEarned * gameConfig.xpTicksPerXp,
  "Full XP bar discards crop XP instead of carrying it to the next rank"
);
assert(
  fullXpCropState.progression.totalXpEarnedTicks ===
    totalXpBeforeFullCropReward,
  "Discarded crop XP is not added to rank progression"
);

const fullXpEggState = createInitialGameState("Farm XP egg QA");
fullXpEggState.progression.xpIntoCurrentRankTicks = rankXpCap;
fullXpEggState.progression.totalXpEarnedTicks = rankXpCap;
const totalXpBeforeFullEggReward = fullXpEggState.progression.totalXpEarnedTicks;
const fullXpEggReward = applyFarmXpReward(fullXpEggState, eggSale.xpEarned);

assert(
  fullXpEggReward.displayedXp === eggSale.xpEarned,
  "Full XP bar still displays the complete egg sale XP reward"
);
assert(
  fullXpEggReward.creditedTicks === 0 &&
    fullXpEggReward.discardedTicks ===
      eggSale.xpEarned * gameConfig.xpTicksPerXp &&
    fullXpEggState.progression.totalXpEarnedTicks ===
      totalXpBeforeFullEggReward,
  "Full XP bar discards egg sale XP without storing it"
);

console.log("\nALL QUALITY REWARD REGRESSION TESTS PASSED");

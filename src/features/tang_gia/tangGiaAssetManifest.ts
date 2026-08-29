import type {
  CropId,
  FeedTypeId,
  FertilizerTypeId,
} from "./farmTypes";
import type { CanonicalWeatherSlot } from "./weatherEngine";

export type CropAssetStage = "seed" | "sprout" | "young" | "mature";
export type SoilAssetState = "empty" | "planted" | "need_water";
export type FarmBackgroundVariant = "day" | "cool" | "night";

const ASSET_ROOT = "/assets/tanggia";

function cropStageAssets(cropId: CropId): Record<CropAssetStage, string> {
  const cropRoot = `${ASSET_ROOT}/crops/${cropId}`;
  return {
    seed: `${cropRoot}/${cropId}_seed.png`,
    sprout: `${cropRoot}/${cropId}_sprout.png`,
    young: `${cropRoot}/${cropId}_young.png`,
    mature: `${cropRoot}/${cropId}_mature.png`,
  };
}

export const TANG_GIA_ASSETS = {
  backgrounds: {
    day: `${ASSET_ROOT}/background/tanggia_background_day.png`,
    cool: `${ASSET_ROOT}/background/tanggia_background_cool.png`,
    night: `${ASSET_ROOT}/background/tanggia_background_night.png`,
  } satisfies Record<FarmBackgroundVariant, string>,
  livestockPen: `${ASSET_ROOT}/buildings/livestock/livestock_pen_transparent.png`,
  soil: {
    empty: `${ASSET_ROOT}/soil/soil_empty.png`,
    planted: `${ASSET_ROOT}/soil/soil_planted_flat.png`,
    need_water: `${ASSET_ROOT}/soil/soil_need_water.png`,
  } satisfies Record<SoilAssetState, string>,
  crops: {
    carrot: cropStageAssets("carrot"),
    cabbage: cropStageAssets("cabbage"),
    potato: cropStageAssets("potato"),
    tomato: cropStageAssets("tomato"),
    strawberry: cropStageAssets("strawberry"),
    corn: cropStageAssets("corn"),
    pumpkin: cropStageAssets("pumpkin"),
    watermelon: cropStageAssets("watermelon"),
    pineapple: cropStageAssets("pineapple"),
    banana: cropStageAssets("banana"),
    orange: cropStageAssets("orange"),
    mango: cropStageAssets("mango"),
    apple: cropStageAssets("apple"),
    pear: cropStageAssets("pear"),
    grape: cropStageAssets("grape"),
    dragon_fruit: cropStageAssets("dragon_fruit"),
    avocado: cropStageAssets("avocado"),
    durian: cropStageAssets("durian"),
    mangosteen: cropStageAssets("mangosteen"),
  } satisfies Record<CropId, Record<CropAssetStage, string>>,
  fertilizer: {
    fertilizer_nutrition_normal: `${ASSET_ROOT}/items/fertilizer/fertilizer_nutrition_normal.png`,
    fertilizer_growth_normal: `${ASSET_ROOT}/items/fertilizer/fertilizer_growth_normal.png`,
    fertilizer_nutrition_medium: `${ASSET_ROOT}/items/fertilizer/fertilizer_nutrition_medium.png`,
    fertilizer_growth_medium: `${ASSET_ROOT}/items/fertilizer/fertilizer_growth_medium.png`,
    fertilizer_nutrition_good: `${ASSET_ROOT}/items/fertilizer/fertilizer_nutrition_good.png`,
    fertilizer_growth_good: `${ASSET_ROOT}/items/fertilizer/fertilizer_growth_good.png`,
    fertilizer_nutrition_super: `${ASSET_ROOT}/items/fertilizer/fertilizer_nutrition_super.png`,
    fertilizer_growth_super: `${ASSET_ROOT}/items/fertilizer/fertilizer_growth_super.png`,
    fertilizer_premium_3: `${ASSET_ROOT}/items/fertilizer/fertilizer_premium_3.png`,
    fertilizer_premium_2: `${ASSET_ROOT}/items/fertilizer/fertilizer_premium_2.png`,
    fertilizer_premium_1: `${ASSET_ROOT}/items/fertilizer/fertilizer_premium_1.png`,
  } satisfies Record<FertilizerTypeId, string>,
  feed: {
    feed_normal: `${ASSET_ROOT}/items/feed/feed_normal.png`,
    feed_good: `${ASSET_ROOT}/items/feed/feed_good.png`,
    feed_super: `${ASSET_ROOT}/items/feed/feed_super.png`,
  } satisfies Record<FeedTypeId, string>,
} as const;

export function getCropAsset(cropId: CropId, stage: CropAssetStage): string {
  return TANG_GIA_ASSETS.crops[cropId][stage];
}

export function getSoilAsset(state: SoilAssetState): string {
  return TANG_GIA_ASSETS.soil[state];
}

export function getFarmBackgroundAsset(
  slot?: Pick<CanonicalWeatherSlot, "phase" | "weather">,
): string {
  if (slot?.phase === "night") return TANG_GIA_ASSETS.backgrounds.night;
  if (slot?.weather === "cool") return TANG_GIA_ASSETS.backgrounds.cool;
  return TANG_GIA_ASSETS.backgrounds.day;
}

export function getFertilizerAsset(fertilizerId: FertilizerTypeId): string {
  return TANG_GIA_ASSETS.fertilizer[fertilizerId];
}

export function getFeedAsset(feedId: FeedTypeId): string {
  return TANG_GIA_ASSETS.feed[feedId];
}

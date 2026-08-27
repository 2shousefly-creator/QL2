import type { CropId } from "./farmTypes";

export type CropAssetStage = "sprout" | "young" | "mature";
export type SoilAssetState = "empty" | "planted" | "need_water";

const ASSET_ROOT = "/assets/tanggia";

function cropStageAssets(cropId: CropId): Record<CropAssetStage, string> {
  const cropRoot = `${ASSET_ROOT}/crops/${cropId}`;
  return {
    sprout: `${cropRoot}/${cropId}_sprout.png`,
    young: `${cropRoot}/${cropId}_young.png`,
    mature: `${cropRoot}/${cropId}_mature.png`,
  };
}

export const TANG_GIA_ASSETS = {
  background: `${ASSET_ROOT}/background/tanggia_background.png`,
  sharedSeed: `${ASSET_ROOT}/crops/shared/shared_seed.png`,
  livestockPen: `${ASSET_ROOT}/buildings/livestock/livestock_pen.png`,
  soil: {
    empty: `${ASSET_ROOT}/soil/soil_empty.png`,
    planted: `${ASSET_ROOT}/soil/soil_planted.png`,
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
} as const;

export function getCropAsset(cropId: CropId, stage: CropAssetStage): string {
  return TANG_GIA_ASSETS.crops[cropId][stage];
}

export function getSoilAsset(state: SoilAssetState): string {
  return TANG_GIA_ASSETS.soil[state];
}

import { RANK_STEPS } from '../../game/rankBuilder';
import type { FarmSaveState, CropEconomySnapshot, CropDefinition, FertilizerDefinition } from './farmTypes';

const LEGACY_UNLOCKS = ['enlisted_2', 'nco_1', 'junior_1', 'junior_4', 'field_3', 'general_2', 'endgame_1'];
// Divisible by every possible plot count (1..24). Rewards retain their fraction
// across transactions, including bulk harvest, without rounding each plot up.
export const FARM_REWARD_SCALE = 5_354_228_880;
export function getFarmProductivity(rankIndex: number, opened: number): number {
  const baseline = 2 + LEGACY_UNLOCKS.filter(family => {
    const rank = RANK_STEPS.find(step => step.familyId === family && step.tier === 1);
    return rank && rankIndex >= rank.rankIndex;
  }).length;
  return Math.min(1, baseline / Math.max(2, opened));
}
export function createCropEconomy(farm: FarmSaveState, rankIndex: number, crop: CropDefinition, fertilizer?: FertilizerDefinition | null): CropEconomySnapshot {
  return { productivity: getFarmProductivity(rankIndex, farm.unlockedPlotCount), inputGold: crop.seedCostGold + (fertilizer?.purchaseGold ?? 0) };
}
export function normalizeCropReward(gold: number, xp: number, snapshot?: CropEconomySnapshot) {
  const k = snapshot?.productivity ?? 1, cost = snapshot?.inputGold ?? 0;
  return { gold: cost + k * (gold - cost), xp: k * xp };
}
export function creditCropGold(farm: FarmSaveState, value: number): number {
  const units = Math.round(value * FARM_REWARD_SCALE) + (farm.goldRemainder ?? 0);
  const gold = Math.floor(units / FARM_REWARD_SCALE);
  farm.goldRemainder = units - gold * FARM_REWARD_SCALE;
  return gold;
}

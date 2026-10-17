import type { GameState, RankStep } from '../../../game/types';
import type { FarmSaveState } from '../farmTypes';
import type { FarmPresentationState } from '../farmPresentation';
import { formatFeedPercentage } from '../farmPresentation';
import { ANIMAL_CATALOG, CROP_CATALOG, FERTILIZER_CATALOG, FARM_PLOT_UNLOCKS } from '../farmCatalog';
import { getCropHarvestPreview, getRankNameForDisplay, getAnimalCapacity, getCropGrowthProgress, getCurrentCropRemainingDurationMs, hasCropFertilizer } from '../farmEngine';
import { normalizeCropReward } from '../farmEconomy';
import { getAnimalVisualScale, getAnimalLifeRemainingRatio, getPenDangerRatio, getStarvationDeadlineAt, isAnimalDead } from '../animalLifecycle';
import { getCropVisualStage } from '../farmVisualTheme';
import { getSoilMoistureBand, getSoilMoisturePresentation } from '../soilMoistureEngine';
import { getPestPresentation } from '../pestEngine';
import { getSoilMoistureRatePerHour, getWeatherMoistureDescription, getWeatherPresentation, SEASON_METADATA } from '../weatherEngine';
import type { CanonicalWeatherSlot } from '../weatherEngine';
import { getFarmPlayerXpPercentage } from '../components/FarmXpProgressBar';
import type { FarmMobileSnapshot } from './mobileTypes';

export function mobileCountdown(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return 'Đang tính…';
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}g ${Math.floor(seconds % 3600 / 60)}p`;
  return `${Math.floor(seconds / 60)}p ${seconds % 60}s`;
}

/** Compact live plot timer; duration still comes exclusively from the crop projection. */
function plotCountdown(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return 'Đang tính…';
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60]
    .map(value => String(value).padStart(2, '0')).join(':');
}

/** Takes the owner's existing projection. No second settlement, timer or save. */
export function adaptFarmMobile(game: GameState, farm: FarmSaveState, view: FarmPresentationState,
  rank: RankStep, weather: CanonicalWeatherSlot, now: number): FarmMobileSnapshot {
  const deadline = getStarvationDeadlineAt(view.penStarvationStartedAt);
  return {
    worker: farm.worker, now,
    gold: farm.gold.toLocaleString('vi-VN'), xp: getFarmPlayerXpPercentage(game),
    weatherLabel: `${getWeatherPresentation(weather.weather, weather.season).name} · ${weather.phase === 'night' ? 'Đêm' : 'Ngày'}`,
    weatherDescription: `${SEASON_METADATA[weather.season].name}. ${getWeatherMoistureDescription(weather.season, weather.phase, weather.weather)}\n${getWeatherPresentation(weather.weather, weather.season).fullDesc}\nĐộ ẩm: ${getSoilMoistureRatePerHour(weather.season, weather.phase, weather.weather)}/giờ\nSlot còn: ${mobileCountdown(weather.remainingMs)}. Chu kỳ UTC+7.`,
    weather: weather.weather, phase: weather.phase,
    plots: view.plots.map((plot, index) => {
      const cropId = plot.status === 'growing' || plot.status === 'ready' ? plot.cropId : null;
      const moisture = plot.status === 'locked' ? 0 : plot.soilMoisture;
      const band = getSoilMoistureBand(moisture);
      const progress = getCropGrowthProgress(plot);
      const crop = CROP_CATALOG.find(item => item.id === cropId);
      const reward = plot.status === 'ready' ? getCropHarvestPreview(farm, index, plot) : plot.status === 'growing' && crop ? normalizeCropReward(crop.harvestGold, crop.harvestXp + Math.round(crop.harvestXp * (plot.fertilizerXpBonusPct ?? 0)), plot.economy) : null;
      const gold = reward && ('goldEarned' in reward ? reward.goldEarned : reward.gold), xp = reward && ('xpEarned' in reward ? reward.xpEarned : reward.xp);
      const format = (n: number) => n.toLocaleString('vi-VN', {maximumFractionDigits: 2});
      const unlock = FARM_PLOT_UNLOCKS[index];
      const detail = plot.status === 'locked' ? `Mở tại ${getRankNameForDisplay(unlock?.requiredRank ?? null)} · ${unlock?.gold ?? 0} vàng` : `Độ ẩm ${Math.floor(moisture)}% · ${plot.status === 'growing' || plot.status === 'ready' ? FERTILIZER_CATALOG.find(f => f.id === plot.fertilizerId)?.name ?? 'Chưa bón phân' : 'Ô trống'}${plot.status === 'growing' || plot.status === 'ready' ? ` · Sâu ${Math.floor(plot.pestPressure)}%` : ''}`;
      return { index, status: plot.status, cropId, plantedAt: plot.status === 'growing' || plot.status === 'ready' ? plot.plantedAt : undefined, stage: getCropVisualStage(getCropGrowthProgress(plot)),
        detail, rewardLabel: reward ? `${plot.status === 'ready' ? 'Thưởng dự kiến' : 'Thưởng cơ bản'}: ${format(gold!)} vàng · ${format(xp!)} EXP` : undefined,
        artStage: plot.status === 'ready' ? 'ready' : progress >= .9 ? 'mature' : progress >= .6 ? 'growing' : progress >= .3 ? 'young' : progress >= .06 ? 'sprout' : 'seeded',
        title: cropId ? CROP_CATALOG.find(crop => crop.id === cropId)!.name : `Ô đất ${index + 1}`,
        timer: plot.status === 'ready' ? 'Thu hoạch' : plot.status === 'growing'
          ? plotCountdown(getCurrentCropRemainingDurationMs(plot, now, farm.weatherSeed)) : '',
        moisture, moistureLabel: getSoilMoisturePresentation(moisture).label,
        thirsty: plot.status !== 'locked' && (band === 'thirsty' || band === 'barren' || band === 'drying'),
        fertilizer: hasCropFertilizer(plot), pest: !!getPestPresentation(plot, now), quality: plot.status === 'ready' ? plot.rolledQuality : undefined };
    }),
    animals: view.penAnimals.map(animal => {
      const definition = ANIMAL_CATALOG.find(item => item.id === animal.animalTypeId)!;
      const dead = isAnimalDead(animal);
      return { id: animal.instanceId, species: animal.animalTypeId, title: definition.name, dead,
        storedEggs: farm.inventory.eggs[definition.eggTypeId] || 0,
        weak: !dead && view.penFeedBuffValue <= 0 && deadline !== null,
        scale: getAnimalVisualScale(animal, definition, now),
        lifeRemaining: dead ? 'Đã chết' : mobileCountdown(animal.lifeEndsAt - now),
        lifeRatio: getAnimalLifeRemainingRatio(animal, definition, now),
        timer: dead ? 'Đã chết' : plotCountdown(animal.nextEggAt - now) };
    }),
    feed: view.penFeedBuffValue, feedLabel: formatFeedPercentage(view.penFeedBuffValue),
    feedRemaining: view.penAnimals.some(animal => !isAnimalDead(animal))
      ? mobileCountdown(view.penFeedEmptyAt == null ? null : view.penFeedEmptyAt - now) : 'Chưa có vật nuôi',
    feedBonus: view.activeFeedSpeedBonus,
    dangerRemaining: deadline === null ? null : mobileCountdown(deadline - now),
    dangerRatio: getPenDangerRatio(view.penStarvationStartedAt, now),
    capacity: getAnimalCapacity(rank),
    // Eggs are already stored; never infer a new collect action from nextEggAt.
    eggs: Object.values(farm.inventory.eggs).reduce((sum, count) => sum + (count || 0), 0),
  };
}

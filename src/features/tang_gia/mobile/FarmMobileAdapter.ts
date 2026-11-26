import type { GameState, RankStep } from '../../../game/types';
import type { FarmSaveState } from '../farmTypes';
import type { FarmPresentationState } from '../farmPresentation';
import { formatFeedPercentage } from '../farmPresentation';
import { ANIMAL_CATALOG, CROP_CATALOG, FERTILIZER_CATALOG, FARM_PLOT_UNLOCKS } from '../farmCatalog';
import {
  getCropHarvestPreview,
  getRankNameForDisplay,
  getAnimalCapacity,
  getCropGrowthProgress,
  getCurrentCropRemainingDurationMs,
  hasCropFertilizer,
} from '../farmEngine';
import { roundFarmXp, normalizeCropReward } from '../farmEconomy';
import {
  getAffordableUpgradeCount,
  getFarmUpgrades,
  getReadyLogisticsClaimCount,
  getSoilMoistureLossMultiplier,
  getWarehouseGoldMultiplier,
  getWarehouseXpMultiplier,
} from '../farmEnhancements';
import { getAnimalVisualScale, getAnimalLifeRemainingRatio, getPenDangerRatio, getStarvationDeadlineAt, isAnimalDead } from '../animalLifecycle';
import { getCropVisualStage } from '../farmVisualTheme';
import { getSoilMoistureBand, getSoilMoisturePresentation } from '../soilMoistureEngine';
import { getPestPresentation } from '../pestEngine';
import { getSoilMoistureRatePerHour, getWeatherMoistureDescription, getWeatherPresentation, SEASON_METADATA } from '../weatherEngine';
import type { CanonicalWeatherSlot } from '../weatherEngine';
import { getFarmPlayerXpPercentage } from '../components/FarmXpProgressBar';
import type { FarmMobileSnapshot, MobilePlot } from './mobileTypes';

export function mobileCountdown(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return 'Chưa rõ';
  const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}p` : m > 0 ? `${m}p ${sec}s` : `${sec}s`;
}

/** Compact live plot timer; duration still comes exclusively from the crop projection. */
function plotCountdown(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return 'Tạm dừng';
  const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (d > 0) return `${d}ng ${h}g`; if (h > 0) return `${h}g ${m}p`; if (m > 0) return `${m}p ${sec}s`;
  return `${sec}s`;
}

/** Takes the owner's existing projection. No second settlement, timer or save. */
export function adaptFarmMobile(
  game: GameState,
  farm: FarmSaveState,
  view: FarmPresentationState,
  rank: RankStep,
  weather: CanonicalWeatherSlot,
  now: number
): FarmMobileSnapshot {
  const deadline = getStarvationDeadlineAt(view.penStarvationStartedAt);
  const moistureLossScale = getSoilMoistureLossMultiplier(farm);
  const whGoldMult = getWarehouseGoldMultiplier(farm);
  const whXpMult = getWarehouseXpMultiplier(farm);
  const format = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });

  let dryPlots = 0;
  let pestPlots = 0;
  let replantPlots = 0;
  let readyPlots = 0;
  let unfertilizedGrowing = 0;

  const plots: MobilePlot[] = farm.plots.map((plot, index) => {
    const cropId = plot.status === 'growing' || plot.status === 'ready' ? plot.cropId : null;
    const moisture = plot.status === 'locked' ? 0 : plot.soilMoisture;
    const band = getSoilMoistureBand(moisture);
    const progress = getCropGrowthProgress(plot);
    const crop = cropId ? CROP_CATALOG.find((c) => c.id === cropId) : undefined;
    const unlock = plot.status === 'locked' ? FARM_PLOT_UNLOCKS.find((entry) => entry.plotIndex === index) : null;
    const baseGrowingReward =
      plot.status === 'growing' && crop
        ? normalizeCropReward(
            crop.harvestGold,
            crop.harvestXp + roundFarmXp(crop.harvestXp * (plot.fertilizerXpBonusPct ?? 0)),
            plot.economy
          )
        : null;
    const reward =
      plot.status === 'ready'
        ? getCropHarvestPreview(farm, index, plot)
        : baseGrowingReward
          ? {
              gold: whGoldMult === 1 ? baseGrowingReward.gold : Math.round(baseGrowingReward.gold * whGoldMult),
              xp: whXpMult === 1 ? baseGrowingReward.xp : roundFarmXp(baseGrowingReward.xp * whXpMult),
            }
          : null;
    const gold = reward && ('goldEarned' in reward ? reward.goldEarned : reward.gold);
    const xp = reward && ('xpEarned' in reward ? reward.xpEarned : reward.xp);
    const pestActive = plot.status === 'growing' || plot.status === 'ready' ? !!getPestPresentation(plot, now) : false;
    const pestPressure = plot.status === 'growing' || plot.status === 'ready' ? plot.pestPressure : 0;
    const pestLevel: MobilePlot['pestLevel'] =
      plot.status !== 'growing' && plot.status !== 'ready'
        ? 'none'
        : plot.pestDamageLevel === 'severe'
          ? 'severe'
          : plot.pestDamageLevel === 'damaged'
            ? 'damaged'
            : pestActive
              ? 'outbreak'
              : 'none';
    const lastCropId = plot.status !== 'locked' ? plot.lastCropId ?? null : null;
    const lastFertilizerId = plot.status !== 'locked' ? plot.lastFertilizerId ?? null : null;
    const canReplant =
      plot.status === 'empty' &&
      Boolean(lastCropId) &&
      moisture >= 20 &&
      (farm.inventory.seeds[lastCropId!] || 0) > 0;
    const fertilized = hasCropFertilizer(plot);

    if (plot.status !== 'locked' && moisture < 95) dryPlots += 1;
    if (pestActive) pestPlots += 1;
    if (canReplant) replantPlots += 1;
    if (plot.status === 'ready') readyPlots += 1;
    if (plot.status === 'growing' && !fertilized) unfertilizedGrowing += 1;

    const detail =
      plot.status === 'locked'
        ? `Mở tại ${getRankNameForDisplay(unlock?.requiredRank ?? null)} · ${unlock?.gold ?? 0} vàng`
        : `Độ ẩm ${Math.floor(moisture)}% · ${
            plot.status === 'growing' || plot.status === 'ready'
              ? FERTILIZER_CATALOG.find((f) => f.id === plot.fertilizerId)?.name ?? 'Chưa bón phân'
              : lastCropId
                ? `Hạt trước: ${CROP_CATALOG.find((c) => c.id === lastCropId)?.name ?? lastCropId}`
                : 'Ô trống'
          }${plot.status === 'growing' || plot.status === 'ready' ? ` · Sâu ${Math.floor(plot.pestPressure)}%` : ''}`;

    return {
      index,
      status: plot.status,
      cropId,
      plantedAt: plot.status === 'growing' || plot.status === 'ready' ? plot.plantedAt : undefined,
      stage: getCropVisualStage(getCropGrowthProgress(plot)),
      detail,
      growth: progress,
      rewardGold: gold,
      rewardXp: xp,
      rewardLabel: reward
        ? `${plot.status === 'ready' ? 'Thưởng dự kiến' : 'Thưởng cơ bản'}: ${format(gold!)} vàng · ${format(xp!)} EXP`
        : undefined,
      artStage:
        plot.status === 'ready'
          ? 'ready'
          : progress >= 0.9
            ? 'mature'
            : progress >= 0.6
              ? 'growing'
              : progress >= 0.3
                ? 'young'
                : progress >= 0.06
                  ? 'sprout'
                  : 'seeded',
      title: cropId ? CROP_CATALOG.find((c) => c.id === cropId)!.name : `Ô đất ${index + 1}`,
      timer:
        plot.status === 'ready'
          ? 'Thu hoạch'
          : plot.status === 'growing'
            ? plotCountdown(getCurrentCropRemainingDurationMs(plot, now, farm.weatherSeed, moistureLossScale))
            : '',
      moisture,
      moistureLabel: getSoilMoisturePresentation(moisture).label,
      thirsty: plot.status !== 'locked' && (band === 'thirsty' || band === 'barren' || band === 'drying'),
      fertilizer: fertilized,
      pest: pestActive,
      pestPressure,
      pestLevel,
      quality: plot.status === 'ready' ? plot.rolledQuality : undefined,
      lastCropId,
      lastFertilizerId,
      canReplant,
    };
  });

  const almanacCount =
    Object.keys(farm.almanac?.crops ?? {}).length +
    Object.keys(farm.almanac?.animals ?? {}).length;

  return {
    worker: farm.worker,
    now,
    gold: farm.gold.toLocaleString('vi-VN'),
    xp: getFarmPlayerXpPercentage(game),
    weatherLabel: `${getWeatherPresentation(weather.weather, weather.season).name} · ${weather.phase === 'night' ? 'Đêm' : 'Ngày'}`,
    weatherDescription: `${SEASON_METADATA[weather.season].name}. ${getWeatherMoistureDescription(weather.season, weather.phase, weather.weather)}\n${getWeatherPresentation(weather.weather, weather.season).fullDesc}\nĐộ ẩm: ${getSoilMoistureRatePerHour(weather.season, weather.phase, weather.weather)}/giờ\nSlot còn: ${mobileCountdown(weather.remainingMs)}. Chu kỳ UTC+7.`,
    weather: weather.weather,
    season: weather.season,
    seasonLabel: SEASON_METADATA[weather.season].name,
    phase: weather.phase,
    plots,
    animals: view.penAnimals.map((animal) => {
      const definition = ANIMAL_CATALOG.find((a) => a.id === animal.animalTypeId)!;
      const dead = isAnimalDead(animal);
      return {
        id: animal.instanceId,
        species: animal.animalTypeId,
        title: definition.name,
        dead,
        storedEggs: farm.inventory.eggs[definition.eggTypeId] || 0,
        weak: !dead && view.penFeedBuffValue <= 0 && deadline !== null,
        scale: getAnimalVisualScale(animal, definition, now),
        lifeRatio: getAnimalLifeRemainingRatio(animal, now),
        lifeRemaining: dead ? 'Đã chết' : mobileCountdown(animal.lifeEndsAt - now),
        timer: dead ? 'Đã chết' : plotCountdown(animal.nextEggAt - now),
      };
    }),
    feed: view.penFeedBuffValue,
    feedLabel: formatFeedPercentage(view.penFeedBuffValue),
    feedRemaining: view.penAnimals.some((animal) => !isAnimalDead(animal))
      ? mobileCountdown(view.penFeedEmptyAt == null ? null : view.penFeedEmptyAt - now)
      : 'Chưa có vật nuôi',
    feedBonus: view.activeFeedSpeedBonus,
    dangerRemaining: deadline === null ? null : mobileCountdown(deadline - now),
    dangerRatio: getPenDangerRatio(view.penStarvationStartedAt, deadline, now),
    capacity: getAnimalCapacity(rank),
    // Eggs are already stored; never infer a new collect action from nextEggAt.
    eggs: Object.values(farm.inventory.eggs).reduce((sum, count) => sum + (count || 0), 0),
    upgrades: getFarmUpgrades(farm),
    logisticsReadyCount: getReadyLogisticsClaimCount(farm, now),
    affordableUpgradesCount: getAffordableUpgradeCount(farm, rank.rankIndex),
    almanacCount,
    batchCounts: {
      dryPlots,
      pestPlots,
      replantPlots,
      readyPlots,
      unfertilizedGrowing,
    },
  };
}

import { gameConfig } from './config';
import type { DelegationReportData, GameState } from './types';
import { getCurrentRank, getRequiredXpForTransition, isXpBarFull } from './xpProgression';
import { MEDAL_CATALOG } from './medals/medalCatalog';

export function captureDelegationStart(state: GameState) {
  return { at: state.time.lastSettledAt, xp: state.progression.xpIntoCurrentRankTicks,
    total: state.progression.totalXpEarnedTicks, full: isXpBarFull(state), medals: [...(state.medals?.unlockedMedalIds ?? [])] };
}

/** Read the final snapshot once, including every bounded catch-up slice. */
export function createDelegationReport(state: GameState, before: ReturnType<typeof captureDelegationStart>): DelegationReportData | undefined {
  const elapsedMs = Math.max(0, state.time.lastSettledAt - before.at), farm = state.farm;
  const isFullNow = isXpBarFull(state), wasFullBefore = before.full;
  const readyCropCount = farm?.plots.filter(p => p.status === 'ready').length ?? 0;
  const pendingWateringCount = farm?.plots.filter(p => p.status !== 'locked' && p.soilMoisture < 20).length ?? 0;
  const growingCropCount = farm?.plots.filter(p => p.status === 'growing').length ?? 0;
  const eggInventoryTotal = Object.values(farm?.inventory.eggs ?? {}).reduce((sum, n) => sum + (n || 0), 0);
  const feedEmpty = !!farm?.penAnimals.some(a => a.deathAt === null) && (farm?.penFeedBuffValue ?? 0) <= 0;
  const newlyUnlockedMedals = (state.medals?.unlockedMedalIds ?? []).filter(id => !before.medals.includes(id)).map(id => {
    const definition = MEDAL_CATALOG.find(m => m.id === id);
    return { id, name: definition?.name ?? id, description: definition?.conditionHint ?? '', iconSymbol: definition?.iconSymbol ?? '🎖️' };
  });
  const earnedTicks = state.progression.totalXpEarnedTicks - before.total;
  const notable = isFullNow || wasFullBefore || readyCropCount > 0 || pendingWateringCount > 0 || eggInventoryTotal > 0 || newlyUnlockedMedals.length > 0;
  const meaningful = notable || earnedTicks > 0 || growingCropCount > 0 || feedEmpty;
  const id = `report_${before.at}_${state.time.lastSettledAt}`;
  if (elapsedMs < 600_000 || (elapsedMs < 3_600_000 ? !notable : !meaningful) || state.ui.lastSeenDelegationReportAt === id) return;
  return { id, elapsedMs, earnedXp: Math.floor(earnedTicks / gameConfig.xpTicksPerXp), previousXp: Math.floor(before.xp / gameConfig.xpTicksPerXp),
    newXp: Math.floor(state.progression.xpIntoCurrentRankTicks / gameConfig.xpTicksPerXp), requiredXp: getRequiredXpForTransition(state.progression.currentRankIndex),
    isFullNow, wasFullBefore, currentRankName: getCurrentRank(state.progression.currentRankIndex).displayName,
    readyCropCount, pendingWateringCount, growingCropCount, eggInventoryTotal, feedEmpty, newlyUnlockedMedals,
    topPriority: isFullNow || wasFullBefore ? 'xp_full' : pendingWateringCount ? 'watering' : readyCropCount ? 'harvest' : eggInventoryTotal ? 'animal_egg' : newlyUnlockedMedals.length ? 'medals' : 'continue' };
}

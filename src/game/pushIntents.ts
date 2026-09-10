import type { GameState } from './types';
import { getRequiredXpTicksForTransition, isXpBarFull } from './xpEngine';
import { gameConfig } from './config';
import { RANK_STEPS } from './rankBuilder';
import { getCurrentCropRemainingDurationMs, projectPenState } from '../features/tang_gia/farmEngine';

export const defaultNotificationPreferences = { xpReady: true, cropReady: true, feedEmpty: true };
export interface PushIntent {
  key: string;
  type: 'xp_ready' | 'crop_ready' | 'feed_empty';
  eventGeneration: string;
  dueAtEpochMs: number;
}
export function calculateXpFullNotificationDueAt(state: GameState, now = Date.now()): number | null {
  const rank = state.progression.currentRankIndex;
  if (state.ui.pendingPromotionCeremony || isXpBarFull(state) || rank >= RANK_STEPS.length - 1 || gameConfig.delegationXpTicksPerMs <= 0) return null;
  const remaining = getRequiredXpTicksForTransition(rank) - state.progression.xpIntoCurrentRankTicks;
  // The save's XP is materialized at lastSettledAt. Offline always earns at the
  // canonical delegation rate, independent of the previous foreground mode.
  const due = state.time.lastSettledAt + Math.ceil(remaining / gameConfig.delegationXpTicksPerMs);
  return Number.isFinite(due) ? Math.max(now, due) : null;
}
export function derivePushIntents(state: GameState, now = Date.now()): PushIntent[] {
  if (!state.settings.notificationsEnabled) return [];
  const prefs = { ...defaultNotificationPreferences, ...state.settings.notificationPreferences };
  const intents: PushIntent[] = [];
  const rank = state.progression.currentRankIndex;
  const xpDue = prefs.xpReady ? calculateXpFullNotificationDueAt(state, now) : null;
  if (xpDue !== null) intents.push({ key: `xp-ready:${rank}`, type: 'xp_ready', eventGeneration: `rank:${rank}`, dueAtEpochMs: xpDue });
  const farm = state.farm;
  if (farm) {
    if (prefs.cropReady) farm.plots.forEach((plot, index) => {
      if (plot.status !== 'growing') return;
      const remaining = getCurrentCropRemainingDurationMs(plot, now, farm.weatherSeed);
      if (remaining !== null && Number.isFinite(remaining) && remaining > 0) intents.push({
        key: `crop-ready:${index}`, type: 'crop_ready',
        eventGeneration: `plot:${index}:${plot.cropId}:${plot.plantedAt}`, dueAtEpochMs: Math.ceil(now + remaining),
      });
    });
    if (prefs.feedEmpty) {
      const pen = projectPenState(farm, now);
      if (pen.penFeedBuffValue > 0 && pen.penAnimals.some(a => a.deathAt === null) && pen.penFeedEmptyAt !== null && Number.isFinite(pen.penFeedEmptyAt) && pen.penFeedEmptyAt > now) intents.push({
        key: 'feed-empty', type: 'feed_empty', eventGeneration: `feed:${farm.pushFeedCycle ?? 'legacy'}`,
        dueAtEpochMs: Math.ceil(pen.penFeedEmptyAt),
      });
    }
  }
  return intents.slice(0, 16).sort((a, b) => a.key.localeCompare(b.key));
}
export function samePushIntents(a: PushIntent[] | null, b: PushIntent[]): boolean {
  return !!a && a.length === b.length && a.every((i, n) => i.key === b[n].key && i.eventGeneration === b[n].eventGeneration && Math.abs(i.dueAtEpochMs - b[n].dueAtEpochMs) < 30000);
}

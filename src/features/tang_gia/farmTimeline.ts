import type { GameState } from '../../game/types';
import { settleFarmState, getProjectedCropCompletionAt } from './farmEngine';
import { FARM_DAY_MS } from './farmWorkerConfig';
import { accrueFarmWages, finishFarmWorkerAction, planFarmWorker, settleFarmPayroll, type FarmWorkerContext } from './farmWorkerEngine';
import { getCanonicalWeatherSlot, getSoilMoistureRatePerHour } from './weatherEngine';
import { getPestRatePerHour } from './pestEngine';
import { getNormalTroughDurationMs, getStarvationDeadlineAt } from './animalLifecycle';

function nextFarmWake(state: GameState, now: number, end: number, context: FarmWorkerContext): number {
  const farm = state.farm!, w = farm.worker!, slot = getCanonicalWeatherSlot(now, farm.weatherSeed);
  let next = Math.min(end, slot.endMs);
  const consider = (at: number | null | undefined) => { if (at != null && Number.isFinite(at) && at > now + 0.01) next = Math.min(next, Math.ceil(at)); };
  consider(w.nextPayrollAt); consider(w.budgetWindowAt + FARM_DAY_MS);
  consider(context.nextXpFullAt?.());
  const midnight = new Date(now); midnight.setHours(24, 0, 0, 0); consider(midnight.getTime());
  if (w.action) {
    consider(w.action.arrivedAt); consider(w.action.endsAt);
    return Math.max(now + 1, next);
  }
  const moistureRate = getSoilMoistureRatePerHour(slot.season, slot.phase, slot.weather);
  const pestRate = getPestRatePerHour(slot.season, slot.weather);
  for (const p of farm.plots) {
    if (p.status === 'locked') continue;
    if (w.assignment.tasks.includes('water') && moistureRate < 0 && p.soilMoisture > 60) consider(now + (p.soilMoisture - 60) / -moistureRate * 3_600_000);
    if (w.assignment.tasks.includes('plant') && p.status === 'empty' && moistureRate > 0 && p.soilMoisture < 20) consider(now + (20 - p.soilMoisture) / moistureRate * 3_600_000);
    if (p.status === 'growing') consider(getProjectedCropCompletionAt(p, now, farm.weatherSeed));
    if ((p.status === 'growing' || p.status === 'ready') && w.assignment.tasks.includes('pest') && p.pestPressure < 70) consider(now + (70 - p.pestPressure) / pestRate * 3_600_000);
  }
  const living = farm.penAnimals.filter(a => a.deathAt === null);
  for (const a of living) { consider(a.lifeEndsAt); consider(a.nextEggAt); }
  consider(getStarvationDeadlineAt(farm.penStarvationStartedAt ?? null));
  if (w.assignment.tasks.includes('feed') && living.length && farm.penFeedBuffValue > w.assignment.feedThreshold) consider(now + (farm.penFeedBuffValue - w.assignment.feedThreshold) / 100 * getNormalTroughDurationMs(living.length));
  return Math.max(now + 1, next);
}

/** A bounded event slice, never a time horizon. Unprocessed time remains in the
 * persisted cursor and the caller yields before resuming another slice. */
export function advanceFarmTimeline(state: GameState, requestedAt: number, context: FarmWorkerContext, advanceEarning: (at: number) => void): number {
  const end = Math.max(state.time.lastSettledAt, requestedAt), farm = state.farm;
  if (!farm?.worker || farm.worker.status !== 'employed') {
    advanceEarning(end); if (farm) settleFarmState(farm, end); return end;
  }
  const w = farm.worker;
  let cursor = Math.max(state.time.lastSettledAt, farm.lastSettledAt, w.lastSettledAt);
  // Existing pre-hire farm clocks are settled under the ordinary rules once.
  if (farm.lastSettledAt < cursor) settleFarmState(farm, cursor);
  const sliceStartedAt = Date.now();
  for (let events = 0; events < 160 && cursor < end; events++) {
    if (events > 0 && Date.now() - sliceStartedAt >= 12) break;
    if (w.status !== 'employed') { advanceEarning(end); settleFarmState(farm, end); cursor = end; break; }
    settleFarmPayroll(farm, cursor);
    if (w.status !== 'employed') continue;
    finishFarmWorkerAction(state, context, cursor);
    planFarmWorker(farm, context, cursor);
    const next = Math.min(end, nextFarmWake(state, cursor, end, context));
    // Salary is evaluated on the wallet at this exact boundary, before an action
    // can earn or spend. The preceding biological interval was still managed.
    accrueFarmWages(w, next); settleFarmPayroll(farm, next);
    advanceEarning(next);
    settleFarmState(farm, next, { managed: true });
    cursor = next; w.lastSettledAt = cursor;
    if (w.status === 'employed') { finishFarmWorkerAction(state, context, cursor); planFarmWorker(farm, context, cursor); }
  }
  return cursor;
}

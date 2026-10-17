import type { GameState, RankStep } from '../../game/types';
import { ANIMAL_CATALOG, CROP_CATALOG, FEED_CATALOG, FERTILIZER_CATALOG } from './farmCatalog';
import { buyFarmSupply, addAnimalToPen, applyFertilizerToGrowingCrop, dismissAnimal, feedPenBuff, getAnimalCapacity, getItemOriginalPrice, harvestPlot, hasCropFertilizer, plantSeedWithFertilizer, rankAtLeast, sellEggs, treatPestOnSelectedPlot, waterSelectedPlot } from './farmEngine';
import { canTreatPest, getPestRatePerHour, PEST_DAMAGE_DELAY_MS } from './pestEngine';
import { getCanonicalWeatherSlot, getSoilMoistureRatePerHour } from './weatherEngine';
import { getNormalTroughDurationMs, getStarvationDeadlineAt } from './animalLifecycle';
import { FARM_ANCHORS, createFarmStroll, farmPathDuration, findFarmPath, plotWorkAnchor, workerPositionAt } from './farmWorldLayout';
import { createFarmWorker, FARM_DAY_MS, FARM_TASKS, FARM_WAGE } from './farmWorkerConfig';
import { normalizeAssignment } from './farmWorkerMigration';
import type { FarmAssignment, FarmPoint, FarmTask, FarmWorkerAction, FarmWorkerState, SupplyCategory } from './farmWorkerTypes';
import type { FarmSaveState, ItemQuality } from './farmTypes';
import { recordCropHarvestForMedals, recordEggSale, recordFarmGoldEarned, recordFeedBagsUsed, recordFertilizerUsed, recordPerfectFarmItemSale, recordWatering } from '../../game/medals/medalEngine';

export type FarmWorkerContext = { rank: RankStep; xpFull(): boolean; nextXpFullAt?(): number | null; rewardXp(xp: number): number };
type Job = Pick<FarmWorkerAction, 'task' | 'target' | 'plotId' | 'cropId' | 'fertilizerId' | 'animalId' | 'eggId' | 'quality' | 'supply' | 'targetVersion'> & { anchor: FarmPoint; deadline: number; priority: number };
const jobKey = (j: Pick<Job, 'task' | 'target'>) => `${j.task}:${j.target}`;
const jobIdentity = (j: Job | FarmWorkerAction) => JSON.stringify([j.task, j.target, j.cropId, j.fertilizerId, j.animalId, j.eggId, j.quality, j.supply, j.targetVersion]);
export const farmWorkerDailyWage = (assignment: FarmAssignment) => assignment.tasks.length * FARM_WAGE;
export function appendWorkerLog(worker: FarmWorkerState, entry: FarmWorkerState['log'][number]) { worker.log.push(entry); worker.log = worker.log.slice(-48); }
export function accrueFarmWages(worker: FarmWorkerState, at: number) {
  if (worker.status !== 'employed') return;
  const elapsed = Math.max(0, Math.floor(at) - worker.wageUpdatedAt);
  worker.wageUnits += elapsed * farmWorkerDailyWage(worker.assignment);
  worker.wageUpdatedAt = Math.max(worker.wageUpdatedAt, Math.floor(at));
}
export function settleFarmPayroll(farm: FarmSaveState, at: number) {
  const w = farm.worker;
  if (!w || w.status !== 'employed') return;
  accrueFarmWages(w, at);
  if (at < w.nextPayrollAt) return;
  const due = Math.floor(w.wageUnits / FARM_DAY_MS);
  if (farm.gold < due) {
    w.position = workerPositionAt(w, at); w.action = null; w.stroll = undefined; w.status = 'departed'; w.departedAt = at; w.unpaidGold = due;
    appendWorkerLog(w, { at, kind: 'departed', gold: 0, message: `Đã nghỉ vì thiếu lương ${due} vàng.` });
  } else {
    farm.gold -= due; w.wageUnits -= due * FARM_DAY_MS; w.nextPayrollAt += FARM_DAY_MS; w.totals.wages += due;
    appendWorkerLog(w, { at, kind: 'payroll', gold: -due, message: `Đã trả lương ${due} vàng.` });
  }
  w.revision++;
}
/** Caller settles the common game timeline before hiring or changing assignments. */
export function confirmFarmAssignment(farm: FarmSaveState, rank: RankStep, assignment: FarmAssignment, at: number) {
  if (!rankAtLeast(rank, { familyId: 'junior_1', tier: 1 })) return { success: false, message: 'Thuê Người mở tại Thiếu Úy bậc 1.' };
  const w = farm.worker ??= createFarmWorker(at);
  if (w.status !== 'employed') {
    w.status = 'employed'; w.employmentId = `${Math.floor(at)}:${w.sequence + 1}`; w.hiredAt = at;
    w.nextPayrollAt = at + FARM_DAY_MS; w.wageUpdatedAt = at; w.wageUnits = 0;
    w.lastSettledAt = at; w.action = null; w.stroll = undefined; w.position = FARM_ANCHORS.rest; w.departedAt = null; w.unpaidGold = 0;
    appendWorkerLog(w, { at, kind: 'hired', gold: 0, message: 'Đã tuyển nông dân. Lương đầu tiên đến hạn sau 24 giờ.' });
  } else accrueFarmWages(w, at);
  w.assignment = normalizeAssignment(assignment); w.revision++;
  appendWorkerLog(w, { at, kind: 'assignment', gold: 0, message: `Đã giao ${w.assignment.tasks.length} việc · ${farmWorkerDailyWage(w.assignment)} vàng/24h.` });
  return { success: true, message: 'Đã xác nhận giao việc.' };
}

function supplyDefinition(category: SupplyCategory, id: string) {
  return (category === 'seeds' ? CROP_CATALOG : category === 'fertilizer' ? FERTILIZER_CATALOG : category === 'feed' ? FEED_CATALOG : ANIMAL_CATALOG).find(item => item.id === id);
}
export function getFarmWorkerJobs(farm: FarmSaveState, context: FarmWorkerContext, now: number): Job[] {
  const w = farm.worker!, a = w.assignment, jobs: Job[] = [], blocked = new Set<string>();
  const has = (task: FarmTask) => a.tasks.includes(task);
  const weather = getCanonicalWeatherSlot(now, farm.weatherSeed ?? 133742);
  const moistureRate = getSoilMoistureRatePerHour(weather.season, weather.phase, weather.weather);
  const pestRate = getPestRatePerHour(weather.season, weather.weather);
  const add = (job: Job) => { jobs.push(job); w.waitingSince[jobKey(job)] ??= now; };
  if (now >= w.budgetWindowAt + FARM_DAY_MS) { w.budgetWindowAt += Math.floor((now - w.budgetWindowAt) / FARM_DAY_MS) * FARM_DAY_MS; w.budgetSpent = 0; }
  const need = (category: SupplyCategory, id: string, desired = 1, priority = 4) => {
    const owned = (farm.inventory[category] as Record<string, number>)[id] ?? 0;
    if (owned >= desired) return true;
    const key = `${category}:${id}`, def = supplyDefinition(category, id);
    if (!has('restock') || !a.restock.confirmed || !a.restock.items.includes(key)) { blocked.add('Chờ vật tư — cần quyền và danh mục mua bổ sung đã xác nhận.'); return owned > 0; }
    if (!def || !rankAtLeast(context.rank, def.requiredRank)) { blocked.add('Vật tư chưa đạt quân hàm yêu cầu.'); return owned > 0; }
    const price = getItemOriginalPrice(category, id), budget = Math.min(a.restock.dailyLimit - w.budgetSpent, farm.gold - a.restock.reserve);
    const count = Math.max(0, Math.min(desired - owned, 24, price > 0 ? Math.floor(budget / price) : 24));
    if (!count) { blocked.add('Chờ ngân sách vật tư hoặc số dư được bảo vệ.'); return owned > 0; }
    if (!jobs.some(job => job.task === 'restock' && job.target === key)) add({ task: 'restock', target: key, supply: { category, id, count }, anchor: FARM_ANCHORS.store, deadline: Infinity, priority });
    return owned > 0;
  };
  for (let i = 0; i < farm.plots.length; i++) {
    const p = farm.plots[i];
    if (p.status === 'locked' || a.scope === 'selected' && !a.plotIds.includes(i)) continue;
    const common = { target: `Ô ${i + 1}`, plotId: i, anchor: plotWorkAnchor(i), deadline: Infinity, priority: 5, targetVersion: p.status === 'growing' || p.status === 'ready' ? p.plantedAt : undefined };
    if (has('water') && p.soilMoisture <= 60) add({ ...common, task: 'water', priority: p.soilMoisture < 35 ? 0 : 3, deadline: moistureRate < 0 ? now + Math.max(0, p.soilMoisture - 20) / -moistureRate * 3_600_000 : Infinity });
    if ((p.status === 'growing' || p.status === 'ready') && has('pest') && canTreatPest(p)) add({ ...common, task: 'pest', priority: 1, deadline: p.pestOutbreakAt !== null ? p.pestOutbreakAt + PEST_DAMAGE_DELAY_MS : now + (100 - p.pestPressure) / pestRate * 3_600_000 + PEST_DAMAGE_DELAY_MS });
    if (p.status === 'ready' && has('harvest') && !context.xpFull()) add({ ...common, task: 'harvest', priority: 2 });
    if (p.status === 'empty' && has('plant')) {
      const crop = CROP_CATALOG.find(item => item.id === p.lastCropId);
      if (!crop) blocked.add(`Ô ${i + 1}: Chưa có lịch sử cây trồng.`);
      else if (!rankAtLeast(context.rank, crop.requiredRank)) blocked.add(`Ô ${i + 1}: Chưa đủ quân hàm để trồng cây ghi nhớ.`);
      else if (p.soilMoisture < 20) blocked.add(`Ô ${i + 1}: Đất quá khô${has('water') ? ', đang chờ tưới' : ', chưa giao tưới'}.`);
      else if (need('seeds', crop.id)) add({ ...common, task: 'plant', cropId: crop.id, priority: 4 });
    }
    if (p.status === 'growing' && has('fertilize') && !hasCropFertilizer(p)) {
      const fertilizer = FERTILIZER_CATALOG.find(item => item.id === p.lastFertilizerId);
      if (!fertilizer) blocked.add(`Ô ${i + 1}: ${p.lastFertilizerId === null ? 'Đã chọn không dùng phân' : 'Chưa chọn phân'}.`);
      else if (rankAtLeast(context.rank, fertilizer.requiredRank) && need('fertilizer', fertilizer.id)) add({ ...common, task: 'fertilize', fertilizerId: fertilizer.id, priority: 4 });
    }
  }
  const living = farm.penAnimals.filter(x => x.deathAt === null);
  if (has('feed') && living.length) {
    if (farm.penFeedBuffValue <= a.feedThreshold) w.feedRefilling = true;
    if (farm.penFeedBuffValue >= 99.99) w.feedRefilling = false;
    const feed = FEED_CATALOG.find(x => x.id === a.feedId)!;
    if (w.feedRefilling && rankAtLeast(context.rank, feed.requiredRank) && need('feed', a.feedId, Math.ceil((100 - farm.penFeedBuffValue) / feed.buffAmount), 0)) {
      const emptyAt = now + farm.penFeedBuffValue / 100 * getNormalTroughDurationMs(living.length);
      add({ task: 'feed', target: 'Máng ăn', anchor: FARM_ANCHORS.trough, deadline: getStarvationDeadlineAt(farm.penStarvationStartedAt ?? null) ?? emptyAt + 43_200_000, priority: 0 });
    }
  }
  if (has('clean_dead')) for (const animal of farm.penAnimals) if (animal.deathAt !== null) add({ task: 'clean_dead', target: animal.instanceId, anchor: FARM_ANCHORS.pen, deadline: Infinity, priority: 4 });
  if (has('replace_animals')) for (const def of ANIMAL_CATALOG) {
    const target = a.animalTargets[def.id] ?? 0, existing = living.filter(x => x.animalTypeId === def.id).length;
    if (existing >= target || !rankAtLeast(context.rank, def.requiredRank)) continue;
    if (farm.penAnimals.length >= getAnimalCapacity(context.rank)) { blocked.add('Chuồng đầy — cần dọn vật nuôi chết nếu có.'); continue; }
    if (need('animals', def.id, Math.min(target - existing, getAnimalCapacity(context.rank) - farm.penAnimals.length))) add({ task: 'replace_animals', target: def.id, animalId: def.id, anchor: FARM_ANCHORS.pen, deadline: Infinity, priority: 5 });
  }
  if (has('sell_eggs') && !context.xpFull()) for (const eggId of a.eggs) for (const quality of a.qualities) {
    if ((farm.eggQualityInventory?.[eggId]?.[quality]?.count ?? 0) > 0) add({ task: 'sell_eggs', target: `${eggId}:${quality}`, eggId, quality, anchor: FARM_ANCHORS.market, deadline: Infinity, priority: 2 });
  }
  if (context.xpFull()) {
    if (has('harvest')) blocked.add('Thu hoạch tạm dừng — EXP đã đầy, chờ thăng quân hàm.');
    if (has('sell_eggs')) blocked.add('Bán trứng tạm dừng — EXP đã đầy, chờ thăng quân hàm.');
  }
  w.blocked = [...blocked].slice(0, 12);
  const keys = new Set(jobs.map(jobKey));
  for (const key of Object.keys(w.waitingSince)) if (!keys.has(key)) delete w.waitingSince[key];
  return jobs;
}

export function planFarmWorker(farm: FarmSaveState, context: FarmWorkerContext, at: number) {
  const w = farm.worker!;
  if (w.status !== 'employed' || w.action) return;
  const jobs = getFarmWorkerJobs(farm, context, at);
  if(!jobs.length){w.stroll ??= createFarmStroll(w.position,at);return;}
  w.position=workerPositionAt(w,at);
  const estimate = (j: Job) => (Math.abs(j.anchor.x - w.position.x) + Math.abs(j.anchor.y - w.position.y)) / 1.8 * 1000 + FARM_TASKS.find(t => t.id === j.task)!.duration;
  const score = (j: Job) => {
    const slack = j.deadline - at - estimate(j);
    if (slack <= 60_000) return -1_000_000 + slack;
    return j.priority * 60_000 - Math.min(360_000, (at - w.waitingSince[jobKey(j)]) / 10);
  };
  jobs.sort((a, b) => score(a) - score(b) || estimate(a) - estimate(b) || w.waitingSince[jobKey(a)] - w.waitingSince[jobKey(b)] || jobKey(a).localeCompare(jobKey(b)));
  for (const job of jobs) {
    const path = findFarmPath(w.position, job.anchor);
    if (!path.length) continue;
    const arrivedAt = at + Math.ceil(farmPathDuration(path)), duration = FARM_TASKS.find(t => t.id === job.task)!.duration;
    const { anchor, deadline, priority, ...data } = job;
    w.action = { ...data, id: `${w.employmentId}:${++w.sequence}`, path, departedAt: at, arrivedAt, startedAt: arrivedAt, endsAt: arrivedAt + duration, workAnchor: anchor };
    w.stroll=undefined;
    w.revision++; return;
  }
}
/** One action, one transaction. The renderer never calls this function. */
export function finishFarmWorkerAction(state: GameState, context: FarmWorkerContext, at: number) {
  const farm = state.farm!, w = farm.worker!, action = w.action;
  if (!action || w.status !== 'employed') return;
  if (at < action.arrivedAt) {
    if (!w.assignment.tasks.includes(action.task) || (action.task === 'harvest' || action.task === 'sell_eggs') && context.xpFull()) { w.position = workerPositionAt(w, at); w.action = null; w.revision++; }
    return;
  }
  const valid = getFarmWorkerJobs(farm, context, at).some(job => jobIdentity(job) === jobIdentity(action));
  if (!valid) { w.position = action.workAnchor; w.action = null; w.revision++; return; }
  if (at < action.endsAt) return;
  w.position = action.workAnchor; w.action = null;
  let success = false, gold = 0, xp = 0;
  switch (action.task) {
    case 'water': success = waterSelectedPlot(farm, action.plotId!, at).success; if (success) recordWatering(state); break;
    case 'pest': success = treatPestOnSelectedPlot(farm, action.plotId!, at).success; break;
    case 'plant': success = plantSeedWithFertilizer(farm, action.plotId!, action.cropId!, null, at, context.rank.rankIndex, 'worker').success; break;
    case 'fertilize': success = applyFertilizerToGrowingCrop(farm, action.plotId!, action.fertilizerId!, at, context.rank).success; if (success) recordFertilizerUsed(state, action.fertilizerId!); break;
    case 'harvest': {
      if (context.xpFull()) break;
      const result = harvestPlot(farm, action.plotId!, at);
      if (result) { success = true; gold = result.goldEarned; xp = context.rewardXp(result.xpEarned); recordCropHarvestForMedals(state, result.hasFertilizer); recordPerfectFarmItemSale(state, result.quality === 'hoan_my' ? 1 : 0); }
      break;
    }
    case 'sell_eggs': {
      if (context.xpFull()) break;
      const result = sellEggs(farm, action.eggId!, 1, [action.quality!]);
      success = result.soldCount === 1; gold = result.goldEarned; xp = context.rewardXp(result.xpEarned);
      recordEggSale(state, result.soldCount); recordPerfectFarmItemSale(state, result.soldByQuality.hoan_my); break;
    }
    case 'feed': success = feedPenBuff(farm, w.assignment.feedId, 1, at, context.rank).success; if (success) recordFeedBagsUsed(state, 1); break;
    case 'clean_dead': success = farm.penAnimals.some(x => x.instanceId === action.target && x.deathAt !== null) && dismissAnimal(farm, action.target, at); break;
    case 'replace_animals': success = addAnimalToPen(farm, action.animalId!, at, context.rank).success; break;
    case 'restock': {
      const { category, id, count } = action.supply!, cost = getItemOriginalPrice(category, id) * count;
      const purchase = buyFarmSupply(farm, category, id, count, context.rank, w.assignment.restock.reserve, w.assignment.restock.dailyLimit - w.budgetSpent);
      if (!purchase.success) break;
      w.budgetSpent += cost; w.totals.supplies += cost; success = true;
      appendWorkerLog(w, { at, kind: 'supplies', gold: -cost, message: `Mua ${count} ${supplyDefinition(category, id)?.name ?? id}: ${cost} vàng.` }); break;
    }
  }
  if (success) {
    w.lastCompletion = { id: action.id, task: action.task, at, anchor: action.workAnchor, plotId: action.plotId };
    w.totals.actions++; w.totals.gold += gold; w.totals.xp += xp;
    if (gold > 0) {
      recordFarmGoldEarned(state, gold);
      appendWorkerLog(w, { at, kind: 'income', gold, message: `${action.task === 'harvest' ? 'Thu hoạch' : 'Bán trứng'}: +${gold} vàng · +${xp.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} EXP thực nhận.` });
    }
    delete w.waitingSince[jobKey(action)];
  }
  w.revision++;
}

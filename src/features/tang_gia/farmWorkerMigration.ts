import { ANIMAL_CATALOG, CROP_CATALOG, EGG_INFO_MAP, FEED_CATALOG, FERTILIZER_CATALOG } from './farmCatalog';
import { createFarmWorker, FARM_TASKS, FARM_DAY_MS } from './farmWorkerConfig';
import type { FarmAssignment, FarmWorkerState } from './farmWorkerTypes';
const finite = (v: unknown, fallback = 0) => typeof v === 'number' && Number.isFinite(v) ? v : fallback;
const count = (v: unknown) => Math.max(0, Math.floor(finite(v)));
const unique = <T,>(values: unknown, allowed: readonly T[]): T[] => Array.isArray(values) ? [...new Set(values.filter(v => allowed.includes(v)))] : [];
export function normalizeAssignment(raw: any): FarmAssignment {
  const source = raw ?? {}, supplies = [ ...CROP_CATALOG.map(x => `seeds:${x.id}`), ...FERTILIZER_CATALOG.map(x => `fertilizer:${x.id}`), ...FEED_CATALOG.map(x => `feed:${x.id}`), ...ANIMAL_CATALOG.map(x => `animals:${x.id}`) ];
  return { tasks: unique(source.tasks, FARM_TASKS.map(x => x.id)), scope: source.scope === 'selected' ? 'selected' : 'all',
    plotIds: unique(source.plotIds, Array.from({ length: 24 }, (_, i) => i)),
    feedId: FEED_CATALOG.some(x => x.id === source.feedId) ? source.feedId : 'feed_normal', feedThreshold: Math.min(80, Math.max(1, finite(source.feedThreshold, 20))),
    animalTargets: Object.fromEntries(ANIMAL_CATALOG.map(x => [x.id, Math.min(50, count(source.animalTargets?.[x.id]))])),
    eggs: unique(source.eggs, Object.keys(EGG_INFO_MAP)) as FarmAssignment['eggs'], qualities: unique(source.qualities, ['thuong', 'tot', 'hiem', 'hoan_my'] as const),
    restock: { confirmed: source.restock?.confirmed === true, items: unique(source.restock?.items, supplies), dailyLimit: Math.min(1_000_000, count(source.restock?.dailyLimit)), reserve: count(source.restock?.reserve) } };
}
export function normalizeFarmWorker(raw: any, cursor: number): FarmWorkerState {
  const worker = createFarmWorker(cursor);
  if (!raw || typeof raw !== 'object') return worker;
  worker.assignment = normalizeAssignment(raw.assignment);
  worker.status = raw.status === 'employed' || raw.status === 'departed' ? raw.status : 'unhired';
  worker.employmentId = typeof raw.employmentId === 'string' ? raw.employmentId.slice(0, 100) : '';
  worker.hiredAt = Math.min(cursor, Math.max(0, finite(raw.hiredAt, cursor)));
  worker.nextPayrollAt = Math.max(worker.hiredAt + FARM_DAY_MS, finite(raw.nextPayrollAt, worker.hiredAt + FARM_DAY_MS));
  worker.wageUpdatedAt = Math.min(cursor, Math.max(worker.hiredAt, finite(raw.wageUpdatedAt, cursor)));
  worker.wageUnits = count(raw.wageUnits);
  worker.lastSettledAt = cursor;
  worker.sequence = count(raw.sequence); worker.revision = count(raw.revision);
  worker.budgetWindowAt = Math.min(cursor, finite(raw.budgetWindowAt, cursor)); worker.budgetSpent = count(raw.budgetSpent);
  worker.feedRefilling = raw.feedRefilling === true;
  worker.unpaidGold = count(raw.unpaidGold); worker.departedAt = typeof raw.departedAt === 'number' ? finite(raw.departedAt) : null;
  const point = (p: any) => p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 17 && p.y >= 0 && p.y <= 14;
  if (point(raw.position)) worker.position = { x: raw.position.x, y: raw.position.y };
  if (raw.lastCompletion && typeof raw.lastCompletion.id === "string" && FARM_TASKS.some(t => t.id === raw.lastCompletion.task) && Number.isFinite(raw.lastCompletion.at) && point(raw.lastCompletion.anchor)) worker.lastCompletion = structuredClone(raw.lastCompletion);
  const a = raw.action;
  if (worker.status === 'employed' && a && typeof a.id === 'string' && FARM_TASKS.some(t => t.id === a.task) && Array.isArray(a.path) && a.path.length <= 256 && a.path.every(point) && point(a.workAnchor) && [a.departedAt, a.arrivedAt, a.startedAt, a.endsAt].every(Number.isFinite) && a.departedAt <= a.arrivedAt && a.arrivedAt <= a.startedAt && a.startedAt < a.endsAt && a.endsAt >= cursor) worker.action = structuredClone(a);
  const stroll=raw.stroll;
  if(worker.status==='employed'&&!worker.action&&stroll&&Array.isArray(stroll.path)&&stroll.path.length>=2&&stroll.path.length<=256&&stroll.path.every(point)&&Number.isFinite(stroll.startedAt)&&stroll.path[0].x===stroll.path[stroll.path.length-1].x&&stroll.path[0].y===stroll.path[stroll.path.length-1].y){
    const path=stroll.path as Array<{x:number;y:number}>;
    const duration=path.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-path[i].x,p.y-path[i].y),0)/.8*1000;
    if(duration>0)worker.stroll={path:structuredClone(path),startedAt:Math.min(cursor,stroll.startedAt),duration};
  }
  worker.log = Array.isArray(raw.log) ? raw.log.filter((e: any) => e && Number.isFinite(e.at) && typeof e.message === 'string' && Number.isFinite(e.gold)).slice(-48) : [];
  for (const key of Object.keys(worker.totals) as (keyof typeof worker.totals)[]) worker.totals[key] = Math.max(0, finite(raw.totals?.[key]));
  worker.blocked = Array.isArray(raw.blocked) ? raw.blocked.filter((s: any) => typeof s === 'string').slice(0, 12) : [];
  worker.waitingSince = Object.fromEntries(Object.entries(raw.waitingSince ?? {}).filter(([k, v]) => k.length < 100 && Number.isFinite(v)).slice(0, 128)) as Record<string, number>;
  if (raw.offlineSummary && Number.isFinite(raw.offlineSummary.to)) worker.offlineSummary = { ...raw.offlineSummary };
  return worker;
}

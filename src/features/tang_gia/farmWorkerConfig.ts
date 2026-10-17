import type { FarmAssignment, FarmTask, FarmWorkerState } from './farmWorkerTypes';
export const FARM_DAY_MS = 86_400_000;
export const FARM_WAGE = 50;
export const FARM_WALK_SPEED = 1.8;
export const FARM_TASKS: { id: FarmTask; name: string; duration: number }[] = [
  { id: 'water', name: 'Tưới nước', duration: 2500 },
  { id: 'harvest', name: 'Thu hoạch', duration: 3500 },
  { id: 'fertilize', name: 'Bón phân', duration: 3000 },
  { id: 'pest', name: 'Diệt sâu', duration: 2500 },
  { id: 'plant', name: 'Trồng cây', duration: 3000 },
  { id: 'sell_eggs', name: 'Bán trứng', duration: 2000 },
  { id: 'feed', name: 'Thêm thức ăn', duration: 3000 },
  { id: 'clean_dead', name: 'Dọn vật nuôi chết', duration: 4000 },
  { id: 'replace_animals', name: 'Thả vật nuôi thay thế', duration: 4000 },
  { id: 'restock', name: 'Mua bổ sung vật tư', duration: 3000 },
];
export const emptyFarmAssignment = (): FarmAssignment => ({ tasks: [], scope: 'all', plotIds: [], feedId: 'feed_normal', feedThreshold: 20, animalTargets: {}, eggs: [], qualities: [], restock: { confirmed: false, items: [], dailyLimit: 0, reserve: 0 } });
export function createFarmWorker(now: number): FarmWorkerState {
  return { status: 'unhired', employmentId: '', hiredAt: 0, nextPayrollAt: 0, wageUpdatedAt: now, wageUnits: 0,
    assignment: emptyFarmAssignment(), position: { x: 12, y: 0 }, action: null, sequence: 0, lastSettledAt: now, revision: 0,
    budgetWindowAt: now, budgetSpent: 0, feedRefilling: false, waitingSince: {}, blocked: [], unpaidGold: 0, departedAt: null, log: [],
    totals: { actions: 0, gold: 0, xp: 0, supplies: 0, wages: 0 } };
}

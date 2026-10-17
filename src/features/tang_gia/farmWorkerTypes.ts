import type { AnimalTypeId, CropId, EggTypeId, FeedTypeId, FertilizerTypeId, ItemQuality } from './farmTypes';
export type FarmTask = 'water' | 'harvest' | 'fertilize' | 'pest' | 'plant' | 'sell_eggs' | 'feed' | 'clean_dead' | 'replace_animals' | 'restock';
export type FarmPoint = { x: number; y: number };
export type SupplyCategory = 'seeds' | 'fertilizer' | 'feed' | 'animals';
export type FarmAssignment = {
  tasks: FarmTask[];
  scope: 'all' | 'selected'; plotIds: number[];
  feedId: FeedTypeId; feedThreshold: number;
  animalTargets: Partial<Record<AnimalTypeId, number>>;
  eggs: EggTypeId[]; qualities: ItemQuality[];
  restock: { confirmed: boolean; items: string[]; dailyLimit: number; reserve: number };
};
export type FarmWorkerAction = {
  id: string; task: FarmTask; target: string; plotId?: number; cropId?: CropId;
  fertilizerId?: FertilizerTypeId; animalId?: AnimalTypeId; eggId?: EggTypeId; quality?: ItemQuality;
  supply?: { category: SupplyCategory; id: string; count: number };
  path: FarmPoint[]; departedAt: number; arrivedAt: number; startedAt: number; endsAt: number;
  workAnchor: FarmPoint; targetVersion?: number;
};
export type FarmWorkerLog = { at: number; kind: 'payroll' | 'departed' | 'assignment' | 'hired' | 'supplies' | 'income'; message: string; gold: number };
export type FarmWorkerState = {
  status: 'unhired' | 'employed' | 'departed'; employmentId: string;
  hiredAt: number; nextPayrollAt: number; wageUpdatedAt: number; wageUnits: number;
  assignment: FarmAssignment; position: FarmPoint; action: FarmWorkerAction | null;
  stroll?: { path: FarmPoint[]; startedAt: number; duration: number };
  sequence: number; lastSettledAt: number; revision: number;
  lastCompletion?: { id: string; task: FarmTask; at: number; anchor: FarmPoint; plotId?: number };
  budgetWindowAt: number; budgetSpent: number; feedRefilling: boolean;
  waitingSince: Record<string, number>; blocked: string[];
  unpaidGold: number; departedAt: number | null;
  log: FarmWorkerLog[];
  totals: { actions: number; gold: number; xp: number; supplies: number; wages: number };
  offlineSummary?: { from: number; to: number; actions: number; gold: number; xp: number; supplies: number; wages: number; departedAt: number | null };
};

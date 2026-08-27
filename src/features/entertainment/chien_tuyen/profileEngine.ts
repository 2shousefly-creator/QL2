import {
  CHIEN_TUYEN_PROFILE_VERSION,
  MAX_FORMATION_UNITS,
  MAX_BARRACKS_LEVEL,
  LEGACY_MAX_FORMATION_UNITS,
  LEGACY_MAX_SAME_TROOP_TYPE,
  MAX_SAME_TROOP_TYPE,
  MAX_TOWER_FLOOR,
  PROGRESSION_CONFIG,
  clampBarracksLevel,
  clampTroopLevel,
  getBarracksUpgradeDurationMs,
  getLevelUpgradeCost,
  getMaxBarracksLevel,
  getQuickFinishCost,
  getTrainingCost,
  getTrainingDurationMs,
  getTrainingSlotCount,
  getTroopUpgradeDurationMs,
} from "./config";
import { isTroopType } from "./troopCatalog";
import { getFirstClearGold } from "./towerFloorCatalog";
import {
  FORMATION_SLOTS,
  TROOP_TYPES,
  type ActiveBattleRecovery,
  type BarracksUpgradeJob,
  type ChienTuyenProfileV2,
  type CompletedJobSummary,
  type FormationAssignment,
  type FormationTemplate,
  type FormationValidationResult,
  type ProfileRehydrateResult,
  type ReservedBattleUnit,
  type TrainingJob,
  type TroopType,
  type TroopUpgradeJob,
} from "./types";

export const STARTER_READY_COUNTS: Readonly<Record<TroopType, number>> = {
  infantry: 2,
  artillery: 1,
  armor: 1,
  commando: 0,
  medic: 1,
  anti_tank: 0,
  engineer: 0,
  chemical: 0,
  air_force: 0,
  guard: 1,
  pioneer: 0,
  scout: 0,
  marksman: 0,
  electronic_warfare: 0,
  special_ops: 0,
  divine_medic: 0,
  forensic_medic: 0,
  martial_artist: 0,
};

export type ProfileActionError =
  | "invalid_troop_type"
  | "training_slots_full"
  | "emergency_not_available"
  | "job_not_found"
  | "upgrade_already_active"
  | "barracks_upgrade_active"
  | "max_level"
  | "barracks_level_required"
  | "journey_level_required"
  | "floor_locked"
  | "invalid_formation"
  | "active_battle_exists"
  | "no_active_battle";

export interface ProfileActionResult<T = undefined> {
  ok: boolean;
  profile: ChienTuyenProfileV2;
  costGold: number;
  value?: T;
  error?: ProfileActionError;
}

export interface RehydrateOptions {
  recoverBattle?: boolean;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function finiteInteger(value: unknown, fallback: number, min: number, max: number): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(number)));
}

function finiteTimestamp(value: unknown, fallback: number): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

function createTroopRecord(initialValue: number): Record<TroopType, number> {
  return Object.fromEntries(TROOP_TYPES.map((troopType) => [troopType, initialValue])) as Record<TroopType, number>;
}

export function createDefaultChienTuyenProfile(now = Date.now()): ChienTuyenProfileV2 {
  return {
    version: CHIEN_TUYEN_PROFILE_VERSION,
    barracksLevel: 1,
    troopLevels: createTroopRecord(1),
    readyCounts: { ...STARTER_READY_COUNTS },
    trainingJobs: [],
    troopUpgradeJobs: {},
    barracksUpgradeJob: null,
    highestClearedFloor: 0,
    highestUnlockedFloor: 1,
    claimedFirstClearFloors: [],
    selectedFloor: 1,
    lastFormation: null,
    battleSpeed: 2,
    tutorialCompleted: false,
    towerCompleted: false,
    activeBattleRecovery: null,
    updatedAt: finiteTimestamp(now, 0),
  };
}

function sanitizeFormation(value: unknown): FormationTemplate | null {
  const object = asObject(value);
  if (!object || !Array.isArray(object.assignments)) return null;
  const assignments: FormationAssignment[] = [];
  const seenSlots = new Set<string>();
  const typeCounts = createTroopRecord(0);
  for (const rawAssignment of object.assignments) {
    if (assignments.length >= MAX_FORMATION_UNITS) break;
    const assignment = asObject(rawAssignment);
    const slotId = assignment?.slotId;
    const troopType = assignment?.troopType;
    if (
      typeof slotId !== "string" ||
      !(FORMATION_SLOTS as readonly string[]).includes(slotId) ||
      !isTroopType(troopType) ||
      seenSlots.has(slotId) ||
      typeCounts[troopType] >= MAX_SAME_TROOP_TYPE
    ) continue;
    seenSlots.add(slotId);
    typeCounts[troopType] += 1;
    const instanceId = typeof assignment.instanceId === "string" && assignment.instanceId
      ? assignment.instanceId.slice(0, 100)
      : undefined;
    assignments.push({ slotId: slotId as FormationAssignment["slotId"], troopType, ...(instanceId ? { instanceId } : {}) });
  }
  return assignments.length > 0 ? { assignments } : null;
}

function sanitizeTrainingJobs(value: unknown, barracksLevel: number): TrainingJob[] {
  if (!Array.isArray(value)) return [];
  const seenIds = new Set<string>();
  const jobs: TrainingJob[] = [];
  for (const rawJob of value) {
    const job = asObject(rawJob);
    if (!job || !isTroopType(job.troopType)) continue;
    const id = typeof job.id === "string" ? job.id.slice(0, 100) : "";
    if (!id || seenIds.has(id)) continue;
    const startedAt = finiteTimestamp(job.startedAt, 0);
    const completeAt = Math.max(startedAt, finiteTimestamp(job.completeAt, startedAt));
    seenIds.add(id);
    jobs.push({
      id,
      troopType: job.troopType,
      startedAt,
      completeAt,
      costGold: finiteInteger(job.costGold, getTrainingCost(job.troopType), 0, 1_000_000),
      emergency: Boolean(job.emergency),
    });
    if (jobs.length >= getTrainingSlotCount(barracksLevel)) break;
  }
  return jobs;
}

function sanitizeTroopUpgradeJobs(
  value: unknown,
  troopLevels: Record<TroopType, number>,
  barracksLevel: number
): Partial<Record<TroopType, TroopUpgradeJob>> {
  const source = asObject(value);
  if (!source) return {};
  const jobs: Partial<Record<TroopType, TroopUpgradeJob>> = {};
  for (const troopType of TROOP_TYPES) {
    const rawJob = asObject(source[troopType]);
    if (!rawJob) continue;
    const fromLevel = troopLevels[troopType];
    const targetLevel = finiteInteger(rawJob.targetLevel, fromLevel + 1, 2, barracksLevel);
    if (targetLevel <= fromLevel) continue;
    const startedAt = finiteTimestamp(rawJob.startedAt, 0);
    const completeAt = Math.max(startedAt, finiteTimestamp(rawJob.completeAt, startedAt));
    const id = typeof rawJob.id === "string" && rawJob.id ? rawJob.id.slice(0, 100) : `upgrade-${troopType}-${startedAt}`;
    jobs[troopType] = {
      id,
      troopType,
      fromLevel,
      targetLevel,
      startedAt,
      completeAt,
      costGold: finiteInteger(rawJob.costGold, getLevelUpgradeCost(targetLevel), 0, 1_000_000),
    };
  }
  return jobs;
}

function sanitizeBarracksUpgradeJob(value: unknown, barracksLevel: number): BarracksUpgradeJob | null {
  const job = asObject(value);
  if (!job || barracksLevel >= MAX_BARRACKS_LEVEL) return null;
  const targetLevel = finiteInteger(job.targetLevel, barracksLevel + 1, barracksLevel + 1, MAX_BARRACKS_LEVEL);
  if (targetLevel !== barracksLevel + 1) return null;
  const startedAt = finiteTimestamp(job.startedAt, 0);
  const completeAt = Math.max(startedAt, finiteTimestamp(job.completeAt, startedAt));
  return {
    id: typeof job.id === "string" && job.id ? job.id.slice(0, 100) : `barracks-${startedAt}`,
    fromLevel: barracksLevel,
    targetLevel,
    startedAt,
    completeAt,
    costGold: finiteInteger(job.costGold, getLevelUpgradeCost(targetLevel), 0, 1_000_000),
  };
}

function sanitizeRecovery(value: unknown, troopLevels: Record<TroopType, number>): ActiveBattleRecovery | null {
  const recovery = asObject(value);
  if (!recovery || !Array.isArray(recovery.deployedUnits)) return null;
  const battleId = typeof recovery.battleId === "string" ? recovery.battleId.slice(0, 100) : "";
  if (!battleId) return null;
  const seenInstances = new Set<string>();
  const seenSlots = new Set<string>();
  const legacyTypeCounts = createTroopRecord(0);
  const deployedUnits: ReservedBattleUnit[] = [];
  for (const rawUnit of recovery.deployedUnits.slice(0, LEGACY_MAX_FORMATION_UNITS)) {
    const unit = asObject(rawUnit);
    if (!unit || !isTroopType(unit.troopType)) continue;
    const instanceId = typeof unit.instanceId === "string" ? unit.instanceId.slice(0, 100) : "";
    const slotId = unit.slotId;
    if (
      !instanceId || seenInstances.has(instanceId) || typeof slotId !== "string" ||
      !(FORMATION_SLOTS as readonly string[]).includes(slotId) || seenSlots.has(slotId) ||
      legacyTypeCounts[unit.troopType] >= LEGACY_MAX_SAME_TROOP_TYPE
    ) continue;
    seenInstances.add(instanceId);
    seenSlots.add(slotId);
    legacyTypeCounts[unit.troopType] += 1;
    deployedUnits.push({
      instanceId,
      troopType: unit.troopType,
      level: finiteInteger(unit.level, troopLevels[unit.troopType], 1, MAX_BARRACKS_LEVEL),
      slotId: slotId as ReservedBattleUnit["slotId"],
    });
  }
  if (deployedUnits.length === 0) return null;
  const deployedFormation: FormationTemplate = {
    assignments: deployedUnits.slice(0, MAX_FORMATION_UNITS).map(({ slotId, troopType, instanceId }) => ({ slotId, troopType, instanceId })),
  };
  const casualties = Array.isArray(recovery.casualtyInstanceIds)
    ? [...new Set(recovery.casualtyInstanceIds.filter((id): id is string => typeof id === "string" && seenInstances.has(id)))]
    : [];
  const formation = sanitizeFormation(recovery.formation) ?? deployedFormation;
  return {
    battleId,
    floorNumber: finiteInteger(recovery.floorNumber, 1, 1, MAX_TOWER_FLOOR),
    startedAt: finiteTimestamp(recovery.startedAt, 0),
    formation,
    deployedUnits,
    casualtyInstanceIds: casualties,
    status: recovery.status === "settling" ? "settling" : "active",
  };
}

export function sanitizeChienTuyenProfile(raw: unknown, now = Date.now()): ChienTuyenProfileV2 {
  const source = asObject(raw);
  if (!source || source.version !== CHIEN_TUYEN_PROFILE_VERSION) {
    return createDefaultChienTuyenProfile(now);
  }
  const barracksLevel = clampBarracksLevel(finiteInteger(source.barracksLevel, 1, 1, MAX_BARRACKS_LEVEL));
  const rawLevels = asObject(source.troopLevels);
  const rawCounts = asObject(source.readyCounts);
  const troopLevels = createTroopRecord(1);
  const readyCounts = createTroopRecord(0);
  for (const troopType of TROOP_TYPES) {
    troopLevels[troopType] = clampTroopLevel(finiteInteger(rawLevels?.[troopType], 1, 1, MAX_BARRACKS_LEVEL), barracksLevel);
    readyCounts[troopType] = finiteInteger(rawCounts?.[troopType], 0, 0, 1_000_000);
  }
  const highestClearedFloor = finiteInteger(source.highestClearedFloor, 0, 0, MAX_TOWER_FLOOR);
  const highestUnlockedFloor = Math.min(MAX_TOWER_FLOOR, highestClearedFloor + 1);
  const claimedFirstClearFloors = Array.isArray(source.claimedFirstClearFloors)
    ? [...new Set(source.claimedFirstClearFloors
      .map((floor) => finiteInteger(floor, 0, 0, MAX_TOWER_FLOOR))
      .filter((floor) => floor >= 1 && floor <= highestClearedFloor))].sort((a, b) => a - b)
    : [];
  return {
    version: CHIEN_TUYEN_PROFILE_VERSION,
    barracksLevel,
    troopLevels,
    readyCounts,
    trainingJobs: sanitizeTrainingJobs(source.trainingJobs, barracksLevel),
    troopUpgradeJobs: sanitizeTroopUpgradeJobs(source.troopUpgradeJobs, troopLevels, barracksLevel),
    barracksUpgradeJob: sanitizeBarracksUpgradeJob(source.barracksUpgradeJob, barracksLevel),
    highestClearedFloor,
    highestUnlockedFloor,
    claimedFirstClearFloors,
    selectedFloor: finiteInteger(source.selectedFloor, 1, 1, highestUnlockedFloor),
    lastFormation: sanitizeFormation(source.lastFormation),
    // Retain the legacy profile field for save compatibility. Runtime pacing
    // is now derived automatically from BattleState.round.
    battleSpeed: 2,
    tutorialCompleted: Boolean(source.tutorialCompleted),
    towerCompleted: highestClearedFloor >= MAX_TOWER_FLOOR,
    activeBattleRecovery: sanitizeRecovery(source.activeBattleRecovery, troopLevels),
    updatedAt: finiteTimestamp(source.updatedAt, finiteTimestamp(now, 0)),
  };
}

export function migrateChienTuyenProfile(raw: unknown, now = Date.now()): ChienTuyenProfileV2 {
  return sanitizeChienTuyenProfile(raw, now);
}

export function validateFormation(
  formation: FormationTemplate,
  availableCounts?: Partial<Record<TroopType, number>>,
  allowEmpty = false
): FormationValidationResult {
  const errors: FormationValidationResult["errors"] = [];
  const assignments = Array.isArray(formation?.assignments) ? formation.assignments : [];
  if (assignments.length === 0 && !allowEmpty) errors.push("empty_formation");
  if (assignments.length > MAX_FORMATION_UNITS) errors.push("too_many_troops");
  const slots = new Set<string>();
  const counts = createTroopRecord(0);
  for (const assignment of assignments) {
    if (!(FORMATION_SLOTS as readonly string[]).includes(assignment.slotId)) errors.push("invalid_slot");
    if (!isTroopType(assignment.troopType)) {
      errors.push("invalid_troop_type");
      continue;
    }
    if (slots.has(assignment.slotId)) errors.push("duplicate_slot");
    slots.add(assignment.slotId);
    counts[assignment.troopType] += 1;
  }
  for (const troopType of TROOP_TYPES) {
    if (counts[troopType] > MAX_SAME_TROOP_TYPE) errors.push("too_many_same_type");
    if (availableCounts && counts[troopType] > Math.max(0, availableCounts[troopType] ?? 0)) {
      errors.push("unavailable_troop");
    }
  }
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

export function settleExpiredJobs(profile: ChienTuyenProfileV2, now = Date.now()): ProfileRehydrateResult {
  const safeNow = finiteTimestamp(now, 0);
  const next = sanitizeChienTuyenProfile(profile, safeNow);
  const completed: CompletedJobSummary = {
    trainingJobIds: [],
    troopUpgradeTypes: [],
    barracksUpgradeCompleted: false,
  };
  const activeTraining: TrainingJob[] = [];
  for (const job of next.trainingJobs) {
    if (job.completeAt <= safeNow) {
      next.readyCounts[job.troopType] += 1;
      completed.trainingJobIds.push(job.id);
    } else {
      activeTraining.push(job);
    }
  }
  next.trainingJobs = activeTraining;
  for (const troopType of TROOP_TYPES) {
    const job = next.troopUpgradeJobs[troopType];
    if (!job || job.completeAt > safeNow) continue;
    next.troopLevels[troopType] = clampTroopLevel(
      Math.max(next.troopLevels[troopType], job.targetLevel),
      next.barracksLevel
    );
    delete next.troopUpgradeJobs[troopType];
    completed.troopUpgradeTypes.push(troopType);
  }
  if (next.barracksUpgradeJob && next.barracksUpgradeJob.completeAt <= safeNow) {
    next.barracksLevel = clampBarracksLevel(Math.max(next.barracksLevel, next.barracksUpgradeJob.targetLevel));
    next.barracksUpgradeJob = null;
    completed.barracksUpgradeCompleted = true;
  }
  next.updatedAt = safeNow;
  return { profile: next, completed, recoveredSurvivorCounts: {} };
}

export function recoverInterruptedBattle(profile: ChienTuyenProfileV2, now = Date.now()): ProfileRehydrateResult {
  const safeNow = finiteTimestamp(now, 0);
  const next = sanitizeChienTuyenProfile(profile, safeNow);
  const recoveredSurvivorCounts: Partial<Record<TroopType, number>> = {};
  const recovery = next.activeBattleRecovery;
  if (recovery) {
    const casualties = new Set(recovery.casualtyInstanceIds);
    for (const unit of recovery.deployedUnits) {
      if (casualties.has(unit.instanceId)) continue;
      next.readyCounts[unit.troopType] += 1;
      recoveredSurvivorCounts[unit.troopType] = (recoveredSurvivorCounts[unit.troopType] ?? 0) + 1;
    }
    next.activeBattleRecovery = null;
  }
  next.updatedAt = safeNow;
  return {
    profile: next,
    completed: { trainingJobIds: [], troopUpgradeTypes: [], barracksUpgradeCompleted: false },
    recoveredSurvivorCounts,
  };
}

export function rehydrateChienTuyenProfile(
  profile: ChienTuyenProfileV2,
  now = Date.now(),
  options: RehydrateOptions = {}
): ProfileRehydrateResult {
  const settled = settleExpiredJobs(profile, now);
  if (!options.recoverBattle) return settled;
  const recovered = recoverInterruptedBattle(settled.profile, now);
  return {
    profile: recovered.profile,
    completed: settled.completed,
    recoveredSurvivorCounts: recovered.recoveredSurvivorCounts,
  };
}

function cloneProfile(profile: ChienTuyenProfileV2, now: number): ChienTuyenProfileV2 {
  return sanitizeChienTuyenProfile(profile, now);
}

function makeUniqueId(prefix: string, now: number, discriminator: string, usedIds: Iterable<string>): string {
  const used = new Set(usedIds);
  const base = `${prefix}-${finiteTimestamp(now, 0)}-${discriminator}`;
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function getTotalReadyUnits(profile: Pick<ChienTuyenProfileV2, "readyCounts">): number {
  return TROOP_TYPES.reduce((total, troopType) => total + Math.max(0, profile.readyCounts[troopType] ?? 0), 0);
}

export function getTotalTrainingUnits(profile: Pick<ChienTuyenProfileV2, "trainingJobs">): number {
  return profile.trainingJobs.length;
}

export function getTrainingCountForTroop(
  profile: Pick<ChienTuyenProfileV2, "trainingJobs">,
  troopType: TroopType
): number {
  return profile.trainingJobs.reduce(
    (count, job) => count + (job.troopType === troopType ? 1 : 0),
    0
  );
}

export function canUseEmergencyTraining(profile: ChienTuyenProfileV2, availableGold: number): boolean {
  if (!Number.isFinite(availableGold) || availableGold < 0) return false;
  const totalArmy = getTotalReadyUnits(profile) + getTotalTrainingUnits(profile);
  const cheapestTrainingCost = Math.min(...TROOP_TYPES.map(getTrainingCost));
  return (
    totalArmy < PROGRESSION_CONFIG.training.emergencyMinimumArmy &&
    Math.max(0, Math.floor(Number.isFinite(availableGold) ? availableGold : 0)) < cheapestTrainingCost &&
    profile.trainingJobs.length < getTrainingSlotCount(profile.barracksLevel)
  );
}

export interface EnqueueTrainingOptions {
  jobId?: string;
  emergency?: boolean;
  availableGold?: number;
}

export function enqueueTraining(
  profile: ChienTuyenProfileV2,
  troopType: TroopType,
  now = Date.now(),
  options: EnqueueTrainingOptions = {}
): ProfileActionResult<TrainingJob> {
  const next = cloneProfile(profile, now);
  if (!isTroopType(troopType)) return { ok: false, profile: next, costGold: 0, error: "invalid_troop_type" };
  if (next.trainingJobs.length >= getTrainingSlotCount(next.barracksLevel)) {
    return { ok: false, profile: next, costGold: 0, error: "training_slots_full" };
  }
  const emergency = Boolean(options.emergency);
  if (
    emergency &&
    (troopType !== PROGRESSION_CONFIG.training.emergencyTroopType ||
      options.availableGold === undefined ||
      !canUseEmergencyTraining(next, options.availableGold))
  ) {
    return { ok: false, profile: next, costGold: 0, error: "emergency_not_available" };
  }
  const usedIds = next.trainingJobs.map((job) => job.id);
  const id = options.jobId?.trim().slice(0, 100) || makeUniqueId("training", now, troopType, usedIds);
  if (usedIds.includes(id)) return { ok: false, profile: next, costGold: 0, error: "training_slots_full" };
  const costGold = emergency ? 0 : getTrainingCost(troopType);
  const startedAt = finiteTimestamp(now, 0);
  const durationMs = emergency
    ? PROGRESSION_CONFIG.training.emergencySeconds * 1000
    : getTrainingDurationMs(troopType, next.troopLevels[troopType]);
  const job: TrainingJob = {
    id,
    troopType,
    startedAt,
    completeAt: startedAt + durationMs,
    costGold,
    emergency,
  };
  next.trainingJobs.push(job);
  next.updatedAt = startedAt;
  return { ok: true, profile: next, costGold, value: job };
}

export function quickFinishTraining(
  profile: ChienTuyenProfileV2,
  jobId: string,
  now = Date.now()
): ProfileActionResult<TrainingJob> {
  const next = cloneProfile(profile, now);
  const jobIndex = next.trainingJobs.findIndex((job) => job.id === jobId);
  if (jobIndex < 0) return { ok: false, profile: next, costGold: 0, error: "job_not_found" };
  const job = next.trainingJobs[jobIndex];
  const costGold = job.completeAt <= now ? 0 : getQuickFinishCost(job.completeAt - now);
  next.trainingJobs.splice(jobIndex, 1);
  next.readyCounts[job.troopType] += 1;
  next.updatedAt = finiteTimestamp(now, 0);
  return { ok: true, profile: next, costGold, value: job };
}

export interface StartUpgradeOptions {
  jobId?: string;
}

export function startTroopUpgrade(
  profile: ChienTuyenProfileV2,
  troopType: TroopType,
  now = Date.now(),
  options: StartUpgradeOptions = {}
): ProfileActionResult<TroopUpgradeJob> {
  const next = cloneProfile(profile, now);
  if (!isTroopType(troopType)) return { ok: false, profile: next, costGold: 0, error: "invalid_troop_type" };
  if (next.troopUpgradeJobs[troopType]) {
    return { ok: false, profile: next, costGold: 0, error: "upgrade_already_active" };
  }
  const fromLevel = next.troopLevels[troopType];
  if (fromLevel >= MAX_BARRACKS_LEVEL) return { ok: false, profile: next, costGold: 0, error: "max_level" };
  const targetLevel = fromLevel + 1;
  if (targetLevel > next.barracksLevel) {
    return { ok: false, profile: next, costGold: 0, error: "barracks_level_required" };
  }
  const startedAt = finiteTimestamp(now, 0);
  const usedIds = Object.values(next.troopUpgradeJobs).flatMap((job) => job ? [job.id] : []);
  const id = options.jobId?.trim().slice(0, 100) || makeUniqueId("troop-upgrade", startedAt, troopType, usedIds);
  const costGold = getLevelUpgradeCost(targetLevel);
  const job: TroopUpgradeJob = {
    id,
    troopType,
    fromLevel,
    targetLevel,
    startedAt,
    completeAt: startedAt + getTroopUpgradeDurationMs(troopType, targetLevel),
    costGold,
  };
  next.troopUpgradeJobs[troopType] = job;
  next.updatedAt = startedAt;
  return { ok: true, profile: next, costGold, value: job };
}

export function startBarracksUpgrade(
  profile: ChienTuyenProfileV2,
  journeyLevel: number,
  now = Date.now(),
  options: StartUpgradeOptions = {}
): ProfileActionResult<BarracksUpgradeJob> {
  const next = cloneProfile(profile, now);
  if (next.barracksUpgradeJob) {
    return { ok: false, profile: next, costGold: 0, error: "barracks_upgrade_active" };
  }
  if (next.barracksLevel >= MAX_BARRACKS_LEVEL) return { ok: false, profile: next, costGold: 0, error: "max_level" };
  const targetLevel = next.barracksLevel + 1;
  if (targetLevel > getMaxBarracksLevel(journeyLevel)) {
    return { ok: false, profile: next, costGold: 0, error: "journey_level_required" };
  }
  const startedAt = finiteTimestamp(now, 0);
  const id = options.jobId?.trim().slice(0, 100) || makeUniqueId("barracks-upgrade", startedAt, String(targetLevel), []);
  const costGold = getLevelUpgradeCost(targetLevel);
  const job: BarracksUpgradeJob = {
    id,
    fromLevel: next.barracksLevel,
    targetLevel,
    startedAt,
    completeAt: startedAt + getBarracksUpgradeDurationMs(targetLevel),
    costGold,
  };
  next.barracksUpgradeJob = job;
  next.updatedAt = startedAt;
  return { ok: true, profile: next, costGold, value: job };
}

export function quickFinishBarracksUpgrade(
  profile: ChienTuyenProfileV2,
  now = Date.now(),
): ProfileActionResult<BarracksUpgradeJob> {
  const next = cloneProfile(profile, now);
  const job = next.barracksUpgradeJob;
  if (!job) {
    return { ok: false, profile: next, costGold: 0, error: "job_not_found" };
  }

  const costGold = job.completeAt <= now
    ? 0
    : getQuickFinishCost(job.completeAt - now);
  next.barracksLevel = clampBarracksLevel(
    Math.max(next.barracksLevel, job.targetLevel),
  );
  next.barracksUpgradeJob = null;
  next.updatedAt = finiteTimestamp(now, 0);
  return { ok: true, profile: next, costGold, value: job };
}

export function quickFinishTroopUpgrade(
  profile: ChienTuyenProfileV2,
  troopType: TroopType,
  now = Date.now(),
): ProfileActionResult<TroopUpgradeJob> {
  const next = cloneProfile(profile, now);
  if (!isTroopType(troopType)) {
    return { ok: false, profile: next, costGold: 0, error: "invalid_troop_type" };
  }
  const job = next.troopUpgradeJobs[troopType];
  if (!job) {
    return { ok: false, profile: next, costGold: 0, error: "job_not_found" };
  }

  const costGold = job.completeAt <= now
    ? 0
    : getQuickFinishCost(job.completeAt - now);

  next.troopLevels[troopType] = clampTroopLevel(
    Math.max(next.troopLevels[troopType], job.targetLevel),
    next.barracksLevel,
  );
  next.troopUpgradeJobs[troopType] = null;
  next.updatedAt = finiteTimestamp(now, 0);
  return { ok: true, profile: next, costGold, value: job };
}

const AUTO_DEPLOY_ORDER: readonly TroopType[] = [
  "armor", "pioneer", "engineer", "guard", "martial_artist", "infantry", "anti_tank",
  "artillery", "medic", "commando", "chemical", "air_force",
];

const FRONT_AUTO_SLOTS = ["front_center", "front_left", "front_right"] as const;
const BACK_AUTO_SLOTS = ["back_center", "back_left", "back_right"] as const;

export function createAutoFormation(
  availableCounts: Partial<Record<TroopType, number>>,
  lastFormation: FormationTemplate | null = null
): FormationTemplate {
  if (lastFormation && validateFormation(lastFormation, availableCounts).valid) {
    return { assignments: lastFormation.assignments.map(({ slotId, troopType }) => ({ slotId, troopType })) };
  }
  const remaining = createTroopRecord(0);
  for (const troopType of TROOP_TYPES) remaining[troopType] = Math.max(0, Math.floor(availableCounts[troopType] ?? 0));
  const selected: TroopType[] = [];
  for (let pass = 0; pass < MAX_SAME_TROOP_TYPE && selected.length < MAX_FORMATION_UNITS; pass += 1) {
    for (const troopType of AUTO_DEPLOY_ORDER) {
      if (selected.length >= MAX_FORMATION_UNITS) break;
      if (remaining[troopType] <= pass) continue;
      selected.push(troopType);
    }
  }
  let frontIndex = 0;
  let backIndex = 0;
  const assignments = selected.map((troopType): FormationAssignment => {
    const prefersBack = troopType === "artillery" || troopType === "medic" || troopType === "commando" || troopType === "chemical" || troopType === "air_force";
    if (prefersBack && backIndex < BACK_AUTO_SLOTS.length) {
      return { slotId: BACK_AUTO_SLOTS[backIndex++], troopType };
    }
    if (frontIndex < FRONT_AUTO_SLOTS.length) return { slotId: FRONT_AUTO_SLOTS[frontIndex++], troopType };
    return { slotId: BACK_AUTO_SLOTS[backIndex++], troopType };
  });
  return { assignments };
}

export function resolveDeploymentFormation(
  profile: ChienTuyenProfileV2,
  requested: FormationTemplate | null
): FormationTemplate {
  if (requested && validateFormation(requested, profile.readyCounts).valid) {
    return { assignments: requested.assignments.map(({ slotId, troopType }) => ({ slotId, troopType })) };
  }
  return createAutoFormation(profile.readyCounts, profile.lastFormation);
}

export interface ReserveBattleOptions {
  battleId?: string;
}

export function reserveBattleUnits(
  profile: ChienTuyenProfileV2,
  floorNumber: number,
  formation: FormationTemplate,
  now = Date.now(),
  options: ReserveBattleOptions = {}
): ProfileActionResult<ActiveBattleRecovery> {
  const next = cloneProfile(profile, now);
  if (next.activeBattleRecovery) {
    return { ok: false, profile: next, costGold: 0, error: "active_battle_exists" };
  }
  if (!Number.isInteger(floorNumber) || floorNumber < 1 || floorNumber > next.highestUnlockedFloor) {
    return { ok: false, profile: next, costGold: 0, error: "floor_locked" };
  }
  if (!validateFormation(formation, next.readyCounts).valid) {
    return { ok: false, profile: next, costGold: 0, error: "invalid_formation" };
  }
  const startedAt = finiteTimestamp(now, 0);
  const battleId = options.battleId?.trim().slice(0, 100) || `battle-${startedAt}-floor-${floorNumber}`;
  const seenIds = new Set<string>();
  const deployedUnits: ReservedBattleUnit[] = formation.assignments.map((assignment, index) => {
    next.readyCounts[assignment.troopType] -= 1;
    let instanceId = assignment.instanceId?.trim().slice(0, 100) || `${battleId}-${assignment.slotId}-${assignment.troopType}`;
    if (seenIds.has(instanceId)) instanceId = `${instanceId}-${index + 1}`;
    seenIds.add(instanceId);
    return {
      instanceId,
      troopType: assignment.troopType,
      level: next.troopLevels[assignment.troopType],
      slotId: assignment.slotId,
    };
  });
  const savedFormation: FormationTemplate = {
    assignments: formation.assignments.map(({ slotId, troopType }) => ({ slotId, troopType })),
  };
  const recovery: ActiveBattleRecovery = {
    battleId,
    floorNumber,
    startedAt,
    formation: savedFormation,
    deployedUnits,
    casualtyInstanceIds: [],
    status: "active",
  };
  next.lastFormation = savedFormation;
  next.selectedFloor = floorNumber;
  next.activeBattleRecovery = recovery;
  next.updatedAt = startedAt;
  return { ok: true, profile: next, costGold: 0, value: recovery };
}

export function recordBattleCasualty(
  profile: ChienTuyenProfileV2,
  instanceId: string,
  now = Date.now()
): ProfileActionResult<ActiveBattleRecovery> {
  const next = cloneProfile(profile, now);
  const recovery = next.activeBattleRecovery;
  if (!recovery) return { ok: false, profile: next, costGold: 0, error: "no_active_battle" };
  if (!recovery.deployedUnits.some((unit) => unit.instanceId === instanceId)) {
    return { ok: false, profile: next, costGold: 0, error: "job_not_found" };
  }
  if (!recovery.casualtyInstanceIds.includes(instanceId)) recovery.casualtyInstanceIds.push(instanceId);
  next.updatedAt = finiteTimestamp(now, 0);
  return { ok: true, profile: next, costGold: 0, value: recovery };
}

export type ActiveBattleSettlementOutcome = "victory" | "defeat" | "abandon";

export interface ActiveBattleSettlement {
  outcome: ActiveBattleSettlementOutcome;
  floorNumber: number;
  firstClear: boolean;
  rewardGold: number;
  nextFloorUnlocked: number;
  survivorInstanceIds: string[];
  casualtyInstanceIds: string[];
}

export function settleActiveBattle(
  profile: ChienTuyenProfileV2,
  outcome: ActiveBattleSettlementOutcome,
  now = Date.now()
): ProfileActionResult<ActiveBattleSettlement> {
  const next = cloneProfile(profile, now);
  const recovery = next.activeBattleRecovery;
  if (!recovery) return { ok: false, profile: next, costGold: 0, error: "no_active_battle" };
  const casualties = new Set(recovery.casualtyInstanceIds);
  const survivorInstanceIds: string[] = [];
  for (const unit of recovery.deployedUnits) {
    if (casualties.has(unit.instanceId)) continue;
    next.readyCounts[unit.troopType] += 1;
    survivorInstanceIds.push(unit.instanceId);
  }
  const floorNumber = recovery.floorNumber;
  const firstClear = outcome === "victory" && !next.claimedFirstClearFloors.includes(floorNumber);
  const rewardGold = firstClear ? getFirstClearGold(floorNumber) : 0;
  if (outcome === "victory") {
    next.highestClearedFloor = Math.max(next.highestClearedFloor, floorNumber);
    next.highestUnlockedFloor = Math.max(
      next.highestUnlockedFloor,
      Math.min(MAX_TOWER_FLOOR, floorNumber + 1)
    );
    if (firstClear) next.claimedFirstClearFloors.push(floorNumber);
    next.claimedFirstClearFloors.sort((a, b) => a - b);
    next.towerCompleted = next.highestClearedFloor >= MAX_TOWER_FLOOR;
    next.selectedFloor = Math.min(next.highestUnlockedFloor, floorNumber + 1);
  }
  next.activeBattleRecovery = null;
  next.updatedAt = finiteTimestamp(now, 0);
  const settlement: ActiveBattleSettlement = {
    outcome,
    floorNumber,
    firstClear,
    rewardGold,
    nextFloorUnlocked: next.highestUnlockedFloor,
    survivorInstanceIds,
    casualtyInstanceIds: [...casualties],
  };
  return { ok: true, profile: next, costGold: 0, value: settlement };
}

import type { FormationSlotDefinition, TroopType } from "./types";

export const CHIEN_TUYEN_PROFILE_VERSION = 2 as const;
export const MIN_BARRACKS_LEVEL = 1;
export const MAX_BARRACKS_LEVEL = 54;
export const MAX_TOWER_FLOOR = 100;
export const MAX_FORMATION_UNITS = 4;
export const LEGACY_MAX_FORMATION_UNITS = 5;
export const FORMATION_ROW_BONUS_TOTAL = 0.30;
export const MAX_SAME_TROOP_TYPE = 1;
export const LEGACY_MAX_SAME_TROOP_TYPE = 2;
export const DEPLOYMENT_SECONDS = 60;
export const BASE_ACTION_DELAY = 100;
export const SPEED_FACTOR_BASELINE = 40;
export const SPEED_FACTOR_PER_POINT = 0.01;
export const MIN_SPEED_FACTOR = 0.75;
export const MAX_SPEED_FACTOR = 1.40;
export const TIMELINE_EPSILON = 1e-9;
export const BASE_CRIT_CHANCE = 0.25;
export const CRIT_DAMAGE_MULTIPLIER = 1.90;

export type BattlePresentationSpeed = 3 | 4 | 5 | 6 | 7;

export interface BattleActionPresentationSnapshot {
  readonly battleRound: number;
  readonly speed: BattlePresentationSpeed;
}

function sanitizeBattleRound(round: number): number {
  return Math.max(1, Math.floor(Number.isFinite(round) ? round : 1));
}

export function getBattlePresentationSpeed(round: number): BattlePresentationSpeed {
  const battleRound = sanitizeBattleRound(round);
  if (battleRound >= 20) return 7;
  if (battleRound >= 15) return 6;
  if (battleRound >= 11) return 5;
  if (battleRound >= 5) return 4;
  return 3;
}

export function createBattleActionPresentationSnapshot(
  round: number
): Readonly<BattleActionPresentationSnapshot> {
  const battleRound = sanitizeBattleRound(round);
  return Object.freeze({
    battleRound,
    speed: getBattlePresentationSpeed(battleRound),
  });
}

export function getBattlePresentationDurationMs(
  baseDurationMs: number,
  speed: BattlePresentationSpeed,
  minimumDurationMs = 1
): number {
  const safeBase = Math.max(0, Number.isFinite(baseDurationMs) ? baseDurationMs : 0);
  const safeMinimum = Math.max(1, Math.round(Number.isFinite(minimumDurationMs) ? minimumDurationMs : 1));
  return Math.max(safeMinimum, Math.round(safeBase / speed));
}

export const FORMATION_SLOT_DEFINITIONS: readonly FormationSlotDefinition[] = [
  { id: "back_left", row: "back", column: "left", label: "S1" },
  { id: "back_center", row: "back", column: "center", label: "S2" },
  { id: "back_right", row: "back", column: "right", label: "S3" },
  { id: "front_left", row: "front", column: "left", label: "F1" },
  { id: "front_center", row: "front", column: "center", label: "F2" },
  { id: "front_right", row: "front", column: "right", label: "F3" },
] as const;

export function getFormationSlotsForSide(side: "player" | "enemy"): readonly FormationSlotDefinition[] {
  if (side === "enemy") return FORMATION_SLOT_DEFINITIONS;
  return [
    ...FORMATION_SLOT_DEFINITIONS.filter((slot) => slot.row === "front"),
    ...FORMATION_SLOT_DEFINITIONS.filter((slot) => slot.row === "back"),
  ];
}

export const COMBAT_CONFIG = {
  baseCritChance: BASE_CRIT_CHANCE,
  critMultiplier: CRIT_DAMAGE_MULTIPLIER,
  minimumDamage: 1,
  defenseConstant: 100,
  battlePressureStartRound: 11,
  battlePressurePerRound: 0.05,
  maxSimulationRounds: 250,
  passives: {
    infantryMissingHpDamageScale: 0.35,
    artilleryLineAttackRatio: 0.40,
    airForceAttackPerStack: 0.04,
    maxGrowthStacks: 10,
    commandoEarlyActionTurns: 3,
    armorEarlyActionTurns: 3,
    armorDamageReduction: 0.30,
    commandoCritBonus: 0.60,
    medicSourceMaxHpTeamHeal: 0.04,
    antiTankTargetMaxHp: 0.10,
    antiTankCurrentAttackCap: 1.25,
    engineerReflect: 0.50,
    chemicalAttackAoe: 0.15,
    chemicalDefenseReductionPerStack: 0.05,
    chemicalMaxDefenseReductionStacks: 3,
    guardSourceMaxHpShield: 0.07,
    pioneerShieldMaxHpRatio: 0.18,
    pioneerShieldActionTurns: 3,
    scoutTimelineAdvance: 0.15,
    marksmanFocusDamagePerStack: 0.08,
    marksmanMaxFocusStacks: 4,
    electronicBasicRageMultiplier: 0.90,
    specialOpsControlChance: 0.35,
    divineMedicDamageMultiplier: 0.65,
    forensicPassiveMultiplier: 0.60,
    forensicMarkedUltimateMultiplier: 0.40,
  },
} as const;

export const TRAINING_BASE: Readonly<Record<TroopType, { gold: number; seconds: number }>> = {
  infantry: { gold: 10, seconds: 3600 },
  artillery: { gold: 10, seconds: 3600 },
  armor: { gold: 10, seconds: 3600 },
  commando: { gold: 10, seconds: 3600 },
  medic: { gold: 10, seconds: 3600 },
  anti_tank: { gold: 10, seconds: 3600 },
  engineer: { gold: 10, seconds: 3600 },
  chemical: { gold: 10, seconds: 3600 },
  air_force: { gold: 10, seconds: 3600 },
  guard: { gold: 10, seconds: 3600 },
  pioneer: { gold: 10, seconds: 3600 },
  scout: { gold: 10, seconds: 3600 },
  marksman: { gold: 10, seconds: 3600 },
  electronic_warfare: { gold: 10, seconds: 3600 },
  special_ops: { gold: 10, seconds: 3600 },
  divine_medic: { gold: 10, seconds: 3600 },
  forensic_medic: { gold: 10, seconds: 3600 },
  martial_artist: { gold: 10, seconds: 3600 },
};

export const PROGRESSION_CONFIG = {
  barracks: {
    minLevel: MIN_BARRACKS_LEVEL,
    maxLevel: MAX_BARRACKS_LEVEL,
    baseTrainingSlots: 5,
    levelsPerExtraTrainingSlot: 3,
    maxTrainingSlots: 12,
    upgradeBaseSeconds: 7200,
    upgradeSecondsPerLevel: 7200,
  },
  training: {
    secondsPerTroopLevel: 1200,
    emergencySeconds: 60,
    emergencyTroopType: "infantry" as TroopType,
    emergencyMinimumArmy: 3,
    quickFinishSecondsPerGold: 120,
    quickFinishMinGold: 1,
    quickFinishMaxGold: 500,
  },
  troopUpgrade: {
    secondsPerTargetLevel: 1200,
  },
} as const;

/** Compatibility name used by the V2 combat/domain modules. */
export const CHIEN_TUYEN_BALANCE = {
  maxFormationUnits: MAX_FORMATION_UNITS,
  formationRowBonusTotal: FORMATION_ROW_BONUS_TOTAL,
  maxSameTroopType: MAX_SAME_TROOP_TYPE,
  deploymentSeconds: DEPLOYMENT_SECONDS,
  critMultiplier: COMBAT_CONFIG.critMultiplier,
  minimumDamage: COMBAT_CONFIG.minimumDamage,
  defenseConstant: COMBAT_CONFIG.defenseConstant,
  battlePressureStartRound: COMBAT_CONFIG.battlePressureStartRound,
  battlePressurePerRound: COMBAT_CONFIG.battlePressurePerRound,
  maxSimulationRounds: COMBAT_CONFIG.maxSimulationRounds,
  passives: COMBAT_CONFIG.passives,
} as const;

export function getSpeedFactor(speed: number): number {
  const safeSpeed = Number.isFinite(speed) ? speed : SPEED_FACTOR_BASELINE;
  return Math.min(
    MAX_SPEED_FACTOR,
    Math.max(MIN_SPEED_FACTOR, 1 + (safeSpeed - SPEED_FACTOR_BASELINE) * SPEED_FACTOR_PER_POINT)
  );
}

export function getActionDelay(speed: number): number {
  return BASE_ACTION_DELAY / getSpeedFactor(speed);
}

export function getFormationRowBonus(rowCount: number): number {
  const count = Math.max(0, Math.floor(Number.isFinite(rowCount) ? rowCount : 0));
  return count > 0 ? FORMATION_ROW_BONUS_TOTAL / count : 0;
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

export function clampBarracksLevel(level: number): number {
  return clampInteger(level, MIN_BARRACKS_LEVEL, MAX_BARRACKS_LEVEL);
}

export function clampTroopLevel(level: number, barracksLevel = MAX_BARRACKS_LEVEL): number {
  return clampInteger(level, 1, clampBarracksLevel(barracksLevel));
}

export function getJourneyLevelFromRankIndex(currentRankIndex: number): number {
  return clampInteger(currentRankIndex + 1, 1, 216);
}

export function getMaxBarracksLevel(journeyLevel: number): number {
  const safeJourneyLevel = clampInteger(journeyLevel, 1, 216);
  return clampInteger(Math.ceil(safeJourneyLevel / 4), MIN_BARRACKS_LEVEL, MAX_BARRACKS_LEVEL);
}

export function getMaxBarracksLevelFromRankIndex(currentRankIndex: number): number {
  return getMaxBarracksLevel(getJourneyLevelFromRankIndex(currentRankIndex));
}

export function getRequiredRankIndexForBarracksLevel(barracksLevel: number): number {
  return Math.min(215, (clampBarracksLevel(barracksLevel) - 1) * 4);
}

export function getTrainingSlotCount(barracksLevel: number): number {
  const level = clampBarracksLevel(barracksLevel);
  return Math.min(
    PROGRESSION_CONFIG.barracks.maxTrainingSlots,
    PROGRESSION_CONFIG.barracks.baseTrainingSlots +
      Math.floor((level - 1) / PROGRESSION_CONFIG.barracks.levelsPerExtraTrainingSlot)
  );
}

export function getTrainingCost(troopType: TroopType): number {
  return TRAINING_BASE[troopType].gold;
}

export function getTrainingDurationMs(troopType: TroopType, troopLevel: number): number {
  const level = clampInteger(troopLevel, 1, MAX_BARRACKS_LEVEL);
  return (TRAINING_BASE[troopType].seconds + PROGRESSION_CONFIG.training.secondsPerTroopLevel * (level - 1)) * 1000;
}

export function getQuickFinishCost(remainingMs: number): number {
  const remainingSeconds = Math.max(0, Math.ceil((Number.isFinite(remainingMs) ? remainingMs : 0) / 1000));
  return clampInteger(
    Math.ceil(remainingSeconds / PROGRESSION_CONFIG.training.quickFinishSecondsPerGold),
    PROGRESSION_CONFIG.training.quickFinishMinGold,
    PROGRESSION_CONFIG.training.quickFinishMaxGold
  );
}

export function getLevelUpgradeCost(targetLevel: number): number {
  const target = clampInteger(targetLevel, 2, MAX_BARRACKS_LEVEL);
  if (target <= 8) return 10;
  if (target <= 16) return 30;
  return 60;
}

export function getTroopUpgradeDurationMs(troopType: TroopType, targetLevel: number): number {
  const target = clampInteger(targetLevel, 2, MAX_BARRACKS_LEVEL);
  return (TRAINING_BASE[troopType].seconds + PROGRESSION_CONFIG.troopUpgrade.secondsPerTargetLevel * (target - 2)) * 1000;
}

export function getBarracksUpgradeDurationMs(targetLevel: number): number {
  const target = clampInteger(targetLevel, 2, MAX_BARRACKS_LEVEL);
  return (
    PROGRESSION_CONFIG.barracks.upgradeBaseSeconds +
    PROGRESSION_CONFIG.barracks.upgradeSecondsPerLevel * (target - 2)
  ) * 1000;
}

export function getBattlePressureMultiplier(round: number): number {
  const wholeRound = Math.max(1, Math.floor(Number.isFinite(round) ? round : 1));
  const pressureRounds = Math.max(0, wholeRound - (COMBAT_CONFIG.battlePressureStartRound - 1));
  return 1 + pressureRounds * COMBAT_CONFIG.battlePressurePerRound;
}

export function applyDefenseFormula(rawDamage: number, defense: number): number {
  const safeRaw = Math.max(0, Number.isFinite(rawDamage) ? rawDamage : 0);
  const effectiveDefense = Number.isFinite(defense) ? defense : 0;
  if (safeRaw <= 0) return 0;
  const multiplier = effectiveDefense >= 0
    ? COMBAT_CONFIG.defenseConstant / (COMBAT_CONFIG.defenseConstant + effectiveDefense)
    : 2 - COMBAT_CONFIG.defenseConstant / (COMBAT_CONFIG.defenseConstant - effectiveDefense);
  return Math.max(
    COMBAT_CONFIG.minimumDamage,
    Math.round(safeRaw * multiplier)
  );
}

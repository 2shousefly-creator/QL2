import { applyDefenseFormula, COMBAT_CONFIG, getBattlePressureMultiplier, TIMELINE_EPSILON } from "./config";
import { nextSeededRandom } from "./rng";
import {
  AIR_FORCE_ULTIMATE_ATTACK_RATIO_PER_STACK,
  AIR_FORCE_ULTIMATE_BASE_ATTACK_RATIO,
  ANTI_TANK_ULTIMATE_ATTACK_RATIO,
  ANTI_TANK_ULTIMATE_MAX_HP_RATIO,
  ARMOR_ULTIMATE_DEFENSE_BONUS_RATIO,
  ARMOR_ULTIMATE_ACTION_TURNS,
  ARTILLERY_ULTIMATE_WAVE_ATTACK_RATIO,
  BASIC_ATTACK_RAGE_GAIN,
  CHEMICAL_ULTIMATE_ATTACK_RATIO,
  CHEMICAL_ULTIMATE_STUN_ACTIONS,
  CHEMICAL_ULTIMATE_STUN_CHANCE,
  COMMANDO_ULTIMATE_ATTACK_RATIO,
  COMMANDO_ULTIMATE_MISSING_HP_RATIO,
  COMMANDO_ULTIMATE_MAX_HITS,
  ENGINEER_ULTIMATE_HEAL_MISSING_HP_RATIO,
  ENGINEER_ULTIMATE_REFLECT_RATIO,
  getUltimateConfig,
  GUARD_ULTIMATE_SHIELD_MAX_HP_RATIO,
  GUARD_ULTIMATE_SHIELD_ACTION_TURNS,
  hasImplementedUltimate,
  INFANTRY_ULTIMATE_HEAL_MISSING_HP_RATIO,
  INFANTRY_ULTIMATE_PROTECTION_ACTION_TURNS,
  PIONEER_ULTIMATE_ATTACK_RATIO,
  PIONEER_ULTIMATE_STUN_ACTIONS,
  PIONEER_ULTIMATE_STUN_CHANCE,
  SCOUT_ULTIMATE_TIMELINE_MULTIPLIER,
  MARKSMAN_ULTIMATE_ATTACK_RATIO,
  MARKSMAN_ULTIMATE_EXECUTE_ATTACK_RATIO,
  MARKSMAN_ULTIMATE_EXECUTE_HP_THRESHOLD,
  MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO,
  ELECTRONIC_ULTIMATE_ATTACK_RATIO,
  ELECTRONIC_ULTIMATE_RAGE_DRAIN,
  SPECIAL_OPS_ULTIMATE_ATTACK_RATIO,
  SPECIAL_OPS_ULTIMATE_CONTROL_CHANCE,
  SPECIAL_OPS_ULTIMATE_CONTROL_ACTION_TURNS,
  DIVINE_MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO,
  FORENSIC_ULTIMATE_ATTACK_RATIO,
  FORENSIC_ULTIMATE_NORMAL_MULTIPLIER,
  FORENSIC_ULTIMATE_MARKED_MULTIPLIER,
  FORENSIC_ULTIMATE_ACTION_TURNS,
  getMartialArtistUltimateName,
  MARTIAL_ARTIST_GIANG_LONG_ATTACK_RATIO,
  MARTIAL_ARTIST_PHI_LONG_ATTACK_RATIO,
} from "./ultimateConfig";
import type {
  BattleSide,
  BattleState,
  BattleStatus,
  BattleUnit,
  CombatEvent,
  CombatEventType,
  MartialArtistUltimateStance,
  ShieldEntry,
  TargetPriority,
} from "./types";

const EPSILON = TIMELINE_EPSILON;

export interface TargetSelectionResult {
  target: BattleUnit | null;
  rngState: number;
}

export interface ShieldDamageResult {
  absorbed: number;
  hpDamage: number;
  totalApplied: number;
}

export function cloneBattleState(state: BattleState): BattleState {
  return JSON.parse(JSON.stringify(state)) as BattleState;
}

export function otherBattleSide(side: BattleSide): BattleSide {
  return side === "player" ? "enemy" : "player";
}

export function isUnitAlive(unit: BattleUnit): boolean {
  return unit.alive && unit.hp > EPSILON;
}

function unitRow(unit: BattleUnit): "front" | "back" {
  return unit.slotId.startsWith("front_") ? "front" : "back";
}

function livingUnits(state: BattleState, side?: BattleSide): BattleUnit[] {
  return state.units.filter((unit) => isUnitAlive(unit) && (!side || unit.side === side));
}

function findUnit(state: BattleState, instanceId: string): BattleUnit | undefined {
  return state.units.find((unit) => unit.instanceId === instanceId);
}

function appendEvent(
  state: BattleState,
  type: CombatEventType,
  details: Omit<CombatEvent, "id" | "type" | "round"> = {}
): void {
  state.events.push({
    id: `${state.battleId}-r${state.round}-e${state.events.length + 1}`,
    type,
    round: state.round,
    actionId: state.activeActionId ?? undefined,
    ...details,
  });
}

export const MARTIAL_ARTIST_MAX_GUARD_STACKS = 4;

export function getMartialArtistGuardStacks(unit: BattleUnit): number {
  if (unit.troopType !== "martial_artist") return 0;
  return Math.max(0, Math.min(MARTIAL_ARTIST_MAX_GUARD_STACKS, Math.floor(unit.martialArtistGuardStacks ?? 0)));
}

export function getMartialArtistUltimateStance(unit: BattleUnit): MartialArtistUltimateStance {
  return unit.troopType === "martial_artist" && unit.martialArtistUltimateStance === "giang_long"
    ? "giang_long"
    : "phi_long";
}

function beginDamageSequenceInPlace(state: BattleState, attacker: BattleUnit, kind: "basic" | "ultimate"): void {
  const id = `${state.activeActionId ?? `${state.battleId}-r${state.round}-e${state.events.length + 1}`}:${kind}:${attacker.instanceId}`;
  state.activeDamageSequence = {
    id,
    sourceUnitId: attacker.instanceId,
    sourceSide: attacker.side,
    blockReadyTargetUnitIds: livingUnits(state, otherBattleSide(attacker.side))
      .filter((unit) => unit.troopType === "martial_artist" && getMartialArtistGuardStacks(unit) >= MARTIAL_ARTIST_MAX_GUARD_STACKS)
      .map((unit) => unit.instanceId),
    blockedTargetUnitIds: [],
    outgoingGuardGranted: false,
    incomingGuardGrantedUnitIds: [],
  };
}

function isDamageSequenceBlockedForTarget(state: BattleState, attacker: BattleUnit, target: BattleUnit): boolean {
  const sequence = state.activeDamageSequence;
  return Boolean(
    sequence &&
    sequence.sourceUnitId === attacker.instanceId &&
    sequence.sourceSide !== target.side &&
    sequence.blockReadyTargetUnitIds.includes(target.instanceId)
  );
}

function markDamageSequenceBlockedInPlace(state: BattleState, target: BattleUnit): void {
  const sequence = state.activeDamageSequence;
  if (!sequence || sequence.blockedTargetUnitIds.includes(target.instanceId)) return;
  sequence.blockedTargetUnitIds.push(target.instanceId);
}

function gainMartialArtistGuardInPlace(state: BattleState, unit: BattleUnit): void {
  if (unit.troopType !== "martial_artist") return;
  const before = getMartialArtistGuardStacks(unit);
  const after = Math.min(MARTIAL_ARTIST_MAX_GUARD_STACKS, before + 1);
  unit.martialArtistGuardStacks = after;
  if (after === before) return;
  appendEvent(state, "martial_artist_guard_gained", {
    sourceUnitId: unit.instanceId,
    targetUnitIds: [unit.instanceId],
    amount: after,
    side: unit.side,
    damageSequenceId: state.activeDamageSequence?.id,
    message: `ĐỠ ĐÒN ${after}/${MARTIAL_ARTIST_MAX_GUARD_STACKS}`,
  });
}

function recordDamageSequenceInteractionInPlace(
  state: BattleState,
  attacker: BattleUnit,
  target: BattleUnit,
  applied: ShieldDamageResult
): void {
  const sequence = state.activeDamageSequence;
  if (!sequence || sequence.sourceUnitId !== attacker.instanceId || attacker.side === target.side || applied.totalApplied <= EPSILON) return;
  if (attacker.troopType === "martial_artist" && !sequence.outgoingGuardGranted) {
    sequence.outgoingGuardGranted = true;
    gainMartialArtistGuardInPlace(state, attacker);
  }
  if (target.troopType === "martial_artist" && !sequence.incomingGuardGrantedUnitIds.includes(target.instanceId)) {
    sequence.incomingGuardGrantedUnitIds.push(target.instanceId);
    gainMartialArtistGuardInPlace(state, target);
  }
}

function endDamageSequenceInPlace(state: BattleState): void {
  const sequence = state.activeDamageSequence;
  if (!sequence) return;
  for (const targetId of sequence.blockedTargetUnitIds) {
    const target = findUnit(state, targetId);
    if (!target || target.troopType !== "martial_artist") continue;
    target.martialArtistGuardStacks = 0;
    appendEvent(state, "martial_artist_guard_blocked", {
      sourceUnitId: target.instanceId,
      targetUnitIds: [target.instanceId],
      amount: 0,
      blocked: true,
      side: target.side,
      damageSequenceId: sequence.id,
      message: "BỊ CHẶN",
    });
  }
  state.activeDamageSequence = null;
}

function rollInPlace(state: BattleState): number {
  const roll = nextSeededRandom(state.rngState);
  state.rngState = roll.state;
  return roll.value;
}

function chooseSeeded<T>(values: readonly T[], rngState: number): { value: T; rngState: number } {
  if (values.length === 1) return { value: values[0], rngState };
  const roll = nextSeededRandom(rngState);
  const index = Math.min(values.length - 1, Math.floor(roll.value * values.length));
  return { value: values[index], rngState: roll.state };
}

function getBattleStatus(unit: BattleUnit, type: BattleStatus["type"]): BattleStatus | undefined {
  return (unit.statuses ?? []).find((status) => status.type === type);
}

export function isBattleStatusActive(status: BattleStatus, _round?: number): boolean {
  if (status.remainingActionTurns !== undefined) return status.remainingActionTurns > 0;
  return true;
}

function replaceStatusInPlace(unit: BattleUnit, status: BattleStatus): void {
  unit.statuses = [...(unit.statuses ?? []).filter((entry) => entry.type !== status.type), status];
}

function replaceStatusByIdInPlace(unit: BattleUnit, status: BattleStatus): void {
  unit.statuses = [...(unit.statuses ?? []).filter((entry) => entry.id !== status.id), status];
}

function getSourceActionTurnExpiry(
  state: BattleState,
  source: BattleUnit,
  durationActionTurns: number
): number {
  const currentOpportunityDoesNotCount = state.activeActionUnitId === source.instanceId ? 1 : 0;
  return source.actionTurnCount + Math.max(1, Math.floor(durationActionTurns)) + currentOpportunityDoesNotCount;
}

function sourceClockFields(
  state: BattleState,
  source: BattleUnit,
  durationActionTurns: number
): Pick<BattleStatus, "durationClock" | "appliedSourceActionTurn" | "expiresAfterSourceActionTurn" | "remainingActionTurns"> {
  const duration = Math.max(1, Math.floor(durationActionTurns));
  return {
    durationClock: "source_action_turn",
    appliedSourceActionTurn: source.actionTurnCount,
    expiresAfterSourceActionTurn: getSourceActionTurnExpiry(state, source, duration),
    remainingActionTurns: duration,
  };
}

function targetClockFields(
  target: BattleUnit,
  durationActionTurns: number
): Pick<BattleStatus, "durationClock" | "appliedTargetActionTurn" | "expiresAfterTargetActionTurn" | "remainingActionTurns"> {
  const duration = Math.max(1, Math.floor(durationActionTurns));
  return {
    durationClock: "target_action_turn",
    appliedTargetActionTurn: target.actionTurnCount,
    expiresAfterTargetActionTurn: target.actionTurnCount + duration,
    remainingActionTurns: duration,
  };
}

function sourceClockShieldFields(
  state: BattleState,
  source: BattleUnit,
  durationActionTurns: number
): Pick<ShieldEntry, "durationClock" | "appliedSourceActionTurn" | "expiresAfterSourceActionTurn" | "remainingActionTurns"> {
  const duration = Math.max(1, Math.floor(durationActionTurns));
  return {
    durationClock: "source_action_turn",
    appliedSourceActionTurn: source.actionTurnCount,
    expiresAfterSourceActionTurn: getSourceActionTurnExpiry(state, source, duration),
    remainingActionTurns: duration,
  };
}

function phase3DefenseDownAmount(unit: BattleUnit): number {
  return (unit.statuses ?? [])
    .filter((status) => status.type === "anti_tank_defense_down")
    .reduce((total, status) => total + Math.max(0, status.amount ?? 0), 0);
}

function forcedTauntTarget(units: readonly BattleUnit[], attacker: BattleUnit): BattleUnit | null {
  return units
    .filter((unit) => unit.side !== attacker.side && isUnitAlive(unit) && Boolean(getBattleStatus(unit, "engineer_toughness")))
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId))[0] ?? null;
}

export function getEngineerReflectRatio(unit: BattleUnit): number {
  const override = getBattleStatus(unit, "engineer_toughness")?.reflectRatioOverride;
  return override ?? COMBAT_CONFIG.passives.engineerReflect;
}

function strongestStatusMultiplier(unit: BattleUnit, field: "healingReceivedMultiplier" | "shieldReceivedMultiplier" | "damageReceivedMultiplier"): number {
  return (unit.statuses ?? []).reduce(
    (strongest, status) => Math.min(strongest, Math.max(0, status[field] ?? 1)),
    1
  );
}

export function getHealingReceivedMultiplier(unit: BattleUnit): number {
  return strongestStatusMultiplier(unit, "healingReceivedMultiplier");
}

export function getShieldReceivedMultiplier(unit: BattleUnit): number {
  return strongestStatusMultiplier(unit, "shieldReceivedMultiplier");
}

function applyHealInPlace(
  state: BattleState,
  source: BattleUnit,
  target: BattleUnit,
  requestedAmount: number,
  ultimateId?: BattleUnit["ultimateId"],
  options: { emitAtFullHealth?: boolean; message?: string } = {}
): number {
  if (!isUnitAlive(target)) return 0;
  const missingHp = Math.max(0, target.maxHp - target.hp);
  const amount = Math.min(missingHp, Math.max(0, requestedAmount) * getHealingReceivedMultiplier(target));
  if (amount <= EPSILON && !options.emitAtFullHealth) return 0;
  if (amount > EPSILON) target.hp = Math.min(target.maxHp, target.hp + amount);
  appendEvent(state, "heal", {
    sourceUnitId: source.instanceId,
    targetUnitIds: [target.instanceId],
    amount,
    side: source.side,
    ultimateId,
    message: options.message,
  });
  return amount;
}

function applyShieldInPlace(
  state: BattleState,
  source: BattleUnit,
  target: BattleUnit,
  requestedAmount: number,
  entry: Omit<ShieldEntry, "sourceUnitId" | "amount"> = {},
  ultimateId?: BattleUnit["ultimateId"]
): number {
  const amount = Math.max(0, requestedAmount) * getShieldReceivedMultiplier(target);
  if (amount <= EPSILON) return 0;
  target.shields.push({ sourceUnitId: source.instanceId, amount, ...entry });
  appendEvent(state, "shield", {
    sourceUnitId: source.instanceId,
    targetUnitIds: [target.instanceId],
    amount,
    side: source.side,
    ultimateId,
    durationActionTurns: entry.remainingActionTurns,
    remainingActionTurns: entry.remainingActionTurns,
    durationClock: entry.durationClock,
  });
  return amount;
}

function removeEngineerToughnessInPlace(state: BattleState, unit: BattleUnit): void {
  const status = getBattleStatus(unit, "engineer_toughness");
  if (!status) return;
  unit.statuses = unit.statuses.filter((entry) => entry.id !== status.id);
  appendEvent(state, "taunt_removed", {
    sourceUnitId: unit.instanceId,
    targetUnitIds: [unit.instanceId],
    side: unit.side,
    statusId: status.id,
    statusType: status.type,
  });
  appendEvent(state, "reflect_buff_removed", {
    sourceUnitId: unit.instanceId,
    targetUnitIds: [unit.instanceId],
    side: unit.side,
    statusId: status.id,
    statusType: status.type,
  });
}

function removeAntiTankDefenseDownInPlace(
  state: BattleState,
  target: BattleUnit,
  status: BattleStatus,
  cleansedByUnitId?: string
): void {
  target.defense += Math.max(0, status.amount ?? 0);
  target.statuses = target.statuses.filter((entry) => entry.id !== status.id);
  appendEvent(state, "defense_down_removed", {
    sourceUnitId: cleansedByUnitId ?? status.sourceUnitId,
    targetUnitIds: [target.instanceId],
    amount: status.amount,
    side: target.side,
    statusId: status.id,
    statusType: status.type,
  });
}

function removeTimedStatusInPlace(state: BattleState, target: BattleUnit, status: BattleStatus): void {
  if (status.type === "anti_tank_defense_down") {
    removeAntiTankDefenseDownInPlace(state, target, status);
    return;
  }
  if (status.type === "engineer_toughness") {
    removeEngineerToughnessInPlace(state, target);
    return;
  }
  target.statuses = target.statuses.filter((entry) => entry.id !== status.id);
  if (status.type === "infantry_death_refusal") {
    appendEvent(state, "death_refusal_removed", {
      sourceUnitId: status.sourceUnitId,
      targetUnitIds: [target.instanceId],
      amount: status.amount,
      side: target.side,
      statusId: status.id,
      statusType: status.type,
    });
  } else if (status.type === "silence" || status.type === "stun") {
    appendEvent(state, status.type === "silence" ? "silence_removed" : "stun_removed", {
      sourceUnitId: status.sourceUnitId,
      targetUnitIds: [target.instanceId],
      side: target.side,
      statusId: status.id,
      statusType: status.type,
    });
  }
}

function cleanseDebuffsInPlace(state: BattleState, cleanser: BattleUnit, target: BattleUnit): number {
  let removedCount = 0;
  const debuffs = [...(target.statuses ?? [])].filter((status) => status.polarity === "debuff" && status.cleansable);
  for (const status of debuffs) {
    if (status.type === "anti_tank_defense_down") {
      removeAntiTankDefenseDownInPlace(state, target, status, cleanser.instanceId);
    } else {
      target.statuses = target.statuses.filter((entry) => entry.id !== status.id);
      if (status.type === "stun") {
        appendEvent(state, "stun_removed", {
          sourceUnitId: cleanser.instanceId,
          targetUnitIds: [target.instanceId],
          side: target.side,
          statusId: status.id,
          statusType: status.type,
        });
      } else if (status.type === "silence") {
        appendEvent(state, "silence_removed", {
          sourceUnitId: cleanser.instanceId,
          targetUnitIds: [target.instanceId],
          side: target.side,
          statusId: status.id,
          statusType: status.type,
        });
      }
    }
    appendEvent(state, "debuff_cleansed", {
      sourceUnitId: cleanser.instanceId,
      targetUnitIds: [target.instanceId],
      side: cleanser.side,
      statusId: status.id,
      statusType: status.type,
    });
    removedCount += 1;
  }

  if (target.corrosionStacks > 0) {
    const corrosionBase = target.corrosionBaseDefense ?? target.battleBaseDefense;
    target.corrosionStacks = 0;
    target.corrosionBaseDefense = null;
    target.defense = corrosionBase + Math.max(0, target.armorUltimateDefenseBonus) - phase3DefenseDownAmount(target);
    appendEvent(state, "debuff_cleansed", {
      sourceUnitId: cleanser.instanceId,
      targetUnitIds: [target.instanceId],
      side: cleanser.side,
      statusId: `corrosion:${target.instanceId}`,
      statusType: "corrosion",
    });
    removedCount += 1;
  }
  return removedCount;
}

export function isBeneficialCombatEffect(status: BattleStatus): boolean {
  return status.polarity === "buff" && status.removable !== false;
}

/** Centralized removal path for every beneficial effect that is allowed to be dispelled. */
export function dispelAllBeneficialEffectsInPlace(
  state: BattleState,
  dispeller: BattleUnit,
  target: BattleUnit
): number {
  let removedCount = 0;
  const removableBuffs = [...(target.statuses ?? [])].filter(isBeneficialCombatEffect);
  for (const status of removableBuffs) {
    removeTimedStatusInPlace(state, target, status);
    removedCount += 1;
  }

  if (target.shields.length > 0) {
    const removedShield = target.shields.reduce((total, shield) => total + Math.max(0, shield.amount), 0);
    removedCount += target.shields.length;
    target.shields = [];
    appendEvent(state, "shield_removed", {
      sourceUnitId: dispeller.instanceId,
      targetUnitIds: [target.instanceId],
      amount: removedShield,
      side: dispeller.side,
    });
  }

  if (target.armorUltimateDefenseBonus > EPSILON) {
    const removedDefense = target.armorUltimateDefenseBonus;
    target.defense -= removedDefense;
    target.armorUltimateDefenseBonus = 0;
    target.armorUltimateExpiresAfterActionTurn = null;
    removedCount += 1;
    appendEvent(state, "ultimate_buff", {
      sourceUnitId: dispeller.instanceId,
      targetUnitIds: [target.instanceId],
      amount: removedDefense,
      buffKind: "defense_expired",
      side: dispeller.side,
    });
  }

  if (target.passiveId === "air_force_attack_growth" && target.passiveStacks > 0) {
    target.passiveStacks = 0;
    target.attack = target.battleBaseAttack;
    removedCount += 1;
  }
  if (target.passiveId === "marksman_focus" && target.focusStacks > 0) {
    target.focusStacks = 0;
    target.focusTargetId = null;
    removedCount += 1;
  }
  if (target.troopType === "martial_artist" && getMartialArtistGuardStacks(target) > 0) {
    target.martialArtistGuardStacks = 0;
    removedCount += 1;
  }

  if (removedCount > 0) {
    appendEvent(state, "beneficial_effects_dispelled", {
      sourceUnitId: dispeller.instanceId,
      targetUnitIds: [target.instanceId],
      amount: removedCount,
      side: dispeller.side,
      message: "PHÁ BUFF",
    });
  }
  return removedCount;
}

export interface MultiTargetSelectionResult {
  targets: BattleUnit[];
  rngState: number;
}

export function selectMedicUltimateTargets(
  units: readonly BattleUnit[],
  medic: BattleUnit,
  rngState: number
): MultiTargetSelectionResult {
  let state = rngState;
  let pool = units.filter((unit) => unit.side === medic.side && unit.instanceId !== medic.instanceId && isUnitAlive(unit));
  const targets: BattleUnit[] = [];
  while (targets.length < 2 && pool.length > 0) {
    const minimumRatio = pool.reduce(
      (minimum, unit) => Math.min(minimum, unit.hp / Math.max(EPSILON, unit.maxHp)),
      Number.POSITIVE_INFINITY
    );
    let tied = pool
      .filter((unit) => Math.abs(unit.hp / Math.max(EPSILON, unit.maxHp) - minimumRatio) <= EPSILON)
      .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
    const slots = 2 - targets.length;
    if (tied.length <= slots) {
      targets.push(...tied);
      const chosenIds = new Set(tied.map((unit) => unit.instanceId));
      pool = pool.filter((unit) => !chosenIds.has(unit.instanceId));
      continue;
    }
    while (targets.length < 2 && tied.length > 0) {
      const chosen = chooseSeeded(tied, state);
      state = chosen.rngState;
      targets.push(chosen.value);
      tied = tied.filter((unit) => unit.instanceId !== chosen.value.instanceId);
      pool = pool.filter((unit) => unit.instanceId !== chosen.value.instanceId);
    }
  }
  return { targets, rngState: state };
}

function applyAntiTankDefenseDownInPlace(state: BattleState, attacker: BattleUnit, target: BattleUnit): void {
  const existing = getBattleStatus(target, "anti_tank_defense_down");
  if (existing) {
    target.defense += Math.max(0, existing.amount ?? 0);
    target.statuses = target.statuses.filter((status) => status.id !== existing.id);
  }
  const amount = Math.max(0, target.defense) * 0.30;
  target.defense -= amount;
  const status: BattleStatus = {
    id: `anti_tank_ultimate_armor_break:${attacker.instanceId}:${target.instanceId}`,
    sourceUnitId: attacker.instanceId,
    type: "anti_tank_defense_down",
    polarity: "debuff",
    cleansable: true,
    stackPolicy: "refresh",
    ...targetClockFields(target, 2),
    amount,
  };
  replaceStatusInPlace(target, status);
  appendEvent(state, "defense_down_applied", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [target.instanceId],
    amount,
    side: attacker.side,
    statusId: status.id,
    statusType: status.type,
    durationActionTurns: 2,
    remainingActionTurns: 2,
    durationClock: "target_action_turn",
  });
}

function applyStunInPlace(
  state: BattleState,
  attacker: BattleUnit,
  target: BattleUnit,
  remainingActionTurns: number
): void {
  const duration = Math.max(1, Math.floor(remainingActionTurns));
  const status: BattleStatus = {
    id: `${attacker.ultimateId}_stun:${attacker.instanceId}:${target.instanceId}`,
    sourceUnitId: attacker.instanceId,
    type: "stun",
    polarity: "debuff",
    cleansable: true,
    stackPolicy: "refresh",
    ...targetClockFields(target, duration),
    effectKind: "action_stun",
  };
  replaceStatusInPlace(target, status);
  appendEvent(state, "stun_applied", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [target.instanceId],
    amount: duration,
    side: attacker.side,
    statusId: status.id,
    statusType: status.type,
    durationActionTurns: duration,
    remainingActionTurns: duration,
    durationClock: "target_action_turn",
  });
}

export function selectTarget(
  units: readonly BattleUnit[],
  attacker: BattleUnit,
  rngState: number,
  priority: TargetPriority = attacker.targetPriority
): TargetSelectionResult {
  const enemies = units.filter((unit) => unit.side !== attacker.side && isUnitAlive(unit));
  if (enemies.length === 0) return { target: null, rngState };
  const forced = forcedTauntTarget(units, attacker);
  if (forced) return { target: forced, rngState };

  const preferredRow = priority === "back_first" ? "back" : "front";
  const fallbackRow = preferredRow === "front" ? "back" : "front";
  const preferred = enemies.filter((unit) => unitRow(unit) === preferredRow);
  const eligible = preferred.length > 0 ? preferred : enemies.filter((unit) => unitRow(unit) === fallbackRow);
  const chosen = chooseSeeded(eligible, rngState);
  return { target: chosen.value, rngState: chosen.rngState };
}

export function selectHighestCurrentAttackTarget(
  units: readonly BattleUnit[],
  attacker: BattleUnit,
  rngState: number
): TargetSelectionResult {
  const enemies = units.filter((unit) => unit.side !== attacker.side && isUnitAlive(unit));
  if (enemies.length === 0) return { target: null, rngState };
  const highestAttack = enemies.reduce((highest, unit) => Math.max(highest, unit.attack), Number.NEGATIVE_INFINITY);
  const tied = enemies
    .filter((unit) => Math.abs(unit.attack - highestAttack) <= EPSILON)
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  const chosen = chooseSeeded(tied, rngState);
  return { target: chosen.value, rngState: chosen.rngState };
}

export function selectCommandoUltimateTarget(
  units: readonly BattleUnit[],
  attacker: BattleUnit,
  rngState: number
): TargetSelectionResult {
  const enemies = units.filter((unit) => unit.side !== attacker.side && isUnitAlive(unit));
  if (enemies.length === 0) return { target: null, rngState };
  const forced = forcedTauntTarget(units, attacker);
  if (forced) return { target: forced, rngState };
  const back = enemies.filter((unit) => unitRow(unit) === "back");
  const eligible = back.length > 0 ? back : enemies.filter((unit) => unitRow(unit) === "front");
  const minimumRatio = eligible.reduce(
    (minimum, unit) => Math.min(minimum, unit.hp / Math.max(EPSILON, unit.maxHp)),
    Number.POSITIVE_INFINITY
  );
  const tied = eligible.filter(
    (unit) => Math.abs(unit.hp / Math.max(EPSILON, unit.maxHp) - minimumRatio) <= EPSILON
  );
  const chosen = chooseSeeded(tied, rngState);
  return { target: chosen.value, rngState: chosen.rngState };
}

/** Hạ Đo Ván interrupts the living enemy scheduled to act earliest. */
export function selectPioneerUltimateTarget(
  units: readonly BattleUnit[],
  attacker: BattleUnit,
  rngState: number
): TargetSelectionResult {
  const enemies = units.filter((unit) => unit.side !== attacker.side && isUnitAlive(unit));
  if (enemies.length === 0) return { target: null, rngState };
  const earliest = enemies.reduce(
    (minimum, unit) => Math.min(minimum, unit.nextActionAt),
    Number.POSITIVE_INFINITY
  );
  const tied = enemies
    .filter((unit) => Math.abs(unit.nextActionAt - earliest) <= TIMELINE_EPSILON)
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  const chosen = chooseSeeded(tied, rngState);
  return { target: chosen.value, rngState: chosen.rngState };
}

export function getDefenseDamageMultiplier(defense: number): number {
  return defense >= 0
    ? COMBAT_CONFIG.defenseConstant / (COMBAT_CONFIG.defenseConstant + defense)
    : 2 - COMBAT_CONFIG.defenseConstant / (COMBAT_CONFIG.defenseConstant - defense);
}

export function calculateDefenseDamage(rawDamage: number, defense: number): number {
  return applyDefenseFormula(rawDamage, defense);
}

export function getBattlePressureBonus(round: number): number {
  return getBattlePressureMultiplier(round) - 1;
}

export function getEffectiveCritChance(unit: BattleUnit, _round?: number): number {
  const earlyCommandoBonus =
    unit.passiveId === "commando_early_crit" && unit.actionTurnCount < COMBAT_CONFIG.passives.commandoEarlyActionTurns
      ? COMBAT_CONFIG.passives.commandoCritBonus
      : 0;
  return Math.max(0, Math.min(1, unit.critChance + earlyCommandoBonus));
}

export function getEffectiveCritDamageMultiplier(_unit: BattleUnit): number {
  return COMBAT_CONFIG.critMultiplier;
}

export function calculateAntiTankBonusRaw(attacker: BattleUnit, target: BattleUnit): number {
  if (attacker.passiveId !== "anti_tank_max_hp_hit") return 0;
  const maxHpDamage = target.maxHp * COMBAT_CONFIG.passives.antiTankTargetMaxHp;
  if (!target.isBoss) return maxHpDamage;
  return Math.min(maxHpDamage, Math.max(0, attacker.attack) * COMBAT_CONFIG.passives.antiTankCurrentAttackCap);
}

export function getInfantryMissingHpDamageBonus(unit: BattleUnit): number {
  if (unit.passiveId !== "infantry_missing_hp_damage") return 0;
  const maxHp = Math.max(EPSILON, unit.maxHp);
  const missingHpRatio = Math.max(0, Math.min(1, (maxHp - Math.max(0, unit.hp)) / maxHp));
  return missingHpRatio * COMBAT_CONFIG.passives.infantryMissingHpDamageScale;
}

export function getOutgoingDamageMultiplier(attacker: BattleUnit, round: number): number {
  const canTruong = 1 + getInfantryMissingHpDamageBonus(attacker);
  return Math.max(0, attacker.damageMultiplier) * canTruong * (1 + getBattlePressureBonus(round));
}

export function calculateMitigatedDamage(
  rawDamage: number,
  attacker: BattleUnit,
  target: BattleUnit,
  round: number
): number {
  let damage = calculateDefenseDamage(rawDamage * getOutgoingDamageMultiplier(attacker, round), target.defense);
  if (
    target.passiveId === "armor_early_reduction" &&
    target.actionTurnCount < COMBAT_CONFIG.passives.armorEarlyActionTurns
  ) {
    damage = damage <= 0
      ? 0
      : Math.max(
        COMBAT_CONFIG.minimumDamage,
        Math.round(damage * (1 - COMBAT_CONFIG.passives.armorDamageReduction))
      );
  }
  const receivedMultiplier = strongestStatusMultiplier(target, "damageReceivedMultiplier");
  if (damage > 0 && receivedMultiplier < 1) {
    damage = Math.max(COMBAT_CONFIG.minimumDamage, Math.round(damage * receivedMultiplier));
  }
  return Math.max(0, damage);
}

export function applyShieldAndHpDamage(target: BattleUnit, incomingDamage: number): ShieldDamageResult {
  let remaining = Math.max(0, incomingDamage);
  let absorbed = 0;
  for (const shield of target.shields) {
    if (remaining <= EPSILON) break;
    const used = Math.min(Math.max(0, shield.amount), remaining);
    shield.amount -= used;
    remaining -= used;
    absorbed += used;
  }
  target.shields = target.shields.filter((shield) => shield.amount > EPSILON);
  const hpBefore = Math.max(0, target.hp);
  const protection = getBattleStatus(target, "infantry_death_refusal");
  const configuredFloor = Math.max(0, protection?.amount ?? 0);
  // Never use the status to raise HP. If the unit is already below a configured
  // floor for any reason, its current HP is the effective floor for this hit.
  const effectiveFloor = protection ? Math.min(hpBefore, configuredFloor) : 0;
  const hpDamage = Math.min(Math.max(0, hpBefore - effectiveFloor), remaining);
  target.hp = Math.max(effectiveFloor, hpBefore - hpDamage);
  return { absorbed, hpDamage, totalApplied: absorbed + hpDamage };
}

function removeSourceShieldsInPlace(
  state: BattleState,
  sourceUnitId: string,
  kind?: ShieldEntry["kind"]
): void {
  for (const unit of state.units) {
    const shouldRemove = (shield: ShieldEntry) =>
      shield.sourceUnitId === sourceUnitId && (kind === undefined || shield.kind === kind);
    const removed = unit.shields
      .filter(shouldRemove)
      .reduce((total, shield) => total + shield.amount, 0);
    if (removed <= EPSILON) continue;
    unit.shields = unit.shields.filter((shield) => !shouldRemove(shield));
    appendEvent(state, "shield_removed", {
      sourceUnitId,
      targetUnitIds: [unit.instanceId],
      amount: removed,
      side: unit.side,
    });
  }
}

function markDeathInPlace(state: BattleState, unit: BattleUnit): void {
  if (!unit.alive || unit.hp > EPSILON) return;
  removeEngineerToughnessInPlace(state, unit);
  unit.hp = 0;
  unit.alive = false;
  unit.shields = [];
  for (const candidate of state.units) {
    if (candidate.focusTargetId === unit.instanceId) {
      candidate.focusTargetId = null;
      candidate.focusStacks = 0;
    }
  }
  // Source death invalidates every shield emitted by that unit, regardless of kind.
  removeSourceShieldsInPlace(state, unit.instanceId);
  // Source-clock effects cannot wait forever once their owner is dead.
  for (const target of state.units) {
    const owned = [...(target.statuses ?? [])].filter(
      (status) => status.sourceUnitId === unit.instanceId && status.durationClock === "source_action_turn"
    );
    for (const status of owned) removeTimedStatusInPlace(state, target, status);
  }
  appendEvent(state, "death", {
    sourceUnitId: unit.instanceId,
    targetUnitIds: [unit.instanceId],
    side: unit.side,
    message: `${unit.name} đã tử trận.`,
  });
}

function resolveLethalDamageInPlace(state: BattleState, unit: BattleUnit, deferNormalDeath = false): void {
  if (!unit.alive || unit.hp > EPSILON) return;
  if (unit.passiveId === "pioneer_last_stand" && !unit.pioneerLastStandUsed) {
    unit.hp = 1;
    unit.alive = true;
    unit.pioneerLastStandUsed = true;
    const amount = unit.maxHp * COMBAT_CONFIG.passives.pioneerShieldMaxHpRatio;
    applyShieldInPlace(state, unit, unit, amount, {
      kind: "pioneer_tenacity",
      ...sourceClockShieldFields(state, unit, COMBAT_CONFIG.passives.pioneerShieldActionTurns),
    });
    appendEvent(state, "pioneer_last_stand", {
      sourceUnitId: unit.instanceId,
      targetUnitIds: [unit.instanceId],
      side: unit.side,
      durationActionTurns: COMBAT_CONFIG.passives.pioneerShieldActionTurns,
      remainingActionTurns: COMBAT_CONFIG.passives.pioneerShieldActionTurns,
      durationClock: "source_action_turn",
      message: "KIÊN CƯỜNG",
    });
    return;
  }
  if (!deferNormalDeath) markDeathInPlace(state, unit);
}

export function checkBattleOutcome(state: BattleState): BattleState["outcome"] {
  const playerAlive = livingUnits(state, "player").length > 0;
  const enemyAlive = livingUnits(state, "enemy").length > 0;
  if (!playerAlive && !enemyAlive) return "draw";
  if (!enemyAlive) return "player_victory";
  if (!playerAlive) return "enemy_victory";
  return null;
}

function settleOutcomeInPlace(state: BattleState): void {
  if (state.outcome) return;
  const outcome = checkBattleOutcome(state);
  if (!outcome) return;
  state.outcome = outcome;
  appendEvent(state, "battle_ended", {
    message: outcome === "player_victory" ? "Chiến thắng." : outcome === "enemy_victory" ? "Thất bại." : "Hai bên cùng bị tiêu diệt.",
  });
}

function rememberDamageTargetInPlace(attacker: BattleUnit, target: BattleUnit, applied: ShieldDamageResult): void {
  if ((attacker.troopType !== "air_force" && attacker.troopType !== "marksman") || target.side === attacker.side || applied.totalApplied <= EPSILON) return;
  attacker.lastDamagedEnemyId = target.instanceId;
}

function applyStandardDamageInPlace(
  state: BattleState,
  attacker: BattleUnit,
  target: BattleUnit,
  rawDamage: number,
  directAttack: boolean,
  settleAfterDamage = true
): ShieldDamageResult {
  if (isDamageSequenceBlockedForTarget(state, attacker, target)) {
    const applied = { absorbed: 0, hpDamage: 0, totalApplied: 0 };
    markDamageSequenceBlockedInPlace(state, target);
    appendEvent(state, "damage", {
      sourceUnitId: attacker.instanceId,
      targetUnitIds: [target.instanceId],
      amount: 0,
      hpDamage: 0,
      shieldDamage: 0,
      blocked: true,
      side: attacker.side,
      damageSequenceId: state.activeDamageSequence?.id,
      message: "BỊ CHẶN",
    });
    return applied;
  }
  const mitigated = calculateMitigatedDamage(rawDamage, attacker, target, state.round);
  const applied = applyShieldAndHpDamage(target, mitigated);
  rememberDamageTargetInPlace(attacker, target, applied);
  recordDamageSequenceInteractionInPlace(state, attacker, target, applied);
  appendEvent(state, "damage", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [target.instanceId],
    amount: applied.totalApplied,
    damageSequenceId: state.activeDamageSequence?.id,
    side: attacker.side,
    message: applied.absorbed > EPSILON ? `Khiên hấp thụ ${applied.absorbed.toFixed(1)}.` : undefined,
  });

  if (directAttack && target.passiveId === "engineer_reflect" && applied.hpDamage > EPSILON) {
    // Reflect is defined from final HP damage actually received. Battle
    // Pressure is already included in that value and must not be applied twice.
    const reflectIncoming = Math.round(applied.hpDamage * getEngineerReflectRatio(target));
    const reflected = applyShieldAndHpDamage(attacker, reflectIncoming);
    appendEvent(state, "reflect", {
      sourceUnitId: target.instanceId,
      targetUnitIds: [attacker.instanceId],
      amount: reflected.totalApplied,
      side: target.side,
    });
    resolveLethalDamageInPlace(state, attacker);
  }

  resolveLethalDamageInPlace(state, target);
  if (settleAfterDamage) settleOutcomeInPlace(state);
  return applied;
}

function gainBasicAttackRageInPlace(state: BattleState, attacker: BattleUnit): void {
  const required = Math.max(1, attacker.ultimateRageRequired);
  const before = Math.max(0, attacker.rage);
  const interfered = livingUnits(state, otherBattleSide(attacker.side))
    .some((unit) => unit.passiveId === "electronic_rage_interference");
  const gain = BASIC_ATTACK_RAGE_GAIN * (interfered ? COMBAT_CONFIG.passives.electronicBasicRageMultiplier : 1);
  attacker.rage = Math.min(required, before + gain);
  appendEvent(state, "rage_gained", {
    sourceUnitId: attacker.instanceId,
    amount: attacker.rage - before,
    rage: attacker.rage,
    ultimateRageRequired: required,
    ultimateId: attacker.ultimateId,
    side: attacker.side,
  });
  if (interfered) {
    appendEvent(state, "rage_reduced", {
      sourceUnitId: attacker.instanceId,
      targetUnitIds: [attacker.instanceId],
      amount: BASIC_ATTACK_RAGE_GAIN - gain,
      rage: attacker.rage,
      side: attacker.side,
      message: "NHIỄU SÓNG",
    });
  }
}

function applyUltimateDamageInPlace(
  state: BattleState,
  attacker: BattleUnit,
  target: BattleUnit,
  rawDamageBeforeCrit: number,
  hitIndex: number,
  settleAfterDamage = true
): { killed: boolean; critical: boolean; applied: ShieldDamageResult } {
  const wasAlive = isUnitAlive(target);
  const critical = rollInPlace(state) < getEffectiveCritChance(attacker, state.round);
  const rawDamage =
    Math.max(0, rawDamageBeforeCrit) *
    (critical ? getEffectiveCritDamageMultiplier(attacker) : 1);
  if (isDamageSequenceBlockedForTarget(state, attacker, target)) {
    const applied = { absorbed: 0, hpDamage: 0, totalApplied: 0 };
    markDamageSequenceBlockedInPlace(state, target);
    appendEvent(state, "ultimate_hit", {
      sourceUnitId: attacker.instanceId,
      targetUnitIds: [target.instanceId],
      amount: 0,
      hpDamage: 0,
      shieldDamage: 0,
      blocked: true,
      critical: false,
      hitIndex,
      ultimateId: attacker.ultimateId,
      side: attacker.side,
      damageSequenceId: state.activeDamageSequence?.id,
      message: "BỊ CHẶN",
    });
    return { killed: false, critical: false, applied };
  }
  const mitigated = calculateMitigatedDamage(rawDamage, attacker, target, state.round);
  const applied = applyShieldAndHpDamage(target, mitigated);
  rememberDamageTargetInPlace(attacker, target, applied);
  recordDamageSequenceInteractionInPlace(state, attacker, target, applied);
  resolveLethalDamageInPlace(state, target);
  appendEvent(state, "ultimate_hit", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [target.instanceId],
    amount: applied.totalApplied,
    hpDamage: applied.hpDamage,
    shieldDamage: applied.absorbed,
    critical,
    hitIndex,
    ultimateId: attacker.ultimateId,
    side: attacker.side,
    damageSequenceId: state.activeDamageSequence?.id,
  });
  if (settleAfterDamage) settleOutcomeInPlace(state);
  return { killed: wasAlive && !isUnitAlive(target), critical, applied };
}

function appendUltimateStarted(state: BattleState, attacker: BattleUnit): void {
  const rageBefore = Math.max(0, attacker.rage);
  const martialArtistStance = attacker.troopType === "martial_artist"
    ? getMartialArtistUltimateStance(attacker)
    : undefined;
  // Committing a valid Ultimate discards all Rage overflow immediately. The
  // presentation layer reads `rageBefore` to tween the bar independently.
  attacker.rage = 0;
  appendEvent(state, "ultimate_started", {
    sourceUnitId: attacker.instanceId,
    side: attacker.side,
    rage: 0,
    rageBefore,
    ultimateRageRequired: attacker.ultimateRageRequired,
    ultimateId: attacker.ultimateId,
    martialArtistStance,
    actionKind: "ultimate",
    message: martialArtistStance
      ? getMartialArtistUltimateName(martialArtistStance)
      : getUltimateConfig(attacker.troopType!).name ?? "ULTIMATE",
  });
  appendEvent(state, "ultimate_vfx", {
    sourceUnitId: attacker.instanceId,
    side: attacker.side,
    ultimateId: attacker.ultimateId,
  });
}

export function canUseUltimateAction(state: BattleState, attacker: BattleUnit): boolean {
  if (state.outcome || !isUnitAlive(attacker) || attacker.rage < attacker.ultimateRageRequired) return false;
  if ((attacker.statuses ?? []).some((status) => status.type === "silence" && isBattleStatusActive(status, state.round))) return false;
  if (!hasImplementedUltimate(attacker.troopType)) return false;
  if (attacker.troopType === "medic") {
    if (attacker.isBoss) return isUnitAlive(attacker);
    return state.units.some(
      (unit) => unit.side === attacker.side && unit.instanceId !== attacker.instanceId && isUnitAlive(unit)
    );
  }
  if (attacker.troopType === "infantry" || attacker.troopType === "armor" || attacker.troopType === "engineer" || attacker.troopType === "guard") {
    return true;
  }
  return state.units.some((unit) => unit.side !== attacker.side && isUnitAlive(unit));
}

function resolveInfantryUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  appendUltimateStarted(state, attacker);
  const missingHp = Math.max(0, attacker.maxHp - attacker.hp);
  applyHealInPlace(state, attacker, attacker, missingHp * INFANTRY_ULTIMATE_HEAL_MISSING_HP_RATIO, attacker.ultimateId);

  const hpAtBuffStart = Math.max(0, attacker.hp);
  const tenPercentMaxHp = Math.max(0, attacker.maxHp) * 0.10;
  const minimumProtectedHp = hpAtBuffStart >= tenPercentMaxHp ? tenPercentMaxHp : hpAtBuffStart;
  const status: BattleStatus = {
    id: `infantry_death_refusal:${attacker.instanceId}`,
    sourceUnitId: attacker.instanceId,
    type: "infantry_death_refusal",
    polarity: "buff",
    cleansable: false,
    stackPolicy: "refresh",
    ...sourceClockFields(state, attacker, INFANTRY_ULTIMATE_PROTECTION_ACTION_TURNS),
    amount: minimumProtectedHp,
  };
  replaceStatusInPlace(attacker, status);
  appendEvent(state, "death_refusal_applied", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [attacker.instanceId],
    amount: minimumProtectedHp,
    durationActionTurns: INFANTRY_ULTIMATE_PROTECTION_ACTION_TURNS,
    remainingActionTurns: INFANTRY_ULTIMATE_PROTECTION_ACTION_TURNS,
    durationClock: "source_action_turn",
    side: attacker.side,
    statusId: status.id,
    statusType: status.type,
    ultimateId: attacker.ultimateId,
    message: "TỪ CHỐI TỬ THẦN",
  });
  return true;
}

function resolveArtilleryUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  if (livingUnits(state, otherBattleSide(attacker.side)).length === 0) return false;
  appendUltimateStarted(state, attacker);
  const perHitRaw = Math.max(0, attacker.attack) * ARTILLERY_ULTIMATE_WAVE_ATTACK_RATIO;
  for (let volley = 1; volley <= 3; volley += 1) {
    const targets = livingUnits(state, otherBattleSide(attacker.side));
    if (targets.length === 0 || state.outcome) break;
    for (const target of targets) {
      if (!isUnitAlive(target)) continue;
      applyUltimateDamageInPlace(state, attacker, target, perHitRaw, volley, false);
    }
    settleOutcomeInPlace(state);
    if (state.outcome) break;
  }
  return true;
}

function resolveArmorUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  appendUltimateStarted(state, attacker);
  const previousBonus = Math.max(0, attacker.armorUltimateDefenseBonus);
  const defenseWithoutOwnBuff = attacker.defense - previousBonus;
  const newBonus = Math.max(0, defenseWithoutOwnBuff) * ARMOR_ULTIMATE_DEFENSE_BONUS_RATIO;
  attacker.armorUltimateDefenseBonus = newBonus;
  attacker.armorUltimateExpiresAfterActionTurn = getSourceActionTurnExpiry(state, attacker, ARMOR_ULTIMATE_ACTION_TURNS);
  attacker.defense = defenseWithoutOwnBuff + newBonus;
  appendEvent(state, "ultimate_buff", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [attacker.instanceId],
    amount: newBonus,
    buffKind: "defense",
    durationActionTurns: ARMOR_ULTIMATE_ACTION_TURNS,
    remainingActionTurns: ARMOR_ULTIMATE_ACTION_TURNS,
    durationClock: "source_action_turn",
    ultimateId: attacker.ultimateId,
    side: attacker.side,
  });
  return true;
}

function resolveCommandoUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  if (livingUnits(state, otherBattleSide(attacker.side)).length === 0) return false;
  appendUltimateStarted(state, attacker);
  for (let hitIndex = 1; hitIndex <= COMMANDO_ULTIMATE_MAX_HITS; hitIndex += 1) {
    if (state.outcome) break;
    const selection = selectCommandoUltimateTarget(state.units, attacker, state.rngState);
    state.rngState = selection.rngState;
    const target = selection.target ? findUnit(state, selection.target.instanceId) : null;
    if (!target || !isUnitAlive(target)) break;
    const missingHp = Math.max(0, target.maxHp - target.hp);
    const rawDamage =
      Math.max(0, attacker.attack) * COMMANDO_ULTIMATE_ATTACK_RATIO +
      missingHp * COMMANDO_ULTIMATE_MISSING_HP_RATIO;
    const result = applyUltimateDamageInPlace(state, attacker, target, rawDamage, hitIndex);
    if (!result.killed) break;
    if (
      state.outcome ||
      hitIndex >= COMMANDO_ULTIMATE_MAX_HITS ||
      livingUnits(state, otherBattleSide(attacker.side)).length === 0
    ) break;
    appendEvent(state, "ultimate_kill_chain", {
      sourceUnitId: attacker.instanceId,
      targetUnitIds: [target.instanceId],
      amount: hitIndex,
      hitIndex,
      ultimateId: attacker.ultimateId,
      side: attacker.side,
    });
  }
  return true;
}

function resolveMedicUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  if (attacker.isBoss && attacker.troopType === "medic") {
    if (!isUnitAlive(attacker)) return false;
    appendUltimateStarted(state, attacker);
    cleanseDebuffsInPlace(state, attacker, attacker);
    applyHealInPlace(
      state,
      attacker,
      attacker,
      attacker.maxHp * MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO,
      attacker.ultimateId
    );
    return true;
  }
  const selection = selectMedicUltimateTargets(state.units, attacker, state.rngState);
  state.rngState = selection.rngState;
  if (selection.targets.length === 0) return false;
  appendUltimateStarted(state, attacker);
  for (const selected of selection.targets) {
    const target = findUnit(state, selected.instanceId);
    if (!target || !isUnitAlive(target)) continue;
    // Cứu Thương cleanses first, so a healing-reduction debuff cannot reduce this emergency heal.
    cleanseDebuffsInPlace(state, attacker, target);
    applyHealInPlace(
      state,
      attacker,
      target,
      attacker.maxHp * MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO,
      attacker.ultimateId
    );
  }
  return true;
}

function resolveAntiTankUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const selection = selectTarget(state.units, attacker, state.rngState);
  state.rngState = selection.rngState;
  const target = selection.target ? findUnit(state, selection.target.instanceId) : null;
  if (!target || !isUnitAlive(target)) return false;
  appendUltimateStarted(state, attacker);
  const maxHpRaw = Math.max(0, target.maxHp) * ANTI_TANK_ULTIMATE_MAX_HP_RATIO;
  const maxHpComponent = target.isBoss
    ? Math.min(maxHpRaw, Math.max(0, attacker.attack) * COMBAT_CONFIG.passives.antiTankCurrentAttackCap)
    : maxHpRaw;
  const rawDamage = Math.max(0, attacker.attack) * ANTI_TANK_ULTIMATE_ATTACK_RATIO + maxHpComponent;
  applyUltimateDamageInPlace(state, attacker, target, rawDamage, 1);
  if (isUnitAlive(target)) applyAntiTankDefenseDownInPlace(state, attacker, target);
  return true;
}

function resolveEngineerUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  appendUltimateStarted(state, attacker);
  const missingHp = Math.max(0, attacker.maxHp - attacker.hp);
  applyHealInPlace(state, attacker, attacker, missingHp * ENGINEER_ULTIMATE_HEAL_MISSING_HP_RATIO, attacker.ultimateId);
  const status: BattleStatus = {
    id: `engineer_ultimate_toughness:${attacker.instanceId}`,
    sourceUnitId: attacker.instanceId,
    type: "engineer_toughness",
    polarity: "buff",
    cleansable: false,
    stackPolicy: "refresh",
    ...sourceClockFields(state, attacker, 1),
    reflectRatioOverride: ENGINEER_ULTIMATE_REFLECT_RATIO,
  };
  replaceStatusInPlace(attacker, status);
  appendEvent(state, "taunt_applied", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [attacker.instanceId],
    side: attacker.side,
    statusId: status.id,
    statusType: status.type,
    durationActionTurns: 1,
    remainingActionTurns: 1,
    durationClock: "source_action_turn",
  });
  appendEvent(state, "reflect_buff_applied", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [attacker.instanceId],
    amount: ENGINEER_ULTIMATE_REFLECT_RATIO,
    side: attacker.side,
    statusId: status.id,
    statusType: status.type,
    durationActionTurns: 1,
    remainingActionTurns: 1,
    durationClock: "source_action_turn",
  });
  return true;
}

export function selectAirForceUltimateTarget(
  units: readonly BattleUnit[],
  attacker: BattleUnit,
  rngState: number
): TargetSelectionResult {
  const forced = forcedTauntTarget(units, attacker);
  if (forced) return { target: forced, rngState };
  const remembered = attacker.lastDamagedEnemyId
    ? units.find((unit) => unit.instanceId === attacker.lastDamagedEnemyId && unit.side !== attacker.side && isUnitAlive(unit)) ?? null
    : null;
  if (remembered) return { target: remembered, rngState };
  return selectTarget(units, attacker, rngState);
}

function resolveAirForceUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const selection = selectAirForceUltimateTarget(state.units, attacker, state.rngState);
  state.rngState = selection.rngState;
  const target = selection.target ? findUnit(state, selection.target.instanceId) : null;
  if (!target || !isUnitAlive(target)) return false;
  appendUltimateStarted(state, attacker);
  const stacks = Math.max(0, Math.min(COMBAT_CONFIG.passives.maxGrowthStacks, attacker.passiveStacks));
  const ultimateRatio = AIR_FORCE_ULTIMATE_BASE_ATTACK_RATIO + stacks * AIR_FORCE_ULTIMATE_ATTACK_RATIO_PER_STACK;
  applyUltimateDamageInPlace(state, attacker, target, Math.max(0, attacker.attack) * ultimateRatio, 1);
  return true;
}

function resolveChemicalUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const targets = livingUnits(state, otherBattleSide(attacker.side));
  if (targets.length === 0) return false;
  appendUltimateStarted(state, attacker);
  const rawDamage = Math.max(0, attacker.attack) * CHEMICAL_ULTIMATE_ATTACK_RATIO;
  for (const selected of targets) {
    if (state.outcome) break;
    const target = findUnit(state, selected.instanceId);
    if (!target || !isUnitAlive(target)) continue;
    applyUltimateDamageInPlace(state, attacker, target, rawDamage, 1, false);
    if (isUnitAlive(target) && rollInPlace(state) < CHEMICAL_ULTIMATE_STUN_CHANCE) {
      applyStunInPlace(state, attacker, target, CHEMICAL_ULTIMATE_STUN_ACTIONS);
    }
  }
  settleOutcomeInPlace(state);
  return true;
}

function resolveGuardUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const targets = livingUnits(state, attacker.side);
  if (targets.length === 0) return false;
  appendUltimateStarted(state, attacker);
  const amount = Math.max(0, attacker.maxHp) * GUARD_ULTIMATE_SHIELD_MAX_HP_RATIO;
  const durationFields = sourceClockShieldFields(state, attacker, GUARD_ULTIMATE_SHIELD_ACTION_TURNS);
  for (const target of targets) {
    applyShieldInPlace(state, attacker, target, amount, { kind: "guard_ultimate", ...durationFields }, attacker.ultimateId);
  }
  return true;
}

function resolvePioneerUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const selection = selectPioneerUltimateTarget(state.units, attacker, state.rngState);
  state.rngState = selection.rngState;
  const target = selection.target ? findUnit(state, selection.target.instanceId) : null;
  if (!target || !isUnitAlive(target)) return false;
  appendUltimateStarted(state, attacker);
  applyUltimateDamageInPlace(
    state,
    attacker,
    target,
    Math.max(0, attacker.attack) * PIONEER_ULTIMATE_ATTACK_RATIO,
    1
  );
  if (isUnitAlive(target) && rollInPlace(state) < PIONEER_ULTIMATE_STUN_CHANCE) {
    applyStunInPlace(state, attacker, target, PIONEER_ULTIMATE_STUN_ACTIONS);
  }
  return true;
}

function advanceTimelineUnitInPlace(
  state: BattleState,
  source: BattleUnit,
  target: BattleUnit,
  remainingMultiplier: number,
  message: string
): void {
  const remaining = Math.max(0, target.nextActionAt - state.timelineTime);
  const nextRemaining = remaining * Math.max(0, Math.min(1, remainingMultiplier));
  target.nextActionAt = state.timelineTime + nextRemaining;
  appendEvent(state, "timeline_advanced", {
    sourceUnitId: source.instanceId,
    targetUnitIds: [target.instanceId],
    amount: remaining - nextRemaining,
    nextActionAt: target.nextActionAt,
    side: source.side,
    message,
  });
}

function resolveScoutUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const allies = livingUnits(state, attacker.side).sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  if (allies.length === 0) return false;
  appendUltimateStarted(state, attacker);
  for (const ally of allies) {
    advanceTimelineUnitInPlace(state, attacker, ally, SCOUT_ULTIMATE_TIMELINE_MULTIPLIER, "MỞ ĐƯỜNG");
  }
  return true;
}

function selectRememberedTarget(state: BattleState, attacker: BattleUnit): TargetSelectionResult {
  const remembered = attacker.lastDamagedEnemyId
    ? state.units.find((unit) => unit.instanceId === attacker.lastDamagedEnemyId && unit.side !== attacker.side && isUnitAlive(unit)) ?? null
    : null;
  return remembered ? { target: remembered, rngState: state.rngState } : selectTarget(state.units, attacker, state.rngState);
}

function resolveMarksmanUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const selection = selectRememberedTarget(state, attacker);
  state.rngState = selection.rngState;
  const target = selection.target ? findUnit(state, selection.target.instanceId) : null;
  if (!target || !isUnitAlive(target)) return false;
  appendUltimateStarted(state, attacker);
  const execute = target.hp / Math.max(EPSILON, target.maxHp) < MARKSMAN_ULTIMATE_EXECUTE_HP_THRESHOLD;
  const ratio = execute ? MARKSMAN_ULTIMATE_EXECUTE_ATTACK_RATIO : MARKSMAN_ULTIMATE_ATTACK_RATIO;
  applyUltimateDamageInPlace(state, attacker, target, Math.max(0, attacker.attack) * ratio, 1);
  if (execute) appendEvent(state, "ultimate_vfx", { sourceUnitId: attacker.instanceId, targetUnitIds: [target.instanceId], side: attacker.side, ultimateId: attacker.ultimateId, message: "KẾT LIỄU" });
  return true;
}

function resolveElectronicUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const targets = livingUnits(state, otherBattleSide(attacker.side));
  if (targets.length === 0) return false;
  appendUltimateStarted(state, attacker);
  for (const selected of targets) {
    const target = findUnit(state, selected.instanceId);
    if (!target || !isUnitAlive(target)) continue;
    applyUltimateDamageInPlace(state, attacker, target, Math.max(0, attacker.attack) * ELECTRONIC_ULTIMATE_ATTACK_RATIO, 1, false);
    if (!isUnitAlive(target)) continue;
    const drained = Math.min(Math.max(0, target.rage), ELECTRONIC_ULTIMATE_RAGE_DRAIN);
    target.rage = Math.max(0, target.rage - ELECTRONIC_ULTIMATE_RAGE_DRAIN);
    appendEvent(state, "rage_reduced", { sourceUnitId: attacker.instanceId, targetUnitIds: [target.instanceId], amount: drained, rage: target.rage, side: attacker.side, message: "-20 NỘ" });
  }
  settleOutcomeInPlace(state);
  return true;
}

function isTrackedForSide(state: BattleState, target: BattleUnit, side: BattleSide): boolean {
  return (target.statuses ?? []).some((status) => {
    if (status.type !== "tracking") return false;
    return state.units.find((unit) => unit.instanceId === status.sourceUnitId)?.side === side;
  });
}

function applyActionTurnControlInPlace(state: BattleState, attacker: BattleUnit, target: BattleUnit, type: "silence" | "stun", actionTurns: number): void {
  const duration = Math.max(1, Math.floor(actionTurns));
  const status: BattleStatus = {
    id: `${attacker.ultimateId}_${type}:${attacker.instanceId}:${target.instanceId}`,
    sourceUnitId: attacker.instanceId,
    type,
    polarity: "debuff",
    cleansable: true,
    stackPolicy: "refresh",
    ...targetClockFields(target, duration),
    effectKind: type === "stun" ? "action_stun" : undefined,
  };
  replaceStatusInPlace(target, status);
  appendEvent(state, type === "stun" ? "stun_applied" : "silence_applied", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [target.instanceId],
    amount: duration,
    side: attacker.side,
    statusId: status.id,
    statusType: status.type,
    remainingActionTurns: duration,
    durationActionTurns: duration,
    durationClock: "target_action_turn",
    message: type === "stun" ? "CHOÁNG" : "CÂM LẶNG",
  });
}

function resolveSpecialOpsUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const targets = livingUnits(state, otherBattleSide(attacker.side));
  if (targets.length === 0) return false;
  const markedAtCast = new Set(targets.filter((target) => isTrackedForSide(state, target, attacker.side)).map((target) => target.instanceId));
  appendUltimateStarted(state, attacker);
  for (const selected of targets) {
    const target = findUnit(state, selected.instanceId);
    if (!target || !isUnitAlive(target)) continue;
    applyUltimateDamageInPlace(state, attacker, target, Math.max(0, attacker.attack) * SPECIAL_OPS_ULTIMATE_ATTACK_RATIO, 1, false);
    if (!isUnitAlive(target) || rollInPlace(state) >= SPECIAL_OPS_ULTIMATE_CONTROL_CHANCE) continue;
    applyActionTurnControlInPlace(state, attacker, target, markedAtCast.has(target.instanceId) ? "stun" : "silence", SPECIAL_OPS_ULTIMATE_CONTROL_ACTION_TURNS);
  }
  settleOutcomeInPlace(state);
  return true;
}

function resolveDivineMedicUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const targets = livingUnits(state, attacker.side);
  if (targets.length === 0) return false;
  appendUltimateStarted(state, attacker);
  const rawHeal = Math.max(0, attacker.maxHp) * DIVINE_MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO;
  for (const target of targets) applyHealInPlace(state, attacker, target, rawHeal, attacker.ultimateId);
  return true;
}

function resolveForensicUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const targets = livingUnits(state, otherBattleSide(attacker.side));
  if (targets.length === 0) return false;
  const markedAtCast = new Set(targets.filter((target) => (target.statuses ?? []).some((status) => status.type === "forensic_suppression" && status.effectKind === "forensic_passive")).map((target) => target.instanceId));
  appendUltimateStarted(state, attacker);
  for (const selected of targets) {
    const target = findUnit(state, selected.instanceId);
    if (!target || !isUnitAlive(target)) continue;
    applyUltimateDamageInPlace(state, attacker, target, Math.max(0, attacker.attack) * FORENSIC_ULTIMATE_ATTACK_RATIO, 1, false);
    if (!isUnitAlive(target)) continue;
    const multiplier = markedAtCast.has(target.instanceId) ? FORENSIC_ULTIMATE_MARKED_MULTIPLIER : FORENSIC_ULTIMATE_NORMAL_MULTIPLIER;
    const id = `forensic_ultimate:${attacker.instanceId}:${target.instanceId}`;
    target.statuses = (target.statuses ?? []).filter((status) => status.id !== id);
    const status: BattleStatus = { id, sourceUnitId: attacker.instanceId, type: "forensic_suppression", polarity: "debuff", cleansable: true, stackPolicy: "refresh", ...targetClockFields(target, FORENSIC_ULTIMATE_ACTION_TURNS), healingReceivedMultiplier: multiplier, shieldReceivedMultiplier: multiplier, effectKind: "forensic_ultimate" };
    target.statuses.push(status);
    appendEvent(state, "forensic_suppression_applied", { sourceUnitId: attacker.instanceId, targetUnitIds: [target.instanceId], amount: 1 - multiplier, side: attacker.side, statusId: status.id, statusType: status.type, durationActionTurns: FORENSIC_ULTIMATE_ACTION_TURNS, remainingActionTurns: FORENSIC_ULTIMATE_ACTION_TURNS, durationClock: "target_action_turn" });
  }
  settleOutcomeInPlace(state);
  return true;
}

function resolveMartialArtistUltimateInPlace(state: BattleState, attacker: BattleUnit): boolean {
  const selection = selectHighestCurrentAttackTarget(state.units, attacker, state.rngState);
  state.rngState = selection.rngState;
  const target = selection.target ? findUnit(state, selection.target.instanceId) : null;
  if (!target || !isUnitAlive(target)) return false;

  const stance = getMartialArtistUltimateStance(attacker);
  appendUltimateStarted(state, attacker);
  const ratio = stance === "giang_long"
    ? MARTIAL_ARTIST_GIANG_LONG_ATTACK_RATIO
    : MARTIAL_ARTIST_PHI_LONG_ATTACK_RATIO;
  applyUltimateDamageInPlace(state, attacker, target, Math.max(0, attacker.attack) * ratio, 1);
  if (stance === "giang_long" && isUnitAlive(target)) {
    dispelAllBeneficialEffectsInPlace(state, attacker, target);
  }

  const nextStance: MartialArtistUltimateStance = stance === "phi_long" ? "giang_long" : "phi_long";
  attacker.martialArtistUltimateStance = nextStance;
  appendEvent(state, "martial_artist_stance_changed", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [attacker.instanceId],
    side: attacker.side,
    martialArtistStance: nextStance,
    message: getMartialArtistUltimateName(nextStance),
  });
  return true;
}

function resolveUltimateActionInPlace(state: BattleState, attacker: BattleUnit): void {
  if (!canUseUltimateAction(state, attacker)) return;

  beginDamageSequenceInPlace(state, attacker, "ultimate");
  let cast = false;
  if (attacker.troopType === "infantry") cast = resolveInfantryUltimateInPlace(state, attacker);
  else if (attacker.troopType === "artillery") cast = resolveArtilleryUltimateInPlace(state, attacker);
  else if (attacker.troopType === "armor") cast = resolveArmorUltimateInPlace(state, attacker);
  else if (attacker.troopType === "commando") cast = resolveCommandoUltimateInPlace(state, attacker);
  else if (attacker.troopType === "medic") cast = resolveMedicUltimateInPlace(state, attacker);
  else if (attacker.troopType === "anti_tank") cast = resolveAntiTankUltimateInPlace(state, attacker);
  else if (attacker.troopType === "engineer") cast = resolveEngineerUltimateInPlace(state, attacker);
  else if (attacker.troopType === "chemical") cast = resolveChemicalUltimateInPlace(state, attacker);
  else if (attacker.troopType === "air_force") cast = resolveAirForceUltimateInPlace(state, attacker);
  else if (attacker.troopType === "guard") cast = resolveGuardUltimateInPlace(state, attacker);
  else if (attacker.troopType === "pioneer") cast = resolvePioneerUltimateInPlace(state, attacker);
  else if (attacker.troopType === "scout") cast = resolveScoutUltimateInPlace(state, attacker);
  else if (attacker.troopType === "marksman") cast = resolveMarksmanUltimateInPlace(state, attacker);
  else if (attacker.troopType === "electronic_warfare") cast = resolveElectronicUltimateInPlace(state, attacker);
  else if (attacker.troopType === "special_ops") cast = resolveSpecialOpsUltimateInPlace(state, attacker);
  else if (attacker.troopType === "divine_medic") cast = resolveDivineMedicUltimateInPlace(state, attacker);
  else if (attacker.troopType === "forensic_medic") cast = resolveForensicUltimateInPlace(state, attacker);
  else if (attacker.troopType === "martial_artist") cast = resolveMartialArtistUltimateInPlace(state, attacker);
  endDamageSequenceInPlace(state);
  if (!cast) return;

  appendEvent(state, "ultimate_completed", {
    sourceUnitId: attacker.instanceId,
    side: attacker.side,
    rage: 0,
    ultimateRageRequired: attacker.ultimateRageRequired,
    ultimateId: attacker.ultimateId,
  });
  appendEvent(state, "ultimate_resolved", {
    sourceUnitId: attacker.instanceId,
    side: attacker.side,
    rage: 0,
    ultimateRageRequired: attacker.ultimateRageRequired,
    ultimateId: attacker.ultimateId,
  });
}

/** Resolve only the pending Ultimate stage. Invalid/no-target casts preserve Rage. */
export function resolveUltimateAction(state: BattleState, sourceUnitId: string): BattleState {
  const next = cloneBattleState(state);
  const ownsActionContext = next.activeActionUnitId === null;
  if (ownsActionContext) next.activeActionUnitId = sourceUnitId;
  const attacker = findUnit(next, sourceUnitId);
  if (attacker) resolveUltimateActionInPlace(next, attacker);
  if (ownsActionContext) next.activeActionUnitId = null;
  return next;
}

function resolveBasicAttackActionInPlace(state: BattleState, sourceUnitId: string): void {
  if (state.outcome) return;
  const attacker = findUnit(state, sourceUnitId);
  if (!attacker || !isUnitAlive(attacker)) {
    settleOutcomeInPlace(state);
    return;
  }
  const stun = getBattleStatus(attacker, "stun");
  if (stun && isBattleStatusActive(stun, state.round)) {
    const remainingActionTurns = Math.max(0, (stun.remainingActionTurns ?? 1) - 1);
    appendEvent(state, "action_skipped_stun", {
      sourceUnitId: attacker.instanceId,
      targetUnitIds: [attacker.instanceId],
      side: attacker.side,
      statusId: stun.id,
      statusType: stun.type,
      remainingActionTurns,
      durationClock: "target_action_turn",
      actionKind: "stun_skip",
      message: "CHOÁNG · BỎ LƯỢT",
    });
    return;
  }
  const selection = selectTarget(state.units, attacker, state.rngState);
  state.rngState = selection.rngState;
  const target = selection.target ? findUnit(state, selection.target.instanceId) : null;
  if (!target) {
    settleOutcomeInPlace(state);
    return;
  }
  beginDamageSequenceInPlace(state, attacker, "basic");

  appendEvent(state, "attack", {
    sourceUnitId: attacker.instanceId,
    targetUnitIds: [target.instanceId],
    side: attacker.side,
    actionKind: "basic",
  });
  if (attacker.passiveId === "marksman_focus") {
    if (attacker.focusTargetId !== target.instanceId) {
      attacker.focusTargetId = target.instanceId;
      attacker.focusStacks = 1;
    } else {
      attacker.focusStacks = Math.min(COMBAT_CONFIG.passives.marksmanMaxFocusStacks, Math.max(0, attacker.focusStacks) + 1);
    }
  }
  const critical = rollInPlace(state) < getEffectiveCritChance(attacker, state.round);
  const focusMultiplier = attacker.passiveId === "marksman_focus"
    ? 1 + attacker.focusStacks * COMBAT_CONFIG.passives.marksmanFocusDamagePerStack
    : 1;
  const basicRaw =
    Math.max(0, attacker.attack) *
    focusMultiplier *
    (critical ? getEffectiveCritDamageMultiplier(attacker) : 1);
  const antiTankRaw = calculateAntiTankBonusRaw(attacker, target);
  const behindSlot = target.slotId.startsWith("front_")
    ? target.slotId.replace("front_", "back_")
    : null;
  const artilleryTarget = attacker.passiveId === "artillery_row_blast" && behindSlot
    ? livingUnits(state, otherBattleSide(attacker.side)).find((candidate) => candidate.slotId === behindSlot) ?? null
    : null;

  const primaryBlocked = isDamageSequenceBlockedForTarget(state, attacker, target);
  if (critical && !primaryBlocked) {
    appendEvent(state, "critical", {
      sourceUnitId: attacker.instanceId,
      targetUnitIds: [target.instanceId],
      amount: basicRaw,
      critical: true,
      side: attacker.side,
    });
  }
  applyStandardDamageInPlace(state, attacker, target, basicRaw + antiTankRaw, true, false);
  if (attacker.passiveId === "special_ops_tracking" && isUnitAlive(target)) {
    const status: BattleStatus = {
      id: `tracking:${attacker.instanceId}:${target.instanceId}`,
      sourceUnitId: attacker.instanceId,
      type: "tracking",
      polarity: "debuff",
      cleansable: false,
      stackPolicy: "replace",
    };
    replaceStatusInPlace(target, status);
    appendEvent(state, "tracking_applied", {
      sourceUnitId: attacker.instanceId,
      targetUnitIds: [target.instanceId],
      side: attacker.side,
      statusId: status.id,
      statusType: status.type,
      message: "THEO DÕI",
    });
  }
  if (artilleryTarget) {
    const splashTarget = findUnit(state, artilleryTarget.instanceId);
    if (splashTarget && isUnitAlive(splashTarget)) {
      appendEvent(state, "artillery_aoe", {
        sourceUnitId: attacker.instanceId,
        targetUnitIds: [splashTarget.instanceId],
        side: attacker.side,
      });
      const splashCritical = rollInPlace(state) < getEffectiveCritChance(attacker, state.round);
      const splashRaw = Math.max(0, attacker.attack) * COMBAT_CONFIG.passives.artilleryLineAttackRatio *
        (splashCritical ? getEffectiveCritDamageMultiplier(attacker) : 1);
      const splashBlocked = isDamageSequenceBlockedForTarget(state, attacker, splashTarget);
      if (splashCritical && !splashBlocked) {
        appendEvent(state, "critical", {
          sourceUnitId: attacker.instanceId,
          targetUnitIds: [splashTarget.instanceId],
          amount: splashRaw,
          critical: true,
          side: attacker.side,
        });
      }
      applyStandardDamageInPlace(state, attacker, splashTarget, splashRaw, false, false);
    }
  }
  endDamageSequenceInPlace(state);
  const refreshedAttacker = findUnit(state, attacker.instanceId);
  if (refreshedAttacker) gainBasicAttackRageInPlace(state, refreshedAttacker);
  settleOutcomeInPlace(state);
  if (
    !state.outcome && refreshedAttacker && isUnitAlive(refreshedAttacker) &&
    hasImplementedUltimate(refreshedAttacker.troopType) &&
    refreshedAttacker.rage >= refreshedAttacker.ultimateRageRequired
  ) {
    appendEvent(state, "ultimate_ready", {
      sourceUnitId: refreshedAttacker.instanceId,
      side: refreshedAttacker.side,
      rage: refreshedAttacker.rage,
      ultimateRageRequired: refreshedAttacker.ultimateRageRequired,
      ultimateId: refreshedAttacker.ultimateId,
    });
  }
}

/** Resolve one scheduled unit's basic attack or consumed Stun opportunity. */
export function resolveBasicAttackAction(state: BattleState, sourceUnitId: string): BattleState {
  const next = cloneBattleState(state);
  const ownsActionContext = next.activeActionUnitId === null;
  if (ownsActionContext) next.activeActionUnitId = sourceUnitId;
  resolveBasicAttackActionInPlace(next, sourceUnitId);
  if (ownsActionContext) next.activeActionUnitId = null;
  return next;
}

function resolveChemicalPassivesInPlace(state: BattleState): void {
  if (state.outcome) return;
  // Snapshot living sources and enemies at the beginning of the Chemical phase.
  // Normal deaths remain deferred until every snapshotted Chemical source fires.
  const sourceIds = livingUnits(state)
    .filter((unit) => unit.passiveId === "chemical_round_aoe")
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId))
    .map((unit) => unit.instanceId);
  const targetIdsBySource = new Map<string, string[]>(
    sourceIds.map((sourceId) => {
      const source = findUnit(state, sourceId)!;
      return [sourceId, livingUnits(state, otherBattleSide(source.side)).map((target) => target.instanceId)];
    })
  );

  for (const sourceId of sourceIds) {
    const source = findUnit(state, sourceId);
    if (!source) continue;
    const targets = (targetIdsBySource.get(sourceId) ?? [])
      .map((targetId) => findUnit(state, targetId))
      .filter((target): target is BattleUnit => Boolean(target));
    appendEvent(state, "chemical_aoe", {
      sourceUnitId: source.instanceId,
      targetUnitIds: targets.map((target) => target.instanceId),
      side: source.side,
    });
    for (const target of targets) {
      const rawDamage = Math.max(0, source.attack) * COMBAT_CONFIG.passives.chemicalAttackAoe;
      const mitigated = calculateMitigatedDamage(rawDamage, source, target, state.round);
      const applied = applyShieldAndHpDamage(target, mitigated);
      appendEvent(state, "damage", {
        sourceUnitId: source.instanceId,
        targetUnitIds: [target.instanceId],
        amount: applied.totalApplied,
        side: source.side,
        message: applied.absorbed > EPSILON ? `Khiên hấp thụ ${applied.absorbed.toFixed(1)}.` : undefined,
      });
      resolveLethalDamageInPlace(state, target, true);
      if (target.hp > EPSILON) {
        if (target.corrosionBaseDefense === null) target.corrosionBaseDefense = target.battleBaseDefense;
        target.corrosionStacks = Math.min(
          COMBAT_CONFIG.passives.chemicalMaxDefenseReductionStacks,
          target.corrosionStacks + 1
        );
        target.defense = target.corrosionBaseDefense *
          (1 - COMBAT_CONFIG.passives.chemicalDefenseReductionPerStack * target.corrosionStacks) +
          Math.max(0, target.armorUltimateDefenseBonus) -
          phase3DefenseDownAmount(target);
        appendEvent(state, "corrosion", {
          sourceUnitId: source.instanceId,
          targetUnitIds: [target.instanceId],
          amount: target.corrosionStacks,
          side: source.side,
          message: `ĂN MÒN ${target.corrosionStacks}/3`,
        });
      }
    }
  }

  for (const unit of state.units) markDeathInPlace(state, unit);
  settleOutcomeInPlace(state);
}

export function resolveChemicalPassives(state: BattleState): BattleState {
  const next = cloneBattleState(state);
  resolveChemicalPassivesInPlace(next);
  return next;
}

function selectLowestHpAllyInPlace(
  state: BattleState,
  side: BattleSide,
  reserved: ReadonlySet<string>
): BattleUnit | null {
  const eligible = livingUnits(state, side).filter((unit) => !reserved.has(unit.instanceId));
  if (eligible.length === 0) return null;
  const minimumRatio = eligible.reduce(
    (minimum, unit) => Math.min(minimum, unit.hp / Math.max(EPSILON, unit.maxHp)),
    Number.POSITIVE_INFINITY
  );
  const tied = eligible.filter((unit) => Math.abs(unit.hp / Math.max(EPSILON, unit.maxHp) - minimumRatio) <= EPSILON);
  if (tied.length === 1) return tied[0];
  const index = Math.min(tied.length - 1, Math.floor(rollInPlace(state) * tied.length));
  return tied[index];
}

function resolveGuardPassivesInPlace(state: BattleState): void {
  const allGuardIds = state.units
    .filter((unit) => unit.passiveId === "guard_lowest_hp_shield")
    .map((unit) => unit.instanceId);
  // Passive refresh only replaces passive Guard shields. Ultimate shields from
  // the same source keep their independent source/kind/expiry entries.
  for (const guardId of allGuardIds) removeSourceShieldsInPlace(state, guardId, "guard");

  for (const side of ["player", "enemy"] as const) {
    const guards = livingUnits(state, side)
      .filter((unit) => unit.passiveId === "guard_lowest_hp_shield")
      .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
    const reserved = new Set<string>();
    for (const guard of guards) {
      const target = selectLowestHpAllyInPlace(state, side, reserved);
      if (!target) continue;
      reserved.add(target.instanceId);
      const amount = guard.maxHp * COMBAT_CONFIG.passives.guardSourceMaxHpShield;
      applyShieldInPlace(state, guard, target, amount, { kind: "guard" });
    }
  }
}

export function resolveGuardPassives(state: BattleState): BattleState {
  const next = cloneBattleState(state);
  if (!next.outcome) resolveGuardPassivesInPlace(next);
  return next;
}

function selectLowestHpUnitInPlace(state: BattleState, side: BattleSide): BattleUnit | null {
  return selectLowestHpAllyInPlace(state, side, new Set<string>());
}

function resolveDivineMedicPassivesInPlace(state: BattleState): void {
  const sources = livingUnits(state)
    .filter((unit) => unit.passiveId === "divine_medic_rescue")
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  for (const source of sources) {
    for (const unit of state.units) {
      unit.statuses = (unit.statuses ?? []).filter(
        (status) => !(status.type === "rescue" && status.sourceUnitId === source.instanceId)
      );
    }
    const target = selectLowestHpUnitInPlace(state, source.side);
    if (!target) continue;
    const status: BattleStatus = {
      id: `rescue:${source.instanceId}:${target.instanceId}`,
      sourceUnitId: source.instanceId,
      type: "rescue",
      polarity: "buff",
      cleansable: false,
      stackPolicy: "refresh",
      ...sourceClockFields(state, source, 1),
      damageReceivedMultiplier: COMBAT_CONFIG.passives.divineMedicDamageMultiplier,
    };
    replaceStatusByIdInPlace(target, status);
    appendEvent(state, "rescue_applied", { sourceUnitId: source.instanceId, targetUnitIds: [target.instanceId], amount: 1 - COMBAT_CONFIG.passives.divineMedicDamageMultiplier, side: source.side, statusId: status.id, statusType: status.type, durationActionTurns: 1, remainingActionTurns: 1, durationClock: "source_action_turn", message: "CỨU RỖI" });
  }
}

function resolveForensicPassivesInPlace(state: BattleState): void {
  const sources = livingUnits(state)
    .filter((unit) => unit.passiveId === "forensic_medic_suppression")
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  for (const source of sources) {
    for (const unit of state.units) {
      unit.statuses = (unit.statuses ?? []).filter((status) => !(status.type === "forensic_suppression" && status.effectKind === "forensic_passive" && status.sourceUnitId === source.instanceId));
    }
    const target = selectLowestHpUnitInPlace(state, otherBattleSide(source.side));
    if (!target) continue;
    const id = `forensic_passive:${source.instanceId}:${target.instanceId}`;
    const status: BattleStatus = {
      id,
      sourceUnitId: source.instanceId,
      type: "forensic_suppression",
      polarity: "debuff",
      cleansable: true,
      stackPolicy: "refresh",
      ...sourceClockFields(state, source, 1),
      healingReceivedMultiplier: COMBAT_CONFIG.passives.forensicPassiveMultiplier,
      shieldReceivedMultiplier: COMBAT_CONFIG.passives.forensicPassiveMultiplier,
      effectKind: "forensic_passive",
    };
    target.statuses.push(status);
    appendEvent(state, "forensic_suppression_applied", { sourceUnitId: source.instanceId, targetUnitIds: [target.instanceId], amount: 1 - COMBAT_CONFIG.passives.forensicPassiveMultiplier, side: source.side, statusId: status.id, statusType: status.type, durationActionTurns: 1, remainingActionTurns: 1, durationClock: "source_action_turn", message: "MÙI MÁU" });
  }
}

function resolveScoutPassivesInPlace(state: BattleState): void {
  const sources = livingUnits(state)
    .filter((unit) => unit.passiveId === "scout_timeline_advance")
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  for (const source of sources) {
    const allies = livingUnits(state, source.side);
    if (allies.length === 0) continue;
    const farthest = allies.reduce((maximum, unit) => Math.max(maximum, Math.max(0, unit.nextActionAt - state.timelineTime)), 0);
    const tied = allies
      .filter((unit) => Math.abs(Math.max(0, unit.nextActionAt - state.timelineTime) - farthest) <= EPSILON)
      .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
    const chosen = chooseSeeded(tied, state.rngState);
    state.rngState = chosen.rngState;
    advanceTimelineUnitInPlace(state, source, chosen.value, 1 - COMBAT_CONFIG.passives.scoutTimelineAdvance, "DẪN ĐƯỜNG");
  }
}

function resolveGrowthPassivesInPlace(state: BattleState): void {
  const growers = livingUnits(state)
    .filter((unit) => unit.passiveId === "air_force_attack_growth")
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  for (const unit of growers) {
    unit.passiveStacks = Math.min(COMBAT_CONFIG.passives.maxGrowthStacks, unit.passiveStacks + 1);
    unit.attack = unit.battleBaseAttack *
      (1 + unit.passiveStacks * COMBAT_CONFIG.passives.airForceAttackPerStack);
    appendEvent(state, "passive_growth", {
      sourceUnitId: unit.instanceId,
      targetUnitIds: [unit.instanceId],
      amount: unit.passiveStacks,
      side: unit.side,
      message: `THỐNG TRỊ BẦU TRỜI ${unit.passiveStacks}/10`,
    });
  }
}

export function resolveGrowthPassives(state: BattleState): BattleState {
  const next = cloneBattleState(state);
  if (!next.outcome) resolveGrowthPassivesInPlace(next);
  return next;
}

function resolveChemicalPassiveForSourceInPlace(state: BattleState, source: BattleUnit): void {
  const targets = livingUnits(state, otherBattleSide(source.side));
  appendEvent(state, "chemical_aoe", {
    sourceUnitId: source.instanceId,
    targetUnitIds: targets.map((target) => target.instanceId),
    side: source.side,
  });
  for (const target of targets) {
    const rawDamage = Math.max(0, source.attack) * COMBAT_CONFIG.passives.chemicalAttackAoe;
    const mitigated = calculateMitigatedDamage(rawDamage, source, target, state.round);
    const applied = applyShieldAndHpDamage(target, mitigated);
    appendEvent(state, "damage", {
      sourceUnitId: source.instanceId,
      targetUnitIds: [target.instanceId],
      amount: applied.totalApplied,
      side: source.side,
      message: applied.absorbed > EPSILON ? `Khiên hấp thụ ${applied.absorbed.toFixed(1)}.` : undefined,
    });
    resolveLethalDamageInPlace(state, target, true);
    if (target.hp > EPSILON) {
      if (target.corrosionBaseDefense === null) target.corrosionBaseDefense = target.battleBaseDefense;
      target.corrosionStacks = Math.min(
        COMBAT_CONFIG.passives.chemicalMaxDefenseReductionStacks,
        target.corrosionStacks + 1
      );
      target.defense = target.corrosionBaseDefense *
        (1 - COMBAT_CONFIG.passives.chemicalDefenseReductionPerStack * target.corrosionStacks) +
        Math.max(0, target.armorUltimateDefenseBonus) -
        phase3DefenseDownAmount(target);
      appendEvent(state, "corrosion", {
        sourceUnitId: source.instanceId,
        targetUnitIds: [target.instanceId],
        amount: target.corrosionStacks,
        side: source.side,
        message: `ĂN MÒN ${target.corrosionStacks}/3`,
      });
    }
  }
  for (const target of targets) markDeathInPlace(state, target);
  settleOutcomeInPlace(state);
}

function resolveMedicCasualtyCareForSourceInPlace(state: BattleState, source: BattleUnit): void {
  const baseHeal = Math.max(0, source.maxHp) * COMBAT_CONFIG.passives.medicSourceMaxHpTeamHeal;
  for (const ally of livingUnits(state, source.side).sort((left, right) => left.instanceId.localeCompare(right.instanceId))) {
    applyHealInPlace(state, source, ally, baseHeal, undefined, {
      emitAtFullHealth: true,
      message: "CỨU THƯƠNG",
    });
  }
}

function resolveGuardPassiveForSourceInPlace(state: BattleState, source: BattleUnit): void {
  removeSourceShieldsInPlace(state, source.instanceId, "guard");
  const target = selectLowestHpAllyInPlace(state, source.side, new Set<string>());
  if (!target) return;
  applyShieldInPlace(
    state,
    source,
    target,
    source.maxHp * COMBAT_CONFIG.passives.guardSourceMaxHpShield,
    { kind: "guard" }
  );
}

function resolveDivineMedicPassiveForSourceInPlace(state: BattleState, source: BattleUnit): void {
  for (const unit of state.units) {
    unit.statuses = (unit.statuses ?? []).filter(
      (status) => !(status.type === "rescue" && status.sourceUnitId === source.instanceId)
    );
  }
  const target = selectLowestHpUnitInPlace(state, source.side);
  if (!target) return;
  const status: BattleStatus = {
    id: `rescue:${source.instanceId}:${target.instanceId}`,
    sourceUnitId: source.instanceId,
    type: "rescue",
    polarity: "buff",
    cleansable: false,
    stackPolicy: "refresh",
    ...sourceClockFields(state, source, 1),
    damageReceivedMultiplier: COMBAT_CONFIG.passives.divineMedicDamageMultiplier,
  };
  replaceStatusByIdInPlace(target, status);
  appendEvent(state, "rescue_applied", {
    sourceUnitId: source.instanceId,
    targetUnitIds: [target.instanceId],
    amount: 1 - COMBAT_CONFIG.passives.divineMedicDamageMultiplier,
    side: source.side,
    statusId: status.id,
    statusType: status.type,
    durationActionTurns: 1,
    remainingActionTurns: 1,
    durationClock: "source_action_turn",
    message: "CỨU RỖI",
  });
}

function resolveForensicPassiveForSourceInPlace(state: BattleState, source: BattleUnit): void {
  for (const unit of state.units) {
    unit.statuses = (unit.statuses ?? []).filter(
      (status) => !(status.type === "forensic_suppression" && status.effectKind === "forensic_passive" && status.sourceUnitId === source.instanceId)
    );
  }
  const target = selectLowestHpUnitInPlace(state, otherBattleSide(source.side));
  if (!target) return;
  const status: BattleStatus = {
    id: `forensic_passive:${source.instanceId}:${target.instanceId}`,
    sourceUnitId: source.instanceId,
    type: "forensic_suppression",
    polarity: "debuff",
    cleansable: true,
    stackPolicy: "refresh",
    ...sourceClockFields(state, source, 1),
    healingReceivedMultiplier: COMBAT_CONFIG.passives.forensicPassiveMultiplier,
    shieldReceivedMultiplier: COMBAT_CONFIG.passives.forensicPassiveMultiplier,
    effectKind: "forensic_passive",
  };
  replaceStatusByIdInPlace(target, status);
  appendEvent(state, "forensic_suppression_applied", {
    sourceUnitId: source.instanceId,
    targetUnitIds: [target.instanceId],
    amount: 1 - COMBAT_CONFIG.passives.forensicPassiveMultiplier,
    side: source.side,
    statusId: status.id,
    statusType: status.type,
    durationActionTurns: 1,
    remainingActionTurns: 1,
    durationClock: "source_action_turn",
    message: "MÙI MÁU",
  });
}

function resolveScoutPassiveForSourceInPlace(state: BattleState, source: BattleUnit): void {
  const allies = livingUnits(state, source.side);
  if (allies.length === 0) return;
  const farthest = allies.reduce(
    (maximum, unit) => Math.max(maximum, Math.max(0, unit.nextActionAt - state.timelineTime)),
    0
  );
  const tied = allies
    .filter((unit) => Math.abs(Math.max(0, unit.nextActionAt - state.timelineTime) - farthest) <= EPSILON)
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  const chosen = chooseSeeded(tied, state.rngState);
  state.rngState = chosen.rngState;
  advanceTimelineUnitInPlace(
    state,
    source,
    chosen.value,
    1 - COMBAT_CONFIG.passives.scoutTimelineAdvance,
    "DẪN ĐƯỜNG"
  );
}

function resolveGrowthPassiveForSourceInPlace(state: BattleState, source: BattleUnit): void {
  source.passiveStacks = Math.min(COMBAT_CONFIG.passives.maxGrowthStacks, source.passiveStacks + 1);
  source.attack = source.battleBaseAttack *
    (1 + source.passiveStacks * COMBAT_CONFIG.passives.airForceAttackPerStack);
  appendEvent(state, "passive_growth", {
    sourceUnitId: source.instanceId,
    targetUnitIds: [source.instanceId],
    amount: source.passiveStacks,
    side: source.side,
    message: `THỐNG TRỊ BẦU TRỜI ${source.passiveStacks}/10`,
  });
}

function expireSourceActionTurnEffectsInPlace(state: BattleState, source: BattleUnit): void {
  for (const target of state.units) {
    const statuses = [...(target.statuses ?? [])].filter(
      (status) => status.durationClock === "source_action_turn" && status.sourceUnitId === source.instanceId
    );
    for (const status of statuses) {
      const expires = status.expiresAfterSourceActionTurn ?? source.actionTurnCount;
      status.remainingActionTurns = Math.max(0, expires - source.actionTurnCount);
      if (source.actionTurnCount >= expires) removeTimedStatusInPlace(state, target, status);
    }

    const expiredShields = target.shields.filter((shield) => {
      if (shield.durationClock !== "source_action_turn" || shield.sourceUnitId !== source.instanceId) return false;
      const expires = shield.expiresAfterSourceActionTurn ?? source.actionTurnCount;
      shield.remainingActionTurns = Math.max(0, expires - source.actionTurnCount);
      return source.actionTurnCount >= expires;
    });
    if (expiredShields.length > 0) {
      const expiredIds = new Set(expiredShields);
      target.shields = target.shields.filter((shield) => !expiredIds.has(shield));
      for (const shield of expiredShields) {
        appendEvent(state, "shield_removed", {
          sourceUnitId: shield.sourceUnitId,
          targetUnitIds: [target.instanceId],
          amount: shield.amount,
          side: target.side,
        });
      }
    }
  }

  if (
    source.armorUltimateDefenseBonus > EPSILON &&
    source.armorUltimateExpiresAfterActionTurn !== null &&
    source.actionTurnCount >= source.armorUltimateExpiresAfterActionTurn
  ) {
    const removed = source.armorUltimateDefenseBonus;
    source.defense -= removed;
    source.armorUltimateDefenseBonus = 0;
    source.armorUltimateExpiresAfterActionTurn = null;
    appendEvent(state, "ultimate_buff", {
      sourceUnitId: source.instanceId,
      targetUnitIds: [source.instanceId],
      amount: removed,
      buffKind: "defense_expired",
      ultimateId: source.ultimateId,
      side: source.side,
    });
  }
}

function expireTargetActionTurnEffectsInPlace(state: BattleState, target: BattleUnit): void {
  const statuses = [...(target.statuses ?? [])].filter(
    (status) => status.durationClock === "target_action_turn"
  );
  for (const status of statuses) {
    const expires = status.expiresAfterTargetActionTurn ?? target.actionTurnCount;
    status.remainingActionTurns = Math.max(0, expires - target.actionTurnCount);
    if (target.actionTurnCount >= expires) removeTimedStatusInPlace(state, target, status);
  }
}

function resolveAfterOwnActionTurnPassiveInPlace(
  state: BattleState,
  source: BattleUnit,
  completedScheduledAction: boolean
): void {
  if (!isUnitAlive(source)) return;
  if (state.outcome) {
    // Cứu Thương belongs to the consumed Action Turn itself, so a surviving
    // Quân Y still completes the heal when its own in-flight action ends the
    // battle. No unit may start a new passive after another source ended it.
    if (source.passiveId === "medic_casualty_care" && completedScheduledAction) {
      resolveMedicCasualtyCareForSourceInPlace(state, source);
    }
    return;
  }
  if (source.passiveId === "medic_casualty_care") {
    resolveMedicCasualtyCareForSourceInPlace(state, source);
    return;
  }
  if (source.passiveId === "chemical_round_aoe") resolveChemicalPassiveForSourceInPlace(state, source);
  else if (source.passiveId === "guard_lowest_hp_shield") resolveGuardPassiveForSourceInPlace(state, source);
  else if (source.passiveId === "divine_medic_rescue") resolveDivineMedicPassiveForSourceInPlace(state, source);
  else if (source.passiveId === "forensic_medic_suppression") resolveForensicPassiveForSourceInPlace(state, source);
  else if (source.passiveId === "scout_timeline_advance") resolveScoutPassiveForSourceInPlace(state, source);
  else if (source.passiveId === "air_force_attack_growth") resolveGrowthPassiveForSourceInPlace(state, source);
}

/** Finalize exactly one scheduled opportunity, including a Stun skip. */
export function resolveActionTurnCompletion(state: BattleState, sourceUnitId: string): BattleState {
  const next = cloneBattleState(state);
  const source = findUnit(next, sourceUnitId);
  if (!source) return next;
  source.actionTurnCount = Math.max(0, source.actionTurnCount) + 1;
  expireSourceActionTurnEffectsInPlace(next, source);
  expireTargetActionTurnEffectsInPlace(next, source);
  // The just-completed opportunity must not extend a passive that is applied
  // after completion; only the following own Action Turn owns that duration.
  const completedScheduledAction = next.activeActionUnitId === source.instanceId;
  next.activeActionUnitId = null;
  resolveAfterOwnActionTurnPassiveInPlace(next, source, completedScheduledAction);
  return next;
}

/** Global Battle Round is now lifecycle-only; skill clocks never run here. */
export function resolveEndOfRound(state: BattleState): BattleState {
  const next = cloneBattleState(state);
  if (next.outcome) return next;
  appendEvent(next, "round_ended");
  return next;
}

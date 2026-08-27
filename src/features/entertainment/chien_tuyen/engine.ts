import {
  canUseUltimateAction,
  checkBattleOutcome,
  cloneBattleState,
  getBattlePressureBonus,
  isBattleStatusActive,
  isUnitAlive,
  resolveActionTurnCompletion,
  resolveBasicAttackAction,
  resolveEndOfRound,
  resolveUltimateAction,
} from "./combatEngine";
import {
  clampTroopLevel,
  COMBAT_CONFIG,
  getActionDelay,
  getFormationRowBonus,
  TIMELINE_EPSILON,
} from "./config";
import { getTroopDefinition, getTroopStats } from "./troopCatalog";
import { getBossDefinition, getBossStats } from "./towerFloorCatalog";
import { getUltimateConfig } from "./ultimateConfig";
import { hashMatchSeed, nextSeededRandom } from "./rng";
import type {
  BattleCreateInput,
  BattleResult,
  BattleSide,
  BattleState,
  BattleUnit,
  CombatEvent,
  FormationSlotId,
  ReservedBattleUnit,
  TroopType,
} from "./types";

export interface BattleUnitInput {
  instanceId: string;
  side: BattleSide;
  troopType: TroopType;
  slotId: FormationSlotId;
  level: number;
  statMultiplier?: number;
}

export interface BattleFromUnitsInput {
  battleId: string;
  floorNumber?: number;
  matchSeed: string;
  units: readonly BattleUnit[];
}

function scaledStat(value: number, multiplier: number): number {
  return Math.max(0, Math.round(value * multiplier));
}

export function createTroopBattleUnit(input: BattleUnitInput): BattleUnit {
  const definition = getTroopDefinition(input.troopType);
  const level = clampTroopLevel(input.level);
  const stats = getTroopStats(input.troopType, level);
  const multiplier = Number.isFinite(input.statMultiplier) && (input.statMultiplier ?? 0) > 0
    ? input.statMultiplier!
    : 1;
  const maxHp = scaledStat(stats.maxHp, multiplier);
  const attack = scaledStat(stats.attack, multiplier);
  const defense = scaledStat(stats.defense, multiplier);
  const ultimate = getUltimateConfig(input.troopType);
  return {
    instanceId: input.instanceId,
    side: input.side,
    troopType: input.troopType,
    name: definition.name,
    icon: definition.icon,
    slotId: input.slotId,
    level,
    hp: maxHp,
    maxHp,
    attack,
    battleBaseAttack: attack,
    defense,
    battleBaseDefense: defense,
    critChance: stats.critChance,
    speed: stats.speed,
    nextActionAt: 0,
    actionTurnCount: 0,
    battleBaseSpeed: stats.speed,
    statReferenceAttack: attack,
    statReferenceDefense: defense,
    statReferenceCritChance: stats.critChance,
    statReferenceSpeed: stats.speed,
    targetPriority: definition.targetPriority,
    passiveId: definition.passive.id,
    passiveStacks: 0,
    lastDamagedEnemyId: null,
    focusTargetId: null,
    focusStacks: 0,
    damageMultiplier: 1,
    corrosionStacks: 0,
    corrosionBaseDefense: null,
    pioneerLastStandUsed: false,
    martialArtistGuardStacks: input.troopType === "martial_artist" ? 0 : undefined,
    martialArtistUltimateStance: input.troopType === "martial_artist" ? "phi_long" : undefined,
    rage: 0,
    ultimateRageRequired: ultimate.ultimateRageRequired,
    ultimateId: ultimate.ultimateId,
    armorUltimateDefenseBonus: 0,
    armorUltimateExpiresAfterActionTurn: null,
    statuses: [],
    shields: [],
    alive: true,
  };
}

function createPlayerUnits(units: readonly ReservedBattleUnit[]): BattleUnit[] {
  return units.map((unit) => createTroopBattleUnit({
    instanceId: unit.instanceId,
    side: "player",
    troopType: unit.troopType,
    slotId: unit.slotId,
    level: unit.level,
  }));
}

function createEnemyUnits(input: BattleCreateInput): BattleUnit[] {
  const { floor } = input;
  return floor.enemyFormation.map((assignment, index) => {
    if (!assignment.bossId) {
      return createTroopBattleUnit({
        instanceId: `enemy-f${floor.floorNumber}-unit-${index + 1}-${assignment.troopType}`,
        side: "enemy",
        troopType: assignment.troopType!,
        slotId: assignment.slotId,
        level: assignment.level,
        statMultiplier: assignment.statMultiplier,
      });
    }
    const boss = getBossDefinition(assignment.bossId);
    const stats = getBossStats(assignment.bossId, assignment.level, assignment.statMultiplier);
    const ultimate = getUltimateConfig(boss.baseTroopType);
    return {
      instanceId: `enemy-f${floor.floorNumber}-boss-${index + 1}-${boss.id}`,
      side: "enemy",
      troopType: boss.baseTroopType,
      bossId: boss.id,
      isBoss: true,
      name: boss.name,
      icon: boss.icon,
      slotId: assignment.slotId,
      level: assignment.level,
      hp: stats.maxHp,
      maxHp: stats.maxHp,
      attack: stats.attack,
      battleBaseAttack: stats.attack,
      defense: stats.defense,
      battleBaseDefense: stats.defense,
      critChance: stats.critChance,
      speed: stats.speed,
      nextActionAt: 0,
      actionTurnCount: 0,
      battleBaseSpeed: stats.speed,
      statReferenceAttack: stats.attack,
      statReferenceDefense: stats.defense,
      statReferenceCritChance: stats.critChance,
      statReferenceSpeed: stats.speed,
      targetPriority: boss.targetPriority,
      passiveId: boss.passiveId,
      passiveStacks: 0,
      lastDamagedEnemyId: null,
      focusTargetId: null,
      focusStacks: 0,
      damageMultiplier: 1,
      corrosionStacks: 0,
      corrosionBaseDefense: null,
      pioneerLastStandUsed: false,
      martialArtistGuardStacks: boss.baseTroopType === "martial_artist" ? 0 : undefined,
      martialArtistUltimateStance: boss.baseTroopType === "martial_artist" ? "phi_long" : undefined,
      rage: 0,
      ultimateRageRequired: ultimate.ultimateRageRequired,
      ultimateId: ultimate.ultimateId,
      armorUltimateDefenseBonus: 0,
      armorUltimateExpiresAfterActionTurn: null,
      statuses: [],
      shields: [],
      alive: true,
    };
  });
}

function event(
  state: Pick<BattleState, "battleId" | "round" | "events" | "activeActionId">,
  value: Omit<CombatEvent, "id" | "round">
): CombatEvent {
  return {
    id: `${state.battleId}-r${state.round}-e${state.events.length + 1}`,
    round: state.round,
    actionId: state.activeActionId ?? undefined,
    ...value,
  };
}

function settleInitialOutcome(state: BattleState): void {
  const outcome = checkBattleOutcome(state);
  if (!outcome) return;
  state.outcome = outcome;
  state.events.push(event(state, {
    type: "battle_ended",
    message: outcome === "player_victory" ? "Chiến thắng." : outcome === "enemy_victory" ? "Thất bại." : "Hòa.",
  }));
}

export function createBattleFromUnits(input: BattleFromUnitsInput): BattleState {
  const units: BattleUnit[] = input.units.map((unit): BattleUnit => {
    const ultimateRageRequired = Math.max(1, unit.ultimateRageRequired);
    return {
      ...unit,
      nextActionAt: getActionDelay(unit.speed),
      actionTurnCount: Math.max(0, Math.floor(unit.actionTurnCount ?? 0)),
      martialArtistGuardStacks: unit.troopType === "martial_artist"
        ? Math.max(0, Math.min(4, Math.floor(unit.martialArtistGuardStacks ?? 0)))
        : undefined,
      martialArtistUltimateStance: unit.troopType === "martial_artist" && unit.martialArtistUltimateStance === "giang_long"
        ? "giang_long"
        : unit.troopType === "martial_artist" ? "phi_long" : undefined,
      rage: Math.max(0, Math.min(ultimateRageRequired, unit.rage ?? 0)),
      ultimateRageRequired,
      statuses: (unit.statuses ?? []).map((status) => ({ ...status })),
      shields: (unit.shields ?? []).map((shield) => ({ ...shield })),
      alive: unit.alive && unit.hp > 0,
    };
  });
  const rngState = hashMatchSeed(input.matchSeed);
  const roundRequiredUnitIds = units.filter(isUnitAlive).map((unit) => unit.instanceId);

  const state: BattleState = {
    version: 4,
    battleId: input.battleId,
    floorNumber: input.floorNumber ?? 1,
    matchSeed: input.matchSeed,
    rngState,
    round: 1,
    timelineTime: 0,
    roundRequiredUnitIds,
    roundCompletedUnitIds: [],
    activeActionId: null,
    activeActionUnitId: null,
    activeDamageSequence: null,
    units,
    events: [],
    outcome: null,
  };
  state.events.push(event(state, {
    type: "battle_started",
    message: "TRẬN ĐẤU BẮT ĐẦU",
  }));
  settleInitialOutcome(state);
  return state;
}

export function applyFormationRowBonuses(units: readonly BattleUnit[]): BattleUnit[] {
  const next = units.map((unit) => ({
    ...unit,
    statuses: (unit.statuses ?? []).map((status) => ({ ...status })),
    shields: unit.shields.map((shield) => ({ ...shield })),
  }));
  for (const side of ["player", "enemy"] as const) {
    for (const row of ["front", "back"] as const) {
      const rowUnits = next.filter((unit) => unit.side === side && !unit.isBoss && unit.slotId.startsWith(`${row}_`));
      const bonus = getFormationRowBonus(rowUnits.length);
      for (const unit of rowUnits) {
        if (row === "front") {
          unit.defense *= 1 + bonus;
          unit.battleBaseDefense = unit.defense;
        } else {
          unit.attack *= 1 + bonus;
          unit.battleBaseAttack = unit.attack;
        }
      }
    }
  }
  return next;
}

export function createBattle(input: BattleCreateInput): BattleState {
  const units = applyFormationRowBonuses([...createPlayerUnits(input.playerUnits), ...createEnemyUnits(input)]);
  return createBattleFromUnits({
    battleId: input.battleId,
    floorNumber: input.floor.floorNumber,
    matchSeed: input.matchSeed,
    units,
  });
}

export interface TimelineSelectionResult {
  unitId: string | null;
  rngState: number;
}

export interface UpcomingActionPreview {
  unitId: string;
  side: BattleSide;
  nextActionAt: number;
  position: number;
}

/** Select the earliest living unit; effectively-equal timestamps use seeded RNG. */
export function selectNextTimelineActor(state: BattleState): TimelineSelectionResult {
  const alive = state.units.filter(isUnitAlive);
  if (alive.length === 0) return { unitId: null, rngState: state.rngState };
  const earliest = alive.reduce(
    (minimum, unit) => Math.min(minimum, unit.nextActionAt),
    Number.POSITIVE_INFINITY
  );
  const tied = alive
    .filter((unit) => Math.abs(unit.nextActionAt - earliest) <= TIMELINE_EPSILON)
    .sort((left, right) => left.instanceId.localeCompare(right.instanceId));
  if (tied.length === 1) return { unitId: tied[0].instanceId, rngState: state.rngState };
  const roll = nextSeededRandom(state.rngState);
  const index = Math.min(tied.length - 1, Math.floor(roll.value * tied.length));
  return { unitId: tied[index].instanceId, rngState: roll.state };
}

/**
 * Predict upcoming action opportunities without resolving combat or mutating the
 * real battle. Repeated units are intentional and make SPEED frequency visible.
 */
export function getUpcomingActionPreview(state: BattleState, count = 8): UpcomingActionPreview[] {
  const requested = Math.max(0, Math.min(32, Math.floor(Number.isFinite(count) ? count : 0)));
  const simulation: BattleState = {
    ...state,
    units: state.units.map((unit) => ({ ...unit })),
  };
  const preview: UpcomingActionPreview[] = [];
  for (let position = 1; position <= requested; position += 1) {
    const selection = selectNextTimelineActor(simulation);
    simulation.rngState = selection.rngState;
    if (!selection.unitId) break;
    const unit = simulation.units.find((candidate) => candidate.instanceId === selection.unitId);
    if (!unit) break;
    preview.push({
      unitId: unit.instanceId,
      side: unit.side,
      nextActionAt: unit.nextActionAt,
      position,
    });
    unit.nextActionAt += getActionDelay(unit.speed);
  }
  return preview;
}

function ensureRoundStartedInPlace(state: BattleState): void {
  const alreadyStarted = state.events.some((entry) => entry.type === "round_started" && entry.round === state.round);
  if (alreadyStarted) return;
  const pressure = getBattlePressureBonus(state.round);
  state.events.push(event(state, {
    type: "round_started",
    amount: pressure,
    message: pressure > 0 ? `Áp Lực +${Math.round(pressure * 100)}%.` : undefined,
  }));
}

function markRoundOpportunityConsumedInPlace(state: BattleState, unitId: string): void {
  if (!state.roundRequiredUnitIds.includes(unitId) || state.roundCompletedUnitIds.includes(unitId)) return;
  state.roundCompletedUnitIds.push(unitId);
}

function pruneDeadRoundRequirementsInPlace(state: BattleState): void {
  state.roundRequiredUnitIds = state.roundRequiredUnitIds.filter((unitId) => {
    const unit = state.units.find((candidate) => candidate.instanceId === unitId);
    return Boolean(unit && isUnitAlive(unit));
  });
  const required = new Set(state.roundRequiredUnitIds);
  state.roundCompletedUnitIds = state.roundCompletedUnitIds.filter((unitId) => required.has(unitId));
}

function isRoundComplete(state: BattleState): boolean {
  const completed = new Set(state.roundCompletedUnitIds);
  return state.roundRequiredUnitIds.every((unitId) => completed.has(unitId));
}

function rescheduleActorInPlace(
  state: BattleState,
  unitId: string,
  actionKind: NonNullable<CombatEvent["actionKind"]>
): void {
  const unit = state.units.find((candidate) => candidate.instanceId === unitId);
  if (!unit || !isUnitAlive(unit) || state.outcome) return;
  unit.nextActionAt += getActionDelay(unit.speed);
  state.events.push(event(state, {
    type: "timeline_reinserted",
    sourceUnitId: unit.instanceId,
    side: unit.side,
    actionKind,
    nextActionAt: unit.nextActionAt,
  }));
}

function beginNextRoundInPlace(state: BattleState): void {
  state.round += 1;
  state.roundRequiredUnitIds = state.units.filter(isUnitAlive).map((unit) => unit.instanceId);
  state.roundCompletedUnitIds = [];
}

export interface RoundActionProgress {
  completed: number;
  total: number;
}

export function getRoundActionProgress(state: BattleState): RoundActionProgress {
  const required = new Set(state.roundRequiredUnitIds);
  const completed = new Set(state.roundCompletedUnitIds.filter((unitId) => required.has(unitId)));
  return { completed: completed.size, total: required.size };
}

export interface BattleActionStages {
  afterBasic: BattleState;
  /** Ultimate effects resolved, before opportunity/round/timeline finalization. */
  afterUltimate: BattleState | null;
  afterAction: BattleState;
  sourceUnitId: string | null;
  actionKind: "basic" | "ultimate" | "basic_ultimate" | "stun_skip" | null;
  chainedUltimate: boolean;
}

/**
 * Resolve one timeline opportunity. An already-ready Ultimate casts directly;
 * otherwise a Basic may immediately continue into an Ultimate after the final
 * adjusted Rage gain. The whole chain is finalized and rescheduled exactly once.
 */
export function advanceBattleActionStages(state: BattleState): BattleActionStages {
  if (state.outcome) {
    const snapshot = cloneBattleState(state);
    return { afterBasic: snapshot, afterUltimate: null, afterAction: cloneBattleState(snapshot), sourceUnitId: null, actionKind: null, chainedUltimate: false };
  }

  let afterBasic = cloneBattleState(state);
  ensureRoundStartedInPlace(afterBasic);
  const selection = selectNextTimelineActor(afterBasic);
  afterBasic.rngState = selection.rngState;
  const sourceUnitId = selection.unitId;
  if (!sourceUnitId) {
    settleInitialOutcome(afterBasic);
    return {
      afterBasic,
      afterUltimate: null,
      afterAction: cloneBattleState(afterBasic),
      sourceUnitId: null,
      actionKind: null,
      chainedUltimate: false,
    };
  }

  const scheduledActor = afterBasic.units.find((unit) => unit.instanceId === sourceUnitId);
  if (!scheduledActor) {
    return {
      afterBasic,
      afterUltimate: null,
      afterAction: cloneBattleState(afterBasic),
      sourceUnitId: null,
      actionKind: null,
      chainedUltimate: false,
    };
  }
  afterBasic.timelineTime = scheduledActor.nextActionAt;
  const actionSequence = afterBasic.events.filter((entry) => entry.type === "action_completed").length + 1;
  afterBasic.activeActionId = `${afterBasic.battleId}-action-${actionSequence}`;
  afterBasic.activeActionUnitId = sourceUnitId;
  const stunned = scheduledActor.statuses.some(
    (status) => status.type === "stun" && isBattleStatusActive(status, afterBasic.round)
  );
  const useUltimate = !stunned && canUseUltimateAction(afterBasic, scheduledActor);
  let actionKind: NonNullable<BattleActionStages["actionKind"]>;
  let afterAction: BattleState;
  let afterUltimate: BattleState | null = null;
  let chainedUltimate = false;

  if (useUltimate) {
    actionKind = "ultimate";
    afterAction = resolveUltimateAction(afterBasic, sourceUnitId);
    afterUltimate = cloneBattleState(afterAction);
  } else {
    afterBasic = resolveBasicAttackAction(afterBasic, sourceUnitId);
    actionKind = stunned ? "stun_skip" : "basic";
    afterAction = cloneBattleState(afterBasic);
    const refreshedActor = afterBasic.units.find((unit) => unit.instanceId === sourceUnitId);
    if (!stunned && refreshedActor && canUseUltimateAction(afterBasic, refreshedActor)) {
      const chained = resolveUltimateAction(afterBasic, sourceUnitId);
      const committed = chained.events.slice(afterBasic.events.length).some((entry) => entry.type === "ultimate_started");
      if (committed) {
        chainedUltimate = true;
        actionKind = "basic_ultimate";
        afterUltimate = cloneBattleState(chained);
        afterAction = chained;
      }
    }
  }

  afterAction = resolveActionTurnCompletion(afterAction, sourceUnitId);
  const completedActor = afterAction.units.find((unit) => unit.instanceId === sourceUnitId);
  afterAction.events.push(event(afterAction, {
    type: "action_completed",
    sourceUnitId,
    side: completedActor?.side,
    actionKind,
    actionTurnCount: completedActor?.actionTurnCount,
  }));

  markRoundOpportunityConsumedInPlace(afterAction, sourceUnitId);
  pruneDeadRoundRequirementsInPlace(afterAction);
  if (afterAction.outcome) {
    afterAction.activeActionId = null;
    afterAction.activeActionUnitId = null;
    return { afterBasic, afterUltimate, afterAction, sourceUnitId, actionKind, chainedUltimate };
  }

  rescheduleActorInPlace(afterAction, sourceUnitId, actionKind);
  afterAction.activeActionId = null;
  afterAction.activeActionUnitId = null;
  if (!isRoundComplete(afterAction)) return { afterBasic, afterUltimate, afterAction, sourceUnitId, actionKind, chainedUltimate };

  afterAction = resolveEndOfRound(afterAction);
  if (afterAction.outcome) return { afterBasic, afterUltimate, afterAction, sourceUnitId, actionKind, chainedUltimate };
  beginNextRoundInPlace(afterAction);
  return { afterBasic, afterUltimate, afterAction, sourceUnitId, actionKind, chainedUltimate };
}

export function advanceBattleAction(state: BattleState): BattleState {
  return advanceBattleActionStages(state).afterAction;
}

export function advanceBattle(state: BattleState): BattleState {
  const currentRound = state.round;
  let next = cloneBattleState(state);
  let opportunities = 0;
  while (!next.outcome && next.round === currentRound) {
    next = advanceBattleAction(next);
    opportunities += 1;
    if (opportunities > 10_000) throw new Error(`Round ${currentRound} did not complete within 10000 opportunities.`);
  }
  return next;
}

export const advanceCombatRound = advanceBattle;

export function runBattle(
  initialState: BattleState,
  maxRounds = COMBAT_CONFIG.maxSimulationRounds
): BattleState {
  let state = cloneBattleState(initialState);
  let advanced = 0;
  while (!state.outcome && advanced < maxRounds) {
    state = advanceBattle(state);
    advanced += 1;
  }
  if (!state.outcome) throw new Error(`Battle did not finish within ${maxRounds} rounds.`);
  return state;
}

export function buildBattleUnitStatistics(state: BattleState): BattleResult["unitStatistics"] {
  const statistics = state.units.map((unit) => ({
    instanceId: unit.instanceId,
    side: unit.side,
    troopType: unit.troopType,
    bossId: unit.bossId,
    name: unit.name,
    icon: unit.icon,
    level: unit.level,
    damageDealt: 0,
    damageTaken: 0,
    shieldCreated: 0,
    healingDone: 0,
    actionsTaken: 0,
    ultimatesCast: 0,
    kills: 0,
    stunsApplied: 0,
    actionsDenied: 0,
    debuffsApplied: 0,
  }));
  const byId = new Map(statistics.map((entry) => [entry.instanceId, entry]));
  const lastDamageSourceByTarget = new Map<string, string>();
  const stunSourceByStatusId = new Map<string, string>();
  const hasCanonicalActionEvents = state.events.some((entry) => entry.type === "action_completed");
  for (const entry of state.events) {
    const amount = Math.max(0, entry.amount ?? 0);
    const source = entry.sourceUnitId ? byId.get(entry.sourceUnitId) : undefined;
    const target = entry.targetUnitIds?.[0] ? byId.get(entry.targetUnitIds[0]) : undefined;
    if (entry.type === "damage" || entry.type === "reflect" || entry.type === "ultimate_hit") {
      if (source) source.damageDealt += amount;
      if (target) target.damageTaken += amount;
      if (entry.sourceUnitId && entry.targetUnitIds?.[0]) lastDamageSourceByTarget.set(entry.targetUnitIds[0], entry.sourceUnitId);
    } else if (entry.type === "shield" && source) {
      source.shieldCreated += amount;
    } else if (entry.type === "heal" && source) {
      source.healingDone += amount;
    }
    if (hasCanonicalActionEvents) {
      if (entry.type === "action_completed" && source) source.actionsTaken += 1;
    } else if ((entry.type === "attack" || entry.type === "ultimate_started" || entry.type === "action_skipped_stun") && source) {
      source.actionsTaken += 1;
    }
    if (entry.type === "ultimate_started" && source) source.ultimatesCast += 1;
    if (entry.type === "stun_applied" && source) {
      source.stunsApplied += 1;
      if (entry.statusId) stunSourceByStatusId.set(entry.statusId, source.instanceId);
    }
    if (entry.type === "action_skipped_stun" && entry.statusId) {
      const controller = byId.get(stunSourceByStatusId.get(entry.statusId) ?? "");
      if (controller) controller.actionsDenied += 1;
    }
    if ((entry.type === "corrosion" || entry.type === "defense_down_applied" || entry.type === "taunt_applied" || entry.type === "tracking_applied" || entry.type === "silence_applied" || entry.type === "forensic_suppression_applied") && source) {
      source.debuffsApplied += 1;
    }
    if (entry.type === "death") {
      const deadUnitId = entry.targetUnitIds?.[0] ?? entry.sourceUnitId;
      const killer = deadUnitId ? byId.get(lastDamageSourceByTarget.get(deadUnitId) ?? "") : undefined;
      if (killer && killer.instanceId !== deadUnitId) killer.kills += 1;
    }
  }
  return statistics;
}

export function getBattleResult(state: BattleState): BattleResult | null {
  if (!state.outcome) return null;
  return {
    outcome: state.outcome,
    floorNumber: state.floorNumber,
    rounds: state.round,
    casualtyInstanceIds: state.units
      .filter((unit) => unit.side === "player" && !unit.alive)
      .map((unit) => unit.instanceId),
    survivorInstanceIds: state.units
      .filter((unit) => unit.side === "player" && unit.alive)
      .map((unit) => unit.instanceId),
    events: state.events.map((entry) => ({ ...entry, targetUnitIds: entry.targetUnitIds ? [...entry.targetUnitIds] : undefined })),
    unitStatistics: buildBattleUnitStatistics(state),
  };
}

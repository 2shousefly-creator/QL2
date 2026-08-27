import assert from "node:assert/strict";
import {
  advanceBattle,
  advanceBattleAction,
  advanceBattleActionStages,
  createBattle,
  createBattleFromUnits,
  createTroopBattleUnit,
  getBattleResult,
  getUpcomingActionPreview,
  runBattle,
  selectNextTimelineActor,
} from "./engine";
import {
  BASE_ACTION_DELAY,
  FORMATION_ROW_BONUS_TOTAL,
  getActionDelay,
  getFormationRowBonus,
  getFormationSlotsForSide,
  getSpeedFactor,
} from "./config";
import { getTowerFloor } from "./towerFloorCatalog";
import type {
  BattleSide,
  BattleState,
  BattleUnit,
  FormationSlotId,
  TroopType,
} from "./types";

const SLOTS: readonly FormationSlotId[] = [
  "front_left",
  "front_center",
  "front_right",
  "back_left",
  "back_center",
  "back_right",
];
let battleSequence = 0;

function test(name: string, run: () => void): void {
  run();
  console.log(`PASS: ${name}`);
}

function close(actual: number, expected: number, label: string, epsilon = 1e-6): void {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${label}: expected ${expected}, received ${actual}`);
}

function makeUnit(
  instanceId: string,
  side: BattleSide,
  speed: number,
  overrides: Partial<BattleUnit> = {},
  slotId: FormationSlotId = "front_left",
  troopType: TroopType = "armor"
): BattleUnit {
  const base = createTroopBattleUnit({ instanceId, side, troopType, slotId, level: 1 });
  const merged = {
    ...base,
    hp: 10_000,
    maxHp: 10_000,
    attack: 0,
    battleBaseAttack: 0,
    defense: 0,
    critChance: 0,
    speed,
    battleBaseSpeed: speed,
    ...overrides,
  };
  return {
    ...merged,
    statuses: (overrides.statuses ?? base.statuses).map((status) => ({ ...status })),
    shields: (overrides.shields ?? base.shields).map((shield) => ({ ...shield })),
  };
}

function makeState(units: readonly BattleUnit[], seed = "engine-test", battleId?: string): BattleState {
  battleSequence += 1;
  return createBattleFromUnits({
    battleId: battleId ?? `engine-test-${battleSequence}`,
    matchSeed: seed,
    units,
  });
}

function findUnit(state: BattleState, instanceId: string): BattleUnit {
  const unit = state.units.find((candidate) => candidate.instanceId === instanceId);
  assert.ok(unit, `Missing unit ${instanceId}`);
  return unit;
}

function actionSources(state: BattleState): string[] {
  return state.events
    .filter((entry) => entry.type === "attack" || entry.type === "action_skipped_stun" || entry.type === "ultimate_started")
    .map((entry) => entry.sourceUnitId ?? "");
}

console.log("=== CHIEN TUYEN UNIFIED TIMELINE ENGINE TESTS ===");

test("compressed SpeedFactor and ActionDelay are canonical and clamped", () => {
  close(getSpeedFactor(30), 0.90, "SPEED30 factor");
  close(getActionDelay(30), 111.111111111, "SPEED30 delay");
  close(getSpeedFactor(40), 1, "SPEED40 factor");
  close(getActionDelay(40), 100, "SPEED40 delay");
  close(getSpeedFactor(50), 1.10, "SPEED50 factor");
  close(getActionDelay(50), 90.909090909, "SPEED50 delay");
  close(getSpeedFactor(66), 1.26, "SPEED66 factor");
  close(getActionDelay(66), 79.365079365, "SPEED66 delay");
  close(getSpeedFactor(76), 1.36, "SPEED76 factor");
  close(getActionDelay(76), 73.529411765, "SPEED76 delay");
  close(getSpeedFactor(-999), 0.75, "low clamp");
  close(getSpeedFactor(999), 1.40, "high clamp");
  close(getActionDelay(40), BASE_ACTION_DELAY, "baseline delay");
});

test("battle start initializes one shared timeline from each unit SPEED", () => {
  const state = makeState([
    makeUnit("player-slow", "player", 30),
    makeUnit("enemy-fast", "enemy", 76),
    makeUnit("player-medium", "player", 50),
  ], "initial-timeline");
  close(findUnit(state, "player-slow").nextActionAt, getActionDelay(30), "slow initial time");
  close(findUnit(state, "enemy-fast").nextActionAt, getActionDelay(76), "fast initial time");
  assert.equal(selectNextTimelineActor(state).unitId, "enemy-fast");
  assert.equal(getUpcomingActionPreview(state, 3)[0].unitId, "enemy-fast");
  assert.equal("teamSpeed" in state, false);
  assert.equal("firstTeam" in state, false);
  assert.equal("cycles" in state, false);
});

test("equal timeline timestamps use deterministic seeded ties without side bias", () => {
  const seenSides = new Set<BattleSide>();
  for (let index = 0; index < 32; index += 1) {
    const state = makeState([
      makeUnit("a-player", "player", 40),
      makeUnit("b-enemy", "enemy", 40),
    ], `timeline-tie-${index}`);
    const first = selectNextTimelineActor(state);
    const replay = selectNextTimelineActor(structuredClone(state));
    assert.deepEqual(first, replay);
    const unit = state.units.find((candidate) => candidate.instanceId === first.unitId)!;
    seenSides.add(unit.side);
  }
  assert.deepEqual(seenSides, new Set<BattleSide>(["player", "enemy"]));
});

test("one action reschedules the actor from its old timestamp with current SPEED", () => {
  const state = makeState([
    makeUnit("fast", "player", 76),
    makeUnit("slow", "enemy", 30),
  ], "reinsert");
  const oldTime = findUnit(state, "fast").nextActionAt;
  const next = advanceBattleAction(state);
  close(findUnit(next, "fast").nextActionAt, oldTime + getActionDelay(76), "reinsert timestamp");
  assert.equal(next.events.find((entry) => entry.type === "timeline_reinserted")?.sourceUnitId, "fast");
  assert.equal(next.timelineTime, oldTime);
});

test("timeline preview is pure, deterministic, repeats fast units and removes dead units", () => {
  const state = makeState([
    makeUnit("preview-fast", "player", 76, {}, "front_left", "commando"),
    makeUnit("preview-medium", "enemy", 40, {}, "front_left", "armor"),
    makeUnit("preview-slow", "player", 30, {}, "front_center", "armor"),
    makeUnit("preview-dead", "enemy", 76, { hp: 0, alive: false }, "front_center", "commando"),
  ], "preview-pure");
  findUnit(state, "preview-fast").nextActionAt = 10;
  findUnit(state, "preview-medium").nextActionAt = 20;
  findUnit(state, "preview-slow").nextActionAt = 100;
  findUnit(state, "preview-dead").nextActionAt = 1;
  const before = structuredClone(state);
  const first = getUpcomingActionPreview(state, 4);
  const replay = getUpcomingActionPreview(state, 4);
  assert.deepEqual(first.map((entry) => entry.unitId), ["preview-fast", "preview-medium", "preview-fast", "preview-slow"]);
  assert.deepEqual(replay, first);
  assert.deepEqual(state, before);
});

test("a fast unit can naturally act twice before the final required unit", () => {
  const state = makeState([
    makeUnit("A-fast", "player", 76, {}, "front_left", "commando"),
    makeUnit("B-medium", "enemy", 40, {}, "front_left", "armor"),
    makeUnit("C-slow", "player", 30, {}, "front_center", "armor"),
  ], "extra-action");
  findUnit(state, "A-fast").nextActionAt = 10;
  findUnit(state, "B-medium").nextActionAt = 20;
  findUnit(state, "C-slow").nextActionAt = 100;
  const resolved = advanceBattle(state);
  assert.deepEqual(actionSources(resolved), ["A-fast", "B-medium", "A-fast", "C-slow"]);
  assert.equal(resolved.round, 2);
  assert.equal(findUnit(resolved, "A-fast").rage, 20);
});

test("a required unit killed before acting is removed and never blocks round completion", () => {
  const state = makeState([
    makeUnit("killer", "player", 76, { attack: 10_000, battleBaseAttack: 10_000 }, "front_left", "infantry"),
    makeUnit("ally", "player", 40, {}, "front_center", "armor"),
    makeUnit("doomed", "enemy", 30, { hp: 1, maxHp: 1 }, "front_left", "armor"),
    makeUnit("survivor", "enemy", 30, {}, "back_left", "armor"),
  ], "death-before-action");
  findUnit(state, "killer").nextActionAt = 10;
  findUnit(state, "ally").nextActionAt = 20;
  findUnit(state, "survivor").nextActionAt = 30;
  findUnit(state, "doomed").nextActionAt = 90;
  const resolved = advanceBattle(state);
  assert.equal(findUnit(resolved, "doomed").alive, false);
  assert.ok(!actionSources(resolved).includes("doomed"));
  assert.equal(resolved.round, 2);
});

test("Stun consumes one timeline opportunity, completes the round requirement and reschedules", () => {
  const stunned = makeUnit("stunned", "enemy", 40, {
    statuses: [{
      id: "test-stun",
      sourceUnitId: "opponent",
      type: "stun",
      polarity: "debuff",
      cleansable: true,
      stackPolicy: "refresh",
      durationClock: "target_action_turn",
      appliedTargetActionTurn: 0,
      expiresAfterTargetActionTurn: 1,
      remainingActionTurns: 1,
    }],
  });
  const state = makeState([makeUnit("opponent", "player", 50), stunned], "stun-opportunity");
  findUnit(state, "opponent").nextActionAt = 10;
  findUnit(state, "stunned").nextActionAt = 20;
  const oldStunnedTime = findUnit(state, "stunned").nextActionAt;
  const resolved = advanceBattle(state);
  assert.equal(resolved.events.filter((entry) => entry.type === "action_skipped_stun").length, 1);
  close(findUnit(resolved, "stunned").nextActionAt, oldStunnedTime + getActionDelay(40), "stunned reinsert");
  assert.equal(resolved.round, 2);
});

test("round transition never resets absolute timeline timestamps", () => {
  const initial = makeState([
    makeUnit("continuous-player", "player", 50),
    makeUnit("continuous-enemy", "enemy", 30),
  ], "continuous-timeline");
  const resolved = advanceBattle(initial);
  assert.equal(resolved.round, 2);
  assert.ok(findUnit(resolved, "continuous-player").nextActionAt > getActionDelay(50));
  assert.ok(findUnit(resolved, "continuous-enemy").nextActionAt > getActionDelay(30));
  assert.ok(resolved.timelineTime > 0);
});

test("Ultimate consumes its own opportunity instead of chaining after a basic", () => {
  const ready = makeUnit("ready-infantry", "player", 76, {
    hp: 5_000,
    maxHp: 10_000,
    rage: 60,
  }, "front_left", "infantry");
  const target = makeUnit("ultimate-target", "enemy", 30);
  const state = makeState([ready, target], "ultimate-opportunity");
  const stages = advanceBattleActionStages(state);
  assert.equal(stages.actionKind, "ultimate");
  assert.equal(stages.afterAction.events.some((entry) => entry.type === "ultimate_started"), true);
  assert.equal(stages.afterAction.events.some((entry) => entry.type === "attack"), false);
  assert.equal(findUnit(stages.afterAction, ready.instanceId).rage, 0);
});

test("a basic that reaches the Rage threshold chains its Ultimate in the same opportunity", () => {
  const attacker = makeUnit("charging-infantry", "player", 76, {
    rage: 50,
    attack: 0,
  }, "front_left", "infantry");
  const target = makeUnit("charging-target", "enemy", 30);
  const state = makeState([attacker, target], "rage-next-opportunity");
  const stages = advanceBattleActionStages(state);
  assert.equal(stages.actionKind, "basic_ultimate");
  assert.equal(stages.chainedUltimate, true);
  assert.equal(findUnit(stages.afterBasic, attacker.instanceId).rage, 60);
  assert.equal(stages.afterBasic.events.some((entry) => entry.type === "ultimate_started"), false);
  assert.ok(stages.afterUltimate);
  assert.equal(stages.afterUltimate.events.some((entry) => entry.type === "ultimate_started"), true);
  assert.equal(findUnit(stages.afterAction, attacker.instanceId).rage, 0);
  assert.equal(stages.afterAction.events.filter((entry) => entry.type === "action_completed").length, 1);
  assert.equal(stages.afterAction.events.filter((entry) => entry.type === "timeline_reinserted" && entry.sourceUnitId === attacker.instanceId).length, 1);
});

test("created troop levels use the same 1-54 clamp as their stats", () => {
  assert.equal(createTroopBattleUnit({ instanceId: "low", side: "player", troopType: "infantry", slotId: "front_left", level: -5 }).level, 1);
  assert.equal(createTroopBattleUnit({ instanceId: "high", side: "player", troopType: "infantry", slotId: "front_left", level: 999 }).level, 54);
});

test("killing the last enemy ends immediately without end-of-round passives", () => {
  const resolved = advanceBattle(makeState([
    makeUnit("finisher", "player", 76, { attack: 10_000, battleBaseAttack: 10_000 }, "front_left", "commando"),
    makeUnit("last-enemy", "enemy", 30, { hp: 1, maxHp: 1 }),
  ], "immediate-end"));
  assert.equal(resolved.outcome, "player_victory");
  assert.equal(resolved.events.filter((entry) => entry.type === "attack").length, 1);
  assert.equal(resolved.events.some((entry) => entry.type === "round_ended"), false);
  assert.equal(resolved.events.some((entry) => entry.type === "passive_growth"), false);
});

test("runBattle is deterministic for one seed and never mutates input", () => {
  const initial = makeState([
    makeUnit("replay-player", "player", 50, { hp: 300, maxHp: 300, attack: 100, battleBaseAttack: 100, critChance: .15 }),
    makeUnit("replay-enemy", "enemy", 40, { hp: 300, maxHp: 300, attack: 90, battleBaseAttack: 90, critChance: .15 }),
  ], "deterministic-replay", "deterministic-replay-battle");
  const snapshot = structuredClone(initial);
  assert.deepEqual(runBattle(initial), runBattle(initial));
  assert.deepEqual(initial, snapshot);
});

test("Formation Row Bonus remains exactly 30 percent divided by row count", () => {
  assert.equal(FORMATION_ROW_BONUS_TOTAL, .30);
  assert.equal(getFormationRowBonus(1), .30);
  assert.equal(getFormationRowBonus(2), .15);
  close(getFormationRowBonus(3), .10, "three-unit row");
  const floor = getTowerFloor(1)!;
  const battle = createBattle({
    battleId: "row-regression",
    floor,
    matchSeed: "row-regression",
    playerUnits: [
      { instanceId: "front-a", troopType: "armor", level: 1, slotId: "front_left" },
      { instanceId: "front-b", troopType: "engineer", level: 1, slotId: "front_center" },
      { instanceId: "front-c", troopType: "guard", level: 1, slotId: "front_right" },
      { instanceId: "back-a", troopType: "artillery", level: 1, slotId: "back_left" },
    ],
  });
  close(findUnit(battle, "front-a").defense, findUnit(battle, "front-a").statReferenceDefense * 1.10, "front DEF");
  close(findUnit(battle, "back-a").attack, findUnit(battle, "back-a").statReferenceAttack * 1.30, "back ATK");
});

test("createBattle builds four normal enemies and exactly one Solo Boss", () => {
  const playerUnits = [{ instanceId: "reserved-player", troopType: "infantry" as const, level: 1, slotId: "front_left" as const }];
  const normal = createBattle({ battleId: "normal", floor: getTowerFloor(1)!, playerUnits, matchSeed: "normal" });
  const boss = createBattle({ battleId: "boss", floor: getTowerFloor(10)!, playerUnits, matchSeed: "boss" });
  assert.equal(normal.units.filter((unit) => unit.side === "enemy").length, 4);
  assert.equal(boss.units.filter((unit) => unit.side === "enemy").length, 1);
  assert.equal(boss.units.filter((unit) => unit.side === "enemy" && unit.isBoss).length, 1);
  assert.equal(boss.units.find((unit) => unit.side === "enemy")?.slotId, "front_center");
});

test("getBattleResult separates casualties and aggregates combat metrics", () => {
  const state = makeState([
    makeUnit("survivor", "player", 50, {}, SLOTS[0], "guard"),
    makeUnit("casualty", "player", 40, { hp: 0, alive: false }, SLOTS[1], "medic"),
    makeUnit("result-enemy", "enemy", 30),
  ]);
  state.outcome = "player_victory";
  state.events.push(
    { id: "damage", type: "damage", round: 1, sourceUnitId: "survivor", targetUnitIds: ["result-enemy"], amount: 42 },
    { id: "shield", type: "shield", round: 1, sourceUnitId: "survivor", targetUnitIds: ["survivor"], amount: 9 },
    { id: "action", type: "attack", round: 1, sourceUnitId: "survivor", targetUnitIds: ["result-enemy"] },
    { id: "ultimate", type: "ultimate_started", round: 1, sourceUnitId: "survivor", targetUnitIds: ["result-enemy"] },
    { id: "stun", type: "stun_applied", round: 1, sourceUnitId: "survivor", targetUnitIds: ["result-enemy"], statusId: "stun:survivor:result-enemy" },
    { id: "denied", type: "action_skipped_stun", round: 1, sourceUnitId: "result-enemy", targetUnitIds: ["result-enemy"], statusId: "stun:survivor:result-enemy" },
    { id: "debuff", type: "corrosion", round: 1, sourceUnitId: "survivor", targetUnitIds: ["result-enemy"], amount: 1 },
    { id: "death", type: "death", round: 1, sourceUnitId: "result-enemy", targetUnitIds: ["result-enemy"] }
  );
  const result = getBattleResult(state)!;
  assert.deepEqual(result.casualtyInstanceIds, ["casualty"]);
  assert.deepEqual(result.survivorInstanceIds, ["survivor"]);
  const source = result.unitStatistics.find((entry) => entry.instanceId === "survivor")!;
  assert.equal(source.damageDealt, 42);
  assert.equal(source.actionsTaken, 2);
  assert.equal(source.ultimatesCast, 1);
  assert.equal(source.kills, 1);
  assert.equal(source.stunsApplied, 1);
  assert.equal(source.actionsDenied, 1);
  assert.equal(source.debuffsApplied, 1);
  assert.equal(source.shieldCreated, 9);
});

test("formation slot order still faces the two teams toward each other", () => {
  assert.deepEqual(getFormationSlotsForSide("enemy").map((slot) => slot.id), ["back_left", "back_center", "back_right", "front_left", "front_center", "front_right"]);
  assert.deepEqual(getFormationSlotsForSide("player").map((slot) => slot.id), ["front_left", "front_center", "front_right", "back_left", "back_center", "back_right"]);
});

console.log("CHIEN TUYEN UNIFIED TIMELINE ENGINE TESTS PASSED");

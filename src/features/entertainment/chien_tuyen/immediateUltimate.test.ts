import assert from "node:assert/strict";
import { advanceBattleActionStages, buildBattleUnitStatistics, createBattleFromUnits, createTroopBattleUnit } from "./engine";
import {
  ULTIMATE_PREP_DURATION_MS,
  ULTIMATE_MIN_EXECUTION_DURATION_MS,
  ULTIMATE_PRESENTATION,
  getPhase3UltimateVfxDurationMs,
  getUltimateExecutionClock,
} from "./ultimatePresentation";
import type { BattleSide, BattleState, BattleUnit, FormationSlotId, TroopType } from "./types";

let sequence = 0;

function test(name: string, run: () => void): void {
  run();
  console.log(`PASS: ${name}`);
}

function makeUnit(
  instanceId: string,
  side: BattleSide,
  troopType: TroopType,
  overrides: Partial<BattleUnit> = {},
  slotId: FormationSlotId = "front_left"
): BattleUnit {
  const base = createTroopBattleUnit({ instanceId, side, troopType, slotId, level: 1 });
  return {
    ...base,
    hp: 10_000,
    maxHp: 10_000,
    attack: 0,
    battleBaseAttack: 0,
    defense: 0,
    battleBaseDefense: 0,
    critChance: 0,
    speed: side === "player" ? 76 : 30,
    battleBaseSpeed: side === "player" ? 76 : 30,
    ...overrides,
    statuses: (overrides.statuses ?? base.statuses).map((status) => ({ ...status })),
    shields: (overrides.shields ?? base.shields).map((shield) => ({ ...shield })),
  };
}

function makeState(units: readonly BattleUnit[], seed = "immediate-ultimate"): BattleState {
  sequence += 1;
  return createBattleFromUnits({ battleId: `immediate-ultimate-${sequence}`, matchSeed: seed, units });
}

function find(state: BattleState, instanceId: string): BattleUnit {
  const unit = state.units.find((candidate) => candidate.instanceId === instanceId);
  assert.ok(unit, `Missing unit ${instanceId}`);
  return unit;
}

function eventIndex(state: BattleState, type: BattleState["events"][number]["type"]): number {
  return state.events.findIndex((entry) => entry.type === type);
}

console.log("=== CHIẾN TUYẾN IMMEDIATE ULTIMATE / VFX CLOCK TESTS ===");

test("Basic -> Rage cap -> Ultimate is one opportunity with one completion and one reinsert", () => {
  const attacker = makeUnit("chain", "player", "infantry", { rage: 50 });
  const target = makeUnit("target", "enemy", "armor");
  const state = makeState([attacker, target]);
  const oldNextActionAt = find(state, attacker.instanceId).nextActionAt;
  const stages = advanceBattleActionStages(state);

  assert.equal(stages.actionKind, "basic_ultimate");
  assert.equal(stages.chainedUltimate, true);
  assert.equal(find(stages.afterBasic, attacker.instanceId).rage, 60);
  assert.ok(stages.afterUltimate);
  assert.equal(find(stages.afterUltimate, attacker.instanceId).rage, 0);
  assert.equal(find(stages.afterAction, attacker.instanceId).rage, 0);
  assert.equal(stages.afterAction.events.filter((entry) => entry.type === "attack").length, 1);
  assert.equal(stages.afterAction.events.filter((entry) => entry.type === "ultimate_started").length, 1);
  assert.equal(stages.afterAction.events.filter((entry) => entry.type === "action_completed").length, 1);
  assert.equal(stages.afterAction.events.filter((entry) => entry.type === "timeline_reinserted" && entry.sourceUnitId === attacker.instanceId).length, 1);
  assert.ok(find(stages.afterAction, attacker.instanceId).nextActionAt > oldNextActionAt);

  const started = stages.afterUltimate.events.find((entry) => entry.type === "ultimate_started")!;
  assert.equal(started.rageBefore, 60);
  assert.equal(started.rage, 0);
  const statistics = buildBattleUnitStatistics(stages.afterAction).find((entry) => entry.instanceId === attacker.instanceId)!;
  assert.equal(statistics.actionsTaken, 1);
  assert.equal(statistics.ultimatesCast, 1);
});

test("full Rage at opportunity start casts Ultimate directly without a Basic", () => {
  const attacker = makeUnit("ready", "player", "infantry", { rage: 60 });
  const stages = advanceBattleActionStages(makeState([attacker, makeUnit("target", "enemy", "armor")]));
  assert.equal(stages.actionKind, "ultimate");
  assert.equal(stages.chainedUltimate, false);
  assert.equal(stages.afterBasic.events.some((entry) => entry.type === "attack"), false);
  assert.equal(stages.afterAction.events.filter((entry) => entry.type === "ultimate_started").length, 1);
  assert.equal(stages.afterAction.events.filter((entry) => entry.type === "action_completed").length, 1);
});

test("adjusted Electronic Rage gain decides whether the chain starts", () => {
  for (const [startingRage, expectedChain] of [[51, true], [50, false]] as const) {
    const attacker = makeUnit(`interfered-${startingRage}`, "player", "infantry", { rage: startingRage });
    const jammer = makeUnit(`jammer-${startingRage}`, "enemy", "electronic_warfare");
    const stages = advanceBattleActionStages(makeState([attacker, jammer], `interference-${startingRage}`));
    assert.equal(find(stages.afterBasic, attacker.instanceId).rage, startingRage + 9);
    assert.equal(stages.chainedUltimate, expectedChain);
    assert.equal(stages.actionKind, expectedChain ? "basic_ultimate" : "basic");
  }
});

test("Silence, reflect death, and a battle-ending Basic suppress the immediate Ultimate", () => {
  const silenced = makeUnit("silenced", "player", "infantry", {
    rage: 60,
    statuses: [{
      id: "silence:silenced",
      sourceUnitId: "silencer",
      type: "silence",
      polarity: "debuff",
      cleansable: true,
      stackPolicy: "replace",
      durationClock: "target_action_turn",
      appliedTargetActionTurn: 0,
      expiresAfterTargetActionTurn: 1,
      remainingActionTurns: 1,
    }],
  });
  const silenceStages = advanceBattleActionStages(makeState([silenced, makeUnit("silence-target", "enemy", "armor")]));
  assert.equal(silenceStages.actionKind, "basic");
  assert.equal(silenceStages.afterAction.events.some((entry) => entry.type === "ultimate_started"), false);
  assert.equal(find(silenceStages.afterAction, silenced.instanceId).rage, 60);

  const fragile = makeUnit("fragile", "player", "infantry", { hp: 1, maxHp: 1, attack: 100, battleBaseAttack: 100, rage: 50 });
  const engineer = makeUnit("reflector", "enemy", "engineer", { hp: 10_000, maxHp: 10_000 });
  const reflectStages = advanceBattleActionStages(makeState([fragile, engineer], "reflect-death"));
  assert.equal(find(reflectStages.afterBasic, fragile.instanceId).alive, false);
  assert.equal(reflectStages.afterAction.events.some((entry) => entry.type === "ultimate_started"), false);

  const finisher = makeUnit("finisher", "player", "infantry", { attack: 10_000, battleBaseAttack: 10_000, rage: 50 });
  const lastEnemy = makeUnit("last-enemy", "enemy", "armor", { hp: 1, maxHp: 1 });
  const finishStages = advanceBattleActionStages(makeState([finisher, lastEnemy], "battle-ending-basic"));
  assert.equal(finishStages.afterBasic.outcome, "player_victory");
  assert.equal(finishStages.afterAction.events.some((entry) => entry.type === "ultimate_started"), false);
});

test("round completion and end-of-round effects wait for the entire Basic -> Ultimate chain", () => {
  const attacker = makeUnit("last-actor", "player", "infantry", { rage: 50 });
  const target = makeUnit("already-acted", "enemy", "armor");
  const state = makeState([attacker, target], "round-boundary");
  state.roundCompletedUnitIds = [target.instanceId];
  const stages = advanceBattleActionStages(state);

  assert.ok(stages.afterUltimate);
  assert.equal(stages.afterBasic.round, 1);
  assert.equal(stages.afterUltimate.round, 1);
  assert.equal(stages.afterUltimate.events.some((entry) => entry.type === "round_ended"), false);
  assert.equal(stages.afterAction.round, 2);
  assert.ok(eventIndex(stages.afterAction, "ultimate_completed") < eventIndex(stages.afterAction, "round_ended"));
});

test("chain preserves tracking, remembered target, and Scout timeline semantics", () => {
  let controlled = false;
  for (let index = 0; index < 80 && !controlled; index += 1) {
    const operative = makeUnit("operative", "player", "special_ops");
    operative.rage = operative.ultimateRageRequired - 10;
    const target = makeUnit("tracked-target", "enemy", "armor");
    const stages = advanceBattleActionStages(makeState([operative, target], `tracked-chain-${index}`));
    const trackingAt = eventIndex(stages.afterAction, "tracking_applied");
    const ultimateAt = eventIndex(stages.afterAction, "ultimate_started");
    assert.ok(trackingAt >= 0 && trackingAt < ultimateAt);
    const stun = stages.afterAction.events.find((entry) => entry.type === "stun_applied");
    const silence = stages.afterAction.events.find((entry) => entry.type === "silence_applied");
    if (stun || silence) {
      assert.ok(stun, "a target tracked by the triggering Basic must receive Stun, not Silence");
      assert.equal(silence, undefined);
      controlled = true;
    }
  }
  assert.equal(controlled, true, "deterministic sample should include a successful Special Ops control roll");

  const scout = makeUnit("scout", "player", "scout", {}, "front_left");
  scout.rage = scout.ultimateRageRequired - 10;
  const ally = makeUnit("scout-ally", "player", "armor", { speed: 30, battleBaseSpeed: 30 }, "back_left");
  const scoutTarget = makeUnit("scout-target", "enemy", "armor");
  const scoutStages = advanceBattleActionStages(makeState([scout, ally, scoutTarget], "scout-chain"));
  assert.ok(scoutStages.afterUltimate);
  assert.ok(find(scoutStages.afterUltimate, ally.instanceId).nextActionAt < find(scoutStages.afterBasic, ally.instanceId).nextActionAt);

  const marksman = makeUnit("marksman", "player", "marksman", { attack: 1, battleBaseAttack: 1 }, "back_left");
  marksman.rage = marksman.ultimateRageRequired - 10;
  const firstTarget = makeUnit("first-target", "enemy", "armor", {}, "front_left");
  const secondTarget = makeUnit("second-target", "enemy", "armor", {}, "front_right");
  const marksmanStages = advanceBattleActionStages(makeState([marksman, firstTarget, secondTarget], "marksman-chain"));
  const basicTarget = marksmanStages.afterBasic.events.find((entry) => entry.type === "attack")?.targetUnitIds?.[0];
  const ultimateTarget = marksmanStages.afterAction.events.find((entry) => entry.type === "ultimate_hit")?.targetUnitIds?.[0];
  assert.ok(basicTarget);
  assert.equal(ultimateTarget, basicTarget);
});

test("all 18 troops use the required presentation classification", () => {
  const byKind = (kind: (typeof ULTIMATE_PRESENTATION)[TroopType]["kind"]) => (Object.entries(ULTIMATE_PRESENTATION) as Array<[TroopType, (typeof ULTIMATE_PRESENTATION)[TroopType]]>)
    .filter(([, definition]) => definition.kind === kind)
    .map(([troopType]) => troopType)
    .sort();

  assert.deepEqual(byKind("stationary_support"), ["armor", "divine_medic", "engineer", "guard", "infantry", "medic", "scout"]);
  assert.deepEqual(byKind("stationary_aoe"), ["artillery", "chemical", "electronic_warfare", "forensic_medic", "special_ops"]);
  assert.deepEqual(byKind("single_target_flight"), ["air_force", "anti_tank", "marksman", "martial_artist", "pioneer"]);
  assert.deepEqual(byKind("single_target_chain"), ["commando"]);
  assert.equal(Object.keys(ULTIMATE_PRESENTATION).length, 18);
});

test("prep is fixed at 1000ms while every execution clock uses its action snapshot", () => {
  assert.equal(ULTIMATE_PREP_DURATION_MS, 1_000);
  for (const troopType of Object.keys(ULTIMATE_PRESENTATION) as TroopType[]) {
    assert.equal(getPhase3UltimateVfxDurationMs(troopType), 1_000);
    for (const speed of [3, 4, 5, 6, 7] as const) {
      const clock = getUltimateExecutionClock(
        troopType,
        speed,
        troopType === "artillery" ? 3 : 1
      );
      assert.equal(clock.speedSnapshot, speed);
      assert.equal(
        clock.executionMs,
        Math.max(
          ULTIMATE_MIN_EXECUTION_DURATION_MS,
          Math.round(ULTIMATE_PRESENTATION[troopType].baseExecutionMs / speed)
        )
      );
      if (troopType === "artillery") {
        assert.equal(clock.impactAtMs.length, 3, `Artillery keeps all three waves at ${speed}×`);
        assert(clock.impactAtMs[0] < clock.impactAtMs[1] && clock.impactAtMs[1] < clock.impactAtMs[2]);
      }
    }
  }

  const artillery = getUltimateExecutionClock("artillery", 7, 3);
  assert.equal(artillery.impactAtMs.length, 3);
  assert.deepEqual(artillery.impactAtMs, [80, 161, 241]);
  const antiTank = getUltimateExecutionClock("anti_tank", 5, 1);
  assert.equal(antiTank.impactAtMs[0], Math.round(antiTank.totalMs * 0.45));
  assert.ok(antiTank.totalMs > antiTank.impactAtMs[0], "single-target clock reserves time to return home");
});

import assert from "node:assert/strict";
import {
  resolveBasicAttackAction,
  resolveActionTurnCompletion,
  resolveEndOfRound,
  resolveGuardPassives,
  resolveUltimateAction,
  selectPioneerUltimateTarget,
} from "./combatEngine";
import { buildBattleUnitStatistics, createBattleFromUnits, createTroopBattleUnit } from "./engine";
import { nextSeededRandom } from "./rng";
import {
  CHEMICAL_ULTIMATE_STUN_CHANCE,
  getUltimateConfig,
  GUARD_ULTIMATE_SHIELD_MAX_HP_RATIO,
  GUARD_ULTIMATE_SHIELD_ACTION_TURNS,
  PIONEER_ULTIMATE_ATTACK_RATIO,
  PIONEER_ULTIMATE_STUN_ACTIONS,
  PIONEER_ULTIMATE_STUN_CHANCE,
} from "./ultimateConfig";
import { getPhase3UltimateVfxDurationMs } from "./ultimatePresentation";
import type { BattleSide, BattleState, BattleUnit, FormationSlotId, TroopType } from "./types";

let battleSequence = 0;

function test(name: string, run: () => void): void {
  run();
  console.log(`PASS: ${name}`);
}

function makeUnit(
  instanceId: string,
  side: BattleSide,
  troopType: TroopType,
  slotId: FormationSlotId,
  overrides: Partial<BattleUnit> = {}
): BattleUnit {
  const base = createTroopBattleUnit({ instanceId, side, troopType, slotId, level: 1 });
  const merged = { ...base, ...overrides };
  return {
    ...merged,
    statuses: (overrides.statuses ?? base.statuses).map((status) => ({ ...status })),
    shields: (overrides.shields ?? base.shields).map((shield) => ({ ...shield })),
  };
}

function makeState(units: readonly BattleUnit[], seed = "phase5-combat"): BattleState {
  battleSequence += 1;
  return createBattleFromUnits({
    battleId: `phase5-combat-${battleSequence}`,
    matchSeed: seed,
    units,
  });
}

function findUnit(state: BattleState, instanceId: string): BattleUnit {
  const unit = state.units.find((candidate) => candidate.instanceId === instanceId);
  assert.ok(unit, `Missing unit ${instanceId}`);
  return unit;
}

function resolveAttackAction(state: BattleState, side: BattleSide): BattleState {
  const attacker = state.units.find((unit) => unit.side === side && unit.alive && unit.hp > 0);
  assert.ok(attacker, `Missing living ${side} attacker`);
  return resolveBasicAttackAction(state, attacker.instanceId);
}

function totalShield(unit: BattleUnit): number {
  return unit.shields.reduce((total, shield) => total + Math.max(0, shield.amount), 0);
}

function findRngStateForSecondRoll(predicate: (value: number) => boolean): number {
  for (let candidate = 1; candidate < 1_000_000; candidate += 1) {
    const first = nextSeededRandom(candidate);
    const second = nextSeededRandom(first.state);
    if (predicate(second.value)) return candidate;
  }
  throw new Error("Could not find deterministic RNG fixture");
}

console.log("=== CHIEN TUYEN PHASE 5 COMBAT TESTS ===");

test("Phase 5 Ultimate config values are canonical", () => {
  const guard = getUltimateConfig("guard");
  assert.equal(guard.implemented, true);
  assert.equal(guard.name, "BẢO HỘ LINH HỒN");
  assert.equal(guard.ultimateRageRequired, 60);
  assert.match(guard.description ?? "", /13%/);
  assert.match(guard.description ?? "", /2 Lượt Hành Động/i);
  assert.equal(GUARD_ULTIMATE_SHIELD_MAX_HP_RATIO, 0.13);
  assert.equal(GUARD_ULTIMATE_SHIELD_ACTION_TURNS, 2);

  const pioneer = getUltimateConfig("pioneer");
  assert.equal(pioneer.implemented, true);
  assert.equal(pioneer.name, "HẠ ĐO VÁN");
  assert.equal(pioneer.ultimateRageRequired, 40);
  assert.match(pioneer.description ?? "", /120%/);
  assert.match(pioneer.description ?? "", /70%/);
  assert.equal(PIONEER_ULTIMATE_ATTACK_RATIO, 1.20);
  assert.equal(PIONEER_ULTIMATE_STUN_CHANCE, 0.70);
  assert.equal(PIONEER_ULTIMATE_STUN_ACTIONS, 1);

  const chemical = getUltimateConfig("chemical");
  assert.equal(CHEMICAL_ULTIMATE_STUN_CHANCE, 0.40);
  assert.match(chemical.description ?? "", /40%/);
  assert.equal(chemical.ultimateRageRequired, 60);
});

test("Guard Ultimate requires 60 Rage and shields every living ally from Guard MaxHP", () => {
  const guard = makeUnit("guard", "player", "guard", "front_left", {
    hp: 2_000,
    maxHp: 2_000,
    rage: 60,
  });
  const allyA = makeUnit("ally-a", "player", "infantry", "front_center");
  const allyB = makeUnit("ally-b", "player", "medic", "back_left");
  const allyC = makeUnit("ally-c", "player", "engineer", "back_center");
  const deadAlly = makeUnit("dead-ally", "player", "armor", "front_right", { hp: 0, alive: false });
  const enemy = makeUnit("enemy", "enemy", "infantry", "front_left");
  const before = makeState([guard, allyA, allyB, allyC, deadAlly, enemy]);

  const resolved = resolveUltimateAction(before, guard.instanceId);
  assert.equal(findUnit(resolved, "guard").rage, 0);
  for (const allyId of ["guard", "ally-a", "ally-b", "ally-c"]) {
    const ultimateShield = findUnit(resolved, allyId).shields.find((shield) => shield.kind === "guard_ultimate");
    assert.ok(ultimateShield, `${allyId} should receive Guard Ultimate shield`);
    assert.equal(ultimateShield.amount, 260);
    assert.equal(ultimateShield.expiresAfterSourceActionTurn, 3);
    assert.equal(ultimateShield.durationClock, "source_action_turn");
  }
  assert.equal(findUnit(resolved, "dead-ally").shields.length, 0);
  assert.equal(findUnit(resolved, "enemy").shields.length, 0);
  assert.equal(resolved.events.filter((entry) => entry.type === "shield" && entry.ultimateId === "guard_ultimate").length, 4);

  const guardStats = buildBattleUnitStatistics(resolved).find((entry) => entry.instanceId === "guard");
  assert.equal(guardStats?.shieldCreated, 1_040);
});

test("Guard does not cast below 60 Rage", () => {
  const guard = makeUnit("guard-low-rage", "player", "guard", "front_left", { maxHp: 2_000, hp: 2_000, rage: 59 });
  const enemy = makeUnit("enemy-low-rage", "enemy", "infantry", "front_left");
  const before = makeState([guard, enemy]);
  const resolved = resolveUltimateAction(before, guard.instanceId);
  assert.equal(findUnit(resolved, guard.instanceId).rage, 59);
  assert.equal(resolved.events.some((entry) => entry.type === "ultimate_started"), false);
  assert.equal(findUnit(resolved, guard.instanceId).shields.length, 0);
});

test("Guard passive refresh preserves independent Ultimate shield entry", () => {
  const guard = makeUnit("guard-stack", "player", "guard", "front_left", { maxHp: 2_000, hp: 2_000, rage: 60 });
  const ally = makeUnit("guard-stack-ally", "player", "infantry", "front_center", {
    hp: 100,
    maxHp: 1_000,
    shields: [{ sourceUnitId: "guard-stack", amount: 120, kind: "guard" }],
  });
  const enemy = makeUnit("guard-stack-enemy", "enemy", "infantry", "front_left");
  const cast = resolveUltimateAction(makeState([guard, ally, enemy]), guard.instanceId);
  assert.equal(totalShield(findUnit(cast, ally.instanceId)), 380);

  const refreshed = resolveGuardPassives(cast);
  const target = findUnit(refreshed, ally.instanceId);
  const ultimateShield = target.shields.find((shield) => shield.kind === "guard_ultimate");
  assert.ok(ultimateShield);
  assert.equal(ultimateShield.amount, 260);
  assert.equal(ultimateShield.expiresAfterSourceActionTurn, 3);
  assert.ok(target.shields.some((shield) => shield.kind === "guard"));
});

test("Guard Ultimate shield expires after exactly two next Guard Action Turns", () => {
  const guard = makeUnit("guard-expiry", "player", "guard", "front_left", { maxHp: 2_000, hp: 2_000, rage: 60 });
  const ally = makeUnit("guard-expiry-ally", "player", "infantry", "front_center");
  const enemy = makeUnit("guard-expiry-enemy", "enemy", "infantry", "front_left");
  let state = resolveUltimateAction(makeState([guard, ally, enemy]), guard.instanceId);
  assert.ok(findUnit(state, ally.instanceId).shields.some((shield) => shield.kind === "guard_ultimate"));

  state = resolveActionTurnCompletion(state, guard.instanceId);
  assert.ok(findUnit(state, ally.instanceId).shields.some((shield) => shield.kind === "guard_ultimate"));

  state = resolveActionTurnCompletion(state, guard.instanceId);
  assert.ok(findUnit(state, ally.instanceId).shields.some((shield) => shield.kind === "guard_ultimate"));
  state = resolveActionTurnCompletion(state, guard.instanceId);
  assert.equal(findUnit(state, ally.instanceId).shields.some((shield) => shield.kind === "guard_ultimate"), false);
});

test("Pioneer targets the living enemy with the earliest next timeline action", () => {
  const pioneer = makeUnit("pioneer-target", "player", "pioneer", "front_left", { targetPriority: "front_first" });
  const front = makeUnit("a-front", "enemy", "infantry", "front_left", { nextActionAt: 80 });
  const back = makeUnit("b-back", "enemy", "artillery", "back_left", { nextActionAt: 70 });
  const dead = makeUnit("c-dead", "enemy", "medic", "back_center", { hp: 0, alive: false, nextActionAt: 10 });
  const units = [pioneer, front, back, dead];

  const first = selectPioneerUltimateTarget(units, pioneer, 12345);
  const replay = selectPioneerUltimateTarget(units, pioneer, 12345);
  assert.equal(first.target?.instanceId, replay.target?.instanceId);
  assert.equal(first.rngState, replay.rngState);
  assert.notEqual(first.target?.instanceId, dead.instanceId);
  assert.equal(first.target?.instanceId, back.instanceId);
});

test("Pioneer Ultimate deals 120 percent current ATK through shield pipeline", () => {
  const pioneer = makeUnit("pioneer-damage", "player", "pioneer", "front_left", {
    attack: 100,
    battleBaseAttack: 100,
    critChance: 0,
    rage: 40,
  });
  const target = makeUnit("pioneer-damage-target", "enemy", "infantry", "front_left", {
    hp: 1_000,
    maxHp: 1_000,
    defense: 0,
    shields: [{ sourceUnitId: "shield-source", amount: 50 }],
  });
  const state = makeState([pioneer, target]);
  const resolved = resolveUltimateAction(state, pioneer.instanceId);
  const hit = resolved.events.find((entry) => entry.type === "ultimate_hit" && entry.sourceUnitId === pioneer.instanceId);
  assert.equal(hit?.amount, 120);
  assert.equal(hit?.shieldDamage, 50);
  assert.equal(hit?.hpDamage, 70);
  assert.equal(findUnit(resolved, target.instanceId).hp, 930);
  assert.equal(findUnit(resolved, pioneer.instanceId).rage, 0);
});

test("Pioneer 70 percent stun lasts exactly one target action", () => {
  const pioneer = makeUnit("pioneer-stun", "player", "pioneer", "front_left", {
    attack: 10,
    battleBaseAttack: 10,
    critChance: 0,
    rage: 40,
  });
  const target = makeUnit("pioneer-stun-target", "enemy", "infantry", "front_left", {
    hp: 1_000,
    maxHp: 1_000,
    defense: 0,
    attack: 10,
    battleBaseAttack: 10,
    critChance: 0,
  });
  const state = makeState([pioneer, target]);
  state.rngState = findRngStateForSecondRoll((value) => value < PIONEER_ULTIMATE_STUN_CHANCE);
  let resolved = resolveUltimateAction(state, pioneer.instanceId);
  assert.equal(findUnit(resolved, target.instanceId).statuses.find((status) => status.type === "stun")?.remainingActionTurns, 1);

  const skippedAttack = resolveAttackAction(resolved, "enemy");
  const skipped = resolveActionTurnCompletion(skippedAttack, target.instanceId);
  assert.equal(skipped.events.at(-2)?.type === "action_skipped_stun" || skipped.events.at(-1)?.type === "action_skipped_stun", true);
  assert.equal(findUnit(skipped, target.instanceId).statuses.some((status) => status.type === "stun"), false);

  const activeAgain = resolveAttackAction(skipped, "enemy");
  assert.equal(activeAgain.events.some((entry, index) => index >= skipped.events.length && entry.type === "attack" && entry.sourceUnitId === target.instanceId), true);
});

test("Pioneer failed stun roll leaves no status and lethal hit never leaves stale stun", () => {
  const pioneer = makeUnit("pioneer-no-stun", "player", "pioneer", "front_left", {
    attack: 10,
    battleBaseAttack: 10,
    critChance: 0,
    rage: 40,
  });
  const target = makeUnit("pioneer-no-stun-target", "enemy", "infantry", "front_left", {
    hp: 1_000,
    maxHp: 1_000,
    defense: 0,
  });
  const failedState = makeState([pioneer, target]);
  failedState.rngState = findRngStateForSecondRoll((value) => value >= PIONEER_ULTIMATE_STUN_CHANCE);
  const failed = resolveUltimateAction(failedState, pioneer.instanceId);
  assert.equal(findUnit(failed, target.instanceId).statuses.some((status) => status.type === "stun"), false);

  const lethalPioneer = makeUnit("pioneer-lethal", "player", "pioneer", "front_left", {
    attack: 100,
    battleBaseAttack: 100,
    critChance: 0,
    rage: 40,
  });
  const lethalTarget = makeUnit("pioneer-lethal-target", "enemy", "infantry", "front_left", {
    hp: 100,
    maxHp: 100,
    defense: 0,
  });
  const lethal = resolveUltimateAction(makeState([lethalPioneer, lethalTarget]), lethalPioneer.instanceId);
  assert.equal(findUnit(lethal, lethalTarget.instanceId).alive, false);
  assert.equal(findUnit(lethal, lethalTarget.instanceId).statuses.some((status) => status.type === "stun"), false);
});

test("Chemical Ultimate uses 35 percent ATK and a 40 percent two-Action-Turn Stun", () => {
  const chemical = makeUnit("chemical-45", "player", "chemical", "back_left", {
    attack: 100,
    battleBaseAttack: 100,
    critChance: 0,
    rage: 60,
  });
  const target = makeUnit("chemical-45-target", "enemy", "infantry", "front_left", {
    hp: 1_000,
    maxHp: 1_000,
    defense: 0,
  });
  const state = makeState([chemical, target]);
  state.rngState = findRngStateForSecondRoll((value) => value >= 0.35 && value < 0.40);
  const resolved = resolveUltimateAction(state, chemical.instanceId);
  const hit = resolved.events.find((entry) => entry.type === "ultimate_hit" && entry.sourceUnitId === chemical.instanceId);
  assert.equal(hit?.amount, 35);
  assert.equal(findUnit(resolved, target.instanceId).hp, 965);
  assert.equal(findUnit(resolved, target.instanceId).statuses.find((status) => status.type === "stun")?.remainingActionTurns, 2);
});

test("Phase 5 fixed Ultimate prep remains one real second at every auto speed", () => {
  assert.equal(getPhase3UltimateVfxDurationMs("guard"), 1_000);
  assert.equal(getPhase3UltimateVfxDurationMs("pioneer"), 1_000);
});

console.log("=== CHIEN TUYEN PHASE 5 TESTS COMPLETE ===");

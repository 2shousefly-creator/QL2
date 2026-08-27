import assert from "node:assert/strict";
import {
  canUseUltimateAction,
  calculateMitigatedDamage,
  getHealingReceivedMultiplier,
  getShieldReceivedMultiplier,
  resolveBasicAttackAction,
  resolveActionTurnCompletion,
  resolveEndOfRound,
  resolveUltimateAction,
} from "./combatEngine";
import { createBattle, createBattleFromUnits, createTroopBattleUnit } from "./engine";
import { getTowerFloor } from "./towerFloorCatalog";
import { getTroopStats } from "./troopCatalog";
import type { BattleSide, BattleState, BattleStatus, BattleUnit, FormationSlotId, TroopType } from "./types";

function makeUnit(
  id: string,
  troopType: TroopType,
  side: BattleSide,
  slotId: FormationSlotId,
  overrides: Partial<BattleUnit> = {}
): BattleUnit {
  const base = createTroopBattleUnit({ instanceId: id, troopType, side, slotId, level: 1 });
  return {
    ...base,
    ...overrides,
    statuses: (overrides.statuses ?? base.statuses).map((status) => ({ ...status })),
    shields: (overrides.shields ?? base.shields).map((shield) => ({ ...shield })),
  };
}

function makeState(units: readonly BattleUnit[], seed = "super-expansion"): BattleState {
  return createBattleFromUnits({ battleId: `test-${seed}`, matchSeed: seed, units });
}

function find(state: BattleState, id: string): BattleUnit {
  const unit = state.units.find((candidate) => candidate.instanceId === id);
  assert(unit, `missing unit ${id}`);
  return unit;
}

console.log("=== CHIẾN TUYẾN SUPER EXPANSION TESTS ===");

const expectedLevel54: Readonly<Record<"scout" | "marksman" | "electronic_warfare" | "special_ops" | "divine_medic" | "forensic_medic" | "martial_artist", readonly [number, number, number, number, number]>> = {
  scout: [3650, 299, 93, .25, 68],
  marksman: [2771, 607, 72, .25, 38],
  electronic_warfare: [3693, 490, 99, .25, 47],
  special_ops: [4536, 104, 170, .25, 35],
  divine_medic: [3381, 85, 69, .25, 39],
  forensic_medic: [3952, 268, 93, .25, 58],
  martial_artist: [3753, 418, 119.5, .25, 54],
};
for (const [troopType, expected] of Object.entries(expectedLevel54) as Array<[keyof typeof expectedLevel54, typeof expectedLevel54[keyof typeof expectedLevel54]]>) {
  const stats = getTroopStats(troopType, 54);
  assert.deepEqual([stats.maxHp, stats.attack, stats.defense, stats.critChance, stats.speed], expected, `${troopType} Lv54 stats`);
}

{
  const scoutA = makeUnit("scout-a", "scout", "player", "front_left");
  const scoutB = makeUnit("scout-b", "scout", "player", "front_right");
  const ally = makeUnit("slow-ally", "infantry", "player", "back_center");
  const enemy = makeUnit("enemy", "armor", "enemy", "front_center");
  let state = makeState([scoutA, scoutB, ally, enemy], "scout-passive");
  state.timelineTime = 10;
  find(state, "scout-a").nextActionAt = 70;
  find(state, "scout-b").nextActionAt = 80;
  find(state, "slow-ally").nextActionAt = 110;
  state = resolveActionTurnCompletion(state, "scout-a");
  state = resolveActionTurnCompletion(state, "scout-b");
  assert.equal(find(state, "slow-ally").nextActionAt, 82.25, "duplicate Scouts recompute the farthest ally before each independent 15 percent advance");
  assert.equal(find(state, "scout-b").nextActionAt, 80, "second Scout does not use a stale pre-passive target decision");

  find(state, "scout-a").rage = 50;
  find(state, "scout-a").nextActionAt = 110;
  find(state, "scout-b").nextActionAt = 90;
  find(state, "slow-ally").nextActionAt = 70;
  const cast = resolveUltimateAction(state, "scout-a");
  assert.equal(find(cast, "scout-a").nextActionAt, 60, "Scout Ultimate halves its own remaining timeline distance");
  assert.equal(find(cast, "scout-b").nextActionAt, 50, "Scout Ultimate halves every ally remaining distance");
  assert.equal(find(cast, "slow-ally").nextActionAt, 40, "Scout Ultimate advances the full living team");
}

{
  const marksman = makeUnit("marksman", "marksman", "player", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0 });
  const target = makeUnit("focus-target", "infantry", "enemy", "front_left", { hp: 1000, maxHp: 1000, defense: 0 });
  let state = makeState([marksman, target], "marksman-focus");
  state = resolveBasicAttackAction(state, "marksman");
  assert.equal(find(state, "marksman").focusStacks, 1);
  assert.equal(find(state, "focus-target").hp, 892, "first basic receives +8 percent focus damage");
  state = resolveBasicAttackAction(state, "marksman");
  assert.equal(find(state, "marksman").focusStacks, 2);
  assert.equal(find(state, "focus-target").hp, 776, "second basic receives +16 percent focus damage");

  for (const [hp, expectedDamage] of [[299, 225], [300, 135]] as const) {
    const shooter = makeUnit(`execute-${hp}`, "marksman", "player", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0, rage: 50, lastDamagedEnemyId: `victim-${hp}` });
    const victim = makeUnit(`victim-${hp}`, "infantry", "enemy", "front_left", { hp, maxHp: 1000, defense: 0 });
    const result = resolveUltimateAction(makeState([shooter, victim], `execute-${hp}`), shooter.instanceId);
    assert.equal(result.events.find((event) => event.type === "ultimate_hit")?.amount, expectedDamage, `${hp / 10}% HP uses the exact execute threshold`);
  }
}

{
  const attacker = makeUnit("rage-attacker", "infantry", "player", "front_left", { attack: 1, battleBaseAttack: 1, critChance: 0 });
  const electronic = makeUnit("electronic", "electronic_warfare", "enemy", "front_left", { hp: 1000, maxHp: 1000, defense: 1000 });
  let state = resolveBasicAttackAction(makeState([attacker, electronic], "rage-interference"), "rage-attacker");
  assert.equal(find(state, "rage-attacker").rage, 9, "Electronic changes basic Rage gain from 10 to 9 without touching existing Rage");

  const caster = makeUnit("emp", "electronic_warfare", "player", "front_left", { attack: 100, battleBaseAttack: 100, critChance: 0, rage: 60 });
  const enemyA = makeUnit("emp-a", "infantry", "enemy", "front_left", { hp: 1000, maxHp: 1000, defense: 0, rage: 50 });
  const enemyB = makeUnit("emp-b", "medic", "enemy", "back_left", { hp: 1000, maxHp: 1000, defense: 0, rage: 10 });
  state = resolveUltimateAction(makeState([caster, enemyA, enemyB], "emp"), "emp");
  assert.equal(find(state, "emp-a").rage, 30);
  assert.equal(find(state, "emp-b").rage, 0);
  assert.equal(find(state, "emp-a").hp, 960, "EMP deals 40 percent current ATK before draining Rage");
}

{
  const operative = makeUnit("operative", "special_ops", "player", "front_left", { attack: 1, battleBaseAttack: 1, critChance: 0 });
  const target = makeUnit("tracked", "armor", "enemy", "front_left", { hp: 5000, maxHp: 5000, defense: 1000 });
  let state = resolveBasicAttackAction(makeState([operative, target], "tracking"), "operative");
  assert(find(state, "tracked").statuses.some((status) => status.type === "tracking" && !status.cleansable), "Special Ops basic applies persistent non-cleansable Tracking");
  find(state, "operative").rage = 50;
  let controlled: BattleState | null = null;
  for (let attempt = 0; attempt < 100 && !controlled; attempt += 1) {
    const candidate = makeState(state.units, `special-control-${attempt}`);
    find(candidate, "operative").rage = 50;
    const result = resolveUltimateAction(candidate, "operative");
    if (find(result, "tracked").statuses.some((status) => status.type === "stun")) controlled = result;
  }
  assert(controlled, "seeded Special Ops control roll eventually reaches its canonical 35 percent branch");
  const stun = find(controlled, "tracked").statuses.find((status) => status.type === "stun")!;
  assert.equal(stun.expiresAfterTargetActionTurn, 2, "Tracking branch applies a two-Action-Turn Stun");
  const firstSkip = resolveActionTurnCompletion(resolveBasicAttackAction(controlled, "tracked"), "tracked");
  assert(find(firstSkip, "tracked").statuses.some((status) => status.id === stun.id));
  const secondSkip = resolveActionTurnCompletion(resolveBasicAttackAction(firstSkip, "tracked"), "tracked");
  assert.equal(find(secondSkip, "tracked").statuses.some((status) => status.id === stun.id), false);

  const silencedStatus: BattleStatus = { id: "silenced", sourceUnitId: "operative", type: "silence", polarity: "debuff", cleansable: true, stackPolicy: "refresh", durationClock: "target_action_turn", appliedTargetActionTurn: 0, expiresAfterTargetActionTurn: 2, remainingActionTurns: 2 };
  const silenced = makeUnit("silenced-unit", "infantry", "player", "front_left", { rage: 60, statuses: [silencedStatus] });
  const silenceState = makeState([silenced, makeUnit("silence-enemy", "armor", "enemy", "front_left")], "silence");
  assert.equal(canUseUltimateAction(silenceState, find(silenceState, "silenced-unit")), false, "Silence blocks only the ready Ultimate");
  const basic = resolveBasicAttackAction(silenceState, "silenced-unit");
  assert(basic.events.some((event) => event.type === "attack" && event.sourceUnitId === "silenced-unit"), "Silenced unit still performs a basic attack");
}

{
  const healer = makeUnit("divine", "divine_medic", "player", "back_left", { maxHp: 3000, hp: 3000, rage: 60 });
  const ally = makeUnit("hurt-ally", "infantry", "player", "front_left", { hp: 100, maxHp: 1000, statuses: [{ id: "anti-heal", sourceUnitId: "forensic", type: "forensic_suppression", polarity: "debuff", cleansable: true, stackPolicy: "refresh", durationClock: "target_action_turn", appliedTargetActionTurn: 0, expiresAfterTargetActionTurn: 2, remainingActionTurns: 2, healingReceivedMultiplier: .60, shieldReceivedMultiplier: .60 }] });
  const enemy = makeUnit("healer-enemy", "armor", "enemy", "front_left");
  let state = resolveUltimateAction(makeState([healer, ally, enemy], "divine-heal"), "divine");
  assert.equal(find(state, "hurt-ally").hp, 424, "Thần Y 540 base heal becomes 324 under 40 percent reduction");
  state = resolveActionTurnCompletion(state, "divine");
  const rescued = find(state, "hurt-ally");
  assert(rescued.statuses.some((status) => status.type === "rescue"), "lowest HP ally receives Rescue for the next round");
  const rawTarget = { ...rescued, defense: 0 };
  assert.equal(calculateMitigatedDamage(1000, find(state, "healer-enemy"), rawTarget, state.round), 650, "Rescue applies 35 percent reduction after DEF");
}

{
  const forensic = makeUnit("forensic", "forensic_medic", "player", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0 });
  const marked = makeUnit("forensic-marked", "infantry", "enemy", "front_left", { hp: 200, maxHp: 1000, defense: 0, shields: [{ sourceUnitId: "old", amount: 500 }] });
  const normal = makeUnit("forensic-normal", "infantry", "enemy", "front_right", { hp: 800, maxHp: 1000, defense: 0 });
  let state = resolveActionTurnCompletion(makeState([forensic, marked, normal], "forensic-passive"), "forensic");
  assert.equal(getHealingReceivedMultiplier(find(state, "forensic-marked")), .60);
  assert.equal(getShieldReceivedMultiplier(find(state, "forensic-marked")), .60);
  assert.equal(find(state, "forensic-marked").shields[0].amount, 500, "Forensic passive never reduces an existing shield");
  find(state, "forensic").rage = 40;
  state = resolveUltimateAction(state, "forensic");
  assert.equal(getHealingReceivedMultiplier(find(state, "forensic-marked")), .4, "marked target uses strongest 60 percent Ultimate reduction");
  assert.equal(getHealingReceivedMultiplier(find(state, "forensic-normal")), .6, "unmarked target receives the normal 40 percent reduction");
}

{
  const floor = getTowerFloor(3)!;
  const battle = createBattle({
    battleId: "duplicate-safety",
    floor,
    matchSeed: "duplicate-safety",
    playerUnits: [{ instanceId: "player", troopType: "infantry", level: 1, slotId: "front_left" }],
  });
  const enemies = battle.units.filter((unit) => unit.side === "enemy");
  assert.equal(enemies.length, 4);
  assert.equal(new Set(enemies.map((unit) => unit.instanceId)).size, 4, "duplicate enemy troop types always receive unique instance IDs");
  assert.equal(enemies.filter((unit) => unit.troopType === "medic").length, 2);
  const bossBattle = createBattle({ battleId: "solo-boss", floor: getTowerFloor(100)!, matchSeed: "solo-boss", playerUnits: [{ instanceId: "player", troopType: "infantry", level: 1, slotId: "front_left" }] });
  assert.equal(bossBattle.units.filter((unit) => unit.side === "enemy").length, 1, "final Boss enters battle alone");
}

console.log("CHIẾN TUYẾN SUPER EXPANSION TESTS PASSED");

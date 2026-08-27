import assert from "node:assert/strict";
import {
  applyShieldAndHpDamage,
  calculateAntiTankBonusRaw,
  calculateDefenseDamage,
  calculateMitigatedDamage,
  getBattlePressureBonus,
  getDefenseDamageMultiplier,
  getEffectiveCritChance,
  getEffectiveCritDamageMultiplier,
  getEngineerReflectRatio,
  getInfantryMissingHpDamageBonus,
  resolveBasicAttackAction,
  resolveActionTurnCompletion,
  resolveChemicalPassives,
  resolveEndOfRound,
  resolveGrowthPassives,
  resolveGuardPassives,
  resolveUltimateAction,
  selectAirForceUltimateTarget,
  selectCommandoUltimateTarget,
  selectMedicUltimateTargets,
  selectTarget,
} from "./combatEngine";
import { createBattleFromUnits, createTroopBattleUnit } from "./engine";
import { getHealthShieldFill, getRageFillPercent } from "./battleHud";
import { BASIC_ATTACK_RAGE_GAIN, getUltimateConfig } from "./ultimateConfig";
import { getPhase3UltimateVfxDurationMs } from "./ultimatePresentation";
import { hashMatchSeed, nextSeededRandom } from "./rng";
import type {
  BattleSide,
  BattleState,
  BattleUnit,
  FormationSlotId,
  TroopType,
} from "./types";

const FRONT_SLOTS: readonly FormationSlotId[] = ["front_left", "front_center", "front_right"];
const BACK_SLOTS: readonly FormationSlotId[] = ["back_left", "back_center", "back_right"];
let battleSequence = 0;

function test(name: string, run: () => void): void {
  run();
  console.log(`PASS: ${name}`);
}

function close(actual: number, expected: number, message: string, epsilon = 1e-9): void {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${message}: expected ${expected}, received ${actual}`);
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

function makeState(units: readonly BattleUnit[], seed = "combat-test"): BattleState {
  battleSequence += 1;
  return createBattleFromUnits({
    battleId: `combat-test-${battleSequence}`,
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

console.log("=== CHIEN TUYEN V2 COMBAT TESTS ===");

test("LoL DEF formula supports positive and negative DEF", () => {
  close(getDefenseDamageMultiplier(100), 0.5, "100 DEF multiplier");
  close(getDefenseDamageMultiplier(-100), 1.5, "-100 DEF multiplier");
  assert.equal(calculateDefenseDamage(100, 100), 50);
  assert.equal(calculateDefenseDamage(100, -100), 150);
  assert.equal(calculateDefenseDamage(0, 999), 0);
});

test("battle pressure is additive from round 11", () => {
  close(getBattlePressureBonus(10), 0, "round 10");
  close(getBattlePressureBonus(11), 0.05, "round 11");
  close(getBattlePressureBonus(20), 0.5, "round 20");
  close(getBattlePressureBonus(30), 1, "round 30");
});

test("targeting is seeded-random across the whole preferred row", () => {
  const attacker = makeUnit("attacker", "player", "infantry", "front_left");
  const high = makeUnit("front-high", "enemy", "engineer", "front_left", { maxHp: 1_000, hp: 900 });
  const low = makeUnit("front-low", "enemy", "engineer", "front_center", { maxHp: 1_000, hp: 10 });
  const back = makeUnit("back", "enemy", "artillery", "back_left");
  const units = [attacker, high, low, back];
  assert.equal(selectTarget(units, attacker, 1).target?.instanceId, "front-high");
  assert.equal(selectTarget(units, attacker, 10_000).target?.instanceId, "front-low");
  const first = selectTarget(units, attacker, 12345);
  const replay = selectTarget(units, attacker, 12345);
  assert.equal(first.target?.instanceId, replay.target?.instanceId);
  assert.equal(first.rngState, replay.rngState);
  assert.equal(selectTarget(units, { ...attacker, targetPriority: "back_first" }, 9).target?.instanceId, "back");
});

test("shields absorb in order before HP", () => {
  const target = makeUnit("shield-target", "enemy", "guard", "front_left", {
    hp: 100,
    maxHp: 100,
    shields: [
      { sourceUnitId: "guard-a", amount: 30 },
      { sourceUnitId: "guard-b", amount: 20 },
    ],
  });
  const firstHit = applyShieldAndHpDamage(target, 40);
  assert.deepEqual(firstHit, { absorbed: 40, hpDamage: 0, totalApplied: 40 });
  assert.equal(target.hp, 100);
  assert.deepEqual(target.shields, [{ sourceUnitId: "guard-b", amount: 10 }]);

  const secondHit = applyShieldAndHpDamage(target, 20);
  assert.deepEqual(secondHit, { absorbed: 10, hpDamage: 10, totalApplied: 20 });
  assert.equal(target.hp, 90);
  assert.equal(target.shields.length, 0);
});

test("Artillery blast hits only the living enemy directly behind the main target", () => {
  const artillery = makeUnit("artillery", "player", "artillery", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0, targetPriority: "front_first" });
  const main = makeUnit("main", "enemy", "infantry", "front_center", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const behind = makeUnit("behind", "enemy", "medic", "back_center", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const other = makeUnit("other", "enemy", "infantry", "back_left", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const resolved = resolveAttackAction(makeState([artillery, main, behind, other]), "player");
  assert.equal(findUnit(resolved, "main").hp, 900);
  assert.equal(findUnit(resolved, "behind").hp, 960);
  assert.equal(findUnit(resolved, "other").hp, 1_000);
  assert.deepEqual(resolved.events.find((entry) => entry.type === "artillery_aoe")?.targetUnitIds, ["behind"]);
});

test("Armor reduces post-DEF integer damage in its first three Action Turns only", () => {
  const attacker = makeUnit("armor-attacker", "player", "infantry", "front_left", {
    attack: 100,
    battleBaseAttack: 100,
    damageMultiplier: 1,
  });
  const armor = makeUnit("armor-target", "enemy", "armor", "front_left", {
    defense: 100,
  });
  assert.equal(calculateMitigatedDamage(100, attacker, armor, 1), 35);
  armor.actionTurnCount = 2;
  assert.equal(calculateMitigatedDamage(100, attacker, armor, 3), 35);
  armor.actionTurnCount = 3;
  assert.equal(calculateMitigatedDamage(100, attacker, armor, 4), 50);
});

test("base Crit is deterministic and deals 190 percent basic damage", () => {
  const attacker = makeUnit("crit-attacker", "player", "infantry", "front_left", {
    attack: 100,
    battleBaseAttack: 100,
    critChance: 0.25,
    speed: 100,
    battleBaseSpeed: 100,
  });
  const target = makeUnit("crit-target", "enemy", "infantry", "front_left", {
    hp: 1_000,
    maxHp: 1_000,
    defense: 0,
    critChance: 0,
  });
  const state = makeState([attacker, target], "crit-state");
  state.rngState = hashMatchSeed("crit-2");
  const resolved = resolveAttackAction(state, "player");
  assert.equal(findUnit(resolved, "crit-target").hp, 810);
  assert.equal(resolved.events.filter((entry) => entry.type === "critical").length, 1);
  assert.equal(
    resolved.events.find((entry) => entry.type === "damage" && entry.sourceUnitId === "crit-attacker")?.amount,
    190
  );
});

test("Commando gains only +60pp Crit during its first three Action Turns", () => {
  const commando = makeUnit("commando", "player", "commando", "back_left");
  close(getEffectiveCritChance(commando), 0.85, "Action Turn 1 commando Crit");
  close(getEffectiveCritDamageMultiplier(commando), 1.90, "Action Turn 1 uses global Crit Damage");
  commando.actionTurnCount = 2;
  close(getEffectiveCritChance(commando), 0.85, "Action Turn 3 commando Crit");
  close(getEffectiveCritDamageMultiplier(commando), 1.90, "Action Turn 3 uses global Crit Damage");
  commando.actionTurnCount = 3;
  close(getEffectiveCritChance(commando), 0.25, "Action Turn 4 commando Crit");
  close(getEffectiveCritDamageMultiplier(commando), 1.90, "Action Turn 4 commando Crit Damage");
});

test("Anti-Tank bonus uses full 10% MaxHP normally and a 125% CurrentATK Boss cap", () => {
  const attacker = makeUnit("anti-tank", "player", "anti_tank", "front_left", {
    attack: 100,
    battleBaseAttack: 100,
    critChance: 1,
    speed: 100,
    battleBaseSpeed: 100,
  });
  const regularTarget = makeUnit("regular-target", "enemy", "armor", "front_left", {
    maxHp: 500,
    hp: 500,
    defense: 0,
  });
  const bossLikeTarget = makeUnit("boss-target", "enemy", "infantry", "front_center", {
    maxHp: 100_000,
    hp: 100_000,
    defense: 0,
    isBoss: true,
  });
  assert.equal(calculateAntiTankBonusRaw(attacker, regularTarget), 50);
  assert.equal(calculateAntiTankBonusRaw(attacker, bossLikeTarget), 125);

  const state = makeState([attacker, bossLikeTarget], "anti-tank-crit");
  const resolved = resolveAttackAction(state, "player");
  assert.equal(findUnit(resolved, "boss-target").hp, 100_000 - 315);
  assert.equal(resolved.events.find((entry) => entry.type === "critical")?.amount, 190);
  assert.equal(resolved.events.find((entry) => entry.type === "damage")?.amount, 315);
});

test("Engineer reflects 50 percent penetrating direct damage without chaining", () => {
  const attacker = makeUnit("engineer-attacker", "player", "engineer", "front_left", {
    hp: 500,
    maxHp: 500,
    attack: 100,
    battleBaseAttack: 100,
    defense: 0,
    critChance: 0,
    speed: 100,
    battleBaseSpeed: 100,
  });
  const target = makeUnit("engineer-target", "enemy", "engineer", "front_left", {
    hp: 500,
    maxHp: 500,
    defense: 0,
    critChance: 0,
  });
  const resolved = resolveAttackAction(makeState([attacker, target]), "player");
  assert.equal(findUnit(resolved, "engineer-target").hp, 400);
  assert.equal(findUnit(resolved, "engineer-attacker").hp, 450);
  assert.equal(resolved.events.filter((entry) => entry.type === "reflect").length, 1);

  const shieldedTarget = { ...target, shields: [{ sourceUnitId: "guard", amount: 100 }] };
  const shielded = resolveAttackAction(makeState([attacker, shieldedTarget]), "player");
  assert.equal(findUnit(shielded, "engineer-target").hp, 500);
  assert.equal(shielded.events.filter((entry) => entry.type === "reflect").length, 0);

  const pressureState = makeState([attacker, target]);
  pressureState.round = 11;
  const underPressure = resolveAttackAction(pressureState, "player");
  assert.equal(underPressure.events.find((entry) => entry.type === "damage")?.amount, 105);
  assert.equal(underPressure.events.find((entry) => entry.type === "reflect")?.amount, 53);
});

test("two Chemical units create separate non-Crit AoE events and never trigger reflect", () => {
  const chemicalA = makeUnit("chemical-a", "player", "chemical", "back_left", {
    attack: 100,
    battleBaseAttack: 100,
  });
  const chemicalB = makeUnit("chemical-b", "player", "chemical", "back_center", {
    attack: 100,
    battleBaseAttack: 100,
  });
  const engineerA = makeUnit("chemical-target-a", "enemy", "engineer", "front_left", {
    hp: 1_000,
    maxHp: 1_000,
    defense: 0,
    battleBaseDefense: 0,
  });
  const engineerB = makeUnit("chemical-target-b", "enemy", "engineer", "front_center", {
    hp: 1_000,
    maxHp: 1_000,
    defense: 0,
    battleBaseDefense: 0,
  });
  const resolved = resolveChemicalPassives(makeState([chemicalA, chemicalB, engineerA, engineerB]));
  assert.equal(findUnit(resolved, "chemical-target-a").hp, 970);
  assert.equal(findUnit(resolved, "chemical-target-b").hp, 970);
  assert.equal(resolved.events.filter((entry) => entry.type === "chemical_aoe").length, 2);
  assert.equal(resolved.events.filter((entry) => entry.type === "damage").length, 4);
  assert.equal(resolved.events.filter((entry) => entry.type === "critical").length, 0);
  assert.equal(resolved.events.filter((entry) => entry.type === "reflect").length, 0);
});

test("opposing lethal Chemical passives both resolve before deaths", () => {
  const playerChemical = makeUnit("mutual-chemical-player", "player", "chemical", "back_left", {
    hp: 15,
    maxHp: 15,
    attack: 100,
    battleBaseAttack: 100,
    defense: 0,
  });
  const enemyChemical = makeUnit("mutual-chemical-enemy", "enemy", "chemical", "back_right", {
    hp: 15,
    maxHp: 15,
    attack: 100,
    battleBaseAttack: 100,
    defense: 0,
  });
  const resolved = resolveChemicalPassives(makeState([playerChemical, enemyChemical]));
  assert.equal(resolved.outcome, "draw");
  assert.equal(resolved.events.filter((entry) => entry.type === "chemical_aoe").length, 2);
  assert.equal(resolved.events.filter((entry) => entry.type === "death").length, 2);
  assert.equal(findUnit(resolved, playerChemical.instanceId).alive, false);
  assert.equal(findUnit(resolved, enemyChemical.instanceId).alive, false);
});

test("each Medic Action Turn heals all living allies from that Medic's Max HP", () => {
  const medicA = makeUnit("medic-a", "player", "medic", "back_left", { hp: 500, maxHp: 1_000 });
  const medicB = makeUnit("medic-b", "player", "medic", "back_center", { hp: 500, maxHp: 1_000 });
  const ally = makeUnit("patient", "player", "infantry", "front_left", { hp: 500, maxHp: 1_000 });
  const fullAlly = makeUnit("full-patient", "player", "infantry", "front_center", {
    hp: 1_000,
    maxHp: 1_000,
  });
  const deadAlly = makeUnit("dead-patient", "player", "infantry", "front_right", {
    hp: 0,
    maxHp: 1_000,
    alive: false,
  });
  const enemy = makeUnit("medic-enemy", "enemy", "infantry", "front_left");
  let resolved = resolveActionTurnCompletion(makeState([medicA, medicB, ally, fullAlly, deadAlly, enemy]), medicA.instanceId);
  resolved = resolveActionTurnCompletion(resolved, medicB.instanceId);

  close(findUnit(resolved, "medic-a").hp, 580, "both Medic Action Turns heal Medic A");
  close(findUnit(resolved, "medic-b").hp, 580, "both Medic Action Turns heal Medic B");
  close(findUnit(resolved, "patient").hp, 580, "each Medic contributes a fixed 4% source-Max-HP heal");
  assert.equal(findUnit(resolved, "full-patient").hp, 1_000);
  assert.equal(findUnit(resolved, "dead-patient").hp, 0);
  assert.equal(resolved.events.filter((entry) => entry.type === "heal").length, 8);
  assert.equal(resolved.events.filter((entry) => entry.type === "critical").length, 0);
});

test("Guard can self-shield and refreshes or moves its source shield without stacking", () => {
  const guard = makeUnit("solo-guard", "player", "guard", "front_left", {
    hp: 500,
    maxHp: 1_000,
  });
  const enemy = makeUnit("guard-enemy", "enemy", "infantry", "front_left");
  const selfShielded = resolveGuardPassives(makeState([guard, enemy]));
  assert.deepEqual(findUnit(selfShielded, "solo-guard").shields, [
    { sourceUnitId: "solo-guard", amount: 70, kind: "guard" },
  ]);

  const ally = makeUnit("guard-ally", "player", "infantry", "front_center", {
    hp: 400,
    maxHp: 1_000,
  });
  let moved = resolveGuardPassives(makeState([{ ...guard, hp: 1_000 }, ally, enemy]));
  assert.equal(findUnit(moved, "guard-ally").shields.length, 1);
  findUnit(moved, "guard-ally").hp = 1_000;
  findUnit(moved, "solo-guard").hp = 300;
  moved = resolveGuardPassives(moved);
  assert.equal(findUnit(moved, "guard-ally").shields.length, 0);
  assert.deepEqual(findUnit(moved, "solo-guard").shields, [
    { sourceUnitId: "solo-guard", amount: 70, kind: "guard" },
  ]);
  moved = resolveGuardPassives(moved);
  assert.equal(findUnit(moved, "solo-guard").shields.length, 1);
  assert.equal(findUnit(moved, "solo-guard").shields[0].amount, 70);
});

test("two Guards select two distinct lowest-HP targets", () => {
  const guardA = makeUnit("guard-a", "player", "guard", "front_left", { hp: 900, maxHp: 1_000 });
  const guardB = makeUnit("guard-b", "player", "guard", "front_center", { hp: 900, maxHp: 1_000 });
  const allyA = makeUnit("ally-a", "player", "infantry", "back_left", { hp: 100, maxHp: 1_000 });
  const allyB = makeUnit("ally-b", "player", "infantry", "back_center", { hp: 200, maxHp: 1_000 });
  const enemy = makeUnit("two-guard-enemy", "enemy", "infantry", "front_left");
  const resolved = resolveGuardPassives(makeState([guardA, guardB, allyA, allyB, enemy]));
  const targets = resolved.events
    .filter((entry) => entry.type === "shield")
    .flatMap((entry) => entry.targetUnitIds ?? []);
  assert.deepEqual(new Set(targets), new Set(["ally-a", "ally-b"]));
});

test("Can Trường is dynamic from current missing HP and never mutates ATK", () => {
  const infantry = makeUnit("p4-can-truong", "player", "infantry", FRONT_SLOTS[0], {
    hp: 1_000,
    maxHp: 1_000,
    attack: 100,
    battleBaseAttack: 100,
    passiveStacks: 0,
  });
  const target = makeUnit("p4-can-truong-target", "enemy", "medic", FRONT_SLOTS[0], { defense: 0, hp: 10_000, maxHp: 10_000 });
  close(getInfantryMissingHpDamageBonus(infantry), 0, "full HP");
  infantry.hp = 800;
  close(getInfantryMissingHpDamageBonus(infantry), 0.07, "twenty percent missing HP");
  assert.equal(calculateMitigatedDamage(100, infantry, target, 1), 107);
  infantry.hp = 500;
  close(getInfantryMissingHpDamageBonus(infantry), 0.175, "fifty percent missing HP");
  assert.equal(calculateMitigatedDamage(100, infantry, target, 1), 118);
  infantry.hp = 100;
  close(getInfantryMissingHpDamageBonus(infantry), 0.315, "ninety percent missing HP");
  assert.equal(calculateMitigatedDamage(100, infantry, target, 1), 132);
  infantry.hp = 700;
  close(getInfantryMissingHpDamageBonus(infantry), 0.105, "healing immediately lowers Can Truong");
  assert.equal(infantry.attack, 100);
  assert.equal(infantry.battleBaseAttack, 100);
  assert.equal(infantry.passiveStacks, 0);
});

test("Thống Trị Bầu Trời grants non-compounding four-percent ATK stacks capped at ten", () => {
  const air = makeUnit("p4-air-growth", "player", "air_force", BACK_SLOTS[0], {
    attack: 100,
    battleBaseAttack: 100,
    damageMultiplier: 1,
  });
  const infantry = makeUnit("p4-no-growth-infantry", "player", "infantry", FRONT_SLOTS[0], { attack: 100, battleBaseAttack: 100 });
  const enemy = makeUnit("p4-growth-enemy", "enemy", "engineer", FRONT_SLOTS[0]);
  let state = resolveGrowthPassives(makeState([air, infantry, enemy]));
  assert.equal(findUnit(state, air.instanceId).passiveStacks, 1);
  close(findUnit(state, air.instanceId).attack, 104, "one Air stack");
  assert.equal(findUnit(state, infantry.instanceId).passiveStacks, 0);
  assert.equal(findUnit(state, infantry.instanceId).attack, 100);
  for (let stack = 2; stack <= 10; stack += 1) state = resolveGrowthPassives(state);
  assert.equal(findUnit(state, air.instanceId).passiveStacks, 10);
  close(findUnit(state, air.instanceId).attack, 140, "ten Air stacks");
  close(findUnit(state, air.instanceId).damageMultiplier, 1, "old Air damage multiplier is unused");
  state = resolveGrowthPassives(state);
  assert.equal(findUnit(state, air.instanceId).passiveStacks, 10);
  close(findUnit(state, air.instanceId).attack, 140, "Air remains capped without compounding");
});

test("pressure increases only damage, not Medic healing or Guard shields", () => {
  const attacker = makeUnit("pressure-attacker", "player", "infantry", "front_left", {
    attack: 100,
    battleBaseAttack: 100,
    damageMultiplier: 1,
  });
  const target = makeUnit("pressure-target", "enemy", "infantry", "front_left", { defense: 0 });
  assert.equal(calculateMitigatedDamage(100, attacker, target, 10), 100);
  assert.equal(calculateMitigatedDamage(100, attacker, target, 11), 105);
  assert.equal(calculateMitigatedDamage(100, attacker, target, 20), 150);

  const medic = makeUnit("pressure-medic", "player", "medic", "back_left", {
    hp: 1_000,
    maxHp: 1_000,
  });
  const guard = makeUnit("pressure-guard", "player", "guard", "front_left", {
    hp: 1_000,
    maxHp: 1_000,
  });
  const patient = makeUnit("pressure-patient", "player", "infantry", "front_center", {
    hp: 500,
    maxHp: 1_000,
  });
  const enemy = makeUnit("pressure-enemy", "enemy", "engineer", "front_left");
  const state = makeState([medic, guard, patient, enemy]);
  state.round = 40;
  const afterMedic = resolveActionTurnCompletion(state, medic.instanceId);
  const resolved = resolveActionTurnCompletion(afterMedic, guard.instanceId);
  close(findUnit(resolved, "pressure-patient").hp, 540, "pressure-independent heal");
  assert.equal(findUnit(resolved, "pressure-patient").shields[0].amount, 70);
});

test("periodic passives fire only after each source's own Action Turn", () => {
  const chemical = makeUnit("order-chemical", "player", "chemical", "back_left", { attack: 100, battleBaseAttack: 100 });
  const medic = makeUnit("order-medic", "player", "medic", "back_center", { hp: 900, maxHp: 1_000 });
  const guard = makeUnit("order-guard", "player", "guard", "front_left", { hp: 900, maxHp: 1_000 });
  const infantry = makeUnit("order-infantry", "player", "infantry", "front_center", { hp: 900, maxHp: 1_000 });
  const air = makeUnit("order-air", "player", "air_force", "front_right");
  const enemy = makeUnit("order-enemy", "enemy", "engineer", "front_left", { hp: 10_000, maxHp: 10_000, defense: 0 });
  let resolved = makeState([chemical, medic, guard, infantry, air, enemy]);
  resolved = resolveActionTurnCompletion(resolved, chemical.instanceId);
  resolved = resolveActionTurnCompletion(resolved, medic.instanceId);
  resolved = resolveActionTurnCompletion(resolved, guard.instanceId);
  resolved = resolveActionTurnCompletion(resolved, air.instanceId);
  const indexOf = (predicate: (event: BattleState["events"][number]) => boolean): number => resolved.events.findIndex(predicate);
  const chemicalIndex = indexOf((entry) => entry.type === "chemical_aoe");
  const healIndex = indexOf((entry) => entry.type === "heal");
  const shieldIndex = indexOf((entry) => entry.type === "shield");
  const airIndex = indexOf((entry) => entry.type === "passive_growth" && entry.sourceUnitId === air.instanceId);
  assert.ok(chemicalIndex < healIndex);
  assert.ok(healIndex < shieldIndex);
  assert.ok(shieldIndex < airIndex);
  assert.equal(resolved.events.some((entry) => entry.type === "passive_growth" && entry.sourceUnitId === infantry.instanceId), false);
  assert.equal(resolved.events.some((entry) => entry.type === "round_ended"), false);
  const afterRound = resolveEndOfRound(resolved);
  assert.equal(afterRound.events.filter((entry) => entry.type === "chemical_aoe").length, 1);
  assert.equal(afterRound.events.filter((entry) => entry.type === "round_ended").length, 1);
});

test("Chemical lethality ends battle before later sources can trigger their Action Turn passives", () => {
  const chemical = makeUnit("lethal-chemical", "player", "chemical", "back_left", {
    attack: 100,
    battleBaseAttack: 100,
  });
  const medic = makeUnit("lethal-medic", "player", "medic", "back_center", { hp: 500, maxHp: 1_000 });
  const guard = makeUnit("lethal-guard", "player", "guard", "front_left");
  const infantry = makeUnit("lethal-infantry", "player", "infantry", "front_center");
  const enemy = makeUnit("lethal-enemy", "enemy", "engineer", "front_left", {
    hp: 15,
    maxHp: 15,
    defense: 0,
  });
  let resolved = resolveActionTurnCompletion(makeState([chemical, medic, guard, infantry, enemy]), chemical.instanceId);
  resolved = resolveActionTurnCompletion(resolved, medic.instanceId);
  resolved = resolveActionTurnCompletion(resolved, guard.instanceId);
  assert.equal(resolved.outcome, "player_victory");
  assert.equal(resolved.events.filter((entry) => entry.type === "heal").length, 0);
  assert.equal(resolved.events.filter((entry) => entry.type === "shield").length, 0);
  assert.equal(resolved.events.filter((entry) => entry.type === "passive_growth").length, 0);
  assert.equal(resolved.events.filter((entry) => entry.type === "round_ended").length, 0);
});


test("Chemical corrosion uses a fixed baseline and caps at exactly three stacks", () => {
  const chemical = makeUnit("corrosion-source", "player", "chemical", "back_left", { attack: 1, battleBaseAttack: 1 });
  const target = makeUnit("corrosion-target", "enemy", "armor", "front_left", { hp: 10_000, maxHp: 10_000, defense: 100, battleBaseDefense: 100 });
  let state = makeState([chemical, target]);
  for (let i = 0; i < 4; i += 1) state = resolveChemicalPassives(state);
  assert.equal(findUnit(state, "corrosion-target").corrosionStacks, 3);
  close(findUnit(state, "corrosion-target").defense, 85, "three corrosion stacks are exactly -15 percent of baseline");
});

test("Pioneer survives its first lethal direct hit and dies to the next lethal hit", () => {
  const attacker = makeUnit("pioneer-attacker", "player", "infantry", "front_left", { attack: 500, battleBaseAttack: 500, critChance: 0 });
  const pioneer = makeUnit("pioneer-target", "enemy", "pioneer", "front_left", { hp: 100, maxHp: 100, defense: 0, battleBaseDefense: 0 });
  let state = resolveAttackAction(makeState([attacker, pioneer]), "player");
  const survived = findUnit(state, "pioneer-target");
  assert.equal(survived.hp, 1);
  assert.equal(survived.alive, true);
  assert.equal(survived.pioneerLastStandUsed, true);
  assert.equal(survived.shields[0].amount, 18);
  assert.equal(state.events.filter((entry) => entry.type === "death").length, 0);
  state = resolveAttackAction(state, "player");
  assert.equal(findUnit(state, "pioneer-target").alive, false);
});

test("Pioneer last stand triggers from Artillery secondary, Chemical, and reflect", () => {
  const artillery = makeUnit("pioneer-artillery", "player", "artillery", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0 });
  const main = makeUnit("pioneer-main", "enemy", "infantry", "front_center", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const behind = makeUnit("pioneer-behind", "enemy", "pioneer", "back_center", { hp: 10, maxHp: 100, defense: 0, battleBaseDefense: 0 });
  const artilleryResolved = resolveAttackAction(makeState([artillery, main, behind]), "player");
  assert.equal(findUnit(artilleryResolved, "pioneer-behind").hp, 1);
  assert.equal(findUnit(artilleryResolved, "pioneer-behind").pioneerLastStandUsed, true);

  const chemical = makeUnit("pioneer-chemical", "player", "chemical", "back_left", { attack: 100, battleBaseAttack: 100 });
  const chemicalTarget = makeUnit("pioneer-chemical-target", "enemy", "pioneer", "front_left", { hp: 10, maxHp: 100, defense: 0, battleBaseDefense: 0 });
  const chemicalResolved = resolveChemicalPassives(makeState([chemical, chemicalTarget]));
  assert.equal(findUnit(chemicalResolved, "pioneer-chemical-target").hp, 1);
  assert.equal(findUnit(chemicalResolved, "pioneer-chemical-target").pioneerLastStandUsed, true);

  const reflectingEngineer = makeUnit("reflect-engineer", "enemy", "engineer", "front_left", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const pioneerAttacker = makeUnit("reflect-pioneer", "player", "pioneer", "front_left", { hp: 20, maxHp: 100, attack: 100, battleBaseAttack: 100, defense: 0, critChance: 0 });
  const reflectResolved = resolveAttackAction(makeState([pioneerAttacker, reflectingEngineer]), "player");
  assert.equal(findUnit(reflectResolved, "reflect-pioneer").hp, 1);
  assert.equal(findUnit(reflectResolved, "reflect-pioneer").pioneerLastStandUsed, true);
});

test("Pioneer timed shield covers three next own Action Turns and expires alone", () => {
  const attacker = makeUnit("expiry-attacker", "player", "infantry", "front_left", { attack: 500, battleBaseAttack: 500, critChance: 0 });
  const pioneer = makeUnit("expiry-pioneer", "enemy", "pioneer", "front_left", { hp: 100, maxHp: 100, defense: 0, battleBaseDefense: 0 });
  let state = resolveAttackAction(makeState([attacker, pioneer]), "player");
  findUnit(state, "expiry-pioneer").shields.push({ sourceUnitId: "other", amount: 5 });
  assert.equal(findUnit(state, "expiry-pioneer").shields.length, 2);
  state = resolveActionTurnCompletion(state, pioneer.instanceId);
  assert.equal(findUnit(state, "expiry-pioneer").shields.some((shield) => shield.kind === "pioneer_tenacity"), true);
  state = resolveActionTurnCompletion(state, pioneer.instanceId);
  assert.equal(findUnit(state, "expiry-pioneer").shields.some((shield) => shield.kind === "pioneer_tenacity"), true);
  state = resolveActionTurnCompletion(state, pioneer.instanceId);
  assert.equal(findUnit(state, "expiry-pioneer").shields.some((shield) => shield.kind === "pioneer_tenacity"), false);
  assert.equal(findUnit(state, "expiry-pioneer").shields.some((shield) => shield.sourceUnitId === "other"), true);
});


test("BattleUnit starts at zero Rage and HUD fill math handles normal and overflow Shield", () => {
  const unit = makeUnit("rage-start", "player", "infantry", "front_left");
  assert.equal(unit.rage, 0);
  assert.equal(unit.ultimateRageRequired, 60);
  assert.equal(unit.armorUltimateDefenseBonus, 0);
  assert.equal(unit.armorUltimateExpiresAfterActionTurn, null);
  assert.equal(getRageFillPercent(25, 50), 50);
  assert.deepEqual(getHealthShieldFill(600, 1_000, 200), {
    hpPercent: 60,
    shieldPercent: 20,
    overflowShieldPercent: 0,
  });
  assert.deepEqual(getHealthShieldFill(900, 1_000, 300), {
    hpPercent: 90,
    shieldPercent: 10,
    overflowShieldPercent: 20,
  });
});

test("only completed basic attacks grant Rage; passive, Reflect, heal and Shield sources do not", () => {
  const artillery = makeUnit("rage-artillery", "player", "artillery", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0 });
  const main = makeUnit("rage-main", "enemy", "infantry", "front_center", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const behind = makeUnit("rage-behind", "enemy", "medic", "back_center", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const artilleryResolved = resolveAttackAction(makeState([artillery, main, behind]), "player");
  assert.equal(findUnit(artilleryResolved, artillery.instanceId).rage, BASIC_ATTACK_RAGE_GAIN);
  assert.equal(artilleryResolved.events.filter((entry) => entry.type === "rage_gained").length, 1);
  assert.equal(artilleryResolved.events.filter((entry) => entry.type === "artillery_aoe").length, 1);

  const attacker = makeUnit("rage-reflect-attacker", "player", "infantry", "front_left", { hp: 500, maxHp: 500, attack: 100, battleBaseAttack: 100, critChance: 0 });
  const engineer = makeUnit("rage-reflector", "enemy", "engineer", "front_left", { hp: 500, maxHp: 500, defense: 0 });
  const reflected = resolveAttackAction(makeState([attacker, engineer]), "player");
  assert.equal(findUnit(reflected, attacker.instanceId).rage, BASIC_ATTACK_RAGE_GAIN);
  assert.equal(findUnit(reflected, engineer.instanceId).rage, 0);

  const chemical = makeUnit("rage-chemical", "player", "chemical", "back_left", { attack: 20, battleBaseAttack: 20 });
  const chemicalTarget = makeUnit("rage-chemical-target", "enemy", "infantry", "front_left", { hp: 2_000, maxHp: 2_000, defense: 0 });
  const chemicalResolved = resolveChemicalPassives(makeState([chemical, chemicalTarget]));
  assert.equal(findUnit(chemicalResolved, chemical.instanceId).rage, 0);

  const medic = makeUnit("rage-medic", "player", "medic", "back_left");
  const hurtAlly = makeUnit("rage-hurt-ally", "player", "infantry", "front_left", { hp: 500, maxHp: 1_000 });
  const medicEnemy = makeUnit("rage-medic-enemy", "enemy", "infantry", "front_left", { hp: 2_000, maxHp: 2_000 });
  const medicResolved = resolveActionTurnCompletion(makeState([medic, hurtAlly, medicEnemy]), medic.instanceId);
  assert.equal(findUnit(medicResolved, medic.instanceId).rage, 0);

  const guard = makeUnit("rage-guard", "player", "guard", "front_left");
  const guardAlly = makeUnit("rage-guard-ally", "player", "infantry", "front_center", { hp: 500, maxHp: 1_000 });
  const guardEnemy = makeUnit("rage-guard-enemy", "enemy", "infantry", "front_left", { hp: 2_000, maxHp: 2_000 });
  const guardResolved = resolveGuardPassives(makeState([guard, guardAlly, guardEnemy]));
  assert.equal(findUnit(guardResolved, guard.instanceId).rage, 0);
});

test("basic stage fills Rage and marks Ultimate ready without casting until the Ultimate stage", () => {
  const config = getUltimateConfig("artillery");
  const artillery = makeUnit("deferred-artillery", "player", "artillery", "back_left", {
    attack: 100,
    battleBaseAttack: 100,
    critChance: 0,
    rage: config.ultimateRageRequired - BASIC_ATTACK_RAGE_GAIN,
  });
  const main = makeUnit("deferred-main", "enemy", "infantry", "front_center", { hp: 2_000, maxHp: 2_000, defense: 0 });
  const behind = makeUnit("deferred-behind", "enemy", "medic", "back_center", { hp: 2_000, maxHp: 2_000, defense: 0 });
  const afterBasic = resolveAttackAction(makeState([artillery, main, behind]), "player");
  assert.equal(findUnit(afterBasic, artillery.instanceId).rage, config.ultimateRageRequired);
  assert.equal(afterBasic.events.some((entry) => entry.type === "ultimate_ready"), true);
  assert.equal(afterBasic.events.some((entry) => entry.type === "ultimate_started"), false);

  const afterUltimate = resolveUltimateAction(afterBasic, artillery.instanceId);
  assert.equal(afterUltimate.events.some((entry) => entry.type === "ultimate_started"), true);
  assert.equal(afterUltimate.events.some((entry) => entry.type === "ultimate_completed"), true);
  assert.equal(findUnit(afterUltimate, artillery.instanceId).rage, 0);
});

test("Quyết Tâm Bất Diệt requires 60 Rage, heals 20 percent missing HP and consumes Rage", () => {
  assert.equal(getUltimateConfig("infantry").ultimateRageRequired, 60);
  const enemy = makeUnit("p4-infantry-ult-enemy", "enemy", "medic", "front_left", { hp: 10_000, maxHp: 10_000 });
  const short = makeUnit("p4-infantry-short", "player", "infantry", "front_left", { hp: 400, maxHp: 1_000, rage: 59 });
  const notCast = resolveUltimateAction(makeState([short, enemy]), short.instanceId);
  assert.equal(findUnit(notCast, short.instanceId).hp, 400);
  assert.equal(findUnit(notCast, short.instanceId).rage, 59);
  assert.equal(notCast.events.some((event) => event.type === "ultimate_started"), false);

  const ready = makeUnit("p4-infantry-ready", "player", "infantry", "front_left", { hp: 400, maxHp: 1_000, rage: 60 });
  const cast = resolveUltimateAction(makeState([ready, enemy]), ready.instanceId);
  assert.equal(findUnit(cast, ready.instanceId).hp, 520);
  assert.equal(findUnit(cast, ready.instanceId).rage, 0);
  assert.equal(cast.events.find((event) => event.type === "heal" && event.sourceUnitId === ready.instanceId)?.amount, 120);
  const protection = findUnit(cast, ready.instanceId).statuses.find((status) => status.type === "infantry_death_refusal");
  assert.equal(protection?.amount, 100);
  assert.equal(protection?.expiresAfterSourceActionTurn, 3);
  assert.equal(protection?.durationClock, "source_action_turn");
});

test("Quyết Tâm Bất Diệt protects the HP floor for exactly two next own Action Turns", () => {
  const infantry = makeUnit("p4-infantry-floor", "player", "infantry", "front_left", { hp: 250, maxHp: 1_000, rage: 60 });
  const enemy = makeUnit("p4-infantry-floor-enemy", "enemy", "medic", "front_left", { hp: 10_000, maxHp: 10_000 });
  let state = resolveUltimateAction(makeState([infantry, enemy]), infantry.instanceId);
  const protectedUnit = findUnit(state, infantry.instanceId);
  assert.equal(protectedUnit.hp, 400);
  const first = applyShieldAndHpDamage(protectedUnit, 1_000);
  assert.equal(protectedUnit.hp, 100);
  assert.equal(first.hpDamage, 300);
  assert.equal(first.absorbed, 0);
  assert.equal(protectedUnit.shields.length, 0);
  const second = applyShieldAndHpDamage(protectedUnit, 1_000);
  assert.equal(second.hpDamage, 0);
  assert.equal(protectedUnit.hp, 100);

  state = resolveActionTurnCompletion(state, infantry.instanceId);
  const stillProtected = findUnit(state, infantry.instanceId);
  assert.equal(stillProtected.statuses.some((status) => status.type === "infantry_death_refusal"), true);
  applyShieldAndHpDamage(stillProtected, 1_000);
  assert.equal(stillProtected.hp, 100);
  state = resolveActionTurnCompletion(state, infantry.instanceId);
  assert.equal(findUnit(state, infantry.instanceId).statuses.some((status) => status.type === "infantry_death_refusal"), true);
  state = resolveActionTurnCompletion(state, infantry.instanceId);
  const expired = findUnit(state, infantry.instanceId);
  assert.equal(expired.statuses.some((status) => status.type === "infantry_death_refusal"), false);
  applyShieldAndHpDamage(expired, 1_000);
  assert.equal(expired.hp, 0);
});

test("Quyết Tâm Bất Diệt below ten percent never raises HP when healing is blocked", () => {
  const infantry = makeUnit("p4-infantry-low-floor", "player", "infantry", "front_left", {
    hp: 70,
    maxHp: 1_000,
    rage: 60,
    statuses: [{
      id: "p4-heal-block",
      sourceUnitId: "enemy",
      type: "healing_reduction",
      polarity: "debuff",
      cleansable: true,
      stackPolicy: "refresh",
      healingReceivedMultiplier: 0,
    }],
  });
  const enemy = makeUnit("p4-infantry-low-enemy", "enemy", "medic", "front_left", { hp: 10_000, maxHp: 10_000 });
  const state = resolveUltimateAction(makeState([infantry, enemy]), infantry.instanceId);
  const protectedUnit = findUnit(state, infantry.instanceId);
  assert.equal(protectedUnit.hp, 70);
  assert.equal(state.events.some((event) => event.type === "heal" && event.sourceUnitId === infantry.instanceId), false);
  assert.equal(protectedUnit.statuses.find((status) => status.type === "infantry_death_refusal")?.amount, 70);
  applyShieldAndHpDamage(protectedUnit, 999);
  assert.equal(protectedUnit.hp, 70);
});

test("Infantry HP floor also protects against Chemical, Reflect and Ultimate shared damage paths", () => {
  const infantry = makeUnit("p4-floor-integrated", "player", "infantry", "front_left", { hp: 150, maxHp: 1_000, rage: 60, attack: 500, battleBaseAttack: 500, critChance: 0 });
  const engineer = makeUnit("p4-floor-engineer", "enemy", "engineer", "front_left", { hp: 10_000, maxHp: 10_000, defense: 0 });
  let state = resolveUltimateAction(makeState([infantry, engineer]), infantry.instanceId);
  const floor = findUnit(state, infantry.instanceId).statuses.find((status) => status.type === "infantry_death_refusal")?.amount;
  assert.equal(floor, 100);
  state = resolveAttackAction(state, "player");
  assert.ok(findUnit(state, infantry.instanceId).hp >= 100, "Reflect cannot bypass HP floor");

  const chemical = makeUnit("p4-floor-chemical", "enemy", "chemical", "back_left", { attack: 10_000, battleBaseAttack: 10_000 });
  const protectedForChemical = findUnit(state, infantry.instanceId);
  const chemicalState = resolveChemicalPassives(makeState([protectedForChemical, chemical]));
  assert.equal(findUnit(chemicalState, infantry.instanceId).hp, 100, "Chemical cannot bypass HP floor");

  const antiTank = makeUnit("p4-floor-anti", "enemy", "anti_tank", "front_left", { attack: 10_000, battleBaseAttack: 10_000, critChance: 0, rage: 50 });
  const protectedForUltimate = findUnit(state, infantry.instanceId);
  const ultimateState = resolveUltimateAction(makeState([protectedForUltimate, antiTank]), antiTank.instanceId);
  assert.equal(findUnit(ultimateState, infantry.instanceId).hp, 100, "Ultimate cannot bypass HP floor");
});

test("Artillery Ultimate fires up to three 45 percent volleys and skips targets killed earlier", () => {
  const artillery = makeUnit("ult-artillery", "player", "artillery", "back_left", {
    attack: 100,
    battleBaseAttack: 100,
    critChance: 0,
    rage: 60,
  });
  const fragile = makeUnit("ult-artillery-fragile", "enemy", "infantry", "front_left", { hp: 50, maxHp: 50, defense: 0 });
  const durable = makeUnit("ult-artillery-durable", "enemy", "infantry", "front_center", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const resolved = resolveUltimateAction(makeState([artillery, fragile, durable]), artillery.instanceId);
  const hits = resolved.events.filter((entry) => entry.type === "ultimate_hit");
  assert.equal(hits.filter((entry) => entry.targetUnitIds?.[0] === fragile.instanceId).length, 2);
  assert.equal(hits.filter((entry) => entry.targetUnitIds?.[0] === durable.instanceId).length, 3);
  assert.equal(findUnit(resolved, durable.instanceId).hp, 865);
  assert.deepEqual([...new Set(hits.map((entry) => entry.hitIndex))], [1, 2, 3]);
});

test("Artillery Ultimate rolls CRIT independently for every target in every volley", () => {
  const artillery = makeUnit("ult-artillery-crit", "player", "artillery", "back_left", {
    attack: 10,
    battleBaseAttack: 10,
    critChance: 0.5,
    rage: 60,
  });
  const enemies = [
    makeUnit("ult-artillery-crit-a", "enemy", "infantry", "front_left", { hp: 5_000, maxHp: 5_000, defense: 0 }),
    makeUnit("ult-artillery-crit-b", "enemy", "infantry", "front_center", { hp: 5_000, maxHp: 5_000, defense: 0 }),
  ];
  const state = makeState([artillery, ...enemies]);
  state.rngState = 123456789;
  const expected: boolean[] = [];
  let rng = state.rngState;
  for (let i = 0; i < 6; i += 1) {
    const roll = nextSeededRandom(rng);
    rng = roll.state;
    expected.push(roll.value < 0.5);
  }
  const resolved = resolveUltimateAction(state, artillery.instanceId);
  assert.deepEqual(resolved.events.filter((entry) => entry.type === "ultimate_hit").map((entry) => Boolean(entry.critical)), expected);
});

test("Armor Thế Thủ adds 100 percent reference DEF for three next own Action Turns", () => {
  const armor = makeUnit("ultimate-armor", "player", "armor", "front_left", {
    defense: 80,
    battleBaseDefense: 80,
    rage: 50,
  });
  const enemy = makeUnit("ultimate-armor-enemy", "enemy", "infantry", "front_left", { hp: 10_000, maxHp: 10_000 });
  let state = resolveUltimateAction(makeState([armor, enemy]), armor.instanceId);
  assert.equal(findUnit(state, armor.instanceId).defense, 160);
  assert.equal(findUnit(state, armor.instanceId).armorUltimateDefenseBonus, 80);
  assert.equal(findUnit(state, armor.instanceId).armorUltimateExpiresAfterActionTurn, 4);
  state = resolveActionTurnCompletion(state, armor.instanceId);
  assert.equal(findUnit(state, armor.instanceId).defense, 160);
  state = resolveActionTurnCompletion(state, armor.instanceId);
  assert.equal(findUnit(state, armor.instanceId).defense, 160);
  state = resolveActionTurnCompletion(state, armor.instanceId);
  assert.equal(findUnit(state, armor.instanceId).defense, 160);
  state = resolveActionTurnCompletion(state, armor.instanceId);
  assert.equal(findUnit(state, armor.instanceId).defense, 80);
  assert.equal(findUnit(state, armor.instanceId).armorUltimateDefenseBonus, 0);
});

test("Armor Thế Thủ recast refreshes duration without exponential stacking", () => {
  const armor = makeUnit("ultimate-armor-recast", "player", "armor", "front_left", {
    defense: 80,
    battleBaseDefense: 80,
    rage: 50,
  });
  const enemy = makeUnit("ultimate-armor-recast-enemy", "enemy", "infantry", "front_left", { hp: 10_000, maxHp: 10_000 });
  let state = resolveUltimateAction(makeState([armor, enemy]), armor.instanceId);
  findUnit(state, armor.instanceId).actionTurnCount = 2;
  findUnit(state, armor.instanceId).rage = 50;
  state = resolveUltimateAction(state, armor.instanceId);
  assert.equal(findUnit(state, armor.instanceId).defense, 160);
  assert.equal(findUnit(state, armor.instanceId).armorUltimateDefenseBonus, 80);
  assert.equal(findUnit(state, armor.instanceId).armorUltimateExpiresAfterActionTurn, 6);
});

test("Armor Thế Thủ remains compatible with Giáp Phản Ứng and corrosion preserves its separate bonus", () => {
  const armor = makeUnit("ultimate-armor-passive", "enemy", "armor", "front_left", {
    defense: 100,
    battleBaseDefense: 100,
    rage: 50,
    hp: 10_000,
    maxHp: 10_000,
  });
  const ally = makeUnit("ultimate-armor-passive-ally", "player", "infantry", "front_left", { attack: 100, battleBaseAttack: 100 });
  let state = resolveUltimateAction(makeState([armor, ally]), armor.instanceId);
  const buffed = findUnit(state, armor.instanceId);
  assert.equal(buffed.passiveId, "armor_early_reduction");
  assert.ok(calculateMitigatedDamage(100, ally, buffed, 1) < calculateMitigatedDamage(100, ally, { ...buffed, passiveId: "medic_casualty_care" }, 1));

  const chemical = makeUnit("ultimate-armor-chemical", "player", "chemical", "back_left", { attack: 1, battleBaseAttack: 1 });
  state = resolveChemicalPassives(makeState([chemical, buffed]));
  assert.equal(findUnit(state, armor.instanceId).corrosionStacks, 1);
  assert.equal(findUnit(state, armor.instanceId).defense, 195);
});

test("Commando Ultimate targets lowest HP percent in backline before front line", () => {
  const commando = makeUnit("commando-selector", "player", "commando", "back_left");
  const backHigh = makeUnit("commando-back-high", "enemy", "infantry", "back_left", { hp: 800, maxHp: 1_000 });
  const backLow = makeUnit("commando-back-low", "enemy", "infantry", "back_center", { hp: 300, maxHp: 1_000 });
  const frontLow = makeUnit("commando-front-low", "enemy", "infantry", "front_left", { hp: 100, maxHp: 1_000 });
  let selection = selectCommandoUltimateTarget([commando, backHigh, backLow, frontLow], commando, 123);
  assert.equal(selection.target?.instanceId, backLow.instanceId);
  const deadBackHigh = { ...backHigh, hp: 0, alive: false };
  const deadBackLow = { ...backLow, hp: 0, alive: false };
  selection = selectCommandoUltimateTarget([commando, deadBackHigh, deadBackLow, frontLow], commando, 123);
  assert.equal(selection.target?.instanceId, frontLow.instanceId);
});

test("Commando Ultimate uses 140 percent ATK plus 30 percent target missing HP before mitigation", () => {
  const commando = makeUnit("commando-formula", "player", "commando", "back_left", {
    attack: 200,
    battleBaseAttack: 200,
    critChance: 0,
    rage: 40,
  });
  const target = makeUnit("commando-formula-target", "enemy", "infantry", "back_left", { hp: 600, maxHp: 1_000, defense: 0 });
  const state = makeState([commando, target]);
  state.round = 5;
  const resolved = resolveUltimateAction(state, commando.instanceId);
  assert.equal(resolved.events.find((entry) => entry.type === "ultimate_hit")?.amount, 400);
});

test("Commando Ultimate chains across at most two targets", () => {
  const commando = makeUnit("commando-chain", "player", "commando", "back_left", {
    attack: 200,
    battleBaseAttack: 200,
    critChance: 0,
    rage: 40,
  });
  const a = makeUnit("commando-chain-a", "enemy", "infantry", "back_left", { hp: 100, maxHp: 1_000, defense: 0 });
  const b = makeUnit("commando-chain-b", "enemy", "infantry", "back_center", { hp: 120, maxHp: 1_000, defense: 0 });
  const c = makeUnit("commando-chain-c", "enemy", "infantry", "front_left", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const state = makeState([commando, a, b, c]);
  state.round = 5;
  const resolved = resolveUltimateAction(state, commando.instanceId);
  const hits = resolved.events.filter((entry) => entry.type === "ultimate_hit");
  assert.equal(hits.length, 2);
  assert.equal(resolved.events.filter((entry) => entry.type === "ultimate_kill_chain").length, 1);
  assert.equal(findUnit(resolved, c.instanceId).hp, 1_000);
  assert.equal(findUnit(resolved, commando.instanceId).rage, 0);
});

test("Commando ends immediately after Hit 1 kills a solo Boss", () => {
  const commando = makeUnit("commando-solo-boss", "player", "commando", "back_left", {
    attack: 200,
    battleBaseAttack: 200,
    critChance: 0,
    rage: 40,
  });
  const boss = makeUnit("commando-solo-boss-target", "enemy", "armor", "front_center", {
    hp: 100,
    maxHp: 10_000,
    defense: 0,
    isBoss: true,
  });
  const resolved = resolveUltimateAction(makeState([commando, boss]), commando.instanceId);
  assert.equal(resolved.outcome, "player_victory");
  assert.equal(resolved.events.filter((entry) => entry.type === "ultimate_hit").length, 1);
  assert.equal(resolved.events.filter((entry) => entry.type === "ultimate_kill_chain").length, 0);
});

test("Commando chain rolls CRIT independently for every slash", () => {
  const commando = makeUnit("commando-chain-crit", "player", "commando", "back_left", {
    attack: 100,
    battleBaseAttack: 100,
    critChance: 0.5,
    actionTurnCount: 3,
    rage: 40,
  });
  const enemies = [
    makeUnit("commando-chain-crit-a", "enemy", "infantry", "back_left", { hp: 1, maxHp: 1_000, defense: 0 }),
    makeUnit("commando-chain-crit-b", "enemy", "infantry", "back_center", { hp: 2, maxHp: 1_000, defense: 0 }),
    makeUnit("commando-chain-crit-c", "enemy", "infantry", "front_left", { hp: 3, maxHp: 1_000, defense: 0 }),
  ];
  const state = makeState([commando, ...enemies]);
  state.rngState = 246813579;
  const expected: boolean[] = [];
  let rng = state.rngState;
  for (let i = 0; i < 2; i += 1) {
    const roll = nextSeededRandom(rng);
    rng = roll.state;
    expected.push(roll.value < 0.5);
  }
  const resolved = resolveUltimateAction(state, commando.instanceId);
  assert.deepEqual(resolved.events.filter((entry) => entry.type === "ultimate_hit").map((entry) => Boolean(entry.critical)), expected);
});

test("Ultimate Rage resets only when a valid cast commits", () => {
  const commando = makeUnit("no-target-commando", "player", "commando", "back_left", { rage: 40 });
  const deadEnemy = makeUnit("no-target-dead", "enemy", "infantry", "front_left", { hp: 0, alive: false });
  const state = makeState([commando, deadEnemy]);
  state.outcome = null;
  const noTarget = resolveUltimateAction(state, commando.instanceId);
  assert.equal(findUnit(noTarget, commando.instanceId).rage, 40);
  assert.equal(noTarget.events.some((entry) => entry.type === "ultimate_started"), false);

});

test("a basic attacker killed by Reflect cannot become Ultimate-ready", () => {
  const config = getUltimateConfig("infantry");
  const attacker = makeUnit("dead-before-ultimate", "player", "infantry", "front_left", {
    hp: 20,
    maxHp: 20,
    attack: 100,
    battleBaseAttack: 100,
    critChance: 0,
    rage: config.ultimateRageRequired - BASIC_ATTACK_RAGE_GAIN,
  });
  const engineer = makeUnit("lethal-reflector", "enemy", "engineer", "front_left", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const resolved = resolveAttackAction(makeState([attacker, engineer]), "player");
  assert.equal(findUnit(resolved, attacker.instanceId).alive, false);
  assert.equal(resolved.events.some((entry) => entry.type === "ultimate_ready"), false);
  assert.equal(resolved.events.some((entry) => entry.type === "ultimate_started"), false);
});

test("a basic attack that ends the battle does not queue a meaningless Ultimate", () => {
  const config = getUltimateConfig("infantry");
  const attacker = makeUnit("finisher-before-ultimate", "player", "infantry", "front_left", {
    attack: 10_000,
    battleBaseAttack: 10_000,
    critChance: 0,
    rage: config.ultimateRageRequired - BASIC_ATTACK_RAGE_GAIN,
  });
  const target = makeUnit("last-target", "enemy", "infantry", "front_left", { hp: 1, maxHp: 1, defense: 0 });
  const resolved = resolveAttackAction(makeState([attacker, target]), "player");
  assert.equal(resolved.outcome, "player_victory");
  assert.equal(resolved.events.some((entry) => entry.type === "ultimate_ready"), false);
});



test("Ultimate catalog includes unified-timeline rebalance thresholds", () => {
  assert.equal(getUltimateConfig("infantry").ultimateRageRequired, 60);
  assert.equal(getUltimateConfig("artillery").ultimateRageRequired, 60);
  assert.equal(getUltimateConfig("armor").ultimateRageRequired, 50);
  assert.equal(getUltimateConfig("commando").ultimateRageRequired, 40);
  assert.equal(getUltimateConfig("air_force").ultimateRageRequired, 40);
  assert.equal(getUltimateConfig("medic").ultimateRageRequired, 60);
  assert.equal(getUltimateConfig("anti_tank").ultimateRageRequired, 50);
  assert.equal(getUltimateConfig("engineer").ultimateRageRequired, 50);
  assert.equal(getUltimateConfig("chemical").ultimateRageRequired, 60);
  assert.equal(getUltimateConfig("guard").ultimateRageRequired, 60);
  assert.equal(getUltimateConfig("pioneer").ultimateRageRequired, 40);
  assert.equal(getUltimateConfig("forensic_medic").ultimateRageRequired, 50);
  for (const troopType of ["infantry", "artillery", "armor", "commando", "medic", "anti_tank", "engineer", "chemical", "air_force", "guard", "pioneer"] as const) {
    assert.equal(getUltimateConfig(troopType).implemented, true);
  }
});

test("Air Force basic targeting prioritizes front row and stays seeded-deterministic", () => {
  const air = makeUnit("p4-air-targeter", "player", "air_force", "back_left");
  const front = makeUnit("p4-air-front", "enemy", "medic", "front_left");
  const backA = makeUnit("p4-air-back-a", "enemy", "medic", "back_left");
  const backB = makeUnit("p4-air-back-b", "enemy", "medic", "back_center");
  const first = selectTarget([air, front, backA, backB], air, 123456);
  const replay = selectTarget([air, front, backA, backB], air, 123456);
  assert.equal(first.target?.instanceId, front.instanceId);
  assert.equal(first.target?.instanceId, replay.target?.instanceId);
  assert.equal(first.rngState, replay.rngState);
  const deadBackA = { ...backA, hp: 0, alive: false };
  const deadBackB = { ...backB, hp: 0, alive: false };
  assert.equal(selectTarget([air, front, deadBackA, deadBackB], air, 123456).target?.instanceId, front.instanceId);
});

test("Air Force stores last damaged enemy per unit and Guided Missile reuses that living target", () => {
  const air = makeUnit("p4-air-memory", "player", "air_force", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0 });
  const backA = makeUnit("p4-air-memory-a", "enemy", "medic", "back_left", { hp: 5_000, maxHp: 5_000, defense: 0 });
  const backB = makeUnit("p4-air-memory-b", "enemy", "medic", "back_center", { hp: 5_000, maxHp: 5_000, defense: 0 });
  let state = resolveAttackAction(makeState([air, backA, backB], "p4-air-memory-seed"), "player");
  const basicTarget = state.events.find((event) => event.type === "attack" && event.sourceUnitId === air.instanceId)?.targetUnitIds?.[0];
  assert.ok(basicTarget);
  assert.equal(findUnit(state, air.instanceId).lastDamagedEnemyId, basicTarget);
  findUnit(state, air.instanceId).rage = 40;
  state = resolveUltimateAction(state, air.instanceId);
  const ultimateTarget = [...state.events].reverse().find((event) => event.type === "ultimate_hit" && event.sourceUnitId === air.instanceId)?.targetUnitIds?.[0];
  assert.equal(ultimateTarget, basicTarget);

  const airA = makeUnit("p4-air-a", "player", "air_force", "back_left", { lastDamagedEnemyId: backA.instanceId });
  const airB = makeUnit("p4-air-b", "player", "air_force", "back_center", { lastDamagedEnemyId: backB.instanceId });
  assert.equal(selectAirForceUltimateTarget([airA, airB, backA, backB], airA, 1).target?.instanceId, backA.instanceId);
  assert.equal(selectAirForceUltimateTarget([airA, airB, backA, backB], airB, 1).target?.instanceId, backB.instanceId);
});

test("Guided Missile falls back from dead memory to the valid front-first target", () => {
  const air = makeUnit("p4-air-fallback", "player", "air_force", "back_left", { lastDamagedEnemyId: "p4-air-dead" });
  const dead = makeUnit("p4-air-dead", "enemy", "medic", "back_right", { hp: 0, alive: false });
  const backA = makeUnit("p4-air-fallback-a", "enemy", "medic", "back_left");
  const backB = makeUnit("p4-air-fallback-b", "enemy", "medic", "back_center");
  const front = makeUnit("p4-air-fallback-front", "enemy", "medic", "front_left");
  const first = selectAirForceUltimateTarget([air, dead, backA, backB, front], air, 777);
  const replay = selectAirForceUltimateTarget([air, dead, backA, backB, front], air, 777);
  assert.equal(first.target?.instanceId, front.instanceId);
  assert.equal(first.target?.instanceId, replay.target?.instanceId);
  assert.equal(first.rngState, replay.rngState);
});

test("Guided Missile uses current ATK times 120 percent plus eight percent per stack", () => {
  const target = makeUnit("p4-air-formula-target", "enemy", "medic", "back_left", { hp: 20_000, maxHp: 20_000, defense: 0 });
  for (const [stacks, currentAttack, expected] of [[0, 100, 120], [7, 135, 238], [10, 150, 300]] as const) {
    const air = makeUnit(`p4-air-formula-${stacks}`, "player", "air_force", "back_left", {
      attack: currentAttack,
      battleBaseAttack: 100,
      passiveStacks: stacks,
      critChance: 0,
      rage: 40,
      lastDamagedEnemyId: target.instanceId,
    });
    const resolved = resolveUltimateAction(makeState([air, target]), air.instanceId);
    assert.equal(resolved.events.find((event) => event.type === "ultimate_hit" && event.sourceUnitId === air.instanceId)?.amount, expected);
  }
});

test("Guided Missile uses standard DEF and Shield pipeline", () => {
  const air = makeUnit("p4-air-pipeline", "player", "air_force", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0, rage: 40 });
  const target = makeUnit("p4-air-pipeline-target", "enemy", "medic", "back_left", {
    hp: 1_000,
    maxHp: 1_000,
    defense: 100,
    shields: [{ sourceUnitId: "guard", amount: 20 }],
  });
  air.lastDamagedEnemyId = target.instanceId;
  const resolved = resolveUltimateAction(makeState([air, target]), air.instanceId);
  const hit = resolved.events.find((event) => event.type === "ultimate_hit" && event.sourceUnitId === air.instanceId);
  assert.equal(hit?.amount, 60);
  assert.equal(hit?.shieldDamage, 20);
  assert.equal(hit?.hpDamage, 40);
});

test("Medic Ultimate selects two lowest-HP allies and resolves ties deterministically", () => {
  const medic = makeUnit("p3-medic-selector", "player", "medic", "back_left");
  const a = makeUnit("p3-medic-a", "player", "armor", "front_left", { hp: 200, maxHp: 1_000 });
  const b = makeUnit("p3-medic-b", "player", "engineer", "front_center", { hp: 300, maxHp: 1_000 });
  const c = makeUnit("p3-medic-c", "player", "guard", "front_right", { hp: 800, maxHp: 1_000 });
  const selected = selectMedicUltimateTargets([medic, a, b, c], medic, 12345);
  assert.deepEqual(selected.targets.map((unit) => unit.instanceId), [a.instanceId, b.instanceId]);

  const tiedA = { ...a, hp: 200 };
  const tiedB = { ...b, hp: 200 };
  const tiedC = { ...c, hp: 200 };
  const first = selectMedicUltimateTargets([medic, tiedA, tiedB, tiedC], medic, 987654321);
  const replay = selectMedicUltimateTargets([medic, tiedA, tiedB, tiedC], medic, 987654321);
  assert.equal(first.targets.length, 2);
  assert.equal(new Set(first.targets.map((unit) => unit.instanceId)).size, 2);
  assert.deepEqual(first.targets.map((unit) => unit.instanceId), replay.targets.map((unit) => unit.instanceId));
});

test("Medic Cứu Thương heals from Medic Max HP and clamps actual healing", () => {
  const medic = makeUnit("p3-medic-heal", "player", "medic", "back_left", { maxHp: 1_000, hp: 1_000, rage: 60 });
  const low = makeUnit("p3-medic-heal-low", "player", "armor", "front_left", { hp: 600, maxHp: 1_000 });
  const nearFull = makeUnit("p3-medic-heal-near", "player", "engineer", "front_center", { hp: 900, maxHp: 1_000 });
  const enemy = makeUnit("p3-medic-heal-enemy", "enemy", "infantry", "front_left", { hp: 10_000, maxHp: 10_000 });
  const resolved = resolveUltimateAction(makeState([medic, low, nearFull, enemy]), medic.instanceId);
  assert.equal(findUnit(resolved, low.instanceId).hp, 880);
  assert.equal(findUnit(resolved, nearFull.instanceId).hp, 1_000);
  assert.deepEqual(
    resolved.events.filter((event) => event.type === "heal" && event.ultimateId === medic.ultimateId).map((event) => event.amount).sort((x, y) => (x ?? 0) - (y ?? 0)),
    [100, 280]
  );
});

test("Boss 60 solo Medic cleanses then heals itself while normal solo Medics still cannot cast", () => {
  const boss = makeUnit("boss-60-medic", "enemy", "medic", "front_center", {
    bossId: "chief_medic",
    isBoss: true,
    maxHp: 1_000,
    hp: 400,
    rage: 60,
    statuses: [{
      id: "boss-60-anti-heal",
      sourceUnitId: "player-forensic",
      type: "forensic_suppression",
      polarity: "debuff",
      cleansable: true,
      stackPolicy: "refresh",
      healingReceivedMultiplier: 0.40,
      shieldReceivedMultiplier: 0.40,
    }],
  });
  const opponent = makeUnit("boss-60-opponent", "player", "infantry", "front_center", { hp: 10_000, maxHp: 10_000 });
  const resolved = resolveUltimateAction(makeState([boss, opponent]), boss.instanceId);
  const resolvedBoss = findUnit(resolved, boss.instanceId);
  assert.equal(resolvedBoss.hp, 680);
  assert.equal(resolvedBoss.rage, 0);
  assert.equal(resolvedBoss.statuses.some((status) => status.id === "boss-60-anti-heal"), false);
  const cleanseIndex = resolved.events.findIndex((event) => event.type === "debuff_cleansed" && event.targetUnitIds?.includes(boss.instanceId));
  const healIndex = resolved.events.findIndex((event) => event.type === "heal" && event.targetUnitIds?.includes(boss.instanceId));
  assert.ok(cleanseIndex >= 0 && healIndex > cleanseIndex);

  const normalMedic = makeUnit("normal-solo-medic", "enemy", "medic", "front_center", { hp: 400, maxHp: 1_000, rage: 60 });
  const blocked = resolveUltimateAction(makeState([normalMedic, opponent]), normalMedic.instanceId);
  assert.equal(findUnit(blocked, normalMedic.instanceId).hp, 400);
  assert.equal(findUnit(blocked, normalMedic.instanceId).rage, 60);
  assert.equal(blocked.events.some((event) => event.type === "ultimate_started"), false);
});

test("Medic cleanses Corrosion, DEF Down, Stun and healing reduction before healing while preserving buffs", () => {
  const medic = makeUnit("p3-medic-cleanse", "player", "medic", "back_left", { maxHp: 1_000, hp: 1_000, rage: 60 });
  const ally = makeUnit("p3-cleanse-engineer", "player", "engineer", "front_left", {
    hp: 600,
    maxHp: 1_000,
    defense: 65,
    battleBaseDefense: 100,
    corrosionStacks: 1,
    corrosionBaseDefense: 100,
    statuses: [
      {
        id: "p3-defense-down",
        sourceUnitId: "enemy-at",
        type: "anti_tank_defense_down",
        polarity: "debuff",
        cleansable: true,
        stackPolicy: "refresh",
        durationClock: "target_action_turn",
        appliedTargetActionTurn: 0,
        expiresAfterTargetActionTurn: 2,
        remainingActionTurns: 2,
        amount: 30,
      },
      {
        id: "p3-stun",
        sourceUnitId: "enemy-chemical",
        type: "stun",
        polarity: "debuff",
        cleansable: true,
        stackPolicy: "refresh",
        durationClock: "target_action_turn",
        appliedTargetActionTurn: 0,
        expiresAfterTargetActionTurn: 2,
        remainingActionTurns: 2,
      },
      {
        id: "p3-heal-reduction",
        sourceUnitId: "enemy-future",
        type: "healing_reduction",
        polarity: "debuff",
        cleansable: true,
        stackPolicy: "refresh",
        healingReceivedMultiplier: 0.5,
      },
      {
        id: "p3-beneficial-toughness",
        sourceUnitId: "p3-cleanse-engineer",
        type: "engineer_toughness",
        polarity: "buff",
        cleansable: false,
        stackPolicy: "refresh",
        durationClock: "source_action_turn",
        appliedSourceActionTurn: 0,
        expiresAfterSourceActionTurn: 2,
        remainingActionTurns: 1,
        reflectRatioOverride: 0.70,
      },
    ],
  });
  const enemy = makeUnit("p3-medic-cleanse-enemy", "enemy", "infantry", "front_left", { hp: 10_000, maxHp: 10_000 });
  const resolved = resolveUltimateAction(makeState([medic, ally, enemy]), medic.instanceId);
  const cleaned = findUnit(resolved, ally.instanceId);
  assert.equal(cleaned.hp, 880, "healing reduction is removed before the 280 heal");
  assert.equal(cleaned.corrosionStacks, 0);
  assert.equal(cleaned.corrosionBaseDefense, null);
  assert.equal(cleaned.defense, 100);
  assert.equal(cleaned.statuses.some((status) => status.type === "anti_tank_defense_down"), false);
  assert.equal(cleaned.statuses.some((status) => status.type === "stun"), false);
  assert.equal(cleaned.statuses.some((status) => status.type === "healing_reduction"), false);
  assert.equal(cleaned.statuses.some((status) => status.type === "engineer_toughness"), true);
  assert.ok(resolved.events.filter((event) => event.type === "debuff_cleansed").length >= 4);
});

function findStateWithSecondRollBelow(threshold: number): number {
  for (let candidate = 1; candidate < 100_000; candidate += 1) {
    const critRoll = nextSeededRandom(candidate);
    const stunRoll = nextSeededRandom(critRoll.state);
    if (stunRoll.value < threshold) return candidate;
  }
  throw new Error("Unable to find deterministic RNG state");
}

test("Medic cleanse grants no immunity; a later Chemical Ultimate can Stun again", () => {
  const medic = makeUnit("p3-no-immunity-medic", "player", "medic", "back_left", { rage: 60 });
  const ally = makeUnit("p3-no-immunity-ally", "player", "engineer", "front_left", {
    hp: 500,
    maxHp: 1_000,
    statuses: [{
      id: "p3-old-stun",
      sourceUnitId: "old-chemical",
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
  const dummyEnemy = makeUnit("p3-no-immunity-dummy", "enemy", "infantry", "front_left", { hp: 10_000, maxHp: 10_000 });
  const cleansed = resolveUltimateAction(makeState([medic, ally, dummyEnemy]), medic.instanceId);
  assert.equal(findUnit(cleansed, ally.instanceId).statuses.some((status) => status.type === "stun"), false);

  const chemical = makeUnit("p3-no-immunity-chemical", "enemy", "chemical", "back_left", { attack: 1, battleBaseAttack: 1, critChance: 0, rage: 60 });
  const cleanAlly = findUnit(cleansed, ally.instanceId);
  const secondState = makeState([chemical, cleanAlly]);
  secondState.rngState = findStateWithSecondRollBelow(0.40);
  const restunned = resolveUltimateAction(secondState, chemical.instanceId);
  assert.equal(findUnit(restunned, ally.instanceId).statuses.find((status) => status.type === "stun")?.remainingActionTurns, 2);
});

test("Anti-Tank Đạn Xuyên Phá uses exactly 120% ATK plus 23% Max HP with no passive double-dip", () => {
  const antiTank = makeUnit("p3-anti-formula", "player", "anti_tank", "front_left", { attack: 200, battleBaseAttack: 200, critChance: 0, rage: 50 });
  const target = makeUnit("p3-anti-formula-target", "enemy", "medic", "front_left", { hp: 1_000, maxHp: 1_000, defense: 0, battleBaseDefense: 0 });
  const resolved = resolveUltimateAction(makeState([antiTank, target]), antiTank.instanceId);
  assert.equal(resolved.events.find((event) => event.type === "ultimate_hit")?.amount, 470);
});

test("Anti-Tank Ultimate CRIT multiplies the whole raw hit before DEF", () => {
  const antiTank = makeUnit("p3-anti-crit", "player", "anti_tank", "front_left", { attack: 200, battleBaseAttack: 200, critChance: 1, rage: 50 });
  const target = makeUnit("p3-anti-crit-target", "enemy", "medic", "front_left", { hp: 1_000, maxHp: 1_000, defense: 0, battleBaseDefense: 0 });
  const resolved = resolveUltimateAction(makeState([antiTank, target]), antiTank.instanceId);
  assert.equal(resolved.events.find((event) => event.type === "ultimate_hit")?.amount, 893);
});

test("Anti-Tank DEF Down is 30 percent for two target Action Turns and restores exactly", () => {
  const antiTank = makeUnit("p3-anti-def", "player", "anti_tank", "front_left", { attack: 1, battleBaseAttack: 1, critChance: 0, rage: 50 });
  const target = makeUnit("p3-anti-def-target", "enemy", "armor", "front_left", { hp: 10_000, maxHp: 10_000, defense: 100, battleBaseDefense: 100 });
  let state = resolveUltimateAction(makeState([antiTank, target]), antiTank.instanceId);
  assert.equal(findUnit(state, target.instanceId).defense, 70);
  const status = findUnit(state, target.instanceId).statuses.find((entry) => entry.type === "anti_tank_defense_down");
  assert.equal(status?.amount, 30);
  assert.equal(status?.expiresAfterTargetActionTurn, 2);
  state = resolveActionTurnCompletion(state, target.instanceId);
  assert.equal(findUnit(state, target.instanceId).defense, 70);
  state = resolveActionTurnCompletion(state, target.instanceId);
  assert.equal(findUnit(state, target.instanceId).defense, 100);
  assert.equal(findUnit(state, target.instanceId).statuses.some((entry) => entry.type === "anti_tank_defense_down"), false);
});

test("Anti-Tank DEF Down recast refreshes without 100 to 70 to 49 stacking", () => {
  const antiTank = makeUnit("p3-anti-recast", "player", "anti_tank", "front_left", { attack: 1, battleBaseAttack: 1, critChance: 0, rage: 50 });
  const target = makeUnit("p3-anti-recast-target", "enemy", "armor", "front_left", { hp: 10_000, maxHp: 10_000, defense: 100, battleBaseDefense: 100 });
  let state = resolveUltimateAction(makeState([antiTank, target]), antiTank.instanceId);
  state = resolveActionTurnCompletion(state, target.instanceId);
  findUnit(state, antiTank.instanceId).rage = 50;
  state = resolveUltimateAction(state, antiTank.instanceId);
  assert.equal(findUnit(state, target.instanceId).defense, 70);
  const statuses = findUnit(state, target.instanceId).statuses.filter((entry) => entry.type === "anti_tank_defense_down");
  assert.equal(statuses.length, 1);
  assert.equal(statuses[0].amount, 30);
  assert.equal(statuses[0].expiresAfterTargetActionTurn, 3);
});

test("Medic immediately cleanses Anti-Tank DEF Down and restores DEF", () => {
  const antiTank = makeUnit("p3-cleanse-anti", "enemy", "anti_tank", "front_left", { attack: 1, battleBaseAttack: 1, critChance: 0, rage: 50 });
  const target = makeUnit("p3-cleanse-def-target", "player", "armor", "front_left", { hp: 900, maxHp: 1_000, defense: 100, battleBaseDefense: 100 });
  const medic = makeUnit("p3-cleanse-def-medic", "player", "medic", "back_left", { rage: 60 });
  let state = resolveUltimateAction(makeState([antiTank, target, medic]), antiTank.instanceId);
  assert.equal(findUnit(state, target.instanceId).defense, 70);
  state = resolveUltimateAction(state, medic.instanceId);
  assert.equal(findUnit(state, target.instanceId).defense, 100);
  assert.equal(findUnit(state, target.instanceId).statuses.some((entry) => entry.type === "anti_tank_defense_down"), false);
});

test("Engineer Lỳ Đòn heals 15 percent missing HP and applies one refreshable Toughness status", () => {
  const engineer = makeUnit("p3-engineer-heal", "player", "engineer", "front_left", { hp: 400, maxHp: 1_000, rage: 50 });
  const enemy = makeUnit("p3-engineer-heal-enemy", "enemy", "infantry", "front_left", { hp: 10_000, maxHp: 10_000 });
  let state = resolveUltimateAction(makeState([engineer, enemy]), engineer.instanceId);
  assert.equal(findUnit(state, engineer.instanceId).hp, 490);
  assert.equal(getEngineerReflectRatio(findUnit(state, engineer.instanceId)), 0.75);
  assert.equal(findUnit(state, engineer.instanceId).statuses.filter((status) => status.type === "engineer_toughness").length, 1);

  state = resolveActionTurnCompletion(state, engineer.instanceId);
  findUnit(state, engineer.instanceId).hp = 500;
  findUnit(state, engineer.instanceId).rage = 50;
  state = resolveUltimateAction(state, engineer.instanceId);
  assert.equal(findUnit(state, engineer.instanceId).hp, 575);
  const toughness = findUnit(state, engineer.instanceId).statuses.filter((status) => status.type === "engineer_toughness");
  assert.equal(toughness.length, 1);
  assert.equal(toughness[0].expiresAfterSourceActionTurn, 3);
  assert.equal(getEngineerReflectRatio(findUnit(state, engineer.instanceId)), 0.75);
});

test("Engineer Taunt overrides back-first basic and single-target Commando Ultimate", () => {
  const engineer = makeUnit("p3-taunt-engineer", "player", "engineer", "front_left", { hp: 5_000, maxHp: 5_000, rage: 50, defense: 0 });
  const ally = makeUnit("p3-taunt-back-ally", "player", "medic", "back_left", { hp: 100, maxHp: 1_000 });
  const commando = makeUnit("p3-taunt-commando", "enemy", "commando", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0, rage: 40 });
  let state = resolveUltimateAction(makeState([engineer, ally, commando]), engineer.instanceId);
  const basic = resolveAttackAction(state, "enemy");
  assert.equal([...basic.events].reverse().find((event) => event.type === "attack")?.targetUnitIds?.[0], engineer.instanceId);

  state = resolveUltimateAction(state, commando.instanceId);
  assert.equal([...state.events].reverse().find((event) => event.type === "ultimate_hit")?.targetUnitIds?.[0], engineer.instanceId);
});

test("Engineer Taunt does not collapse Chemical AoE into a single target", () => {
  const engineer = makeUnit("p3-taunt-aoe-engineer", "player", "engineer", "front_left", { hp: 5_000, maxHp: 5_000, rage: 50 });
  const ally = makeUnit("p3-taunt-aoe-ally", "player", "armor", "front_center", { hp: 5_000, maxHp: 5_000 });
  const chemical = makeUnit("p3-taunt-aoe-chemical", "enemy", "chemical", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0, rage: 60 });
  let state = resolveUltimateAction(makeState([engineer, ally, chemical]), engineer.instanceId);
  state = resolveUltimateAction(state, chemical.instanceId);
  assert.deepEqual(
    new Set(state.events.filter((event) => event.type === "ultimate_hit" && event.sourceUnitId === chemical.instanceId).flatMap((event) => event.targetUnitIds ?? [])),
    new Set([engineer.instanceId, ally.instanceId])
  );
});

test("Engineer Reflect is replaced by 75 percent during Lỳ Đòn and returns to 50 percent", () => {
  const engineer = makeUnit("p3-reflect-engineer", "player", "engineer", "front_left", { hp: 5_000, maxHp: 5_000, defense: 0, rage: 50 });
  const attacker = makeUnit("p3-reflect-attacker", "enemy", "medic", "front_left", { hp: 5_000, maxHp: 5_000, attack: 100, battleBaseAttack: 100, critChance: 0 });
  let state = resolveUltimateAction(makeState([engineer, attacker]), engineer.instanceId);
  state = resolveAttackAction(state, "enemy");
  assert.equal([...state.events].reverse().find((event) => event.type === "reflect")?.amount, 75);
  assert.equal(getEngineerReflectRatio(findUnit(state, engineer.instanceId)), 0.75);

  state = resolveActionTurnCompletion(state, engineer.instanceId);
  assert.equal(getEngineerReflectRatio(findUnit(state, engineer.instanceId)), 0.75);
  state = resolveActionTurnCompletion(state, engineer.instanceId);
  assert.equal(getEngineerReflectRatio(findUnit(state, engineer.instanceId)), 0.50);
  state = resolveAttackAction(state, "enemy");
  assert.equal([...state.events].reverse().find((event) => event.type === "reflect")?.amount, 50);
});

test("A dead Engineer immediately stops being a valid Taunt forced target", () => {
  const engineer = makeUnit("p3-dead-taunt", "player", "engineer", "front_left", { rage: 50 });
  const ally = makeUnit("p3-dead-taunt-ally", "player", "medic", "back_left");
  const enemy = makeUnit("p3-dead-taunt-enemy", "enemy", "commando", "back_left");
  let state = resolveUltimateAction(makeState([engineer, ally, enemy]), engineer.instanceId);
  const deadEngineer = findUnit(state, engineer.instanceId);
  deadEngineer.hp = 0;
  deadEngineer.alive = false;
  const selection = selectTarget(state.units, findUnit(state, enemy.instanceId), state.rngState);
  assert.equal(selection.target?.instanceId, ally.instanceId);
});

test("Chemical Bùng Nổ Độc Dược deals 35 percent ATK to every living enemy", () => {
  const chemical = makeUnit("p3-chemical-damage", "player", "chemical", "back_left", { attack: 200, battleBaseAttack: 200, critChance: 0, rage: 60 });
  const a = makeUnit("p3-chemical-damage-a", "enemy", "medic", "front_left", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const b = makeUnit("p3-chemical-damage-b", "enemy", "guard", "front_center", { hp: 1_000, maxHp: 1_000, defense: 0 });
  const resolved = resolveUltimateAction(makeState([chemical, a, b]), chemical.instanceId);
  assert.deepEqual(resolved.events.filter((event) => event.type === "ultimate_hit").map((event) => event.amount), [70, 70]);
});

test("Chemical Ultimate uses independent seeded CRIT and Stun rolls per target", () => {
  const chemical = makeUnit("p3-chemical-rng", "player", "chemical", "back_left", { attack: 100, battleBaseAttack: 100, critChance: 0.5, rage: 60 });
  const targets = [
    makeUnit("p3-chemical-rng-a", "enemy", "armor", "front_left", { hp: 10_000, maxHp: 10_000, defense: 0 }),
    makeUnit("p3-chemical-rng-b", "enemy", "engineer", "front_center", { hp: 10_000, maxHp: 10_000, defense: 0 }),
    makeUnit("p3-chemical-rng-c", "enemy", "guard", "front_right", { hp: 10_000, maxHp: 10_000, defense: 0 }),
  ];
  const state = makeState([chemical, ...targets]);
  state.rngState = 314159265;
  const expectedCrit: boolean[] = [];
  const expectedStun: string[] = [];
  let rng = state.rngState;
  for (const target of targets) {
    const critRoll = nextSeededRandom(rng);
    rng = critRoll.state;
    expectedCrit.push(critRoll.value < 0.5);
    const stunRoll = nextSeededRandom(rng);
    rng = stunRoll.state;
    if (stunRoll.value < 0.40) expectedStun.push(target.instanceId);
  }
  const resolved = resolveUltimateAction(state, chemical.instanceId);
  assert.deepEqual(resolved.events.filter((event) => event.type === "ultimate_hit").map((event) => Boolean(event.critical)), expectedCrit);
  assert.deepEqual(resolved.events.filter((event) => event.type === "stun_applied").flatMap((event) => event.targetUnitIds ?? []), expectedStun);
});

test("Stun skips exactly two own actions without attack, Rage gain or Ultimate, then expires", () => {
  const stunned = makeUnit("p3-stun-skip", "player", "infantry", "front_left", {
    rage: 50,
    statuses: [{
      id: "p3-two-action-stun",
      sourceUnitId: "p3-chemical-source",
      type: "stun",
      polarity: "debuff",
      cleansable: true,
      stackPolicy: "refresh",
      durationClock: "target_action_turn",
      appliedTargetActionTurn: 0,
      expiresAfterTargetActionTurn: 2,
      remainingActionTurns: 2,
    }],
  });
  const enemy = makeUnit("p3-stun-skip-enemy", "enemy", "armor", "front_left", { hp: 10_000, maxHp: 10_000 });
  let state = resolveAttackAction(makeState([stunned, enemy]), "player");
  state = resolveActionTurnCompletion(state, stunned.instanceId);
  assert.equal(state.events.filter((event) => event.type === "attack").length, 0);
  assert.equal(state.events.filter((event) => event.type === "rage_gained").length, 0);
  assert.equal(state.events.filter((event) => event.type === "ultimate_started").length, 0);
  assert.equal(findUnit(state, stunned.instanceId).rage, 50);
  assert.equal(findUnit(state, stunned.instanceId).statuses.find((status) => status.type === "stun")?.remainingActionTurns, 1);

  state = resolveAttackAction(state, "player");
  state = resolveActionTurnCompletion(state, stunned.instanceId);
  assert.equal(state.events.filter((event) => event.type === "action_skipped_stun").length, 2);
  assert.equal(findUnit(state, stunned.instanceId).statuses.some((status) => status.type === "stun"), false);
  assert.equal(findUnit(state, stunned.instanceId).rage, 50);
});

test("Stun preserves Armor Thế Thủ and reactive Engineer Reflect", () => {
  const armor = makeUnit("p3-stun-armor", "player", "armor", "front_left", {
    defense: 160,
    armorUltimateDefenseBonus: 80,
    armorUltimateExpiresAfterActionTurn: 3,
    statuses: [{
      id: "p3-stun-armor-status",
      sourceUnitId: "chem",
      type: "stun",
      polarity: "debuff",
      cleansable: true,
      stackPolicy: "refresh",
      durationClock: "target_action_turn",
      appliedTargetActionTurn: 0,
      expiresAfterTargetActionTurn: 2,
      remainingActionTurns: 2,
    }],
  });
  const armorEnemy = makeUnit("p3-stun-armor-enemy", "enemy", "infantry", "front_left");
  const armorSkipped = resolveAttackAction(makeState([armor, armorEnemy]), "player");
  assert.equal(findUnit(armorSkipped, armor.instanceId).defense, 160);
  assert.equal(findUnit(armorSkipped, armor.instanceId).armorUltimateDefenseBonus, 80);

  const engineer = makeUnit("p3-stun-reflect-engineer", "player", "engineer", "front_left", {
    hp: 5_000,
    maxHp: 5_000,
    defense: 0,
    statuses: [{
      id: "p3-stun-reflect-status",
      sourceUnitId: "chem",
      type: "stun",
      polarity: "debuff",
      cleansable: true,
      stackPolicy: "refresh",
      durationClock: "target_action_turn",
      appliedTargetActionTurn: 0,
      expiresAfterTargetActionTurn: 2,
      remainingActionTurns: 2,
    }],
  });
  const attacker = makeUnit("p3-stun-reflect-attacker", "enemy", "infantry", "front_left", { attack: 100, battleBaseAttack: 100, critChance: 0, defense: 0 });
  const reflected = resolveAttackAction(makeState([engineer, attacker]), "enemy");
  assert.equal(reflected.events.find((event) => event.type === "reflect")?.amount, 50);
});

test("Chemical Stun reapplication refreshes to two Action Turns instead of stacking", () => {
  const chemical = makeUnit("p3-stun-refresh-chemical", "enemy", "chemical", "back_left", { attack: 1, battleBaseAttack: 1, critChance: 0, rage: 60 });
  const target = makeUnit("p3-stun-refresh-target", "player", "armor", "front_left", {
    hp: 10_000,
    maxHp: 10_000,
    defense: 0,
    statuses: [{
      id: "p3-existing-stun",
      sourceUnitId: "old-chemical",
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
  const state = makeState([chemical, target]);
  state.rngState = findStateWithSecondRollBelow(0.40);
  const resolved = resolveUltimateAction(state, chemical.instanceId);
  const stuns = findUnit(resolved, target.instanceId).statuses.filter((status) => status.type === "stun");
  assert.equal(stuns.length, 1);
  assert.equal(stuns[0].remainingActionTurns, 2);
});

test("Medic can cleanse Stun immediately", () => {
  const medic = makeUnit("p3-stun-cleanse-medic", "player", "medic", "back_left", { rage: 60 });
  const ally = makeUnit("p3-stun-cleanse-ally", "player", "armor", "front_left", {
    hp: 500,
    maxHp: 1_000,
    statuses: [{
      id: "p3-cleanse-live-stun",
      sourceUnitId: "chem",
      type: "stun",
      polarity: "debuff",
      cleansable: true,
      stackPolicy: "refresh",
      durationClock: "target_action_turn",
      appliedTargetActionTurn: 0,
      expiresAfterTargetActionTurn: 2,
      remainingActionTurns: 2,
    }],
  });
  const enemy = makeUnit("p3-stun-cleanse-enemy", "enemy", "infantry", "front_left");
  const resolved = resolveUltimateAction(makeState([medic, ally, enemy]), medic.instanceId);
  assert.equal(findUnit(resolved, ally.instanceId).statuses.some((status) => status.type === "stun"), false);
  assert.equal(resolved.events.some((event) => event.type === "stun_removed"), true);
});

test("fixed Ultimate prep including Guided Missile stays at least one real second at every auto speed", () => {
  for (const troopType of ["medic", "anti_tank", "engineer", "chemical", "air_force"] as const) {
    assert.ok(getPhase3UltimateVfxDurationMs(troopType) >= 1000, `${troopType} fixed prep VFX`);
  }
});

console.log("CHIEN TUYEN V2 COMBAT TESTS PASSED");

import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  COMBAT_CONFIG,
  MAX_BARRACKS_LEVEL,
  getBarracksUpgradeDurationMs,
  getLevelUpgradeCost,
  getMaxBarracksLevel,
  getMaxBarracksLevelFromRankIndex,
  getQuickFinishCost,
  getRequiredRankIndexForBarracksLevel,
  getTrainingDurationMs,
  getTroopUpgradeDurationMs,
} from "./config";
import {
  applyShieldAndHpDamage,
  resolveActionTurnCompletion,
  resolveEndOfRound,
  resolveGrowthPassives,
  resolveUltimateAction,
} from "./combatEngine";
import {
  formatChienTuyenDurationForAriaMs,
  formatChienTuyenDurationSeconds,
} from "./durationFormat";
import { buildBattleUnitStatistics, createBattleFromUnits, createTroopBattleUnit } from "./engine";
import {
  createDefaultChienTuyenProfile,
  getTrainingCountForTroop,
  sanitizeChienTuyenProfile,
  startBarracksUpgrade,
  startTroopUpgrade,
} from "./profileEngine";
import { BarracksView } from "./components/BarracksView";
import {
  ARMOR_ULTIMATE_DEFENSE_BONUS_RATIO,
  ARMOR_ULTIMATE_ACTION_TURNS,
  ARTILLERY_ULTIMATE_WAVE_ATTACK_RATIO,
  ENGINEER_ULTIMATE_HEAL_MISSING_HP_RATIO,
  GUARD_ULTIMATE_SHIELD_MAX_HP_RATIO,
  INFANTRY_ULTIMATE_HEAL_MISSING_HP_RATIO,
  INFANTRY_ULTIMATE_PROTECTION_ACTION_TURNS,
  PIONEER_ULTIMATE_ATTACK_RATIO,
  PIONEER_ULTIMATE_STUN_CHANCE,
  getUltimateConfig,
} from "./ultimateConfig";
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
  slotId: FormationSlotId,
  overrides: Partial<BattleUnit> = {}
): BattleUnit {
  const base = createTroopBattleUnit({ instanceId, side, troopType, slotId, level: 1 });
  return {
    ...base,
    ...overrides,
    statuses: (overrides.statuses ?? base.statuses).map((status) => ({ ...status })),
    shields: (overrides.shields ?? base.shields).map((shield) => ({ ...shield })),
  };
}

function makeState(units: readonly BattleUnit[]): BattleState {
  sequence += 1;
  return createBattleFromUnits({ battleId: `phase6-${sequence}`, matchSeed: `phase6-${sequence}`, units });
}

function findUnit(state: BattleState, instanceId: string): BattleUnit {
  const unit = state.units.find((candidate) => candidate.instanceId === instanceId);
  assert.ok(unit, `Missing ${instanceId}`);
  return unit;
}

console.log("=== CHIEN TUYEN PHASE 6 UPDATE TESTS ===");

test("Phase 6 balance constants are canonical", () => {
  assert.equal(GUARD_ULTIMATE_SHIELD_MAX_HP_RATIO, 0.13);
  assert.equal(PIONEER_ULTIMATE_ATTACK_RATIO, 1.20);
  assert.equal(PIONEER_ULTIMATE_STUN_CHANCE, 0.70);
  assert.equal(getUltimateConfig("artillery").ultimateRageRequired, 60);
  assert.equal(ARTILLERY_ULTIMATE_WAVE_ATTACK_RATIO, 0.45);
  assert.equal(COMBAT_CONFIG.passives.airForceAttackPerStack, 0.04);
  assert.equal(ARMOR_ULTIMATE_DEFENSE_BONUS_RATIO, 1.0);
  assert.equal(ARMOR_ULTIMATE_ACTION_TURNS, 3);
  assert.equal(INFANTRY_ULTIMATE_HEAL_MISSING_HP_RATIO, 0.20);
  assert.equal(INFANTRY_ULTIMATE_PROTECTION_ACTION_TURNS, 2);
  assert.equal(ENGINEER_ULTIMATE_HEAL_MISSING_HP_RATIO, 0.15);
});

test("Guard MaxHP 2000 creates 260 Shield for every living ally for two next Action Turns", () => {
  const guard = makeUnit("p6-guard", "player", "guard", "front_left", { maxHp: 2_000, hp: 2_000, rage: 60 });
  const ally = makeUnit("p6-guard-ally", "player", "infantry", "front_center");
  const enemy = makeUnit("p6-guard-enemy", "enemy", "infantry", "front_left");
  const resolved = resolveUltimateAction(makeState([guard, ally, enemy]), guard.instanceId);
  for (const id of [guard.instanceId, ally.instanceId]) {
    const shield = findUnit(resolved, id).shields.find((entry) => entry.kind === "guard_ultimate");
    assert.equal(shield?.amount, 260);
    assert.equal(shield?.expiresAfterSourceActionTurn, 3);
  }
});

test("Pioneer ATK100 deals raw 120 with Rage40 and 70 percent stun", () => {
  const pioneer = makeUnit("p6-pioneer", "player", "pioneer", "front_left", {
    attack: 100, battleBaseAttack: 100, critChance: 0, rage: 40,
  });
  const target = makeUnit("p6-pioneer-target", "enemy", "infantry", "front_left", {
    hp: 1_000, maxHp: 1_000, defense: 0,
  });
  const resolved = resolveUltimateAction(makeState([pioneer, target]), pioneer.instanceId);
  assert.equal(getUltimateConfig("pioneer").ultimateRageRequired, 40);
  assert.equal(resolved.events.find((event) => event.type === "ultimate_hit")?.amount, 120);
  assert.equal(PIONEER_ULTIMATE_STUN_CHANCE, 0.70);
});

test("Artillery 59 Rage cannot cast, 60 can, and each ATK100 wave is raw45", () => {
  const target = makeUnit("p6-art-target", "enemy", "infantry", "front_left", {
    hp: 5_000, maxHp: 5_000, defense: 0,
  });
  const short = makeUnit("p6-art-short", "player", "artillery", "back_left", {
    attack: 100, battleBaseAttack: 100, critChance: 0, rage: 59,
  });
  assert.equal(resolveUltimateAction(makeState([short, target]), short.instanceId).events.some((event) => event.type === "ultimate_started"), false);
  const ready = makeUnit("p6-art-ready", "player", "artillery", "back_left", {
    attack: 100, battleBaseAttack: 100, critChance: 0, rage: 60,
  });
  const cast = resolveUltimateAction(makeState([ready, target]), ready.instanceId);
  assert.deepEqual(cast.events.filter((event) => event.type === "ultimate_hit").map((event) => event.amount), [45, 45, 45]);
});

test("Air Force stacks are +4 +20 +28 +40 percent, max10, non-compounding, with rebalanced Ultimate", () => {
  const air = makeUnit("p6-air", "player", "air_force", "back_left", {
    attack: 100, battleBaseAttack: 100, critChance: 0,
  });
  const enemy = makeUnit("p6-air-enemy", "enemy", "infantry", "front_left", {
    hp: 10_000, maxHp: 10_000, defense: 0,
  });
  let state = makeState([air, enemy]);
  const expected = new Map([[1, 104], [5, 120], [7, 128], [10, 140]]);
  for (let stack = 1; stack <= 11; stack += 1) {
    state = resolveGrowthPassives(state);
    const current = findUnit(state, air.instanceId);
    const capped = Math.min(stack, 10);
    if (expected.has(capped)) assert.equal(current.attack, expected.get(capped));
  }
  const grown = findUnit(state, air.instanceId);
  assert.equal(grown.passiveStacks, 10);
  assert.equal(grown.attack, 140);
  grown.rage = 40;
  grown.lastDamagedEnemyId = enemy.instanceId;
  const cast = resolveUltimateAction(state, air.instanceId);
  assert.equal(cast.events.filter((event) => event.type === "ultimate_hit").at(-1)?.amount, 280, "120% + 8% ratio per stack is applied");
});

test("Armor reference DEF100 becomes 200 for three next own Action Turns", () => {
  const armor = makeUnit("p6-armor", "player", "armor", "front_left", {
    defense: 100, battleBaseDefense: 100, rage: 50,
  });
  const enemy = makeUnit("p6-armor-enemy", "enemy", "infantry", "front_left");
  const cast = resolveUltimateAction(makeState([armor, enemy]), armor.instanceId);
  assert.equal(findUnit(cast, armor.instanceId).defense, 200);
  assert.equal(findUnit(cast, armor.instanceId).armorUltimateDefenseBonus, 100);
  assert.equal(findUnit(cast, armor.instanceId).armorUltimateExpiresAfterActionTurn, 4);
});

test("Infantry keeps the same HP floor for exactly two next own Action Turns", () => {
  const infantry = makeUnit("p6-infantry", "player", "infantry", "front_left", {
    hp: 500, maxHp: 1_000, rage: 60,
  });
  const enemy = makeUnit("p6-infantry-enemy", "enemy", "infantry", "front_left");
  let state = resolveUltimateAction(makeState([infantry, enemy]), infantry.instanceId);
  const protectedUnit = findUnit(state, infantry.instanceId);
  assert.equal(protectedUnit.hp, 600);
  const status = protectedUnit.statuses.find((entry) => entry.type === "infantry_death_refusal");
  assert.equal(status?.amount, 100);
  assert.equal(status?.expiresAfterSourceActionTurn, 3);
  applyShieldAndHpDamage(protectedUnit, 9_999);
  assert.equal(protectedUnit.hp, 100);
  state = resolveActionTurnCompletion(state, infantry.instanceId);
  assert.equal(findUnit(state, infantry.instanceId).statuses.some((entry) => entry.type === "infantry_death_refusal"), true);
  applyShieldAndHpDamage(findUnit(state, infantry.instanceId), 9_999);
  assert.equal(findUnit(state, infantry.instanceId).hp, 100);
  state = resolveActionTurnCompletion(state, infantry.instanceId);
  assert.equal(findUnit(state, infantry.instanceId).statuses.some((entry) => entry.type === "infantry_death_refusal"), true);
  state = resolveActionTurnCompletion(state, infantry.instanceId);
  assert.equal(findUnit(state, infantry.instanceId).statuses.some((entry) => entry.type === "infantry_death_refusal"), false);
});

test("Engineer missing500 heals75 and statistics count actual heal", () => {
  const engineer = makeUnit("p6-engineer", "player", "engineer", "front_left", {
    hp: 500, maxHp: 1_000, rage: 50,
  });
  const enemy = makeUnit("p6-engineer-enemy", "enemy", "infantry", "front_left");
  const cast = resolveUltimateAction(makeState([engineer, enemy]), engineer.instanceId);
  assert.equal(findUnit(cast, engineer.instanceId).hp, 575);
  assert.equal(buildBattleUnitStatistics(cast).find((entry) => entry.instanceId === engineer.instanceId)?.healingDone, 75);
});

test("Barracks progression uses four Journey levels and final zero-based rank maps to Lv54", () => {
  assert.equal(MAX_BARRACKS_LEVEL, 54);
  assert.equal(getMaxBarracksLevel(1), 1);
  assert.equal(getMaxBarracksLevel(4), 1);
  assert.equal(getMaxBarracksLevel(5), 2);
  assert.equal(getMaxBarracksLevel(216), 54);
  assert.equal(getMaxBarracksLevel(999), 54);
  assert.equal(getMaxBarracksLevelFromRankIndex(0), 1);
  assert.equal(getMaxBarracksLevelFromRankIndex(3), 1);
  assert.equal(getMaxBarracksLevelFromRankIndex(4), 2);
  assert.equal(getMaxBarracksLevelFromRankIndex(215), 54);
  assert.equal(getRequiredRankIndexForBarracksLevel(54), 212);
});

test("Troop cap follows Barracks and old Lv24 progress/jobs survive migration", () => {
  const old = createDefaultChienTuyenProfile(0);
  old.barracksLevel = 24;
  old.troopLevels.infantry = 24;
  old.trainingJobs = [{ id: "legacy-job", troopType: "infantry", startedAt: 1, completeAt: 999_999, costGold: 10, emergency: false }];
  const oldLoaded = sanitizeChienTuyenProfile(old, 2);
  assert.equal(oldLoaded.barracksLevel, 24);
  assert.equal(oldLoaded.troopLevels.infantry, 24);
  assert.equal(oldLoaded.trainingJobs.length, 1);
  for (const level of [1, 24, 25, 40, 54]) {
    const profile = createDefaultChienTuyenProfile(0);
    profile.barracksLevel = level;
    profile.troopLevels.infantry = level;
    assert.equal(sanitizeChienTuyenProfile(profile, 0).troopLevels.infantry, level);
  }
  const invalid = createDefaultChienTuyenProfile(0);
  invalid.barracksLevel = 99;
  invalid.troopLevels.infantry = 99;
  const clamped = sanitizeChienTuyenProfile(invalid, 0);
  assert.equal(clamped.barracksLevel, 54);
  assert.equal(clamped.troopLevels.infantry, 54);
  const b25 = createDefaultChienTuyenProfile(0);
  b25.barracksLevel = 25;
  b25.troopLevels.infantry = 24;
  assert.equal(startTroopUpgrade(b25, "infantry", 10).value?.targetLevel, 25);
  const b54 = createDefaultChienTuyenProfile(0);
  b54.barracksLevel = 54;
  b54.troopLevels.infantry = 54;
  assert.equal(startTroopUpgrade(b54, "infantry", 10).error, "max_level");
});

test("Barracks 24 to25 and 53 to54 unlock at correct Journey boundaries", () => {
  const p24 = createDefaultChienTuyenProfile(0);
  p24.barracksLevel = 24;
  assert.equal(startBarracksUpgrade(p24, 97, 1).value?.targetLevel, 25);
  const p53 = createDefaultChienTuyenProfile(0);
  p53.barracksLevel = 53;
  assert.equal(startBarracksUpgrade(p53, 213, 1).value?.targetLevel, 54);
});

test("Lv25-54 costs and durations stay finite and nonnegative", () => {
  for (const target of [25, 31, 54]) {
    const values = [
      getLevelUpgradeCost(target),
      getBarracksUpgradeDurationMs(target),
      getTroopUpgradeDurationMs("infantry", target),
      getTrainingDurationMs("infantry", target),
      getQuickFinishCost(getBarracksUpgradeDurationMs(target)),
    ];
    assert.equal(values.every((value) => Number.isFinite(value) && value >= 0), true, `invalid Lv${target} value`);
  }
});

test("Shared duration formatter follows seconds, MM:SS, HH:MM:SS and >99h rules", () => {
  const cases: Array<[number, string]> = [
    [0, "0 giây"], [5, "5 giây"], [59, "59 giây"], [60, "01:00"], [61, "01:01"],
    [3599, "59:59"], [3600, "01:00:00"], [3661, "01:01:01"], [7200, "02:00:00"],
  ];
  for (const [seconds, expected] of cases) assert.equal(formatChienTuyenDurationSeconds(seconds), expected);
  assert.equal(formatChienTuyenDurationSeconds(-5), "0 giây");
  assert.equal(formatChienTuyenDurationSeconds(360_000), "100:00:00");
  assert.equal(formatChienTuyenDurationForAriaMs(150_000), "2 phút 30 giây");
});

test("Training count is per troop and Gold/Time render as separate semantic groups", () => {
  const profile = createDefaultChienTuyenProfile(0);
  profile.trainingJobs = [
    { id: "ui-i1", troopType: "infantry", startedAt: 0, completeAt: 999_999, costGold: 10, emergency: false },
    { id: "ui-i2", troopType: "infantry", startedAt: 0, completeAt: 999_999, costGold: 10, emergency: false },
    { id: "ui-a1", troopType: "artillery", startedAt: 0, completeAt: 999_999, costGold: 10, emergency: false },
  ];
  assert.equal(getTrainingCountForTroop(profile, "infantry"), 2);
  assert.equal(getTrainingCountForTroop(profile, "artillery"), 1);
  assert.equal(getTrainingCountForTroop(profile, "guard"), 0);
  const markup = renderToStaticMarkup(React.createElement(BarracksView, {
    profile,
    gold: 99_999,
    maxBarracksLevel: 54,
    now: 0,
    onTrain: () => undefined,
    onQuickFinishTraining: () => undefined,
    onUpgradeTroop: () => undefined,
    onUpgradeBarracks: () => undefined,
    onClaimEmergency: () => undefined,
  }));
  assert.match(markup, /data-action="train-infantry"[^>]*data-training-count="2"/);
  assert.match(markup, /data-action="train-artillery"[^>]*data-training-count="1"/);
  assert.match(markup, /data-action="train-guard"[^>]*data-training-count="0"/);
  assert.match(markup, /×2/);
  assert.match(markup, /data-training-cost=/);
  assert.match(markup, /data-training-time=/);
});

console.log("CHIEN TUYEN PHASE 6 UPDATE TESTS PASSED");

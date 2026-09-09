import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  canUseUltimateAction,
  resolveActionTurnCompletion,
  resolveEndOfRound,
  resolveUltimateAction,
  selectAirForceUltimateTarget,
} from "./combatEngine";
import {
  COMBAT_CONFIG,
  createBattleActionPresentationSnapshot,
  getBattlePresentationSpeed,
} from "./config";
import { getBattleStatusRail } from "./battleHud";
import { advanceBattleActionStages, createBattleFromUnits, createTroopBattleUnit } from "./engine";
import { createDefaultChienTuyenProfile, sanitizeChienTuyenProfile } from "./profileEngine";
import { TROOP_CATALOG } from "./troopCatalog";
import { TROOP_TYPES, type BattleSide, type BattleState, type BattleStatus, type BattleUnit, type FormationSlotId, type TroopType } from "./types";
import {
  ANTI_TANK_ULTIMATE_MAX_HP_RATIO,
  ARMOR_ULTIMATE_ACTION_TURNS,
  CHEMICAL_ULTIMATE_STUN_ACTIONS,
  COMMANDO_ULTIMATE_ATTACK_RATIO,
  COMMANDO_ULTIMATE_MISSING_HP_RATIO,
  DIVINE_MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO,
  ENGINEER_ULTIMATE_HEAL_MISSING_HP_RATIO,
  FORENSIC_ULTIMATE_ACTION_TURNS,
  FORENSIC_ULTIMATE_MARKED_MULTIPLIER,
  FORENSIC_ULTIMATE_NORMAL_MULTIPLIER,
  GUARD_ULTIMATE_SHIELD_ACTION_TURNS,
  INFANTRY_ULTIMATE_PROTECTION_ACTION_TURNS,
  MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO,
  PIONEER_ULTIMATE_STUN_ACTIONS,
  SPECIAL_OPS_ULTIMATE_CONTROL_ACTION_TURNS,
  getUltimateConfig,
} from "./ultimateConfig";
import {
  ULTIMATE_FLIGHT_CONTACT_POINT,
  ULTIMATE_MIN_EXECUTION_DURATION_MS,
  ULTIMATE_PREP_DURATION_MS,
  getUltimateExecutionClock,
  getUltimatePresentation,
} from "./ultimatePresentation";

function test(name: string, callback: () => void): void {
  callback();
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

function makeState(units: readonly BattleUnit[], seed: string): BattleState {
  return createBattleFromUnits({ battleId: `fixed2-${seed}`, matchSeed: seed, units });
}

function findUnit(state: BattleState, instanceId: string): BattleUnit {
  const unit = state.units.find((candidate) => candidate.instanceId === instanceId);
  assert(unit, `missing unit ${instanceId}`);
  return unit;
}

function prioritize(state: BattleState, actorId: string): void {
  for (const unit of state.units) unit.nextActionAt = unit.instanceId === actorId ? 1 : 10_000;
}

console.log("=== CHIẾN TUYẾN AUTO SPEED / ACTION TURN / FLIGHT TESTS ===");

test("Battle Round selects 3× through 7× while legacy profile speed remains harmless", () => {
  const fresh = createDefaultChienTuyenProfile(1);
  assert.equal(fresh.battleSpeed, 2);
  for (const legacySpeed of [1, 2, 4, 0, 99]) {
    const migrated = sanitizeChienTuyenProfile({ ...fresh, battleSpeed: legacySpeed }, 2);
    assert.equal(migrated.battleSpeed, 2, `legacy speed ${legacySpeed} remains a save-only field`);
  }
  assert.deepEqual(
    [1, 4, 5, 10, 11, 14, 15, 19, 20, 100].map(getBattlePresentationSpeed),
    [3, 3, 4, 4, 5, 5, 6, 6, 7, 7]
  );
  assert.equal(getBattlePresentationSpeed(0), 3);
  assert.equal(getBattlePresentationSpeed(Number.NaN), 3);

  const roundFourAction = createBattleActionPresentationSnapshot(4);
  assert.equal(roundFourAction.speed, 3);
  assert.equal(Object.isFrozen(roundFourAction), true);
  assert.equal(getBattlePresentationSpeed(5), 4);
  assert.equal(roundFourAction.speed, 3, "Round 4 action snapshot stays 3× after Round 5 begins");
  for (const [oldRound, oldSpeed, newRound, newSpeed] of [
    [4, 3, 5, 4],
    [10, 4, 11, 5],
    [14, 5, 15, 6],
    [19, 6, 20, 7],
  ] as const) {
    const boundaryAction = createBattleActionPresentationSnapshot(oldRound);
    assert.equal(boundaryAction.speed, oldSpeed);
    assert.equal(getBattlePresentationSpeed(newRound), newSpeed);
    assert.equal(boundaryAction.speed, oldSpeed, `Round ${oldRound} action keeps ${oldSpeed}× across the Round ${newRound} boundary`);
  }
  for (const troopType of TROOP_TYPES) {
    for (const speed of [3, 4, 5, 6, 7] as const) {
      const clock = getUltimateExecutionClock(troopType, speed);
      assert.equal(clock.speedSnapshot, speed);
      assert.equal(
        clock.executionMs,
        Math.max(
          ULTIMATE_MIN_EXECUTION_DURATION_MS,
          Math.round(getUltimatePresentation(troopType).baseExecutionMs / speed)
        )
      );
    }
  }
  assert.equal(ULTIMATE_PREP_DURATION_MS, 1_000);
});

test("all 18 Ultimates have the required flight, stationary AOE, or support presentation", () => {
  assert.equal(TROOP_TYPES.length, 18);
  const flight = TROOP_TYPES.filter((type) => getUltimatePresentation(type).kind.startsWith("single_target"));
  const aoe = TROOP_TYPES.filter((type) => getUltimatePresentation(type).kind === "stationary_aoe");
  const support = TROOP_TYPES.filter((type) => getUltimatePresentation(type).kind === "stationary_support");
  assert.deepEqual(flight, ["commando", "anti_tank", "air_force", "pioneer", "marksman", "martial_artist"]);
  assert.deepEqual(aoe, ["artillery", "chemical", "electronic_warfare", "special_ops", "forensic_medic"]);
  assert.deepEqual(support, ["infantry", "armor", "medic", "engineer", "guard", "scout", "divine_medic"]);
});

test("flight clocks contact at one shared point, return to origin, and chain without an actor gap", () => {
  for (const troopType of ["anti_tank", "air_force", "pioneer", "marksman"] as const) {
    const clock = getUltimateExecutionClock(troopType, 5);
    assert.equal(clock.groupStartAtMs[0], 0);
    assert.equal(clock.impactAtMs[0], Math.round(clock.totalMs * ULTIMATE_FLIGHT_CONTACT_POINT));
    assert.equal(clock.groupEndAtMs[0], clock.totalMs);
  }
  const commando = getUltimateExecutionClock("commando", 4, 2);
  assert.equal(commando.groupStartAtMs.length, 2);
  assert.equal(commando.groupEndAtMs[0], commando.groupStartAtMs[1]);
  assert.equal(commando.groupEndAtMs[1], commando.totalMs);
  const terminalCommando = getUltimateExecutionClock("commando", 4, 1, { finalReturnToOrigin: false });
  assert.ok(terminalCommando.totalMs > terminalCommando.impactAtMs[0]);
  assert.ok(terminalCommando.groupEndAtMs[0] > terminalCommando.totalMs);

  const gameSource = readFileSync(new URL("./ChienTuyenGame.tsx", import.meta.url), "utf8");
  const baseCss = readFileSync(new URL("./chienTuyen.css", import.meta.url), "utf8");
  const polishCss = readFileSync(new URL("./chienTuyenBattlePolish.css", import.meta.url), "utf8");
  assert(gameSource.indexOf("const stableSourceRect") < gameSource.indexOf("const prepTimer"));
  assert.match(gameSource, /data-contact-progress=\{animation\.contactProgress\}/);
  assert.match(gameSource, /setDisplayBattle[\s\S]*group\.forEach\(spawnPopup\)[\s\S]*playTargetHit\(\)[\s\S]*triggerHaptic/);
  assert.match(baseCss, /\.ct-v2-flight-card\s*\{[^}]*animation:\s*ct-v2-flight-wrapper-basic/s);
  assert.match(baseCss, /\.ct-v2-flight-card \.ct-v2-battle-unit\s*\{[^}]*animation:\s*none !important/s);
  assert.match(baseCss, /@keyframes ct-v2-flight-wrapper-ultimate[\s\S]*45%[^}]*var\(--ct-dash-x\)[\s\S]*100%[^}]*translate\(0,0\)/);
  assert.match(baseCss, /ct-v2-damage-pop var\(--ct-popup-ms, 500ms\)/);
  assert.match(gameSource, /"--ct-popup-ms": `\$\{popup\.durationMs\}ms`/);
  assert.match(polishCss, /has-ultimate-vfx\.is-ultimate-casting:not\(\.is-flight-proxy\)/);
  assert.doesNotMatch(polishCss, /ct-v2-ultimate-card-flight/);
});

test("runtime source uses one action snapshot and contains no manual speed selector", () => {
  const source = [
    "./ChienTuyenGame.tsx",
    "./ChienTuyenScreen.tsx",
    "./chienTuyen.css",
    "./chienTuyenUxPolish.css",
  ].map((path) => readFileSync(new URL(path, import.meta.url), "utf8")).join("\n");
  assert.doesNotMatch(source, /BATTLE_SPEEDS|onBattleSpeedChange|ct-v2-speed-control|data-battle-speed/);
  assert.doesNotMatch(source, /battleSpeed\s*===\s*(?:1|4)|case\s+(?:1|4)\s*:/);
  assert.doesNotMatch(source, /FIXED_BATTLE_SPEED/);
  assert.match(source, /createBattleActionPresentationSnapshot\(current\.round\)/);
  assert.match(source, /getUltimateExecutionClock\([\s\S]*actionPresentationSpeed/);
  assert.match(source, /ct-v2-auto-speed-chip/);
});

test("Basic, Ultimate, Basic→Ultimate, and Stun skip each complete exactly one Action Turn", () => {
  const enemy = makeUnit("counter-enemy", "enemy", "armor", "front_left", { hp: 50_000, maxHp: 50_000 });

  const basicActor = makeUnit("counter-basic", "player", "infantry", "front_left", { attack: 1, battleBaseAttack: 1 });
  let state = makeState([basicActor, enemy], "counter-basic");
  prioritize(state, basicActor.instanceId);
  let stages = advanceBattleActionStages(state);
  assert.equal(stages.actionKind, "basic");
  assert.equal(findUnit(stages.afterAction, basicActor.instanceId).actionTurnCount, 1);

  const ultimateActor = makeUnit("counter-ultimate", "player", "anti_tank", "front_left", { attack: 1, battleBaseAttack: 1, rage: 50 });
  state = makeState([ultimateActor, enemy], "counter-ultimate");
  prioritize(state, ultimateActor.instanceId);
  stages = advanceBattleActionStages(state);
  assert.equal(stages.actionKind, "ultimate");
  assert.equal(findUnit(stages.afterAction, ultimateActor.instanceId).actionTurnCount, 1);

  // Infantry casts at 60 Rage on main; 50 + the basic attack's 10 triggers
  // the chain. Starting at 60 tests an immediate Ultimate instead.
  const chainActor = makeUnit("counter-chain", "player", "infantry", "front_left", { attack: 1, battleBaseAttack: 1, rage: 50 });
  state = makeState([chainActor, enemy], "counter-chain");
  prioritize(state, chainActor.instanceId);
  stages = advanceBattleActionStages(state);
  assert.equal(stages.actionKind, "basic_ultimate");
  assert.equal(findUnit(stages.afterBasic, chainActor.instanceId).rage, 60);
  assert.equal(findUnit(stages.afterAction, chainActor.instanceId).rage, 0);
  assert.equal(findUnit(stages.afterAction, chainActor.instanceId).actionTurnCount, 1);
  const chainedEvents = stages.afterAction.events.filter((event) => event.sourceUnitId === chainActor.instanceId && ["attack", "ultimate_started", "action_completed"].includes(event.type));
  assert(chainedEvents.length >= 3);
  assert.equal(new Set(chainedEvents.map((event) => event.actionId)).size, 1);

  const stun: BattleStatus = {
    id: "counter-stun",
    sourceUnitId: enemy.instanceId,
    type: "stun",
    polarity: "debuff",
    cleansable: true,
    stackPolicy: "refresh",
    durationClock: "target_action_turn",
    appliedTargetActionTurn: 0,
    expiresAfterTargetActionTurn: 1,
    remainingActionTurns: 1,
    effectKind: "action_stun",
  };
  const stunnedActor = makeUnit("counter-stunned", "player", "infantry", "front_left", { statuses: [stun] });
  state = makeState([stunnedActor, enemy], "counter-stun");
  prioritize(state, stunnedActor.instanceId);
  stages = advanceBattleActionStages(state);
  assert.equal(stages.actionKind, "stun_skip");
  assert.equal(findUnit(stages.afterAction, stunnedActor.instanceId).actionTurnCount, 1);
  assert.equal(stages.afterAction.events.some((event) => event.type === "attack" && event.sourceUnitId === stunnedActor.instanceId), false);
  assert.equal(findUnit(stages.afterAction, stunnedActor.instanceId).statuses.some((status) => status.type === "stun"), false);
});

test("a unit killed before its opportunity never receives an Action Turn count", () => {
  const dead = makeUnit("counter-dead", "player", "infantry", "front_left");
  const actor = makeUnit("counter-survivor", "enemy", "armor", "front_left", { attack: 1, battleBaseAttack: 1 });
  const state = makeState([dead, actor], "counter-dead-before");
  const deadInState = findUnit(state, dead.instanceId);
  deadInState.hp = 0;
  deadInState.alive = false;
  prioritize(state, actor.instanceId);
  const stages = advanceBattleActionStages(state);
  assert.equal(findUnit(stages.afterAction, dead.instanceId).actionTurnCount, 0);
  assert.equal(stages.afterAction.events.some((event) => event.type === "action_completed" && event.sourceUnitId === dead.instanceId), false);
});

test("periodic passives proc after each own Action Turn, even twice inside one Battle Round", () => {
  const medic = makeUnit("fast-medic", "player", "medic", "back_left");
  const patient = makeUnit("fast-patient", "player", "infantry", "front_left", { hp: 500, maxHp: 1_000 });
  const enemy = makeUnit("fast-enemy", "enemy", "armor", "front_left");
  let state = makeState([medic, patient, enemy], "fast-periodic");
  const battleRound = state.round;
  state = resolveActionTurnCompletion(state, medic.instanceId);
  state = resolveActionTurnCompletion(state, medic.instanceId);
  assert.equal(state.round, battleRound);
  assert.equal(findUnit(state, medic.instanceId).actionTurnCount, 2);
  // Main c1d5584 raised Medic HP from 900 to 970: two 4% heals = 77.6.
  assert.equal(medic.maxHp, 970);
  assert.ok(Math.abs(findUnit(state, patient.instanceId).hp - 577.6) < 1e-9);
  assert.equal(state.events.filter((event) => event.type === "heal" && event.targetUnitIds?.includes(patient.instanceId)).length, 2);
  const beforeRoundHealEvents = state.events.filter((event) => event.type === "heal").length;
  state = resolveEndOfRound(state);
  assert.equal(state.events.filter((event) => event.type === "heal").length, beforeRoundHealEvents);
  assert.equal(state.events.at(-1)?.type, "round_ended");

  const periodicTypes = TROOP_TYPES.filter((type) => TROOP_CATALOG[type].passive.trigger === "after_own_action_turn");
  assert.deepEqual(periodicTypes, ["medic", "chemical", "air_force", "guard", "scout", "divine_medic", "forensic_medic"]);
});

test("the Action Turn duration and rebalance matrix stays canonical", () => {
  assert.deepEqual({
    infantryProtection: INFANTRY_ULTIMATE_PROTECTION_ACTION_TURNS,
    armorStance: ARMOR_ULTIMATE_ACTION_TURNS,
    antiTankDefenseDown: 2,
    engineerToughness: 1,
    chemicalStun: CHEMICAL_ULTIMATE_STUN_ACTIONS,
    guardUltimateShield: GUARD_ULTIMATE_SHIELD_ACTION_TURNS,
    pioneerStun: PIONEER_ULTIMATE_STUN_ACTIONS,
    pioneerShield: COMBAT_CONFIG.passives.pioneerShieldActionTurns,
    specialOpsControl: SPECIAL_OPS_ULTIMATE_CONTROL_ACTION_TURNS,
    divineRescue: 1,
    forensicPassive: 1,
    forensicUltimate: FORENSIC_ULTIMATE_ACTION_TURNS,
  }, {
    infantryProtection: 2,
    armorStance: 3,
    antiTankDefenseDown: 2,
    engineerToughness: 1,
    chemicalStun: 2,
    guardUltimateShield: 2,
    pioneerStun: 1,
    pioneerShield: 3,
    specialOpsControl: 2,
    divineRescue: 1,
    forensicPassive: 1,
    forensicUltimate: 2,
  });
  assert.equal(COMBAT_CONFIG.passives.commandoCritBonus, .60);
  assert.equal(COMBAT_CONFIG.critMultiplier, 1.90);
  assert.equal(COMMANDO_ULTIMATE_ATTACK_RATIO, 1.40);
  assert.equal(COMMANDO_ULTIMATE_MISSING_HP_RATIO, .30);
  assert.equal(MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO, .28);
  assert.equal(DIVINE_MEDIC_ULTIMATE_HEAL_MAX_HP_RATIO, .20);
  assert.equal(COMBAT_CONFIG.passives.antiTankTargetMaxHp, .10);
  assert.equal(ENGINEER_ULTIMATE_HEAL_MISSING_HP_RATIO, .15);
  assert.equal(ANTI_TANK_ULTIMATE_MAX_HP_RATIO, .23);
  assert.equal(getUltimateConfig("scout").ultimateRageRequired, 40);
  assert.equal(getUltimateConfig("forensic_medic").ultimateRageRequired, 50);
  assert.equal(FORENSIC_ULTIMATE_NORMAL_MULTIPLIER, .60);
  assert.equal(FORENSIC_ULTIMATE_MARKED_MULTIPLIER, .40);
});

test("Air Force and Marksman remember a living target, then fall back front-first", () => {
  const air = makeUnit("target-air", "player", "air_force", "back_left", { lastDamagedEnemyId: "target-back" });
  const marksman = makeUnit("target-marksman", "player", "marksman", "back_center", { rage: 50, lastDamagedEnemyId: "target-back" });
  const front = makeUnit("target-front", "enemy", "armor", "front_left", { hp: 10_000, maxHp: 10_000 });
  const back = makeUnit("target-back", "enemy", "medic", "back_left", { hp: 10_000, maxHp: 10_000 });
  assert.equal(selectAirForceUltimateTarget([air, front, back], air, 1).target?.instanceId, back.instanceId);

  let state = resolveUltimateAction(makeState([marksman, front, back], "marksman-memory"), marksman.instanceId);
  assert.equal(state.events.find((event) => event.type === "ultimate_hit")?.targetUnitIds?.[0], back.instanceId);

  const deadBack = { ...back, hp: 0, alive: false };
  air.lastDamagedEnemyId = deadBack.instanceId;
  assert.equal(selectAirForceUltimateTarget([air, front, deadBack], air, 1).target?.instanceId, front.instanceId);
  const fallbackMarksman = makeUnit("target-marksman-fallback", "player", "marksman", "back_center", { rage: 50, lastDamagedEnemyId: deadBack.instanceId });
  state = resolveUltimateAction(makeState([fallbackMarksman, front, deadBack], "marksman-fallback"), fallbackMarksman.instanceId);
  assert.equal(state.events.find((event) => event.type === "ultimate_hit")?.targetUnitIds?.[0], front.instanceId);
});

test("all 18 canonical skill copies and explicit status tooltips remain available", () => {
  for (const troopType of TROOP_TYPES) {
    assert(TROOP_CATALOG[troopType].passive.name.length > 0);
    assert(TROOP_CATALOG[troopType].passive.description.length > 0);
    assert(getUltimateConfig(troopType).name);
    assert(getUltimateConfig(troopType).description);
  }
  for (const troopType of ["medic", "chemical", "air_force", "guard", "scout", "divine_medic", "forensic_medic"] as const) {
    assert.match(TROOP_CATALOG[troopType].passive.description, /Lượt Hành Động/);
  }

  const statusUnit = makeUnit("tooltip-unit", "player", "armor", "front_left", {
    statuses: [
      { id: "tooltip-stun", sourceUnitId: "enemy", type: "stun", polarity: "debuff", cleansable: true, stackPolicy: "refresh", durationClock: "target_action_turn", remainingActionTurns: 2 },
      { id: "tooltip-silence", sourceUnitId: "enemy", type: "silence", polarity: "debuff", cleansable: true, stackPolicy: "refresh", durationClock: "target_action_turn", remainingActionTurns: 2 },
      { id: "tooltip-rescue", sourceUnitId: "divine", type: "rescue", polarity: "buff", cleansable: false, stackPolicy: "refresh", durationClock: "source_action_turn", remainingActionTurns: 1 },
      { id: "tooltip-forensic", sourceUnitId: "forensic", type: "forensic_suppression", polarity: "debuff", cleansable: true, stackPolicy: "refresh", durationClock: "source_action_turn", remainingActionTurns: 1, healingReceivedMultiplier: .60, shieldReceivedMultiplier: .60, effectKind: "forensic_passive" },
      { id: "tooltip-defense", sourceUnitId: "anti", type: "anti_tank_defense_down", polarity: "debuff", cleansable: true, stackPolicy: "refresh", durationClock: "target_action_turn", remainingActionTurns: 2, amount: 30 },
    ],
  });
  const labels = getBattleStatusRail(statusUnit, 1, 20).all.map((item) => item.label).join("\n");
  assert.match(labels, /Choáng · còn 2 HĐ.*Mất Lượt Hành Động/);
  assert.match(labels, /Câm Lặng · còn 2 HĐ.*Vẫn có thể đánh thường và Nội tại vẫn hoạt động/);
  assert.match(labels, /Giảm 35% sát thương.*Lượt Hành Động kế tiếp của Thần Y/);
  assert.match(labels, /Giảm 40% hồi máu và lá chắn.*Lượt Hành Động kế tiếp của Pháp Y/);
  assert.match(labels, /Giảm DEF · còn 2 HĐ.*Lượt Hành Động còn lại của mục tiêu/);
  assert.equal(canUseUltimateAction(makeState([statusUnit, makeUnit("tooltip-enemy", "enemy", "infantry", "front_left")], "tooltip-silence"), statusUnit), false);
});

console.log("CHIẾN TUYẾN AUTO SPEED / ACTION TURN / FLIGHT TESTS PASSED");

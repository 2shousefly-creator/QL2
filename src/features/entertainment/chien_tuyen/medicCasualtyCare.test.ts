import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveActionTurnCompletion, resolveEndOfRound } from "./combatEngine";
import { getBattlePresentationSpeed } from "./config";
import { advanceBattleActionStages, createBattleFromUnits, createTroopBattleUnit } from "./engine";
import { TROOP_BY_TYPE } from "./troopCatalog";
import type {
  BattleSide,
  BattleState,
  BattleStatus,
  BattleUnit,
  FormationSlotId,
  TroopType,
} from "./types";

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
  return {
    ...base,
    ...overrides,
    statuses: (overrides.statuses ?? base.statuses).map((status) => ({ ...status })),
    shields: (overrides.shields ?? base.shields).map((shield) => ({ ...shield })),
  };
}

function makeState(units: readonly BattleUnit[], seed = "medic-casualty-care"): BattleState {
  battleSequence += 1;
  return createBattleFromUnits({
    battleId: `medic-casualty-care-${battleSequence}`,
    matchSeed: `${seed}-${battleSequence}`,
    units,
  });
}

function findUnit(state: BattleState, instanceId: string): BattleUnit {
  const unit = state.units.find((candidate) => candidate.instanceId === instanceId);
  assert.ok(unit, `Missing unit ${instanceId}`);
  return unit;
}

function prioritize(state: BattleState, actorId: string): void {
  for (const unit of state.units) unit.nextActionAt = unit.instanceId === actorId ? 1 : 10_000;
}

function casualtyCareEvents(state: BattleState, sourceUnitId?: string) {
  return state.events.filter((event) =>
    event.type === "heal" &&
    event.message === "CỨU THƯƠNG" &&
    (!sourceUnitId || event.sourceUnitId === sourceUnitId)
  );
}

function forensicSuppression(id: string, multiplier: 0.6 | 0.4): BattleStatus {
  return {
    id,
    sourceUnitId: "forensic-source",
    type: "forensic_suppression",
    polarity: "debuff",
    cleansable: true,
    stackPolicy: "refresh",
    durationClock: "source_action_turn",
    remainingActionTurns: 1,
    healingReceivedMultiplier: multiplier,
    shieldReceivedMultiplier: multiplier,
    effectKind: multiplier === 0.6 ? "forensic_passive" : "forensic_ultimate",
  };
}

console.log("=== CHIẾN TUYẾN QUÂN Y · CỨU THƯƠNG TESTS ===");

test("catalog and Troop Detail expose only the canonical Cứu Thương copy", () => {
  const passive = TROOP_BY_TYPE.medic.passive;
  assert.equal(passive.id, "medic_casualty_care");
  assert.equal(passive.name, "CỨU THƯƠNG");
  assert.equal(
    passive.description,
    "Sau mỗi Lượt Hành Động, hồi máu cho tất cả đồng minh bằng 4% Máu Tối Đa của Quân Y."
  );
  assert.equal(passive.trigger, "after_own_action_turn");
  assert.deepEqual(passive.parameters, {
    sourceMaxHpRatio: 0.04,
    targets: "all_living_allies",
    includesSelf: true,
    canRevive: false,
    canCrit: false,
    grantsRage: false,
  });

  const detailSource = readFileSync(new URL("./components/TroopDetailModal.tsx", import.meta.url), "utf8");
  const battleSource = readFileSync(new URL("./ChienTuyenGame.tsx", import.meta.url), "utf8");
  const runtimeSource = [
    "./config.ts",
    "./types.ts",
    "./troopCatalog.ts",
    "./towerFloorCatalog.ts",
    "./combatEngine.ts",
  ].map((path) => readFileSync(new URL(path, import.meta.url), "utf8")).join("\n");
  assert.match(detailSource, /NỘI TẠI — \{troop\.passive\.name\}/);
  assert.match(battleSource, /NỘI TẠI — \{passive\.name\}/);
  const removedIdentifiers = [
    ["medic", "missing", "hp", "heal"].join("_"),
    ["medic", "Missing", "Hp", "Heal"].join(""),
    ["missing", "HpRatio: 0.08"].join(""),
  ];
  for (const identifier of removedIdentifiers) assert.equal(runtimeSource.includes(identifier), false);
  assert.doesNotMatch(runtimeSource, /8%\s*(?:HP|máu)[^.\n]*(?:thiếu|đã mất)/i);
});

test("4% of Quân Y Max HP yields 160 at 4000 and 120 at 3000", () => {
  for (const [maxHp, expected] of [[4_000, 160], [3_000, 120]] as const) {
    const medic = makeUnit(`formula-medic-${maxHp}`, "player", "medic", "back_left", { maxHp, hp: maxHp });
    const ally = makeUnit(`formula-ally-${maxHp}`, "player", "infantry", "front_left", { maxHp: 10_000, hp: 1_000 });
    const enemy = makeUnit(`formula-enemy-${maxHp}`, "enemy", "armor", "front_left", { maxHp: 50_000, hp: 50_000 });
    const resolved = resolveActionTurnCompletion(makeState([medic, ally, enemy]), medic.instanceId);
    const event = casualtyCareEvents(resolved, medic.instanceId).find((entry) => entry.targetUnitIds?.[0] === ally.instanceId);
    assert.equal(event?.amount, expected);
    assert.equal(findUnit(resolved, ally.instanceId).hp, 1_000 + expected);
  }
});

test("Cứu Thương includes self, clamps overheal, emits VFX for full allies, and never revives", () => {
  const medic = makeUnit("targeting-medic", "player", "medic", "back_left", { maxHp: 5_000, hp: 4_500 });
  const nearFull = makeUnit("targeting-near-full", "player", "infantry", "front_left", { maxHp: 1_000, hp: 950 });
  const full = makeUnit("targeting-full", "player", "armor", "front_center", { maxHp: 1_000, hp: 1_000 });
  const dead = makeUnit("targeting-dead", "player", "guard", "front_right", { maxHp: 1_000, hp: 0, alive: false });
  const enemy = makeUnit("targeting-enemy", "enemy", "armor", "front_left", { maxHp: 50_000, hp: 50_000 });
  const resolved = resolveActionTurnCompletion(makeState([medic, nearFull, full, dead, enemy]), medic.instanceId);

  assert.equal(findUnit(resolved, medic.instanceId).hp, 4_700);
  assert.equal(findUnit(resolved, nearFull.instanceId).hp, 1_000);
  assert.equal(findUnit(resolved, full.instanceId).hp, 1_000);
  assert.equal(findUnit(resolved, dead.instanceId).hp, 0);
  assert.equal(findUnit(resolved, dead.instanceId).alive, false);

  const events = casualtyCareEvents(resolved, medic.instanceId);
  assert.deepEqual(events.map((event) => event.targetUnitIds?.[0]).sort(), [full.instanceId, medic.instanceId, nearFull.instanceId].sort());
  assert.equal(events.find((event) => event.targetUnitIds?.[0] === nearFull.instanceId)?.amount, 50);
  assert.equal(events.find((event) => event.targetUnitIds?.[0] === full.instanceId)?.amount, 0);
  assert.equal(events.some((event) => event.targetUnitIds?.[0] === dead.instanceId), false);
});

test("Basic, Ultimate, Basic→Ultimate, and Stun skip each proc Cứu Thương once after the opportunity", () => {
  const scenarios = [
    { name: "basic", rage: 0, expectedKind: "basic" as const, stunned: false },
    { name: "ultimate", rage: 60, expectedKind: "ultimate" as const, stunned: false },
    { name: "chain", rage: 50, expectedKind: "basic_ultimate" as const, stunned: false },
    { name: "stun", rage: 60, expectedKind: "stun_skip" as const, stunned: true },
  ];

  for (const scenario of scenarios) {
    const statuses: BattleStatus[] = scenario.stunned
      ? [{
        id: `stun-${scenario.name}`,
        sourceUnitId: `enemy-${scenario.name}`,
        type: "stun",
        polarity: "debuff",
        cleansable: true,
        stackPolicy: "refresh",
        durationClock: "target_action_turn",
        appliedTargetActionTurn: 0,
        expiresAfterTargetActionTurn: 1,
        remainingActionTurns: 1,
        effectKind: "action_stun",
      }]
      : [];
    const medic = makeUnit(`action-medic-${scenario.name}`, "player", "medic", "back_left", {
      maxHp: 4_000,
      hp: 3_000,
      attack: 1,
      battleBaseAttack: 1,
      rage: scenario.rage,
      statuses,
    });
    const ally = makeUnit(`action-ally-${scenario.name}`, "player", "infantry", "front_left", { maxHp: 5_000, hp: 1_000 });
    const enemy = makeUnit(`action-enemy-${scenario.name}`, "enemy", "armor", "front_left", { maxHp: 50_000, hp: 50_000, defense: 0 });
    const state = makeState([medic, ally, enemy], `action-${scenario.name}`);
    prioritize(state, medic.instanceId);
    const stages = advanceBattleActionStages(state);
    assert.equal(stages.actionKind, scenario.expectedKind);
    const allyHeals = casualtyCareEvents(stages.afterAction, medic.instanceId)
      .filter((event) => event.targetUnitIds?.[0] === ally.instanceId);
    assert.equal(allyHeals.length, 1, `${scenario.name} must proc exactly once for the ally`);
    assert.equal(allyHeals[0].amount, 160);
    assert.equal(findUnit(stages.afterAction, medic.instanceId).actionTurnCount, 1);
    if (scenario.expectedKind === "basic_ultimate") {
      const ultimateCompletedAt = stages.afterAction.events.findIndex((event) => event.type === "ultimate_completed");
      const passiveAt = stages.afterAction.events.findIndex((event) => event.id === allyHeals[0].id);
      assert.ok(ultimateCompletedAt >= 0 && passiveAt > ultimateCompletedAt);
    }
    if (scenario.expectedKind === "stun_skip") {
      assert.equal(stages.afterAction.events.some((event) => event.type === "attack" && event.sourceUnitId === medic.instanceId), false);
    }
  }
});

test("Battle Round completion never triggers Cứu Thương", () => {
  const medic = makeUnit("round-medic", "player", "medic", "back_left", { maxHp: 4_000, hp: 3_000 });
  const ally = makeUnit("round-ally", "player", "infantry", "front_left", { maxHp: 5_000, hp: 1_000 });
  const enemy = makeUnit("round-enemy", "enemy", "armor", "front_left", { maxHp: 50_000, hp: 50_000 });
  const resolved = resolveEndOfRound(makeState([medic, ally, enemy]));
  assert.equal(casualtyCareEvents(resolved).length, 0);
  assert.equal(findUnit(resolved, ally.instanceId).hp, 1_000);
});

test("Pháp Y 40% and 60% Anti-Heal reduce the centralized 200 base heal to 120 and 80", () => {
  const medic = makeUnit("anti-heal-medic", "player", "medic", "back_left", { maxHp: 5_000, hp: 5_000 });
  const reduced40 = makeUnit("anti-heal-40", "player", "infantry", "front_left", {
    maxHp: 5_000,
    hp: 1_000,
    statuses: [forensicSuppression("anti-heal-passive", 0.6)],
  });
  const reduced60 = makeUnit("anti-heal-60", "player", "armor", "front_center", {
    maxHp: 5_000,
    hp: 1_000,
    statuses: [forensicSuppression("anti-heal-ultimate", 0.4)],
  });
  const enemy = makeUnit("anti-heal-enemy", "enemy", "forensic_medic", "front_left", { maxHp: 50_000, hp: 50_000 });
  const resolved = resolveActionTurnCompletion(makeState([medic, reduced40, reduced60, enemy]), medic.instanceId);
  const events = casualtyCareEvents(resolved, medic.instanceId);
  assert.equal(events.find((event) => event.targetUnitIds?.[0] === reduced40.instanceId)?.amount, 120);
  assert.equal(events.find((event) => event.targetUnitIds?.[0] === reduced60.instanceId)?.amount, 80);
  assert.equal(findUnit(resolved, reduced40.instanceId).hp, 1_120);
  assert.equal(findUnit(resolved, reduced60.instanceId).hp, 1_080);
});

test("Cứu Thương neither crits nor changes Rage", () => {
  const medic = makeUnit("resource-medic", "player", "medic", "back_left", {
    maxHp: 4_000,
    hp: 3_000,
    rage: 37,
    critChance: 1,
  });
  const ally = makeUnit("resource-ally", "player", "infantry", "front_left", { maxHp: 5_000, hp: 1_000, rage: 12 });
  const enemy = makeUnit("resource-enemy", "enemy", "armor", "front_left", { maxHp: 50_000, hp: 50_000 });
  const resolved = resolveActionTurnCompletion(makeState([medic, ally, enemy]), medic.instanceId);
  assert.equal(findUnit(resolved, medic.instanceId).rage, 37);
  assert.equal(findUnit(resolved, ally.instanceId).rage, 12);
  assert.equal(casualtyCareEvents(resolved, medic.instanceId).some((event) => event.critical), false);
  assert.equal(resolved.events.some((event) => event.type === "critical" || event.type === "rage_gained"), false);
});

test("duplicate enemy Quân Y sources proc independently from their own Max HP", () => {
  const medicA = makeUnit("duplicate-medic-a", "enemy", "medic", "back_left", { maxHp: 4_000, hp: 4_000 });
  const medicB = makeUnit("duplicate-medic-b", "enemy", "medic", "back_center", { maxHp: 3_000, hp: 3_000 });
  const ally = makeUnit("duplicate-ally", "enemy", "armor", "front_left", { maxHp: 10_000, hp: 1_000 });
  const player = makeUnit("duplicate-player", "player", "armor", "front_left", { maxHp: 50_000, hp: 50_000 });
  let resolved = resolveActionTurnCompletion(makeState([medicA, medicB, ally, player]), medicA.instanceId);
  resolved = resolveActionTurnCompletion(resolved, medicB.instanceId);
  assert.equal(findUnit(resolved, ally.instanceId).hp, 1_280);
  assert.equal(casualtyCareEvents(resolved, medicA.instanceId).find((event) => event.targetUnitIds?.[0] === ally.instanceId)?.amount, 160);
  assert.equal(casualtyCareEvents(resolved, medicB.instanceId).find((event) => event.targetUnitIds?.[0] === ally.instanceId)?.amount, 120);
});

test("a surviving Quân Y still completes Cứu Thương when its Basic ends the battle", () => {
  const medic = makeUnit("finisher-medic", "player", "medic", "back_left", {
    maxHp: 4_000,
    hp: 3_000,
    attack: 10_000,
    battleBaseAttack: 10_000,
    rage: 0,
    critChance: 0,
  });
  const ally = makeUnit("finisher-ally", "player", "infantry", "front_left", { maxHp: 5_000, hp: 1_000 });
  const enemy = makeUnit("finisher-enemy", "enemy", "armor", "front_left", { maxHp: 1, hp: 1, defense: 0 });
  const state = makeState([medic, ally, enemy], "finishing-action");
  prioritize(state, medic.instanceId);
  const stages = advanceBattleActionStages(state);
  assert.equal(stages.afterAction.outcome, "player_victory");
  assert.equal(casualtyCareEvents(stages.afterAction, medic.instanceId).filter((event) => event.targetUnitIds?.[0] === ally.instanceId).length, 1);
  assert.equal(findUnit(stages.afterAction, ally.instanceId).hp, 1_160);
});

test("auto-speed battle UI turns every completion heal event into a lightweight target popup", () => {
  const source = readFileSync(new URL("./ChienTuyenGame.tsx", import.meta.url), "utf8");
  assert.deepEqual(
    [1, 5, 11, 15, 20].map(getBattlePresentationSpeed),
    [3, 4, 5, 6, 7]
  );
  assert.match(source, /completionPulses = collectPulses\(completionEvents/);
  assert.match(source, /event\.type === "heal"/);
  assert.match(source, /addPulses\(completionPulses\)/);
  assert.match(source, /CỨU THƯƠNG \+\$\{Math\.round\(effect\.amount\)\}/);
});

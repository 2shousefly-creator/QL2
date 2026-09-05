import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getBattleStatusRail } from "./battleHud";
import { TroopUpgradeModal } from "./components/TroopUpgradeModal";
import { MAX_BARRACKS_LEVEL, MAX_FORMATION_UNITS, MAX_SAME_TROOP_TYPE } from "./config";
import { createTroopBattleUnit } from "./engine";
import { getRosterSpeedRange, getRosterStatMaximumAtLevel, getTroopStatRatio } from "./statDisplay";
import { BOSS_FLOORS } from "./towerFloorCatalog";
import { getTroopStats } from "./troopCatalog";
import { TROOP_TYPES } from "./types";
import {
  ARMY_ROLE_FILTERS,
  filterAndSortDeploymentTroops,
  getFormationTutorialCopy,
  getTimelineSidePresentation,
  getTroopUpgradeLockCopy,
  getTutorialSteps,
  troopMatchesArmyFilter,
} from "./uxPresentation";

function test(name: string, run: () => void): void {
  run();
  console.log(`PASS: ${name}`);
}

console.log("=== CHIEN TUYEN UX POLISH TESTS ===");

test("same-level stat maxima preserve roster roles at Lv1 and Lv54", () => {
  for (const level of [1, MAX_BARRACKS_LEVEL]) {
    const hpMaximum = Math.max(...TROOP_TYPES.map((troopType) => getTroopStats(troopType, level).maxHp));
    const attackMaximum = Math.max(...TROOP_TYPES.map((troopType) => getTroopStats(troopType, level).attack));
    const defenseMaximum = Math.max(...TROOP_TYPES.map((troopType) => getTroopStats(troopType, level).defense));
    assert.equal(getRosterStatMaximumAtLevel(level, "maxHp"), hpMaximum);
    assert.equal(getRosterStatMaximumAtLevel(level, "attack"), attackMaximum);
    assert.equal(getRosterStatMaximumAtLevel(level, "defense"), defenseMaximum);
    assert.equal(getTroopStatRatio("armor", level, "defense"), 1);
    assert.equal(getTroopStatRatio("commando", level, "speed"), 1);
  }
  assert.ok(getTroopStatRatio("armor", 1, "attack") < 0.35);
});

test("SPEED uses the roster range with a visible floor for the slowest troop", () => {
  assert.deepEqual(getRosterSpeedRange(), { minimum: 30, maximum: 76 });
  assert.equal(getTroopStatRatio("armor", 1, "speed"), 0.1);
  assert.equal(getTroopStatRatio("commando", 1, "speed"), 1);
  assert.ok(getTroopStatRatio("air_force", 1, "speed") > getTroopStatRatio("medic", 1, "speed"));
});

test("Army role filters follow the canonical overlapping mapping", () => {
  assert.equal(ARMY_ROLE_FILTERS.length, 6);
  assert.equal(troopMatchesArmyFilter("armor", "tank"), true);
  assert.equal(troopMatchesArmyFilter("engineer", "tank"), true);
  assert.equal(troopMatchesArmyFilter("pioneer", "fighter"), true);
  assert.equal(troopMatchesArmyFilter("pioneer", "control"), true);
  assert.equal(troopMatchesArmyFilter("medic", "dps"), false);
  assert.ok(TROOP_TYPES.every((troopType) => troopMatchesArmyFilter(troopType, "all")));
});

test("deployment filters first and stably sorts available troops before unavailable troops", () => {
  const catalogOrder = ["infantry", "artillery", "armor", "medic", "pioneer"] as const;
  const counts = { infantry: 0, artillery: 2, armor: 1, medic: 0, pioneer: 1 };
  assert.deepEqual(
    filterAndSortDeploymentTroops(catalogOrder, counts, "all"),
    ["artillery", "armor", "pioneer", "infantry", "medic"],
  );
  assert.deepEqual(
    filterAndSortDeploymentTroops(catalogOrder, counts, "fighter"),
    ["pioneer", "infantry"],
  );
  assert.deepEqual(ARMY_ROLE_FILTERS.map(({ label }) => label), [
    "TẤT CẢ",
    "TANKER",
    "DPS",
    "SUPPORT",
    "ĐẤU SĨ",
    "KHỐNG CHẾ",
  ]);
});

test("Tutorial and formation copy are generated from gameplay constants", () => {
  const formationCopy = getFormationTutorialCopy();
  assert.match(formationCopy, new RegExp(`Tối đa ${MAX_FORMATION_UNITS} quân`));
  assert.match(formationCopy, new RegExp(`mỗi binh chủng tối đa ${MAX_SAME_TROOP_TYPE} quân`));
  const steps = getTutorialSteps();
  assert.equal(steps.length, 5);
  assert.equal(steps[3].title, "THANH THỨ TỰ HÀNH ĐỘNG");
  assert.match(steps[3].text, /Cả hai đội dùng chung một Thanh Thứ Tự/);
  assert.ok(BOSS_FLOORS.every((floor) => steps[0].text.includes(String(floor))));
});

test("Upgrade lock copy distinguishes the current cap from the absolute cap", () => {
  assert.deepEqual(getTroopUpgradeLockCopy(10, 10), {
    title: "Đã đạt giới hạn hiện tại",
    description: "Nâng Doanh Trại lên Lv11 để tiếp tục nâng cấp.",
  });
  assert.equal(getTroopUpgradeLockCopy(MAX_BARRACKS_LEVEL, MAX_BARRACKS_LEVEL).title, "Đã đạt cấp tối đa");
});

test("Upgrade modal separates increasing and fixed stats with accessible dialog copy", () => {
  const unlocked = renderToStaticMarkup(React.createElement(TroopUpgradeModal, {
    troopType: "infantry",
    level: 1,
    barracksLevel: 2,
    gold: 999,
    onConfirm: () => undefined,
    onClose: () => undefined,
  }));
  assert.match(unlocked, /aria-modal="true"/);
  assert.match(unlocked, /Lv1 → Lv2/);
  assert.match(unlocked, />HP</);
  assert.match(unlocked, />ATK</);
  assert.match(unlocked, />DEF</);
  assert.match(unlocked, /Chỉ số cố định · CRIT 25% · SPEED 44/);

  const locked = renderToStaticMarkup(React.createElement(TroopUpgradeModal, {
    troopType: "infantry",
    level: 1,
    barracksLevel: 1,
    gold: 999,
    onConfirm: () => undefined,
    onClose: () => undefined,
  }));
  assert.match(locked, /Nâng Doanh Trại lên Lv2 để tiếp tục nâng cấp/);
});

test("Status rail shows three persistent icons and an overflow count", () => {
  const unit = createTroopBattleUnit({ instanceId: "status-unit", side: "player", troopType: "air_force", slotId: "front_left", level: 1 });
  unit.corrosionStacks = 2;
  unit.passiveStacks = 4;
  unit.shields = [{ sourceUnitId: "guard", amount: 120, kind: "guard" }];
  unit.statuses = [
    { id: "stun", sourceUnitId: "enemy", type: "stun", polarity: "debuff", cleansable: true, stackPolicy: "refresh", durationClock: "target_action_turn", appliedTargetActionTurn: 0, expiresAfterTargetActionTurn: 1, remainingActionTurns: 1 },
    { id: "def-down", sourceUnitId: "enemy", type: "anti_tank_defense_down", polarity: "debuff", cleansable: true, stackPolicy: "refresh", durationClock: "target_action_turn", appliedTargetActionTurn: 0, expiresAfterTargetActionTurn: 2, remainingActionTurns: 2 },
  ];
  const rail = getBattleStatusRail(unit, 2);
  assert.equal(rail.visible.length, 3);
  assert.equal(rail.overflow, 2);
  assert.deepEqual(rail.visible.map((status) => status.id), ["stun", "defense-down", "corrosion"]);
});

test("Timeline side labels remain explicit and non-color-only", () => {
  assert.deepEqual(getTimelineSidePresentation("player"), { badge: "TA", label: "Phe Ta", marker: "▲" });
  assert.deepEqual(getTimelineSidePresentation("enemy"), { badge: "ĐỊCH", label: "Phe Địch", marker: "▼" });
});

test("Battle source keeps the Unified Timeline and removes legacy footer copy", () => {
  const source = readFileSync(new URL("./ChienTuyenGame.tsx", import.meta.url), "utf8");
  assert.match(source, /THANH THỨ TỰ HÀNH ĐỘNG/);
  assert.match(source, /Lượt Trận:/);
  assert.match(source, /Tầng:/);
  assert.doesNotMatch(source, /\{completed\}\s*\/\s*\{total\}/);
  assert.match(source, /ct-v2-status-rail/);
  assert.match(source, /ct-v2-status-rail" role="img"/);
  assert.doesNotMatch(source, /ct-v2-battle-footer/);
  assert.doesNotMatch(source, /giữ quyền ra đòn đầu/i);
  assert.doesNotMatch(source, /Tổng SPEED/i);
  assert.doesNotMatch(source, /ct-v2-speed-control|BATTLE_SPEEDS|onBattleSpeedChange/);
});

test("Progression and statistics presentation keep modal accessibility contracts", () => {
  const screenSource = readFileSync(new URL("./ChienTuyenScreen.tsx", import.meta.url), "utf8");
  const resultSource = readFileSync(new URL("./components/CampaignResult.tsx", import.meta.url), "utf8");
  const overlaySource = readFileSync(new URL("../../../components/overlay/AppOverlay.tsx", import.meta.url), "utf8");
  assert.match(screenSource, /aria-describedby="ct-progression-subtitle"/);
  assert.match(screenSource, /initialFocusRef=\{closeRef\}/);
  assert.match(overlaySource, /initialFocusRef\?\.current/);
  assert.match(overlaySource, /event\.key === "Escape"/);
  assert.match(overlaySource, /createPortal/);
  assert.match(resultSource, /label: "Hiệu ứng xấu"/);
});

test("Barracks actions are distinct and Quick Finish requires confirmation", () => {
  const barracksSource = readFileSync(new URL("./components/BarracksView.tsx", import.meta.url), "utf8");
  const screenSource = readFileSync(new URL("./ChienTuyenScreen.tsx", import.meta.url), "utf8");
  const confirmSource = readFileSync(new URL("./components/QuickFinishConfirmModal.tsx", import.meta.url), "utf8");
  assert.match(barracksSource, /data-action-kind="train-primary"/);
  assert.match(barracksSource, /data-action-kind="upgrade-secondary"/);
  assert.match(barracksSource, /data-action-kind="quick-finish-warning"/);
  assert.match(barracksSource, /Đang Nâng Cấp/);
  assert.match(barracksSource, /Đang Đào Tạo/);
  assert.match(barracksSource, /Sẵn Sàng/);
  assert.match(screenSource, /requestQuickFinishTraining/);
  assert.match(screenSource, /requestQuickFinishTroop/);
  assert.match(screenSource, /requestQuickFinishBarracks/);
  assert.match(screenSource, /<QuickFinishConfirmModal/);
  assert.match(confirmSource, /data-quick-finish-confirm="required"/);
  assert.match(confirmSource, /HỦY/);
  assert.match(confirmSource, /XÁC NHẬN/);
  assert.match(confirmSource, /data-quick-finish-charge="after-confirm"/);
  assert.match(confirmSource, /Lv\{confirmation\.currentLevel\} → Lv\{confirmation\.targetLevel\}/);
  assert.match(confirmSource, /formatChienTuyenDurationMs\(confirmation\.remainingMs\)/);
  assert.match(confirmSource, /confirmation\.costGold\.toLocaleString/);
});

console.log("CHIEN TUYEN UX POLISH TESTS PASSED");

import assert from "node:assert/strict";
import { applyFormationRowBonuses, buildBattleUnitStatistics, createBattleFromUnits, createTroopBattleUnit, runBattle } from "./engine";
import type { BattleSide, FormationSlotId, TroopType } from "./types";

type LineupEntry = readonly [TroopType, FormationSlotId];

interface AggregateMetric {
  deployments: number;
  actions: number;
  ultimates: number;
  damage: number;
  healing: number;
  shielding: number;
  survivals: number;
  stuns: number;
  deniedActions: number;
  corrosionApplications: number;
  lastStands: number;
}

const LEVEL_BANDS = [1, 10, 25, 40, 54] as const;
const MATCHUPS: ReadonlyArray<readonly [readonly LineupEntry[], readonly LineupEntry[]]> = [
  [
    [["armor", "front_left"], ["infantry", "front_center"], ["commando", "back_left"], ["medic", "back_center"]],
    [["engineer", "front_left"], ["pioneer", "front_center"], ["artillery", "back_left"], ["chemical", "back_center"]],
  ],
  [
    [["engineer", "front_left"], ["guard", "front_center"], ["air_force", "back_left"], ["anti_tank", "back_center"]],
    [["armor", "front_left"], ["infantry", "front_center"], ["commando", "back_left"], ["medic", "back_center"]],
  ],
  [
    [["pioneer", "front_left"], ["anti_tank", "front_center"], ["artillery", "back_left"], ["chemical", "back_center"]],
    [["armor", "front_left"], ["guard", "front_center"], ["air_force", "back_left"], ["medic", "back_center"]],
  ],
  [
    [["infantry", "front_left"], ["engineer", "front_center"], ["air_force", "back_left"], ["guard", "back_center"]],
    [["pioneer", "front_left"], ["anti_tank", "front_center"], ["commando", "back_left"], ["artillery", "back_center"]],
  ],
];

function createLineup(
  side: BattleSide,
  entries: readonly LineupEntry[],
  level: number,
  battleIndex: number
) {
  return entries.map(([troopType, slotId], unitIndex) => createTroopBattleUnit({
    instanceId: `sim-${battleIndex}-${side}-${unitIndex}-${troopType}`,
    side,
    troopType,
    slotId,
    level,
  }));
}

const metrics = new Map<TroopType, AggregateMetric>();
const roundLengths: number[] = [];
const timelineSpans: number[] = [];
let battleIndex = 0;

function aggregateFor(troopType: TroopType): AggregateMetric {
  const existing = metrics.get(troopType);
  if (existing) return existing;
  const created: AggregateMetric = {
    deployments: 0,
    actions: 0,
    ultimates: 0,
    damage: 0,
    healing: 0,
    shielding: 0,
    survivals: 0,
    stuns: 0,
    deniedActions: 0,
    corrosionApplications: 0,
    lastStands: 0,
  };
  metrics.set(troopType, created);
  return created;
}

for (const level of LEVEL_BANDS) {
  for (const [left, right] of MATCHUPS) {
    for (const mirrored of [false, true]) {
      battleIndex += 1;
      const player = mirrored ? right : left;
      const enemy = mirrored ? left : right;
      const units = applyFormationRowBonuses([
        ...createLineup("player", player, level, battleIndex),
        ...createLineup("enemy", enemy, level, battleIndex),
      ]);
      const initial = createBattleFromUnits({
        battleId: `balance-sim-lv${level}-${battleIndex}`,
        matchSeed: `unified-timeline-lv${level}-${battleIndex}`,
        units,
      });
      const resolved = runBattle(initial);
      assert.ok(resolved.outcome, `Lv${level} battle ${battleIndex} must finish`);
      assert.ok(resolved.round <= 250, `Lv${level} battle ${battleIndex} exceeded round guard`);
      roundLengths.push(resolved.round);
      timelineSpans.push(resolved.timelineTime);

      const statistics = new Map(buildBattleUnitStatistics(resolved).map((entry) => [entry.instanceId, entry]));
      const stunSources = new Map(
        resolved.events
          .filter((event) => event.type === "stun_applied" && event.statusId && event.sourceUnitId)
          .map((event) => [event.statusId!, event.sourceUnitId!] as const)
      );
      for (const unit of resolved.units) {
        if (!unit.troopType) continue;
        const aggregate = aggregateFor(unit.troopType);
        const statistic = statistics.get(unit.instanceId);
        aggregate.deployments += 1;
        aggregate.actions += resolved.events.filter((event) =>
          event.sourceUnitId === unit.instanceId &&
          (event.type === "attack" || event.type === "ultimate_started" || event.type === "action_skipped_stun")
        ).length;
        aggregate.ultimates += resolved.events.filter((event) =>
          event.sourceUnitId === unit.instanceId && event.type === "ultimate_started"
        ).length;
        aggregate.damage += statistic?.damageDealt ?? 0;
        aggregate.healing += statistic?.healingDone ?? 0;
        aggregate.shielding += statistic?.shieldCreated ?? 0;
        aggregate.survivals += Number(unit.alive);
        aggregate.stuns += resolved.events.filter((event) =>
          event.sourceUnitId === unit.instanceId && event.type === "stun_applied"
        ).length;
        aggregate.deniedActions += resolved.events.filter((event) =>
          event.type === "action_skipped_stun" && Boolean(event.statusId) && stunSources.get(event.statusId!) === unit.instanceId
        ).length;
        aggregate.corrosionApplications += resolved.events.filter((event) =>
          event.sourceUnitId === unit.instanceId && event.type === "corrosion"
        ).length;
        aggregate.lastStands += resolved.events.filter((event) =>
          event.sourceUnitId === unit.instanceId && event.type === "pioneer_last_stand"
        ).length;
      }
    }
  }
}

const perTroop = [...metrics.entries()]
  .map(([troopType, value]) => ({
    troopType,
    actions: value.actions / value.deployments,
    ultimates: value.ultimates / value.deployments,
    damage: value.damage / value.deployments,
    healing: value.healing / value.deployments,
    shielding: value.shielding / value.deployments,
    survival: value.survivals / value.deployments,
    stuns: value.stuns / value.deployments,
    deniedActions: value.deniedActions / value.deployments,
    corrosionApplications: value.corrosionApplications / value.deployments,
    lastStands: value.lastStands / value.deployments,
  }))
  .sort((left, right) => right.actions - left.actions);

const average = (values: readonly number[]) => values.reduce((total, value) => total + value, 0) / Math.max(1, values.length);
const troopMetric = (troopType: TroopType) => {
  const result = perTroop.find((entry) => entry.troopType === troopType);
  assert.ok(result, `Missing simulation metric for ${troopType}`);
  return result;
};
const fastActions = average([troopMetric("commando").actions, troopMetric("air_force").actions]);
const tankActions = average([troopMetric("armor").actions, troopMetric("engineer").actions]);
const actionRatio = fastActions / Math.max(0.001, tankActions);

assert.ok(actionRatio > 1, `Fast-unit action average (${fastActions}) should exceed tank average (${tankActions})`);
assert.ok(actionRatio < 3, `Compressed SPEED should keep the fast/tank action ratio below 3x, got ${actionRatio}`);
assert.ok(troopMetric("medic").healing > 0, "Medic must contribute healing in varied 4v4 simulations");
assert.ok(troopMetric("guard").shielding > 0, "Guard must contribute shielding in varied 4v4 simulations");

console.log("=== CHIEN TUYEN BALANCE SIMULATION ===");
console.table(perTroop.map((entry) => ({
  troop: entry.troopType,
  actions: entry.actions.toFixed(2),
  ultimates: entry.ultimates.toFixed(2),
  damage: Math.round(entry.damage),
  healing: Math.round(entry.healing),
  shielding: Math.round(entry.shielding),
  survival: `${Math.round(entry.survival * 100)}%`,
  utility: `stun ${entry.stuns.toFixed(1)} · deny ${entry.deniedActions.toFixed(1)} · corrosion ${entry.corrosionApplications.toFixed(1)} · last ${entry.lastStands.toFixed(1)}`,
})));
console.log(`Battles: ${battleIndex}; average rounds: ${average(roundLengths).toFixed(2)}; average timeline span: ${average(timelineSpans).toFixed(2)}; fast/tank action ratio: ${actionRatio.toFixed(2)}x`);
console.log("CHIEN TUYEN BALANCE SIMULATION PASSED");

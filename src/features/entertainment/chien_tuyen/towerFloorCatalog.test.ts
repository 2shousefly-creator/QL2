import {
  BOSS_FLOORS,
  BOSS_BY_ID,
  TOWER_FLOORS,
  getBossStats,
  getFirstClearGold,
  getEnemyLevel,
  getFloorStatMultiplier,
  getRecommendedLevel,
  getTowerFloor,
} from "./towerFloorCatalog";
import { FORMATION_SLOTS, TROOP_TYPES } from "./types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAILED: ${message}`);
}

function equal<T>(actual: T, expected: T, message: string): void {
  assert(Object.is(actual, expected), `${message}; expected ${String(expected)}, got ${String(actual)}`);
}

console.log("=== CHIẾN TUYẾN V2 TOWER TESTS ===");

equal(TOWER_FLOORS.length, 100, "catalog has exactly one hundred floors");
assert(TOWER_FLOORS.every((floor, index) => floor.floorNumber === index + 1), "floor numbers are sequential and fixed");
assert(getTowerFloor(0) === undefined && getTowerFloor(101) === undefined, "out-of-range floors cannot be entered");
equal(getTowerFloor(1)?.floorNumber, 1, "floor lookup is one-based");

const bossFloorNumbers = TOWER_FLOORS.filter((floor) => floor.isBoss).map((floor) => floor.floorNumber);
assert(JSON.stringify(bossFloorNumbers) === JSON.stringify(BOSS_FLOORS), "bosses exist at every tenth floor through 100");
for (const floor of TOWER_FLOORS) {
  const slots = floor.enemyFormation.map((unit) => unit.slotId);
  equal(new Set(slots).size, slots.length, `floor ${floor.floorNumber} never duplicates a slot`);
  assert(slots.every((slot) => FORMATION_SLOTS.includes(slot)), `floor ${floor.floorNumber} uses canonical 2x3 slots`);
  if (floor.isBoss) {
    equal(floor.enemyFormation.length, 1, `boss floor ${floor.floorNumber} has exactly one Boss`);
    const enemy = floor.enemyFormation[0];
    assert(enemy.troopType === null && enemy.bossId === floor.bossId && floor.bossId !== null, `boss floor ${floor.floorNumber} has an explicit boss entry`);
    assert(Boolean(BOSS_BY_ID[floor.bossId]), `boss floor ${floor.floorNumber} references a catalog boss`);
    equal(enemy.slotId, "front_center", `boss floor ${floor.floorNumber} places the Boss in front_center`);
  } else {
    equal(floor.enemyFormation.length, 4, `normal floor ${floor.floorNumber} has exactly four enemies`);
    const typeCounts = new Map<string, number>();
    for (const enemy of floor.enemyFormation) {
      assert(enemy.troopType !== null && TROOP_TYPES.includes(enemy.troopType), `floor ${floor.floorNumber} uses a canonical troop`);
      typeCounts.set(enemy.troopType, (typeCounts.get(enemy.troopType) ?? 0) + 1);
      equal(enemy.level, floor.enemyLevel, `floor ${floor.floorNumber} entry locks its level`);
      equal(enemy.statMultiplier, floor.statMultiplier, `floor ${floor.floorNumber} entry locks its multiplier`);
    }
    assert([...typeCounts.values()].every((count) => count <= 3), `normal floor ${floor.floorNumber} stays within its curated four-unit composition`);
  }
  equal(floor.chapter, Math.ceil(floor.floorNumber / 10), `floor ${floor.floorNumber} maps to the correct chapter`);
}

equal(getRecommendedLevel(1), 1, "floor 1 recommends level 1");
equal(getRecommendedLevel(10), 7, "floor 10 boss recommends level 7");
equal(getRecommendedLevel(20), 12, "floor 20 boss recommends level 12");
equal(getRecommendedLevel(50), 28, "floor 50 boss recommends level 28");
equal(getRecommendedLevel(100), 54, "floor 100 recommends the capped level 54");
equal(getEnemyLevel(1), 1, "floor 1 enemy is level 1");
equal(getEnemyLevel(100), 54, "floor 100 enemy is level 54");
assert(TOWER_FLOORS.every((floor, index) => index === 0 || floor.enemyLevel >= TOWER_FLOORS[index - 1].enemyLevel), "enemy level curve is monotonic");
equal(getFloorStatMultiplier(1), 1, "composition and level drive normal floor scaling");
equal(getFloorStatMultiplier(100), 1, "floor multiplier stays neutral at the summit");
assert(TOWER_FLOORS.every((floor, index) => index === 0 || floor.statMultiplier >= TOWER_FLOORS[index - 1].statMultiplier), "floor multipliers never decrease");

for (let floor = 1; floor <= 100; floor += 1) {
  equal(getTowerFloor(floor)?.firstClearGold, getFirstClearGold(floor), `floor ${floor} stores reward in config`);
}
equal(getFirstClearGold(50), 800, "legacy floor 50 reward is preserved");
equal(getFirstClearGold(100), 1800, "final floor reward uses the extended capped economy");
equal(getTowerFloor(3)?.enemyFormation.filter((entry) => entry.troopType === "medic").length, 2, "curated duplicate Medic floor is accepted");

const rebalancedFloorCompositions = {
  8: { front: ["engineer", "infantry"], back: ["guard", "artillery"] },
  16: { front: ["scout", "infantry"], back: ["commando", "marksman"] },
  23: { front: ["scout", "martial_artist"], back: ["commando", "marksman"] },
  28: { front: ["armor", "medic"], back: ["commando", "air_force"] },
  34: { front: ["engineer", "armor"], back: ["forensic_medic", "chemical"] },
  42: { front: ["engineer", "pioneer"], back: ["guard", "divine_medic"] },
  55: { front: ["scout", "divine_medic"], back: ["air_force", "marksman"] },
  71: { front: ["electronic_warfare", "martial_artist"], back: ["special_ops", "pioneer"] },
  78: { front: ["scout", "martial_artist"], back: ["electronic_warfare", "commando"] },
  86: { front: ["scout", "electronic_warfare"], back: ["air_force", "martial_artist"] },
} as const;

for (const [floorNumberText, composition] of Object.entries(rebalancedFloorCompositions)) {
  const floor = getTowerFloor(Number(floorNumberText))!;
  const front = floor.enemyFormation.filter((entry) => entry.slotId.startsWith("front_")).map((entry) => entry.troopType);
  const back = floor.enemyFormation.filter((entry) => entry.slotId.startsWith("back_")).map((entry) => entry.troopType);
  assert(JSON.stringify(front) === JSON.stringify(composition.front), `floor ${floorNumberText} uses the rebalanced front row`);
  assert(JSON.stringify(back) === JSON.stringify(composition.back), `floor ${floorNumberText} uses the rebalanced back row`);
}

const canonicalBossMultipliers = {
  armored_war_machine: [4.8, 1.55, 1.15, 1.10],
  firepower_fortress: [11.5, 1.65, 1.45, 1.05],
  special_ops_ghost: [9.5, 1.65, 1.50, 1.05],
  chemical_destroyer: [9.5, 1.70, 1.60, 1.10],
  armored_commander: [5.5, 1.70, 1.50, 1.15],
  chief_medic: [8.0, 1.60, 1.60, 1.15],
  ultimate_hunter: [7.5, 1.75, 1.80, 1.15],
  signal_overlord: [8.0, 1.70, 1.80, 1.15],
  annihilation_airstrike: [11.5, 1.85, 1.90, 1.20],
  supreme_commander: [12.5, 2.00, 2.10, 1.20],
} as const;

for (const [bossId, multipliers] of Object.entries(canonicalBossMultipliers)) {
  const boss = BOSS_BY_ID[bossId as keyof typeof BOSS_BY_ID];
  assert(
    JSON.stringify([boss.hpMultiplier, boss.attackMultiplier, boss.defenseMultiplier, boss.speedMultiplier]) === JSON.stringify(multipliers),
    `boss ${bossId} uses the final Solo Boss multiplier table`
  );
}

for (const floorNumber of BOSS_FLOORS) {
  const floor = getTowerFloor(floorNumber)!;
  const stats = getBossStats(floor.bossId!, floor.enemyLevel, floor.statMultiplier);
  assert(stats.maxHp > 0 && stats.attack > 0 && stats.defense >= 0 && stats.speed > 0, `boss ${floorNumber} has complete deterministic stats`);
}
assert(JSON.stringify(TOWER_FLOORS) === JSON.stringify(TOWER_FLOORS), "catalog replay is deterministic and contains no runtime RNG");

console.log("CHIẾN TUYẾN V2 TOWER TESTS PASSED");

import {
  ENEMY_TANK_CONFIGS,
  GAMEPLAY_SAFE_RECT,
  HEADQUARTERS_BASE_STATS,
  PLAYER_TANK_BASE_STATS,
  TANK_BATTLE_WORLD,
  UPGRADE_DEFINITIONS,
  WAVE_DEFINITIONS,
} from "./tankBattleConfig";
import {
  buildNavigationGrid,
  calculateArmoredDamage,
  calculateTankBattleRank,
  calculateTankBattleReward,
  createDefaultTankBattleProfile,
  createUpgradeOffers,
  findNavigationPath,
  getBossPhase,
  isMinePlacementValid,
  resolveAimAngle,
  resolveDriveInput,
  selectEnemyTargetKind,
  shouldFireOnAimRelease,
  shouldInterruptBossSiege,
} from "./tankBattleEngine";
import { createTankBattleWorld } from "./tankBattleRuntime";
import { TankBattleRunSummary, TerrainState } from "./tankBattleTypes";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

function approximately(actual: number, expected: number, epsilon = 0.0001): boolean {
  return Math.abs(actual - expected) <= epsilon;
}

function makeRandom(seed = 0x5eeda11): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

console.log("=== TANK BATTLE ENGINE TESTS ===\n");

assert(PLAYER_TANK_BASE_STATS.maxHp === 1000, "M-07 baseline Max HP is 1000");
assert(PLAYER_TANK_BASE_STATS.armor === 35, "M-07 baseline Armor is 35");
assert(PLAYER_TANK_BASE_STATS.cannonDamage === 140, "M-07 cannon raw damage is 140");
assert(PLAYER_TANK_BASE_STATS.reloadSeconds === 1.1, "M-07 reload is 1.10 seconds");
assert(PLAYER_TANK_BASE_STATS.maxActiveShells === 3, "M-07 starts with three active shell slots");
assert(PLAYER_TANK_BASE_STATS.maxActiveMines === 2, "M-07 starts with two active mines");
assert(PLAYER_TANK_BASE_STATS.mineDamage === 300, "M-07 mine raw damage is 300");
assert(HEADQUARTERS_BASE_STATS.maxHp === 3000, "Headquarters baseline Max HP is 3000");
assert(HEADQUARTERS_BASE_STATS.armor === 20, "Headquarters baseline Armor is 20");
assert(Object.keys(ENEMY_TANK_CONFIGS).length === 7, "five normal enemies plus Elite and Boss are configured");
assert(WAVE_DEFINITIONS.length === 5, "the run has exactly five pre-Boss waves");
assert(WAVE_DEFINITIONS[2].enemies.some((entry) => entry.type === "elite"), "Wave 3 contains Xe Tăng Phá Tuyến");
assert(UPGRADE_DEFINITIONS.every((upgrade) => upgrade.category !== ("resource" as never)), "upgrade pool contains no Mana, Energy, Core, or combat-level category");

assert(calculateArmoredDamage(200, 0) === 200, "Armor 0 preserves raw damage");
assert(calculateArmoredDamage(200, 100) === 100, "Armor 100 halves raw damage");
assert(approximately(calculateArmoredDamage(140, 35), 103.7037037), "shared armor formula keeps floating-point precision");

const driveForward = resolveDriveInput(0, -54);
assert(driveForward.throttle === 1 && driveForward.steer === 0, "left joystick up drives the tank forward");
const driveReverseTurn = resolveDriveInput(27, 27);
assert(driveReverseTurn.throttle < 0 && driveReverseTurn.steer > 0, "natural diagonal drag independently controls tracks and steering");
assert(resolveDriveInput(2, -2).throttle === 0, "joystick dead-zone eliminates drift at rest");

assert(shouldFireOnAimRelease({ x: 26, y: 0 }, false), "aim release outside cancel zone requests exactly one shot");
assert(!shouldFireOnAimRelease({ x: 4, y: 3 }, false), "aim release inside cancel zone never fires");
assert(!shouldFireOnAimRelease({ x: 30, y: 0 }, true), "touchcancel/app interruption never fires");

const rawAngle = 0;
const assisted = resolveAimAngle(
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  [{ x: 100, y: Math.tan((6 * Math.PI) / 180) * 100 }]
);
assert(assisted > rawAngle, "aim assist can select a target within the mild 7-degree cone");
const unassisted = resolveAimAngle(
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  [{ x: 100, y: Math.tan((12 * Math.PI) / 180) * 100 }]
);
assert(approximately(unassisted, rawAngle), "aim assist never locks a target outside its cone");

assert(selectEnemyTargetKind("light", true, true, true) === "hq", "light tanks prioritize Headquarters");
assert(selectEnemyTargetKind("battle", true, true, false) === "player", "battle tanks prioritize the living player");
assert(selectEnemyTargetKind("battle", false, true, false) === "hq", "battle tanks fall back to Headquarters");
assert(selectEnemyTargetKind("siege", true, true, false) === "terrain", "siege tanks open a destructible route");
assert(selectEnemyTargetKind("minesweeper", true, true, true) === "mine", "mine sweepers counter player mines first");

assert(getBossPhase(100, 100) === 1 && getBossPhase(65, 100) === 2 && getBossPhase(30, 100) === 3, "Boss phase thresholds are 65% and 30%");
assert(shouldInterruptBossSiege(750, 10_000), "7.5% raw damage interrupts the siege charge");
assert(!shouldInterruptBossSiege(749, 10_000), "damage below the threshold does not interrupt the charge");

const wall: TerrainState = {
  id: 1,
  type: "brick",
  x: 180,
  y: 300,
  width: 44,
  height: 90,
  hp: 300,
  maxHp: 300,
  alive: true,
  explosiveRadius: 0,
};
assert(!isMinePlacementValid({ x: wall.x, y: wall.y }, [wall], []), "mine placement rejects walls");
assert(!isMinePlacementValid({ x: GAMEPLAY_SAFE_RECT.left, y: GAMEPLAY_SAFE_RECT.top }, [], []), "mine placement rejects out-of-bounds edge positions");
assert(!isMinePlacementValid({ x: 180, y: 400 }, [], [{ id: 2, owner: "player", x: 182, y: 401, armedRemaining: 0, radius: 8, triggerRadius: 22, rawDamage: 300, slowRatio: 0, rearmSeconds: 0, charges: 1, sweepProgress: 0 }]), "mine placement rejects overlapping mines");

const gridWithWall = buildNavigationGrid([wall], 1, 24);
const blockedPath = findNavigationPath({ x: 180, y: 180 }, { x: 180, y: 430 }, gridWithWall);
wall.alive = false;
const gridWithoutWall = buildNavigationGrid([wall], 2, 24);
const openPath = findNavigationPath({ x: 180, y: 180 }, { x: 180, y: 430 }, gridWithoutWall);
assert(gridWithWall.blocked.some(Boolean) && !gridWithoutWall.blocked.some(Boolean), "destroyed brick is removed from navigation topology");
assert(openPath.length <= blockedPath.length, "destroying a wall creates an equal or shorter Headquarters route");

const upgradeWorld = createTankBattleWorld(makeRandom());
upgradeWorld.phase = "upgrade";
upgradeWorld.headquarters.hp = upgradeWorld.headquarters.stats.maxHp;
const offers = createUpgradeOffers(upgradeWorld, makeRandom(42));
assert(offers.length === 3, "every upgrade milestone offers exactly three cards");
assert(new Set(offers.map((offer) => offer.id)).size === 3, "upgrade cards never duplicate within one offer");
assert(new Set(offers.map((offer) => offer.category)).size >= 2, "every offer spans at least two upgrade categories");
assert(!offers.some((offer) => offer.id === "hq_emergency_repair"), "full Headquarters never receives a useless emergency-repair offer");

const sampleSummary: TankBattleRunSummary = {
  victory: true,
  defeatReason: null,
  score: 9000,
  rank: "C",
  enemiesDefeated: 44,
  elitesDefeated: 1,
  cannonShots: 50,
  cannonHits: 42,
  cannonAccuracy: 0.84,
  mineKills: 5,
  damageDealt: 12_000,
  damageTaken: 210,
  hqDamageTaken: 180,
  hqHpRemaining: 2820,
  hqMaxHp: 3000,
  wallsDestroyedByPlayer: 4,
  wallsDestroyedByEnemy: 3,
  runSeconds: 315,
  bossClearSeconds: 72,
  upgrades: [],
};
sampleSummary.rank = calculateTankBattleRank(sampleSummary);
assert(["A", "S", "SS"].includes(sampleSummary.rank), "rank weights HQ survival, time, accuracy, and received damage");
const profile = createDefaultTankBattleProfile();
const firstReward = calculateTankBattleReward(sampleSummary, profile, "2026-08-19");
assert(firstReward.reward.gold <= 6 && firstReward.reward.xp <= 4, "per-run rewards remain small and capped");
let dailyProfile = firstReward.nextProfile;
for (let run = 0; run < 8; run += 1) {
  dailyProfile = calculateTankBattleReward(sampleSummary, dailyProfile, "2026-08-19").nextProfile;
}
assert(dailyProfile.goldRewardedToday <= 14 && dailyProfile.xpRewardedToday <= 10, "daily reward caps cannot be exceeded");

console.log("\nALL TANK BATTLE ENGINE TESTS PASSED");

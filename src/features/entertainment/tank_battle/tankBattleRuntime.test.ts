import {
  GAMEPLAY_SAFE_RECT,
  TANK_BATTLE_WORLD,
  WAVE_DEFINITIONS,
} from "./tankBattleConfig";
import {
  activePlayerMineCount,
  activePlayerShellCount,
  createUpgradeOffers,
} from "./tankBattleEngine";
import {
  createTankBattleWorld,
  damageEnemyForTest,
  damageHeadquartersForTest,
  damageTerrainForTest,
  firePlayerShell,
  makeTankBattleHudSnapshot,
  placePlayerMine,
  selectTankUpgrade,
  setTankAimTarget,
  setTankBattlePaused,
  setTankDriveInput,
  spawnEnemyTank,
  stopTankDriveInput,
  summarizeTankBattleWorld,
  updateTankBattleWorld,
} from "./tankBattleRuntime";
import { TerrainState } from "./tankBattleTypes";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

function makeRandom(seed = 0xc0ffee): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function tick(world: ReturnType<typeof createTankBattleWorld>, seconds: number): void {
  let remaining = seconds;
  while (remaining > 0) {
    const delta = Math.min(1 / 60, remaining);
    updateTankBattleWorld(world, delta);
    remaining -= delta;
  }
}

console.log("=== TANK BATTLE RUNTIME INTEGRATION TESTS ===\n");

const initial = createTankBattleWorld(makeRandom());
assert(initial.player.y - initial.player.radius >= GAMEPLAY_SAFE_RECT.top, "player starts below the fixed HUD safe boundary");
assert(initial.player.y + initial.player.radius <= GAMEPLAY_SAFE_RECT.bottom, "player starts above the control-area safe boundary");
assert(initial.headquarters.hp === 3000 && initial.headquarters.alive, "Headquarters is a real live target with canonical HP");
assert(initial.waveIndex === 0 && initial.pendingSpawns.length === 7, "Wave 1 queues its light-tank tutorial formation");

const movement = createTankBattleWorld(makeRandom());
movement.terrain = [];
movement.topologyDirty = true;
const startY = movement.player.y;
setTankDriveInput(movement, { throttle: 1, steer: 0 });
tick(movement, 0.5);
assert(movement.player.y < startY, "left joystick throttle moves the tank body forward");
stopTankDriveInput(movement);
const stopped = { x: movement.player.x, y: movement.player.y };
tick(movement, 0.35);
assert(movement.player.x === stopped.x && movement.player.y === stopped.y, "releasing movement control stops immediately without drift");
const bodyBeforeAim = movement.player.bodyAngle;
setTankAimTarget(movement, { x: movement.player.x + 100, y: movement.player.y }, false);
tick(movement, 0.3);
assert(Math.abs(movement.player.turretAngle) < 0.2, "right joystick rotates the turret independently toward aim");
assert(movement.player.bodyAngle === bodyBeforeAim, "aiming never rotates the tank body");

const shells = createTankBattleWorld(makeRandom());
shells.terrain = [];
shells.topologyDirty = true;
shells.pendingSpawns = [{ type: "light", delay: 0 }];
setTankAimTarget(shells, { x: shells.player.x, y: shells.player.y - 100 }, false);
shells.player.turretAngle = shells.player.turretTargetAngle;
for (let index = 0; index < 3; index += 1) {
  shells.player.reloadRemaining = 0;
  assert(firePlayerShell(shells), `shell slot ${index + 1} can fire when reload is ready`);
}
shells.player.reloadRemaining = 0;
assert(!firePlayerShell(shells), "a fourth shell cannot fire while three slots are active");
assert(activePlayerShellCount(shells) === 3, "shell limit is independent from the reload timer");
tick(shells, TANK_BATTLE_WORLD.playerProjectileTimeout + 0.2);
assert(activePlayerShellCount(shells) < 3, "shell slots return after timeout or leaving bounds");

const steelWorld = createTankBattleWorld(makeRandom());
steelWorld.pendingSpawns = [{ type: "light", delay: 99 }];
const steel: TerrainState = {
  id: 900,
  type: "steel",
  x: steelWorld.player.x,
  y: steelWorld.player.y - 48,
  width: 28,
  height: 18,
  hp: Number.POSITIVE_INFINITY,
  maxHp: Number.POSITIVE_INFINITY,
  alive: true,
  explosiveRadius: 0,
};
steelWorld.terrain = [steel];
steelWorld.topologyDirty = true;
steelWorld.player.turretAngle = -Math.PI / 2;
steelWorld.player.turretTargetAngle = -Math.PI / 2;
assert(firePlayerShell(steelWorld), "test shell fires toward steel cover");
tick(steelWorld, 0.25);
assert(activePlayerShellCount(steelWorld) === 0, "steel despawns the shell and returns its slot");
assert(steel.alive && steel.hp === Number.POSITIVE_INFINITY, "steel remains indestructible with no ricochet side effect");

const mineWorld = createTankBattleWorld(makeRandom());
mineWorld.terrain = [];
mineWorld.topologyDirty = true;
assert(placePlayerMine(mineWorld), "first baseline mine can be placed");
mineWorld.player.x += 32;
assert(placePlayerMine(mineWorld), "second baseline mine can be placed at a valid separated position");
mineWorld.player.x += 32;
assert(!placePlayerMine(mineWorld), "mine cap blocks a third active mine");
assert(activePlayerMineCount(mineWorld) === 2, "active player mine count respects the baseline cap");
const targetMine = mineWorld.mines.find((mine) => mine.owner === "player")!;
mineWorld.player.x = GAMEPLAY_SAFE_RECT.left + 18;
mineWorld.player.y = GAMEPLAY_SAFE_RECT.bottom - 18;
const mineEnemy = spawnEnemyTank(mineWorld, "light", { x: targetMine.x, y: targetMine.y - 10 })!;
mineEnemy.armor = 0;
mineEnemy.hp = 100;
tick(mineWorld, 0.55);
assert(!mineEnemy.alive && activePlayerMineCount(mineWorld) === 1, "triggered mine kills, despawns, and returns its active slot");
assert(mineWorld.metrics.mineKills === 1, "mine kill is recorded separately");

const navigation = createTankBattleWorld(makeRandom());
navigation.pendingSpawns = [{ type: "light", delay: 99 }];
const buildsBefore = navigation.navigationBuildCount;
tick(navigation, 0.2);
assert(navigation.navigationBuildCount === buildsBefore, "navigation is not rebuilt every frame");
const brick = navigation.terrain.find((terrain) => terrain.type === "brick" && terrain.alive)!;
damageTerrainForTest(navigation, brick, 1000, "player");
assert(navigation.topologyDirty, "destroying a brick marks topology dirty immediately");
tick(navigation, 0.05);
assert(navigation.navigationBuildCount === buildsBefore + 1, "navigation rebuilds once after a topology change");
tick(navigation, 0.2);
assert(navigation.navigationBuildCount === buildsBefore + 1, "stable topology does not rebuild again");

const barrelWorld = createTankBattleWorld(makeRandom());
barrelWorld.pendingSpawns = [{ type: "light", delay: 99 }];
barrelWorld.terrain = [
  { id: 910, type: "barrel", x: 160, y: 300, width: 18, height: 18, hp: 100, maxHp: 100, alive: true, explosiveRadius: 58 },
  { id: 911, type: "barrel", x: 198, y: 300, width: 18, height: 18, hp: 100, maxHp: 100, alive: true, explosiveRadius: 58 },
];
barrelWorld.topologyDirty = false;
damageTerrainForTest(barrelWorld, barrelWorld.terrain[0], 200, "player");
assert(barrelWorld.terrain.every((terrain) => !terrain.alive), "barrel chain reaction resolves once across nearby barrels");
assert(barrelWorld.explosions.length === 2, "barrel recursion guard prevents duplicate explosions");
assert(barrelWorld.topologyDirty, "destroyed barrels invalidate navigation topology");

const upgrade = createTankBattleWorld(makeRandom());
upgrade.phase = "upgrade";
upgrade.headquarters.hp -= 500;
upgrade.upgradeOffers = createUpgradeOffers(upgrade, () => 0.01);
upgrade.upgradeOffers[0] = {
  id: "tank_hp",
  category: "tank",
  name: "Khung Thân Gia Cường",
  description: "test",
  icon: "♥",
  maxStacks: 3,
  stackAfterSelection: 1,
};
const hpBefore = upgrade.player.stats.maxHp;
assert(selectTankUpgrade(upgrade, "tank_hp"), "one offered upgrade applies and resumes combat");
assert(upgrade.player.stats.maxHp === hpBefore + 180, "selected upgrade changes canonical combat stats once");
assert(!selectTankUpgrade(upgrade, "tank_hp"), "upgrade selection cannot double-apply after resume");
assert((upgrade.phase as string) === "playing" && upgrade.waveIndex === 1, "upgrade pause resumes at the next wave");

const milestoneWorld = createTankBattleWorld(makeRandom(19));
milestoneWorld.waveIndex = 1;
for (let milestone = 0; milestone < 4; milestone += 1) {
  milestoneWorld.phase = "upgrade";
  milestoneWorld.upgradeSelectionLocked = false;
  milestoneWorld.upgradeOffers = createUpgradeOffers(milestoneWorld, makeRandom(100 + milestone));
  assert(selectTankUpgrade(milestoneWorld, milestoneWorld.upgradeOffers[0].id), `upgrade milestone ${milestone + 1} accepts exactly one card`);
}
assert(milestoneWorld.upgradeMilestonesCompleted === 4, "the run provides exactly four upgrade milestones");
assert(milestoneWorld.bossSpawned && milestoneWorld.enemies.some((enemy) => enemy.type === "boss"), "fourth upgrade launches the Boss encounter");

const pause = createTankBattleWorld(makeRandom());
const elapsedBeforePause = pause.elapsedSeconds;
const hpBeforePause = pause.player.hp;
setTankBattlePaused(pause, true);
tick(pause, 2);
assert(pause.elapsedSeconds === elapsedBeforePause && pause.player.hp === hpBeforePause, "user pause freezes all simulation and damage");
setTankBattlePaused(pause, false);
tick(pause, 0.1);
assert(pause.elapsedSeconds > elapsedBeforePause, "simulation resumes from a capped delta without a time jump");

const bossWorld = createTankBattleWorld(makeRandom());
bossWorld.terrain = [];
bossWorld.topologyDirty = true;
bossWorld.pendingSpawns = [];
bossWorld.bossSpawned = true;
bossWorld.headquarters.hp = 100_000;
bossWorld.headquarters.stats.maxHp = 100_000;
bossWorld.player.hp = 100_000;
bossWorld.player.stats.maxHp = 100_000;
const boss = spawnEnemyTank(bossWorld, "boss", { x: 180, y: 160 })!;
boss.hp = boss.maxHp * 0.5;
boss.bossSummonCooldown = 0;
tick(bossWorld, 0.05);
assert(bossWorld.enemies.filter((enemy) => enemy.type === "light" && enemy.alive).length === 2, "Boss phase 2 summons exactly two light tanks per event");
bossWorld.enemies.forEach((enemy) => { if (enemy.type === "light") enemy.alive = false; });
boss.bossSummonCooldown = 0;
tick(bossWorld, 0.05);
bossWorld.enemies.forEach((enemy) => { if (enemy.type === "light") enemy.alive = false; });
boss.bossSummonCooldown = 0;
tick(bossWorld, 0.05);
assert(boss.bossSummonsUsed === 2, "Boss reinforcement events are limited and cannot spawn forever");

boss.hp = boss.maxHp * 0.25;
boss.bossSiegeCooldown = 0;
tick(bossWorld, 0.05);
assert(bossWorld.bossLockWarning && boss.bossSiegeCharge > 0, "Boss phase 3 shows HQ lock with a three-second charge");
damageEnemyForTest(bossWorld, boss, boss.maxHp * 0.08, "player");
assert(!bossWorld.bossLockWarning && boss.bossSiegeCharge === 0, "damage threshold counters and interrupts the siege cannon");

damageEnemyForTest(bossWorld, boss, boss.maxHp * 20, "player");
assert(bossWorld.phase === "victory", "destroying the Boss ends spawning and wins when player/HQ live");
assert(!bossWorld.projectiles.some((projectile) => projectile.dangerous), "Boss death clears dangerous projectiles");

const fullRun = createTankBattleWorld(makeRandom(2026));
fullRun.terrain = [];
fullRun.topologyDirty = true;
fullRun.player.hp = 1_000_000;
fullRun.player.stats.maxHp = 1_000_000;
fullRun.player.stats.armor = 1000;
fullRun.player.stats.cannonDamage = 50_000;
fullRun.player.stats.reloadSeconds = 0.08;
fullRun.player.stats.projectileSpeed = 1000;
fullRun.player.stats.maxActiveShells = 5;
fullRun.headquarters.hp = 1_000_000;
fullRun.headquarters.stats.maxHp = 1_000_000;
fullRun.headquarters.stats.armor = 1000;
for (let step = 0; step < 18_000 && fullRun.phase !== "victory"; step += 1) {
  if (fullRun.phase === "upgrade") {
    selectTankUpgrade(fullRun, fullRun.upgradeOffers[0].id);
    continue;
  }
  const target = fullRun.enemies.find((enemy) => enemy.alive);
  if (target) {
    setTankAimTarget(fullRun, target, false);
    fullRun.player.turretAngle = fullRun.player.turretTargetAngle;
    firePlayerShell(fullRun);
  }
  updateTankBattleWorld(fullRun, 1 / 30);
}
assert(fullRun.phase === "victory", "a complete five-wave, four-upgrade, Elite, and Boss run can reach victory");
assert(fullRun.upgradeMilestonesCompleted === 4 && fullRun.metrics.elitesDefeated === 1, "complete run preserves all milestones and the Elite encounter");
assert(fullRun.metrics.bossDefeatedAt !== null, "complete run records a distinct Boss clear time");

const defeat = createTankBattleWorld(makeRandom());
damageHeadquartersForTest(defeat, 100_000);
assert(defeat.phase === "defeat_hq", "Headquarters destruction has its own defeat state");
const defeatSummary = summarizeTankBattleWorld(defeat);
assert(defeatSummary.defeatReason === "hq", "result summary differentiates Headquarters defeat");

const hud = makeTankBattleHudSnapshot(initial);
assert(hud.activeShells === 0 && hud.maxShells === 3, "HUD exposes active/max shell slots");
assert(hud.activeMines === 0 && hud.maxMines === 2, "HUD exposes active/max mine slots");
assert(hud.hqHp === 3000 && hud.hqArmor === 20, "HUD exposes separate Headquarters HP and Armor");
assert(WAVE_DEFINITIONS[4].upgradeAfter, "fourth upgrade occurs after Wave 5 before the Boss");

console.log("\nALL TANK BATTLE RUNTIME TESTS PASSED");

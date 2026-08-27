import {
  AIR_COMBAT_WORLD,
  AIRCRAFT_ORDER,
  ENEMY_CONFIGS,
  GAMEPLAY_SAFE_RECT,
} from "./airCombatConfig";
import { gainCombatXp, requiredCombatXp } from "./airCombatEngine";
import {
  castWorldSkill,
  CombatWorld,
  createCombatWorld,
  EnemyEntity,
  ensureCoreSelection,
  makeHudSnapshot,
  resolvePlayerControlInput,
  selectCore,
  setPlayerInputActive,
  setPlayerMoveInput,
  summarizeCombatWorld,
  updateCombatWorld,
} from "./airCombatRuntime";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

function makeRandom(seed = 0x71a9): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function addStationaryEnemy(
  world: CombatWorld,
  x: number,
  y: number,
  hp = 2_000
): EnemyEntity {
  const config = ENEMY_CONFIGS.scout;
  const enemy: EnemyEntity = {
    id: world.nextId++,
    type: "scout",
    x,
    y,
    baseX: x,
    vx: 0,
    vy: 0,
    radius: config.radius,
    hp,
    maxHp: hp,
    armor: 0,
    age: 0,
    fireCooldown: 999,
    phaseSeed: 0,
    wave: 1,
    dashCharge: 0,
  };
  world.enemies.push(enemy);
  return enemy;
}

console.log("=== AIR COMBAT RUNTIME INTEGRATION TESTS ===\n");

for (const aircraftId of AIRCRAFT_ORDER) {
  const world = createCombatWorld(aircraftId, makeRandom());
  assert(world.aircraft.aircraftId === aircraftId, `${aircraftId} creates its own combat state`);
  assert(world.playerY - world.playerRadius >= GAMEPLAY_SAFE_RECT.top, `${aircraftId} starts below the fixed HUD`);
  assert(world.playerY + world.playerRadius <= GAMEPLAY_SAFE_RECT.bottom, `${aircraftId} starts inside the gameplay bottom edge`);
}

const movementWorld = createCombatWorld("black_eagle", makeRandom());
const movementStart = { x: movementWorld.playerX, y: movementWorld.playerY };
const horizontalDiagonal = resolvePlayerControlInput(48, 34);
assert(
  horizontalDiagonal.axis === "horizontal" &&
    horizontalDiagonal.inputX > 0 &&
    horizontalDiagonal.inputY === 0,
  "a diagonal drag resolves to one horizontal direction without diagonal movement"
);
const stableHorizontal = resolvePlayerControlInput(38, 40, "horizontal");
assert(
  stableHorizontal.axis === "horizontal" && stableHorizontal.inputY === 0,
  "axis hysteresis prevents unstable direction switching near a diagonal"
);
const switchedVertical = resolvePlayerControlInput(20, -45, "horizontal");
assert(
  switchedVertical.axis === "vertical" &&
    switchedVertical.inputX === 0 &&
    switchedVertical.inputY < 0,
  "a clearly dominant vertical drag switches cleanly to upward movement"
);
const leftControl = resolvePlayerControlInput(-48, 12);
const downControl = resolvePlayerControlInput(10, 48);
assert(
  leftControl.axis === "horizontal" && leftControl.inputX < 0 && leftControl.inputY === 0,
  "left drag produces only leftward input"
);
assert(
  downControl.axis === "vertical" && downControl.inputX === 0 && downControl.inputY > 0,
  "down drag produces only downward input"
);
const neutralControl = resolvePlayerControlInput(5, 5, "vertical");
assert(
  neutralControl.axis === null && neutralControl.inputX === 0 && neutralControl.inputY === 0,
  "returning inside the joystick dead zone resets the axis to neutral"
);
setPlayerMoveInput(movementWorld, 3, 4);
assert(
  movementWorld.playerInputX === 0 && movementWorld.playerInputY === 1,
  "runtime input accepts only the dominant vertical axis and rejects a diagonal vector"
);
updateCombatWorld(movementWorld, 1 / 30);
assert(
  movementWorld.playerX === movementStart.x && movementWorld.playerY === movementStart.y,
  "aircraft stays still while no movement input is active"
);
setPlayerInputActive(movementWorld, true);
setPlayerMoveInput(movementWorld, 1, 0);
updateCombatWorld(movementWorld, 1 / 30);
assert(
  movementWorld.playerX > movementStart.x && movementWorld.playerY === movementStart.y,
  "aircraft moves right from its current position when the finger steers right"
);
const afterRightInput = { x: movementWorld.playerX, y: movementWorld.playerY };
setPlayerMoveInput(movementWorld, 0, -1);
updateCombatWorld(movementWorld, 1 / 30);
assert(
  movementWorld.playerX === afterRightInput.x && movementWorld.playerY < afterRightInput.y,
  "changing finger direction steers from the aircraft's current position"
);
setPlayerMoveInput(movementWorld, 0, 0);
const neutralPosition = { x: movementWorld.playerX, y: movementWorld.playerY };
updateCombatWorld(movementWorld, 1 / 30);
assert(
  movementWorld.playerX === neutralPosition.x && movementWorld.playerY === neutralPosition.y,
  "returning the virtual joystick to its origin stops movement while still touching"
);
setPlayerInputActive(movementWorld, false);
const releasedPosition = { x: movementWorld.playerX, y: movementWorld.playerY };
for (let frame = 0; frame < 12; frame++) updateCombatWorld(movementWorld, 1 / 30);
assert(
  movementWorld.playerX === releasedPosition.x && movementWorld.playerY === releasedPosition.y,
  "aircraft stops at the release point instead of drifting toward the last target"
);

const boundaryWorld = createCombatWorld("black_eagle", makeRandom());
boundaryWorld.playerX = GAMEPLAY_SAFE_RECT.left + boundaryWorld.playerRadius;
setPlayerInputActive(boundaryWorld, true);
setPlayerMoveInput(boundaryWorld, -1, 0);
updateCombatWorld(boundaryWorld, 1 / 30);
assert(
  boundaryWorld.playerX === GAMEPLAY_SAFE_RECT.left + boundaryWorld.playerRadius,
  "directional movement keeps the full aircraft collider inside GameplaySafeRect"
);

const missileWorld = createCombatWorld("black_eagle", makeRandom());
missileWorld.playerFireCooldown = 100;
missileWorld.enemySpawnCooldown = 100;
const missileCast = castWorldSkill(missileWorld, "missile_swarm");
assert(missileCast.cast, "world skill cast succeeds with canonical starting Mana");
assert(missileWorld.aircraft.currentResource === 58, "world skill cast spends 52 Mana exactly once");
assert(missileWorld.projectiles.filter((projectile) => projectile.color === "#fb923c").length === 1, "Bầy Tên Lửa launches the first visible missile immediately");
assert(missileWorld.missilesPending === 9, "the remaining missiles stay in a guaranteed salvo queue");
for (let frame = 0; frame < 30; frame++) updateCombatWorld(missileWorld, 1 / 30);
assert(
  missileWorld.projectiles.filter((projectile) => projectile.color === "#fb923c").length === 10 &&
    missileWorld.missilesPending === 0,
  "Bầy Tên Lửa visibly launches all 10 guided missiles in one bounded salvo"
);

const bounceWorld = createCombatWorld("black_eagle", makeRandom());
bounceWorld.enemySpawnCooldown = 100;
const bouncePrimary = addStationaryEnemy(
  bounceWorld,
  bounceWorld.playerX,
  bounceWorld.playerY - 82
);
const bounceSecondary = addStationaryEnemy(
  bounceWorld,
  bounceWorld.playerX + 58,
  bounceWorld.playerY - 118
);
assert(castWorldSkill(bounceWorld, "afterburner").cast, "Hắc Ưng activates Skill 2");
updateCombatWorld(bounceWorld, 1 / 30);
bounceWorld.playerFireCooldown = 100;
let sawBounceProjectile = false;
for (let frame = 0; frame < 18 && !sawBounceProjectile; frame++) {
  updateCombatWorld(bounceWorld, 1 / 30);
  sawBounceProjectile = bounceWorld.projectiles.some(
    (projectile) => projectile.color === "#c4b5fd" && projectile.targetId === bounceSecondary.id
  );
}
assert(bouncePrimary.hp < bouncePrimary.maxHp, "Skill 2 basic fire hits its first target");
assert(sawBounceProjectile, "Skill 2 creates a visible homing bounce toward another target");
for (let frame = 0; frame < 15; frame++) updateCombatWorld(bounceWorld, 1 / 30);
assert(bounceSecondary.hp < bounceSecondary.maxHp, "Skill 2 bounce deals its described secondary damage");

const breakerVisualWorld = createCombatWorld("breaker", makeRandom());
breakerVisualWorld.enemySpawnCooldown = 100;
assert(castWorldSkill(breakerVisualWorld, "armor_shield").cast, "Phá Quân Skill 1 activates the shield state used by its wrapping visual");
assert((breakerVisualWorld.aircraft.activeEffects.armor_shield || 0) > 0, "shield visual state remains active for its full duration");
assert(castWorldSkill(breakerVisualWorld, "heavy_bomb").cast, "Phá Quân Skill 2 casts after the shield");
assert(breakerVisualWorld.warnings.some((warning) => warning.kind === "player_bomb"), "Skill 2 exposes a dedicated super-bomb telegraph entity");

const invisibleWorld = createCombatWorld("phantom", makeRandom());
invisibleWorld.projectiles.push({
  id: 99,
  owner: "enemy",
  x: invisibleWorld.playerX,
  y: GAMEPLAY_SAFE_RECT.top + 20,
  vx: 0,
  vy: 100,
  radius: 4,
  rawDamage: 50,
  homing: true,
  targetId: 0,
  turnRate: 2,
  penetrationRemaining: 0,
  penetrationMultiplier: 0,
  splashMultiplier: 0,
  bounceRemaining: 0,
  bounceMultiplier: 0,
  hitIds: [],
  color: "#fff",
});
assert(castWorldSkill(invisibleWorld, "invisibility").cast, "U Linh activates invisibility in the runtime");
assert(invisibleWorld.projectiles[0].targetId === null, "invisibility immediately clears active missile lock");
const hpBeforeInvisibleCollision = invisibleWorld.aircraft.currentHp;
invisibleWorld.projectiles.push({
  id: 100,
  owner: "enemy",
  x: invisibleWorld.playerX,
  y: invisibleWorld.playerY,
  vx: 0,
  vy: 0,
  radius: 4,
  rawDamage: 100,
  homing: false,
  targetId: null,
  turnRate: 0,
  penetrationRemaining: 0,
  penetrationMultiplier: 0,
  splashMultiplier: 0,
  bounceRemaining: 0,
  bounceMultiplier: 0,
  hitIds: [],
  color: "#fff",
});
updateCombatWorld(invisibleWorld, 1 / 30);
assert(invisibleWorld.aircraft.currentHp < hpBeforeInvisibleCollision, "existing projectile collision still damages U Linh while invisible");

const droneWorld = createCombatWorld("phantom", makeRandom());
assert(castWorldSkill(droneWorld, "escort_drone").cast && droneWorld.aircraft.droneActive, "Drone toggles on");
assert(castWorldSkill(droneWorld, "escort_drone").toggledOff && !droneWorld.aircraft.droneActive, "second Drone tap toggles off without another Energy charge");
assert(droneWorld.aircraft.currentResource === 90, "Drone toggle-off preserves post-activation Energy");

const independentDroneWorld = createCombatWorld("phantom", makeRandom());
independentDroneWorld.playerFireCooldown = 100;
independentDroneWorld.enemySpawnCooldown = 100;
const droneTarget = addStationaryEnemy(
  independentDroneWorld,
  independentDroneWorld.playerX + 95,
  independentDroneWorld.playerY - 230,
  20_000
);
assert(castWorldSkill(independentDroneWorld, "escort_drone").cast, "combat Drone deploys successfully");
const droneStart = { x: independentDroneWorld.droneX, y: independentDroneWorld.droneY };
const stationaryPlayer = { x: independentDroneWorld.playerX, y: independentDroneWorld.playerY };
let sawDroneProjectile = false;
for (let frame = 0; frame < 30; frame++) {
  updateCombatWorld(independentDroneWorld, 1 / 30);
  sawDroneProjectile ||= independentDroneWorld.projectiles.some(
    (projectile) => projectile.owner === "drone"
  );
}
assert(independentDroneWorld.droneTargetId === droneTarget.id, "Drone independently acquires an enemy target");
assert(
  Math.hypot(independentDroneWorld.droneX - droneStart.x, independentDroneWorld.droneY - droneStart.y) > 20,
  "Drone detaches from escort position and moves into combat"
);
assert(
  independentDroneWorld.playerX === stationaryPlayer.x && independentDroneWorld.playerY === stationaryPlayer.y,
  "independent Drone movement does not drag the player aircraft"
);
assert(
  sawDroneProjectile,
  "detached Drone fires its own projectiles"
);

const cleanupWorld = createCombatWorld("black_eagle", makeRandom());
cleanupWorld.playerFireCooldown = 100;
cleanupWorld.projectiles.push({
  id: 101,
  owner: "player",
  x: GAMEPLAY_SAFE_RECT.left + 20,
  y: GAMEPLAY_SAFE_RECT.top + 1,
  vx: 0,
  vy: 0,
  radius: 3,
  rawDamage: 1,
  homing: false,
  targetId: null,
  turnRate: 0,
  penetrationRemaining: 0,
  penetrationMultiplier: 0,
  splashMultiplier: 0,
  bounceRemaining: 0,
  bounceMultiplier: 0,
  hitIds: [],
  color: "#fff",
});
updateCombatWorld(cleanupWorld, 1 / 30);
assert(!cleanupWorld.projectiles.some((projectile) => projectile.id === 101), "projectile despawns before its collider can cross behind the HUD");

const coreWorld = createCombatWorld("breaker", makeRandom());
const levelResult = gainCombatXp(
  coreWorld.aircraft,
  requiredCombatXp(1) + requiredCombatXp(2)
);
coreWorld.pendingCoreSelections += levelResult.coreSelectionsDue;
const choices = ensureCoreSelection(coreWorld);
assert(choices?.length === 3, "runtime pauses on a three-card Core selection at Combat Level 3");
assert(!!choices && choices.every((choice) => choice.tier === choices[0].tier), "runtime Core cards all share one tier");
assert(!!choices && selectCore(coreWorld, choices[0]), "Core selection applies atomically");
assert(coreWorld.pendingCoreSelections === 0 && coreWorld.currentCoreChoices === null, "applied Core clears one queued selection");
assert(!!choices && !selectCore(coreWorld, choices[0]), "the same Core click cannot apply twice");

const encounterWorld = createCombatWorld("breaker", makeRandom(0xb055));
encounterWorld.aircraft.modifiers.maxHpFlat = 1_000_000;
encounterWorld.aircraft.modifiers.armorFlat = 1_000_000;
encounterWorld.aircraft.modifiers.hpRegen = 10_000;
encounterWorld.aircraft.currentHp = 1_002_050;
const seenTypes = new Set<string>();
let enemiesStayedInBounds = true;
for (let frame = 0; frame < Math.ceil(226 * 30) && !encounterWorld.ended; frame++) {
  updateCombatWorld(encounterWorld, 1 / 30);
  for (const enemy of encounterWorld.enemies) seenTypes.add(enemy.type);
  const pending = ensureCoreSelection(encounterWorld);
  if (pending) selectCore(encounterWorld, pending[0]);
  for (const enemy of encounterWorld.enemies) {
    enemiesStayedInBounds &&=
      enemy.x - enemy.radius >= GAMEPLAY_SAFE_RECT.left - 0.001 &&
      enemy.x + enemy.radius <= GAMEPLAY_SAFE_RECT.right + 0.001 &&
      enemy.y - enemy.radius >= GAMEPLAY_SAFE_RECT.top - 0.001 &&
      enemy.y + enemy.radius <= GAMEPLAY_SAFE_RECT.bottom + 0.001;
  }
}
assert(enemiesStayedInBounds, "all enemy colliders stay inside GameplaySafeRect and below the fixed HUD");
assert(encounterWorld.elapsed >= 225, "deterministic run reaches the canonical ~3:45 Boss mark");
assert(encounterWorld.eliteSpawns[0] && encounterWorld.eliteSpawns[1], "both scheduled Radar Hunter Elites spawn before the Boss");
assert(seenTypes.has("elite"), "runtime exposes the Elite encounter");
assert(encounterWorld.bossSpawned && seenTypes.has("boss"), "Flying Fortress spawns at the Boss mark");
for (const type of ["scout", "fighter", "attacker", "kamikaze", "bomber"]) {
  assert(seenTypes.has(type), `runtime wave mix includes the ${type} archetype`);
}
assert(encounterWorld.coreSelectionCount >= 5, "a sustained run reaches the guaranteed fifth Core power spike before the Boss");
assert(encounterWorld.enemies.length <= AIR_COMBAT_WORLD.maxEnemies, "enemy pool stays under its hard cap");
assert(
  encounterWorld.projectiles.filter((projectile) => projectile.owner === "enemy").length <= AIR_COMBAT_WORLD.maxEnemyProjectiles,
  "enemy projectile pool stays under its hard cap"
);
assert(
  encounterWorld.projectiles.filter((projectile) => projectile.owner !== "enemy").length <= AIR_COMBAT_WORLD.maxPlayerProjectiles,
  "player projectile pool stays under its hard cap"
);

const boss = encounterWorld.enemies.find((enemy) => enemy.type === "boss");
assert(!!boss, "Boss entity remains available for phase verification");
if (boss) {
  boss.hp = boss.maxHp * 0.69;
  updateCombatWorld(encounterWorld, 1 / 30);
  assert(encounterWorld.bossPhase === 2 && encounterWorld.guardsSpawned, "Boss phase 2 deploys guard drones below 70% HP");
  boss.hp = boss.maxHp * 0.34;
  updateCombatWorld(encounterWorld, 1 / 30);
  assert(encounterWorld.bossPhase === 3, "Boss phase 3 activates below 35% HP");
}

const pausedHud = makeHudSnapshot(encounterWorld, true, "Tạm dừng");
assert(pausedHud.paused && pausedHud.pauseLabel === "Tạm dừng", "HUD reports the shared pause state");
const summary = summarizeCombatWorld(encounterWorld);
assert(summary.combatLevel === encounterWorld.aircraft.level, "result summary preserves Combat Level");
assert(summary.damageDealt >= 0 && summary.damageTaken >= 0, "result summary carries full damage metrics");
assert(typeof summary.rank === "string" && summary.rank.length > 0, "result summary calculates a persistent rank");

console.log("\nALL AIR COMBAT RUNTIME INTEGRATION TESTS PASSED");

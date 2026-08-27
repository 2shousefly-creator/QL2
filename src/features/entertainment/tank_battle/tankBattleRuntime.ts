import {
  ENEMY_TANK_CONFIGS,
  GAMEPLAY_SAFE_RECT,
  HEADQUARTERS_BASE_STATS,
  PLAYER_TANK_BASE_STATS,
  PLAYER_TANK_NAME,
  TANK_BATTLE_WORLD,
  WAVE_DEFINITIONS,
} from "./tankBattleConfig";
import {
  activePlayerMineCount,
  activePlayerShellCount,
  applyTankUpgrade,
  buildNavigationGrid,
  calculateArmoredDamage,
  calculateFrontalArmor,
  calculateTankBattleRank,
  canPlacePlayerMine,
  canPlayerFire,
  circleIntersectsTerrain,
  clamp,
  clampPointToSafeRect,
  createUpgradeOffers,
  distance,
  distanceSquared,
  findNavigationPath,
  getBossPhase,
  getMinePlacementPoint,
  isMinePlacementValid,
  isPointInsideSafeRect,
  normalizeAngle,
  resolveAimAngle,
  rotateTowardAngle,
  selectEnemyTargetKind,
  shouldInterruptBossSiege,
} from "./tankBattleEngine";
import {
  DriveInput,
  EnemyTankState,
  EnemyTankType,
  ExplosionState,
  MineOwner,
  MineState,
  PendingSpawn,
  ProjectileOwner,
  ProjectileState,
  TankBattleHudSnapshot,
  TankBattleRunSummary,
  TankBattleWorld,
  TankUpgradeId,
  TerrainState,
  Vec2,
  WarningState,
} from "./tankBattleTypes";

function copyPlayerStats() {
  return { ...PLAYER_TANK_BASE_STATS };
}

function copyHeadquartersStats() {
  return { ...HEADQUARTERS_BASE_STATS };
}

function makeTerrain(
  id: number,
  type: TerrainState["type"],
  x: number,
  y: number,
  width: number,
  height: number,
  hp: number,
  explosiveRadius = 0
): TerrainState {
  return { id, type, x, y, width, height, hp, maxHp: hp, alive: true, explosiveRadius };
}

export function createTankBattleTerrain(): TerrainState[] {
  let id = 1;
  const pieces: TerrainState[] = [];
  const brick = (x: number, y: number, width = 34, height = 18) =>
    pieces.push(makeTerrain(id++, "brick", x, y, width, height, 300));
  const steel = (x: number, y: number, width = 26, height = 44) =>
    pieces.push(makeTerrain(id++, "steel", x, y, width, height, Number.POSITIVE_INFINITY));
  const barrel = (x: number, y: number) =>
    pieces.push(makeTerrain(id++, "barrel", x, y, 18, 18, 120, 58));

  // A defensive brick arc protects the headquarters but leaves two routes.
  [70, 108, 146, 214, 252, 290].forEach((x) => brick(x, 500));
  brick(86, 465, 18, 48);
  brick(274, 465, 18, 48);

  // Mid-field cover creates route choices without sealing the map.
  [104, 142, 218, 256].forEach((x) => brick(x, 340));
  brick(180, 306, 18, 52);
  brick(58, 245, 18, 54);
  brick(302, 245, 18, 54);
  steel(128, 225);
  steel(232, 225);
  steel(92, 395, 22, 40);
  steel(268, 395, 22, 40);

  barrel(155, 382);
  barrel(180, 382);
  barrel(205, 382);
  barrel(96, 285);
  barrel(264, 285);
  return pieces;
}

function queueWave(world: TankBattleWorld, waveIndex: number): void {
  const definition = WAVE_DEFINITIONS[waveIndex];
  const pending: PendingSpawn[] = [];
  for (const group of definition.enemies) {
    for (let count = 0; count < group.count; count += 1) {
      pending.push({ type: group.type, delay: 0 });
    }
  }
  // Keep the Elite as the dramatic final arrival of Wave 3; mix all other groups.
  const elite = pending.find((spawn) => spawn.type === "elite");
  const regular = pending.filter((spawn) => spawn.type !== "elite");
  for (let index = regular.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(world.random() * (index + 1));
    [regular[index], regular[swapIndex]] = [regular[swapIndex], regular[index]];
  }
  world.pendingSpawns = elite ? [...regular, elite] : regular;
  world.spawnCooldown = 1.15;
  world.waveBannerRemaining = 2.2;
  world.latestMessage = `${definition.name} · ${definition.subtitle}`;
  world.latestMessageRemaining = 2.5;
}

export function createTankBattleWorld(random: () => number = Math.random): TankBattleWorld {
  const terrain = createTankBattleTerrain();
  const navigation = buildNavigationGrid(terrain, 1);
  const playerStats = copyPlayerStats();
  const headquartersStats = copyHeadquartersStats();
  const world: TankBattleWorld = {
    phase: "playing",
    elapsedSeconds: 0,
    simulationSeconds: 0,
    score: 0,
    waveIndex: 0,
    waveBannerRemaining: 0,
    pendingSpawns: [],
    spawnCooldown: 0,
    bossSpawned: false,
    player: {
      x: GAMEPLAY_SAFE_RECT.left + GAMEPLAY_SAFE_RECT.width * 0.5,
      y: GAMEPLAY_SAFE_RECT.bottom - 88,
      radius: 15,
      bodyAngle: -Math.PI / 2,
      turretAngle: -Math.PI / 2,
      turretTargetAngle: -Math.PI / 2,
      velocity: 0,
      hp: playerStats.maxHp,
      stats: playerStats,
      reloadRemaining: 0,
      alive: true,
      hitFlash: 0,
      selectedUpgrades: [],
      upgradeStacks: {},
    },
    headquarters: {
      x: GAMEPLAY_SAFE_RECT.left + GAMEPLAY_SAFE_RECT.width * 0.5,
      y: GAMEPLAY_SAFE_RECT.bottom - 27,
      radius: 28,
      hp: headquartersStats.maxHp,
      stats: headquartersStats,
      alive: true,
      hitFlash: 0,
      gunCooldown: 0,
    },
    enemies: [],
    projectiles: [],
    mines: [],
    terrain,
    explosions: [],
    warnings: [],
    driveInput: { throttle: 0, steer: 0 },
    aimActive: false,
    nextEntityId: 100,
    navigation,
    navigationBuildCount: 1,
    topologyDirty: false,
    upgradeOffers: [],
    upgradeMilestonesCompleted: 0,
    upgradeSelectionLocked: false,
    pausedByUser: false,
    hiddenPaused: false,
    latestMessage: null,
    latestMessageRemaining: 0,
    bossLockWarning: false,
    bossPhase: 0,
    metrics: {
      enemiesDefeated: 0,
      elitesDefeated: 0,
      cannonShots: 0,
      cannonHits: 0,
      mineKills: 0,
      damageDealt: 0,
      damageTaken: 0,
      hqDamageTaken: 0,
      wallsDestroyedByPlayer: 0,
      wallsDestroyedByEnemy: 0,
      bossStartedAt: null,
      bossDefeatedAt: null,
    },
    random,
  };
  queueWave(world, 0);
  return world;
}

export function setTankDriveInput(world: TankBattleWorld, input: DriveInput): void {
  world.driveInput = {
    throttle: clamp(input.throttle, -1, 1),
    steer: clamp(input.steer, -1, 1),
  };
}

export function stopTankDriveInput(world: TankBattleWorld): void {
  world.driveInput = { throttle: 0, steer: 0 };
  world.player.velocity = 0;
}

export function setTankAimTarget(
  world: TankBattleWorld,
  target: Vec2,
  useAimAssist = true
): number {
  const candidates = world.enemies.filter((enemy) => enemy.alive).map((enemy) => ({ x: enemy.x, y: enemy.y }));
  const angle = useAimAssist
    ? resolveAimAngle(world.player, target, candidates)
    : Math.atan2(target.y - world.player.y, target.x - world.player.x);
  world.player.turretTargetAngle = angle;
  world.aimActive = true;
  return angle;
}

export function releaseTankAim(world: TankBattleWorld): void {
  world.aimActive = false;
}

function spawnProjectile(
  world: TankBattleWorld,
  owner: ProjectileOwner,
  sourceId: number | null,
  origin: Vec2,
  angle: number,
  speed: number,
  rawDamage: number,
  options: {
    radius?: number;
    lifeRemaining?: number;
    pierceRemaining?: number;
    splashRadius?: number;
    wallDamageMultiplier?: number;
    dangerous?: boolean;
  } = {}
): ProjectileState {
  const projectile: ProjectileState = {
    id: world.nextEntityId++,
    owner,
    sourceId,
    x: origin.x,
    y: origin.y,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    radius: options.radius ?? 4,
    rawDamage,
    lifeRemaining:
      options.lifeRemaining ??
      (owner === "player" ? TANK_BATTLE_WORLD.playerProjectileTimeout : TANK_BATTLE_WORLD.enemyProjectileTimeout),
    pierceRemaining: options.pierceRemaining ?? 0,
    splashRadius: options.splashRadius ?? 0,
    wallDamageMultiplier: options.wallDamageMultiplier ?? 1,
    hitIds: [],
    creditedHit: false,
    dangerous: options.dangerous ?? owner === "enemy",
  };
  world.projectiles.push(projectile);
  return projectile;
}

export function firePlayerShell(world: TankBattleWorld): boolean {
  if (!canPlayerFire(world)) return false;
  const angle = world.player.turretAngle;
  const muzzle = {
    x: world.player.x + Math.cos(angle) * (world.player.radius + 11),
    y: world.player.y + Math.sin(angle) * (world.player.radius + 11),
  };
  spawnProjectile(
    world,
    "player",
    null,
    muzzle,
    angle,
    world.player.stats.projectileSpeed,
    world.player.stats.cannonDamage,
    {
      radius: 4.5,
      pierceRemaining: world.player.stats.projectilePierce,
      splashRadius: world.player.stats.splashRadius,
      wallDamageMultiplier: 1,
      dangerous: false,
    }
  );
  world.player.reloadRemaining = world.player.stats.reloadSeconds;
  world.metrics.cannonShots += 1;
  return true;
}

function addMine(
  world: TankBattleWorld,
  owner: MineOwner,
  point: Vec2,
  rawDamage: number,
  radius: number,
  armedRemaining: number,
  slowRatio = 0,
  rearmSeconds = 0,
  charges = 1
): MineState {
  const mine: MineState = {
    id: world.nextEntityId++,
    owner,
    x: point.x,
    y: point.y,
    armedRemaining,
    radius: 8,
    triggerRadius: Math.max(20, radius * 0.48),
    rawDamage,
    slowRatio,
    rearmSeconds,
    charges,
    sweepProgress: 0,
  };
  world.mines.push(mine);
  return mine;
}

export function placePlayerMine(world: TankBattleWorld): boolean {
  if (!canPlacePlayerMine(world)) return false;
  const point = getMinePlacementPoint(world.player);
  addMine(
    world,
    "player",
    point,
    world.player.stats.mineDamage,
    world.player.stats.mineRadius,
    world.player.stats.mineTriggerDelay,
    world.player.stats.mineSlowRatio,
    world.player.stats.mineRearmSeconds,
    world.player.stats.mineRearmSeconds > 0 ? 2 : 1
  );
  return true;
}

function spawnHeadquartersDefensiveMines(world: TankBattleWorld, count: number): void {
  const radius = world.headquarters.radius + 34;
  let placed = 0;
  for (let attempt = 0; attempt < count * 4 && placed < count; attempt += 1) {
    const angle = -Math.PI + ((attempt + 1) / (count * 4 + 1)) * Math.PI * 2;
    const point = {
      x: world.headquarters.x + Math.cos(angle) * radius,
      y: world.headquarters.y + Math.sin(angle) * radius,
    };
    if (!isMinePlacementValid(point, world.terrain, world.mines)) continue;
    addMine(world, "hq", point, 215, 42, 0.45);
    placed += 1;
  }
}

function validEnemySpawnPoint(world: TankBattleWorld, point: Vec2, radius: number): boolean {
  if (!isPointInsideSafeRect(point, radius + 2)) return false;
  if (world.terrain.some((terrain) => circleIntersectsTerrain(point, radius + 2, terrain))) return false;
  if (world.enemies.some((enemy) => enemy.alive && distanceSquared(point, enemy) < (radius + enemy.radius + 5) ** 2)) return false;
  return distanceSquared(point, world.player) > 105 * 105;
}

function chooseEnemySpawnPoint(world: TankBattleWorld, type: EnemyTankType): Vec2 | null {
  const radius = ENEMY_TANK_CONFIGS[type].radius;
  if (type === "boss") {
    const preferred = {
      x: GAMEPLAY_SAFE_RECT.left + GAMEPLAY_SAFE_RECT.width / 2,
      y: GAMEPLAY_SAFE_RECT.top + radius + 10,
    };
    if (validEnemySpawnPoint(world, preferred, radius)) return preferred;
  }
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const edge = Math.floor(world.random() * 3);
    let point: Vec2;
    if (edge === 0) {
      point = {
        x: GAMEPLAY_SAFE_RECT.left + radius + world.random() * (GAMEPLAY_SAFE_RECT.width - radius * 2),
        y: GAMEPLAY_SAFE_RECT.top + radius + 3,
      };
    } else if (edge === 1) {
      point = {
        x: GAMEPLAY_SAFE_RECT.left + radius + 3,
        y: GAMEPLAY_SAFE_RECT.top + 30 + world.random() * (GAMEPLAY_SAFE_RECT.height * 0.55),
      };
    } else {
      point = {
        x: GAMEPLAY_SAFE_RECT.right - radius - 3,
        y: GAMEPLAY_SAFE_RECT.top + 30 + world.random() * (GAMEPLAY_SAFE_RECT.height * 0.55),
      };
    }
    if (validEnemySpawnPoint(world, point, radius)) return point;
  }
  for (let y = GAMEPLAY_SAFE_RECT.top + radius + 4; y < GAMEPLAY_SAFE_RECT.top + GAMEPLAY_SAFE_RECT.height * 0.6; y += radius * 2 + 8) {
    for (let x = GAMEPLAY_SAFE_RECT.left + radius + 4; x <= GAMEPLAY_SAFE_RECT.right - radius - 4; x += radius * 2 + 8) {
      const candidate = { x, y };
      if (validEnemySpawnPoint(world, candidate, radius)) return candidate;
    }
  }
  return null;
}

export function spawnEnemyTank(
  world: TankBattleWorld,
  type: EnemyTankType,
  point?: Vec2
): EnemyTankState | null {
  if (world.enemies.filter((enemy) => enemy.alive).length >= TANK_BATTLE_WORLD.maxEnemies) return null;
  const config = ENEMY_TANK_CONFIGS[type];
  const requestedSpawn = point ? clampPointToSafeRect(point, config.radius + 2) : null;
  const spawn =
    requestedSpawn && validEnemySpawnPoint(world, requestedSpawn, config.radius)
      ? requestedSpawn
      : chooseEnemySpawnPoint(world, type);
  if (!spawn) return null;
  const targetAngle = Math.atan2(world.headquarters.y - spawn.y, world.headquarters.x - spawn.x);
  const enemy: EnemyTankState = {
    id: world.nextEntityId++,
    type,
    x: spawn.x,
    y: spawn.y,
    radius: config.radius,
    bodyAngle: targetAngle,
    turretAngle: targetAngle,
    hp: config.maxHp,
    maxHp: config.maxHp,
    armor: config.armor,
    speed: config.speed,
    alive: true,
    reloadRemaining: 0.5 + world.random() * config.reloadSeconds,
    mineCooldown: 2.5 + world.random() * 2,
    sweepProgress: 0,
    targetKind: "hq",
    targetId: null,
    path: [],
    pathIndex: 0,
    pathRevision: 0,
    repathRemaining: 0,
    stuckSeconds: 0,
    previousX: spawn.x,
    previousY: spawn.y,
    hitFlash: 0,
    slowRemaining: 0,
    bossSummonsUsed: 0,
    bossSummonCooldown: 0,
    bossSiegeCharge: 0,
    bossSiegeCooldown: 4.5,
    bossInterruptedDamage: 0,
    eliteChargeRemaining: 0,
    eliteChargeCooldown: 3.8,
  };
  world.enemies.push(enemy);
  if (type === "elite") {
    world.latestMessage = "ELITE · XE TĂNG PHÁ TUYẾN";
    world.latestMessageRemaining = 2.8;
  }
  if (type === "boss") {
    world.bossSpawned = true;
    world.metrics.bossStartedAt = world.elapsedSeconds;
    world.latestMessage = "BOSS · PHÁO ĐÀI CÔNG THÀNH";
    world.latestMessageRemaining = 3.2;
  }
  return enemy;
}

function damagePlayer(world: TankBattleWorld, rawDamage: number): number {
  if (!world.player.alive || rawDamage <= 0) return 0;
  const damage = calculateArmoredDamage(rawDamage, world.player.stats.armor);
  world.player.hp = Math.max(0, world.player.hp - damage);
  world.player.hitFlash = 0.16;
  world.metrics.damageTaken += damage;
  if (world.player.hp <= 0) {
    world.player.alive = false;
    world.phase = "defeat_player";
    stopTankDriveInput(world);
    clearDangerousProjectiles(world);
    world.latestMessage = "M-07 BÁO THÉP ĐÃ BỊ PHÁ HỦY";
    world.latestMessageRemaining = 99;
  }
  return damage;
}

function damageHeadquarters(world: TankBattleWorld, rawDamage: number): number {
  if (!world.headquarters.alive || rawDamage <= 0) return 0;
  const damage = calculateArmoredDamage(rawDamage, world.headquarters.stats.armor);
  world.headquarters.hp = Math.max(0, world.headquarters.hp - damage);
  world.headquarters.hitFlash = 0.2;
  world.metrics.hqDamageTaken += damage;
  if (world.headquarters.hp <= 0) {
    world.headquarters.alive = false;
    world.phase = "defeat_hq";
    stopTankDriveInput(world);
    clearDangerousProjectiles(world);
    world.latestMessage = "SỞ CHỈ HUY ĐÃ THẤT THỦ";
    world.latestMessageRemaining = 99;
  }
  return damage;
}

function damageEnemy(
  world: TankBattleWorld,
  enemy: EnemyTankState,
  rawDamage: number,
  source: ProjectileOwner | MineOwner,
  incomingAngle: number,
  mineKill = false
): number {
  if (!enemy.alive || rawDamage <= 0) return 0;
  const armor = calculateFrontalArmor(enemy, incomingAngle, enemy.armor);
  const damage = calculateArmoredDamage(rawDamage, armor);
  enemy.hp = Math.max(0, enemy.hp - damage);
  enemy.hitFlash = 0.12;
  if (source === "player" || source === "hq") world.metrics.damageDealt += damage;
  if (enemy.type === "boss" && enemy.bossSiegeCharge > 0 && source === "player") {
    enemy.bossInterruptedDamage += rawDamage;
    if (shouldInterruptBossSiege(enemy.bossInterruptedDamage, enemy.maxHp)) {
      enemy.bossSiegeCharge = 0;
      enemy.bossSiegeCooldown = 6.5;
      enemy.bossInterruptedDamage = 0;
      world.bossLockWarning = false;
      world.latestMessage = "ĐÃ NGẮT PHÁO CÔNG THÀNH";
      world.latestMessageRemaining = 1.8;
    }
  }
  if (enemy.hp > 0) return damage;

  enemy.alive = false;
  const config = ENEMY_TANK_CONFIGS[enemy.type];
  world.score += config.score;
  world.metrics.enemiesDefeated += 1;
  if (enemy.type === "elite") world.metrics.elitesDefeated += 1;
  if (mineKill && source === "player") world.metrics.mineKills += 1;
  world.explosions.push({
    x: enemy.x,
    y: enemy.y,
    radius: 6,
    maxRadius: enemy.radius * 2.2,
    lifeRemaining: 0.45,
    color: enemy.type === "boss" ? "#f43f5e" : "#fb923c",
  });
  if (enemy.type === "boss") {
    world.metrics.bossDefeatedAt = world.elapsedSeconds;
    world.phase = "victory";
    world.bossLockWarning = false;
    world.pendingSpawns = [];
    clearDangerousProjectiles(world);
    world.enemies.forEach((other) => {
      if (other !== enemy) other.alive = false;
    });
    world.latestMessage = "PHÁO ĐÀI CÔNG THÀNH ĐÃ BỊ HẠ";
    world.latestMessageRemaining = 99;
  }
  return damage;
}

function destroyTerrain(
  world: TankBattleWorld,
  terrain: TerrainState,
  source: ProjectileOwner | MineOwner,
  visitedBarrels: Set<number>
): void {
  if (!terrain.alive) return;
  terrain.alive = false;
  if (terrain.type === "brick" || terrain.type === "barrel") world.topologyDirty = true;
  if (terrain.type === "brick") {
    if (source === "enemy") world.metrics.wallsDestroyedByEnemy += 1;
    else world.metrics.wallsDestroyedByPlayer += 1;
    world.explosions.push({ x: terrain.x, y: terrain.y, radius: 4, maxRadius: 24, lifeRemaining: 0.35, color: "#f59e0b" });
  }
  if (terrain.type === "barrel") explodeBarrel(world, terrain, source, visitedBarrels);
}

function damageTerrain(
  world: TankBattleWorld,
  terrain: TerrainState,
  rawDamage: number,
  source: ProjectileOwner | MineOwner,
  visitedBarrels = new Set<number>()
): void {
  if (!terrain.alive || terrain.type === "steel" || rawDamage <= 0) return;
  terrain.hp -= rawDamage;
  if (terrain.hp <= 0) destroyTerrain(world, terrain, source, visitedBarrels);
}

function explodeBarrel(
  world: TankBattleWorld,
  barrel: TerrainState,
  source: ProjectileOwner | MineOwner,
  visitedBarrels: Set<number>
): void {
  if (visitedBarrels.has(barrel.id)) return;
  visitedBarrels.add(barrel.id);
  const radius = barrel.explosiveRadius || 58;
  world.explosions.push({ x: barrel.x, y: barrel.y, radius: 8, maxRadius: radius, lifeRemaining: 0.52, color: "#facc15" });
  const rawDamage = 265;
  for (const enemy of world.enemies) {
    if (enemy.alive && distanceSquared(barrel, enemy) <= (radius + enemy.radius) ** 2) {
      damageEnemy(world, enemy, rawDamage, source, Math.atan2(enemy.y - barrel.y, enemy.x - barrel.x));
    }
  }
  if (world.player.alive && distanceSquared(barrel, world.player) <= (radius + world.player.radius) ** 2) {
    damagePlayer(world, rawDamage);
  }
  if (world.headquarters.alive && distanceSquared(barrel, world.headquarters) <= (radius + world.headquarters.radius) ** 2) {
    damageHeadquarters(world, rawDamage);
  }
  for (const other of world.terrain) {
    if (
      other.alive &&
      other.id !== barrel.id &&
      other.type !== "steel" &&
      distanceSquared(barrel, other) <= (radius + Math.max(other.width, other.height) / 2) ** 2
    ) {
      damageTerrain(world, other, rawDamage, source, visitedBarrels);
    }
  }
}

function clearDangerousProjectiles(world: TankBattleWorld): void {
  world.projectiles = world.projectiles.filter((projectile) => !projectile.dangerous);
  world.mines = world.mines.filter((mine) => mine.owner !== "enemy");
}

function resolveTarget(world: TankBattleWorld, enemy: EnemyTankState): { kind: EnemyTankState["targetKind"]; id: number | null; point: Vec2 } {
  const liveBricks = world.terrain.filter((piece) => piece.alive && piece.type === "brick");
  const playerMines = world.mines.filter((mine) => mine.owner === "player" || mine.owner === "hq");
  const kind = selectEnemyTargetKind(enemy.type, world.player.alive, liveBricks.length > 0, playerMines.length > 0);
  if (kind === "player") return { kind, id: null, point: world.player };
  if (kind === "hq") return { kind, id: null, point: world.headquarters };
  if (kind === "mine") {
    const mine = playerMines.reduce((best, candidate) =>
      !best || distanceSquared(enemy, candidate) < distanceSquared(enemy, best) ? candidate : best
    , null as MineState | null);
    return mine ? { kind, id: mine.id, point: mine } : { kind: "hq", id: null, point: world.headquarters };
  }
  const wall = liveBricks.reduce((best, candidate) => {
    const score = distance(enemy, candidate) + distance(candidate, world.headquarters) * 0.55;
    if (!best) return candidate;
    const bestScore = distance(enemy, best) + distance(best, world.headquarters) * 0.55;
    return score < bestScore ? candidate : best;
  }, null as TerrainState | null);
  return wall ? { kind, id: wall.id, point: wall } : { kind: "hq", id: null, point: world.headquarters };
}

function rebuildNavigation(world: TankBattleWorld): void {
  if (!world.topologyDirty) return;
  const nextRevision = world.navigation.revision + 1;
  world.navigation = buildNavigationGrid(world.terrain, nextRevision);
  world.navigationBuildCount += 1;
  world.topologyDirty = false;
}

function movePlayer(world: TankBattleWorld, delta: number): void {
  const player = world.player;
  if (!player.alive) return;
  const input = world.driveInput;
  const targetSpeed =
    input.throttle >= 0
      ? input.throttle * player.stats.moveSpeed
      : input.throttle * player.stats.moveSpeed * player.stats.reverseSpeedRatio;
  const acceleration = Math.abs(targetSpeed) > Math.abs(player.velocity)
    ? player.stats.acceleration
    : player.stats.deceleration;
  const speedStep = acceleration * delta;
  player.velocity += clamp(targetSpeed - player.velocity, -speedStep, speedStep);
  if (input.throttle === 0 && Math.abs(player.velocity) <= speedStep) player.velocity = 0;
  const steeringScale = 0.42 + Math.min(1, Math.abs(player.velocity) / Math.max(1, player.stats.moveSpeed)) * 0.58;
  if (Math.abs(input.steer) > 0.01) {
    const reverseDirection = player.velocity < -0.5 ? -1 : 1;
    player.bodyAngle = normalizeAngle(
      player.bodyAngle + input.steer * player.stats.turnSpeed * steeringScale * reverseDirection * delta
    );
  }
  player.turretAngle = rotateTowardAngle(
    player.turretAngle,
    player.turretTargetAngle,
    player.stats.turretTurnSpeed * delta
  );
  const previous = { x: player.x, y: player.y };
  player.x += Math.cos(player.bodyAngle) * player.velocity * delta;
  player.y += Math.sin(player.bodyAngle) * player.velocity * delta;
  const clamped = clampPointToSafeRect(player, player.radius);
  player.x = clamped.x;
  player.y = clamped.y;
  const blocked = world.terrain.some((terrain) => circleIntersectsTerrain(player, player.radius, terrain));
  const hitsHeadquarters = distanceSquared(player, world.headquarters) < (player.radius + world.headquarters.radius + 3) ** 2;
  const hitsEnemy = world.enemies.some(
    (enemy) => enemy.alive && distanceSquared(player, enemy) < (player.radius + enemy.radius + 2) ** 2
  );
  if (blocked || hitsHeadquarters || hitsEnemy) {
    player.x = previous.x;
    player.y = previous.y;
    player.velocity = 0;
  }
}

function fireEnemyAt(world: TankBattleWorld, enemy: EnemyTankState, point: Vec2, damageMultiplier = 1): void {
  const config = ENEMY_TANK_CONFIGS[enemy.type];
  const angle = Math.atan2(point.y - enemy.y, point.x - enemy.x);
  enemy.turretAngle = angle;
  spawnProjectile(
    world,
    "enemy",
    enemy.id,
    {
      x: enemy.x + Math.cos(angle) * (enemy.radius + 8),
      y: enemy.y + Math.sin(angle) * (enemy.radius + 8),
    },
    angle,
    config.projectileSpeed,
    config.cannonDamage * damageMultiplier,
    {
      radius: enemy.type === "boss" ? 6 : 4,
      wallDamageMultiplier: config.wallDamageMultiplier,
      dangerous: true,
    }
  );
  enemy.reloadRemaining = config.reloadSeconds;
}

function updateBossAbilities(world: TankBattleWorld, boss: EnemyTankState, delta: number): void {
  const phase = getBossPhase(boss.hp, boss.maxHp);
  world.bossPhase = phase;
  boss.bossSummonCooldown = Math.max(0, boss.bossSummonCooldown - delta);
  boss.bossSiegeCooldown = Math.max(0, boss.bossSiegeCooldown - delta);

  if (phase === 2 && boss.bossSummonsUsed < 2 && boss.bossSummonCooldown <= 0) {
    const offset = boss.radius + 24;
    spawnEnemyTank(world, "light", { x: boss.x - offset, y: boss.y + 8 });
    spawnEnemyTank(world, "light", { x: boss.x + offset, y: boss.y + 8 });
    boss.bossSummonsUsed += 1;
    boss.bossSummonCooldown = 9;
    world.latestMessage = "BOSS TRIỆU HỒI 2 XE HẠNG NHẸ";
    world.latestMessageRemaining = 1.8;
  }

  if (phase !== 3) {
    boss.bossSiegeCharge = 0;
    boss.bossInterruptedDamage = 0;
    world.bossLockWarning = false;
    return;
  }
  if (boss.bossSiegeCharge > 0) {
    boss.bossSiegeCharge -= delta;
    world.bossLockWarning = true;
    world.warnings = world.warnings.filter((warning) => warning.kind !== "hq_lock");
    world.warnings.push({
      kind: "hq_lock",
      x: world.headquarters.x,
      y: world.headquarters.y,
      radius: 44,
      remaining: Math.max(0, boss.bossSiegeCharge),
      total: 3,
      label: "HQ ĐANG BỊ KHÓA",
    });
    if (boss.bossSiegeCharge <= 0) {
      damageHeadquarters(world, 780);
      boss.bossSiegeCooldown = 8.5;
      boss.bossInterruptedDamage = 0;
      world.bossLockWarning = false;
      world.latestMessage = "PHÁO CÔNG THÀNH ĐÃ KHAI HỎA";
      world.latestMessageRemaining = 1.6;
    }
  } else if (boss.bossSiegeCooldown <= 0) {
    boss.bossSiegeCharge = 3;
    boss.bossInterruptedDamage = 0;
    world.bossLockWarning = true;
    world.latestMessage = "HQ ĐANG BỊ KHÓA · BẮN BOSS ĐỂ NGẮT";
    world.latestMessageRemaining = 3;
  }
}

function updateEliteCharge(world: TankBattleWorld, enemy: EnemyTankState, delta: number): boolean {
  if (enemy.type !== "elite") return false;
  enemy.eliteChargeCooldown = Math.max(0, enemy.eliteChargeCooldown - delta);
  if (enemy.eliteChargeRemaining === 0 && enemy.eliteChargeCooldown <= 0) {
    enemy.eliteChargeRemaining = 1.1;
    world.warnings.push({
      kind: "elite_charge",
      x: enemy.x,
      y: enemy.y,
      radius: 42,
      remaining: 1.1,
      total: 1.1,
      label: "PHÁ TUYẾN",
    });
    return true;
  }
  if (enemy.eliteChargeRemaining > 0) {
    enemy.eliteChargeRemaining -= delta;
    if (enemy.eliteChargeRemaining <= 0) enemy.eliteChargeRemaining = -0.7;
    return true;
  }
  if (enemy.eliteChargeRemaining < 0) {
    enemy.eliteChargeRemaining = Math.min(0, enemy.eliteChargeRemaining + delta);
    if (enemy.eliteChargeRemaining === 0) enemy.eliteChargeCooldown = 7.5;
  }
  return false;
}

function resolveMovementGoal(world: TankBattleWorld, enemy: EnemyTankState, target: Vec2): Vec2 {
  if (enemy.type === "minelayer" && world.player.alive) {
    const separation = distance(enemy, world.player);
    if (separation < 145) {
      const angle = Math.atan2(enemy.y - world.player.y, enemy.x - world.player.x);
      return clampPointToSafeRect({ x: enemy.x + Math.cos(angle) * 90, y: enemy.y + Math.sin(angle) * 90 }, enemy.radius);
    }
    if (separation < 205) {
      const angle = Math.atan2(world.player.y - enemy.y, world.player.x - enemy.x) + Math.PI / 2;
      return clampPointToSafeRect({ x: enemy.x + Math.cos(angle) * 70, y: enemy.y + Math.sin(angle) * 70 }, enemy.radius);
    }
  }
  return target;
}

function updateEnemy(world: TankBattleWorld, enemy: EnemyTankState, delta: number): void {
  if (!enemy.alive) return;
  const config = ENEMY_TANK_CONFIGS[enemy.type];
  enemy.reloadRemaining = Math.max(0, enemy.reloadRemaining - delta);
  enemy.mineCooldown = Math.max(0, enemy.mineCooldown - delta);
  enemy.repathRemaining = Math.max(0, enemy.repathRemaining - delta);
  enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
  enemy.slowRemaining = Math.max(0, enemy.slowRemaining - delta);
  if (enemy.type === "boss") updateBossAbilities(world, enemy, delta);

  const target = resolveTarget(world, enemy);
  enemy.targetKind = target.kind;
  enemy.targetId = target.id;
  const movementGoal = resolveMovementGoal(world, enemy, target.point);
  if (
    enemy.pathRevision !== world.navigation.revision ||
    enemy.repathRemaining <= 0 ||
    enemy.path.length === 0 ||
    enemy.pathIndex >= enemy.path.length
  ) {
    enemy.path = findNavigationPath(enemy, movementGoal, world.navigation);
    enemy.pathIndex = 0;
    enemy.pathRevision = world.navigation.revision;
    enemy.repathRemaining = 0.65 + world.random() * 0.55;
  }

  const range = distance(enemy, target.point);
  const isMineSweep = enemy.type === "minesweeper" && target.kind === "mine";
  if (isMineSweep && range <= 42) {
    const mine = world.mines.find((candidate) => candidate.id === target.id);
    if (mine) {
      mine.sweepProgress = Math.min(1, mine.sweepProgress + delta / 1.35);
      if (mine.sweepProgress >= 1) world.mines = world.mines.filter((candidate) => candidate.id !== mine.id);
    }
  }

  const warnedCharging = updateEliteCharge(world, enemy, delta);
  const minelayerMustKite = enemy.type === "minelayer" && world.player.alive && range < 145;
  const shouldMove =
    !warnedCharging &&
    !(isMineSweep && range <= 42) &&
    (minelayerMustKite || range > config.preferredRange || target.kind === "terrain" || target.kind === "mine");
  if (shouldMove && enemy.path.length > 0) {
    const waypoint = enemy.path[Math.min(enemy.pathIndex, enemy.path.length - 1)];
    if (distanceSquared(enemy, waypoint) < Math.max(12, enemy.radius) ** 2 && enemy.pathIndex < enemy.path.length - 1) {
      enemy.pathIndex += 1;
    }
    const activeWaypoint = enemy.path[Math.min(enemy.pathIndex, enemy.path.length - 1)];
    const desiredAngle = Math.atan2(activeWaypoint.y - enemy.y, activeWaypoint.x - enemy.x);
    enemy.bodyAngle = rotateTowardAngle(enemy.bodyAngle, desiredAngle, config.turnSpeed * delta);
    const chargeMultiplier = enemy.type === "elite" && enemy.eliteChargeRemaining < 0 ? 2.45 : 1;
    const slowMultiplier = enemy.slowRemaining > 0 ? 0.65 : 1;
    const moveDistance = config.speed * chargeMultiplier * slowMultiplier * delta;
    const previous = { x: enemy.x, y: enemy.y };
    enemy.x += Math.cos(enemy.bodyAngle) * moveDistance;
    enemy.y += Math.sin(enemy.bodyAngle) * moveDistance;
    const clamped = clampPointToSafeRect(enemy, enemy.radius);
    enemy.x = clamped.x;
    enemy.y = clamped.y;
    const collidedTerrain = world.terrain.find((terrain) => circleIntersectsTerrain(enemy, enemy.radius, terrain));
    const collidedHq = distanceSquared(enemy, world.headquarters) < (enemy.radius + world.headquarters.radius) ** 2;
    const collidedPlayer = world.player.alive && distanceSquared(enemy, world.player) < (enemy.radius + world.player.radius + 2) ** 2;
    if (collidedTerrain || collidedHq || collidedPlayer) {
      enemy.x = previous.x;
      enemy.y = previous.y;
      enemy.repathRemaining = 0;
      if (collidedTerrain?.type === "brick" && enemy.reloadRemaining <= 0) fireEnemyAt(world, enemy, collidedTerrain);
      if (collidedHq && enemy.reloadRemaining <= 0) fireEnemyAt(world, enemy, world.headquarters);
      if (collidedPlayer && enemy.reloadRemaining <= 0) fireEnemyAt(world, enemy, world.player);
    }
  }

  const moved = Math.hypot(enemy.x - enemy.previousX, enemy.y - enemy.previousY);
  enemy.stuckSeconds = moved < 0.35 ? enemy.stuckSeconds + delta : 0;
  if (enemy.stuckSeconds > 0.75) enemy.repathRemaining = 0;
  if (enemy.stuckSeconds > 1.8) {
    const side = enemy.id % 2 === 0 ? 1 : -1;
    enemy.x += Math.cos(enemy.bodyAngle + side * Math.PI / 2) * 9;
    enemy.y += Math.sin(enemy.bodyAngle + side * Math.PI / 2) * 9;
    const clamped = clampPointToSafeRect(enemy, enemy.radius);
    enemy.x = clamped.x;
    enemy.y = clamped.y;
    enemy.stuckSeconds = 0;
  }
  enemy.previousX = enemy.x;
  enemy.previousY = enemy.y;

  if (enemy.type === "minelayer" && enemy.mineCooldown <= 0 && world.mines.filter((mine) => mine.owner === "enemy").length < TANK_BATTLE_WORLD.maxEnemyMines) {
    const point = {
      x: enemy.x - Math.cos(enemy.bodyAngle) * (enemy.radius + 12),
      y: enemy.y - Math.sin(enemy.bodyAngle) * (enemy.radius + 12),
    };
    if (isMinePlacementValid(point, world.terrain, world.mines)) {
      addMine(world, "enemy", point, 170, 40, 0.65);
      enemy.mineCooldown = 5.8;
    }
  }

  if (enemy.reloadRemaining <= 0 && range <= config.preferredRange * 1.22 && !isMineSweep) {
    fireEnemyAt(world, enemy, target.point);
    if (enemy.type === "boss" && world.bossPhase === 1) {
      const wall = world.terrain.find((terrain) => terrain.alive && terrain.type === "brick");
      if (wall) fireEnemyAt(world, enemy, wall, 0.68);
    }
  }
}

function separateEnemies(world: TankBattleWorld): void {
  const alive = world.enemies.filter((enemy) => enemy.alive);
  for (let firstIndex = 0; firstIndex < alive.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < alive.length; secondIndex += 1) {
      const first = alive[firstIndex];
      const second = alive[secondIndex];
      let dx = second.x - first.x;
      let dy = second.y - first.y;
      let separation = Math.hypot(dx, dy);
      const required = first.radius + second.radius + 2;
      if (separation >= required) continue;
      if (separation <= 0.001) {
        const angle = ((first.id + second.id) % 8) * (Math.PI / 4);
        dx = Math.cos(angle);
        dy = Math.sin(angle);
        separation = 1;
      }
      const push = (required - separation) / 2;
      const normalX = dx / separation;
      const normalY = dy / separation;
      first.x -= normalX * push;
      first.y -= normalY * push;
      second.x += normalX * push;
      second.y += normalY * push;
      Object.assign(first, clampPointToSafeRect(first, first.radius));
      Object.assign(second, clampPointToSafeRect(second, second.radius));
    }
  }
}

function projectileOutsideBattlefield(projectile: ProjectileState): boolean {
  const padding = 20;
  return (
    projectile.x < GAMEPLAY_SAFE_RECT.left - padding ||
    projectile.x > GAMEPLAY_SAFE_RECT.right + padding ||
    projectile.y < GAMEPLAY_SAFE_RECT.top - padding ||
    projectile.y > GAMEPLAY_SAFE_RECT.bottom + padding
  );
}

function applyProjectileSplash(
  world: TankBattleWorld,
  projectile: ProjectileState,
  primaryEnemyId: number | null
): void {
  if (projectile.splashRadius <= 0 || projectile.owner !== "player") return;
  world.explosions.push({
    x: projectile.x,
    y: projectile.y,
    radius: 3,
    maxRadius: projectile.splashRadius,
    lifeRemaining: 0.28,
    color: "#fde68a",
  });
  for (const enemy of world.enemies) {
    if (
      enemy.alive &&
      enemy.id !== primaryEnemyId &&
      distanceSquared(projectile, enemy) <= (projectile.splashRadius + enemy.radius) ** 2
    ) {
      damageEnemy(
        world,
        enemy,
        projectile.rawDamage * 0.35,
        "player",
        Math.atan2(enemy.y - projectile.y, enemy.x - projectile.x)
      );
    }
  }
}

function updateProjectiles(world: TankBattleWorld, delta: number): void {
  const survivors: ProjectileState[] = [];
  for (const projectile of world.projectiles) {
    projectile.lifeRemaining -= delta;
    projectile.x += projectile.velocityX * delta;
    projectile.y += projectile.velocityY * delta;
    if (projectile.lifeRemaining <= 0 || projectileOutsideBattlefield(projectile)) continue;

    const terrain = world.terrain.find((piece) =>
      circleIntersectsTerrain(projectile, projectile.radius, piece)
    );
    if (terrain) {
      if (terrain.type !== "steel") {
        damageTerrain(
          world,
          terrain,
          projectile.rawDamage * projectile.wallDamageMultiplier,
          projectile.owner
        );
      }
      applyProjectileSplash(world, projectile, null);
      continue; // Steel and every other obstacle despawn shells; ricochet is forbidden.
    }

    if (projectile.owner === "player" || projectile.owner === "hq") {
      const enemy = world.enemies.find(
        (candidate) =>
          candidate.alive &&
          !projectile.hitIds.includes(candidate.id) &&
          distanceSquared(projectile, candidate) <= (projectile.radius + candidate.radius) ** 2
      );
      if (enemy) {
        if (projectile.owner === "player" && !projectile.creditedHit) {
          projectile.creditedHit = true;
          world.metrics.cannonHits += 1;
        }
        damageEnemy(
          world,
          enemy,
          projectile.rawDamage,
          projectile.owner,
          Math.atan2(projectile.velocityY, projectile.velocityX)
        );
        projectile.hitIds.push(enemy.id);
        applyProjectileSplash(world, projectile, enemy.id);
        if (projectile.pierceRemaining > 0) {
          projectile.pierceRemaining -= 1;
          projectile.rawDamage *= 0.58;
          survivors.push(projectile);
        }
        continue;
      }
    } else {
      if (
        world.player.alive &&
        distanceSquared(projectile, world.player) <= (projectile.radius + world.player.radius) ** 2
      ) {
        damagePlayer(world, projectile.rawDamage);
        continue;
      }
      if (
        world.headquarters.alive &&
        distanceSquared(projectile, world.headquarters) <= (projectile.radius + world.headquarters.radius) ** 2
      ) {
        damageHeadquarters(world, projectile.rawDamage);
        continue;
      }
    }
    survivors.push(projectile);
  }
  world.projectiles = survivors;
}

function explodeMine(world: TankBattleWorld, mine: MineState): void {
  const effectRadius = mine.triggerRadius / 0.48;
  world.explosions.push({
    x: mine.x,
    y: mine.y,
    radius: 5,
    maxRadius: effectRadius,
    lifeRemaining: 0.42,
    color: mine.owner === "enemy" ? "#f43f5e" : "#fbbf24",
  });
  if (mine.owner === "player" || mine.owner === "hq") {
    for (const enemy of world.enemies) {
      if (!enemy.alive || distanceSquared(mine, enemy) > (effectRadius + enemy.radius) ** 2) continue;
      const wasAlive = enemy.alive;
      damageEnemy(
        world,
        enemy,
        mine.rawDamage,
        mine.owner,
        Math.atan2(enemy.y - mine.y, enemy.x - mine.x),
        mine.owner === "player"
      );
      if (wasAlive && enemy.alive && mine.slowRatio > 0) enemy.slowRemaining = 2;
    }
    for (const terrain of world.terrain) {
      if (
        terrain.alive &&
        terrain.type !== "steel" &&
        distanceSquared(mine, terrain) <= (effectRadius + Math.max(terrain.width, terrain.height) / 2) ** 2
      ) {
        damageTerrain(world, terrain, mine.rawDamage * 0.45, mine.owner);
      }
    }
  } else {
    if (world.player.alive && distanceSquared(mine, world.player) <= (effectRadius + world.player.radius) ** 2) {
      damagePlayer(world, mine.rawDamage);
    }
    if (
      world.headquarters.alive &&
      distanceSquared(mine, world.headquarters) <= (effectRadius + world.headquarters.radius) ** 2
    ) {
      damageHeadquarters(world, mine.rawDamage);
    }
  }
}

function updateMines(world: TankBattleWorld, delta: number): void {
  const survivors: MineState[] = [];
  for (const mine of world.mines) {
    mine.armedRemaining = Math.max(0, mine.armedRemaining - delta);
    if (mine.armedRemaining > 0) {
      survivors.push(mine);
      continue;
    }
    const triggered =
      mine.owner === "enemy"
        ? (world.player.alive && distanceSquared(mine, world.player) <= (mine.triggerRadius + world.player.radius) ** 2) ||
          (world.headquarters.alive && distanceSquared(mine, world.headquarters) <= (mine.triggerRadius + world.headquarters.radius) ** 2)
        : world.enemies.some(
            (enemy) => enemy.alive && distanceSquared(mine, enemy) <= (mine.triggerRadius + enemy.radius) ** 2
          );
    if (!triggered) {
      survivors.push(mine);
      continue;
    }
    explodeMine(world, mine);
    mine.charges -= 1;
    if (mine.charges > 0 && mine.rearmSeconds > 0) {
      mine.armedRemaining = mine.rearmSeconds;
      survivors.push(mine);
    }
  }
  world.mines = survivors;
}

function updateHeadquartersWeapon(world: TankBattleWorld, delta: number): void {
  const hq = world.headquarters;
  hq.gunCooldown = Math.max(0, hq.gunCooldown - delta);
  if (!hq.alive || hq.stats.machineGunDps <= 0 || hq.gunCooldown > 0) return;
  const target = world.enemies
    .filter((enemy) => enemy.alive && distanceSquared(hq, enemy) <= hq.stats.machineGunRange ** 2)
    .sort((a, b) => distanceSquared(hq, a) - distanceSquared(hq, b))[0];
  if (!target) return;
  const fireInterval = 0.32;
  const angle = Math.atan2(target.y - hq.y, target.x - hq.x);
  spawnProjectile(world, "hq", null, hq, angle, 240, hq.stats.machineGunDps * fireInterval, {
    radius: 2.4,
    lifeRemaining: 1.2,
    dangerous: false,
  });
  hq.gunCooldown = fireInterval;
}

function updateEffects(world: TankBattleWorld, delta: number): void {
  world.explosions = world.explosions
    .map((explosion) => ({
      ...explosion,
      lifeRemaining: explosion.lifeRemaining - delta,
      radius: Math.min(explosion.maxRadius, explosion.radius + explosion.maxRadius * delta * 4.2),
    }))
    .filter((explosion) => explosion.lifeRemaining > 0);
  world.warnings = world.warnings
    .map((warning) => ({ ...warning, remaining: warning.remaining - delta }))
    .filter((warning) => warning.remaining > 0);
}

function updateSpawnsAndWaves(world: TankBattleWorld, delta: number): void {
  if (world.bossSpawned) return;
  const definition = WAVE_DEFINITIONS[world.waveIndex];
  world.spawnCooldown = Math.max(0, world.spawnCooldown - delta);
  if (world.pendingSpawns.length > 0 && world.spawnCooldown <= 0) {
    const next = world.pendingSpawns.shift()!;
    const spawned = spawnEnemyTank(world, next.type);
    if (!spawned) world.pendingSpawns.unshift(next);
    world.spawnCooldown = definition.spawnInterval;
    return;
  }
  if (world.pendingSpawns.length > 0) return;
  if (world.enemies.some((enemy) => enemy.alive && enemy.type !== "boss")) return;

  if (definition.upgradeAfter) {
    world.phase = "upgrade";
    stopTankDriveInput(world);
    world.upgradeOffers = createUpgradeOffers(world);
    world.upgradeSelectionLocked = false;
    world.latestMessage = "CHỌN 1 NÂNG CẤP";
    world.latestMessageRemaining = 99;
    return;
  }
  world.waveIndex += 1;
  queueWave(world, world.waveIndex);
}

export function selectTankUpgrade(world: TankBattleWorld, id: TankUpgradeId): boolean {
  const defensiveMineBefore = world.headquarters.stats.defensiveMineCount;
  if (!applyTankUpgrade(world, id)) return false;
  const defensiveMineAdded = world.headquarters.stats.defensiveMineCount - defensiveMineBefore;
  if (defensiveMineAdded > 0) spawnHeadquartersDefensiveMines(world, defensiveMineAdded);
  world.upgradeMilestonesCompleted += 1;
  if (world.player.stats.betweenWaveRepair > 0) {
    world.player.hp = Math.min(
      world.player.stats.maxHp,
      world.player.hp + world.player.stats.betweenWaveRepair
    );
  }
  world.phase = "playing";
  world.latestMessageRemaining = 0;
  world.upgradeOffers = [];
  if (world.waveIndex + 1 < WAVE_DEFINITIONS.length) {
    world.waveIndex += 1;
    queueWave(world, world.waveIndex);
  } else {
    world.pendingSpawns = [];
    world.waveBannerRemaining = 2.8;
    spawnEnemyTank(world, "boss");
  }
  return true;
}

export function setTankBattlePaused(world: TankBattleWorld, paused: boolean): void {
  world.pausedByUser = paused;
  if (paused) stopTankDriveInput(world);
}

export function setTankBattleHiddenPaused(world: TankBattleWorld, paused: boolean): void {
  world.hiddenPaused = paused;
  if (paused) stopTankDriveInput(world);
}

export function updateTankBattleWorld(world: TankBattleWorld, requestedDelta: number): void {
  if (
    world.phase !== "playing" ||
    world.pausedByUser ||
    world.hiddenPaused ||
    !Number.isFinite(requestedDelta) ||
    requestedDelta <= 0
  ) {
    return;
  }
  const delta = Math.min(TANK_BATTLE_WORLD.maxDeltaSeconds, requestedDelta);
  world.elapsedSeconds += delta;
  world.simulationSeconds += delta;
  world.waveBannerRemaining = Math.max(0, world.waveBannerRemaining - delta);
  world.latestMessageRemaining = Math.max(0, world.latestMessageRemaining - delta);
  if (world.latestMessageRemaining <= 0) world.latestMessage = null;
  world.player.reloadRemaining = Math.max(0, world.player.reloadRemaining - delta);
  world.player.hitFlash = Math.max(0, world.player.hitFlash - delta);
  world.headquarters.hitFlash = Math.max(0, world.headquarters.hitFlash - delta);

  rebuildNavigation(world);
  movePlayer(world, delta);
  updateSpawnsAndWaves(world, delta);
  for (const enemy of world.enemies) updateEnemy(world, enemy, delta);
  separateEnemies(world);
  updateHeadquartersWeapon(world, delta);
  updateProjectiles(world, delta);
  updateMines(world, delta);
  updateEffects(world, delta);
  rebuildNavigation(world);
  world.enemies = world.enemies.filter((enemy) => enemy.alive || enemy.hitFlash > 0);

  if (world.elapsedSeconds > TANK_BATTLE_WORLD.hardRunLimitSeconds && !world.bossSpawned) {
    world.pendingSpawns = [];
    world.enemies.forEach((enemy) => {
      enemy.alive = false;
    });
    spawnEnemyTank(world, "boss");
  }
}

export function makeTankBattleHudSnapshot(world: TankBattleWorld): TankBattleHudSnapshot {
  const boss = world.enemies.find((enemy) => enemy.alive && enemy.type === "boss");
  return {
    phase: world.phase,
    tankName: PLAYER_TANK_NAME,
    score: world.score,
    waveLabel: boss ? "BOSS" : WAVE_DEFINITIONS[world.waveIndex]?.name ?? "BOSS",
    elapsedSeconds: world.elapsedSeconds,
    playerHp: world.player.hp,
    playerMaxHp: world.player.stats.maxHp,
    playerArmor: world.player.stats.armor,
    hqHp: world.headquarters.hp,
    hqMaxHp: world.headquarters.stats.maxHp,
    hqArmor: world.headquarters.stats.armor,
    activeShells: activePlayerShellCount(world),
    maxShells: world.player.stats.maxActiveShells,
    activeMines: activePlayerMineCount(world),
    maxMines: world.player.stats.maxActiveMines,
    reloadRemaining: world.player.reloadRemaining,
    reloadDuration: world.player.stats.reloadSeconds,
    bossHp: boss?.hp ?? 0,
    bossMaxHp: boss?.maxHp ?? 0,
    bossPhase: boss ? getBossPhase(boss.hp, boss.maxHp) : 0,
    bossLockWarning: world.bossLockWarning,
    latestMessage: world.latestMessage,
    paused: world.pausedByUser || world.hiddenPaused || world.phase === "upgrade",
  };
}

export function summarizeTankBattleWorld(world: TankBattleWorld): TankBattleRunSummary {
  const cannonAccuracy = world.metrics.cannonShots > 0
    ? world.metrics.cannonHits / world.metrics.cannonShots
    : 0;
  const bossClearSeconds =
    world.metrics.bossStartedAt !== null && world.metrics.bossDefeatedAt !== null
      ? Math.max(0, world.metrics.bossDefeatedAt - world.metrics.bossStartedAt)
      : null;
  const base = {
    victory: world.phase === "victory",
    defeatReason:
      world.phase === "defeat_player"
        ? ("player" as const)
        : world.phase === "defeat_hq"
          ? ("hq" as const)
          : null,
    score: world.score,
    enemiesDefeated: world.metrics.enemiesDefeated,
    elitesDefeated: world.metrics.elitesDefeated,
    cannonShots: world.metrics.cannonShots,
    cannonHits: world.metrics.cannonHits,
    cannonAccuracy,
    mineKills: world.metrics.mineKills,
    damageDealt: world.metrics.damageDealt,
    damageTaken: world.metrics.damageTaken,
    hqDamageTaken: world.metrics.hqDamageTaken,
    hqHpRemaining: world.headquarters.hp,
    hqMaxHp: world.headquarters.stats.maxHp,
    wallsDestroyedByPlayer: world.metrics.wallsDestroyedByPlayer,
    wallsDestroyedByEnemy: world.metrics.wallsDestroyedByEnemy,
    runSeconds: world.elapsedSeconds,
    bossClearSeconds,
    upgrades: [...world.player.selectedUpgrades],
  };
  return { ...base, rank: calculateTankBattleRank(base) };
}

// Test-facing helpers deliberately keep destruction and slot behavior observable.
export function damageTerrainForTest(
  world: TankBattleWorld,
  terrain: TerrainState,
  rawDamage: number,
  source: ProjectileOwner | MineOwner = "player"
): void {
  damageTerrain(world, terrain, rawDamage, source);
}

export function damageEnemyForTest(
  world: TankBattleWorld,
  enemy: EnemyTankState,
  rawDamage: number,
  source: ProjectileOwner | MineOwner = "player"
): number {
  return damageEnemy(world, enemy, rawDamage, source, enemy.bodyAngle + Math.PI);
}

export function damageHeadquartersForTest(world: TankBattleWorld, rawDamage: number): number {
  return damageHeadquarters(world, rawDamage);
}

export function damagePlayerForTest(world: TankBattleWorld, rawDamage: number): number {
  return damagePlayer(world, rawDamage);
}

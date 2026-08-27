import {
  GAMEPLAY_SAFE_RECT,
  TANK_BATTLE_RANK_ORDER,
  TANK_BATTLE_REWARD_CONFIG,
  TANK_BATTLE_WORLD,
  UPGRADE_BY_ID,
  UPGRADE_DEFINITIONS,
} from "./tankBattleConfig";
import {
  DriveInput,
  EnemyTargetKind,
  EnemyTankState,
  GameplaySafeRect,
  HeadquartersState,
  MineState,
  NavigationGrid,
  PathNode,
  PlayerTankState,
  TankBattleProfile,
  TankBattleRank,
  TankBattleReward,
  TankBattleRunSummary,
  TankBattleWorld,
  TankUpgradeCard,
  TankUpgradeId,
  TerrainState,
  UpgradeCategory,
  Vec2,
} from "./tankBattleTypes";

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function distanceSquared(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.sqrt(distanceSquared(a, b));
}

export function normalizeAngle(angle: number): number {
  let normalized = angle % (Math.PI * 2);
  if (normalized > Math.PI) normalized -= Math.PI * 2;
  if (normalized < -Math.PI) normalized += Math.PI * 2;
  return normalized;
}

export function rotateTowardAngle(
  current: number,
  target: number,
  maxStep: number
): number {
  const difference = normalizeAngle(target - current);
  return normalizeAngle(current + clamp(difference, -maxStep, maxStep));
}

/** Shared floating-point armor formula used by every combat target. */
export function calculateArmoredDamage(rawDamage: number, armor: number): number {
  const safeRaw = Math.max(0, rawDamage);
  const safeArmor = Math.max(0, armor);
  return safeRaw * (100 / (100 + safeArmor));
}

export function calculateFrontalArmor(
  enemy: Pick<EnemyTankState, "type" | "bodyAngle">,
  incomingAngle: number,
  baseArmor: number
): number {
  if (enemy.type !== "elite") return baseArmor;
  const directionTowardProjectileSource = normalizeAngle(incomingAngle + Math.PI);
  const impactFromFront = Math.abs(normalizeAngle(directionTowardProjectileSource - enemy.bodyAngle)) < Math.PI / 3;
  return impactFromFront ? baseArmor + 35 : baseArmor;
}

export function isPointInsideSafeRect(
  point: Vec2,
  padding = 0,
  rect: GameplaySafeRect = GAMEPLAY_SAFE_RECT
): boolean {
  return (
    point.x >= rect.left + padding &&
    point.x <= rect.right - padding &&
    point.y >= rect.top + padding &&
    point.y <= rect.bottom - padding
  );
}

export function clampPointToSafeRect(
  point: Vec2,
  padding = 0,
  rect: GameplaySafeRect = GAMEPLAY_SAFE_RECT
): Vec2 {
  return {
    x: clamp(point.x, rect.left + padding, rect.right - padding),
    y: clamp(point.y, rect.top + padding, rect.bottom - padding),
  };
}

export function circleIntersectsTerrain(
  point: Vec2,
  radius: number,
  terrain: TerrainState
): boolean {
  if (!terrain.alive) return false;
  const halfWidth = terrain.width / 2;
  const halfHeight = terrain.height / 2;
  const closestX = clamp(point.x, terrain.x - halfWidth, terrain.x + halfWidth);
  const closestY = clamp(point.y, terrain.y - halfHeight, terrain.y + halfHeight);
  const dx = point.x - closestX;
  const dy = point.y - closestY;
  return dx * dx + dy * dy <= radius * radius;
}

export function pointInsideTerrain(point: Vec2, terrain: TerrainState): boolean {
  return (
    terrain.alive &&
    point.x >= terrain.x - terrain.width / 2 &&
    point.x <= terrain.x + terrain.width / 2 &&
    point.y >= terrain.y - terrain.height / 2 &&
    point.y <= terrain.y + terrain.height / 2
  );
}

/**
 * A tank joystick preserves natural two-axis dragging: vertical input drives the
 * tracks while horizontal input steers the body. A circular dead-zone prevents
 * drift as soon as the thumb returns to rest.
 */
export function resolveDriveInput(
  inputX: number,
  inputY: number,
  deadZone = TANK_BATTLE_WORLD.joystickDeadZone,
  radius = TANK_BATTLE_WORLD.joystickRadius
): DriveInput {
  const magnitude = Math.hypot(inputX, inputY);
  if (magnitude <= deadZone) return { throttle: 0, steer: 0 };
  const clampedMagnitude = Math.min(radius, magnitude);
  const scale = clampedMagnitude / Math.max(magnitude, 0.0001);
  const normalizedX = (inputX * scale) / radius;
  const normalizedY = (inputY * scale) / radius;
  return {
    throttle: clamp(-normalizedY, -1, 1),
    steer: clamp(normalizedX, -1, 1),
  };
}

export function activePlayerShellCount(world: Pick<TankBattleWorld, "projectiles">): number {
  return world.projectiles.filter((projectile) => projectile.owner === "player").length;
}

export function activePlayerMineCount(world: Pick<TankBattleWorld, "mines">): number {
  return world.mines.filter((mine) => mine.owner === "player").length;
}

export function canPlayerFire(
  world: Pick<TankBattleWorld, "phase" | "pausedByUser" | "hiddenPaused" | "player" | "projectiles">
): boolean {
  return (
    world.phase === "playing" &&
    !world.pausedByUser &&
    !world.hiddenPaused &&
    world.player.alive &&
    world.player.reloadRemaining <= 0 &&
    activePlayerShellCount(world) < world.player.stats.maxActiveShells
  );
}

export function shouldFireOnAimRelease(
  displacement: Vec2,
  cancelled: boolean,
  cancelRadius = TANK_BATTLE_WORLD.aimCancelRadius
): boolean {
  return !cancelled && Math.hypot(displacement.x, displacement.y) > cancelRadius;
}

export function resolveAimAngle(
  origin: Vec2,
  rawTarget: Vec2,
  candidates: readonly Vec2[],
  assistDegrees = TANK_BATTLE_WORLD.aimAssistDegrees
): number {
  const rawAngle = Math.atan2(rawTarget.y - origin.y, rawTarget.x - origin.x);
  if (candidates.length === 0 || assistDegrees <= 0) return rawAngle;
  const cone = (assistDegrees * Math.PI) / 180;
  let bestAngle = rawAngle;
  let bestDifference = cone + 0.0001;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const candidateAngle = Math.atan2(candidate.y - origin.y, candidate.x - origin.x);
    const difference = Math.abs(normalizeAngle(candidateAngle - rawAngle));
    const candidateDistance = distanceSquared(origin, candidate);
    if (
      difference <= cone &&
      (difference < bestDifference ||
        (Math.abs(difference - bestDifference) < 0.0001 && candidateDistance < bestDistance))
    ) {
      bestAngle = candidateAngle;
      bestDifference = difference;
      bestDistance = candidateDistance;
    }
  }
  return bestAngle;
}

export function getMinePlacementPoint(player: Pick<PlayerTankState, "x" | "y" | "bodyAngle" | "radius">): Vec2 {
  const offset = player.radius + 13;
  return {
    x: player.x - Math.cos(player.bodyAngle) * offset,
    y: player.y - Math.sin(player.bodyAngle) * offset,
  };
}

export function isMinePlacementValid(
  point: Vec2,
  terrain: readonly TerrainState[],
  mines: readonly MineState[],
  safeRect: GameplaySafeRect = GAMEPLAY_SAFE_RECT
): boolean {
  if (!isPointInsideSafeRect(point, 10, safeRect)) return false;
  if (terrain.some((piece) => circleIntersectsTerrain(point, 9, piece))) return false;
  if (mines.some((mine) => distanceSquared(point, mine) < 24 * 24)) return false;
  return true;
}

export function canPlacePlayerMine(world: TankBattleWorld): boolean {
  if (
    world.phase !== "playing" ||
    world.pausedByUser ||
    world.hiddenPaused ||
    !world.player.alive ||
    activePlayerMineCount(world) >= world.player.stats.maxActiveMines
  ) {
    return false;
  }
  return isMinePlacementValid(
    getMinePlacementPoint(world.player),
    world.terrain,
    world.mines
  );
}

function terrainBlocksNavigation(terrain: TerrainState): boolean {
  return terrain.alive && (terrain.type === "brick" || terrain.type === "steel" || terrain.type === "barrel");
}

function gridIndex(grid: NavigationGrid, column: number, row: number): number {
  return row * grid.columns + column;
}

function pointToGrid(point: Vec2, grid: NavigationGrid): { column: number; row: number } {
  return {
    column: clamp(
      Math.floor((point.x - GAMEPLAY_SAFE_RECT.left) / grid.cellSize),
      0,
      grid.columns - 1
    ),
    row: clamp(
      Math.floor((point.y - GAMEPLAY_SAFE_RECT.top) / grid.cellSize),
      0,
      grid.rows - 1
    ),
  };
}

function gridToPoint(column: number, row: number, grid: NavigationGrid): PathNode {
  return clampPointToSafeRect(
    {
      x: GAMEPLAY_SAFE_RECT.left + column * grid.cellSize + grid.cellSize / 2,
      y: GAMEPLAY_SAFE_RECT.top + row * grid.cellSize + grid.cellSize / 2,
    },
    8
  );
}

export function buildNavigationGrid(
  terrain: readonly TerrainState[],
  revision: number,
  cellSize = TANK_BATTLE_WORLD.pathCellSize
): NavigationGrid {
  const columns = Math.max(1, Math.ceil(GAMEPLAY_SAFE_RECT.width / cellSize));
  const rows = Math.max(1, Math.ceil(GAMEPLAY_SAFE_RECT.height / cellSize));
  const blocked = new Array<boolean>(columns * rows).fill(false);
  const grid: NavigationGrid = { cellSize, columns, rows, blocked, revision };
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const point = gridToPoint(column, row, grid);
      blocked[gridIndex(grid, column, row)] = terrain.some(
        (piece) => terrainBlocksNavigation(piece) && circleIntersectsTerrain(point, 13, piece)
      );
    }
  }
  return grid;
}

export function findNavigationPath(
  start: Vec2,
  goal: Vec2,
  grid: NavigationGrid
): PathNode[] {
  const startCell = pointToGrid(start, grid);
  const goalCell = pointToGrid(goal, grid);
  const startIndex = gridIndex(grid, startCell.column, startCell.row);
  const goalIndex = gridIndex(grid, goalCell.column, goalCell.row);
  if (startIndex === goalIndex) return [clampPointToSafeRect(goal, 8)];

  const open = new Set<number>([startIndex]);
  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>([[startIndex, 0]]);
  const fScore = new Map<number, number>();
  const heuristic = (index: number) => {
    const column = index % grid.columns;
    const row = Math.floor(index / grid.columns);
    return Math.abs(column - goalCell.column) + Math.abs(row - goalCell.row);
  };
  fScore.set(startIndex, heuristic(startIndex));
  const neighbors = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;

  let iterations = 0;
  while (open.size > 0 && iterations < grid.blocked.length * 5) {
    iterations += 1;
    let current = -1;
    let currentScore = Number.POSITIVE_INFINITY;
    for (const candidate of open) {
      const score = fScore.get(candidate) ?? Number.POSITIVE_INFINITY;
      if (score < currentScore) {
        current = candidate;
        currentScore = score;
      }
    }
    if (current === goalIndex) {
      const reversed: number[] = [current];
      while (cameFrom.has(current)) {
        current = cameFrom.get(current)!;
        reversed.push(current);
      }
      reversed.reverse();
      const path = reversed.slice(1).map((index) =>
        gridToPoint(index % grid.columns, Math.floor(index / grid.columns), grid)
      );
      path.push(clampPointToSafeRect(goal, 8));
      return simplifyPath(path, grid);
    }
    open.delete(current);
    const currentColumn = current % grid.columns;
    const currentRow = Math.floor(current / grid.columns);
    for (const [columnOffset, rowOffset] of neighbors) {
      const column = currentColumn + columnOffset;
      const row = currentRow + rowOffset;
      if (column < 0 || column >= grid.columns || row < 0 || row >= grid.rows) continue;
      const neighbor = gridIndex(grid, column, row);
      if (neighbor !== goalIndex && neighbor !== startIndex && grid.blocked[neighbor]) continue;
      const tentative = (gScore.get(current) ?? Number.POSITIVE_INFINITY) + 1;
      if (tentative >= (gScore.get(neighbor) ?? Number.POSITIVE_INFINITY)) continue;
      cameFrom.set(neighbor, current);
      gScore.set(neighbor, tentative);
      fScore.set(neighbor, tentative + heuristic(neighbor));
      open.add(neighbor);
    }
  }
  return [clampPointToSafeRect(goal, 8)];
}

function simplifyPath(path: PathNode[], grid: NavigationGrid): PathNode[] {
  if (path.length < 3) return path;
  const result: PathNode[] = [path[0]];
  let previousDirection = "";
  for (let index = 1; index < path.length; index += 1) {
    const previous = path[index - 1];
    const current = path[index];
    const direction = `${Math.sign(current.x - previous.x)},${Math.sign(current.y - previous.y)}`;
    if (previousDirection && direction !== previousDirection) result.push(previous);
    previousDirection = direction;
  }
  result.push(path[path.length - 1]);
  return result.map((node, index) =>
    index === result.length - 1
      ? clampPointToSafeRect(node, 8)
      : gridToPoint(pointToGrid(node, grid).column, pointToGrid(node, grid).row, grid)
  );
}

export function selectEnemyTargetKind(
  enemyType: EnemyTankState["type"],
  playerAlive: boolean,
  hasDestructibleWall: boolean,
  hasPlayerMine: boolean
): EnemyTargetKind {
  switch (enemyType) {
    case "light":
      return "hq";
    case "battle":
      return playerAlive ? "player" : "hq";
    case "siege":
    case "elite":
      return hasDestructibleWall ? "terrain" : "hq";
    case "minesweeper":
      return hasPlayerMine ? "mine" : playerAlive ? "player" : "hq";
    case "minelayer":
      return playerAlive ? "player" : "hq";
    case "boss":
      return playerAlive ? "player" : "hq";
  }
}

export function getBossPhase(hp: number, maxHp: number): 1 | 2 | 3 {
  const ratio = maxHp <= 0 ? 0 : hp / maxHp;
  if (ratio > 0.65) return 1;
  if (ratio > 0.3) return 2;
  return 3;
}

export function shouldInterruptBossSiege(
  accumulatedRawDamage: number,
  bossMaxHp: number
): boolean {
  return accumulatedRawDamage >= bossMaxHp * 0.075;
}

function upgradeStack(world: TankBattleWorld, id: TankUpgradeId): number {
  return world.player.upgradeStacks[id] ?? 0;
}

export function isUpgradeEligible(world: TankBattleWorld, id: TankUpgradeId): boolean {
  const definition = UPGRADE_BY_ID[id];
  if (upgradeStack(world, id) >= definition.maxStacks) return false;
  switch (id) {
    case "cannon_shell_slot":
      return world.player.stats.maxActiveShells < TANK_BATTLE_WORLD.maxPlayerShellsHardCap;
    case "mine_capacity":
      return world.player.stats.maxActiveMines < TANK_BATTLE_WORLD.maxPlayerMinesHardCap;
    case "cannon_reload":
      return world.player.stats.reloadSeconds > 0.6;
    case "hq_emergency_repair":
      return world.headquarters.hp < world.headquarters.stats.maxHp - 1;
    default:
      return true;
  }
}

function randomItem<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

export function createUpgradeOffers(
  world: TankBattleWorld,
  random: () => number = world.random
): TankUpgradeCard[] {
  const eligible = UPGRADE_DEFINITIONS.filter((definition) => isUpgradeEligible(world, definition.id));
  if (eligible.length < 3) {
    throw new Error("Not enough eligible tank upgrades to create three cards");
  }
  const categoryOrder: UpgradeCategory[] = ["cannon", "mine", "tank", "hq"];
  for (let index = categoryOrder.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [categoryOrder[index], categoryOrder[swapIndex]] = [categoryOrder[swapIndex], categoryOrder[index]];
  }
  const selected = [] as typeof eligible;
  for (const category of categoryOrder) {
    const options = eligible.filter(
      (definition) => definition.category === category && !selected.some((entry) => entry.id === definition.id)
    );
    if (options.length > 0 && selected.length < 2) selected.push(randomItem(options, random));
  }
  const remaining = eligible.filter((definition) => !selected.some((entry) => entry.id === definition.id));
  while (selected.length < 3) {
    const choice = randomItem(remaining, random);
    selected.push(choice);
    remaining.splice(remaining.indexOf(choice), 1);
  }
  return selected.map((definition) => ({
    ...definition,
    stackAfterSelection: upgradeStack(world, definition.id) + 1,
  }));
}

export function applyTankUpgrade(world: TankBattleWorld, id: TankUpgradeId): boolean {
  if (world.phase !== "upgrade" || world.upgradeSelectionLocked || !isUpgradeEligible(world, id)) {
    return false;
  }
  if (!world.upgradeOffers.some((offer) => offer.id === id)) return false;
  world.upgradeSelectionLocked = true;
  const currentStack = upgradeStack(world, id);
  world.player.upgradeStacks[id] = currentStack + 1;
  world.player.selectedUpgrades.push(id);

  switch (id) {
    case "cannon_damage":
      world.player.stats.cannonDamage *= 1.22;
      break;
    case "cannon_reload":
      world.player.stats.reloadSeconds = Math.max(0.6, world.player.stats.reloadSeconds * 0.85);
      break;
    case "cannon_shell_slot":
      world.player.stats.maxActiveShells = Math.min(
        TANK_BATTLE_WORLD.maxPlayerShellsHardCap,
        world.player.stats.maxActiveShells + 1
      );
      break;
    case "cannon_velocity":
      world.player.stats.projectileSpeed *= 1.18;
      break;
    case "cannon_pierce":
      world.player.stats.projectilePierce += 1;
      break;
    case "cannon_splash":
      world.player.stats.splashRadius = 34;
      break;
    case "mine_capacity":
      world.player.stats.maxActiveMines = Math.min(
        TANK_BATTLE_WORLD.maxPlayerMinesHardCap,
        world.player.stats.maxActiveMines + 1
      );
      break;
    case "mine_damage":
      world.player.stats.mineDamage *= 1.25;
      break;
    case "mine_radius":
      world.player.stats.mineRadius *= 1.18;
      break;
    case "mine_trigger":
      world.player.stats.mineTriggerDelay = Math.max(0.18, world.player.stats.mineTriggerDelay - 0.16);
      break;
    case "mine_slow":
      world.player.stats.mineSlowRatio = 0.35;
      break;
    case "mine_rearm":
      world.player.stats.mineRearmSeconds = 2.5;
      break;
    case "tank_hp":
      world.player.stats.maxHp += 180;
      world.player.hp = Math.min(world.player.stats.maxHp, world.player.hp + 180);
      break;
    case "tank_armor":
      world.player.stats.armor += 12;
      break;
    case "tank_speed":
      world.player.stats.moveSpeed *= 1.12;
      world.player.stats.acceleration *= 1.12;
      break;
    case "turret_speed":
      world.player.stats.turretTurnSpeed *= 1.25;
      break;
    case "between_wave_repair":
      world.player.stats.betweenWaveRepair += 110;
      break;
    case "hq_hp":
      world.headquarters.stats.maxHp += 420;
      world.headquarters.hp = Math.min(world.headquarters.stats.maxHp, world.headquarters.hp + 420);
      break;
    case "hq_armor":
      world.headquarters.stats.armor += 10;
      break;
    case "hq_machine_gun":
      world.headquarters.stats.machineGunDps += 38;
      break;
    case "hq_defensive_mines":
      world.headquarters.stats.defensiveMineCount += 2;
      break;
    case "wall_reinforcement":
      for (const wall of world.terrain) {
        if (wall.alive && wall.type === "brick") {
          wall.maxHp += 120;
          wall.hp += 120;
        }
      }
      break;
    case "hq_emergency_repair":
      world.headquarters.hp = Math.min(
        world.headquarters.stats.maxHp,
        world.headquarters.hp + world.headquarters.stats.maxHp * 0.35
      );
      break;
  }
  return true;
}

export function createDefaultTankBattleProfile(): TankBattleProfile {
  return {
    version: 1,
    highScore: 0,
    bestRank: "C",
    bestBossClearSeconds: null,
    bestAccuracy: 0,
    totalRuns: 0,
    bossClears: 0,
    tutorialSeen: false,
    aimAssistEnabled: true,
    lastRewardDate: "",
    rewardedRunsToday: 0,
    goldRewardedToday: 0,
    xpRewardedToday: 0,
  };
}

function betterRank(a: TankBattleRank, b: TankBattleRank): TankBattleRank {
  return TANK_BATTLE_RANK_ORDER.indexOf(a) >= TANK_BATTLE_RANK_ORDER.indexOf(b) ? a : b;
}

export function calculateTankBattleRank(
  input: Pick<
    TankBattleRunSummary,
    "victory" | "hqHpRemaining" | "hqMaxHp" | "runSeconds" | "cannonAccuracy" | "damageTaken"
  >
): TankBattleRank {
  const hqRatio = input.hqMaxHp > 0 ? input.hqHpRemaining / input.hqMaxHp : 0;
  let rating = input.victory ? 38 : 0;
  rating += clamp(hqRatio, 0, 1) * 27;
  rating += clamp((390 - input.runSeconds) / 180, 0, 1) * 15;
  rating += clamp(input.cannonAccuracy, 0, 1) * 12;
  rating += clamp(1 - input.damageTaken / 1200, 0, 1) * 8;
  if (rating >= 93) return "SS";
  if (rating >= 82) return "S";
  if (rating >= 68) return "A";
  if (rating >= 48) return "B";
  return "C";
}

export function calculateTankBattleReward(
  summary: TankBattleRunSummary,
  profile: TankBattleProfile,
  dateKey: string
): { reward: TankBattleReward; nextProfile: TankBattleProfile } {
  const sameDay = profile.lastRewardDate === dateKey;
  const rewardedRunsToday = sameDay ? profile.rewardedRunsToday : 0;
  const goldRewardedToday = sameDay ? profile.goldRewardedToday : 0;
  const xpRewardedToday = sameDay ? profile.xpRewardedToday : 0;
  const rewardRate = TANK_BATTLE_REWARD_CONFIG.rewardRates[
    Math.min(rewardedRunsToday, TANK_BATTLE_REWARD_CONFIG.rewardRates.length - 1)
  ];
  const rankIndex = TANK_BATTLE_RANK_ORDER.indexOf(summary.rank);
  const rawGold = Math.min(
    TANK_BATTLE_REWARD_CONFIG.maxGoldPerRun,
    1 + Math.floor(summary.enemiesDefeated / 16) + (summary.victory ? 2 : 0) + Math.floor(rankIndex / 2)
  );
  const rawXp = Math.min(
    TANK_BATTLE_REWARD_CONFIG.maxXpPerRun,
    1 + Math.floor(summary.runSeconds / 150) + (summary.victory ? 1 : 0)
  );
  const gold = Math.min(
    Math.floor(rawGold * rewardRate),
    Math.max(0, TANK_BATTLE_REWARD_CONFIG.dailyGoldCap - goldRewardedToday)
  );
  const xp = Math.min(
    Math.floor(rawXp * rewardRate),
    Math.max(0, TANK_BATTLE_REWARD_CONFIG.dailyXpCap - xpRewardedToday)
  );
  const nextProfile: TankBattleProfile = {
    ...profile,
    version: 1,
    highScore: Math.max(profile.highScore, summary.score),
    bestRank: betterRank(profile.bestRank, summary.rank),
    bestBossClearSeconds:
      summary.bossClearSeconds === null
        ? profile.bestBossClearSeconds
        : profile.bestBossClearSeconds === null
          ? summary.bossClearSeconds
          : Math.min(profile.bestBossClearSeconds, summary.bossClearSeconds),
    bestAccuracy: Math.max(profile.bestAccuracy, summary.cannonAccuracy),
    totalRuns: profile.totalRuns + 1,
    bossClears: profile.bossClears + (summary.victory ? 1 : 0),
    tutorialSeen: true,
    lastRewardDate: dateKey,
    rewardedRunsToday: rewardedRunsToday + 1,
    goldRewardedToday: goldRewardedToday + gold,
    xpRewardedToday: xpRewardedToday + xp,
  };
  return {
    reward: {
      gold,
      xp,
      rewardRate,
      dailyCapReached:
        nextProfile.goldRewardedToday >= TANK_BATTLE_REWARD_CONFIG.dailyGoldCap &&
        nextProfile.xpRewardedToday >= TANK_BATTLE_REWARD_CONFIG.dailyXpCap,
    },
    nextProfile,
  };
}

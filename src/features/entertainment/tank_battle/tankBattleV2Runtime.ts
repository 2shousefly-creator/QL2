import {
  CONNECTOR_X,
  LANE_IDS,
  LANE_Y,
  PLAYER_HQ,
  POWERUP_POINTS,
  TANK_V2_AI,
  TANK_V2_MAP,
  TANK_V2_PLAYER,
  TANK_V2_VIEWPORT,
  TANK_V2_XP,
} from "./tankBattleV2Config";
import {
  applyCombatXp,
  applyCore,
  calculatePhysicalDamage,
  clamp,
  clampToMap,
  createCoreChoice,
  createStructures,
  directionVector,
  distance,
  distanceSquared,
  getAiSpawnStats,
  hasLineOfSight,
  makeLaneWaypoints,
  moveCardinalToward,
  structureDamageMultiplier,
  updateStructureImmunity,
  unitTargetScore,
  xpNeededForLevel,
} from "./tankBattleV2Engine";
import type {
  CardinalDirection,
  CoreDefinition,
  Faction,
  FloatingText,
  LaneId,
  PlayerState,
  Point,
  PowerUpKind,
  ProjectileState,
  StructureState,
  TankBattleRunSummary,
  TankBattleV2Hud,
  TankBattleV2World,
  TerrainState,
  UnitState,
} from "./tankBattleV2Types";

function makeTerrain(): TerrainState[] {
  let id = 1;
  const items: TerrainState[] = [];
  const brick = (x: number, y: number, width = 44, height = 24) =>
    items.push({ id: id++, kind: "brick", x, y, width, height, hp: 360, maxHp: 360, alive: true });
  const steel = (x: number, y: number, width = 34, height = 70) =>
    items.push({ id: id++, kind: "steel", x, y, width, height, hp: Infinity, maxHp: Infinity, alive: true });

  for (const y of [330, 720, 1110]) {
    brick(360, y - 70, 52, 24);
    brick(360, y + 70, 52, 24);
    steel(275, y - 78, 30, 64);
    steel(445, y + 78, 30, 64);
  }
  for (const x of CONNECTOR_X) {
    brick(x, 525, 48, 22);
    brick(x, 915, 48, 22);
  }
  brick(125, 525, 58, 24);
  brick(595, 915, 58, 24);
  return items;
}

function makePowerUps(random: () => number): TankBattleV2World["powerUps"] {
  const kinds: PowerUpKind[] = ["heal", "speed", "rapid"];
  return POWERUP_POINTS.map((point, index) => ({
    id: 8000 + index,
    x: point.x,
    y: point.y,
    kind: kinds[Math.floor(random() * kinds.length)] || "heal",
    active: true,
    respawnRemaining: 0,
  }));
}

function makePlayer(): PlayerState {
  return {
    x: PLAYER_HQ.x + 52,
    y: PLAYER_HQ.y,
    radius: TANK_V2_PLAYER.radius,
    direction: "right",
    hp: TANK_V2_PLAYER.baseMaxHp,
    shield: 0,
    temporaryShield: 0,
    temporaryShieldRemaining: 0,
    stats: {
      maxHp: TANK_V2_PLAYER.baseMaxHp,
      atk: TANK_V2_PLAYER.baseAtk,
      def: TANK_V2_PLAYER.baseDef,
      moveSpeed: TANK_V2_PLAYER.baseMoveSpeed,
      fireCooldown: TANK_V2_PLAYER.fireCooldown,
      projectileSpeed: TANK_V2_PLAYER.projectileSpeed,
      attackRange: TANK_V2_PLAYER.attackRange,
    },
    level: 1,
    xp: 0,
    xpTotal: 0,
    selectedCoreIds: [],
    coreRuntime: {
      boostDurationBonus: 0,
      boostCooldownReduction: 0,
      projectilePierce: 0,
      structureBonusDamage: 0,
      boostShield: 0,
      killHeal: 0,
      explosiveDamage: 0,
      explosiveRadius: 0,
      doubleShotEvery: 0,
      armorShred: 0,
      armorShredSeconds: 0,
      regenerationShieldCap: 0,
      mobileFortressDef: 0,
      mobileFortressDelay: 0,
      reactiveArmorShield: 0,
      reactiveArmorThreshold: 0,
      overdriveCharges: 1,
    },
    fireRemaining: 0,
    shotCounter: 0,
    boostRemaining: 0,
    boostCooldownRemaining: 0,
    boostCharges: 1,
    boostRechargeQueue: [],
    respawnRemaining: 0,
    spawnProtectionRemaining: TANK_V2_PLAYER.spawnProtectionSeconds,
    speedPowerRemaining: 0,
    rapidPowerRemaining: 0,
    stationarySeconds: 0,
    reactiveArmorUsedThisLife: false,
    alive: true,
  };
}

export function createTankBattleV2World(random: () => number = Math.random): TankBattleV2World {
  const world: TankBattleV2World = {
    phase: "playing",
    elapsedSeconds: 0,
    waveIndex: 0,
    nextWaveAt: TANK_V2_AI.spawnIntervalSeconds,
    siegeTier: 0,
    player: makePlayer(),
    units: [],
    structures: createStructures(),
    projectiles: [],
    terrain: makeTerrain(),
    powerUps: makePowerUps(random),
    floatingTexts: [],
    camera: { x: 0, y: clamp(PLAYER_HQ.y - TANK_V2_VIEWPORT.height / 2, 0, TANK_V2_MAP.height - TANK_V2_VIEWPORT.height) },
    inputDirection: null,
    fireHeld: false,
    pendingCoreSelections: 0,
    coreChoice: null,
    nextEntityId: 1000,
    nextFxId: 1,
    latestMessage: "ĐỢT 1 · TRIỂN KHAI 3 LÀN",
    latestMessageRemaining: 2.5,
    metrics: {
      enemiesDefeated: 0,
      cannonShots: 0,
      cannonHits: 0,
      damageDealt: 0,
      damageTaken: 0,
      hqDamageTaken: 0,
      towersDestroyed: 0,
      wallsDestroyedByPlayer: 0,
      wallsDestroyedByEnemy: 0,
    },
    random,
  };
  spawnWave(world);
  return world;
}

export function setTankV2Direction(world: TankBattleV2World, direction: CardinalDirection | null): void {
  world.inputDirection = direction;
  if (direction && world.player.alive) world.player.direction = direction;
}

export function setTankV2FireHeld(world: TankBattleV2World, held: boolean): void {
  world.fireHeld = held;
}

function laneSpawnPoint(faction: Faction, lane: LaneId, slot: number): Point {
  const baseX = faction === "ally" ? 92 : TANK_V2_MAP.width - 92;
  const slotOffset = (slot - 1) * 34;
  return { x: baseX, y: LANE_Y[lane] + slotOffset };
}

function laneAliveCount(world: TankBattleV2World, faction: Faction, lane: LaneId): number {
  return world.units.filter((unit) => unit.alive && unit.faction === faction && unit.lane === lane).length;
}

function factionAliveCount(world: TankBattleV2World, faction: Faction): number {
  return world.units.filter((unit) => unit.alive && unit.faction === faction).length;
}

function spawnUnit(world: TankBattleV2World, faction: Faction, lane: LaneId, slot: number): UnitState | null {
  if (laneAliveCount(world, faction, lane) >= TANK_V2_AI.laneSoftCapPerFaction) return null;
  if (factionAliveCount(world, faction) >= TANK_V2_AI.globalSoftCapPerFaction) return null;
  const stats = getAiSpawnStats(world.elapsedSeconds);
  const point = laneSpawnPoint(faction, lane, slot);
  const unit: UnitState = {
    id: world.nextEntityId++, faction, lane, waveIndex: world.waveIndex, formationSlot: slot,
    x: point.x, y: point.y, radius: 13, direction: faction === "ally" ? "right" : "left",
    hp: stats.hp, maxHp: stats.hp, atk: stats.atk, def: stats.def,
    moveSpeed: TANK_V2_AI.moveSpeed, attackRange: TANK_V2_AI.attackRange,
    visionRange: TANK_V2_AI.attackRange * TANK_V2_AI.visionMultiplier,
    fireCooldown: TANK_V2_AI.fireCooldown, fireRemaining: world.random() * TANK_V2_AI.fireCooldown,
    state: "advance", targetId: null, chaseOrigin: null,
    senseRemaining: world.random() * 0.2, waypointIndex: 0,
    armorShred: 0, armorShredRemaining: 0, lastPlayerDamageAt: -999, alive: true,
  };
  world.units.push(unit);
  return unit;
}

export function spawnWave(world: TankBattleV2World): void {
  world.waveIndex += 1;
  for (const faction of ["ally", "enemy"] as const) {
    for (const lane of LANE_IDS) {
      for (let slot = 0; slot < TANK_V2_AI.unitsPerLanePerWave; slot += 1) spawnUnit(world, faction, lane, slot);
    }
  }
  world.latestMessage = `ĐỢT ${world.waveIndex} · 9 ĐƠN VỊ MỖI PHE`;
  world.latestMessageRemaining = 2;
}

function addFloatingText(world: TankBattleV2World, point: Point, text: string, color: string): void {
  const fx: FloatingText = { id: world.nextFxId++, x: point.x, y: point.y, text, color, lifeRemaining: 1.15 };
  world.floatingTexts.push(fx);
  if (world.floatingTexts.length > 32) world.floatingTexts.shift();
}

function structureById(world: TankBattleV2World, id: string): StructureState | null {
  return world.structures.find((structure) => structure.id === id && structure.alive) || null;
}

function unitByTargetId(world: TankBattleV2World, targetId: string): UnitState | null {
  if (!targetId.startsWith("unit:")) return null;
  const id = Number(targetId.slice(5));
  return world.units.find((unit) => unit.id === id && unit.alive) || null;
}

function targetPoint(world: TankBattleV2World, id: string | null): { point: Point; kind: "player" | "unit" | "structure" } | null {
  if (!id) return null;
  if (id === "player") return world.player.alive ? { point: world.player, kind: "player" } : null;
  const unit = unitByTargetId(world, id);
  if (unit) return { point: unit, kind: "unit" };
  const structure = structureById(world, id);
  if (structure) return { point: structure, kind: "structure" };
  return null;
}

function obstacleCollision(point: Point, radius: number, terrain: TerrainState[]): boolean {
  return terrain.some((piece) => {
    if (!piece.alive) return false;
    const nearestX = clamp(point.x, piece.x - piece.width / 2, piece.x + piece.width / 2);
    const nearestY = clamp(point.y, piece.y - piece.height / 2, piece.y + piece.height / 2);
    return (point.x - nearestX) ** 2 + (point.y - nearestY) ** 2 < radius ** 2;
  });
}

function structureCollision(world: TankBattleV2World, point: Point, radius: number): boolean {
  return world.structures.some((structure) => structure.alive && distanceSquared(point, structure) < (radius + structure.radius + 2) ** 2);
}

function unitCollision(world: TankBattleV2World, point: Point, radius: number, ignoredId?: number): boolean {
  return world.units.some((unit) => unit.alive && unit.id !== ignoredId && distanceSquared(point, unit) < (radius + unit.radius - 1) ** 2);
}

function moveEntityCardinal(world: TankBattleV2World, entity: Point, radius: number, direction: CardinalDirection, amount: number, ignoredUnitId?: number): boolean {
  const vector = directionVector(direction);
  const candidate = clampToMap({ x: entity.x + vector.x * amount, y: entity.y + vector.y * amount }, radius);
  if (obstacleCollision(candidate, radius, world.terrain)) return false;
  if (ignoredUnitId === undefined && structureCollision(world, candidate, radius)) return false;
  if (unitCollision(world, candidate, radius, ignoredUnitId)) return false;
  entity.x = candidate.x;
  entity.y = candidate.y;
  return true;
}

function currentPlayerDef(player: PlayerState): number {
  return player.stats.def + (player.stationarySeconds >= player.coreRuntime.mobileFortressDelay && player.coreRuntime.mobileFortressDelay > 0
    ? player.coreRuntime.mobileFortressDef
    : 0);
}

function absorbPlayerDamage(player: PlayerState, incoming: number): number {
  let damage = incoming;
  if (player.temporaryShield > 0) {
    const absorbed = Math.min(player.temporaryShield, damage);
    player.temporaryShield -= absorbed;
    damage -= absorbed;
  }
  if (player.shield > 0 && damage > 0) {
    const absorbed = Math.min(player.shield, damage);
    player.shield -= absorbed;
    damage -= absorbed;
  }
  return damage;
}

function damagePlayer(world: TankBattleV2World, rawDamage: number): void {
  const player = world.player;
  if (!player.alive || player.spawnProtectionRemaining > 0) return;
  const physical = calculatePhysicalDamage(rawDamage, currentPlayerDef(player));
  const damage = absorbPlayerDamage(player, physical);
  player.hp = Math.max(0, player.hp - damage);
  world.metrics.damageTaken += damage;
  if (player.hp > 0 && !player.reactiveArmorUsedThisLife && player.coreRuntime.reactiveArmorShield > 0 && player.hp / player.stats.maxHp <= player.coreRuntime.reactiveArmorThreshold) {
    player.reactiveArmorUsedThisLife = true;
    player.temporaryShield += player.coreRuntime.reactiveArmorShield;
    player.temporaryShieldRemaining = Math.max(player.temporaryShieldRemaining, 3);
    addFloatingText(world, player, `+${player.coreRuntime.reactiveArmorShield} KHIÊN`, "#67e8f9");
  }
  if (player.hp > 0) return;
  player.alive = false;
  player.respawnRemaining = TANK_V2_PLAYER.respawnSeconds;
  player.boostRemaining = 0;
  player.temporaryShield = 0;
  player.temporaryShieldRemaining = 0;
  world.inputDirection = null;
  world.fireHeld = false;
  world.latestMessage = "BÁO THÉP BỊ HẠ · HỒI SINH 15 GIÂY";
  world.latestMessageRemaining = 2.5;
}

function grantKillSustain(world: TankBattleV2World): void {
  const player = world.player;
  if (player.coreRuntime.killHeal <= 0) return;
  if (player.hp < player.stats.maxHp) {
    const healed = Math.min(player.coreRuntime.killHeal, player.stats.maxHp - player.hp);
    player.hp += healed;
    addFloatingText(world, player, `+${Math.round(healed)} HP`, "#86efac");
  } else if (player.coreRuntime.regenerationShieldCap > 0) {
    player.shield = Math.min(player.coreRuntime.regenerationShieldCap, player.shield + player.coreRuntime.killHeal);
    addFloatingText(world, player, `+${player.coreRuntime.killHeal} KHIÊN`, "#67e8f9");
  }
}

function grantCombatXp(world: TankBattleV2World, amount: number, point: Point): void {
  const levels = applyCombatXp(world.player, amount);
  addFloatingText(world, point, `+${amount} XP`, "#fde047");
  for (const level of levels) {
    world.pendingCoreSelections += 1;
    world.latestMessage = `LÊN CẤP · CẤP ${level}${(TANK_V2_XP.coreLevels as readonly number[]).includes(level) ? " · LÕI SẴN SÀNG" : ""}`;
    world.latestMessageRemaining = 2;
  }
}

function damageUnit(world: TankBattleV2World, unit: UnitState, rawDamage: number, sourceFaction: Faction, fromPlayer: boolean): void {
  if (!unit.alive) return;
  const effectiveDef = unit.def - unit.armorShred;
  const damage = calculatePhysicalDamage(rawDamage, effectiveDef);
  unit.hp = Math.max(0, unit.hp - damage);
  if (fromPlayer) {
    unit.lastPlayerDamageAt = world.elapsedSeconds;
    world.metrics.damageDealt += damage;
  }
  if (unit.hp > 0) return;
  unit.alive = false;
  unit.state = "dead";
  if (unit.faction === "enemy") {
    world.metrics.enemiesDefeated += 1;
    const participated = world.elapsedSeconds - unit.lastPlayerDamageAt <= TANK_V2_XP.assistWindowSeconds;
    if (fromPlayer) {
      grantCombatXp(world, TANK_V2_XP.kill, unit);
      grantKillSustain(world);
    } else if (participated) {
      grantCombatXp(world, TANK_V2_XP.assist, unit);
    }
  }
}

function destroyStructure(world: TankBattleV2World, structure: StructureState): void {
  structure.alive = false;
  structure.hp = 0;
  if (structure.kind === "tower") {
    world.metrics.towersDestroyed += structure.faction === "enemy" ? 1 : 0;
    if (structure.faction === "enemy" && world.elapsedSeconds - structure.lastPlayerDamageAt <= TANK_V2_XP.assistWindowSeconds) {
      grantCombatXp(world, TANK_V2_XP.tower, structure);
    }
    const laneLabel = structure.lane === "top" ? "TRÊN" : structure.lane === "mid" ? "GIỮA" : "DƯỚI";
    world.latestMessage = `${structure.faction === "enemy" ? "ĐỊCH" : "ĐỒNG MINH"} · LÀN ${laneLabel} · T${structure.tier} ĐÃ BỊ PHÁ`;
    world.latestMessageRemaining = 2.2;
  } else if (structure.faction === "enemy") {
    world.phase = "victory";
    world.latestMessage = "SỞ CHỈ HUY ĐỊCH ĐÃ BỊ PHÁ · CHIẾN THẮNG";
    world.latestMessageRemaining = 99;
  } else {
    world.phase = "defeat";
    world.latestMessage = "SỞ CHỈ HUY PHE TA ĐÃ BỊ PHÁ · THẤT BẠI";
    world.latestMessageRemaining = 99;
  }
  updateStructureImmunity(world.structures);
}

function damageStructure(world: TankBattleV2World, structure: StructureState, rawDamage: number, fromPlayer: boolean): void {
  if (!structure.alive) return;
  if (structure.immune) {
    if (fromPlayer) addFloatingText(world, structure, "MIỄN NHIỄM", "#67e8f9");
    return;
  }
  const bonus = structureDamageMultiplier(world.elapsedSeconds);
  const damage = calculatePhysicalDamage(rawDamage * bonus, structure.def);
  structure.hp = Math.max(0, structure.hp - damage);
  structure.hitFlash = 0.14;
  if (fromPlayer) {
    structure.lastPlayerDamageAt = world.elapsedSeconds;
    world.metrics.damageDealt += damage;
    if (structure.faction === "enemy") {
      structure.targetId = "player";
      structure.targetLockRemaining = 1.5;
    }
  }
  if (structure.faction === "ally" && structure.kind === "hq") {
    world.metrics.hqDamageTaken += damage;
    world.latestMessage = "SỞ CHỈ HUY ĐANG BỊ TẤN CÔNG";
    world.latestMessageRemaining = 1.2;
  }
  if (structure.hp <= 0) destroyStructure(world, structure);
}

function damageTerrain(world: TankBattleV2World, terrain: TerrainState, rawDamage: number, fromPlayer: boolean): void {
  if (!terrain.alive || terrain.kind === "steel") return;
  terrain.hp -= rawDamage;
  if (terrain.hp > 0) return;
  terrain.alive = false;
  if (fromPlayer) world.metrics.wallsDestroyedByPlayer += 1;
  else world.metrics.wallsDestroyedByEnemy += 1;
}

function spawnProjectile(
  world: TankBattleV2World,
  faction: Faction,
  ownerKind: ProjectileState["ownerKind"],
  ownerId: string | number,
  origin: Point,
  direction: CardinalDirection,
  rawDamage: number,
  speed: number,
  options: Partial<Pick<ProjectileState, "pierceRemaining" | "explosiveDamage" | "explosiveRadius" | "structureBonusDamage" | "armorShred" | "armorShredSeconds">> = {}
): void {
  const vector = directionVector(direction);
  world.projectiles.push({
    id: world.nextEntityId++, faction, ownerKind, ownerId, x: origin.x, y: origin.y,
    velocityX: vector.x * speed, velocityY: vector.y * speed,
    radius: ownerKind === "player" ? 4.5 : 4, rawDamage, lifeRemaining: 3.2,
    pierceRemaining: options.pierceRemaining ?? 0,
    explosiveDamage: options.explosiveDamage ?? 0,
    explosiveRadius: options.explosiveRadius ?? 0,
    structureBonusDamage: options.structureBonusDamage ?? 0,
    armorShred: options.armorShred ?? 0,
    armorShredSeconds: options.armorShredSeconds ?? 0,
  });
  if (world.projectiles.length > 180) world.projectiles.splice(0, world.projectiles.length - 180);
}

function firePlayer(world: TankBattleV2World): boolean {
  const player = world.player;
  if (!player.alive || player.fireRemaining > 0 || world.phase !== "playing") return false;
  player.spawnProtectionRemaining = 0;
  const direction = player.direction;
  const vector = directionVector(direction);
  const origin = { x: player.x + vector.x * 24, y: player.y + vector.y * 24 };
  const cooldownMultiplier = player.rapidPowerRemaining > 0 ? 0.72 : 1;
  player.fireRemaining = player.stats.fireCooldown * cooldownMultiplier;
  player.shotCounter += 1;
  world.metrics.cannonShots += 1;
  const options = {
    pierceRemaining: player.coreRuntime.projectilePierce,
    explosiveDamage: player.coreRuntime.explosiveDamage,
    explosiveRadius: player.coreRuntime.explosiveRadius,
    structureBonusDamage: player.coreRuntime.structureBonusDamage,
    armorShred: player.coreRuntime.armorShred,
    armorShredSeconds: player.coreRuntime.armorShredSeconds,
  };
  spawnProjectile(world, "ally", "player", "player", origin, direction, player.stats.atk, player.stats.projectileSpeed, options);
  if (player.coreRuntime.doubleShotEvery > 0 && player.shotCounter % player.coreRuntime.doubleShotEvery === 0) {
    const sideDirection: CardinalDirection = direction === "left" || direction === "right" ? "up" : "right";
    const side = directionVector(sideDirection);
    spawnProjectile(world, "ally", "player", "player", { x: origin.x + side.x * 9, y: origin.y + side.y * 9 }, direction, player.stats.atk * 0.72, player.stats.projectileSpeed, options);
  }
  return true;
}

export function activateTankV2Boost(world: TankBattleV2World): boolean {
  const player = world.player;
  if (!player.alive || world.phase !== "playing" || player.boostCharges <= 0) return false;
  player.boostCharges -= 1;
  player.boostRemaining = TANK_V2_PLAYER.boostDuration + player.coreRuntime.boostDurationBonus;
  if (player.coreRuntime.boostShield > 0) {
    player.temporaryShield += player.coreRuntime.boostShield;
    player.temporaryShieldRemaining = Math.max(player.temporaryShieldRemaining, 2.5);
  }
  const cooldown = Math.max(7, TANK_V2_PLAYER.boostCooldown - player.coreRuntime.boostCooldownReduction);
  player.boostRechargeQueue.push(cooldown);
  player.boostCooldownRemaining = Math.min(...player.boostRechargeQueue);
  return true;
}

function updateBoost(player: PlayerState, delta: number): void {
  player.boostRemaining = Math.max(0, player.boostRemaining - delta);
  for (let i = 0; i < player.boostRechargeQueue.length; i += 1) player.boostRechargeQueue[i] -= delta;
  const ready = player.boostRechargeQueue.filter((remaining) => remaining <= 0).length;
  if (ready > 0) {
    player.boostCharges = Math.min(player.coreRuntime.overdriveCharges, player.boostCharges + ready);
    player.boostRechargeQueue = player.boostRechargeQueue.filter((remaining) => remaining > 0);
  }
  player.boostCooldownRemaining = player.boostRechargeQueue.length > 0 ? Math.max(0, Math.min(...player.boostRechargeQueue)) : 0;
}

function updatePlayer(world: TankBattleV2World, delta: number): void {
  const player = world.player;
  if (!player.alive) {
    player.respawnRemaining = Math.max(0, player.respawnRemaining - delta);
    if (player.respawnRemaining <= 0) {
      player.alive = true;
      player.x = PLAYER_HQ.x + 52;
      player.y = PLAYER_HQ.y;
      player.direction = "right";
      player.hp = player.stats.maxHp;
      player.shield = 0;
      player.temporaryShield = 0;
      player.temporaryShieldRemaining = 0;
      player.spawnProtectionRemaining = TANK_V2_PLAYER.spawnProtectionSeconds;
      player.reactiveArmorUsedThisLife = false;
      player.boostCharges = player.coreRuntime.overdriveCharges;
      player.boostRechargeQueue = [];
      world.latestMessage = "HỒI SINH · 2 GIÂY BẢO HỘ";
      world.latestMessageRemaining = 1.8;
    }
    return;
  }
  player.fireRemaining = Math.max(0, player.fireRemaining - delta);
  player.spawnProtectionRemaining = Math.max(0, player.spawnProtectionRemaining - delta);
  player.speedPowerRemaining = Math.max(0, player.speedPowerRemaining - delta);
  player.rapidPowerRemaining = Math.max(0, player.rapidPowerRemaining - delta);
  if (player.temporaryShieldRemaining > 0) {
    player.temporaryShieldRemaining = Math.max(0, player.temporaryShieldRemaining - delta);
    if (player.temporaryShieldRemaining <= 0) player.temporaryShield = 0;
  }
  updateBoost(player, delta);
  if (world.fireHeld) firePlayer(world);
  if (!world.inputDirection) {
    player.stationarySeconds += delta;
    return;
  }
  player.stationarySeconds = 0;
  player.direction = world.inputDirection;
  const speed = player.stats.moveSpeed * (player.boostRemaining > 0 ? TANK_V2_PLAYER.boostSpeedMultiplier : 1) * (player.speedPowerRemaining > 0 ? 1.3 : 1);
  moveEntityCardinal(world, player, player.radius, world.inputDirection, speed * delta);
}

function validLockedTarget(world: TankBattleV2World, unit: UnitState): boolean {
  const target = targetPoint(world, unit.targetId);
  return !!target && distance(unit, target.point) <= unit.visionRange && hasLineOfSight(unit, target.point, world.terrain);
}

function acquireUnitTarget(world: TankBattleV2World, unit: UnitState): string | null {
  let bestId: string | null = null;
  let bestScore = -Infinity;
  const enemyFaction: Faction = unit.faction === "ally" ? "enemy" : "ally";
  if (unit.faction === "enemy" && world.player.alive && distance(unit, world.player) <= unit.visionRange && hasLineOfSight(unit, world.player, world.terrain)) {
    bestId = "player";
    bestScore = unitTargetScore(unit, { kind: "player", point: world.player, playerThreat: world.elapsedSeconds - unit.lastPlayerDamageAt <= 4 });
  }
  for (const candidate of world.units) {
    if (!candidate.alive || candidate.faction !== enemyFaction || distance(unit, candidate) > unit.visionRange) continue;
    if (!hasLineOfSight(unit, candidate, world.terrain)) continue;
    const score = unitTargetScore(unit, { kind: "unit", point: candidate });
    if (score > bestScore) { bestScore = score; bestId = `unit:${candidate.id}`; }
  }
  for (const structure of world.structures) {
    if (!structure.alive || structure.immune || structure.faction !== enemyFaction || distance(unit, structure) > unit.visionRange) continue;
    if (!hasLineOfSight(unit, structure, world.terrain)) continue;
    const score = unitTargetScore(unit, { kind: structure.kind === "tower" ? "tower" : "hq", point: structure });
    if (score > bestScore) { bestScore = score; bestId = structure.id; }
  }
  return bestId;
}

function formationWaypoint(unit: UnitState, point: Point): Point {
  return { x: point.x, y: point.y + (unit.formationSlot - 1) * 34 };
}

function laneProgressTarget(unit: UnitState): Point {
  const waypoints = makeLaneWaypoints(unit.lane, unit.faction);
  return formationWaypoint(unit, waypoints[Math.min(unit.waypointIndex, waypoints.length - 1)]);
}

function advanceWaypoint(unit: UnitState): void {
  const waypoints = makeLaneWaypoints(unit.lane, unit.faction);
  const active = formationWaypoint(unit, waypoints[Math.min(unit.waypointIndex, waypoints.length - 1)]);
  if (distance(unit, active) < 24) unit.waypointIndex = Math.min(waypoints.length - 1, unit.waypointIndex + 1);
}

function repositionToLane(unit: UnitState): Point {
  return { x: unit.x, y: LANE_Y[unit.lane] + (unit.formationSlot - 1) * 34 };
}

function fireUnitAt(world: TankBattleV2World, unit: UnitState, point: Point): void {
  const direction = moveCardinalToward(unit, point);
  unit.direction = direction;
  const vector = directionVector(direction);
  spawnProjectile(world, unit.faction, "unit", unit.id, { x: unit.x + vector.x * (unit.radius + 8), y: unit.y + vector.y * (unit.radius + 8) }, direction, unit.atk, TANK_V2_AI.projectileSpeed);
  unit.fireRemaining = unit.fireCooldown;
}

function updateUnit(world: TankBattleV2World, unit: UnitState, delta: number): void {
  if (!unit.alive) return;
  unit.fireRemaining = Math.max(0, unit.fireRemaining - delta);
  unit.armorShredRemaining = Math.max(0, unit.armorShredRemaining - delta);
  if (unit.armorShredRemaining <= 0) unit.armorShred = 0;
  unit.senseRemaining -= delta;
  if (unit.senseRemaining <= 0) {
    unit.senseRemaining = TANK_V2_AI.senseIntervalMin + world.random() * (TANK_V2_AI.senseIntervalMax - TANK_V2_AI.senseIntervalMin);
    if (!validLockedTarget(world, unit)) {
      unit.targetId = acquireUnitTarget(world, unit);
      if (unit.targetId) {
        unit.chaseOrigin = { x: unit.x, y: unit.y };
        unit.state = "chase";
      } else if (unit.state !== "advance") unit.state = "return";
    } else if (unit.faction === "enemy" && world.player.alive && unit.targetId !== "player") {
      const playerNear = distance(unit, world.player) <= unit.visionRange * 0.82 && hasLineOfSight(unit, world.player, world.terrain);
      if (playerNear) unit.targetId = "player";
    }
  }

  const target = targetPoint(world, unit.targetId);
  if (target) {
    const targetDistance = distance(unit, target.point);
    const tetherExceeded = !!unit.chaseOrigin && distance(unit, unit.chaseOrigin) > unit.visionRange * TANK_V2_AI.chaseTetherMultiplier;
    if (tetherExceeded) {
      unit.targetId = null;
      unit.state = "return";
    } else if (targetDistance <= unit.attackRange && hasLineOfSight(unit, target.point, world.terrain)) {
      unit.state = "attack";
      if (unit.fireRemaining <= 0) fireUnitAt(world, unit, target.point);
      return;
    } else {
      unit.state = "chase";
      const direction = moveCardinalToward(unit, target.point);
      unit.direction = direction;
      moveEntityCardinal(world, unit, unit.radius, direction, unit.moveSpeed * delta, unit.id);
      return;
    }
  }

  if (unit.state === "return") {
    const returnPoint = repositionToLane(unit);
    if (Math.abs(unit.y - returnPoint.y) > 10) {
      const direction = unit.y < returnPoint.y ? "down" : "up";
      unit.direction = direction;
      moveEntityCardinal(world, unit, unit.radius, direction, unit.moveSpeed * delta, unit.id);
      return;
    }
    unit.state = "advance";
    unit.chaseOrigin = null;
  }

  advanceWaypoint(unit);
  const goal = laneProgressTarget(unit);
  const direction = moveCardinalToward(unit, goal);
  unit.direction = direction;
  moveEntityCardinal(world, unit, unit.radius, direction, unit.moveSpeed * delta, unit.id);
}

function pickStructureTarget(world: TankBattleV2World, structure: StructureState): string | null {
  const enemyFaction: Faction = structure.faction === "ally" ? "enemy" : "ally";
  let best: { id: string; d: number } | null = null;
  if (structure.faction === "enemy" && world.player.alive && distance(structure, world.player) <= structure.attackRange && hasLineOfSight(structure, world.player, world.terrain)) {
    best = { id: "player", d: distance(structure, world.player) - 50 };
  }
  for (const unit of world.units) {
    if (!unit.alive || unit.faction !== enemyFaction) continue;
    const d = distance(structure, unit);
    if (d > structure.attackRange || !hasLineOfSight(structure, unit, world.terrain)) continue;
    if (!best || d < best.d) best = { id: `unit:${unit.id}`, d };
  }
  return best?.id || null;
}

function fireStructureAt(world: TankBattleV2World, structure: StructureState, target: Point): void {
  const direction = moveCardinalToward(structure, target);
  const vector = directionVector(direction);
  spawnProjectile(world, structure.faction, structure.kind, structure.id, { x: structure.x + vector.x * (structure.radius + 7), y: structure.y + vector.y * (structure.radius + 7) }, direction, structure.atk, 280);
  structure.fireRemaining = structure.fireCooldown;
}

function updateStructures(world: TankBattleV2World, delta: number): void {
  for (const structure of world.structures) {
    if (!structure.alive) continue;
    structure.hitFlash = Math.max(0, structure.hitFlash - delta);
    structure.fireRemaining = Math.max(0, structure.fireRemaining - delta);
    structure.targetLockRemaining = Math.max(0, structure.targetLockRemaining - delta);
    let target = targetPoint(world, structure.targetId);
    if (!target || distance(structure, target.point) > structure.attackRange || !hasLineOfSight(structure, target.point, world.terrain) || structure.targetLockRemaining <= 0) {
      structure.targetId = pickStructureTarget(world, structure);
      structure.targetLockRemaining = 0.65;
      target = targetPoint(world, structure.targetId);
    }
    if (target && structure.fireRemaining <= 0) fireStructureAt(world, structure, target.point);
  }
}

function applyExplosion(world: TankBattleV2World, projectile: ProjectileState, point: Point): void {
  if (projectile.explosiveDamage <= 0 || projectile.explosiveRadius <= 0 || projectile.faction !== "ally") return;
  for (const unit of world.units) {
    if (!unit.alive || unit.faction !== "enemy" || distance(unit, point) > projectile.explosiveRadius + unit.radius) continue;
    damageUnit(world, unit, projectile.explosiveDamage, "ally", projectile.ownerKind === "player");
  }
  addFloatingText(world, point, "BOOM", "#fb923c");
}

function projectileOutsideMap(projectile: ProjectileState): boolean {
  return projectile.x < -20 || projectile.y < -20 || projectile.x > TANK_V2_MAP.width + 20 || projectile.y > TANK_V2_MAP.height + 20;
}

function updateProjectiles(world: TankBattleV2World, delta: number): void {
  const survivors: ProjectileState[] = [];
  for (const projectile of world.projectiles) {
    projectile.lifeRemaining -= delta;
    projectile.x += projectile.velocityX * delta;
    projectile.y += projectile.velocityY * delta;
    if (projectile.lifeRemaining <= 0 || projectileOutsideMap(projectile)) continue;
    const terrain = world.terrain.find((piece) => piece.alive && obstacleCollision(projectile, projectile.radius, [piece]));
    if (terrain) {
      damageTerrain(world, terrain, projectile.rawDamage, projectile.ownerKind === "player");
      continue;
    }
    const enemyFaction: Faction = projectile.faction === "ally" ? "enemy" : "ally";
    if (enemyFaction === "ally" && world.player.alive && distanceSquared(projectile, world.player) <= (projectile.radius + world.player.radius) ** 2) {
      damagePlayer(world, projectile.rawDamage);
      continue;
    }
    const unit = world.units.find((candidate) => candidate.alive && candidate.faction === enemyFaction && distanceSquared(projectile, candidate) <= (projectile.radius + candidate.radius) ** 2);
    if (unit) {
      damageUnit(world, unit, projectile.rawDamage, projectile.faction, projectile.ownerKind === "player");
      if (projectile.ownerKind === "player") world.metrics.cannonHits += 1;
      if (projectile.armorShred > 0 && unit.alive) {
        unit.armorShred = projectile.armorShred;
        unit.armorShredRemaining = projectile.armorShredSeconds;
      }
      applyExplosion(world, projectile, unit);
      if (projectile.pierceRemaining > 0) {
        projectile.pierceRemaining -= 1;
        projectile.rawDamage *= 0.65;
        survivors.push(projectile);
      }
      continue;
    }
    const structure = world.structures.find((candidate) => candidate.alive && candidate.faction === enemyFaction && distanceSquared(projectile, candidate) <= (projectile.radius + candidate.radius) ** 2);
    if (structure) {
      damageStructure(world, structure, projectile.rawDamage + projectile.structureBonusDamage, projectile.ownerKind === "player");
      if (projectile.ownerKind === "player") world.metrics.cannonHits += 1;
      continue;
    }
    survivors.push(projectile);
  }
  world.projectiles = survivors;
}

function updatePowerUps(world: TankBattleV2World, delta: number): void {
  for (const power of world.powerUps) {
    if (!power.active) {
      power.respawnRemaining -= delta;
      if (power.respawnRemaining <= 0) {
        const kinds: PowerUpKind[] = ["heal", "speed", "rapid"];
        power.kind = kinds[Math.floor(world.random() * kinds.length)] || "heal";
        power.active = true;
      }
      continue;
    }
    if (!world.player.alive || distanceSquared(power, world.player) > (world.player.radius + 14) ** 2) continue;
    if (power.kind === "heal") world.player.hp = Math.min(world.player.stats.maxHp, world.player.hp + world.player.stats.maxHp * 0.28);
    if (power.kind === "speed") world.player.speedPowerRemaining = 5.5;
    if (power.kind === "rapid") world.player.rapidPowerRemaining = 5.5;
    addFloatingText(world, power, power.kind === "heal" ? "HEAL" : power.kind === "speed" ? "SPEED" : "RAPID FIRE", "#86efac");
    power.active = false;
    power.respawnRemaining = 24;
  }
}

function updateCamera(world: TankBattleV2World, delta: number): void {
  const focus = world.player.alive ? world.player : PLAYER_HQ;
  const viewportW = TANK_V2_VIEWPORT.width;
  const viewportH = TANK_V2_VIEWPORT.height;
  const screenX = focus.x - world.camera.x;
  const screenY = focus.y - world.camera.y;
  let targetX = world.camera.x;
  let targetY = world.camera.y;
  const centerX = viewportW / 2;
  const centerY = viewportH / 2;
  if (screenX < centerX - TANK_V2_MAP.cameraDeadZoneX) targetX = focus.x - (centerX - TANK_V2_MAP.cameraDeadZoneX);
  if (screenX > centerX + TANK_V2_MAP.cameraDeadZoneX) targetX = focus.x - (centerX + TANK_V2_MAP.cameraDeadZoneX);
  if (screenY < centerY - TANK_V2_MAP.cameraDeadZoneY) targetY = focus.y - (centerY - TANK_V2_MAP.cameraDeadZoneY);
  if (screenY > centerY + TANK_V2_MAP.cameraDeadZoneY) targetY = focus.y - (centerY + TANK_V2_MAP.cameraDeadZoneY);
  targetX = clamp(targetX, 0, TANK_V2_MAP.width - viewportW);
  targetY = clamp(targetY, 0, TANK_V2_MAP.height - viewportH);
  const blend = 1 - Math.exp(-TANK_V2_MAP.cameraSmoothing * delta);
  world.camera.x += (targetX - world.camera.x) * blend;
  world.camera.y += (targetY - world.camera.y) * blend;
}

function updateFloatingTexts(world: TankBattleV2World, delta: number): void {
  for (const text of world.floatingTexts) {
    text.lifeRemaining -= delta;
    text.y -= 18 * delta;
  }
  world.floatingTexts = world.floatingTexts.filter((text) => text.lifeRemaining > 0);
}

function maybeOpenCoreSelection(world: TankBattleV2World): void {
  if (world.phase !== "playing" || world.pendingCoreSelections <= 0 || world.coreChoice) return;
  world.coreChoice = createCoreChoice(world.player, world.random);
  world.phase = "core";
}

export function chooseTankV2Core(world: TankBattleV2World, core: CoreDefinition): boolean {
  if (world.phase !== "core" || !world.coreChoice?.choices.some((choice) => choice.id === core.id)) return false;
  applyCore(world.player, core);
  world.pendingCoreSelections = Math.max(0, world.pendingCoreSelections - 1);
  world.coreChoice = null;
  world.phase = "playing";
  world.latestMessage = `${core.name.toUpperCase()} · ĐÃ NHẬN LÕI`;
  world.latestMessageRemaining = 1.8;
  maybeOpenCoreSelection(world);
  return true;
}

export function updateTankBattleV2World(world: TankBattleV2World, deltaSeconds: number): void {
  if (world.phase !== "playing" || deltaSeconds <= 0) return;
  const delta = Math.min(1 / 30, deltaSeconds);
  world.elapsedSeconds += delta;
  if (world.elapsedSeconds >= 720) world.siegeTier = 2;
  else if (world.elapsedSeconds >= 600) world.siegeTier = 1;
  if (world.siegeTier === 1 && world.elapsedSeconds - delta < 600) {
    world.latestMessage = "GIAI ĐOẠN CÔNG THÀNH · +20% SÁT THƯƠNG CÔNG TRÌNH";
    world.latestMessageRemaining = 3;
  }
  if (world.siegeTier === 2 && world.elapsedSeconds - delta < 720) {
    world.latestMessage = "CÔNG THÀNH CUỐI · +40% SÁT THƯƠNG CÔNG TRÌNH";
    world.latestMessageRemaining = 3;
  }
  if (world.elapsedSeconds >= world.nextWaveAt) {
    spawnWave(world);
    world.nextWaveAt += TANK_V2_AI.spawnIntervalSeconds;
  }
  world.latestMessageRemaining = Math.max(0, world.latestMessageRemaining - delta);
  if (world.latestMessageRemaining <= 0) world.latestMessage = null;
  updatePlayer(world, delta);
  for (const unit of world.units) updateUnit(world, unit, delta);
  updateStructures(world, delta);
  updateProjectiles(world, delta);
  updatePowerUps(world, delta);
  updateFloatingTexts(world, delta);
  updateCamera(world, delta);
  world.units = world.units.filter((unit) => unit.alive || world.elapsedSeconds - unit.lastPlayerDamageAt < 0.5);
  maybeOpenCoreSelection(world);
}

export function makeTankV2Hud(world: TankBattleV2World): TankBattleV2Hud {
  const allyHq = world.structures.find((structure) => structure.id === "ally-hq")!;
  const enemyHq = world.structures.find((structure) => structure.id === "enemy-hq")!;
  return {
    phase: world.phase, elapsedSeconds: world.elapsedSeconds, waveIndex: world.waveIndex, siegeTier: world.siegeTier,
    playerHp: world.player.hp, playerMaxHp: world.player.stats.maxHp, shield: world.player.shield + world.player.temporaryShield,
    level: world.player.level, xp: world.player.xp, xpRequired: xpNeededForLevel(world.player.level),
    selectedCoreIds: [...world.player.selectedCoreIds], respawnRemaining: world.player.respawnRemaining,
    boostRemaining: world.player.boostRemaining, boostCooldownRemaining: world.player.boostCooldownRemaining, boostCharges: world.player.boostCharges,
    playerHqHp: allyHq.hp, playerHqMaxHp: allyHq.maxHp, enemyHqHp: enemyHq.hp, enemyHqMaxHp: enemyHq.maxHp,
    latestMessage: world.latestMessage,
  };
}

function rankFromScore(score: number, victory: boolean): TankBattleRunSummary["rank"] {
  if (victory && score >= 12500) return "SS";
  if (victory && score >= 8500) return "S";
  if (score >= 6000) return "A";
  if (score >= 3000) return "B";
  return "C";
}

export function summarizeTankBattleV2(world: TankBattleV2World): TankBattleRunSummary {
  const victory = world.phase === "victory";
  const allyHq = world.structures.find((structure) => structure.id === "ally-hq")!;
  const accuracy = world.metrics.cannonShots > 0 ? world.metrics.cannonHits / world.metrics.cannonShots : 0;
  const score = Math.round(world.metrics.enemiesDefeated * 70 + world.metrics.towersDestroyed * 650 + world.player.level * 120 + (victory ? 3000 : 0) + Math.max(0, allyHq.hp) * 0.2);
  return {
    victory, defeatReason: victory ? null : "hq", score, rank: rankFromScore(score, victory),
    enemiesDefeated: world.metrics.enemiesDefeated, elitesDefeated: 0,
    cannonShots: world.metrics.cannonShots, cannonHits: world.metrics.cannonHits, cannonAccuracy: accuracy,
    mineKills: 0, damageDealt: world.metrics.damageDealt, damageTaken: world.metrics.damageTaken,
    hqDamageTaken: world.metrics.hqDamageTaken, hqHpRemaining: allyHq.hp, hqMaxHp: allyHq.maxHp,
    wallsDestroyedByPlayer: world.metrics.wallsDestroyedByPlayer, wallsDestroyedByEnemy: world.metrics.wallsDestroyedByEnemy,
    runSeconds: world.elapsedSeconds, bossClearSeconds: null, upgrades: [],
  };
}

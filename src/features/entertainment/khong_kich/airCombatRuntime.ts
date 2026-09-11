import {
  AIR_COMBAT_WORLD,
  ENEMY_ARCHETYPES,
  ENEMY_CONFIGS,
  GAMEPLAY_SAFE_RECT,
  SKILL_CONFIGS,
} from "./airCombatConfig";
import {
  applyCore,
  applyDamageToAircraft,
  resolvePlayerDamage,
  calculateRunRank,
  canAcquirePlayerTarget,
  castSkill,
  clampCircleToGameplayRect,
  createAircraftCombatState,
  gainCombatXp,
  generateCoreChoices,
  getComboMultiplier,
  getEffectiveAircraftStats,
  getEnemyScaling,
  getSkillRuntimeValues,
  getTargetPriority,
  getWaveLabel,
  getWaveNumber,
  requiredCombatXp,
  resolveBasicProjectileMultipliers,
  shouldAutoFire,
  tickAircraftState,
} from "./airCombatEngine";
import {
  AirCombatHudSnapshot,
  AirCombatRunSummary,
  AircraftCombatState,
  AircraftId,
  CoreCard,
  EnemyType,
  SkillCastResult,
  SkillId,
} from "./airCombatTypes";

export interface EnemyEntity {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  baseX: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  armor: number;
  age: number;
  fireCooldown: number;
  phaseSeed: number;
  wave: number;
  dashCharge: number;
}

export interface ProjectileEntity {
  id: number;
  owner: "player" | "enemy" | "drone";
  /** Presentation metadata only; collision and damage never consult this field. */
  appearance?: "dangerous" | "boss";
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rawDamage: number;
  homing: boolean;
  targetId: number | null;
  turnRate: number;
  penetrationRemaining: number;
  penetrationMultiplier: number;
  splashMultiplier: number;
  bounceRemaining: number;
  bounceMultiplier: number;
  hitIds: number[];
  color: string;
}

export interface DecoyEntity {
  id: number;
  x: number;
  y: number;
  radius: number;
  remaining: number;
}

export interface WarningZone {
  id: number;
  kind: "enemy_bomb" | "elite_lock" | "boss_strike" | "player_bomb";
  x: number;
  y: number;
  radius: number;
  remaining: number;
  totalDuration: number;
  rawDamage: number;
  owner: "player" | "enemy";
}

export interface ParticleEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface RuntimePools {
  enemies: EnemyEntity[];
  projectiles: ProjectileEntity[];
  particles: ParticleEntity[];
}

interface VisualEventBase {
  id: number;
  x: number;
  y: number;
  size: number;
  entityId?: number;
  boss?: boolean;
}

export interface DamageNumberEvent extends VisualEventBase {
  kind: "damage_number";
  amount: number;
  target: "player" | "enemy";
  critical: boolean;
  shielded: boolean;
}

export type CombatVisualEvent = DamageNumberEvent | (VisualEventBase & {
  kind: "hit" | "explosion" | "bomb" | "player_hit";
});
type NewVisualEvent = CombatVisualEvent extends infer E ? E extends CombatVisualEvent ? Omit<E, "id"> : never : never;

function emitVisual(world: CombatWorld, event: NewVisualEvent): void {
  world.visualEvents.push({ ...event, id: world.nextVisualId++ });
  if (world.visualEvents.length > 96) world.visualEvents.shift();
}

export interface CombatWorld {
  aircraft: AircraftCombatState;
  playerX: number;
  playerY: number;
  visualEvents: CombatVisualEvent[];
  nextVisualId: number;
  playerInputActive: boolean;
  playerRadius: number;
  playerInvulnerability: number;
  droneX: number;
  droneY: number;
  droneTargetId: number | null;
  droneOrbitAngle: number;
  elapsed: number;
  score: number;
  comboKills: number;
  comboTimer: number;
  maxCombo: number;
  enemiesDefeated: number;
  elitesDefeated: number;
  damageDealt: number;
  damageTaken: number;
  hitsReceived: number;
  bossSpawned: boolean;
  bossDefeated: boolean;
  bossStartedAt: number | null;
  bossClearSeconds: number | null;
  bossPhase: number;
  guardsSpawned: boolean;
  eliteSpawns: [boolean, boolean];
  enemySpawnCooldown: number;
  playerFireCooldown: number;
  droneFireCooldown: number;
  missilesPending: number;
  missileLaunchIndex: number;
  missileSalvoTotal: number;
  missileLaunchCooldown: number;
  laserCharge: number;
  laserRemaining: number;
  laserTickCooldown: number;
  nextId: number;
  scroll: number;
  enemies: EnemyEntity[];
  projectiles: ProjectileEntity[];
  decoys: DecoyEntity[];
  warnings: WarningZone[];
  particles: ParticleEntity[];
  pendingCoreSelections: number;
  coreSelectionCount: number;
  currentCoreChoices: CoreCard[] | null;
  latestMessage: string | null;
  messageUntil: number;
  ended: boolean;
  pools: RuntimePools;
  random: () => number;
  visualRandom: () => number;
}

const PLAYER_TARGET_ID = 0;

function circleHit(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number
): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const radius = ar + br;
  return dx * dx + dy * dy <= radius * radius;
}

function setMessage(world: CombatWorld, message: string, seconds = 1.6): void {
  world.latestMessage = message;
  world.messageUntil = world.elapsed + seconds;
}

export function createCombatWorld(
  aircraftId: AircraftId,
  random: () => number = Math.random
): CombatWorld {
  // Separate deterministic stream: visual density must never consume combat rolls.
  let visualSeed = 0x41c6ce57;
  const visualRandom = () => {
    visualSeed = (Math.imul(visualSeed, 1664525) + 1013904223) >>> 0;
    return visualSeed / 0x100000000;
  };
  const initial = clampCircleToGameplayRect(
    AIR_COMBAT_WORLD.width / 2,
    GAMEPLAY_SAFE_RECT.bottom - 52,
    10
  );
  const droneInitial = clampCircleToGameplayRect(initial.x - 28, initial.y + 8, 9);
  return {
    aircraft: createAircraftCombatState(aircraftId),
    playerX: initial.x,
    playerY: initial.y,
    visualEvents: [],
    nextVisualId: 1,
    playerInputActive: false,
    playerRadius: 9,
    playerInvulnerability: 0,
    droneX: droneInitial.x,
    droneY: droneInitial.y,
    droneTargetId: null,
    droneOrbitAngle: 0,
    elapsed: 0,
    score: 0,
    comboKills: 0,
    comboTimer: 0,
    maxCombo: 0,
    enemiesDefeated: 0,
    elitesDefeated: 0,
    damageDealt: 0,
    damageTaken: 0,
    hitsReceived: 0,
    bossSpawned: false,
    bossDefeated: false,
    bossStartedAt: null,
    bossClearSeconds: null,
    bossPhase: 0,
    guardsSpawned: false,
    eliteSpawns: [false, false],
    enemySpawnCooldown: 0.55,
    playerFireCooldown: 0,
    droneFireCooldown: 0,
    missilesPending: 0,
    missileLaunchIndex: 0,
    missileSalvoTotal: 0,
    missileLaunchCooldown: 0,
    laserCharge: 0,
    laserRemaining: 0,
    laserTickCooldown: 0,
    nextId: 1,
    scroll: 0,
    enemies: [],
    projectiles: [],
    decoys: [],
    warnings: [],
    particles: [],
    pendingCoreSelections: 0,
    coreSelectionCount: 0,
    currentCoreChoices: null,
    latestMessage: "ĐỢT 1",
    messageUntil: 1.5,
    ended: false,
    pools: { enemies: [], projectiles: [], particles: [] },
    random,
    visualRandom,
  };
}

function acquireEnemy(world: CombatWorld): EnemyEntity {
  return world.pools.enemies.pop() || {
    id: 0,
    type: "scout",
    x: 0,
    y: 0,
    baseX: 0,
    vx: 0,
    vy: 0,
    radius: 0,
    hp: 0,
    maxHp: 0,
    armor: 0,
    age: 0,
    fireCooldown: 0,
    phaseSeed: 0,
    wave: 1,
    dashCharge: 0,
  };
}

function recycleEnemy(world: CombatWorld, index: number): void {
  const [enemy] = world.enemies.splice(index, 1);
  if (enemy && world.pools.enemies.length < AIR_COMBAT_WORLD.maxEnemies) {
    world.pools.enemies.push(enemy);
  }
}

function acquireProjectile(world: CombatWorld): ProjectileEntity {
  return world.pools.projectiles.pop() || {
    id: 0,
    owner: "player",
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0,
    rawDamage: 0,
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
  };
}

function recycleProjectile(world: CombatWorld, index: number): void {
  const [projectile] = world.projectiles.splice(index, 1);
  if (projectile && world.pools.projectiles.length < 220) {
    projectile.hitIds.length = 0;
    world.pools.projectiles.push(projectile);
  }
}

function acquireParticle(world: CombatWorld): ParticleEntity {
  return world.pools.particles.pop() || {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0,
    size: 0,
    color: "#fff",
  };
}

function recycleParticle(world: CombatWorld, index: number): void {
  const [particle] = world.particles.splice(index, 1);
  if (particle && world.pools.particles.length < AIR_COMBAT_WORLD.maxParticles) {
    world.pools.particles.push(particle);
  }
}

function addParticles(
  world: CombatWorld,
  x: number,
  y: number,
  color: string,
  amount: number
): void {
  const available = Math.max(0, AIR_COMBAT_WORLD.maxParticles - world.particles.length);
  for (let index = 0; index < Math.min(amount, available); index++) {
    const particle = acquireParticle(world);
    const angle = world.visualRandom() * Math.PI * 2;
    const speed = 30 + world.visualRandom() * 85;
    const life = 0.22 + world.visualRandom() * 0.34;
    Object.assign(particle, {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size: 1.2 + world.visualRandom() * 3.2,
      color,
    });
    world.particles.push(particle);
  }
}

function waveSpawnPool(elapsed: number): EnemyType[] {
  if (elapsed < 35) return ["scout", "scout", "fighter"];
  if (elapsed < 90) return ["scout", "fighter", "fighter", "attacker", "kamikaze"];
  if (elapsed < 130) return ["fighter", "attacker", "kamikaze", "bomber"];
  if (elapsed < 195) return ["fighter", "attacker", "attacker", "kamikaze", "bomber"];
  return ["attacker", "kamikaze", "bomber", "fighter", "bomber"];
}

function spawnEnemy(world: CombatWorld, type: EnemyType): EnemyEntity | null {
  if (world.enemies.length >= AIR_COMBAT_WORLD.maxEnemies) return null;
  const config = ENEMY_CONFIGS[type];
  const wave = getWaveNumber(world.elapsed);
  const scaling = getEnemyScaling(wave);
  const enemy = acquireEnemy(world);
  const minX = GAMEPLAY_SAFE_RECT.left + config.radius + 2;
  const maxX = GAMEPLAY_SAFE_RECT.right - config.radius - 2;
  const x = minX + world.random() * Math.max(1, maxX - minX);
  Object.assign(enemy, {
    id: world.nextId++,
    type,
    x,
    y: GAMEPLAY_SAFE_RECT.top + config.radius + 2,
    baseX: x,
    vx: 0,
    vy: config.speed,
    radius: config.radius,
    hp: config.baseHp * scaling.hp,
    maxHp: config.baseHp * scaling.hp,
    armor: config.baseArmor,
    age: 0,
    fireCooldown: config.fireInterval * (0.65 + world.random() * 0.45),
    phaseSeed: world.random() * Math.PI * 2,
    wave,
    dashCharge: type === "kamikaze" ? 0.75 : 0,
  });
  world.enemies.push(enemy);
  return enemy;
}

function spawnElite(world: CombatWorld, index: 0 | 1): void {
  if (world.eliteSpawns[index]) return;
  world.eliteSpawns[index] = true;
  const elite = spawnEnemy(world, "elite");
  if (elite) {
    elite.hp *= index === 1 ? 1.25 : 1;
    elite.maxHp = elite.hp;
    elite.y = GAMEPLAY_SAFE_RECT.top + elite.radius + 8;
    setMessage(world, `CẢNH BÁO · KẺ SĂN RADAR ${index + 1}`, 2.2);
  }
}

function spawnBoss(world: CombatWorld): void {
  if (world.bossSpawned) return;
  world.bossSpawned = true;
  world.bossStartedAt = world.elapsed;
  world.bossPhase = 1;
  const boss = spawnEnemy(world, "boss");
  if (boss) {
    boss.x = AIR_COMBAT_WORLD.width / 2;
    boss.baseX = boss.x;
    boss.y = GAMEPLAY_SAFE_RECT.top + boss.radius + 10;
  }
  setMessage(world, "TRÙM · PHÁO ĐÀI BAY", 3);
}

function spawnBossGuards(world: CombatWorld): void {
  if (world.guardsSpawned) return;
  world.guardsSpawned = true;
  for (let index = 0; index < 4; index++) {
    const guard = spawnEnemy(world, "boss_guard");
    if (!guard) continue;
    guard.x = GAMEPLAY_SAFE_RECT.left + 52 + index * 76;
    guard.baseX = guard.x;
    guard.y = GAMEPLAY_SAFE_RECT.top + 110 + (index % 2) * 24;
  }
  setMessage(world, "GIAI ĐOẠN 2 · DRONE HỘ VỆ", 2.2);
}

function addProjectile(
  world: CombatWorld,
  values: Partial<ProjectileEntity> & Pick<ProjectileEntity, "owner" | "x" | "y" | "vx" | "vy" | "rawDamage">
): ProjectileEntity | null {
  const ownerCount = world.projectiles.reduce((count, projectile) => {
    const sharesPool = values.owner === "enemy"
      ? projectile.owner === "enemy"
      : projectile.owner !== "enemy";
    return count + (sharesPool ? 1 : 0);
  }, 0);
  const limit = values.owner === "enemy"
    ? AIR_COMBAT_WORLD.maxEnemyProjectiles
    : AIR_COMBAT_WORLD.maxPlayerProjectiles;
  if (ownerCount >= limit) return null;
  const projectile = acquireProjectile(world);
  Object.assign(projectile, {
    id: world.nextId++,
    owner: values.owner,
    appearance: values.appearance,
    x: values.x,
    y: values.y,
    vx: values.vx,
    vy: values.vy,
    radius: values.radius ?? 3,
    rawDamage: values.rawDamage,
    homing: values.homing ?? false,
    targetId: values.targetId ?? null,
    turnRate: values.turnRate ?? 0,
    penetrationRemaining: values.penetrationRemaining ?? 0,
    penetrationMultiplier: values.penetrationMultiplier ?? 0,
    splashMultiplier: values.splashMultiplier ?? 0,
    bounceRemaining: values.bounceRemaining ?? 0,
    bounceMultiplier: values.bounceMultiplier ?? 0,
    color: values.color ?? (values.owner === "enemy" ? "#fb7185" : "#67e8f9"),
  });
  projectile.hitIds.length = 0;
  world.projectiles.push(projectile);
  return projectile;
}

function nearestEnemy(
  world: CombatWorld,
  x: number,
  y: number,
  excludedIds: readonly number[] = [],
  priority = false
): EnemyEntity | null {
  let selected: EnemyEntity | null = null;
  let best = Number.POSITIVE_INFINITY;
  for (const enemy of world.enemies) {
    if (excludedIds.includes(enemy.id) || enemy.hp <= 0) continue;
    const distance = Math.hypot(enemy.x - x, enemy.y - y);
    const score = priority ? getTargetPriority(enemy.type) * 10000 + distance : distance;
    if (score < best) {
      selected = enemy;
      best = score;
    }
  }
  return selected;
}

function playerProjectileColor(aircraftId: AircraftId, empowered: boolean): string {
  if (aircraftId === "breaker") return empowered ? "#fde68a" : "#fb923c";
  if (aircraftId === "phantom") return empowered ? "#ddd6fe" : "#a78bfa";
  return empowered ? "#bae6fd" : "#22d3ee";
}

function fireBasic(world: CombatWorld): void {
  const stats = getEffectiveAircraftStats(world.aircraft);
  const afterburnerActive = (world.aircraft.activeEffects.afterburner || 0) > 0;
  world.aircraft.basicShotsFired += 1;
  const multipliers = resolveBasicProjectileMultipliers(
    world.aircraft,
    world.aircraft.basicShotsFired
  );
  const spread = multipliers.length === 3 ? 0.17 : multipliers.length === 2 ? 0.055 : 0;
  multipliers.forEach((multiplier, index) => {
    const offset = index - (multipliers.length - 1) / 2;
    const angle = -Math.PI / 2 + offset * spread;
    addProjectile(world, {
      owner: "player",
      x: world.playerX + offset * 6,
      y: world.playerY - 17,
      vx: Math.cos(angle) * 480,
      vy: Math.sin(angle) * 480,
      radius: 3.2,
      rawDamage: stats.firepower * multiplier,
      penetrationRemaining: stats.weapon.penetration,
      penetrationMultiplier: stats.weapon.penetrationDamageMultiplier,
      splashMultiplier: stats.weapon.splashDamageMultiplier,
      bounceRemaining: Math.max(stats.weapon.bounceCount, afterburnerActive ? 1 : 0),
      bounceMultiplier: afterburnerActive
        ? Math.max(0.7, stats.weapon.bounceDamageMultiplier)
        : stats.weapon.bounceDamageMultiplier,
      color: playerProjectileColor(world.aircraft.aircraftId, multiplier > 1.1),
    });
  });
}

function fireDrone(world: CombatWorld): void {
  const lockedTarget = world.enemies.find(
    (enemy) => enemy.id === world.droneTargetId && enemy.hp > 0
  );
  const target = lockedTarget || nearestEnemy(world, world.droneX, world.droneY, [], true);
  if (!target) return;
  world.droneTargetId = target.id;
  const stats = getEffectiveAircraftStats(world.aircraft);
  const ratio = getSkillRuntimeValues(world.aircraft, "escort_drone").damageMultiplier;
  const interval = 0.5;
  const rawDamage = stats.firepower * stats.fireRate * ratio * interval;
  const angle = Math.atan2(target.y - world.droneY, target.x - world.droneX);
  addProjectile(world, {
    owner: "drone",
    x: world.droneX,
    y: world.droneY,
    vx: Math.cos(angle) * 390,
    vy: Math.sin(angle) * 390,
    rawDamage,
    radius: 2.8,
    color: "#d8b4fe",
  });
}

function chooseEnemyTarget(world: CombatWorld, homing: boolean): number | null {
  if (world.decoys.length > 0 && (homing || world.random() < 0.68)) {
    const decoy = world.decoys[Math.floor(world.random() * world.decoys.length)];
    return decoy?.id ?? null;
  }
  return canAcquirePlayerTarget(world.aircraft) ? PLAYER_TARGET_ID : null;
}

function targetPosition(world: CombatWorld, targetId: number | null): { x: number; y: number } | null {
  if (targetId === PLAYER_TARGET_ID) return { x: world.playerX, y: world.playerY };
  const decoy = world.decoys.find((candidate) => candidate.id === targetId);
  return decoy ? { x: decoy.x, y: decoy.y } : null;
}

function fireEnemyBullet(
  world: CombatWorld,
  enemy: EnemyEntity,
  angle: number,
  speed: number,
  rawDamage: number,
  homing = false
): void {
  const adjustedSpeed = speed * 0.5;
  addProjectile(world, {
    owner: "enemy",
    appearance: enemy.type === "boss" ? "boss" : homing ? "dangerous" : undefined,
    x: enemy.x,
    y: enemy.y + enemy.radius * 0.65,
    vx: Math.cos(angle) * adjustedSpeed,
    vy: Math.sin(angle) * adjustedSpeed,
    rawDamage,
    radius: homing ? 5 : 4,
    homing,
    targetId: chooseEnemyTarget(world, homing),
    turnRate: homing ? 2.4 : 0,
    color: homing ? "#fbbf24" : "#fb7185",
  });
}

function aimAtCurrentTarget(world: CombatWorld, enemy: EnemyEntity): number | null {
  const id = chooseEnemyTarget(world, false);
  const target = targetPosition(world, id);
  return target ? Math.atan2(target.y - enemy.y, target.x - enemy.x) : null;
}

function addWarning(
  world: CombatWorld,
  kind: WarningZone["kind"],
  x: number,
  y: number,
  radius: number,
  duration: number,
  rawDamage: number,
  owner: WarningZone["owner"]
): void {
  if (world.warnings.length >= AIR_COMBAT_WORLD.maxWarnings) return;
  const clamped = clampCircleToGameplayRect(x, y, radius);
  world.warnings.push({
    id: world.nextId++,
    kind,
    x: clamped.x,
    y: clamped.y,
    radius,
    remaining: duration,
    totalDuration: duration,
    rawDamage,
    owner,
  });
}

function fireEnemy(world: CombatWorld, enemy: EnemyEntity): void {
  const config = ENEMY_CONFIGS[enemy.type];
  const scaling = getEnemyScaling(enemy.wave);
  const damage = config.projectileDamage * scaling.damage;
  const speedScale = scaling.projectileSpeed;
  const aim = aimAtCurrentTarget(world, enemy);

  if (enemy.type === "bomber") {
    addWarning(world, "enemy_bomb", world.playerX, world.playerY, 34, 1.15, damage * 1.35, "enemy");
  } else if (enemy.type === "fighter" && aim !== null) {
    [-0.1, 0, 0.1].forEach((offset) => fireEnemyBullet(world, enemy, aim + offset, 158 * speedScale, damage));
  } else if (enemy.type === "attacker") {
    [-0.32, -0.16, 0, 0.16, 0.32].forEach((offset) =>
      fireEnemyBullet(world, enemy, Math.PI / 2 + offset, 142 * speedScale, damage)
    );
  } else if (enemy.type === "elite") {
    if (aim !== null) {
      fireEnemyBullet(world, enemy, aim, 160 * speedScale, damage, true);
      [-0.24, 0.24].forEach((offset) => fireEnemyBullet(world, enemy, aim + offset, 150 * speedScale, damage * 0.8));
    }
    if (Math.floor(enemy.age) % 4 === 0) {
      addWarning(world, "elite_lock", world.playerX, world.playerY, 38, 1.25, damage * 1.5, "enemy");
    }
  } else if (enemy.type === "boss_guard" && aim !== null) {
    fireEnemyBullet(world, enemy, aim, 170 * speedScale, damage, false);
  } else if (enemy.type === "boss") {
    const fan = world.bossPhase === 1 ? 7 : 9;
    for (let index = 0; index < fan; index++) {
      const offset = index - (fan - 1) / 2;
      fireEnemyBullet(world, enemy, Math.PI / 2 + offset * 0.14, 150, damage);
    }
    if (aim !== null) {
      fireEnemyBullet(world, enemy, aim, 175, damage * 1.15, true);
    }
  } else if (enemy.type === "scout" && aim !== null) {
    fireEnemyBullet(world, enemy, aim, 155 * speedScale, damage);
  }
  enemy.fireCooldown = Math.max(0.48, config.fireInterval * (world.bossPhase === 3 && enemy.type === "boss" ? 0.75 : 1));
}

function launchNextMissile(world: CombatWorld): boolean {
  if (world.missilesPending <= 0 || world.missileSalvoTotal <= 0) return false;
  const stats = getEffectiveAircraftStats(world.aircraft);
  const values = getSkillRuntimeValues(world.aircraft, "missile_swarm");
  const index = world.missileLaunchIndex;
  const target = nearestEnemy(world, world.playerX, world.playerY, [], true);
  const lane = index - (world.missileSalvoTotal - 1) / 2;
  const angle = -Math.PI / 2 + lane * 0.075;
  const side = index % 2 === 0 ? -1 : 1;
  const launch = clampCircleToGameplayRect(
    world.playerX + side * (9 + Math.floor(index / 2) * 1.5),
    world.playerY - 12 + (index % 3) * 2,
    4.5
  );
  const projectile = addProjectile(world, {
    owner: "player",
    x: launch.x,
    y: launch.y,
    vx: Math.cos(angle) * 260,
    vy: Math.sin(angle) * 260,
    radius: 4.5,
    rawDamage: stats.firepower * values.damageMultiplier,
    homing: true,
    targetId: target?.id ?? null,
    turnRate: 3.2,
    color: "#fb923c",
  });
  if (!projectile) return false;
  world.missilesPending -= 1;
  world.missileLaunchIndex += 1;
  return true;
}

function updateMissileSalvo(world: CombatWorld, dt: number): void {
  if (world.missilesPending <= 0) return;
  world.missileLaunchCooldown -= dt;
  while (world.missilesPending > 0 && world.missileLaunchCooldown <= 0) {
    if (!launchNextMissile(world)) {
      world.missileLaunchCooldown = 0.05;
      return;
    }
    world.missileLaunchCooldown += 0.075;
  }
}

function queueMissileSwarm(world: CombatWorld): void {
  const count = getSkillRuntimeValues(world.aircraft, "missile_swarm").count;
  world.missilesPending = count;
  world.missileLaunchIndex = 0;
  world.missileSalvoTotal = count;
  world.missileLaunchCooldown = 0;
  updateMissileSalvo(world, 0);
}

function spawnDecoys(world: CombatWorld): void {
  const values = getSkillRuntimeValues(world.aircraft, "decoy");
  for (let index = 0; index < values.count; index++) {
    const offset = index - (values.count - 1) / 2;
    const point = clampCircleToGameplayRect(
      world.playerX + offset * 24,
      world.playerY - 34 - Math.abs(offset) * 8,
      7
    );
    world.decoys.push({
      id: world.nextId++,
      x: point.x,
      y: point.y,
      radius: 7,
      remaining: values.duration,
    });
  }
}

export function castWorldSkill(
  world: CombatWorld,
  skillId: SkillId
): SkillCastResult {
  const result = castSkill(world.aircraft, skillId);
  if (!result.cast) return result;
  if (result.toggledOff) {
    world.droneTargetId = null;
    setMessage(world, "DRONE ĐÃ THU HỒI", 1);
    return result;
  }
  switch (skillId) {
    case "decoy": spawnDecoys(world); break;
    case "missile_swarm": queueMissileSwarm(world); break;
    case "heavy_bomb": {
      const target = nearestEnemy(world, world.playerX, world.playerY, [], true);
      const values = getSkillRuntimeValues(world.aircraft, skillId);
      addWarning(
        world,
        "player_bomb",
        target?.x ?? world.playerX,
        target?.y ?? Math.max(GAMEPLAY_SAFE_RECT.top + 100, world.playerY - 150),
        58 * values.radiusMultiplier,
        0.9,
        getEffectiveAircraftStats(world.aircraft).firepower * values.damageMultiplier,
        "player"
      );
      break;
    }
    case "focus_laser": {
      const values = getSkillRuntimeValues(world.aircraft, skillId);
      world.laserCharge = 0.7;
      world.laserRemaining = values.duration;
      world.laserTickCooldown = 0;
      break;
    }
    case "invisibility":
      for (const projectile of world.projectiles) {
        if (projectile.owner === "enemy" && projectile.homing && projectile.targetId === PLAYER_TARGET_ID) {
          projectile.targetId = null;
        }
      }
      break;
    case "escort_drone": {
      const deployed = clampCircleToGameplayRect(world.playerX - 28, world.playerY + 8, 9);
      world.droneX = deployed.x;
      world.droneY = deployed.y;
      world.droneTargetId = null;
      world.droneOrbitAngle = 0;
      world.droneFireCooldown = 0;
      break;
    }
  }
  setMessage(world, SKILL_CONFIGS[skillId].name.toUpperCase(), 1.2);
  return result;
}

export function setPlayerInputActive(world: CombatWorld, active: boolean): void {
  world.playerInputActive = active;
}

// Apply each coalesced pointer segment immediately. Subdivision checks the full
// displacement without advancing time, limiting speed, or changing invulnerability.
export function movePlayerByDelta(world: CombatWorld, dx: number, dy: number): void {
  if (!world.playerInputActive || world.ended || world.currentCoreChoices || world.pendingCoreSelections > 0 ||
      !Number.isFinite(dx) || !Number.isFinite(dy)) return;
  const startX = world.playerX;
  const startY = world.playerY;
  const end = clampCircleToGameplayRect(startX + dx, startY + dy, world.playerRadius);
  // Common visual clearance for all aircraft: the tail and both bars stay on-screen.
  end.y = Math.min(end.y, AIR_COMBAT_WORLD.height - AIR_COMBAT_WORLD.playerBottomClearance);
  const steps = Math.max(1, Math.ceil(Math.hypot(end.x - startX, end.y - startY) / 2));
  for (let step = 1; step <= steps; step++) {
    world.playerX = startX + (end.x - startX) * step / steps;
    world.playerY = startY + (end.y - startY) * step / steps;
    // Only player contacts: do not repeat weapon damage or advance enemy AI.
    for (let index = world.projectiles.length - 1; index >= 0; index--) {
      const p = world.projectiles[index];
      if (p.owner === "enemy" && circleHit(p.x, p.y, p.radius, world.playerX, world.playerY, world.playerRadius)) {
        hitPlayer(world, p.rawDamage);
        recycleProjectile(world, index);
      }
    }
    updateEnemyPlayerCollisions(world);
  }
  if (world.aircraft.currentHp <= 0) world.ended = true;
}

function updateDroneMovement(world: CombatWorld, dt: number): void {
  if (!world.aircraft.droneActive) {
    world.droneTargetId = null;
    return;
  }

  let target = world.enemies.find(
    (enemy) => enemy.id === world.droneTargetId && enemy.hp > 0
  ) || null;
  if (!target) {
    target = nearestEnemy(world, world.droneX, world.droneY, [], true);
    world.droneTargetId = target?.id ?? null;
  }

  world.droneOrbitAngle = (world.droneOrbitAngle + dt * 1.9) % (Math.PI * 2);
  const desired = target
    ? {
        x: target.x + Math.cos(world.droneOrbitAngle) * (target.radius + 44),
        y: target.y + target.radius + 48 + Math.sin(world.droneOrbitAngle) * 16,
      }
    : { x: world.playerX - 28, y: world.playerY + 8 };
  const clampedDesired = clampCircleToGameplayRect(desired.x, desired.y, 9);
  const dx = clampedDesired.x - world.droneX;
  const dy = clampedDesired.y - world.droneY;
  const distance = Math.hypot(dx, dy);
  if (distance <= 0.05) return;
  const maxDistance = (target ? 235 : 300) * dt;
  const ratio = Math.min(1, maxDistance / distance);
  const next = clampCircleToGameplayRect(
    world.droneX + dx * ratio,
    world.droneY + dy * ratio,
    9
  );
  world.droneX = next.x;
  world.droneY = next.y;
}

function updateEncounter(world: CombatWorld, dt: number): void {
  if (!world.eliteSpawns[0] && world.elapsed >= 70) spawnElite(world, 0);
  if (!world.eliteSpawns[1] && world.elapsed >= 170) spawnElite(world, 1);
  if (!world.bossSpawned && world.elapsed >= AIR_COMBAT_WORLD.bossStartsAtSeconds) {
    spawnBoss(world);
  }
  if (world.bossSpawned) return;

  world.enemySpawnCooldown -= dt;
  if (world.enemySpawnCooldown > 0) return;
  const pool = waveSpawnPool(world.elapsed);
  const type = pool[Math.floor(world.random() * pool.length)] || ENEMY_ARCHETYPES[0];
  spawnEnemy(world, type);
  const pressure = Math.max(0.48, 1.35 - getWaveNumber(world.elapsed) * 0.14);
  world.enemySpawnCooldown = pressure * (0.78 + world.random() * 0.45);
}

function updateBossPhase(world: CombatWorld): void {
  const boss = world.enemies.find((enemy) => enemy.type === "boss");
  if (!boss) return;
  const ratio = boss.hp / boss.maxHp;
  const nextPhase = ratio > 0.7 ? 1 : ratio > 0.35 ? 2 : 3;
  if (nextPhase === world.bossPhase) return;
  world.bossPhase = nextPhase;
  if (nextPhase === 2) spawnBossGuards(world);
  if (nextPhase === 3) setMessage(world, "GIAI ĐOẠN 3 · KHÔNG KÍCH", 2.5);
}

function updateEnemies(world: CombatWorld, dt: number): void {
  for (let index = world.enemies.length - 1; index >= 0; index--) {
    const enemy = world.enemies[index];
    enemy.age += dt;
    enemy.fireCooldown -= dt;
    const top = GAMEPLAY_SAFE_RECT.top + enemy.radius;
    const bottom = GAMEPLAY_SAFE_RECT.bottom;

    if (enemy.type === "boss") {
      enemy.y = Math.max(top + 8, GAMEPLAY_SAFE_RECT.top + 58 + Math.sin(enemy.age * 0.7) * 8);
      enemy.x = AIR_COMBAT_WORLD.width / 2 + Math.sin(enemy.age * 0.55) * 92;
      if (world.bossPhase === 3 && Math.floor((enemy.age - dt) / 1.35) !== Math.floor(enemy.age / 1.35)) {
        addWarning(
          world,
          "boss_strike",
          GAMEPLAY_SAFE_RECT.left + 35 + world.random() * (GAMEPLAY_SAFE_RECT.width - 70),
          GAMEPLAY_SAFE_RECT.top + 110 + world.random() * (GAMEPLAY_SAFE_RECT.height - 170),
          34,
          1.1,
          ENEMY_CONFIGS.boss.projectileDamage * 1.35,
          "enemy"
        );
      }
    } else if (enemy.type === "boss_guard") {
      const boss = world.enemies.find((candidate) => candidate.type === "boss");
      if (boss) {
        const guardIndex = enemy.id % 4;
        enemy.x = boss.x + Math.cos(enemy.age * 1.2 + guardIndex * 1.57) * 72;
        enemy.y = Math.max(top, boss.y + 65 + Math.sin(enemy.age + guardIndex) * 22);
      }
    } else if (enemy.type === "fighter") {
      enemy.y += enemy.vy * dt;
      enemy.x = enemy.baseX + Math.sin(enemy.age * 2.2 + enemy.phaseSeed) * 42;
    } else if (enemy.type === "attacker") {
      enemy.y += enemy.vy * dt;
      enemy.x = enemy.baseX + Math.sin(enemy.age * 1.1 + enemy.phaseSeed) * 28;
    } else if (enemy.type === "bomber") {
      const holdY = GAMEPLAY_SAFE_RECT.top + 120;
      if (enemy.y < holdY) enemy.y += enemy.vy * dt;
      enemy.x = enemy.baseX + Math.sin(enemy.age * 1.05 + enemy.phaseSeed) * 54;
    } else if (enemy.type === "kamikaze") {
      enemy.dashCharge = Math.max(0, enemy.dashCharge - dt);
      if (enemy.dashCharge > 0) {
        enemy.y = Math.max(top, enemy.y + 16 * dt);
      } else {
        const angle = Math.atan2(world.playerY - enemy.y, world.playerX - enemy.x);
        enemy.x += Math.cos(angle) * enemy.vy * dt;
        enemy.y += Math.sin(angle) * enemy.vy * dt;
      }
    } else if (enemy.type === "elite") {
      const holdY = GAMEPLAY_SAFE_RECT.top + 155;
      if (enemy.y < holdY) enemy.y += enemy.vy * dt;
      enemy.x += Math.sin(enemy.age * 1.7 + enemy.phaseSeed) * 52 * dt;
    } else {
      enemy.y += enemy.vy * dt;
    }

    const clamped = clampCircleToGameplayRect(enemy.x, Math.max(top, enemy.y), enemy.radius);
    enemy.x = clamped.x;
    if (enemy.type === "boss" || enemy.type === "elite" || enemy.type === "bomber" || enemy.type === "boss_guard") {
      enemy.y = clamped.y;
    } else if (enemy.y < top) {
      enemy.y = top;
    }

    if (enemy.fireCooldown <= 0 && enemy.type !== "kamikaze") fireEnemy(world, enemy);
    if (enemy.y + enemy.radius > bottom && enemy.type !== "boss") recycleEnemy(world, index);
  }
  updateBossPhase(world);
}

function updateHoming(world: CombatWorld, projectile: ProjectileEntity, dt: number): void {
  if (!projectile.homing) return;
  let target: { x: number; y: number } | null = null;
  if (projectile.owner === "enemy") {
    target = targetPosition(world, projectile.targetId);
  } else {
    const enemy = world.enemies.find((candidate) => candidate.id === projectile.targetId && candidate.hp > 0) ||
      nearestEnemy(world, projectile.x, projectile.y, projectile.hitIds, true);
    if (enemy) {
      projectile.targetId = enemy.id;
      target = { x: enemy.x, y: enemy.y };
    }
  }
  if (!target) return;
  const desired = Math.atan2(target.y - projectile.y, target.x - projectile.x);
  const current = Math.atan2(projectile.vy, projectile.vx);
  let delta = ((desired - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  delta = Math.max(-projectile.turnRate * dt, Math.min(projectile.turnRate * dt, delta));
  const speed = Math.max(1, Math.hypot(projectile.vx, projectile.vy));
  const next = current + delta;
  projectile.vx = Math.cos(next) * speed;
  projectile.vy = Math.sin(next) * speed;
}

function applyDamageToEnemy(
  world: CombatWorld,
  enemy: EnemyEntity,
  rawDamage: number,
  color = "#fde68a"
): number {
  if (enemy.hp <= 0 || rawDamage <= 0) return 0;
  const resolved = resolvePlayerDamage(rawDamage, enemy.armor, getEffectiveAircraftStats(world.aircraft), world.random);
  const damage = Math.min(enemy.hp, resolved.actualDamage);
  if (damage <= 0) return 0;
  enemy.hp = Math.max(0, enemy.hp - damage);
  emitVisual(world, { kind: "damage_number", x: enemy.x, y: enemy.y, size: enemy.radius,
    amount: damage, target: "enemy", critical: resolved.critical, shielded: false, entityId: enemy.id });
  emitVisual(world, { kind: "hit", x: enemy.x, y: enemy.y, size: enemy.radius, entityId: enemy.id });
  world.damageDealt += damage;
  addParticles(world, enemy.x, enemy.y, color, 3);
  return damage;
}

function findEnemyIndexById(world: CombatWorld, id: number): number {
  return world.enemies.findIndex((enemy) => enemy.id === id);
}

function destroyEnemy(world: CombatWorld, enemyIndex: number): void {
  const enemy = world.enemies[enemyIndex];
  if (!enemy) return;
  const config = ENEMY_CONFIGS[enemy.type];
  emitVisual(world, { kind: "explosion", x: enemy.x, y: enemy.y, size: enemy.radius * 3, boss: enemy.type === "boss" });
  world.score += config.score * getComboMultiplier(world.comboKills);
  world.comboKills += 1;
  world.comboTimer = 4;
  world.maxCombo = Math.max(world.maxCombo, world.comboKills);
  addParticles(world, enemy.x, enemy.y, config.color, enemy.type === "boss" ? 36 : enemy.type === "elite" ? 20 : 9);

  if (enemy.type === "boss") {
    world.bossDefeated = true;
    world.bossClearSeconds = world.bossStartedAt === null ? null : world.elapsed - world.bossStartedAt;
    setMessage(world, "PHÁO ĐÀI BAY ĐÃ BỊ HẠ", 3);
  } else {
    world.enemiesDefeated += 1;
    if (enemy.type === "elite") world.elitesDefeated += 1;
    const level = gainCombatXp(world.aircraft, config.combatXp);
    if (level.levelsGained > 0) setMessage(world, `CẤP CHIẾN ĐẤU ${world.aircraft.level}`, 1.5);
    world.pendingCoreSelections += level.coreSelectionsDue;
  }
  recycleEnemy(world, enemyIndex);
}

function applySecondaryHits(
  world: CombatWorld,
  projectile: ProjectileEntity,
  primary: EnemyEntity
): void {
  const damagedIds: number[] = [];
  if (projectile.splashMultiplier > 0) {
    for (const enemy of world.enemies) {
      if (enemy.id === primary.id || Math.hypot(enemy.x - primary.x, enemy.y - primary.y) > 46) continue;
      applyDamageToEnemy(world, enemy, projectile.rawDamage * projectile.splashMultiplier, "#fb923c");
      damagedIds.push(enemy.id);
    }
  }
  if (projectile.bounceRemaining > 0) {
    const next = nearestEnemy(world, primary.x, primary.y, [...projectile.hitIds, primary.id]);
    if (next) {
      const angle = Math.atan2(next.y - primary.y, next.x - primary.x);
      const bounced = addProjectile(world, {
        owner: projectile.owner,
        x: primary.x,
        y: primary.y,
        vx: Math.cos(angle) * 460,
        vy: Math.sin(angle) * 460,
        radius: Math.max(2.8, projectile.radius * 0.9),
        rawDamage: projectile.rawDamage * projectile.bounceMultiplier,
        homing: true,
        targetId: next.id,
        turnRate: 7,
        penetrationRemaining: 0,
        penetrationMultiplier: 0,
        splashMultiplier: 0,
        bounceRemaining: 0,
        bounceMultiplier: 0,
        color: "#c4b5fd",
      });
      if (bounced) {
        bounced.hitIds.push(...new Set([...projectile.hitIds, primary.id]));
        projectile.bounceRemaining -= 1;
      }
    }
  }
  for (const id of new Set(damagedIds)) {
    const index = findEnemyIndexById(world, id);
    if (index >= 0 && world.enemies[index].hp <= 0) destroyEnemy(world, index);
  }
}

function hitPlayer(world: CombatWorld, rawDamage: number): void {
  if (world.playerInvulnerability > 0 || world.aircraft.currentHp <= 0 || rawDamage <= 0) return;
  const shieldMultiplier = (world.aircraft.activeEffects.armor_shield || 0) > 0
    ? getSkillRuntimeValues(world.aircraft, "armor_shield").damageTakenMultiplier
    : 1;
  const damage = applyDamageToAircraft(world.aircraft, rawDamage, shieldMultiplier);
  if (damage <= 0) return;
  emitVisual(world, { kind: "damage_number", x: world.playerX, y: world.playerY, size: 36,
    amount: damage, target: "player", critical: false, shielded: shieldMultiplier < 1 });
  world.damageTaken += damage;
  world.hitsReceived += 1;
  emitVisual(world, { kind: "player_hit", x: world.playerX, y: world.playerY, size: 36 });
  world.comboKills = 0;
  world.comboTimer = 0;
  world.playerInvulnerability = AIR_COMBAT_WORLD.playerInvulnerabilitySeconds;
  addParticles(world, world.playerX, world.playerY, "#fb7185", 13);
}

function updateProjectileCollisions(world: CombatWorld): void {
  for (let projectileIndex = world.projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
    const projectile = world.projectiles[projectileIndex];
    if (projectile.owner === "enemy") {
      if (circleHit(projectile.x, projectile.y, projectile.radius, world.playerX, world.playerY, world.playerRadius)) {
        hitPlayer(world, projectile.rawDamage);
        recycleProjectile(world, projectileIndex);
      } else if (projectile.targetId && projectile.targetId !== PLAYER_TARGET_ID) {
        const decoy = world.decoys.find((candidate) => candidate.id === projectile.targetId);
        if (decoy && circleHit(projectile.x, projectile.y, projectile.radius, decoy.x, decoy.y, decoy.radius)) {
          recycleProjectile(world, projectileIndex);
        }
      }
      continue;
    }

    let consumed = false;
    for (let enemyIndex = world.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
      const enemy = world.enemies[enemyIndex];
      if (projectile.hitIds.includes(enemy.id)) continue;
      if (!circleHit(projectile.x, projectile.y, projectile.radius, enemy.x, enemy.y, enemy.radius)) continue;
      projectile.hitIds.push(enemy.id);
      applyDamageToEnemy(world, enemy, projectile.rawDamage, projectile.color);
      applySecondaryHits(world, projectile, enemy);
      if (enemy.hp <= 0) destroyEnemy(world, findEnemyIndexById(world, enemy.id));
      if (projectile.penetrationRemaining > 0) {
        projectile.penetrationRemaining -= 1;
        projectile.rawDamage *= projectile.penetrationMultiplier;
      } else {
        recycleProjectile(world, projectileIndex);
        consumed = true;
      }
      break;
    }
    if (consumed) continue;
  }
}

function updateEnemyPlayerCollisions(world: CombatWorld): void {
  for (let index = world.enemies.length - 1; index >= 0; index--) {
    const enemy = world.enemies[index];
    if (!circleHit(enemy.x, enemy.y, enemy.radius * 0.78, world.playerX, world.playerY, world.playerRadius)) continue;
    hitPlayer(world, ENEMY_CONFIGS[enemy.type].collisionDamage);
    if (enemy.type !== "boss" && enemy.type !== "elite") recycleEnemy(world, index);
  }
}

function detonateWarning(world: CombatWorld, warning: WarningZone): void {
  emitVisual(world, { kind: "bomb", x: warning.x, y: warning.y, size: warning.radius * 2 });
  addParticles(world, warning.x, warning.y, warning.owner === "player" ? "#fbbf24" : "#ef4444", 22);
  if (warning.owner === "player") {
    for (let index = world.enemies.length - 1; index >= 0; index--) {
      const enemy = world.enemies[index];
      if (Math.hypot(enemy.x - warning.x, enemy.y - warning.y) > warning.radius + enemy.radius) continue;
      applyDamageToEnemy(world, enemy, warning.rawDamage, "#fbbf24");
      if (enemy.hp <= 0) destroyEnemy(world, findEnemyIndexById(world, enemy.id));
    }
  } else if (Math.hypot(world.playerX - warning.x, world.playerY - warning.y) <= warning.radius + world.playerRadius) {
    hitPlayer(world, warning.rawDamage);
  }
}

function updateWarnings(world: CombatWorld, dt: number): void {
  for (let index = world.warnings.length - 1; index >= 0; index--) {
    const warning = world.warnings[index];
    warning.remaining -= dt;
    if (warning.remaining <= 0) {
      detonateWarning(world, warning);
      world.warnings.splice(index, 1);
    }
  }
}

function updateLaser(world: CombatWorld, dt: number): void {
  if (world.laserCharge > 0) {
    world.laserCharge = Math.max(0, world.laserCharge - dt);
    return;
  }
  if (world.laserRemaining <= 0) return;
  world.laserRemaining = Math.max(0, world.laserRemaining - dt);
  world.laserTickCooldown -= dt;
  if (world.laserTickCooldown > 0) return;
  world.laserTickCooldown += 0.2;
  const values = getSkillRuntimeValues(world.aircraft, "focus_laser");
  const rawDamage = getEffectiveAircraftStats(world.aircraft).firepower * values.damageMultiplier;
  for (let index = world.enemies.length - 1; index >= 0; index--) {
    const enemy = world.enemies[index];
    if (enemy.y >= world.playerY || Math.abs(enemy.x - world.playerX) > enemy.radius + 16) continue;
    applyDamageToEnemy(world, enemy, rawDamage, "#c4b5fd");
    if (enemy.hp <= 0) destroyEnemy(world, findEnemyIndexById(world, enemy.id));
  }
}

function updateProjectiles(world: CombatWorld, dt: number): void {
  for (let index = world.projectiles.length - 1; index >= 0; index--) {
    const projectile = world.projectiles[index];
    updateHoming(world, projectile, dt);
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    const outside =
      projectile.x - projectile.radius < GAMEPLAY_SAFE_RECT.left ||
      projectile.x + projectile.radius > GAMEPLAY_SAFE_RECT.right ||
      projectile.y - projectile.radius < GAMEPLAY_SAFE_RECT.top ||
      projectile.y + projectile.radius > GAMEPLAY_SAFE_RECT.bottom;
    if (outside) recycleProjectile(world, index);
  }
}

function updateDecoys(world: CombatWorld, dt: number): void {
  for (let index = world.decoys.length - 1; index >= 0; index--) {
    world.decoys[index].remaining -= dt;
    if (world.decoys[index].remaining <= 0) world.decoys.splice(index, 1);
  }
}

function updateParticles(world: CombatWorld, dt: number): void {
  for (let index = world.particles.length - 1; index >= 0; index--) {
    const particle = world.particles[index];
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.96;
    particle.vy *= 0.96;
    if (particle.life <= 0) recycleParticle(world, index);
  }
}

export function updateCombatWorld(world: CombatWorld, deltaSeconds: number): void {
  if (world.ended || deltaSeconds <= 0) return;
  const dt = Math.min(AIR_COMBAT_WORLD.maxDeltaSeconds, deltaSeconds);
  world.elapsed += dt;
  world.scroll = (world.scroll + dt * 52) % 80;
  world.playerInvulnerability = Math.max(0, world.playerInvulnerability - dt);
  world.comboTimer = Math.max(0, world.comboTimer - dt);
  if (world.comboTimer <= 0) world.comboKills = 0;
  if (world.latestMessage && world.elapsed >= world.messageUntil) world.latestMessage = null;

  tickAircraftState(world.aircraft, dt, true);
  updateEncounter(world, dt);
  updateEnemies(world, dt);
  updateDroneMovement(world, dt);
  updateDecoys(world, dt);
  updateWarnings(world, dt);
  updateLaser(world, dt);
  updateMissileSalvo(world, dt);

  world.playerFireCooldown -= dt;
  if (shouldAutoFire(world.aircraft) && world.playerFireCooldown <= 0) {
    fireBasic(world);
    world.playerFireCooldown += 1 / getEffectiveAircraftStats(world.aircraft).fireRate;
  }
  world.droneFireCooldown -= dt;
  if (world.aircraft.droneActive && world.droneFireCooldown <= 0) {
    fireDrone(world);
    world.droneFireCooldown += 0.5;
  }

  updateProjectiles(world, dt);
  updateProjectileCollisions(world);
  updateEnemyPlayerCollisions(world);
  updateParticles(world, dt);

  if (world.aircraft.currentHp <= 0) world.ended = true;
  if (world.bossDefeated) world.ended = true;
  if (world.elapsed >= AIR_COMBAT_WORLD.hardRunLimitSeconds) world.ended = true;
}

export function ensureCoreSelection(world: CombatWorld): CoreCard[] | null {
  if (world.pendingCoreSelections <= 0) return null;
  if (!world.currentCoreChoices) {
    const selectionNumber = world.coreSelectionCount + 1;
    world.currentCoreChoices = generateCoreChoices(world.aircraft, selectionNumber, world.random);
  }
  return world.currentCoreChoices;
}

export function selectCore(world: CombatWorld, card: CoreCard): boolean {
  if (!world.currentCoreChoices?.some((choice) => choice.id === card.id)) return false;
  const applied = applyCore(world.aircraft, card);
  if (!applied) return false;
  world.coreSelectionCount += 1;
  world.pendingCoreSelections = Math.max(0, world.pendingCoreSelections - 1);
  world.currentCoreChoices = null;
  setMessage(world, `${card.name.toUpperCase()} · ${card.valueLabel}`, 1.8);
  return true;
}

export function makeHudSnapshot(
  world: CombatWorld,
  paused: boolean,
  pauseLabel: string | null
): AirCombatHudSnapshot {
  const boss = world.enemies.find((enemy) => enemy.type === "boss");
  return {
    stats: getEffectiveAircraftStats(world.aircraft),
    score: Math.max(0, Math.round(world.score)),
    comboKills: world.comboKills,
    comboMultiplier: getComboMultiplier(world.comboKills),
    elapsedSeconds: world.elapsed,
    waveLabel: getWaveLabel(world.elapsed),
    combatXpRequired: requiredCombatXp(world.aircraft.level),
    bossHp: boss?.hp || 0,
    bossMaxHp: boss?.maxHp || 0,
    bossPhase: world.bossPhase,
    paused,
    pauseLabel,
    cooldowns: { ...world.aircraft.cooldowns },
    droneActive: world.aircraft.droneActive,
    latestMessage: world.latestMessage,
  };
}

export function summarizeCombatWorld(world: CombatWorld): AirCombatRunSummary {
  const stats = getEffectiveAircraftStats(world.aircraft);
  const withoutRank: Omit<AirCombatRunSummary, "rank"> = {
    aircraftId: world.aircraft.aircraftId,
    score: Math.max(0, Math.round(world.score)),
    enemiesDefeated: world.enemiesDefeated,
    elitesDefeated: world.elitesDefeated,
    bossDefeated: world.bossDefeated,
    maxCombo: world.maxCombo,
    survivalSeconds: world.elapsed,
    combatLevel: world.aircraft.level,
    finalFirepower: stats.firepower,
    damageDealt: world.damageDealt,
    damageTaken: world.damageTaken,
    hitsReceived: world.hitsReceived,
    bossClearSeconds: world.bossClearSeconds,
    destroyed: world.aircraft.currentHp <= 0,
  };
  return { ...withoutRank, rank: calculateRunRank(withoutRank) };
}

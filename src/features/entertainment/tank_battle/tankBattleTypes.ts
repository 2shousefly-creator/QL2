export interface Vec2 {
  x: number;
  y: number;
}

export interface GameplaySafeRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export type TankBattlePhase =
  | "playing"
  | "upgrade"
  | "victory"
  | "defeat_player"
  | "defeat_hq";

export type TankBattleRank = "C" | "B" | "A" | "S" | "SS";

export type EnemyTankType =
  | "light"
  | "battle"
  | "siege"
  | "minelayer"
  | "minesweeper"
  | "elite"
  | "boss";

export type EnemyTargetKind = "player" | "hq" | "terrain" | "mine";

export type TerrainType = "brick" | "steel" | "barrel";

export type ProjectileOwner = "player" | "enemy" | "hq";

export type MineOwner = "player" | "enemy" | "hq";

export type UpgradeCategory = "cannon" | "mine" | "tank" | "hq";

export type TankUpgradeId =
  | "cannon_damage"
  | "cannon_reload"
  | "cannon_shell_slot"
  | "cannon_velocity"
  | "cannon_pierce"
  | "cannon_splash"
  | "mine_capacity"
  | "mine_damage"
  | "mine_radius"
  | "mine_trigger"
  | "mine_slow"
  | "mine_rearm"
  | "tank_hp"
  | "tank_armor"
  | "tank_speed"
  | "turret_speed"
  | "between_wave_repair"
  | "hq_hp"
  | "hq_armor"
  | "hq_machine_gun"
  | "hq_defensive_mines"
  | "wall_reinforcement"
  | "hq_emergency_repair";

export interface TankStats {
  maxHp: number;
  armor: number;
  cannonDamage: number;
  reloadSeconds: number;
  projectileSpeed: number;
  maxActiveShells: number;
  maxActiveMines: number;
  mineDamage: number;
  mineRadius: number;
  mineTriggerDelay: number;
  moveSpeed: number;
  reverseSpeedRatio: number;
  acceleration: number;
  deceleration: number;
  turnSpeed: number;
  turretTurnSpeed: number;
  projectilePierce: number;
  splashRadius: number;
  mineSlowRatio: number;
  mineRearmSeconds: number;
  betweenWaveRepair: number;
}

export interface HeadquartersStats {
  maxHp: number;
  armor: number;
  machineGunDps: number;
  machineGunRange: number;
  defensiveMineCount: number;
}

export interface PlayerTankState extends Vec2 {
  radius: number;
  bodyAngle: number;
  turretAngle: number;
  turretTargetAngle: number;
  velocity: number;
  hp: number;
  stats: TankStats;
  reloadRemaining: number;
  alive: boolean;
  hitFlash: number;
  selectedUpgrades: TankUpgradeId[];
  upgradeStacks: Partial<Record<TankUpgradeId, number>>;
}

export interface HeadquartersState extends Vec2 {
  radius: number;
  hp: number;
  stats: HeadquartersStats;
  alive: boolean;
  hitFlash: number;
  gunCooldown: number;
}

export interface EnemyTankConfig {
  type: EnemyTankType;
  name: string;
  maxHp: number;
  armor: number;
  speed: number;
  reverseSpeedRatio: number;
  turnSpeed: number;
  radius: number;
  cannonDamage: number;
  projectileSpeed: number;
  reloadSeconds: number;
  preferredRange: number;
  score: number;
  wallDamageMultiplier: number;
  color: string;
}

export interface PathNode extends Vec2 {}

export interface EnemyTankState extends Vec2 {
  id: number;
  type: EnemyTankType;
  radius: number;
  bodyAngle: number;
  turretAngle: number;
  hp: number;
  maxHp: number;
  armor: number;
  speed: number;
  alive: boolean;
  reloadRemaining: number;
  mineCooldown: number;
  sweepProgress: number;
  targetKind: EnemyTargetKind;
  targetId: number | null;
  path: PathNode[];
  pathIndex: number;
  pathRevision: number;
  repathRemaining: number;
  stuckSeconds: number;
  previousX: number;
  previousY: number;
  hitFlash: number;
  slowRemaining: number;
  bossSummonsUsed: number;
  bossSummonCooldown: number;
  bossSiegeCharge: number;
  bossSiegeCooldown: number;
  bossInterruptedDamage: number;
  eliteChargeRemaining: number;
  eliteChargeCooldown: number;
}

export interface ProjectileState extends Vec2 {
  id: number;
  owner: ProjectileOwner;
  sourceId: number | null;
  velocityX: number;
  velocityY: number;
  radius: number;
  rawDamage: number;
  lifeRemaining: number;
  pierceRemaining: number;
  splashRadius: number;
  wallDamageMultiplier: number;
  hitIds: number[];
  creditedHit: boolean;
  dangerous: boolean;
}

export interface MineState extends Vec2 {
  id: number;
  owner: MineOwner;
  armedRemaining: number;
  radius: number;
  triggerRadius: number;
  rawDamage: number;
  slowRatio: number;
  rearmSeconds: number;
  charges: number;
  sweepProgress: number;
}

export interface TerrainState extends Vec2 {
  id: number;
  type: TerrainType;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  explosiveRadius: number;
}

export interface ExplosionState extends Vec2 {
  radius: number;
  maxRadius: number;
  lifeRemaining: number;
  color: string;
}

export interface WarningState extends Vec2 {
  kind: "elite_charge" | "hq_lock" | "barrel";
  radius: number;
  remaining: number;
  total: number;
  label: string;
}

export interface NavigationGrid {
  cellSize: number;
  columns: number;
  rows: number;
  blocked: boolean[];
  revision: number;
}

export interface DriveInput {
  throttle: number;
  steer: number;
}

export interface TankUpgradeDefinition {
  id: TankUpgradeId;
  category: UpgradeCategory;
  name: string;
  description: string;
  icon: string;
  maxStacks: number;
}

export interface TankUpgradeCard extends TankUpgradeDefinition {
  stackAfterSelection: number;
}

export interface WaveDefinition {
  id: number;
  name: string;
  subtitle: string;
  spawnInterval: number;
  enemies: ReadonlyArray<{
    type: EnemyTankType;
    count: number;
  }>;
  upgradeAfter: boolean;
}

export interface PendingSpawn {
  type: EnemyTankType;
  delay: number;
}

export interface TankBattleMetrics {
  enemiesDefeated: number;
  elitesDefeated: number;
  cannonShots: number;
  cannonHits: number;
  mineKills: number;
  damageDealt: number;
  damageTaken: number;
  hqDamageTaken: number;
  wallsDestroyedByPlayer: number;
  wallsDestroyedByEnemy: number;
  bossStartedAt: number | null;
  bossDefeatedAt: number | null;
}

export interface TankBattleWorld {
  phase: TankBattlePhase;
  elapsedSeconds: number;
  simulationSeconds: number;
  score: number;
  waveIndex: number;
  waveBannerRemaining: number;
  pendingSpawns: PendingSpawn[];
  spawnCooldown: number;
  bossSpawned: boolean;
  player: PlayerTankState;
  headquarters: HeadquartersState;
  enemies: EnemyTankState[];
  projectiles: ProjectileState[];
  mines: MineState[];
  terrain: TerrainState[];
  explosions: ExplosionState[];
  warnings: WarningState[];
  driveInput: DriveInput;
  aimActive: boolean;
  nextEntityId: number;
  navigation: NavigationGrid;
  navigationBuildCount: number;
  topologyDirty: boolean;
  upgradeOffers: TankUpgradeCard[];
  upgradeMilestonesCompleted: number;
  upgradeSelectionLocked: boolean;
  pausedByUser: boolean;
  hiddenPaused: boolean;
  latestMessage: string | null;
  latestMessageRemaining: number;
  bossLockWarning: boolean;
  bossPhase: 0 | 1 | 2 | 3;
  metrics: TankBattleMetrics;
  random: () => number;
}

export interface TankBattleHudSnapshot {
  phase: TankBattlePhase;
  tankName: string;
  score: number;
  waveLabel: string;
  elapsedSeconds: number;
  playerHp: number;
  playerMaxHp: number;
  playerArmor: number;
  hqHp: number;
  hqMaxHp: number;
  hqArmor: number;
  activeShells: number;
  maxShells: number;
  activeMines: number;
  maxMines: number;
  reloadRemaining: number;
  reloadDuration: number;
  bossHp: number;
  bossMaxHp: number;
  bossPhase: number;
  bossLockWarning: boolean;
  latestMessage: string | null;
  paused: boolean;
}

export interface TankBattleRunSummary {
  victory: boolean;
  defeatReason: "player" | "hq" | null;
  score: number;
  rank: TankBattleRank;
  enemiesDefeated: number;
  elitesDefeated: number;
  cannonShots: number;
  cannonHits: number;
  cannonAccuracy: number;
  mineKills: number;
  damageDealt: number;
  damageTaken: number;
  hqDamageTaken: number;
  hqHpRemaining: number;
  hqMaxHp: number;
  wallsDestroyedByPlayer: number;
  wallsDestroyedByEnemy: number;
  runSeconds: number;
  bossClearSeconds: number | null;
  upgrades: TankUpgradeId[];
}

export interface TankBattleReward {
  gold: number;
  xp: number;
  rewardRate: number;
  dailyCapReached: boolean;
}

export interface TankBattleProfile {
  version: 1;
  highScore: number;
  bestRank: TankBattleRank;
  bestBossClearSeconds: number | null;
  bestAccuracy: number;
  totalRuns: number;
  bossClears: number;
  tutorialSeen: boolean;
  aimAssistEnabled: boolean;
  lastRewardDate: string;
  rewardedRunsToday: number;
  goldRewardedToday: number;
  xpRewardedToday: number;
}

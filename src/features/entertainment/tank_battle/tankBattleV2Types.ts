import type { TankBattleRunSummary } from "./tankBattleTypes";

export type Faction = "ally" | "enemy";
export type LaneId = "top" | "mid" | "bottom";
export type CardinalDirection = "up" | "down" | "left" | "right";
export type UnitAiState = "advance" | "chase" | "attack" | "return" | "dead";
export type StructureKind = "tower" | "hq";
export type CoreRarity = "silver" | "gold" | "diamond";
export type CoreCategory = "offense" | "defense" | "mobility" | "utility";
export type PowerUpKind = "heal" | "speed" | "rapid";

export interface Point { x: number; y: number; }

export interface PlayerCombatStats {
  maxHp: number;
  atk: number;
  def: number;
  moveSpeed: number;
  fireCooldown: number;
  projectileSpeed: number;
  attackRange: number;
}

export interface PlayerCoreRuntime {
  boostDurationBonus: number;
  boostCooldownReduction: number;
  projectilePierce: number;
  structureBonusDamage: number;
  boostShield: number;
  killHeal: number;
  explosiveDamage: number;
  explosiveRadius: number;
  doubleShotEvery: number;
  armorShred: number;
  armorShredSeconds: number;
  regenerationShieldCap: number;
  mobileFortressDef: number;
  mobileFortressDelay: number;
  reactiveArmorShield: number;
  reactiveArmorThreshold: number;
  overdriveCharges: number;
}

export interface PlayerState extends Point {
  radius: number;
  direction: CardinalDirection;
  hp: number;
  shield: number;
  temporaryShield: number;
  temporaryShieldRemaining: number;
  stats: PlayerCombatStats;
  level: number;
  xp: number;
  xpTotal: number;
  selectedCoreIds: string[];
  coreRuntime: PlayerCoreRuntime;
  fireRemaining: number;
  shotCounter: number;
  boostRemaining: number;
  boostCooldownRemaining: number;
  boostCharges: number;
  boostRechargeQueue: number[];
  respawnRemaining: number;
  spawnProtectionRemaining: number;
  speedPowerRemaining: number;
  rapidPowerRemaining: number;
  stationarySeconds: number;
  reactiveArmorUsedThisLife: boolean;
  alive: boolean;
}

export interface UnitState extends Point {
  id: number;
  faction: Faction;
  lane: LaneId;
  waveIndex: number;
  formationSlot: number;
  radius: number;
  direction: CardinalDirection;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  moveSpeed: number;
  attackRange: number;
  visionRange: number;
  fireCooldown: number;
  fireRemaining: number;
  state: UnitAiState;
  targetId: string | null;
  chaseOrigin: Point | null;
  senseRemaining: number;
  waypointIndex: number;
  armorShred: number;
  armorShredRemaining: number;
  lastPlayerDamageAt: number;
  alive: boolean;
}

export interface StructureState extends Point {
  id: string;
  faction: Faction;
  kind: StructureKind;
  lane: LaneId | null;
  tier: 0 | 1 | 2 | 3;
  radius: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  attackRange: number;
  fireCooldown: number;
  fireRemaining: number;
  targetId: string | null;
  targetLockRemaining: number;
  immune: boolean;
  hitFlash: number;
  lastPlayerDamageAt: number;
  alive: boolean;
}

export interface ProjectileState extends Point {
  id: number;
  faction: Faction;
  ownerKind: "player" | "unit" | "tower" | "hq";
  ownerId: string | number;
  velocityX: number;
  velocityY: number;
  radius: number;
  rawDamage: number;
  lifeRemaining: number;
  pierceRemaining: number;
  explosiveDamage: number;
  explosiveRadius: number;
  structureBonusDamage: number;
  armorShred: number;
  armorShredSeconds: number;
}

export interface TerrainState extends Point {
  id: number;
  kind: "brick" | "steel";
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  alive: boolean;
}

export interface PowerUpState extends Point {
  id: number;
  kind: PowerUpKind;
  active: boolean;
  respawnRemaining: number;
}

export interface FloatingText extends Point {
  id: number;
  text: string;
  color: string;
  lifeRemaining: number;
}

export interface CoreDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: CoreRarity;
  category: CoreCategory;
  unique: boolean;
  stackable: boolean;
}

export interface CoreChoiceState {
  rarity: CoreRarity;
  choices: CoreDefinition[];
}

export interface CameraState extends Point {}

export interface TankBattleV2Metrics {
  enemiesDefeated: number;
  cannonShots: number;
  cannonHits: number;
  damageDealt: number;
  damageTaken: number;
  hqDamageTaken: number;
  towersDestroyed: number;
  wallsDestroyedByPlayer: number;
  wallsDestroyedByEnemy: number;
}

export interface TankBattleV2World {
  phase: "playing" | "core" | "victory" | "defeat";
  elapsedSeconds: number;
  waveIndex: number;
  nextWaveAt: number;
  siegeTier: 0 | 1 | 2;
  player: PlayerState;
  units: UnitState[];
  structures: StructureState[];
  projectiles: ProjectileState[];
  terrain: TerrainState[];
  powerUps: PowerUpState[];
  floatingTexts: FloatingText[];
  camera: CameraState;
  inputDirection: CardinalDirection | null;
  fireHeld: boolean;
  pendingCoreSelections: number;
  coreChoice: CoreChoiceState | null;
  nextEntityId: number;
  nextFxId: number;
  latestMessage: string | null;
  latestMessageRemaining: number;
  metrics: TankBattleV2Metrics;
  random: () => number;
}

export interface TankBattleV2Hud {
  phase: TankBattleV2World["phase"];
  elapsedSeconds: number;
  waveIndex: number;
  siegeTier: number;
  playerHp: number;
  playerMaxHp: number;
  shield: number;
  level: number;
  xp: number;
  xpRequired: number;
  selectedCoreIds: string[];
  respawnRemaining: number;
  boostRemaining: number;
  boostCooldownRemaining: number;
  boostCharges: number;
  playerHqHp: number;
  playerHqMaxHp: number;
  enemyHqHp: number;
  enemyHqMaxHp: number;
  latestMessage: string | null;
}

export type { TankBattleRunSummary };

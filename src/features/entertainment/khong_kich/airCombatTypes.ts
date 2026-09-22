import type { EquipmentState, AcquisitionEvent } from "./airCombatEquipmentState";
import type { PlayerCombatStatus } from "./airCombatStatus";
export type AircraftId = "black_eagle" | "breaker" | "phantom" | "astra";

export type ResourceKind = "mana" | "energy";

export type SkillId =
  | "decoy"
  | "afterburner"
  | "missile_swarm"
  | "armor_shield"
  | "heavy_bomb"
  | "sweeping_cannon"
  | "invisibility"
  | "focus_laser"
  | "escort_drone"
  | "orbit_reversal" | "stellar_lance" | "starfall";

export type EnemyType =
  | "scout"
  | "fighter"
  | "attacker"
  | "kamikaze"
  | "bomber"
  | "elite"
  | "sniper"
  | "jammer"
  | "iron_fortress"
  | "acid_bomber"
  | "radar_hunter"
  | "orbit_wasp" | "arc_reaver" | "mine_seeder" | "magnetic_leech"
  | "prism_manta" | "swarm_carrier" | "micro_drone" | "cyclone_ace" | "grid_architect" | "satellite"
  | "prism_sovereign" | "mine_warden" | "polarity_warden" | "swarm_overlord" | "arc_reaver_prime"
  | "boss";

export type CoreTier = "silver" | "gold" | "diamond";

export type CoreCategory =
  | "offense"
  | "defense"
  | "resource"
  | "weapon"
  | "skill";

export type CoreId = string;

export interface CombatStats {
  criticalChance: number;
  criticalDamageMultiplier: number;
  maxHp: number;
  armor: number;
  firepower: number;
  fireRate: number;
  maxResource: number;
  resourceRegen: number;
}

export interface AircraftGrowth extends CombatStats {}

export interface AircraftConfig {
  id: AircraftId;
  code: string;
  name: string;
  role: string;
  description: string;
  color: string;
  accent: string;
  resourceKind: ResourceKind;
  baseStats: CombatStats;
  growth: AircraftGrowth;
  hpRegen: { base: number; growth: number };
  skillIds: readonly [SkillId, SkillId, SkillId];
}

export interface SkillConfig {
  id: SkillId;
  aircraftId: AircraftId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  cost: number;
  cooldown: number;
  duration?: number;
  damageMultiplier?: number;
}

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  baseHp: number;
  baseArmor: number;
  speed: number;
  radius: number;
  score: number;
  combatXp: number;
  projectileDamage: number;
  collisionDamage: number;
  fireInterval: number;
  color: string;
}

export interface GameplaySafeRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface WeaponModifiers {
  penetration: number;
  penetrationDamageMultiplier: number;
  splashDamageMultiplier: number;
  chargedEvery: number;
  chargedMultiplier: number;
  projectileCount: number;
  perProjectileMultiplier: number;
  bounceCount: number;
  bounceDamageMultiplier: number;
  annihilatorEvery: number;
  annihilatorMultiplier: number;
}

export interface AircraftModifiers {
  criticalChanceFlat: number;
  criticalDamageMultiplierFlat: number;
  maxHpFlat: number;
  armorFlat: number;
  firepowerFlat: number;
  fireRateFlat: number;
  hpRegen: number;
  cooldownReduction: number;
  maxResourceFlat: number;
  resourceRegenFlat: number;
  weapon: WeaponModifiers;
  skillCores: Partial<Record<SkillId, CoreId>>;
}

export interface AircraftCombatState {
  equipment?: EquipmentState;
  status: PlayerCombatStatus;
  aircraftId: AircraftId;
  level: number;
  combatXp: number;
  currentHp: number;
  currentResource: number;
  modifiers: AircraftModifiers;
  cooldowns: Partial<Record<SkillId, number>>;
  selectedCores: CoreId[];
  activeEffects: Partial<Record<SkillId, number>>;
  activeEffectDurations?: Partial<Record<SkillId, number>>;
  droneActive: boolean;
  dronePhase?: "deploying" | "active" | "returning";
  droneTransitionRemaining?: number;
  basicShotsFired: number;
  pendingMilestones: number[];
  coreState: CoreRuntimeState;
}

export interface EffectiveAircraftStats extends CombatStats {
  dualHpBonus?: number;
  dualResourceBonus?: number;
  currentHp: number;
  currentResource: number;
  cooldownReduction: number;
  hpRegen: number;
  resourceKind: ResourceKind;
  weapon: WeaponModifiers;
}

export type CoreSystem = "attack" | "defense" | "resource" | "skill" | "utility";

export interface CoreDefinition {
  system: CoreSystem;
  skillSlot?: number;
  id: CoreId;
  name: string;
  description: string;
  icon: string;
  category: CoreCategory;
  tiers: readonly CoreTier[];
  aircraftIds?: readonly AircraftId[];
  skillId?: SkillId;
}

export interface CoreCard {
  system: CoreSystem;
  skillSlot?: number;
  id: CoreId;
  tier: CoreTier;
  name: string;
  description: string;
  icon: string;
  category: CoreCategory;
  valueLabel: string;
  previewLabel?: string;
}

export interface LevelUpResult {
  levelsGained: number;
  coreSelectionsDue: number;
}

export interface SkillCastResult {
  cast: boolean;
  reason?: "cooldown" | "resource" | "invalid";
  resourceSpent: number;
  toggledOff?: boolean;
}

export interface AirCombatRunSummary {
  astraTelemetry?:Record<string,number>;
  stageId: number;
  stageVictory: boolean;
  stageFirstClear: boolean;
  aircraftId: AircraftId;
  score: number;
  rank: AirCombatRank;
  enemiesDefeated: number;
  elitesDefeated: number;
  bossDefeated: boolean;
  maxCombo: number;
  survivalSeconds: number;
  combatLevel: number;
  finalFirepower: number;
  damageDealt: number;
  damageTaken: number;
  hitsReceived: number;
  bossClearSeconds: number | null;
  destroyed: boolean;
}

export type AirCombatRank = "C" | "B" | "A" | "S" | "SS";

export interface AirCombatReward {
  gold: number;
  xp: number;
  rewardRate: number;
  dailyCapReached: boolean;
}

export interface AirCombatCampaignProgress {
  version: 1;
  highestStageCleared: number;
  lastSelectedStage?: number;
}

export interface AirCombatProfile {
  campaign: AirCombatCampaignProgress;
  version: 2;
  highScore: number;
  highestCombo: number;
  totalRuns: number;
  bossClears: number;
  bestRank: AirCombatRank;
  bestBossClearSeconds: number | null;
  preferredAircraft: AircraftId;
  lastRewardDate: string;
  rewardedRunsToday: number;
  goldRewardedToday: number;
  xpRewardedToday: number;
}

export interface AirCombatHudSnapshot {
  dps: number;
  stats: EffectiveAircraftStats;
  score: number;
  comboKills: number;
  comboMultiplier: number;
  elapsedSeconds: number;
  waveLabel: string;
  waveIndex: number;
  waveState: "combat" | "countdown" | "announcement";
  guardianSlots: boolean[];
  waveCountdown: number;
  combatXpRequired: number;
  bossHp: number;
  bossMaxHp: number;
  bossPhase: number;
  paused: boolean;
  pauseLabel: string | null;
  cooldowns: Partial<Record<SkillId, number>>;
  droneActive: boolean;
  latestMessage: string | null;
}

/** Run-local event state; no persistent profile/schema changes. Timers use combat time. */
export interface CoreRuntimeState {
  syncedMaxHp?: number;
  release?: import("./airCombatReleaseState").ReleaseCoreState;
  expansion?: import("./airCombatExpansion").ExpansionState;
  /** Explicit run-local acquisition journal, including conversion rewards; bounded by the finite catalog. */
  acquisitions: AcquisitionEvent[];
  nextAcquisitionId: number;
  healingTotal: number;
  telemetry: Record<CoreId, Partial<Record<import("./airCombatTelemetry").CoreMetric, number>>>;
  /** Runtime-only budget belonging to the current invisibility cast. */
  emergencyRepair?: { remaining: number; durationRemaining: number };
  time: number;
  lastDamage: number;
  lastMove: number;
  lastKill: number;
  kills: number;
  skillCasts: number;
  killTimes: number[];
  stacks: Record<string, number>;
  timers: Record<string, number>;
  shields: Record<string, import("./airCombatExpansion").AbsorbShield>;
  consumed: Set<string>;
  criticalBudget: number;
  criticalWindow: number;
  droneCycle: number;
  deferredCooldowns: Partial<Record<SkillId, number>>;
}

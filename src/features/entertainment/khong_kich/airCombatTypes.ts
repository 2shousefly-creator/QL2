import type { EquipmentState, AcquisitionEvent } from "./airCombatEquipmentState";
import type { PlayerCombatStatus } from "./airCombatStatus";
export type AircraftId = "terra" | "sylva" | "black_eagle" | "breaker" | "phantom" | "astra" | "cinder" | "riptide" | "argent";

export type ResourceKind = "mana" | "energy";

export type PassiveId = "terra_geopressure_core" | "sylva_acid_rounds" | "viper_follow_up" | "titan_alloy_rounds" | "phantom_backup_battery" | "astra_stellar_mark" | "cinder_thermal_round" | "riptide_afterwash" | "argent_blade_genesis";

export type SkillId =
  | "terra_reactive_rock_armor" | "terra_seismic_cannon" | "terra_strata_clamp" | "terra_geocore_overdrive"
  | "sylva_symbiosis" | "sylva_acid_burst" | "sylva_parasitic_seed" | "sylva_deathbloom"
  | "argent_guard_stance" | "argent_blade_cast" | "argent_blade_recall" | "argent_heavenly_blade_array"
  | "riptide_wellspring" | "riptide_tidal_blades" | "riptide_confluence" | "riptide_waterform"
  | "cinder_fire_shield" | "cinder_fuel_barrage" | "cinder_heat_wave" | "cinder_inferno_beam"
  | "predator_lock" | "gravity_anchor" | "electronic_interference" | "twin_reflection"
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
 | "swarm_needler" | "razor_glider" | "aegis_beetle" | "siege_spitter" | "signal_weaver" | "repair_wasp" | "razor_marshal" | "aegis_regent" | "bombard_prelate" | "disruptor_monarch" | "forge_matron" | "brood_ark" | "crucible_ark"
  | "mirage_wisp"
  | "parallax_lancer"
  | "holo_bastion"
  | "veil_weaver"
  | "echo_hunter"
  | "phantom_carrier"
  | "mirror_arbiter"
  | "null_jailer"
  | "refraction_ace"
  | "glass_monarch"
  | "phantom_executioner"
  | "veil_architect"
  | "echo_bastion_prime"
  | "parallax_seraph"
  | "fracture_sovereign"
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
  | "spark_wasp"
  | "volt_lancer"
  | "storm_capacitor"
  | "storm_weaver"
  | "ion_hunter"
  | "thunderhead"
  | "storm_herald"
  | "volt_executioner"
  | "capacitor_prime"
  | "ion_arbiter"
  | "thunder_bastion"
  | "arc_seraph"
  | "storm_weaver_prime"
  | "storm_node"
  | "omega_storm_node"
  | "storm_conductor"
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

export type AircraftGrowth = Omit<CombatStats, "fireRate">;

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
  fireRateRatio: number;
  fireRateGrowthPct: number;
  hpRegen: { base: number; growth: number };
  skillIds: readonly [SkillId, SkillId, SkillId, SkillId];
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
  bonusFireRatePct: number;
  hpRegen: number;
  skillHaste: number;
  maxResourceFlat: number;
  resourceRegenFlat: number;
  weapon: WeaponModifiers;
}

export interface AircraftCombatState {
 hiveSquad?: boolean;
  laserPhase?: "charge" | "firing";
  /** Session-only policy; never persisted in AirCombatProfile. */
  duel?: { selectionLevel: number; allowedCoreIds?: ReadonlySet<string>; healingBlocked: boolean };
  equipment?: EquipmentState;
  status: PlayerCombatStatus;
  aircraftId: AircraftId;
  level: number;
  combatXp: number;
  skillRanks: Partial<Record<SkillId, number>>;
  skillPoints: number;
  skillUpAt: Partial<Record<SkillId, number>>;
  currentHp: number;
  currentResource: number;
  modifiers: AircraftModifiers;
  cooldowns: Partial<Record<SkillId, number>>;
  selectedCores: CoreId[];
  activeEffects: Partial<Record<SkillId, number>>;
  activeEffectDurations?: Partial<Record<SkillId, number>>;
  droneActive: boolean;
  droneActivatedAt?: number;
  dronePhase?: "deploying" | "active" | "returning";
  droneTransitionRemaining?: number;
  basicShotsFired: number;
  pendingMilestones: number[];
  coreState: CoreRuntimeState;
}

export interface EffectiveAircraftStats extends CombatStats {
  baseFireRate: number;
  fireRateRatio: number;
  fireRateGrowthPct: number;
  bonusFireRatePct: number;
  totalFireRateMultiplier: number;
  bonusResourceRegenPct: number;
  permanentResourceRegenPct: number;
  permanentHpRegenBonus: number;
  totalResourceRegenMultiplier: number;
  totalHpRegenMultiplier: number;
  dualHpBonus?: number;
  dualResourceBonus?: number;
  currentHp: number;
  currentResource: number;
  skillHaste: number;
  hpRegen: number;
  resourceKind: ResourceKind;
  weapon: WeaponModifiers;
}

export type CoreSystem = "attack" | "defense" | "resource" | "skill" | "utility";

export interface CoreDefinition {
  availability?: string;
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
  availability?: string;
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
  squad?: {aircraftId:AircraftId;damage:number}[];
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

export interface CombatAnnouncement {
  serial: number; text: string; durationMs: number; expiresAtMs: number;
}

export interface AirCombatHudSnapshot {
  healing: { current:number; baseline:number };
  grayHealth:number;
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
  mirror?: { grayHealth:number; hp:number; maxHp:number; resource:number; maxResource:number };
  bossMaxHp: number;
  bossPhase: number;
  paused: boolean;
  pauseLabel: string | null;
  cooldowns: Partial<Record<SkillId, number>>;
  droneActive: boolean;
  latestMessage: string | null;
  announcement: CombatAnnouncement;
}

/** Run-local event state; no persistent profile/schema changes. Timers use combat time. */
export interface CoreRuntimeState {
  /** Every offer/grant in this run, including skipped and Pandora-removed Cores. */
  encounteredCoreIds: Set<CoreId>;
  skillCooldownDurations: Partial<Record<SkillId, number>>;
  syncedMaxHp?: number;
  release?: import("./airCombatReleaseState").ReleaseCoreState;
  expansion?: import("./airCombatExpansion").ExpansionState;
  /** Explicit run-local acquisition journal, including conversion rewards; bounded by the finite catalog. */
  acquisitions: AcquisitionEvent[];
  nextAcquisitionId: number;
  healingTotal: number;
  telemetry: Record<CoreId, Partial<Record<import("./airCombatTelemetry").CoreMetric, number>>>;
  /** Runtime-only budget belonging to the current invisibility cast. */
  emergencyRepair?: { remaining: number; durationRemaining: number; rate: number };
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
  deferredCooldowns: Partial<Record<SkillId, number>>;
}

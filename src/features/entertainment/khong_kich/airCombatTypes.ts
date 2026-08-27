export type AircraftId = "black_eagle" | "breaker" | "phantom";

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
  | "escort_drone";

export type EnemyType =
  | "scout"
  | "fighter"
  | "attacker"
  | "kamikaze"
  | "bomber"
  | "elite"
  | "boss_guard"
  | "boss";

export type CoreTier = "silver" | "gold" | "diamond";

export type CoreCategory =
  | "offense"
  | "defense"
  | "mobility"
  | "resource"
  | "weapon"
  | "skill";

export type CoreId =
  | "firepower"
  | "armor"
  | "max_hp"
  | "fire_rate"
  | "move_speed"
  | "repair"
  | "cooldown"
  | "mana_capacity"
  | "mana_regen"
  | "energy_regen"
  | "penetration"
  | "explosive_rounds"
  | "charged_round"
  | "dual_cannon"
  | "ricochet"
  | "annihilator_round"
  | "black_eagle_decoy"
  | "black_eagle_afterburner"
  | "black_eagle_missile"
  | "breaker_shield"
  | "breaker_bomb"
  | "breaker_sweep"
  | "phantom_invisibility"
  | "phantom_laser"
  | "phantom_drone";

export interface CombatStats {
  maxHp: number;
  armor: number;
  firepower: number;
  fireRate: number;
  moveSpeed: number;
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
  maxHpFlat: number;
  armorFlat: number;
  firepowerFlat: number;
  fireRateFlat: number;
  moveSpeedFlat: number;
  hpRegen: number;
  cooldownReduction: number;
  maxResourceFlat: number;
  resourceRegenFlat: number;
  weapon: WeaponModifiers;
  skillUpgrades: Partial<Record<SkillId, true>>;
}

export interface AircraftCombatState {
  aircraftId: AircraftId;
  level: number;
  combatXp: number;
  currentHp: number;
  currentResource: number;
  modifiers: AircraftModifiers;
  cooldowns: Partial<Record<SkillId, number>>;
  selectedCores: CoreId[];
  activeEffects: Partial<Record<SkillId, number>>;
  droneActive: boolean;
  basicShotsFired: number;
}

export interface EffectiveAircraftStats extends CombatStats {
  currentHp: number;
  currentResource: number;
  cooldownReduction: number;
  hpRegen: number;
  resourceKind: ResourceKind;
  weapon: WeaponModifiers;
}

export interface CoreDefinition {
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

export interface AirCombatProfile {
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
  stats: EffectiveAircraftStats;
  score: number;
  comboKills: number;
  comboMultiplier: number;
  elapsedSeconds: number;
  waveLabel: string;
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

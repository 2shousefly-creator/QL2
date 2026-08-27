/**
 * Chiến Tuyến V2 domain contracts.
 *
 * Persistent data intentionally contains no Gold wallet. Gold belongs to the
 * shared Tăng Gia farm state and is accessed through sharedGold.ts.
 */

export const TROOP_TYPES = [
  "infantry",
  "artillery",
  "armor",
  "commando",
  "medic",
  "anti_tank",
  "engineer",
  "chemical",
  "air_force",
  "guard",
  "pioneer",
  "scout",
  "marksman",
  "electronic_warfare",
  "special_ops",
  "divine_medic",
  "forensic_medic",
  "martial_artist",
] as const;

export type TroopType = (typeof TROOP_TYPES)[number];

export const FORMATION_SLOTS = [
  "back_left",
  "back_center",
  "back_right",
  "front_left",
  "front_center",
  "front_right",
] as const;

export type FormationSlotId = (typeof FORMATION_SLOTS)[number];
export type FormationRow = "back" | "front";
export type FormationColumn = "left" | "center" | "right";
export type TargetPriority = "front_first" | "back_first";
export type BattleSide = "player" | "enemy";
/** Legacy save-only field; runtime presentation speed is derived from BattleState.round. */
export type BattleSpeed = 2;
export type EffectDurationClock = "source_action_turn" | "target_action_turn" | "battle_round";
export type UltimateId = `${TroopType}_ultimate`;

export interface UltimateDefinition {
  ultimateId: UltimateId;
  ultimateRageRequired: number;
  name: string | null;
  description: string | null;
  implemented: boolean;
}

export interface FormationSlotDefinition {
  id: FormationSlotId;
  row: FormationRow;
  column: FormationColumn;
  label: string;
}

export interface FormationAssignment {
  slotId: FormationSlotId;
  troopType: TroopType;
  /** Optional stable id. Templates omit it; reserved battle units include it. */
  instanceId?: string;
}

export interface FormationTemplate {
  assignments: FormationAssignment[];
}

export interface FormationValidationResult {
  valid: boolean;
  errors: Array<
    | "too_many_troops"
    | "duplicate_slot"
    | "too_many_same_type"
    | "unavailable_troop"
    | "empty_formation"
    | "invalid_slot"
    | "invalid_troop_type"
  >;
}

export interface TroopStats {
  maxHp: number;
  attack: number;
  defense: number;
  /** Probability in [0, 1]. Canonical base value is 0.25. */
  critChance: number;
  speed: number;
}

export interface TroopStatGrowth {
  maxHp: number;
  attack: number;
  defense: number;
}

export type TroopPassiveId =
  | "infantry_missing_hp_damage"
  | "artillery_row_blast"
  | "armor_early_reduction"
  | "commando_early_crit"
  | "medic_casualty_care"
  | "anti_tank_max_hp_hit"
  | "engineer_reflect"
  | "chemical_round_aoe"
  | "air_force_attack_growth"
  | "guard_lowest_hp_shield"
  | "pioneer_last_stand"
  | "scout_timeline_advance"
  | "marksman_focus"
  | "electronic_rage_interference"
  | "special_ops_tracking"
  | "divine_medic_rescue"
  | "forensic_medic_suppression"
  | "martial_artist_soft_over_hard";

export type PassiveTrigger =
  | "after_own_action_turn"
  | "before_basic_attack"
  | "after_basic_attack"
  | "when_directly_damaged"
  | "while_receiving_damage"
  | "while_dealing_damage"
  | "when_lethal_damage"
  | "when_basic_rage_gained";

export interface TroopPassiveDefinition {
  id: TroopPassiveId;
  name: string;
  description: string;
  trigger: PassiveTrigger;
  /** Machine-readable canonical tuning values for the combat engine and UI. */
  parameters: Readonly<Record<string, number | boolean | string>>;
}

export interface TroopDefinition {
  id: TroopType;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  role: string;
  targetPriority: TargetPriority;
  baseStats: Readonly<TroopStats>;
  growth: Readonly<TroopStatGrowth>;
  passive: Readonly<TroopPassiveDefinition>;
}

export type BossId =
  | "armored_war_machine"
  | "firepower_fortress"
  | "special_ops_ghost"
  | "chemical_destroyer"
  | "armored_commander"
  | "chief_medic"
  | "ultimate_hunter"
  | "signal_overlord"
  | "annihilation_airstrike"
  | "supreme_commander";

export interface BossDefinition {
  id: BossId;
  name: string;
  icon: string;
  role: string;
  targetPriority: TargetPriority;
  passiveId:
    | "armor_early_reduction"
    | "artillery_row_blast"
    | "commando_early_crit"
    | "chemical_round_aoe"
    | "air_force_attack_growth"
    | "engineer_reflect"
    | "medic_casualty_care"
    | "anti_tank_max_hp_hit"
    | "electronic_rage_interference";
  baseTroopType: TroopType;
  hpMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  speedMultiplier: number;
}

export interface EnemyFormationAssignment {
  slotId: FormationSlotId;
  troopType: TroopType | null;
  bossId: BossId | null;
  level: number;
  statMultiplier: number;
}

export interface TowerChapterDefinition {
  chapter: number;
  name: string;
  floors: readonly [number, number];
  focus: string;
  theme: string;
  particle: "dust" | "sand" | "fog" | "toxic" | "sparks" | "embers" | "snow" | "electric" | "ash" | "lightning";
}

export interface TowerFloorDefinition {
  floorNumber: number;
  recommendedLevel: number;
  enemyLevel: number;
  statMultiplier: number;
  firstClearGold: number;
  isBoss: boolean;
  bossId: BossId | null;
  chapter: number;
  theme: string;
  title: string;
  archetype: string;
  enemyFormation: readonly EnemyFormationAssignment[];
}

export interface TrainingJob {
  id: string;
  troopType: TroopType;
  startedAt: number;
  completeAt: number;
  costGold: number;
  emergency: boolean;
}

export interface TroopUpgradeJob {
  id: string;
  troopType: TroopType;
  fromLevel: number;
  targetLevel: number;
  startedAt: number;
  completeAt: number;
  costGold: number;
}

export interface BarracksUpgradeJob {
  id: string;
  fromLevel: number;
  targetLevel: number;
  startedAt: number;
  completeAt: number;
  costGold: number;
}

export interface ReservedBattleUnit {
  instanceId: string;
  troopType: TroopType;
  level: number;
  slotId: FormationSlotId;
}

export interface ActiveBattleRecovery {
  battleId: string;
  floorNumber: number;
  startedAt: number;
  formation: FormationTemplate;
  deployedUnits: ReservedBattleUnit[];
  /** Recorded immediately as units die. These units are never returned. */
  casualtyInstanceIds: string[];
  status: "active" | "settling";
}

export interface ChienTuyenProfileV2 {
  version: 2;
  barracksLevel: number;
  troopLevels: Record<TroopType, number>;
  readyCounts: Record<TroopType, number>;
  trainingJobs: TrainingJob[];
  troopUpgradeJobs: Partial<Record<TroopType, TroopUpgradeJob>>;
  barracksUpgradeJob: BarracksUpgradeJob | null;
  highestClearedFloor: number;
  highestUnlockedFloor: number;
  claimedFirstClearFloors: number[];
  selectedFloor: number;
  lastFormation: FormationTemplate | null;
  battleSpeed: BattleSpeed;
  tutorialCompleted: boolean;
  towerCompleted: boolean;
  activeBattleRecovery: ActiveBattleRecovery | null;
  updatedAt: number;
}

/** The V2 profile is the only runtime profile after the Big Update. */
export type ChienTuyenProfile = ChienTuyenProfileV2;

export interface CompletedJobSummary {
  trainingJobIds: string[];
  troopUpgradeTypes: TroopType[];
  barracksUpgradeCompleted: boolean;
}

export interface ProfileRehydrateResult {
  profile: ChienTuyenProfileV2;
  completed: CompletedJobSummary;
  recoveredSurvivorCounts: Partial<Record<TroopType, number>>;
}

export interface ShieldEntry {
  sourceUnitId: string;
  amount: number;
  kind?: "guard" | "guard_ultimate" | "pioneer_tenacity";
  durationClock?: EffectDurationClock;
  appliedSourceActionTurn?: number;
  expiresAfterSourceActionTurn?: number;
  remainingActionTurns?: number;
}

export type BattleStatusType =
  | "corrosion"
  | "anti_tank_defense_down"
  | "engineer_toughness"
  | "infantry_death_refusal"
  | "stun"
  | "healing_reduction"
  | "tracking"
  | "silence"
  | "rescue"
  | "forensic_suppression";

export interface BattleStatus {
  id: string;
  sourceUnitId: string;
  type: BattleStatusType;
  polarity: "buff" | "debuff";
  cleansable: boolean;
  /** False only for permanent or once-per-battle effects that cannot be dispelled. */
  removable?: boolean;
  stackPolicy: "refresh" | "replace";
  durationClock?: EffectDurationClock;
  appliedSourceActionTurn?: number;
  appliedTargetActionTurn?: number;
  expiresAfterSourceActionTurn?: number;
  expiresAfterTargetActionTurn?: number;
  remainingActionTurns?: number;
  amount?: number;
  reflectRatioOverride?: number;
  healingReceivedMultiplier?: number;
  shieldReceivedMultiplier?: number;
  damageReceivedMultiplier?: number;
  effectKind?: "forensic_passive" | "forensic_ultimate" | "action_stun";
}

export interface BattleUnit {
  instanceId: string;
  side: BattleSide;
  troopType: TroopType | null;
  bossId?: BossId;
  isBoss?: boolean;
  name: string;
  icon: string;
  slotId: FormationSlotId;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  battleBaseAttack: number;
  defense: number;
  battleBaseDefense: number;
  critChance: number;
  speed: number;
  /** Absolute simulation position on the shared initiative timeline. */
  nextActionAt: number;
  /** Completed opportunities owned by this unit. Starts at zero. */
  actionTurnCount: number;
  battleBaseSpeed: number;
  statReferenceAttack: number;
  statReferenceDefense: number;
  statReferenceCritChance: number;
  statReferenceSpeed: number;
  targetPriority: TargetPriority;
  passiveId: TroopPassiveId | BossDefinition["passiveId"];
  passiveStacks: number;
  lastDamagedEnemyId: string | null;
  focusTargetId: string | null;
  focusStacks: number;
  damageMultiplier: number;
  corrosionStacks: number;
  corrosionBaseDefense: number | null;
  pioneerLastStandUsed: boolean;
  martialArtistGuardStacks?: number;
  martialArtistUltimateStance?: MartialArtistUltimateStance;
  rage: number;
  ultimateRageRequired: number;
  ultimateId: UltimateId;
  armorUltimateDefenseBonus: number;
  armorUltimateExpiresAfterActionTurn: number | null;
  statuses: BattleStatus[];
  shields: ShieldEntry[];
  alive: boolean;
}

export type BattleOutcome = "player_victory" | "enemy_victory" | "draw" | null;

export type CombatEventType =
  | "battle_started"
  | "round_started"
  | "timeline_reinserted"
  | "attack"
  | "rage_gained"
  | "ultimate_ready"
  | "ultimate_started"
  | "ultimate_vfx"
  | "ultimate_hit"
  | "ultimate_buff"
  | "ultimate_kill_chain"
  | "ultimate_completed"
  | "ultimate_resolved"
  | "action_completed"
  | "debuff_cleansed"
  | "defense_down_applied"
  | "defense_down_removed"
  | "taunt_applied"
  | "reflect_buff_applied"
  | "taunt_removed"
  | "reflect_buff_removed"
  | "death_refusal_applied"
  | "death_refusal_removed"
  | "stun_applied"
  | "action_skipped_stun"
  | "stun_removed"
  | "tracking_applied"
  | "silence_applied"
  | "silence_removed"
  | "rescue_applied"
  | "forensic_suppression_applied"
  | "timeline_advanced"
  | "rage_reduced"
  | "damage"
  | "critical"
  | "artillery_aoe"
  | "heal"
  | "shield"
  | "shield_removed"
  | "martial_artist_guard_gained"
  | "martial_artist_guard_blocked"
  | "beneficial_effects_dispelled"
  | "martial_artist_stance_changed"
  | "reflect"
  | "chemical_aoe"
  | "corrosion"
  | "pioneer_last_stand"
  | "passive_growth"
  | "death"
  | "round_ended"
  | "battle_ended";

export interface CombatEvent {
  id: string;
  type: CombatEventType;
  round: number;
  sourceUnitId?: string;
  targetUnitIds?: string[];
  amount?: number;
  critical?: boolean;
  side?: BattleSide;
  rage?: number;
  /** Rage held immediately before an Ultimate commit reset it to zero. */
  rageBefore?: number;
  /** Stable id shared by Basic and an immediate chained Ultimate. */
  actionId?: string;
  actionTurnCount?: number;
  ultimateRageRequired?: number;
  ultimateId?: UltimateId;
  hitIndex?: number;
  hpDamage?: number;
  shieldDamage?: number;
  blocked?: boolean;
  martialArtistStance?: MartialArtistUltimateStance;
  damageSequenceId?: string;
  buffKind?: "defense" | "defense_expired";
  durationActionTurns?: number;
  remainingActionTurns?: number;
  durationClock?: EffectDurationClock;
  statusId?: string;
  statusType?: BattleStatusType;
  actionKind?: "basic" | "ultimate" | "basic_ultimate" | "stun_skip";
  nextActionAt?: number;
  message?: string;
}

export type MartialArtistUltimateStance = "phi_long" | "giang_long";

export interface DamageSequenceContext {
  id: string;
  sourceUnitId: string;
  sourceSide: BattleSide;
  blockReadyTargetUnitIds: string[];
  blockedTargetUnitIds: string[];
  outgoingGuardGranted: boolean;
  incomingGuardGrantedUnitIds: string[];
}

export interface BattleState {
  version: 4;
  battleId: string;
  floorNumber: number;
  matchSeed: string;
  rngState: number;
  round: number;
  /** Absolute time of the latest consumed action opportunity. Never resets per round. */
  timelineTime: number;
  /** Alive-unit snapshot captured when the current round starts. */
  roundRequiredUnitIds: string[];
  /** Snapshot members that have acted or consumed a Stun opportunity this round. */
  roundCompletedUnitIds: string[];
  /** Transient action context used to keep chained events and source clocks coherent. */
  activeActionId: string | null;
  activeActionUnitId: string | null;
  /** Transient direct-damage boundary used by multi-hit and area attacks. */
  activeDamageSequence?: DamageSequenceContext | null;
  units: BattleUnit[];
  events: CombatEvent[];
  outcome: BattleOutcome;
}

export interface BattleCreateInput {
  battleId: string;
  floor: TowerFloorDefinition;
  playerUnits: ReservedBattleUnit[];
  matchSeed: string;
}

export interface BattleUnitStatistics {
  instanceId: string;
  side: BattleSide;
  troopType: TroopType | null;
  bossId?: BossId;
  name: string;
  icon: string;
  level: number;
  damageDealt: number;
  damageTaken: number;
  shieldCreated: number;
  healingDone: number;
  actionsTaken: number;
  ultimatesCast: number;
  kills: number;
  stunsApplied: number;
  actionsDenied: number;
  debuffsApplied: number;
}

export interface BattleResult {
  outcome: Exclude<BattleOutcome, null>;
  floorNumber: number;
  rounds: number;
  casualtyInstanceIds: string[];
  survivorInstanceIds: string[];
  events: CombatEvent[];
  unitStatistics: BattleUnitStatistics[];
}

export interface FloorSettlementResult {
  profile: ChienTuyenProfileV2;
  rewardGold: number;
  firstClear: boolean;
  nextFloorUnlocked: number;
}

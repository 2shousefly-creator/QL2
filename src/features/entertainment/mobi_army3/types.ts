export type ClassId = "gunner" | "engineer" | "scout";
export type WeaponId =
  | "standard"
  | "heavy"
  | "mortar"
  | "cluster"
  | "drill"
  | "rocket";
export type ItemId =
  | "boost"
  | "double"
  | "triple"
  | "shield"
  | "heal"
  | "blink"
  | "steady"
  | "airstrike";
export type AmmoId =
  | "normal"
  | "heavy"
  | "burst"
  | "cluster"
  | "drill"
  | "bounce"
  | "airburst"
  | "burn";
export type EnemyId =
  | "rookie"
  | "sniper"
  | "engineer"
  | "elite"
  | "dummy"
  | "drone"
  | "structure";
export type BossId = "warden" | "miner" | "fortress" | "siege";
export type MapId = "dawn" | "pass" | "wind" | "outpost" | "citadel";
export type Objective = {
  kind:
    | "eliminate"
    | "boss"
    | "defend"
    | "survive"
    | "destroy"
    | "rescue"
    | "waves"
    | "puzzle";
  turns?: number;
};
export interface Spawn {
  enemy?: EnemyId;
  boss?: BossId;
  x: number;
}
export interface Stage {
  id: string;
  name: string;
  chapter: number;
  map: MapId;
  briefing: string;
  objective: Objective;
  enemies: Spawn[];
  waves?: Spawn[][];
  playerX: number;
  allyX?: number;
  wind?: number;
  par: number;
  maxRounds: number;
  weapon?: WeaponId;
  tutorial?: boolean;
}
export interface WeaponDefinition {
  id: WeaponId;
  name: string;
  description: string;
  unlock: number;
  ammo: AmmoId;
  damage: number;
  blast: number;
  crater: number;
  speed: number;
  wind: number;
  gravity: number;
  angles: [number, number];
  count: number;
  spread: number;
}
export interface AmmoDefinition {
  id: AmmoId;
  name: string;
  splitAt?: number;
  splitCount?: number;
  bounce?: number;
  drillDistance?: number;
  fuse?: number;
  burnTurns?: number;
}
export interface ItemDefinition {
  id: ItemId;
  name: string;
  description: string;
  cost: number;
  unlock: number;
  effect:
    | "attack"
    | "count"
    | "shield"
    | "heal"
    | "blink"
    | "wind"
    | "airstrike";
  amount: number;
}
export interface ClassDefinition {
  id: ClassId;
  name: string;
  description: string;
  unlock: number;
  hp: number;
  attack: number;
  defense: number;
  mobility: number;
  crater: number;
}
export interface MapDefinition {
  id: MapId;
  name: string;
  width: number;
  height: number;
  wind: number;
  surface: [number, number][];
  gaps: [number, number][];
  rock: { x: number; y: number; width: number; height: number }[];
  tint: string;
}
export interface BossPhase {
  ammo?: AmmoId;
  threshold: number;
  weapon: WeaponId;
  shield: number;
  hazardRadius: number;
  hazardDamage: number;
  summonEvery: number;
  weakMultiplier: number;
}
export interface BossDefinition {
  id: BossId;
  name: string;
  hp: number;
  sprite: string;
  phases: BossPhase[];
}
export interface Loadout {
  classId: ClassId;
  weaponId: WeaponId;
  items: ItemId[];
  cosmetic: "olive" | "steel" | "amber";
}
export interface RunTicket {
  id: string;
  sequence: number;
  stageId: string;
  seed: number;
  loadout: Loadout;
  upgrade: number;
  level: number;
  startedAt: number;
}
export interface RunResult {
  runId: string;
  stageId: string;
  won: boolean;
  rounds: number;
  hpRatio: number;
  reason: string;
}
export interface Receipt extends RunResult {
  coins: number;
  xp: number;
  gold: number;
  sharedXp: number;
  first: boolean;
  stars: number;
}
export interface ArmyProfile {
  version: 1;
  xp: number;
  coins: number;
  upgrade: number;
  loadout: Loadout;
  inventory: Record<ItemId, number>;
  records: Record<
    string,
    { stars: number; clears: number; bestRounds: number }
  >;
  nextRun: number;
  activeRun: RunTicket | null;
  receipt: Receipt | null;
  rewards: { date: string; gold: number; xp: number };
  tutorialDone: boolean;
  settings: {
    volume: number;
    reducedMotion: boolean;
    quality: "low" | "high";
    aimAssist: boolean;
    difficulty: "easy" | "normal" | "hard";
  };
}
export type Phase = "planning" | "charge" | "flight" | "resolve" | "finished";
export type Animation =
  | "idle"
  | "walk"
  | "aim"
  | "charge"
  | "shoot"
  | "hit"
  | "fall"
  | "death"
  | "victory"
  | "skill";
export interface Unit {
  ammoOverride?: AmmoId;
  statuses: StatusInstance[];
  id: number;
  team: "player" | "enemy";
  kind: "player" | "enemy" | "boss" | "ally";
  name: string;
  sprite: string;
  x: number;
  y: number;
  vy: number;
  fallFrom: number;
  radius: number;
  height: number;
  hp: number;
  maxHp: number;
  defense: number;
  attack: number;
  crater: number;
  shield: number;
  movement: number;
  maxMovement: number;
  facing: -1 | 1;
  angle: number;
  power: number;
  weapon: WeaponId;
  ai?: EnemyId;
  boss?: BossId;
  bossPhase: number;
  turns: number;
  grounded: boolean;
  animation: Animation;
  animTime: number;
}
export type StatusId = "burn" | "barrier" | "slow" | "stun";
export interface StatusInstance {
  id: StatusId;
  source: number;
  remaining: number;
  magnitude: number;
  appliedTurn: number;
}
export interface Projectile {
  id: number;
  owner: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  weapon: WeaponId;
  ammo: AmmoId;
  damage: number;
  crater: number;
  windScale: number;
  bounces: number;
  drillLeft: number;
  drilling: boolean;
  split: boolean;
}
export interface CombatEvent {
  id: number;
  type:
    | "turn"
    | "move"
    | "fire"
    | "explosion"
    | "damage"
    | "heal"
    | "fall"
    | "death"
    | "phase"
    | "finish"
    | "skill";
  x: number;
  y: number;
  value?: number;
  text?: string;
}
export interface Hazard {
  id: number;
  owner: number;
  x: number;
  radius: number;
  damage: number;
  dueRound: number;
  burnTurns: number;
}
export interface Shot {
  angle: number;
  power: number;
  facing: -1 | 1;
  score: number;
}
export interface SolverState {
  token: number;
  index: number;
  pass: number;
  best: Shot;
  center: Shot;
  target: number;
  ready: boolean;
}
export interface Battle {
  run: RunTicket;
  stage: Stage;
  seed: number;
  tick: number;
  phase: Phase;
  round: number;
  units: Unit[];
  active: number;
  queue: number[];
  turnToken: number;
  seconds: number;
  wind: number;
  projectiles: Projectile[];
  hazards: Hazard[];
  events: CombatEvent[];
  serial: number;
  elapsedPhase: number;
  result: RunResult | null;
  solver: SolverState | null;
  items: Record<ItemId, number>;
  itemUsed: boolean;
  attackBoost: number;
  extraCount: number;
  windScale: number;
  wave: number;
  rescue: boolean;
  tutorial: { moved: boolean; aimed: boolean; fired: boolean; item: boolean };
  difficulty: ArmyProfile["settings"]["difficulty"];
}
export type Command =
  | { type: "move"; direction: -1 | 1; dt: number }
  | { type: "aim"; angle: number }
  | { type: "face"; direction: -1 | 1 }
  | { type: "charge" | "release" | "cancel" | "skip" }
  | { type: "item"; id: ItemId; x?: number };

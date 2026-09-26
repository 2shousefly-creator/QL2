import type { Allegiance, AttackMetadata } from "./airCombatStatus";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { EnemyType } from "./airCombatTypes";
import type { StormbreakerVfxKey } from "./airCombatStage3Art";

export interface StormPoint { x: number; y: number }
export type StormPhase = "STATIC" | "CHARGING" | "DISCHARGE" | "RECOVERY";
export type StormTag = "markers" | "dash" | "ring" | "chain" | "corridor" | "nodes" | "channel" | "rail";
export interface StormCast {
  id: number; owner: number; tag: StormTag; until: number; hard: boolean; primary: boolean;
}
export interface StormHazard extends AttackMetadata {
  id: number; cast: number; start: StormPoint; end?: StormPoint; radius: number;
  warningAt: number; hitAt: number; until: number; damage: number; visual: StormbreakerVfxKey;
  environmental?: number; conditionalOwner?: number; decoy?: boolean; resolved: boolean;
  hits: Map<number, number>; grace: number; afterStrike?: () => void;
}
export interface StormEvent {
  at: number; owner: number; committed: boolean; action: () => void;
}
export interface StormFx extends StormPoint {
  id: number; key: StormbreakerVfxKey; at: number; duration: number; size: number; rotation: number;
  orbit?: { x: number; y: number; angle: number; radius: number; releaseAt: number };
}
export interface StormCloud extends StormPoint {
  id: number; owner: number; until: number; damage: number; allegiance: Allegiance; ready: boolean;
}
export interface StormbreakerEnemyState {
  lastHp: number; lastShield: number;
  objectiveThresholds: number; objectiveDamageBank: number; sourceDamage: number;
  charge: number; chargeRemainder: number; attack: number; nextMajor: number; hitAt: number;
  links: number[]; relay?: number; relayUntil: number; channelUntil: number; channelKind?: "sermon" | "relay";
  boosted: boolean; enhanced: boolean; shieldArmed: boolean; shieldReady: number; breakUntil: number;
  burst: { at: number; hp: number }[]; ventReady: number; slot: number;
  dash?: { cast: number; from: StormPoint; end: StormPoint; start: number; duration: number;
    damage: number; allegiance: Allegiance; hits: Map<number, number>; progress: number; wake: boolean; follow: "scission" | "cross" | "shock" | "none" };
  bodyUntil: number; dischargeCycle: number;
  overloadPending?: boolean;
  judgment?: { remaining: number; next: number; allegiance: Allegiance };
}
export interface StormbreakerWorldState {
  clock: number; cycle: number; phase: StormPhase; preparedCycle: number; nodeCycle: number;
  nodes: number[]; conductors: number[];
  fields: (StormPoint & { radius: number; cycle: number; until: number })[];
  clouds: StormCloud[]; hazards: StormHazard[]; events: StormEvent[]; visuals: StormFx[];
  director: { casts: StormCast[]; nextResolve: number; nextCast: number; ordinal: number };
  elite: { ordinal: number; next: number };
  boss?: { phase: number; ordinal: number; next: number; partial: number; partialOrdinal: number; arraySpawned: boolean };
  movement: { x: number; y: number; vx: number; vy: number };
}
export interface StormbreakerHooks {
  movement(w: CombatWorld, e: EnemyEntity): number;
  spawn(w: CombatWorld, type: EnemyType, auxiliary?: boolean): EnemyEntity | null;
  projectile(w: CombatWorld, values: Partial<ProjectileEntity> & Pick<ProjectileEntity, "owner" | "x" | "y" | "vx" | "vy" | "rawDamage">): ProjectileEntity | null;
  allegiance(w: CombatWorld, e: EnemyEntity): Allegiance;
  target(w: CombatWorld, e: EnemyEntity, allegiance?: Allegiance): StormPoint | null;
  area(w: CombatWorld, raw: number, attack: AttackMetadata, shape: StormPoint & { end?: StormPoint; radius: number },
    hits: Map<number, number>, grace: number, insulated?: boolean): void;
  message(w: CombatWorld, message: string, duration?: number): void;
}

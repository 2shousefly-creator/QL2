import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { AttackMetadata, Allegiance } from "./airCombatStatus";
import type { MirageVisualKey } from "./airCombatStage4Art";
import type { EnemyType } from "./airCombatTypes";
import type { MirrorCombatant } from "./airCombatMirrorCombatant";

export interface MiragePoint { x: number; y: number }
export interface MirageProjection extends MiragePoint {
  id: number; ownerId: number; sourceEnemyId?: number; vx: number; vy: number;
  expiresAt: number; born: number; visualType: EnemyType | "helper";
  targetable: false; oneHitDissolve: true; real: false; size: number;
}
export interface MirageGhost extends MiragePoint { id: number; ownerId: number; vx: number; vy: number; until: number; rotation: number }
export interface MirageFx extends MiragePoint { id: number; key: MirageVisualKey; at: number; duration: number; size: number; rotation: number }
export interface MirageHazard extends AttackMetadata {
  id: number; ownerId: number; start: MiragePoint; end?: MiragePoint; radius: number;
  warningAt: number; hitAt: number; until: number; real: boolean; raw: number;
  warning: MirageVisualKey; active: MirageVisualKey; hits: Map<number, number>;
}
export interface MirageVolley {
  at: number; origins: MiragePoint[]; count: number; angle: number; spread: number;
  allegiance: Allegiance; allReal: boolean; factor: number;
}
export interface MirageEnemyState {
  next: number; attack: number; split: boolean; shieldUntil: number; shieldAngle: number;
  dash?: { from: MiragePoint; to: MiragePoint; at: number; duration: number; raw: number;
    hits: Map<number, number>; allegiance: Allegiance; stun: number; remaining: number; followRail: boolean };
  swap?: { to: MiragePoint; at: number };
  barrage?: MirageVolley;
  echoVolleys?: MirageVolley[];
}
export interface MirageWorldState {
  projections: MirageProjection[]; ghosts: MirageGhost[]; hazards: MirageHazard[]; visuals: MirageFx[];
  mirror?: MirrorCombatant; mirrorPhase: "inactive" | "duel" | "boss_delay" | "boss";
  bossAt: number;
  nextHardAttack: number; history: (MiragePoint & { at: number })[]; nextHistory: number;
  replay?: { ownerId: number; path: MiragePoint[]; at: number; next: number; index: number; allegiance: Allegiance };
  boss?: { phase: number; ordinal: number; next: number };
  movement: MiragePoint & { vx: number; vy: number };
}
export interface MirageHooks {
  projectile(w: CombatWorld, p: Partial<ProjectileEntity> & Pick<ProjectileEntity, "owner" | "x" | "y" | "vx" | "vy" | "rawDamage">): ProjectileEntity | null;
  target(w: CombatWorld, e: EnemyEntity, allegiance?: Allegiance): MiragePoint | null;
  allegiance(w: CombatWorld, e: EnemyEntity): Allegiance;
  movement(w: CombatWorld, e: EnemyEntity): number;
  area(w: CombatWorld, raw: number, attack: AttackMetadata, shape: MiragePoint & { end?: MiragePoint; radius: number }, hits: Map<number, number>, grace: number): void;
  spawn(w: CombatWorld, type: EnemyType, auxiliary?: boolean): EnemyEntity | null;
  message(w: CombatWorld, text: string, seconds?: number): void;
}

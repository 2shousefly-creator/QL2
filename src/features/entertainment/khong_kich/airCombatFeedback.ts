import { AIR_COMBAT_WORLD, GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import type { CombatWorld, DamageNumberEvent } from "./airCombatRuntime";
import type { AircraftCombatState } from "./airCombatTypes";

export const DAMAGE_LABEL_LIMIT = 52;
export const DAMAGE_LABEL_SECONDS = 0.68;

export interface DamageLabel {
  active: boolean;
  age: number;
  x: number;
  y: number;
  offset: number;
  text: string;
  critical: boolean;
  shielded: boolean;
  revision: number;
}

/** Presentation-only ring shared by Pixi and emergency Canvas. Never reads HP deltas. */
export class DamageLabelPool {
  readonly labels: DamageLabel[] = Array.from({ length: DAMAGE_LABEL_LIMIT }, () => ({
    active: false, age: 0, x: 0, y: 0, offset: 0, text: "", critical: false, shielded: false, revision: 0,
  }));
  private next = 0;
  private lastEvent = 0;

  update(world: CombatWorld, delta: number, onSpawn?: (event: DamageNumberEvent) => void) {
    for (const label of this.labels) {
      if (!label.active) continue;
      label.age += delta;
      if (label.age >= DAMAGE_LABEL_SECONDS) label.active = false;
    }
    for (const event of world.visualEvents) {
      if (event.id <= this.lastEvent) continue;
      this.lastEvent = event.id;
      if (event.kind !== "damage_number" || event.amount <= 0) continue;
      const label = this.labels[this.next];
      this.next = (this.next + 1) % this.labels.length;
      label.active = true;
      label.age = 0;
      label.x = Math.max(24, Math.min(AIR_COMBAT_WORLD.width - 24, event.x));
      label.y = Math.max(GAMEPLAY_SAFE_RECT.top + 18, Math.min(AIR_COMBAT_WORLD.height - 20, event.y - 10));
      label.offset = ((event.id % 5) - 2) * 4;
      label.text = String(Math.max(1, Math.round(event.amount)));
      label.critical = event.target === "enemy" && event.critical;
      label.shielded = event.target === "player" && event.shielded;
      label.revision++;
      onSpawn?.(event);
    }
  }
}

export function trackingBarWidth(displayWidth: number): number { return displayWidth * 1.5 * 0.85; }
export function trackingBarX(playerX: number, width: number): number {
  return Math.max(4, Math.min(AIR_COMBAT_WORLD.width - width - 4, playerX - width / 2));
}
export function trackingBarY(playerY: number, displayWidth: number): number {
  return Math.min(AIR_COMBAT_WORLD.height - 26, playerY + displayWidth * 0.65 + 4);
}

export const HP_CHIP_SECONDS = 0.1;
const ratio = (value: number) => Math.max(0, Math.min(1, value));
export function activeShieldAmount(state: AircraftCombatState): number {
  let amount = 0;
  for (const key in state.coreState.shields) {
    const shield = state.coreState.shields[key];
    if (shield.until > state.coreState.time) amount += Math.max(0, shield.amount);
  }
  return amount;
}
export const statusBarText = (current: number, max: number) => `${Math.max(0, Math.floor(current))} / ${Math.max(1, Math.floor(max))}`;

export interface HealthBarState {
  hp: number; maxHp: number; hpRatio: number; shieldEnd: number;
  chipRatio: number; chipUntil: number; seen: number;
}
/** Renderer-local HP history only. Never changes damage, death, hitboxes or combat RNG. */
export class HealthBarPresentation {
  private states = new Map<number, HealthBarState>();
  private free: HealthBarState[] = [];
  private frame = 0;
  clock = 0;
  begin(delta: number) { this.clock += Math.max(0, delta); this.frame++; }
  get(id: number, hp: number, maxHp: number, shield = 0): HealthBarState {
    maxHp = Math.max(1, maxHp);
    const hpRatio = ratio(hp / maxHp);
    let state = this.states.get(id);
    if (!state) {
      state = this.free.pop() || {} as HealthBarState;
      Object.assign(state, { hp, maxHp, hpRatio, chipRatio: hpRatio, chipUntil: 0, shieldEnd: hpRatio, seen: this.frame });
      this.states.set(id, state);
    }
    if (state.chipUntil <= this.clock) state.chipRatio = state.hpRatio;
    if (hp < state.hp && maxHp === state.maxHp) {
      // Consecutive hits extend one chip; an absorbed-only hit never enters this branch.
      state.chipRatio = Math.max(state.chipRatio, state.hpRatio);
      state.chipUntil = this.clock + HP_CHIP_SECONDS;
    } else if (maxHp !== state.maxHp) {
      state.chipRatio = hpRatio; state.chipUntil = 0;
    }
    state.hp = hp; state.maxHp = maxHp; state.hpRatio = hpRatio;
    state.shieldEnd = ratio((Math.max(0, hp) + Math.max(0, shield)) / maxHp);
    state.chipRatio = state.chipUntil > this.clock ? Math.max(hpRatio, state.chipRatio) : hpRatio;
    state.seen = this.frame;
    return state;
  }
  end() {
    for (const [id, state] of this.states) if (state.seen !== this.frame) {
      this.states.delete(id); this.free.push(state);
    }
  }
  clear() { this.states.clear(); this.free.length = 0; this.clock = 0; }
}

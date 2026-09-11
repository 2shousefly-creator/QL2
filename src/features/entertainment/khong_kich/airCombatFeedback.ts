import { AIR_COMBAT_WORLD, GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import type { CombatWorld, DamageNumberEvent } from "./airCombatRuntime";

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

export function trackingBarWidth(displayWidth: number): number { return displayWidth * 1.5; }
export function trackingBarX(playerX: number, width: number): number {
  return Math.max(4, Math.min(AIR_COMBAT_WORLD.width - width - 4, playerX - width / 2));
}
export function trackingBarY(playerY: number, displayWidth: number): number {
  return Math.min(AIR_COMBAT_WORLD.height - 14, playerY + displayWidth * 0.65 + 4);
}

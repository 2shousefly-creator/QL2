import type { Battle, StatusId, Unit } from "../types";
import { clamp } from "../config";
import { damage, emit } from "./events";
export const STATUS_DEFINITIONS: Record<
  StatusId,
  {
    name: string;
    stack: "refresh" | "strongest";
    tick: "turn-start";
    dispel: boolean;
    bossImmune: boolean;
  }
> = {
  burn: {
    name: "Cháy",
    stack: "refresh",
    tick: "turn-start",
    dispel: true,
    bossImmune: false,
  },
  barrier: {
    name: "Khiên",
    stack: "strongest",
    tick: "turn-start",
    dispel: true,
    bossImmune: false,
  },
  slow: {
    name: "Chậm",
    stack: "strongest",
    tick: "turn-start",
    dispel: true,
    bossImmune: false,
  },
  stun: {
    name: "Choáng",
    stack: "refresh",
    tick: "turn-start",
    dispel: true,
    bossImmune: true,
  },
};
export function applyStatus(
  b: Battle,
  u: Unit,
  id: StatusId,
  source: number,
  magnitude: number,
  turns: number,
): boolean {
  const def = STATUS_DEFINITIONS[id];
  if (!def || u.hp <= 0 || b.result || (u.boss && def.bossImmune)) return false;
  const duration = Math.floor(clamp(turns, 1, 6)),
    strength = clamp(magnitude, 0, 120);
  const old = u.statuses.find((s) => s.id === id);
  if (old) {
    old.remaining = Math.max(old.remaining, duration);
    old.magnitude =
      def.stack === "strongest" ? Math.max(old.magnitude, strength) : strength;
    old.source = source;
    old.appliedTurn = u.turns;
  } else
    u.statuses.push({
      id,
      source,
      remaining: duration,
      magnitude: strength,
      appliedTurn: u.turns,
    });
  if (id === "barrier") u.shield = Math.min(120, Math.max(u.shield, strength));
  emit(b, "skill", u.x, u.y - u.height, undefined, def.name);
  return true;
}
export function dispel(u: Unit, id: StatusId): boolean {
  if (!STATUS_DEFINITIONS[id].dispel) return false;
  const index = u.statuses.findIndex((s) => s.id === id);
  if (index < 0) return false;
  u.statuses.splice(index, 1);
  if (id === "barrier") u.shield = 0;
  return true;
}
/** Durations are owner turns. Burn ticks before decrement; shield expires after its last protected interval. */
export function tickStatuses(b: Battle, u: Unit): boolean {
  let stunned = false;
  for (const status of [...u.statuses]) {
    if (status.appliedTurn === u.turns) continue;
    if (status.id === "burn") damage(b, u, status.magnitude, true);
    if (status.id === "slow")
      u.movement *= 1 - clamp(status.magnitude / 100, 0, 0.8);
    if (status.id === "stun") stunned = true;
    status.remaining--;
    if (status.remaining <= 0) dispel(u, status.id);
  }
  return stunned;
}

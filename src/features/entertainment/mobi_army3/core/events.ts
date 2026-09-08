import type { Battle, CombatEvent, Unit } from "../types";
import { BALANCE } from "../config";
export function emit(
  b: Battle,
  type: CombatEvent["type"],
  x: number,
  y: number,
  value?: number,
  text?: string,
) {
  b.events.push({ id: ++b.serial, type, x, y, value, text });
  if (b.events.length > BALANCE.maxEvents)
    b.events.splice(0, b.events.length - BALANCE.maxEvents);
}
export function damage(b: Battle, u: Unit, amount: number, bypass = false) {
  if (u.hp <= 0 || !Number.isFinite(amount) || amount <= 0 || b.result) return;
  let actual = Math.max(1, Math.round(amount - (bypass ? 0 : u.defense)));
  const absorbed = bypass ? 0 : Math.min(u.shield, actual);
  u.shield -= absorbed;
  actual -= absorbed;
  actual = Math.min(u.hp, actual);
  u.hp -= actual;
  u.animation = "hit";
  u.animTime = 0;
  emit(b, "damage", u.x, u.y - u.height, actual);
  if (u.hp === 0) {
    u.animation = "death";
    emit(b, "death", u.x, u.y);
  }
}
export function random(b: Battle): number {
  let x = b.seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  b.seed = x >>> 0;
  return b.seed / 4294967296;
}

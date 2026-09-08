import { BALANCE, clamp } from "../config";
import type { Battle, Unit } from "../types";
import type { TerrainMask } from "../terrain/terrainMask";
import { damage, emit } from "./events";
export function moveUnit(
  b: Battle,
  t: TerrainMask,
  u: Unit,
  direction: -1 | 1,
  dt: number,
): boolean {
  if (!u.grounded || u.hp <= 0 || u.movement <= 0) return false;
  u.facing = direction;
  const distance = Math.min(
    u.movement,
    BALANCE.walkSpeed * clamp(dt, 0, BALANCE.step),
  );
  const x = u.x + direction * distance;
  if (x < u.radius || x > t.map.width - u.radius) return false;
  if (
    b.units.some(
      (v) =>
        v.id !== u.id &&
        v.hp > 0 &&
        Math.abs(v.x - x) < v.radius + u.radius &&
        Math.abs(v.y - u.y) < u.height,
    )
  )
    return false;
  let feet = u.y;
  while (
    feet >= u.y - BALANCE.stepHeight &&
    !t.bodyClear(x, feet, u.radius, u.height)
  )
    feet -= 2;
  if (feet < u.y - BALANCE.stepHeight) return false;
  u.x = x;
  u.y = feet;
  u.movement -= distance;
  u.animation = "walk";
  if (!t.support(x, feet, u.radius)) {
    u.grounded = false;
    u.fallFrom = feet;
  }
  if (u.kind === "player") b.tutorial.moved = true;
  return true;
}
export function resolveFalling(b: Battle, t: TerrainMask, dt: number): boolean {
  let falling = false;
  for (const u of b.units) {
    u.animTime += dt;
    if (u.hp <= 0) continue;
    if (u.grounded && !t.support(u.x, u.y, u.radius)) {
      u.grounded = false;
      u.fallFrom = u.y;
      u.vy = 0;
    }
    if (u.grounded) continue;
    falling = true;
    u.animation = "fall";
    u.vy = Math.min(BALANCE.maxFallSpeed, u.vy + BALANCE.gravity * dt);
    const target = u.y + u.vy * dt;
    for (let y = u.y; y <= target; y += 1) {
      if (t.support(u.x, y, u.radius)) {
        u.y = y;
        u.grounded = true;
        u.vy = 0;
        u.animation = "idle";
        const fall = Math.max(0, u.y - u.fallFrom - BALANCE.safeFall);
        if (fall > 0) {
          damage(b, u, fall * BALANCE.fallDamage, true);
          emit(b, "fall", u.x, u.y, Math.round(fall));
        }
        break;
      }
    }
    if (!u.grounded) u.y = target;
    if (
      u.y > t.map.height + 80 ||
      u.x < -u.radius ||
      u.x > t.map.width + u.radius
    )
      damage(b, u, u.hp, true);
  }
  return falling;
}

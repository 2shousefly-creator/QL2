import { BALANCE } from "../config";
import { ammoById, weaponById } from "../content/equipment";
import { BOSSES } from "../content/world";
import type { Battle, Projectile } from "../types";
import type { TerrainMask } from "../terrain/terrainMask";
import { damage, emit } from "./events";
import { distanceToBody } from "./ballistics";
import { advanceProjectile } from "./projectileMotion";
import { applyStatus } from "./statusEngine";
export function explode(
  b: Battle,
  t: TerrainMask,
  p: Projectile,
  x = p.x,
  y = p.y,
  directId?: number,
) {
  const w = weaponById[p.weapon];
  t.crater(x, y, p.crater);
  emit(b, "explosion", x, y, w.blast);
  for (const u of b.units) {
    const d = distanceToBody(u, x, y);
    if (u.hp <= 0 || d > w.blast) continue;
    let amount = p.damage * Math.max(0.15, 1 - d / w.blast);
    if (u.id === directId) {
      amount *= 1.15;
      if (u.boss && u.shield === 0 && y < u.y - u.height * 0.55)
        amount *= BOSSES.find((v) => v.id === u.boss)!.phases[u.bossPhase]
          .weakMultiplier;
    }
    damage(b, u, amount);
    const burn = ammoById[p.ammo].burnTurns;
    if (burn && u.hp > 0) {
      applyStatus(b, u, "burn", p.owner, 8, burn);
    }
    // Small bounded horizontal impulse only through clear air; gravity handles lost support.
    const direction = u.x >= x ? 1 : -1,
      nx = u.x + direction * Math.min(18, amount / 5);
    if (
      t.bodyClear(nx, u.y, u.radius, u.height) &&
      !b.units.some(
        (v) =>
          v !== u &&
          v.hp > 0 &&
          Math.abs(v.x - nx) < v.radius + u.radius &&
          Math.abs(v.y - u.y) < u.height,
      )
    )
      u.x = nx;
  }
  const burn = ammoById[p.ammo].burnTurns;
  if (burn && b.hazards.length < BALANCE.maxHazards)
    b.hazards.push({
      id: ++b.serial,
      owner: p.owner,
      x,
      radius: w.blast * 0.65,
      damage: 14,
      dueRound: b.round + 1,
      burnTurns: burn,
    });
}
export function updateProjectiles(b: Battle, t: TerrainMask, dt: number) {
  const survivors: Projectile[] = [],
    children: Projectile[] = [];
  for (const p of b.projectiles) {
    const outcome = advanceProjectile(
      p,
      b.wind,
      dt,
      t,
      b.units,
      () => ++b.serial,
    );
    if (outcome.alive) survivors.push(p);
    if (outcome.children.length) {
      children.push(...outcome.children);
      emit(b, "skill", p.x, p.y, undefined, "Tách đạn");
    }
    if (outcome.impact)
      explode(
        b,
        t,
        p,
        outcome.impact.x,
        outcome.impact.y,
        outcome.impact.unit?.id,
      );
  }
  b.projectiles = [...survivors, ...children].slice(0, BALANCE.maxProjectiles);
}

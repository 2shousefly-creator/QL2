import { advanceProjectile } from "../core/projectileMotion";
import { TerrainPreview } from "./terrainPreview";
import { BALANCE, clamp } from "../config";
import { weaponById } from "../content/equipment";
import { ENEMIES } from "../content/world";
import type { Battle, Shot, Unit, Projectile } from "../types";
import type { TerrainMask } from "../terrain/terrainMask";
import { distanceToBody, launch } from "../core/ballistics";
import { random } from "../core/events";
function evaluate(
  b: Battle,
  t: TerrainMask,
  u: Unit,
  angle: number,
  power: number,
  facing: -1 | 1,
  target: Unit,
): Shot {
  const terrain = new TerrainPreview(t),
    first = launch({ ...u, facing }, angle, power, 0),
    w = weaponById[u.weapon];
  let shots = [first],
    serial = 0,
    nearest = Infinity,
    score = 0,
    lastDistance = Infinity;
  const hits = new Map<number, number>();
  for (let tick = 0; tick < BALANCE.maxStepsPerShot && shots.length; tick++) {
    const next: Projectile[] = [];
    for (const p of shots) {
      const outcome = advanceProjectile(
        p,
        b.wind,
        BALANCE.step,
        terrain,
        b.units,
        () => ++serial,
      );
      const distance = distanceToBody(target, p.x, p.y);
      nearest = Math.min(nearest, distance);
      lastDistance = Math.min(lastDistance, distance);
      if (outcome.alive) next.push(p);
      next.push(...outcome.children);
      if (!outcome.impact) continue;
      const hit = outcome.impact;
      terrain.crater(hit.x, hit.y, p.crater);
      for (const v of b.units) {
        if (v.hp <= 0) continue;
        const d = distanceToBody(v, hit.x, hit.y);
        if (d <= w.blast) {
          const expected = Math.max(
            0,
            p.damage *
              Math.max(0.15, 1 - d / w.blast) *
              (hit.unit?.id === v.id ? 1.15 : 1) -
              v.defense,
          );
          hits.set(v.id, (hits.get(v.id) ?? 0) + expected);
        }
        if (
          v.team !== u.team &&
          Math.abs(v.x - hit.x) < p.crater &&
          hit.y >= v.y - 20
        )
          score += u.ai === "engineer" ? 35 : 12;
      }
    }
    shots = next.slice(0, BALANCE.maxProjectiles);
  }
  score -= Math.min(lastDistance, 3000) * 0.12 + Math.min(nearest, 3000) * 0.02;
  for (const v of b.units) {
    const expected = Math.max(0, (hits.get(v.id) ?? 0) - v.shield);
    score +=
      (v.team === u.team ? -2 : 1) *
      (Math.min(v.hp, expected) + (expected >= v.hp && v.hp > 0 ? 65 : 0));
  }
  return { angle, power, facing, score };
}
/** Incremental deterministic coarse + refinement search. Work is bounded per simulation tick. */
export function solveTick(b: Battle, t: TerrainMask, u: Unit): Shot | null {
  if (!b.solver || b.solver.token !== b.turnToken) {
    const targets = b.units
      .filter((v) => v.team !== u.team && v.hp > 0)
      .sort(
        (a, c) =>
          a.hp +
          (a.kind === "ally" ? -45 : 0) +
          Math.abs(a.x - u.x) * 0.05 -
          (c.hp + (c.kind === "ally" ? -45 : 0) + Math.abs(c.x - u.x) * 0.05),
      );
    if (!targets.length) return null;
    const target = targets[0];
    const shot: Shot = {
      angle: 45,
      power: 65,
      facing: target.x >= u.x ? 1 : -1,
      score: -Infinity,
    };
    b.solver = {
      token: b.turnToken,
      index: 0,
      pass: 0,
      best: shot,
      center: shot,
      target: target.id,
      ready: false,
    };
  }
  const s = b.solver,
    target = b.units.find((v) => v.id === s.target);
  if (!target || target.hp <= 0) {
    b.solver = null;
    return null;
  }
  const w = weaponById[u.weapon];
  for (let n = 0; n < BALANCE.aiCandidatesPerTick && !s.ready; n++) {
    let angle: number, power: number;
    if (s.pass === 0) {
      angle =
        w.angles[0] +
        ((w.angles[1] - w.angles[0]) * Math.floor(s.index / 9)) / 8;
      power = 20 + (s.index % 9) * 10;
    } else {
      angle = s.center.angle + (Math.floor(s.index / 5) - 2) * 2;
      power = s.center.power + ((s.index % 5) - 2) * 2.5;
    }
    const shot = evaluate(
      b,
      t,
      u,
      clamp(angle, ...w.angles),
      clamp(power, 0, 100),
      s.best.facing,
      target,
    );
    if (shot.score > s.best.score) s.best = shot;
    s.index++;
    if (s.pass === 0 && s.index >= 81) {
      s.pass = 1;
      s.index = 0;
      s.center = { ...s.best };
    } else if (s.pass === 1 && s.index >= 25) s.ready = true;
  }
  if (!s.ready) return null;
  const base = u.ai ? ENEMIES[u.ai].error : 2;
  const error = base * { easy: 1.5, normal: 1, hard: 0.45 }[b.difficulty];
  const shot = {
    ...s.best,
    angle: clamp(s.best.angle + (random(b) - 0.5) * error, ...w.angles),
    power: clamp(s.best.power + (random(b) - 0.5) * error, 0, 100),
  };
  return shot;
}

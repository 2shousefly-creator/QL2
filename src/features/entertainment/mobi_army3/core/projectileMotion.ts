import { ammoById } from "../content/equipment";
import type { Projectile, Unit } from "../types";
import type { TerrainMask } from "../terrain/terrainMask";
import { outside, stepTrajectory, sweep, type Hit } from "./ballistics";
export type ProjectileTerrain = Pick<
  TerrainMask,
  "map" | "cell" | "material" | "solidAt" | "crater"
>;
export interface MotionResult {
  alive: boolean;
  children: Projectile[];
  impact?: Hit;
}
/** Shared by the real battle and AI prediction, including every special projectile trigger. */
export function advanceProjectile(
  p: Projectile,
  wind: number,
  dt: number,
  t: ProjectileTerrain,
  units: Unit[],
  nextId: () => number,
): MotionResult {
  const ox = p.x,
    oy = p.y;
  stepTrajectory(p, wind, dt);
  if (outside(p, t)) return { alive: false, children: [] };
  const a = ammoById[p.ammo];
  if (a.splitAt && !p.split && p.age >= a.splitAt) {
    const count = a.splitCount ?? 3;
    return {
      alive: false,
      children: Array.from({ length: count }, (_, i) => ({
        ...p,
        id: nextId(),
        ammo: "normal",
        split: true,
        vx: p.vx + (i - (count - 1) / 2) * 100,
        vy: p.vy - 35,
      })),
    };
  }
  const hit = sweep(p, ox, oy, t, units);
  const detonate = (): MotionResult => ({
    alive: false,
    children: [],
    impact: hit ?? { x: p.x, y: p.y, material: 0 },
  });
  if (p.drilling) {
    p.drillLeft -= Math.hypot(p.x - ox, p.y - oy);
    if (p.drillLeft <= 0 || hit?.material === 2 || hit?.unit) return detonate();
  }
  if (a.fuse && p.age >= a.fuse && !hit) return detonate();
  if (hit) {
    if (a.bounce && p.bounces < a.bounce && !hit.unit) {
      p.x = ox;
      p.y = oy;
      // Reflect from a wall as well as a floor. No repeated infinite bounce.
      if (t.solidAt(hit.x, oy) && !t.solidAt(ox, hit.y)) p.vx = -p.vx * 0.65;
      else p.vy = -Math.abs(p.vy) * 0.65;
      p.vx *= 0.8;
      p.bounces++;
      return { alive: true, children: [] };
    }
    if (p.drillLeft > 0 && hit.material === 1 && !hit.unit) {
      p.drilling = true;
      t.crater(hit.x, hit.y, 12);
      return { alive: true, children: [] };
    }
    return detonate();
  }
  return { alive: true, children: [] };
}

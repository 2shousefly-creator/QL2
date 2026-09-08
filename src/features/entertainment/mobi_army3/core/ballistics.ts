import { BALANCE, clamp, radians } from "../config";
import { weaponById, ammoById } from "../content/equipment";
import type { Battle, Projectile, Unit } from "../types";
import type { TerrainMask } from "../terrain/terrainMask";
export function muzzle(u: Unit, angle = u.angle, facing = u.facing) {
  const a = radians(angle);
  const length = u.kind === "boss" ? u.radius + 20 : 32;
  return {
    x: u.x + Math.cos(a) * length * facing,
    y: u.y - u.height * 0.58 - Math.sin(a) * length,
  };
}
export function launch(
  u: Unit,
  angle: number,
  power: number,
  id: number,
  windScale = 1,
): Projectile {
  const w = weaponById[u.weapon],
    ammo = u.ammoOverride ?? w.ammo,
    a = clamp(angle, ...w.angles),
    speed = w.speed * (0.18 + clamp(power, 0, 100) * 0.0082);
  return {
    id,
    owner: u.id,
    ...muzzle(u, a),
    vx: Math.cos(radians(a)) * speed * u.facing,
    vy: -Math.sin(radians(a)) * speed,
    age: 0,
    weapon: u.weapon,
    ammo,
    damage: w.damage * u.attack,
    crater: w.crater * u.crater,
    windScale,
    bounces: 0,
    drillLeft: ammoById[ammo].drillDistance ?? 0,
    drilling: false,
    split: false,
  };
}
export function stepTrajectory(p: Projectile, wind: number, dt: number) {
  const w = weaponById[p.weapon];
  p.vx += wind * w.wind * p.windScale * dt;
  p.vy += BALANCE.gravity * w.gravity * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.age += dt;
}
export function hitUnit(u: Unit, x: number, y: number): boolean {
  return (
    u.hp > 0 && Math.abs(x - u.x) <= u.radius && y >= u.y - u.height && y <= u.y
  );
}
export function distanceToBody(u: Unit, x: number, y: number) {
  return Math.hypot(
    Math.max(0, Math.abs(x - u.x) - u.radius),
    Math.max(u.y - u.height - y, 0, y - u.y),
  );
}
export interface Hit {
  x: number;
  y: number;
  unit?: Unit;
  material: number;
}
/** Swept samples never skip more than one mask cell. Owner immunity only while leaving muzzle. */
export function sweep(
  p: Projectile,
  ox: number,
  oy: number,
  t: Pick<TerrainMask, "cell" | "material">,
  units: Unit[],
): Hit | null {
  const steps = Math.max(1, Math.ceil(Math.hypot(p.x - ox, p.y - oy) / t.cell));
  for (let i = 1; i <= steps; i++) {
    const x = ox + ((p.x - ox) * i) / steps,
      y = oy + ((p.y - oy) * i) / steps;
    const unit = units.find(
      (u) => (u.id !== p.owner || p.age > 0.22) && hitUnit(u, x, y),
    );
    if (unit) return { x, y, unit, material: 0 };
    const material = t.material(x, y);
    if (material) return { x, y, material };
  }
  return null;
}
export function outside(p: Projectile, t: Pick<TerrainMask, "map">) {
  return (
    p.age > BALANCE.projectileLife ||
    p.x < -120 ||
    p.x > t.map.width + 120 ||
    p.y > t.map.height + 120 ||
    p.y < -1800 ||
    !Number.isFinite(p.x + p.y + p.vx + p.vy)
  );
}
export function getActive(b: Battle) {
  return b.units.find((u) => u.id === b.active)!;
}

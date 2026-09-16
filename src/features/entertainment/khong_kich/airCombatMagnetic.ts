import { AIR_COMBAT_WORLD, ENEMY_CONFIGS, GAMEPLAY_SAFE_RECT as RECT } from "./airCombatConfig";
import { circleVsAircraft, getPlayerHitbox, clampHitboxToGameplayRect, segmentVsAircraft, createHitResult } from "./airCombatHitboxes";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { EnemyType } from "./airCombatTypes";
import type { TacticalPainter } from "./airCombatTacticalVisuals";

type Point = { x: number; y: number };
export interface MagneticEnemyState {
  clock: number; attack: number; anchorX: number; anchorY: number; angle: number;
  owner?: number; slot?: number; disabledUntil?: number; tether?: boolean;
  release?: number; releaseClock?: number; dropClock?: number; dropX?: number; dropY?: number; dropped?: number;
}
export interface MagneticProjectileState {
  kind: "disc" | "orb"; age: number; originX: number; originY: number;
  endX: number; endY: number; curve: number; outbound: number; turn: number; returnDuration: number;
  phase: "outbound" | "turn" | "return"; baseAngle: number;
}
interface Mine extends Point { id: number; owner: number; damage: number; age: number; warning: number; exploded: boolean; startY: number; targetY: number }
interface Grid { owner: number; nodes: Point[]; age: number; collapse: boolean; damage: number }
interface Blade extends Point { owner: number; active: boolean; radius: number; damage: number }
export interface MagneticWorldState {
  mines: Mine[]; grid?: Grid; blades: Blade[];
  polarity?: { owner: number; direction: 1 | -1; age: number; warning: number; duration: number };
}
export interface MagneticHooks {
  spawn(world: CombatWorld, type: EnemyType, auxiliary?: boolean): EnemyEntity | null;
  projectile(world: CombatWorld, values: Partial<ProjectileEntity> & Pick<ProjectileEntity, "owner" | "x" | "y" | "vx" | "vy" | "rawDamage">): ProjectileEntity | null;
  hit(world: CombatWorld, damage: number, owner: number): void;
  hostile(world: CombatWorld, enemy: EnemyEntity): boolean;
  message(world: CombatWorld, text: string, duration: number): void;
}
const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const point = (x: number, y: number, margin = 22): Point => ({ x: clamp(x, RECT.left + margin, RECT.right - margin), y: clamp(y, RECT.top + margin, RECT.bottom - margin) });
export const usesMagneticArt = (world: CombatWorld, enemy: EnemyEntity) => world.stage.runtime === "magnetic";
export const magneticEnemyDisabled = (world: CombatWorld, enemy: EnemyEntity) => enemy.type === "satellite" && (enemy.magnetic?.disabledUntil ?? 0) > world.elapsed;
const state = (e: EnemyEntity): MagneticEnemyState => e.magnetic ??= { clock: 0, attack: 0, anchorX: e.x, anchorY: e.y, angle: e.phaseSeed };
const damage = (e: EnemyEntity) => ENEMY_CONFIGS[e.type].projectileDamage * e.damageScale;
function drift(e: EnemyEntity, target: Point, speed: number, dt: number) {
  const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy), t = Math.min(1, speed * dt / Math.max(1, d));
  e.x += dx * t; e.y += dy * t;
}
function pushPlayer(w: CombatWorld, x: number, y: number) {
  if (w.dashRemaining > 0) return;
  const target = clampHitboxToGameplayRect(w.playerX + x, w.playerY + y, getPlayerHitbox(w));
  w.playerX = target.x; w.playerY = Math.min(target.y, AIR_COMBAT_WORLD.height - AIR_COMBAT_WORLD.playerBottomClearance);
}
function bullet(w: CombatWorld, e: EnemyEntity, h: MagneticHooks, angle: number, speed = 110, factor = 1) {
  return h.projectile(w, { owner: "enemy", sourceEnemyId: e.id, sourceEnemyType: e.type, x: e.x, y: e.y,
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, rawDamage: damage(e) * factor, radius: 4, color: "#67e8f9" });
}
function disc(w: CombatWorld, e: EnemyEntity, h: MagneticHooks, angle: number, curve = 36, fast = false) {
  const travel = Math.max(280, Math.hypot(w.playerX - e.x, w.playerY - e.y) + 75);
  const end = point(e.x + Math.cos(angle) * travel, e.y + Math.sin(angle) * travel, 12);
  const p = bullet(w, e, h, angle, 0);
  if (p) {
    p.radius = 8; p.lifetime = 8; p.color = "#67e8f9";
    p.magnetic = { kind: "disc", age: 0, originX: e.x, originY: e.y, endX: end.x, endY: end.y,
      curve, outbound: 1.7, turn: fast ? .55 : .75, returnDuration: 1.7, phase: "outbound", baseAngle: angle };
  }
}
function seedMine(w: CombatWorld, e: EnemyEntity, at: Point): boolean {
  const m = w.magnetic!, safe = point(at.x, at.y, 42);
  if (m.mines.length >= 6 || Math.hypot(safe.x - w.playerX, safe.y - w.playerY) < 85 ||
      Math.hypot(safe.x - w.playerX, e.y - w.playerY) < 55 ||
      m.mines.some(mine => Math.hypot(mine.x - safe.x, mine.targetY - safe.y) < 88)) return false;
  m.mines.push({ ...safe, id: w.nextId++, owner: e.id, age: 0, warning: -1, exploded: false,
    startY: e.y, targetY: safe.y, damage: damage(e) });
  return true;
}
export function resetMagneticHazards(w: CombatWorld) {
  if (w.magnetic) { w.magnetic.mines.length = 0; w.magnetic.blades.length = 0; w.magnetic.grid = undefined; w.magnetic.polarity = undefined; }
}
/** Satellites stay in the existing hittable enemy collection; zero Stability disables,
 * never enters the kill/reward/proc pipeline and never transfers damage to the boss. */
export function disableMagneticSatellite(w: CombatWorld, e: EnemyEntity): boolean {
  if (e.type !== "satellite") return false;
  const s = state(e); s.disabledUntil = w.elapsed + 6; s.dropClock = undefined;
  e.hp = e.maxHp; e.burn = 0; e.stun = 0; e.shield = 0;
  w.skillCores.enemyEffects.delete(e.id);
  hibernateShots(w, e.id);
  return true;
}
function hibernateShots(w: CombatWorld, id: number) {
  for (const p of w.projectiles) if (p.sourceEnemyId === id) p.lifetime = 0;
}
export function updateMagneticEnemy(w: CombatWorld, e: EnemyEntity, dt: number, h: MagneticHooks): boolean {
  if (!w.magnetic) return false;
  const s = state(e); s.clock += dt;
  const hostile = h.hostile(w, e), locked = (e.skillLockedUntil ?? 0) > w.elapsed;
  const canFire = hostile && !locked;
  const aim = Math.atan2(w.playerY - e.y, w.playerX - e.x);
  if (e.type === "boss") { updateTempest(w, e, dt, h); return true; }
  if (e.type === "satellite") { updateSatellite(w, e, dt, h); return true; }
  if (!hostile) {
    s.tether = false;
    const target = w.enemies.filter(other => other.id !== e.id && h.hostile(w, other))
      .sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
    if (target && !locked && e.fireCooldown <= 0) {
      bullet(w, e, h, Math.atan2(target.y - e.y, target.x - e.x), 130);
      e.fireCooldown = ENEMY_CONFIGS[e.type].fireInterval;
    }
    return true;
  }
  if (e.type === "micro_drone") {
    const phase = Math.min(1, Math.max(0, (s.clock - 2.4) / 3.5));
    const r = 115 - phase * 85, angle = s.angle + Math.min(s.clock, 2.4) * .18;
    drift(e, point(s.anchorX + Math.cos(angle) * r, s.anchorY + Math.sin(angle) * r, 14), 70, dt);
    if (s.clock > 7.5) { e.hp = 0; e.deathHandled = true; }
    return true;
  }
  if (e.type === "orbit_wasp") {
    const cycle = s.clock % 7, direction = e.id % 2 ? 1 : -1;
    if (cycle < 2) { s.anchorX = w.playerX; s.anchorY = w.playerY - 25; s.angle = direction > 0 ? Math.PI : 0; }
    else s.angle += dt * .65 * direction;
    drift(e, point(s.anchorX + Math.cos(s.angle) * 112, s.anchorY + Math.sin(s.angle) * 78), 76, dt);
    if (canFire && cycle > 2.5 && cycle < 5.8 && e.fireCooldown <= 0) {
      bullet(w, e, h, aim - .07, 125, .75); bullet(w, e, h, aim + .07, 125, .75); e.fireCooldown = 2.4;
    }
    return true;
  }
  if (e.type === "cyclone_ace") {
    const low = e.hp < e.maxHp * .5;
    drift(e, point(180 + Math.sin(s.clock * (low ? .55 : .38)) * (low ? 115 : 72), RECT.top + 125 + Math.cos(s.clock * .5) * (low ? 62 : 20), 36), low ? 63 : 40, dt);
    const hasDiscs = w.projectiles.some(p => p.sourceEnemyId === e.id && p.magnetic?.kind === "disc" && p.lifetime > 0);
    if (s.release !== undefined) {
      s.releaseClock = (s.releaseClock ?? 0) - dt;
      if (s.release < 3 && s.releaseClock <= 0 && canFire) {
        disc(w, e, h, aim + (s.release - 1) * .48, (s.release % 2 ? -1 : 1) * 55);
        s.release++; s.releaseClock = .4;
      }
      if (s.release >= 3 && !hasDiscs) { s.release = undefined; s.clock = 0; s.attack = 0; }
    } else {
      const cycle = s.clock % 4.2, active = cycle > .85;
      const radius = 30 + Math.sin(clamp((cycle - .85) / 3.35, 0, 1) * Math.PI) * 78;
      for (let i = 0; i < 3; i++) {
        const angle = s.clock * 1.1 + i * TAU / 3;
        w.magnetic.blades.push({ x: e.x + Math.cos(angle) * radius, y: e.y + Math.sin(angle) * radius, owner: e.id, radius: 10, damage: damage(e), active: canFire && active });
      }
      if (s.clock > 8.4 && canFire) { s.release = 0; s.releaseClock = .85; h.message(w, "CYCLONE · BLADE RELEASE", .85); }
    }
    return true;
  }
  drift(e, point(180 + Math.sin(s.clock * .55 + e.phaseSeed) * (e.type === "mine_seeder" ? 118 : 90), RECT.top + 75 + (e.id % 3) * 35), ENEMY_CONFIGS[e.type].speed, dt);
  if (e.type === "magnetic_leech") {
    const distance = Math.hypot(e.x - w.playerX, e.y - w.playerY);
    s.tether = canFire && s.clock > 1.3 && (s.tether ? distance < 245 : distance < 180);
    // Two leeches at most; total force is clamped centrally after all enemies.
    if (canFire && e.fireCooldown <= 0) { bullet(w, e, h, aim, 95, .65); e.fireCooldown = 4.5; }
  }
  if (!canFire || e.fireCooldown > 0) return true;
  e.fireCooldown = ENEMY_CONFIGS[e.type].fireInterval;
  if (e.type === "arc_reaver") disc(w, e, h, aim, e.id % 2 ? 42 : -42);
  if (e.type === "mine_seeder") seedMine(w, e, { x: e.x, y: e.y + 100 });
  if (e.type === "prism_manta") {
    const p = bullet(w, e, h, aim, 85);
    if (p) { p.radius = 10; p.color = "#c084fc"; p.magnetic = { kind: "orb", age: 0, originX: e.x, originY: e.y, endX: 0, endY: 0, curve: 0, outbound: 1.1, turn: 0, returnDuration: 0, phase: "outbound", baseAngle: aim }; }
  }
  if (e.type === "swarm_carrier") {
    const count = w.enemies.filter(e => e.type === "micro_drone" && e.hp > 0).length;
    const anchor = point(w.playerX, w.playerY, 110);
    for (let i = 0; i < Math.min(3, 6 - count); i++) {
      const drone = h.spawn(w, "micro_drone", true);
      if (!drone) break;
      const angle = -Math.PI + i * Math.PI / 3; // Open lower half remains an escape route.
      drone.x = e.x + (i - 1) * 14; drone.y = e.y + 18;
      drone.magnetic = { clock: 0, attack: 0, anchorX: anchor.x, anchorY: anchor.y, angle, owner: e.id };
    }
  }
  if (e.type === "grid_architect" && !w.magnetic.grid) {
    const low = e.hp < e.maxHp * .5, collapse = low && s.attack % 2 === 1, quad = low && !collapse;
    const nodes = quad ? [{ x: 55, y: RECT.top + 110 }, { x: 285, y: RECT.top + 135 }, { x: 285, y: RECT.bottom - 75 }, { x: 65, y: RECT.bottom - 100 }]
      : [{ x: 60, y: RECT.top + 135 }, { x: 300, y: RECT.top + 135 }, { x: 180, y: RECT.bottom - 80 }];
    w.magnetic.grid = { owner: e.id, nodes, age: 0, collapse, damage: damage(e) };
    s.attack++; e.fireCooldown = 11;
    h.message(w, collapse ? "GRID COLLAPSE" : quad ? "GRID SEQUENCE" : "MAGNETIC NODES", 1.5);
  }
  return true;
}

function updateTempest(w: CombatWorld, boss: EnemyEntity, dt: number, h: MagneticHooks) {
  const s = state(boss), low = boss.hp / boss.maxHp < .15;
  drift(boss, { x: 180 + Math.sin(s.clock * .3) * 36, y: RECT.top + 95 }, 25, dt);
  if (s.attack === 0) {
    for (let slot = 0; slot < 4; slot++) {
      const satellite = h.spawn(w, "satellite", true); if (!satellite) continue;
      satellite.hp = satellite.maxHp = boss.maxHp * .075;
      satellite.damageScale = boss.damageScale * w.stage.scaling.boss.damage;
      satellite.x = boss.x; satellite.y = boss.y;
      satellite.magnetic = { clock: 0, attack: 0, anchorX: boss.x, anchorY: boss.y, angle: slot * TAU / 4, owner: boss.id, slot };
    }
    s.attack = 1;
  }
  if (!h.hostile(w, boss) || (boss.skillLockedUntil ?? 0) > w.elapsed) return;
  if (boss.fireCooldown <= 0) {
    const count = w.bossPhase >= 3 ? 4 : 2, base = Math.atan2(w.playerY - boss.y, w.playerX - boss.x);
    for (let i = 0; i < count; i++) disc(w, boss, h, count === 4 ? base + i * TAU / 4 : base + (i ? .5 : -.5), i % 2 ? -42 : 42, low);
    boss.fireCooldown = w.bossPhase >= 3 ? 6.5 : 8;
  }
  boss.secondaryCd -= dt;
  if (boss.secondaryCd <= 0) {
    const active = w.enemies.filter(e => e.type === "satellite" && e.magnetic?.owner === boss.id && !magneticEnemyDisabled(w, e));
    if (active.length >= 2 && !w.magnetic!.polarity) {
      const satellite = active[s.attack % active.length], m = state(satellite);
      const drop = point(boss.x < 180 ? 265 : 95, RECT.top + 220, 45);
      m.dropClock = 0; m.dropX = drop.x; m.dropY = drop.y; m.anchorX = satellite.x; m.anchorY = satellite.y; m.dropped = 0;
    }
    boss.secondaryCd = 10; s.attack++;
  }
  boss.tertiaryCd -= dt;
  if (w.bossPhase >= 2 && boss.tertiaryCd <= 0 && !w.magnetic!.polarity) {
    const direction: 1 | -1 = (s.release ?? 0) % 2 === 0 ? 1 : -1;
    s.release = (s.release ?? 0) + 1;
    w.magnetic!.polarity = { owner: boss.id, direction, age: 0, warning: 1.15, duration: 2.8 };
    boss.tertiaryCd = low ? 5.3 : w.bossPhase >= 3 ? 6 : 7.6;
    h.message(w, direction === 1 ? "LỰC HÚT · PULL" : "LỰC ĐẨY · PUSH", 3.95);
  }
}
function updateSatellite(w: CombatWorld, e: EnemyEntity, dt: number, h: MagneticHooks) {
  const s = state(e), boss = w.enemies.find(e => e.id === s.owner && e.hp > 0);
  if (!boss) { e.hp = 0; e.deathHandled = true; return; }
  const disabled = magneticEnemyDisabled(w, e), direction = w.bossPhase >= 3 && (s.slot ?? 0) % 2 ? -1 : 1;
  if (!disabled && s.disabledUntil) { s.disabledUntil = undefined; e.hp = e.maxHp; e.fireCooldown = 1.2; }
  s.angle += dt * .55 * direction * (boss.hp < boss.maxHp * .15 ? 1.12 : 1);
  const orbit = point(boss.x + Math.cos(s.angle) * 83, boss.y + Math.sin(s.angle) * 70, 18);
  if (disabled) { drift(e, orbit, 60, dt); return; }
  if (s.dropClock !== undefined) {
    s.dropClock += dt;
    const t = clamp(s.dropClock / 4.5, 0, 1), arc = Math.sin(t * Math.PI);
    drift(e, point(orbit.x + (s.dropX! - orbit.x) * arc, orbit.y + (s.dropY! - orbit.y) * arc), 100, dt);
    if (s.dropClock > 1.8 + (s.dropped ?? 0) * .45 && (s.dropped ?? 0) < 3) {
      seedMine(w, e, { x: e.x + ((s.dropped ?? 0) - 1) * 90, y: e.y + 65 }); s.dropped = (s.dropped ?? 0) + 1;
    }
    if (t >= 1) s.dropClock = undefined;
    return;
  }
  drift(e, orbit, 95, dt);
  const pair = Math.floor(s.clock / 3.2) % 2;
  if (s.clock > 1.4 && (s.slot ?? 0) % 2 === pair && e.fireCooldown <= 0 && h.hostile(w, e)) {
    bullet(w, e, h, s.angle, 105); e.fireCooldown = 1.6;
  }
}

/** Owns the motion only; the shared projectile pipeline still resolves hitboxes,
 * armor, invulnerability, skills and damage after this update. */
export function updateMagneticProjectile(w: CombatWorld, p: ProjectileEntity, dt: number, h: MagneticHooks): boolean {
  const m = p.magnetic; if (!m) return false;
  m.age += dt; p.lifetime -= dt;
  if (p.lifetime <= 0) return true;
  if (m.kind === "orb") {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (m.age >= 1.1) {
      for (const side of [-1, 1]) {
        const angle = m.baseAngle + side * Math.PI / 6;
        h.projectile(w, { owner: p.owner, allegiance: p.allegiance, sourceEnemyId: p.sourceEnemyId, sourceEnemyType: p.sourceEnemyType,
          x: p.x, y: p.y, vx: Math.cos(angle) * 132, vy: Math.sin(angle) * 132, rawDamage: p.rawDamage * .75, radius: 4, color: "#e9d5ff" });
      }
      p.lifetime = 0;
    }
    return true;
  }
  const returnAt = m.outbound + m.turn;
  m.phase = m.age < m.outbound ? "outbound" : m.age < returnAt ? "turn" : "return";
  const ease = (t: number) => (1 - Math.cos(clamp(t, 0, 1) * Math.PI)) / 2;
  const t = m.phase === "outbound" ? ease(m.age / m.outbound) : m.phase === "turn" ? 1 : 1 - ease((m.age - returnAt) / m.returnDuration);
  // Fixed launch anchor survives the source's death. Return never tracks the player.
  const bend = Math.sin(t * Math.PI) * m.curve * (m.phase === "return" ? -1 : 1);
  p.x = m.originX + (m.endX - m.originX) * t - Math.sin(m.baseAngle) * bend;
  p.y = m.originY + (m.endY - m.originY) * t + Math.cos(m.baseAngle) * bend;
  p.vx = (p.x - p.previousX) / Math.max(dt, .001); p.vy = (p.y - p.previousY) / Math.max(dt, .001);
  p.color = m.phase === "return" ? "#c084fc" : m.phase === "turn" ? "#fde68a" : "#67e8f9";
  if (m.age >= returnAt + m.returnDuration) p.lifetime = 0;
  return true;
}
const contact = createHitResult();
export function updateMagneticHazards(w: CombatWorld, dt: number, h: MagneticHooks) {
  const m = w.magnetic; if (!m || w.ended) return;
  let forceX = 0, forceY = 0;
  for (const e of w.enemies) if (e.type === "magnetic_leech" && e.hp > 0 && e.stun <= 0 && e.magnetic?.tether && h.hostile(w, e)) {
    const dx = e.x - w.playerX, dy = e.y - w.playerY, distance = Math.max(1, Math.hypot(dx, dy));
    const strength = 16 + 10 * (1 - Math.min(1, distance / 245));
    forceX += dx / distance * strength; forceY += dy / distance * strength;
  }
  const polarity = m.polarity;
  if (polarity) {
    polarity.age += dt;
    const boss = w.enemies.find(e => e.id === polarity.owner && h.hostile(w, e));
    if (!boss || polarity.age >= polarity.warning + polarity.duration) m.polarity = undefined;
    else if (polarity.age >= polarity.warning && boss.stun <= 0) {
      const dx = boss.x - w.playerX, dy = boss.y - w.playerY, d = Math.max(1, Math.hypot(dx, dy));
      forceX += dx / d * 32 * polarity.direction; forceY += dy / d * 32 * polarity.direction;
    }
  }
  const force = Math.hypot(forceX, forceY), limit = Math.min(1, 38 / Math.max(1, force));
  pushPlayer(w, forceX * limit * dt, forceY * limit * dt);
  const player = getPlayerHitbox(w);
  for (let i = m.mines.length - 1; i >= 0; i--) {
    const mine = m.mines[i]; mine.age += dt;
    mine.y = mine.startY + (mine.targetY - mine.startY) * clamp(mine.age / .8, 0, 1);
    if (mine.warning >= 0) {
      mine.warning += dt;
      if (mine.warning >= .7 && !mine.exploded) {
        mine.exploded = true;
        if (circleVsAircraft(mine.x, mine.y, 40, player)) h.hit(w, mine.damage, mine.owner);
      }
      if (mine.warning > 1.05) m.mines.splice(i, 1);
    } else if (mine.age > 8) m.mines.splice(i, 1);
    else if (mine.age >= 1.6 && Math.hypot(w.playerX - mine.x, w.playerY - mine.y) < 58) mine.warning = 0;
  }
  for (const blade of m.blades) if (blade.active && circleVsAircraft(blade.x, blade.y, blade.radius, player)) h.hit(w, blade.damage, blade.owner);
  const grid = m.grid;
  if (grid) {
    grid.age += dt;
    const owner = w.enemies.find(e => e.id === grid.owner && h.hostile(w, e));
    if (!owner || grid.age > 2 + grid.nodes.length * 1.8) { m.grid = undefined; return; }
    if (grid.collapse && grid.age > 2) {
      const center = { x: grid.nodes.reduce((n, p) => n + p.x, 0) / 3, y: grid.nodes.reduce((n, p) => n + p.y, 0) / 3 };
      for (const node of grid.nodes) { node.x += (center.x - node.x) * dt * .09; node.y += (center.y - node.y) * dt * .09; }
    }
    const edge = activeGridEdge(grid);
    if (edge?.active && owner.stun <= 0 && segmentVsAircraft(edge.a.x, edge.a.y, edge.b.x, edge.b.y, 4, player, contact).hit) h.hit(w, grid.damage, grid.owner);
  }
}
function gridOrder(g: Grid) { return g.nodes.length === 4 ? [[0, 1], [2, 3], [1, 2], [3, 0]] : [[0, 1], [1, 2], [2, 0]]; }
function activeGridEdge(g: Grid) {
  if (g.age < 2) return;
  const index = Math.floor((g.age - 2) / 1.8), pair = gridOrder(g)[index]; if (!pair) return;
  return { a: g.nodes[pair[0]], b: g.nodes[pair[1]], active: (g.age - 2) % 1.8 >= .9 };
}

/** Same bounded geometry in both renderers. No presentation code changes combat. */
export function paintMagnetic(world: CombatWorld, p: TacticalPainter, reducedMotion: boolean) {
  const m = world.magnetic; if (!m || world.ended) return;
  const now = world.elapsed;
  for (const e of world.enemies) {
    const s = e.magnetic, disabled = magneticEnemyDisabled(world, e), color = disabled ? 0x475569 : e.type === "boss" || e.type === "grid_architect" ? 0xc084fc : 0x67e8f9;
    const r = e.radius, width = e.type === "boss" ? r * 1.5 : r * .65;
    // Distinct magnetic machine silhouettes, authored as vector geometry.
    p.circle(e.x, e.y, r * .65, 0x0c1934, .98, true);
    p.circle(e.x, e.y, r * .65, color, disabled ? .35 : .85);
    p.line(e.x, e.y - r * .65, e.x, e.y + r * .65, color, .9, Math.max(2, r * .18));
    for (const side of [-1, 1]) {
      p.line(e.x, e.y - r * .2, e.x + side * width, e.y + r * .12, color, .9, Math.max(2, r * .15));
      p.line(e.x + side * width, e.y + r * .12, e.x + side * width * .7, e.y - r * .5, color, .9, 2);
    }
    if (e.type === "prism_manta" || e.type === "arc_reaver") {
      for (const side of [-1, 1]) p.line(e.x + side * r * .85, e.y, e.x, e.y + r * .75, 0xe9d5ff, .8, 2);
    }
    if (e.type === "mine_seeder" || e.type === "swarm_carrier") {
      for (let i = -1; i <= 1; i++) p.circle(e.x + i * r * .45, e.y + r * .6, 3, color, .9, true);
    }
    if (e.type === "boss") { p.circle(e.x, e.y, r * .9, color, .35); p.label?.(e.x, e.y - r, "TEMPEST CROWN", color, 8); }
    else if (e.type === "cyclone_ace" || e.type === "grid_architect") p.label?.(e.x, e.y - r - 15, ENEMY_CONFIGS[e.type].name.split(" · ")[0], color, 8);
    else if (e.type !== "satellite" && e.type !== "micro_drone" && e.age < 3) p.label?.(e.x, e.y - r - 8, ENEMY_CONFIGS[e.type].name.split(" · ")[0], color, 6);
    if (e.type === "satellite") {
      p.label?.(e.x, e.y - 16, disabled ? `DISABLED ${Math.ceil((s?.disabledUntil ?? now) - now)}s` : `STB ${Math.ceil(e.hp / e.maxHp * 100)}%`, color, 6);
      if (!disabled && !reducedMotion) {
        p.circle(e.x, e.y, r + 3 + Math.sin(now * 2), color, .25);
        const boss = world.enemies.find(b => b.id === s?.owner);
        if (boss && s && s.dropClock === undefined) for (let i = 0; i < 4; i++) {
          const direction = world.bossPhase >= 3 && (s.slot ?? 0) % 2 ? -1 : 1;
          const a = s.angle - i * .09 * direction, b = a - .09 * direction;
          p.line(boss.x + Math.cos(a)*83,boss.y+Math.sin(a)*70,boss.x+Math.cos(b)*83,boss.y+Math.sin(b)*70,color,.3-i*.055,2);
        }
      }
    }
    if (s?.tether && e.hp > 0 && e.stun <= 0) {
      p.line(e.x, e.y, world.playerX, world.playerY, 0x22d3ee, .55, 1.5);
      const t = reducedMotion ? .5 : now * .6 % 1;
      p.circle(world.playerX + (e.x - world.playerX) * t, world.playerY + (e.y - world.playerY) * t, 3, 0xc4b5fd, .9, true);
    }
    if (e.type === "micro_drone" && s && s.clock < 3.2) {
      p.line(s.anchorX, s.anchorY, e.x, e.y, 0x67e8f9, .15, 1);
      p.circle(e.x, e.y, r + 5, s.clock > 2.4 ? 0xfde68a : 0x67e8f9, .5);
    }
  }
  for (const blade of m.blades) {
    const color = blade.active ? 0xc084fc : 0xfde68a;
    p.circle(blade.x, blade.y, blade.radius, color, blade.active ? .85 : .35);
    p.line(blade.x - 7, blade.y + 5, blade.x + 7, blade.y - 5, color, .95, 3);
    const e = world.enemies.find(e => e.id === blade.owner);
    if (e) p.line(e.x, e.y, blade.x, blade.y, color, .12, 1);
  }
  for (const q of world.projectiles) if (q.magnetic) {
    const phase = q.magnetic.phase, color = phase === "return" ? 0xc084fc : phase === "turn" ? 0xfde68a : 0x67e8f9;
    p.circle(q.x, q.y, q.radius, color, .3, true);
    p.circle(q.x, q.y, q.radius + 2, color, .85);
    if (q.magnetic.kind === "orb" && q.magnetic.age > .8) {
      p.circle(q.x, q.y, q.radius + 6, 0xfef3c7, .85);
      for (const side of [-1, 1]) { const a = q.magnetic.baseAngle + side * Math.PI / 6; p.line(q.x, q.y, q.x + Math.cos(a) * 25, q.y + Math.sin(a) * 25, 0xfef3c7, .5, 1); }
    } else if (phase === "turn") {
      p.circle(q.x, q.y, q.radius + 7, color, .5); p.label?.(q.x, q.y - 12, "RETURN", color, 6);
    } else if (!reducedMotion) p.line(q.x, q.y, q.x - q.vx * .08, q.y - q.vy * .08, color, .5, 2);
  }
  for (const mine of m.mines) {
    const color = mine.warning >= 0 ? 0xfbbf24 : mine.age < 1.6 ? 0x818cf8 : 0xc084fc;
    p.circle(mine.x, mine.y, mine.exploded ? 40 : 7, color, mine.exploded ? .3 : .85, true);
    p.circle(mine.x, mine.y, mine.warning >= 0 ? 40 : 58, color, mine.warning >= 0 ? .7 : .16);
    p.line(mine.x - 4, mine.y, mine.x + 4, mine.y, 0xffffff, .9, 1);
    p.line(mine.x, mine.y - 4, mine.x, mine.y + 4, 0xffffff, .9, 1);
    if (mine.warning >= 0 && !mine.exploded) p.label?.(mine.x, mine.y - 12, `${Math.max(0, .7 - mine.warning).toFixed(1)}s`, color, 7);
    else if (mine.age < 1.6) p.circle(mine.x, mine.y, 12, color, .4);
  }
  const grid = m.grid;
  if (grid) {
    grid.nodes.forEach((node, i) => { if (grid.age >= i * .4) { p.circle(node.x, node.y, 7, 0xa78bfa, .9); p.circle(node.x, node.y, 3, 0xe9d5ff, .9, true); } });
    if (grid.age >= (grid.nodes.length - 1) * .4) for (const [a, b] of gridOrder(grid)) p.line(grid.nodes[a].x, grid.nodes[a].y, grid.nodes[b].x, grid.nodes[b].y, 0x818cf8, .18, 1);
    const edge = activeGridEdge(grid);
    if (edge) p.line(edge.a.x, edge.a.y, edge.b.x, edge.b.y, edge.active ? 0xe9d5ff : 0xfbbf24, edge.active ? .95 : reducedMotion ? .5 : .35 + Math.sin(now * 9) * .2, edge.active ? 8 : 2);
  }
  const polarity = m.polarity, boss = polarity && world.enemies.find(e => e.id === polarity.owner);
  if (polarity && boss) {
    const active = polarity.age >= polarity.warning, pull = polarity.direction === 1, color = pull ? 0x22d3ee : 0xc084fc;
    p.label?.(180, RECT.top + 24, `${pull ? "↓ LỰC HÚT · PULL" : "↑ LỰC ĐẨY · PUSH"}${active ? "" : " · CHUẨN BỊ"}`, color, 10);
    for (let i = 0; i < 8; i++) {
      const angle = i * TAU / 8, phase = reducedMotion ? .5 : (now * .45) % 1;
      const radius = 80 + (pull ? 1 - phase : phase) * 100, x = boss.x + Math.cos(angle) * radius, y = boss.y + Math.sin(angle) * radius;
      const direction = angle + (pull ? Math.PI : 0);
      for (const side of [-1, 1]) p.line(x, y, x - Math.cos(direction + side * .6) * 10, y - Math.sin(direction + side * .6) * 10, color, active ? .75 : .3, 2);
    }
    p.circle(boss.x, boss.y, 115, color, active ? .3 : .12);
  }
}

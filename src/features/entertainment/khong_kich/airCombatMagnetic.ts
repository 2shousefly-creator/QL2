import { AIR_COMBAT_WORLD, ENEMY_CONFIGS, GAMEPLAY_SAFE_RECT as RECT } from "./airCombatConfig";
import { circleVsAircraft, getPlayerHitbox, clampHitboxToGameplayRect, segmentVsAircraft, createHitResult } from "./airCombatHitboxes";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { EnemyType } from "./airCombatTypes";
import type { TacticalPainter } from "./airCombatTacticalVisuals";
import type { MagneticVfxKey } from "./airCombatStage2Art";

type Point = { x: number; y: number };
export interface MagneticEnemyState {
  clock: number; attack: number; anchorX: number; anchorY: number; angle: number;
  owner?: number; slot?: number; disabledUntil?: number; tether?: boolean;
  openerDelay?: number; patternAge?: number; nextPatternAt?: number;
  hitFxAt?: number; tetherUntil?: number; tetherReadyAt?: number; phase?: number; beamCooldown?: number;
  release?: number; releaseClock?: number; dropClock?: number; dropX?: number; dropY?: number; dropped?: number;
}
export interface MagneticProjectileState {
  kind: "disc" | "orb"; age: number; originX: number; originY: number;
  endX: number; endY: number; curve: number; outbound: number; turn: number; returnDuration: number;
  phase: "outbound" | "turn" | "return"; baseAngle: number;
}
interface Mine extends Point { id: number; owner: number; sourceType: EnemyType; damage: number; age: number; warning: number; exploded: boolean; startY: number; targetY: number }
interface Grid { owner: number; nodes: Point[]; age: number; collapse: boolean; damage: number }
interface Blade extends Point { owner: number; active: boolean; radius: number; damage: number }
export interface MagneticWorldState {
  mines: Mine[]; grid?: Grid; blades: Blade[];
  effects?: { id: number; key: MagneticVfxKey; x: number; y: number; size: number; at: number; duration: number; rotation: number }[];
  nextEliteThreatAt?: number;
  beam?: { owner: number; from: Point; end: Point; age: number; warning: number; duration: number; damage: number };
  polarity?: { owner: number; direction: 1 | -1; age: number; warning: number; duration: number };
}
export interface MagneticHooks {
  spawn(world: CombatWorld, type: EnemyType, auxiliary?: boolean): EnemyEntity | null;
  projectile(world: CombatWorld, values: Partial<ProjectileEntity> & Pick<ProjectileEntity, "owner" | "x" | "y" | "vx" | "vy" | "rawDamage">): ProjectileEntity | null;
  hit(world: CombatWorld, damage: number, owner: number, sourceType?: EnemyType): void;
  hostile(world: CombatWorld, enemy: EnemyEntity): boolean;
  message(world: CombatWorld, text: string, duration: number): void;
}
const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const point = (x: number, y: number, margin = 22): Point => ({ x: clamp(x, RECT.left + margin, RECT.right - margin), y: clamp(y, RECT.top + margin, RECT.bottom - margin) });
export const magneticEnemyDisabled = (world: CombatWorld, enemy: EnemyEntity) => enemy.type === "satellite" && (enemy.magnetic?.disabledUntil ?? 0) > world.elapsed;
const state = (e: EnemyEntity): MagneticEnemyState => e.magnetic ??= { clock: 0, attack: 0, anchorX: e.x, anchorY: e.y, angle: e.phaseSeed };
const damage = (e: EnemyEntity) => ENEMY_CONFIGS[e.type].projectileDamage * e.damageScale;
/** Cosmetic event journal: bounded, combat-clock timed, shared by both renderers. */
export function magneticFx(w: CombatWorld, key: MagneticVfxKey, x: number, y: number, size: number, duration = .35, rotation = 0, delay = 0) {
  if (!w.magnetic) return;
  const effects = w.magnetic.effects ??= [];
  if (effects.length >= 64) effects.shift();
  effects.push({ id: w.nextId++, key, x, y, size, at: w.elapsed + delay, duration, rotation });
}
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
  const visual: MagneticVfxKey = e.type === "boss" ? "crownBolt" : e.type === "satellite" ? "satelliteOrb"
    : e.type === "prism_manta" ? "prismOrb" : e.type === "arc_reaver" ? "arcBolt"
    : e.type === "micro_drone" ? "microSpark" : "needleBolt";
  const shot = h.projectile(w, { owner: "enemy", sourceEnemyId: e.id, sourceEnemyType: e.type, x: e.x, y: e.y,
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, rawDamage: damage(e) * factor,
    radius: e.type === "boss" ? 6 : 4, color: "#67e8f9", magneticVisual: visual });
  if (shot) magneticFx(w, e.type === "boss" || e.type === "cyclone_ace" ? "eliteMuzzle" : "smallMuzzle", e.x, e.y, e.radius * 1.2, .14, angle + Math.PI);
  return shot;
}
function disc(w: CombatWorld, e: EnemyEntity, h: MagneticHooks, angle: number, curve = 36, fast = false) {
  const travel = Math.max(280, Math.hypot(w.playerX - e.x, w.playerY - e.y) + 75);
  const end = point(e.x + Math.cos(angle) * travel, e.y + Math.sin(angle) * travel, 12);
  const p = bullet(w, e, h, angle, 0);
  if (p) {
    p.magneticVisual = "returningDisc"; p.radius = 8; p.lifetime = 8; p.color = "#67e8f9";
    p.magnetic = { kind: "disc", age: 0, originX: e.x, originY: e.y, endX: end.x, endY: end.y,
      curve, outbound: 1.7, turn: fast ? .55 : .75, returnDuration: 1.7, phase: "outbound", baseAngle: angle };
  }
}
function seedMine(w: CombatWorld, e: EnemyEntity, at: Point): boolean {
  const m = w.magnetic!, safe = point(at.x, at.y, 42);
  if (m.mines.length >= 6 || Math.hypot(safe.x - w.playerX, safe.y - w.playerY) < 85 ||
      Math.hypot(safe.x - w.playerX, e.y - w.playerY) < 55 ||
      m.mines.some(mine => Math.hypot(mine.x - safe.x, mine.targetY - safe.y) < 88)) return false;
  m.mines.push({ ...safe, id: w.nextId++, owner: e.id, sourceType: e.type, age: 0, warning: -1, exploded: false,
    startY: e.y, targetY: safe.y, damage: damage(e) });
  return true;
}
export function resetMagneticHazards(w: CombatWorld) {
  if (w.magnetic) { w.magnetic.mines.length = 0; w.magnetic.blades.length = 0; w.magnetic.grid = undefined; w.magnetic.polarity = undefined; w.magnetic.beam = undefined; w.magnetic.nextEliteThreatAt = 0; }
}
/** Satellites stay in the existing hittable enemy collection; zero Stability disables,
 * never enters the kill/reward/proc pipeline and never transfers damage to the boss. */
export function disableMagneticSatellite(w: CombatWorld, e: EnemyEntity): boolean {
  if (e.type !== "satellite") return false;
  const s = state(e); s.disabledUntil = w.elapsed + 6; s.dropClock = undefined;
  e.hp = e.maxHp; e.burn = 0; e.stun = 0; e.shield = 0;
  w.skillCores.enemyEffects.delete(e.id);
  magneticFx(w, "shieldFlare", e.x, e.y, 36, .4);
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
  s.openerDelay = Math.max(0, (s.openerDelay ?? 0) - dt);
  const canFire = hostile && !locked && !s.openerDelay;
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
    drift(e, point(180 + Math.sin(s.clock * (low ? .55 : .38) + e.phaseSeed) * (low ? 115 : 72), RECT.top + 125 + Math.cos(s.clock * .5 + e.phaseSeed) * 35, 36), low ? 63 : 40, dt);
    const hasDiscs = w.projectiles.some(p => p.sourceEnemyId === e.id && p.magnetic?.kind === "disc" && p.lifetime > 0);
    if (s.release !== undefined) {
      s.releaseClock = (s.releaseClock ?? 0) - dt;
      if (s.release < 3 && s.releaseClock <= 0 && canFire) {
        disc(w, e, h, aim + (s.release - 1) * .48, (s.release % 2 ? -1 : 1) * 55);
        magneticFx(w, "bladeSlash", e.x, e.y, 48, .28, aim);
        s.release++; s.releaseClock = .4;
      }
      if (s.release >= 3 && !hasDiscs) { s.release = undefined; s.patternAge = undefined; s.nextPatternAt = w.elapsed + 1.2; }
    } else {
      if (s.patternAge === undefined && canFire && w.elapsed >= (s.nextPatternAt ?? 0) && w.elapsed >= (w.magnetic.nextEliteThreatAt ?? 0)) {
        s.patternAge = 0; w.magnetic.nextEliteThreatAt = w.elapsed + 1.2;
      }
      if (s.patternAge !== undefined && canFire) s.patternAge += dt;
      const age = s.patternAge ?? 0, cycle = Math.min(age, 8.4) % 4.2;
      const active = s.patternAge !== undefined && cycle > .85 && canFire;
      const radius = 30 + Math.sin(clamp((cycle - .85) / 3.35, 0, 1) * Math.PI) * 78;
      for (let i = 0; i < 3; i++) {
        const angle = s.clock * 1.1 + i * TAU / 3;
        w.magnetic.blades.push({ x: e.x + Math.cos(angle) * radius, y: e.y + Math.sin(angle) * radius, owner: e.id, radius: 10, damage: damage(e), active });
      }
      if (age >= 8.4 && canFire && w.elapsed >= (w.magnetic.nextEliteThreatAt ?? 0)) {
        s.release = 0; s.releaseClock = .85; w.magnetic.nextEliteThreatAt = w.elapsed + 1.2;
        h.message(w, "CYCLONE · BLADE RELEASE", .85);
      }
    }
    return true;
  }
  drift(e, point(180 + Math.sin(s.clock * .55 + e.phaseSeed) * (e.type === "mine_seeder" ? 118 : 90), RECT.top + 75 + (e.id % 3) * 35), ENEMY_CONFIGS[e.type].speed, dt);
  if (e.type === "magnetic_leech") {
    const distance = Math.hypot(e.x - w.playerX, e.y - w.playerY);
    const canTether = canFire && s.clock > 1.3 && w.dashRemaining <= 0;
    if (s.tether && (!canTether || distance >= 245 || w.elapsed >= (s.tetherUntil ?? 0))) {
      s.tether = false; s.tetherReadyAt = w.elapsed + 2;
    }
    if (!s.tether && canTether && distance < 180 && w.elapsed >= (s.tetherReadyAt ?? 0)) {
      s.tether = true; s.tetherUntil = w.elapsed + 3;
      magneticFx(w, "tetherPulse", e.x, e.y, 20, .3);
    }
    // Two leeches at most; total force is clamped centrally after all enemies.
    if (canFire && e.fireCooldown <= 0) { bullet(w, e, h, aim, 95, .65); e.fireCooldown = 4.5; }
  }
  if (!canFire || e.fireCooldown > 0) return true;
  // One shared damaging sequence; another architect keeps moving/preparing.
  if (e.type === "grid_architect" && w.magnetic.grid) return true;
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
    if (count < 6) magneticFx(w, "droneSpawn", e.x, e.y + 16, 38, .5);
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
      // Boss attacks carry their scale to the shared hit pipeline. Satellites
      // have their own source type and therefore receive that scale once here.
      satellite.damageScale = boss.damageScale * w.stage.scaling.boss.damage;
      satellite.x = boss.x; satellite.y = boss.y;
      magneticFx(w, "droneSpawn", boss.x, boss.y, 55, .6);
      satellite.magnetic = { clock: 0, attack: 0, anchorX: boss.x, anchorY: boss.y, angle: slot * TAU / 4, owner: boss.id, slot };
    }
    s.attack = 1;
  }
  if (s.phase !== w.bossPhase) {
    s.phase = w.bossPhase;
    magneticFx(w, "magneticBurst", boss.x, boss.y, 160, .85);
  }
  if (!h.hostile(w, boss) || (boss.skillLockedUntil ?? 0) > w.elapsed) return;
  if (boss.fireCooldown <= 0) {
    const count = w.bossPhase >= 3 ? 4 : 2, base = Math.atan2(w.playerY - boss.y, w.playerX - boss.x);
    for (let i = 0; i < count; i++) disc(w, boss, h, count === 4 ? base + i * TAU / 4 : base + (i ? .5 : -.5), i % 2 ? -42 : 42, low);
    for (let i = -1; i <= 1; i++) bullet(w, boss, h, base + i * .22, 118, 1);
    boss.fireCooldown = w.bossPhase >= 3 ? 6.5 : 8;
  }
  s.beamCooldown = (s.beamCooldown ?? 7) - dt;
  if (w.bossPhase >= 2 && s.beamCooldown <= 0 && !w.magnetic!.beam && !w.magnetic!.polarity) {
    const angle = Math.atan2(w.playerY - boss.y, w.playerX - boss.x);
    w.magnetic!.beam = { owner: boss.id, from: { x: boss.x, y: boss.y },
      end: { x: boss.x + Math.cos(angle) * 640, y: boss.y + Math.sin(angle) * 640 },
      age: 0, warning: 1.25, duration: .85, damage: damage(boss) };
    s.beamCooldown = w.bossPhase >= 3 ? 9 : 12;
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
  if (w.bossPhase >= 2 && boss.tertiaryCd <= 0 && !w.magnetic!.polarity && !w.magnetic!.beam) {
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
  if (!disabled && s.disabledUntil) { s.disabledUntil = undefined; e.hp = e.maxHp; e.fireCooldown = 1.2; magneticFx(w, "satelliteReboot", e.x, e.y, 45, .6); }
  s.angle += dt * .55 * direction * (boss.hp < boss.maxHp * .15 ? 1.12 : 1);
  const orbit = point(boss.x + Math.cos(s.angle) * 83, boss.y + Math.sin(s.angle) * 70, 18);
  if (disabled) { drift(e, orbit, 60, dt); return; }
  if (!h.hostile(w, e) || (e.skillLockedUntil ?? 0) > w.elapsed) return;
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
    if (m.age >= m.outbound) {
      magneticFx(w, "plasmaImpact", p.x, p.y, 30, .24);
      for (const side of [-1, 1]) {
        const angle = m.baseAngle + side * Math.PI / 6;
        h.projectile(w, { owner: p.owner, allegiance: p.allegiance, sourceEnemyId: p.sourceEnemyId, sourceEnemyType: p.sourceEnemyType,
          x: p.x, y: p.y, vx: Math.cos(angle) * 132, vy: Math.sin(angle) * 132, rawDamage: p.rawDamage * .75, radius: 4, color: "#e9d5ff", magneticVisual: "prismShard" });
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
  if (m.effects) m.effects = m.effects.filter(fx => w.elapsed < fx.at + fx.duration);
  // Break latches immediately under control effects, dash or separation, even
  // when a stunned enemy skips its AI update.
  for (const e of w.enemies) if (e.magnetic?.tether && (e.hp <= 0 || e.stun > 0 ||
      (e.skillLockedUntil ?? 0) > w.elapsed || w.dashRemaining > 0 || !h.hostile(w, e) ||
      Math.hypot(e.x - w.playerX, e.y - w.playerY) >= 245 || w.elapsed >= (e.magnetic.tetherUntil ?? 0))) {
    e.magnetic.tether = false; e.magnetic.tetherReadyAt = w.elapsed + 2;
  }
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
    if (!boss || (boss.skillLockedUntil ?? 0) > w.elapsed || polarity.age >= polarity.warning + polarity.duration) m.polarity = undefined;
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
        magneticFx(w, "mineShockwave", mine.x, mine.y, 80, .35);
        if (circleVsAircraft(mine.x, mine.y, 40, player)) h.hit(w, mine.damage, mine.owner, mine.sourceType);
      }
      if (mine.warning > 1.05) m.mines.splice(i, 1);
    } else if (mine.age > 8) m.mines.splice(i, 1);
    else if (mine.age >= 1.6 && Math.hypot(w.playerX - mine.x, w.playerY - mine.y) < 58) mine.warning = 0;
  }
  for (const blade of m.blades) if (blade.active && circleVsAircraft(blade.x, blade.y, blade.radius, player)) h.hit(w, blade.damage, blade.owner);
  const beam = m.beam;
  if (beam) {
    const owner = w.enemies.find(e => e.id === beam.owner && h.hostile(w, e));
    if (!owner || (owner.skillLockedUntil ?? 0) > w.elapsed) m.beam = undefined;
    else if (owner.stun <= 0) {
      beam.age += dt;
      if (beam.age > beam.warning + beam.duration) m.beam = undefined;
      else if (beam.age >= beam.warning && segmentVsAircraft(beam.from.x, beam.from.y, beam.end.x, beam.end.y, 5, player, contact).hit)
        h.hit(w, beam.damage, beam.owner, "boss");
    }
  }
  const grid = m.grid;
  if (grid) {
    const owner = w.enemies.find(e => e.id === grid.owner && h.hostile(w, e));
    if (owner && owner.stun <= 0 && (owner.skillLockedUntil ?? 0) <= w.elapsed) grid.age += dt;
    if (!owner || (owner.skillLockedUntil ?? 0) > w.elapsed || grid.age > 2 + grid.nodes.length * 1.8) { m.grid = undefined; return; }
    if (grid.collapse && grid.age > 2) {
      const center = { x: grid.nodes.reduce((n, p) => n + p.x, 0) / grid.nodes.length, y: grid.nodes.reduce((n, p) => n + p.y, 0) / grid.nodes.length };
      for (const node of grid.nodes) { node.x += (center.x - node.x) * dt * .09; node.y += (center.y - node.y) * dt * .09; }
    }
    const edge = activeGridEdge(grid);
    if (edge?.active && owner.stun <= 0 && segmentVsAircraft(edge.a.x, edge.a.y, edge.b.x, edge.b.y, 4, player, contact).hit) h.hit(w, grid.damage, grid.owner, "grid_architect");
  }
}
function gridOrder(g: Grid) { return g.nodes.length === 4 ? [[0, 1], [2, 3], [1, 2], [3, 0]] : [[0, 1], [1, 2], [2, 0]]; }
function activeGridEdge(g: Grid) {
  if (g.age < 2) return;
  const index = Math.floor((g.age - 2) / 1.8), pair = gridOrder(g)[index]; if (!pair) return;
  return { a: g.nodes[pair[0]], b: g.nodes[pair[1]], active: (g.age - 2) % 1.8 >= .9 };
}


export interface MagneticPainter {
  label: TacticalPainter["label"];
  sprite(id: number, key: MagneticVfxKey, x: number, y: number, width: number, height: number,
    rotation?: number, alpha?: number, tint?: number): void;
}
/** Presentation consumes the exact hazard state/geometry; never advances combat. */
export function paintMagnetic(world: CombatWorld, p: MagneticPainter, reducedMotion: boolean, presentationTime = world.elapsed) {
  const m = world.magnetic; if (!m) return;
  const now = presentationTime;
  let id = 0;
  const fx = (key: MagneticVfxKey, x: number, y: number, w: number, h = w, rotation = 0, alpha = 1, tint = 0xffffff) =>
    p.sprite(++id, key, x, y, w, h, rotation, alpha, tint);
  const link = (key: "gridBeam" | "magneticBeam", a: Point, b: Point, width: number, alpha: number, tint = 0xffffff) =>
    fx(key, (a.x + b.x) / 2, (a.y + b.y) / 2, Math.hypot(b.x - a.x, b.y - a.y), width, Math.atan2(b.y - a.y, b.x - a.x), alpha, tint);
  for (const effect of m.effects ?? []) {
    if (now < effect.at) continue;
    const t = clamp((now - effect.at) / effect.duration, 0, 1);
    if (t >= 1) continue;
    fx(effect.key, effect.x, effect.y, effect.size * (.8 + t * .2), effect.size * (.8 + t * .2), effect.rotation, 1 - t);
  }
  if (world.ended) return;
  for (const e of world.enemies) {
    const s = e.magnetic; if (!s || e.hp <= 0) continue;
    if (e.shield > 0 || e.aegisUntil > world.aircraft.coreState.time)
      fx("shieldFlare", e.x, e.y, e.radius * 2.6, e.radius * 2.6, 0, .5);
    if (e.type === "satellite") {
      const disabled = magneticEnemyDisabled(world, e);
      p.label?.(e.x, e.y - 17, disabled ? `DISABLED ${Math.ceil((s.disabledUntil ?? now) - now)}s` : `STB ${Math.ceil(e.hp / e.maxHp * 100)}%`, disabled ? 0x94a3b8 : 0x67e8f9, 6);
    } else if (e.type === "cyclone_ace" || e.type === "grid_architect") {
      p.label?.(e.x, e.y - e.radius * 1.5, ENEMY_CONFIGS[e.type].name.split(" · ")[0], 0xc4b5fd, 8);
    }
    if (e.type === "grid_architect" && (!m.grid || m.grid.owner !== e.id) && e.fireCooldown <= 2)
      fx("beamCharge", e.x, e.y, 24, 24, 0, .5);
    if (s.tether && e.stun <= 0 && (e.skillLockedUntil ?? 0) <= now) {
      const player = { x: world.playerX, y: world.playerY };
      link("magneticBeam", e, player, 6, .55);
      const t = reducedMotion ? .5 : now * .65 % 1;
      fx("tetherPulse", player.x + (e.x - player.x) * t, player.y + (e.y - player.y) * t, 8, 13, Math.atan2(e.y - player.y, e.x - player.x) + Math.PI / 2);
      fx("electricImpact", player.x, player.y, 15, 15, 0, .6);
      fx("tetherPulse", e.x, e.y, 15, 15, 0, .6);
    }
    if (e.type === "cyclone_ace" && s.release === 0)
      fx("eliteMuzzle", e.x, e.y, 40, 40, 0, .8);
  }
  for (const blade of m.blades) {
    const owner = world.enemies.find(e => e.id === blade.owner);
    const angle = owner ? Math.atan2(blade.y - owner.y, blade.x - owner.x) : 0;
    fx("bladeSlash", blade.x, blade.y, blade.radius * 2.2, blade.radius * 2.2, angle + Math.PI / 2, blade.active ? 1 : .45, blade.active ? 0xffffff : 0xffe59a);
  }
  for (const q of world.projectiles) if (q.owner === "enemy" && q.magneticVisual) {
    const disc = q.magnetic?.kind === "disc", orb = q.magnetic?.kind === "orb";
    const phase = q.magnetic?.phase;
    const tint = q.allegiance === "friendly_hacked" ? 0x86efac : phase === "turn" ? 0xffe6a1 : phase === "return" ? 0xdfb8ff : 0xffffff;
    const heading = Math.atan2(q.vy, q.vx) + Math.PI / 2;
    const rotation = disc ? reducedMotion ? 0 : now * 8 : heading;
    fx(q.magneticVisual, q.x, q.y, q.radius * 2.4, q.radius * (disc || orb ? 2.4 : 3.4), rotation, 1, tint);
    if (disc && phase === "turn") {
      fx("warningPulse", q.x, q.y, 26, 26, 0, .6);
      p.label?.(q.x, q.y - 13, "RETURN", 0xffe6a1, 6);
    } else if (disc && !reducedMotion) {
      fx("returningDisc", q.x - q.vx * .045, q.y - q.vy * .045, 14, 14, rotation - .4, .18, tint);
    }
    if (orb && (q.magnetic?.age ?? 0) > .8) {
      fx("warningPulse", q.x, q.y, 28, 28, 0, .8);
      for (const side of [-1, 1]) {
        const a = q.magnetic!.baseAngle + side * Math.PI / 6;
        fx("prismShard", q.x + Math.cos(a) * 18, q.y + Math.sin(a) * 18, 5, 9, a + Math.PI / 2, .45);
      }
    }
  }
  for (const mine of m.mines) {
    if (mine.exploded) continue;
    fx("magneticMine", mine.x, mine.y, 17, 17, 0, mine.age < 1.6 ? .6 : 1);
    if (mine.age < 1.6) fx("mineArming", mine.x, mine.y, 25, 25, 0, .6);
    else if (mine.warning < 0) fx("pulseRing", mine.x, mine.y, 116, 116, 0, .14);
    if (mine.warning >= 0) {
      // Warning area and blast both use the actual 40px damage radius.
      fx("pulseRing", mine.x, mine.y, 80, 80, 0, .65, 0xffdf85);
      fx("warningPulse", mine.x, mine.y, 24, 24, 0, .9, 0xffdf85);
      p.label?.(mine.x, mine.y - 14, `${Math.max(0, .7 - mine.warning).toFixed(1)}s`, 0xfde68a, 7);
    }
  }
  const grid = m.grid;
  if (grid) {
    const owner = world.enemies.find(e => e.id === grid.owner);
    grid.nodes.forEach((node, i) => {
      const age = grid.age - i * .4;
      if (age < 0) return;
      const t = clamp(age / .4, 0, 1);
      const x = owner ? owner.x + (node.x - owner.x) * t : node.x;
      const y = owner ? owner.y + (node.y - owner.y) * t : node.y;
      fx("nodeCapsule", x, y, 18, 18, reducedMotion ? 0 : now * .6);
      if (age >= .4 && age < .75) fx("plasmaImpact", node.x, node.y, 27, 27, 0, 1 - (age - .4) / .35);
    });
    if (grid.age >= (grid.nodes.length - 1) * .4 + .4)
      for (const [a, b] of gridOrder(grid)) link("gridBeam", grid.nodes[a], grid.nodes[b], 6, .16);
    const edge = activeGridEdge(grid);
    if (edge) {
      link("gridBeam", edge.a, edge.b, edge.active ? 12 : 6, edge.active ? 1 : .65, edge.active ? 0xffffff : 0xffe5a1);
      for (const node of [edge.a, edge.b]) fx(edge.active ? "pulseRing" : "warningPulse", node.x, node.y, edge.active ? 28 : 24, edge.active ? 28 : 24, 0, .8);
    }
  }
  const beam = m.beam;
  if (beam) {
    const active = beam.age >= beam.warning;
    fx("beamCharge", beam.from.x, beam.from.y, active ? 40 : 20 + beam.age * 12);
    link("magneticBeam", beam.from, beam.end, active ? 15 : 5, active ? .95 : .3, active ? 0xffffff : 0xffe5a1);
    if (!active) fx("warningPulse", beam.from.x, beam.from.y, 50, 50, 0, .6);
  }
  const polarity = m.polarity, boss = polarity && world.enemies.find(e => e.id === polarity.owner);
  if (polarity && boss) {
    const active = polarity.age >= polarity.warning, pull = polarity.direction === 1;
    p.label?.(180, RECT.top + 24, `${pull ? "↓ LỰC HÚT · PULL" : "↑ LỰC ĐẨY · PUSH"}${active ? "" : " · CHUẨN BỊ"}`, pull ? 0x67e8f9 : 0xc084fc, 10);
    const t = reducedMotion ? .5 : now * .45 % 1, radius = 80 + (pull ? 1 - t : t) * 100;
    fx(active ? "pulseRing" : "warningPulse", boss.x, boss.y, radius * 2, radius * 2, 0, active ? .25 : .14);
  }
}

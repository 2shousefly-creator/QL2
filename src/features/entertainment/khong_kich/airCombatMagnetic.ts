import type { DamageDelivery } from "./airCombatStatus";
import { AIR_COMBAT_WORLD, ENEMY_CONFIGS, stageEnemyConfig, GAMEPLAY_SAFE_RECT as RECT } from "./airCombatConfig";
import { circleVsAircraft, getPlayerHitbox, clampHitboxToGameplayRect, segmentVsAircraft, createHitResult } from "./airCombatHitboxes";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { EnemyType } from "./airCombatTypes";
import type { TacticalPainter } from "./airCombatTacticalVisuals";
import type { MagneticVfxKey } from "./airCombatStage2Art";

type Point = { x: number; y: number };
export interface MagneticEnemyState {
  clock: number; attack: number; anchorX: number; anchorY: number; angle: number;
  clampWarned?: boolean; diveX?: number; diveY?: number; diveAt?: number;
  owner?: number; slot?: number; disabledUntil?: number; tether?: boolean;
  openerDelay?: number; patternAge?: number; nextPatternAt?: number;
  hitFxAt?: number; tetherUntil?: number; tetherReadyAt?: number; phase?: number; beamCooldown?: number;
  release?: number; releaseClock?: number; dropClock?: number; dropX?: number; dropY?: number; dropped?: number;
}
export interface MagneticProjectileState {
  kind: "disc" | "orb"; age: number; originX: number; originY: number;
  endX: number; endY: number; curve: number; outbound: number; turn: number; returnDuration: number;
  recalls?: number; held?: boolean;
  phase: "outbound" | "turn" | "return"; baseAngle: number;
}
interface Mine extends Point { id: number; owner: number; sourceType: EnemyType; damage: number; age: number; warning: number; exploded: boolean; startY: number; targetY: number }
interface Blade extends Point { owner: number; active: boolean; radius: number; damage: number }
export interface MagneticWorldState {
  mines: Mine[]; blades: Blade[];
  director?: TempestDirector;
  lanes?: MagneticLane[];
  horizon?: { owner: number; age: number; x: number; y: number; damage: number };
  corridor?: { x: number; half: number };
  eliteClock?: number;
  trails?: {owner:number;from:Point;end:Point;until:number;damage:number}[];
  impact?: {at:number;strength:number};

  effects?: { id: number; key: MagneticVfxKey; x: number; y: number; size: number; at: number; duration: number; rotation: number }[];
  polarity?: { owner: number; direction: 1 | -1; age: number; warning: number; duration: number; authored?: boolean };
}
export interface MagneticHooks {
  spawn(world: CombatWorld, type: EnemyType, auxiliary?: boolean): EnemyEntity | null;
  projectile(world: CombatWorld, values: Partial<ProjectileEntity> & Pick<ProjectileEntity, "owner" | "x" | "y" | "vx" | "vy" | "rawDamage">): ProjectileEntity | null;
  hit(world: CombatWorld, damage: number, owner: number, sourceType?: EnemyType, delivery?: DamageDelivery): void;
  hostile(world: CombatWorld, enemy: EnemyEntity): boolean;
  message(world: CombatWorld, text: string, duration: number): void;
}
const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const point = (x: number, y: number, margin = 22): Point => ({ x: clamp(x, RECT.left + margin, RECT.right - margin), y: clamp(y, RECT.top + margin, RECT.bottom - margin) });
export const magneticEnemyDisabled = (world: CombatWorld, enemy: EnemyEntity) => enemy.type === "satellite" && (enemy.magnetic?.disabledUntil ?? 0) > world.elapsed;
const state = (e: EnemyEntity): MagneticEnemyState => e.magnetic ??= { clock: 0, attack: 0, anchorX: e.x, anchorY: e.y, angle: e.phaseSeed };
const damage = (e: EnemyEntity) => stageEnemyConfig(e.type, 2).projectileDamage * e.damageScale;
/** Cosmetic event journal: bounded, combat-clock timed, shared by both renderers. */
export function magneticFx(w: CombatWorld, key: MagneticVfxKey, x: number, y: number, size: number, duration = .35, rotation = 0, delay = 0) {
  if (!w.magnetic) return;
  const effects = w.magnetic.effects ??= [];
  if (effects.length >= 64) effects.shift();
  effects.push({ id: w.nextId++, key, x, y, size, at: w.elapsed + delay, duration, rotation });
}
function magneticImpact(w: CombatWorld, x: number, y: number, strength: number) {
  w.magnetic!.impact = {at:w.elapsed, strength};
  magneticFx(w, "weakpointFlash", x, y, 35, .12);
  magneticFx(w, "magneticBurst", x, y, 76, .25, 0, .03);
  magneticFx(w, "bossBurst", x, y, 86, .40, 0, .05);
  magneticFx(w, "mineShockwave", x, y, 108, .42, 0, .08);
  for (let i=0;i<4;i++) magneticFx(w, "electricImpact", x+Math.cos(i*TAU/4)*23, y+Math.sin(i*TAU/4)*23, 32, .26, i, .10+i*.035);
  magneticFx(w, "plasmaImpact", x, y, 90, .65, 0, .15);
}
export function magneticShake(w: CombatWorld): number {
  const impact=w.magnetic?.impact;
  return impact ? impact.strength*Math.exp(-Math.max(0,w.elapsed-impact.at)*12) : 0;
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
function bullet(w: CombatWorld, e: EnemyEntity, h: MagneticHooks, angle: number, speed = 110, factor = 1, radius = e.type === "boss" ? 6 : 4) {
  const visual: MagneticVfxKey = e.type === "boss" ? "crownBolt" : e.type === "satellite" ? "satelliteOrb"
    : e.type === "prism_manta" ? "prismOrb" : e.type === "arc_reaver" ? "arcBolt"
    : e.type === "micro_drone" ? "microSpark" : "needleBolt";
  const shot = h.projectile(w, { owner: "enemy", sourceEnemyId: e.id, sourceEnemyType: e.type, x: e.x, y: e.y,
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, rawDamage: damage(e) * factor,
    radius, color: "#67e8f9", magneticVisual: visual });
  if (shot) magneticFx(w, e.type === "boss" || e.type === "cyclone_ace" ? "eliteMuzzle" : "smallMuzzle", e.x, e.y, e.radius * 1.2, .14, angle + Math.PI);
  return shot;
}
function disc(w: CombatWorld, e: EnemyEntity, h: MagneticHooks, angle: number, curve = 36, fast = false) {
  const travel = Math.max(280, Math.hypot(w.playerX - e.x, w.playerY - e.y) + 75);
  const end = point(e.x + Math.cos(angle) * travel, e.y + Math.sin(angle) * travel, 12);
  const p = bullet(w, e, h, angle, 0, 1, 8);
  if (p) {
    p.magneticVisual = "returningDisc"; p.lifetime = 8; p.color = "#67e8f9";
    p.magnetic = { kind: "disc", age: 0, originX: e.x, originY: e.y, endX: end.x, endY: end.y,
      recalls: e.wave >= 5 || (e.type === "boss" && w.bossPhase >= 3) ? 1 : 0, curve, outbound: 1.7, turn: fast ? .55 : .75, returnDuration: 1.7, phase: "outbound", baseAngle: angle };
  }
  return p;
}
function seedMine(w: CombatWorld, e: EnemyEntity, at: Point): boolean {
  const m = w.magnetic!, safe = { x: at.x, y: at.y };
  if (m.mines.length >= 12) return false;
  m.mines.push({ ...safe, id: w.nextId++, owner: e.id, sourceType: e.type, age: 0, warning: 0, exploded: false,
    startY: e.y, targetY: safe.y, damage: damage(e) });
  return true;
}
export function resetMagneticHazards(w: CombatWorld) {
  if (!w.magnetic) return;
  const m = w.magnetic;
  m.mines.length = 0; m.blades.length = 0; m.lanes = [];
  m.polarity = undefined; m.horizon = undefined; m.corridor = undefined;
  m.director = undefined; m.eliteClock = 0; m.trails = [];
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
  if (w.stage.waves[w.waveIndex].elite && !w.magnetic.corridor) updateCorridor(w, 0);
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
    const ownerAlive = w.enemies.some(other => other.id === s.owner && other.hp > 0);
    s.diveAt ??= 2.8 + (s.slot ?? 0) * .32;
    if (!ownerAlive && s.diveX === undefined) s.diveAt = Math.min(s.diveAt, s.clock + .8);
    if (s.clock >= s.diveAt - .8 && s.diveX === undefined) {
      s.diveX = w.playerX; s.diveY = w.playerY;
    }
    if (s.clock < s.diveAt) {
      const angle = s.angle + s.clock * .65;
      drift(e, point(s.anchorX + Math.cos(angle) * 85, s.anchorY + Math.sin(angle) * 55), 95, dt);
    } else if (canFire) {
      if (s.attack === 0) { s.angle = Math.atan2(s.diveY! - e.y, s.diveX! - e.x); s.attack = 1; }
      e.x += Math.cos(s.angle) * 230 * dt; e.y += Math.sin(s.angle) * 230 * dt;
    }
    if (s.clock > s.diveAt + 2.6) { e.hp = 0; e.deathHandled = true; }
    return true;
  }
  if (e.type === "orbit_wasp") {
    const cycle = s.clock % 7, direction = e.id % 2 ? 1 : -1;
    if (cycle < 2) { s.anchorX = w.playerX; s.anchorY = w.playerY - 25; s.angle = direction > 0 ? Math.PI : 0; }
    else s.angle += dt * .65 * direction;
    drift(e, point(s.anchorX + Math.cos(s.angle) * 112, s.anchorY + Math.sin(s.angle) * 78), 76, dt);
    if (canFire && cycle > 2.5 && cycle < 5.8 && e.fireCooldown <= 0) {
      for (const offset of e.wave >= 3 ? [-.18, 0, .18] : [-.08, .08]) bullet(w, e, h, aim + offset, 125, .75);
      s.attack++; e.fireCooldown = s.attack % 3 ? .32 : 2.2;
    }
    return true;
  }
  if (e.type === "cyclone_ace") {
    updateCyclone(w, e, dt, h, canFire); return true;
  }
  drift(e, point(180 + Math.sin(s.clock * .55 + e.phaseSeed) * (e.type === "mine_seeder" ? 118 : 90), e.type === "magnetic_leech" ? w.playerY - 145 : RECT.top + 75 + (e.id % 3) * 35), ENEMY_CONFIGS[e.type].speed, dt);
  if (e.type === "magnetic_leech") {
    const distance = Math.hypot(e.x - w.playerX, e.y - w.playerY);
    const canTether = canFire && s.clock > 1.3 && w.dashRemaining <= 0;
    if (s.tether && (!canTether || distance >= 245 || w.elapsed >= (s.tetherUntil ?? 0))) {
      s.tether = false; s.tetherReadyAt = w.elapsed + 2;
    }
    if (!s.tether && canTether && distance < 180 && w.elapsed >= (s.tetherReadyAt ?? 0)) {
      s.tether = true; s.tetherUntil = w.elapsed + 4; s.clampWarned = false;
      magneticFx(w, "tetherPulse", e.x, e.y, 20, .3);
    }
    if (s.tether && !s.clampWarned && (s.tetherUntil ?? 0) - w.elapsed < 2) {
      s.clampWarned = true; magneticFx(w, "warningPulse", e.x, e.y, 44, .75);
    }
    // All leech and boss vectors share the same hard force cap.
    if (canFire && e.fireCooldown <= 0) { bullet(w, e, h, aim, 95, .65); e.fireCooldown = 4.5; }
  }
  if (e.type === "mine_seeder" && canFire && (s.release ?? 0) > 0) {
    s.releaseClock = (s.releaseClock ?? 0) - dt;
    if (s.releaseClock <= 0) { seedMine(w, e, { x: w.playerX, y: w.playerY }); s.release!--; s.releaseClock = .65; }
  }
  if (e.type === "grid_architect") { updateArchitect(w, e, dt, h, canFire); return true; }
  if (!canFire || e.fireCooldown > 0) return true;
  e.fireCooldown = ENEMY_CONFIGS[e.type].fireInterval;
  if (e.type === "arc_reaver") {
    disc(w, e, h, aim - .22, -52); disc(w, e, h, aim + .22, 52);
  }
  if (e.type === "mine_seeder") {
    seedMine(w, e, { x: w.playerX, y: w.playerY });
    s.release = e.wave >= 5 ? 2 : e.wave >= 2 ? 1 : 0; s.releaseClock = .65;
  }
  if (e.type === "prism_manta") {
    const p = bullet(w, e, h, aim, 85, 1, 10);
    if (p) { p.color = "#c084fc"; p.magnetic = { kind: "orb", age: 0, originX: e.x, originY: e.y, endX: 0, endY: 0, curve: 0, outbound: 1.55, turn: .55, returnDuration: 0, phase: "outbound", baseAngle: aim }; }
  }
  if (e.type === "swarm_carrier") {
    const count = w.enemies.filter(e => e.type === "micro_drone" && e.hp > 0).length;
    const anchor = point(w.playerX, w.playerY, 110);
    if (count < 12) magneticFx(w, "droneSpawn", e.x, e.y + 16, 38, .5);
    for (let i = 0; i < Math.min(4, 12 - count); i++) {
      const drone = h.spawn(w, "micro_drone", true);
      if (!drone) break;
      const angle = -Math.PI + i * Math.PI / 3; // Open lower half remains an escape route.
      drone.x = e.x + (i - 1) * 14; drone.y = e.y + 18;
      drone.magnetic = { clock: 0, attack: 0, anchorX: anchor.x, anchorY: anchor.y, angle, owner: e.id, slot: i };
    }
  }
  return true;
}

function updateTempest(w: CombatWorld, boss: EnemyEntity, dt: number, h: MagneticHooks) {
  const s = state(boss);
  drift(boss, { x: 180 + Math.sin(s.clock * .3) * 36, y: RECT.top + 95 }, 25, dt);
  if (!s.attack) {
    for (let slot = 0; slot < 4; slot++) {
      const satellite = h.spawn(w, "satellite", true); if (!satellite) continue;
      // Stability and damage are concrete helper config values, independent of boss HP.
      satellite.damageScale = boss.damageScale;
      satellite.x = boss.x; satellite.y = boss.y;
      satellite.magnetic = { clock: 0, attack: 0, anchorX: boss.x, anchorY: boss.y, angle: slot * TAU / 4, owner: boss.id, slot };
      magneticFx(w, "droneSpawn", boss.x, boss.y, 55, .6);
    }
    s.attack = 1;
  }
  if (!h.hostile(w, boss) || (boss.skillLockedUntil ?? 0) > w.elapsed) return;
  updateTempestDirector(w, boss, dt, h);
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
  const director = w.magnetic?.director;
  if (director && director.recovery > 0) { drift(e, orbit, 95, dt); return; }
  if (s.dropClock !== undefined) {
    s.dropClock += dt;
    const flank = { x: (s.slot ?? 0) % 2 ? RECT.right - 30 : RECT.left + 30, y: RECT.top + 230 + Math.floor((s.slot ?? 0) / 2) * 100 };
    if (s.dropClock < 1.3) drift(e, flank, 160, dt);
    else if (s.dropClock < 2.3) {
      const corridor = w.magnetic?.corridor;
      s.dropX ??= corridor && inMagneticCorridor(w, w.playerX, 24)
        ? corridor.x + ((s.slot ?? 0) % 2 ? 1 : -1) * (corridor.half + 30) : w.playerX;
      s.dropY ??= w.playerY;
    } else if (s.dropClock < 3.5) {
      const target = point(s.dropX!, s.dropY!);
      drift(e, target, 190, dt);
      if (!s.dropped) { bullet(w, e, h, Math.atan2(target.y - e.y, target.x - e.x), 125); s.dropped = 1; }
    } else {
      if(s.dropClock<4.2&&e.fireCooldown<=0){
        const aim=Math.atan2(w.playerY-e.y,w.playerX-e.x);
        for(const offset of [-.2,.2])bullet(w,e,h,aim+offset,115,.7);
        e.fireCooldown=.6;magneticFx(w,"eliteMuzzle",e.x,e.y,30,.2);
      }
      drift(e, orbit, 130, dt);
    }
    if (s.dropClock >= 5) { s.dropClock = undefined; s.dropX = undefined; s.dropY = undefined; }
  } else drift(e, orbit, 95, dt);

}

/** Owns the motion only; the shared projectile pipeline still resolves hitboxes,
 * armor, invulnerability, skills and damage after this update. */
export function updateMagneticProjectile(w: CombatWorld, p: ProjectileEntity, dt: number, h: MagneticHooks): boolean {
  const m = p.magnetic; if (!m) return false;
  m.age += dt; p.lifetime -= dt;
  if (p.lifetime <= 0) return true;
  if (m.kind === "orb") {
    if (m.age < m.outbound - m.turn) { p.x += p.vx * dt; p.y += p.vy * dt; }
    m.phase = m.age >= m.outbound - m.turn ? "turn" : "outbound";
    if (m.age >= m.outbound) {
      magneticFx(w, "plasmaImpact", p.x, p.y, 30, .24);
      for (const side of (w.waveIndex >= 3 ? [-1, 0, 1] : [-1, 1])) {
        const angle = m.baseAngle + side * Math.PI / 6;
        h.projectile(w, { owner: p.owner, allegiance: p.allegiance, sourceEnemyId: p.sourceEnemyId, sourceEnemyType: p.sourceEnemyType,
          x: p.x, y: p.y, vx: Math.cos(angle) * 132, vy: Math.sin(angle) * 132, rawDamage: p.rawDamage * .75, radius: 4, color: "#e9d5ff", magneticVisual: "prismShard" });
      }
      p.lifetime = 0;
    }
    return true;
  }
  if (m.held && m.age >= m.outbound) m.age = m.outbound;
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
  if (m.age >= returnAt + m.returnDuration) {
    if (m.recalls) {
      m.recalls--; m.age = m.outbound; m.phase = "turn";
      const x = m.originX, y = m.originY;
      m.originX = m.endX; m.originY = m.endY; m.endX = x; m.endY = y;
      m.baseAngle += Math.PI; p.lifetime = m.turn + m.returnDuration + .1;
    } else p.lifetime = 0;
  }
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
    const strength = (e.magnetic.tetherUntil! - w.elapsed < 1.2 ? 38 : 18) + 8 * (1 - Math.min(1, distance / 245));
    forceX += dx / distance * strength; forceY += dy / distance * strength;
  }
  const horizon = m.horizon;
  if (horizon && horizon.age > 1.4 && w.enemies.some(e => e.id === horizon.owner && h.hostile(w, e) && e.stun <= 0 && (e.skillLockedUntil ?? 0) <= w.elapsed)) {
    const dx = horizon.x - w.playerX, dy = horizon.y - w.playerY, distance = Math.max(1, Math.hypot(dx, dy));
    forceX += dx / distance * 24; forceY += dy / distance * 24;
  }
  const polarity = m.polarity;
  if (polarity) {
    polarity.age += dt;
    const boss = w.enemies.find(e => e.id === polarity.owner && h.hostile(w, e));
    if (!boss || (boss.skillLockedUntil ?? 0) > w.elapsed || polarity.age >= polarity.warning + polarity.duration) m.polarity = undefined;
    else if (polarity.age >= polarity.warning && boss.stun <= 0) {
      const reversed = !polarity.authored && polarity.age >= polarity.warning + 2.4;
      for (const node of satellites(w, boss.id).filter(n=>!polarity.authored || (state(n).slot??0)<2)) {
        const sign = (polarity.authored ? 1 : (node.magnetic?.slot ?? 0) % 2 ? -1 : 1) * polarity.direction * (reversed ? -1 : 1);
        const dx = node.x - w.playerX, dy = node.y - w.playerY, distance = Math.max(1, Math.hypot(dx, dy));
        forceX += dx / distance * 18 * sign; forceY += dy / distance * 18 * sign;
      }
    }
  }
  const force = Math.hypot(forceX, forceY), limit = Math.min(1, 38 / Math.max(1, force));
  pushPlayer(w, forceX * limit * dt, forceY * limit * dt);
  updateAuthoredGeometry(w, dt, h);
  const player = getPlayerHitbox(w);
  for (let i = m.mines.length - 1; i >= 0; i--) {
    const mine = m.mines[i]; mine.age += dt;
    mine.y = mine.startY + (mine.targetY - mine.startY) * clamp(mine.age / .8, 0, 1);
    if (mine.warning >= 0) {
      mine.warning += dt;
      if (mine.warning >= 1.6 && !mine.exploded) {
        mine.exploded = true;
        magneticImpact(w, mine.x, mine.y, mine.sourceType === "boss" ? 4 : 2.8);
        if (circleVsAircraft(mine.x, mine.y, 40, player)) h.hit(w, mine.damage, mine.owner, mine.sourceType, "explosive_aoe");
      }
      if (mine.warning > 2.05) m.mines.splice(i, 1);
    }
  }
  for (const blade of m.blades) if (blade.active && circleVsAircraft(blade.x, blade.y, blade.radius, player)) h.hit(w, blade.damage, blade.owner);
}

export interface MagneticPainter extends TacticalPainter {
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
    if(effect.key==="plasmaImpact" && effect.duration>=.6) {
      for(let i=0;i<4;i++)p.circle(effect.x+Math.cos(i*TAU/4)*t*20,effect.y-Math.sin(i*TAU/4)*t*12-t*14,12+t*18,0x74768f,(1-t)*.13,true);
    }
    if(effect.key==="electricImpact" && effect.duration>=.25 && !reducedMotion) {
      for(let i=0;i<3;i++){const a=i*TAU/3+effect.rotation,r=8+t*22;
        p.line(effect.x+Math.cos(a)*r,effect.y+Math.sin(a)*r,effect.x+Math.cos(a)*(r+7),effect.y+Math.sin(a)*(r+7),0xfbbf24,(1-t)*.8,1.5);}
    }
    const nearPlayer = Math.hypot(effect.x - world.playerX, effect.y - world.playerY) < effect.size * .65 + 24;
    fx(effect.key, effect.x, effect.y, effect.size * (.8 + t * .2), effect.size * (.8 + t * .2), effect.rotation, (1 - t) * (nearPlayer ? .25 : .8));
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
    if (e.type === "grid_architect" && !m.lanes?.some(lane => lane.owner === e.id) && e.fireCooldown <= 2)
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
      if(q.magnetic?.held)p.label?.(q.x,q.y+17,"SUSPEND",0xc084fc,6);
      fx("warningPulse", q.x, q.y, 26, 26, 0, .6);
      p.label?.(q.x, q.y - 13, "RETURN", 0xffe6a1, 6);
    } else if (disc && !reducedMotion) {
      fx("returningDisc", q.x - q.vx * .045, q.y - q.vy * .045, q.radius * 1.75, q.radius * 1.75, rotation - .4, .18, tint);
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
      fx("pulseRing", mine.x, mine.targetY, 80, 80, 0, .65, 0xffdf85);
      fx("warningPulse", mine.x, mine.y, 24, 24, 0, .9, 0xffdf85);
      p.label?.(mine.x, mine.y - 14, `${Math.max(0, 1.6 - mine.warning).toFixed(1)}s`, 0xfde68a, 7);
    }
  }
  paintAuthoredGeometry(world, p);
}

type TempestSkill = "lattice" | "polarity" | "blades" | "flux" | "guillotine" | "horizon" | "hunt" | "collapse";
interface MagneticLane {
  owner: number; node?: number; secondNode?: number; from: Point; end: Point;
  age: number; warning: number; duration: number; damage: number; width: number;
  wall?: -1 | 1; collapse?: boolean;
}
interface TempestDirector {
  phase: number; clock: number; combo: number; step: number; overload: boolean; finished: boolean;
  recovery: number; bombs: number; bombClock: number; name: string; phrase?:AttackPhrase;
}
type PhraseAction = TempestSkill | "pull" | "flipWarning" | "flip" | "recall" | "bomb" | "crossfire";
interface PhraseBeat { at:number; action:PhraseAction; count?:number; topology?:number }
interface AttackPhrase { name:string; duration:number; beats:PhraseBeat[] }
function tempestPhrase(phase:number, index:number, overload:boolean): AttackPhrase {
  if(overload) return {name:"TEMPEST OVERLOAD",duration:12.8,beats:[
    {at:0,action:"lattice",topology:2},{at:.5,action:"flux"},
    {at:3.3,action:"horizon"},{at:3.8,action:"blades",count:6},
    {at:5.9,action:"flipWarning"},{at:6.6,action:"flip"},{at:6.8,action:"recall"},{at:7.1,action:"guillotine"}]};
  const phrases:AttackPhrase[]=[
    {name:"POLAR HUNT",duration:6.8,beats:[{at:0,action:"pull"},{at:.7,action:"blades",count:phase>=3?6:4},
      {at:1.6,action:"flipWarning"},{at:1.7,action:"bomb"},{at:2.3,action:"flip"},{at:2.4,action:"recall"},{at:3,action:"bomb"},{at:3.6,action:"bomb"},{at:4.2,action:"crossfire"}]},
    {name:"LATTICE SHIFT",duration:7.8,beats:[{at:0,action:"lattice",topology:0},{at:1.3,action:"lattice",topology:1},
      {at:2.6,action:"lattice",topology:2},{at:3.9,action:"lattice",topology:3},{at:1,action:"crossfire"},{at:3.5,action:"crossfire"}]},
    {name:"REVERSAL STORM",duration:7.2,beats:[{at:0,action:"blades",count:2},{at:1,action:"blades",count:4},
      ...(phase>=3?[{at:2,action:"blades" as const,count:6}]:[]),{at:2.9,action:"recall",count:2},{at:3.5,action:"recall",count:4},{at:4.1,action:"recall",count:6}]},
    {name:"HORIZON COLLAPSE",duration:8,beats:[{at:0,action:"horizon"},{at:1,action:"crossfire"},
      ...(phase>=4?[{at:2.3,action:"flipWarning" as const},{at:3,action:"flip" as const}]:[])]},
    {name:"MAGNETIC GUILLOTINE II",duration:7,beats:[{at:0,action:"guillotine"},{at:.8,action:"blades",count:2},{at:2.8,action:"recall"}]},
    {name:"SATELLITE EXECUTION",duration:7,beats:[{at:0,action:"hunt"},{at:.1,action:"lattice",topology:3},{at:1.8,action:"crossfire"},{at:3.8,action:"crossfire"}]},
    {name:"STORM COLLAPSE",duration:7.8,beats:[{at:0,action:"collapse"},{at:1,action:"bomb"},{at:2.2,action:"blades",count:2},{at:3.8,action:"recall"}]},
  ];
  const phrase=phrases[index%phrases.length];
  return {...phrase,beats:[...phrase.beats].sort((a,b)=>a.at-b.at)};
}
function heldBlades(w:CombatWorld,e:EnemyEntity,h:MagneticHooks,count:number) {
  const aim=Math.atan2(w.playerY-e.y,w.playerX-e.x);
  for(let i=0;i<count;i++) {
    const p=disc(w,e,h,aim+(i-(count-1)/2)*.28,i%2?-65:65);
    if(p?.magnetic) {p.magnetic.outbound=.7;p.magnetic.turn=.15;p.magnetic.held=true;p.magnetic.recalls=0;p.lifetime=12;}
  }
}
function recallBlades(w:CombatWorld,owner:number,limit=6) {
  let beat=0;
  for(const p of w.projectiles) if(p.sourceEnemyId===owner && p.magnetic?.held && beat<limit) {
    p.magnetic.held=false;p.magnetic.age=p.magnetic.outbound;
    p.magnetic.turn=.15+beat++*.12;p.magnetic.curve*=w.magnetic?.polarity?.direction??1;
    magneticFx(w,"bladeSlash",p.x,p.y,38,.3);
  }
}
const SKILL_NAMES: Record<TempestSkill, string> = {
  lattice: "CROWN LATTICE", polarity: "POLARITY REVERSAL", blades: "REVERSAL BLADES",
  flux: "FLUX BOMBARDMENT", guillotine: "MAGNETIC GUILLOTINE", horizon: "EVENT HORIZON",
  hunt: "SATELLITE HUNT", collapse: "STORM COLLAPSE",
};
/** A slow-moving break across the lower battlefield in authored geometry. Bombs still demand
 * relocation inside its 88px width. This is geometry, not player invulnerability. */
function updateCorridor(w: CombatWorld, clock: number) {
  w.magnetic!.corridor = { x: 180 + Math.sin(clock * .18) * 54, half: 44 };
}
export function inMagneticCorridor(w: CombatWorld, x: number, radius = 0, y = RECT.bottom): boolean {
  const corridor = w.magnetic?.corridor;
  return !!corridor && !!(w.magnetic?.lanes?.length || w.magnetic?.horizon) && y >= RECT.top + 185 && Math.abs(x - corridor.x) < corridor.half + radius;
}
/** Both renderers and collision use the same clipped beam segments. */
function laneSegments(w: CombatWorld, a: Point, b: Point, visit: (a: Point, b: Point) => void) {
  const corridor = w.magnetic?.corridor;
  if (!corridor) { visit(a, b); return; }
  const top = RECT.top + 185;
  if (a.y < top && b.y < top) { visit(a, b); return; }
  if ((a.y < top) !== (b.y < top)) {
    const t = (top - a.y) / (b.y - a.y), crossing = { x: a.x + (b.x - a.x) * t, y: top };
    if (a.y < top) { visit(a, crossing); a = crossing; }
    else { visit(crossing, b); b = crossing; }
  }
  const left = corridor.x - corridor.half, right = corridor.x + corridor.half, dx = b.x - a.x;
  if (Math.abs(dx) < .001) { if (a.x <= left || a.x >= right) visit(a, b); return; }
  const t1 = (left - a.x) / dx, t2 = (right - a.x) / dx;
  const low = clamp(Math.min(t1, t2), 0, 1), high = clamp(Math.max(t1, t2), 0, 1);
  const at = (t: number) => ({ x: a.x + dx * t, y: a.y + (b.y - a.y) * t });
  if (low > 0) visit(a, at(low));
  if (high < 1) visit(at(high), b);
}
function addLane(w: CombatWorld, e: EnemyEntity, from: Point, end: Point, options: Partial<MagneticLane> = {}) {
  const lanes = w.magnetic!.lanes ??= [];
  if (lanes.length >= 16) return;
  lanes.push({ owner: e.id, from: { ...from }, end: { ...end }, age: 0, warning: 1.3,
    duration: 2.8, width: 5, damage: damage(e), ...options });
}
function satellites(w: CombatWorld, owner: number) {
  return w.enemies.filter(e => e.type === "satellite" && e.magnetic?.owner === owner && e.hp > 0 && !magneticEnemyDisabled(w, e));
}
function castTempest(w: CombatWorld, boss: EnemyEntity, skill: TempestSkill, h: MagneticHooks, topology = 0) {
  const m = w.magnetic!, d = m.director!, nodes = satellites(w, boss.id);
  d.name = `${d.overload ? "TEMPEST OVERLOAD · " : ""}${d.overload && skill === "lattice" ? "CROWN LATTICE OMEGA" : d.overload && skill === "blades" ? "REVERSAL STORM" : SKILL_NAMES[skill]}`;
  h.message(w, d.name, 1.5);
  magneticFx(w, "beamCharge", boss.x, boss.y, d.overload ? 100 : 65, .7);
  switch (skill) {
    case "lattice": {
      // Release the previous layout before previewing the next one. Disabled nodes
      // remove real links through node ownership in the shared collision geometry.
      m.lanes=(m.lanes??[]).filter(l=>l.owner!==boss.id || !!l.wall);
      const layouts: [Point,Point][][] = [
        [[{x:28,y:RECT.top+200},{x:332,y:RECT.top+200}]],
        [[{x:45,y:RECT.top+70},{x:315,y:RECT.bottom-30}]],
        [[{x:45,y:RECT.top+70},{x:315,y:RECT.bottom-30}],[{x:315,y:RECT.top+70},{x:45,y:RECT.bottom-30}]],
        [[{x:65,y:RECT.top+30},{x:65,y:RECT.bottom-25}],[{x:295,y:RECT.top+30},{x:295,y:RECT.bottom-25}]],
      ];
      const anchors=nodes.filter(n=>state(n).dropClock===undefined);
      for(let i=0;i<Math.min(anchors.length,layouts[topology].length);i++) {
        const [a,b]=layouts[topology][i];
        addLane(w,boss,a,b,{node:anchors[i].id,warning:.75,duration:d.overload?2.6:nodes.some(n=>state(n).dropClock!==undefined)?4.3:.55});
      }
      break;
    }
    case "polarity":
      m.polarity = { owner: boss.id, direction: d.combo % 2 ? -1 : 1, age: 0, warning: .7, duration: 4.8 };
      break;
    case "blades": {
      const base = Math.atan2(w.playerY - boss.y, w.playerX - boss.x);
      for (let i = 0; i < (d.phase >= 3 ? 4 : 2); i++) disc(w, boss, h, base + (i - (d.phase >= 3 ? 1.5 : .5)) * .38, i % 2 ? -65 : 65);
      break;
    }
    case "flux": d.bombs = d.phase >= 3 ? 5 : 3; d.bombClock = 0; break;
    case "guillotine":
    case "collapse":
      for (let i = 0; i < nodes.length; i++) {
        const side: -1 | 1 = i % 2 ? 1 : -1;
        const x = side < 0 ? RECT.left + 14 : RECT.right - 14;
        addLane(w, boss, { x, y: RECT.top + 20 }, { x, y: RECT.bottom }, {
          node: nodes[i].id, wall: side, collapse: skill === "collapse", warning: 1.5 + Math.floor(i / 2) * .45,
          duration: skill === "collapse" ? 5 : 3.5, width: 7,
        });
      }
      break;
    case "horizon":
      m.horizon = { owner: boss.id, age: 0, x: 180, y: RECT.top + RECT.height * .57, damage: damage(boss) };
      break;
    case "hunt":
      for (const node of nodes.filter(n=>(state(n).slot??0)<2).slice(0,2)) { const s = state(node); s.dropClock = -(s.slot ?? 0) * .3; s.dropX = undefined; s.dropY = undefined; s.dropped = 0; }
      break;
  }
}
function clearTempestAttack(w: CombatWorld) {
  const m = w.magnetic!;
  m.lanes = []; m.mines = []; m.horizon = undefined; m.polarity = undefined;
  for (const p of w.projectiles) if (p.owner === "enemy" && p.allegiance !== "friendly_hacked") p.lifetime = 0;
  for (const e of w.enemies) if (e.type === "satellite" && e.magnetic) e.magnetic.dropClock = undefined;
}
function updateTempestDirector(w: CombatWorld, boss: EnemyEntity, dt: number, h: MagneticHooks) {
  const m = w.magnetic!;
  const d = m.director ??= { phase: 1, clock: 0, combo: 0, step: 0, overload: false, finished: false,
    recovery: 0, bombs: 0, bombClock: 0, name: "CROWN LATTICE" };
  updateCorridor(w, state(boss).clock);
  if (d.recovery > 0) { d.recovery = Math.max(0, d.recovery - dt); return; }
  const phase = Math.min(4, w.bossPhase);
  if (w.bossPhase === 5 && !d.overload && !d.finished) {
    clearTempestAttack(w); d.overload = true; d.phase = 4; d.clock = 0; d.step = 0; d.bombs = 0; d.phrase = undefined;
    magneticFx(w, "magneticBurst", boss.x, boss.y, 200, 1);
  } else if (phase !== d.phase && !d.overload) {
    // Finish the current authored combination before entering the new phase.
    if (state(boss).phase !== phase) magneticFx(w, "magneticBurst", boss.x, boss.y, 150, .75);
    state(boss).phase = phase;
  }
  d.clock += dt;
  const phrase=d.phrase??=tempestPhrase(d.phase,d.combo,d.overload);
  d.name=phrase.name;
  while(d.step<phrase.beats.length && d.clock>=phrase.beats[d.step].at) {
    const beat=phrase.beats[d.step++];
    if(beat.action==="blades") { magneticFx(w,"eliteMuzzle",boss.x,boss.y,60,.3); heldBlades(w,boss,h,beat.count??2); }
    else if(beat.action==="recall") recallBlades(w,boss.id,beat.count??6);
    else if(beat.action==="bomb") seedMine(w,boss,{x:w.playerX,y:w.playerY});
    else if(beat.action==="crossfire") {
      const aim=Math.atan2(w.playerY-boss.y,w.playerX-boss.x);
      for(const a of [-.3,0,.3])bullet(w,boss,h,aim+a,105,.55);
    } else if(beat.action==="pull") {
      m.polarity={owner:boss.id,direction:1,age:0,warning:.7,duration:5,authored:true};
    } else if(beat.action==="flipWarning") {
      magneticFx(w,"warningPulse",boss.x,boss.y,100,.7);
      h.message(w,"POLARITY FLIP · RECALL",.7);
    } else if(beat.action==="flip") {
      m.polarity={owner:boss.id,direction:-1,age:0,warning:0,duration:3,authored:true};
      magneticFx(w,"magneticBurst",boss.x,boss.y,110,.4);
    } else castTempest(w,boss,beat.action,h,beat.topology);
    h.message(w,phrase.name,1.2);
  }
  if(d.clock>=phrase.duration) {
    clearTempestAttack(w);d.bombs=0;
    if(d.overload) {
      d.overload=false;d.finished=true;d.recovery=2.5;
      boss.weakUntil=w.aircraft.coreState.time+2.5;boss.armorBrokenUntil=w.elapsed+2.5;
      magneticImpact(w,boss.x,boss.y,4.8);
      magneticFx(w,"mineShockwave",boss.x,boss.y,260,.6);
      d.name="TEMPEST · WEAKPOINT OPEN";h.message(w,d.name,2.5);
    } else d.recovery=1.1;
    d.clock=0;d.step=0;d.combo++;d.phase=phase;d.phrase=undefined;
    return;
  }
  if (d.bombs > 0) {
    d.bombClock -= dt;
    if (d.bombClock <= 0) { seedMine(w, boss, { x: w.playerX, y: w.playerY }); d.bombs--; d.bombClock = .85; }
  }

}
function updateCyclone(w:CombatWorld,e:EnemyEntity,dt:number,h:MagneticHooks,canFire:boolean) {
  const s=state(e),m=w.magnetic!,clock=m.eliteClock??0,cycle=clock%10,round=Math.floor(clock/10);
  const alive=w.enemies.filter(n=>n.type==="cyclone_ace"&&h.hostile(w,n)).sort((a,b)=>a.id-b.id);
  const role=alive.findIndex(n=>n.id===e.id);
  // Reassign on the next beat if a wingman dies; one survivor owns all three roles.
  const field=role===0, hunter=role===Math.min(2,alive.length-1), recall=role===Math.min(1,alive.length-1);
  if(s.diveAt===undefined||clock>s.diveAt+.65)drift(e,point(60+role*110,RECT.top+100+role*15),85,dt);
  if(field)for(let i=0;i<4;i++) {
    const a=clock*1.25+i*TAU/4,r=36+Math.sin(clamp((cycle-1)/6,0,1)*Math.PI)*70;
    const x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;
    m.blades.push({x,y,owner:e.id,radius:10,damage:damage(e),active:canFire&&cycle>1&&cycle<7&&!inMagneticCorridor(w,x,10,y)});
  }
  if(recall&&canFire&&cycle>=2.5&&s.attack<=round) {
    heldBlades(w,e,h,alive.length===3?6:4);s.attack=round+1;s.releaseClock=clock+2.3;h.message(w,"TRI-CYCLONE · SUSPEND → POLAR RECALL",1.4);
  }
  if(s.releaseClock!==undefined&&clock>=s.releaseClock) { recallBlades(w,e.id);s.releaseClock=undefined; }
  const pass=cycle>=6?2:cycle>=3.5?1:cycle>=1?0:-1;
  const passKey=round*3+pass;
  if(hunter&&canFire&&pass>=0&&(s.nextPatternAt??-1)<passKey) {
    s.nextPatternAt=passKey;
    const dx=clamp(w.playerX-(s.dropX??w.playerX),-28,28);s.dropX=w.playerX;
    const target=point(w.playerX+(pass?dx:0),pass===0?w.playerY:Math.max(RECT.top+210,w.playerY-60));
    s.diveX=target.x;s.diveY=target.y;s.diveAt=clock+.8;
    addLane(w,e,e,target,{warning:.8,duration:.01,width:4,damage:0});
    magneticFx(w,"eliteMuzzle",e.x,e.y,42,.8);
  }
  if(canFire&&s.diveAt!==undefined&&clock>=s.diveAt&&clock<s.diveAt+.65) {
    const from={x:e.x,y:e.y};drift(e,{x:s.diveX!,y:s.diveY!},340,dt);
    const trails=m.trails??=[];
    // One bounded segment per pass, extended along the committed straight dash.
    let trail=trails.find(t=>t.owner===e.id&&t.until===s.diveAt!+1.65);
    if(!trail&&trails.length<9){trail={owner:e.id,from,end:{x:e.x,y:e.y},until:s.diveAt+1.65,damage:damage(e)};trails.push(trail);}
    if(trail)trail.end={x:e.x,y:e.y};
  }
}
function updateArchitect(w:CombatWorld,e:EnemyEntity,dt:number,h:MagneticHooks,canFire:boolean) {
  if(!canFire)return;
  const m=w.magnetic!,s=state(e),role=(s.slot??0)%4,clock=m.eliteClock??0;
  const topology=Math.floor(clock/3.2)%4;
  if(e.fireCooldown<=0 && !(m.lanes??[]).some(l=>l.owner===e.id)) {
    const y=RECT.top+190+role*40;
    if(topology===0)addLane(w,e,{x:28,y},{x:332,y},{warning:.75,duration:1.8});
    else if(topology===1||topology===2) {
      const reverse=topology===2&&(role%2)===1;
      addLane(w,e,{x:reverse?315:45,y:RECT.top+80},{x:reverse?45:315,y:RECT.bottom-25},{warning:.75,duration:1.8});
    } else {
      const side: -1|1=role%2?1:-1,x=side<0?35:325;
      addLane(w,e,{x,y:RECT.top+40},{x,y:RECT.bottom},{wall:side,warning:.8,duration:2.3});
    }
    s.attack++;e.fireCooldown=3.2;
    magneticFx(w,"beamCharge",e.x,e.y,45,.75);
  }
  s.releaseClock=(s.releaseClock??0)-dt;
  if(s.releaseClock<=0) {
    const radial=s.attack%2===0,base=radial?clock*.12:Math.PI/2+(topology===1?(role%2?.45:-.45):0);
    for(let i=0;i<6;i++) {
      let a=radial?base+(i+1)*TAU/8:base+(i<3?-1:1)*(.28+(i%3)*.20);
      const y=RECT.top+260,x=e.x+Math.cos(a)/Math.max(.2,Math.sin(a))*(y-e.y);
      if(!radial&&m.corridor&&Math.abs(x-m.corridor.x)<m.corridor.half+10) {
        const edge=m.corridor.x+(i<3?-1:1)*(m.corridor.half+30+(i%3)*18);
        a=Math.atan2(y-e.y,edge-e.x);
      }
      const p=bullet(w,e,h,a,110,.7);if(p)p.magneticVisual="prismShard";
    }
    magneticFx(w,"electricImpact",e.x,e.y,42,.3);s.releaseClock=2.1;
  }
}
function horizonPoints(horizon: NonNullable<MagneticWorldState["horizon"]>, visit: (x: number, y: number) => void) {
  for (let ring = 0; ring < 2; ring++) {
    const radius = 82 + ring * 66, rotation = horizon.age * (ring ? -.45 : .45);
    for (let i = 0; i < 22; i++) {
      if (i < 4 || (ring === 1 && i >= 11 && i < 13)) continue;
      const a = i * TAU / 22 + rotation + ring * .7;
      visit(horizon.x + Math.cos(a) * radius, horizon.y + Math.sin(a) * radius);
    }
  }
}
function updateAuthoredGeometry(w: CombatWorld, dt: number, h: MagneticHooks) {
  const m = w.magnetic!, player = getPlayerHitbox(w);
  if (w.stage.waves[w.waveIndex].elite) {
    m.eliteClock = (m.eliteClock ?? 0) + dt; updateCorridor(w, m.eliteClock);
  }
  m.trails=(m.trails??[]).filter(t=>t.until>(m.eliteClock??0)&&w.enemies.some(e=>e.id===t.owner&&h.hostile(w,e)));
  for(const trail of m.trails)laneSegments(w,trail.from,trail.end,(a,b)=>{
    if(segmentVsAircraft(a.x,a.y,b.x,b.y,5,player,contact).hit)h.hit(w,trail.damage,trail.owner,"cyclone_ace");
  });
  const lanes = m.lanes ??= [];
  for (let i = lanes.length - 1; i >= 0; i--) {
    const lane = lanes[i], owner = w.enemies.find(e => e.id === lane.owner && h.hostile(w, e));
    const available = (id?: number) => id === undefined || w.enemies.some(e => e.id === id && h.hostile(w, e));
    if (!owner || !available(lane.node) || !available(lane.secondNode) || (owner.skillLockedUntil ?? 0) > w.elapsed) { lanes.splice(i, 1); continue; }
    if (owner.stun > 0) continue;
    const waiting = lane.age < lane.warning;
    lane.age += dt;
    if (owner.type === "grid_architect" && waiting && lane.age >= lane.warning &&
        lanes.filter(other => other !== lane && other.age >= other.warning && other.age <= other.warning + other.duration).length >= 2)
      lane.age = lane.warning - .001;
    if (lane.age > lane.warning + lane.duration) { lanes.splice(i, 1); continue; }
    if (lane.wall) {
      const corridor = m.corridor!;
      const outer = lane.wall < 0 ? RECT.left + 14 : RECT.right - 14;
      const inner = corridor.x + lane.wall * (corridor.half + 12);
      const progress = clamp((lane.age - lane.warning) / (lane.collapse ? 3 : 1.8), 0, 1);
      lane.from.x = lane.end.x = outer + (inner - outer) * progress;
    }
    if(waiting && lane.age>=lane.warning) {
      magneticFx(w,"electricImpact",lane.from.x,lane.from.y,42,.3);
      if(lane.wall) m.impact={at:w.elapsed,strength:owner.type==="boss"?4:3.5};
    }
    if (lane.age >= lane.warning && lane.damage > 0) laneSegments(w, lane.from, lane.end, (a, b) => {
      if (segmentVsAircraft(a.x, a.y, b.x, b.y, lane.width, player, contact).hit) h.hit(w, lane.damage, lane.owner, owner.type);
    });
  }
  const horizon = m.horizon;
  if (horizon) {
    horizon.age += dt;
    horizon.x=180+Math.sin(horizon.age*.35)*26;
    horizon.y=RECT.top+RECT.height*.57+Math.sin(horizon.age*.25)*18;
    const owner = w.enemies.find(e => e.id === horizon.owner && h.hostile(w, e));
    if (!owner || (owner.skillLockedUntil ?? 0) > w.elapsed || horizon.age > 6.5) m.horizon = undefined;
    else if (horizon.age > 1.4 && owner.stun <= 0) horizonPoints(horizon, (x, y) => {
      if (!inMagneticCorridor(w, x, 8, y) && circleVsAircraft(x, y, 6, player)) h.hit(w, horizon.damage, horizon.owner, "boss");
    });
  }
}
function paintAuthoredGeometry(w: CombatWorld, p: MagneticPainter) {
  const m = w.magnetic!;
  const corridor = m.corridor;
  if (corridor && (m.lanes?.length || m.horizon)) {
    for (const side of [-1, 1]) p.line(corridor.x + side * corridor.half, RECT.top + 185, corridor.x + side * corridor.half, RECT.bottom, 0x67e8f9, .42, 1.5);
    p.label?.(corridor.x, RECT.bottom - 5, "FLUX CHANNEL", 0x67e8f9, 7);
  }
  for(const trail of m.trails??[])laneSegments(w,trail.from,trail.end,(a,b)=>{
    p.line(a.x,a.y,b.x,b.y,0xc084fc,.25,15);p.line(a.x,a.y,b.x,b.y,0xe9d5ff,.9,5);
  });
  for (const lane of m.lanes ?? []) {
    const active = lane.age >= lane.warning, color = active ? 0xe9d5ff : 0xfde047;
    laneSegments(w, lane.from, lane.end, (a, b) => {
      p.line(a.x, a.y, b.x, b.y, color, active ? .22 : .25, active ? lane.width * 2 + 8 : 3);
      p.line(a.x, a.y, b.x, b.y, color, .95, active ? lane.width * 2 : 2);
    });
    p.circle(lane.from.x, lane.from.y, active ? 12 : 18, color, .8);
    const node = w.enemies.find(e => e.id === (lane.node ?? lane.owner));
    if (node) p.line(node.x, node.y, lane.from.x, lane.from.y, 0x67e8f9, .28, 1);
  }
  if (m.horizon) {
    const horizon = m.horizon, active = horizon.age > 1.4;
    p.circle(horizon.x, horizon.y, 20, 0xc084fc, .5);
    horizonPoints(horizon, (x, y) => {
      if (!inMagneticCorridor(w, x, 8, y)) p.circle(x, y, active ? 6 : 8, active ? 0xc084fc : 0xfde047, active ? .95 : .65, active);
    });
  }
  for (const e of w.enemies) {
    const s = e.magnetic; if (!s || e.hp <= 0) continue;
    if (s.tether && s.clampWarned) p.label?.(e.x, e.y - 20, (s.tetherUntil ?? 0) - w.elapsed > 1.2 ? "CLAMP !" : "CLAMP", 0xfde047, 8);
    if ((e.type === "micro_drone" && s.diveX !== undefined && s.clock < (s.diveAt ?? 0)) ||
        (e.type === "satellite" && s.dropX !== undefined && (s.dropClock ?? 0) < 2.3)) {
      const x = e.type === "micro_drone" ? s.diveX! : s.dropX!, y = e.type === "micro_drone" ? s.diveY! : s.dropY!;
      p.line(e.x, e.y, x, y, 0xfde047, .75, 2); p.circle(x, y, 16, 0xfde047, .85);
    }

    if (["orbit_wasp", "arc_reaver", "prism_manta"].includes(e.type) && e.fireCooldown < .45) {
      const a=Math.atan2(w.playerY-e.y,w.playerX-e.x);
      for(const side of [-1,1])p.line(e.x,e.y,e.x+Math.cos(a+side*.2)*28,e.y+Math.sin(a+side*.2)*28,0xfde047,.9,2);
    }
  }
  for (const q of w.projectiles) if (q.magnetic && q.lifetime > 0) {
    const color = q.magnetic.phase === "turn" ? 0xfde047 : q.magnetic.phase === "return" ? 0xc084fc : 0x67e8f9;
    p.circle(q.x, q.y, q.radius + 2, color, .85);
    if (q.magnetic.phase === "return") p.line(q.previousX, q.previousY, q.x, q.y, color, .7, 3);
  }
  for (const mine of m.mines) if (mine.exploded) {
    p.circle(mine.x, mine.targetY, 40 + Math.max(0, mine.warning - 1.6) * 45, 0xfb923c, Math.max(0, 1 - (mine.warning - 1.6) / .45));
  } else {
    p.circle(mine.x, mine.targetY, 40, 0xfb923c, .9);
    p.line(mine.x - 7, mine.targetY, mine.x + 7, mine.targetY, 0xfde047, 1, 2);
    p.line(mine.x, mine.targetY - 7, mine.x, mine.targetY + 7, 0xfde047, 1, 2);
  }
  const polarity = m.polarity;
  if (polarity) for (const node of satellites(w, polarity.owner).filter(n=>!polarity.authored || (state(n).slot??0)<2)) {
    const reversal = !polarity.authored && polarity.age >= polarity.warning + 2.4;
    const pull = polarity.authored ? polarity.direction === 1 : (((node.magnetic?.slot ?? 0) % 2 === 0) === (polarity.direction === 1)) !== reversal;
    const warning = polarity.age < polarity.warning || (!polarity.authored && polarity.age > polarity.warning + 1.6 && !reversal);
    const dx = node.x - w.playerX, dy = node.y - w.playerY, length = Math.max(1, Math.hypot(dx, dy));
    const direction = pull ? 1 : -1, x = w.playerX + dx / length * 35, y = w.playerY + dy / length * 35;
    const ax = x + dx / length * 16 * direction, ay = y + dy / length * 16 * direction;
    const color = warning ? 0xfde047 : pull ? 0x67e8f9 : 0xc084fc;
    p.line(node.x, node.y, w.playerX, w.playerY, color, .22, 1);
    p.line(x, y, ax, ay, color, .95, 2);
    for (const side of [-1, 1]) p.line(ax, ay, ax - dx / length * 7 * direction + dy / length * 5 * side, ay - dy / length * 7 * direction - dx / length * 5 * side, color, .95, 2);
    p.label?.(node.x, node.y - 24, `${pull ? "PULL" : "PUSH"}${warning ? " → SWAP" : ""}`, color, 7);
  }
  if (m.director) p.label?.(180, RECT.top + 14, m.director.name, m.director.overload ? 0xf5d0fe : 0xe9d5ff, 8);
}

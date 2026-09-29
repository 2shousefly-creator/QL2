import { GAMEPLAY_SAFE_RECT as R, stageEnemyConfig } from "./airCombatConfig";
import { getEnemyHitbox, clampHitboxToGameplayRect } from "./airCombatHitboxes";
import { isElite } from "./airCombatWaves";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { MirageWorldState, MirageEnemyState, MirageHooks, MiragePoint, MirageHazard } from "./airCombatMirageTypes";
import type { MirageVisualKey } from "./airCombatStage4Art";
import type { StatusPayload } from "./airCombatStatus";
export type { MirageWorldState, MirageEnemyState, MirageHooks } from "./airCombatMirageTypes";

const point = (x: number, y: number, pad = 24): MiragePoint => ({ x: Math.max(R.left + pad, Math.min(R.right - pad, x)), y: Math.max(R.top + pad, Math.min(R.bottom - pad, y)) });
const damage = (e: EnemyEntity) => stageEnemyConfig(e.type, 4).projectileDamage * e.damageScale;
const live = (w: CombatWorld, id: number) => w.enemies.find(e => e.id === id && e.hp > 0);
export function createMirageState(): MirageWorldState {
  return { projections: [], ghosts: [], hazards: [], visuals: [], mirrorPhase: "inactive", bossAt: Infinity,
    nextHardAttack: 0, history: [], nextHistory: 0,
    movement: { x: 180, y: 500, vx: 0, vy: 0 } };
}
export function resetMirage(w: CombatWorld) {
  const s = w.mirage; if (!s) return;
  s.projections.length = s.ghosts.length = s.hazards.length = s.history.length = 0;
  s.visuals=w.ended?s.visuals.filter(v=>v.key==="bossDeath"):[];
  s.replay = undefined; s.boss = undefined;
  if (s.mirror) {
    const actor = s.mirror.context.world;
    actor.projectiles.length = actor.enemies.length = actor.decoys.length = actor.warnings.length = actor.particles.length = actor.visualEvents.length = 0;
    actor.effectQueue.length = 0; actor.rankRuntime = undefined; actor.astra = undefined; actor.tactical = undefined;
    s.mirror.incoming.clear(); s.mirror.outgoing.clear(); s.mirror.ai.history.length = 0;
    w.enemies = w.enemies.filter(e => e !== s.mirror!.target);
    s.mirror = undefined;
  }
  w.projectiles = w.projectiles.filter(p => !p.mirrorBorrowed);
  for (const p of w.projectiles) p.mirrorSlow = undefined;
}
export function mirageFx(w: CombatWorld, key: MirageVisualKey, x: number, y: number, size: number, duration = .4, rotation = 0) {
  const s = w.mirage; if (!s || s.visuals.length >= 110) return;
  s.visuals.push({ id: w.nextId++, key, x, y, size, duration, rotation, at: w.elapsed });
}
export function initializeMirageEnemy(w: CombatWorld, e: EnemyEntity) {
  e.mirage = { next: w.elapsed + 1 + (w.spawnedInWave % 6) * .19, attack: 0, split: false, shieldUntil: 0, shieldAngle: 0 };
  mirageFx(w, e.type === "boss" ? "parallaxBossSpawn" : "mirageSpawn", e.x, e.y, e.radius * 4, .65);
  if (e.type === "boss") w.mirage!.boss = { phase: 1, ordinal: 0, next: w.elapsed + 1 };
}
export function mirageEnemyDestroyed(w: CombatWorld, e: EnemyEntity) {
  const s = w.mirage; if (!s) return;
  for (const p of s.projections) if (p.ownerId === e.id) mirageFx(w, "illusionDissolve", p.x, p.y, p.size);
  s.projections = s.projections.filter(p => p.ownerId !== e.id);
  s.ghosts = s.ghosts.filter(p => p.ownerId !== e.id);
  mirageFx(w, e.type === "boss" ? "bossDeath" : "mirageBreak", e.x, e.y, e.radius * 4, .8);
}
function project(w: CombatWorld, e: EnemyEntity, offsets: number[], duration = 1.8, helper = false) {
  const s = w.mirage!;
  for (const dx of offsets) {
    if (s.projections.length >= 48) break;
    const p = point(e.x + dx, e.y + (helper ? 35 : 0));
    s.projections.push({ ...p, id: w.nextId++, ownerId: e.id, sourceEnemyId: e.id, vx: 0, vy: 0,
      born: w.elapsed, expiresAt: w.elapsed + duration, visualType: helper ? "helper" : e.type,
      targetable: false, oneHitDissolve: true, real: false, size: e.radius * (helper ? 1.3 : e.type === "boss" ? 3.2 : 2.8) });
  }
}
function ghost(w: CombatWorld, e: EnemyEntity, origin: MiragePoint, angle: number, speed = 190) {
  const s = w.mirage!; if (s.ghosts.length >= 128) return;
  s.ghosts.push({ ...origin, id: w.nextId++, ownerId: e.id, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, until: w.elapsed + 4, rotation: angle + Math.PI / 2 });
}
function bullet(w: CombatWorld, e: EnemyEntity, h: MirageHooks, angle: number, factor = 1, speed = 190,
  key: MirageVisualKey = "parallaxNeedle", origin: MiragePoint = e, payload?: StatusPayload) {
  return h.projectile(w, { owner: "enemy", enemySpeedClass: "special", allegiance: h.allegiance(w, e),
    sourceEnemyId: e.id, sourceEnemyType: e.type, delivery: "direct_projectile", payload,
    x: origin.x, y: origin.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    rawDamage: damage(e) * factor, radius: key === "lockOrb" ? 5 : 3, lifetime: 5.5,
    mirageVisual: key, color: "#9cecff", criticalAttack: isElite(e.type) || e.type === "boss" });
}
function target(w: CombatWorld, e: EnemyEntity, h: MirageHooks) {
  const t = h.target(w, e) ?? { x: e.x, y: R.bottom };
  return point(t.x + (h.allegiance(w, e) === "hostile" ? w.mirage!.movement.vx * .18 : 0), t.y + (h.allegiance(w, e) === "hostile" ? w.mirage!.movement.vy * .18 : 0));
}
function hazard(w: CombatWorld, e: EnemyEntity, h: MirageHooks, start: MiragePoint, end: MiragePoint | undefined,
  radius: number, warning: number, real: boolean, factor: number, keys: [MirageVisualKey, MirageVisualKey], payload?: StatusPayload, duration = .24): MirageHazard | undefined {
  const s = w.mirage!; if (s.hazards.length >= 64) return;
  const a: MirageHazard = { id: w.nextId++, ownerId: e.id, sourceEnemyId: e.id, sourceEnemyType: e.type,
    allegiance: h.allegiance(w, e), delivery: end ? "beam" : "area_hazard", payload,
    start, end, radius, real, warningAt: w.elapsed, hitAt: w.elapsed + warning, until: w.elapsed + warning + duration,
    raw: damage(e) * factor, warning: keys[0], active: keys[1], hits: new Map() };
  s.hazards.push(a); return a;
}
// One spatial restriction at a time. The reservation includes its entire live window;
// the authored lanes leave > aircraft-width gaps and cages always have a 66 px exit.
function reserve(w: CombatWorld, duration: number, stun = false) {
  const s = w.mirage!;
  if (w.elapsed < s.nextHardAttack || s.hazards.some(a => a.real && a.until > w.elapsed) ||
    w.enemies.some(e => !!e.mirage?.dash || !!e.mirage?.swap)) return false;
  const status = w.aircraft.status, now = w.aircraft.coreState.time;
  if(status.stunnedUntil>now)return false;
  if (stun && (status.stunnedUntil > now || (status.fractureStunUntil ?? 0) > 0 && now < status.fractureStunUntil! + 1.25)) return false;
  s.nextHardAttack = w.elapsed + duration + .16;
  return true;
}
function lanes(w: CombatWorld, e: EnemyEntity, h: MirageHooks, count: 4 | 6, warning: number, factor: number, grid = false, lock = false) {
  if (!reserve(w, warning + .3)) return false;
  const gap = R.width / (count + 1);
  for (let i = 0; i < count; i++) {
    const x = R.left + gap * (i + 1), real = i % 2 === e.mirage!.attack % 2;
    hazard(w, e, h, { x, y: R.top + 8 }, { x, y: R.bottom - 8 }, 7, warning, real, factor,
      [real ? grid ? "parallaxGridReal" : "falseHorizonReal" : grid ? "parallaxGridFake" : "falseHorizonFake",
        real ? grid ? "parallaxGridReal" : "falseHorizonReal" : grid ? "parallaxGridFake" : "falseHorizonFake"], lock ? { skillLock: 1 } : undefined);
  }
  return true;
}
function cage(w: CombatWorld, e: EnemyEntity, h: MirageHooks, warning: number, boss = false) {
  if (!reserve(w, warning + .55, true)) return false;
  const t = target(w, e, h), c = point(t.x, t.y, 80), r = 66;
  const walls: [MiragePoint, MiragePoint][] = [
    [{ x: c.x - r, y: c.y - r }, { x: c.x + r, y: c.y - r }],
    [{ x: c.x - r, y: c.y - r }, { x: c.x - r, y: c.y + r }],
    [{ x: c.x + r, y: c.y - r }, { x: c.x + r, y: c.y + r }],
    [{ x: c.x - r, y: c.y + r }, { x: c.x - 33, y: c.y + r }],
  ];
  for (const [a, b] of walls) hazard(w, e, h, a, b, 5, warning, true, boss ? 1.45 : 1,
    ["realityCageWarning", "realityWall"], { stun: boss ? .65 : .55, skillLock: boss ? 1.5 : undefined }, .5);
  return true;
}
function markers(w: CombatWorld, e: EnemyEntity, h: MirageHooks, future = false, warning = .625) {
  if (!reserve(w, warning + (future ? .9 : .28), !future)) return false;
  const t = target(w, e, h), count = future ? 2 : 3;
  for (let i = 0; i < count; i++) {
    const real = i === e.mirage!.attack % count, at = point(t.x + (i - (count - 1) / 2) * 65, t.y + (i % 2 ? 32 : -22));
    for(let step=0;step<(future?3:1);step++) {
      const position=point(at.x+(step-1)*(future?18:0),at.y-step*38);
      hazard(w, e, h, position, undefined, 24, warning+step*.28, real, future ? 1.3 : 1,
        [real ? future ? "falseFutureMarkerReal" : "veilMarkerReal" : future ? "falseFutureMarkerFake" : "veilMarkerFake",
          real ? "impact" : "illusionDissolve"], future ? undefined : { stun: .45 });
    }
  }
  return true;
}
function rail(w: CombatWorld, e: EnemyEntity, h: MirageHooks, warning = .6) {
  if (!reserve(w, warning + .3)) return false;
  const t = target(w, e, h); project(w, e, [-34, 34], warning + .35);
  for (const side of [-1, 1]) {
    const start = point(e.x + side * 34, e.y), real = side === (e.mirage!.attack % 2 ? -1 : 1);
    const dx = t.x - start.x, dy = t.y - start.y, length = Math.hypot(dx, dy) || 1;
    const end = { x: start.x + dx / length * 800, y: start.y + dy / length * 800 };
    hazard(w, e, h, start, end, 5, warning, real, 1, [real ? "echoRailCharge" : "echoRailFake", real ? "echoRailShot" : "echoRailFake"], { resourceJam: 1.5 });
  }
  return true;
}
function dash(w: CombatWorld, e: EnemyEntity, h: MirageHooks, warning = .55, remaining = 1, followRail = false, reserved = false) {
  if (!reserved && !reserve(w, remaining * (warning + .6), true)) return false;
  const s = e.mirage!, to = target(w, e, h);
  s.dash = { from: { x: e.x, y: e.y }, to, at: w.elapsed + warning, duration: remaining === 1 ? .3 : .4,
    raw: stageEnemyConfig(e.type, 4).collisionDamage * e.damageScale * (e.type === "boss" ? .62 : 1),
    hits: new Map(), allegiance: h.allegiance(w, e), stun: e.type === "boss" ? 0 : .4, remaining, followRail };
  project(w, e, e.type === "parallax_lancer" ? [32] : [-36, 36], warning + .65);
  hazard(w, e, h, s.dash.from, to, 8, warning, true, 0, [e.type === "boss" ? "mirrorRushWarning" : "mirrorDashWarning", "mirrorDashTrail"]);
  for (const side of e.type === "parallax_lancer" ? [1] : [-1, 1]) {
    const from = point(e.x + side * 36, e.y), end = point(to.x + side * 44, to.y);
    hazard(w, e, h, from, end, 8, warning, false, 0, ["mirrorDashWarning", "mirrorDashTrail"]);
  }
  return true;
}
function swap(w: CombatWorld, e: EnemyEntity, h: MirageHooks, followDash = false) {
  if (!reserve(w, .65)) return false;
  const to = point(e.x < R.left + R.width / 2 ? R.right - 48 : R.left + 48, Math.min(e.y, R.top + 190));
  e.mirage!.swap = { to, at: w.elapsed + .35 };
  project(w,e,[to.x-e.x],.9);
  const clone=w.mirage!.projections.at(-1);if(clone&&clone.ownerId===e.id){clone.x=to.x;clone.y=to.y;}
  mirageFx(w, "fractureSwap", e.x, e.y, e.radius * 4, .35);
  mirageFx(w, "realCorePulse", to.x, to.y, e.radius * 2, .35);
  if (followDash) e.mirage!.next = w.elapsed + .7;
  return true;
}
function barrage(w: CombatWorld, e: EnemyEntity, h: MirageHooks, split: boolean, warning = split ? .72 : .55) {
  if (!reserve(w, warning + .35)) return false;
  const t = target(w, e, h), origins = [{ x: e.x, y: e.y }];
  if (split) { project(w, e, [-85, 85], warning + .8); origins.push(point(e.x - 85, e.y), point(e.x + 85, e.y)); }
  e.mirage!.barrage = { at: w.elapsed + warning, origins, count: 9, angle: Math.atan2(t.y - e.y, t.x - e.x), allegiance: h.allegiance(w, e) };
  for (let i = 0; i < origins.length; i++) mirageFx(w, i ? "fakeCorePulse" : "realCorePulse", origins[i].x, origins[i].y, e.radius * 2, warning);
  return true;
}
function replay(w: CombatWorld, e: EnemyEntity, h: MirageHooks, warning = .55) {
  const s = w.mirage!; if (!reserve(w, warning + 1.7)) return false;
  const path = s.history.filter(p => p.at >= w.elapsed - 1.6).map(p => ({ x: p.x, y: p.y }));
  if (!path.length) return false;
  s.replay = { ownerId: e.id, path, at: w.elapsed + warning, next: w.elapsed + warning, index: 0, allegiance: h.allegiance(w, e) };
  for (let i = 0; i < path.length; i += 8) mirageFx(w, "echoReplayTrail", path[i].x, path[i].y, 30, warning);
  return true;
}
function bossAttack(w: CombatWorld, e: EnemyEntity, h: MirageHooks) {
  const b = w.mirage!.boss!, ratio = e.hp / e.maxHp, phase = ratio > .7 ? 1 : ratio > .4 ? 2 : ratio >= .15 ? 3 : 4;
  if (b.phase !== phase) { b.phase = phase; mirageFx(w, phase === 4 ? "zeroTruthAura" : "bossCoreExpose", e.x, e.y, 160, 1); }
  w.bossPhase = phase;
  if (w.elapsed < b.next) return;
  // Ordered combos preserve a readable escape window; no random full-screen overlaps.
  const pools = phase === 1 ? ["split", "barrage", "horizon"] : phase === 2 ? ["cage", "rush", "swap", "barrage"] : phase === 3 ? ["replay", "future", "grid", "barrage"] :
    ["split", "cage", "barrage", "rush", "horizon", "replay", "swap", "grid", "barrage"];
  const key = pools[b.ordinal % pools.length], enrage = phase === 4;
  const success = key === "split" ? barrage(w, e, h, true, enrage ? .5 : .72)
    : key === "barrage" ? barrage(w, e, h, false, enrage ? .46 : .55)
    : key === "horizon" ? lanes(w, e, h, 4, enrage ? .5 : .68, 1.35)
    : key === "cage" ? cage(w, e, h, enrage ? .5 : .6, true)
    : key === "rush" ? dash(w, e, h, enrage ? .46 : .52)
    : key === "swap" ? swap(w, e, h)
    : key === "replay" ? replay(w, e, h, enrage ? .5 : .55)
    : key === "future" ? markers(w, e, h, true, enrage ? .5 : .62)
    : lanes(w, e, h, 6, enrage ? .46 : .5, 1.4, true);
  if (success) { b.ordinal++; e.mirage!.attack++; b.next = Math.max(w.mirage!.nextHardAttack, w.elapsed + (enrage ? .9 : 1.5)); }
  else b.next = w.elapsed + .12;
}
export function updateMirageEnemy(w: CombatWorld, e: EnemyEntity, dt: number, h: MirageHooks): boolean {
  const s = e.mirage; if (!w.mirage || !s) return false;
  if (s.swap && w.elapsed >= s.swap.at) {
    const old={x:e.x,y:e.y},destination=s.swap.to;
    const clone=w.mirage.projections.find(p=>p.ownerId===e.id&&Math.hypot(p.x-destination.x,p.y-destination.y)<1);
    if(clone){clone.x=old.x;clone.y=old.y;}
    e.x=destination.x;e.y=destination.y;s.swap=undefined;mirageFx(w,"fractureSwap",e.x,e.y,e.radius*3,.25);
  }
  if (s.barrage && w.elapsed >= s.barrage.at) {
    const b = s.barrage; s.barrage = undefined;
    for (let k = 0; k < b.origins.length; k++) for (let i = 0; i < b.count; i++) {
      const a = b.angle + (i - 4) * .19;
      if (k === 0 && i % 3 !== 1) bullet(w, e, h, a, 1, 205, "parallaxBarrage", b.origins[k]);
      else ghost(w, e, b.origins[k], a, 205);
    }
  }
  if (s.dash) {
    const d = s.dash;
    if (w.elapsed < d.at) return true;
    const t = Math.min(1, (w.elapsed - d.at) / d.duration), old = { x: e.x, y: e.y };
    e.x = d.from.x + (d.to.x - d.from.x) * t; e.y = d.from.y + (d.to.y - d.from.y) * t;
    e.airframeRotation = Math.atan2(d.to.y - d.from.y, d.to.x - d.from.x) + Math.PI / 2;
    h.area(w, d.raw, { sourceEnemyId: e.id, sourceEnemyType: e.type, allegiance: d.allegiance, delivery: "aircraft_collision", payload: { stun: d.stun } }, { ...old, end: e, radius: e.radius * .5 }, d.hits, Infinity);
    for (const p of w.mirage.projections) if (p.ownerId === e.id) { p.x += e.x - old.x; p.y += e.y - old.y; }
    if (t === 1) { s.dash = undefined; if (d.remaining > 1) dash(w, e, h, .55, d.remaining - 1, d.followRail, true); else if (d.followRail) { s.next = w.elapsed + .35; s.attack = 2; } }
    return true;
  }
  if (e.stun > 0 || (e.skillLockedUntil ?? 0) > w.elapsed || s.swap) return true;
  const speed = stageEnemyConfig(e.type, 4).speed * h.movement(w, e);
  const y = e.type === "boss" ? R.top + 90 : R.top + 60 + e.id % 5 * 34;
  e.y += Math.max(-speed * dt, Math.min(speed * dt, y - e.y));
  e.x += Math.sin(e.age * .9 + e.phaseSeed) * speed * .32 * dt;
  const bounded = clampHitboxToGameplayRect(e.x, e.y, getEnemyHitbox(e)); e.x = bounded.x; e.y = bounded.y;
  s.shieldAngle = e.age * .8;
  if (e.type === "boss") { bossAttack(w, e, h); return true; }
  if (w.elapsed < s.next) return true;
  const t = target(w, e, h), aim = Math.atan2(t.y - e.y, t.x - e.x);
  let success = true;
  switch (e.type) {
    case "mirage_wisp":
      bullet(w, e, h, aim); ghost(w, e, e, aim - .14); ghost(w, e, e, aim + .14);
      if (s.attack % 3 === 2) project(w, e, [22], 1.2); break;
    case "parallax_lancer": success = dash(w, e, h); break;
    case "holo_bastion":
      s.shieldUntil = w.elapsed + 2.2; bullet(w, e, h, aim, 1, 105, "lockOrb", e, { skillLock: 1 }); break;
    case "veil_weaver": success = markers(w, e, h); break;
    case "echo_hunter": success = rail(w, e, h); break;
    case "phantom_carrier":
      project(w, e, [-38, 0, 38], 2.5, true); bullet(w, e, h, aim);
      for (const p of w.mirage.projections.filter(p => p.ownerId === e.id)) ghost(w, e, p, aim + (p.x - e.x) * .003); break;
    case "mirror_arbiter": success = barrage(w, e, h, true); break;
    case "null_jailer": success = cage(w, e, h, .7); break;
    case "refraction_ace": success = dash(w, e, h, .55, 3); break;
    case "glass_monarch": s.shieldUntil = w.elapsed + 3; for (const a of [-.28, 0, .28]) bullet(w, e, h, aim + a); break;
    case "phantom_executioner": success = s.attack % 3 === 0 ? swap(w, e, h, true) : s.attack % 3 === 1 ? dash(w, e, h, .55, 1, true) : rail(w, e, h); break;
    case "veil_architect": success = lanes(w, e, h, 6, .6, 1, true, true); break;
    case "echo_bastion_prime": s.shieldUntil = w.elapsed + 2; project(w, e, [-55, 55], 2.3); for (const a of [-.35, -.17, 0, .17, .35]) bullet(w, e, h, aim + a); break;
    case "parallax_seraph":
      if (s.attack % 2 === 0) success = swap(w, e, h);
      else for (let i = 0; i < 10; i++) {
        const a = i * Math.PI * 2 / 10;
        const orb = bullet(w, e, h, a, 1, 140, "lockOrb", { x: e.x + Math.cos(a) * 32, y: e.y + Math.sin(a) * 32 });
        if (orb) orb.mirageOrbit = { ownerId:e.id, angle:a, radius:32, until:w.elapsed+1.6 };
      } break;
    case "fracture_sovereign":
      if (e.hp <= e.maxHp * .5 && !s.split) { s.split = true; mirageFx(w, "fractureSwap", e.x, e.y, 110, .35); }
      if (s.split) { project(w, e, [-68, -34, 68], 2); for (const p of w.mirage.projections.filter(p => p.ownerId === e.id)) ghost(w, e, p, aim); }
      success = markers(w, e, h, true); break;
  }
  if (success) { s.attack++; s.next = Math.max(s.next, w.elapsed + stageEnemyConfig(e.type, 4).fireInterval / 1.1); }
  else s.next = w.elapsed + .15;
  return true;
}
/** True panels block only their authored angular sector; ghost panels are visual only. */
export function mirageShieldBlocks(w: CombatWorld, e: EnemyEntity, p: ProjectileEntity) {
  const s = e.mirage; if (!s || s.shieldUntil <= w.elapsed) return false;
  const angle = Math.atan2(p.previousY - e.y, p.previousX - e.x);
  const count = e.type === "glass_monarch" ? 6 : 3;
  for (let i = 0; i < count; i++) {
    if (i % 3 !== 0) continue;
    const diff = Math.atan2(Math.sin(angle - s.shieldAngle - i * Math.PI * 2 / count), Math.cos(angle - s.shieldAngle - i * Math.PI * 2 / count));
    if (Math.abs(diff) < .48) { mirageFx(w, "impact", p.x, p.y, 22); return true; }
  }
  return false;
}
export function updateMirageProjectile(w: CombatWorld, p: ProjectileEntity, dt: number, motionDt: number) {
  const orbit = p.mirageOrbit; if (!orbit) return false;
  const owner = live(w, orbit.ownerId);
  if (!owner || w.elapsed >= orbit.until) { p.mirageOrbit=undefined; return false; }
  orbit.angle += motionDt * 1.7; orbit.radius = Math.min(90, orbit.radius + motionDt * 38);
  p.x = owner.x + Math.cos(orbit.angle) * orbit.radius; p.y = owner.y + Math.sin(orbit.angle) * orbit.radius;
  p.vx = -Math.sin(orbit.angle) * 140; p.vy = Math.cos(orbit.angle) * 140; p.lifetime -= dt;
  return true;
}
export function updateMirage(w: CombatWorld, dt: number, h: MirageHooks) {
  const s = w.mirage; if (!s) return;
  if (w.ended) { resetMirage(w); return; }
  s.movement.vx = (w.playerX - s.movement.x) / Math.max(.001, dt); s.movement.vy = (w.playerY - s.movement.y) / Math.max(.001, dt);
  s.movement.x = w.playerX; s.movement.y = w.playerY;
  if (w.elapsed >= s.nextHistory) { s.history.push({ x: w.playerX, y: w.playerY, at: w.elapsed }); s.nextHistory = w.elapsed + 1 / 60; }
  s.history = s.history.filter(p => p.at > w.elapsed - 2).slice(-120);
  s.projections = s.projections.filter(p => p.expiresAt > w.elapsed && !!live(w, p.ownerId));
  // Illusions may dissolve on contact, but never consume a projectile, target,
  // penetration slot, damage proc or reward. Their bodies are not hitboxes.
  s.projections = s.projections.filter(projection => {
    const touched = w.projectiles.some(p => {
      if (p.owner === "enemy" || p.lifetime <= 0) return false;
      const dx=p.x-p.previousX, dy=p.y-p.previousY;
      const t=Math.max(0,Math.min(1,((projection.x-p.previousX)*dx+(projection.y-p.previousY)*dy)/(dx*dx+dy*dy||1)));
      return Math.hypot(projection.x-p.previousX-dx*t,projection.y-p.previousY-dy*t)<projection.size*.2+p.radius;
    });
    if(touched)mirageFx(w,"illusionHit",projection.x,projection.y,projection.size,.24);
    return !touched;
  });
  for (const p of s.ghosts) { p.x += p.vx * dt; p.y += p.vy * dt; }
  s.ghosts = s.ghosts.filter(p => p.until > w.elapsed && p.y < R.bottom + 40 && p.y > R.top - 40 && p.x > R.left - 40 && p.x < R.right + 40);
  s.visuals = s.visuals.filter(v => v.at + v.duration > w.elapsed);
  s.hazards = s.hazards.filter(a => a.until > w.elapsed);
  resolveMirageContacts(w, h);
  const r = s.replay;
  if (r && w.elapsed >= r.next) {
    const e = live(w, r.ownerId), p = r.path[r.index];
    if (!e || !p) s.replay = undefined;
    else { mirageFx(w, "echoReplayTrail", p.x, p.y, 42, .2); if (r.index % 6 === 0) { const t = h.target(w, e) ?? p; bullet(w, e, h, Math.atan2(t.y - p.y, t.x - p.x), 1.15, 190, "parallaxNeedle", p); } r.index++; r.next += 1 / 60; }
  }
}
export function resolveMirageContacts(w: CombatWorld, h: MirageHooks) {
  for (const a of w.mirage?.hazards ?? []) if (a.real && a.raw > 0 && w.elapsed >= a.hitAt && w.elapsed < a.until)
    h.area(w, a.raw, a, { ...a.start, end: a.end, radius: a.radius }, a.hits, Infinity);
}

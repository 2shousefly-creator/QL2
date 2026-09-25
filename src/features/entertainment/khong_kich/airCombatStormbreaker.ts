import { GAMEPLAY_SAFE_RECT as RECT, stageEnemyConfig } from "./airCombatConfig";
import { bossMinCenterY } from "./airCombatHudLayout";
import { clampHitboxToGameplayRect, getEnemyHitbox } from "./airCombatHitboxes";
import { isElite } from "./airCombatWaves";
import type { Allegiance } from "./airCombatStatus";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { EnemyType } from "./airCombatTypes";
import type { StormbreakerVfxKey } from "./airCombatStage3Art";
import type { StormbreakerWorldState, StormbreakerEnemyState, StormbreakerHooks, StormPoint, StormTag, StormCast, StormHazard } from "./airCombatStormbreakerTypes";
export type { StormbreakerWorldState, StormbreakerEnemyState, StormbreakerHooks } from "./airCombatStormbreakerTypes";

const TAU = Math.PI * 2;
const ELITES: EnemyType[] = ["storm_herald", "volt_executioner", "capacitor_prime", "ion_arbiter", "thunder_bastion", "arc_seraph", "storm_weaver_prime"];
export const isStormObjective = (type: EnemyType) => type === "storm_node" || type === "omega_storm_node" || type === "storm_conductor";
const point = (x: number, y: number, pad = 24): StormPoint => ({ x: Math.max(RECT.left + pad, Math.min(RECT.right - pad, x)), y: Math.max(RECT.top + pad, Math.min(RECT.bottom - pad, y)) });
const damage = (e: EnemyEntity) => stageEnemyConfig(e.type, 3).projectileDamage * e.damageScale;
const collision = (e: EnemyEntity) => stageEnemyConfig(e.type, 3).collisionDamage * e.damageScale;
const live = (w: CombatWorld, id: number) => w.enemies.find(e => e.id === id && e.hp > 0);
const locked = (w: CombatWorld, e: EnemyEntity) => e.stun > 0 || (e.skillLockedUntil ?? 0) > w.elapsed;
export function createStormbreakerState(w?: Pick<CombatWorld, "playerX" | "playerY">): StormbreakerWorldState {
  return { clock: 0, cycle: 0, phase: "STATIC", preparedCycle: -1, nodeCycle: -1, nodes: [], conductors: [],
    fields: [], clouds: [], hazards: [], events: [], visuals: [],
    director: { casts: [], nextResolve: 0, nextCast: 0, ordinal: 0 }, elite: { ordinal: 0, next: 2 },
    movement: { x: w?.playerX ?? 180, y: w?.playerY ?? 500, vx: 0, vy: 0 } };
}
export function initializeStormEnemy(w: CombatWorld, e: EnemyEntity) {
  e.stormbreaker = { lastHp: e.hp, lastShield: e.shield, charge: 0, chargeRemainder: 0, attack: 0, nextMajor: w.elapsed + 1.5 + (w.spawnedInWave % 6) * .21,
    hitAt: 0, links: [], relayUntil: 0, channelUntil: 0, boosted: false, enhanced: false, shieldArmed: false,
    shieldReady: w.elapsed + 2, breakUntil: 0, burst: [], ventReady: 0, slot: w.spawnedInWave, bodyUntil: 0, dischargeCycle: -1 };
  if (isStormObjective(e.type)) { e.auxiliary = true; e.rewardless = true; e.killProcEligible = false; e.noWaveWait = true; e.xp = 0; }
  e.fireCooldown = 1.2 + (e.stormbreaker.slot % 6) * .21;
  if (e.type === "boss") w.stormbreaker!.boss = { phase: 1, ordinal: 0, next: w.elapsed + 2, partial: w.elapsed + 6.5, partialOrdinal: 0, arraySpawned: false };
}
export function stormFx(w: CombatWorld, key: StormbreakerVfxKey, x: number, y: number, size: number, duration = .4, rotation = 0, delay = 0) {
  const s = w.stormbreaker; if (!s || s.visuals.length >= 110) return;
  s.visuals.push({ id: w.nextId++, key, x, y, size, duration, rotation, at: w.elapsed + delay });
}
export function resetStormbreaker(w: CombatWorld) {
  if (!w.stormbreaker) return;
  w.stormbreaker = createStormbreakerState(w);
  w.stormbreaker.elite.next = w.elapsed + 2;
  for (const e of w.enemies) if (isStormObjective(e.type)) { e.hp = 0; e.deathHandled = true; }
}
function pressureCap(w: CombatWorld) {
  const boss = w.stormbreaker!.boss;
  return boss ? boss.phase === 1 ? 2 : 3 : [3, 4, 4, 5, 5, 6, 3][w.waveIndex] ?? 3;
}
// Hard geometry is authored rather than sampled. Corridor owns ALL hard geometry;
// rails/chains cannot coincide with dash lanes. Two scissor lanes get offset warnings.
const CONFLICTS: Partial<Record<StormTag, readonly StormTag[]>> = {
  corridor: ["markers", "dash", "chain", "rail", "corridor", "ring"],
  dash: ["corridor", "rail", "chain"], rail: ["corridor", "dash", "chain"],
  chain: ["corridor", "dash", "rail", "chain"], markers: ["corridor"], ring: ["corridor"],
};
function reserve(w: CombatWorld, e: EnemyEntity, tag: StormTag, duration: number, primary = true, prepared = false): StormCast | null {
  const s = w.stormbreaker!, now = w.elapsed, d = s.director;
  d.casts = d.casts.filter(c => c.until > now);
  if (locked(w, e) || e.hp <= 0 || w.ended || w.waveState !== "combat") return null;
  // Final keeps secondary fire and partial discharge; ordinary recovery forbids NEW majors.
  if (!prepared && s.clock >= 17 && s.boss?.phase !== 4) return null;
  const hard = ["dash", "chain", "corridor", "rail"].includes(tag);
  const preparedPressure = Math.min(1.5, (s.nodes.length + s.clouds.length) * .2);
  if (d.casts.length + preparedPressure >= pressureCap(w) || s.hazards.length >= 32 || s.events.length >= 96) return null;
  if (primary && d.casts.some(c => c.owner === e.id && c.primary)) return null;
  if (d.casts.some(c => CONFLICTS[tag]?.includes(c.tag) || CONFLICTS[c.tag]?.includes(tag))) return null;
  if (hard && d.casts.filter(c => c.hard).length >= 2) return null;
  if (!prepared && now < d.nextCast) return null;
  const cast = { id: w.nextId++, owner: e.id, tag, until: now + duration, hard, primary };
  d.casts.push(cast); d.nextCast = now + .20; d.ordinal++;
  return cast;
}
function later(w: CombatWorld, e: EnemyEntity, delay: number, action: () => void, committed = true) {
  if (w.stormbreaker!.events.length < 96) w.stormbreaker!.events.push({ at: w.elapsed + delay, owner: e.id, committed, action });
}
function bullet(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, angle: number, factor: number,
  visual: StormbreakerVfxKey = "stormStaticBolt", speed = 155, radius = 3, allegiance = h.allegiance(w, e), origin: StormPoint = e, major = false) {
  const p = h.projectile(w, { owner: "enemy", allegiance, sourceEnemyId: e.id, sourceEnemyType: e.type,
    delivery: "direct_projectile", x: origin.x, y: origin.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    rawDamage: damage(e) * factor, radius, lifetime: 5.5, stormbreakerVisual: visual,
    criticalAttack: major || isElite(e.type) || e.type === "boss", suppressive: !major && !isElite(e.type) && e.type !== "boss", color: "#8ed5ff" });
  if (p) stormFx(w, e.type === "boss" ? "stormBossMuzzle" : isElite(e.type) ? "stormEliteMuzzle" : "stormMuzzle", origin.x, origin.y, radius * 7, .16, angle + Math.PI / 2);
  return p;
}
function fan(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, n: number, factor: number, aim: number,
  key: StormbreakerVfxKey, allegiance = h.allegiance(w, e), origin: StormPoint = e, spread = .18) {
  for (let i = 0; i < n; i++) bullet(w, e, h, aim + (i - (n - 1) / 2) * spread, factor, key, 155, 3, allegiance, origin, true);
}
function ring(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, count: number, factor: number, turn = 0, allegiance = h.allegiance(w, e), gapCentre = Math.PI / 2 + Math.sin(e.stormbreaker!.attack * 1.1) * .7) {
  // 42 degree omitted sector rotates by cast. No extra bolt closes its boundaries.
  const gap = .733, centre = gapCentre + turn;
  for (let i = 0; i < count; i++) bullet(w, e, h, centre + gap / 2 + i * (TAU - gap) / Math.max(1, count - 1), factor, "stormCapacitorBolt", 120, 3, allegiance, e, true);
}
function aimAt(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, allegiance?: Allegiance) {
  const t = h.target(w, e, allegiance) ?? { x: e.x, y: RECT.bottom };
  return Math.atan2(t.y - e.y, t.x - e.x);
}
function rayEnd(from: StormPoint, target: StormPoint): StormPoint {
  const dx = target.x - from.x, dy = target.y - from.y;
  if (Math.hypot(dx, dy) < .001) return { x: from.x, y: RECT.bottom };
  const tx = dx > 0 ? (RECT.right - from.x) / dx : dx < 0 ? (RECT.left - from.x) / dx : Infinity;
  const ty = dy > 0 ? (RECT.bottom - from.y) / dy : dy < 0 ? (RECT.top - from.y) / dy : Infinity;
  const t = Math.max(0, Math.min(tx, ty));
  return { x: from.x + dx * t, y: from.y + dy * t };
}
function predict(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, count: number): StormPoint[] {
  const t = h.target(w, e) ?? point(e.x, e.y + 150), m = w.stormbreaker!.movement;
  const hostile = h.allegiance(w, e) === "hostile", vx = hostile ? m.vx : 0, vy = hostile ? m.vy : 0;
  // Last marker cuts off the habitual exit on ONE side. The opposite side remains open.
  return Array.from({ length: count }, (_, i) => point(t.x + vx * (.16 + i * .13) + (i === count - 1 ? (vx >= 0 ? 30 : -30) : 0), t.y + vy * (.16 + i * .13) - i * 16));
}
function hazard(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, cast: StormCast, at: StormPoint, factor: number,
  warning: number, delay = 0, end?: StormPoint, radius = 16, duration = .12, environmental?: number,
  hits = new Map<number, number>(), decoy = false, allegiance = h.allegiance(w, e)): StormHazard | null {
  const s = w.stormbreaker!;
  if (s.hazards.length + w.warnings.length >= 40) return null;
  const requested = w.elapsed + warning + delay;
  // Every area strike has a deterministic resolution slot, including environmental contributions.
  const hitAt = Math.max(requested, s.director.nextResolve); s.director.nextResolve = hitAt + .18;
  const a: StormHazard = { id: w.nextId++, cast: cast.id, start: { ...at }, end: end && { ...end }, radius,
    warningAt: hitAt - warning, hitAt, until: hitAt + duration, damage: damage(e) * factor,
    sourceEnemyId: e.id, sourceEnemyType: e.type, allegiance, delivery: end ? "beam" : "area_hazard",
    majorBossAttack: e.type === "boss", visual: end ? "stormMainLightning" : "stormLightningImpact",
    environmental, decoy, resolved: false, hits, grace: .3 };
  s.hazards.push(a); cast.until = Math.max(cast.until, a.until);
  return a;
}
function markers(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, count: number, factor: number, warning = .95,
  prepared = false, positions?: StormPoint[], decoy = false, primary = true): boolean {
  const enhanced = e.stormbreaker!.enhanced && !positions;
  if (enhanced) count++;
  const c = reserve(w, e, "markers", warning + count * .18 + .3, primary, prepared); if (!c) return false;
  if (enhanced) e.stormbreaker!.enhanced = false;
  const pts = positions ?? predict(w, e, h, count), hits = new Map<number, number>();
  pts.forEach((p, i) => hazard(w, e, h, c, p, factor, warning, i * .18, undefined, 16, .12, undefined, hits, decoy && i === 4));
  return true;
}
function spawnObjective(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, type: EnemyType, slot: number) {
  const s = w.stormbreaker!, nodes = s.nodes.filter(id => live(w, id)); s.nodes = nodes;
  const cap = type === "omega_storm_node" ? s.boss?.phase === 4 ? 2 : 1 : w.waveIndex === 0 ? 1 : w.waveIndex === 1 ? 2 : 3;
  if (type !== "storm_conductor" && nodes.length >= cap) return;
  const obj = h.spawn(w, type, true); if (!obj) return;
  const at = type === "storm_conductor" ? point(RECT.left + RECT.width * [.18, .5, .82][slot % 3], RECT.top + [155, 210, 155][slot % 3], 36)
    : point(RECT.left + RECT.width * [.24, .76, .5][(slot + s.cycle) % 3], RECT.top + 170 + (slot % 2) * 90, 32);
  obj.x = at.x; obj.y = at.y; obj.baseX = at.x; obj.damageScale = type === "storm_conductor" ? 1 : e.damageScale;
  obj.stormbreaker!.slot = slot; obj.fireCooldown = 1.5 + slot * .6;
  if (type === "storm_conductor") s.conductors.push(obj.id); else s.nodes.push(obj.id);
  stormFx(w, type === "storm_conductor" ? "stormConductorSpawn" : "stormNodeSpawn", obj.x, obj.y, 72, .8);
}
function genesis(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, omega = false): boolean {
  const c = reserve(w, e, "nodes", 1.25); if (!c) return false;
  stormFx(w, "stormNodeSpawn", e.x, e.y, 80, .9);
  const n = omega ? w.stormbreaker!.boss?.phase === 4 ? 2 : 1 : 2;
  later(w, e, .9, () => { for (let i = 0; i < n; i++) spawnObjective(w, e, h, omega ? "omega_storm_node" : "storm_node", i); }, false);
  return true;
}
function overload(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks): boolean {
  if(e.stormbreaker!.overloadPending)return false;
  const prime = e.type === "capacitor_prime", warning = prime ? 1.35 : 1.2;
  const c = reserve(w, e, "ring", warning + .7); if (!c) return false;
  const allegiance = h.allegiance(w, e), s = e.stormbreaker!, gapCentre=Math.PI/2+Math.sin(s.attack*1.1)*.7;
  const extra = s.enhanced ? 2 : 0; s.enhanced = false;
  s.overloadPending=true;
  stormFx(w, "stormOverload", e.x, e.y, e.radius * 3.5, warning);
  later(w, e, warning, () => {ring(w, e, h, (prime ? 8 : e.wave >= 5 ? 12 : e.wave >= 2 ? 10 : 8) + extra, prime ? .60 : .70, 0, allegiance,gapCentre);
    if(!prime){s.charge=0;s.chargeRemainder=0;s.overloadPending=false;}}, false);
  if (prime) later(w, e, warning + .35, () => {ring(w, e, h, 8, .6, Math.PI / 8, allegiance,gapCentre);s.charge=0;s.chargeRemainder=0;s.overloadPending=false;}, false);
  return true;
}
function dash(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, factor: number, warning: number,
  follow: "scission" | "cross" | "shock" | "none" = "scission", overcharged = false, prepared = false): boolean {
  if (e.type === "boss" && w.stormbreaker!.clock > 13 && w.stormbreaker!.clock < 17) return false;
  const c = reserve(w, e, "dash", warning + .95, true, prepared); if (!c) return false;
  overcharged ||= e.stormbreaker!.enhanced; e.stormbreaker!.enhanced = false;
  const target = h.target(w, e) ?? point(e.x, e.y + 150);
  const dest = clampHitboxToGameplayRect(target.x, target.y, getEnemyHitbox(e), true);
  if (e.type === "boss") dest.y = Math.max(bossMinCenterY(e.radius), dest.y);
  const from = { x: e.x, y: e.y }, allegiance = h.allegiance(w, e);
  // Aim is committed before the visible warning. No invisible post-warning tracking.
  const line = hazard(w, e, h, c, from, 0, warning, 0, dest, e.radius * .65, .001, undefined, undefined, true, allegiance);
  if (!line) { w.stormbreaker!.director.casts = w.stormbreaker!.director.casts.filter(a => a.id !== c.id); return false; }
  const start = line.hitAt;
  e.stormbreaker!.dash = { cast: c.id, from, end: dest, start, duration: .42, progress: 0, damage: collision(e) * factor,
    allegiance, hits: new Map(), wake: overcharged, follow };
  e.stormbreaker!.bodyUntil = start + .7;
  c.until = Math.max(c.until, start + .9); return true;
}
function updateDash(w: CombatWorld, e: EnemyEntity, dt: number, h: StormbreakerHooks): boolean {
  const s = e.stormbreaker!, d = s.dash; if (!d) return false;
  if (locked(w, e) && w.elapsed < d.start) { s.dash = undefined; w.stormbreaker!.hazards = w.stormbreaker!.hazards.filter(a => a.cast !== d.cast); return false; }
  if (w.elapsed < d.start) return true;
  d.progress = Math.min(d.duration, d.progress + Math.min(dt, Math.max(0,w.elapsed-d.start)) * h.movement(w,e));
  const old = { x: e.x, y: e.y }, t = d.progress / d.duration;
  const lease = w.stormbreaker!.director.casts.find(c => c.id === d.cast);
  if (lease) lease.until = Math.max(lease.until,w.elapsed+.4);
  s.bodyUntil = Math.max(s.bodyUntil,w.elapsed+.3);
  e.x = d.from.x + (d.end.x - d.from.x) * t; e.y = d.from.y + (d.end.y - d.from.y) * t;
  e.airframeRotation = Math.atan2(d.end.y - d.from.y, d.end.x - d.from.x) + Math.PI / 2;
  h.area(w, d.damage, { allegiance: d.allegiance, sourceEnemyId: e.id, sourceEnemyType: e.type, delivery: "aircraft_collision" },
    { ...old, end: { x: e.x, y: e.y }, radius: e.radius * .65 }, d.hits, Infinity);
  if (w.ended) return true;
  if (t < 1) return true;
  const aim = Math.atan2(d.end.y - d.from.y, d.end.x - d.from.x);
  if (d.follow === "scission" || d.follow === "cross") {
    const factor = d.follow === "cross" ? .9 : .65;
    const hits = new Map<number,number>();
    for (const side of [-1, 1]) {
      const p=bullet(w, e, h, aim + side * .6, factor, "stormLancerBlade", 185, 4, d.allegiance, e, true);
      if(p && d.follow === "cross")p.stormbreakerGrace=hits;
    }
  }
  if (d.follow === "shock") {
    const c = w.stormbreaker!.director.casts.find(c => c.id === d.cast);
    if (c) hazard(w, e, h, c, e, e.type === "boss" ? .55 : .7, .8, 0, undefined, 34, .12, undefined, undefined, false, d.allegiance);
  }
  if (d.wake) {
    const c = w.stormbreaker!.director.casts.find(c => c.id === d.cast);
    if (c) { const a = hazard(w, e, h, c, d.from, .45, .95, 0, d.end, 5, .55, undefined, undefined, false, d.allegiance);
      if (a) { a.visual = "stormElectricWake"; a.warningAt=d.start-.95; a.hitAt=w.elapsed; a.until=w.elapsed+.55; a.grace=Infinity; } }
  }
  if(s.judgment){
    s.judgment.next=w.elapsed+.25;
    // The next pass has a new warning after the authored 0.25 s pause.
    if(lease)lease.until=w.elapsed+.25;
  }
  s.dash = undefined; return true;
}
function rails(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, double = false): boolean {
  const c = reserve(w, e, "rail", 1.55); if (!c) return false;
  double ||= e.stormbreaker!.enhanced; e.stormbreaker!.enhanced = false;
  const t = h.target(w, e) ?? point(e.x, RECT.bottom), allegiance = h.allegiance(w, e), hits = new Map<number, number>();
  for (let i = 0; i < (double ? 2 : 1); i++) {
    const from = { x: e.x + (double ? (i ? 24 : -24) : 0), y: e.y }, end = rayEnd(from, point(t.x + (double ? (i ? -22 : 22) : 0), t.y));
    const a = hazard(w, e, h, c, from, 0, double ? 1 : .9, i * .22, end, 4, .05, undefined, hits, true, allegiance);
    if (!a) continue; a.visual = "stormRailWarning";
    later(w, e, a.hitAt - w.elapsed, () => {
      const p = bullet(w, e, h, Math.atan2(end.y - from.y, end.x - from.x), 1.35, "stormIonRail", 680, 4, allegiance, from, true);
      if (p) p.stormbreakerGrace = hits;
    }, false);
  }
  return true;
}
function chain(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, pts: StormPoint[], factor: number, warning = .7, prepared = false): boolean {
  const c = reserve(w, e, "chain", warning + pts.length * .4, true, prepared); if (!c) return false;
  const interval = e.stormbreaker!.enhanced ? .32 : .4; e.stormbreaker!.enhanced = false;
  const hits = new Map<number, number>();
  for (let i = 0; i < pts.length - 1; i++) hazard(w, e, h, c, pts[i], factor, warning, i * interval, pts[i + 1], 6, .35, undefined, hits);
  return true;
}
function halo(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks): boolean {
  const c = reserve(w, e, "ring", 2.1); if (!c) return false;
  const allegiance = h.allegiance(w, e), aim = aimAt(w, e, h, allegiance);
  const count = e.stormbreaker!.enhanced ? 8 : 6; e.stormbreaker!.enhanced = false;
  for (let i = 0; i < count; i++) {
    const a = i * TAU / count, release = 1 + i * .12, releaseAngle=a+release*1.6;
    const origin = { x: e.x + Math.cos(releaseAngle) * 32, y: e.y + Math.sin(releaseAngle) * 32 };
    if(w.stormbreaker!.visuals.length<110)w.stormbreaker!.visuals.push({id:w.nextId++,key:"stormHaloBlade",x:origin.x,y:origin.y,size:26,at:w.elapsed,duration:release,rotation:a,
      orbit:{x:e.x,y:e.y,angle:a,radius:32,releaseAt:w.elapsed+release}});
    later(w, e, 1 + i * .12, () => bullet(w, e, h, aim + (i - (count - 1) / 2) * .16, .65, "stormHaloBlade", 170, 4, allegiance, origin, true), false);
  }
  return true;
}
function seraphSplit(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks): boolean {
  const c = reserve(w, e, "ring", 1.4); if (!c) return false;
  const count = e.stormbreaker!.enhanced ? 8 : 6; e.stormbreaker!.enhanced = false;
  const target=h.target(w,e)??point(e.x,e.y+180);
  const p = bullet(w, e, h, aimAt(w, e, h), .3, "stormSeraphOrb", Math.hypot(target.x-e.x,target.y-e.y)/1.8, 7);
  if (p) p.stormbreakerSplit = { at: w.elapsed + .9, count, factor: .55 / .3, radial: true };
  return true;
}
function sermon(w: CombatWorld, e: EnemyEntity): boolean {
  if (!reserve(w, e, "channel", 2.1)) return false;
  e.stormbreaker!.channelUntil = w.elapsed + 2; e.stormbreaker!.channelKind = "sermon";
  stormFx(w, "stormChargeCoil", e.x, e.y, e.radius * 3, 2); return true;
}
function relay(w: CombatWorld, e: EnemyEntity): boolean {
  const s = e.stormbreaker!, target = s.links.map(id => live(w, id)).find(Boolean);
  if (!target || !reserve(w, e, "channel", 1.2)) return false;
  const prime = e.type === "storm_weaver_prime", duration = prime ? 1.1 : .6;
  s.channelUntil = w.elapsed + duration; s.channelKind = "relay";
  const extra = s.enhanced ? 1 : 0; s.enhanced = false;
  later(w, e, duration, () => {
    if (!live(w, target.id)) return;
    const state = target.stormbreaker!, cap = target.type === "capacitor_prime" ? 8 : 5;
    state.charge = prime ? cap : Math.min(cap, state.charge + 1 + extra);
    if (prime) { state.enhanced = true; state.nextMajor = Math.min(state.nextMajor, w.elapsed + .3); }
  }, false);
  return true;
}
function cloud(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks): boolean {
  const s = w.stormbreaker!, cap = w.waveIndex >= 5 ? 6 : w.waveIndex >= 3 ? 4 : 2;
  if (s.clouds.length >= cap || !reserve(w, e, "nodes", .9)) return false;
  const points = predict(w, e, h, e.stormbreaker!.enhanced ? 2 : 1);
  e.stormbreaker!.enhanced = false;
  for (const t of points) if (s.clouds.length < cap)
    s.clouds.push({ ...t, id: w.nextId++, owner: e.id, until: w.elapsed + 6, damage: damage(e), allegiance: h.allegiance(w, e), ready: false });
  return true;
}
export function onStormEnemyDamage(w: CombatWorld, e: EnemyEntity, hpDamage: number, shieldBefore: number) {
  const s = e.stormbreaker; if (!s || hpDamage <= 0 && shieldBefore <= 0) return;
  s.lastHp=e.hp; s.lastShield=e.shield;
  if (e.type === "storm_capacitor" || e.type === "capacitor_prime") {
    const threshold = e.maxHp * (e.type === "capacitor_prime" ? .06 : .08), cap = e.type === "capacitor_prime" ? 8 : 5;
    const generation = chargeMultiplier(w, e);
    s.chargeRemainder += hpDamage * generation / threshold;
    const gained = Math.floor(s.chargeRemainder); s.chargeRemainder -= gained; s.charge = Math.min(cap, s.charge + gained);
    s.burst.push({ at: w.elapsed, hp: hpDamage }); s.burst = s.burst.filter(b => b.at >= w.elapsed - .65).slice(-40);
  }
  if (e.type === "thunder_bastion" && s.shieldArmed && shieldBefore > 0 && e.shield <= 0) {
    s.shieldArmed = false; s.breakUntil = w.elapsed + 3; stormFx(w, "stormNodeBreak", e.x, e.y, 100, .6);
    w.latestMessage="CONDUCTOR BREAK";w.messageUntil=w.elapsed+1.2;
  }
  if (w.elapsed >= s.hitAt) { stormFx(w, "stormRailImpact", e.x, e.y, e.radius * 1.3, .18); s.hitAt = w.elapsed + .12; }
}
export const stormDamageTakenMultiplier = (w: CombatWorld, e: EnemyEntity) => (e.stormbreaker?.breakUntil ?? 0) > w.elapsed ? 1.15 : 1;
function chargeMultiplier(w: CombatWorld, e: EnemyEntity) {
  const supporters = w.enemies.filter(a => a.hp > 0 && !locked(w, a) && a.stormbreaker?.links.includes(e.id));
  const link = supporters.some(a => a.type === "storm_weaver_prime") ? .35 : supporters.length ? .25 : 0;
  const sermonActive = w.enemies.some(a => a.hp > 0 && a.type === "storm_herald" && !locked(w, a) && a.stormbreaker!.channelUntil > w.elapsed && ((a.hackedUntil??0)>w.elapsed) === ((e.hackedUntil??0)>w.elapsed));
  return 1 + Math.max(link, sermonActive ? .4 : 0);
}
function updateLinks(w: CombatWorld, h: StormbreakerHooks) {
  for (const e of w.enemies) {
    const s = e.stormbreaker; if (!s) continue;
    if (e.hp <= 0 || locked(w, e)) { s.links = []; s.relay = undefined; s.channelUntil = 0; continue; }
    if (e.type !== "storm_weaver" && e.type !== "storm_weaver_prime") continue;
    const prime = e.type === "storm_weaver_prime", allegiance = h.allegiance(w, e);
    s.links = w.enemies.filter(a => a.id !== e.id && a.hp > 0 && !isStormObjective(a.type) && a.type !== "boss"
      && (!prime || isElite(a.type)) && a.type !== "storm_weaver" && a.type !== "storm_weaver_prime" && h.allegiance(w, a) === allegiance)
      .sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y) || a.id - b.id).slice(0, prime ? 3 : 2).map(a => a.id);
    if (w.stormbreaker!.phase === "CHARGING" && !s.relay) { s.relay = s.links[0]; s.relayUntil = w.stormbreaker!.cycle; }
  }
}
export function stormEnemyDestroyed(w: CombatWorld, e: EnemyEntity) {
  const s = w.stormbreaker; if (!s) return;
  // Death bursts are consumed by the renderer from the shared bounded visual-event queue.
  if (e.type === "storm_node" || e.type === "omega_storm_node") {
    const cycle = s.clock >= 17 ? s.cycle + 1 : s.cycle;
    if (s.fields.length < 4) s.fields.push({ x: e.x, y: e.y, radius: 36, cycle, until: w.elapsed + (cycle - s.cycle) * 20 + 18.5 - s.clock });
    stormFx(w, "stormNodeBreak", e.x, e.y, 90, .55);
  }
  if (e.type === "storm_weaver_prime") for (const id of e.stormbreaker?.links ?? []) {
    const ally = live(w, id); if (ally?.stormbreaker) ally.stormbreaker.nextMajor = Math.max(ally.stormbreaker.nextMajor, w.elapsed + 2);
  }
  for (const a of w.enemies) if (a.stormbreaker) {
    a.stormbreaker.links = a.stormbreaker.links.filter(id => id !== e.id);
    if (a.stormbreaker.relay === e.id) a.stormbreaker.relay = undefined;
  }
  s.nodes = s.nodes.filter(id => id !== e.id); s.conductors = s.conductors.filter(id => id !== e.id);
}

function heavyDischarge(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, prepared = false): boolean {
  if (e.shield <= 0 || !e.stormbreaker!.shieldArmed) return false;
  const c = reserve(w, e, "chain", 2.1, true, prepared); if (!c) return false;
  const hits = new Map<number, number>();
  for (let i = 0; i < 6; i++) {
    const angle = -.8 + i * (TAU - .8) / 6;
    hazard(w, e, h, c, e, .65, .9, i * .18, point(e.x + Math.cos(angle) * 110, e.y + Math.sin(angle) * 110), 5, .2, undefined, hits);
  }
  e.shield = 0; e.stormbreaker!.shieldArmed = false; return true;
}
function dischargeEnemy(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks): boolean {
  const s = e.stormbreaker!; if (locked(w, e)) return false;
  if (e.type === "spark_wasp" && s.charge >= 1) {
    const allegiance = h.allegiance(w, e), delay = .18 * (s.slot % 6);
    const count=s.enhanced?9:7;s.enhanced=false;
    later(w, e, delay, () => { for (let i = 0; i < count; i++) bullet(w, e, h, i * TAU / count + .2, .30, "stormSparkNeedle", 105, 3, allegiance); }, false);
    s.charge = 0; return true;
  } else if ((e.type === "storm_capacitor" || e.type === "capacitor_prime") && s.charge >= 3) {
    const count = Math.floor(s.charge);
    if (!markers(w, e, h, count, .65, .95, true)) return false;
    s.charge = 0; return true;
  } else if (e.type === "volt_lancer") return dash(w, e, h, 1.40, .95, "scission", true, true);
  else if (e.type === "thunder_bastion" && e.shield > 0 && s.shieldArmed) return heavyDischarge(w, e, h, true);
  return true;
}
function prepareDischarge(w: CombatWorld, h: StormbreakerHooks) {
  const s = w.stormbreaker!, source = w.enemies.find(e => e.hp > 0 && !isStormObjective(e.type));
  if (!source) return;
  // The environment has its own lease and fixed 20 s clock. It never masquerades as bullets.
  const c: StormCast = { id: w.nextId++, owner: source.id, tag: "markers", primary: false, hard: false, until: w.elapsed + 3 };
  const corridor = s.director.casts.find(c => c.tag === "corridor" && c.until > w.elapsed);
  const delay = corridor ? Math.max(0, corridor.until - w.elapsed) : 0;
  s.director.casts.push(c);
  const pts = predict(w, source, h, w.waveIndex === 0 ? 1 : 2);
  pts.forEach((p, i) => hazard(w, source, h, c, p, .8, 1, delay + i * .22, undefined, 18, .12, s.cycle, undefined, false, "hostile"));
  for (const id of s.nodes) {
    const node = live(w, id); if (!node) continue;
    // The strike remains conditional on the node surviving until its discharge slot.
    const a = hazard(w, source, h, c, point(node.x, w.playerY - 25), node.type === "omega_storm_node" ? 1.4 : .8, 1, delay + .45, undefined, 18, .12, s.cycle, undefined, false, "hostile");
    if (a) { a.sourceEnemyId = node.id; a.sourceEnemyType = node.type; a.conditionalOwner = node.id; }
  }
  for (const cloud of s.clouds) {
    if (cloud.until < w.elapsed + 1) continue;
    const a = hazard(w, source, h, c, cloud, 1, 1, delay + .35, undefined, 23, .12, undefined, undefined, false, cloud.allegiance);
    if (a) { a.damage = cloud.damage * 1.15; a.sourceEnemyId = cloud.owner; a.sourceEnemyType = "thunderhead"; a.visual = "stormCloudDischarge"; cloud.ready = true; }
  }
  // Conductors remain optional priorities. Distinct patterns, same bounded strike queue.
  const boss = w.enemies.find(e => e.type === "boss" && e.hp > 0);
  if (boss) for (const id of s.conductors) {
    const conductor = live(w, id); if (!conductor) continue;
    const slot = conductor.stormbreaker!.slot;
    if (slot === 0) {
      for (let i = 0; i < 3; i++) {
        const angle = -.8 + i * 2.2;
        const a = hazard(w, boss, h, c, point(conductor.x + Math.cos(angle) * 65, conductor.y + Math.sin(angle) * 65), .65, 1, delay + .7 + i * .18, undefined, 16, .12, s.cycle);
        if (a) a.conditionalOwner = id;
      }
    } else if (slot === 1) predict(w, boss, h, 3).forEach((p, i) => {
      const a = hazard(w, boss, h, c, p, .65, 1, delay + .9 + i * .18, undefined, 16, .12, s.cycle);
      if (a) a.conditionalOwner = id;
    });
    else {
      // Short crossing arc in the upper arena; never a full-screen wall.
      const a = hazard(w, boss, h, c, point(conductor.x - 75, conductor.y - 35), .65, 1, delay + 1.1, point(conductor.x + 30, conductor.y + 55), 5, .25, s.cycle);
      if (a) a.conditionalOwner = id;
    }
  }
}

type EliteSkill = "genesis" | "sermon" | "call" | "judgment" | "cross" | "sentence" | "ram" | "halo" | "chain" | "heavy" | "rail" | "relay" | "split" | "cutoff";
function eliteSkill(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, skill: EliteSkill): boolean {
  switch (skill) {
    case "genesis": return genesis(w, e, h);
    case "sermon": return sermon(w, e);
    case "call": return markers(w, e, h, 3, 1, .9);
    case "sentence": return markers(w, e, h, 5, .75, .9, false, undefined, true);
    case "cutoff": return markers(w, e, h, 2, .75, .9);
    case "rail": return rails(w, e, h, true);
    case "ram": return dash(w, e, h, 1.20, .9, "shock");
    case "halo": return halo(w, e, h);
    case "split": return seraphSplit(w, e, h);
    case "relay": return relay(w, e);
    case "heavy": return heavyDischarge(w, e, h);
    case "chain": return chain(w, e, h, [{ x: e.x, y: e.y }, point(RECT.left + 55, RECT.top + 230), point(RECT.right - 65, RECT.top + 300), point(RECT.left + 110, RECT.top + 360)], .85, .7);
    case "cross": {
      const c = reserve(w, e, "chain", 1.45); if (!c) return false;
      const t = h.target(w, e) ?? e, hits = new Map<number, number>();
      for (const side of [-1, 1]) hazard(w, e, h, c, point(t.x - 55, t.y - side * 55), .9, .85, side < 0 ? 0 : .18, point(t.x + 55, t.y + side * 55), 6, .16, undefined, hits);
      return true;
    }
    case "judgment": {
      if (!dash(w, e, h, .90, .8, "none")) return false;
      e.stormbreaker!.judgment={remaining:2,next:Infinity,allegiance:h.allegiance(w,e)};
      return true;
    }
  }
}
const COUNCIL: readonly (readonly [EnemyType, EliteSkill, number])[][] = [
  [["storm_herald", "genesis", 0], ["volt_executioner", "judgment", .4]],
  [["storm_herald", "sermon", 0], ["volt_executioner", "cross", .4]],
  [["storm_herald", "call", 0], ["volt_executioner", "judgment", .4]],
];
const EYE: readonly (readonly [EnemyType, EliteSkill, number])[][] = [
  [["ion_arbiter", "sentence", 0], ["thunder_bastion", "ram", .25], ["arc_seraph", "halo", .55], ["storm_weaver_prime", "relay", .8]],
  [["arc_seraph", "chain", 0], ["thunder_bastion", "heavy", 2.4], ["ion_arbiter", "rail", 4.6]],
  [["thunder_bastion", "ram", 0], ["arc_seraph", "split", .3], ["ion_arbiter", "cutoff", .6], ["storm_weaver_prime", "relay", .85]],
];
function updateEliteDirector(w: CombatWorld, h: StormbreakerHooks) {
  const s = w.stormbreaker!, wave = w.stage.waves[w.waveIndex]; if (!wave.elite || s.elite.next > w.elapsed || s.clock >= 17) return;
  const combos = wave.elite === 1 ? COUNCIL : EYE, combo = combos[s.elite.ordinal++ % combos.length];
  for (const [type, skill, delay] of combo) {
    const e = w.enemies.find(e => e.type === type && e.hp > 0); if (!e) continue;
    later(w, e, delay, () => { if (w.elapsed >= e.stormbreaker!.nextMajor) {
      if (eliteSkill(w, e, h, skill)) e.stormbreaker!.nextMajor = w.elapsed + (type === "storm_weaver_prime" ? 8 : 2);
    } }, false);
  }
  const grand = w.enemies.some(e=>e.hp>0&&e.type==="storm_weaver_prime"&&!locked(w,e)&&e.stormbreaker!.links.length>0);
  s.elite.next = w.elapsed + (wave.elite === 1 ? 6.2 : 7.2) * (grand?.8:1);
}

function barrage(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, secondary = false): boolean {
  const c = reserve(w, e, "ring", 2.2, !secondary); if (!c) return false;
  const allegiance = h.allegiance(w, e), aim = aimAt(w, e, h), n = w.stormbreaker!.boss!.phase === 4 ? 4 : 3;
  for (let i = 0; i < n; i++) later(w, e, .35 + i * .38, () => fan(w, e, h, 7, .42, aim + (i - 1) * .13, "stormStaticBolt", allegiance), false);
  return true;
}
function thunderbrand(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, secondary = false): boolean {
  const warning = w.stormbreaker!.boss!.phase === 4 ? .95 : 1.1;
  const c = reserve(w, e, "markers", warning + 1.8, !secondary); if (!c) return false;
  const t = predict(w, e, h, 1)[0];
  const a = hazard(w, e, h, c, t, 1.4, warning, 0, undefined, 22); if (!a) return true;
  // Fork warnings BEGIN after the main strike. Their coordinates are already committed.
  for (const side of [-1, 1]) hazard(w, e, h, c, point(t.x + side * 52, t.y - 12), .7, .95, a.hitAt - w.elapsed + .18 + (side > 0 ? .2 : 0), undefined, 17);
  return true;
}
function spear(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks): boolean {
  const warning = w.stormbreaker!.boss!.phase === 4 ? 1.05 : 1.25;
  const c = reserve(w, e, "rail", warning + .4); if (!c) return false;
  const from = { x: e.x, y: e.y }, t = rayEnd(from, h.target(w, e) ?? point(e.x, RECT.bottom)), allegiance = h.allegiance(w, e);
  const a = hazard(w, e, h, c, from, 0, warning, 0, t, 7, .01, undefined, undefined, true); if (!a) return true;
  a.visual = "stormSpearCharge"; stormFx(w, "stormSpearCharge", e.x, e.y, 85, warning);
  later(w, e, a.hitAt - w.elapsed, () => bullet(w, e, h, Math.atan2(t.y - from.y, t.x - from.x), 1.75, "stormSpear", 740, 7, allegiance, from, true), false);
  return true;
}
function crown(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks, cascade = false): boolean {
  const conductors = w.stormbreaker!.conductors.map(id => live(w, id)).filter((a): a is EnemyEntity => !!a);
  if (!conductors.length || cascade && conductors.length < 2) return false;
  const c = reserve(w, e, "chain", 2.6); if (!c) return false;
  const hits = new Map<number, number>(), allegiance = h.allegiance(w, e);
  if (cascade) {
    const [a, b] = conductors;
    hazard(w, e, h, c, e, .9, 1, 0, a, 6, .3, undefined, hits);
    const last = hazard(w, e, h, c, a, .9, 1, .4, b, 6, .3, undefined, hits);
    if (last) later(w, e, last.until - w.elapsed, () => fan(w, e, h, 5, .55, aimAt(w, b, h, allegiance), "stormStaticBolt", allegiance, b), false);
  } else conductors.forEach((a, i) => hazard(w, e, h, c, e, .9, 1, i * .4, a, 6, .3, undefined, hits));
  return true;
}
function fractured(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks): boolean {
  const t = h.target(w, e) ?? point(e.x, RECT.bottom - 100);
  const pts = Array.from({ length: 6 }, (_, i) => { const a = Math.PI + i * Math.PI / 5; return point(t.x + Math.cos(a) * 94, t.y + Math.sin(a) * 65); });
  return markers(w, e, h, 6, .90, 1.05, false, [0, 2, 4, 1, 3, 5].map(i => pts[i]));
}
function guillotine(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks): boolean {
  const c = reserve(w, e, "corridor", 1.95); if (!c) return false;
  // A 36 px collision corridor is locked at warning time; no predictor may enter it.
  const centre = Math.max(RECT.left + 75, Math.min(RECT.right - 75, w.playerX)), gap = 36;
  const hits = new Map<number, number>();
  for (const [left, right] of [[RECT.left, centre - gap / 2], [centre + gap / 2, RECT.right]]) {
    const a = hazard(w, e, h, c, { x: (left + right) / 2, y: RECT.top }, 1.15, 1.15, 0,
      { x: (left + right) / 2, y: RECT.bottom }, (right - left) / 2, .7, undefined, hits);
    if (a) a.visual = "stormCrownCircuit";
  }
  return true;
}
function nodeStrike(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks): boolean {
  const nodes = w.stormbreaker!.nodes.map(id => live(w, id)).filter((n): n is EnemyEntity => !!n);
  if (!nodes.length) return false;
  const c = reserve(w, e, "markers", 1.6, false); if (!c) return false;
  const target = h.target(w, e) ?? point(e.x, RECT.bottom - 70);
  nodes.forEach((node, i) => {
    const strike = hazard(w, e, h, c, point(node.x, target.y - i * 25), 1.4, 1, i * .22);
    if (strike) { strike.conditionalOwner = node.id; strike.sourceEnemyId = node.id; strike.sourceEnemyType = node.type; }
  });
  return true;
}
function updateBoss(w: CombatWorld, e: EnemyEntity, h: StormbreakerHooks) {
  const s = w.stormbreaker!, b = s.boss!, ratio = e.hp / e.maxHp;
  const phase = ratio > .70 ? 1 : ratio > .35 ? 2 : ratio >= .15 ? 3 : 4;
  if (phase !== b.phase) { b.phase = phase; w.bossPhase = phase; stormFx(w, "stormPhaseTransition", e.x, e.y, 210, 1.3);
    h.message(w, ["", "STATIC DOMINION", "CONDUCTOR ARRAY", "BROKEN CYCLE", "PERMANENT OVERCHARGE"][phase], 2);
    b.partial = w.elapsed + (phase === 4 ? 5.25 : 6.5); }
  if (phase >= 2 && !b.arraySpawned) {
    b.arraySpawned = true; for (let i = 0; i < 3; i++) spawnObjective(w, e, h, "storm_conductor", i);
  }
  if (locked(w, e)) return;
  if (e.fireCooldown <= 0) { fan(w, e, h, phase === 1 ? 2 : 3, .24, aimAt(w, e, h), "stormSparkNeedle", undefined, e, .22); e.fireCooldown = phase === 4 ? .8 : 1.15; }
  if (phase >= 3 && b.partial <= w.elapsed) {
    const choice = b.partialOrdinal % 3;
    const success = choice === 0 ? markers(w, e, h, 3, .85, 1, false, undefined, false, false)
      : choice === 1 ? barrage(w, e, h, true) : nodeStrike(w, e, h);
    if (success) { b.partialOrdinal++; b.partial = w.elapsed + (phase === 4 ? 5.25 : 6.5); }
    else if (choice === 2 && !s.nodes.length) b.partialOrdinal++;
  }
  if (b.next > w.elapsed || s.director.casts.some(c => c.owner === e.id && c.primary && c.until > w.elapsed)) return;
  const choices = phase === 1 ? ["brand", "barrage", "node", "dive"]
    : phase === 2 ? ["spear", "crown", "brand", "cascade", "node", "barrage", "dive"]
    : ["fractured", "barrage", "guillotine", "spear", "node", "brand", "cascade"];
  const key = choices[b.ordinal % choices.length];
  const success = key === "brand" ? thunderbrand(w, e, h) : key === "barrage" ? barrage(w, e, h)
    : key === "node" ? genesis(w, e, h, true) : key === "dive" ? dash(w, e, h, 1.35, 1, "shock")
    : key === "spear" ? spear(w, e, h) : key === "crown" ? crown(w, e, h)
    : key === "cascade" ? crown(w, e, h, true) : key === "fractured" ? fractured(w, e, h) : guillotine(w, e, h);
  if (success) {
    b.ordinal++; const until = Math.max(w.elapsed, ...s.director.casts.filter(c => c.owner === e.id && c.primary).map(c => c.until));
    b.next = until + (phase === 4 ? .495 : .55);
    if (key === "fractured") {
      later(w, e, .3, () => barrage(w, e, h, true), false);
      later(w, e, .75, () => thunderbrand(w, e, h, true), false);
    }
  } else if ((key === "cascade" && s.conductors.length < 2) || (key === "crown" && !s.conductors.length)) { b.ordinal++; b.next = w.elapsed + .4; }
}

export function updateStormbreakerEnemy(w: CombatWorld, e: EnemyEntity, dt: number, h: StormbreakerHooks): boolean {
  if (!w.stormbreaker || !e.stormbreaker) return false;
  if (w.ended || e.hp <= 0) return true;
  const s = e.stormbreaker, world = w.stormbreaker;
  if(s.lastHp>e.hp || s.lastShield>0&&e.shield<=0&&s.shieldArmed)onStormEnemyDamage(w,e,Math.max(0,s.lastHp-e.hp),s.lastShield);
  s.lastHp=e.hp;s.lastShield=e.shield;
  if (updateDash(w, e, dt, h)) return true;
  if(s.judgment && w.elapsed>=s.judgment.next){
    const old=e.attackAllegiance;e.attackAllegiance=s.judgment.allegiance;
    const cast=dash(w,e,h,.90,.8,s.judgment.remaining===1?"cross":"none");
    e.attackAllegiance=old;
    if(cast){s.judgment.remaining--;s.judgment.next=Infinity;if(!s.judgment.remaining)s.judgment=undefined;return true;}
  }
  if (isStormObjective(e.type)) {
    if (e.type === "storm_conductor" && e.fireCooldown <= 0 && !locked(w, e)) {
      bullet(w, e, h, aimAt(w, e, h), 1, "stormConductorArc", 145, 4); e.fireCooldown = 3;
    }
    return true;
  }
  const bodyOwned = s.overloadPending || world.director.casts.some(c => c.owner === e.id && c.primary && c.until > w.elapsed && ["dash", "chain", "rail"].includes(c.tag));
  if (!bodyOwned) {
    const formationX=e.type==="thunder_bastion"?RECT.left+68:e.type==="arc_seraph"?RECT.right-68:undefined;
    const boss = e.type === "boss", target = point(formationX ?? RECT.left + RECT.width / 2 + Math.sin(e.age * .45 + s.slot * 1.3) * (boss ? 66 : 120),
      boss ? bossMinCenterY(e.radius) + 18 : RECT.top + 65 + (s.slot % 4) * 34, e.radius + 10);
    const dx = target.x - e.x, dy = target.y - e.y, distance = Math.hypot(dx, dy), t = Math.min(1, stageEnemyConfig(e.type, 3).speed * dt * h.movement(w,e) / Math.max(1, distance));
    e.x += dx * t; e.y += dy * t;
  }
  if (e.type === "boss") { updateBoss(w, e, h); return true; }
  if (locked(w, e)) return true;
  if (e.type !== "storm_capacitor" && e.type !== "capacitor_prime") s.charge = Math.min(5, s.charge + dt * (world.phase === "CHARGING" ? .55 : .14) * chargeMultiplier(w, e));
  if (e.type === "thunder_bastion" && w.elapsed >= s.shieldReady) {
    e.shield = e.maxHp * .12; e.shieldUntil = w.aircraft.coreState.time + 12; s.shieldArmed = true; s.shieldReady = w.elapsed + 12;
  }
  if (e.type === "capacitor_prime" && s.ventReady <= w.elapsed && s.burst.filter(b => b.at >= w.elapsed - .65).reduce((sum, b) => sum + b.hp, 0) > e.maxHp * .25) {
    const pts = Array.from({ length: 5 }, (_, i) => point(e.x + Math.cos(i * TAU / 5) * 48, e.y + Math.sin(i * TAU / 5) * 48));
    if (markers(w, e, h, 5, .75, 1, false, pts)) { s.ventReady = w.elapsed + 5; s.burst = []; }
  }
  if ((e.type === "capacitor_prime" && s.charge >= 8 || e.type === "storm_capacitor" && s.charge >= 5) && overload(w, e, h)) { s.attack++; s.nextMajor = w.elapsed + 2; }
  // Elite majors belong to the authored encounter director. Basic fire never stops globally.
  if (ELITES.includes(e.type)) {
    if (e.type === "volt_executioner" && e.hp < e.maxHp * .4 && s.nextMajor <= w.elapsed && s.attack % 3 === 0) {
      if (dash(w, e, h, .85, .8, "none")) { s.nextMajor = w.elapsed + 8; s.attack++; }
    }
    if (e.fireCooldown <= 0) { bullet(w, e, h, aimAt(w, e, h), .4); e.fireCooldown = 3; s.attack++; }
    return true;
  }
  const aim = aimAt(w, e, h), allegiance = h.allegiance(w, e);
  if (e.fireCooldown <= 0) {
    if (e.type === "spark_wasp") {
      if (e.wave >= 2 && s.attack % 2) fan(w, e, h, 5, .48, aim, "stormStaticBolt", allegiance);
      else {
        for (let i = 0; i < 3; i++) later(w, e, i * .16, () => {
          bullet(w, e, h, aim, i === 2 ? .70 : .55, "stormSparkNeedle", 165, 3, allegiance);
          if (i === 2) {
            const target = h.target(w, e, allegiance), previous = e.attackAllegiance;
            e.attackAllegiance = allegiance;
            if (target) markers(w, e, h, 1, 1.15, .95, false, [{ ...target }]);
            e.attackAllegiance = previous;
          }
        }, false);
      }
    } else if (e.type === "thunderhead") {
      const salvo = w.nextId++;
      for (let i = 0; i < 3; i++) {
        const orb = bullet(w, e, h, aim + (i - 1) * .22, .65, "stormThunderOrb", 155, 5, allegiance, e, true);
        if (orb) orb.stormbreakerSalvo = salvo;
      }
    }
    else bullet(w, e, h, aim, e.type === "storm_weaver" ? .45 : .5);
    e.fireCooldown = stageEnemyConfig(e.type, 3).fireInterval; s.attack++;
  }
  if (w.elapsed < s.nextMajor) return true;
  let cast = false;
  if (e.type === "spark_wasp" && world.phase === "CHARGING") {
    if (reserve(w, e, "ring", 1.4)) {
      const p = bullet(w, e, h, aim, .3, "stormForkSeed", 85, 5);
      if (p) p.stormbreakerSplit = { at: w.elapsed + .7, count: 3, factor: .45 / .3, radial: false };
      cast = true;
    }
  } else if (e.type === "volt_lancer") {
    cast = dash(w, e, h, 1.15, .8);
    if(cast){
      const partner=w.enemies.find(a=>a.id!==e.id&&a.type==="volt_lancer"&&a.hp>0&&a.stormbreaker!.nextMajor<=w.elapsed+.5&&h.allegiance(w,a)===allegiance);
      if(partner){partner.stormbreaker!.nextMajor=w.elapsed+5;later(w,partner,.22,()=>dash(w,partner,h,1.15,.8),false);}
    }
  }
  else if (e.type === "storm_weaver") cast = relay(w, e);
  else if (e.type === "thunderhead") {
    const clouds = world.clouds.filter(c => c.allegiance === allegiance && !c.ready).sort((a,b) => Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y));
    cast = clouds.length >= 2 && Math.hypot(clouds[0].x - clouds[1].x, clouds[0].y - clouds[1].y) < 160
      ? chain(w, e, h, clouds.slice(0, 3), .8) : cloud(w, e, h);
  } else if (e.type === "ion_hunter") cast = s.attack % 2 ? rails(w, e, h) : markers(w, e, h, e.wave >= 5 ? 4 : 3, .85);
  if (cast) {
    const haste = chargeMultiplier(w, e) > 1 ? .85 : 1;
    s.nextMajor = w.elapsed + (e.type === "storm_weaver" ? 7 : e.type === "thunderhead" ? 3 : 4.2) * haste;
    s.attack++;
  }
  return true;
}

export function updateStormbreakerProjectile(w: CombatWorld, p: ProjectileEntity, h: StormbreakerHooks) {
  const split = p.stormbreakerSplit;
  if (!split || !w.stormbreaker || w.elapsed < split.at) return;
  p.stormbreakerSplit = undefined;
  // Ownership and damage are captured from the travelling seed, not the current caster.
  for (let i = 0; i < split.count; i++) {
    const angle = split.radial ? i * TAU / split.count : Math.atan2(p.vy, p.vx) + (i - 1) * .4;
    h.projectile(w, { owner: p.owner, allegiance: p.allegiance, sourceEnemyId: p.sourceEnemyId, sourceEnemyType: p.sourceEnemyType,
      delivery: "direct_projectile", x: p.x, y: p.y, vx: Math.cos(angle) * 155, vy: Math.sin(angle) * 155,
      rawDamage: p.rawDamage * split.factor, radius: 3, lifetime: 4,
      stormbreakerVisual: split.radial ? "stormHaloBlade" : "stormForkShard", criticalAttack: p.criticalAttack });
  }
  stormFx(w, "stormIonSparks", p.x, p.y, 35, .3); p.lifetime = 0;
}
export function updateStormbreaker(w: CombatWorld, dt: number, h: StormbreakerHooks) {
  const s = w.stormbreaker; if (!s) return;
  if (w.ended) { resetStormbreaker(w); return; }
  if (w.waveState !== "combat") return;
  const oldClock = s.clock;
  s.clock += dt;
  if (s.clock >= 20) { s.clock %= 20; s.cycle++; }
  const phase = s.clock < 10 || s.clock >= 18.5 ? "STATIC" : s.clock < 15 ? "CHARGING" : s.clock < 17 ? "DISCHARGE" : "RECOVERY";
  if (phase !== s.phase) { s.phase = phase; h.message(w, phase, .8); }
  if (dt > 0) {
    const blend = Math.min(1, dt * 8), vx = (w.playerX - s.movement.x) / dt, vy = (w.playerY - s.movement.y) / dt;
    s.movement.vx += (Math.max(-260, Math.min(260, vx)) - s.movement.vx) * blend;
    s.movement.vy += (Math.max(-260, Math.min(260, vy)) - s.movement.vy) * blend;
    s.movement.x = w.playerX; s.movement.y = w.playerY;
  }
  s.nodes = s.nodes.filter(id => !!live(w, id)); s.conductors = s.conductors.filter(id => !!live(w, id));
  s.fields = s.fields.filter(f => f.until > w.elapsed);
  s.clouds = s.clouds.filter(c => c.until > w.elapsed && !(c.ready && s.clock >= 17));
  s.visuals = s.visuals.filter(v => v.at + v.duration > w.elapsed);
  s.director.casts = s.director.casts.filter(c => c.until > w.elapsed);
  updateLinks(w, h);
  for(const e of w.enemies)if(e.stormbreaker && locked(w,e)){
    const d=e.stormbreaker.dash;
    // Stun/skill lock interrupts channels and uncommitted body casts, never an emitted bolt.
    if(d){s.hazards=s.hazards.filter(a=>a.cast!==d.cast);s.director.casts=s.director.casts.filter(c=>c.id!==d.cast);e.stormbreaker.dash=undefined;}
    e.stormbreaker.judgment=undefined;e.stormbreaker.channelUntil=0;e.stormbreaker.overloadPending=false;
    s.events = s.events.filter(event => event.owner !== e.id || event.committed);
  }
  if (!s.boss && s.nodeCycle !== s.cycle && s.clock >= 9 && s.clock < 13) {
    const e = w.enemies.find(e => e.hp > 0 && !e.auxiliary);
    if (e && reserve(w, e, "nodes", 1, false)) {
      spawnObjective(w, e, h, "storm_node", 0);
      if (w.waveIndex >= 1) spawnObjective(w, e, h, "storm_node", 1);
      s.nodeCycle = s.cycle;
    }
  }
  if (s.clock >= 14 && s.clock < 17 && s.preparedCycle !== s.cycle) { prepareDischarge(w, h); s.preparedCycle = s.cycle; }
  if (oldClock < 15 && s.clock >= 15) {
    // Relay is granted only if its Weaver survives all the way to DISCHARGE.
    for (const e of w.enemies) if (e.hp > 0 && e.stormbreaker?.relay && !locked(w, e)) {
      const ally = live(w, e.stormbreaker.relay);
      if (ally?.stormbreaker && h.allegiance(w, ally) === h.allegiance(w, e)) ally.stormbreaker.enhanced = true;
      e.stormbreaker.relay = undefined;
    }
  }
  // Prepared mechanics wait for a free pressure slot within this discharge window.
  if (s.phase === "DISCHARGE") for (const e of w.enemies) {
    if (e.hp <= 0 || !e.stormbreaker || isStormObjective(e.type) || e.stormbreaker.dischargeCycle === s.cycle) continue;
    if (dischargeEnemy(w, e, h)) e.stormbreaker.dischargeCycle = s.cycle;
  }
  updateEliteDirector(w, h);
  // Detach due events before callbacks append followups; no unbounded historical journal.
  const due = s.events.filter(a => a.at <= w.elapsed).sort((a, b) => a.at - b.at);
  s.events = s.events.filter(a => a.at > w.elapsed);
  for (const event of due) {
    const e = live(w, event.owner);
    if (event.committed || e && !locked(w, e)) event.action();
    if (w.ended) break;
  }
  if(w.ended)return;
  for (const a of s.hazards) {
    if (a.hitAt > w.elapsed || a.until < w.elapsed - dt) continue;
    if (a.conditionalOwner && !live(w, a.conditionalOwner)) { a.until = 0; continue; }
    if (!a.resolved) {
      a.resolved = true;
      if (!a.decoy) {
        stormFx(w, a.visual, a.start.x, a.start.y, a.radius * 5, .25);
        stormFx(w, "stormShockRing", a.start.x, a.start.y, a.radius * 6, .4, 0, .04);
        stormFx(w, "stormResidualCorona", a.start.x, a.start.y, a.radius * 4, .5, 0, .1);
        stormFx(w, "stormIonSparks", a.start.x, a.start.y, a.radius * 3, .3);
      }
    }
    if (a.decoy || w.ended) continue;
    const insulated = a.environmental !== undefined && a.delivery === "area_hazard" && s.fields.some(f => f.cycle === a.environmental && Math.hypot(w.playerX - f.x, w.playerY - f.y) <= f.radius);
    h.area(w, a.damage, a, { ...a.start, end: a.end, radius: a.radius }, a.hits, a.grace, insulated);
  }
  s.hazards = s.hazards.filter(a => a.until > w.elapsed);
}

import { bossMinCenterY } from "./airCombatHudLayout";
import type { StatusPayload, DamageDelivery, Allegiance, AttackMetadata } from "./airCombatStatus";
import { AIR_COMBAT_WORLD, ENEMY_CONFIGS, stageEnemyConfig, GAMEPLAY_SAFE_RECT as RECT } from "./airCombatConfig";
import { circleVsAircraft, getEnemyHitbox, getPlayerHitbox, clampHitboxToGameplayRect, segmentVsAircraft, createHitResult, hitboxProjectionExtent } from "./airCombatHitboxes";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { EnemyType } from "./airCombatTypes";
import type { TacticalPainter } from "./airCombatTacticalVisuals";
import type { MagneticVfxKey } from "./airCombatStage2Art";

type TempestSkill = "barrage" | "laser" | "bombs" | "acid" | "fields" | "rift";
const TEMPEST_SKILLS: TempestSkill[] = ["barrage", "laser", "bombs", "acid", "fields", "rift"];
const SKILL_COOLDOWN: Record<TempestSkill, number> = { barrage:10, laser:7, bombs:12, acid:15, fields:8, rift:9 };
const SKILL_PHASE: Record<TempestSkill, number> = { barrage:1, laser:1, bombs:2, acid:2, fields:3, rift:3 };
const SKILL_NAME: Record<TempestSkill, string> = { barrage:"BÃO ĐẠN", laser:"TIA ÁNH SÁNG", bombs:"BOM KHÔNG GIAN", acid:"MƯA AXIT", fields:"VỤ NỔ TỪ TRƯỜNG", rift:"VẾT RÁCH KHÔNG GIAN" };
interface TempestScheduler {
  clock: number; phase: number; castPhase: number; active: TempestSkill | null; elapsed: number;
  acidEmissions?:number; nextEmission: number; readyAt: Record<TempestSkill, number>; lastUsedAt: Record<TempestSkill, number>;
  lastSkill: TempestSkill | null; recoveryUntil: number; positioning: boolean;
}
interface Beam { from: Point; end: Point; radius: number; active: boolean }
interface MagneticLane {
  allegiance:Allegiance;
  areaId?: number;
  owner: number; from: Point; end: Point; age: number; warning: number; duration: number;
  damage: number; width: number; wall?: -1 | 1; nextHit: number;
}
type EliteSkill = "assault" | "cyclone_blades" | "curtain" | "cross_prism" | "carpet" | "chase"
  | "shift" | "sweep" | "polarity" | "repulse" | "swarm" | "suppress" | "reversal" | "recall";
interface EliteSequence {
  allegiance:Allegiance;
  id: number;
  skill: EliteSkill; age: number; step: number; next: number; warning: number; aim: number;
  target: Point; origin: Point; pass: number; mode: "warning" | "dash" | "turnaround" | "fire";
}
interface EliteDirector { wave: number; nextAt: number; event: number; cycle: number }
const ELITE_TYPES: EnemyType[] = ["cyclone_ace", "prism_sovereign", "mine_warden", "grid_architect", "polarity_warden", "swarm_overlord", "arc_reaver_prime"];
const HARD_SKILLS: EliteSkill[] = ["assault","shift","sweep","polarity"];
const BLAST_RADIUS = 40;
const DASH_RADIUS = 13;
const AREA_SKILLS: EliteSkill[] = ["curtain","repulse","swarm","suppress","assault","cyclone_blades","cross_prism","carpet","chase","shift","sweep","polarity","reversal","recall"];
const TRIAD: [EnemyType, EliteSkill][] = [["mine_warden","carpet"],["prism_sovereign","curtain"],["cyclone_ace","assault"],["mine_warden","chase"],["prism_sovereign","cross_prism"],["cyclone_ace","cyclone_blades"]];
const EXECUTION: [EnemyType, EliteSkill][] = [["grid_architect","shift"],["arc_reaver_prime","reversal"],["polarity_warden","polarity"],["swarm_overlord","swarm"],["grid_architect","sweep"],["arc_reaver_prime","recall"],["polarity_warden","repulse"],["swarm_overlord","suppress"]];

type Point = { x: number; y: number };
export interface MagneticEnemyState {
  clock: number; attack: number; anchorX: number; anchorY: number; angle: number;
  clampWarned?: boolean; diveX?: number; diveY?: number; diveAt?: number;
  owner?: number; slot?: number; tether?: boolean; tetherAllegiance?:Allegiance;
  openerDelay?: number;
  hitFxAt?: number; tetherUntil?: number; tetherReadyAt?: number;
  release?: number; releaseClock?: number; releaseAllegiance?:Allegiance;
  elite?: EliteSequence; topology?: number; areaId?:number;
}
export interface MagneticProjectileState {
  kind: "disc" | "orb"; age: number; originX: number; originY: number;
  endX: number; endY: number; curve: number; outbound: number; turn: number; returnDuration: number;
  recalls?: number; splitElite?: boolean;
  phase: "outbound" | "turn" | "return"; baseAngle: number;
}
interface Mine extends Point { allegiance:Allegiance; id: number; areaId?: number; owner: number; sourceType: EnemyType; damage: number; age: number; warning: number; exploded: boolean; startY: number; targetY: number; fuse?: number; flight?: number; kind?: "bomb" | "field"; payload?: StatusPayload }
export interface MagneticWorldState {
  mines: Mine[];
  scheduler?: TempestScheduler;
  eliteDirector?: EliteDirector;
  rift?: { owner: number; x: number; y: number; age: number };
  beams?: Beam[];
  lanes?: MagneticLane[];
  corridor?: { x: number; half: number };
  trails?: {allegiance:Allegiance;owner:number;areaId:number;from:Point;end:Point;until:number;damage:number;hitAt:number}[];
  impact?: {at:number;strength:number};

  effects?: { id: number; key: MagneticVfxKey; x: number; y: number; size: number; at: number; duration: number; rotation: number }[];
  polarity?: { allegiance:Allegiance; owner: number; areaId: number; age: number; warning: number; duration: number };
  guardBroken?: boolean;
  playerMotion?: { x: number; y: number; vx: number; vy: number };
}
export interface MagneticHooks {
  spawn(world: CombatWorld, type: EnemyType, auxiliary?: boolean): EnemyEntity | null;
  projectile(world: CombatWorld, values: Partial<ProjectileEntity> & Pick<ProjectileEntity, "owner" | "x" | "y" | "vx" | "vy" | "rawDamage">): ProjectileEntity | null;
  hit(world: CombatWorld, damage: number, owner: number, sourceType?: EnemyType, delivery?: DamageDelivery, payload?: StatusPayload): void;
  hostile(world: CombatWorld, enemy: EnemyEntity): boolean;
  allegiance(world:CombatWorld,enemy:EnemyEntity):Allegiance;
  target(world:CombatWorld,enemy:EnemyEntity,allegiance?:Allegiance):Point|null;
  area(world:CombatWorld,raw:number,attack:AttackMetadata,shape:{x:number;y:number;radius:number;end?:Point}):void;
  message(world: CombatWorld, text: string, duration: number): void;
}
const TAU = Math.PI * 2;
const TEMPEST_HOME_Y = bossMinCenterY(43) + 8;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const point = (x: number, y: number, margin = 22): Point => ({ x: clamp(x, RECT.left + margin, RECT.right - margin), y: clamp(y, RECT.top + margin, RECT.bottom - margin) });
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
  w.magnetic!.impact = {at:w.elapsed, strength:Math.min(10,strength+magneticShake(w)*.35)};
  magneticFx(w, "weakpointFlash", x, y, 52, .12);
  magneticFx(w, "magneticBurst", x, y, 120, .25, 0, .03);
  magneticFx(w, "bossBurst", x, y, 150, .40, 0, .05);
  magneticFx(w, "mineShockwave", x, y, 180, .42, 0, .08);
  for (let i=0;i<8;i++) magneticFx(w, "electricImpact", x+Math.cos(i*TAU/8)*28, y+Math.sin(i*TAU/8)*28, 32, .26, i, .10+i*.035);
  magneticFx(w, "plasmaImpact", x, y, 145, .65, 0, .15);
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
  const m=w.magnetic,box=getPlayerHitbox(w);
  const radius=Math.max(hitboxProjectionExtent(box,1,0),hitboxProjectionExtent(box,0,1));
  if(m && [...(m.lanes??[]).filter(l=>l.age>=l.warning).map(l=>({a:l.from,b:l.end,r:l.width})),...(m.trails??[]).map(t=>({a:t.from,b:t.end,r:DASH_RADIUS})),...(m.beams??[]).filter(b=>b.active).map(b=>({a:b.from,b:b.end,r:b.radius}))].some(g=>{
    const dx=g.b.x-g.a.x,dy=g.b.y-g.a.y,l=Math.hypot(dx,dy)||1;
    const old=((w.playerX-g.a.x)*dy-(w.playerY-g.a.y)*dx)/l,next=((target.x-g.a.x)*dy-(target.y-g.a.y)*dx)/l;
    const along=((target.x-g.a.x)*dx+(target.y-g.a.y)*dy)/l;
    return along>=-radius-g.r&&along<=l+radius+g.r&&(old*next<=0 || Math.abs(next)<g.r+radius&&Math.abs(next)<Math.abs(old));
  }))return;
  w.playerX = target.x; w.playerY = Math.min(target.y, AIR_COMBAT_WORLD.height - AIR_COMBAT_WORLD.playerBottomClearance);
}
function bullet(w: CombatWorld, e: EnemyEntity, h: MagneticHooks, angle: number, speed = 110, factor = 1, radius = e.type === "boss" ? 6 : 4) {
  const visual: MagneticVfxKey = e.type === "boss" ? "crownBolt" : e.type === "satellite" ? "satelliteOrb"
    : e.type === "prism_manta" ? "prismOrb" : e.type === "arc_reaver" ? "arcBolt"
    : e.type === "micro_drone" ? "microSpark" : "needleBolt";
  const shot = h.projectile(w, { owner: "enemy", allegiance:e.magnetic?.elite?.allegiance??h.allegiance(w,e), sourceEnemyId: e.id, sourceEnemyType: e.type, x: e.x, y: e.y,
    magneticAreaId: e.magnetic?.elite && AREA_SKILLS.includes(e.magnetic.elite.skill) ? e.magnetic.elite.id : undefined,
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, rawDamage: damage(e) * factor * (e.magnetic?.elite ? 1.2 : 1),
    radius, criticalAttack: ELITE_TYPES.includes(e.type), lifetime: e.type === "boss" || e.type === "satellite" ? 4.8 : 6, color: "#67e8f9", magneticVisual: visual });
  if (shot) magneticFx(w, e.type === "boss" || e.type === "cyclone_ace" ? "eliteMuzzle" : "smallMuzzle", e.x, e.y, e.radius * 1.2, .14, angle + Math.PI);
  return shot;
}
function disc(w: CombatWorld, e: EnemyEntity, h: MagneticHooks, angle: number, curve = 36, fast = false) {
  const travel = Math.max(280, Math.hypot((h.target(w,e)?.x??e.x) - e.x, (h.target(w,e)?.y??e.y) - e.y) + 75);
  const end = point(e.x + Math.cos(angle) * travel, e.y + Math.sin(angle) * travel, 12);
  const p = bullet(w, e, h, angle, 0, 1, 8);
  if (p) {
    p.magneticVisual = "returningDisc"; p.lifetime = 8; p.color = "#67e8f9";
    p.magnetic = { kind: "disc", age: 0, originX: e.x, originY: e.y, endX: end.x, endY: end.y,
      recalls: e.wave >= 5 ? 1 : 0, curve, outbound: 1.7, turn: fast ? .55 : .75, returnDuration: 1.7, phase: "outbound", baseAngle: angle };
  }
  return p;
}
function seedMine(w: CombatWorld, e: EnemyEntity, at: Point, h:MagneticHooks, allegiance=h.allegiance(w,e)): boolean {
  const m = w.magnetic!, safe = { x: at.x, y: at.y };
  if (m.mines.length >= 12) return false;
  m.mines.push({ ...safe, id: w.nextId++, owner: e.id, allegiance, sourceType: e.type, age: 0, warning: 0, exploded: false, fuse:.65, flight:.8,
    startY: e.y, targetY: safe.y, damage: damage(e) });
  return true;
}
export function resetMagneticHazards(w: CombatWorld) {
  if (!w.magnetic) return;
  w.magnetic.mines = []; w.magnetic.lanes = []; w.magnetic.trails = [];
  w.magnetic.scheduler = undefined; w.magnetic.eliteDirector = undefined;
  w.magnetic.polarity = undefined; w.magnetic.corridor = undefined;
  w.magnetic.rift = undefined; w.magnetic.beams = []; w.magnetic.guardBroken = false;
}
export const guardianSlots = (w: CombatWorld, owner?: number) => Array.from({length:4}, (_,slot) =>
  w.enemies.some(e => e.type === "satellite" && e.hp > 0 && e.magnetic?.slot === slot && (owner === undefined || e.magnetic.owner === owner)));
export const guardianMultiplier = (w: CombatWorld, enemy: EnemyEntity) =>
  w.magnetic && enemy.type === "boss" && w.enemies.some(e=>e.type === "satellite" && e.hp > 0 && e.magnetic?.owner === enemy.id) ? .65 : 1;
export function guardianDestroyed(w: CombatWorld, e: EnemyEntity) {
  if (e.type !== "satellite" || w.magnetic?.guardBroken || guardianSlots(w, e.magnetic?.owner).some(Boolean)) return;
  const boss = w.enemies.find(n => n.id === e.magnetic?.owner && n.hp > 0);
  if (!boss) return;
  w.magnetic!.guardBroken = true;
  magneticImpact(w, boss.x, boss.y, 5);
  magneticFx(w, "shieldFlare", boss.x, boss.y, 220, .65);
  w.latestMessage = "MAGNETIC GUARD BROKEN"; w.messageUntil = w.elapsed + 2;
}
export function updateMagneticEnemy(w: CombatWorld, e: EnemyEntity, dt: number, h: MagneticHooks): boolean {
  if (!w.magnetic || e.type === "kamikaze") return false;
  const s = state(e); s.clock += dt;
  const hostile = h.hostile(w, e), locked = (e.skillLockedUntil ?? 0) > w.elapsed;
  s.openerDelay = Math.max(0, (s.openerDelay ?? 0) - dt);
  const canFire = (hostile || !!h.target(w,e) || !!s.elite) && !locked && !s.openerDelay;
  const aim = Math.atan2((h.target(w,e)?.y??e.y) - e.y, (h.target(w,e)?.x??e.x) - e.x);
  if (e.type === "boss") { updateTempest(w, e, dt, h); return true; }
  if (e.type === "satellite") { updateSatellite(w, e, dt, h); return true; }
  if (e.type === "micro_drone") {
    const ownerAlive = w.enemies.some(other => other.id === s.owner && other.hp > 0);
    s.diveAt ??= 2.8 + (s.slot ?? 0) * .32;
    if (!ownerAlive && s.diveX === undefined) s.diveAt = Math.min(s.diveAt, s.clock + .8);
    if (s.clock >= s.diveAt - .8 && s.diveX === undefined) {
      s.diveX = (h.target(w,e)?.x??e.x); s.diveY = (h.target(w,e)?.y??e.y);
    }
    if (s.clock < s.diveAt) {
      const angle = s.angle + s.clock * .65;
      drift(e, point(s.anchorX + Math.cos(angle) * 85, s.anchorY + Math.sin(angle) * 55), 95, dt);
    } else if (canFire) {
      if (s.attack === 0) { e.dashAllegiance=h.allegiance(w,e); s.angle = Math.atan2(s.diveY! - e.y, s.diveX! - e.x); s.attack = 1; }
      e.x += Math.cos(s.angle) * 230 * dt; e.y += Math.sin(s.angle) * 230 * dt;
    }
    if (s.clock > s.diveAt + 2.6) { e.hp = 0; e.deathHandled = true; }
    return true;
  }
  if (e.type === "orbit_wasp") {
    const cycle = s.clock % 7, direction = e.id % 2 ? 1 : -1;
    if (cycle < 2) { s.anchorX = (h.target(w,e)?.x??e.x); s.anchorY = (h.target(w,e)?.y??e.y) - 25; s.angle = direction > 0 ? Math.PI : 0; }
    else s.angle += dt * .65 * direction;
    drift(e, point(s.anchorX + Math.cos(s.angle) * 112, s.anchorY + Math.sin(s.angle) * 78), 76, dt);
    if (canFire && cycle > 2.5 && cycle < 5.8 && e.fireCooldown <= 0) {
      for (const offset of e.wave >= 3 ? [-.18, 0, .18] : [-.08, .08]) bullet(w, e, h, aim + offset, 125, .75);
      s.attack++; e.fireCooldown = s.attack % 3 ? .32 : 2.2;
    }
    return true;
  }
  if (ELITE_TYPES.includes(e.type)) { updateElite(w, e, dt, h, canFire); return true; }
  drift(e, point(180 + Math.sin(s.clock * .55 + e.phaseSeed) * (e.type === "mine_seeder" ? 118 : 90), e.type === "magnetic_leech" ? (h.target(w,e)?.y??e.y) - 145 : RECT.top + 75 + (e.id % 3) * 35), ENEMY_CONFIGS[e.type].speed, dt);
  if (e.type === "magnetic_leech") {
    const tetherTarget=h.target(w,e,s.tether?s.tetherAllegiance:undefined);
    const distance = Math.hypot(e.x - (tetherTarget?.x??e.x), e.y - (tetherTarget?.y??e.y));
    const canTether = canFire && s.clock > 1.3 && w.dashRemaining <= 0;
    if (s.tether && (!canTether || distance >= 245 || w.elapsed >= (s.tetherUntil ?? 0))) {
      s.tether = false; s.tetherReadyAt = w.elapsed + 2;
    }
    if (!s.tether && canTether && distance < 180 && w.elapsed >= (s.tetherReadyAt ?? 0)) {
      s.tether = true; s.tetherAllegiance=h.allegiance(w,e); s.tetherUntil = w.elapsed + 4; s.clampWarned = false;
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
    if (s.releaseClock <= 0) {
      const target=h.target(w,e,s.releaseAllegiance);
      if(target)seedMine(w,e,target,h,s.releaseAllegiance);
      s.release!--; s.releaseClock = .65;
    }
  }
  if (!canFire || e.fireCooldown > 0) return true;
  e.fireCooldown = ENEMY_CONFIGS[e.type].fireInterval;
  if (e.type === "arc_reaver") {
    disc(w, e, h, aim - .22, -52); disc(w, e, h, aim + .22, 52);
  }
  if (e.type === "mine_seeder") {
    seedMine(w, e, { x: (h.target(w,e)?.x??e.x), y: (h.target(w,e)?.y??e.y) },h);
    s.releaseAllegiance=h.allegiance(w,e);
    s.release = e.wave >= 5 ? 2 : e.wave >= 2 ? 1 : 0; s.releaseClock = .65;
  }
  if (e.type === "prism_manta") {
    const p = bullet(w, e, h, aim, 85, 1, 10);
    if (p) { p.color = "#c084fc"; p.magnetic = { kind: "orb", age: 0, originX: e.x, originY: e.y, endX: 0, endY: 0, curve: 0, outbound: 1.55, turn: .55, returnDuration: 0, phase: "outbound", baseAngle: aim }; }
  }
  if (e.type === "swarm_carrier") {
    const count = w.enemies.filter(e => e.type === "micro_drone" && e.hp > 0).length;
    const anchor = point((h.target(w,e)?.x??e.x), (h.target(w,e)?.y??e.y), 110);
    if (count < 12) magneticFx(w, "droneSpawn", e.x, e.y + 16, 38, .5);
    for (let i = 0; i < Math.min(4, 12 - count); i++) {
      const drone = h.spawn(w, "micro_drone", true);
      if (!drone) break;
      drone.inheritedAllegiance=h.allegiance(w,e);
      const angle = -Math.PI + i * Math.PI / 3; // Open lower half remains an escape route.
      drone.x = e.x + (i - 1) * 14; drone.y = e.y + 18;
      drone.magnetic = { clock: 0, attack: 0, anchorX: anchor.x, anchorY: anchor.y, angle, owner: e.id, slot: i };
    }
  }
  return true;
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
      for (const side of (m.splitElite || w.waveIndex >= 3 ? [-1, 0, 1] : [-1, 1])) {
        const angle = m.baseAngle + side * (m.splitElite ? Math.PI / 18 : Math.PI / 6);
        h.projectile(w, { owner: p.owner, allegiance: p.allegiance, sourceEnemyId: p.sourceEnemyId, sourceEnemyType: p.sourceEnemyType,
          magneticAreaId:p.magneticAreaId, criticalAttack:p.criticalAttack, x: p.x, y: p.y, vx: Math.cos(angle) * (m.splitElite ? 165 : 132), vy: Math.sin(angle) * (m.splitElite ? 165 : 132), rawDamage: p.rawDamage * (m.splitElite ? .45 : .75), radius: 4, color: "#e9d5ff", magneticVisual: "prismShard" });
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
      (e.skillLockedUntil ?? 0) > w.elapsed || w.dashRemaining > 0 || !h.target(w,e,e.magnetic.tetherAllegiance) ||
      Math.hypot(e.x - (h.target(w,e,e.magnetic.tetherAllegiance)?.x??e.x), e.y - (h.target(w,e,e.magnetic.tetherAllegiance)?.y??e.y)) >= 245 || w.elapsed >= (e.magnetic.tetherUntil ?? 0))) {
    e.magnetic.tether = false; e.magnetic.tetherReadyAt = w.elapsed + 2;
  }
  let forceX = 0, forceY = 0;
  for (const e of w.enemies) if (e.type === "magnetic_leech" && e.hp > 0 && e.stun <= 0 && e.magnetic?.tether) {
    const victim=h.target(w,e,e.magnetic.tetherAllegiance);if(!victim)continue;
    const dx = e.x - victim.x, dy = e.y - victim.y, distance = Math.max(1, Math.hypot(dx, dy));
    const strength = (e.magnetic.tetherUntil! - w.elapsed < 1.2 ? 38 : 18) + 8 * (1 - Math.min(1, distance / 245));
    if(e.magnetic.tetherAllegiance!=="friendly_hacked"){forceX += dx / distance * strength; forceY += dy / distance * strength;}else{victim.x+=dx/distance*strength*dt;victim.y+=dy/distance*strength*dt;}
  }
  const polarity = m.polarity;
  if (polarity) {
    polarity.age += dt;
    const owner = w.enemies.find(e => e.id === polarity.owner && e.hp>0);
    if (!owner || polarity.age >= polarity.warning + polarity.duration) m.polarity = undefined;
    else if (polarity.age >= polarity.warning && owner.stun <= 0 && (owner.skillLockedUntil ?? 0) <= w.elapsed) {
      const victim=polarity.allegiance==="hostile"?{x:w.playerX,y:w.playerY}:w.enemies.find(e=>h.hostile(w,e));
      const left = (victim?.x??180) < 180, reversed = polarity.age - polarity.warning >= 1.5;
      const sign = left !== reversed ? 1 : -1;
      const dx = 180 - (victim?.x??180), dy = RECT.top + RECT.height / 2 - (victim?.y??RECT.top+RECT.height/2), length = Math.max(1,Math.hypot(dx,dy));
      if(polarity.allegiance==="hostile"){forceX += dx / length * 24 * sign; forceY += dy / length * 24 * sign;}else if(victim){victim.x+=dx/length*24*sign*dt;victim.y+=dy/length*24*sign*dt;}
    }
  }
  const force = Math.hypot(forceX, forceY), limit = Math.min(1, 38 / Math.max(1, force));
  pushPlayer(w, forceX * limit * dt, forceY * limit * dt);
  updateEliteDirector(w, dt, h);
  updateGeometry(w, dt, h);
  const motion = m.playerMotion ??= {x:w.playerX,y:w.playerY,vx:0,vy:0};
  if (dt > 0) { motion.vx = (w.playerX-motion.x)/dt; motion.vy = (w.playerY-motion.y)/dt; motion.x=w.playerX; motion.y=w.playerY; }
  const player = getPlayerHitbox(w);
  for (let i = m.mines.length - 1; i >= 0; i--) {
    const mine = m.mines[i]; mine.age += dt;
    mine.y = mine.startY + (mine.targetY - mine.startY) * clamp(mine.age / Math.max(.001,mine.flight ?? .8), 0, 1);
    if (mine.warning >= 0) {
      mine.warning = Math.max(0, mine.age - (mine.flight ?? 0));
      if (mine.warning >= (mine.fuse ?? 1.6) && !mine.exploded) {
        mine.exploded = true;
        magneticImpact(w, mine.x, mine.y, mine.sourceType === "boss" ? (mine.kind==="field"?8.8:8) : 2.8*(mine.sourceType==="mine_seeder"?1.7:(mine.fuse??0)<.4?1.6:1.8));
        h.area(w,mine.damage,{allegiance:mine.allegiance,sourceEnemyId:mine.owner,sourceEnemyType:mine.sourceType,delivery:"explosive_aoe",payload:mine.payload},{x:mine.x,y:mine.y,radius:BLAST_RADIUS});
      }
      if (mine.warning > (mine.fuse ?? 1.6) + .45) m.mines.splice(i, 1);
    }
  }
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
      p.label?.(e.x, e.y - 17, `HP ${Math.ceil(e.hp / e.maxHp * 100)}%`, 0x67e8f9, 6);
    } else if (ELITE_TYPES.includes(e.type)) {
      p.label?.(e.x, e.y - e.radius * 1.5, ENEMY_CONFIGS[e.type].name.split(" · ")[0], 0xc4b5fd, 8);
    }
    if (s.tether && e.stun <= 0 && (e.skillLockedUntil ?? 0) <= now) {
      const player = s.tetherAllegiance==="friendly_hacked"?world.enemies.find(target=>target.id===e.hackedTargetId&&target.hp>0):{ x: world.playerX, y: world.playerY };
      if(!player)continue;
      link("magneticBeam", e, player, 6, .55);
      const t = reducedMotion ? .5 : now * .65 % 1;
      fx("tetherPulse", player.x + (e.x - player.x) * t, player.y + (e.y - player.y) * t, 8, 13, Math.atan2(e.y - player.y, e.x - player.x) + Math.PI / 2);
      fx("electricImpact", player.x, player.y, 15, 15, 0, .6);
      fx("tetherPulse", e.x, e.y, 15, 15, 0, .6);
    }
  }
  for (const q of world.projectiles) if (q.owner === "enemy" && q.magneticVisual) {
    const disc = q.magnetic?.kind === "disc", orb = q.magnetic?.kind === "orb";
    const phase = q.magnetic?.phase;
    const tint = q.allegiance === "friendly_hacked" ? 0x86efac : phase === "turn" ? 0xffe6a1 : phase === "return" ? 0xdfb8ff : 0xffffff;
    const heading = Math.atan2(q.vy, q.vx) + Math.PI / 2;
    const rotation = q.magneticVisual === "acidDrop" ? 0 : disc ? reducedMotion ? 0 : now * 8 : heading;
    fx(q.magneticVisual, q.x, q.y, q.radius * 2.4, q.radius * (disc || orb ? 2.4 : 3.4), rotation, 1, tint);
    if (disc && phase === "turn") {
      
      fx("warningPulse", q.x, q.y, 26, 26, 0, .6);
      p.label?.(q.x, q.y - 13, "RETURN", 0xffe6a1, 6);
    } else if (disc && !reducedMotion) {
      fx("returningDisc", q.x - q.vx * .045, q.y - q.vy * .045, q.radius * 1.75, q.radius * 1.75, rotation - .4, .18, tint);
    }
    if (orb && (q.magnetic?.age ?? 0) > .8) {
      fx("warningPulse", q.x, q.y, 28, 28, 0, .8);
      for (const side of [-1, 1]) {
        const a = q.magnetic!.baseAngle + side * (q.magnetic!.splitElite ? Math.PI / 18 : Math.PI / 6);
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
      // The canonical danger painter owns the final blast outline.
      fx("warningPulse", mine.x, mine.y, 24, 24, 0, .9, 0xffdf85);
      p.label?.(mine.x, mine.y - 14, `${Math.max(0, (mine.fuse ?? 1.6) - mine.warning).toFixed(1)}s`, 0xfde68a, 7);
    }
  }
  for(const enemy of world.enemies)if(enemy.hp>0&&enemy.type==="kamikaze"&&enemy.dashAllegiance!=="friendly_hacked"&&(enemy.kamikazeState==="charge"||enemy.kamikazeState==="dash")) {
    const heading=enemy.kamikazeState==="charge"?Math.atan2(enemy.dashEndY-enemy.y,enemy.dashEndX-enemy.x)+Math.PI/2:enemy.airframeRotation;
    const hull=getEnemyHitbox({...enemy,airframeRotation:heading}),dx=enemy.dashEndX-enemy.x,dy=enemy.dashEndY-enemy.y;
    for(const shape of hull.shapes){
      const a={x:shape.ax,y:shape.ay},b={x:shape.bx,y:shape.by},c={x:b.x+dx,y:b.y+dy},d={x:a.x+dx,y:a.y+dy};
      p.polygon?.([a.x,a.y,b.x,b.y,c.x,c.y,d.x,d.y],0xff3344,.12);
      for(const [from,to] of [[a,b],[b,c],[c,d],[d,a]])dangerCapsule(p,from,to,shape.r,enemy.kamikazeState==="dash");
    }
  }
  paintGeometry(world, p);
}

function createScheduler(): TempestScheduler {
  const values = (value:number) => Object.fromEntries(TEMPEST_SKILLS.map(key=>[key,value])) as Record<TempestSkill,number>;
  return { clock:0, phase:1, castPhase:1, active:null, elapsed:0, nextEmission:0,
    readyAt:values(0), lastUsedAt:values(-Infinity), lastSkill:null, recoveryUntil:.5, positioning:false };
}
export function initializeTempestGuardians(w:CombatWorld,boss:EnemyEntity,h:MagneticHooks) {
  const s=state(boss);
  if (!s.attack) {
    // Spawn once. The shared enemy collection owns death and on-kill dispatch.
    for(let slot=0;slot<4;slot++) {
      const guardian=h.spawn(w,"satellite",true); if(!guardian) continue;
      guardian.damageScale=boss.damageScale; guardian.fireCooldown=slot*.3;
      guardian.magnetic={clock:0,attack:0,anchorX:boss.x,anchorY:boss.y,angle:slot*TAU/4,slot,owner:boss.id};
      guardian.x=boss.x+Math.cos(slot*TAU/4)*82;guardian.y=boss.y+Math.sin(slot*TAU/4)*82;
      magneticFx(w,"droneSpawn",guardian.x,guardian.y,34,.5);
    }
    s.attack=1;
  }
}
function updateTempest(w:CombatWorld, boss:EnemyEntity, dt:number, h:MagneticHooks) {
  const m=w.magnetic!, s=state(boss), d=m.scheduler??=createScheduler();
  initializeTempestGuardians(w,boss,h);
  if(!h.hostile(w,boss)||(boss.skillLockedUntil??0)>w.elapsed)return;
  d.clock+=dt;
  if(d.phase!==w.bossPhase) {
    for(const skill of TEMPEST_SKILLS) if(SKILL_PHASE[skill]>d.phase && SKILL_PHASE[skill]<=w.bossPhase)
      d.readyAt[skill]=Math.max(d.readyAt[skill],d.clock+.5);
    d.phase=w.bossPhase;
  }
  if(d.active!=="laser") drift(boss,{x:180+Math.sin(s.clock*.3)*36,y:TEMPEST_HOME_Y},25,dt);
  if(!d.active) {
    if(d.clock<d.recoveryUntil)return;
    let ready=TEMPEST_SKILLS.filter(key=>SKILL_PHASE[key]<=d.phase&&d.readyAt[key]<=d.clock);
    if(ready.some(key=>key!==d.lastSkill))ready=ready.filter(key=>key!==d.lastSkill);
    ready.sort((a,b)=>d.lastUsedAt[a]-d.lastUsedAt[b]);
    if(!ready.length)return;
    d.active=ready[0];d.castPhase=d.phase;d.elapsed=0;d.acidEmissions=0;d.nextEmission=d.active==="fields"?.55:0;
    d.positioning=d.active==="laser";
    if(d.active==="rift")m.rift={owner:boss.id,x:w.playerX,y:w.playerY,age:0};
    h.message(w,SKILL_NAME[d.active],1.4);
  }
  const skill=d.active, phase=d.castPhase;
  if(d.positioning) {
    drift(boss,{x:180,y:TEMPEST_HOME_Y},110,dt);
    if(Math.hypot(boss.x-180,boss.y-TEMPEST_HOME_Y)>.5)return;
    boss.x=180;boss.y=TEMPEST_HOME_Y;d.positioning=false;d.elapsed=0;d.acidEmissions=0;
  }
  d.elapsed+=dt;
  let duration=skill==="barrage"?4+phase:skill==="acid"?5:skill==="rift"?3:5;
  if(skill==="laser") {
    const sweep=phase>=3?1.5:2;
    duration=.75+1+sweep+(phase>=2?sweep:0);
    const t=Math.max(0,d.elapsed-.75), outward=clamp((t-1)/sweep,0,1);
    const angle=(t>1+sweep?1-clamp((t-1-sweep)/sweep,0,1):outward)*75*Math.PI/180;
    m.beams=[-1,1].map(side=>{
      const from={x:boss.x+side*11,y:boss.y+boss.radius*.8};
      const a=Math.PI/2-side*angle;
      return {from,end:{x:from.x+Math.cos(a)*850,y:from.y+Math.sin(a)*850},radius:6,active:d.elapsed>=.75};
    });
    if(d.elapsed>=.75 && d.elapsed<duration && d.elapsed>=d.nextEmission) {
      d.nextEmission=d.nextEmission<.75?.75+.2:d.nextEmission+.2;
      for(const beam of m.beams)h.area(w,94.08*boss.damageScale,{allegiance:"hostile",sourceEnemyId:boss.id,sourceEnemyType:"boss",delivery:"beam",majorBossAttack:true},{x:beam.from.x,y:beam.from.y,end:beam.end,radius:beam.radius});
    }
  } else if(skill==="rift") {
    if(m.rift)m.rift.age=d.elapsed;
    if(d.elapsed>=3 && m.rift) {
      const rift=m.rift;
      for(let slot=0;slot<7;slot++) {
        const drone=h.spawn(w,"kamikaze",true);if(!drone)break;
        const at=point(rift.x+Math.cos(slot*TAU/7)*26,rift.y+Math.sin(slot*TAU/7)*26,30);
        drone.x=at.x;drone.y=at.y;drone.baseX=at.x;
        drone.hp=drone.maxHp=171.6;drone.armor=3.9;drone.damageScale=1;drone.wave=1;
        drone.riftAttackReadyAt=w.elapsed+slot*.5;
        drone.riftWait={spawnedAt:w.elapsed,x:at.x,y:at.y,phase:slot*TAU/7};
        drone.kamikazeState="approach";drone.stateTimer=0;drone.magnetic=undefined;drone.noWaveWait=true;
      }
      magneticFx(w,"magneticBurst",rift.x,rift.y,110,.6);m.rift=undefined;
    }
  } else if(d.elapsed>=d.nextEmission && d.nextEmission<duration-1e-8) {
    // At most one emission per simulation step; no catch-up bursts after a pause/CC.
    const aim=Math.atan2(w.playerY-boss.y,w.playerX-boss.x);
    if(skill==="barrage") {
      fan(w,boss,h,15,10,125.44,155,aim,6);d.nextEmission+=.6;
    } else if(skill==="bombs") {
      const motion=m.playerMotion;
      let dx=phase>=3?(motion?.vx??0)*.45:0,dy=phase>=3?(motion?.vy??0)*.45:0;
      const scale=Math.min(1,60/Math.max(1,Math.hypot(dx,dy)));dx*=scale;dy*=scale;
      addMine(w,boss,h,point(w.playerX+dx,w.playerY+dy,10),.1,125.44,.6);
      d.nextEmission+=phase>=3?.2:.3;
    } else if(skill==="acid" && (d.acidEmissions??0)<20) {
      h.projectile(w,{owner:"enemy",sourceEnemyId:boss.id,sourceEnemyType:"boss",x:RECT.left+10+w.random()*(RECT.width-20),y:RECT.top,
        vx:0,vy:390,radius:6,rawDamage:(phase>=3?118.5408:87.808)*boss.damageScale,color:"#b4ff4b",magneticVisual:"acidDrop",lifetime:3,
        payload:{healingReduction:4,healingReceivedMultiplier:phase>=3?0:.4}});
      d.acidEmissions=(d.acidEmissions??0)+1;d.nextEmission=d.acidEmissions*.25;
    } else if(skill==="fields") {
      addMine(w,boss,h,{x:w.playerX,y:w.playerY},.3,125.44,0,{stun:2},"field");d.nextEmission+=.55;
    }
  }
  if(d.elapsed>=duration) {
    d.readyAt[skill]=d.clock+SKILL_COOLDOWN[skill];d.lastUsedAt[skill]=d.clock;d.lastSkill=skill;
    d.active=null;d.recoveryUntil=d.clock+.35;m.beams=[];
  }
}
export function positionMagneticGuardian(w:CombatWorld,e:EnemyEntity) {
  const boss=w.enemies.find(n=>n.id===e.magnetic?.owner&&n.hp>0);if(!boss)return;
  const angle=(e.magnetic?.slot??0)*TAU/4+(w.elapsed-(w.bossStartedAt??w.elapsed))*.55;
  e.x=boss.x+Math.cos(angle)*82;e.y=boss.y+Math.sin(angle)*82;
}
function updateSatellite(w:CombatWorld,e:EnemyEntity,dt:number,h:MagneticHooks) {
  const s=state(e),boss=w.enemies.find(n=>n.id===s.owner&&n.hp>0);
  if(!boss){e.hp=0;e.deathHandled=true;return;}
  // Global orbit clock preserves all four 90-degree slots even through individual CC.
  positionMagneticGuardian(w,e);
  if(!h.hostile(w,e)||(e.skillLockedUntil??0)>w.elapsed||e.fireCooldown>0)return;
  bullet(w,e,h,Math.atan2(w.playerY-e.y,w.playerX-e.x),155,1,4);
  e.fireCooldown+=1.35;
}
function fan(w:CombatWorld,e:EnemyEntity,h:MagneticHooks,count:number,spacing:number,raw:number,speed:number,aim:number,radius=4,visual?:MagneticVfxKey) {
  for(let i=0;i<count;i++) {
    const a=aim+(i-(count-1)/2)*spacing*Math.PI/180;
    const shot=bullet(w,e,h,a,speed,raw/stageEnemyConfig(e.type,2).projectileDamage,radius);
    if(shot&&visual)shot.magneticVisual=visual;
  }
}
function addMine(w:CombatWorld,e:EnemyEntity,h:MagneticHooks,at:Point,fuse:number,raw:number,flight=0,payload?:StatusPayload,kind:Mine["kind"]="bomb") {
  const m=w.magnetic!;
  if(m.mines.length+(m.lanes?.length??0)+w.warnings.length>=AIR_COMBAT_WORLD.maxWarnings)return;
  m.mines.push({...at,id:w.nextId++,areaId:e.magnetic?.elite?.id,owner:e.id,allegiance:e.magnetic?.elite?.allegiance??h.allegiance(w,e),sourceType:e.type,damage:raw*e.damageScale*(e.magnetic?.elite?1.2:1),age:0,warning:0,exploded:false,
    startY:flight?e.y:at.y,targetY:at.y,fuse,flight,payload,kind});
}

/** A squad event is advanced once, never replayed in a catch-up loop. The owner
 * controls its own cast clock, including pauses under stun and skill lock. */
function updateEliteDirector(w:CombatWorld,dt:number,h:MagneticHooks) {
  const wave=w.stage.waves[w.waveIndex],m=w.magnetic!;
  if(!wave.elite||w.waveState!=="combat"||dt<=0)return;
  const d=m.eliteDirector??={wave:w.waveIndex,nextAt:w.elapsed+.65,event:0,cycle:0};
  if(d.wave!==w.waveIndex){m.eliteDirector=undefined;return;}
  m.corridor??={x:180,half:Math.max(44, hitboxProjectionExtent(getPlayerHitbox(w),1,0)+28)};
  if(w.elapsed<d.nextAt)return;
  const events=wave.elite===1?TRIAD:EXECUTION;
  const [type,skill]=events[d.event],owner=w.enemies.find(e=>e.type===type&&e.hp>0&&h.target(w,e));
  const gap=wave.elite===1?.9:.75;
  if(!owner) { d.event=(d.event+1)%events.length;d.nextAt=w.elapsed+gap;return; }
  if(owner.stun>0||(owner.skillLockedUntil??0)>w.elapsed||state(owner).elite){d.nextAt=w.elapsed+.1;return;}
  // Count casts, not owners: a Warden's lingering carpet and a later chase
  // are two mechanics. All mines/lanes/projectiles from one cast share its ID.
  const controls=new Set<number>();
  for(const e of w.enemies)if(e.hp>0&&e.magnetic?.elite && AREA_SKILLS.includes(e.magnetic.elite.skill))controls.add(e.magnetic.elite.id);
  for(const e of w.enemies)if(e.hp>0&&e.type==="micro_drone"&&e.magnetic?.areaId!==undefined)controls.add(e.magnetic.areaId);
  for(const lane of m.lanes??[])controls.add(lane.areaId??lane.owner);
  for(const mine of m.mines)if(!mine.exploded)controls.add(mine.areaId??mine.owner);
  for(const trail of m.trails??[])controls.add(trail.areaId);
  if(m.polarity)controls.add(m.polarity.areaId);
  for(const p of w.projectiles)if(p.lifetime>0&&p.magneticAreaId!==undefined)controls.add(p.magneticAreaId);
  // Forced movement must not push the player across an active geometry wall.
  const hard=new Set<number>();
  for(const e of w.enemies)if(e.hp>0&&e.magnetic?.elite&&HARD_SKILLS.includes(e.magnetic.elite.skill))hard.add(e.magnetic.elite.id);
  for(const lane of m.lanes??[])hard.add(lane.areaId??lane.owner);
  for(const trail of m.trails??[])hard.add(trail.areaId);
  if(m.polarity)hard.add(m.polarity.areaId);
  const forceConflict=(!!m.polarity&&["shift","sweep","assault"].includes(skill)) || (!!(m.lanes?.length||m.trails?.length)&&["polarity","repulse"].includes(skill));
  const geometryBusy=hard.size>=2;
  if((AREA_SKILLS.includes(skill) && controls.size>=(wave.elite===1?2:3)) || forceConflict || (geometryBusy && HARD_SKILLS.includes(skill)) || (m.mines.some(mine=>!mine.exploded) && ["assault","cross_prism"].includes(skill))) {d.nextAt=w.elapsed+.1;return;}
  const warning=skill==="assault"?.55:skill==="shift"?.55:skill==="sweep"?.60:skill==="repulse"?.7:skill==="cross_prism"?.65:.6;
  state(owner).elite={id:w.nextId++,allegiance:h.allegiance(w,owner),skill,age:0,step:0,next:warning,warning,aim:Math.atan2(h.target(w,owner)!.y-owner.y,h.target(w,owner)!.x-owner.x),
    target:{...h.target(w,owner)!},origin:{x:owner.x,y:owner.y},pass:0,mode:"warning"};
  if(skill === "assault") lockAssaultTarget(owner, state(owner).elite!);
  magneticFx(w,"beamCharge",owner.x,owner.y,owner.radius*2,warning);
  d.event=(d.event+1)%events.length;if(!d.event)d.cycle++;
  d.nextAt=w.elapsed+gap;
}
function returning(w:CombatWorld,e:EnemyEntity,h:MagneticHooks,angle:number,raw:number,travel:number,curve:number,origin:Point=e,end?:Point) {
  if(w.projectiles.filter(p=>p.magnetic?.kind==="disc"&&p.lifetime>0).length>=48)return;
  const p=bullet(w,e,h,angle,0,raw/stageEnemyConfig(e.type,2).projectileDamage,8);
  if(!p)return;
  const target=end??point(origin.x+Math.cos(angle)*300,origin.y+Math.sin(angle)*300,16);
  p.x=p.previousX=origin.x;p.y=p.previousY=origin.y;p.magneticVisual="returningDisc";p.lifetime=travel*2+.55+.1;
  p.magnetic={kind:"disc",age:0,originX:origin.x,originY:origin.y,endX:target.x,endY:target.y,curve,
    outbound:travel,turn:.55,returnDuration:travel,phase:"outbound",baseAngle:angle,recalls:0};
}
function addLane(w:CombatWorld,e:EnemyEntity,h:MagneticHooks,from:Point,end:Point,warning:number,duration:number,wall?:-1|1) {
  const lanes=w.magnetic!.lanes??=[];
  if(lanes.length>=12||lanes.length+w.magnetic!.mines.length+w.warnings.length>=AIR_COMBAT_WORLD.maxWarnings)return;
  lanes.push({allegiance:e.magnetic?.elite?.allegiance??h.allegiance(w,e),owner:e.id,areaId:e.magnetic?.elite?.id,from:{...from},end:{...end},warning,duration,wall,age:0,width:9,damage:damage(e)*1.2,nextHit:warning});
}
function spawnMicroWave(w:CombatWorld,e:EnemyEntity,h:MagneticHooks,side:number) {
  const anchor=point((h.target(w,e)?.x??e.x),(h.target(w,e)?.y??e.y),110);
  for(let i=0;i<4;i++) {
    const drone=h.spawn(w,"micro_drone",true);if(!drone)break;
    drone.inheritedAllegiance=e.magnetic?.elite?.allegiance??h.allegiance(w,e);
    drone.noWaveWait=true;
    drone.x=clamp(e.x+side*35+(i-1.5)*14,RECT.left+12,RECT.right-12);drone.y=e.y+20;
    drone.magnetic={clock:0,attack:0,anchorX:anchor.x,anchorY:anchor.y,angle:-Math.PI+i*Math.PI/3+(side>0?.4:0),owner:e.id,slot:i,areaId:e.magnetic?.elite?.id};
    magneticFx(w,"droneSpawn",drone.x,drone.y,25,.3);
  }
}
/** Two genuine eight-shard fans from fixed virtual emitters. Their crossings
 * stay in the upper field, leaving the lower escape corridor unobstructed. */
function crossPrismRays() {
  return [-1,1].flatMap(side => {
    const from={x:180+side*140,y:RECT.top+55};
    const aim=Math.atan2(180,-side*285);
    return Array.from({length:8},(_,index)=>{
      const angle=aim+(index-3.5)*2*Math.PI/180;
      return {from,angle,end:{x:from.x+Math.cos(angle)*335,y:from.y+Math.sin(angle)*335}};
    });
  });
}
function updateEliteLocomotion(w:CombatWorld,e:EnemyEntity,dt:number) {
  const s=state(e);
  if(e.stun>0 || s.elite?.skill==="assault")return;
  const lane=ELITE_TYPES.indexOf(e.type), slow=e.type==="grid_architect"||e.type==="polarity_warden";
  const x=55+(lane%3)*120+Math.sin(s.clock*.8+e.phaseSeed)*(slow?22:42);
  drift(e,point(x,RECT.top+80+(lane%2)*34+Math.sin(s.clock*1.2+e.phaseSeed)*12),ENEMY_CONFIGS[e.type].speed*(slow?.6:1),dt);
}
function updateElite(w:CombatWorld,e:EnemyEntity,dt:number,h:MagneticHooks,canFire:boolean) {
  if(e.stun>0)return;
  updateEliteLocomotion(w,e,dt);
  updateEliteSkill(w,e,dt,h,canFire);
}
function updateEliteSkill(w:CombatWorld,e:EnemyEntity,dt:number,h:MagneticHooks,canFire:boolean) {
  const s=state(e),q=s.elite,m=w.magnetic!;
  if(!q || (e.skillLockedUntil??0)>w.elapsed)return;
  q.age+=dt;
  if(q.skill==="assault") {updateAssault(w,e,q,dt,h);return;}
  // Geometry warning starts as soon as the cast starts; collision and paint read
  // the same lane records, including the moving sweep walls.
  if(q.step===0&&(q.skill==="shift"||q.skill==="sweep")) {
    const top=RECT.top+35,bottom=RECT.bottom-15;
    if(q.skill==="sweep")for(const side of [-1,1] as const) {
      const x=side<0?RECT.left+5:RECT.right-5;addLane(w,e,h,{x,y:top},{x,y:bottom},.60,2.2,side);
    } else {
      const layouts:[Point,Point][][]=[
        [[{x:RECT.left+12,y:RECT.top+215},{x:RECT.right-12,y:RECT.top+215}]],
        [[{x:40,y:top},{x:320,y:bottom}]],
        [[{x:40,y:top},{x:320,y:bottom}],[{x:320,y:top},{x:40,y:bottom}]],
        [[{x:105,y:top},{x:105,y:bottom}],[{x:255,y:top},{x:255,y:bottom}]],
      ];
      const index=s.topology??0;s.topology=(index+1)%4;
      for(const [from,end]of layouts[index])addLane(w,e,h,from,end,.55,2);
    }
    s.elite=undefined;return;
  }
  if(q.step===0&&q.skill==="polarity") {m.polarity={allegiance:q.allegiance,owner:e.id,areaId:q.id,age:0,warning:.6,duration:3};s.elite=undefined;return;}
  if(q.age<q.next)return;
  const aim=Math.atan2((h.target(w,e)?.y??e.y)-e.y,(h.target(w,e)?.x??e.x)-e.x);
  switch(q.skill) {
    case "cyclone_blades":
      for(const offset of [-30,-20,-10,0,10,20,30])returning(w,e,h,q.aim+offset*Math.PI/180,58.0944,1.3,offset<0?-26:26);
      break;
    case "curtain":
      for(let i=0;i<11;i++) {
        const a=q.aim+(i-5)*10*Math.PI/180,p=bullet(w,e,h,a,115,1,9);
        if(p){p.magneticVisual="prismOrb";p.magnetic={kind:"orb",splitElite:true,age:0,originX:e.x,originY:e.y,endX:0,endY:0,curve:0,outbound:1.1,turn:0,returnDuration:0,phase:"outbound",baseAngle:a};}
      }
      break;
    case "cross_prism":
      // Fans cross in the upper field, then diverge outside the lower 88px
      // corridor. Their fixed vectors never retarget the player.
      for(const ray of crossPrismRays()) {
        const p=bullet(w,e,h,ray.angle,165,.45,4);
        if(p){p.x=p.previousX=ray.from.x;p.y=p.previousY=ray.from.y;p.magneticVisual="prismShard";p.lifetime=2.4;}
      }
      break;
    case "carpet": {
      const gap=(m.eliteDirector?.cycle??0)%2?1:2;
      for(let row=0;row<3;row++)for(let col=0;col<4;col++)if(!(col===gap && row>=1))
        addMine(w,e,h,{x:RECT.left+44+col*(RECT.width-88)/3,y:RECT.top+245+row*95},.45,82.992);
      break;
    }
    case "chase":
      addMine(w,e,h,{x:(h.target(w,e)?.x??e.x),y:(h.target(w,e)?.y??e.y)},.35,70.5432);q.step++;q.next=q.age+.22;
      if(q.step<10)return;break;
    case "repulse": {
      const dx=(h.target(w,e)?.x??e.x)-e.x,dy=(h.target(w,e)?.y??e.y)-e.y,len=Math.max(1,Math.hypot(dx,dy));
      const victim=h.target(w,e);if(q.allegiance==="hostile")pushPlayer(w,dx/len*28,dy/len*28);else if(victim){victim.x+=dx/len*28;victim.y+=dy/len*28;}
      for(let i=0;i<18;i++)bullet(w,e,h,q.aim+Math.PI/6+(i+.5)*(TAU-Math.PI/3)/18,145,.55,4);
      magneticFx(w,"pulseRing",e.x,e.y,180,.5);break;
    }
    case "swarm":
      spawnMicroWave(w,e,h,q.step===0?-1:1);q.step++;q.next=q.age+.45;if(q.step<3)return;break;
    case "suppress":
      fan(w,e,h,15,7,30.576,150,aim);q.step++;q.next=q.age+.35;if(q.step<4)return;break;
    case "reversal":
      for(let i=0;i<12;i++)returning(w,e,h,q.aim+(i-5.5)*12*Math.PI/180,45.864,1.4/1.15,i<6?-22:22);
      break;
    case "recall":
      for(const side of [-1,1])for(let i=0;i<5;i++) {
        const origin={x:180+side*140,y:RECT.top+50+i*12},end={x:180-side*140,y:RECT.top+235+i*12};
        returning(w,e,h,Math.atan2(end.y-origin.y,end.x-origin.x),45.864,1.4/1.15,side*25,origin,end);
      }
      break;
  }
  s.elite=undefined;
}
function lockAssaultTarget(e:EnemyEntity,q:EliteSequence) {
  q.aim=Math.atan2(q.target.y-e.y,q.target.x-e.x);
  const distance=Math.min(270,Math.max(85,Math.hypot(q.target.x-e.x,q.target.y-e.y)));
  q.target=point(e.x+Math.cos(q.aim)*distance,e.y+Math.sin(q.aim)*distance,34);
}
function updateAssault(w:CombatWorld,e:EnemyEntity,q:EliteSequence,dt:number,h:MagneticHooks) {
  if(q.mode==="warning") {
    if(q.age<.55)return;
    q.mode="dash";q.age=0;q.origin={x:e.x,y:e.y};
    // The dash uses exactly the endpoint shown throughout its warning.
    return;
  }
  if(q.mode==="turnaround") {
    if(q.age<.18)return;
    q.mode="warning";q.age=0;q.origin={x:e.x,y:e.y};q.target={x:(h.target(w,e)?.x??e.x),y:(h.target(w,e)?.y??e.y)};lockAssaultTarget(e,q);return;
  }
  drift(e,q.target,330,dt);
  const trails=w.magnetic!.trails??=[];
  let trail=trails.find(t=>t.owner===e.id&&t.from===q.origin);
  if(!trail&&trails.length<9){trail={allegiance:q.allegiance,owner:e.id,areaId:q.id,from:q.origin,end:{x:e.x,y:e.y},until:w.elapsed+1,damage:62.244*e.damageScale*1.2,hitAt:0};trails.push(trail);}
  if(trail){trail.end={x:e.x,y:e.y};trail.until=w.elapsed+1;}
  if(Math.hypot(e.x-q.target.x,e.y-q.target.y)>1)return;
  if(++q.pass<3){q.mode="turnaround";q.age=0;return;}
  fan(w,e,h,15,7,53.9448,155,Math.atan2((h.target(w,e)?.y??e.y)-e.y,(h.target(w,e)?.x??e.x)-e.x));state(e).elite=undefined;
}

/** Damage beams always use their complete canonical segment. */
function laneSegments(_w:CombatWorld,a:Point,b:Point,visit:(a:Point,b:Point)=>void) { visit(a,b); }
function updateGeometry(w:CombatWorld,dt:number,h:MagneticHooks) {
  const m=w.magnetic!,player=getPlayerHitbox(w);
  m.trails=(m.trails??[]).filter(t=>t.until>w.elapsed);
  for(const trail of m.trails)if(w.elapsed>=trail.hitAt) {
    h.area(w,trail.damage,{allegiance:trail.allegiance,sourceEnemyId:trail.owner,sourceEnemyType:"cyclone_ace",delivery:"area_hazard"},{x:trail.from.x,y:trail.from.y,end:trail.end,radius:DASH_RADIUS});trail.hitAt=w.elapsed+.5;
  }
  const lanes=m.lanes??=[];
  for(let i=lanes.length-1;i>=0;i--) {
    const lane=lanes[i];lane.age+=dt;
    if(lane.age>lane.warning+lane.duration){lanes.splice(i,1);continue;}
    if(lane.wall) {
      const outer=lane.wall<0?RECT.left+5:RECT.right-5,inner=(m.corridor?.x??180)+lane.wall*((m.corridor?.half??44)+9);
      lane.from.x=lane.end.x=outer+(inner-outer)*clamp((lane.age-lane.warning)/1.5,0,1);
    }
    if(lane.age>=lane.nextHit) {
      lane.nextHit+=.2;
      laneSegments(w,lane.from,lane.end,(a,b)=>{
        h.area(w,lane.damage,{allegiance:lane.allegiance,sourceEnemyId:lane.owner,sourceEnemyType:"grid_architect",delivery:"beam"},{x:a.x,y:a.y,end:b,radius:lane.width});
      });
    }
  }
}
function dangerCapsule(p:MagneticPainter,a:Point,b:Point,r:number,active:boolean) {
  const alpha=active?.35:.18,dx=b.x-a.x,dy=b.y-a.y,len=Math.max(.001,Math.hypot(dx,dy)),nx=-dy/len*r,ny=dx/len*r;
  p.line(a.x,a.y,b.x,b.y,0xff3344,alpha,r*2);
  p.circle(a.x,a.y,r,0xff3344,alpha,true);p.circle(b.x,b.y,r,0xff3344,alpha,true);
  p.line(a.x+nx,a.y+ny,b.x+nx,b.y+ny,0xff3344,.85,1);
  p.line(a.x-nx,a.y-ny,b.x-nx,b.y-ny,0xff3344,.85,1);
  p.circle(a.x,a.y,r,0xff3344,.65);p.circle(b.x,b.y,r,0xff3344,.65);
}
function paintGeometry(w:CombatWorld,p:MagneticPainter) {
  const m=w.magnetic!;
  for(const lane of m.lanes??[]) {
    const active=lane.age>=lane.warning,color=0xff3344;
    laneSegments(w,lane.from,lane.end,(a,b)=>{
      dangerCapsule(p,a,b,lane.width,active);
      if(active)p.line(a.x,a.y,b.x,b.y,0xe9d5ff,.95,3);
    });
    if(lane.wall&&lane.age<lane.warning){const x=(m.corridor?.x??180)+lane.wall*((m.corridor?.half??44)+9);p.line(x,RECT.top+35,x,RECT.bottom-15,0x67e8f9,.55,2);}
  }
  for(const trail of m.trails??[]) {
    dangerCapsule(p,trail.from,trail.end,DASH_RADIUS,true);
    p.line(trail.from.x,trail.from.y,trail.end.x,trail.end.y,0xe9d5ff,.85,3);
  }
  for(const beam of m.beams??[]) {
    dangerCapsule(p,beam.from,beam.end,beam.radius,beam.active);
    if(beam.active)p.line(beam.from.x,beam.from.y,beam.end.x,beam.end.y,0xffffff,1,3);
    p.circle(beam.from.x,beam.from.y,beam.active?9:13,0x67e8f9,.7);
  }
  if(m.rift){const r=m.rift;p.circle(r.x,r.y,28+r.age*4,0xc084fc,.9);p.circle(r.x,r.y,20,0x312e81,.7,true);p.label?.(r.x,r.y-42,`RIFT ${Math.max(0,3-r.age).toFixed(1)}s`,0xe9d5ff,8);}
  if(m.polarity) {
    const q=m.polarity,reversed=q.age>=q.warning+1.5;
    p.line(180,RECT.top,180,RECT.bottom,0xc084fc,.55,2);
    for(const side of [-1,1]){
      const pull=(side<0)!==reversed;
      p.label?.(180+side*85,RECT.top+200,`${pull?"PULL":"PUSH"}${q.age<q.warning?" !":""}`,pull?0x67e8f9:0xc084fc,10);
      const x=180+side*85,dir=pull?-side:side;
      p.line(x,RECT.top+220,x+dir*25,RECT.top+220,0xe9d5ff,.8,2);
      p.line(x+dir*25,RECT.top+220,x+dir*18,RECT.top+214,0xe9d5ff,.8,2);
    }
  }
  for(const e of w.enemies) {
    const s=e.magnetic;if(!s||e.hp<=0)continue;
    if(s.tether&&s.clampWarned)p.label?.(e.x,e.y-20,"CLAMP !",0xfde047,8);
    if(e.type==="micro_drone"&&s.diveX!==undefined&&s.clock<(s.diveAt??0)) {
      p.line(e.x,e.y,s.diveX,s.diveY!,0xfde047,.75,2);p.circle(s.diveX,s.diveY!,16,0xfde047,.85);
    }
    const q=s.elite;
    if(q&&q.mode==="warning"&&q.age<q.warning){
      p.circle(e.x,e.y,e.radius*1.4,0xfde047,.7);p.label?.(e.x,e.y-e.radius*1.8,q.skill.toUpperCase().replaceAll("_"," "),0xfde047,7);
      if(q.skill==="assault")dangerCapsule(p,e,q.target,DASH_RADIUS,false);
      if(q.skill==="repulse") {
        for(const side of [-1,1]){const a=q.aim+side*Math.PI/6;p.line(e.x,e.y,e.x+Math.cos(a)*260,e.y+Math.sin(a)*260,0x67e8f9,.65,2);}
      }
      if(q.skill==="cross_prism")for(const ray of crossPrismRays()) {
        p.circle(ray.from.x,ray.from.y,9,0xc4b5fd,.8);
        p.line(ray.from.x,ray.from.y,ray.end.x,ray.end.y,0xfde047,.55,1);
      }
      if(q.skill==="recall")for(const side of [-1,1])p.line(180+side*140,RECT.top+55,180-side*140,RECT.top+235,0xfde047,.6,2);
    }

  }
  for(const mine of m.mines)if(!mine.exploded) {
    const progress=clamp(mine.warning/(mine.fuse??1.6),0,1);
    p.circle(mine.x,mine.targetY,BLAST_RADIUS,0xff3344,.12,true);
    p.circle(mine.x,mine.targetY,BLAST_RADIUS*progress,0xff3344,.26,true);
    p.circle(mine.x,mine.targetY,BLAST_RADIUS,0xff3344,.9,false,1);
    p.label?.(mine.x,mine.targetY+12,mine.kind==="field"?"STUN":"BOMB",0xfde047,6);
  }
}

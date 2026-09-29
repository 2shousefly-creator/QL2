import { GAMEPLAY_SAFE_RECT as R, SKILL_CONFIGS } from "./airCombatConfig";
import { getEffectiveAircraftStats, getSkillAvailability, getSkillRuntimeValues } from "./airCombatAircraft";
import type { CombatWorld } from "./airCombatRuntime";
import type { AircraftCombatState, SkillId } from "./airCombatTypes";

type Point = { x: number; y: number };
type Intent = "evade" | "kite" | "pressure" | "reposition" | "hold-angle" | "combo-setup";
interface Perception { at: number; player: Point; playerHp:number; velocity: Point; bullets: (Point & { vx: number; vy: number; damage: number; homing: boolean })[];
  hazards: (Point & { radius: number; cc: boolean })[]; lastDefensiveCast: number; lastBurst: number }
export interface MirrorAI {
  nextSense: number; nextDecision: number; history: Perception[]; observedCasts: Partial<Record<SkillId, number>>;
  lastPlayer: Point; goal: Point; vx: number; vy: number; intent: Intent; intentUntil: number;
  threat: number; incoming: number; lastHp: number; lastPlayerHp: number; losing: boolean; lastCast?: SkillId;
}
export const createMirrorAI = (x: number, y: number): MirrorAI => ({ nextSense: 0, nextDecision: 0, history: [], observedCasts: {},
  lastPlayer: { x, y }, goal: { x, y }, vx: 0, vy: 0, intent: "hold-angle", intentUntil: 0,
  threat: 0, incoming: 0, lastHp: 0, lastPlayerHp: 0, losing: false });
export function observeMirrorCast(ai: MirrorAI, id: SkillId, at: number) { ai.observedCasts[id] = at; }
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
function pathDistance(p: Point, b: Point & { vx: number; vy: number }, seconds: number) {
  const dx = b.vx * seconds, dy = b.vy * seconds;
  const t = clamp(((p.x - b.x) * dx + (p.y - b.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(p.x - b.x - dx * t, p.y - b.y - dy * t);
}
function cellThreat(p: Point, seen: Perception) {
  let value = 0;
  for (const b of seen.bullets) { const d = pathDistance(p, b, .7); value += Math.max(0, 1 - d / 45) * (b.damage / 100 + (b.homing ? 1 : .4)); }
  for (const a of seen.hazards) value += Math.max(0, 1 - distance(p, a) / (a.radius + 30)) * (a.cc ? 1.7 : 1) * 3;
  const edge = Math.min(p.x - R.left, R.right - p.x, p.y - R.top, R.bottom - p.y);
  value += Math.max(0, 45 - edge) / 12;
  value += Math.max(0, 80 - distance(p, seen.player)) / 18;
  value -= Math.max(0, 1 - Math.abs(p.x - seen.player.x) / 85) * .6;
  value += Math.abs(distance(p, seen.player) - 220) / 260;
  // Penalize candidates whose neighbouring escape positions are also exposed.
  for (const dx of [-22, 22]) for (const a of seen.hazards)
    if (distance({ x: p.x + dx, y: p.y }, a) < a.radius + 10) value += .4;
  return value;
}
function skillUtility(id: SkillId, s: AircraftCombatState, ai: MirrorAI, p: Point, seen: Perception) {
  const ready = getSkillAvailability(s, id); if (!ready.available || ready.toggle) return -Infinity;
  const stats = getEffectiveAircraftStats(s), values = getSkillRuntimeValues(s, id), hp = s.currentHp / stats.maxHp;
  const safe = 1 / (1 + ai.threat), line = clamp(1 - Math.abs(p.x - seen.player.x) / 90, 0, 1);
  const edge = Math.min(seen.player.x - R.left, R.right - seen.player.x) < 55 ? 1 : .2;
  const steady = 1 / (1 + Math.abs(seen.velocity.x) / 130), danger = clamp(ai.incoming / stats.maxHp / .12, 0, 2);
  const recentlyDefended = seen.at - seen.lastDefensiveCast < 2 ? 1 : .15;
  const committed = seen.at - seen.lastBurst < 1 ? 1 : .2;
  const density = Math.min(2, seen.bullets.length / 12), reserve = hp < .3 ? 0 : Math.max(0, values.cost + stats.maxResource * .18 - s.currentResource) / stats.maxResource;
  const opportunity: Record<SkillId, number> = {
    decoy: danger + density * .35 + committed * .3,
    afterburner: danger + (ai.intent === "reposition" ? .65 : .15),
    predator_lock: line * safe * steady * (s.currentResource > stats.maxResource * .35 ? 1.3 : .2),
    missile_swarm: safe * (recentlyDefended + edge * .5),
    armor_shield: danger,
    gravity_anchor: edge + committed * .35,
    heavy_bomb: ai.lastCast === "gravity_anchor" ? 1.5 * line : edge * steady * .65,
    sweeping_cannon: line * safe * steady * 1.3,
    invisibility: danger + (ai.intent === "combo-setup" ? .8 : .15),
    focus_laser: line * steady * safe * (ai.lastCast === "invisibility" ? 1.7 : 1),
    electronic_interference: density * .6 + seen.bullets.filter(b => b.homing).length * .18,
    escort_drone: s.droneActive ? 0 : safe * (stats.resourceRegen > values.upkeepPerSecond ? 1.2 : .45),
    orbit_reversal: density * .8,
    stellar_lance: line * steady * safe * 1.3,
    twin_reflection: safe * 1.1,
    starfall: safe * (edge + committed * .4),
  };
  const ultimate = ["missile_swarm", "sweeping_cannon", "escort_drone", "starfall"].includes(id);
  const defensive = ["decoy", "afterburner", "armor_shield", "invisibility", "electronic_interference", "orbit_reversal"].includes(id);
  const phaseFit = hp < .3 && ultimate ? 1.3 : hp <= .6 && ai.losing && defensive ? 1.2 : 1;
  const waste = !defensive && values.damageMultiplier * stats.firepower > ai.lastPlayerHp * 2 ? .3 : 0;
  const castLockRisk = !defensive && (id === "focus_laser" || id === "sweeping_cannon") ? danger * .8 : 0;
  return opportunity[id] * phaseFit - reserve * 2 - waste - castLockRisk;
}
/** Only exposed positions, spawned bullets and observed casts enter the delayed inbox. */
export function updateMirrorAI(w: CombatWorld, ai: MirrorAI, s: AircraftCombatState, p: Point, dt: number): { x: number; y: number; skill?: SkillId } {
  if (w.elapsed >= ai.nextSense) {
    const gap = .125, player = { x: w.playerX, y: w.playerY };
    const latest = (ids: SkillId[]) => Math.max(-Infinity, ...ids.map(id => ai.observedCasts[id] ?? -Infinity));
    ai.history.push({ at: w.elapsed, player, playerHp:w.aircraft.currentHp, velocity: { x: (player.x - ai.lastPlayer.x) / gap, y: (player.y - ai.lastPlayer.y) / gap },
      bullets: w.projectiles.filter(b => b.owner !== "enemy" && b.lifetime > 0).sort((a, b) => distance(a, p) - distance(b, p)).slice(0, 64)
        .map(b => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy, damage: b.rawDamage, homing: b.homing })),
      hazards: [...w.warnings.filter(z => z.owner === "player").map(z => ({ x: z.x, y: z.y, radius: z.radius, cc: !!z.payload?.stun })),
        ...(w.rankRuntime?.anchor?[{x:w.rankRuntime.anchor.x,y:w.rankRuntime.anchor.y,radius:120,cc:true}]:[]),
        ...(w.astra?.starfall?.pending??[]).map(m=>({x:m.x,y:m.y,radius:m.doom?110:65,cc:false})),
        ...(w.astra?.burns??[]).map(b=>({x:b.x,y:b.y,radius:b.radius,cc:false})),
        ...(w.laserCharge>0||w.laserRemaining>0?[{x:w.playerX,y:p.y,radius:30,cc:false}]:[]),
        ...(w.mirage?.hazards ?? []).map(a => ({ x: a.start.x, y: a.start.y, radius: a.radius, cc: !!a.payload?.stun }))].slice(0, 24),
      lastDefensiveCast: latest(["afterburner", "invisibility", "armor_shield", "orbit_reversal"]),
      lastBurst: latest(["missile_swarm", "sweeping_cannon", "focus_laser", "starfall"]) });
    ai.lastPlayer = player; ai.nextSense = w.elapsed + gap; ai.history = ai.history.slice(-5);
  }
  const seen = [...ai.history].reverse().find(snap => snap.at <= w.elapsed - .16);
  let skill: SkillId | undefined;
  if (seen && w.elapsed >= ai.nextDecision) {
    ai.nextDecision = w.elapsed + .125;
    ai.threat = Math.max(0, cellThreat(p, seen));
    ai.incoming = seen.bullets.reduce((sum, b) => sum + (pathDistance(p, b, .5) < 28 ? b.damage : 0), 0);
    ai.losing = ai.lastHp - s.currentHp > ai.lastPlayerHp - seen.playerHp;
    ai.lastHp = s.currentHp; ai.lastPlayerHp = seen.playerHp;
    if (w.elapsed >= ai.intentUntil || ai.threat > 4) {
      ai.intent = ai.threat > 2 ? "evade" : ai.losing ? "kite" : Math.abs(p.x - seen.player.x) > 65 ? "reposition" : s.currentResource > getEffectiveAircraftStats(s).maxResource * .6 ? "combo-setup" : Math.abs(p.x - seen.player.x) < 24 && ai.threat < .5 ? "hold-angle" : "pressure";
      ai.intentUntil = w.elapsed + .9;
    }
    let best = ai.goal, score = cellThreat(best, seen) - .2;
    for (let y = 0; y < 13; y++) for (let x = 0; x < 9; x++) {
      const cell = { x: R.left + 28 + x * (R.width - 56) / 8, y: R.top + 28 + y * (R.height - 56) / 12 };
      // Keep the opponent ahead of the forward weapons; no impossible instant turn.
      if (cell.y > seen.player.y - 45) continue;
      const cost = cellThreat(cell, seen) + distance(cell, p) / 260;
      if (cost < score) { score = cost; best = cell; }
    }
    ai.goal = best;
    let utility = .55;
    for (const id of Object.keys(SKILL_CONFIGS) as SkillId[]) if (SKILL_CONFIGS[id].aircraftId === s.aircraftId) {
      const u = skillUtility(id, s, ai, p, seen); if (u > utility) { utility = u; skill = id; }
    }
  }
  const dx = ai.goal.x - p.x, dy = ai.goal.y - p.y, length = Math.hypot(dx, dy), speed = (s.activeEffects.afterburner ?? 0) > 0 ? 230 : 155;
  const desiredX = dx / Math.max(1, length) * Math.min(speed, length * 4), desiredY = dy / Math.max(1, length) * Math.min(speed, length * 4);
  const turn = Math.min(1, dt * 6); ai.vx += (desiredX - ai.vx) * turn; ai.vy += (desiredY - ai.vy) * turn;
  return { x: clamp(p.x + ai.vx * dt, R.left + 25, R.right - 25), y: clamp(p.y + ai.vy * dt, R.top + 25, R.bottom - 25), skill };
}

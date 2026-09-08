import { BALANCE, clamp } from "../config";
import { ITEMS, itemById, weaponById } from "../content/equipment";
import { MAPS } from "../content/world";
import { STAGES } from "../content/stages";
import type {
  ArmyProfile,
  Battle,
  Command,
  ItemId,
  RunTicket,
  Unit,
} from "../types";
import { TerrainMask } from "../terrain/terrainMask";
import { emit } from "./events";
import { playerUnit, allyUnit, spawnEnemy } from "./units";
import { getActive, launch } from "./ballistics";
import { updateProjectiles } from "./projectiles";
import { moveUnit, resolveFalling } from "./movement";
import { beginTurn, endTurn } from "./turnEngine";
import { resolveObjectives } from "./objectives";
import { solveTick } from "../ai/ballisticSolver";
import { updateBossPhase } from "../ai/bossController";
import { applyStatus } from "./statusEngine";
export function createBattle(
  run: RunTicket,
  difficulty: ArmyProfile["settings"]["difficulty"],
): { battle: Battle; terrain: TerrainMask } {
  const stage = STAGES.find((s) => s.id === run.stageId);
  if (!stage) throw new Error("Màn chơi không tồn tại.");
  const terrain = new TerrainMask(MAPS.find((m) => m.id === stage.map)!);
  const player = playerUnit(run, terrain, stage.playerX);
  if (stage.weapon) player.weapon = stage.weapon;
  const battle: Battle = {
    run,
    stage,
    seed: run.seed || 1234567,
    tick: 0,
    phase: "planning",
    round: 0,
    units: [player],
    active: 1,
    queue: [],
    turnToken: 0,
    seconds: BALANCE.turnSeconds,
    wind: stage.wind ?? 0,
    projectiles: [],
    hazards: [],
    events: [],
    serial: 10,
    elapsedPhase: 0,
    result: null,
    solver: null,
    items: Object.fromEntries(
      ITEMS.map((i) => [i.id, run.loadout.items.includes(i.id) ? 1 : 0]),
    ) as Record<ItemId, number>,
    itemUsed: false,
    attackBoost: 1,
    extraCount: 1,
    windScale: 1,
    wave: 0,
    rescue: false,
    tutorial: { moved: false, aimed: false, fired: false, item: false },
    difficulty,
  };
  if (stage.allyX !== undefined)
    battle.units.push(allyUnit(terrain, stage.allyX));
  for (const s of stage.enemies) spawnEnemy(battle, terrain, s);
  beginTurn(battle, terrain);
  return { battle, terrain };
}
function fire(b: Battle, u: Unit) {
  if (
    b.result ||
    !u.grounded ||
    u.hp <= 0 ||
    !["planning", "charge"].includes(b.phase)
  )
    return;
  const w = weaponById[u.weapon],
    count = Math.min(BALANCE.maxProjectiles, w.count * b.extraCount);
  for (let i = 0; i < count; i++) {
    const p = launch(
      u,
      u.angle + (i - (count - 1) / 2) * (w.spread || 4),
      u.power,
      ++b.serial,
      b.windScale,
    );
    if (b.extraCount > 1 && p.ammo === "normal") p.ammo = "burst";
    p.damage *=
      b.attackBoost *
      (b.extraCount === 2 ? 0.7 : b.extraCount === 3 ? 0.55 : 1);
    b.projectiles.push(p);
  }
  b.phase = "flight";
  b.elapsedPhase = 0;
  b.solver = null;
  u.animation = "shoot";
  u.animTime = 0;
  if (u.kind === "player") b.tutorial.fired = true;
  emit(b, "fire", u.x, u.y);
}
export function itemUnavailable(b: Battle, id: ItemId): string | null {
  const u = getActive(b);
  if (b.result || u.kind !== "player" || b.phase !== "planning" || !u.grounded)
    return "Chỉ dùng khi đang ngắm và đứng vững.";
  if (b.itemUsed) return "Mỗi lượt dùng tối đa một đạo cụ.";
  if (!b.items[id]) return "Đã hết đạo cụ trong hành trang trận này.";
  if (id === "heal" && u.hp >= u.maxHp) return "HP đã đầy.";
  return null;
}
function useItem(b: Battle, t: TerrainMask, id: ItemId): boolean {
  if (itemUnavailable(b, id)) return false;
  const u = getActive(b),
    item = itemById[id];
  if (item.effect === "blink") {
    const tx = u.x + u.facing * item.amount,
      ty = t.surface(tx, Math.max(0, u.y - 30));
    if (
      ty === null ||
      tx < u.radius ||
      tx > t.map.width - u.radius ||
      Math.abs(ty - u.y) > 50 ||
      !t.bodyClear(tx, ty - 2, u.radius, u.height) ||
      b.units.some(
        (v) => v !== u && v.hp > 0 && Math.abs(v.x - tx) < v.radius + u.radius,
      )
    )
      return false;
    for (let d = 4; d < item.amount; d += 4)
      if (!t.bodyClear(u.x + d * u.facing, u.y, u.radius, u.height))
        return false;
    u.x = tx;
    u.y = ty - 2;
    u.fallFrom = u.y;
    u.grounded = true;
  }
  if (item.effect === "attack") b.attackBoost = item.amount;
  if (item.effect === "count") b.extraCount = item.amount;
  if (item.effect === "shield")
    applyStatus(b, u, "barrier", u.id, item.amount, 3);
  if (item.effect === "heal") {
    const healed = Math.min(item.amount, u.maxHp - u.hp);
    u.hp += healed;
    emit(b, "heal", u.x, u.y - u.height, healed);
  }
  if (item.effect === "wind") b.windScale = item.amount;
  if (item.effect === "airstrike") {
    const targets = b.units
      .filter((v) => v.team === "enemy" && v.hp > 0)
      .sort((a, c) => Math.abs(a.x - u.x) - Math.abs(c.x - u.x));
    if (!targets.length || b.hazards.length >= BALANCE.maxHazards) return false;
    b.hazards.push({
      id: ++b.serial,
      owner: u.id,
      x: targets[0].x,
      radius: 110,
      damage: item.amount,
      dueRound: b.round + 1,
      burnTurns: 0,
    });
    endTurn(b);
  }
  b.items[id]--;
  b.itemUsed = true;
  b.tutorial.item = true;
  u.animation = "skill";
  u.animTime = 0;
  emit(b, "skill", u.x, u.y, undefined, item.name);
  return true;
}
/** All keyboard/touch actions pass through this guard; renderer never edits combat state. */
export function command(b: Battle, t: TerrainMask, c: Command): boolean {
  const u = getActive(b);
  if (b.result || u.kind !== "player" || u.hp <= 0) return false;
  if (c.type === "cancel") {
    if (b.phase === "charge") {
      b.phase = "planning";
      u.power = 35;
    }
    return true;
  }
  if (!u.grounded) return false;
  if (c.type === "release") {
    if (b.phase !== "charge") return false;
    fire(b, u);
    return true;
  }
  if (b.phase !== "planning") return false;
  if (c.type === "move") return moveUnit(b, t, u, c.direction, c.dt);
  if (c.type === "face") {
    u.facing = c.direction;
    return true;
  }
  if (c.type === "aim") {
    u.angle = clamp(c.angle, ...weaponById[u.weapon].angles);
    b.tutorial.aimed = true;
    u.animation = "aim";
    return true;
  }
  if (c.type === "charge") {
    b.phase = "charge";
    u.power = 0;
    u.animation = "charge";
    return true;
  }
  if (c.type === "skip") {
    endTurn(b);
    return true;
  }
  if (c.type === "item") return useItem(b, t, c.id);
  return false;
}
function aiTick(b: Battle, t: TerrainMask, u: Unit, dt: number) {
  if (u.ai === "dummy" || u.ai === "structure") {
    if (b.elapsedPhase > 0.6) endTurn(b);
    return;
  }
  if (!u.grounded) return;
  // Brief tactical movement: leave a telegraph, find a firing position, conserve distance.
  if (b.elapsedPhase < 0.8) {
    const target = b.units.find((v) => v.kind === "player")!;
    const danger = b.hazards.some((h) => Math.abs(h.x - u.x) < h.radius);
    if (danger || u.ai === "sniper" || u.boss === "siege") {
      const direction: -1 | 1 = danger
        ? u.x < target.x
          ? -1
          : 1
        : u.x < target.x
          ? 1
          : -1;
      const nx = u.x + direction * 20;
      if (t.surface(nx, u.y - 8) !== null) moveUnit(b, t, u, direction, dt);
    }
    return;
  }
  if (u.ai === "elite" && u.hp / u.maxHp < 0.4 && u.turns % 3 === 0)
    u.shield = Math.max(u.shield, 25);
  const shot = solveTick(b, t, u);
  if (shot && b.elapsedPhase >= 1.3) {
    u.angle = shot.angle;
    u.power = shot.power;
    u.facing = shot.facing;
    fire(b, u);
  }
}
export function stepBattle(b: Battle, t: TerrainMask, dt = BALANCE.step) {
  if (b.result) return;
  dt = clamp(dt, 0, BALANCE.step);
  b.tick++;
  b.elapsedPhase += dt;
  const falling = resolveFalling(b, t, dt);
  for (const u of b.units) updateBossPhase(b, u);
  resolveObjectives(b, t);
  if (b.result) return;
  const u = getActive(b);
  if (b.phase === "flight") {
    updateProjectiles(b, t, dt);
    resolveObjectives(b, t);
    if (!b.result && !b.projectiles.length) endTurn(b);
    return;
  }
  if (b.phase === "resolve") {
    if (!falling && b.elapsedPhase >= 0.55) {
      beginTurn(b, t);
      resolveObjectives(b, t);
    }
    return;
  }
  if (u.hp <= 0) {
    endTurn(b);
    return;
  }
  b.seconds = Math.max(0, b.seconds - dt);
  if (b.seconds === 0) {
    endTurn(b);
    return;
  }
  if (u.kind !== "player") {
    aiTick(b, t, u, dt);
    return;
  }
  if (b.phase === "charge")
    u.power = clamp(u.power + BALANCE.chargePerSecond * dt, 0, 100);
}

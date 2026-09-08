import { BALANCE } from "../config";
import { MAPS } from "../content/world";
import type { Battle } from "../types";
import type { TerrainMask } from "../terrain/terrainMask";
import { damage, emit, random } from "./events";
import { bossTurn } from "../ai/bossController";
import { tickStatuses } from "./statusEngine";
export function beginTurn(b: Battle, t: TerrainMask) {
  if (b.result) return;
  let id = b.queue.shift();
  while (id !== undefined && !b.units.some((u) => u.id === id && u.hp > 0))
    id = b.queue.shift();
  if (id === undefined) {
    b.round++;
    // Survival succeeds at the end of its final round, before next-round hazards.
    if (
      b.stage.objective.kind === "survive" &&
      b.round > (b.stage.objective.turns ?? 6)
    )
      return;
    const map = MAPS.find((m) => m.id === b.stage.map)!;
    b.wind = b.stage.wind ?? Math.round((random(b) * 2 - 1) * map.wind);
    b.queue = b.units
      .filter((u) => u.hp > 0 && u.kind !== "ally")
      .map((u) => u.id);
    id = b.queue.shift();
    const pending = b.hazards;
    b.hazards = [];
    for (const h of pending) {
      const owner = b.units.find((u) => u.id === h.owner);
      if (!owner || owner.hp <= 0) continue;
      if (h.dueRound > b.round) {
        b.hazards.push(h);
        continue;
      }
      const ground = t.surface(h.x) ?? t.map.height;
      // Hazard radius is independent of the owner's current weapon.
      for (const u of b.units)
        if (
          u.hp > 0 &&
          Math.abs(u.x - h.x) < h.radius &&
          Math.abs(u.y - ground) < 150
        )
          damage(b, u, h.damage * (1 - (Math.abs(u.x - h.x) / h.radius) * 0.5));
      t.crater(h.x, ground, h.burnTurns ? 0 : h.radius * 0.7);
      emit(b, "explosion", h.x, ground, h.radius);
      if (h.burnTurns > 1)
        b.hazards.push({
          ...h,
          burnTurns: h.burnTurns - 1,
          dueRound: b.round + 1,
        });
    }
  }
  if (id === undefined) return;
  b.active = id;
  b.turnToken++;
  b.seconds = BALANCE.turnSeconds;
  b.phase = "planning";
  b.elapsedPhase = 0;
  b.solver = null;
  b.itemUsed = false;
  b.attackBoost = 1;
  b.extraCount = 1;
  b.windScale = 1;
  const u = b.units.find((v) => v.id === id)!;
  u.movement = u.maxMovement;
  u.power = 35;
  u.turns++;
  u.animation = "aim";
  u.animTime = 0;
  const stunned = tickStatuses(b, u);
  bossTurn(b, t, u);
  emit(b, "turn", u.x, u.y, undefined, u.name);
  if (stunned) endTurn(b);
}
export function endTurn(b: Battle) {
  if (b.result) return;
  b.phase = "resolve";
  b.elapsedPhase = 0;
  b.solver = null;
}

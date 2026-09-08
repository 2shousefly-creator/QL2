import type { Battle } from "../types";
import type { TerrainMask } from "../terrain/terrainMask";
import { emit } from "./events";
import { spawnEnemy } from "./units";
export function finish(b: Battle, won: boolean, reason: string) {
  if (b.result) return;
  const player = b.units.find((u) => u.kind === "player")!;
  b.result = {
    runId: b.run.id,
    stageId: b.stage.id,
    won,
    rounds: b.round,
    hpRatio: Math.max(0, player.hp / player.maxHp),
    reason,
  };
  b.phase = "finished";
  b.projectiles = [];
  b.hazards = [];
  b.solver = null;
  if (won) player.animation = "victory";
  emit(b, "finish", player.x, player.y, won ? 1 : 0, reason);
}
export function resolveObjectives(b: Battle, t: TerrainMask) {
  if (b.result) return;
  const player = b.units.find((u) => u.kind === "player")!,
    ally = b.units.find((u) => u.kind === "ally");
  const objective = b.stage.objective;
  if (player.hp <= 0) {
    finish(b, false, "Pháo Thủ đã bị loại.");
    return;
  }
  if (ally && ally.hp <= 0) {
    finish(b, false, "Trạm liên lạc đã bị phá hủy.");
    return;
  }
  if (objective.kind === "rescue" && ally && Math.abs(player.x - ally.x) < 100)
    b.rescue = true;
  const enemies = b.units.filter((u) => u.team === "enemy" && u.hp > 0);
  if (!enemies.length && b.stage.waves && b.wave < b.stage.waves.length) {
    if (b.projectiles.length) return;
    for (const spawn of b.stage.waves[b.wave++]) spawnEnemy(b, t, spawn);
    emit(b, "phase", player.x, player.y, undefined, `Đợt ${b.wave + 1}`);
    return;
  }
  const won =
    objective.kind === "survive"
      ? b.round > (objective.turns ?? 6)
      : objective.kind === "boss"
        ? !enemies.some((u) => u.boss)
        : objective.kind === "destroy"
          ? !enemies.some((u) => u.ai === "structure")
          : objective.kind === "rescue"
            ? b.rescue && !enemies.length
            : !enemies.length;
  if (won) {
    finish(b, true, "Hoàn thành mục tiêu chiến dịch.");
    return;
  }
  if (b.round > b.stage.maxRounds) finish(b, false, "Đã hết số vòng cho phép.");
}

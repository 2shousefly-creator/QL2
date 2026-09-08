import { BALANCE } from "../config";
import { BOSSES } from "../content/world";
import type { Battle, Unit } from "../types";
import type { TerrainMask } from "../terrain/terrainMask";
import { emit } from "../core/events";
import { spawnEnemy } from "../core/units";
export function updateBossPhase(b: Battle, u: Unit) {
  if (!u.boss || u.hp <= 0) return;
  const def = BOSSES.find((v) => v.id === u.boss)!;
  let phase = u.bossPhase;
  for (let i = phase + 1; i < def.phases.length; i++)
    if (u.hp / u.maxHp <= def.phases[i].threshold) phase = i;
  if (phase !== u.bossPhase) {
    u.bossPhase = phase;
    u.weapon = def.phases[phase].weapon;
    u.ammoOverride = def.phases[phase].ammo;
    emit(b, "phase", u.x, u.y, phase + 1, `${u.name}: giai đoạn ${phase + 1}`);
  }
}
export function bossTurn(b: Battle, t: TerrainMask, u: Unit) {
  if (!u.boss || u.hp <= 0 || b.result) return;
  const def = BOSSES.find((v) => v.id === u.boss)!,
    phase = def.phases[u.bossPhase];
  // Alternating shield is a visible window; it is never invulnerability.
  u.shield = u.turns % 2 === 0 ? phase.shield : 0;
  const target = b.units.find((v) => v.kind === "player" && v.hp > 0);
  if (target && b.hazards.length < BALANCE.maxHazards) {
    b.hazards.push({
      id: ++b.serial,
      owner: u.id,
      x: target.x,
      radius: phase.hazardRadius,
      damage: phase.hazardDamage,
      dueRound: b.round + 2,
      burnTurns: 0,
    });
    emit(
      b,
      "skill",
      target.x,
      target.y,
      phase.hazardRadius,
      `Rời vùng đỏ trước vòng ${b.round + 2}`,
    );
  }
  if (
    phase.summonEvery &&
    u.turns % phase.summonEvery === 0 &&
    b.units.filter((v) => v.ai === "drone" && v.hp > 0).length < 2
  ) {
    for (const offset of [-170, 170, -280, 280]) {
      const x = u.x + offset,
        feet = t.surface(x);
      if (
        feet === null ||
        x < 50 ||
        x > t.map.width - 50 ||
        b.units.some((v) => v.hp > 0 && Math.abs(v.x - x) < 80)
      )
        continue;
      spawnEnemy(b, t, { enemy: "drone", x });
      emit(b, "skill", x, feet, undefined, "Pháo phụ xuất hiện");
      break;
    }
  }
}

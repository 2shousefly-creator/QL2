import { AMMO, CLASSES, ITEMS, WEAPONS } from "./equipment";
import { BOSSES, ENEMIES, MAPS } from "./world";
import { STAGES } from "./stages";
export function validateContent(): void {
  const assert = (condition: unknown, message: string) => {
    if (!condition) throw new Error(`Nội dung Mobi Army: ${message}`);
  };
  for (const registry of [AMMO, CLASSES, ITEMS, WEAPONS, BOSSES, MAPS, STAGES])
    assert(
      new Set(registry.map((x) => x.id)).size === registry.length,
      "ID trùng.",
    );
  for (const w of WEAPONS) {
    assert(
      AMMO.some((a) => a.id === w.ammo),
      w.id,
    );
    assert(
      [
        w.speed,
        w.damage,
        w.blast,
        w.crater,
        w.gravity,
        w.wind,
        ...w.angles,
      ].every(Number.isFinite) &&
        w.speed > 0 &&
        w.angles[0] < w.angles[1],
      w.id,
    );
  }
  for (const map of MAPS) {
    assert(map.width <= 4096 && map.height <= 1500 && map.width > 1280, map.id);
    assert(
      map.surface.length > 1 &&
        map.surface.every(
          ([x, y], i) =>
            Number.isFinite(x + y) &&
            y > 100 &&
            y < map.height &&
            (!i || x > map.surface[i - 1][0]),
        ),
      map.id,
    );
  }
  for (const stage of STAGES) {
    const map = MAPS.find((m) => m.id === stage.map);
    assert(map, stage.id);
    assert(stage.enemies.length > 0 && stage.maxRounds > 0, stage.id);
    for (const s of [...stage.enemies, ...(stage.waves ?? []).flat()]) {
      assert(
        s.boss
          ? BOSSES.some((b) => b.id === s.boss)
          : Object.hasOwn(ENEMIES, s.enemy ?? ""),
        stage.id,
      );
      assert(
        s.x > 0 &&
          s.x < map!.width &&
          !map!.gaps.some(([a, b]) => s.x >= a && s.x <= b),
        `${stage.id}: điểm xuất hiện`,
      );
    }
  }
  for (const boss of BOSSES) {
    assert(boss.phases.length > 1, boss.id);
    for (const phase of boss.phases)
      assert(
        WEAPONS.some((w) => w.id === phase.weapon) &&
          Number.isFinite(phase.threshold),
        boss.id,
      );
  }
}

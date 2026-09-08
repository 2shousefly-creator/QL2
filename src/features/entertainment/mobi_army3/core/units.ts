import { BALANCE } from "../config";
import { CLASSES } from "../content/equipment";
import { ENEMIES, BOSSES } from "../content/world";
import type { Battle, RunTicket, Spawn, Unit } from "../types";
import type { TerrainMask } from "../terrain/terrainMask";
function base(id: number, x: number, t: TerrainMask): Unit {
  const y = t.surface(x) ?? t.map.height;
  return {
    statuses: [],
    id,
    x,
    y: y - 2,
    vy: 0,
    fallFrom: y,
    radius: BALANCE.unitRadius,
    height: BALANCE.unitHeight,
    team: "enemy",
    kind: "enemy",
    name: "",
    sprite: "rookie",
    hp: 100,
    maxHp: 100,
    defense: 2,
    attack: 0.78,
    crater: 1,
    shield: 0,
    movement: 70,
    maxMovement: 70,
    facing: -1,
    angle: 45,
    power: 65,
    weapon: "standard",
    bossPhase: 0,
    turns: 0,
    grounded: true,
    animation: "idle",
    animTime: 0,
  };
}
export function playerUnit(run: RunTicket, t: TerrainMask, x: number): Unit {
  const c = CLASSES.find((c) => c.id === run.loadout.classId)!;
  const u = base(1, x, t);
  const hp = c.hp + (run.level - 1) * 5 + run.upgrade * 12;
  return {
    ...u,
    team: "player",
    kind: "player",
    name: c.name,
    sprite: "gunner",
    hp,
    maxHp: hp,
    attack: c.attack * (1 + run.upgrade * 0.06),
    defense: c.defense,
    movement: c.mobility,
    maxMovement: c.mobility,
    crater: c.crater,
    facing: 1,
    weapon: run.loadout.weaponId,
  };
}
export function spawnEnemy(b: Battle, t: TerrainMask, s: Spawn): Unit | null {
  if (b.units.filter((u) => u.hp > 0).length >= BALANCE.maxUnits) return null;
  let u = base(++b.serial, s.x, t);
  if (s.boss) {
    const def = BOSSES.find((d) => d.id === s.boss)!;
    u = {
      ...u,
      kind: "boss",
      boss: def.id,
      name: def.name,
      sprite: def.sprite,
      hp: def.hp,
      maxHp: def.hp,
      radius: 46,
      height: 90,
      weapon: def.phases[0].weapon,
      ammoOverride: def.phases[0].ammo,
      attack: 0.85,
      maxMovement: 40,
      movement: 40,
    };
  } else if (s.enemy) {
    const e = ENEMIES[s.enemy];
    u = {
      ...u,
      ai: s.enemy,
      name: e.name,
      sprite: e.sprite,
      hp: e.hp,
      maxHp: e.hp,
      weapon: e.weapon,
      maxMovement: e.mobility,
      movement: e.mobility,
      crater: s.enemy === "engineer" ? 1.3 : 1,
    };
  }
  // Spawn only on a real surface, without burying the collision body.
  let attempts = 0;
  while (!t.bodyClear(u.x, u.y, u.radius, u.height) && attempts++ < 30)
    u.y -= 2;
  u.grounded = t.support(u.x, u.y, u.radius);
  u.fallFrom = u.y;
  b.units.push(u);
  return u;
}
export function allyUnit(t: TerrainMask, x: number): Unit {
  return {
    ...base(2, x, t),
    kind: "ally",
    team: "player",
    name: "Trạm liên lạc",
    sprite: "beacon",
    hp: 200,
    maxHp: 200,
    defense: 6,
    radius: 25,
    height: 65,
  };
}

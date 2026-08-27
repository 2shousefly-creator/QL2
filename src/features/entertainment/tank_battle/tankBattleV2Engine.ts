import {
  CORE_CATALOG,
  ENEMY_HQ,
  ENEMY_TOWER_X,
  LANE_IDS,
  LANE_Y,
  PLAYER_HQ,
  PLAYER_TOWER_X,
  TANK_V2_AI,
  TANK_V2_MAP,
  TANK_V2_PLAYER,
  TANK_V2_STRUCTURE,
  TANK_V2_XP,
} from "./tankBattleV2Config";
import type {
  CardinalDirection,
  CoreChoiceState,
  CoreDefinition,
  CoreRarity,
  Faction,
  LaneId,
  PlayerState,
  Point,
  StructureState,
  TerrainState,
  UnitState,
} from "./tankBattleV2Types";

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distanceSquared(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt(distanceSquared(a, b));
}

export function directionVector(direction: CardinalDirection): Point {
  switch (direction) {
    case "up": return { x: 0, y: -1 };
    case "down": return { x: 0, y: 1 };
    case "left": return { x: -1, y: 0 };
    case "right": return { x: 1, y: 0 };
  }
}

export function resolveFourWayDirection(
  deltaX: number,
  deltaY: number,
  radius: number
): CardinalDirection | null {
  const deadZone = radius * TANK_V2_PLAYER.joystickDeadZoneRatio;
  if (Math.hypot(deltaX, deltaY) <= deadZone) return null;
  if (Math.abs(deltaX) > Math.abs(deltaY)) return deltaX > 0 ? "right" : "left";
  return deltaY > 0 ? "down" : "up";
}

export function calculatePhysicalDamage(rawDamage: number, effectiveDef: number): number {
  if (rawDamage <= 0) return 0;
  const multiplier = effectiveDef >= 0
    ? 100 / (100 + effectiveDef)
    : 2 - 100 / (100 - effectiveDef);
  return Math.max(0, rawDamage * multiplier);
}

export function getAiSpawnStats(matchTimeSeconds: number): { hp: number; atk: number; def: number } {
  const progress = clamp(matchTimeSeconds / TANK_V2_AI.scaleCapSeconds, 0, 1);
  return {
    hp: Math.round(TANK_V2_AI.baseHp + (TANK_V2_AI.maxHp - TANK_V2_AI.baseHp) * progress),
    atk: Math.round(TANK_V2_AI.baseAtk + (TANK_V2_AI.maxAtk - TANK_V2_AI.baseAtk) * progress),
    def: Math.round(TANK_V2_AI.baseDef + (TANK_V2_AI.maxDef - TANK_V2_AI.baseDef) * progress),
  };
}

export function xpNeededForLevel(level: number): number {
  if (level >= TANK_V2_PLAYER.levelCap) return 0;
  return 60 + 10 * Math.max(0, level - 1);
}

export function totalXpToLevel18(): number {
  let total = 0;
  for (let level = 1; level < TANK_V2_PLAYER.levelCap; level += 1) total += xpNeededForLevel(level);
  return total;
}

export function applyCombatXp(player: PlayerState, amount: number): number[] {
  if (amount <= 0) return [];
  player.xp += amount;
  player.xpTotal += amount;
  const reachedCoreLevels: number[] = [];
  while (player.level < TANK_V2_PLAYER.levelCap) {
    const needed = xpNeededForLevel(player.level);
    if (player.xp < needed) break;
    player.xp -= needed;
    player.level += 1;
    player.stats.maxHp += TANK_V2_PLAYER.levelHpGain;
    player.hp = Math.min(player.stats.maxHp, player.hp + TANK_V2_PLAYER.levelHpGain);
    player.stats.atk += TANK_V2_PLAYER.levelAtkGain;
    player.stats.def += TANK_V2_PLAYER.levelDefGain;
    if ((TANK_V2_XP.coreLevels as readonly number[]).includes(player.level)) reachedCoreLevels.push(player.level);
  }
  if (player.level >= TANK_V2_PLAYER.levelCap) player.xp = 0;
  return reachedCoreLevels;
}

export function rollCoreRarity(random: () => number): CoreRarity {
  const roll = random();
  if (roll < TANK_V2_XP.rarity.silver) return "silver";
  if (roll < TANK_V2_XP.rarity.silver + TANK_V2_XP.rarity.gold) return "gold";
  return "diamond";
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

export function createCoreChoice(player: PlayerState, random: () => number): CoreChoiceState {
  const rarity = rollCoreRarity(random);
  const owned = new Set(player.selectedCoreIds);
  const eligible = CORE_CATALOG.filter((core) =>
    core.rarity === rarity && (!core.unique || !owned.has(core.id))
  );
  if (eligible.length < 3) {
    throw new Error(`Tank Battle V2 Core catalog exhausted for rarity ${rarity}; at least 3 eligible Core IDs are required.`);
  }
  const shuffled = shuffle([...eligible], random);
  const choices: CoreDefinition[] = [];
  const categories = new Set<string>();
  for (const core of shuffled) {
    if (choices.length >= 3) break;
    if (choices.some((choice) => choice.id === core.id)) continue;
    if (
      choices.length < 2 &&
      categories.has(core.category) &&
      shuffled.some((candidate) => !categories.has(candidate.category))
    ) continue;
    choices.push(core);
    categories.add(core.category);
  }
  for (const core of shuffled) {
    if (choices.length >= 3) break;
    if (!choices.some((choice) => choice.id === core.id)) choices.push(core);
  }
  return { rarity, choices };
}

export function applyCore(player: PlayerState, core: CoreDefinition): void {
  player.selectedCoreIds.push(core.id);
  switch (core.id) {
    case "reinforced_barrel": player.stats.atk += 12; break;
    case "aux_armor": player.stats.maxHp += 120; player.hp = Math.min(player.stats.maxHp, player.hp + 120); break;
    case "hardened_steel": player.stats.def += 8; break;
    case "fuel_tank": player.coreRuntime.boostDurationBonus += 0.75; break;
    case "cooling_unit": player.coreRuntime.boostCooldownReduction += 1; break;
    case "optimized_mag": player.stats.fireCooldown = Math.max(0.45, player.stats.fireCooldown - 0.08); break;
    case "piercing_round": player.stats.atk += 15; player.coreRuntime.projectilePierce = 1; break;
    case "reactive_armor":
      player.stats.maxHp += 150;
      player.hp = Math.min(player.stats.maxHp, player.hp + 150);
      player.coreRuntime.reactiveArmorShield = 250;
      player.coreRuntime.reactiveArmorThreshold = 0.3;
      break;
    case "military_turbo":
      player.coreRuntime.boostDurationBonus += 1;
      player.coreRuntime.boostCooldownReduction += 1.5;
      break;
    case "siege_round": player.stats.atk += 10; player.coreRuntime.structureBonusDamage += 35; break;
    case "charge_shield": player.coreRuntime.boostShield = 150; break;
    case "combat_absorption": player.coreRuntime.killHeal += 30; break;
    case "field_repair": player.stats.maxHp += 180; player.hp = Math.min(player.stats.maxHp, player.hp + 180); break;
    case "high_velocity_round": player.stats.projectileSpeed += 60; break;
    case "dual_cannon": player.coreRuntime.doubleShotEvery = 4; break;
    case "explosive_warhead": player.coreRuntime.explosiveDamage = 70; player.coreRuntime.explosiveRadius = 70; break;
    case "mobile_fortress":
      player.stats.maxHp += 350;
      player.hp = Math.min(player.stats.maxHp, player.hp + 350);
      player.stats.def += 20;
      player.coreRuntime.mobileFortressDef = 15;
      player.coreRuntime.mobileFortressDelay = 1.5;
      break;
    case "overdrive":
      player.coreRuntime.overdriveCharges = 2;
      player.boostCharges = Math.max(player.boostCharges, 2);
      break;
    case "battle_regeneration": player.coreRuntime.killHeal += 40; player.coreRuntime.regenerationShieldCap = 300; break;
    case "armor_breaker": player.coreRuntime.armorShred = 15; player.coreRuntime.armorShredSeconds = 4; break;
    case "titanium_core": player.stats.atk += 25; player.stats.def += 12; break;
    case "blitz_engine": player.stats.moveSpeed += 40; break;
  }
}

export function makeLaneWaypoints(lane: LaneId, faction: Faction): Point[] {
  const y = LANE_Y[lane];
  const forward = faction === "ally"
    ? [170, 250, 430, 610, 720, 830, 1010, 1190, 1270]
    : [1270, 1190, 1010, 830, 720, 610, 430, 250, 170];
  return forward.map((x) => ({ x, y }));
}

export function createStructures(): StructureState[] {
  const structures: StructureState[] = [];
  structures.push({
    id: "ally-hq", faction: "ally", kind: "hq", lane: null, tier: 0,
    x: PLAYER_HQ.x, y: PLAYER_HQ.y, radius: 34,
    hp: TANK_V2_STRUCTURE.hqHp, maxHp: TANK_V2_STRUCTURE.hqHp,
    atk: TANK_V2_STRUCTURE.hqAtk, def: TANK_V2_STRUCTURE.hqDef,
    attackRange: TANK_V2_STRUCTURE.hqRange, fireCooldown: TANK_V2_STRUCTURE.hqCooldown,
    fireRemaining: 0, targetId: null, targetLockRemaining: 0, immune: true, hitFlash: 0, lastPlayerDamageAt: -999, alive: true,
  });
  structures.push({
    id: "enemy-hq", faction: "enemy", kind: "hq", lane: null, tier: 0,
    x: ENEMY_HQ.x, y: ENEMY_HQ.y, radius: 34,
    hp: TANK_V2_STRUCTURE.hqHp, maxHp: TANK_V2_STRUCTURE.hqHp,
    atk: TANK_V2_STRUCTURE.hqAtk, def: TANK_V2_STRUCTURE.hqDef,
    attackRange: TANK_V2_STRUCTURE.hqRange, fireCooldown: TANK_V2_STRUCTURE.hqCooldown,
    fireRemaining: 0, targetId: null, targetLockRemaining: 0, immune: true, hitFlash: 0, lastPlayerDamageAt: -999, alive: true,
  });
  for (const lane of LANE_IDS) {
    const y = LANE_Y[lane];
    ([3, 2, 1] as const).forEach((tier) => {
      const x = tier === 3 ? PLAYER_TOWER_X.t3 : tier === 2 ? PLAYER_TOWER_X.t2 : PLAYER_TOWER_X.t1;
      structures.push({
        id: `ally-${lane}-t${tier}`, faction: "ally", kind: "tower", lane, tier, x, y, radius: 23,
        hp: TANK_V2_STRUCTURE.towerHp, maxHp: TANK_V2_STRUCTURE.towerHp,
        atk: TANK_V2_STRUCTURE.towerAtk, def: TANK_V2_STRUCTURE.towerDef,
        attackRange: TANK_V2_STRUCTURE.towerRange, fireCooldown: TANK_V2_STRUCTURE.towerCooldown,
        fireRemaining: 0, targetId: null, targetLockRemaining: 0, immune: tier !== 1, hitFlash: 0, lastPlayerDamageAt: -999, alive: true,
      });
    });
    ([1, 2, 3] as const).forEach((tier) => {
      const x = tier === 1 ? ENEMY_TOWER_X.t1 : tier === 2 ? ENEMY_TOWER_X.t2 : ENEMY_TOWER_X.t3;
      structures.push({
        id: `enemy-${lane}-t${tier}`, faction: "enemy", kind: "tower", lane, tier, x, y, radius: 23,
        hp: TANK_V2_STRUCTURE.towerHp, maxHp: TANK_V2_STRUCTURE.towerHp,
        atk: TANK_V2_STRUCTURE.towerAtk, def: TANK_V2_STRUCTURE.towerDef,
        attackRange: TANK_V2_STRUCTURE.towerRange, fireCooldown: TANK_V2_STRUCTURE.towerCooldown,
        fireRemaining: 0, targetId: null, targetLockRemaining: 0, immune: tier !== 1, hitFlash: 0, lastPlayerDamageAt: -999, alive: true,
      });
    });
  }
  updateStructureImmunity(structures);
  return structures;
}

export function updateStructureImmunity(structures: StructureState[]): void {
  for (const faction of ["ally", "enemy"] as const) {
    for (const lane of LANE_IDS) {
      const t1 = structures.find((structure) => structure.id === `${faction}-${lane}-t1`);
      const t2 = structures.find((structure) => structure.id === `${faction}-${lane}-t2`);
      const t3 = structures.find((structure) => structure.id === `${faction}-${lane}-t3`);
      if (t1) t1.immune = false;
      if (t2) t2.immune = !!t1?.alive;
      if (t3) t3.immune = !!t2?.alive;
    }
    const hq = structures.find((structure) => structure.id === `${faction}-hq`);
    const anyT3Destroyed = LANE_IDS.some((lane) => !structures.find((s) => s.id === `${faction}-${lane}-t3`)?.alive);
    if (hq) hq.immune = !anyT3Destroyed;
  }
}

export function structureDamageMultiplier(elapsedSeconds: number): number {
  if (elapsedSeconds >= 720) return TANK_V2_STRUCTURE.siege12StructureMultiplier;
  if (elapsedSeconds >= 600) return TANK_V2_STRUCTURE.siege10StructureMultiplier;
  return 1;
}

function segmentIntersectsRect(a: Point, b: Point, terrain: TerrainState): boolean {
  if (!terrain.alive) return false;
  const left = terrain.x - terrain.width / 2;
  const right = terrain.x + terrain.width / 2;
  const top = terrain.y - terrain.height / 2;
  const bottom = terrain.y + terrain.height / 2;
  const steps = Math.max(4, Math.ceil(distance(a, b) / 18));
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    if (x >= left && x <= right && y >= top && y <= bottom) return true;
  }
  return false;
}

export function hasLineOfSight(a: Point, b: Point, terrain: TerrainState[]): boolean {
  return !terrain.some((piece) => piece.alive && segmentIntersectsRect(a, b, piece));
}

export function moveCardinalToward(from: Point, to: Point): CardinalDirection {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

export function clampToMap(point: Point, radius: number): Point {
  return {
    x: clamp(point.x, radius, TANK_V2_MAP.width - radius),
    y: clamp(point.y, radius, TANK_V2_MAP.height - radius),
  };
}

export function isTowerParticipantTarget(structure: StructureState): boolean {
  return structure.kind === "tower" && structure.alive;
}

export function unitTargetScore(
  unit: UnitState,
  target: { kind: "player" | "unit" | "tower" | "hq"; point: Point; playerThreat?: boolean }
): number {
  const base = target.kind === "player" ? 10000 : target.kind === "unit" ? 6000 : target.kind === "tower" ? 3500 : 1800;
  const proximity = Math.max(0, unit.visionRange - distance(unit, target.point));
  return base + proximity * 4 + (target.playerThreat ? 5000 : 0);
}

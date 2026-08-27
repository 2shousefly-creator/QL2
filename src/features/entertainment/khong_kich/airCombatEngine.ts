import {
  AIR_COMBAT_LIMITS,
  AIR_COMBAT_RANK_ORDER,
  AIR_COMBAT_REWARD_CONFIG,
  AIRCRAFT_CONFIGS,
  CORE_DEFINITIONS,
  CORE_NUMERIC_VALUES,
  CORE_TIER_CHANCES,
  CORE_TIER_LABELS,
  GAMEPLAY_SAFE_RECT,
  SKILL_CONFIGS,
  WAVE_TIMELINE,
} from "./airCombatConfig";
import {
  AirCombatProfile,
  AirCombatRank,
  AirCombatReward,
  AirCombatRunSummary,
  AircraftCombatState,
  AircraftId,
  CoreCard,
  CoreDefinition,
  CoreId,
  CoreTier,
  EffectiveAircraftStats,
  EnemyType,
  GameplaySafeRect,
  LevelUpResult,
  SkillCastResult,
  SkillId,
  WeaponModifiers,
} from "./airCombatTypes";

const DEFAULT_WEAPON: WeaponModifiers = {
  penetration: 0,
  penetrationDamageMultiplier: 0,
  splashDamageMultiplier: 0,
  chargedEvery: 0,
  chargedMultiplier: 1,
  projectileCount: 1,
  perProjectileMultiplier: 1,
  bounceCount: 0,
  bounceDamageMultiplier: 0,
  annihilatorEvery: 0,
  annihilatorMultiplier: 1,
};

export interface RuntimeSkillValues {
  cost: number;
  cooldown: number;
  duration: number;
  damageMultiplier: number;
  count: number;
  upkeepPerSecond: number;
  sideProjectileMultiplier: number;
  radiusMultiplier: number;
  damageTakenMultiplier: number;
}

export interface DamageEvent {
  kind: "primary" | "penetration" | "splash" | "bounce";
  multiplier: number;
  canTriggerSecondary: false;
}

export function createAircraftCombatState(
  aircraftId: AircraftId
): AircraftCombatState {
  const config = AIRCRAFT_CONFIGS[aircraftId];
  return {
    aircraftId,
    level: 1,
    combatXp: 0,
    currentHp: config.baseStats.maxHp,
    currentResource: config.baseStats.maxResource,
    modifiers: {
      maxHpFlat: 0,
      armorFlat: 0,
      firepowerFlat: 0,
      fireRateFlat: 0,
      moveSpeedFlat: 0,
      hpRegen: 0,
      cooldownReduction: 0,
      maxResourceFlat: 0,
      resourceRegenFlat: 0,
      weapon: { ...DEFAULT_WEAPON },
      skillUpgrades: {},
    },
    cooldowns: {},
    selectedCores: [],
    activeEffects: {},
    droneActive: false,
    basicShotsFired: 0,
  };
}

export function getEffectiveAircraftStats(
  state: AircraftCombatState
): EffectiveAircraftStats {
  const config = AIRCRAFT_CONFIGS[state.aircraftId];
  const growthCount = Math.max(0, state.level - 1);
  const moveCoreCap = config.baseStats.moveSpeed * AIR_COMBAT_LIMITS.moveSpeedCoreRatio;
  const moveCore = Math.min(moveCoreCap, Math.max(0, state.modifiers.moveSpeedFlat));
  let fireRate =
    config.baseStats.fireRate +
    config.growth.fireRate * growthCount +
    state.modifiers.fireRateFlat;
  let moveSpeed =
    config.baseStats.moveSpeed + config.growth.moveSpeed * growthCount + moveCore;

  if ((state.activeEffects.afterburner || 0) > 0) {
    fireRate *= state.modifiers.skillUpgrades.afterburner ? 1.5 : 1.35;
    moveSpeed *= 1.2;
  }
  if ((state.activeEffects.sweeping_cannon || 0) > 0) moveSpeed *= 0.8;
  if ((state.activeEffects.invisibility || 0) > 0) moveSpeed *= 1.5;

  const maxResource =
    config.resourceKind === "energy"
      ? AIR_COMBAT_LIMITS.phantomMaxEnergy
      : config.baseStats.maxResource +
        config.growth.maxResource * growthCount +
        state.modifiers.maxResourceFlat;

  const maxHp =
    config.baseStats.maxHp +
    config.growth.maxHp * growthCount +
    state.modifiers.maxHpFlat;

  return {
    maxHp,
    armor:
      config.baseStats.armor +
      config.growth.armor * growthCount +
      state.modifiers.armorFlat,
    firepower:
      config.baseStats.firepower +
      config.growth.firepower * growthCount +
      state.modifiers.firepowerFlat,
    fireRate: Math.min(AIR_COMBAT_LIMITS.maxFireRate, fireRate),
    moveSpeed,
    maxResource,
    resourceRegen:
      config.baseStats.resourceRegen +
      config.growth.resourceRegen * growthCount +
      state.modifiers.resourceRegenFlat,
    currentHp: Math.min(state.currentHp, maxHp),
    currentResource: Math.min(state.currentResource, maxResource),
    cooldownReduction: Math.min(
      AIR_COMBAT_LIMITS.cooldownReduction,
      Math.max(0, state.modifiers.cooldownReduction)
    ),
    hpRegen: Math.max(0, state.modifiers.hpRegen),
    resourceKind: config.resourceKind,
    weapon: { ...state.modifiers.weapon },
  };
}

export function calculateDamage(
  rawDamage: number,
  targetArmor: number,
  additionalDamageTakenMultiplier = 1
): number {
  const raw = Math.max(0, rawDamage);
  const armor = Math.max(0, targetArmor);
  return raw * (100 / (100 + armor)) * Math.max(0, additionalDamageTakenMultiplier);
}

export function applyDamageToAircraft(
  state: AircraftCombatState,
  rawDamage: number,
  additionalDamageTakenMultiplier = 1
): number {
  const damage = calculateDamage(
    rawDamage,
    getEffectiveAircraftStats(state).armor,
    additionalDamageTakenMultiplier
  );
  state.currentHp = Math.max(0, state.currentHp - damage);
  return damage;
}

export function requiredCombatXp(level: number): number {
  return Math.round(24 * Math.pow(1.18, Math.max(0, level - 1)));
}

export function gainCombatXp(
  state: AircraftCombatState,
  amount: number
): LevelUpResult {
  let remaining = Math.max(0, amount);
  let levelsGained = 0;
  let coreSelectionsDue = 0;
  while (remaining > 0) {
    const required = requiredCombatXp(state.level);
    const needed = required - state.combatXp;
    if (remaining < needed) {
      state.combatXp += remaining;
      remaining = 0;
      break;
    }
    remaining -= needed;
    state.combatXp = 0;
    levelUpAircraft(state);
    levelsGained += 1;
    if (state.level % 3 === 0) coreSelectionsDue += 1;
  }
  return { levelsGained, coreSelectionsDue };
}

export function levelUpAircraft(state: AircraftCombatState): void {
  const before = getEffectiveAircraftStats(state);
  state.level += 1;
  const after = getEffectiveAircraftStats(state);
  state.currentHp = Math.min(after.maxHp, state.currentHp + (after.maxHp - before.maxHp));
  if (after.resourceKind === "mana") {
    state.currentResource = Math.min(
      after.maxResource,
      state.currentResource + (after.maxResource - before.maxResource)
    );
  } else {
    state.currentResource = Math.min(
      AIR_COMBAT_LIMITS.phantomMaxEnergy,
      state.currentResource
    );
  }
}

export function getSkillRuntimeValues(
  state: AircraftCombatState,
  skillId: SkillId
): RuntimeSkillValues {
  const skill = SKILL_CONFIGS[skillId];
  const upgraded = !!state.modifiers.skillUpgrades[skillId];
  const values: RuntimeSkillValues = {
    cost: skill.cost,
    cooldown: skill.cooldown,
    duration: skill.duration || 0,
    damageMultiplier: skill.damageMultiplier || 0,
    count: 0,
    upkeepPerSecond: 0,
    sideProjectileMultiplier: 0,
    radiusMultiplier: 1,
    damageTakenMultiplier: 1,
  };

  switch (skillId) {
    case "decoy":
      values.count = upgraded ? 5 : 3;
      values.duration = upgraded ? 4 : 3;
      break;
    case "afterburner":
      values.duration = upgraded ? 6 : 5;
      values.cooldown = upgraded ? 16 : 18;
      break;
    case "missile_swarm":
      values.count = upgraded ? 14 : 10;
      values.cooldown = upgraded ? 21 : 24;
      break;
    case "armor_shield":
      values.duration = upgraded ? 6 : 5;
      values.damageTakenMultiplier = upgraded ? 0.45 : 0.55;
      break;
    case "heavy_bomb":
      values.damageMultiplier = upgraded ? 11 : 8.5;
      values.radiusMultiplier = upgraded ? 1.2 : 1;
      values.cooldown = upgraded ? 20 : 22;
      break;
    case "sweeping_cannon":
      values.duration = upgraded ? 7.5 : 6;
      values.sideProjectileMultiplier = upgraded ? 0.6 : 0.45;
      break;
    case "invisibility":
      values.cost = upgraded ? 18 : 22;
      values.duration = upgraded ? 3 : 2.2;
      break;
    case "focus_laser":
      values.damageMultiplier = upgraded ? 1.05 : 0.85;
      values.duration = upgraded ? 2.4 : 2;
      break;
    case "escort_drone":
      values.upkeepPerSecond = upgraded ? 6 : 7;
      values.damageMultiplier = upgraded ? 0.5 : 0.41;
      break;
  }
  return values;
}

export function castSkill(
  state: AircraftCombatState,
  skillId: SkillId
): SkillCastResult {
  const skill = SKILL_CONFIGS[skillId];
  if (!skill || skill.aircraftId !== state.aircraftId) {
    return { cast: false, reason: "invalid", resourceSpent: 0 };
  }

  if (skillId === "escort_drone" && state.droneActive) {
    state.droneActive = false;
    return { cast: true, resourceSpent: 0, toggledOff: true };
  }

  if ((state.cooldowns[skillId] || 0) > 0) {
    return { cast: false, reason: "cooldown", resourceSpent: 0 };
  }

  const values = getSkillRuntimeValues(state, skillId);
  if (state.currentResource + Number.EPSILON < values.cost) {
    return { cast: false, reason: "resource", resourceSpent: 0 };
  }

  state.currentResource = Math.max(0, state.currentResource - values.cost);
  state.cooldowns[skillId] =
    values.cooldown * (1 - getEffectiveAircraftStats(state).cooldownReduction);
  if (values.duration > 0) state.activeEffects[skillId] = values.duration;
  if (skillId === "escort_drone") state.droneActive = true;
  return { cast: true, resourceSpent: values.cost };
}

export function tickAircraftState(
  state: AircraftCombatState,
  deltaSeconds: number,
  gameplayRunning: boolean
): void {
  if (!gameplayRunning || deltaSeconds <= 0) return;
  const dt = Math.max(0, deltaSeconds);
  for (const key of Object.keys(state.cooldowns) as SkillId[]) {
    state.cooldowns[key] = Math.max(0, (state.cooldowns[key] || 0) - dt);
  }
  for (const key of Object.keys(state.activeEffects) as SkillId[]) {
    const remaining = Math.max(0, (state.activeEffects[key] || 0) - dt);
    if (remaining <= 0) delete state.activeEffects[key];
    else state.activeEffects[key] = remaining;
  }

  const stats = getEffectiveAircraftStats(state);
  state.currentHp = Math.min(stats.maxHp, state.currentHp + stats.hpRegen * dt);
  state.currentResource = Math.min(
    stats.maxResource,
    state.currentResource + stats.resourceRegen * dt
  );

  if (state.aircraftId === "phantom" && state.droneActive) {
    const upkeep = getSkillRuntimeValues(state, "escort_drone").upkeepPerSecond;
    state.currentResource = Math.max(0, state.currentResource - upkeep * dt);
    if (state.currentResource <= 0) state.droneActive = false;
  }
  if (state.aircraftId === "phantom") {
    state.currentResource = Math.min(
      AIR_COMBAT_LIMITS.phantomMaxEnergy,
      state.currentResource
    );
  }
}

export function isPlayerInvisible(state: AircraftCombatState): boolean {
  return (state.activeEffects.invisibility || 0) > 0;
}

export function canAcquirePlayerTarget(state: AircraftCombatState): boolean {
  return !isPlayerInvisible(state);
}

export function shouldAutoFire(state: AircraftCombatState): boolean {
  return !isPlayerInvisible(state);
}

export function classifySkillPress(
  durationMs: number,
  longPressMs = 400
): "tap" | "hold" {
  return durationMs >= longPressMs ? "hold" : "tap";
}

export function shouldCastSkillPress(
  durationMs: number,
  holdActivated: boolean,
  cancelled: boolean,
  longPressMs = 400
): boolean {
  return !cancelled && !holdActivated && classifySkillPress(durationMs, longPressMs) === "tap";
}

export function rollCoreTier(
  selectionNumber: number,
  random: () => number = Math.random
): CoreTier {
  if (selectionNumber === 5) return "diamond";
  const roll = Math.max(0, Math.min(0.999999, random()));
  if (roll < CORE_TIER_CHANCES.silver) return "silver";
  if (roll < CORE_TIER_CHANCES.silver + CORE_TIER_CHANCES.gold) return "gold";
  return "diamond";
}

function isCoreEligible(
  state: AircraftCombatState,
  definition: CoreDefinition,
  tier: CoreTier
): boolean {
  if (!definition.tiers.includes(tier)) return false;
  if (definition.aircraftIds && !definition.aircraftIds.includes(state.aircraftId)) {
    return false;
  }
  if (state.selectedCores.includes(definition.id)) return false;
  const stats = getEffectiveAircraftStats(state);
  if (
    definition.id === "cooldown" &&
    stats.cooldownReduction >= AIR_COMBAT_LIMITS.cooldownReduction
  ) return false;
  if (
    definition.id === "move_speed" &&
    state.modifiers.moveSpeedFlat >=
      AIRCRAFT_CONFIGS[state.aircraftId].baseStats.moveSpeed * AIR_COMBAT_LIMITS.moveSpeedCoreRatio
  ) return false;
  if (state.aircraftId === "phantom" && definition.id === "mana_capacity") return false;
  return true;
}

function coreNumericValue(id: CoreId, tier: CoreTier): number | null {
  const table = CORE_NUMERIC_VALUES as Record<string, Record<CoreTier, number>>;
  return table[id]?.[tier] ?? null;
}

function formatCoreValue(id: CoreId, tier: CoreTier): string {
  const value = coreNumericValue(id, tier);
  if (value !== null) {
    if (id === "cooldown") return `-${Math.round(value * 100)}% hồi chiêu`;
    if (id === "fire_rate") return `+${value.toFixed(2)}/s`;
    if (id === "move_speed") return `+${value.toFixed(2)} tốc độ`;
    if (id === "repair") return `+${value.toFixed(2)} HP/s`;
    if (id === "mana_regen") return `+${value.toFixed(2)} Mana/s`;
    if (id === "energy_regen") return `+${value.toFixed(2)} Energy/s`;
    return `+${value}`;
  }
  const fixed: Partial<Record<CoreId, string>> = {
    penetration: "+1 xuyên · 45% damage",
    explosive_rounds: "20% splash",
    charged_round: "Phát 8 · ×2.2",
    dual_cannon: "2 × 62%",
    ricochet: "35% dội xạ",
    annihilator_round: "Phát 9 · ×3",
  };
  return fixed[id] || "Nâng cấp kỹ năng";
}

function previewCore(state: AircraftCombatState, id: CoreId, tier: CoreTier): string | undefined {
  const stats = getEffectiveAircraftStats(state);
  const value = coreNumericValue(id, tier);
  if (value === null) return undefined;
  switch (id) {
    case "firepower": return `${stats.firepower.toFixed(0)} → ${(stats.firepower + value).toFixed(0)}`;
    case "armor": return `${stats.armor.toFixed(0)} → ${(stats.armor + value).toFixed(0)}`;
    case "max_hp": return `${stats.maxHp.toFixed(0)} → ${(stats.maxHp + value).toFixed(0)}`;
    case "fire_rate": return `${stats.fireRate.toFixed(2)} → ${(stats.fireRate + value).toFixed(2)}/s`;
    case "move_speed": return `${stats.moveSpeed.toFixed(2)} → ${(stats.moveSpeed + value).toFixed(2)}`;
    case "mana_capacity": return `${stats.maxResource.toFixed(0)} → ${(stats.maxResource + value).toFixed(0)} MP`;
    case "mana_regen": return `${stats.resourceRegen.toFixed(2)} → ${(stats.resourceRegen + value).toFixed(2)}/s`;
    case "energy_regen": return `${stats.resourceRegen.toFixed(2)} → ${(stats.resourceRegen + value).toFixed(2)}/s`;
    default: return undefined;
  }
}

function makeCoreCard(
  state: AircraftCombatState,
  definition: CoreDefinition,
  tier: CoreTier
): CoreCard {
  return {
    id: definition.id,
    tier,
    name: definition.name,
    description: definition.description,
    icon: definition.icon,
    category: definition.category,
    valueLabel: formatCoreValue(definition.id, tier),
    previewLabel: previewCore(state, definition.id, tier),
  };
}

function takeRandom<T>(pool: T[], random: () => number): T | undefined {
  if (pool.length === 0) return undefined;
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
  return pool.splice(index, 1)[0];
}

export function generateCoreChoices(
  state: AircraftCombatState,
  selectionNumber: number,
  random: () => number = Math.random
): CoreCard[] {
  const tier = rollCoreTier(selectionNumber, random);
  const eligible = CORE_DEFINITIONS.filter((definition) =>
    isCoreEligible(state, definition, tier)
  );
  const chosen: CoreDefinition[] = [];
  const offensive = eligible.filter((core) =>
    core.category === "offense" || core.category === "weapon"
  );
  const defensive = eligible.filter((core) =>
    core.category === "defense" || core.category === "mobility"
  );
  const skill = eligible.filter((core) => core.category === "skill");

  const first = takeRandom(offensive, random) || takeRandom([...eligible], random);
  if (first) chosen.push(first);
  const secondPool = defensive.filter((core) => !chosen.includes(core));
  const second = takeRandom(secondPool, random) ||
    takeRandom(eligible.filter((core) => !chosen.includes(core)), random);
  if (second) chosen.push(second);
  const wildcardPool = (tier === "diamond" && selectionNumber === 5 && skill.length > 0
    ? skill
    : eligible
  ).filter((core) => !chosen.includes(core));
  const third = takeRandom(wildcardPool, random) ||
    takeRandom(eligible.filter((core) => !chosen.includes(core)), random);
  if (third) chosen.push(third);

  if (chosen.length < 3) {
    for (const fallback of eligible.filter(
      (definition) => !chosen.some((core) => core.id === definition.id)
    )) {
      chosen.push(fallback);
      if (chosen.length === 3) break;
    }
  }
  return chosen.slice(0, 3).map((definition) => makeCoreCard(state, definition, tier));
}

export function applyCore(
  state: AircraftCombatState,
  card: CoreCard
): boolean {
  if (state.selectedCores.includes(card.id)) return false;
  const value = coreNumericValue(card.id, card.tier) || 0;
  const before = getEffectiveAircraftStats(state);
  switch (card.id) {
    case "firepower": state.modifiers.firepowerFlat += value; break;
    case "armor": state.modifiers.armorFlat += value; break;
    case "max_hp": state.modifiers.maxHpFlat += value; break;
    case "fire_rate": state.modifiers.fireRateFlat += value; break;
    case "move_speed": {
      const cap = AIRCRAFT_CONFIGS[state.aircraftId].baseStats.moveSpeed * AIR_COMBAT_LIMITS.moveSpeedCoreRatio;
      state.modifiers.moveSpeedFlat = Math.min(cap, state.modifiers.moveSpeedFlat + value);
      break;
    }
    case "repair": state.modifiers.hpRegen += value; break;
    case "cooldown":
      state.modifiers.cooldownReduction = Math.min(
        AIR_COMBAT_LIMITS.cooldownReduction,
        state.modifiers.cooldownReduction + value
      );
      break;
    case "mana_capacity":
      if (AIRCRAFT_CONFIGS[state.aircraftId].resourceKind === "mana") {
        state.modifiers.maxResourceFlat += value;
      }
      break;
    case "mana_regen":
      if (AIRCRAFT_CONFIGS[state.aircraftId].resourceKind === "mana") {
        state.modifiers.resourceRegenFlat += value;
      }
      break;
    case "energy_regen":
      if (state.aircraftId === "phantom") state.modifiers.resourceRegenFlat += value;
      break;
    case "penetration":
      state.modifiers.weapon.penetration = Math.max(1, state.modifiers.weapon.penetration);
      state.modifiers.weapon.penetrationDamageMultiplier = 0.45;
      break;
    case "explosive_rounds": state.modifiers.weapon.splashDamageMultiplier = 0.2; break;
    case "charged_round":
      state.modifiers.weapon.chargedEvery = 8;
      state.modifiers.weapon.chargedMultiplier = 2.2;
      break;
    case "dual_cannon":
      state.modifiers.weapon.projectileCount = 2;
      state.modifiers.weapon.perProjectileMultiplier = 0.62;
      break;
    case "ricochet":
      state.modifiers.weapon.bounceCount = 1;
      state.modifiers.weapon.bounceDamageMultiplier = 0.35;
      break;
    case "annihilator_round":
      state.modifiers.weapon.annihilatorEvery = 9;
      state.modifiers.weapon.annihilatorMultiplier = 3;
      break;
    default: {
      const definition = CORE_DEFINITIONS.find((core) => core.id === card.id);
      if (definition?.skillId) state.modifiers.skillUpgrades[definition.skillId] = true;
    }
  }
  state.selectedCores.push(card.id);
  const after = getEffectiveAircraftStats(state);
  if (after.maxHp > before.maxHp) {
    state.currentHp = Math.min(after.maxHp, state.currentHp + (after.maxHp - before.maxHp));
  }
  if (after.resourceKind === "mana" && after.maxResource > before.maxResource) {
    state.currentResource = Math.min(
      after.maxResource,
      state.currentResource + (after.maxResource - before.maxResource)
    );
  }
  if (after.resourceKind === "energy") {
    state.currentResource = Math.min(AIR_COMBAT_LIMITS.phantomMaxEnergy, state.currentResource);
  }
  return true;
}

export function resolveBasicProjectileMultipliers(
  state: AircraftCombatState,
  shotNumber: number
): number[] {
  const weapon = state.modifiers.weapon;
  let special = 1;
  if (weapon.chargedEvery > 0 && shotNumber % weapon.chargedEvery === 0) {
    special *= weapon.chargedMultiplier;
  }
  if (weapon.annihilatorEvery > 0 && shotNumber % weapon.annihilatorEvery === 0) {
    special *= weapon.annihilatorMultiplier;
  }
  if ((state.activeEffects.sweeping_cannon || 0) > 0) {
    const side = getSkillRuntimeValues(state, "sweeping_cannon").sideProjectileMultiplier;
    return [special, side * special, side * special];
  }
  return Array.from(
    { length: Math.max(1, weapon.projectileCount) },
    () => weapon.perProjectileMultiplier * special
  );
}

export function resolveSecondaryDamageEvents(
  weapon: WeaponModifiers
): DamageEvent[] {
  const events: DamageEvent[] = [
    { kind: "primary", multiplier: 1, canTriggerSecondary: false },
  ];
  if (weapon.penetration > 0) {
    events.push({ kind: "penetration", multiplier: weapon.penetrationDamageMultiplier, canTriggerSecondary: false });
  }
  if (weapon.splashDamageMultiplier > 0) {
    events.push({ kind: "splash", multiplier: weapon.splashDamageMultiplier, canTriggerSecondary: false });
  }
  if (weapon.bounceCount > 0) {
    events.push({ kind: "bounce", multiplier: weapon.bounceDamageMultiplier, canTriggerSecondary: false });
  }
  return events;
}

export function clampCircleToGameplayRect(
  x: number,
  y: number,
  radius: number,
  rect: GameplaySafeRect = GAMEPLAY_SAFE_RECT
): { x: number; y: number } {
  return {
    x: Math.max(rect.left + radius, Math.min(rect.right - radius, x)),
    y: Math.max(rect.top + radius, Math.min(rect.bottom - radius, y)),
  };
}

export function getEnemyScaling(wave: number): {
  hp: number;
  damage: number;
  projectileSpeed: number;
} {
  const index = Math.max(0, wave - 1);
  return {
    hp: 1 + 0.11 * index,
    damage: 1 + 0.075 * index,
    projectileSpeed: 1 + 0.04 * index,
  };
}

export function getWaveLabel(elapsedSeconds: number): string {
  let label: string = WAVE_TIMELINE[0].label;
  for (const marker of WAVE_TIMELINE) {
    if (elapsedSeconds >= marker.startsAt) label = marker.label;
    else break;
  }
  return label;
}

export function getWaveNumber(elapsedSeconds: number): number {
  if (elapsedSeconds < 35) return 1;
  if (elapsedSeconds < 90) return 2;
  if (elapsedSeconds < 130) return 3;
  if (elapsedSeconds < 195) return 4;
  return 5;
}

export function getTargetPriority(type: EnemyType): number {
  if (type === "boss") return 0;
  if (type === "elite") return 1;
  if (type === "boss_guard") return 2;
  return 3;
}

export function getComboMultiplier(comboKills: number): 1 | 2 | 3 | 5 {
  if (comboKills >= 50) return 5;
  if (comboKills >= 25) return 3;
  if (comboKills >= 10) return 2;
  return 1;
}

export function calculateRunRank(summary: Omit<AirCombatRunSummary, "rank">): AirCombatRank {
  let points = summary.bossDefeated ? 45 : 0;
  points += Math.min(25, summary.score / 2200);
  points += Math.min(15, summary.maxCombo / 3);
  points += Math.max(0, 15 - summary.hitsReceived * 1.5);
  if (summary.bossDefeated && summary.bossClearSeconds !== null) {
    points += Math.max(0, Math.min(10, (100 - summary.bossClearSeconds) / 4));
  }
  if (points >= 91) return "SS";
  if (points >= 78) return "S";
  if (points >= 62) return "A";
  if (points >= 42) return "B";
  return "C";
}

export function normalizeAircraftStat(
  stat: "hp" | "armor" | "firepower" | "moveSpeed" | "fireRate" | "resource",
  value: number
): number {
  const caps = {
    hp: 2300,
    armor: 90,
    firepower: 180,
    moveSpeed: 27.5,
    fireRate: 6,
    resource: 180,
  };
  return Math.min(100, Math.max(3, Math.round((Math.max(0, value) / caps[stat]) * 100)));
}

export function createDefaultAirCombatProfile(): AirCombatProfile {
  return {
    version: 2,
    highScore: 0,
    highestCombo: 0,
    totalRuns: 0,
    bossClears: 0,
    bestRank: "C",
    bestBossClearSeconds: null,
    preferredAircraft: "black_eagle",
    lastRewardDate: "",
    rewardedRunsToday: 0,
    goldRewardedToday: 0,
    xpRewardedToday: 0,
  };
}

function betterRank(a: AirCombatRank, b: AirCombatRank): AirCombatRank {
  return AIR_COMBAT_RANK_ORDER.indexOf(a) >= AIR_COMBAT_RANK_ORDER.indexOf(b) ? a : b;
}

export function calculateRunReward(
  summary: AirCombatRunSummary,
  profile: AirCombatProfile,
  dateKey: string
): { reward: AirCombatReward; nextProfile: AirCombatProfile } {
  const isSameDay = profile.lastRewardDate === dateKey;
  const rewardedRunsToday = isSameDay ? profile.rewardedRunsToday : 0;
  const goldRewardedToday = isSameDay ? profile.goldRewardedToday : 0;
  const xpRewardedToday = isSameDay ? profile.xpRewardedToday : 0;
  const rewardRate = AIR_COMBAT_REWARD_CONFIG.rewardRates[
    Math.min(rewardedRunsToday, AIR_COMBAT_REWARD_CONFIG.rewardRates.length - 1)
  ];
  const rankIndex = AIR_COMBAT_RANK_ORDER.indexOf(summary.rank);
  const rawGold = Math.min(
    AIR_COMBAT_REWARD_CONFIG.maxGoldPerRun,
    1 + Math.floor(summary.enemiesDefeated / 25) + (summary.bossDefeated ? 2 : 0) + Math.floor(rankIndex / 2)
  );
  const rawXp = Math.min(
    AIR_COMBAT_REWARD_CONFIG.maxXpPerRun,
    1 + Math.floor(summary.survivalSeconds / 100) + (summary.bossDefeated ? 1 : 0)
  );
  const gold = Math.min(
    Math.floor(rawGold * rewardRate),
    Math.max(0, AIR_COMBAT_REWARD_CONFIG.dailyGoldCap - goldRewardedToday)
  );
  const xp = Math.min(
    Math.floor(rawXp * rewardRate),
    Math.max(0, AIR_COMBAT_REWARD_CONFIG.dailyXpCap - xpRewardedToday)
  );
  const nextProfile: AirCombatProfile = {
    ...profile,
    version: 2,
    highScore: Math.max(profile.highScore, summary.score),
    highestCombo: Math.max(profile.highestCombo, summary.maxCombo),
    totalRuns: profile.totalRuns + 1,
    bossClears: profile.bossClears + (summary.bossDefeated ? 1 : 0),
    bestRank: betterRank(profile.bestRank, summary.rank),
    bestBossClearSeconds:
      summary.bossClearSeconds === null
        ? profile.bestBossClearSeconds
        : profile.bestBossClearSeconds === null
          ? summary.bossClearSeconds
          : Math.min(profile.bestBossClearSeconds, summary.bossClearSeconds),
    preferredAircraft: summary.aircraftId,
    lastRewardDate: dateKey,
    rewardedRunsToday: rewardedRunsToday + 1,
    goldRewardedToday: goldRewardedToday + gold,
    xpRewardedToday: xpRewardedToday + xp,
  };
  return {
    reward: {
      gold,
      xp,
      rewardRate,
      dailyCapReached:
        nextProfile.goldRewardedToday >= AIR_COMBAT_REWARD_CONFIG.dailyGoldCap &&
        nextProfile.xpRewardedToday >= AIR_COMBAT_REWARD_CONFIG.dailyXpCap,
    },
    nextProfile,
  };
}

export function coreTierLabel(tier: CoreTier): string {
  return CORE_TIER_LABELS[tier];
}

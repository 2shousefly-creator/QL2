import {
  AIR_COMBAT_LIMITS,
  AIRCRAFT_CONFIGS,
  AIRCRAFT_ORDER,
  CORE_NUMERIC_VALUES,
  ENEMY_ARCHETYPES,
  GAMEPLAY_SAFE_RECT,
} from "./airCombatConfig";
import {
  applyCore,
  applyDamageToAircraft,
  calculateDamage,
  calculateRunRank,
  calculateRunReward,
  canAcquirePlayerTarget,
  castSkill,
  classifySkillPress,
  clampCircleToGameplayRect,
  createAircraftCombatState,
  createDefaultAirCombatProfile,
  gainCombatXp,
  generateCoreChoices,
  getEffectiveAircraftStats,
  getEnemyScaling,
  getSkillRuntimeValues,
  levelUpAircraft,
  requiredCombatXp,
  resolveBasicProjectileMultipliers,
  resolveSecondaryDamageEvents,
  rollCoreTier,
  shouldAutoFire,
  shouldCastSkillPress,
  tickAircraftState,
} from "./airCombatEngine";
import { AirCombatRunSummary, CoreCard, CoreId, CoreTier } from "./airCombatTypes";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

function approximately(actual: number, expected: number, epsilon = 0.0001): boolean {
  return Math.abs(actual - expected) <= epsilon;
}

function card(id: CoreId, tier: CoreTier, valueLabel = "test"): CoreCard {
  return {
    id,
    tier,
    name: id,
    description: id,
    icon: "•",
    category: "offense",
    valueLabel,
  };
}

console.log("=== AIR COMBAT BIG UPDATE ENGINE TESTS ===\n");

assert(AIRCRAFT_ORDER.length === 3, "exactly three aircraft are configured");
assert(ENEMY_ARCHETYPES.length === 5, "five normal enemy archetypes are configured");
assert(AIRCRAFT_CONFIGS.black_eagle.baseStats.maxHp === 1250, "Hắc Ưng base HP is canonical");
assert(AIRCRAFT_CONFIGS.black_eagle.baseStats.maxResource === 110, "Hắc Ưng base Mana is 110");
assert(AIRCRAFT_CONFIGS.black_eagle.baseStats.resourceRegen === 6, "Hắc Ưng base Mana regen is 6/s");
assert(AIRCRAFT_CONFIGS.breaker.baseStats.maxResource === 130, "Phá Quân base Mana is 130");
assert(AIRCRAFT_CONFIGS.breaker.baseStats.resourceRegen === 5, "Phá Quân base Mana regen is 5/s");
assert(AIRCRAFT_CONFIGS.phantom.baseStats.maxResource === 100, "U Linh base Energy is 100");
assert(AIRCRAFT_CONFIGS.phantom.growth.maxResource === 0, "U Linh has no Energy capacity growth");
assert(AIRCRAFT_CONFIGS.black_eagle.baseStats.moveSpeed === 21, "Hắc Ưng base movement is exactly 5× the previous value");
assert(AIRCRAFT_CONFIGS.breaker.baseStats.moveSpeed === 13.5, "Phá Quân base movement is exactly 5× the previous value");
assert(AIRCRAFT_CONFIGS.phantom.baseStats.moveSpeed === 17, "U Linh base movement is exactly 5× the previous value");
assert(AIRCRAFT_CONFIGS.black_eagle.growth.moveSpeed === 0.15, "movement growth scales with the new 5× baseline");
assert(
  CORE_NUMERIC_VALUES.move_speed.silver === 1 &&
    CORE_NUMERIC_VALUES.move_speed.gold === 1.6 &&
    CORE_NUMERIC_VALUES.move_speed.diamond === 2.3,
  "all movement Core tiers scale 5× without changing their relative progression"
);

assert(calculateDamage(200, 0) === 200, "Armor 0 preserves raw damage");
assert(calculateDamage(200, 100) === 100, "Armor 100 halves raw damage");
assert(approximately(calculateDamage(200, 55), 129.032258), "Armor 55 resolves 200 raw to about 129.03");
assert(approximately(calculateDamage(200, 55, 0.55), 70.967742), "45% shield applies after Armor to about 70.97");
assert(!Number.isInteger(calculateDamage(118, 30)), "damage pipeline keeps float precision");

const breakerDamageState = createAircraftCombatState("breaker");
const breakerDamage = applyDamageToAircraft(breakerDamageState, 200, 0.55);
assert(approximately(breakerDamage, 70.967742), "aircraft damage uses the shared float pipeline");

const eagle = createAircraftCombatState("black_eagle");
eagle.currentHp = 1120;
eagle.currentResource = 40;
levelUpAircraft(eagle);
let eagleStats = getEffectiveAircraftStats(eagle);
assert(eagle.level === 2, "Hắc Ưng levels independently");
assert(eagleStats.maxHp === 1268 && eagle.currentHp === 1138, "level adds Max HP and the same Current HP delta");
assert(eagleStats.maxResource === 112 && eagle.currentResource === 42, "Hắc Ưng gains +2 Max/Current Mana without refill");
assert(approximately(eagleStats.resourceRegen, 6.08), "Hắc Ưng gains +0.08 Mana regen per level");

const breaker = createAircraftCombatState("breaker");
breaker.currentResource = 70;
levelUpAircraft(breaker);
const breakerStats = getEffectiveAircraftStats(breaker);
assert(breakerStats.maxResource === 133 && breaker.currentResource === 73, "Phá Quân gains +3 Max/Current Mana without refill");
assert(approximately(breakerStats.resourceRegen, 5.1), "Phá Quân gains +0.10 Mana regen per level");

const phantom = createAircraftCombatState("phantom");
phantom.currentResource = 47;
for (let level = 0; level < 20; level++) levelUpAircraft(phantom);
const phantomStats = getEffectiveAircraftStats(phantom);
assert(phantomStats.maxResource === 100, "U Linh Max Energy remains 100 at high level");
assert(phantom.currentResource === 47, "U Linh level-up does not refill Energy");
assert(approximately(phantomStats.resourceRegen, 6), "U Linh gains only +0.05 Energy regen per level");

const levelState = createAircraftCombatState("black_eagle");
const levelResult = gainCombatXp(levelState, requiredCombatXp(1) + requiredCombatXp(2));
assert(levelState.level === 3, "Combat XP reaches level 3 using the canonical curve");
assert(levelResult.coreSelectionsDue === 1, "level 3 queues one Core Selection");
const milestoneState = createAircraftCombatState("breaker");
const coreMilestones: number[] = [];
while (milestoneState.level < 9) {
  const result = gainCombatXp(milestoneState, requiredCombatXp(milestoneState.level));
  if (result.coreSelectionsDue > 0) coreMilestones.push(milestoneState.level);
}
assert(coreMilestones.join(",") === "3,6,9", "Combat Levels 3, 6 and 9 each queue a Core Selection");

assert(rollCoreTier(5, () => 0) === "diamond", "Core Selection #5 is guaranteed Diamond");
const coreState = createAircraftCombatState("black_eagle");
const fifthChoices = generateCoreChoices(coreState, 5, () => 0.1);
assert(fifthChoices.length === 3, "Core Selection offers exactly three cards");
assert(fifthChoices.every((choice) => choice.tier === "diamond"), "all three cards share the rolled tier");
assert(new Set(fifthChoices.map((choice) => choice.id)).size === 3, "Core cards are distinct within a selection");
assert(fifthChoices.some((choice) => choice.category === "skill"), "guaranteed Diamond selection prioritizes an aircraft skill core");

const phantomChoices = generateCoreChoices(createAircraftCombatState("phantom"), 1, () => 0.1);
assert(!phantomChoices.some((choice) => choice.id === "mana_capacity" || choice.id === "mana_regen"), "U Linh is never offered Mana cores");
const eagleChoices = generateCoreChoices(createAircraftCombatState("black_eagle"), 1, () => 0.1);
assert(!eagleChoices.some((choice) => choice.id === "energy_regen"), "Mana aircraft are never offered Energy cores");

const flatCoreState = createAircraftCombatState("black_eagle");
flatCoreState.currentHp = 1000;
flatCoreState.currentResource = 40;
assert(applyCore(flatCoreState, card("firepower", "gold")), "Firepower core applies once");
assert(getEffectiveAircraftStats(flatCoreState).firepower === 129, "Gold Firepower core adds the canonical flat +11");
assert(applyCore(flatCoreState, card("max_hp", "gold")), "Max HP core applies");
assert(getEffectiveAircraftStats(flatCoreState).maxHp === 1410 && flatCoreState.currentHp === 1160, "Gold HP core adds +160 to Max and Current HP");
assert(applyCore(flatCoreState, card("mana_capacity", "gold")), "Mana capacity core applies");
assert(getEffectiveAircraftStats(flatCoreState).maxResource === 123 && flatCoreState.currentResource === 53, "Mana core adds capacity delta without full refill");
assert(!applyCore(flatCoreState, card("firepower", "gold")), "the same card cannot double-apply");

flatCoreState.modifiers.cooldownReduction = 0.9;
assert(getEffectiveAircraftStats(flatCoreState).cooldownReduction === 0.35, "Cooldown Reduction has a hard 35% cap");
flatCoreState.modifiers.moveSpeedFlat = 99;
assert(
  approximately(
    getEffectiveAircraftStats(flatCoreState).moveSpeed,
    AIRCRAFT_CONFIGS.black_eagle.baseStats.moveSpeed * 1.35
  ),
  "Move Speed core bonus caps at +35% of base"
);

const manaCastState = createAircraftCombatState("black_eagle");
assert(getSkillRuntimeValues(manaCastState, "decoy").cost === 28, "Hắc Ưng Mồi Nhiễu costs 28 Mana");
assert(getSkillRuntimeValues(manaCastState, "afterburner").cost === 36, "Hắc Ưng Tăng Tốc costs 36 Mana");
assert(getSkillRuntimeValues(manaCastState, "missile_swarm").cost === 52, "Hắc Ưng Bầy Tên Lửa costs 52 Mana");
const firstCast = castSkill(manaCastState, "missile_swarm");
assert(firstCast.cast && manaCastState.currentResource === 58, "successful cast deducts Mana exactly once");
const duplicateCast = castSkill(manaCastState, "missile_swarm");
assert(!duplicateCast.cast && duplicateCast.reason === "cooldown" && manaCastState.currentResource === 58, "cooldown prevents cast without double-charging Mana");
manaCastState.currentResource = 5;
manaCastState.cooldowns.decoy = 0;
assert(castSkill(manaCastState, "decoy").reason === "resource", "insufficient Mana prevents cast");
assert(manaCastState.currentResource === 5, "failed cast never makes Mana negative");
const pausedMana = manaCastState.currentResource;
tickAircraftState(manaCastState, 3, false);
assert(manaCastState.currentResource === pausedMana, "Mana does not regenerate while paused");
manaCastState.currentResource = 0;
tickAircraftState(manaCastState, 2, true);
assert(manaCastState.currentResource === 12, "Mana regenerates from the combat time source while gameplay runs");

const breakerSkills = createAircraftCombatState("breaker");
assert(getSkillRuntimeValues(breakerSkills, "armor_shield").cost === 32, "Phá Quân shield costs 32 Mana");
assert(getSkillRuntimeValues(breakerSkills, "heavy_bomb").cost === 50, "Phá Quân bomb costs 50 Mana");
assert(getSkillRuntimeValues(breakerSkills, "sweeping_cannon").cost === 62, "Phá Quân sweep costs 62 Mana");

const invisibleState = createAircraftCombatState("phantom");
assert(castSkill(invisibleState, "invisibility").cast, "U Linh casts invisibility with sufficient Energy");
assert(invisibleState.currentResource === 78, "invisibility costs 22 Energy");
assert(!canAcquirePlayerTarget(invisibleState), "enemies cannot acquire an invisible U Linh");
assert(!shouldAutoFire(invisibleState), "auto-fire pauses during invisibility");
tickAircraftState(invisibleState, 3.1, true);
assert(canAcquirePlayerTarget(invisibleState) && shouldAutoFire(invisibleState), "targeting and auto-fire resume after invisibility");

const droneState = createAircraftCombatState("phantom");
assert(castSkill(droneState, "escort_drone").cast && droneState.droneActive, "Drone activation costs Energy and enables the Drone");
assert(droneState.currentResource === 90, "Drone activation costs exactly 10 Energy");
tickAircraftState(droneState, 1, true);
assert(approximately(droneState.currentResource, 88), "base Drone net drain is 2 Energy/s after passive regen");
droneState.currentResource = 1;
tickAircraftState(droneState, 1, true);
assert(droneState.currentResource === 0 && !droneState.droneActive, "Drone retracts at zero Energy without going negative");

const weaponState = createAircraftCombatState("black_eagle");
applyCore(weaponState, card("dual_cannon", "diamond"));
applyCore(weaponState, card("explosive_rounds", "gold"));
applyCore(weaponState, card("penetration", "gold"));
applyCore(weaponState, card("ricochet", "diamond"));
assert(resolveBasicProjectileMultipliers(weaponState, 1).length === 2, "Song Pháo creates exactly two basic projectiles");
const events = resolveSecondaryDamageEvents(weaponState.modifiers.weapon);
assert(events.length === 4, "weapon modifier combo produces bounded primary/penetration/splash/bounce events");
assert(events.every((event) => !event.canTriggerSecondary), "secondary damage cannot recurse or loop");

const sweepState = createAircraftCombatState("breaker");
sweepState.activeEffects.sweeping_cannon = 3;
applyCore(sweepState, card("dual_cannon", "diamond"));
assert(resolveBasicProjectileMultipliers(sweepState, 1).length === 3, "Pháo Quét defines one bounded three-direction pattern with multi-shot cores");

assert(classifySkillPress(120) === "tap", "short skill press casts");
assert(classifySkillPress(400) === "hold", "hold >= 0.4s opens tooltip instead of casting");
assert(shouldCastSkillPress(120, false, false), "tap release authorizes exactly one skill cast");
assert(!shouldCastSkillPress(450, true, false), "release after a long press never casts");
assert(!shouldCastSkillPress(120, false, true), "cancelled pointer input never casts");

const clamped = clampCircleToGameplayRect(-100, -100, 20);
assert(clamped.x >= GAMEPLAY_SAFE_RECT.left + 20, "GameplaySafeRect clamps horizontal bounds by collider radius");
assert(clamped.y >= GAMEPLAY_SAFE_RECT.top + 20, "GameplaySafeRect keeps combat entities below HUD boundary");
const waveFiveScaling = getEnemyScaling(5);
assert(approximately(waveFiveScaling.hp, 1.44), "wave HP scaling is linear at +11% per wave");
assert(approximately(waveFiveScaling.damage, 1.3), "wave damage scaling is linear at +7.5% per wave");
assert(approximately(waveFiveScaling.projectileSpeed, 1.16), "projectile speed scales +4% per wave");

const summaryWithoutRank: Omit<AirCombatRunSummary, "rank"> = {
  aircraftId: "black_eagle",
  score: 82_000,
  enemiesDefeated: 90,
  elitesDefeated: 2,
  bossDefeated: true,
  maxCombo: 38,
  survivalSeconds: 284,
  combatLevel: 16,
  finalFirepower: 182,
  damageDealt: 41_000,
  damageTaken: 480,
  hitsReceived: 3,
  bossClearSeconds: 72,
  destroyed: false,
};
const rank = calculateRunRank(summaryWithoutRank);
assert(["A", "S", "SS"].includes(rank), "successful clean Boss run earns a high result rank");
const summary: AirCombatRunSummary = { ...summaryWithoutRank, rank };
const profile = createDefaultAirCombatProfile();
const firstReward = calculateRunReward(summary, profile, "2026-08-19");
assert(firstReward.reward.gold > 0 && firstReward.reward.xp > 0, "first daily clear grants a small capped reward");
let dailyProfile = profile;
let finalReward = firstReward.reward;
for (let run = 0; run < 8; run++) {
  const result = calculateRunReward(summary, dailyProfile, "2026-08-19");
  dailyProfile = result.nextProfile;
  finalReward = result.reward;
}
assert(finalReward.gold === 0 && finalReward.xp === 0, "repeated daily runs diminish to zero reward");
assert(dailyProfile.goldRewardedToday <= 16 && dailyProfile.xpRewardedToday <= 12, "global economy reward caps are preserved");

console.log("\nALL AIR COMBAT BIG UPDATE ENGINE TESTS PASSED");

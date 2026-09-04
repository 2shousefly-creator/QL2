import {
  dismissAnimal,
  feedPenBuff,
  projectPenState,
  settleFarmState,
} from "./farmEngine";
import {
  CURRENT_FARM_SCHEMA_VERSION,
  createDefaultFarmState,
  migrateFarmState,
} from "./farmMigration";
import { ANIMAL_CATALOG, FEED_CATALOG } from "./farmCatalog";
import type {
  AnimalTypeId,
  FarmSaveState,
  PenAnimalState,
} from "./farmTypes";
import { PEN_STARVATION_DURATION_MS } from "./animalLifecycle";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Assertion Failed: ${message}`);
  console.log(`✓ ${message}`);
}

function almostEqual(
  actual: number,
  expected: number,
  tolerance = 1e-4
): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

function getAnimalDefinition(animalTypeId: AnimalTypeId) {
  const definition = ANIMAL_CATALOG.find(
    (animal) => animal.id === animalTypeId
  );
  if (!definition) throw new Error(`Missing animal definition: ${animalTypeId}`);
  return definition;
}

function makeAnimal(
  instanceId: string,
  animalTypeId: AnimalTypeId,
  addedAt: number,
  eggWorkRemainingMs?: number,
  eggLastUpdatedAt: number = addedAt
): PenAnimalState {
  const definition = getAnimalDefinition(animalTypeId);
  const remaining = eggWorkRemainingMs ?? definition.eggIntervalMs;
  return {
    instanceId,
    animalTypeId,
    addedAt,
    cycleStartedAt: addedAt,
    nextEggAt: eggLastUpdatedAt + remaining,
    eggWorkTotalMs: definition.eggIntervalMs,
    eggWorkRemainingMs: remaining,
    eggLastUpdatedAt,
    lifeStartedAt: addedAt,
    lifeEndsAt: addedAt + definition.lifespanMs,
    deathAt: null,
    deathCause: null,
    isBuffed: false,
  };
}

function createPenFarm(
  stateAt: number,
  livingCount: number,
  feedValue = 100,
  speedBonus = 25,
  animalTypeId: AnimalTypeId = "muscovy_duck"
): FarmSaveState {
  const farm = createDefaultFarmState(stateAt);
  farm.lastSettledAt = stateAt;
  farm.penFeedBuffValue = feedValue;
  farm.penFeedBuffUpdatedAt = stateAt;
  farm.activeFeedSpeedBonus = feedValue > 0 ? speedBonus : 0;
  farm.penStarvationStartedAt = feedValue > 0 || livingCount === 0
    ? null
    : stateAt;
  farm.penAnimals = Array.from({ length: livingCount }, (_, index) =>
    makeAnimal(`animal-${index}`, animalTypeId, stateAt)
  );
  return farm;
}

console.log("=== TĂNG GIA FEED + EGG TIMELINE REGRESSION TESTS ===\n");

const base = 1_800_000_000_000;
const fullTrough = createPenFarm(base, 4);
const rawBeforeProjection = JSON.stringify(fullTrough);
const atStart = projectPenState(fullTrough, base);
const afterOneHour = projectPenState(fullTrough, base + HOUR);
const afterFourAndHalfHours = projectPenState(fullTrough, base + 4.5 * HOUR);
const afterNineHours = projectPenState(fullTrough, base + 9 * HOUR);

assert(atStart.penFeedBuffValue === 100, "Case A: four animals start with a 100% trough");
assert(
  almostEqual(afterOneHour.penFeedBuffValue, 88.8889, 0.0002),
  "Case A: four animals consume 11.1111% Feed in one hour"
);
assert(
  almostEqual(afterFourAndHalfHours.penFeedBuffValue, 50, 0.0001),
  "Case A: four animals leave exactly 50% Feed after 4h30"
);
assert(afterNineHours.penFeedBuffValue === 0, "Case A: four animals empty a full trough at 9h");
assert(
  atStart.penFeedEmptyAt === base + 9 * HOUR &&
    afterOneHour.penFeedEmptyAt === base + 9 * HOUR &&
    afterFourAndHalfHours.penFeedEmptyAt === base + 9 * HOUR,
  "Case A: Feed empty ETA remains fixed instead of rebasing from each render"
);

const repeatedProjectionA = projectPenState(fullTrough, base + HOUR);
const repeatedProjectionB = projectPenState(fullTrough, base + HOUR);
assert(
  JSON.stringify(repeatedProjectionA) === JSON.stringify(repeatedProjectionB),
  "Case B: repeated projection at the same timestamp is deterministic"
);
assert(
  JSON.stringify(fullTrough) === rawBeforeProjection,
  "Case B: projection never mutates persisted Farm state"
);

const afterOneMinute = projectPenState(fullTrough, base + MINUTE);
const afterTwoMinutes = projectPenState(fullTrough, base + 2 * MINUTE);
assert(
  almostEqual(
    afterOneMinute.penFeedBuffValue - afterTwoMinutes.penFeedBuffValue,
    100 / (9 * 60),
    0.0002
  ),
  "Case C: Feed advances by exactly one additional minute"
);
assert(
  almostEqual(
    afterOneMinute.penAnimals[0].eggWorkRemainingMs! -
      afterTwoMinutes.penAnimals[0].eggWorkRemainingMs!,
    1.25 * MINUTE,
    1
  ),
  "Case C: egg workload advances one minute at the active +25% rate"
);
assert(
  afterOneMinute.penAnimals[0].nextEggAt ===
    afterTwoMinutes.penAnimals[0].nextEggAt,
  "Case C: repeated projection does not move the egg completion horizon"
);

const rescueFarm = createPenFarm(base, 4);
const rescueAt = base + 12 * HOUR;
const rescueBeforeRefill = projectPenState(rescueFarm, rescueAt);
rescueFarm.inventory.feed.feed_super = 1;
const rescueResult = feedPenBuff(rescueFarm, "feed_super", 1, rescueAt);
assert(rescueResult.success, "Case D: refill before the starvation deadline succeeds");
assert(
  rescueFarm.penStarvationStartedAt === null &&
    rescueFarm.penAnimals.every((animal) => animal.deathAt === null),
  "Case D: refill cancels Danger without reviving or killing livestock"
);
assert(
  rescueFarm.penFeedBuffValue === 20 &&
    rescueFarm.penFeedBuffUpdatedAt === rescueAt,
  "Case D: new Feed starts from the refill transaction timestamp"
);
assert(
  rescueFarm.penAnimals.every((animal, index) =>
    almostEqual(
      animal.eggWorkRemainingMs!,
      rescueBeforeRefill.penAnimals[index].eggWorkRemainingMs!,
      1
    )
  ),
  "Case D: Danger-to-refill preserves all materialized egg workload"
);
const oneMinuteAfterRescue = projectPenState(rescueFarm, rescueAt + MINUTE);
assert(
  almostEqual(
    rescueFarm.penAnimals[0].eggWorkRemainingMs! -
      oneMinuteAfterRescue.penAnimals[0].eggWorkRemainingMs!,
    1.25 * MINUTE,
    1
  ),
  "Case D: the new bonus applies only after the refill timestamp"
);

const uiSettledRefill = createPenFarm(base, 4, 40, 16);
uiSettledRefill.inventory.feed.feed_super = 1;
const uiRefillAt = base + HOUR;
settleFarmState(uiSettledRefill, uiRefillAt);
const uiRemainingBeforeRefill = uiSettledRefill.penAnimals.map(
  (animal) => animal.eggWorkRemainingMs
);
const uiEggsBeforeRefill = JSON.stringify(uiSettledRefill.inventory.eggs);
const uiFeedBeforeRefill = uiSettledRefill.penFeedBuffValue;
const uiRefillResult = feedPenBuff(
  uiSettledRefill,
  "feed_super",
  1,
  uiRefillAt
);
assert(uiRefillResult.success, "Case D: the already-settled UI refill succeeds");
assert(
  uiSettledRefill.penAnimals.every((animal, index) =>
    almostEqual(
      animal.eggWorkRemainingMs!,
      uiRemainingBeforeRefill[index]!,
      1
    )
  ) && JSON.stringify(uiSettledRefill.inventory.eggs) === uiEggsBeforeRefill,
  "Case D: the UI settle plus engine guard never advances eggs twice"
);
assert(
  almostEqual(
    uiSettledRefill.penFeedBuffValue,
    uiFeedBeforeRefill + 20,
    0.0001
  ),
  "Case D: the UI settle plus refill applies Feed exactly once"
);

const emptyPenFarm = createPenFarm(base, 0, 60, 16);
const emptyPenProjection = projectPenState(emptyPenFarm, base + 10 * HOUR);
assert(
  emptyPenProjection.penFeedBuffValue === 60 &&
    emptyPenProjection.penFeedEmptyAt === null,
  "Case E: Feed is preserved while there are no living animals"
);
settleFarmState(emptyPenFarm, base + 10 * HOUR);
assert(
  emptyPenFarm.penFeedBuffValue === 60 &&
    emptyPenFarm.penFeedBuffUpdatedAt === base + 10 * HOUR,
  "Case E: persisted no-animal settlement advances the zero-rate Feed segment"
);

const countChangeFarm = createPenFarm(base, 4);
assert(
  dismissAnimal(countChangeFarm, "animal-3", base + HOUR),
  "Case F: dismissing one animal succeeds at the transaction timestamp"
);
assert(
  almostEqual(countChangeFarm.penFeedBuffValue, 88.8889, 0.0002),
  "Case F: the first hour is consumed using the old count of four"
);
const afterCountChange = projectPenState(countChangeFarm, base + 2 * HOUR);
assert(
  almostEqual(afterCountChange.penFeedBuffValue, 78.8889, 0.0002),
  "Case F: future consumption uses the new count of three without retroactive rate"
);

const frozenV9 = createPenFarm(base, 4) as FarmSaveState;
frozenV9.schemaVersion = 9;
frozenV9.lastSettledAt = base + 8 * HOUR;
frozenV9.gold = 987;
frozenV9.inventory.feed.feed_good = 7;
const frozenNonEggInventory = JSON.stringify({
  seeds: frozenV9.inventory.seeds,
  animals: frozenV9.inventory.animals,
  feed: frozenV9.inventory.feed,
  fertilizer: frozenV9.inventory.fertilizer,
});
const frozenEggCount = Object.values(frozenV9.inventory.eggs).reduce(
  (sum, count) => sum + count,
  0
);
const frozenPlotStatuses = frozenV9.plots.map((plot) => plot.status).join("|");
const migratedFrozenV9 = migrateFarmState(frozenV9, base + 10 * HOUR);
const migratedFrozenAgain = migrateFarmState(
  migratedFrozenV9,
  base + 10 * HOUR
);
assert(
  CURRENT_FARM_SCHEMA_VERSION === 9,
  "Case G: repair reuses the existing v9 authoritative timestamps without a schema reset"
);
assert(
  JSON.stringify(migratedFrozenAgain) === JSON.stringify(migratedFrozenV9),
  "Case G: v9 normalization remains idempotent"
);
assert(
  migratedFrozenV9.penFeedBuffUpdatedAt === base &&
    migratedFrozenV9.penFeedBuffValue === 100,
  "Case G: migration preserves the old Feed amount and its historical anchor"
);
settleFarmState(migratedFrozenV9, base + 10 * HOUR);
assert(
  Number(migratedFrozenV9.penFeedBuffValue) === 0 &&
    migratedFrozenV9.penStarvationStartedAt === base + 9 * HOUR,
  "Case G: first settlement consumes a frozen v9 trough from its real timestamp"
);
assert(migratedFrozenV9.gold === 987, "Case G: repair preserves Gold");
assert(
  JSON.stringify({
    seeds: migratedFrozenV9.inventory.seeds,
    animals: migratedFrozenV9.inventory.animals,
    feed: migratedFrozenV9.inventory.feed,
    fertilizer: migratedFrozenV9.inventory.fertilizer,
  }) === frozenNonEggInventory,
  "Case G: repair preserves non-egg inventory"
);
assert(
  Object.values(migratedFrozenV9.inventory.eggs).reduce(
    (sum, count) => sum + count,
    0
  ) >= frozenEggCount,
  "Case G: repair never removes existing eggs"
);
assert(
  migratedFrozenV9.plots.map((plot) => plot.status).join("|") ===
    frozenPlotStatuses,
  "Case G: repair preserves crop plot ownership and status"
);
assert(
  migratedFrozenV9.penAnimals.length === 4,
  "Case G: repair preserves livestock"
);

const legacyEggFarm = createPenFarm(base, 1, 50, 25);
legacyEggFarm.lastSettledAt = base + 2 * HOUR;
legacyEggFarm.penAnimals[0].eggLastUpdatedAt = base + HOUR;
legacyEggFarm.penAnimals[0].nextEggAt = base + 5 * HOUR;
delete legacyEggFarm.penAnimals[0].eggWorkRemainingMs;
const migratedLegacyEggFarm = migrateFarmState(
  legacyEggFarm,
  base + 10 * HOUR
);
assert(
  migratedLegacyEggFarm.penAnimals[0].eggLastUpdatedAt === base + HOUR &&
    almostEqual(
      migratedLegacyEggFarm.penAnimals[0].eggWorkRemainingMs!,
      5 * HOUR,
      1
    ),
  "Case G: timestamp-only legacy egg work is reconstructed once at its own anchor"
);

const eggRepairFarm = createPenFarm(base, 1, 0, 0);
eggRepairFarm.lastSettledAt = base + 2 * HOUR;
eggRepairFarm.penFeedBuffUpdatedAt = base;
eggRepairFarm.penStarvationStartedAt = base;
eggRepairFarm.penAnimals[0] = makeAnimal(
  "egg-repair",
  "muscovy_duck",
  base,
  5 * HOUR,
  base
);
eggRepairFarm.inventory.feed.feed_super = 1;
const eggRefillAt = base + 3 * HOUR;
const eggRefillResult = feedPenBuff(
  eggRepairFarm,
  "feed_super",
  1,
  eggRefillAt
);
assert(eggRefillResult.success, "Case H: refilling the independently anchored egg save succeeds");
assert(
  almostEqual(eggRepairFarm.penAnimals[0].eggWorkRemainingMs!, 2 * HOUR, 1),
  "Case H: refill advances old egg work before changing the rate"
);
assert(
  almostEqual(
    eggRepairFarm.penAnimals[0].nextEggAt,
    eggRefillAt + (2 * HOUR) / 1.25,
    1
  ),
  "Case H: refill derives ETA from remaining work instead of resetting the cycle"
);

const atFiveHours = projectPenState(fullTrough, base + 5 * HOUR);
const atTenHours = projectPenState(fullTrough, base + 10 * HOUR);
const afterDangerDeadline = projectPenState(
  fullTrough,
  base + 9 * HOUR + PEN_STARVATION_DURATION_MS
);
assert(
  almostEqual(atFiveHours.penFeedBuffValue, 44.4444, 0.0002) &&
    atFiveHours.penFeedEmptyAt === base + 9 * HOUR,
  "Offline: opening after 5h shows 44.4444% and the original empty ETA"
);
assert(
  atTenHours.penFeedBuffValue === 0 &&
    atTenHours.penStarvationStartedAt === base + 9 * HOUR,
  "Offline: opening after depletion restores Danger from the exact 9h boundary"
);
assert(
  afterDangerDeadline.penAnimals.every(
    (animal) => animal.deathAt === base + 9 * HOUR + PEN_STARVATION_DURATION_MS
  ),
  "Offline: lifecycle continues through the starvation deadline"
);

const durationHours = [12, 11, 10, 9, 8];
for (let count = 1; count <= 5; count += 1) {
  const farm = createPenFarm(base, count);
  assert(
    projectPenState(farm, base).penFeedEmptyAt ===
      base + durationHours[count - 1] * HOUR,
    `Balance: ${count} living animal(s) keep the ${durationHours[count - 1]}h trough duration`
  );
}
assert(
  FEED_CATALOG.map((feed) => [feed.id, feed.buffAmount, feed.speedBonusPercent])
    .map((entry) => entry.join(":"))
    .join("|") ===
    "feed_normal:20:10|feed_good:20:16|feed_super:20:25",
  "Balance: Feed capacity and egg speed bonuses remain 20% / +10,+16,+25"
);
assert(
  getAnimalDefinition("muscovy_duck").eggIntervalMs === 10.5 * HOUR,
  "Balance: Ngan keeps its 10h30 base egg interval"
);

console.log("\nALL FEED + EGG TIMELINE REGRESSION TESTS PASSED");

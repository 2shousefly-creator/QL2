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
import { createInitialGameState } from "../../storage/GameRepository";
import { sanitizeAndMigrateState } from "../../storage/migrations";

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

/**
 * Reproduces the rebase-only snapshot that f0b72c4 could persist when
 * farm.lastSettledAt had already reached rebaseAt: the old runPenTimeline had
 * a zero-length interval, then still wrote penFeedBuffUpdatedAt = safeEndT;
 * ensureAnimalEggWork likewise wrote eggLastUpdatedAt = stateAt without first
 * reducing an already-materialized workload.
 */
function persistLegacyRebaseOnlySnapshot(
  farm: FarmSaveState,
  rebaseAt: number,
  clocks: { feed: boolean; eggs: boolean }
): FarmSaveState {
  farm.schemaVersion = 9;
  farm.lastSettledAt = rebaseAt;
  if (clocks.feed) farm.penFeedBuffUpdatedAt = rebaseAt;
  if (clocks.eggs) {
    for (const animal of farm.penAnimals) {
      if (animal.deathAt !== null) continue;
      animal.eggLastUpdatedAt = rebaseAt;
      const projection = projectPenState(farm, rebaseAt).penAnimals.find(
        (candidate) => candidate.instanceId === animal.instanceId
      );
      if (projection) animal.nextEggAt = projection.nextEggAt;
    }
  }
  return farm;
}

function loadFarmThroughSavePipeline(
  farm: FarmSaveState,
  migrationNow: number
): FarmSaveState {
  const state = createInitialGameState("Pen timeline test");
  state.farm = farm;
  const loaded = sanitizeAndMigrateState(
    JSON.parse(JSON.stringify(state)),
    migrationNow
  );
  if (!loaded.farm) throw new Error("Farm disappeared during save/load");
  return loaded.farm;
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
  base + 11 * HOUR
);
assert(
  CURRENT_FARM_SCHEMA_VERSION === 10 && migratedFrozenV9.schemaVersion === 10,
  "Case G: v9 saves receive the one-time schema-10 pen-clock repair marker"
);
assert(
  JSON.stringify(migratedFrozenAgain) === JSON.stringify(migratedFrozenV9),
  "Case G: schema-10 migration is idempotent even at a later load timestamp"
);
assert(
  migratedFrozenV9.penFeedBuffUpdatedAt === base &&
    migratedFrozenV9.penFeedBuffValue === 100,
  "Case G: a strictly historical Feed anchor remains authoritative"
);
assert(
  migratedFrozenV9.penAnimals.every(
    (animal) => animal.eggLastUpdatedAt === base
  ),
  "Case G: strictly historical egg-work anchors remain authoritative"
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

const legacyRebaseAt = base + 4 * HOUR;
const repairAt = base + 5 * HOUR;

const staleFeedV9 = persistLegacyRebaseOnlySnapshot(
  createPenFarm(base, 4),
  legacyRebaseAt,
  { feed: true, eggs: false }
);
const repairedStaleFeed = migrateFarmState(staleFeedV9, repairAt);
const repairedFeedAtStart = projectPenState(repairedStaleFeed, repairAt);
const repairedFeedAfterHour = projectPenState(
  repairedStaleFeed,
  repairAt + HOUR
);
assert(
  repairedStaleFeed.penFeedBuffValue === 100 &&
    repairedStaleFeed.penFeedBuffUpdatedAt === repairAt &&
    repairedStaleFeed.lastSettledAt === repairAt,
  "Case H1: stale Feed plus a rebased v9 anchor is preserved and re-anchored once"
);
assert(
  repairedFeedAtStart.penFeedEmptyAt === repairAt + 9 * HOUR &&
    repairedFeedAfterHour.penFeedEmptyAt === repairAt + 9 * HOUR &&
    almostEqual(repairedFeedAfterHour.penFeedBuffValue, 88.8889, 0.0002),
  "Case H1: repaired Feed immediately resumes consumption with a fixed ETA"
);

const staleEggV9 = persistLegacyRebaseOnlySnapshot(
  createPenFarm(base, 4),
  legacyRebaseAt,
  { feed: false, eggs: true }
);
const staleEggWork = staleEggV9.penAnimals[0].eggWorkRemainingMs!;
const repairedStaleEgg = migrateFarmState(staleEggV9, repairAt);
const repairedEggAfterMinute = projectPenState(
  repairedStaleEgg,
  repairAt + MINUTE
);
assert(
  repairedStaleEgg.penAnimals[0].eggWorkRemainingMs === staleEggWork &&
    repairedStaleEgg.penAnimals[0].eggLastUpdatedAt === repairAt,
  "Case H2: stale egg workload plus a rebased v9 anchor is preserved and re-anchored once"
);
assert(
  almostEqual(
    staleEggWork - repairedEggAfterMinute.penAnimals[0].eggWorkRemainingMs!,
    1.25 * MINUTE,
    1
  ),
  "Case H2: repaired egg workload resumes at the active +25% rate"
);

const bothCorruptV9 = persistLegacyRebaseOnlySnapshot(
  createPenFarm(base, 4),
  legacyRebaseAt,
  { feed: true, eggs: true }
);
bothCorruptV9.gold = 4_321;
bothCorruptV9.inventory.feed.feed_good = 7;
bothCorruptV9.inventory.eggs.duck_egg = 3;
const bothCorruptData = JSON.stringify({
  gold: bothCorruptV9.gold,
  inventory: bothCorruptV9.inventory,
  plots: bothCorruptV9.plots,
  animals: bothCorruptV9.penAnimals.map((animal) => ({
    instanceId: animal.instanceId,
    animalTypeId: animal.animalTypeId,
    deathAt: animal.deathAt,
  })),
});
const repairedBoth = loadFarmThroughSavePipeline(bothCorruptV9, repairAt);
const repairedBothAgain = migrateFarmState(repairedBoth, repairAt + HOUR);
assert(
  repairedBoth.penFeedBuffUpdatedAt === repairAt &&
    repairedBoth.penAnimals.every(
      (animal) => animal.eggLastUpdatedAt === repairAt
    ),
  "Case H3: a combined corrupt v9 snapshot repairs Feed and every living egg clock"
);
assert(
  JSON.stringify(repairedBothAgain) === JSON.stringify(repairedBoth),
  "Case H3: the combined repair is never repeated on schema 10"
);
assert(
  JSON.stringify({
    gold: repairedBoth.gold,
    inventory: repairedBoth.inventory,
    plots: repairedBoth.plots,
    animals: repairedBoth.penAnimals.map((animal) => ({
      instanceId: animal.instanceId,
      animalTypeId: animal.animalTypeId,
      deathAt: animal.deathAt,
    })),
  }) === bothCorruptData,
  "Case H3: repair preserves Gold, inventory, plots, livestock and existing eggs"
);

const dangerStartedAt = base + 9 * HOUR;
const dangerRebaseAt = base + 10 * HOUR;
const dangerRepairAt = base + 10.5 * HOUR;
const dangerCorruptV9 = createPenFarm(base, 4, 0, 0);
dangerCorruptV9.penStarvationStartedAt = dangerStartedAt;
for (const animal of dangerCorruptV9.penAnimals) {
  animal.eggWorkRemainingMs = 6 * HOUR;
}
persistLegacyRebaseOnlySnapshot(dangerCorruptV9, dangerRebaseAt, {
  feed: true,
  eggs: true,
});
dangerCorruptV9.inventory.feed.feed_super = 1;
const repairedDanger = migrateFarmState(dangerCorruptV9, dangerRepairAt);
const dangerWorkAtRepair = repairedDanger.penAnimals[0].eggWorkRemainingMs!;
const dangerRefillAt = base + 11 * HOUR;
const dangerRefill = feedPenBuff(
  repairedDanger,
  "feed_super",
  1,
  dangerRefillAt
);
assert(
  dangerRefill.success &&
    repairedDanger.penStarvationStartedAt === null &&
    repairedDanger.penAnimals.every((animal) => animal.deathAt === null),
  "Case H4: refill before the trusted Danger deadline rescues a corrupt save"
);
assert(
  almostEqual(
    repairedDanger.penAnimals[0].eggWorkRemainingMs!,
    dangerWorkAtRepair - 0.5 * HOUR,
    1
  ),
  "Case H4: pre-refill egg progress is kept without resetting the cycle"
);
const dangerMinuteLater = projectPenState(
  repairedDanger,
  dangerRefillAt + MINUTE
);
assert(
  almostEqual(
    repairedDanger.penAnimals[0].eggWorkRemainingMs! -
      dangerMinuteLater.penAnimals[0].eggWorkRemainingMs!,
    1.25 * MINUTE,
    1
  ),
  "Case H4: the new +25% bonus starts only after the refill"
);

const roundTripFarm = createPenFarm(base, 4, 40, 16);
settleFarmState(roundTripFarm, base + HOUR);
const firstLoad = loadFarmThroughSavePipeline(roundTripFarm, base + 2 * HOUR);
const firstProjection = projectPenState(firstLoad, base + 2 * HOUR);
const secondLoad = loadFarmThroughSavePipeline(
  firstLoad,
  base + 3 * HOUR
);
const secondProjection = projectPenState(secondLoad, base + 2 * HOUR);
assert(
  firstLoad.penFeedBuffUpdatedAt === roundTripFarm.penFeedBuffUpdatedAt &&
    firstLoad.penAnimals[0].eggLastUpdatedAt ===
      roundTripFarm.penAnimals[0].eggLastUpdatedAt &&
    secondLoad.penFeedBuffUpdatedAt === firstLoad.penFeedBuffUpdatedAt &&
    secondLoad.penAnimals[0].eggLastUpdatedAt ===
      firstLoad.penAnimals[0].eggLastUpdatedAt,
  "Case I: JSON save/load does not rebase canonical Feed or egg anchors"
);
assert(
  firstProjection.penFeedEmptyAt === secondProjection.penFeedEmptyAt &&
    firstProjection.penAnimals[0].nextEggAt ===
      secondProjection.penAnimals[0].nextEggAt,
  "Case I: Feed and egg ETAs survive repeated save/load projection"
);

const actionRoundTrip = createPenFarm(base, 4, 40, 16);
actionRoundTrip.inventory.feed.feed_super = 1;
settleFarmState(actionRoundTrip, base + HOUR);
const actionWorkBeforeFeed = actionRoundTrip.penAnimals[0].eggWorkRemainingMs!;
const actionFeed = feedPenBuff(
  actionRoundTrip,
  "feed_super",
  1,
  base + HOUR
);
const actionLoaded = loadFarmThroughSavePipeline(
  actionRoundTrip,
  base + HOUR
);
const actionMinuteLater = projectPenState(actionLoaded, base + HOUR + MINUTE);
assert(
  actionFeed.success &&
    actionLoaded.penAnimals[0].eggWorkRemainingMs === actionWorkBeforeFeed,
  "Case J: settle -> feed -> save -> reload keeps the materialized egg workload"
);
assert(
  almostEqual(
    actionLoaded.penAnimals[0].eggWorkRemainingMs! -
      actionMinuteLater.penAnimals[0].eggWorkRemainingMs!,
    1.25 * MINUTE,
    1
  ) && actionMinuteLater.penFeedBuffValue < actionLoaded.penFeedBuffValue,
  "Case J: both clocks continue one minute after the action round-trip"
);

const futureSkewFarm = createPenFarm(base, 4, 40, 16);
const futureAnchor = base + 10 * HOUR;
futureSkewFarm.lastSettledAt = futureAnchor;
futureSkewFarm.penFeedBuffUpdatedAt = futureAnchor;
for (const animal of futureSkewFarm.penAnimals) {
  animal.eggLastUpdatedAt = futureAnchor;
}
futureSkewFarm.inventory.feed.feed_normal = 1;
const futureSkewWork = futureSkewFarm.penAnimals[0].eggWorkRemainingMs!;
const trustedActionAt = base + HOUR;
const futureSkewFeed = feedPenBuff(
  futureSkewFarm,
  "feed_normal",
  1,
  trustedActionAt
);
assert(
  futureSkewFeed.success &&
    futureSkewFarm.lastSettledAt === trustedActionAt &&
    futureSkewFarm.penFeedBuffUpdatedAt === trustedActionAt &&
    futureSkewFarm.penAnimals.every(
      (animal) => animal.eggLastUpdatedAt === trustedActionAt
    ),
  "Case K: future-skewed anchors cannot push an action past its trusted wall-clock"
);
assert(
  futureSkewFarm.penAnimals[0].eggWorkRemainingMs === futureSkewWork,
  "Case K: future-skew repair preserves workload instead of inventing progress"
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

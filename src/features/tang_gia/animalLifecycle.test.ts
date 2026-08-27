import {
  ANIMAL_CATALOG,
  EGG_INFO_MAP,
} from "./farmCatalog";
import {
  ANIMAL_MAX_VISUAL_SCALE,
  ANIMAL_MIN_VISUAL_SCALE,
  PEN_STARVATION_DURATION_MS,
  formatAnimalEggCountdown,
  getAnimalAgeMovementMultiplier,
  getAnimalFacingForDelta,
  getAnimalLifeBarTone,
  getAnimalLifeRemainingRatio,
  getAnimalOverlayOffsets,
  getAnimalOverlayScale,
  getAnimalVisualScale,
  getLivingAnimalCount,
  getPenDangerRatio,
  isAnimalDead,
} from "./animalLifecycle";
import {
  addAnimalToPen,
  consumePendingAnimalDeathNotification,
  createDefaultFarmState,
  dismissAnimal,
  feedPenBuff,
  settleFarmState,
} from "./farmEngine";
import type {
  AnimalTypeId,
  FarmSaveState,
  PenAnimalState,
} from "./farmTypes";
import { migrateFarmState } from "./farmMigration";

const HOUR = 60 * 60 * 1000;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Assertion Failed: ${message}`);
  console.log(`✓ ${message}`);
}

function almostEqual(actual: number, expected: number, tolerance = 1e-7): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

function createFarmAt(now: number): FarmSaveState {
  const realNow = Date.now;
  Date.now = () => now;
  try {
    return createDefaultFarmState();
  } finally {
    Date.now = realNow;
  }
}

function makeAnimal(
  instanceId: string,
  lifeStartedAt: number,
  lifeEndsAt: number,
  nextEggAt: number,
  overrides: Partial<PenAnimalState> = {},
): PenAnimalState {
  return {
    instanceId,
    animalTypeId: "chicken",
    addedAt: lifeStartedAt,
    cycleStartedAt: lifeStartedAt,
    nextEggAt,
    lifeStartedAt,
    lifeEndsAt,
    deathAt: null,
    deathCause: null,
    isBuffed: false,
    ...overrides,
  };
}

console.log("=== ANIMAL LIFECYCLE REGRESSION TESTS ===\n");

const expectedCatalog: Array<{
  id: AnimalTypeId;
  lifespanHours: number;
  eggGold: number;
  eggXp: number;
}> = [
  { id: "chicken", lifespanHours: 200, eggGold: 6, eggXp: 3 },
  { id: "duck", lifespanHours: 212, eggGold: 10, eggXp: 5 },
  { id: "quail", lifespanHours: 224, eggGold: 14, eggXp: 7 },
  { id: "goose", lifespanHours: 236, eggGold: 30, eggXp: 15 },
  { id: "muscovy_duck", lifespanHours: 248, eggGold: 42, eggXp: 21 },
  { id: "turkey", lifespanHours: 260, eggGold: 58, eggXp: 29 },
  { id: "guinea_fowl", lifespanHours: 272, eggGold: 72, eggXp: 36 },
  { id: "pheasant", lifespanHours: 284, eggGold: 86, eggXp: 43 },
  { id: "peafowl", lifespanHours: 296, eggGold: 110, eggXp: 55 },
  { id: "ostrich", lifespanHours: 308, eggGold: 126, eggXp: 63 },
];

assert(ANIMAL_CATALOG.length === expectedCatalog.length, "catalog keeps the ten canonical livestock species");
for (const expected of expectedCatalog) {
  const definition = ANIMAL_CATALOG.find((animal) => animal.id === expected.id);
  assert(definition, `${expected.id} exists in the livestock catalog`);
  assert(definition.lifespanMs === expected.lifespanHours * HOUR, `${expected.id} has a ${expected.lifespanHours}-hour lifespan`);
  assert(definition.eggSellGold === expected.eggGold, `${expected.id} egg Gold is doubled exactly once`);
  assert(definition.eggSellXp === expected.eggXp, `${expected.id} egg XP remains unchanged`);
  assert(
    EGG_INFO_MAP[definition.eggTypeId].sellGold === definition.eggSellGold &&
      EGG_INFO_MAP[definition.eggTypeId].sellXp === definition.eggSellXp,
    `${expected.id} catalog remains the single source of egg sale rewards`,
  );
}

const chicken = ANIMAL_CATALOG.find((animal) => animal.id === "chicken")!;
const lifeStart = 1_000_000;
const lifeAnimal = makeAnimal(
  "life-ratio",
  lifeStart,
  lifeStart + chicken.lifespanMs,
  lifeStart + chicken.eggIntervalMs,
);
assert(getAnimalLifeRemainingRatio(lifeAnimal, chicken, lifeStart) === 1, "new livestock starts at 100% lifespan");
assert(
  almostEqual(
    getAnimalLifeRemainingRatio(lifeAnimal, chicken, lifeStart + chicken.lifespanMs * 0.4),
    0.6,
  ),
  "lifespan ratio reaches the young/adult boundary at 60%",
);
assert(
  almostEqual(
    getAnimalLifeRemainingRatio(lifeAnimal, chicken, lifeStart + chicken.lifespanMs * 0.8),
    0.2,
  ),
  "lifespan ratio reaches the adult/old boundary at 20%",
);
assert(getAnimalLifeBarTone(0.6) === "green", "60% lifespan is green");
assert(getAnimalLifeBarTone(0.59999) === "yellow", "lifespan immediately below 60% is yellow");
assert(getAnimalLifeBarTone(0.2) === "yellow", "20% lifespan is yellow");
assert(getAnimalLifeBarTone(0.19999) === "red", "lifespan immediately below 20% is red");
assert(getAnimalLifeBarTone(0) === "dead", "zero lifespan is dead");
assert(getAnimalVisualScale(lifeAnimal, chicken, lifeStart) === ANIMAL_MIN_VISUAL_SCALE, "new livestock uses the 0.35 minimum scale");
assert(
  almostEqual(
    getAnimalVisualScale(lifeAnimal, chicken, lifeStart + chicken.lifespanMs * 0.5),
    0.925,
  ),
  "livestock uses the canonical 0.925 scale at midlife",
);
assert(
  getAnimalVisualScale(lifeAnimal, chicken, lifeStart + chicken.lifespanMs) === ANIMAL_MAX_VISUAL_SCALE,
  "fully aged livestock reaches the 1.5 maximum scale",
);
assert(getAnimalOverlayScale(0.35) === 0.5, "animal scale 0.35 maps to overlay scale 0.50");
assert(getAnimalOverlayScale(0.925) === 0.75, "animal scale 0.925 maps to overlay scale 0.75");
assert(getAnimalOverlayScale(1.5) === 1, "animal scale 1.50 maps to overlay scale 1.00");
const smallOverlayOffsets = getAnimalOverlayOffsets(42, 0.35);
const largeOverlayOffsets = getAnimalOverlayOffsets(42, 1.5);
assert(
  largeOverlayOffsets.headOffsetPx > smallOverlayOffsets.headOffsetPx,
  "life-bar head anchor follows the visual top as the animal grows",
);
assert(
  largeOverlayOffsets.feetOffsetPx > smallOverlayOffsets.feetOffsetPx,
  "name and timer feet anchor follows the visual bottom as the animal grows",
);
assert(getAnimalFacingForDelta(3, "left") === "right", "positive target dx faces right");
assert(getAnimalFacingForDelta(-3, "right") === "left", "negative target dx faces left");
assert(getAnimalFacingForDelta(0.001, "left") === "left", "sub-epsilon target dx preserves facing");
assert(getAnimalAgeMovementMultiplier(lifeAnimal, chicken, lifeStart) === 1.35, "young livestock movement is 1.35x");
assert(
  getAnimalAgeMovementMultiplier(lifeAnimal, chicken, lifeStart + chicken.lifespanMs * 0.4) === 1.35,
  "livestock with exactly 60% life remaining still moves at 1.35x",
);
assert(
  getAnimalAgeMovementMultiplier(lifeAnimal, chicken, lifeStart + chicken.lifespanMs * 0.41) === 1,
  "livestock with 59% life remaining moves at 1x",
);
assert(
  getAnimalAgeMovementMultiplier(lifeAnimal, chicken, lifeStart + chicken.lifespanMs * 0.8) === 1,
  "livestock with exactly 20% life remaining still moves at 1x",
);
assert(
  getAnimalAgeMovementMultiplier(lifeAnimal, chicken, lifeStart + chicken.lifespanMs * 0.81) === 0.8,
  "livestock with 19% life remaining moves at 0.8x",
);

const deadLifeAnimal = { ...lifeAnimal, deathAt: lifeStart + HOUR, deathCause: "starvation" as const };
assert(isAnimalDead(deadLifeAnimal), "a materialized death is recognized immediately");
assert(getAnimalAgeMovementMultiplier(deadLifeAnimal, chicken, lifeStart + HOUR) === 0, "dead livestock movement stops");
assert(
  almostEqual(
    getAnimalVisualScale(deadLifeAnimal, chicken, lifeStart + chicken.lifespanMs),
    ANIMAL_MIN_VISUAL_SCALE + (1 / 200) * (ANIMAL_MAX_VISUAL_SCALE - ANIMAL_MIN_VISUAL_SCALE),
  ),
  "early death freezes visual scale at the animal's actual age",
);

assert(formatAnimalEggCountdown(3_661_000) === "01:01:01", "egg countdown uses HH:MM:SS at one hour or more");
assert(formatAnimalEggCountdown(3_600_000) === "01:00:00", "egg countdown formats the exact 60-minute boundary as 01:00:00");
assert(formatAnimalEggCountdown(3_599_000) === "59:59", "egg countdown formats 59:59 below the hour boundary");
assert(formatAnimalEggCountdown(65_000) === "01:05", "egg countdown formats 1:05 as 01:05");
assert(formatAnimalEggCountdown(59_000) === "59", "egg countdown uses SS below one minute");
assert(formatAnimalEggCountdown(9_000) === "09", "egg countdown zero-pads a single-digit second");
assert(formatAnimalEggCountdown(-1) === "00", "egg countdown never becomes negative");

const addAt = 2_000_000;
const addedFarm = createFarmAt(addAt);
addedFarm.inventory.animals.chicken = 1;
const addResult = addAnimalToPen(addedFarm, "chicken", addAt);
const addedAnimal = addedFarm.penAnimals[0];
assert(addResult.success && addedAnimal, "owned livestock can be added to the pen");
assert(
  addedAnimal.lifeStartedAt === addAt &&
    addedAnimal.lifeEndsAt === addAt + chicken.lifespanMs &&
    addedAnimal.deathAt === null &&
    addedAnimal.deathCause === null,
  "new livestock persists its complete lifecycle timestamps",
);
assert(addedFarm.penStarvationStartedAt === addAt, "adding living livestock to an empty trough starts a fresh danger window");

const migrationNow = 5_000_000;
const legacyRawFarm = createFarmAt(migrationNow) as any;
legacyRawFarm.schemaVersion = 3;
legacyRawFarm.lastSettledAt = migrationNow;
delete legacyRawFarm.penStarvationStartedAt;
const legacyNextEggAt = migrationNow + chicken.eggIntervalMs;
const legacyAddedAt = migrationNow - 50 * HOUR;
legacyRawFarm.penAnimals = [
  {
    instanceId: "legacy",
    animalTypeId: "chicken",
    addedAt: legacyAddedAt,
    cycleStartedAt: migrationNow - HOUR,
    nextEggAt: legacyNextEggAt,
    isBuffed: false,
  } as PenAnimalState,
];
const legacyFarm = migrateFarmState(legacyRawFarm, migrationNow);
const migratedAnimal = legacyFarm.penAnimals[0];
assert(
  migratedAnimal.lifeStartedAt === legacyAddedAt &&
    migratedAnimal.lifeEndsAt === legacyAddedAt + chicken.lifespanMs,
  "legacy livestock derives missing lifespan fields from its original addedAt",
);
assert(migratedAnimal.nextEggAt === legacyNextEggAt, "lifecycle migration preserves the existing egg cycle");
assert(legacyFarm.penStarvationStartedAt === null, "migration patches the missing starvation field without running settlement");
const migratedFarmAgain = migrateFarmState(legacyFarm, migrationNow + HOUR);
assert(
  JSON.stringify(migratedFarmAgain) === JSON.stringify(legacyFarm),
  "lifecycle migration is idempotent",
);
settleFarmState(legacyFarm, migrationNow + HOUR);
assert(
  migratedAnimal.lifeStartedAt === legacyAddedAt && migratedAnimal.lifeEndsAt === legacyAddedAt + chicken.lifespanMs,
  "settlement never rewrites migrated lifespan timestamps",
);

const deathBase = 10_000_000;
const deathFarm = createFarmAt(deathBase);
deathFarm.penFeedBuffValue = 100;
deathFarm.penFeedBuffUpdatedAt = deathBase;
deathFarm.lastSettledAt = deathBase;
deathFarm.penAnimals = [
  makeAnimal("strict-egg", deathBase, deathBase + 10 * HOUR, deathBase + 5 * HOUR),
];
const deathResult = settleFarmState(deathFarm, deathBase + 10 * HOUR);
assert(deathFarm.inventory.eggs.chicken_egg === 1, "an egg strictly before death is produced");
assert(
  deathFarm.penAnimals[0].deathAt === deathBase + 10 * HOUR &&
    deathFarm.penAnimals[0].deathCause === "old_age" &&
    deathResult.newDeaths.oldAge === 1,
  "old-age death materializes at the exact lifespan endpoint",
);
assert(deathFarm.penAnimals[0].nextEggAt === deathBase + 10 * HOUR, "an egg timestamp equal to death remains uncollected");
settleFarmState(deathFarm, deathBase + 20 * HOUR);
assert(deathFarm.inventory.eggs.chicken_egg === 1, "dead livestock never produces another egg after reload");

const tieBase = 60_000_000;
const tieFarm = createFarmAt(tieBase);
tieFarm.lastSettledAt = tieBase;
tieFarm.penStarvationStartedAt = tieBase;
tieFarm.penAnimals = [
  makeAnimal(
    "death-tie",
    tieBase - (chicken.lifespanMs - PEN_STARVATION_DURATION_MS),
    tieBase + PEN_STARVATION_DURATION_MS,
    tieBase + PEN_STARVATION_DURATION_MS,
  ),
];
settleFarmState(tieFarm, tieBase + PEN_STARVATION_DURATION_MS);
assert(tieFarm.penAnimals[0].deathCause === "old_age", "old age wins an exact tie with the starvation deadline");
assert(tieFarm.inventory.eggs.chicken_egg === 0, "death wins when an egg and death share the exact timestamp");

const feedBase = 100_000_000;
const depletingFarm = createFarmAt(feedBase);
depletingFarm.lastSettledAt = feedBase;
depletingFarm.penFeedBuffValue = 20;
depletingFarm.penFeedBuffUpdatedAt = feedBase;
depletingFarm.penAnimals = [
  makeAnimal("depletion", feedBase, feedBase + chicken.lifespanMs, feedBase + 50 * HOUR),
];
settleFarmState(depletingFarm, feedBase + 14 * HOUR);
const expectedDepletionAt = feedBase + 2.4 * HOUR;
assert(depletingFarm.penFeedBuffValue === 0, "normal feed decay reaches zero using only living livestock");
assert(
  almostEqual(depletingFarm.penStarvationStartedAt!, expectedDepletionAt, 1),
  "the fixed 12-hour danger window starts at the precise feed-depletion timestamp",
);
assert(!isAnimalDead(depletingFarm.penAnimals[0]), "livestock remains alive before the danger deadline");
settleFarmState(depletingFarm, feedBase + 14.5 * HOUR);
assert(
  depletingFarm.penAnimals[0].deathCause === "starvation" &&
    almostEqual(depletingFarm.penAnimals[0].deathAt!, expectedDepletionAt + PEN_STARVATION_DURATION_MS, 1),
  "starvation death materializes at the exact danger deadline",
);

const depletionTieBase = 150_000_000;
const depletionTieFarm = createFarmAt(depletionTieBase);
depletionTieFarm.lastSettledAt = depletionTieBase;
depletionTieFarm.penFeedBuffValue = 20;
depletionTieFarm.penFeedBuffUpdatedAt = depletionTieBase;
const twoAnimalDepletionAt = depletionTieBase + 2.2 * HOUR;
depletionTieFarm.penAnimals = [
  makeAnimal("old-at-empty", depletionTieBase, twoAnimalDepletionAt, depletionTieBase + 20 * HOUR),
  makeAnimal("survivor-at-empty", depletionTieBase, depletionTieBase + chicken.lifespanMs, depletionTieBase + 20 * HOUR),
];
settleFarmState(depletionTieFarm, depletionTieBase + 3 * HOUR);
assert(depletionTieFarm.penAnimals[0].deathCause === "old_age", "old-age death still wins when feed empties at the same timestamp");
assert(
  almostEqual(depletionTieFarm.penStarvationStartedAt!, twoAnimalDepletionAt, 1),
  "simultaneous old age and feed depletion still starts danger for surviving livestock",
);

const realNow = Date.now;
try {
  const rescueBase = 200_000_000;
  Date.now = () => rescueBase;
  const rescueFarm = createDefaultFarmState();
  rescueFarm.inventory.animals.chicken = 1;
  addAnimalToPen(rescueFarm, "chicken", rescueBase);
  rescueFarm.inventory.feed.feed_normal = 1;
  Date.now = () => rescueBase + 11 * HOUR + 59 * 60 * 1000;
  const rescueResult = feedPenBuff(rescueFarm, "feed_normal", 1);
  assert(rescueResult.success, "refilling before the 12-hour deadline succeeds");
  assert(!isAnimalDead(rescueFarm.penAnimals[0]) && rescueFarm.penStarvationStartedAt === null, "timely refill cancels danger without killing livestock");

  const lateBase = 300_000_000;
  Date.now = () => lateBase;
  const lateFarm = createDefaultFarmState();
  lateFarm.inventory.animals.chicken = 1;
  addAnimalToPen(lateFarm, "chicken", lateBase);
  lateFarm.inventory.feed.feed_normal = 1;
  Date.now = () => lateBase + 13 * HOUR;
  const lateResult = feedPenBuff(lateFarm, "feed_normal", 1);
  assert(lateResult.success, "feed may still be loaded after a missed deadline");
  assert(
    lateFarm.penAnimals[0].deathCause === "starvation" &&
      lateFarm.penAnimals[0].deathAt === lateBase + PEN_STARVATION_DURATION_MS,
    "late refill never revives livestock killed at the deadline",
  );
} finally {
  Date.now = realNow;
}

const emptyFarm = createFarmAt(400_000_000);
settleFarmState(emptyFarm, 400_000_000 + 24 * HOUR);
assert(emptyFarm.penStarvationStartedAt === null, "an empty pen never enters danger mode");

const livingOnlyBase = 500_000_000;
const livingOnlyFarm = createFarmAt(livingOnlyBase);
livingOnlyFarm.lastSettledAt = livingOnlyBase;
livingOnlyFarm.penFeedBuffValue = 100;
livingOnlyFarm.penFeedBuffUpdatedAt = livingOnlyBase;
livingOnlyFarm.penAnimals = [
  makeAnimal("living", livingOnlyBase, livingOnlyBase + chicken.lifespanMs, livingOnlyBase + 50 * HOUR),
  makeAnimal("dead", livingOnlyBase - HOUR, livingOnlyBase + chicken.lifespanMs, livingOnlyBase + 50 * HOUR, {
    deathAt: livingOnlyBase - 1,
    deathCause: "starvation",
  }),
];
settleFarmState(livingOnlyFarm, livingOnlyBase + 6 * HOUR);
assert(getLivingAnimalCount(livingOnlyFarm.penAnimals) === 1, "dead livestock is excluded from the living count");
assert(almostEqual(livingOnlyFarm.penFeedBuffValue, 50, 0.001), "dead livestock does not consume trough feed");

const cleanupGold = livingOnlyFarm.gold;
const cleanupInventory = JSON.stringify(livingOnlyFarm.inventory);
assert(dismissAnimal(livingOnlyFarm, "dead"), "dead livestock can be cleaned from the pen");
assert(livingOnlyFarm.penAnimals.length === 1, "cleaning dead livestock frees its occupied pen slot");
assert(
  livingOnlyFarm.gold === cleanupGold && JSON.stringify(livingOnlyFarm.inventory) === cleanupInventory,
  "cleaning dead livestock grants no Gold, XP, egg, or animal refund",
);

const capacityBase = 600_000_000;
const capacityFarm = createFarmAt(capacityBase);
capacityFarm.penAnimals = [
  makeAnimal("dead-a", capacityBase, capacityBase + HOUR, capacityBase + HOUR, { deathAt: capacityBase, deathCause: "old_age" }),
  makeAnimal("dead-b", capacityBase, capacityBase + HOUR, capacityBase + HOUR, { deathAt: capacityBase, deathCause: "old_age" }),
];
capacityFarm.inventory.animals.chicken = 1;
assert(!addAnimalToPen(capacityFarm, "chicken", capacityBase).success, "dead livestock continues to occupy pen capacity until cleaned");
dismissAnimal(capacityFarm, "dead-a");
assert(addAnimalToPen(capacityFarm, "chicken", capacityBase).success, "cleaning one dead animal immediately frees capacity for a replacement");

const offlineBase = 700_000_000;
const offlineFarm = createFarmAt(offlineBase);
offlineFarm.lastSettledAt = offlineBase;
offlineFarm.penStarvationStartedAt = offlineBase;
offlineFarm.penAnimals = [
  makeAnimal("offline-old", offlineBase, offlineBase + 10 * HOUR, offlineBase + 5 * HOUR),
  makeAnimal("offline-starved", offlineBase, offlineBase + chicken.lifespanMs, offlineBase + 50 * HOUR),
];
const offlineResult = settleFarmState(offlineFarm, offlineBase + 13 * HOUR);
assert(
  offlineResult.queuedOfflineDeathNotification &&
    offlineResult.newDeaths.total === 2 &&
    offlineResult.newDeaths.oldAge === 1 &&
    offlineResult.newDeaths.starvation === 1,
  "offline settlement groups old-age and starvation deaths into one summary",
);
const pendingDeathNotice = consumePendingAnimalDeathNotification(offlineFarm);
assert(
  pendingDeathNotice?.total === 2 && pendingDeathNotice.oldAge === 1 && pendingDeathNotice.starvation === 1,
  "the grouped offline death notice preserves its cause breakdown",
);
assert(consumePendingAnimalDeathNotification(offlineFarm) === null, "offline death notification can be consumed only once");
settleFarmState(offlineFarm, offlineBase + 20 * HOUR);
assert(consumePendingAnimalDeathNotification(offlineFarm) === null, "reload does not duplicate already materialized death notifications");

assert(getPenDangerRatio(offlineBase, offlineBase) === 1, "danger bar begins at 100%");
assert(getPenDangerRatio(offlineBase, offlineBase + 6 * HOUR) === 0.5, "danger bar reaches 50% after six hours");
assert(getPenDangerRatio(offlineBase, offlineBase + PEN_STARVATION_DURATION_MS) === 0, "danger bar reaches 0% at the deadline");

console.log("\nALL ANIMAL LIFECYCLE REGRESSION TESTS PASSED");

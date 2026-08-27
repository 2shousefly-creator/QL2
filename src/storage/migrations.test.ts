import { createInitialGameState } from "./GameRepository";
import { sanitizeAndMigrateState } from "./migrations";
import type { JournalEvent } from "../game/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

console.log("=== SAVE MIGRATION SAFETY TESTS ===\n");

for (const percent of [0, 10, 100, 99.75]) {
  const save = createInitialGameState(`Energy ${percent}`);
  save.energy = {
    percent,
    lastUpdatedAt: 123_456,
    lastResetDate: "2020-01-02",
  };
  const migrated = sanitizeAndMigrateState(save);
  assert(migrated.energy?.percent === percent, `Energy ${percent} is preserved exactly by migration`);
  assert(migrated.energy?.lastUpdatedAt === 123_456, `Energy ${percent} keeps its update timestamp`);
  assert(migrated.energy?.lastResetDate === "2020-01-02", `Energy ${percent} keeps its reset date for runtime settlement`);
}

const journalSave = createInitialGameState("Journal history");
const journalEvents: JournalEvent[] = Array.from({ length: 5 }, (_, index) => ({
  id: `exam-${index}`,
  key: `exam:${index}`,
  type: "promotion",
  category: "rank",
  title: `Sát Hạch ${index + 1}`,
  description: index % 2 === 0 ? "Đạt" : "Chưa đạt",
  occurredAt: 10_000 + index,
  dateUnknown: false,
  relatedId: String(index + 1),
  metadata: {
    passed: index % 2 === 0,
    correctCount: index + 1,
    totalQuestions: 5,
    retries: index,
    sourceMarker: `legacy-${index}`,
  },
}));
journalSave.journal = { events: journalEvents };

const migratedJournal = sanitizeAndMigrateState(journalSave);
assert(migratedJournal.journal?.events.length === 5, "five existing exam Journal entries remain five");
assert(
  migratedJournal.journal?.events.map((event) => event.key).join("|") === journalEvents.map((event) => event.key).join("|"),
  "exam Journal entry order is preserved",
);
assert(migratedJournal.journal?.events[1].metadata?.passed === false, "failed exam result is preserved");
assert(migratedJournal.journal?.events[4].occurredAt === 10_004, "exam timestamp is preserved");
assert(migratedJournal.journal?.events[3].metadata?.sourceMarker === "legacy-3", "valid exam metadata is preserved");

const migratedJournalTwice = sanitizeAndMigrateState(migratedJournal);
assert(migratedJournalTwice.journal?.events.length === 5, "running migration twice does not duplicate Journal entries");
assert(
  JSON.stringify(migratedJournalTwice.journal?.events) === JSON.stringify(migratedJournal.journal?.events),
  "Journal migration is idempotent",
);

const challengeSave = createInitialGameState("Challenge metadata");
challengeSave.progression.currentRankIndex = 1;
challengeSave.progression.promotionHistory.unshift({
  id: "promotion-one",
  rankIndex: 1,
  rankName: "Binh Nhì",
  familyId: "enlisted_1",
  tier: 1,
  achievedAt: 55_000,
  source: "promotion",
  promotionKind: "minor",
  badgeCatalogVersionAtAchievement: challengeSave.catalogVersion,
  storyCatalogVersionAtAchievement: challengeSave.catalogVersion,
  challenge: {
    configuredDurationMs: 120_000,
    elapsedRealMs: 70_000,
    bubbleHitCount: 2,
    bubbleReductionMs: 2_000,
    correctCount: 4,
    totalQuestions: 5,
    retries: 1,
    passed: true,
    metadata: { examVersion: "legacy-v1" },
  },
});
const migratedChallenge = sanitizeAndMigrateState(challengeSave);
assert(migratedChallenge.progression.promotionHistory.length === 2, "promotion history count is preserved");
assert(migratedChallenge.progression.promotionHistory[0].id === "promotion-one", "promotion history order is preserved");
assert(migratedChallenge.progression.promotionHistory[0].challenge?.correctCount === 4, "exam score is preserved in promotion history");
assert(migratedChallenge.progression.promotionHistory[0].challenge?.passed === true, "exam pass result is preserved in promotion history");
assert(migratedChallenge.progression.promotionHistory[0].challenge?.metadata?.examVersion === "legacy-v1", "exam challenge metadata is preserved");

const medalStatsSave = createInitialGameState("Medal stat migration");
medalStatsSave.globalStats = {
  lifetimeXp: 0,
  totalTrainingSuccesses: 0,
  successfulMinigames: [],
  hardCompletedMinigames: [],
  totalCropHarvests: 0,
  maxAnimalCapacityUnlocked: 1,
  fullyWateredCropHarvests: 0,
  perfectCropHarvests: 0,
  waterAll9PlotsCount: 0,
  fertilizerTypesUsed: [],
  farmGoldEarned: 0,
  totalCropHarvestsPlusEggSales: 0,
  hasCompletedHardTrainingFirstTime: false,
  perfectFarmItemsSold: 1,
  totalFeedBagsUsed: 2000,
};
const migratedMedalStats = sanitizeAndMigrateState(medalStatsSave);
assert(migratedMedalStats.globalStats?.perfectFarmItemsSold === 1, "Perfect-sale lifetime stat persists");
assert(migratedMedalStats.globalStats?.totalFeedBagsUsed === 2000, "feed-bag lifetime stat persists");
assert(migratedMedalStats.medals?.unlockedMedalIds.includes("may_man_doi_doi"), "trusted Perfect-sale stat retroactively unlocks its medal");
assert(migratedMedalStats.medals?.unlockedMedalIds.includes("an_no_ngu_ky"), "trusted feed-bag stat retroactively unlocks its medal");

console.log("\nALL SAVE MIGRATION SAFETY TESTS PASSED");

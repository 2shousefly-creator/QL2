import { createInitialGameState } from "../../storage/GameRepository";
import { sanitizeAndMigrateState } from "../../storage/migrations";
import { addJournalEvent, backfillJournalEvents, recordJournalMedalUnlocked } from "../journal/journalEngine";
import { MEDAL_CATALOG } from "./medalCatalog";
import {
  ensureMedalAndMasteryState,
  recordCropHarvestForMedals,
  recordFeedBagsUsed,
  recordPerfectFarmItemSale,
  recordWatering,
} from "./medalEngine";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

function unlocked(state: ReturnType<typeof createInitialGameState>, medalId: string): boolean {
  return state.medals?.unlockedMedalIds.includes(medalId) ?? false;
}

console.log("=== FARM MEDAL TESTS ===\n");

const luckyMedal = MEDAL_CATALOG.find((medal) => medal.id === "may_man_doi_doi");
const feedMedal = MEDAL_CATALOG.find((medal) => medal.id === "an_no_ngu_ky");
assert(luckyMedal?.tier === 4 && luckyMedal.targetValue === 1, "May Mắn Đổi Đời is a Bậc 4 medal");
assert(feedMedal?.tier === 3 && feedMedal.targetValue === 2000, "Ăn No Ngủ Kỹ is a Bậc 3 medal");

const harvestedOnly = createInitialGameState("Harvest only");
recordCropHarvestForMedals(harvestedOnly, true);
assert(!unlocked(harvestedOnly, "may_man_doi_doi"), "harvest tracking alone never unlocks the Perfect-sale medal");

const perfectCropSale = createInitialGameState("Perfect crop sale");
recordPerfectFarmItemSale(perfectCropSale, 1);
assert(unlocked(perfectCropSale, "may_man_doi_doi"), "a completed Perfect crop sale unlocks May Mắn Đổi Đời");

const perfectEggSale = createInitialGameState("Perfect egg sale");
recordPerfectFarmItemSale(perfectEggSale, 1);
assert(unlocked(perfectEggSale, "may_man_doi_doi"), "a completed Perfect egg sale unlocks May Mắn Đổi Đời");

const rareSale = createInitialGameState("Rare sale");
recordPerfectFarmItemSale(rareSale, 0);
assert(!unlocked(rareSale, "may_man_doi_doi"), "a non-Perfect sale does not unlock May Mắn Đổi Đời");

const feedProgress = createInitialGameState("Feed progress");
ensureMedalAndMasteryState(feedProgress);
recordFeedBagsUsed(feedProgress, 1999);
assert(feedProgress.globalStats?.totalFeedBagsUsed === 1999, "multi-feed records every consumed bag");
assert(!unlocked(feedProgress, "an_no_ngu_ky"), "1,999 consumed bags remain locked");
recordFeedBagsUsed(feedProgress, 1);
assert(unlocked(feedProgress, "an_no_ngu_ky"), "the 2,000th consumed bag unlocks Ăn No Ngủ Kỹ");
recordFeedBagsUsed(feedProgress, 25);
assert(Number(feedProgress.globalStats?.totalFeedBagsUsed) === 2025, "later multi-feed quantities stay cumulative");
assert(
  feedProgress.medals?.unlockedMedalIds.filter((id) => id === "an_no_ngu_ky").length === 1,
  "the feed medal is unlocked exactly once",
);

const retiredId = "mua_tren_ca_khu_vuon";
assert(!MEDAL_CATALOG.some((medal) => medal.id === retiredId), "the retired garden medal is absent from the catalog");
const watering = createInitialGameState("Watering without retired medal");
recordWatering(watering, 9);
assert(!unlocked(watering, retiredId), "nine waterings no longer unlock the retired garden medal");
assert(unlocked(watering, "ban_tay_cham_soc"), "the first-watering medal still unlocks");
assert(watering.globalStats?.totalWateringCount === 9, "watering statistics remain cumulative");

const legacyGarden = createInitialGameState("Retired garden medal save");
recordWatering(legacyGarden, 12);
legacyGarden.medals!.unlockedMedalIds.push(retiredId);
legacyGarden.medals!.selectedMedalIds.push(retiredId);
legacyGarden.medals!.unlockedAtMap[retiredId] = 123;
legacyGarden.ui.pendingMedalUnlockPopup = retiredId;
recordJournalMedalUnlocked(legacyGarden, retiredId, 123);
addJournalEvent(legacyGarden, {
  key: "farm:water_all_9", type: "farm_milestone", category: "farm",
  title: "Retired garden milestone", description: "Legacy watering milestone", occurredAt: 123,
});
const remainingHistory = legacyGarden.journal!.events.filter(
  (event) => event.relatedId !== retiredId && event.key !== "farm:water_all_9"
);
const keptUnlockTime = legacyGarden.medals!.unlockedAtMap.ban_tay_cham_soc;
const savedGarden = JSON.parse(JSON.stringify(legacyGarden));
ensureMedalAndMasteryState(legacyGarden);
assert(legacyGarden.ui.pendingMedalUnlockPopup === null, "a pending retired-medal popup is cleared");
const migratedGarden = sanitizeAndMigrateState(savedGarden);
assert(!unlocked(migratedGarden, retiredId), "save load removes the retired unlocked medal");
assert(!migratedGarden.medals!.selectedMedalIds.includes(retiredId), "save load frees the retired display slot");
assert(!(retiredId in migratedGarden.medals!.unlockedAtMap), "the retired unlock timestamp is removed");
assert(migratedGarden.medals!.unlockedAtMap.ban_tay_cham_soc === keptUnlockTime, "other medal timestamps are preserved");
assert(JSON.stringify(migratedGarden.journal!.events) === JSON.stringify(remainingHistory), "only retired garden history is removed");
assert(migratedGarden.globalStats!.totalWateringCount === 12, "save migration preserves watering statistics");
recordWatering(migratedGarden, 9);
backfillJournalEvents(migratedGarden);
assert(!unlocked(migratedGarden, retiredId), "later watering never awards the retired medal again");
assert(!migratedGarden.journal!.events.some((event) => event.key === "farm:water_all_9" || event.relatedId === retiredId), "journal backfill never recreates retired garden events");

console.log("\nALL FARM MEDAL TESTS PASSED");

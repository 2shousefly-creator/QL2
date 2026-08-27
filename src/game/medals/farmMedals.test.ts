import { createInitialGameState } from "../../storage/GameRepository";
import { MEDAL_CATALOG } from "./medalCatalog";
import {
  ensureMedalAndMasteryState,
  recordCropHarvestForMedals,
  recordFeedBagsUsed,
  recordPerfectFarmItemSale,
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
recordCropHarvestForMedals(harvestedOnly, 3, true);
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

console.log("\nALL FARM MEDAL TESTS PASSED");

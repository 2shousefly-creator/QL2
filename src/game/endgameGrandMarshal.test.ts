import {
  RANK_ACTIVITY_CATALOG,
  DEFAULT_ACTIVITY_POOL,
  resolveRankActivityPool,
  ActivityTickerBag,
} from "./rankActivityCatalog";
import { getPromotionRewards } from "./promotionRewards";
import { RANK_FAMILIES } from "./rankFamilies";
import { RankStep } from "./types";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

export function runEndgameGrandMarshalTests() {
  console.log("=== RUNNING ĐẠI THỐNG SOÁI TESTS ===\n");

  // 1. Rank Activity Catalog checks
  console.log("--- 1. Rank Activity Catalog Entry ---");
  const grandMarshalEntry = RANK_ACTIVITY_CATALOG["endgame_grand_marshal"];
  assert(!!grandMarshalEntry, "RANK_ACTIVITY_CATALOG['endgame_grand_marshal'] must exist");
  assert(grandMarshalEntry.familyId === "endgame_grand_marshal", "familyId must be 'endgame_grand_marshal'");
  assert(grandMarshalEntry.familyName === "Đại Thống Soái", "familyName must be 'Đại Thống Soái'");
  assert(grandMarshalEntry.core.length === 20, `Must have exactly 20 core activities (got ${grandMarshalEntry.core.length})`);
  assert(grandMarshalEntry.finalTierPrep?.length === 2, `Must have exactly 2 finalTierPrep activities (got ${grandMarshalEntry.finalTierPrep?.length})`);

  // Ensure all core lines start with "Đang"
  for (const line of grandMarshalEntry.core) {
    assert(line.startsWith("Đang"), `Core line '${line}' must start with 'Đang'`);
  }
  for (const line of grandMarshalEntry.finalTierPrep || []) {
    assert(line.startsWith("Đang"), `Prep line '${line}' must start with 'Đang'`);
  }

  // 2. Hierarchy checks
  console.log("\n--- 2. Hierarchy Consistency ---");
  const thongSoaiEntry = RANK_ACTIVITY_CATALOG["endgame_1"];
  assert(
    thongSoaiEntry.finalTierPrep?.some((p) => p.includes("Đại Thống Soái")) === true,
    "Thống Soái finalTierPrep must mention Đại Thống Soái"
  );

  const nguyenSoaiEntry = RANK_ACTIVITY_CATALOG["endgame_2"];
  assert(
    nguyenSoaiEntry.core.some((c) => c.includes("Đại Thống Soái")) === true,
    "Nguyên Soái core must mention Đại Thống Soái"
  );
  assert(
    !nguyenSoaiEntry.core.some((c) => c.includes("Thống Soái") && !c.includes("Đại Thống Soái")),
    "Nguyên Soái core should not reference Thống Soái directly anymore"
  );

  // 3. Activity Resolution & Ticker Bag
  console.log("\n--- 3. Activity Pool Resolution ---");
  const rankTier1: RankStep = {
    id: "endgame_grand_marshal_1",
    rankIndex: 100,
    ordinal: 101,
    familyId: "endgame_grand_marshal",
    familyName: "Đại Thống Soái",
    tier: 1,
    tierCount: 16,
    displayName: "Đại Thống Soái Bậc 1",
    shortName: "Đại Thống Soái 1",
    storyId: "story_100",
  };

  const poolTier1 = resolveRankActivityPool(rankTier1);
  assert(poolTier1.regular.length === 20, "Tier 1 should have 20 regular lines");
  assert(poolTier1.prep.length === 0, "Tier 1 should have 0 prep lines");
  assert(poolTier1.regular !== DEFAULT_ACTIVITY_POOL, "Should not fallback to DEFAULT_ACTIVITY_POOL");

  const rankTier16: RankStep = {
    id: "endgame_grand_marshal_16",
    rankIndex: 115,
    ordinal: 116,
    familyId: "endgame_grand_marshal",
    familyName: "Đại Thống Soái",
    tier: 16,
    tierCount: 16,
    displayName: "Đại Thống Soái Bậc 16",
    shortName: "Đại Thống Soái 16",
    storyId: "story_115",
  };

  const poolTier16 = resolveRankActivityPool(rankTier16);
  assert(poolTier16.regular.length === 20, "Tier 16 should have 20 regular lines");
  assert(poolTier16.prep.length === 2, "Tier 16 should have 2 prep lines");

  const tickerBag = new ActivityTickerBag(poolTier16.regular, poolTier16.prep);
  const itemsSampled = new Set<string>();
  for (let i = 0; i < 40; i++) {
    itemsSampled.add(tickerBag.next());
  }
  assert(itemsSampled.size > 10, "TickerBag should cycle through various items");

  // Check Tổng Tư Lệnh (endgame_4) has no prep
  const rankTongTuLenh: RankStep = {
    id: "endgame_4",
    rankIndex: 215,
    ordinal: 216,
    familyId: "endgame_4",
    familyName: "Tổng Tư Lệnh",
    tier: null,
    tierCount: 1,
    displayName: "Tổng Tư Lệnh",
    shortName: "Tổng Tư Lệnh",
    storyId: "story_215",
  };
  const poolTongTuLenh = resolveRankActivityPool(rankTongTuLenh);
  assert(poolTongTuLenh.prep.length === 0, "Tổng Tư Lệnh must have 0 prep lines");

  // 4. Promotion Rewards
  console.log("\n--- 4. Promotion Rewards Progression ---");
  // Đại Thống Soái Tier 1
  const rewardsGrandTier1 = getPromotionRewards(rankTier1);
  assert(rewardsGrandTier1.length === 3, "Đại Thống Soái Tier 1 should receive 3 reward items");
  assert(
    rewardsGrandTier1.some((r) => r.id === "mangosteen" && r.quantity === 16),
    "Đại Thống Soái Tier 1 must receive Măng Cụt x16"
  );
  assert(
    rewardsGrandTier1.some((r) => r.id === "feed_super" && r.quantity === 25),
    "Đại Thống Soái Tier 1 must receive Thức ăn siêu tốt x25"
  );
  assert(
    rewardsGrandTier1.some((r) => r.id === "fertilizer_premium_1" && r.quantity === 25),
    "Đại Thống Soái Tier 1 must receive Phân Cao Cấp Loại 1 x25"
  );

  // Đại Thống Soái Tier 2 to 16
  for (let t = 2; t <= 16; t++) {
    const rewards = getPromotionRewards({ ...rankTier1, tier: t });
    assert(rewards.length === 2, `Đại Thống Soái Tier ${t} must receive 2 reward items`);
    assert(
      rewards.some((r) => r.id === "feed_super" && r.quantity === 18),
      `Đại Thống Soái Tier ${t} must receive Thức ăn siêu tốt x18`
    );
    assert(
      rewards.some((r) => r.id === "fertilizer_premium_1" && r.quantity === 18),
      `Đại Thống Soái Tier ${t} must receive Phân Cao Cấp Loại 1 x18`
    );
  }

  // Nguyên Soái (endgame_2) Tier 17 and 18
  const rankNguyenSoai17: RankStep = {
    id: "endgame_2_17",
    rankIndex: 150,
    ordinal: 151,
    familyId: "endgame_2",
    familyName: "Nguyên Soái",
    tier: 17,
    tierCount: 18,
    displayName: "Nguyên Soái Bậc 17",
    shortName: "Nguyên Soái 17",
    storyId: "story_150",
  };
  const rewardsNguyenSoai17 = getPromotionRewards(rankNguyenSoai17);
  assert(rewardsNguyenSoai17.length === 2, "Nguyên Soái Tier 17 must receive rewards (not empty)");
  const rewardsNguyenSoai18 = getPromotionRewards({ ...rankNguyenSoai17, tier: 18 });
  assert(rewardsNguyenSoai18.length === 2, "Nguyên Soái Tier 18 must receive rewards (not empty)");

  // Đại Nguyên Soái (endgame_3) Tier 19 and 20
  const rankDaiNguyenSoai19: RankStep = {
    id: "endgame_3_19",
    rankIndex: 180,
    ordinal: 181,
    familyId: "endgame_3",
    familyName: "Đại Nguyên Soái",
    tier: 19,
    tierCount: 20,
    displayName: "Đại Nguyên Soái Bậc 19",
    shortName: "Đại Nguyên Soái 19",
    storyId: "story_180",
  };
  const rewardsDaiNguyenSoai19 = getPromotionRewards(rankDaiNguyenSoai19);
  assert(rewardsDaiNguyenSoai19.length === 2, "Đại Nguyên Soái Tier 19 must receive rewards (not empty)");
  const rewardsDaiNguyenSoai20 = getPromotionRewards({ ...rankDaiNguyenSoai19, tier: 20 });
  assert(rewardsDaiNguyenSoai20.length === 2, "Đại Nguyên Soái Tier 20 must receive rewards (not empty)");

  console.log("\nALL ĐẠI THỐNG SOÁI TESTS PASSED PERFECTLY! 🎖️✨");
}

runEndgameGrandMarshalTests();

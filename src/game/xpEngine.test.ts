import { gameConfig } from "./config";
import {
  getRequiredXpForTransition,
  getRequiredXpTicksForTransition,
  getTotalXpToReachRank,
  getTotalXpTicksToReachRank,
  getTotalXpToReachMaxRank,
  getFinalJourneyXpTarget,
  getFinalJourneyXpTargetTicks,
  formatXp,
} from "./xpEngine";
import { sanitizeAndMigrateState } from "../storage/migrations";
import { RANK_STEPS } from "./rankBuilder";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

function runTests() {
  console.log("=== RUNNING XP SYSTEM & MIGRATION TESTS ===\n");

  // 1. Math Regression Values
  console.log("--- 1. Formula & Curve Math ---");
  assert(getRequiredXpForTransition(0) === 60, "requiredXpNew(0) should be 60");
  assert(getRequiredXpForTransition(23) === 706, "requiredXpNew(23) should be 706");
  assert(getRequiredXpForTransition(214) === 34685, "requiredXpNew(214) should be 34685");
  assert(getRequiredXpForTransition(215) === 0, "requiredXpNew(215) [Max Rank] should be 0");

  assert(getTotalXpToReachRank(0) === 0, "Total XP to rank 0 is 0");
  assert(getTotalXpToReachRank(23) === 7074, "Total XP to reach rank 23 should be 7074");
  assert(getTotalXpToReachMaxRank() === 2591767, "Total XP to reach max rank (215) should be 2,591,767");
  assert(getFinalJourneyXpTarget() === 3591766, "Final Journey Target should be 3,591,766");

  // 2. Migration Cases
  console.log("\n--- 2. Migration Scenarios ---");

  // Legacy V15 constants for Rank 23:
  // oldReq(23) = round(90 + 18*23 + 1.5*23*23) = 1298
  // ticks = 600,000

  // Case 1: 0% progress at rank 23 (V15 save)
  const saveCase1 = {
    catalogVersion: 15,
    player: { name: "Binh Nhi", createdAt: Date.now() },
    progression: {
      currentRankIndex: 23,
      xpIntoCurrentRankTicks: 0,
      totalXpEarnedTicks: 13000 * 600_000,
      promotionHistory: [],
    },
  };
  const migrated1 = sanitizeAndMigrateState(saveCase1);
  assert(migrated1.progression.currentRankIndex === 23, "Case 1: Rank index must remain 23");
  assert(migrated1.progression.xpIntoCurrentRankTicks === 0, "Case 1: In-rank XP ticks must be 0");
  assert(
    migrated1.progression.totalXpEarnedTicks === 7074 * 600_000,
    `Case 1: Total XP earned must be 7074 * 600,000 (got ${migrated1.progression.totalXpEarnedTicks / 600_000} XP)`
  );

  // Case 2: 50% progress at rank 23 (649 / 1298 in V15)
  const saveCase2 = {
    catalogVersion: 15,
    player: { name: "Binh Nhi", createdAt: Date.now() },
    progression: {
      currentRankIndex: 23,
      xpIntoCurrentRankTicks: 649 * 600_000,
      totalXpEarnedTicks: (13000 + 649) * 600_000,
      promotionHistory: [],
    },
  };
  const migrated2 = sanitizeAndMigrateState(saveCase2);
  assert(migrated2.progression.currentRankIndex === 23, "Case 2: Rank index must remain 23");
  assert(
    migrated2.progression.xpIntoCurrentRankTicks === 353 * 600_000,
    `Case 2: In-rank XP ticks must be 353 * 600_000 (got ${migrated2.progression.xpIntoCurrentRankTicks / 600_000} XP)`
  );
  assert(
    migrated2.progression.totalXpEarnedTicks === 7427 * 600_000,
    `Case 2: Total XP earned must be 7427 * 600,000 (got ${migrated2.progression.totalXpEarnedTicks / 600_000} XP)`
  );

  // Case 3: 100% progress waiting promotion at rank 23 (1298 / 1298 in V15)
  const saveCase3 = {
    catalogVersion: 15,
    player: { name: "Binh Nhi", createdAt: Date.now() },
    progression: {
      currentRankIndex: 23,
      xpIntoCurrentRankTicks: 1298 * 600_000,
      totalXpEarnedTicks: (13000 + 1298) * 600_000,
      promotionHistory: [],
    },
  };
  const migrated3 = sanitizeAndMigrateState(saveCase3);
  assert(migrated3.progression.currentRankIndex === 23, "Case 3: Rank index must remain 23 (NO auto promote)");
  assert(
    migrated3.progression.xpIntoCurrentRankTicks === 706 * 600_000,
    `Case 3: In-rank XP ticks must be 706 * 600_000 (got ${migrated3.progression.xpIntoCurrentRankTicks / 600_000} XP)`
  );
  assert(
    migrated3.progression.totalXpEarnedTicks === 7780 * 600_000,
    `Case 3: Total XP earned must be 7780 * 600,000 (got ${migrated3.progression.totalXpEarnedTicks / 600_000} XP)`
  );

  // Case 4: Overflow / corrupt progress (e.g. 5000 XP in rank 23)
  const saveCase4 = {
    catalogVersion: 15,
    player: { name: "Binh Nhi", createdAt: Date.now() },
    progression: {
      currentRankIndex: 23,
      xpIntoCurrentRankTicks: 5000 * 600_000,
      totalXpEarnedTicks: 50000 * 600_000,
      promotionHistory: [],
    },
  };
  const migrated4 = sanitizeAndMigrateState(saveCase4);
  assert(migrated4.progression.currentRankIndex === 23, "Case 4: Rank index must remain 23");
  assert(
    migrated4.progression.xpIntoCurrentRankTicks === 706 * 600_000,
    "Case 4: Overflow clamped to 100% (706 XP)"
  );
  assert(
    migrated4.progression.totalXpEarnedTicks === 7780 * 600_000,
    "Case 4: Total XP normalized to 7780 XP"
  );

  // Case 5: Negative / NaN progress
  const saveCase5 = {
    catalogVersion: 15,
    player: { name: "Binh Nhi", createdAt: Date.now() },
    progression: {
      currentRankIndex: 23,
      xpIntoCurrentRankTicks: NaN as any,
      totalXpEarnedTicks: -100,
      promotionHistory: [],
    },
  };
  const migrated5 = sanitizeAndMigrateState(saveCase5);
  assert(migrated5.progression.currentRankIndex === 23, "Case 5: Rank index remains 23");
  assert(migrated5.progression.xpIntoCurrentRankTicks === 0, "Case 5: NaN in-rank XP handled safely to 0");
  assert(
    migrated5.progression.totalXpEarnedTicks === 7074 * 600_000,
    "Case 5: Total XP safely set to rank base 7074 XP"
  );

  // Case 6: Idempotent Migration on V16 save
  const migratedTwice = sanitizeAndMigrateState(migrated2);
  assert(
    migratedTwice.progression.currentRankIndex === migrated2.progression.currentRankIndex &&
      migratedTwice.progression.xpIntoCurrentRankTicks === migrated2.progression.xpIntoCurrentRankTicks &&
      migratedTwice.progression.totalXpEarnedTicks === migrated2.progression.totalXpEarnedTicks,
    "Case 6: Migrating an already V16 save is strictly idempotent"
  );

  // Case 7: Max Rank (Tổng Tư Lệnh rankIndex 215)
  // Old base at 215 is ~4.77M. If player had 230,000 XP in final leg:
  const oldBase215 = 4771695; // sum of old curve
  const saveCase7 = {
    catalogVersion: 15,
    player: { name: "Đại Tướng", createdAt: Date.now() },
    progression: {
      currentRankIndex: 215,
      xpIntoCurrentRankTicks: 230000 * 600_000,
      totalXpEarnedTicks: (oldBase215 + 230000) * 600_000,
      promotionHistory: [],
    },
  };
  const migrated7 = sanitizeAndMigrateState(saveCase7);
  assert(migrated7.progression.currentRankIndex === 215, "Case 7: Max Rank remains 215");
  assert(
    migrated7.progression.xpIntoCurrentRankTicks === 230000 * 600_000,
    "Case 7: Final leg progress preserved"
  );
  assert(
    migrated7.progression.totalXpEarnedTicks === (2591767 + 230000) * 600_000,
    `Case 7: Total XP normalized to 2,591,767 + 230,000 = 2,821,767 XP (got ${migrated7.progression.totalXpEarnedTicks / 600_000})`
  );

  // Case 8: 196 -> 216 Layout Migration (Nguyên Soái 1 at old index 161)
  console.log("\n--- 3. 196 -> 216 Layout Migration Scenarios ---");
  const saveCase8_196 = {
    catalogVersion: 15,
    player: { name: "Nguyên Soái", createdAt: Date.now() },
    progression: {
      currentRankIndex: 161, // Nguyên Soái tier 1 in 196 layout
      xpIntoCurrentRankTicks: 0,
      totalXpEarnedTicks: 0,
      promotionHistory: [
        { rankIndex: 161, familyId: "endgame_2", tier: 1, rankName: "Nguyên Soái Bậc 1" },
        { rankIndex: 147, familyId: "endgame_1", tier: 1, rankName: "Thống Soái Bậc 1" },
      ],
      rankRetries: {
        "161": 2,
      },
    },
  };
  const migrated8 = sanitizeAndMigrateState(saveCase8_196);
  assert(
    migrated8.progression.currentRankIndex === 177,
    `Case 8: 196 rank 161 (Nguyên Soái 1) mapped to 216 rank 177 (got ${migrated8.progression.currentRankIndex})`
  );
  assert(
    migrated8.progression.rankLayoutVersion === 216,
    "Case 8: rankLayoutVersion stamped to 216"
  );
  assert(
    migrated8.progression.promotionHistory[0].rankIndex === 177,
    `Case 8: History entry for Nguyên Soái mapped to 177 (got ${migrated8.progression.promotionHistory[0].rankIndex})`
  );
  assert(
    migrated8.progression.rankRetries?.[177] === 2,
    `Case 8: rankRetries key remapped from 161 to 177 (got ${migrated8.progression.rankRetries?.[177]})`
  );

  // Case 9: 196 -> 216 Layout Migration (Tổng Tư Lệnh at old index 195)
  const saveCase9_196 = {
    catalogVersion: 15,
    player: { name: "Tổng Tư Lệnh", createdAt: Date.now() },
    progression: {
      currentRankIndex: 195, // Max rank in 196 layout
      xpIntoCurrentRankTicks: 1000 * 600_000,
      totalXpEarnedTicks: (oldBase215 + 1000) * 600_000,
      promotionHistory: [
        { rankIndex: 195, familyId: "endgame_4", tier: null, rankName: "Tổng Tư Lệnh" },
        { rankIndex: 177, familyId: "endgame_3", tier: 1, rankName: "Đại Nguyên Soái Bậc 1" },
      ],
    },
  };
  const migrated9 = sanitizeAndMigrateState(saveCase9_196);
  assert(
    migrated9.progression.currentRankIndex === 215,
    `Case 9: 196 rank 195 mapped to 216 rank 215 (got ${migrated9.progression.currentRankIndex})`
  );
  assert(
    migrated9.progression.promotionHistory[0].rankIndex === 215,
    `Case 9: History entry for Tổng Tư Lệnh mapped to 215 (got ${migrated9.progression.promotionHistory[0].rankIndex})`
  );
  assert(
    migrated9.progression.promotionHistory[1].rankIndex === 195,
    `Case 9: History entry for Đại Nguyên Soái 1 mapped to 195 (got ${migrated9.progression.promotionHistory[1].rankIndex})`
  );

  // Case 10: Idempotent 216 -> 216
  const migrated9Twice = sanitizeAndMigrateState(migrated9);
  assert(
    migrated9Twice.progression.currentRankIndex === 215,
    "Case 10: Idempotent migration maintains 215"
  );
  assert(
    migrated9Twice.progression.promotionHistory[0].rankIndex === 215,
    "Case 10: Idempotent history maintains 215"
  );

  console.log("\nALL XP SYSTEM & MIGRATION TESTS PASSED PERFECTLY! ✨");
}

runTests();

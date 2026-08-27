import {
  BAU_CUA_SYMBOLS,
  BAU_CUA_BOARD_LAYOUT,
  calculateAvailableGold,
  calculateDoorReturn,
  calculateTotalBets,
  countOccurrences,
  createEmptyBets,
  getBauCuaWinType,
  getMaxBetForDoor,
  rollBauCuaDice,
  settleBauCuaRound,
  validateBet,
} from "./bauCuaEngine";
import { BauCuaBets, BauCuaSymbol } from "../types";

export function runBauCuaEngineTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
    } else {
      failed++;
      errors.push(`FAILED: ${testName}`);
    }
  }

  function assertEqual<T>(actual: T, expected: T, testName: string) {
    if (actual === expected) {
      passed++;
    } else {
      failed++;
      errors.push(`FAILED: ${testName} - expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  // --- 1. BET CALCULATIONS & MAX BET TESTS ---
  {
    // Test 1.1: Gold 100, no bets -> max 100 on any door
    const bets1 = createEmptyBets();
    assertEqual(getMaxBetForDoor(100, bets1, "bau"), 100, "1.1 Max bet on empty board is currentGold (100)");
    assertEqual(calculateAvailableGold(100, bets1), 100, "1.1 Available gold on empty board is 100");

    // Test 1.2: Gold 100, Bầu 30, Cua 20 -> đặt Tôm max 50
    const bets2: BauCuaBets = { ...createEmptyBets(), bau: 30, cua: 20 };
    assertEqual(calculateTotalBets(bets2), 50, "1.2 Total bets is 50");
    assertEqual(calculateAvailableGold(100, bets2), 50, "1.2 Available gold is 50");
    assertEqual(getMaxBetForDoor(100, bets2, "tom"), 50, "1.2 Max bet on new door Tom is 50");

    // Test 1.3: Gold 100, Bầu 30, Cua 20 -> edit Bầu max 80 (100 - 50 + 30 = 80)
    assertEqual(getMaxBetForDoor(100, bets2, "bau"), 80, "1.3 Max bet when editing Bau is 80");
    // Edit Cua max 70 (100 - 50 + 20 = 70)
    assertEqual(getMaxBetForDoor(100, bets2, "cua"), 70, "1.3 Max bet when editing Cua is 70");

    // Test 1.4: Bet 0 reject
    const v0 = validateBet(0, 100);
    assert(!v0.valid, "1.4 Bet 0 is rejected");

    // Test 1.5: Bet negative reject
    const vNeg = validateBet(-10, 100);
    assert(!vNeg.valid, "1.5 Bet negative is rejected");

    // Test 1.6: Decimal reject
    const vDec = validateBet("10.5", 100);
    assert(!vDec.valid, "1.6 Bet decimal 10.5 is rejected");
    const vComma = validateBet("10,5", 100);
    assert(!vComma.valid, "1.6 Bet comma 10,5 is rejected");

    // Test 1.7: Bet > available reject
    const vOver = validateBet(85, 80);
    assert(!vOver.valid, "1.7 Bet 85 > maxBet 80 is rejected");

    // Test 1.8: Valid integer within bounds accepted
    const vOk = validateBet(80, 80);
    assert(vOk.valid && vOk.sanitizedAmount === 80, "1.8 Bet exactly maxBet 80 is accepted");
    const vOk1 = validateBet("1", 80);
    assert(vOk1.valid && vOk1.sanitizedAmount === 1, "1.8 Bet min 1 is accepted");
  }

  // --- 2. PAYOUT TESTS ---
  {
    // Cua = 100 tests
    const bet = 100;
    // 0 hits -> return 0, net = -100
    assertEqual(calculateDoorReturn(bet, 0), 0, "2.1 0 occurrences return 0");
    assertEqual(calculateDoorReturn(bet, 0) - bet, -100, "2.1 0 occurrences net -100");

    // 1 hit -> return 200, net = +100
    assertEqual(calculateDoorReturn(bet, 1), 200, "2.2 1 occurrence return 200");
    assertEqual(calculateDoorReturn(bet, 1) - bet, 100, "2.2 1 occurrence net +100");

    // 2 hits -> return 300, net = +200
    assertEqual(calculateDoorReturn(bet, 2), 300, "2.3 2 occurrences return 300");
    assertEqual(calculateDoorReturn(bet, 2) - bet, 200, "2.3 2 occurrences net +200");

    // 3 hits -> return 400, net = +300
    assertEqual(calculateDoorReturn(bet, 3), 400, "2.4 3 occurrences return 400");
    assertEqual(calculateDoorReturn(bet, 3) - bet, 300, "2.4 3 occurrences net +300");

    // Multi-door settlement test:
    // PreGold = 500
    // Bets: Bau 50, Cua 100, Ga 50 (TotalBet = 200)
    // Result: [cua, cua, tom]
    // Occurrences: cua: 2, tom: 1, others: 0
    // Returns: Cua: 100 * 3 = 300. Bau: 0. Ga: 0. TotalReturn = 300.
    // Net: 300 - 200 = +100.
    // PostGold: 500 - 200 + 300 = 600.
    const multiBets: BauCuaBets = { ...createEmptyBets(), bau: 50, cua: 100, ga: 50 };
    const multiResult: [BauCuaSymbol, BauCuaSymbol, BauCuaSymbol] = ["cua", "cua", "tom"];
    const settlement = settleBauCuaRound(500, multiBets, multiResult);

    assertEqual(settlement.round.totalBet, 200, "2.5 Multi-door totalBet is 200");
    assertEqual(settlement.round.totalReturn, 300, "2.5 Multi-door totalReturn is 300");
    assertEqual(settlement.round.net, 100, "2.5 Multi-door net is +100");
    assertEqual(settlement.postRoundGold, 600, "2.5 Multi-door postRoundGold is 600");
    assertEqual(settlement.round.preGold, 500, "2.5 Multi-door preGold is 500");
    assertEqual(settlement.round.postGold, 600, "2.5 Multi-door postGold is 600");
  }

  // --- 3. ZERO GOLD / NEGATIVE PREVENTION TESTS ---
  {
    // Lose all: PreGold = 100, Bet = 100 on Bau, Result = [cua, tom, ca]
    const allInBets: BauCuaBets = { ...createEmptyBets(), bau: 100 };
    const loseResult: [BauCuaSymbol, BauCuaSymbol, BauCuaSymbol] = ["cua", "tom", "ca"];
    const loseSettlement = settleBauCuaRound(100, allInBets, loseResult);

    assertEqual(loseSettlement.round.totalReturn, 0, "3.1 Complete loss totalReturn is 0");
    assertEqual(loseSettlement.round.net, -100, "3.1 Complete loss net is -100");
    assertEqual(loseSettlement.postRoundGold, 0, "3.1 Complete loss postRoundGold is exactly 0 (no negative)");
  }

  // --- 4. RNG VALIDITY & UNBIASED SYMBOL TESTS ---
  {
    const rollsCount = 100;
    const symbolSet = new Set(BAU_CUA_SYMBOLS);
    let allValid = true;

    for (let i = 0; i < rollsCount; i++) {
      const dice = rollBauCuaDice();
      if (dice.length !== 3) {
        allValid = false;
        break;
      }
      if (!symbolSet.has(dice[0]) || !symbolSet.has(dice[1]) || !symbolSet.has(dice[2])) {
        allValid = false;
        break;
      }
    }
    assert(allValid, "4.1 RNG produces strictly valid 3 Bau Cua symbols over 100 rolls");
  }

  // --- 5. OCCURRENCE COUNTING TESTS ---
  {
    const occ1 = countOccurrences(["bau", "bau", "bau"]);
    assertEqual(occ1.bau, 3, "5.1 Three Bau occurrences count is 3");
    assertEqual(occ1.cua, 0, "5.1 Zero Cua occurrences count is 0");

    const occ2 = countOccurrences(["ga", "nai", "ga"]);
    assertEqual(occ2.ga, 2, "5.2 Two Ga occurrences count is 2");
    assertEqual(occ2.nai, 1, "5.2 One Nai occurrence count is 1");
    assertEqual(occ2.tom, 0, "5.2 Zero Tom occurrences count is 0");
  }

  // --- 6. WIN TYPE CLASSIFICATION TESTS ---
  {
    // 6.1: Perfect Win (Trúng 3 cửa)
    const betsPerfect: BauCuaBets = { ...createEmptyBets(), bau: 50 };
    const resPerfect = settleBauCuaRound(100, betsPerfect, ["bau", "bau", "bau"]);
    assertEqual(getBauCuaWinType(resPerfect.round), "perfect_win", "6.1 Triple match on bet is perfect_win");

    // 6.2: Big Win (Trúng 2 cửa)
    const betsBig: BauCuaBets = { ...createEmptyBets(), tom: 50, ca: 20 };
    const resBig = settleBauCuaRound(100, betsBig, ["tom", "tom", "ga"]);
    assertEqual(getBauCuaWinType(resBig.round), "big_win", "6.2 Double match on bet is big_win");

    // 6.3: Regular Win (Trúng 1 cửa)
    const betsReg: BauCuaBets = { ...createEmptyBets(), ga: 50 };
    const resReg = settleBauCuaRound(100, betsReg, ["ga", "nai", "cua"]);
    assertEqual(getBauCuaWinType(resReg.round), "regular_win", "6.3 Single match on bet is regular_win");

    // 6.4: Draw (Hòa vốn)
    // Bet 50 on Bau, 50 on Cua (Total 100). Result: [bau, tom, ca] -> Bau returns 100, Cua 0 -> Net = 0
    const betsDraw: BauCuaBets = { ...createEmptyBets(), bau: 50, cua: 50 };
    const resDraw = settleBauCuaRound(100, betsDraw, ["bau", "tom", "ca"]);
    assertEqual(resDraw.round.net, 0, "6.4 Net is 0");
    assertEqual(getBauCuaWinType(resDraw.round), "draw", "6.4 Break-even is draw");

    // 6.5: Loss (Thua)
    const betsLoss: BauCuaBets = { ...createEmptyBets(), bau: 50 };
    const resLoss = settleBauCuaRound(100, betsLoss, ["cua", "tom", "ca"]);
    assertEqual(getBauCuaWinType(resLoss.round), "loss", "6.5 Lost bet is loss");
  }

  // --- 7. TRADITIONAL 2x3 BOARD LAYOUT TESTS ---
  {
    assertEqual(BAU_CUA_BOARD_LAYOUT.length, 6, "7.1 Board layout has 6 doors");
    // Row 1: Nai, Bầu, Gà
    assertEqual(BAU_CUA_BOARD_LAYOUT[0], "nai", "7.2 Row 1 Col 1 is Nai");
    assertEqual(BAU_CUA_BOARD_LAYOUT[1], "bau", "7.3 Row 1 Col 2 is Bầu");
    assertEqual(BAU_CUA_BOARD_LAYOUT[2], "ga", "7.4 Row 1 Col 3 is Gà");
    // Row 2: Tôm, Cua, Cá
    assertEqual(BAU_CUA_BOARD_LAYOUT[3], "tom", "7.5 Row 2 Col 1 is Tôm");
    assertEqual(BAU_CUA_BOARD_LAYOUT[4], "cua", "7.6 Row 2 Col 2 is Cua");
    assertEqual(BAU_CUA_BOARD_LAYOUT[5], "ca", "7.7 Row 2 Col 3 is Cá");
  }

  return { passed, failed, errors };
}

// Auto-run if executed directly via node / tsx
if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("bauCuaEngine.test")) {
  const result = runBauCuaEngineTests();
  console.log(`[TESTS FINISHED] Passed: ${result.passed}, Failed: ${result.failed}`);
  if (result.failed > 0) {
    console.error("Test Failures:\n" + result.errors.join("\n"));
    process.exit(1);
  } else {
    console.log("All Bau Cua tests passed successfully!");
  }
}

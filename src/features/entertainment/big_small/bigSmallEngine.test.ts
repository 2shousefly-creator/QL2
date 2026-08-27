import {
  BIG_SMALL_BET_IDS,
  BIG_SMALL_DOOR_INFO,
  calculateAvailableGold,
  calculateDoorReturn,
  calculateTotalBigSmallBets,
  createEmptyBigSmallBets,
  getBigSmallWinType,
  getDiceTotal,
  getMaxBetForBigSmallDoor,
  getTripleValue,
  isBigWin,
  isSmallWin,
  isTripleResult,
  rollThreeDice,
  settleBigSmallRound,
  validateBet,
} from "./bigSmallEngine";
import { BigSmallBets } from "../types";

export function runBigSmallEngineTests(): { passed: number; failed: number; errors: string[] } {
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

  // --- 1. DICE & BASIC HELPER TESTS ---
  {
    assertEqual(getDiceTotal([1, 2, 3]), 6, "1.1 Total of [1,2,3] is 6");
    assertEqual(getDiceTotal([6, 6, 6]), 18, "1.1 Total of [6,6,6] is 18");
    assertEqual(getDiceTotal([1, 1, 1]), 3, "1.1 Total of [1,1,1] is 3");

    assert(isTripleResult([1, 1, 1]), "1.2 [1,1,1] is triple");
    assert(isTripleResult([3, 3, 3]), "1.2 [3,3,3] is triple");
    assert(!isTripleResult([1, 1, 2]), "1.2 [1,1,2] is not triple");
    assert(!isTripleResult([2, 3, 4]), "1.2 [2,3,4] is not triple");

    assertEqual(getTripleValue([4, 4, 4]), 4, "1.3 Triple value of [4,4,4] is 4");
    assertEqual(getTripleValue([1, 2, 3]), null, "1.3 Triple value of [1,2,3] is null");
  }

  // --- 2. GAME RULES & OUTCOME TESTS ---
  {
    // [1, 1, 2]: total 4 -> Small win, Big lose
    assert(isSmallWin([1, 1, 2]), "2.1 [1,1,2] total 4 is Small win");
    assert(!isBigWin([1, 1, 2]), "2.1 [1,1,2] is not Big win");

    // [3, 3, 4]: total 10 -> Small win
    assert(isSmallWin([3, 3, 4]), "2.2 [3,3,4] total 10 is Small win");
    assert(!isBigWin([3, 3, 4]), "2.2 [3,3,4] is not Big win");

    // [3, 4, 4]: total 11 -> Big win
    assert(isBigWin([3, 4, 4]), "2.3 [3,4,4] total 11 is Big win");
    assert(!isSmallWin([3, 4, 4]), "2.3 [3,4,4] is not Small win");

    // [5, 6, 6]: total 17 -> Big win
    assert(isBigWin([5, 6, 6]), "2.4 [5,6,6] total 17 is Big win");
    assert(!isSmallWin([5, 6, 6]), "2.4 [5,6,6] is not Small win");

    // [1, 1, 1]: total 3
    assert(isSmallWin([1, 1, 1]), "2.5 [1,1,1] is Small win (3-10)");
    assert(!isBigWin([1, 1, 1]), "2.5 [1,1,1] Big loses");

    // [6, 6, 6]: total 18
    assert(isBigWin([6, 6, 6]), "2.6 [6,6,6] Big wins (11-18)");
    assert(!isSmallWin([6, 6, 6]), "2.6 [6,6,6] Small loses");
  }

  // --- 3. PAYOUT RATIO TESTS ---
  {
    // Bet 100:
    // Small win (1:1) -> return 200
    assertEqual(calculateDoorReturn("small", 100, [1, 2, 3]), 200, "3.1 Small win return is 200 (1:1 profit 100 + stake 100)");
    // Small lose -> return 0
    assertEqual(calculateDoorReturn("small", 100, [4, 5, 6]), 0, "3.1 Small lose return is 0");

    // Big win (1:1) -> return 200
    assertEqual(calculateDoorReturn("big", 100, [4, 5, 6]), 200, "3.2 Big win return is 200 (1:1 profit 100 + stake 100)");
    // Big lose -> return 0
    assertEqual(calculateDoorReturn("big", 100, [1, 2, 3]), 0, "3.2 Big lose on [1,2,3] return is 0");
  }

  // --- 4. SETTLEMENT TESTS ---
  {
    const bets1: BigSmallBets = {
      small: 1000,
      big: 0,
    };
    const res1 = settleBigSmallRound(10000, bets1, [2, 3, 4]);
    assertEqual(res1.round.totalBet, 1000, "4.1 Multi-door totalBet is 1000");
    assertEqual(res1.round.totalReturn, 2000, "4.1 Multi-door totalReturn is 2000");
    assertEqual(res1.round.net, 1000, "4.1 Multi-door net is +1000");
    assertEqual(res1.postRoundGold, 11000, "4.1 Multi-door postRoundGold is 11000");
  }

  // --- 5. BET VALIDATION & MAX BET FORMULA TESTS ---
  {
    const emptyBets = createEmptyBigSmallBets();
    assertEqual(getMaxBetForBigSmallDoor(1000, emptyBets, "small"), 1000, "5.1 Max bet on empty board is 1000");
    assertEqual(calculateAvailableGold(1000, emptyBets), 1000, "5.1 Available gold is 1000");

    // Bets: Small = 300, Big = 200 (Total = 500)
    const betsActive: BigSmallBets = { small: 300, big: 200 };
    assertEqual(calculateTotalBigSmallBets(betsActive), 500, "5.2 Total active bets is 500");
    assertEqual(calculateAvailableGold(1000, betsActive), 500, "5.2 Available gold is 500");

    // Editing Small: max = 1000 - 500 + 300 = 800
    assertEqual(getMaxBetForBigSmallDoor(1000, betsActive, "small"), 800, "5.3 Editing Small max bet is 800");
    // Editing Big: max = 1000 - 500 + 200 = 700
    assertEqual(getMaxBetForBigSmallDoor(1000, betsActive, "big"), 700, "5.4 Editing Big max bet is 700");

    // Validation checks:
    assert(!validateBet("", 500).valid, "5.5 Empty bet rejected");
    assert(!validateBet("0", 500).valid, "5.5 Bet 0 rejected");
    assert(!validateBet("-10", 500).valid, "5.5 Negative bet rejected");
    assert(!validateBet("10.5", 500).valid, "5.5 Decimal bet rejected");
    assert(!validateBet("abc", 500).valid, "5.5 Non-numeric bet rejected");
    assert(!validateBet("501", 500).valid, "5.5 Bet > maxBet rejected");

    const vValid = validateBet("500", 500);
    assert(vValid.valid && vValid.sanitizedAmount === 500, "5.6 Bet exact maxBet accepted");
    const vValid1 = validateBet("1", 500);
    assert(vValid1.valid && vValid1.sanitizedAmount === 1, "5.6 Bet 1 accepted");
  }

  // --- 6. ZERO GOLD & COMPLETE LOSS SAFETY TESTS ---
  {
    const allInBets: BigSmallBets = { small: 1000, big: 0 };
    const lossResult = settleBigSmallRound(1000, allInBets, [6, 6, 5]); // Total 17 -> Big wins, Small loses
    assertEqual(lossResult.round.totalReturn, 0, "6.1 Complete loss totalReturn is 0");
    assertEqual(lossResult.round.net, -1000, "6.1 Complete loss net is -1000");
    assertEqual(lossResult.postRoundGold, 0, "6.1 Post round gold is exactly 0 (no negative)");
  }

  // --- 7. RNG VALIDITY TESTS (100 ROLLS) ---
  {
    let allValid = true;
    for (let i = 0; i < 100; i++) {
      const dice = rollThreeDice();
      if (dice.length !== 3) {
        allValid = false;
        break;
      }
      for (const d of dice) {
        if (!Number.isInteger(d) || d < 1 || d > 6) {
          allValid = false;
          break;
        }
      }
    }
    assert(allValid, "7.1 100 rolls produce strictly integer dice values between 1 and 6");
  }

  // --- 8. WIN TYPE TIERS ---
  {
    // Regular win
    const roundReg = settleBigSmallRound(1000, { small: 100, big: 0 }, [1, 2, 3]).round;
    assertEqual(getBigSmallWinType(roundReg), "regular_win", "8.1 Small win is regular_win");

    // Draw
    const roundDraw = settleBigSmallRound(1000, { small: 100, big: 100 }, [1, 2, 3]).round;
    assertEqual(getBigSmallWinType(roundDraw), "draw", "8.2 Break-even round is draw");

    // Loss
    const roundLoss = settleBigSmallRound(1000, { small: 100, big: 0 }, [5, 5, 4]).round;
    assertEqual(getBigSmallWinType(roundLoss), "loss", "8.3 Lost round is loss");
  }

  // --- 9. CANONICAL FARM GOLD INVARIANTS ---
  {
    // Simulate draft updater function
    function applyGoldTransactionToFarmDraft(
      farm: { gold: number },
      postGold: number
    ) {
      farm.gold = postGold;
    }

    const testFarm = {
      gold: 1000,
    };

    // Test Win
    const winSettle = settleBigSmallRound(testFarm.gold, { small: 200, big: 0 }, [1, 2, 3]);
    applyGoldTransactionToFarmDraft(testFarm, winSettle.postRoundGold);
    assertEqual(testFarm.gold, 1200, "9.1 Win: farm.gold is 1200");

    // Test Loss
    const lossSettle = settleBigSmallRound(testFarm.gold, { small: 300, big: 0 }, [6, 6, 6]);
    applyGoldTransactionToFarmDraft(testFarm, lossSettle.postRoundGold);
    assertEqual(testFarm.gold, 900, "9.2 Loss: farm.gold is 900");
  }

  return { passed, failed, errors };
}

// Auto-run if executed directly via node / tsx
if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("bigSmallEngine.test")) {
  const result = runBigSmallEngineTests();
  console.log(`[BIG SMALL TESTS] Passed: ${result.passed}, Failed: ${result.failed}`);
  if (result.failed > 0) {
    console.error("Failures:\n" + result.errors.join("\n"));
    process.exit(1);
  } else {
    console.log("All Big Small tests passed successfully!");
  }
}

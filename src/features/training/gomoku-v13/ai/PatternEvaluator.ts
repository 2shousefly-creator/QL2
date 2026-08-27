import { GomokuMark, Stone } from "../domain/gomokuTypes";
import { coordKey } from "../domain/CoordKey";
import { DIRECTIONS } from "../domain/GomokuRules";

export const SCORES = {
  WIN_FIVE: 10000000,
  OPEN_FOUR: 1000000,
  CLOSED_FOUR: 150000,
  FORK_FOUR_THREE: 700000,
  FORK_DOUBLE_THREE: 400000,
  OPEN_THREE: 50000,
  CLOSED_THREE: 5000,
  OPEN_TWO: 1000,
  CLOSED_TWO: 100,
} as const;

export type PatternAnalysis = {
  fiveCount: number;
  openFourCount: number;
  closedFourCount: number;
  openThreeCount: number;
  closedThreeCount: number;
  openTwoCount: number;
  closedTwoCount: number;
  totalScore: number;
};

/**
 * Analyzes what patterns are formed or completed if `mark` is placed at (x, y).
 */
export function analyzePointPatterns(
  x: number,
  y: number,
  mark: GomokuMark,
  occupiedMap: Map<string, GomokuMark>
): PatternAnalysis {
  let fiveCount = 0;
  let openFourCount = 0;
  let closedFourCount = 0;
  let openThreeCount = 0;
  let closedThreeCount = 0;
  let openTwoCount = 0;
  let closedTwoCount = 0;

  for (const [dx, dy] of DIRECTIONS) {
    // Build a 9-length line around (x, y) from offset -4 to +4
    // Index 4 corresponds to offset 0 (the candidate point (x,y))
    const line: number[] = []; // 1 for mark, -1 for opponent, 0 for empty
    for (let k = -4; k <= 4; k++) {
      if (k === 0) {
        line.push(1); // Assume mark placed at (x,y)
      } else {
        const key = coordKey(x + dx * k, y + dy * k);
        const m = occupiedMap.get(key);
        if (m === mark) {
          line.push(1);
        } else if (m === undefined) {
          line.push(0);
        } else {
          line.push(-1); // Opponent mark
        }
      }
    }

    // Evaluate 5-windows containing index 4 (candidate move)
    // Indices 0..4, 1..5, 2..6, 3..7, 4..8
    let dirFive = false;
    let dirOpenFour = 0;
    let dirClosedFour = 0;
    let dirOpenThree = 0;
    let dirClosedThree = 0;
    let dirOpenTwo = 0;
    let dirClosedTwo = 0;

    for (let wStart = 0; wStart <= 4; wStart++) {
      const wEnd = wStart + 4; // 5 elements: wStart..wEnd
      let markCount = 0;
      let hasOpponent = false;

      for (let i = wStart; i <= wEnd; i++) {
        if (line[i] === -1) {
          hasOpponent = true;
          break;
        }
        if (line[i] === 1) {
          markCount++;
        }
      }

      if (hasOpponent) continue;

      // Check outer boundaries immediately outside the 5-window
      const leftOuter = wStart > 0 ? line[wStart - 1] : -1;
      const rightOuter = wEnd < 8 ? line[wEnd + 1] : -1;

      if (markCount === 5) {
        dirFive = true;
      } else if (markCount === 4) {
        if (leftOuter === 0 && rightOuter === 0) {
          dirOpenFour++;
        } else {
          dirClosedFour++;
        }
      } else if (markCount === 3) {
        if (leftOuter === 0 && rightOuter === 0) {
          dirOpenThree++;
        } else if (leftOuter === 0 || rightOuter === 0) {
          dirClosedThree++;
        }
      } else if (markCount === 2) {
        if (leftOuter === 0 && rightOuter === 0) {
          dirOpenTwo++;
        } else if (leftOuter === 0 || rightOuter === 0) {
          dirClosedTwo++;
        }
      }
    }

    if (dirFive) {
      fiveCount++;
    } else {
      if (dirOpenFour > 0) openFourCount += 1;
      else if (dirClosedFour > 0) closedFourCount += 1;

      if (dirOpenThree > 0) openThreeCount += 1;
      else if (dirClosedThree > 0) closedThreeCount += 1;

      if (dirOpenTwo > 0) openTwoCount += 1;
      else if (dirClosedTwo > 0) closedTwoCount += 1;
    }
  }

  // Calculate total score based on patterns
  let totalScore = 0;

  if (fiveCount > 0) {
    totalScore += SCORES.WIN_FIVE * fiveCount;
  }
  if (openFourCount > 0) {
    totalScore += SCORES.OPEN_FOUR * openFourCount;
  }
  if (closedFourCount > 0) {
    totalScore += SCORES.CLOSED_FOUR * closedFourCount;
  }

  // Fork detection: Double 3, Four-Three, Double 4
  const totalFours = openFourCount + closedFourCount;
  if (totalFours >= 2) {
    totalScore += SCORES.OPEN_FOUR; // Huge double-four bonus
  } else if (totalFours >= 1 && openThreeCount >= 1) {
    totalScore += SCORES.FORK_FOUR_THREE;
  } else if (openThreeCount >= 2) {
    totalScore += SCORES.FORK_DOUBLE_THREE;
  }

  if (openThreeCount > 0) {
    totalScore += SCORES.OPEN_THREE * openThreeCount;
  }
  if (closedThreeCount > 0) {
    totalScore += SCORES.CLOSED_THREE * closedThreeCount;
  }
  if (openTwoCount > 0) {
    totalScore += SCORES.OPEN_TWO * openTwoCount;
  }
  if (closedTwoCount > 0) {
    totalScore += SCORES.CLOSED_TWO * closedTwoCount;
  }

  return {
    fiveCount,
    openFourCount,
    closedFourCount,
    openThreeCount,
    closedThreeCount,
    openTwoCount,
    closedTwoCount,
    totalScore,
  };
}

/**
 * Legacy wrapper for evaluating a single point's score
 */
export function evaluatePointScore(
  x: number,
  y: number,
  mark: GomokuMark,
  occupiedMap: Map<string, GomokuMark>
): number {
  return analyzePointPatterns(x, y, mark, occupiedMap).totalScore;
}

/**
 * Evaluates full board score from AI perspective.
 */
export function evaluateBoard(
  stones: readonly Stone[],
  aiMark: GomokuMark,
  playerMark: GomokuMark
): number {
  const map = new Map<string, GomokuMark>();
  for (const s of stones) {
    map.set(coordKey(s.x, s.y), s.mark);
  }

  let aiScore = 0;
  let playerScore = 0;

  for (const s of stones) {
    const analysis = analyzePointPatterns(s.x, s.y, s.mark, map);
    if (s.mark === aiMark) {
      aiScore += analysis.totalScore;
    } else {
      playerScore += analysis.totalScore;
    }
  }

  return aiScore - playerScore * 1.25; // Prioritize defensive blocking
}

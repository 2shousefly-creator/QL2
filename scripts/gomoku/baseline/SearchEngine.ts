import { BoardPoint, GomokuDifficulty, GomokuMark, Stone } from "../../../src/features/training/gomoku-v13/domain/gomokuTypes";
import { coordKey } from "../../../src/features/training/gomoku-v13/domain/CoordKey";
import { generateCandidates } from "./CandidateGenerator";
import { analyzePointPatterns, evaluateBoard, SCORES } from "./PatternEvaluator";
import { SparseGomokuBoard } from "../../../src/features/training/gomoku-v13/domain/SparseBoard";
import { checkWinAt } from "../../../src/features/training/gomoku-v13/domain/GomokuRules";

export class SearchEngine {
  public static selectMove(
    stones: readonly Stone[],
    aiMark: GomokuMark,
    playerMark: GomokuMark,
    difficulty: GomokuDifficulty,
    timeBudgetMs: number = 2000
  ): BoardPoint {
    const startTime = Date.now();

    // 0. First move on empty board
    if (stones.length === 0) {
      return { x: 0, y: 0 };
    }

    const candidates = generateCandidates(stones, 2);
    if (candidates.length === 0) {
      return { x: 0, y: 0 };
    }

    const map = new Map<string, GomokuMark>();
    for (const s of stones) {
      map.set(coordKey(s.x, s.y), s.mark);
    }

    // --- STEP 1: IMMEDIATE WIN CHECK FOR AI ---
    for (const cand of candidates) {
      const aiAnalysis = analyzePointPatterns(cand.x, cand.y, aiMark, map);
      if (aiAnalysis.fiveCount > 0) {
        return cand; // Immediate winning move!
      }
    }

    // --- STEP 2: MUST-BLOCK PLAYER 5 IN A ROW (4-IN-A-ROW THREAT) ---
    // If Player can make 5 in 1 move (from a straight 4 or broken 4 like X X . X X), AI MUST BLOCK!
    const playerWinBlocks: { point: BoardPoint; score: number }[] = [];
    for (const cand of candidates) {
      const playerAnalysis = analyzePointPatterns(cand.x, cand.y, playerMark, map);
      if (playerAnalysis.fiveCount > 0) {
        const aiAnalysis = analyzePointPatterns(cand.x, cand.y, aiMark, map);
        playerWinBlocks.push({ point: cand, score: aiAnalysis.totalScore });
      }
    }

    if (playerWinBlocks.length > 0) {
      // Must block player win. If multiple block spots, pick the one with highest AI counter value.
      playerWinBlocks.sort((a, b) => b.score - a.score);
      return playerWinBlocks[0].point;
    }

    // --- STEP 3: AI OPEN FOUR CREATION ---
    for (const cand of candidates) {
      const aiAnalysis = analyzePointPatterns(cand.x, cand.y, aiMark, map);
      if (aiAnalysis.openFourCount > 0) {
        return cand; // Guarantees win on next turn
      }
    }

    // --- STEP 4: BLOCK PLAYER OPEN FOUR / DANGEROUS FORKS ---
    // Spot where Player placing a stone creates an Open Four or Double Three / 4-3 Fork
    const playerThreatBlocks: { point: BoardPoint; playerThreat: number; aiCounter: number; total: number }[] = [];
    for (const cand of candidates) {
      const playerAnalysis = analyzePointPatterns(cand.x, cand.y, playerMark, map);
      const isPlayerThreat =
        playerAnalysis.openFourCount > 0 ||
        playerAnalysis.closedFourCount > 0 ||
        playerAnalysis.openThreeCount >= 2 ||
        (playerAnalysis.openFourCount + playerAnalysis.closedFourCount >= 1 && playerAnalysis.openThreeCount >= 1) ||
        playerAnalysis.openThreeCount >= 1;

      if (isPlayerThreat) {
        const aiAnalysis = analyzePointPatterns(cand.x, cand.y, aiMark, map);
        let counterBonus = 0;
        // Dual-purpose move bonus: Blocking Player AND building AI attack simultaneously!
        if (aiAnalysis.openThreeCount > 0 || aiAnalysis.closedFourCount > 0) {
          counterBonus = 250000;
        }

        const totalValue = playerAnalysis.totalScore * 1.35 + aiAnalysis.totalScore + counterBonus;
        playerThreatBlocks.push({
          point: cand,
          playerThreat: playerAnalysis.totalScore,
          aiCounter: aiAnalysis.totalScore + counterBonus,
          total: totalValue,
        });
      }
    }

    if (playerThreatBlocks.length > 0) {
      playerThreatBlocks.sort((a, b) => b.total - a.total);

      if (difficulty === "hard") {
        // Hard AI ALWAYS blocks player threat and selects the best counter-attack spot!
        return playerThreatBlocks[0].point;
      } else if (difficulty === "medium") {
        // Medium AI ALWAYS blocks player threat
        return playerThreatBlocks[0].point;
      } else if (difficulty === "easy") {
        // Easy AI blocks player 4s and open 3s with ~85% chance
        if (Math.random() < 0.85) {
          return playerThreatBlocks[0].point;
        }
      }
    }

    // --- STEP 5: CANDIDATE SCORING & SELECTION ---
    const scoredCandidates = candidates.map((cand) => {
      const aiAnalysis = analyzePointPatterns(cand.x, cand.y, aiMark, map);
      const playerAnalysis = analyzePointPatterns(cand.x, cand.y, playerMark, map);

      let counterBonus = 0;
      // For Hard AI: Identify positions that BOTH block player AND advance AI attack
      if (difficulty === "hard") {
        if (playerAnalysis.openThreeCount > 0 && aiAnalysis.openThreeCount > 0) {
          counterBonus += 250000;
        }
        if (playerAnalysis.closedThreeCount > 0 && aiAnalysis.openThreeCount > 0) {
          counterBonus += 150000;
        }
      }

      const multPlayer = difficulty === "hard" ? 1.35 : difficulty === "medium" ? 1.25 : 1.0;
      const multAi = difficulty === "hard" ? 1.1 : difficulty === "medium" ? 1.0 : 0.8;

      const combinedScore = playerAnalysis.totalScore * multPlayer + aiAnalysis.totalScore * multAi + counterBonus;
      return { point: cand, score: combinedScore };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    // Filter candidates for Minimax
    const maxCandidates = difficulty === "easy" ? 6 : difficulty === "medium" ? 12 : 16;
    const topCandidates = scoredCandidates.slice(0, maxCandidates);

    // EASY DIFFICULTY: Pick among top 2-3 evaluated moves to feel natural, but safe from 3s & 4s
    if (difficulty === "easy") {
      const topSlice = topCandidates.slice(0, Math.min(2, topCandidates.length));
      const idx = Math.floor(Math.random() * topSlice.length);
      return topSlice[idx].point;
    }

    // MEDIUM & HARD DIFFICULTY: Deep Minimax Search with Alpha-Beta Pruning
    const searchDepth = difficulty === "medium" ? 3 : 4;
    let bestMove = topCandidates[0].point;
    let bestEval = -Infinity;

    for (const item of topCandidates) {
      if (Date.now() - startTime > timeBudgetMs) {
        break; // Respect time budget
      }

      const nextStones: Stone[] = [
        ...stones,
        {
          x: item.point.x,
          y: item.point.y,
          mark: aiMark,
          actor: "ai",
          ply: stones.length + 1,
        },
      ];

      const score = SearchEngine.minimax(
        nextStones,
        searchDepth - 1,
        -Infinity,
        Infinity,
        false,
        aiMark,
        playerMark,
        startTime,
        timeBudgetMs
      );

      if (score > bestEval) {
        bestEval = score;
        bestMove = item.point;
      }
    }

    return bestMove;
  }

  private static minimax(
    stones: readonly Stone[],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    aiMark: GomokuMark,
    playerMark: GomokuMark,
    startTime: number,
    timeBudgetMs: number
  ): number {
    const board = new SparseGomokuBoard(stones);
    const lastMove = stones[stones.length - 1];

    if (lastMove) {
      const win = checkWinAt(board, lastMove, lastMove.mark);
      if (win) {
        return lastMove.mark === aiMark ? SCORES.WIN_FIVE + depth * 1000 : -SCORES.WIN_FIVE - depth * 1000;
      }
    }

    if (depth === 0 || Date.now() - startTime > timeBudgetMs) {
      return evaluateBoard(stones, aiMark, playerMark);
    }

    const candidates = generateCandidates(stones, 2).slice(0, 10);
    const currentMark = isMaximizing ? aiMark : playerMark;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const cand of candidates) {
        const nextStones = [
          ...stones,
          {
            x: cand.x,
            y: cand.y,
            mark: currentMark,
            actor: "ai" as const,
            ply: stones.length + 1,
          },
        ];
        const evalScore = SearchEngine.minimax(
          nextStones,
          depth - 1,
          alpha,
          beta,
          false,
          aiMark,
          playerMark,
          startTime,
          timeBudgetMs
        );
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const cand of candidates) {
        const nextStones = [
          ...stones,
          {
            x: cand.x,
            y: cand.y,
            mark: currentMark,
            actor: "player" as const,
            ply: stones.length + 1,
          },
        ];
        const evalScore = SearchEngine.minimax(
          nextStones,
          depth - 1,
          alpha,
          beta,
          true,
          aiMark,
          playerMark,
          startTime,
          timeBudgetMs
        );
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }
}

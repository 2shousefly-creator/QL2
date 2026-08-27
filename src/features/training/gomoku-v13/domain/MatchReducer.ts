import {
  GomokuActor,
  GomokuCommand,
  GomokuDifficulty,
  GomokuMark,
  GomokuMatchState,
  Stone,
} from "./gomokuTypes";
import { SparseGomokuBoard } from "./SparseBoard";
import { checkWinAt } from "./GomokuRules";

export function createInitialMatchState(
  difficulty: GomokuDifficulty,
  playerMark: GomokuMark,
  seed: string = Math.random().toString(36).substring(2)
): GomokuMatchState {
  const matchId = `gomoku_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const aiMark: GomokuMark = playerMark === "X" ? "O" : "X";

  // 50:50 Random starter selection using crypto or PRNG
  const randomVal = crypto.getRandomValues(new Uint32Array(1))[0];
  const startingActor: GomokuActor = (randomVal & 1) === 0 ? "player" : "ai";

  return {
    matchId,
    seed,
    difficulty,
    playerMark,
    aiMark,
    startingActor,
    phase: "starter_reveal",
    stones: [],
    lastMove: null,
    winningLine: null,
    aiRequestId: null,
    resultCommitted: false,
    startedAtEpochMs: Date.now(),
  };
}

export function matchReducer(
  state: GomokuMatchState,
  command: GomokuCommand
): GomokuMatchState {
  switch (command.type) {
    case "FINISH_STARTER_REVEAL": {
      if (state.phase !== "starter_reveal") return state;
      const nextPhase = state.startingActor === "player" ? "player_turn" : "ai_turn";
      return { ...state, phase: nextPhase };
    }

    case "PLAYER_PLACE": {
      if (state.phase !== "player_turn") return state;
      const board = new SparseGomokuBoard(state.stones);
      if (board.has(command.point)) return state;

      const newPly = state.stones.length + 1;
      const newStone: Stone = {
        x: command.point.x,
        y: command.point.y,
        mark: state.playerMark,
        actor: "player",
        ply: newPly,
      };

      const updatedBoard = board.place(newStone);
      const winningLine = checkWinAt(updatedBoard, command.point, state.playerMark);

      if (winningLine) {
        return {
          ...state,
          stones: [...state.stones, newStone],
          lastMove: newStone,
          winningLine,
          phase: "player_won",
        };
      }

      return {
        ...state,
        stones: [...state.stones, newStone],
        lastMove: newStone,
        phase: "ai_turn",
      };
    }

    case "AI_PLACE": {
      if (state.phase !== "ai_turn") return state;
      const board = new SparseGomokuBoard(state.stones);
      if (board.has(command.point)) return state;

      const newPly = state.stones.length + 1;
      const newStone: Stone = {
        x: command.point.x,
        y: command.point.y,
        mark: state.aiMark,
        actor: "ai",
        ply: newPly,
      };

      const updatedBoard = board.place(newStone);
      const winningLine = checkWinAt(updatedBoard, command.point, state.aiMark);

      if (winningLine) {
        return {
          ...state,
          stones: [...state.stones, newStone],
          lastMove: newStone,
          winningLine,
          phase: "ai_won",
        };
      }

      return {
        ...state,
        stones: [...state.stones, newStone],
        lastMove: newStone,
        phase: "player_turn",
      };
    }

    case "PAUSE": {
      if (state.phase === "player_turn" || state.phase === "ai_turn") {
        return { ...state, phase: "paused" };
      }
      return state;
    }

    case "RESUME": {
      if (state.phase === "paused") {
        // Resume back to whose turn it was
        const isPlayerNext =
          (state.stones.length % 2 === 0 && state.startingActor === "player") ||
          (state.stones.length % 2 === 1 && state.startingActor === "ai");
        return { ...state, phase: isPlayerNext ? "player_turn" : "ai_turn" };
      }
      return state;
    }

    case "RESIGN": {
      if (state.phase === "player_turn" || state.phase === "ai_turn" || state.phase === "paused") {
        return { ...state, phase: "resigned" };
      }
      return state;
    }

    case "INTERRUPT": {
      return { ...state, phase: "interrupted" };
    }

    default:
      return state;
  }
}

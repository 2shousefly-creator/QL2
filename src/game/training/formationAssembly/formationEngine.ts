import { TrainingDifficulty } from "../../types";
import { FORMATION_CONFIGS } from "./formationConfig";
import { createFormationScenario } from "./formationGenerator";
import { transformRoundTargets } from "./formationTransforms";
import {
  FormationBoardPieceState,
  FormationBoardState,
  FormationCell,
  FormationEvaluation,
  FormationOrientation,
  FormationPieceDefinition,
  FormationResult,
  FormationRound,
  FormationRun,
} from "./formationTypes";
import { validateFormationScenario } from "./formationValidator";

export function createInitialFormationBoard(
  round: FormationRound,
  difficulty: TrainingDifficulty,
  seed: string
): FormationBoardState {
  const config = FORMATION_CONFIGS[difficulty];
  const placements: Record<string, FormationBoardPieceState> = {};

  if (config.shuffleMode === "tray") {
    // All pieces start in tray
    round.pieces.forEach((p) => {
      placements[p.id] = {
        pieceId: p.id,
        cell: null,
        orientation: p.targetOrientation,
      };
    });
  } else if (config.shuffleMode === "mixed") {
    // Some pieces in tray, some placed randomly on board
    const rows = round.rows;
    const cols = round.columns;

    const lockedSet = new Set(round.lockedCells.map((c) => `${c.row},${c.column}`));
    const availableBoardCells: FormationCell[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r},${c}`;
        if (!lockedSet.has(key)) {
          availableBoardCells.push({ row: r, column: c });
        }
      }
    }

    // Put about 30% of target pieces on grid initially (some wrong)
    const targetPieces = round.pieces.filter((p) => !p.isDecoy);
    const placeCount = Math.floor(targetPieces.length * 0.3);

    const placedIds = new Set<string>();
    for (let i = 0; i < placeCount && i < availableBoardCells.length; i++) {
      const p = targetPieces[i];
      placedIds.add(p.id);
      placements[p.id] = {
        pieceId: p.id,
        cell: availableBoardCells[i],
        orientation: p.targetOrientation,
      };
    }

    round.pieces.forEach((p) => {
      if (!placedIds.has(p.id)) {
        placements[p.id] = {
          pieceId: p.id,
          cell: null,
          orientation: p.targetOrientation,
        };
      }
    });
  } else {
    // Board scramble (Hard)
    const rows = round.rows;
    const cols = round.columns;

    const { transformedLockedCells } = transformRoundTargets(round);
    const lockedSet = new Set(transformedLockedCells.map((c) => `${c.row},${c.column}`));
    const availableBoardCells: FormationCell[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r},${c}`;
        if (!lockedSet.has(key)) {
          availableBoardCells.push({ row: r, column: c });
        }
      }
    }

    // Scramble pieces on board and tray
    round.pieces.forEach((p, idx) => {
      if (idx < availableBoardCells.length && idx % 2 === 0) {
        placements[p.id] = {
          pieceId: p.id,
          cell: availableBoardCells[idx],
          orientation: p.targetOrientation,
        };
      } else {
        placements[p.id] = {
          pieceId: p.id,
          cell: null,
          orientation: p.targetOrientation,
        };
      }
    });
  }

  return { placements };
}

export function createFormationRun(
  difficulty: TrainingDifficulty,
  runId: string = `run_fa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  nowPerfMs: number = performance.now()
): FormationRun {
  const config = FORMATION_CONFIGS[difficulty];
  let scenario = createFormationScenario(difficulty);

  let validation = validateFormationScenario(scenario);
  let retryCount = 0;
  while (!validation.valid && retryCount < 5) {
    retryCount++;
    scenario = createFormationScenario(
      difficulty,
      `fa_fallback_${difficulty}_${Date.now()}_${retryCount}`
    );
    validation = validateFormationScenario(scenario);
  }

  const initialRound = scenario.rounds[0];
  const initialBoard = createInitialFormationBoard(initialRound, difficulty, scenario.seed);

  return {
    id: runId,
    seed: scenario.seed,
    difficulty,
    status: "countdown",
    scenario,
    currentRoundIndex: 0,
    boardState: initialBoard,
    selectedPieceId: null,
    phaseStartedAtPerformanceMs: nowPerfMs,
    deadlineAtPerformanceMs: null,
    recoveriesRemaining: config.recoveryCharges,
    checksPerformed: 0,
    swapsPerformed: 0,
    rotationsPerformed: 0,
    dragActions: 0,
    tapPlaceActions: 0,
    completedRounds: 0,
    startedAtPerformanceMs: nowPerfMs,
    completedAtPerformanceMs: null,
    resetReason: null,
    recoveryNotice: null,
  };
}

export function selectFormationPiece(run: FormationRun, pieceId: string | null): void {
  if (run.status !== "assembling") return;
  if (pieceId && !run.boardState.placements[pieceId]) return;
  run.selectedPieceId = run.selectedPieceId === pieceId ? null : pieceId;
}

export function placeFormationPiece(
  run: FormationRun,
  pieceId: string,
  targetCell: FormationCell | null,
  isDrag: boolean = false
): void {
  if (run.status !== "assembling") return;

  const pieceState = run.boardState.placements[pieceId];
  if (!pieceState) return;

  const currentRound = run.scenario.rounds[run.currentRoundIndex];
  const { transformedLockedCells } = transformRoundTargets(currentRound);

  if (targetCell) {
    // Check if targetCell is a locked cell
    const isLocked = transformedLockedCells.some(
      (lc) => lc.row === targetCell.row && lc.column === targetCell.column
    );
    if (isLocked) return;

    // Check if targetCell already has a piece
    const existingPieceId = Object.keys(run.boardState.placements).find((id) => {
      const p = run.boardState.placements[id];
      return p.cell && p.cell.row === targetCell.row && p.cell.column === targetCell.column;
    });

    if (existingPieceId && existingPieceId !== pieceId) {
      // Swap pieces
      const existingPiece = run.boardState.placements[existingPieceId];
      const sourceCell = pieceState.cell;

      existingPiece.cell = sourceCell; // Move existing piece to where pieceId came from (or tray if sourceCell was null)
      pieceState.cell = targetCell;

      run.swapsPerformed++;
    } else {
      // Place into empty cell
      pieceState.cell = targetCell;
    }
  } else {
    // Return to reserve tray
    pieceState.cell = null;
  }

  if (isDrag) {
    run.dragActions++;
  } else {
    run.tapPlaceActions++;
  }

  run.selectedPieceId = null;
}

export function rotateFormationPiece(run: FormationRun, pieceId: string): void {
  if (run.status !== "assembling") return;

  const pieceState = run.boardState.placements[pieceId];
  if (!pieceState) return;

  pieceState.orientation = ((pieceState.orientation + 90) % 360) as FormationOrientation;
  run.rotationsPerformed++;
}

export function evaluateFormation(
  boardState: FormationBoardState,
  round: FormationRound
): FormationEvaluation {
  const { transformedPlacements, transformedLockedCells } = transformRoundTargets(round);

  const pieceDefMap: Record<string, FormationPieceDefinition> = {};
  round.pieces.forEach((p) => {
    pieceDefMap[p.id] = p;
  });

  const targetByCell = new Map<string, { shapeId: string; orientation: number; orientable: boolean; pieceId: string }>();
  transformedPlacements.forEach((tp) => {
    const key = `${tp.cell.row},${tp.cell.column}`;
    const def = pieceDefMap[tp.pieceId];
    targetByCell.set(key, {
      shapeId: def.shapeId,
      orientation: tp.orientation,
      orientable: def.orientable,
      pieceId: tp.pieceId,
    });
  });

  const lockedSet = new Set(transformedLockedCells.map((c) => `${c.row},${c.column}`));

  let correctPlacements = 0;
  let wrongPositionCount = 0;
  let wrongOrientationCount = 0;
  let decoyOnBoardCount = 0;
  let extraPieceCount = 0;
  let missingTargetCount = 0;

  // Track placed cells on board
  const placedByCell = new Map<string, FormationBoardPieceState & { def: FormationPieceDefinition }>();

  Object.values(boardState.placements).forEach((pl) => {
    if (pl.cell) {
      const key = `${pl.cell.row},${pl.cell.column}`;
      const def = pieceDefMap[pl.pieceId];
      if (def) {
        placedByCell.set(key, { ...pl, def });
      }
    }
  });

  // Evaluate cells with target placements
  targetByCell.forEach((target, key) => {
    const placed = placedByCell.get(key);
    if (!placed) {
      missingTargetCount++;
    } else {
      if (placed.def.shapeId === target.shapeId) {
        if (!target.orientable || placed.orientation === target.orientation) {
          correctPlacements++;
        } else {
          wrongOrientationCount++;
        }
      } else {
        wrongPositionCount++;
      }
    }
  });

  // Evaluate cells without target placements
  placedByCell.forEach((placed, key) => {
    if (!targetByCell.has(key)) {
      if (lockedSet.has(key) || placed.def.isDecoy) {
        decoyOnBoardCount++;
      } else {
        extraPieceCount++;
      }
    }
  });

  const correct =
    wrongPositionCount === 0 &&
    wrongOrientationCount === 0 &&
    decoyOnBoardCount === 0 &&
    extraPieceCount === 0 &&
    missingTargetCount === 0 &&
    correctPlacements === targetByCell.size;

  return {
    correct,
    correctPlacements,
    wrongPositionCount,
    wrongOrientationCount,
    decoyOnBoardCount,
    missingTargetCount,
    extraPieceCount,
  };
}

export function applyFormationRecoveryOrFail(
  run: FormationRun,
  evalRes: FormationEvaluation,
  nowPerfMs: number = performance.now()
): { isFailed: boolean; isRecovering: boolean } {
  run.checksPerformed++;

  if (run.recoveriesRemaining > 0) {
    run.recoveriesRemaining--;
    run.status = "recovering";

    const currentRound = run.scenario.rounds[run.currentRoundIndex];
    run.boardState = createInitialFormationBoard(currentRound, run.difficulty, run.seed);
    run.selectedPieceId = null;

    if (run.difficulty === "easy") {
      const totalErrors =
        evalRes.wrongPositionCount +
        evalRes.wrongOrientationCount +
        evalRes.decoyOnBoardCount +
        evalRes.missingTargetCount +
        evalRes.extraPieceCount;
      run.recoveryNotice = `Chưa chính xác (${totalErrors} vị trí sai) — Phát lại hình mẫu!`;
    } else {
      run.recoveryNotice = `Đội hình chưa đúng (Vị trí: ${evalRes.wrongPositionCount}, Hướng: ${evalRes.wrongOrientationCount}, Quân thừa: ${evalRes.decoyOnBoardCount}) — Phát lại hình mẫu!`;
    }

    return { isFailed: false, isRecovering: true };
  } else {
    run.status = "failed";
    run.completedAtPerformanceMs = nowPerfMs;
    return { isFailed: true, isRecovering: false };
  }
}

export function calculateFormationResult(
  run: FormationRun,
  nowEpochMs: number = Date.now()
): FormationResult {
  const totalRounds = run.scenario.rounds.length;
  const completedRounds = run.completedRounds;
  const victory = run.status === "won" && completedRounds === totalRounds;

  const totalActions = run.dragActions + run.tapPlaceActions + run.rotationsPerformed;

  const totalTargetsInScenario = run.scenario.rounds.reduce(
    (acc, r) => acc + r.targetPlacements.length,
    0
  );

  const completionRatio = completedRounds / Math.max(1, totalRounds);
  const accuracy = victory ? 1.0 : Math.max(0, completionRatio - run.checksPerformed * 0.1);
  const efficiency = Math.min(
    1.0,
    totalTargetsInScenario / Math.max(totalTargetsInScenario, totalActions)
  );

  const score = Math.min(
    1000,
    Math.max(
      0,
      Math.round(1000 * (0.6 * completionRatio + 0.25 * accuracy + 0.15 * efficiency))
    )
  );

  const perfectWin = victory && run.checksPerformed === 0 && run.recoveriesRemaining === FORMATION_CONFIGS[run.difficulty].recoveryCharges;

  const elapsedRealMs = run.completedAtPerformanceMs
    ? Math.max(0, Math.round(run.completedAtPerformanceMs - run.startedAtPerformanceMs))
    : 0;

  return {
    runId: run.id,
    gameId: "formation_assembly",
    difficulty: run.difficulty,
    victory,
    completedRounds,
    totalRounds,
    score,
    perfectWin,
    wrongPositionCount: 0,
    wrongOrientationCount: 0,
    decoyPlacementCount: 0,
    swapsPerformed: run.swapsPerformed,
    rotationsPerformed: run.rotationsPerformed,
    actionsPerformed: totalActions,
    checksPerformed: run.checksPerformed,
    recoveriesUsed: FORMATION_CONFIGS[run.difficulty].recoveryCharges - run.recoveriesRemaining,
    timeoutCount: 0,
    elapsedRealMs,
    completedAtEpochMs: nowEpochMs,
  };
}

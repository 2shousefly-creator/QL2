import { TrainingDifficulty } from "../../types";
import { FORMATION_CONFIGS, FORMATION_SHAPES } from "./formationConfig";
import {
  FormationCell,
  FormationOrientation,
  FormationPieceDefinition,
  FormationPlacement,
  FormationRound,
  FormationScenario,
  FormationShapeId,
  FormationTransformProtocol,
} from "./formationTypes";

function hashStringSeed(seedStr: string): number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash >>> 0;
}

function createRng(seedStr: string) {
  let state = hashStringSeed(seedStr) || 123456789;
  return function nextFloat(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createFormationScenario(
  difficulty: TrainingDifficulty,
  seed: string = `fa_${difficulty}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
): FormationScenario {
  const config = FORMATION_CONFIGS[difficulty];
  const rng = createRng(seed);

  const availableShapes = Object.keys(FORMATION_SHAPES) as FormationShapeId[];
  const activeShapesPool = availableShapes.slice(0, config.shapePoolSize);

  const rounds: FormationRound[] = [];

  for (let roundIndex = 0; roundIndex < config.roundCount; roundIndex++) {
    const rows = config.gridRows;
    const cols = config.gridColumns;
    const totalCellsCount = rows * cols;

    const pieceCount = config.pieceCounts[roundIndex] || 3;
    const lockedCount = config.lockedCellCounts[roundIndex] || 0;
    const decoyCount = config.decoyPieceCounts[roundIndex] || 0;

    const previewMs = config.previewMsByRound[roundIndex] || 4000;
    const assembleMs = config.assembleMsByRound[roundIndex] || 30000;

    const protocol: FormationTransformProtocol = config.transformProtocols
      ? config.transformProtocols[roundIndex] || "identity"
      : "identity";

    // 1. Pick locked cells
    const allCells: FormationCell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        allCells.push({ row: r, column: c });
      }
    }

    // Shuffle allCells
    const shuffledCells = [...allCells];
    for (let i = shuffledCells.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledCells[i], shuffledCells[j]] = [shuffledCells[j], shuffledCells[i]];
    }

    const lockedCells = shuffledCells.slice(0, Math.min(lockedCount, totalCellsCount - pieceCount - 1));
    const availableCells = shuffledCells.slice(lockedCells.length);

    // 2. Pick target cells
    const targetCells = availableCells.slice(0, Math.min(pieceCount, availableCells.length));

    // 3. Create target pieces & placements
    const pieces: FormationPieceDefinition[] = [];
    const targetPlacements: FormationPlacement[] = [];

    const orientedRatio = config.orientedPieceRatioByRound
      ? config.orientedPieceRatioByRound[roundIndex] || 0
      : 0;

    targetCells.forEach((cell, pIdx) => {
      const shapeId = activeShapesPool[Math.floor(rng() * activeShapesPool.length)];
      const shapeDef = FORMATION_SHAPES[shapeId];

      const isOrientable =
        config.orientationEnabled &&
        shapeDef.orientable &&
        rng() < orientedRatio;

      const orientations: FormationOrientation[] = [0, 90, 180, 270];
      const targetOrientation = isOrientable
        ? orientations[Math.floor(rng() * orientations.length)]
        : 0;

      const pieceId = `p_r${roundIndex + 1}_${pIdx + 1}_${shapeId}`;

      pieces.push({
        id: pieceId,
        shapeId,
        orientable: isOrientable,
        targetOrientation,
        isDecoy: false,
      });

      targetPlacements.push({
        pieceId,
        cell,
        orientation: targetOrientation,
      });
    });

    // 4. Create decoy pieces
    for (let d = 0; d < decoyCount; d++) {
      const shapeId = activeShapesPool[Math.floor(rng() * activeShapesPool.length)];
      const shapeDef = FORMATION_SHAPES[shapeId];

      const isOrientable =
        config.orientationEnabled &&
        shapeDef.orientable &&
        rng() < orientedRatio;

      const orientations: FormationOrientation[] = [0, 90, 180, 270];
      const targetOrientation = isOrientable
        ? orientations[Math.floor(rng() * orientations.length)]
        : 0;

      const pieceId = `p_r${roundIndex + 1}_decoy_${d + 1}_${shapeId}`;

      pieces.push({
        id: pieceId,
        shapeId,
        orientable: isOrientable,
        targetOrientation,
        isDecoy: true,
      });
    }

    // Shuffle pieces order so decoys and targets are mixed in tray
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }

    rounds.push({
      index: roundIndex,
      rows,
      columns: cols,
      protocol,
      lockedCells,
      pieces,
      targetPlacements,
      previewMs,
      assembleMs,
    });
  }

  return {
    id: `scenario_${seed}`,
    seed,
    difficulty,
    rounds,
  };
}

import { FORMATION_CONFIGS } from "./formationConfig";
import { transformRoundTargets } from "./formationTransforms";
import {
  FormationScenario,
} from "./formationTypes";

export type ScenarioValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

export function validateFormationScenario(
  scenario: FormationScenario
): ScenarioValidationResult {
  const config = FORMATION_CONFIGS[scenario.difficulty];

  if (!scenario || !Array.isArray(scenario.rounds)) {
    return { valid: false, reason: "Scenario parameters invalid" };
  }

  if (scenario.rounds.length !== config.roundCount) {
    return {
      valid: false,
      reason: `Round count mismatch: expected ${config.roundCount}, got ${scenario.rounds.length}`,
    };
  }

  for (let i = 0; i < scenario.rounds.length; i++) {
    const round = scenario.rounds[i];

    if (round.rows !== config.gridRows || round.columns !== config.gridColumns) {
      return {
        valid: false,
        reason: `Grid dimensions mismatch in round ${i + 1}`,
      };
    }

    // Validate target placements within grid bounds
    for (const p of round.targetPlacements) {
      if (
        p.cell.row < 0 ||
        p.cell.row >= round.rows ||
        p.cell.column < 0 ||
        p.cell.column >= round.columns
      ) {
        return {
          valid: false,
          reason: `Target placement out of bounds in round ${i + 1}`,
        };
      }
    }

    // Validate no overlap in target placements
    const seenCells = new Set<string>();
    for (const p of round.targetPlacements) {
      const key = `${p.cell.row},${p.cell.column}`;
      if (seenCells.has(key)) {
        return {
          valid: false,
          reason: `Duplicate target cell placement in round ${i + 1}`,
        };
      }
      seenCells.add(key);
    }

    // Validate no placement on locked cell
    const lockedSet = new Set(round.lockedCells.map((c) => `${c.row},${c.column}`));
    for (const p of round.targetPlacements) {
      const key = `${p.cell.row},${p.cell.column}`;
      if (lockedSet.has(key)) {
        return {
          valid: false,
          reason: `Target placement overlaps with locked cell in round ${i + 1}`,
        };
      }
    }

    // Validate transformed placements remain in bounds and do not overlap transformed locked cells
    const { transformedPlacements, transformedLockedCells } = transformRoundTargets(round);

    for (const tp of transformedPlacements) {
      if (
        tp.cell.row < 0 ||
        tp.cell.row >= round.rows ||
        tp.cell.column < 0 ||
        tp.cell.column >= round.columns
      ) {
        return {
          valid: false,
          reason: `Transformed target placement out of bounds in round ${i + 1}`,
        };
      }
    }

    const transformedLockedSet = new Set(
      transformedLockedCells.map((c) => `${c.row},${c.column}`)
    );
    for (const tp of transformedPlacements) {
      const key = `${tp.cell.row},${tp.cell.column}`;
      if (transformedLockedSet.has(key)) {
        return {
          valid: false,
          reason: `Transformed placement overlaps transformed locked cell in round ${i + 1}`,
        };
      }
    }
  }

  return { valid: true };
}

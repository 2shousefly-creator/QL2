import {
  getBattlePresentationDurationMs,
  type BattlePresentationSpeed,
} from "./config";
import type { TroopType } from "./types";

export const ULTIMATE_PREP_DURATION_MS = 1_000;
export const ULTIMATE_MIN_EXECUTION_DURATION_MS = 180;
export const ULTIMATE_TERMINAL_IMPACT_HOLD_BASE_MS = 240;
export const ULTIMATE_TERMINAL_IMPACT_HOLD_MIN_MS = 60;
/** Compatibility export retained for the existing Phase 3 regression suite. */
export const PHASE3_FIXED_VFX_DURATION_MS = ULTIMATE_PREP_DURATION_MS;

export type UltimatePresentationKind =
  | "single_target_flight"
  | "single_target_chain"
  | "stationary_aoe"
  | "stationary_support";

export interface UltimatePresentationDefinition {
  kind: UltimatePresentationKind;
  /** Unscaled execution including any required return-to-origin time. */
  baseExecutionMs: number;
  /** Normalized impact positions for stationary multi-wave presentations. */
  impactPoints: readonly number[];
}

export interface UltimateExecutionClock {
  speedSnapshot: BattlePresentationSpeed;
  executionMs: number;
  groupStartAtMs: readonly number[];
  impactAtMs: readonly number[];
  groupEndAtMs: readonly number[];
  totalMs: number;
}

export interface UltimateExecutionClockOptions {
  /** A terminal hit may end at impact instead of playing a redundant return flight. */
  finalReturnToOrigin?: boolean;
}

/** CSS and JavaScript both use this exact point for physical contact. */
export const ULTIMATE_FLIGHT_CONTACT_POINT = 0.45;

export const ULTIMATE_PRESENTATION: Readonly<Record<TroopType, UltimatePresentationDefinition>> = {
  infantry: { kind: "stationary_support", baseExecutionMs: 720, impactPoints: [0.48] },
  artillery: { kind: "stationary_aoe", baseExecutionMs: 2_250, impactPoints: [0.25, 0.50, 0.75] },
  armor: { kind: "stationary_support", baseExecutionMs: 720, impactPoints: [0.48] },
  commando: { kind: "single_target_chain", baseExecutionMs: 1_200, impactPoints: [0.225, 0.725] },
  medic: { kind: "stationary_support", baseExecutionMs: 760, impactPoints: [0.50] },
  anti_tank: { kind: "single_target_flight", baseExecutionMs: 900, impactPoints: [ULTIMATE_FLIGHT_CONTACT_POINT] },
  engineer: { kind: "stationary_support", baseExecutionMs: 720, impactPoints: [0.48] },
  chemical: { kind: "stationary_aoe", baseExecutionMs: 900, impactPoints: [0.52] },
  air_force: { kind: "single_target_flight", baseExecutionMs: 960, impactPoints: [ULTIMATE_FLIGHT_CONTACT_POINT] },
  guard: { kind: "stationary_support", baseExecutionMs: 760, impactPoints: [0.50] },
  pioneer: { kind: "single_target_flight", baseExecutionMs: 880, impactPoints: [ULTIMATE_FLIGHT_CONTACT_POINT] },
  scout: { kind: "stationary_support", baseExecutionMs: 860, impactPoints: [0.58] },
  marksman: { kind: "single_target_flight", baseExecutionMs: 900, impactPoints: [ULTIMATE_FLIGHT_CONTACT_POINT] },
  electronic_warfare: { kind: "stationary_aoe", baseExecutionMs: 920, impactPoints: [0.52] },
  special_ops: { kind: "stationary_aoe", baseExecutionMs: 940, impactPoints: [0.54] },
  divine_medic: { kind: "stationary_support", baseExecutionMs: 820, impactPoints: [0.52] },
  forensic_medic: { kind: "stationary_aoe", baseExecutionMs: 940, impactPoints: [0.54] },
  martial_artist: { kind: "single_target_flight", baseExecutionMs: 920, impactPoints: [ULTIMATE_FLIGHT_CONTACT_POINT] },
};

export function getUltimatePresentation(troopType: TroopType): UltimatePresentationDefinition {
  return ULTIMATE_PRESENTATION[troopType];
}

/**
 * Produce one shared clock for card movement, VFX, HP display, sound and haptic.
 * Chain flights are divided into return-to-origin segments without another prep.
 */
export function getUltimateExecutionClock(
  troopType: TroopType,
  speedSnapshot: BattlePresentationSpeed,
  requestedImpactCount = 1,
  options: Readonly<UltimateExecutionClockOptions> = {}
): UltimateExecutionClock {
  const definition = getUltimatePresentation(troopType);
  const executionMs = getBattlePresentationDurationMs(
    definition.baseExecutionMs,
    speedSnapshot,
    ULTIMATE_MIN_EXECUTION_DURATION_MS
  );
  const impactCount = Math.max(1, Math.floor(Number.isFinite(requestedImpactCount) ? requestedImpactCount : 1));

  if (definition.kind === "single_target_flight" || definition.kind === "single_target_chain") {
    const groupCount = definition.kind === "single_target_chain" ? impactCount : 1;
    const segmentMs = executionMs / groupCount;
    const groupStartAtMs = Array.from({ length: groupCount }, (_, index) => Math.round(index * segmentMs));
    const groupEndAtMs = Array.from({ length: groupCount }, (_, index) => Math.round((index + 1) * segmentMs));
    const impactAtMs = groupStartAtMs.map((start, index) =>
      Math.round(start + (groupEndAtMs[index] - start) * ULTIMATE_FLIGHT_CONTACT_POINT)
    );
    const finalImpactAtMs = impactAtMs[impactAtMs.length - 1];
    const totalMs = options.finalReturnToOrigin === false
      ? Math.min(
          executionMs,
          finalImpactAtMs + getBattlePresentationDurationMs(
            ULTIMATE_TERMINAL_IMPACT_HOLD_BASE_MS,
            speedSnapshot,
            ULTIMATE_TERMINAL_IMPACT_HOLD_MIN_MS
          )
        )
      : executionMs;
    return { speedSnapshot, executionMs, groupStartAtMs, impactAtMs, groupEndAtMs, totalMs };
  }

  const configured = definition.impactPoints.length === impactCount
    ? definition.impactPoints
    : impactCount === 1
      ? [definition.impactPoints[0] ?? 0.5]
      : Array.from({ length: impactCount }, (_, index) => (index + 1) / (impactCount + 1));
  const impactAtMs = configured.map((point) => Math.round(executionMs * Math.max(0, Math.min(1, point))));
  return {
    speedSnapshot,
    executionMs,
    groupStartAtMs: impactAtMs.map(() => 0),
    impactAtMs,
    groupEndAtMs: impactAtMs.map(() => executionMs),
    totalMs: executionMs,
  };
}

/** All Ultimates share the same fixed, real-time prep cue at every speed. */
export function getPhase3UltimateVfxDurationMs(_troopType: TroopType): number {
  return ULTIMATE_PREP_DURATION_MS;
}

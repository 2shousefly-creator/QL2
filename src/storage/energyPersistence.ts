import { getLocalDateString } from "../game/energyEngine";
import type { EnergyState } from "../game/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Reads only the canonical persisted Energy shape. Valid values are preserved
 * byte-for-byte; out-of-range percentages are the only values that are clamped.
 */
export function readPersistedEnergyState(
  rawEnergy: unknown
): EnergyState | null {
  if (!isRecord(rawEnergy)) return null;
  if (typeof rawEnergy.percent !== "number" || !Number.isFinite(rawEnergy.percent)) return null;
  if (
    typeof rawEnergy.lastUpdatedAt !== "number" ||
    !Number.isFinite(rawEnergy.lastUpdatedAt) ||
    rawEnergy.lastUpdatedAt < 0
  ) {
    return null;
  }
  if (typeof rawEnergy.lastResetDate !== "string" || rawEnergy.lastResetDate.length === 0) {
    return null;
  }

  return {
    percent: Math.max(0, Math.min(100, rawEnergy.percent)),
    lastUpdatedAt: rawEnergy.lastUpdatedAt,
    lastResetDate: rawEnergy.lastResetDate,
  };
}

export function sanitizePersistedEnergyState(
  rawEnergy: unknown,
  now: number = Date.now()
): EnergyState {
  const canonical = readPersistedEnergyState(rawEnergy);
  if (canonical) return canonical;

  const raw = isRecord(rawEnergy) ? rawEnergy : {};
  const percent =
    typeof raw.percent === "number" && Number.isFinite(raw.percent)
      ? Math.max(0, Math.min(100, raw.percent))
      : 100;
  const lastUpdatedAt =
    typeof raw.lastUpdatedAt === "number" &&
    Number.isFinite(raw.lastUpdatedAt) &&
    raw.lastUpdatedAt >= 0
      ? raw.lastUpdatedAt
      : now;
  const lastResetDate =
    typeof raw.lastResetDate === "string" && raw.lastResetDate.length > 0
      ? raw.lastResetDate
      : getLocalDateString(now);

  return { percent, lastUpdatedAt, lastResetDate };
}

/** Selects the newest valid snapshot so an older React snapshot cannot overwrite storage. */
export function selectFreshestEnergyState(
  currentEnergy: unknown,
  persistedEnergy: unknown,
  now: number = Date.now()
): EnergyState {
  const current = readPersistedEnergyState(currentEnergy);
  const persisted = readPersistedEnergyState(persistedEnergy);

  if (current && persisted) {
    return current.lastUpdatedAt >= persisted.lastUpdatedAt ? current : persisted;
  }
  if (current) return current;
  if (persisted) return persisted;
  return sanitizePersistedEnergyState(currentEnergy ?? persistedEnergy, now);
}

export function assertEnergyStatePreserved(expected: EnergyState, actual: unknown): void {
  const received = isRecord(actual) ? actual : null;
  if (
    !received ||
    received.percent !== expected.percent ||
    received.lastUpdatedAt !== expected.lastUpdatedAt ||
    received.lastResetDate !== expected.lastResetDate
  ) {
    throw new Error("Energy state changed during app update migration");
  }
}

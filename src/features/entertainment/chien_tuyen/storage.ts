import { createDefaultChienTuyenProfile } from "./profileEngine";
import type { ChienTuyenProfileV2 } from "./types";

/** V1 was a separate card-battler profile. V2 lives only in top-level GameState. */
export const LEGACY_CHIEN_TUYEN_STORAGE_KEY = "quan_lo_chien_tuyen_v1";

export interface ChienTuyenLegacyStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

function getBrowserStorage(): ChienTuyenLegacyStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readLegacyChienTuyenProfile(
  storage: ChienTuyenLegacyStorage | null = getBrowserStorage()
): unknown | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(LEGACY_CHIEN_TUYEN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    // A malformed legacy save still counts as legacy data, but never crashes V2.
    return null;
  }
}

export function hasLegacyChienTuyenProfile(
  storage: ChienTuyenLegacyStorage | null = getBrowserStorage()
): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(LEGACY_CHIEN_TUYEN_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Old decks/Commanders cannot be converted to V2 units. If a legacy key is
 * present, return a fresh starter profile without touching any other state.
 */
export function createProfileFromLegacyStorage(
  now = Date.now(),
  storage: ChienTuyenLegacyStorage | null = getBrowserStorage()
): ChienTuyenProfileV2 | null {
  return hasLegacyChienTuyenProfile(storage) ? createDefaultChienTuyenProfile(now) : null;
}

export function clearLegacyChienTuyenProfile(
  storage: ChienTuyenLegacyStorage | null = getBrowserStorage()
): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(LEGACY_CHIEN_TUYEN_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

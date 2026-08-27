import { GameState } from "../game/types";
import { localGameRepository } from "../storage/LocalGameRepository";
import { sanitizeAndMigrateState } from "../storage/migrations";
import {
  assertEnergyStatePreserved,
  readPersistedEnergyState,
  sanitizePersistedEnergyState,
} from "../storage/energyPersistence";
import { APP_BUILD_ID } from "./buildInfo";
import { PendingAppUpdate, UpdateBackupEnvelope } from "./updateTypes";
import { commitInstalledBuildId } from "./versionService";

export const EMERGENCY_BACKUP_KEY = "quan_lo_app_update_backup_v1";
export const PENDING_UPDATE_KEY = "quan_lo_app_update_pending_v1";
export const MANUAL_BACKUP_KEY = "quan_lo_manual_update_backup";

/**
 * Creates a complete backup envelope of player progression before updating app shell.
 */
export async function createAndPersistUpdateBackup(
  currentState: GameState,
  latestBuildId: string
): Promise<UpdateBackupEnvelope> {
  console.log("[UPDATE] backup started");

  if (!currentState || typeof currentState !== "object") {
    throw new Error("Invalid current state provided for backup");
  }
  const backupEnergy = readPersistedEnergyState(currentState.energy);
  if (!backupEnergy) {
    throw new Error("Backup payload validation failed: Energy data incomplete");
  }

  // Ensure current state is flushed to repository first
  await localGameRepository.save(currentState);

  const backupId = `update_backup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const envelope: UpdateBackupEnvelope = {
    formatVersion: 1,
    backupId,
    createdAt: Date.now(),
    sourceBuildId: APP_BUILD_ID,
    targetBuildId: latestBuildId,
    sourceSaveSchemaVersion: currentState.schemaVersion || 8,
    payload: JSON.parse(JSON.stringify(currentState)),
  };

  // Validate backup object
  if (!envelope.payload.progression || envelope.payload.progression.currentRankIndex === undefined) {
    throw new Error("Backup payload validation failed: Progression data incomplete");
  }
  assertEnergyStatePreserved(backupEnergy, envelope.payload.energy);

  const json = JSON.stringify(envelope);

  // Persist to localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(EMERGENCY_BACKUP_KEY, json);
    // Also save raw payload to legacy manual backup key for maximum safety
    localStorage.setItem(MANUAL_BACKUP_KEY, JSON.stringify(currentState));

    // Save pending marker
    const pendingMarker: PendingAppUpdate = {
      backupId,
      sourceBuildId: APP_BUILD_ID,
      targetBuildId: latestBuildId,
      startedAt: Date.now(),
      restoreStatus: "pending",
    };
    localStorage.setItem(PENDING_UPDATE_KEY, JSON.stringify(pendingMarker));
  }

  console.log("[UPDATE] backup success");
  return envelope;
}

/**
 * Checks for a pending update backup on boot, restores & migrates it if present,
 * validates the restored state, commits installedBuildId, and clears the pending marker.
 */
export async function recoverPendingAppUpdate(): Promise<{
  restored: boolean;
  restoredState: GameState | null;
  error?: string;
}> {
  if (typeof window === "undefined" || !window.localStorage) {
    return { restored: false, restoredState: null };
  }

  const pendingRaw = localStorage.getItem(PENDING_UPDATE_KEY);
  if (!pendingRaw) {
    return { restored: false, restoredState: null };
  }

  try {
    const pending = JSON.parse(pendingRaw) as PendingAppUpdate;
    const backupRaw = localStorage.getItem(EMERGENCY_BACKUP_KEY) || localStorage.getItem(MANUAL_BACKUP_KEY);

    if (!backupRaw) {
      console.warn("[UPDATE] Pending update marker found but backup payload is missing");
      localStorage.removeItem(PENDING_UPDATE_KEY);
      return { restored: false, restoredState: null, error: "Missing backup payload" };
    }

    console.log("[UPDATE] restoring pending update backup for target build:", pending.targetBuildId);

    // Update pending status
    pending.restoreStatus = "restoring";
    localStorage.setItem(PENDING_UPDATE_KEY, JSON.stringify(pending));

    let rawPayload: unknown;
    try {
      const parsed = JSON.parse(backupRaw);
      if (parsed && typeof parsed === "object" && "payload" in parsed) {
        rawPayload = (parsed as UpdateBackupEnvelope).payload;
      } else {
        rawPayload = parsed;
      }
    } catch {
      rawPayload = null;
    }

    if (!rawPayload) {
      throw new Error("Backup payload parsing error");
    }

    // Migrate and sanitize while preserving canonical Energy values exactly.
    const migrationNow = Date.now();
    const rawEnergy = typeof rawPayload === "object" && rawPayload
      ? (rawPayload as { energy?: unknown }).energy
      : undefined;
    const energyBeforeMigration = sanitizePersistedEnergyState(rawEnergy, migrationNow);
    const restoredState = sanitizeAndMigrateState(rawPayload, migrationNow);
    assertEnergyStatePreserved(energyBeforeMigration, restoredState.energy);

    // Validate state invariants post-migration
    if (
      !restoredState ||
      typeof restoredState.progression?.currentRankIndex !== "number" ||
      restoredState.progression.currentRankIndex < 0 ||
      isNaN(restoredState.progression.xpIntoCurrentRankTicks)
    ) {
      throw new Error("Restored state validation failed invariants check");
    }

    // Save restored state as active game state
    await localGameRepository.save(restoredState);
    const persistedAfterRestore = await localGameRepository.load();
    if (!persistedAfterRestore) {
      throw new Error("Restored game state could not be read back from storage");
    }
    assertEnergyStatePreserved(energyBeforeMigration, persistedAfterRestore.energy);

    // Update pending marker to restored
    pending.restoreStatus = "restored";
    localStorage.setItem(PENDING_UPDATE_KEY, JSON.stringify(pending));

    // Commit target build as officially installed build
    commitInstalledBuildId(pending.targetBuildId);

    // Clear marker after success
    localStorage.removeItem(PENDING_UPDATE_KEY);

    console.log("[UPDATE] restore success");
    return { restored: true, restoredState };
  } catch (err) {
    console.error("[UPDATE] Failed to restore update backup:", err);
    return {
      restored: false,
      restoredState: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Clears pending update marker manually if needed.
 */
export function clearPendingUpdateMarker(): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.removeItem(PENDING_UPDATE_KEY);
  }
}

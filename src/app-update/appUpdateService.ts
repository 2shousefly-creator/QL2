import { GameState } from "../game/types";
import { localGameRepository } from "../storage/LocalGameRepository";
import { sanitizeAndMigrateState } from "../storage/migrations";
import {
  assertEnergyStatePreserved,
  selectFreshestEnergyState,
} from "../storage/energyPersistence";
import { createAndPersistUpdateBackup, clearPendingUpdateMarker } from "./updateBackupService";
import { AppUpdateState } from "./updateTypes";
import { commitInstalledBuildId } from "./versionService";

let isUpdateInProgress = false;

export type PerformUpdateOptions = {
  targetBuildId?: string;
  currentState?: GameState | null;
  onStateChange?: (state: AppUpdateState) => void;
};

/**
 * Single Canonical App Update Pipeline.
 * Shared by both Mandatory Update Modal and Manual Update in Settings/Profile.
 * Flow:
 * Flush save -> Create & Validate Backup Envelope -> Unregister SW / Post SKIP_WAITING
 * -> Migrate & Save State -> Commit installedBuildId -> Reload App Shell cleanly.
 */
export async function performAppUpdate(options: PerformUpdateOptions = {}): Promise<void> {
  if (isUpdateInProgress) {
    console.warn("[UPDATE] Update execution already in progress");
    return;
  }

  isUpdateInProgress = true;
  const targetBuildId = options.targetBuildId || `latest_${Date.now()}`;
  const onStateChange = options.onStateChange || (() => {});

  try {
    console.log("[UPDATE] update activation started for targetBuildId:", targetBuildId);

    // 1. Flush & Backup
    onStateChange({ status: "backing-up", latestBuildId: targetBuildId });

    const migrationNow = Date.now();
    const persistedState = await localGameRepository.load();
    const sourceState = options.currentState || persistedState;
    let stateToSave: GameState | null = sourceState
      ? JSON.parse(JSON.stringify(sourceState)) as GameState
      : null;

    if (stateToSave) {
      stateToSave.energy = selectFreshestEnergyState(
        options.currentState?.energy,
        persistedState?.energy,
        migrationNow
      );
      await localGameRepository.save(stateToSave);
      await createAndPersistUpdateBackup(stateToSave, targetBuildId);
    }

    // 2. Service Worker & Cache Clearing
    onStateChange({ status: "installing", latestBuildId: targetBuildId });

    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          } else if (reg.active) {
            reg.active.postMessage({ type: "SKIP_WAITING" });
          }
          await reg.update().catch(() => {});
        }
      } catch (err) {
        console.warn("[UPDATE] SW postMessage error:", err);
      }
    }

    if (typeof window !== "undefined" && "caches" in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch (err) {
        console.warn("[UPDATE] Cache delete error:", err);
      }
    }

    // 3. Migrate and validate state in place
    if (stateToSave) {
      const energyBeforeMigration = stateToSave.energy!;
      const migrated = sanitizeAndMigrateState(stateToSave, migrationNow);
      assertEnergyStatePreserved(energyBeforeMigration, migrated.energy);
      await localGameRepository.save(migrated);
      const persistedAfterMigration = await localGameRepository.load();
      if (!persistedAfterMigration) {
        throw new Error("Updated game state could not be read back from storage");
      }
      assertEnergyStatePreserved(energyBeforeMigration, persistedAfterMigration.energy);
    }

    // 4. Commit installedBuildId ONLY AFTER backup, migration, and save validation succeed!
    commitInstalledBuildId(targetBuildId);
    clearPendingUpdateMarker();

    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("quan_lo_just_updated", "true");
    }

    // 5. Reload app shell with cache buster
    onStateChange({ status: "reloading", latestBuildId: targetBuildId });

    setTimeout(() => {
      if (typeof window !== "undefined") {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("update_ts", Date.now().toString());
        window.location.href = newUrl.toString();
      }
    }, 400);
  } catch (err) {
    isUpdateInProgress = false;
    console.error("[UPDATE] App update pipeline failed:", err);
    onStateChange({
      status: "error",
      latestBuildId: targetBuildId,
      safeToRetry: true,
      message: "Không thể hoàn tất cập nhật. Tiến trình của bạn vẫn được giữ an toàn. Vui lòng kiểm tra kết nối mạng và thử lại.",
    });
  }
}

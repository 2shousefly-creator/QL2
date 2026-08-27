import { APP_BUILD_ID } from "./buildInfo";
import { AppVersionManifest, InstalledAppVersion, VersionCheckResult } from "./updateTypes";

export const INSTALLED_BUILD_KEY = "quan_lo_installed_build_v1";
export const LEGACY_INSTALLED_BUILD_KEY = "quan-lo-installed-build-v1";

let lastCheckTime = 0;
let cachedResult: VersionCheckResult | null = null;
const CHECK_COOLDOWN_MS = 15_000; // 15 seconds cooldown between automatic version rechecks

/**
 * Reads persistent installed build info from stable browser storage.
 */
export function getInstalledBuildVersion(): InstalledAppVersion | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(INSTALLED_BUILD_KEY) || localStorage.getItem(LEGACY_INSTALLED_BUILD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.buildId === "string") {
      return parsed as InstalledAppVersion;
    }
  } catch (err) {
    console.warn("[UPDATE] Failed to parse installed build version:", err);
  }
  return null;
}

/**
 * Commits the target build ID as the official installed and accepted build.
 * This MUST only be called AFTER backup, migration, and save validation succeed!
 */
export function commitInstalledBuildId(buildId: string): InstalledAppVersion {
  const version: InstalledAppVersion = {
    buildId,
    activatedAt: Date.now(),
  };
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(INSTALLED_BUILD_KEY, JSON.stringify(version));
    localStorage.setItem(LEGACY_INSTALLED_BUILD_KEY, JSON.stringify(version));
  }
  console.log(`[UPDATE] installedBuildId committed: ${buildId}`);
  return version;
}

/**
 * Checks whether the player currently has an existing game save in storage.
 */
export function checkHasPlayerSave(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const primary = localStorage.getItem("quan_lo_game_state_v1");
    const backup = localStorage.getItem("quan_lo_game_state_backup_v1");
    const manual = localStorage.getItem("quan_lo_manual_update_backup");
    const emergency = localStorage.getItem("quan_lo_app_update_backup_v1");
    return !!(primary || backup || manual || emergency);
  } catch {
    return false;
  }
}

/**
 * Fetches version manifest from server using NETWORK-ONLY strategy.
 * Bypasses browser cache with timestamp query parameter and strict no-store headers.
 */
export async function fetchLatestVersion(): Promise<AppVersionManifest> {
  const url = `/version.json?ts=${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch version manifest: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as AppVersionManifest;

  if (!data || typeof data !== "object" || !data.buildId) {
    throw new Error("Invalid version manifest format received");
  }

  return data;
}

/**
 * Checks if a newer version is published on the server compared to installedBuildId.
 */
export async function checkForAppUpdate(force: boolean = false): Promise<VersionCheckResult> {
  const now = Date.now();
  if (!force && cachedResult && now - lastCheckTime < CHECK_COOLDOWN_MS) {
    return cachedResult;
  }

  const installedInfo = getInstalledBuildVersion();
  const installedBuildId = installedInfo ? installedInfo.buildId : null;

  console.log("[UPDATE] runtime build:", APP_BUILD_ID);
  console.log("[UPDATE] installed build:", installedBuildId || "(null)");

  // Disable mandatory remote block during local Vite dev mode to prevent HMR loops
  const isDevMode =
    (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) ||
    (typeof process !== "undefined" && process.env?.NODE_ENV === "development");

  if (isDevMode) {
    const devResult: VersionCheckResult = {
      status: "up-to-date",
      installedBuildId: installedBuildId || APP_BUILD_ID,
      latestBuildId: APP_BUILD_ID,
      runtimeBuildId: APP_BUILD_ID,
    };
    cachedResult = devResult;
    lastCheckTime = now;
    return devResult;
  }

  try {
    const manifest = await fetchLatestVersion();
    const latestBuildId = manifest.buildId;
    console.log("[UPDATE] latest server build:", latestBuildId);
    lastCheckTime = now;

    const hasSave = checkHasPlayerSave();

    // First install: No installed marker AND no existing player save -> initialize installedBuildId directly
    if (!installedBuildId && !hasSave) {
      console.log("[UPDATE] First install detected. Committing installed build:", latestBuildId);
      commitInstalledBuildId(latestBuildId);
      const firstInstallResult: VersionCheckResult = {
        status: "up-to-date",
        installedBuildId: latestBuildId,
        latestBuildId,
        runtimeBuildId: APP_BUILD_ID,
      };
      cachedResult = firstInstallResult;
      return firstInstallResult;
    }

    // Effective installed build ID for comparison
    const effectiveInstalled = installedBuildId || "legacy_unmarked";

    if (effectiveInstalled === latestBuildId) {
      console.log("[UPDATE] App is up to date.");
      cachedResult = {
        status: "up-to-date",
        installedBuildId: effectiveInstalled,
        latestBuildId,
        runtimeBuildId: APP_BUILD_ID,
      };
      return cachedResult;
    } else {
      console.log(`[UPDATE] mandatory update required! installed (${effectiveInstalled}) != latest (${latestBuildId})`);
      cachedResult = {
        status: "update-required",
        installedBuildId: effectiveInstalled,
        latestBuildId,
        runtimeBuildId: APP_BUILD_ID,
        manifest,
      };
      return cachedResult;
    }
  } catch (err) {
    console.warn("[UPDATE] Version check network unavailable:", err);
    const fallbackResult: VersionCheckResult = {
      status: "unavailable",
      installedBuildId: installedBuildId || APP_BUILD_ID,
      runtimeBuildId: APP_BUILD_ID,
      reason: err,
    };
    return fallbackResult;
  }
}

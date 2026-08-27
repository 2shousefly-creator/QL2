import { GameState } from "../game/types";

export type InstalledAppVersion = {
  buildId: string;
  activatedAt: number;
};

export type AppVersionManifest = {
  schemaVersion: 1;
  buildId: string;
  publishedAt: string;
  cloudRevision?: string;
};

export type VersionCheckResult =
  | {
      status: "up-to-date";
      installedBuildId: string;
      runtimeBuildId: string;
      latestBuildId: string;
    }
  | {
      status: "update-required";
      installedBuildId: string;
      runtimeBuildId: string;
      latestBuildId: string;
      manifest: AppVersionManifest;
    }
  | {
      status: "unavailable";
      installedBuildId: string;
      runtimeBuildId: string;
      reason: unknown;
    };

export type AppUpdateState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "up-to-date" }
  | {
      status: "required";
      installedBuildId: string;
      latestBuildId: string;
    }
  | {
      status: "backing-up";
      latestBuildId: string;
    }
  | {
      status: "installing";
      latestBuildId: string;
    }
  | {
      status: "reloading";
      latestBuildId: string;
    }
  | {
      status: "error";
      latestBuildId: string;
      safeToRetry: true;
      message: string;
    };

export type UpdateBackupEnvelope = {
  formatVersion: 1;
  backupId: string;
  createdAt: number;
  sourceBuildId: string;
  targetBuildId: string;
  sourceSaveSchemaVersion: number;
  payload: GameState;
  checksum?: string;
};

export type PendingAppUpdate = {
  backupId: string;
  sourceBuildId: string;
  targetBuildId: string;
  startedAt: number;
  restoreStatus: "pending" | "restoring" | "restored";
};

export type StartupGate =
  | "checking-version"
  | "mandatory-update"
  | "restoring-update-backup"
  | "normal-startup";

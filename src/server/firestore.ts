import { Firestore } from "@google-cloud/firestore";
import { GCP_CONFIG } from "./config";
import { logPushEvent } from "./logger";

export type RankIdentity = {
  familyId?: string;
  tier?: number | null;
  currentRankName?: string;
  nextRankName?: string;
  rankIndex?: number;
};

export type ScheduleStatus =
  | "scheduled"
  | "sending"
  | "sent"
  | "canceled"
  | "invalid_subscription";

export type PushSchedule = {
  type: "xp_full";
  generation: string;
  dueAt: number; // Epoch MS
  rankIdentity?: RankIdentity;
  status: ScheduleStatus;
  taskName?: string | null;
  taskKind?: "checkpoint" | "final";
  createdAt: number;
  updatedAt: number;
  leaseAcquiredAt?: number | null;
  sentAt?: number | null;
  lastAttemptAt?: number | null;
  attemptCount?: number;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
};

export type PushDeviceDocument = {
  devicePushId: string;
  subscription: {
    endpoint: string;
    expirationTime?: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  enabled: boolean;
  vapidKeyFingerprint?: string;
  createdAt: number;
  updatedAt: number;
  schedule?: PushSchedule | null;
  diagnostics?: {
    lastRegisteredAt?: number;
    lastPushSuccessAt?: number;
    lastPushFailureAt?: number;
    lastPushStatusCode?: number | null;
    lastErrorMessage?: string | null;
  };
};

let firestoreClient: Firestore | null = null;
let firestoreUnavailableInDev = false;
const devMemoryStore = new Map<string, PushDeviceDocument>();

// Fallback is ONLY allowed with explicit opt-in: ALLOW_IN_MEMORY_PUSH_FALLBACK="true"
export function isDevFallbackAllowed(): boolean {
  return process.env.ALLOW_IN_MEMORY_PUSH_FALLBACK === "true";
}

function isPermissionOrAuthError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  const code = err.code;
  return (
    code === 7 || // PERMISSION_DENIED
    code === 16 || // UNAUTHENTICATED
    msg.includes("permission_denied") ||
    msg.includes("missing or insufficient permissions") ||
    msg.includes("could not load the default credentials") ||
    msg.includes("unauthenticated")
  );
}

export function getFirestore(): Firestore {
  if (firestoreClient) return firestoreClient;

  try {
    firestoreClient = new Firestore({
      projectId: GCP_CONFIG.projectId,
      databaseId: GCP_CONFIG.firestoreDatabase,
    });
    return firestoreClient;
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      console.warn(`[FIRESTORE] Dev preview fallback enabled: ${err.message}`);
      firestoreUnavailableInDev = true;
      return null as any;
    }
    // In production: Fail fast, no fallback
    console.error(`[FIRESTORE] FATAL: Failed to initialize Firestore client:`, err.message);
    throw err;
  }
}

const COLLECTION_NAME = "pushDevices";

export async function getDeviceRecord(devicePushId: string): Promise<PushDeviceDocument | null> {
  if (firestoreUnavailableInDev && isDevFallbackAllowed()) {
    return devMemoryStore.get(devicePushId) || null;
  }

  try {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(devicePushId);
    const snap = await docRef.get();
    if (!snap.exists) {
      if (isDevFallbackAllowed()) {
        return devMemoryStore.get(devicePushId) || null;
      }
      return null;
    }
    return snap.data() as PushDeviceDocument;
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      console.warn(`[FIRESTORE] Fallback to in-memory store in dev preview: ${err.message}`);
      firestoreUnavailableInDev = true;
      return devMemoryStore.get(devicePushId) || null;
    }
    console.error(`[FIRESTORE] Failed to get device ${devicePushId}:`, err.message);
    throw err;
  }
}

export async function saveDeviceRegistration(
  devicePushId: string,
  subscription: PushDeviceDocument["subscription"],
  vapidKeyFingerprint?: string
): Promise<PushDeviceDocument> {
  const now = Date.now();

  if (firestoreUnavailableInDev && isDevFallbackAllowed()) {
    const existing = devMemoryStore.get(devicePushId);
    const doc: PushDeviceDocument = existing
      ? {
          ...existing,
          subscription,
          enabled: true,
          vapidKeyFingerprint: vapidKeyFingerprint || existing.vapidKeyFingerprint,
          updatedAt: now,
          diagnostics: {
            ...existing.diagnostics,
            lastRegisteredAt: now,
          },
        }
      : {
          devicePushId,
          subscription,
          enabled: true,
          vapidKeyFingerprint,
          createdAt: now,
          updatedAt: now,
          schedule: null,
          diagnostics: {
            lastRegisteredAt: now,
          },
        };
    devMemoryStore.set(devicePushId, doc);
    return doc;
  }

  try {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(devicePushId);

    return await db.runTransaction(async (t) => {
      const snap = await t.get(docRef);

      let doc: PushDeviceDocument;
      if (snap.exists) {
        const existing = snap.data() as PushDeviceDocument;
        doc = {
          ...existing,
          subscription,
          enabled: true,
          vapidKeyFingerprint: vapidKeyFingerprint || existing.vapidKeyFingerprint,
          updatedAt: now,
          diagnostics: {
            ...existing.diagnostics,
            lastRegisteredAt: now,
          },
        };
      } else {
        doc = {
          devicePushId,
          subscription,
          enabled: true,
          vapidKeyFingerprint,
          createdAt: now,
          updatedAt: now,
          schedule: null,
          diagnostics: {
            lastRegisteredAt: now,
          },
        };
      }

      t.set(docRef, doc);
      if (isDevFallbackAllowed()) {
        devMemoryStore.set(devicePushId, doc);
      }
      return doc;
    });
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      console.warn(`[FIRESTORE] Fallback to in-memory registration in dev preview: ${err.message}`);
      firestoreUnavailableInDev = true;
      return saveDeviceRegistration(devicePushId, subscription, vapidKeyFingerprint);
    }
    console.error(`[FIRESTORE] Failed to save device registration:`, err.message);
    throw err;
  }
}

export async function updateDeviceSchedule(
  devicePushId: string,
  schedule: PushSchedule | null
): Promise<PushDeviceDocument | null> {
  const now = Date.now();

  if (firestoreUnavailableInDev && isDevFallbackAllowed()) {
    const existing = devMemoryStore.get(devicePushId);
    if (!existing) return null;
    existing.schedule = schedule;
    existing.enabled = true;
    existing.updatedAt = now;
    devMemoryStore.set(devicePushId, existing);
    return existing;
  }

  try {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(devicePushId);

    return await db.runTransaction(async (t) => {
      const snap = await t.get(docRef);
      if (!snap.exists) {
        if (isDevFallbackAllowed()) {
          const mem = devMemoryStore.get(devicePushId);
          if (!mem) return null;
          mem.schedule = schedule;
          mem.updatedAt = now;
          devMemoryStore.set(devicePushId, mem);
          return mem;
        }
        return null;
      }

      const existing = snap.data() as PushDeviceDocument;
      const updated: PushDeviceDocument = {
        ...existing,
        enabled: true,
        updatedAt: now,
        schedule,
      };

      t.set(docRef, updated);
      if (isDevFallbackAllowed()) {
        devMemoryStore.set(devicePushId, updated);
      }
      return updated;
    });
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      console.warn(`[FIRESTORE] Fallback to in-memory schedule update in dev preview: ${err.message}`);
      firestoreUnavailableInDev = true;
      return updateDeviceSchedule(devicePushId, schedule);
    }
    console.error(`[FIRESTORE] Failed to update device schedule:`, err.message);
    throw err;
  }
}

/**
 * Acquires a lease to send the notification for this device and generation.
 * If status is "sending" but lease is older than 60s (stale lease from crash/timeout),
 * the lease is safely stolen and allowed to retry.
 */
export async function acquirePushSendingLease(
  devicePushId: string,
  generation: string,
  leaseTimeoutMs: number = 60000
): Promise<{ acquired: boolean; device: PushDeviceDocument | null; reason?: string }> {
  const now = Date.now();

  if (firestoreUnavailableInDev && isDevFallbackAllowed()) {
    const mem = devMemoryStore.get(devicePushId);
    if (!mem || !mem.enabled || !mem.schedule) {
      return { acquired: false, device: null, reason: "NOT_FOUND_OR_DISABLED" };
    }
    if (mem.schedule.generation !== generation) {
      return { acquired: false, device: mem, reason: "STALE_GENERATION" };
    }
    if (mem.schedule.status === "sent") {
      return { acquired: false, device: mem, reason: "ALREADY_SENT" };
    }
    if (mem.schedule.status === "sending") {
      const leaseAge = now - (mem.schedule.leaseAcquiredAt || 0);
      if (leaseAge < leaseTimeoutMs) {
        return { acquired: false, device: mem, reason: "ACTIVE_LEASE_IN_PROGRESS" };
      }
    }

    mem.schedule.status = "sending";
    mem.schedule.leaseAcquiredAt = now;
    mem.schedule.updatedAt = now;
    devMemoryStore.set(devicePushId, mem);
    return { acquired: true, device: mem };
  }

  try {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(devicePushId);

    return await db.runTransaction(async (t) => {
      const snap = await t.get(docRef);
      if (!snap.exists) {
        return { acquired: false, device: null, reason: "NOT_FOUND" };
      }

      const existing = snap.data() as PushDeviceDocument;
      if (!existing.enabled || !existing.schedule) {
        return { acquired: false, device: existing, reason: "DISABLED_OR_NO_SCHEDULE" };
      }

      if (existing.schedule.generation !== generation) {
        return { acquired: false, device: existing, reason: "STALE_GENERATION" };
      }

      if (existing.schedule.status === "sent") {
        return { acquired: false, device: existing, reason: "ALREADY_SENT" };
      }

      if (existing.schedule.status === "invalid_subscription" || existing.schedule.status === "canceled") {
        return { acquired: false, device: existing, reason: `STATUS_${existing.schedule.status.toUpperCase()}` };
      }

      if (existing.schedule.status === "sending") {
        const leaseAge = now - (existing.schedule.leaseAcquiredAt || 0);
        if (leaseAge < leaseTimeoutMs) {
          return { acquired: false, device: existing, reason: "ACTIVE_LEASE_IN_PROGRESS" };
        }
        // Lease expired (> 60s) -> allow recovery retry
        console.warn(`[LEASE] Recovering expired sending lease (age: ${leaseAge}ms) for device ${devicePushId}`);
      }

      existing.schedule.status = "sending";
      existing.schedule.leaseAcquiredAt = now;
      existing.schedule.updatedAt = now;

      t.set(docRef, existing);
      if (isDevFallbackAllowed()) {
        devMemoryStore.set(devicePushId, existing);
      }

      return { acquired: true, device: existing };
    });
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      firestoreUnavailableInDev = true;
      return acquirePushSendingLease(devicePushId, generation, leaseTimeoutMs);
    }
    console.error(`[FIRESTORE] Error acquiring sending lease for ${devicePushId}:`, err.message);
    throw err;
  }
}

export async function markPushScheduleSent(
  devicePushId: string,
  generation: string
): Promise<boolean> {
  const now = Date.now();

  if (firestoreUnavailableInDev && isDevFallbackAllowed()) {
    const existing = devMemoryStore.get(devicePushId);
    if (!existing || !existing.schedule || existing.schedule.generation !== generation) {
      return false;
    }
    existing.schedule.status = "sent";
    existing.schedule.sentAt = now;
    existing.schedule.updatedAt = now;
    existing.updatedAt = now;
    existing.diagnostics = {
      ...existing.diagnostics,
      lastPushSuccessAt: now,
      lastPushStatusCode: 200,
    };
    devMemoryStore.set(devicePushId, existing);
    return true;
  }

  try {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(devicePushId);

    return await db.runTransaction(async (t) => {
      const snap = await t.get(docRef);
      if (!snap.exists) return false;

      const existing = snap.data() as PushDeviceDocument;
      if (!existing.schedule || existing.schedule.generation !== generation) {
        return false;
      }

      existing.schedule.status = "sent";
      existing.schedule.sentAt = now;
      existing.schedule.updatedAt = now;
      existing.updatedAt = now;
      existing.diagnostics = {
        ...existing.diagnostics,
        lastPushSuccessAt: now,
        lastPushStatusCode: 200,
      };

      t.set(docRef, existing);
      if (isDevFallbackAllowed()) {
        devMemoryStore.set(devicePushId, existing);
      }
      return true;
    });
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      firestoreUnavailableInDev = true;
      return markPushScheduleSent(devicePushId, generation);
    }
    console.error(`[FIRESTORE] Failed to mark schedule sent:`, err.message);
    throw err;
  }
}

export async function markPushSubscriptionInvalid(
  devicePushId: string,
  statusCode: number,
  errorMessage?: string
): Promise<void> {
  const now = Date.now();

  if (firestoreUnavailableInDev && isDevFallbackAllowed()) {
    const existing = devMemoryStore.get(devicePushId);
    if (existing) {
      existing.enabled = false;
      existing.updatedAt = now;
      if (existing.schedule) {
        existing.schedule.status = "invalid_subscription";
        existing.schedule.updatedAt = now;
        existing.schedule.lastErrorCode = String(statusCode);
        existing.schedule.lastErrorMessage = errorMessage || null;
      }
      existing.diagnostics = {
        ...existing.diagnostics,
        lastPushFailureAt: now,
        lastPushStatusCode: statusCode,
        lastErrorMessage: errorMessage || "Subscription 404/410 gone",
      };
      devMemoryStore.set(devicePushId, existing);
    }
    return;
  }

  try {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(devicePushId);
    await docRef.update({
      enabled: false,
      updatedAt: now,
      "schedule.status": "invalid_subscription",
      "schedule.updatedAt": now,
      "schedule.lastErrorCode": String(statusCode),
      "schedule.lastErrorMessage": errorMessage || null,
      "diagnostics.lastPushFailureAt": now,
      "diagnostics.lastPushStatusCode": statusCode,
      "diagnostics.lastErrorMessage": errorMessage || "Subscription 404/410 gone",
    });

    logPushEvent("PUSH_SUBSCRIPTION_GONE_404_410", {
      devicePushId,
      statusCode,
      message: errorMessage,
    });
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      firestoreUnavailableInDev = true;
      return markPushSubscriptionInvalid(devicePushId, statusCode, errorMessage);
    }
    console.warn(`[FIRESTORE] Failed to mark subscription invalid for ${devicePushId}:`, err.message);
  }
}

export async function recordPushAttemptFailure(
  devicePushId: string,
  statusCode: number,
  errorMessage: string
): Promise<void> {
  const now = Date.now();

  if (firestoreUnavailableInDev && isDevFallbackAllowed()) {
    const existing = devMemoryStore.get(devicePushId);
    if (existing) {
      const attemptCount = (existing.schedule?.attemptCount || 0) + 1;
      if (existing.schedule) {
        // Reset status back to scheduled so retry lease can be claimed
        existing.schedule.status = "scheduled";
        existing.schedule.lastAttemptAt = now;
        existing.schedule.attemptCount = attemptCount;
        existing.schedule.lastErrorCode = String(statusCode);
        existing.schedule.lastErrorMessage = errorMessage;
        existing.schedule.updatedAt = now;
      }
      existing.diagnostics = {
        ...existing.diagnostics,
        lastPushFailureAt: now,
        lastPushStatusCode: statusCode,
        lastErrorMessage: errorMessage,
      };
      devMemoryStore.set(devicePushId, existing);
    }
    return;
  }

  try {
    const db = getFirestore();
    const docRef = db.collection(COLLECTION_NAME).doc(devicePushId);

    await db.runTransaction(async (t) => {
      const snap = await t.get(docRef);
      if (!snap.exists) return;
      const data = snap.data() as PushDeviceDocument;

      const attemptCount = (data.schedule?.attemptCount || 0) + 1;
      const schedule = data.schedule
        ? {
            ...data.schedule,
            status: "scheduled" as ScheduleStatus, // Reset to scheduled for Cloud Tasks retry
            lastAttemptAt: now,
            attemptCount,
            lastErrorCode: String(statusCode),
            lastErrorMessage: errorMessage,
            updatedAt: now,
          }
        : null;

      t.update(docRef, {
        updatedAt: now,
        schedule,
        "diagnostics.lastPushFailureAt": now,
        "diagnostics.lastPushStatusCode": statusCode,
        "diagnostics.lastErrorMessage": errorMessage,
      });
    });
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      firestoreUnavailableInDev = true;
      return recordPushAttemptFailure(devicePushId, statusCode, errorMessage);
    }
    console.warn(`[FIRESTORE] Failed to record push failure for ${devicePushId}:`, err.message);
  }
}

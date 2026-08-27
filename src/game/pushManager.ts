import { GameState } from "./types";
import { getCurrentRank, isXpBarFull, getRequiredXpTicksForTransition } from "./xpEngine";
import { gameConfig } from "./config";
import { RANK_STEPS } from "./rankBuilder";

/**
 * DO NOT CHANGE PUSH_API_BASE_URL OR WEB PUSH INFRASTRUCTURE
 * WITHOUT AN EXPLICIT WEB PUSH MIGRATION.
 */
export const PUSH_API_BASE_URL =
  "https://quan-lo-push-api-953163983006.asia-southeast1.run.app";

function pushApiUrl(path: string): string {
  return `${PUSH_API_BASE_URL}${path}`;
}

const DEVICE_PUSH_ID_KEY = "quan-lo-device-push-id-v1";

/**
 * Returns a persistent device-specific push identifier.
 */
export function getDevicePushId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_PUSH_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_PUSH_ID_KEY, id);
  }
  return id;
}

/**
 * Converts a base64 string to Uint8Array for VAPID applicationServerKey.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks if browser supports required push APIs.
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Fetches server's VAPID public key.
 */
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch(pushApiUrl("/api/push/vapid-public-key"));
    if (!res.ok) return null;
    const data = await res.json();
    return data.publicKey || null;
  } catch (err) {
    console.warn("[PUSH] Failed to fetch VAPID public key:", err);
    return null;
  }
}

let isRegistering = false;

/**
 * Subscribes the current device to Web Push notifications and registers with backend.
 */
export async function subscribeAndRegisterWebPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  if (isRegistering) return false;
  isRegistering = true;

  try {
    const vapidPublicKey = await getVapidPublicKey();
    if (!vapidPublicKey) {
      console.warn("[PUSH] VAPID public key unavailable on server");
      return false;
    }

    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    const devicePushId = getDevicePushId();
    const registerRes = await fetch(pushApiUrl("/api/push/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        devicePushId,
        subscription: subscription.toJSON(),
      }),
    });

    if (registerRes.ok) {
      console.log("[PUSH] Registered web push subscription successfully with devicePushId:", devicePushId);
      return true;
    }

    console.warn("[PUSH] Register returned non-2xx status:", registerRes.status);
    return false;
  } catch (err) {
    console.warn("[PUSH] Subscribe/Register error:", err);
    return false;
  } finally {
    isRegistering = false;
  }
}

/**
 * Ensures push registration is active if user has granted notifications.
 */
export async function ensurePushRegistration(): Promise<boolean> {
  if (!isPushSupported()) return false;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
  return await subscribeAndRegisterWebPush();
}

/**
 * Calculates due timestamp (epoch ms) when XP bar will reach 100% via delegation.
 */
export function calculateXpFullNotificationDueAt(
  state: GameState,
  nowEpochMs: number = Date.now()
): number | null {
  if (isXpBarFull(state)) return null;
  const currentRankIndex = state.progression.currentRankIndex;
  if (currentRankIndex >= RANK_STEPS.length - 1) return null;

  const reqTicks = getRequiredXpTicksForTransition(currentRankIndex);
  const currentTicks = state.progression.xpIntoCurrentRankTicks;
  const remTicks = reqTicks - currentTicks;
  if (remTicks <= 0) return null;

  const msRemaining = Math.ceil(remTicks / gameConfig.delegationXpTicksPerMs);
  return nowEpochMs + msRemaining;
}

let lastSyncedDueAt: number | null = null;
let lastSyncedRankIndex: number | null = null;
let lastSyncTimestamp: number = 0;
let isSyncing = false;

/**
 * Synchronizes the server-side XP Full Push schedule with Firestore and Cloud Tasks.
 * Features debounce, throttle, and self-healing for unregistered devices.
 */
export async function syncXpFullPushSchedule(
  state: GameState,
  force: boolean = false,
  isRetry: boolean = false
): Promise<void> {
  if (typeof window === "undefined") return;

  const devicePushId = getDevicePushId();
  if (!devicePushId) return;

  const enabled = state.settings.notificationsEnabled;
  const hasPermission = typeof Notification !== "undefined" && Notification.permission === "granted";

  if (!enabled || !hasPermission) {
    // If disabled or ungranted, cancel server schedule
    if (lastSyncedDueAt !== null || force) {
      lastSyncedDueAt = null;
      lastSyncedRankIndex = null;
      try {
        fetch(pushApiUrl("/api/push/xp-full/cancel"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ devicePushId }),
          keepalive: true,
        }).catch(() => {});
      } catch (e) {}
    }
    return;
  }

  const currentRankIndex = state.progression.currentRankIndex;
  const currentRank = getCurrentRank(currentRankIndex);
  const nextRank = currentRankIndex < RANK_STEPS.length - 1 ? RANK_STEPS[currentRankIndex + 1] : null;

  const dueAtEpochMs = calculateXpFullNotificationDueAt(state);

  // If XP is full or no next rank or max rank reached
  if (!dueAtEpochMs || !nextRank) {
    if (lastSyncedDueAt !== null || force) {
      lastSyncedDueAt = null;
      lastSyncedRankIndex = null;
      try {
        fetch(pushApiUrl("/api/push/xp-full/cancel"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ devicePushId }),
          keepalive: true,
        }).catch(() => {});
      } catch (e) {}
    }
    return;
  }

  const now = Date.now();

  // Churn prevention: Only reschedule when forced, rank changed, or ETA changed significantly (>5 mins)
  if (
    !force &&
    lastSyncedRankIndex === currentRankIndex &&
    lastSyncedDueAt !== null &&
    (now - lastSyncTimestamp < 120_000 || Math.abs(dueAtEpochMs - lastSyncedDueAt) < 5 * 60_000)
  ) {
    return;
  }

  if (isSyncing) return;
  isSyncing = true;

  const scheduleGeneration = crypto.randomUUID();

  try {
    const res = await fetch(pushApiUrl("/api/push/xp-full/schedule"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        devicePushId,
        scheduleGeneration,
        dueAtEpochMs,
        rankIdentity: {
          familyId: currentRank.familyId,
          tier: currentRank.tier ?? null,
          currentRankName: currentRank.displayName,
          nextRankName: nextRank.displayName,
          rankIndex: currentRankIndex,
        },
        progressionVersion: 1,
        notificationType: "xp_full",
      }),
      keepalive: true,
    });

    if (res.ok) {
      lastSyncedDueAt = dueAtEpochMs;
      lastSyncedRankIndex = currentRankIndex;
      lastSyncTimestamp = now;
      console.log(`[PUSH] Scheduled XP full push at ${new Date(dueAtEpochMs).toLocaleTimeString()} (gen: ${scheduleGeneration.slice(0, 8)})`);
    } else if (res.status === 404 && !isRetry) {
      // Self-heal: Device was missing on backend, re-register once and retry schedule
      console.log("[PUSH] Backend reported DEVICE_NOT_REGISTERED, initiating self-heal registration...");
      const registered = await subscribeAndRegisterWebPush();
      if (registered) {
        isSyncing = false;
        await syncXpFullPushSchedule(state, true, true);
        return;
      }
    } else {
      console.warn("[PUSH] Schedule sync failed with status:", res.status);
    }
  } catch (err) {
    console.warn("[PUSH] Network error syncing schedule:", err);
  } finally {
    isSyncing = false;
  }
}

/**
 * Triggers a test push notification via backend to test Web Push end-to-end.
 */
export async function sendTestServerPush(): Promise<{ success: boolean; message: string }> {
  if (!isPushSupported()) {
    return {
      success: false,
      message: "Thiết bị hoặc trình duyệt này chưa hỗ trợ thông báo nền PushManager.",
    };
  }

  const devicePushId = getDevicePushId();
  try {
    const res = await fetch(pushApiUrl("/api/push/test"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ devicePushId }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: "Đã gửi thông báo thử qua máy chủ Web Push thành công!",
      };
    }
    return {
      success: false,
      message: data.message || "Không thể gửi thông báo thử nghiệm từ máy chủ Web Push.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi kết nối tới máy chủ gửi thông báo: ${err.message}`,
    };
  }
}

/**
 * Fetches server diagnostic status for this device.
 */
export async function fetchPushDiagnosticStatus(): Promise<any> {
  const devicePushId = getDevicePushId();
  try {
    const res = await fetch(pushApiUrl(`/api/push/status?devicePushId=${encodeURIComponent(devicePushId)}`));
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

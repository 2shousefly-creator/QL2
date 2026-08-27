import { soundManager } from "./audio";

/**
 * Registers Service Worker if supported and attaches update listener.
 */
export function registerServiceWorker(onWaitingSW?: () => void): void {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[UPDATE] ServiceWorker registered successfully:", reg.scope);

        if (reg.waiting) {
          console.log("[UPDATE] SW state: waiting worker detected");
          if (onWaitingSW) onWaitingSW();
        }

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[UPDATE] SW state: new waiting worker installed");
                if (onWaitingSW) onWaitingSW();
              }
            });
          }
        });

        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn("ServiceWorker registration failed:", err);
      });
  }
}

/**
 * Requests browser permission for native push/device notifications.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (err) {
      console.warn("Error requesting notification permission:", err);
      return false;
    }
  }
  return false;
}

/**
 * Formats notification body according to military rank progression structure:
 * "Sau thời gian rèn luyện tích cực tại [cấp bậc quân hàm hiện tại], bạn đã đủ điều kiện để cấp trên xét duyệt thăng [cấp bậc quân hàm tiếp theo], hãy online để làm lễ thăng cấp nào!"
 */
export function formatRankUpNotificationBody(
  currentRankName?: string,
  nextRankName?: string
): string {
  if (currentRankName && nextRankName) {
    return `Sau thời gian rèn luyện tích cực tại ${currentRankName}, bạn đã đủ điều kiện để cấp trên xét duyệt thăng ${nextRankName}, hãy online để làm lễ thăng cấp nào!`;
  }
  if (currentRankName) {
    return `Sau thời gian rèn luyện tích cực tại ${currentRankName}, bạn đã đủ điều kiện để cấp trên xét duyệt thăng cấp bậc tiếp theo, hãy online để làm lễ thăng cấp nào!`;
  }
  return "Sau thời gian rèn luyện tích cực, bạn đã đủ điều kiện để cấp trên xét duyệt thăng cấp bậc tiếp theo, hãy online để làm lễ thăng cấp nào!";
}

const NOTIFIED_RANKS_KEY = "quanlo_notified_rank_indices_v1";

export function getNotifiedRankIndices(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFIED_RANKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isRankAlreadyNotified(rankIndex: number): boolean {
  return getNotifiedRankIndices().includes(rankIndex);
}

export function markRankAsNotified(rankIndex: number): void {
  if (typeof window === "undefined") return;
  try {
    const list = getNotifiedRankIndices();
    if (!list.includes(rankIndex)) {
      list.push(rankIndex);
      localStorage.setItem(NOTIFIED_RANKS_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.warn("Failed to mark rank as notified:", err);
  }
}

/**
 * Sends a device notification when the XP bar is full and ready for rank promotion.
 * Uses ServiceWorker showNotification if available (for Android/PWA), falls back to
 * classic Notification constructor, and plays audio/haptic feedback.
 * Guaranteed to run only ONCE per rank to prevent spam.
 */
export async function sendRankUpReadyNotification(
  currentRankName?: string,
  nextRankName?: string,
  rankIndex?: number
): Promise<boolean> {
  if (rankIndex !== undefined && isRankAlreadyNotified(rankIndex)) {
    return false;
  }

  // 1. Always play audio chime & haptic feedback if audio/vibration is supported
  soundManager.playXpFull();
  soundManager.triggerHaptic("heavy");

  if (rankIndex !== undefined) {
    markRankAsNotified(rankIndex);
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  // 2. Request permission if not yet decided
  let permission = Notification.permission;
  if (permission === "default") {
    try {
      const granted = await requestNotificationPermission();
      permission = granted ? "granted" : Notification.permission;
    } catch (e) {
      console.warn("Could not request notification permission:", e);
    }
  }

  if (permission !== "granted") {
    return false;
  }

  const title = "🎖️ Sẵn sàng Thăng Cấp Bậc!";
  const body = formatRankUpNotificationBody(currentRankName, nextRankName);
  const tag = rankIndex !== undefined ? `rank_up_ready_${rankIndex}` : "rank_up_ready";

  // 3. Try ServiceWorker Registration showNotification first (Required on Android Chrome)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag,
          renotify: false,
          vibrate: [200, 100, 200, 100, 300],
          data: { url: "/" },
        } as NotificationOptions);
        return true;
      }
    } catch (err) {
      console.warn("ServiceWorker showNotification failed, trying classic Notification API:", err);
    }
  }

  // 4. Fallback to classic Web Notification API
  try {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag,
    });

    notification.onclick = () => {
      if (typeof window !== "undefined") {
        window.focus();
      }
      notification.close();
    };
    return true;
  } catch (err) {
    console.warn("Classic Notification constructor failed or unsupported in this context:", err);
  }

  return false;
}

/**
 * Schedules an offline / background rank up notification to be triggered by Service Worker
 * even when the app is completely closed or offline.
 */
export function scheduleOfflineRankNotification(params: {
  currentRankName: string;
  nextRankName: string;
  rankIndex: number;
  targetTimeEpochMs: number;
  enabled: boolean;
}): void {
  if (typeof window === "undefined") return;

  if (isRankAlreadyNotified(params.rankIndex)) {
    return;
  }

  if ("serviceWorker" in navigator) {
    const sendMsg = (reg: ServiceWorkerRegistration) => {
      const sw = reg.active || reg.waiting || reg.installing;
      if (sw) {
        sw.postMessage({
          type: "SCHEDULE_RANK_UP_NOTIFICATION",
          targetTime: params.targetTimeEpochMs,
          currentRankName: params.currentRankName,
          nextRankName: params.nextRankName,
          rankIndex: params.rankIndex,
          enabled: params.enabled,
        });
      }
    };

    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (reg) {
          sendMsg(reg);
        } else {
          navigator.serviceWorker
            .register("/sw.js")
            .then((newReg) => {
              sendMsg(newReg);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }
}

/**
 * Sends a test device notification for user verification in Profile/Settings.
 */
export async function sendTestNotification(): Promise<{ success: boolean; message: string }> {
  soundManager.playXpFull();
  soundManager.triggerHaptic("heavy");

  if (typeof window === "undefined" || !("Notification" in window)) {
    return {
      success: false,
      message: "Trình duyệt hoặc môi trường hiện tại không hỗ trợ API Notification. Hệ thống sẽ sử dụng thông báo In-App.",
    };
  }

  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    return {
      success: false,
      message: "Quyền thông báo chưa được cấp trong trình duyệt. Vui lòng kiểm tra và cho phép gửi thông báo.",
    };
  }

  const title = "🎖️ Kiểm Tra Thông Báo Quân Đội";
  const body = formatRankUpNotificationBody("Hạ Sĩ 6", "Trung Sĩ 1");

  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: "/favicon.ico",
          tag: "test_notification",
          renotify: true,
          vibrate: [200, 100, 200],
        } as NotificationOptions);
        return { success: true, message: "Đã gửi thông báo thử nghiệm thành công!" };
      }
    } catch (e) {
      console.warn("ServiceWorker test notification failed:", e);
    }
  }

  try {
    const n = new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "test_notification",
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
    return { success: true, message: "Đã gửi thông báo thử nghiệm thành công!" };
  } catch (err) {
    console.warn("Test notification failed:", err);
    return {
      success: false,
      message: "Môi trường iFrame/Trình duyệt chặn thông báo hệ thống. Màn hình sẽ hiển thị thông báo In-App.",
    };
  }
}

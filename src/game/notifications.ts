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

const NOTIFIED_RANKS_KEY = "quanlo_notified_rank_families_v2";

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

/** Foreground feedback only. Background delivery is owned by the Worker. */
export async function sendRankUpReadyNotification(currentRankName?: string, nextRankName?: string, rankIndex?: number): Promise<boolean> {
  if (document.visibilityState !== 'visible' || (rankIndex !== undefined && isRankAlreadyNotified(rankIndex))) return false;
  soundManager.playXpFull();
  soundManager.triggerHaptic('heavy');
  if (rankIndex !== undefined) markRankAsNotified(rankIndex);
  window.dispatchEvent(new CustomEvent('QL2_PUSH_EVENT', { detail: {
    type: 'xp_ready', title: '🎖️ Sẵn sàng thăng cấp!',
    body: formatRankUpNotificationBody(currentRankName, nextRankName), destination: 'xp-ready', rankIndex,
  } }));
  return true;
}

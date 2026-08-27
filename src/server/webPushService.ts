import webPush from "web-push";
import { VAPID_CONFIG } from "./config";
import { logPushEvent } from "./logger";

let isVapidConfigured = false;

export function initWebPush(): boolean {
  if (isVapidConfigured) return true;

  if (!VAPID_CONFIG.publicKey || !VAPID_CONFIG.privateKey) {
    const isProd = process.env.NODE_ENV === "production";
    if (isProd) {
      console.error(
        "[WEB_PUSH] FATAL: Production VAPID keys (WEB_PUSH_VAPID_PUBLIC_KEY / WEB_PUSH_VAPID_PRIVATE_KEY) missing from environment!"
      );
      return false;
    } else {
      console.warn(
        "[WEB_PUSH] Development notice: WEB_PUSH_VAPID_PUBLIC_KEY / WEB_PUSH_VAPID_PRIVATE_KEY not set. Push features will remain dormant until configured."
      );
      return false;
    }
  }

  try {
    webPush.setVapidDetails(
      VAPID_CONFIG.subject,
      VAPID_CONFIG.publicKey,
      VAPID_CONFIG.privateKey
    );
    isVapidConfigured = true;
    console.log("[WEB_PUSH] VAPID details initialized successfully.");
    return true;
  } catch (err: any) {
    console.error("[WEB_PUSH] Failed to configure VAPID details:", err.message);
    return false;
  }
}

export type PushSendResult = {
  success: boolean;
  statusCode?: number;
  isPermanentGone?: boolean;
  isTransient?: boolean;
  error?: string;
};

export async function sendWebPushNotification(
  subscription: webPush.PushSubscription,
  payload: {
    title: string;
    body: string;
    tag?: string;
    url?: string;
    generation?: string;
    type?: string;
  }
): Promise<PushSendResult> {
  if (!isVapidConfigured) {
    const initialized = initWebPush();
    if (!initialized) {
      return {
        success: false,
        error: "VAPID keys not configured on server",
        isTransient: true,
      };
    }
  }

  try {
    logPushEvent("PUSH_SEND_ATTEMPT", {
      generation: payload.generation,
      type: payload.type,
      tag: payload.tag,
    });

    await webPush.sendNotification(subscription, JSON.stringify(payload), {
      TTL: 86400 * 7, // 7 days durable TTL in browser push service
    });

    logPushEvent("PUSH_SEND_OK", {
      generation: payload.generation,
      type: payload.type,
    });

    return { success: true, statusCode: 200 };
  } catch (err: any) {
    const statusCode = err.statusCode || (err.code ? Number(err.code) : 500);
    const errorMessage = err.message || "Unknown push error";

    const isPermanentGone = statusCode === 404 || statusCode === 410;
    const isTransient =
      !isPermanentGone &&
      (statusCode === 408 ||
        statusCode === 425 ||
        statusCode === 429 ||
        statusCode >= 500 ||
        err.code === "ETIMEDOUT" ||
        err.code === "ECONNRESET");

    logPushEvent(
      isPermanentGone ? "PUSH_SUBSCRIPTION_GONE_404_410" : "PUSH_SEND_TRANSIENT_FAIL",
      {
        generation: payload.generation,
        statusCode,
        errorClass: isPermanentGone ? "PERMANENT_GONE" : "TRANSIENT_RETRYABLE",
        message: errorMessage,
      }
    );

    return {
      success: false,
      statusCode,
      isPermanentGone,
      isTransient,
      error: errorMessage,
    };
  }
}

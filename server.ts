import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { VAPID_CONFIG } from "./src/server/config";
import { logPushEvent } from "./src/server/logger";
import {
  getDeviceRecord,
  saveDeviceRegistration,
  updateDeviceSchedule,
  acquirePushSendingLease,
  markPushScheduleSent,
  markPushSubscriptionInvalid,
  recordPushAttemptFailure,
  PushSchedule,
} from "./src/server/firestore";
import { createOrRescheduleXpPushTask, deleteCloudTask } from "./src/server/cloudTasks";
import { verifyCloudTasksOidc } from "./src/server/oidcAuth";
import { initWebPush, sendWebPushNotification } from "./src/server/webPushService";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "1mb" }));

// Initialize Web Push VAPID
initWebPush();

/**
 * CORS Allowlist for Public Web Push Endpoints (/api/push/*).
 * DO NOT use wildcard "*" in production.
 * DO NOT apply CORS to /internal/push/xp-full (which is internal OIDC only).
 */
const PUSH_CORS_ALLOWLIST = new Set([
  "https://quanlo.ai.studio",
  "https://qu-n-l-h-nh-tr-nh-th-ng-c-p-kigpbzmhfq-as.a.run.app",
  "https://qu-n-l-h-nh-tr-nh-th-ng-c-p-kigpbzmhiq-as.a.run.app",
  "http://localhost:3000",
  "http://localhost:5173",
]);

// CORS middleware specifically for /api/push/*
app.use("/api/push", (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && PUSH_CORS_ALLOWLIST.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Vary", "Origin");
    return res.status(204).end();
  }

  next();
});

// --- Health Check ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "quan-lo-backend",
    version: "2.1.0",
    timestamp: Date.now(),
  });
});

// --- Public VAPID Key Endpoint ---
app.get("/api/push/vapid-public-key", (req, res) => {
  if (!VAPID_CONFIG.publicKey) {
    return res.status(503).json({ error: "VAPID public key not configured" });
  }
  res.json({
    publicKey: VAPID_CONFIG.publicKey,
    fingerprint: VAPID_CONFIG.fingerprint,
  });
});

// --- Device Registration Endpoint ---
app.post("/api/push/register", async (req, res) => {
  try {
    const { devicePushId, subscription } = req.body || {};

    if (!devicePushId || typeof devicePushId !== "string") {
      return res.status(400).json({ error: "Invalid or missing devicePushId" });
    }

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return res.status(400).json({ error: "Invalid subscription payload" });
    }

    const doc = await saveDeviceRegistration(
      devicePushId,
      subscription,
      VAPID_CONFIG.fingerprint
    );

    logPushEvent("DEVICE_REGISTERED", {
      devicePushId,
      endpointHost: new URL(subscription.endpoint).host,
    });

    res.json({ success: true, devicePushId: doc.devicePushId });
  } catch (err: any) {
    console.error("[API] Error in /api/push/register:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Schedule XP Full Push Endpoint ---
app.post("/api/push/xp-full/schedule", async (req, res) => {
  try {
    const {
      devicePushId,
      scheduleGeneration,
      dueAtEpochMs,
      rankIdentity,
    } = req.body || {};

    if (!devicePushId || !scheduleGeneration || typeof dueAtEpochMs !== "number") {
      return res.status(400).json({ error: "Missing required schedule fields" });
    }

    const existingDevice = await getDeviceRecord(devicePushId);
    if (!existingDevice) {
      return res.status(404).json({
        error: "Device not registered on server. Please call /api/push/register first.",
        code: "DEVICE_NOT_REGISTERED",
      });
    }

    const oldTaskName = existingDevice.schedule?.taskName;

    // Create new task (handles 25-day checkpoint chain automatically)
    const taskResult = await createOrRescheduleXpPushTask({
      devicePushId,
      generation: scheduleGeneration,
      dueAtEpochMs,
    });

    const now = Date.now();
    const newSchedule: PushSchedule = {
      type: "xp_full",
      generation: scheduleGeneration,
      dueAt: dueAtEpochMs,
      rankIdentity: rankIdentity || {},
      status: "scheduled",
      taskName: taskResult.taskName,
      taskKind: taskResult.taskKind,
      createdAt: now,
      updatedAt: now,
      sentAt: null,
      lastAttemptAt: null,
      attemptCount: 0,
    };

    await updateDeviceSchedule(devicePushId, newSchedule);

    // After persisting successfully, best-effort delete old Cloud Task
    if (oldTaskName && oldTaskName !== taskResult.taskName) {
      deleteCloudTask(oldTaskName).catch(() => {});
    }

    res.json({
      success: true,
      schedule: {
        generation: scheduleGeneration,
        dueAt: dueAtEpochMs,
        taskKind: taskResult.taskKind,
        scheduledForEpochMs: taskResult.scheduledForEpochMs,
      },
    });
  } catch (err: any) {
    console.error("[API] Error in /api/push/xp-full/schedule:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Cancel XP Full Push Schedule ---
app.post("/api/push/xp-full/cancel", async (req, res) => {
  try {
    const { devicePushId } = req.body || {};
    if (!devicePushId) {
      return res.status(400).json({ error: "Missing devicePushId" });
    }

    const existingDevice = await getDeviceRecord(devicePushId);

    if (existingDevice?.schedule?.taskName) {
      await deleteCloudTask(existingDevice.schedule.taskName).catch(() => {});
    }

    if (existingDevice && existingDevice.schedule) {
      existingDevice.schedule.status = "canceled";
      existingDevice.schedule.updatedAt = Date.now();
      await updateDeviceSchedule(devicePushId, existingDevice.schedule);
    }

    logPushEvent("SCHEDULE_CANCELED", { devicePushId });
    res.json({ success: true });
  } catch (err: any) {
    console.error(`[CANCEL] Error canceling schedule for ${req.body?.devicePushId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// --- Test Push Notification via Backend (Public) ---
app.post("/api/push/test", async (req, res) => {
  try {
    const { devicePushId } = req.body || {};
    if (!devicePushId) {
      return res.status(400).json({ error: "Missing devicePushId" });
    }

    const device = await getDeviceRecord(devicePushId);
    if (!device || !device.subscription) {
      return res.status(404).json({
        success: false,
        message: "Thiết bị chưa được đăng ký trên hệ thống Web Push.",
      });
    }

    const testGeneration = `test-${Date.now()}`;
    const result = await sendWebPushNotification(device.subscription, {
      type: "xp_full",
      title: "🎖️ Kiểm Tra Thông Báo Quân Lộ (Web Push Server)",
      body: "Hệ thống Web Push máy chủ hoạt động hoàn hảo! Bạn sẽ nhận được thông báo ngay cả khi đóng ứng dụng.",
      tag: "quan-lo-test-push",
      generation: testGeneration,
      url: "/",
    });

    if (result.success) {
      return res.json({
        success: true,
        message: "Đã phát lệnh Web Push thành công qua máy chủ!",
      });
    }

    if (result.isPermanentGone) {
      await markPushSubscriptionInvalid(devicePushId, result.statusCode || 410, result.error);
      return res.status(410).json({
        success: false,
        message: "Subscription đã hết hạn trên trình duyệt. Vui lòng tắt và bật lại thông báo.",
      });
    }

    res.status(500).json({
      success: false,
      message: result.error || "Gửi Web Push thất bại",
      statusCode: result.statusCode,
    });
  } catch (err: any) {
    console.error("[API] Error in /api/push/test:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Diagnostic Status Endpoint ---
app.get("/api/push/status", async (req, res) => {
  try {
    const devicePushId = req.query.devicePushId as string;
    if (!devicePushId) {
      return res.status(400).json({ error: "Missing devicePushId" });
    }

    const device = await getDeviceRecord(devicePushId);
    if (!device) {
      return res.json({ registered: false });
    }

    res.json({
      registered: true,
      enabled: device.enabled,
      vapidFingerprint: device.vapidKeyFingerprint,
      schedule: device.schedule
        ? {
            status: device.schedule.status,
            dueAt: device.schedule.dueAt,
            taskKind: device.schedule.taskKind,
            generation: device.schedule.generation?.slice(0, 8),
            sentAt: device.schedule.sentAt,
            lastAttemptAt: device.schedule.lastAttemptAt,
            attemptCount: device.schedule.attemptCount,
            lastErrorCode: device.schedule.lastErrorCode,
          }
        : null,
      diagnostics: device.diagnostics || {},
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Internal Cloud Tasks Trigger Endpoint (Protected by OIDC) ---
app.post("/internal/push/xp-full", verifyCloudTasksOidc, async (req, res) => {
  const { devicePushId, generation, taskKind } = req.body || {};

  if (!devicePushId || !generation) {
    return res.status(400).json({ error: "Missing devicePushId or generation" });
  }

  logPushEvent("TASK_TRIGGERED", { devicePushId, generation, taskKind });

  try {
    const device = await getDeviceRecord(devicePushId);

    // Generation / Status Guard
    if (
      !device ||
      !device.enabled ||
      !device.schedule ||
      (device.schedule.status !== "scheduled" && device.schedule.status !== "sending") ||
      device.schedule.generation !== generation
    ) {
      logPushEvent("STALE_GENERATION_SKIPPED", {
        devicePushId,
        generation,
        currentGeneration: device?.schedule?.generation,
        status: device?.schedule?.status,
      });
      return res.status(200).json({ status: "skipped_stale_or_canceled" });
    }

    // A) Checkpoint Chain Processing
    if (taskKind === "checkpoint") {
      const now = Date.now();
      const timeRemaining = device.schedule.dueAt - now;

      if (timeRemaining <= 0) {
        // Due time has arrived, proceed directly to final push below
      } else {
        // Re-evaluate schedule and create next checkpoint or final task
        const nextTask = await createOrRescheduleXpPushTask({
          devicePushId,
          generation,
          dueAtEpochMs: device.schedule.dueAt,
        });

        device.schedule.taskName = nextTask.taskName;
        device.schedule.taskKind = nextTask.taskKind;
        device.schedule.updatedAt = Date.now();
        await updateDeviceSchedule(devicePushId, device.schedule);

        return res.status(200).json({
          status: "checkpoint_processed",
          nextTaskKind: nextTask.taskKind,
          scheduledFor: nextTask.scheduledForEpochMs,
        });
      }
    }

    // B) Final Task Clock Skew Guard: Check if triggered early (>10s before dueAt)
    const now = Date.now();
    if (now < device.schedule.dueAt - 10000) {
      const remainingMs = device.schedule.dueAt - now;
      console.warn(`[TASK] Triggered ${remainingMs}ms too early for ${devicePushId}, rescheduling...`);

      const nextTask = await createOrRescheduleXpPushTask({
        devicePushId,
        generation,
        dueAtEpochMs: device.schedule.dueAt,
      });

      device.schedule.taskName = nextTask.taskName;
      device.schedule.taskKind = nextTask.taskKind;
      await updateDeviceSchedule(devicePushId, device.schedule);

      return res.status(200).json({ status: "rescheduled_early_trigger" });
    }

    // C) Acquire atomic lease before attempting push to prevent race condition
    // If crash occurs during sending, lease auto-recovers after 60s
    const leaseResult = await acquirePushSendingLease(devicePushId, generation, 60000);
    if (!leaseResult.acquired) {
      logPushEvent("LEASE_ACQUISITION_SKIPPED", {
        devicePushId,
        generation,
        reason: leaseResult.reason,
      });

      if (leaseResult.reason === "ACTIVE_LEASE_IN_PROGRESS") {
        // Return 503 so Cloud Tasks retries until the active lease finishes or 60s lease expires
        return res.status(503).json({
          error: "Push sending lease is currently active on another worker",
          retryable: true,
        });
      }

      // Terminal non-retryable states (ALREADY_SENT, STALE_GENERATION, CANCELED, INVALID, NOT_FOUND)
      return res.status(200).json({ status: `skipped_${leaseResult.reason}` });
    }

    const currentRank = device.schedule.rankIdentity?.currentRankName || "quân hàm hiện tại";
    const nextRank = device.schedule.rankIdentity?.nextRankName || "cấp bậc tiếp theo";
    const rankIndex = device.schedule.rankIdentity?.rankIndex;

    const title = "🎖️ Sẵn sàng Thăng Cấp Bậc!";
    const body = `Sau thời gian rèn luyện tích cực tại ${currentRank}, bạn đã đủ điều kiện để cấp trên xét duyệt thăng ${nextRank}, hãy online để làm lễ thăng cấp nào!`;

    const pushResult = await sendWebPushNotification(device.subscription, {
      type: "xp_full",
      title,
      body,
      tag: `quan-lo-xp-full-${rankIndex ?? "ready"}`,
      generation,
      url: "/",
    });

    if (pushResult.success) {
      await markPushScheduleSent(devicePushId, generation);
      return res.status(200).json({ status: "sent" });
    }

    if (pushResult.isPermanentGone) {
      await markPushSubscriptionInvalid(
        devicePushId,
        pushResult.statusCode || 410,
        pushResult.error
      );
      // Return 200 to Cloud Tasks so it stops retrying an invalid/unsubscribed device
      return res.status(200).json({ status: "subscription_gone_marked_invalid" });
    }

    // Transient failure: record attempt and reset status so Cloud Tasks performs retry
    await recordPushAttemptFailure(
      devicePushId,
      pushResult.statusCode || 500,
      pushResult.error || "Transient web push delivery error"
    );

    return res.status(500).json({
      error: "Transient push failure, requesting Cloud Tasks retry",
      statusCode: pushResult.statusCode,
    });
  } catch (err: any) {
    console.error(`[TASK_HANDLER] Internal error handling task for ${devicePushId}:`, err);
    return res.status(500).json({ error: err.message });
  }
});

// --- Vite / Static SPA Middleware Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[QUAN-LO] Server listening on port ${PORT} (env: ${process.env.NODE_ENV || "development"})`);
  });
}

startServer();

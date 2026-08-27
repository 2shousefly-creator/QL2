import { CloudTasksClient, protos } from "@google-cloud/tasks";
import { GCP_CONFIG, getAppUrl } from "./config";
import { logPushEvent } from "./logger";
import { isDevFallbackAllowed } from "./firestore";

let tasksClient: CloudTasksClient | null = null;
let cloudTasksUnavailableInDev = false;

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

function getTasksClient(): CloudTasksClient {
  if (tasksClient) return tasksClient;
  try {
    tasksClient = new CloudTasksClient({
      projectId: GCP_CONFIG.projectId,
    });
    return tasksClient;
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      console.warn(`[CLOUD_TASKS] Dev fallback enabled: ${err.message}`);
      cloudTasksUnavailableInDev = true;
      return null as any;
    }
    console.error(`[CLOUD_TASKS] FATAL: Failed to init CloudTasksClient:`, err.message);
    throw err;
  }
}

// 25 days max direct schedule window (Cloud Tasks limit is 30 days)
const MAX_DIRECT_SCHEDULE_MS = 25 * 24 * 60 * 60 * 1000;

export type TaskScheduleResult = {
  taskName: string;
  taskKind: "checkpoint" | "final";
  scheduledForEpochMs: number;
};

export async function createOrRescheduleXpPushTask(params: {
  devicePushId: string;
  generation: string;
  dueAtEpochMs: number;
}): Promise<TaskScheduleResult> {
  const now = Date.now();
  const timeUntilDueMs = params.dueAtEpochMs - now;

  let taskKind: "checkpoint" | "final" = "final";
  let scheduledForEpochMs = params.dueAtEpochMs;

  if (timeUntilDueMs > MAX_DIRECT_SCHEDULE_MS) {
    taskKind = "checkpoint";
    scheduledForEpochMs = now + MAX_DIRECT_SCHEDULE_MS;
  }

  const appUrl = getAppUrl();
  const targetUrl = `${appUrl}/internal/push/xp-full`;
  // Explicit Audience: APP_URL across task creation & verification
  const audience = appUrl;

  if (cloudTasksUnavailableInDev && isDevFallbackAllowed()) {
    const simulatedTaskName = `projects/${GCP_CONFIG.projectId}/locations/${GCP_CONFIG.region}/queues/${GCP_CONFIG.cloudTasksQueue}/tasks/dev-${Date.now()}`;
    logPushEvent(taskKind === "checkpoint" ? "TASK_CHECKPOINT_CREATED" : "SCHEDULE_CREATED", {
      devicePushId: params.devicePushId,
      generation: params.generation,
      taskName: simulatedTaskName,
      dueAt: params.dueAtEpochMs,
      devSimulated: true,
    });
    return {
      taskName: simulatedTaskName,
      taskKind,
      scheduledForEpochMs,
    };
  }

  try {
    const client = getTasksClient();
    const parent = client.queuePath(
      GCP_CONFIG.projectId,
      GCP_CONFIG.region,
      GCP_CONFIG.cloudTasksQueue
    );

    const payload = {
      devicePushId: params.devicePushId,
      generation: params.generation,
      taskKind,
    };

    const scheduleSeconds = Math.max(
      Math.floor(Date.now() / 1000) + 1,
      Math.floor(scheduledForEpochMs / 1000)
    );

    const task: protos.google.cloud.tasks.v2.ITask = {
      httpRequest: {
        httpMethod: protos.google.cloud.tasks.v2.HttpMethod.POST,
        url: targetUrl,
        headers: {
          "Content-Type": "application/json",
        },
        body: Buffer.from(JSON.stringify(payload)).toString("base64"),
        oidcToken: {
          serviceAccountEmail: GCP_CONFIG.taskInvokerServiceAccount,
          audience: audience,
        },
      },
      scheduleTime: {
        seconds: scheduleSeconds,
      },
    };

    const [response] = await client.createTask({
      parent,
      task,
    });

    const taskName = response.name || "";
    logPushEvent(taskKind === "checkpoint" ? "TASK_CHECKPOINT_CREATED" : "SCHEDULE_CREATED", {
      devicePushId: params.devicePushId,
      generation: params.generation,
      taskName,
      dueAt: params.dueAtEpochMs,
      audience,
    });

    return {
      taskName,
      taskKind,
      scheduledForEpochMs,
    };
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      console.warn(`[CLOUD_TASKS] Dev fallback enabled (${err.message})`);
      cloudTasksUnavailableInDev = true;
      return createOrRescheduleXpPushTask(params);
    }
    console.error(`[CLOUD_TASKS] Failed to create task:`, err.message);
    throw err;
  }
}

export async function deleteCloudTask(taskName?: string | null): Promise<void> {
  if (!taskName) return;
  if (cloudTasksUnavailableInDev && isDevFallbackAllowed()) return;

  try {
    const client = getTasksClient();
    if (!client) return;
    await client.deleteTask({ name: taskName });
  } catch (err: any) {
    if (isDevFallbackAllowed() && isPermissionOrAuthError(err)) {
      cloudTasksUnavailableInDev = true;
      return;
    }
    // If task not found (already executed/deleted), ignore
    if (err.code === 5 || err.message?.includes("NOT_FOUND")) {
      return;
    }
    console.warn(`[CLOUD_TASKS] Best-effort delete failed for ${taskName}:`, err.message);
  }
}

/**
 * Structured Logger for Quân Lộ Web Push Infrastructure.
 * Ensures security: Never logs private keys, raw auth secrets, or full keys.
 */

export type PushLogEvent =
  | "REGISTER_OK"
  | "REGISTER_FAIL"
  | "DEVICE_REGISTERED"
  | "SCHEDULE_CREATED"
  | "SCHEDULE_REPLACED"
  | "SCHEDULE_CANCELED"
  | "TASK_CHECKPOINT_CREATED"
  | "TASK_TRIGGERED"
  | "LEASE_ACQUISITION_SKIPPED"
  | "PUSH_SEND_ATTEMPT"
  | "PUSH_SEND_OK"
  | "PUSH_SEND_TRANSIENT_FAIL"
  | "PUSH_SUBSCRIPTION_GONE_404_410"
  | "STALE_GENERATION_SKIPPED"
  | "VAPID_MISMATCH_RESUBSCRIBE"
  | "OIDC_AUTH_FAIL"
  | "OIDC_AUTH_OK";

export function maskId(id?: string): string {
  if (!id) return "none";
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

export function logPushEvent(
  event: PushLogEvent,
  data: {
    devicePushId?: string;
    generation?: string;
    rankIndex?: number;
    dueAt?: number | string;
    taskName?: string | null;
    attempt?: number;
    statusCode?: number;
    errorClass?: string;
    message?: string;
    [key: string]: any;
  } = {}
) {
  const sanitized = {
    timestamp: new Date().toISOString(),
    event,
    devicePushIdShort: data.devicePushId ? maskId(data.devicePushId) : undefined,
    generationShort: data.generation ? maskId(data.generation) : undefined,
    rankIndex: data.rankIndex,
    dueAt: data.dueAt,
    taskNameShort: data.taskName ? maskId(data.taskName) : undefined,
    attempt: data.attempt,
    statusCode: data.statusCode,
    errorClass: data.errorClass,
    message: data.message,
  };

  // Structured JSON Log for Cloud Logging
  console.log(JSON.stringify(sanitized));
}

import crypto from "crypto";

/**
 * Production Infrastructure and Environment Configuration for Quân Lộ Web Push.
 * DO NOT CHANGE PUSH_API_BASE_URL OR WEB PUSH INFRASTRUCTURE WITHOUT AN EXPLICIT WEB PUSH MIGRATION.
 */

export const GCP_CONFIG = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID || "gen-lang-client-0052121673",
  region: "asia-southeast1",
  firestoreDatabase: "(default)",
  cloudTasksQueue: "xp-full-push",
  taskInvokerServiceAccount:
    process.env.CLOUD_TASKS_SERVICE_ACCOUNT_EMAIL ||
    process.env.TASK_INVOKER_SERVICE_ACCOUNT ||
    "quan-lo-task-invoker@gen-lang-client-0052121673.iam.gserviceaccount.com",
  runtimeServiceAccount: "quan-lo-runtime@gen-lang-client-0052121673.iam.gserviceaccount.com",
  productionUrl: "https://quan-lo-push-api-953163983006.asia-southeast1.run.app",
};

export function getAppUrl(): string {
  const url = process.env.APP_URL || process.env.PUSH_TASK_TARGET_URL || GCP_CONFIG.productionUrl;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getValidVapidSubject(rawSubject?: string): string {
  if (!rawSubject) return "mailto:admin@quan-lo.app";
  const trimmed = rawSubject.trim();
  if (trimmed.startsWith("mailto:") || trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  if (trimmed.includes("@")) {
    return `mailto:${trimmed}`;
  }
  return "mailto:admin@quan-lo.app";
}

const rawPublicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY || "";
const rawPrivateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY || "";

export const VAPID_CONFIG = {
  publicKey: rawPublicKey,
  privateKey: rawPrivateKey,
  subject: getValidVapidSubject(process.env.WEB_PUSH_VAPID_SUBJECT),
  fingerprint: rawPublicKey
    ? crypto.createHash("sha256").update(rawPublicKey).digest("hex").slice(0, 12)
    : "none",
};

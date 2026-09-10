import type { D1Database } from '@cloudflare/workers-types';
import type { PushSubscription } from 'web-push';
export interface Env {
  DB: D1Database;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_SUBJECT: string;
  PUSH_ENABLED: string;
}
export interface Device {
  device_id: string;
  device_secret_hash: string;
  subscription_json: string;
  enabled: number;
  invalidated_at: number | null;
}
export interface IntentRow {
  device_id: string; intent_key: string; type: 'xp_ready' | 'crop_ready' | 'feed_empty' | 'test';
  event_generation: string; due_at: number; attempt_count: number; lease_token: string;
}
export interface Intent {
  key: string; type: Exclude<IntentRow['type'], 'test'>; eventGeneration: string; dueAtEpochMs: number;
}
export type Subscription = PushSubscription;

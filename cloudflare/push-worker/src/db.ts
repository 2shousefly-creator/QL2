import type { Env, Intent, IntentRow, Device } from './types';
import { payload, send, safePushFailure } from './push';
export async function snapshot(env: Env, id: string, intents: Intent[], now: number) {
  // A D1 batch is a transaction. Retain sent tombstones even if an intent disappears.
  const keys = intents.map(i => i.key);
  const statements = [env.DB.prepare(`UPDATE push_intents SET status='canceled', lease_token=NULL, lease_until=NULL, updated_at=?
    WHERE device_id=? AND type IN ('xp_ready','crop_ready','feed_empty') AND status NOT IN ('sent','canceled') ${keys.length ? `AND intent_key NOT IN (${keys.map(() => '?').join(',')})` : ''}`).bind(now, id, ...keys)];
  for (const i of intents) statements.push(env.DB.prepare(`
    INSERT INTO push_intents(device_id,intent_key,type,event_generation,due_at,status,created_at,updated_at,retry_at)
    VALUES(?,?,?,?,?,'scheduled',?,?,?)
    ON CONFLICT(device_id,intent_key) DO UPDATE SET
      type=excluded.type, event_generation=excluded.event_generation, due_at=excluded.due_at,
      status=CASE WHEN push_intents.event_generation=excluded.event_generation AND (push_intents.status='sent' OR (push_intents.status='sending' AND ABS(push_intents.due_at-excluded.due_at)<30000) OR (push_intents.status='canceled' AND push_intents.attempt_count>=6)) THEN push_intents.status ELSE 'scheduled' END,
      attempt_count=CASE WHEN push_intents.event_generation=excluded.event_generation THEN push_intents.attempt_count ELSE 0 END,
      last_attempt_at=CASE WHEN push_intents.event_generation=excluded.event_generation THEN push_intents.last_attempt_at ELSE NULL END,
      sent_at=CASE WHEN push_intents.event_generation=excluded.event_generation THEN push_intents.sent_at ELSE NULL END,
      lease_token=CASE WHEN push_intents.event_generation=excluded.event_generation AND ABS(push_intents.due_at-excluded.due_at)<30000 THEN push_intents.lease_token ELSE NULL END,
      lease_until=CASE WHEN push_intents.event_generation=excluded.event_generation AND ABS(push_intents.due_at-excluded.due_at)<30000 THEN push_intents.lease_until ELSE NULL END,
      retry_at=CASE WHEN push_intents.event_generation=excluded.event_generation AND push_intents.last_error IS NOT NULL THEN MAX(push_intents.retry_at,excluded.retry_at) ELSE excluded.retry_at END,
      last_error=CASE WHEN push_intents.event_generation=excluded.event_generation THEN push_intents.last_error ELSE NULL END,
      updated_at=excluded.updated_at
  `).bind(id, i.key, i.type, i.eventGeneration, i.dueAtEpochMs, now, now, i.dueAtEpochMs));
  statements.push(env.DB.prepare('UPDATE push_devices SET last_seen_at=?, updated_at=? WHERE device_id=?').bind(now, now, id));
  await env.DB.batch(statements);
}
/** Atomic cooldown + replacement; gameplay snapshots never own this row. */
export async function scheduleDiagnostic(env: Env, id: string, now: number): Promise<boolean> {
  const generation = `test:${crypto.randomUUID()}`;
  const due = now + 60000;
  const results = await env.DB.batch([
    env.DB.prepare(`INSERT INTO push_intents
      (device_id,intent_key,type,event_generation,due_at,status,created_at,updated_at,retry_at)
      SELECT device_id,'diagnostic-test','test',?,?,'scheduled',?,?,?
      FROM push_devices WHERE device_id=? AND enabled=1 AND invalidated_at IS NULL AND last_test_at<=?
      ON CONFLICT(device_id,intent_key) DO UPDATE SET
        type='test',event_generation=excluded.event_generation,due_at=excluded.due_at,
        status='scheduled',created_at=excluded.created_at,updated_at=excluded.updated_at,
        retry_at=excluded.retry_at,attempt_count=0,sent_at=NULL,last_attempt_at=NULL,
        last_error=NULL,lease_token=NULL,lease_until=NULL`).bind(generation, due, now, now, due, id, now - 30000),
    env.DB.prepare(`UPDATE push_devices SET last_test_at=? WHERE device_id=? AND EXISTS
      (SELECT 1 FROM push_intents WHERE device_id=? AND intent_key='diagnostic-test' AND event_generation=?)`)
      .bind(now, id, id, generation),
  ]);
  return results[0].meta.changes > 0;
}

export async function invalidate(env: Env, id: string, now: number, expectedSubscription?: string) {
  await env.DB.batch([
    env.DB.prepare('UPDATE push_devices SET enabled=0, invalidated_at=?, updated_at=? WHERE device_id=? AND (? IS NULL OR subscription_json=?)').bind(now, now, id, expectedSubscription ?? null, expectedSubscription ?? null),
    env.DB.prepare("UPDATE push_intents SET status='canceled', lease_token=NULL, lease_until=NULL, updated_at=? WHERE device_id=? AND status!='sent' AND EXISTS (SELECT 1 FROM push_devices WHERE device_id=? AND enabled=0 AND invalidated_at=?)").bind(now, id, id, now),
  ]);
}
type CronErrorCode = 'CRON_D1_RECOVERY_FAILED' | 'CRON_D1_SELECT_FAILED' |
  'CRON_D1_CLAIM_FAILED' | 'CRON_DELIVERY_LOOP_FAILED' | 'CRON_UNKNOWN_FAILURE';
interface CronProgress {
  errorCode: CronErrorCode;
  candidates: number;
  claimed: number;
  successes: number;
}

export async function runScheduledPushCycle(env: Env, scheduledTime: number) {
  const token = crypto.randomUUID();
  const progress: CronProgress = { errorCode: 'CRON_UNKNOWN_FAILURE', candidates: 0, claimed: 0, successes: 0 };
  // An older overlapping invocation must not overwrite the latest cycle's health.
  const saveProgress = async () => {
    await env.DB.prepare(`UPDATE push_cron_health SET last_candidate_count=?, last_claimed_count=?,
      last_success_count=?, updated_at=? WHERE id=1 AND run_token=?`)
      .bind(progress.candidates, progress.claimed, progress.successes, Date.now(), token).run();
  };
  try {
    await env.DB.prepare(`UPDATE push_cron_health SET run_token=?, last_started_at=?,
      last_candidate_count=0, last_claimed_count=0, last_success_count=0, updated_at=? WHERE id=1`)
      .bind(token, scheduledTime, Date.now()).run();
    // Use current epoch milliseconds for due/retry checks even if Cron starts late.
    await deliverDue(env, Date.now(), token, progress, saveProgress);
    progress.errorCode = 'CRON_UNKNOWN_FAILURE';
    await env.DB.prepare(`UPDATE push_cron_health SET last_completed_at=?, last_error_code=NULL,
      last_candidate_count=?, last_claimed_count=?, last_success_count=?, updated_at=? WHERE id=1 AND run_token=?`)
      .bind(Date.now(), progress.candidates, progress.claimed, progress.successes, Date.now(), token).run();
  } catch {
    try {
      await env.DB.prepare(`UPDATE push_cron_health SET last_error_code=?, last_candidate_count=?,
        last_claimed_count=?, last_success_count=?, updated_at=? WHERE id=1 AND run_token=?`)
        .bind(progress.errorCode, progress.candidates, progress.claimed, progress.successes, Date.now(), token).run();
    } catch { /* D1 may itself be unavailable; never expose the underlying exception. */ }
    throw new Error(progress.errorCode);
  }
}

async function deliverDue(env: Env, now: number, token: string, progress: CronProgress, saveProgress: () => Promise<void>) {
  if (env.PUSH_ENABLED !== 'true') return;
  progress.errorCode = 'CRON_D1_RECOVERY_FAILED';
  await env.DB.prepare("UPDATE push_intents SET status=CASE WHEN attempt_count>=6 THEN 'canceled' ELSE 'scheduled' END, lease_token=NULL, lease_until=NULL WHERE status='sending' AND lease_until<=?").bind(now).run();
  // Limit the whole cron to 8 sends; leases cover this bounded sequential workload.
  progress.errorCode = 'CRON_D1_SELECT_FAILED';
  const candidates = await env.DB.prepare(`SELECT device_id,intent_key,event_generation,type,due_at,attempt_count
    FROM push_intents WHERE status='scheduled' AND retry_at<=? AND due_at<=?
    ORDER BY retry_at,due_at LIMIT 8`).bind(now, now).all<IntentRow>();
  progress.candidates = candidates.results.length;
  await saveProgress();
  progress.errorCode = 'CRON_D1_CLAIM_FAILED';
  const claimed: IntentRow[] = [];
  for (const row of candidates.results) {
    const result = await env.DB.prepare(`UPDATE push_intents SET status='sending', lease_token=?, lease_until=?,
      last_attempt_at=?, attempt_count=attempt_count+1
      WHERE device_id=? AND intent_key=? AND event_generation=? AND status='scheduled' AND retry_at<=? AND due_at<=?`)
      .bind(token, now + 900000, now, row.device_id, row.intent_key, row.event_generation, now, now).run();
    if (result.meta.changes > 0) {
      progress.claimed++;
      // Re-read the claimed generation: a snapshot or another cycle may have
      // changed delivery fields/attempt_count since candidate discovery.
      const current = await env.DB.prepare(`SELECT device_id,intent_key,event_generation,type,due_at,attempt_count,lease_token
        FROM push_intents WHERE device_id=? AND intent_key=? AND event_generation=? AND status='sending' AND lease_token=?`)
        .bind(row.device_id, row.intent_key, row.event_generation, token).first<IntentRow>();
      if (current) claimed.push(current);
    }
  }
  await saveProgress();
  progress.errorCode = 'CRON_DELIVERY_LOOP_FAILED';
  const groups = new Map<string, IntentRow[]>();
  for (const row of claimed) {
    const key = `${row.device_id}:${row.type === 'crop_ready' ? row.type : row.intent_key}`;
    groups.set(key, [...(groups.get(key) || []), row]);
  }
  for (const rows of groups.values()) {
    const id = rows[0].device_id;
    const device = await env.DB.prepare('SELECT * FROM push_devices WHERE device_id=?').bind(id).first<Device>();
    if (!device || !device.enabled || device.invalidated_at) {
      await invalidate(env, id, now); continue;
    }
    // Snapshot cancellation/replacement revokes a lease before the request starts.
    const live = [];
    for (const row of rows) {
      const exists = await env.DB.prepare("SELECT 1 FROM push_intents WHERE device_id=? AND intent_key=? AND event_generation=? AND status='sending' AND lease_token=?")
        .bind(id, row.intent_key, row.event_generation, token).first();
      if (exists) live.push(row);
    }
    if (!live.length) continue;
    let delivery;
    try { delivery = await send(env, JSON.parse(device.subscription_json), payload(live[0].type, live)); }
    catch (error) { delivery = safePushFailure(error); }
    const status = delivery.statusCode;
    const invalid = status === 404 || status === 410;
    const success = status >= 200 && status < 300;
    // Count provider-accepted notifications; grouped crops count as one send.
    if (success) progress.successes++;

    await env.DB.batch(live.map(row => env.DB.prepare(`UPDATE push_intents SET status=?, sent_at=?, updated_at=?, retry_at=?, last_error=?, lease_token=NULL, lease_until=NULL
      WHERE device_id=? AND intent_key=? AND event_generation=? AND lease_token=?`).bind(
      success ? 'sent' : invalid || row.attempt_count >= 6 ? 'canceled' : 'scheduled', success ? now : null, now,
      now + Math.min(3600000, 60000 * 2 ** row.attempt_count), success ? null : delivery.errorCode ?? 'PUSH_SEND_EXCEPTION',
      id, row.intent_key, row.event_generation, token)));
    // Persist the provider cause before invalidation revokes pending leases.
    if (invalid) await invalidate(env, id, now, device.subscription_json);
  }
  // Daily cleanup; sent tombstones are deliberately retained to dedupe old ranks.
  if (new Date(now).getUTCHours() === 0 && new Date(now).getUTCMinutes() === 0) {
    await env.DB.prepare("DELETE FROM push_intents WHERE status='canceled' AND updated_at<?").bind(now - 30 * 86400000).run();
  }
}

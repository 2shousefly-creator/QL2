import type { Env, Intent, IntentRow, Device } from './types';
import { payload, send } from './push';
export async function snapshot(env: Env, id: string, intents: Intent[], now: number) {
  // A D1 batch is a transaction. Retain sent tombstones even if an intent disappears.
  const keys = intents.map(i => i.key);
  const statements = [env.DB.prepare(`UPDATE push_intents SET status='canceled', lease_token=NULL, lease_until=NULL, updated_at=?
    WHERE device_id=? AND status NOT IN ('sent','canceled') ${keys.length ? `AND intent_key NOT IN (${keys.map(() => '?').join(',')})` : ''}`).bind(now, id, ...keys)];
  for (const i of intents) statements.push(env.DB.prepare(`
    INSERT INTO push_intents(device_id,intent_key,type,event_generation,due_at,status,created_at,updated_at,retry_at)
    VALUES(?,?,?,?,?,'scheduled',?,?,?)
    ON CONFLICT(device_id,intent_key) DO UPDATE SET
      type=excluded.type, event_generation=excluded.event_generation, due_at=excluded.due_at,
      status=CASE WHEN push_intents.event_generation=excluded.event_generation AND (push_intents.status='sent' OR (push_intents.status='sending' AND ABS(push_intents.due_at-excluded.due_at)<30000) OR (push_intents.status='canceled' AND push_intents.attempt_count>=6)) THEN push_intents.status ELSE 'scheduled' END,
      attempt_count=CASE WHEN push_intents.event_generation=excluded.event_generation THEN push_intents.attempt_count ELSE 0 END,
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
export async function invalidate(env: Env, id: string, now: number, expectedSubscription?: string) {
  await env.DB.batch([
    env.DB.prepare('UPDATE push_devices SET enabled=0, invalidated_at=?, updated_at=? WHERE device_id=? AND (? IS NULL OR subscription_json=?)').bind(now, now, id, expectedSubscription ?? null, expectedSubscription ?? null),
    env.DB.prepare("UPDATE push_intents SET status='canceled', lease_token=NULL, lease_until=NULL, updated_at=? WHERE device_id=? AND status!='sent' AND EXISTS (SELECT 1 FROM push_devices WHERE device_id=? AND enabled=0 AND invalidated_at=?)").bind(now, id, id, now),
  ]);
}
export async function deliverDue(env: Env, now: number) {
  if (env.PUSH_ENABLED !== 'true') return;
  await env.DB.prepare("UPDATE push_intents SET status=CASE WHEN attempt_count>=6 THEN 'canceled' ELSE 'scheduled' END, lease_token=NULL, lease_until=NULL WHERE status='sending' AND lease_until<=?").bind(now).run();
  // Limit the whole cron to 8 sends; leases cover this bounded sequential workload.
  const token = crypto.randomUUID();
  const claimed = await env.DB.prepare(`UPDATE push_intents SET status='sending', lease_token=?, lease_until=?, last_attempt_at=?, attempt_count=attempt_count+1
    WHERE rowid IN (SELECT rowid FROM push_intents WHERE status='scheduled' AND retry_at<=? AND due_at<=? ORDER BY retry_at LIMIT 8)
    AND status='scheduled' RETURNING *`).bind(token, now + 900000, now, now, now).all<IntentRow>();
  const groups = new Map<string, IntentRow[]>();
  for (const row of claimed.results) {
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
    let status = 0;
    try { status = await send(env, JSON.parse(device.subscription_json), payload(live[0].type, live)); } catch { /* Never log subscription or provider errors. */ }
    if (status === 404 || status === 410) { await invalidate(env, id, now, device.subscription_json); continue; }
    const success = status >= 200 && status < 300;
    await env.DB.batch(live.map(row => env.DB.prepare(`UPDATE push_intents SET status=?, sent_at=?, updated_at=?, retry_at=?, last_error=?, lease_token=NULL, lease_until=NULL
      WHERE device_id=? AND intent_key=? AND event_generation=? AND lease_token=?`).bind(
      success ? 'sent' : row.attempt_count >= 6 ? 'canceled' : 'scheduled', success ? now : null, now,
      now + Math.min(3600000, 60000 * 2 ** row.attempt_count), success ? null : `HTTP_${status}`,
      id, row.intent_key, row.event_generation, token)));
  }
  // Daily cleanup; sent tombstones are deliberately retained to dedupe old ranks.
  if (new Date(now).getUTCHours() === 0 && new Date(now).getUTCMinutes() === 0) {
    await env.DB.prepare("DELETE FROM push_intents WHERE status='canceled' AND updated_at<?").bind(now - 30 * 86400000).run();
  }
}

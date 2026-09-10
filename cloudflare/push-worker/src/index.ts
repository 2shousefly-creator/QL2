import type { ScheduledController } from '@cloudflare/workers-types';
import type { Env, Intent, Subscription } from './types';
import { authenticate, hash, identity } from './auth';
import { cors } from './cors';
import { deliverDue, invalidate, snapshot, scheduleDiagnostic } from './db';
import { payload, send } from './push';

function bad(): never { throw new Response('Invalid request', { status: 400 }); }
async function body(request: Request) {
  // Bound the stream itself, not just the untrusted Content-Length header.
  const reader = request.body?.getReader();
  if (!reader) return {};
  let text = ''; let size = 0;
  const decoder = new TextDecoder();
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    size += next.value.byteLength;
    if (size > 16384) { await reader.cancel(); throw new Response('Too large', { status: 413 }); }
    text += decoder.decode(next.value, { stream: true });
  }
  try { return JSON.parse(text + decoder.decode()); } catch { return bad(); }
}
function subscription(value: any): Subscription {
  if (!value || typeof value.endpoint !== 'string' || value.endpoint.length > 4096) bad();
  let url: URL;
  try { url = new URL(value.endpoint); } catch { return bad(); }
  // Do not let registration turn the Worker into an arbitrary HTTP sender.
  const host = url.hostname;
  if (url.protocol !== 'https:' || url.port || url.username || url.password || url.hash ||
      !(host === 'fcm.googleapis.com' || host === 'updates.push.services.mozilla.com' ||
        host === 'web.push.apple.com' || host.endsWith('.notify.windows.com'))) bad();
  const keys = value.keys;
  if (!keys || !/^[A-Za-z0-9_-]{87}$/.test(keys.p256dh) || !/^[A-Za-z0-9_-]{22}$/.test(keys.auth)) bad();
  return { endpoint: value.endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
}
function intents(value: any, now: number): Intent[] {
  if (!value || typeof value.snapshotGeneration !== 'string' || !/^[a-f0-9-]{36}$/i.test(value.snapshotGeneration) || !Array.isArray(value.intents) || value.intents.length > 16) bad();
  const seen = new Set<string>();
  return value.intents.map((i: any) => {
    if (!i || !['xp_ready', 'crop_ready', 'feed_empty'].includes(i.type) ||
        typeof i.key !== 'string' || typeof i.eventGeneration !== 'string' ||
        i.eventGeneration.length < 1 || i.eventGeneration.length > 160 ||
        !/^[\w:.-]+$/.test(i.eventGeneration) || seen.has(i.key) ||
        !Number.isSafeInteger(i.dueAtEpochMs) || i.dueAtEpochMs < now - 86400000 || i.dueAtEpochMs > now + 100 * 366 * 86400000 ||
        Object.keys(i).some(k => !['key', 'type', 'eventGeneration', 'dueAtEpochMs', 'meta'].includes(k))) bad();
    if (i.type === 'xp_ready' && (!/^xp-ready:\d{1,4}$/.test(i.key) || i.eventGeneration !== `rank:${i.key.split(':')[1]}`)) bad();
    if (i.type === 'crop_ready' && (!/^crop-ready:\d{1,2}$/.test(i.key) || !i.eventGeneration.startsWith(`plot:${i.key.split(':')[1]}:`))) bad();
    if (i.type === 'feed_empty' && i.key !== 'feed-empty') bad();
    if (i.meta !== undefined && (!i.meta || Array.isArray(i.meta) || typeof i.meta !== 'object' || Object.keys(i.meta).some(k => !['currentRankName','nextRankName','rankIndex','plotIndex'].includes(k)) || JSON.stringify(i.meta).length > 512)) bad();
    seen.add(i.key);
    return { key: i.key, type: i.type, eventGeneration: i.eventGeneration, dueAtEpochMs: i.dueAtEpochMs };
  });
}
async function route(request: Request, env: Env): Promise<Response> {
  const path = new URL(request.url).pathname;
  const method = request.method;
  const json = (data: unknown, status = 200) => Response.json(data, { status });
  if (method === 'GET' && path === '/api/v2/push/health') {
    await env.DB.prepare('SELECT 1 FROM push_devices LIMIT 1').first();
    return json({ online: true, enabled: env.PUSH_ENABLED === 'true' && !!env.VAPID_PRIVATE_KEY && !!env.VAPID_PUBLIC_KEY });
  }
  if (env.PUSH_ENABLED !== 'true' || !env.VAPID_PRIVATE_KEY || !env.VAPID_PUBLIC_KEY) return json({ enabled: false }, 503);
  if (method === 'GET' && path === '/api/v2/push/vapid-public-key') return json({ publicKey: env.VAPID_PUBLIC_KEY, fingerprint: await hash(env.VAPID_PUBLIC_KEY) });
  const { id, secretHash } = await identity(request);
  const now = Date.now();
  if (method === 'POST' && path === '/api/v2/push/register') {
    const data = await body(request);
    const sub = subscription(data.subscription);
    const fingerprint = await hash(env.VAPID_PUBLIC_KEY);
    if (data.fingerprint !== fingerprint) bad();
    const existing = await env.DB.prepare('SELECT device_secret_hash FROM push_devices WHERE device_id=?').bind(id).first<{device_secret_hash: string}>();
    if (existing && existing.device_secret_hash !== secretHash) return json({ error: 'AUTH_MISMATCH' }, 401);
    const endpointHash = await hash(sub.endpoint);
    const owner = await env.DB.prepare('SELECT device_id FROM push_devices WHERE endpoint_hash=?').bind(endpointHash).first<{device_id: string}>();
    // Endpoint knowledge alone is not proof of ownership. Ask client to rotate the
    // subscription, obtaining a new endpoint, rather than steal the old device.
    if (owner && owner.device_id !== id) return json({ error: 'RESUBSCRIBE' }, 409);
    const registration = await env.DB.prepare(`INSERT INTO push_devices(device_id,device_secret_hash,endpoint_hash,subscription_json,vapid_fingerprint,created_at,updated_at,last_seen_at)
      VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(device_id) DO UPDATE SET endpoint_hash=excluded.endpoint_hash,
      subscription_json=excluded.subscription_json,vapid_fingerprint=excluded.vapid_fingerprint,
      enabled=1,invalidated_at=NULL,updated_at=excluded.updated_at,last_seen_at=excluded.last_seen_at
      WHERE push_devices.device_secret_hash=excluded.device_secret_hash`).bind(id, secretHash, endpointHash, JSON.stringify(sub), fingerprint, now, now, now).run();
    if (!registration.meta.changes) return json({ error: 'AUTH_MISMATCH' }, 401);
    return json({ registered: true });
  }
  const device = await authenticate(env, id, secretHash);
  if (method === 'POST' && path === '/api/v2/push/disable') {
    await invalidate(env, id, now); return json({ enabled: false });
  }
  if (method === 'GET' && path === '/api/v2/push/status') {
    const rows = await env.DB.prepare("SELECT intent_key,type,due_at,status FROM push_intents WHERE device_id=? ORDER BY CASE WHEN intent_key='diagnostic-test' THEN 0 ELSE 1 END, due_at LIMIT 17").bind(id).all();
    return json({ online: true, enabled: !!device.enabled, registered: !device.invalidated_at, intents: rows.results });
  }
  if (!device.enabled || device.invalidated_at) return json({ error: 'RESUBSCRIBE' }, 410);
  if (method === 'PUT' && path === '/api/v2/push/intents') {
    await snapshot(env, id, intents(await body(request), now), now); return json({ success: true });
  }
  if (method === 'POST' && path === '/api/v2/push/test/schedule') {
    const data = await body(request);
    if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length !== 0 || new URL(request.url).search) bad();
    // Validate stored subscription too; this endpoint only writes D1, never sends.
    subscription(JSON.parse(device.subscription_json));
    const scheduledAt = Date.now();
    if (!(await scheduleDiagnostic(env, id, scheduledAt))) return json({ success: false, message: 'Vui lòng chờ 30 giây và kiểm tra trạng thái thông báo.' }, 429);
    return json({ success: true, dueAtEpochMs: scheduledAt + 60000,
      message: 'Đã lên lịch kiểm tra. Hãy đóng Quân Lộ ngay. Thông báo dự kiến đến trong khoảng 1–2 phút.' });
  }
  if (method === 'POST' && path === '/api/v2/push/test') {
    const result = await env.DB.prepare('UPDATE push_devices SET last_test_at=? WHERE device_id=? AND last_test_at<=?').bind(now, id, now - 30000).run();
    if (!result.meta.changes) return json({ success: false, message: 'Vui lòng chờ 30 giây.' }, 429);
    let status = 0;
    try { status = await send(env, JSON.parse(device.subscription_json), payload('test')); } catch { /* No provider logs. */ }
    if (status === 404 || status === 410) await invalidate(env, id, now, device.subscription_json);
    return json({ success: status >= 200 && status < 300 }, status >= 200 && status < 300 ? 200 : 502);
  }
  return new Response('Not found', { status: 404 });
}
export default {
  async fetch(request: Request, env: Env) {
    let headers: Headers;
    try { headers = cors(request); } catch (error) { return error as Response; }
    let response: Response;
    try { response = request.method === 'OPTIONS' ? new Response(null, { status: 204 }) : await route(request, env); }
    catch (error) { response = error instanceof Response ? error : new Response('Service unavailable', { status: 503 }); }
    headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  },
  async scheduled(event: ScheduledController, env: Env) { await deliverDue(env, event.scheduledTime); },
};

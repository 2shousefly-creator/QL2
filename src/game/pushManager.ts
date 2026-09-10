import type { GameState } from './types';
import { PUSH_API_BASE_URL, serverPushEnabled, serverPushUnavailableMessage } from './webDeployment';
import { derivePushIntents, samePushIntents, type PushIntent } from './pushIntents';
export { PUSH_API_BASE_URL } from './webDeployment';
export { calculateXpFullNotificationDueAt } from './pushIntents';
const IDENTITY_KEY = 'quan-lo-push-device-v2';
const MARKER_KEY = 'quan-lo-push-backend-v2';
type Identity = { deviceId: string; deviceSecret: string; version: 2 };
function identity(reset = false): Identity {
  if (!reset) {
    try {
      const saved = JSON.parse(localStorage.getItem(IDENTITY_KEY) || 'null');
      if (saved?.version === 2 && /^[a-f0-9-]{36}$/i.test(saved.deviceId) && /^[\w-]{43}$/.test(saved.deviceSecret)) return saved;
    } catch { /* Replace malformed identity only. */ }
  }
  const deviceSecret = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const value: Identity = { deviceId: crypto.randomUUID(), deviceSecret, version: 2 };
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(value));
  return value;
}
export function getDevicePushId(): string { try { return identity().deviceId; } catch { return ''; } }
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
function bytes(key: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(key.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - key.length % 4) % 4)), c => c.charCodeAt(0));
}
async function request(path: string, method = 'GET', data?: unknown, keepalive = false) {
  const device = identity();
  return fetch(`${PUSH_API_BASE_URL}/api/v2/push/${path}`, {
    method, headers: { 'Content-Type': 'application/json', 'X-QL-Device-Id': device.deviceId, 'X-QL-Device-Secret': device.deviceSecret },
    body: data === undefined ? undefined : JSON.stringify(data), keepalive, cache: 'no-store', signal: AbortSignal.timeout(15000),
  });
}
async function vapid() {
  if (!serverPushEnabled) return null;
  const response = await fetch(`${PUSH_API_BASE_URL}/api/v2/push/vapid-public-key`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!response.ok) return null;
  const data = await response.json();
  return typeof data.publicKey === 'string' && /^[\w-]{87}$/.test(data.publicKey) && /^[a-f0-9]{64}$/.test(data.fingerprint) ? data as { publicKey: string; fingerprint: string } : null;
}
export async function getVapidPublicKey(): Promise<string | null> { try { return (await vapid())?.publicKey ?? null; } catch { return null; } }
let registering: Promise<boolean> | null = null;
let registered = false;
let lastSuccessful: PushIntent[] | null = null;
let lastSuccessAt = 0;
let disabledKnown = false;
export function isPushSnapshotSynced(state: GameState): boolean {
  return registered && samePushIntents(lastSuccessful, derivePushIntents(state));
}
async function register(): Promise<boolean> {
  if (!serverPushEnabled || !isPushSupported() || Notification.permission !== 'granted') return false;
  try {
    const config = await vapid();
    if (!config) return false;
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SW unavailable')), 15000)),
    ]);
    let sub = await registration.pushManager.getSubscription();
    const marker = `${PUSH_API_BASE_URL}:${config.fingerprint}`;
    const key = bytes(config.publicKey);
    const oldKey = sub?.options.applicationServerKey;
    const differs = oldKey && (oldKey.byteLength !== key.length || new Uint8Array(oldKey).some((v, i) => v !== key[i]));
    if (sub && (localStorage.getItem(MARKER_KEY) !== marker || differs || (sub.expirationTime !== null && sub.expirationTime <= Date.now()))) {
      await sub.unsubscribe(); sub = null;
    }
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!sub) sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      const response = await request('register', 'POST', { subscription: sub.toJSON(), fingerprint: config.fingerprint });
      if (response.ok) {
        localStorage.setItem(MARKER_KEY, marker);
        registered = true; disabledKnown = false; lastSuccessful = null;
        return true;
      }
      if (attempt === 0 && (response.status === 401 || response.status === 409)) {
        if (response.status === 401) identity(true);
        await sub.unsubscribe(); sub = null;
      } else break;
    }
  } catch { /* Push must never interrupt game/save. */ }
  registered = false;
  return false;
}
export function subscribeAndRegisterWebPush(): Promise<boolean> {
  if (!registering) registering = register().finally(() => { registering = null; });
  return registering;
}
export const ensurePushRegistration = subscribeAndRegisterWebPush;
let pending: { state: GameState; force: boolean } | null = null;
let syncing: Promise<void> | null = null;
let nextRetryAt = 0;
async function sync(state: GameState, force: boolean) {
  if (!serverPushEnabled || !isPushSupported()) return;
  if (!force && Date.now() < nextRetryAt) return;
  try {
    if (!state.settings.notificationsEnabled || Notification.permission !== 'granted') {
      if (disabledKnown && !force) return;
      const response = await request('disable', 'POST', {}, true);
      if (response.ok || response.status === 404) { registered = false; lastSuccessful = []; disabledKnown = true; }
      else nextRetryAt = Date.now() + 60000;
      return;
    }
    const intents = derivePushIntents(state);
    if (!force && registered && samePushIntents(lastSuccessful, intents) && Date.now() - lastSuccessAt < 300000) return;
    if (!registered && !(await subscribeAndRegisterWebPush())) { nextRetryAt = Date.now() + 60000; return; }
    let response = await request('intents', 'PUT', { snapshotGeneration: crypto.randomUUID(), intents }, true);
    if ([401, 404, 410].includes(response.status)) {
      registered = false;
      if (response.status === 410) {
        const reg = await navigator.serviceWorker.getRegistration();
        await (await reg?.pushManager.getSubscription())?.unsubscribe();
      }
      if (await subscribeAndRegisterWebPush()) response = await request('intents', 'PUT', { snapshotGeneration: crypto.randomUUID(), intents }, true);
    }
    if (response.ok) { lastSuccessful = intents; lastSuccessAt = Date.now(); nextRetryAt = 0; }
    else nextRetryAt = Date.now() + 60000;
  } catch { nextRetryAt = Date.now() + 60000; }
}
// Keep only the newest pending snapshot, serialize writes, and never lose a
// toggle/action that occurs while an earlier registration or sync is in flight.
export function syncPushIntents(state: GameState, force = false): Promise<void> {
  pending = { state, force: force || !!pending?.force };
  if (!syncing) syncing = (async () => {
    while (pending) { const current = pending; pending = null; await sync(current.state, current.force); }
  })().finally(() => { syncing = null; });
  return syncing;
}
// Existing callers now use the authoritative three-event snapshot.
export const syncXpFullPushSchedule = syncPushIntents;
export async function sendTestServerPush(): Promise<{ success: boolean; message: string }> {
  if (!serverPushEnabled) return { success: false, message: serverPushUnavailableMessage };
  try {
    if (!registered && !(await subscribeAndRegisterWebPush())) return { success: false, message: 'Chưa đăng ký được thông báo đẩy.' };
    const response = await request('test', 'POST', {});
    if (response.ok) return { success: true, message: 'Máy chủ đã gửi thông báo thử.' };
    if (response.status === 429) return { success: false, message: 'Vui lòng chờ 30 giây trước khi thử lại.' };
    const data = await response.json().catch(() => null);
    const code = typeof data?.errorCode === 'string' && /^(PUSH_PROVIDER_(?:[34][0-9]{2}|5XX)|PUSH_SEND_EXCEPTION)$/.test(data.errorCode) ? data.errorCode : null;
    const reason = code === 'PUSH_PROVIDER_403' ? 'Nhà cung cấp từ chối yêu cầu.'
      : code === 'PUSH_PROVIDER_404' || code === 'PUSH_PROVIDER_410' ? 'Subscription không còn hợp lệ.'
      : code === 'PUSH_PROVIDER_5XX' ? 'Nhà cung cấp đang gặp lỗi máy chủ.'
      : code === 'PUSH_SEND_EXCEPTION' ? 'Lỗi khi gửi; chưa nhận được trạng thái hợp lệ từ nhà cung cấp.'
      : 'Nhà cung cấp trả lỗi.';
    return { success: false, message: code ? `${code}: ${reason}` : `Không gửi được thông báo thử (HTTP ${response.status}).` };
  } catch { return { success: false, message: 'Không kết nối được máy chủ thông báo.' }; }
}
export async function scheduleTestServerPush(): Promise<{ success: boolean; message: string; dueAtEpochMs?: number }> {
  if (!serverPushEnabled) return { success: false, message: serverPushUnavailableMessage };
  if (!isPushSupported()) return { success: false, message: 'Thiết bị chưa hỗ trợ Web Push.' };
  if (Notification.permission !== 'granted') return { success: false, message: 'Hãy cho phép thông báo trong cài đặt trang web trước khi lên lịch.' };
  try {
    // Reconcile a missing/expired browser subscription before scheduling.
    if (!(await subscribeAndRegisterWebPush())) return { success: false, message: 'Chưa đăng ký được thông báo đẩy. Vui lòng thử lại khi có kết nối.' };
    let response = await request('test/schedule', 'POST', {});
    if ([401, 404, 410].includes(response.status)) {
      registered = false;
      if (response.status === 410) {
        const reg = await navigator.serviceWorker.getRegistration();
        await (await reg?.pushManager.getSubscription())?.unsubscribe();
      }
      if (await subscribeAndRegisterWebPush()) response = await request('test/schedule', 'POST', {});
    }
    if (response.status === 429) return { success: false, message: 'Vui lòng chờ 30 giây trước khi lên lịch lại.' };
    if (!response.ok) return { success: false, message: 'Chưa lên lịch được thông báo. Vui lòng kiểm tra kết nối và thử lại.' };
    const data = await response.json();
    if (data.success !== true || !Number.isSafeInteger(data.dueAtEpochMs)) return { success: false, message: 'Chưa xác nhận được lịch từ máy chủ.' };
    return { success: true, dueAtEpochMs: data.dueAtEpochMs,
      message: 'Đã lên lịch kiểm tra. Hãy đóng Quân Lộ ngay. Thông báo dự kiến đến trong khoảng 1–2 phút.' };
  } catch { return { success: false, message: 'Không xác nhận được lịch do mất kết nối. Hãy xem Chẩn Đoán Push trước khi lên lịch lại.' }; }
}

export async function fetchPushDiagnosticStatus(): Promise<any> {
  if (!serverPushEnabled) return { online: false, registered: false, enabled: false, message: serverPushUnavailableMessage };
  try {
    const health = await fetch(`${PUSH_API_BASE_URL}/api/v2/push/health`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const response = await request('status');
    return response.ok ? await response.json() : { online: health.ok, registered: false };
  } catch { return { online: false, registered: false }; }
}

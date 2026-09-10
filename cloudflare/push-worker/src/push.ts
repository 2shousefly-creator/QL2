import webpush from 'web-push';
import type { Env, Subscription, IntentRow } from './types';
export function payload(type: IntentRow['type'] | 'test', rows: IntentRow[] = []) {
  const rankIndex = Number(rows[0]?.intent_key.split(':')[1]) || 0;
  const copy = {
    xp_ready: ['🎖️ Sẵn sàng thăng cấp!', 'Bạn đã tích lũy đủ XP. Hãy quay lại Quân Lộ để xét thăng cấp.', 'xp-ready', `quan-lo-xp-ready-${rankIndex}`],
    crop_ready: ['🌾 Tăng Gia: Có thể thu hoạch', rows.length > 1 ? `Có ${rows.length} luống cây đã sẵn sàng thu hoạch.` : 'Một luống cây đã sẵn sàng thu hoạch.', 'crop-ready', 'quan-lo-crop-ready'],
    feed_empty: ['🐓 Tăng Gia: Máng ăn đã hết', 'Vật nuôi đang cần thêm thức ăn. Hãy quay lại Tăng Gia.', 'feed-empty', 'quan-lo-feed-empty'],
    test: ['🔔 Kiểm tra thông báo Quân Lộ', 'Thông báo đẩy từ máy chủ đã đến thiết bị.', 'test', 'quan-lo-push-test'],
  }[type];
  return { type, title: copy[0], body: copy[1], destination: copy[2], tag: copy[3], rankIndex };
}
export async function send(env: Env, subscription: Subscription, data: ReturnType<typeof payload>) {
  // Use web-push for standard encryption/VAPID, fetch for Workers transport.
  const details = webpush.generateRequestDetails(subscription, JSON.stringify(data), {
    vapidDetails: { subject: env.VAPID_SUBJECT, publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY },
    TTL: 3600, urgency: 'normal',
  });
  const response = await fetch(details.endpoint, {
    method: 'POST', headers: details.headers as Record<string, string>,
    body: details.body as unknown as BodyInit, redirect: 'error', signal: AbortSignal.timeout(15000),
  });
  await response.body?.cancel();
  return response.status;
}

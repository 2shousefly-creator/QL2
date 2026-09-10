import webpush from 'web-push';
import type { Env, Subscription, IntentRow } from './types';
export function payload(type: IntentRow['type'] | 'test', rows: IntentRow[] = []) {
  if (type === 'test' && rows.some(row => row.intent_key === 'diagnostic-test')) return {
    type, title: '🔔 Kiểm tra Web Push nền',
    body: 'QL2 vẫn nhận được thông báo khi ứng dụng đã đóng. Hệ thống Web Push nền đang hoạt động.',
    destination: 'test', tag: 'quan-lo-push-scheduled-test', rankIndex: 0,
  };
  const rankIndex = Number(rows[0]?.intent_key.split(':')[1]) || 0;
  const copy = {
    xp_ready: ['🎖️ Sẵn sàng thăng cấp!', 'Bạn đã tích lũy đủ XP. Hãy quay lại Quân Lộ để xét thăng cấp.', 'xp-ready', `quan-lo-xp-ready-${rankIndex}`],
    crop_ready: ['🌾 Tăng Gia: Có thể thu hoạch', rows.length > 1 ? `Có ${rows.length} luống cây đã sẵn sàng thu hoạch.` : 'Một luống cây đã sẵn sàng thu hoạch.', 'crop-ready', 'quan-lo-crop-ready'],
    feed_empty: ['🐓 Tăng Gia: Máng ăn đã hết', 'Vật nuôi đang cần thêm thức ăn. Hãy quay lại Tăng Gia.', 'feed-empty', 'quan-lo-feed-empty'],
    test: ['🔔 Kiểm tra thông báo Quân Lộ', 'Thông báo đẩy từ máy chủ đã đến thiết bị.', 'test', 'quan-lo-push-test'],
  }[type];
  return { type, title: copy[0], body: copy[1], destination: copy[2], tag: copy[3], rankIndex };
}
export interface PushSendResult {
  statusCode: number;
  errorCode: string | null;
}
export function safePushFailure(error: unknown): PushSendResult {
  const status = error instanceof webpush.WebPushError ? error.statusCode : 0;
  const statusCode = Number.isInteger(status) && status >= 300 && status <= 599 ? status : 0;
  return {
    statusCode,
    errorCode: statusCode >= 500 ? 'PUSH_PROVIDER_5XX' : statusCode ? `PUSH_PROVIDER_${statusCode}` : 'PUSH_SEND_EXCEPTION',
  };
}
export async function send(env: Env, subscription: Subscription, data: ReturnType<typeof payload>): Promise<PushSendResult> {
  try {
    const response = await webpush.sendNotification(subscription, JSON.stringify(data), {
      vapidDetails: { subject: env.VAPID_SUBJECT, publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY },
      TTL: 3600, urgency: 'normal', timeout: 15000,
    });
    // Never return provider headers/body or retain the raw error outside here.
    return { statusCode: response.statusCode, errorCode: null };
  } catch (error) {
    return safePushFailure(error);
  }
}

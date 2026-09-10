// Live Worker: D1 migration and VAPID secret provisioned before enabling this URL.
export const PUSH_API_BASE_URL: string = 'https://ql2-push-api.quanlo-ql2.workers.dev';
export const serverPushEnabled = PUSH_API_BASE_URL.startsWith('https://');
export const serverPushUnavailableMessage = 'Thông báo nền chưa được bật: máy chủ Cloudflare đang chờ cấu hình.';

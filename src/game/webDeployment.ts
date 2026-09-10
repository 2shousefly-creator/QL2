// Set only after the Worker, D1 migration and VAPID secret are live.
// Empty is an intentional production gate, never a placeholder endpoint.
export const PUSH_API_BASE_URL: string = '';
export const serverPushEnabled = PUSH_API_BASE_URL.startsWith('https://');
export const serverPushUnavailableMessage = 'Thông báo nền chưa được bật: máy chủ Cloudflare đang chờ cấu hình.';

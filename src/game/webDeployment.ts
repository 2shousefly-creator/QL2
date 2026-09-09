declare const __WEB_PRODUCTION__: boolean;
// Existing dev/legacy builds retain their exact Push endpoint and enabled behavior.
export const serverPushEnabled = typeof __WEB_PRODUCTION__ === 'undefined' || !__WEB_PRODUCTION__;
export const serverPushUnavailableMessage = 'Thông báo nền máy chủ chưa được bật trên website mới. Thông báo local vẫn dùng được khi trình duyệt hỗ trợ.';

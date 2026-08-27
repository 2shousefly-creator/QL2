const CACHE_NAME = 'quan-lo-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Do NOT auto skipWaiting on install. Wait for user consent message SKIP_WAITING.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // NEVER cache connectivity check or version.json requests!
  if (url.pathname.includes('connectivity-check.txt') || url.pathname.includes('version.json') || url.pathname.includes('/api/')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // For HTML / Navigation requests: Network-First strategy
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For static assets: Network-First strategy with Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// --- Server-Pushed Notification Event Listener (Wakes up SW when app is closed) ---
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received from server!');
  
  let payload = {
    title: '🎖️ Sẵn sàng Thăng Cấp Bậc!',
    body: 'Bạn đã tích lũy đủ XP. Hãy quay lại Quân Lộ để thực hiện thử thách thăng cấp.',
    tag: 'quan-lo-xp-full',
    url: '/'
  };

  if (event.data) {
    try {
      const json = event.data.json();
      if (json) {
        payload = { ...payload, ...json };
      }
    } catch (err) {
      payload.body = event.data.text() || payload.body;
    }
  }

  const title = payload.title || '🎖️ Sẵn sàng Thăng Cấp Bậc!';
  const options = {
    body: payload.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.tag || 'quan-lo-xp-full',
    renotify: true,
    vibrate: [200, 100, 200, 100, 300],
    data: {
      url: payload.url || '/',
      generation: payload.generation,
      type: payload.type || 'xp_full',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// --- Handle Notification Click ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle client messages
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

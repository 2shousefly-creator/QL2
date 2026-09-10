const CACHE_NAME = 'quan-lo-v6';
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

  // Only content-hashed build assets use on-demand Cache-First.
  // Stable public sprites retain Network-First so updates can refresh them.
  if (url.origin === self.location.origin && event.request.method === 'GET' && url.pathname.startsWith('/build-assets/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      // Hosting rewrites missing chunks to HTML; never cache that as a build asset.
      if (response.ok && !response.headers.get('content-type')?.includes('text/html')) {
        await cache.put(event.request, response.clone());
      }
      return response;
    })());
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

// Server-originated push wakes the service worker; no local scheduler.
const pushDestinations = { xp_ready: 'xp-ready', crop_ready: 'crop-ready', feed_empty: 'feed-empty', test: 'test' };
self.addEventListener('push', (event) => {
  let payload;
  try { payload = event.data?.json(); } catch { return; }
  if (!payload || !Object.hasOwn(pushDestinations, payload.type) || typeof payload.title !== 'string' || typeof payload.body !== 'string') return;
  const destination = pushDestinations[payload.type];
  const rankIndex = Number.isInteger(payload.rankIndex) ? payload.rankIndex : 0;
  const tag = { xp_ready: `quan-lo-xp-ready-${rankIndex}`, crop_ready: 'quan-lo-crop-ready', feed_empty: 'quan-lo-feed-empty', test: 'quan-lo-push-test' }[payload.type];
  payload = { type: payload.type, title: payload.title.slice(0, 160), body: payload.body.slice(0, 1000), destination, rankIndex, tag };
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const visible = windows.find(client => new URL(client.url).origin === self.location.origin && client.visibilityState === 'visible');
    if (visible) {
      const handled = await new Promise(resolve => {
        const channel = new MessageChannel();
        const finish = value => { clearTimeout(timeout); channel.port1.close(); resolve(value); };
        const timeout = setTimeout(() => finish(false), 1500);
        channel.port1.onmessage = event => finish(event.data === 'handled');
        visible.postMessage({ type: 'QL2_PUSH_EVENT', payload }, [channel.port2]);
      });
      if (handled) return;
    }
    await self.registration.showNotification(payload.title, {
      body: payload.body, icon: '/favicon.ico', badge: '/favicon.ico', tag,
      data: { destination },
    });
  })());
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const requested = event.notification.data?.destination;
  const destination = Object.values(pushDestinations).includes(requested) ? requested : 'xp-ready';
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = windows.find(client => new URL(client.url).origin === self.location.origin);
    if (client) {
      await client.focus();
      client.postMessage({ type: 'QL2_PUSH_NAVIGATE', destination });
    } else await self.clients.openWindow('/?push=' + destination);
  })());
});

// Handle client messages
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

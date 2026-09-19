/**
 * Pranayama Timer - Progressive Web App Service Worker
 * Versioned Cache-Busting Strategy:
 * - Network-First for navigation (index.html) to prevent stale bundle locks on deploy
 * - Cache-First / Stale-While-Revalidate for hashed static assets, audio, fonts, and icons
 * - Automatic old cache deletion on 'activate'
 * - Web Push notification handler for background session reminders (D20)
 */

const CACHE_VERSION = 'v1.0.2';
const CACHE_NAME = `pranayama-pwa-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon-32.png',
];

// Install: pre-cache shell and skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Pre-cache error:', err);
      })
  );
});

// Activate: clean up any old cache versions and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key.startsWith('pranayama-pwa-') && key !== CACHE_NAME)
            .map((key) => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-First for HTML navigation, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests and API requests
  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }

  const url = new URL(request.url);

  // 1. Navigation requests (HTML page): Network-First
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. Static assets (JS, CSS, audio, images, fonts): Stale-While-Revalidate
  if (
    url.origin === self.location.origin ||
    url.pathname.includes('/_expo/static/') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ttf')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// Push: Display informational Web Push notification (D20)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Pranayama breathing session update',
      icon: '/icon-192.png',
      badge: '/favicon-32.png',
      tag: 'pranayama-session-progress',
      renotify: true,
      data: { url: (data.data && data.data.url) || '/' },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || '🧘 Pranayama Practice', options)
    );
  } catch (err) {
    console.error('[SW] Error parsing push data:', err);
  }
});

// Notification Click: Focus or open the app window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

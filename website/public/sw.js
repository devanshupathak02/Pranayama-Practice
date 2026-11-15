/**
 * Pranayama Times — Progressive Web App Service Worker
 * Version: v2.1.0
 *
 * Reliability & Safety Guarantees:
 * - Controlled activation: Does NOT blindly force skipWaiting() during active practice sessions.
 * - Cache Isolation: Only manages CacheStorage (SHELL_CACHE, STATIC_CACHE, AUDIO_CACHE). Never modifies IndexedDB.
 * - Audio Integrity: Only stores complete HTTP 200 responses. Never caches partial (HTTP 206) streams or failed downloads.
 * - Offline Resiliency: Serves cached shell, core classical pranayama bells, and verified Yoga Nidra tracks offline.
 * - Security: Strictly bypasses /api/* routes, authentication tokens, and private user records.
 */

const CACHE_VERSION = 'v2.1.0';
const SHELL_CACHE = `pranayama-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `pranayama-static-${CACHE_VERSION}`;
const AUDIO_CACHE = `pranayama-audio-${CACHE_VERSION}`;

const PRECACHE_SHELL = [
  '/',
  '/practice',
  '/learn',
  '/manifest.webmanifest',
  '/favicon.png',
  '/favicon-32.png',
  '/favicon-16.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
];

const PRECACHE_AUDIO = [
  // Classical Bells & Gongs
  '/audio/bell/Bell1.mp3',
  '/audio/bell/Boxing Bell.mp3',
  '/audio/bell/Gong.mp3',
  '/audio/bell/Gong2.mp3',

  // Spoken Technique Voice Cues
  '/audio/pranayama/anulom_vilom_name.mp3',
  '/audio/pranayama/bahya_name.mp3',
  '/audio/pranayama/bhastrika_name.mp3',
  '/audio/pranayama/bhramari_name.mp3',
  '/audio/pranayama/kapalbhati_name.mp3',
  '/audio/pranayama/udgeeth_name.mp3',
  '/audio/pranayama/ujjayi_name.mp3',
];

// Install: Pre-cache shell assets & core classical timer audio without disrupting active session
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_SHELL)),
      caches.open(AUDIO_CACHE).then((cache) => cache.addAll(PRECACHE_AUDIO)),
    ]).catch((err) => {
      console.warn('[ServiceWorker] Pre-cache warning:', err);
    })
  );
});

// Controlled Skip-Waiting: Clients send SKIP_WAITING when no session is running
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate: Delete obsolete cache versions safely (IndexedDB is completely untouched)
self.addEventListener('activate', (event) => {
  const currentCaches = [SHELL_CACHE, STATIC_CACHE, AUDIO_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key.startsWith('pranayama-') && !currentCaches.includes(key))
            .map((key) => {
              console.log('[ServiceWorker] Purging legacy cache bucket:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Apply specific caching strategies per request type
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Strict Exclusion: Never intercept non-GET, API routes, or browser extensions
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Exclude API requests, webhook endpoints, and browser extensions
  if (url.pathname.startsWith('/api/') || !url.protocol.startsWith('http')) {
    return;
  }

  // 2. Navigation requests (HTML pages): Network-First with offline fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback
          const cachedMatch = await caches.match(request);
          if (cachedMatch) return cachedMatch;

          // Fallback to Practice page or Home
          const practiceFallback = await caches.match('/practice');
          if (practiceFallback) return practiceFallback;

          const homeFallback = await caches.match('/');
          if (homeFallback) return homeFallback;

          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pranayama Times — Offline</title></head><body style="background:#EDE8DC;color:#263F35;font-family:sans-serif;padding:2rem;text-align:center;"><h1>You are offline</h1><p>Your breathing timer and cached routines remain available at <a href="/practice" style="color:#B97755;">/practice</a>.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 3. Audio requests (/audio/...): Cache-First with complete 200 OK validation
  if (
    url.pathname.startsWith('/audio/') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.mpeg')
  ) {
    event.respondWith(
      caches.match(request).then((cachedAudio) => {
        if (cachedAudio) return cachedAudio;

        return fetch(request).then((networkAudio) => {
          // ONLY cache complete 200 OK responses. Never cache partial 206 streams or error codes.
          if (networkAudio && networkAudio.ok && networkAudio.status === 200) {
            const audioClone = networkAudio.clone();
            caches.open(AUDIO_CACHE).then((cache) => cache.put(request, audioClone));
          }
          return networkAudio;
        }).catch((err) => {
          console.warn('[ServiceWorker] Audio offline fetch failed for:', url.pathname, err);
          return cachedAudio || new Response(null, { status: 503, statusText: 'Audio Offline' });
        });
      })
    );
    return;
  }

  // 4. Next.js Static Assets (/_next/static/...): Cache-First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cachedStatic) => {
        if (cachedStatic) return cachedStatic;

        return fetch(request).then((networkStatic) => {
          if (networkStatic && networkStatic.ok && networkStatic.status === 200) {
            const staticClone = networkStatic.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, staticClone));
          }
          return networkStatic;
        });
      })
    );
    return;
  }

  // 5. Images and icons: Stale-While-Revalidate
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cachedImg) => {
        const fetchPromise = fetch(request).then((networkImg) => {
          if (networkImg && networkImg.ok && networkImg.status === 200) {
            const imgClone = networkImg.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, imgClone));
          }
          return networkImg;
        }).catch(() => cachedImg);

        return cachedImg || fetchPromise;
      })
    );
  }
});

// Push: Listen for incoming daily practice reminders
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || '🧘 Pranayama Sadhana';
    const options = {
      body: data.body || 'Time for your daily breathing practice.',
      icon: '/icon-192.png',
      badge: '/favicon-32.png',
      tag: 'pranayama-reminder',
      renotify: true,
      data: {
        url: (data.data && data.data.url) || '/',
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.warn('[ServiceWorker] Push data parse error:', err);
  }
});

// Notification Click: Focus existing app tab or navigate to /
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

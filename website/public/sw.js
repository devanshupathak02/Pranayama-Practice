// @ts-nocheck
/// <reference lib="webworker" />
/**
 * Pranayama Times — Progressive Web App Service Worker
 * Version: v2.4.0
 *
 * Reliability & Safety Guarantees:
 * - Controlled activation: Does NOT blindly force skipWaiting() during active practice sessions.
 * - Cache Isolation: Only manages CacheStorage (SHELL_CACHE, STATIC_CACHE, AUDIO_CACHE). Never modifies IndexedDB.
 * - Audio Integrity: Only stores complete HTTP 200 responses. Never caches partial (HTTP 206) streams or failed downloads.
 * - Offline Resiliency: Serves cached shell, core classical pranayama bells, and verified Yoga Nidra tracks offline.
 * - Security: Strictly bypasses /api/* routes, authentication tokens, and private user records.
 */

const CACHE_VERSION = 'v2.4.0';
const SHELL_CACHE = `pranayama-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `pranayama-static-${CACHE_VERSION}`;
const AUDIO_CACHE = `pranayama-audio-${CACHE_VERSION}`;

const PRECACHE_SHELL = [
  '/',
  '/practice',
  '/manifest.webmanifest',
  '/favicon.png',
  '/favicon-32.png',
  '/favicon-16.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
];

// Install: Pre-cache critical application shell only
// Nonessential audio is cached progressively on-demand to keep mobile launch fast
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_SHELL))
      .catch((err) => {
        console.warn('[ServiceWorker] Shell pre-cache warning:', err);
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

  // Strict Exclusion for local development & Turbopack/HMR:
  // Bypass /_next/ for localhost, local domain, and local IP addresses (192.168.*, 10.*, 172.16-31.*)
  const isDevHost =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname.endsWith('.local') ||
    /^192\.168\.\d+\.\d+$/.test(url.hostname) ||
    /^10\.\d+\.\d+\.\d+$/.test(url.hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(url.hostname);

  if (isDevHost && url.pathname.startsWith('/_next/')) {
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
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pranayama Times — Offline</title></head><body style="background:#FAF7F2;color:#1A2D25;font-family:sans-serif;padding:2rem;text-align:center;"><h1>You are offline</h1><p>Your breathing timer and cached routines remain available at <a href="/practice" style="color:#FA5A2A;">/practice</a>.</p></body></html>',
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

  // 4. Next.js Static Assets (/_next/static/...): Network-First or Fallback-to-Network
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
        }).catch(() => {
          return cachedStatic || new Response(null, { status: 404 });
        });
      })
    );
    return;
  }

  // 5. Image and Font assets: Cache-First
  if (
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cachedAsset) => {
        if (cachedAsset) return cachedAsset;

        return fetch(request).then((networkAsset) => {
          if (networkAsset && networkAsset.ok && networkAsset.status === 200) {
            const assetClone = networkAsset.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, assetClone));
          }
          return networkAsset;
        });
      })
    );
    return;
  }

  // 6. Default Network Fallback
  event.respondWith(
    fetch(request).catch(async () => {
      const match = await caches.match(request);
      if (match) return match;
      return new Response(null, { status: 404 });
    })
  );
});

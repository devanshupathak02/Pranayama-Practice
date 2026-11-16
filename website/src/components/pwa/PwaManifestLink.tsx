'use client';

import { useEffect } from 'react';

/**
 * PwaManifestLink:
 * Injects `<link rel="manifest" href="/manifest.webmanifest">` ONLY when running
 * on the dedicated app subdomain (e.g. app.pranayamatimes.org or subdomain=app).
 * 
 * Guarantees that the marketing domain (pranayamatimes.org) never links the manifest,
 * completely preventing dual-PWA or second app identity collisions.
 */
export function PwaManifestLink() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname.toLowerCase();
    const isApp =
      hostname.startsWith('app.') ||
      hostname.startsWith('timer.') ||
      window.location.search.includes('subdomain=app') ||
      window.location.search.includes('pwa_dev=1');

    if (!isApp) {
      return;
    }

    const existingLink = document.querySelector('link[rel="manifest"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.webmanifest';
      document.head.appendChild(link);
    }
  }, []);

  return null;
}

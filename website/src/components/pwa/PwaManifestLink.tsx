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

    // Dynamically attach the manifest on the client so that native beforeinstallprompt
    // is enabled across both local testing and production, while preserving SSR HTML isolation.
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

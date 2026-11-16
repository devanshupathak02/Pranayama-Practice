'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { startupMetrics } from '@/lib/performance/startupMetrics';

const noopSubscribe = () => () => {};

export interface DisplayModeInfo {
  isStandalone: boolean;
  isAppSubdomain: boolean;
  isTimerApp: boolean;
  isIos: boolean;
}

export function useDisplayMode(): DisplayModeInfo {
  useEffect(() => {
    startupMetrics.recordRaw('display_mode_detect', 0.1);
  }, []);

  const isStandalone = useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => {};
      const mql = window.matchMedia('(display-mode: standalone)');
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => {
      if (typeof window === 'undefined') return false;
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).standalone === true
      );
    },
    () => false
  );

  const isIos = useSyncExternalStore(
    noopSubscribe,
    () => {
      if (typeof window === 'undefined') return false;
      const ua = navigator.userAgent.toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    },
    () => false
  );

  const isAppSubdomain = useSyncExternalStore(
    noopSubscribe,
    () => {
      if (typeof window === 'undefined') return false;
      const h = window.location.hostname.toLowerCase();
      return (
        h.startsWith('app.') ||
        h.startsWith('timer.') ||
        window.location.search.includes('subdomain=app')
      );
    },
    () => false
  );

  const isTimerApp = useSyncExternalStore(
    noopSubscribe,
    () => {
      if (typeof window === 'undefined') return false;
      const h = window.location.hostname.toLowerCase();
      const p = window.location.pathname;
      return (
        h.startsWith('app.') ||
        h.startsWith('timer.') ||
        p.startsWith('/practice') ||
        window.location.search.includes('subdomain=app')
      );
    },
    () => false
  );

  return {
    isStandalone,
    isAppSubdomain,
    isTimerApp,
    isIos,
  };
}

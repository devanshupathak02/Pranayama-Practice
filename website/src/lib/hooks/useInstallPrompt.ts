'use client';

import { useSyncExternalStore } from 'react';
export { useInstallPrompt } from '@/components/pwa/InstallContext';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type InstallState =
  | 'not-installed'
  | 'can-prompt-native'
  | 'needs-manual-instructions'
  | 'installing'
  | 'installed'
  | 'dismissed';

export type PlatformType = 'android' | 'ios' | 'desktop' | 'unknown';

const ONBOARDING_DISMISSED_KEY = 'pranayama_onboarding_dismissed';

export function isSessionDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSessionDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  } catch {
    // Ignore sessionStorage quota / restricted mode errors
  }
}

export function clearSessionDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(ONBOARDING_DISMISSED_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Detects whether the app is currently running in standalone (installed) mode.
 * Evaluates both matchMedia('(display-mode: standalone)') and iOS navigator.standalone.
 */
export function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}

/**
 * SSR-safe hook to track standalone mode reactively.
 */
export function useIsStandalone(): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => {};
      const mql = window.matchMedia('(display-mode: standalone)');
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => checkIsStandalone(),
    () => false
  );
}

/**
 * Detect client platform details accurately and SSR-safely.
 */
export function getPlatformDetails(): {
  platform: PlatformType;
  isIos: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isSafari: boolean;
  isIosInApp: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      platform: 'unknown',
      isIos: false,
      isAndroid: false,
      isDesktop: false,
      isSafari: false,
      isIosInApp: false,
    };
  }

  const ua = navigator.userAgent.toLowerCase();

  // iOS detection (including iPadOS on modern iPads)
  const isIos =
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Android detection
  const isAndroid = /android/.test(ua);

  // Desktop detection
  const isDesktop =
    !isIos &&
    !isAndroid &&
    (/windows|macintosh|linux/.test(ua) || window.innerWidth >= 1024);

  // iOS in-app browser detection (Instagram, Facebook, LinkedIn, Twitter, Chrome on iOS, etc.)
  const isIosInApp =
    isIos &&
    (/fban|fbav|instagram|crios|fxios|optios|edgios|twitter|snapchat|line|micromessenger|tiktok|bytedance/i.test(
      ua
    ) ||
      (ua.includes('safari') && ua.includes('wv')) ||
      // Native Safari defines window.safari
      !(window as unknown as { safari?: unknown }).safari);

  // Genuine Safari on iOS
  const isSafari = isIos && !isIosInApp && /safari/.test(ua);

  let platform: PlatformType = 'unknown';
  if (isIos) platform = 'ios';
  else if (isAndroid) platform = 'android';
  else if (isDesktop) platform = 'desktop';

  return {
    platform,
    isIos,
    isAndroid,
    isDesktop,
    isSafari,
    isIosInApp,
  };
}

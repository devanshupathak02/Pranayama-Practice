'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from 'react';
import {
  BeforeInstallPromptEvent,
  InstallState,
  getPlatformDetails,
  checkIsStandalone,
  isSessionDismissed,
  setSessionDismissed,
} from '@/lib/hooks/useInstallPrompt';
import { getAppUrl } from '@/config/site';

interface InstallContextValue {
  installState: InstallState;
  deferredPrompt: BeforeInstallPromptEvent | null;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
  isIos: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isSafari: boolean;
  isIosInApp: boolean;
  isStandalone: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  continueInBrowser: () => void;
  promptToInstall: () => Promise<'accepted' | 'dismissed' | 'failed'>;
  triggerAppCta: (e?: React.MouseEvent) => void;
}

const noopSubscribe = () => () => { };

interface PlatformSnapshot {
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
  isIos: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isSafari: boolean;
  isIosInApp: boolean;
}

const SERVER_PLATFORM_SNAPSHOT: PlatformSnapshot = Object.freeze({
  platform: 'unknown',
  isIos: false,
  isAndroid: false,
  isDesktop: false,
  isSafari: false,
  isIosInApp: false,
});

let cachedClientSnapshot: PlatformSnapshot | null = null;

function getCachedPlatformSnapshot(): PlatformSnapshot {
  if (typeof window === 'undefined') {
    return SERVER_PLATFORM_SNAPSHOT;
  }
  if (cachedClientSnapshot) {
    return cachedClientSnapshot;
  }

  const details = getPlatformDetails();
  const params = new URLSearchParams(window.location.search);
  const previewPlat = params.get('preview_platform');

  if (previewPlat === 'ios') {
    cachedClientSnapshot = Object.freeze({
      ...details,
      platform: 'ios',
      isIos: true,
      isAndroid: false,
      isDesktop: false,
      isSafari: true,
      isIosInApp: false,
    });
  } else if (previewPlat === 'ios-inapp') {
    cachedClientSnapshot = Object.freeze({
      ...details,
      platform: 'ios',
      isIos: true,
      isAndroid: false,
      isDesktop: false,
      isSafari: false,
      isIosInApp: true,
    });
  } else if (previewPlat === 'android') {
    cachedClientSnapshot = Object.freeze({
      ...details,
      platform: 'android',
      isIos: false,
      isAndroid: true,
      isDesktop: false,
      isSafari: false,
      isIosInApp: false,
    });
  } else if (previewPlat === 'desktop') {
    cachedClientSnapshot = Object.freeze({
      ...details,
      platform: 'desktop',
      isIos: false,
      isAndroid: false,
      isDesktop: true,
      isSafari: false,
      isIosInApp: false,
    });
  } else {
    cachedClientSnapshot = Object.freeze(details);
  }

  return cachedClientSnapshot;
}

const InstallContext = createContext<InstallContextValue | null>(null);

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualInstallState, setManualInstallState] = useState<InstallState | null>(null);

  // Standalone detection via useSyncExternalStore (React 19 SSR compliant)
  const isStandalone = useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => { };
      const mql = window.matchMedia('(display-mode: standalone)');
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => checkIsStandalone(),
    () => false
  );

  // Platform details via useSyncExternalStore (SSR-safe and properly cached to prevent re-render loops)
  const platformDetails = useSyncExternalStore(
    noopSubscribe,
    getCachedPlatformSnapshot,
    () => SERVER_PLATFORM_SNAPSHOT
  );

  // Derive active install state
  let currentInstallState: InstallState;
  if (isStandalone) {
    currentInstallState = 'installed';
  } else if (manualInstallState) {
    currentInstallState = manualInstallState;
  } else if (deferredPrompt) {
    currentInstallState = 'can-prompt-native';
  } else if (platformDetails.isIos) {
    currentInstallState = 'needs-manual-instructions';
  } else {
    currentInstallState = 'not-installed';
  }

  // Global listener for beforeinstallprompt and appinstalled
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setManualInstallState('installed');
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Auto-open in preview/testing mode if ?install_preview=1
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('install_preview') === '1' || params.has('preview_modal')) {
        requestAnimationFrame(() => {
          setIsModalOpen(true);
          if (params.get('preview_platform') === 'installed') {
            setManualInstallState('installed');
          }
        });
      }
    } catch {
      // Ignore
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setSessionDismissed();
    setIsModalOpen(false);
    if (currentInstallState !== 'installed') {
      setManualInstallState('dismissed');
    }
  }, [currentInstallState]);

  const continueInBrowser = useCallback(() => {
    setSessionDismissed();
    setIsModalOpen(false);
    const targetUrl = getAppUrl();
    window.location.href = targetUrl;
  }, []);

  const promptToInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'failed'> => {
    if (!deferredPrompt) {
      return 'failed';
    }
    setManualInstallState('installing');
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        // Note: Waiting for appinstalled event to confirm complete installation
        return 'accepted';
      } else {
        setManualInstallState('dismissed');
        return 'dismissed';
      }
    } catch (err) {
      console.error('Failed to invoke native installation prompt:', err);
      setManualInstallState('not-installed');
      return 'failed';
    }
  }, [deferredPrompt]);

  const triggerAppCta = useCallback(
    (e?: React.MouseEvent) => {
      const currentAppUrl = getAppUrl();

      // 1. If already installed / running in standalone mode, navigate straight to the timer
      if (isStandalone) {
        if (e) return;
        window.location.href = currentAppUrl;
        return;
      }

      // 2. If already dismissed in this browsing session, navigate straight to the timer
      if (isSessionDismissed()) {
        if (e) return;
        window.location.href = currentAppUrl;
        return;
      }

      // 3. Otherwise: intercept and open the installation onboarding modal
      if (e) {
        e.preventDefault();
      }
      setIsModalOpen(true);
    },
    [isStandalone]
  );

  return (
    <InstallContext.Provider
      value={{
        installState: currentInstallState,
        deferredPrompt,
        platform: platformDetails.platform,
        isIos: platformDetails.isIos,
        isAndroid: platformDetails.isAndroid,
        isDesktop: platformDetails.isDesktop,
        isSafari: platformDetails.isSafari,
        isIosInApp: platformDetails.isIosInApp,
        isStandalone,
        isModalOpen,
        openModal,
        closeModal,
        continueInBrowser,
        promptToInstall,
        triggerAppCta,
      }}
    >
      {children}
    </InstallContext.Provider>
  );
}

export function useInstallPrompt(): InstallContextValue {
  const context = useContext(InstallContext);
  if (!context) {
    throw new Error('useInstallPrompt must be used within an <InstallProvider>');
  }
  return context;
}

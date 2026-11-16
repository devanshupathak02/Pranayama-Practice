'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { startupMetrics } from '@/lib/performance/startupMetrics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const noopSubscribe = () => () => { };

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // 1. Detect Standalone Mode via useSyncExternalStore (React 19 compliant)
  const isStandalone = useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => { };
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

  // 2. Detect iOS Device via useSyncExternalStore
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

  // 3. Detect App Subdomain: PWA features are strictly isolated to app.pranayamatimes.org
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

  // 4. Register Service Worker & capture install prompt ONLY on app subdomain (deferred to idle)
  useEffect(() => {
    // Strictly isolate PWA registration to app subdomain: Never register on main marketing website
    if (!isAppSubdomain) {
      return;
    }

    const initServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        startupMetrics.mark('sw_init_start');
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            startupMetrics.measure('sw_registration', 'sw_init_start');
            // Listen for background updates without disrupting active timer sessions
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Only skip waiting if the practitioner is not currently in an active breathing session
                    const isActive = (window as unknown as { __PRANAYAMA_IS_ACTIVE_SESSION__?: boolean })
                      .__PRANAYAMA_IS_ACTIVE_SESSION__;
                    if (!isActive) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                    }
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      }
    };

    // Defer SW registration to post-hydration idle window so it never blocks startup rendering
    if (document.readyState === 'complete') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(initServiceWorker);
      } else {
        setTimeout(initServiceWorker, 1000);
      }
    } else {
      window.addEventListener('load', () => {
        setTimeout(initServiceWorker, 1000);
      }, { once: true });
    }

    const dismissedAt = localStorage.getItem('pranayama_install_dismissed_at');
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        // Already dismissed recently
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isAppSubdomain]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setDismissed(true);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIosGuide(false);
    try {
      localStorage.setItem('pranayama_install_dismissed_at', Date.now().toString());
    } catch {
      // localStorage may fail in restricted mode
    }
  };

  // Do not render anything on main marketing site, or if already standalone, or if dismissed
  if (!isAppSubdomain || isStandalone || dismissed) {
    return null;
  }

  // Do not display install banner during active practice session
  const isCurrentlyPracticing =
    typeof window !== 'undefined' &&
    Boolean((window as unknown as { __PRANAYAMA_IS_ACTIVE_SESSION__?: boolean }).__PRANAYAMA_IS_ACTIVE_SESSION__);
  if (isCurrentlyPracticing) {
    return null;
  }

  // Only show if we have an install prompt (Chromium) or on iOS Safari
  const canInstall = Boolean(deferredPrompt || (isIos && !isStandalone));
  if (!canInstall) {
    return null;
  }

  return (
    <>
      {/* Subtle, non-intrusive bottom install banner */}
      <div
        role="region"
        aria-label="Install App Banner"
        className="fixed bottom-3 right-3 left-3 sm:left-auto sm:max-w-sm z-40 bg-[#FAF7F2]/95 backdrop-blur-md border border-[#D6C6A5] rounded-3xl p-4 shadow-xl shadow-[#263F35]/10 animate-fade-in transition-all select-none"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#263F35] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-2xs">
            <Download className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <h4 className="font-serif text-sm font-bold text-[#263F35] tracking-tight">
              Install Dedicated App
            </h4>
            <p className="text-[11px] text-[#355245] mt-0.5 leading-relaxed">
              Fast, distraction-free practice with offline audio playback.
            </p>

            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-[#263F35] text-[#FAF7F2] text-xs font-semibold hover:bg-[#1A2D25] active:scale-95 transition-all shadow-2xs"
              >
                {isIos ? 'Instructions' : 'Install'}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-xl border border-[#D6C6A5] text-[#355245] text-xs font-medium hover:bg-[#EDE8DC] transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="text-[#82947A] hover:text-[#263F35] p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#263F35]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-[#FAF7F2] border border-[#263F35]/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-[#263F35]">
            <div className="flex items-center justify-between pb-3 border-b border-[#263F35]/10">
              <h3 className="font-serif text-lg font-medium">Install on iPhone / iPad</h3>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-[#263F35]/60 hover:text-[#263F35]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="mt-4 space-y-3.5 text-xs text-[#263F35]/80 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EDE8DC] text-[#263F35] font-semibold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  In <strong>Safari</strong>, tap the <strong>Share</strong> button at the bottom of the screen:
                  <Share2 className="inline-block w-4 h-4 mx-1 text-[#B97755]" />
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EDE8DC] text-[#263F35] font-semibold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Scroll down the menu and tap <strong>Add to Home Screen</strong>:
                  <PlusSquare className="inline-block w-4 h-4 mx-1 text-[#263F35]" />
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EDE8DC] text-[#263F35] font-semibold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> in the top right corner. The icon will appear on your Home Screen.
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => {
                setShowIosGuide(false);
                handleDismiss();
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#263F35] text-[#FAF7F2] text-xs font-medium hover:bg-[#82947A] transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}

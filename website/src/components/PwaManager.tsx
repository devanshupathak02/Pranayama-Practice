'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Download, X } from 'lucide-react';
import { startupMetrics } from '@/lib/performance/startupMetrics';
import { useInstallPrompt } from '@/components/pwa/InstallContext';

const noopSubscribe = () => () => { };

export function PwaManager() {
  const { deferredPrompt, isStandalone, isIos, promptToInstall, openModal } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  // 3. Detect App Subdomain (for in-app banner display)
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

  // 4. Register Service Worker on client (deferred to post-hydration idle)
  // Required for offline audio caching, push reminders, and PWA installability
  useEffect(() => {
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
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      const outcome = await promptToInstall();
      if (outcome === 'accepted') {
        setDismissed(true);
      }
    } else {
      openModal();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
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
    </>
  );
}

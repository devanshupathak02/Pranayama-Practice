'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Share2,
  PlusSquare,
  Download,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { useInstallPrompt } from '@/components/pwa/InstallContext';

export function InstallOnboardingModal() {
  const {
    isModalOpen,
    closeModal,
    continueInBrowser,
    promptToInstall,
    installState,
    isIos,
    isAndroid,
    isIosInApp,
    deferredPrompt,
  } = useInstallPrompt();

  const [view, setView] = useState<'prompt' | 'instructions'>('prompt');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setView('prompt');
    closeModal();
  }, [closeModal]);

  const handleContinueInBrowser = useCallback(() => {
    setView('prompt');
    continueInBrowser();
  }, [continueInBrowser]);

  // Keyboard navigation (ESC to close)
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isModalOpen, handleClose]);

  if (!isModalOpen) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native prompt available (Android Chrome, Desktop Chrome/Edge)
      await promptToInstall();
    } else {
      // Manual instructions view required (iOS, or browser without beforeinstallprompt)
      setView('instructions');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      aria-describedby="install-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1A2D25]/60 backdrop-blur-xs animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all">
        {/* Top Decorative Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#263F35] via-[#82947A] to-[#B97755]" />

        {/* Close & Back Button Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          {view === 'instructions' && installState !== 'installed' ? (
            <button
              type="button"
              onClick={() => setView('prompt')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#82947A] hover:text-[#263F35] transition-colors py-1 px-1.5 rounded-lg hover:bg-[#EDE8DC]"
              aria-label="Back to install prompt"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-6" />
          )}

          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl text-[#82947A] hover:text-[#263F35] hover:bg-[#EDE8DC] transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
            aria-label="Close window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 pb-6 pt-1 text-center space-y-5">
          {/* STATE 1: INSTALLED SUCCESS */}
          {installState === 'installed' ? (
            <div className="py-2 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E2E8DF] border border-[#82947A]/40 flex items-center justify-center text-[#263F35] shadow-2xs">
                <CheckCircle2 className="w-8 h-8 text-[#82947A]" />
              </div>

              <div className="space-y-1">
                <h3 id="install-modal-title" className="font-serif font-bold text-2xl text-[#263F35]">
                  Pranayama Times is Installed!
                </h3>
                <p id="install-modal-desc" className="text-xs text-[#355245] max-w-xs mx-auto leading-relaxed">
                  Your dedicated breathing timer is ready on your home screen for daily practice.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleContinueInBrowser}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] py-3.5 px-6 rounded-2xl font-medium text-sm transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
                >
                  <span>Open Timer App</span>
                  <ArrowRight className="w-4 h-4 text-[#D6C6A5]" />
                </button>
              </div>
            </div>
          ) : view === 'prompt' ? (
            /* STATE 2: COMPACT INSTALL PROMPT (DEFAULT) */
            <div className="space-y-5">
              {/* Logo Emblem */}
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] flex items-center justify-center p-2.5 shadow-2xs">
                <Image
                  src="/images/still-mountain-logo.png"
                  alt="Still Mountain Logo"
                  width={34}
                  height={34}
                  className="object-contain"
                  priority
                />
              </div>

              {/* Direct Title & Concise Subtitle */}
              <div className="space-y-1.5">
                <h3
                  id="install-modal-title"
                  className="font-serif font-bold text-2xl text-[#263F35] leading-tight"
                >
                  Install Pranayama Times?
                </h3>
                <p
                  id="install-modal-desc"
                  className="text-xs sm:text-sm text-[#355245] max-w-xs mx-auto leading-relaxed"
                >
                  Install for a dedicated, distraction-free breathing timer with full offline audio.
                </p>
              </div>

              {/* Action Buttons: Primary Install vs Secondary Continue */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] active:scale-[0.98] text-[#FAF7F2] py-3.5 px-6 rounded-2xl font-medium text-sm transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
                >
                  <Download className="w-4 h-4 text-[#D6C6A5]" />
                  <span>Install App</span>
                </button>

                <button
                  type="button"
                  onClick={handleContinueInBrowser}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-[#355245] hover:text-[#263F35] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition-colors"
                >
                  <span>Continue in Browser</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#82947A]" />
                </button>
              </div>
            </div>
          ) : (
            /* STATE 3: COMPACT INSTRUCTION VIEW (WHEN NATIVE PROMPT IS NOT SUPPORTED BY BROWSER) */
            <div className="space-y-4 text-left">
              {/* iOS Safari Guide */}
              {isIos ? (
                <div className="space-y-3">
                  <div className="text-center space-y-0.5">
                    <h3 id="install-modal-title" className="font-serif font-bold text-xl text-[#263F35]">
                      Add to Home Screen
                    </h3>
                    <p id="install-modal-desc" className="text-xs text-[#355245]">
                      Follow these 3 quick steps in Safari:
                    </p>
                  </div>

                  {isIosInApp && (
                    <div className="bg-[#EDE8DC] border border-[#B97755]/40 rounded-xl p-2.5 text-xs text-[#263F35] flex items-start gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-[#B97755] shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-snug">
                        Please tap (···) or Share and select <strong>Open in Safari</strong> to install.
                      </p>
                    </div>
                  )}

                  <div className="bg-[#EDE8DC]/50 border border-[#D6C6A5]/70 rounded-2xl p-3.5 space-y-2.5">
                    <ol className="space-y-2 text-xs text-[#263F35] leading-relaxed">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#263F35] text-[#FAF7F2] text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <span>
                          Tap the <strong>Share</strong> button at the bottom of Safari:
                          <Share2 className="inline-block w-3.5 h-3.5 mx-1.5 text-[#B97755] align-sub" />
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#263F35] text-[#FAF7F2] text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <span>
                          Scroll down and tap <strong>Add to Home Screen</strong>:
                          <PlusSquare className="inline-block w-3.5 h-3.5 mx-1.5 text-[#263F35] align-sub" />
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#263F35] text-[#FAF7F2] text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <span>
                          Tap <strong>Add</strong> in the top-right corner.
                        </span>
                      </li>
                    </ol>
                  </div>
                </div>
              ) : isAndroid ? (
                /* Android Menu Guide (Fallback when prompt not yet fired) */
                <div className="space-y-3">
                  <div className="text-center space-y-0.5">
                    <h3 id="install-modal-title" className="font-serif font-bold text-xl text-[#263F35]">
                      Install App
                    </h3>
                    <p id="install-modal-desc" className="text-xs text-[#355245]">
                      Install via your browser menu:
                    </p>
                  </div>

                  <div className="bg-[#EDE8DC]/50 border border-[#D6C6A5]/70 rounded-2xl p-3.5 space-y-2">
                    <ol className="space-y-2 text-xs text-[#263F35] leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#263F35] text-[#FAF7F2] text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <span>Tap the browser menu (three dots <strong>⋮</strong> in top right).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#263F35] text-[#FAF7F2] text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <span>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#263F35] text-[#FAF7F2] text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <span>Confirm <strong>Install</strong>.</span>
                      </li>
                    </ol>
                  </div>
                </div>
              ) : (
                /* Desktop Guide */
                <div className="space-y-3">
                  <div className="text-center space-y-0.5">
                    <h3 id="install-modal-title" className="font-serif font-bold text-xl text-[#263F35]">
                      Install Desktop App
                    </h3>
                    <p id="install-modal-desc" className="text-xs text-[#355245]">
                      Use your browser&apos;s install option:
                    </p>
                  </div>

                  <div className="bg-[#EDE8DC]/50 border border-[#D6C6A5]/70 rounded-2xl p-3.5 space-y-2 text-xs text-[#263F35]">
                    <div className="flex items-center gap-2 font-medium text-[#263F35]">
                      <Laptop className="w-4 h-4 text-[#82947A] shrink-0" />
                      <span>Browser Address Bar:</span>
                    </div>
                    <p className="text-[11px] text-[#355245] leading-relaxed">
                      In <strong>Chrome</strong> or <strong>Edge</strong>, click the <strong>Install</strong> icon (<Download className="w-3.5 h-3.5 inline mx-1 text-[#82947A]" />) on the right side of the URL bar, or click Menu (⋮) → <em>Save and share → Install Pranayama Times</em>.
                    </p>
                  </div>
                </div>
              )}

              {/* Continue in Browser option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleContinueInBrowser}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] py-3 px-6 rounded-2xl font-medium text-xs sm:text-sm transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
                >
                  <span>Continue in Browser</span>
                  <ArrowRight className="w-4 h-4 text-[#D6C6A5]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

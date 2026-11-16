'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

interface AppSplashScreenProps {
  onFinish?: () => void;
}

export function AppSplashScreen({ onFinish }: AppSplashScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    if (isFadingOut || isDismissed) return;
    setIsFadingOut(true);
    setTimeout(() => {
      setIsDismissed(true);
      onFinish?.();
    }, 250);
  }, [isFadingOut, isDismissed, onFinish]);

  useEffect(() => {
    if (isDismissed) {
      onFinish?.();
      return;
    }

    // Progressive Launch: Start smooth exit immediately upon React mount
    // No artificial setTimeout delay - handoff happens as soon as the DOM is interactive
    const animFrame = requestAnimationFrame(() => {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setIsDismissed(true);
        onFinish?.();
        return;
      }

      const timer = setTimeout(() => {
        handleDismiss();
      }, 50);
      return () => clearTimeout(timer);
    });

    return () => cancelAnimationFrame(animFrame);
  }, [isDismissed, handleDismiss, onFinish]);

  if (isDismissed) return null;

  return (
    <div
      onClick={handleDismiss}
      onTouchStart={handleDismiss}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7F2] select-none cursor-pointer transition-opacity duration-250 ease-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      role="button"
      tabIndex={0}
      aria-label="Launch Pranayama Times"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer soft sage breath ring */}
        <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[#E2E8DF]/80 launch-breath-ring" />

        {/* Middle ambient terracotta glow */}
        <div className="absolute w-60 h-60 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-[#CB8D6E]/20 via-[#B97755]/15 to-transparent blur-md" />

        {/* Inner bordered ring matching Earthy Botanical identity */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border-2 border-[#B97755] flex items-center justify-center bg-[#FAF7F2] shadow-sm">
          <div className="w-28 h-28 relative flex items-center justify-center">
            <Image
              src="/images/still-mountain-logo.png"
              alt="Still Mountain Identity"
              width={100}
              height={100}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

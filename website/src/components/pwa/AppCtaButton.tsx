'use client';

import React from 'react';
import { useInstallPrompt } from '@/components/pwa/InstallContext';
import { useAppUrl } from '@/lib/hooks/useAppUrl';

interface AppCtaButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

export function AppCtaButton({
  children,
  className,
  onClick,
  'aria-label': ariaLabel,
}: AppCtaButtonProps) {
  const { triggerAppCta } = useInstallPrompt();
  const appUrl = useAppUrl();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick();
    }
    triggerAppCta(e);
  };

  return (
    <a
      href={appUrl}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}

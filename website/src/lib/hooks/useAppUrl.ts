'use client';

import { useSyncExternalStore } from 'react';
import { siteConfig, getAppUrl } from '@/config/site';

const noopSubscribe = () => () => {};

export function useAppUrl(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => getAppUrl(),
    () => siteConfig.appUrl
  );
}

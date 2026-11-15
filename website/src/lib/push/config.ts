import webpush from 'web-push';
import { Redis } from '@upstash/redis';
import { Client as QStashClient, Receiver as QStashReceiver } from '@upstash/qstash';

export const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  '';

export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

export const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:admin@smwr.org';

export const isVapidConfigured = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

// Configure web-push with VAPID details only when valid private key is provided
if (isVapidConfigured) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (err) {
    console.warn('[Push Config] Failed to initialize VAPID details:', err);
  }
}

export const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

export const isQStashConfigured = Boolean(
  process.env.QSTASH_TOKEN
);

// In-memory fallback stores for development without Upstash credentials
const mockRedisStore = new Map<string, string>();
const mockRemindersStore = new Map<string, string>();

export interface IRedisClient {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options?: { ex?: number }): Promise<unknown>;
  del(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
}

export const redis: IRedisClient = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : {
      async get<T = unknown>(key: string): Promise<T | null> {
        const val = mockRedisStore.get(key);
        if (!val) return null;
        try {
          return JSON.parse(val) as T;
        } catch {
          return val as unknown as T;
        }
      },
      async set(key: string, value: unknown): Promise<'OK'> {
        const str = typeof value === 'string' ? value : JSON.stringify(value);
        mockRedisStore.set(key, str);
        return 'OK';
      },
      async del(key: string): Promise<number> {
        return mockRedisStore.delete(key) ? 1 : 0;
      },
      async keys(pattern: string): Promise<string[]> {
        const prefix = pattern.replace('*', '');
        return Array.from(mockRedisStore.keys()).filter((k) => k.startsWith(prefix));
      },
    };

export const qstash = isQStashConfigured
  ? new QStashClient({ token: process.env.QSTASH_TOKEN! })
  : {
      async publishJSON(options: { url: string; body: unknown; delay?: number }) {
        const msgId = 'mock_qstash_' + Math.random().toString(36).substring(2, 9);
        mockRemindersStore.set(msgId, JSON.stringify(options));
        return { messageId: msgId };
      },
    };

export const qstashReceiver = isQStashConfigured && process.env.QSTASH_CURRENT_SIGNING_KEY
  ? new QStashReceiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
    })
  : {
      async verify(): Promise<boolean> {
        // In local development or mock mode, allow verification to pass
        return true;
      },
    };

export { webpush };

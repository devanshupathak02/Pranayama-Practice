declare module 'web-push' {
  export interface PushSubscriptionKeys {
    p256dh: string;
    auth: string;
  }

  export interface PushSubscription {
    endpoint: string;
    keys: PushSubscriptionKeys;
    expirationTime?: number | null;
  }

  export interface SendResult {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }

  export interface RequestOptions {
    vapidDetails?: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
    TTL?: number;
    headers?: Record<string, string>;
    contentEncoding?: string;
    proxy?: string;
    agent?: unknown;
  }

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer | null,
    options?: RequestOptions
  ): Promise<SendResult>;

  export function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };

  export class WebPushError extends Error {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    endpoint: string;
  }

  const webPush: {
    setVapidDetails: typeof setVapidDetails;
    sendNotification: typeof sendNotification;
    generateVAPIDKeys: typeof generateVAPIDKeys;
    WebPushError: typeof WebPushError;
  };

  export default webPush;
}

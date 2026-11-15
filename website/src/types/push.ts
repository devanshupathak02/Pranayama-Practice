export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface ClientPushSubscription {
  endpoint: string;
  keys: PushSubscriptionKeys;
  expirationTime?: number | null;
}

export interface StoredSubscription {
  deviceId: string;
  subscription: ClientPushSubscription;
  createdAt: number;
  updatedAt: number;
  userAgent?: string;
}

export interface PracticeReminder {
  id: string;
  deviceId: string;
  title: string;
  timeOfDay: string; // "HH:MM" e.g. "06:00"
  timeZone: string;   // e.g. "Asia/Kolkata" or "UTC"
  routineId?: string;
  routineName?: string;
  enabled: boolean;
  createdAt: number;
  qstashScheduleId?: string;
}

export interface WebhookPushPayload {
  type: 'DAILY_REMINDER' | 'PRACTICE_INVITE';
  deviceId: string;
  reminderId?: string;
  title: string;
  body: string;
  url: string;
  timestamp: number;
}

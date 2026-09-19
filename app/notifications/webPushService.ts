import { Platform } from 'react-native';
import { Routine } from '../models/Routine';
import { Phase } from '../models/Phase';
import { storage } from '../storage/db';

const DEVICE_ID_KEY = 'web_push_device_id';

// Convert base64 url-safe string to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export class WebPushService {
  private deviceId: string | null = null;
  private vapidPublicKey: string = 'BPgIc4nqOLEU8csBu0p0iXw1vHmeRZViEbo2rydUe7KGYpZSbmuZp7cfXse162OqngKCd_I_gG5dEMaxbicKuso';

  async getDeviceId(): Promise<string> {
    if (this.deviceId) return this.deviceId;
    let stored = await storage.getItem(DEVICE_ID_KEY);
    if (!stored) {
      stored = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      await storage.setItem(DEVICE_ID_KEY, stored);
    }
    this.deviceId = stored;
    return stored;
  }

  async requestPermissionAndSubscribe(): Promise<boolean> {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('[WebPushService] Web Push not supported in this browser environment.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('[WebPushService] Notification permission was not granted:', permission);
        return false;
      }

      // Fetch public key from backend if available
      try {
        const keyRes = await fetch('/api/push/public-key');
        if (keyRes.ok) {
          const keyData = await keyRes.json();
          if (keyData.publicKey) {
            this.vapidPublicKey = keyData.publicKey;
          }
        }
      } catch (e) {
        // use default
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(this.vapidPublicKey) as unknown as BufferSource;
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      const deviceId = await this.getDeviceId();

      // Register subscription on backend
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          subscription: subscription.toJSON(),
        }),
      });

      console.log('[WebPushService] Successfully registered Web Push subscription for device:', deviceId);
      return true;
    } catch (err) {
      console.warn('[WebPushService] Failed to subscribe to Web Push:', err);
      return false;
    }
  }

  /**
   * Schedules push notifications for upcoming phase transitions and completion.
   * D2 timestamp math:
   * - Delay for phase K = currentPhaseSecondsRemaining + sum of durations of phases between current and K
   * - Session total remaining = currentPhaseSecondsRemaining + sum of durations of all phases after current
   */
  async scheduleSession(
    routine: Routine,
    currentPhaseIndex: number,
    currentPhaseSecondsRemaining: number,
    sessionId: string
  ): Promise<void> {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const deviceId = await this.getDeviceId();

    // Compute future events
    const events: Array<{
      delaySeconds: number;
      phaseName: string;
      phaseIndex: number;
      totalPhases: number;
      timeRemainingSeconds: number;
    }> = [];

    const totalPhases = routine.phases.length;

    // Calculate total session time remaining (D14 formula)
    let totalRemaining = currentPhaseSecondsRemaining;
    for (let i = currentPhaseIndex + 1; i < totalPhases; i++) {
      totalRemaining += routine.phases[i].durationSeconds;
    }

    let runningDelay = currentPhaseSecondsRemaining;

    // Schedule pushes for all upcoming phases
    for (let i = currentPhaseIndex + 1; i < totalPhases; i++) {
      const nextPhase = routine.phases[i];

      // Time remaining in the whole session at the moment nextPhase starts
      let remainingAtStart = 0;
      for (let j = i; j < totalPhases; j++) {
        remainingAtStart += routine.phases[j].durationSeconds;
      }

      events.push({
        delaySeconds: Math.round(runningDelay),
        phaseName: nextPhase.label,
        phaseIndex: i + 1,
        totalPhases,
        timeRemainingSeconds: remainingAtStart,
      });

      runningDelay += nextPhase.durationSeconds;
    }

    // Schedule final session completion push
    events.push({
      delaySeconds: Math.round(runningDelay),
      phaseName: 'Session Complete',
      phaseIndex: totalPhases,
      totalPhases,
      timeRemainingSeconds: 0,
    });

    const webhookBaseUrl = window.location.origin;

    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 3000) : null;

      const res = await fetch('/api/push/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          sessionId,
          events,
          totalDurationSeconds: totalRemaining,
          webhookBaseUrl,
        }),
        signal: controller ? controller.signal : undefined,
      });

      if (timeoutId) clearTimeout(timeoutId);
      const data = await res.json();
      console.log('[WebPushService] Push schedule dispatched:', data);
    } catch (err) {
      console.warn('[WebPushService] Offline or failed to reach /api/push/schedule (safe offline fallback):', err);
    }
  }

  async cancelSession(sessionId: string, status: 'PAUSED' | 'CANCELLED' = 'CANCELLED'): Promise<void> {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 3000) : null;

      await fetch('/api/push/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status,
        }),
        signal: controller ? controller.signal : undefined,
      });

      if (timeoutId) clearTimeout(timeoutId);
      console.log(`[WebPushService] Cancelled session ${sessionId} (${status})`);
    } catch (err) {
      console.warn('[WebPushService] Offline or failed to cancel session push (safe offline fallback):', err);
    }
  }
}

export const webPushService = new WebPushService();

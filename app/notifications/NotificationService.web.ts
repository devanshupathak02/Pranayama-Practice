import { Phase } from '../models/Phase';
import { Routine } from '../models/Routine';
import { webPushService } from './webPushService';

export const SESSION_NOTIFICATION_IDENTIFIER = 'pranayama-session-progress';
export const SESSION_CHANNEL_ID = 'session_channel';
export const ACTION_PAUSE = 'pause_session';
export const ACTION_RESUME = 'resume_session';

function formatMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

let _permissionGranted: boolean | null = null;
let _currentSessionId: string | null = null;

export const NotificationService = {
  async init(): Promise<void> {
    console.log('[NotificationService Web] init() called');
    if (typeof window !== 'undefined' && 'Notification' in window) {
      _permissionGranted = Notification.permission === 'granted';
    }
  },

  async requestPermissions(): Promise<boolean> {
    const granted = await webPushService.requestPermissionAndSubscribe();
    _permissionGranted = granted;
    return granted;
  },

  async showOrUpdate(
    phase: Phase,
    remainingSeconds: number,
    totalSecondsRemaining: number,
    isPaused: boolean,
  ): Promise<void> {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted' ||
      _permissionGranted === false
    ) {
      return;
    }

    try {
      const phaseTime = formatMMSS(remainingSeconds);
      const totalTime = formatMMSS(totalSecondsRemaining);
      const title = isPaused ? `[PAUSED] ${phase.label}` : `🧘 ${phase.label}`;
      const body = `${phaseTime} remaining  |  ${totalTime} left in session`;

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const options: any = {
          body,
          icon: '/icon-192.png',
          badge: '/favicon-32.png',
          tag: SESSION_NOTIFICATION_IDENTIFIER,
          renotify: false,
          data: { url: '/' },
        };
        await registration.showNotification(title, options);
      }
    } catch (e) {
      console.warn('[NotificationService Web] Failed to show browser notification:', e);
    }
  },

  async schedulePushes(
    routine: Routine,
    currentPhaseIndex: number,
    currentPhaseSecondsRemaining: number,
    sessionId: string
  ): Promise<void> {
    _currentSessionId = sessionId;
    await webPushService.scheduleSession(routine, currentPhaseIndex, currentPhaseSecondsRemaining, sessionId);
  },

  async cancelPushes(sessionId?: string, status: 'PAUSED' | 'CANCELLED' = 'CANCELLED'): Promise<void> {
    const id = sessionId || _currentSessionId;
    if (id) {
      await webPushService.cancelSession(id, status);
    }
  },

  async dismiss(): Promise<void> {
    try {
      if (_currentSessionId) {
        await webPushService.cancelSession(_currentSessionId, 'CANCELLED');
        _currentSessionId = null;
      }
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const notifications = await registration.getNotifications({ tag: SESSION_NOTIFICATION_IDENTIFIER });
        notifications.forEach(n => n.close());
      }
    } catch (e) {
      console.warn('[NotificationService Web] Error dismissing notification:', e);
    }
  },
};

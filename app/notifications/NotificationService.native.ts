import notifee, { AndroidImportance, EventType, AndroidForegroundServiceType } from '@notifee/react-native';
import { Platform } from 'react-native';
import { Phase } from '../models/Phase';

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

/** Cached permission state. null = not yet checked this app session. */
let _permissionGranted: boolean | null = null;
let _isForegroundServiceRegistered = false;

export const NotificationService = {
  /**
   * Configure Notifee Android channel, foreground service runner, and action listeners (D17).
   */
  async init(): Promise<void> {
    console.log('[NotificationService Native] init() called');
    try {
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: SESSION_CHANNEL_ID,
          name: 'Session Timer',
          importance: AndroidImportance.LOW,
          sound: undefined,
          vibration: false,
        });

        if (!_isForegroundServiceRegistered) {
          notifee.registerForegroundService(() => {
            return new Promise(() => {
              // Keeps Android Foreground Service running while session is RUNNING or PAUSED
            });
          });
          _isForegroundServiceRegistered = true;
        }
      }

      // Foreground & Background event handlers for action buttons (D17)
      notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.ACTION_PRESS) {
          const actionId = detail.pressAction?.id;
          if (actionId === ACTION_PAUSE) {
            const { useSessionStore } = require('../store/sessionStore');
            useSessionStore.getState().pauseSession();
          } else if (actionId === ACTION_RESUME) {
            const { useSessionStore } = require('../store/sessionStore');
            useSessionStore.getState().resumeSession();
          }
        }
      });

      notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.ACTION_PRESS) {
          const actionId = detail.pressAction?.id;
          if (actionId === ACTION_PAUSE) {
            const { useSessionStore } = require('../store/sessionStore');
            useSessionStore.getState().pauseSession();
          } else if (actionId === ACTION_RESUME) {
            const { useSessionStore } = require('../store/sessionStore');
            useSessionStore.getState().resumeSession();
          }
        }
      });
    } catch (e) {
      console.error('[NotificationService Native] Error in init():', e);
    }
  },

  /**
   * Request notification permission at session start (cached).
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      _permissionGranted = settings.authorizationStatus >= 1;
      return _permissionGranted;
    } catch (e) {
      console.error('[NotificationService Native] Error requesting permissions:', e);
      _permissionGranted = false;
      return false;
    }
  },

  /**
   * Display or update notification using Notifee Foreground Service and native Android chronometer (D17).
   */
  async showOrUpdate(
    phase: Phase,
    remainingSeconds: number,
    totalSecondsRemaining: number,
    isPaused: boolean,
  ): Promise<void> {
    try {
      if (_permissionGranted === null) {
        const settings = await notifee.getNotificationSettings();
        _permissionGranted = settings.authorizationStatus >= 1;
      }

      if (!_permissionGranted) {
        return;
      }

      const phaseTime = formatMMSS(remainingSeconds);
      const totalTime = formatMMSS(totalSecondsRemaining);

      const title = isPaused ? `[PAUSED] ${phase.label}` : `🧘 ${phase.label}`;
      const subtitle = `${totalTime} left in session`;
      const body = isPaused
        ? `${phaseTime} remaining  |  ${totalTime} left in session`
        : `${totalTime} left in session`;

      await notifee.displayNotification({
        id: SESSION_NOTIFICATION_IDENTIFIER,
        title,
        subtitle,
        body,
        android: {
          channelId: SESSION_CHANNEL_ID,
          asForegroundService: true,
          foregroundServiceTypes: [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SPECIAL_USE],
          ongoing: true,
          color: '#7C5C3B',
          pressAction: {
            id: 'default',
          },
          showTimestamp: !isPaused,
          chronometerDirection: 'down',
          timestamp: isPaused ? undefined : Date.now() + Math.max(0, Math.round(remainingSeconds)) * 1000,
          actions: [
            {
              title: isPaused ? 'Resume' : 'Pause',
              pressAction: {
                id: isPaused ? ACTION_RESUME : ACTION_PAUSE,
              },
            },
          ],
        },
      });
    } catch (e) {
      console.error('[NotificationService Native] Failed to display notification:', e);
    }
  },

  /**
   * Dismiss the session notification and stop the Android Foreground Service (D17).
   */
  async dismiss(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await notifee.stopForegroundService();
      }
      await notifee.cancelNotification(SESSION_NOTIFICATION_IDENTIFIER);
    } catch (e) {
      console.error('[NotificationService Native] Error dismissing notification:', e);
    }
  },

  /**
   * Stub for Web Push schedule on native (native uses Notifee foreground service)
   */
  async schedulePushes(): Promise<void> {},
  async cancelPushes(): Promise<void> {},
};

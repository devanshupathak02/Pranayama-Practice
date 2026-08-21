import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Phase } from '../models/Phase';

const SESSION_NOTIFICATION_IDENTIFIER = 'pranayama-session-progress';

function formatMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Persistent session notification service (D15).
 */

/** Cached permission state. null = not yet requested this app session. */
let _permissionGranted: boolean | null = null;

export const NotificationService = {
  /**
   * Configure the in-app notification handler and create Android channel.
   * Call once on app start.
   */
  async init(): Promise<void> {
    console.log('[NotificationService] init() called');
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => {
          console.log('[NotificationService] handleNotification triggered');
          return {
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          };
        },
      });

      if (Platform.OS === 'android') {
        console.log('[NotificationService] Creating Android notification channel...');
        const channelResult = await Notifications.setNotificationChannelAsync(SESSION_NOTIFICATION_IDENTIFIER, {
          name: 'Session Timer',
          importance: Notifications.AndroidImportance.DEFAULT,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          sound: null,
          vibrationPattern: null,
          enableVibrate: false,
          showBadge: false,
        });
        console.log('[NotificationService] Android channel creation result:', channelResult);
      }
    } catch (e) {
      console.error('[NotificationService] Error in init():', e);
    }
  },

  /**
   * Request notification permission at session start (once only, cached).
   */
  async requestPermissions(): Promise<boolean> {
    console.log('[NotificationService] requestPermissions() called. Current cached state:', _permissionGranted);
    try {
      if (_permissionGranted !== null) {
        console.log('[NotificationService] Returning cached permission status:', _permissionGranted);
        return _permissionGranted;
      }

      const { status: existing } = await Notifications.getPermissionsAsync();
      console.log('[NotificationService] Existing permission status:', existing);
      if (existing === 'granted') {
        _permissionGranted = true;
        console.log('[NotificationService] Permission already granted.');
        return true;
      }

      console.log('[NotificationService] Requesting permission from user...');
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: false,
        },
      });

      _permissionGranted = status === 'granted';
      console.log('[NotificationService] Permission request result status:', status, 'Granted:', _permissionGranted);
      return _permissionGranted;
    } catch (e) {
      console.error('[NotificationService] Error requesting notification permissions:', e);
      _permissionGranted = false;
      return false;
    }
  },

  /**
   * Show or update the persistent session notification.
   */
  async showOrUpdate(
    phase: Phase,
    remainingSeconds: number,
    isPaused: boolean,
  ): Promise<void> {
    console.log(
      `[NotificationService] showOrUpdate() called | phase="${phase.label}", remaining=${remainingSeconds}s, isPaused=${isPaused}, permissionGranted=${_permissionGranted}`
    );

    if (!_permissionGranted) {
      console.warn('[NotificationService] Skipping showOrUpdate() — _permissionGranted is falsy:', _permissionGranted);
      return;
    }

    const title = isPaused
      ? `[Paused] ${phase.label}`
      : phase.label;

    const body = isPaused
      ? `${formatMMSS(remainingSeconds)} remaining — tap to resume`
      : `${formatMMSS(remainingSeconds)} left in phase • Pranayama`;

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: SESSION_NOTIFICATION_IDENTIFIER,
        content: {
          title,
          body,
          data: { navigate: 'ActiveSession' },
          color: '#7C5C3B',
          sticky: true,        // Android only: non-dismissable (setOngoing)
          autoDismiss: false,  // Android only: don't auto-dismiss on tap
          vibrate: [],         // suppress vibration on updates
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: Platform.OS === 'android' ? { channelId: SESSION_NOTIFICATION_IDENTIFIER } : null,
      });
      console.log(`[NotificationService] Notification scheduled successfully! ID="${notificationId}"`);
    } catch (e) {
      console.error('[NotificationService] Failed to schedule/update notification:', e);
    }
  },

  /**
   * Dismiss the session notification.
   */
  async dismiss(): Promise<void> {
    console.log('[NotificationService] dismiss() called');
    try {
      await Notifications.dismissNotificationAsync(SESSION_NOTIFICATION_IDENTIFIER);
      await Notifications.cancelScheduledNotificationAsync(SESSION_NOTIFICATION_IDENTIFIER);
      console.log('[NotificationService] Notification dismissed successfully.');
    } catch (e) {
      console.warn('[NotificationService] Error in dismiss():', e);
    }
  },

  /**
   * Reset cached permission state. For testing.
   */
  _resetForTesting(): void {
    _permissionGranted = null;
  },
};

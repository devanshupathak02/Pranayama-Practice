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
 *
 * Platform behavior:
 * - Android: sticky (non-dismissable) notification. expo-notifications does not expose
 *   Android's native usesChronometer field, so we cannot get a live OS-ticking countdown.
 *   Instead, we update the notification on every phase change with the new phase name
 *   and remaining time. Behavior is the same as iOS — phase-change updates only.
 *   NOTE: This is the correct achievable behavior within expo-notifications' API surface.
 *   If native usesChronometer is needed in future, it would require a bare workflow or
 *   a native module — document that separately (D15).
 *
 * - iOS: same phase-change update pattern. Not a live tick (no Live Activities needed).
 *
 * Permission:
 * - Requested once on first session start, never at app launch.
 * - If denied: all methods become no-ops, session runs normally (D15).
 */

/** Cached permission state. null = not yet requested this app session. */
let _permissionGranted: boolean | null = null;

export const NotificationService = {
  /**
   * Configure the in-app notification handler and create Android channel.
   * Call once on app start (e.g. in App.tsx or store init).
   */
  async init(): Promise<void> {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false, // suppress in-app banners while app is foregrounded
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(SESSION_NOTIFICATION_IDENTIFIER, {
        name: 'Session Timer',
        importance: Notifications.AndroidImportance.LOW, // silent, no sound or vibrate on updates
        sound: null,
        vibrationPattern: null,
        enableVibrate: false,
      });
    }
  },

  /**
   * Request notification permission at session start (once only, cached).
   * Returns true if granted, false if denied.
   * Callers must check the return value before relying on notifications.
   */
  async requestPermissions(): Promise<boolean> {
    if (_permissionGranted !== null) {
      return _permissionGranted;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') {
      _permissionGranted = true;
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: false,
      },
    });

    _permissionGranted = status === 'granted';
    return _permissionGranted;
  },

  /**
   * Show or update the persistent session notification.
   *
   * Call at:
   * - Session start (initial phase)
   * - Every phase change (natural or skip)
   * - Pause (to show paused state)
   * - Resume (to restore active state)
   *
   * If permission was denied, this is a no-op.
   */
  async showOrUpdate(
    phase: Phase,
    remainingSeconds: number,
    isPaused: boolean,
  ): Promise<void> {
    if (!_permissionGranted) return;

    const title = isPaused
      ? `[Paused] ${phase.label}`
      : phase.label;

    const body = isPaused
      ? `${formatMMSS(remainingSeconds)} remaining — tap to resume`
      : `${formatMMSS(remainingSeconds)} left in phase • Pranayama`;

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: SESSION_NOTIFICATION_IDENTIFIER,
        content: {
          title,
          body,
          data: { navigate: 'ActiveSession' },
          color: '#7C5C3B',
          sticky: true,        // Android only: non-dismissable (setOngoing)
          autoDismiss: false,  // Android only: don't auto-dismiss on tap
          vibrate: [],         // suppress vibration on updates
        },
        trigger: null, // deliver immediately
      });
    } catch (e) {
      // Notification failures must never crash or interrupt the session (D15)
      console.warn('[NotificationService] Failed to update notification:', e);
    }
  },

  /**
   * Dismiss the session notification.
   * Call on session completion or manual exit.
   */
  async dismiss(): Promise<void> {
    try {
      await Notifications.dismissNotificationAsync(SESSION_NOTIFICATION_IDENTIFIER);
      await Notifications.cancelScheduledNotificationAsync(SESSION_NOTIFICATION_IDENTIFIER);
    } catch {
      // Ignore dismissal errors — session is already ending
    }
  },

  /**
   * Reset the cached permission state. For testing only.
   */
  _resetForTesting(): void {
    _permissionGranted = null;
  },
};

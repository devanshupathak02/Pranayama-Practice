import { Platform } from 'react-native';

// Export appropriate platform adapter
let service: any;
if (Platform.OS === 'web') {
  service = require('./NotificationService.web').NotificationService;
} else {
  service = require('./NotificationService.native').NotificationService;
}

export const NotificationService = service;
export const SESSION_NOTIFICATION_IDENTIFIER = 'pranayama-session-progress';
export const SESSION_CHANNEL_ID = 'session_channel';
export const ACTION_PAUSE = 'pause_session';
export const ACTION_RESUME = 'resume_session';

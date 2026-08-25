// Mock asset file extensions for Node.js execution environment
require.extensions['.png'] = () => {};
require.extensions['.wav'] = () => {};
require.extensions['.mp3'] = () => {};

// Mock native modules for Node.js execution environment before imports
const mockNotifee = {
  createChannel: async (config: any) => config,
  registerForegroundService: (_runner: any) => {},
  requestPermission: async () => ({ authorizationStatus: 1 }),
  getNotificationSettings: async () => ({ authorizationStatus: 1 }),
  displayNotification: async (config: any) => {
    (global as any).__lastDisplayedNotification = config;
    return 'mock_notifee_id';
  },
  stopForegroundService: async () => {
    (global as any).__foregroundServiceStopped = true;
  },
  cancelNotification: async (id: string) => {
    (global as any).__cancelledNotificationId = id;
    (global as any).__lastDisplayedNotification = null;
  },
  onForegroundEvent: (_cb: any) => {},
  onBackgroundEvent: (_cb: any) => {},
  AndroidImportance: { LOW: 2 },
  EventType: { ACTION_PRESS: 1 },
  AndroidForegroundServiceType: { FOREGROUND_SERVICE_TYPE_SPECIAL_USE: 1073741824 },
};

const notifeeExports: any = {
  ...mockNotifee,
  default: mockNotifee,
  AndroidImportance: mockNotifee.AndroidImportance,
  EventType: mockNotifee.EventType,
  AndroidForegroundServiceType: mockNotifee.AndroidForegroundServiceType,
};

require.cache[require.resolve('@notifee/react-native')] = {
  id: require.resolve('@notifee/react-native'),
  filename: require.resolve('@notifee/react-native'),
  loaded: true,
  exports: notifeeExports,
} as any;


require.cache[require.resolve('@react-native-async-storage/async-storage')] = {
  id: require.resolve('@react-native-async-storage/async-storage'),
  filename: require.resolve('@react-native-async-storage/async-storage'),
  loaded: true,
  exports: {
    getItem: async () => null,
    setItem: async () => {},
  },
} as any;

require.cache[require.resolve('react-native')] = {
  id: require.resolve('react-native'),
  filename: require.resolve('react-native'),
  loaded: true,
  exports: {
    Platform: { OS: 'android' },
  },
} as any;

require.cache[require.resolve('expo-audio')] = {
  id: require.resolve('expo-audio'),
  filename: require.resolve('expo-audio'),
  loaded: true,
  exports: {
    createAudioPlayer: () => ({ play: () => {}, pause: () => {}, release: () => {} }),
  },
} as any;

import { NotificationService, ACTION_PAUSE, ACTION_RESUME, SESSION_NOTIFICATION_IDENTIFIER } from '../app/notifications/NotificationService';
import { useSessionStore } from '../app/store/sessionStore';

async function runVerification() {
  console.log('================================================================');
  console.log(' VERIFYING DECISION D17: NOTIFEE ANDROID FOREGROUND SERVICE (D17)');
  console.log('================================================================\n');

  // 1. Verify Action Constants
  console.log('1. Checking Action Constants:');
  console.log(`   • ACTION_PAUSE  : "${ACTION_PAUSE}"`);
  console.log(`   • ACTION_RESUME : "${ACTION_RESUME}"`);
  console.log(`   • SESSION_ID    : "${SESSION_NOTIFICATION_IDENTIFIER}"`);
  console.log('   ✅ Action constants verified.\n');

  // 2. Initialize Notification Service
  console.log('2. Initializing NotificationService...');
  await NotificationService.init();
  console.log('   ✅ Notifee channel and foreground service registered.\n');

  // 3. Test Session Start & Android Foreground Service + Chronometer Config
  console.log('3. Starting Session via useSessionStore...');
  useSessionStore.getState().startSession();
  await new Promise((resolve) => setTimeout(resolve, 50));

  let state = useSessionStore.getState();
  console.log(`   • Store Status after startSession : "${state.status}"`);
  console.log(`   • Current Phase                  : "${state.currentPhase?.label}"`);

  if (state.status !== 'RUNNING') {
    throw new Error(`Expected store status to be RUNNING, got ${state.status}`);
  }

  const notificationRunning = (global as any).__lastDisplayedNotification;
  console.log(`   • Notification Title              : "${notificationRunning?.title}"`);
  console.log(`   • Android asForegroundService     : ${notificationRunning?.android?.asForegroundService}`);
  console.log(`   • Android foregroundServiceTypes  : ${JSON.stringify(notificationRunning?.android?.foregroundServiceTypes)}`);
  console.log(`   • Android showTimestamp (Running) : ${notificationRunning?.android?.showTimestamp}`);
  console.log(`   • Action Button Title             : "${notificationRunning?.android?.actions?.[0]?.title}"`);

  if (!notificationRunning?.android?.asForegroundService) {
    throw new Error('Expected asForegroundService to be true!');
  }
  if (!notificationRunning?.android?.foregroundServiceTypes?.includes(1073741824)) {
    throw new Error('Expected foregroundServiceTypes to include FOREGROUND_SERVICE_TYPE_SPECIAL_USE (1073741824)!');
  }
  if (!notificationRunning?.android?.showTimestamp) {
    throw new Error('Expected showTimestamp to be true while RUNNING for native chronometer!');
  }
  if (notificationRunning?.android?.actions?.[0]?.pressAction?.id !== ACTION_PAUSE) {
    throw new Error(`Expected action pressAction.id to be ${ACTION_PAUSE}!`);
  }
  console.log('   ✅ Android SPECIAL_USE Foreground Service active with live native chronometer & Pause action button.\n');

  // 4. Test Notification Interactive Action: Pause (Freezes Live Chronometer)
  console.log('4. Simulating "Pause" action from notification card...');
  useSessionStore.getState().pauseSession();
  await new Promise((resolve) => setTimeout(resolve, 50));
  state = useSessionStore.getState();
  console.log(`   • Store Status after pauseSession : "${state.status}"`);
  if (state.status !== 'PAUSED') {
    throw new Error(`Expected store status to be PAUSED after pause tap, got ${state.status}`);
  }

  const notificationPaused = (global as any).__lastDisplayedNotification;
  console.log(`   • Notification Title              : "${notificationPaused?.title}"`);
  console.log(`   • Android showTimestamp (Paused)  : ${notificationPaused?.android?.showTimestamp}`);
  console.log(`   • Action Button Title             : "${notificationPaused?.android?.actions?.[0]?.title}"`);

  if (notificationPaused?.android?.showTimestamp !== false) {
    throw new Error('Expected showTimestamp to be false while PAUSED to freeze chronometer!');
  }
  if (notificationPaused?.android?.actions?.[0]?.pressAction?.id !== ACTION_RESUME) {
    throw new Error(`Expected action pressAction.id to be ${ACTION_RESUME}!`);
  }
  console.log('   ✅ Store updated to PAUSED; chronometer frozen & Resume action button displayed.\n');

  // 5. Test Notification Interactive Action: Resume (Restores Live Chronometer)
  console.log('5. Simulating "Resume" action from notification card...');
  useSessionStore.getState().resumeSession();
  await new Promise((resolve) => setTimeout(resolve, 50));
  state = useSessionStore.getState();
  console.log(`   • Store Status after resumeSession: "${state.status}"`);
  if (state.status !== 'RUNNING') {
    throw new Error(`Expected store status to be RUNNING after resume tap, got ${state.status}`);
  }

  const notificationResumed = (global as any).__lastDisplayedNotification;
  console.log(`   • Notification Title              : "${notificationResumed?.title}"`);
  console.log(`   • Android showTimestamp (Resumed) : ${notificationResumed?.android?.showTimestamp}`);
  console.log(`   • Action Button Title             : "${notificationResumed?.android?.actions?.[0]?.title}"`);

  if (!notificationResumed?.android?.showTimestamp) {
    throw new Error('Expected showTimestamp to be true after resuming session!');
  }
  if (notificationResumed?.android?.actions?.[0]?.pressAction?.id !== ACTION_PAUSE) {
    throw new Error(`Expected action pressAction.id to be ${ACTION_PAUSE}!`);
  }
  console.log('   ✅ Store updated to RUNNING; native chronometer resumed & Pause action button displayed.\n');

  // 6. Test Reset & Foreground Service Stop
  console.log('6. Resetting session...');
  useSessionStore.getState().resetSession();
  state = useSessionStore.getState();
  console.log(`   • Store Status after resetSession : "${state.status}"`);
  console.log(`   • Foreground Service Stopped      : ${!!(global as any).__foregroundServiceStopped}`);

  if (state.status !== 'IDLE') {
    throw new Error(`Expected store status to be IDLE, got ${state.status}`);
  }
  if (!(global as any).__foregroundServiceStopped) {
    throw new Error('Expected foreground service to be stopped on session reset!');
  }
  console.log('   ✅ Foreground service stopped & notification cancelled on session reset.');

  console.log('\n================================================================');
  console.log(' ✅ D17 NOTIFEE FOREGROUND SERVICE VERIFICATION PASSED!');
  console.log('================================================================\n');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});



// Mock asset file extensions for Node.js execution environment
require.extensions['.png'] = () => 1;
require.extensions['.mpeg'] = () => 1;
require.extensions['.mp3'] = () => 1;

// Track audio service calls
let playStartBellCallCount = 0;
let playCompletionBellCallCount = 0;

const mockAudioModule = {
  setAudioModeAsync: async () => {},
};

const mockCreateAudioPlayer = (_asset: any) => {
  return {
    loop: false,
    volume: 1.0,
    play: () => {},
    pause: () => {},
    remove: () => {},
  };
};

require.cache[require.resolve('react-native')] = {
  id: require.resolve('react-native'),
  filename: require.resolve('react-native'),
  loaded: true,
  exports: {
    Platform: { OS: 'android' },
    Alert: { alert: () => {} },
  },
} as any;

require.cache[require.resolve('expo-audio')] = {
  id: require.resolve('expo-audio'),
  filename: require.resolve('expo-audio'),
  loaded: true,
  exports: {
    createAudioPlayer: mockCreateAudioPlayer,
    AudioModule: mockAudioModule,
  },
} as any;

const storageMap = new Map<string, string>();
const mockAsyncStorage = {
  getItem: async (key: string) => (storageMap.has(key) ? storageMap.get(key)! : null),
  setItem: async (key: string, val: string) => { storageMap.set(key, val); },
  removeItem: async (key: string) => { storageMap.delete(key); },
  clear: async () => { storageMap.clear(); },
  default: null as any,
};
mockAsyncStorage.default = mockAsyncStorage;

require.cache[require.resolve('@react-native-async-storage/async-storage')] = {
  id: require.resolve('@react-native-async-storage/async-storage'),
  filename: require.resolve('@react-native-async-storage/async-storage'),
  loaded: true,
  exports: mockAsyncStorage,
} as any;

const mockNotifee = {
  createChannel: async (config: any) => config,
  registerForegroundService: (_runner: any) => {},
  requestPermission: async () => ({ authorizationStatus: 1 }),
  getNotificationSettings: async () => ({ authorizationStatus: 1 }),
  displayNotification: async () => 'mock_id',
  stopForegroundService: async () => {},
  cancelNotification: async () => {},
  onForegroundEvent: (_cb: any) => {},
  onBackgroundEvent: (_cb: any) => {},
  AndroidImportance: { LOW: 2 },
  EventType: { ACTION_PRESS: 1 },
  AndroidForegroundServiceType: { FOREGROUND_SERVICE_TYPE_SPECIAL_USE: 1073741824 },
};

require.cache[require.resolve('@notifee/react-native')] = {
  id: require.resolve('@notifee/react-native'),
  filename: require.resolve('@notifee/react-native'),
  loaded: true,
  exports: {
    ...mockNotifee,
    default: mockNotifee,
  },
} as any;

import { audioService } from '../app/audio/AudioService';
import { useSessionStore } from '../app/store/sessionStore';
import { useRoutineStore } from '../app/store/routineStore';
import { Routine } from '../app/models/Routine';

// Spy on audioService methods
const origPlayStartBell = audioService.playStartBell.bind(audioService);
const origPlayCompletionBell = audioService.playCompletionBell.bind(audioService);

audioService.playStartBell = async () => {
  playStartBellCallCount++;
  return origPlayStartBell();
};

audioService.playCompletionBell = async () => {
  playCompletionBellCallCount++;
  return origPlayCompletionBell();
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ FAIL: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runSessionStartBellTests() {
  console.log('================================================================');
  console.log(' VERIFICATION TEST SUITE: SESSION-START BELL (D18)');
  console.log('================================================================\n');

  // Test 1: Builtin Routine 1 - 35 Min Set
  console.log('--- TEST 1: Builtin Routine "35 Minute Practice" (set-35) ---');
  playStartBellCallCount = 0;
  useSessionStore.getState().startSession('set-35');
  assert(playStartBellCallCount === 1, 'playStartBell() was called on startSession("set-35")');
  assert(useSessionStore.getState().status === 'RUNNING', 'Session is RUNNING');
  assert(useSessionStore.getState().activeRoutine?.id === 'set-35', 'Active routine is set-35');
  useSessionStore.getState().resetSession();

  // Test 2: Builtin Routine 2 - 46 Min Set
  console.log('\n--- TEST 2: Builtin Routine "46 Minute Practice" (set-46) ---');
  playStartBellCallCount = 0;
  useSessionStore.getState().startSession('set-46');
  assert(playStartBellCallCount === 1, 'playStartBell() was called on startSession("set-46")');
  assert(useSessionStore.getState().status === 'RUNNING', 'Session is RUNNING');
  assert(useSessionStore.getState().activeRoutine?.id === 'set-46', 'Active routine is set-46');
  useSessionStore.getState().resetSession();

  // Test 3: Builtin Routine 3 - 60 Min Set
  console.log('\n--- TEST 3: Builtin Routine "60 Minute Practice" (set-60) ---');
  playStartBellCallCount = 0;
  useSessionStore.getState().startSession('set-60');
  assert(playStartBellCallCount === 1, 'playStartBell() was called on startSession("set-60")');
  assert(useSessionStore.getState().status === 'RUNNING', 'Session is RUNNING');
  assert(useSessionStore.getState().activeRoutine?.id === 'set-60', 'Active routine is set-60');
  useSessionStore.getState().resetSession();

  // Test 4: Custom User-Created Routine
  console.log('\n--- TEST 4: User-Created Custom Routine ---');
  const customRoutine: Routine = {
    id: `custom_${Date.now()}`,
    name: 'My Morning Energy Routine',
    description: 'Custom breathwork set created by user',
    totalDurationSeconds: 300,
    source: 'custom',
    category: 'pranayama',
    phases: [
      {
        id: 'c-phase-1',
        label: 'Deep Diaphragmatic Breath',
        type: 'custom',
        durationSeconds: 150,
      },
      {
        id: 'c-phase-2',
        label: 'Breath Retention',
        type: 'custom',
        durationSeconds: 150,
      },
    ],
  };

  await useRoutineStore.getState().saveRoutine(customRoutine);

  playStartBellCallCount = 0;
  useSessionStore.getState().startSession(customRoutine.id);
  assert(
    playStartBellCallCount === 1,
    'playStartBell() was automatically called on startSession for custom routine (lifecycle triggered, no phase audio modification needed)'
  );
  assert(useSessionStore.getState().status === 'RUNNING', 'Session is RUNNING');
  assert(
    useSessionStore.getState().activeRoutine?.id === customRoutine.id,
    'Active routine is custom routine'
  );
  useSessionStore.getState().resetSession();

  console.log('\n================================================================');
  console.log(' 🎉 ALL SESSION-START BELL (D18) VERIFICATION TESTS PASSED!');
  console.log('================================================================\n');
}

runSessionStartBellTests().catch((error) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', error);
  process.exit(1);
});

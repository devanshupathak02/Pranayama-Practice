// Mock asset file extensions for Node.js execution environment
require.extensions['.png'] = () => 1;
require.extensions['.mpeg'] = () => 1;
require.extensions['.mp3'] = () => 1;

// In-memory AsyncStorage mock to verify genuine persistence
const storageMap = new Map<string, string>();

const mockAsyncStorage = {
  getItem: async (key: string) => {
    return storageMap.has(key) ? storageMap.get(key)! : null;
  },
  setItem: async (key: string, value: string) => {
    storageMap.set(key, value);
  },
  removeItem: async (key: string) => {
    storageMap.delete(key);
  },
  clear: async () => {
    storageMap.clear();
  },
  default: null as any,
};
mockAsyncStorage.default = mockAsyncStorage;

require.cache[require.resolve('@react-native-async-storage/async-storage')] = {
  id: require.resolve('@react-native-async-storage/async-storage'),
  filename: require.resolve('@react-native-async-storage/async-storage'),
  loaded: true,
  exports: mockAsyncStorage,
} as any;

// Imports after mocking AsyncStorage
import { useRoutineStore } from '../app/store/routineStore';
import { getRoutineById, isCustomRoutine } from '../app/data/routines';
import { loadCustomRoutines } from '../app/storage/db';
import { Routine } from '../app/models/Routine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ FAIL: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runEndToEndDeleteTests() {
  console.log('================================================================');
  console.log(' VERIFICATION TEST SUITE: CUSTOM ROUTINE DELETION END-TO-END');
  console.log('================================================================\n');

  // Step 1: Initial load
  console.log('--- TEST 1: Initial Store State ---');
  await useRoutineStore.getState().loadRoutines();
  const initialRoutines = useRoutineStore.getState().routines;
  const initialCount = initialRoutines.length;
  assert(initialCount >= 5, `Initial routines loaded (count = ${initialCount})`);

  // Step 2: Create a Custom Routine
  console.log('\n--- TEST 2: Create & Save Custom Routine ---');
  const testRoutineId = `test-custom-routine-${Date.now()}`;
  const testCustomRoutine: Routine = {
    id: testRoutineId,
    name: 'Evening Calm Practice',
    description: 'Custom therapeutic breathing set for deep relaxation',
    totalDurationSeconds: 600,
    source: 'custom',
    category: 'pranayama',
    phases: [
      {
        id: `${testRoutineId}-p1`,
        label: 'Gentle Inhale & Exhale',
        type: 'pranayama',
        durationSeconds: 300,
      },
      {
        id: `${testRoutineId}-p2`,
        label: 'Witness Meditation',
        type: 'witness',
        durationSeconds: 300,
      },
    ],
  };

  await useRoutineStore.getState().saveRoutine(testCustomRoutine);

  // Verify custom routine is in AsyncStorage
  const storageRoutines = await loadCustomRoutines();
  assert(
    storageRoutines.some((r) => r.id === testRoutineId),
    'Custom routine is stored in persistent storage (AsyncStorage)'
  );

  // Verify custom routine is in Zustand store immediately
  const routinesAfterSave = useRoutineStore.getState().routines;
  assert(
    routinesAfterSave.some((r) => r.id === testRoutineId),
    'Custom routine is immediately present in useRoutineStore'
  );
  assert(
    routinesAfterSave.length === initialCount + 1,
    `Routines count incremented to ${routinesAfterSave.length}`
  );

  // Verify lookup via getRoutineById and ROUTINES proxy
  const retrievedRoutine = getRoutineById(testRoutineId);
  assert(retrievedRoutine !== undefined, 'getRoutineById successfully found custom routine');
  assert(retrievedRoutine?.name === 'Evening Calm Practice', 'Retrieved routine data matches');
  assert(isCustomRoutine(retrievedRoutine), 'isCustomRoutine correctly identifies the custom routine');

  // Step 3: Delete the Custom Routine
  console.log('\n--- TEST 3: Delete Custom Routine (Immediate Effect) ---');
  await useRoutineStore.getState().deleteRoutine(testRoutineId);

  // Verify custom routine is removed from Zustand store IMMEDIATELY (no reload needed)
  const routinesAfterDelete = useRoutineStore.getState().routines;
  assert(
    !routinesAfterDelete.some((r) => r.id === testRoutineId),
    'Custom routine is IMMEDIATELY removed from useRoutineStore (Home list updates without restart)'
  );
  assert(
    routinesAfterDelete.length === initialCount,
    `Routines count restored to ${routinesAfterDelete.length}`
  );

  // Step 4: Stale reference / getRoutineById gracefully returns undefined
  console.log('\n--- TEST 4: Stale Reference Graceful Handling ---');
  const staleLookup = getRoutineById(testRoutineId);
  assert(
    staleLookup === undefined,
    'getRoutineById for deleted ID returns undefined without throwing'
  );

  // Step 5: Simulate App Restart / Reload
  console.log('\n--- TEST 5: App Restart Simulation (Persistent Deletion) ---');
  // Re-read storage directly to confirm it is genuinely deleted
  const storageAfterDelete = await loadCustomRoutines();
  assert(
    !storageAfterDelete.some((r) => r.id === testRoutineId),
    'Custom routine is permanently gone from persistent storage'
  );

  // Simulate app relaunch by invoking loadRoutines fresh
  await useRoutineStore.getState().loadRoutines();
  const routinesAfterRestart = useRoutineStore.getState().routines;
  assert(
    !routinesAfterRestart.some((r) => r.id === testRoutineId),
    'Custom routine is STILL genuinely absent after full reload/restart'
  );
  assert(
    routinesAfterRestart.length === initialCount,
    'All built-in routines remain intact and unmodified'
  );

  // Step 6: Idempotent deletion of non-existent ID
  console.log('\n--- TEST 6: Idempotency & Safety on Non-existent IDs ---');
  await useRoutineStore.getState().deleteRoutine('non-existent-id-12345');
  const routinesAfterNoopDelete = useRoutineStore.getState().routines;
  assert(
    routinesAfterNoopDelete.length === initialCount,
    'Deleting non-existent ID does not corrupt store or crash'
  );

  console.log('\n================================================================');
  console.log(' 🎉 ALL END-TO-END DELETION VERIFICATION TESTS PASSED!');
  console.log('================================================================\n');
}

runEndToEndDeleteTests().catch((error) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', error);
  process.exit(1);
});

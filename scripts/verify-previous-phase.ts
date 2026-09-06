import { TimerEngine } from '../app/timer/TimerEngine';
import { Phase } from '../app/models/Phase';

function formatMMSS(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message} | Expected: ${expected}, Got: ${actual}`);
  }
  console.log(`  ✓ ${message}: ${actual} (${typeof actual === 'number' ? formatMMSS(actual) : actual})`);
}

async function runTests() {
  console.log('================================================================');
  console.log(' VERIFICATION TEST SUITE: PREVIOUS PHASE CONTROL & DERIVED TIME');
  console.log(' ROUTINE: "35 Min Set" (set-35)');
  console.log('================================================================\n');

  const set35Phases: Phase[] = [
    { id: 'set-35-settle', label: 'Settle in / Meditation', durationSeconds: 120, type: 'meditation' },
    { id: 'set-35-chant-3', label: 'Chant Om 3 Times', durationSeconds: 60, type: 'chant' },
    { id: 'set-35-bhastrika', label: 'Bhastrika', durationSeconds: 180, type: 'pranayama' },
    { id: 'set-35-witness-1', label: 'Normal Breath / Witness', durationSeconds: 60, type: 'witness' },
    { id: 'set-35-kapalbhati', label: 'Kapalbhati', durationSeconds: 240, type: 'pranayama' },
    { id: 'set-35-witness-2', label: 'Normal Breath / Witness', durationSeconds: 60, type: 'witness' },
    { id: 'set-35-bahya', label: 'Bahya', durationSeconds: 180, type: 'pranayama' },
    { id: 'set-35-witness-3', label: 'Normal Breath / Witness', durationSeconds: 60, type: 'witness' },
    { id: 'set-35-ujjayi', label: 'Ujjayi', durationSeconds: 180, type: 'pranayama' },
    { id: 'set-35-witness-4', label: 'Normal Breath / Witness', durationSeconds: 60, type: 'witness' },
    { id: 'set-35-anulom-vilom', label: 'Anulom Vilom', durationSeconds: 180, type: 'pranayama' },
    { id: 'set-35-witness-5', label: 'Normal Breath / Witness', durationSeconds: 60, type: 'witness' },
    { id: 'set-35-bhramari', label: 'Bhramari', durationSeconds: 120, type: 'pranayama' },
    { id: 'set-35-witness-6', label: 'Normal Breath / Witness', durationSeconds: 60, type: 'witness' },
    { id: 'set-35-chant-5', label: 'Chant Om 5 Times', durationSeconds: 120, type: 'chant' },
    { id: 'set-35-meditation-closing', label: 'Meditation (closing)', durationSeconds: 180, type: 'meditation' },
    { id: 'set-35-shavasana', label: 'Shavasana', durationSeconds: 180, type: 'shavasana' },
    { id: 'set-35-ending', label: 'Completion bell', durationSeconds: 0, type: 'ending' },
  ];

  let phaseChangeEvents: { phase: Phase; index: number }[] = [];

  const engine = new TimerEngine(set35Phases, {
    onPhaseChange: (phase, index) => {
      phaseChangeEvents.push({ phase, index });
    },
  });

  console.log('--- TEST 1: Initial Phase 0 & Previous Button Disabled / No-op ---');
  engine.start();
  let state = engine.getState();
  assertEqual(state.status, 'RUNNING', 'Timer status');
  assertEqual(state.currentPhaseIndex, 0, 'Current phase index at start');
  assertEqual(state.currentPhaseSecondsRemaining, 120, 'Phase 0 seconds remaining');
  assertEqual(state.totalSecondsRemaining, 2100, 'Initial total seconds remaining (35:00)');
  assertEqual(phaseChangeEvents.length, 1, 'Phase change event fired for start');
  assertEqual(phaseChangeEvents[0].phase.id, 'set-35-settle', 'Phase change event phase id');

  // Attempt to call previousPhase on Phase 0 (should be no-op)
  console.log('\n  Calling previousPhase() on phase index 0...');
  engine.previousPhase();
  state = engine.getState();
  assertEqual(state.currentPhaseIndex, 0, 'Phase index is still 0 (no-op)');
  assertEqual(state.currentPhaseSecondsRemaining, 120, 'Phase 0 seconds remaining unchanged');
  assertEqual(state.totalSecondsRemaining, 2100, 'Total seconds remaining unchanged');
  assertEqual(phaseChangeEvents.length, 1, 'No duplicate phase change event triggered');

  console.log('\n--- TEST 2: Skip Forward Twice (Phase 0 -> Phase 1 -> Phase 2) ---');
  // Skip 1
  engine.skipPhase();
  state = engine.getState();
  assertEqual(state.currentPhaseIndex, 1, 'After 1st skip: Current phase index is 1 ("Chant Om 3 Times")');
  assertEqual(state.currentPhaseSecondsRemaining, 60, 'Phase 1 full duration');
  assertEqual(state.totalSecondsRemaining, 1980, 'Total seconds remaining dropped to 1980s (33:00)');

  // Skip 2
  engine.skipPhase();
  state = engine.getState();
  assertEqual(state.currentPhaseIndex, 2, 'After 2nd skip: Current phase index is 2 ("Bhastrika")');
  assertEqual(state.currentPhaseSecondsRemaining, 180, 'Phase 2 full duration');
  assertEqual(state.totalSecondsRemaining, 1920, 'Total seconds remaining dropped to 1920s (32:00)');
  assertEqual(phaseChangeEvents.length, 3, 'Total phase change events after 2 skips');

  console.log('\n--- TEST 3: Tap Previous Once (Phase 2 -> Phase 1) ---');
  engine.previousPhase();
  state = engine.getState();
  assertEqual(state.currentPhaseIndex, 1, 'Landed back on phase index 1 ("Chant Om 3 Times")');
  assertEqual(state.currentPhase?.label, 'Chant Om 3 Times', 'Phase label is correct');
  assertEqual(state.currentPhaseSecondsRemaining, 60, 'Phase 1 is at full 60s duration');
  assertEqual(state.totalSecondsRemaining, 1980, 'Total seconds remaining correctly INCREASED from 1920s (32:00) to 1980s (33:00)');
  assertEqual(phaseChangeEvents.length, 4, 'Pipeline invoked: onPhaseChange fired on previousPhase');
  assertEqual(phaseChangeEvents[3].phase.id, 'set-35-chant-3', 'onPhaseChange received Phase 1 object');
  assertEqual(phaseChangeEvents[3].index, 1, 'onPhaseChange received index 1');

  console.log('\n--- TEST 4: Tap Previous Again (Phase 1 -> Phase 0) ---');
  engine.previousPhase();
  state = engine.getState();
  assertEqual(state.currentPhaseIndex, 0, 'Landed back on phase index 0 ("Settle in / Meditation")');
  assertEqual(state.currentPhase?.label, 'Settle in / Meditation', 'Phase label is correct');
  assertEqual(state.currentPhaseSecondsRemaining, 120, 'Phase 0 is at full 120s duration');
  assertEqual(state.totalSecondsRemaining, 2100, 'Total seconds remaining correctly INCREASED from 1980s (33:00) to 2100s (35:00)');
  assertEqual(phaseChangeEvents.length, 5, 'Pipeline invoked: onPhaseChange fired on previousPhase');
  assertEqual(phaseChangeEvents[4].phase.id, 'set-35-settle', 'onPhaseChange received Phase 0 object');
  assertEqual(phaseChangeEvents[4].index, 0, 'onPhaseChange received index 0');

  console.log('\n--- TEST 5: Tap Previous on Phase 0 again (Boundary Guard) ---');
  engine.previousPhase();
  state = engine.getState();
  assertEqual(state.currentPhaseIndex, 0, 'Still on phase index 0 (no underflow)');
  assertEqual(state.totalSecondsRemaining, 2100, 'Total seconds remaining is still 2100s');
  assertEqual(phaseChangeEvents.length, 5, 'No extra onPhaseChange events on boundary no-op');

  console.log('\n--- TEST 6: Previous Phase while PAUSED ---');
  engine.skipPhase(); // Go to Phase 1
  engine.pause();
  state = engine.getState();
  assertEqual(state.status, 'PAUSED', 'Timer is PAUSED on Phase 1');

  engine.previousPhase(); // Go back to Phase 0 while paused
  state = engine.getState();
  assertEqual(state.status, 'PAUSED', 'Timer remains PAUSED');
  assertEqual(state.currentPhaseIndex, 0, 'Current phase index is 0');
  assertEqual(state.currentPhaseSecondsRemaining, 120, 'Phase 0 full duration 120s while paused');
  assertEqual(state.totalSecondsRemaining, 2100, 'Total seconds remaining 2100s');

  engine.resume();
  state = engine.getState();
  assertEqual(state.status, 'RUNNING', 'Timer resumed and RUNNING on Phase 0');
  assertEqual(state.currentPhaseIndex, 0, 'Phase index is 0 after resume');

  console.log('\n================================================================');
  console.log(' 🎉 ALL PREVIOUS PHASE UNIT & INTEGRATION TESTS PASSED!');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});

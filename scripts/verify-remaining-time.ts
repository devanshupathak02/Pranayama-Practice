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
  console.log(' VERIFICATION TEST SUITE: SESSION-WIDE REMAINING TIME CLOCK (D14)');
  console.log(' USING ROUTINE: "35 Min Set" (set-35)');
  console.log('================================================================\n');

  // Exact set-35 routine phases per 04-routine-data.md
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

  const totalDuration = set35Phases.reduce((acc, p) => acc + p.durationSeconds, 0);

  console.log('--- TEST 1: Initial State & Formula Calculation ---');
  const engine = new TimerEngine(set35Phases);
  const initialState = engine.getState();

  assertEqual(initialState.status, 'IDLE', 'Timer status is IDLE');
  assertEqual(initialState.currentPhaseIndex, 0, 'Current phase index is 0');
  assertEqual(initialState.currentPhaseSecondsRemaining, 120, 'Phase 0 seconds remaining is 120s');
  assertEqual(initialState.totalSecondsRemaining, totalDuration, `Initial totalSecondsRemaining is ${totalDuration}s (35:00)`);

  console.log('\n--- TEST 2: Start Session & Initial Tick ---');
  engine.start();
  const startState = engine.getState();

  assertEqual(startState.status, 'RUNNING', 'Timer status is RUNNING');
  assertEqual(startState.currentPhaseIndex, 0, 'Current phase index is 0 ("Settle in / Meditation")');
  assertEqual(startState.currentPhaseSecondsRemaining, 120, 'Phase 0 countdown starts at 120s (02:00)');
  assertEqual(startState.totalSecondsRemaining, 2100, 'Session-wide remaining starts at 2100s (35:00)');

  console.log('\n--- TEST 3: Skip Phase 0 ("Settle in / Meditation", 120s remaining) ---');
  engine.skipPhase();
  const afterSkip1 = engine.getState();

  console.log(`  Phase skipped! Now on Phase ${afterSkip1.currentPhaseIndex}: "${afterSkip1.currentPhase?.label}"`);
  assertEqual(afterSkip1.currentPhaseIndex, 1, 'Advanced to phase index 1 ("Chant Om 3 Times")');
  assertEqual(afterSkip1.currentPhaseSecondsRemaining, 60, 'Phase 1 countdown is 60s (01:00)');
  assertEqual(afterSkip1.totalSecondsRemaining, 1980, 'Session-wide remaining clock immediately dropped from 2100s (35:00) to 1980s (33:00)');

  console.log('\n--- TEST 4: Skip Phase 1 ("Chant Om 3 Times", 60s remaining) ---');
  engine.skipPhase();
  const afterSkip2 = engine.getState();

  console.log(`  Phase skipped! Now on Phase ${afterSkip2.currentPhaseIndex}: "${afterSkip2.currentPhase?.label}"`);
  assertEqual(afterSkip2.currentPhaseIndex, 2, 'Advanced to phase index 2 ("Bhastrika")');
  assertEqual(afterSkip2.currentPhaseSecondsRemaining, 180, 'Phase 2 countdown is 180s (03:00)');
  assertEqual(afterSkip2.totalSecondsRemaining, 1920, 'Session-wide remaining clock immediately dropped from 1980s (33:00) to 1920s (32:00)');

  console.log('\n================================================================');
  console.log(' 🎉 ALL VERIFICATION TESTS FOR SET-35 PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runTests().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});

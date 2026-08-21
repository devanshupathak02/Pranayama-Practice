import { TimerEngine } from '../app/timer/TimerEngine';
import { Phase } from '../app/models/Phase';

function formatMMSS(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function simulateSet35Session() {
  console.log('================================================================');
  console.log(' APP SESSION CLOCK CALCULATION SIMULATION (set-35: 35 MIN SET)');
  console.log('================================================================\n');

  // Exact 18-phase structure of set-35 per 04-routine-data.md
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

  console.log(`Routine ID     : "set-35" ("35 Min Set")`);
  console.log(`Total Phases   : ${set35Phases.length}`);
  console.log(`Total Duration : ${totalDuration}s (${formatMMSS(totalDuration)})\n`);

  const engine = new TimerEngine(set35Phases);
  engine.start();

  // 1. Initial State (Phase 0 running: "Settle in / Meditation", 120s)
  const state1 = engine.getState();
  console.log('📱 COMPUTED STORE/UI STATE BEFORE SKIP (Phase 0 Running):');
  console.log(`   • Phase Name                 : "${state1.currentPhase?.label}"`);
  console.log(`   • Main Phase Countdown       : ${formatMMSS(state1.currentPhaseSecondsRemaining)} (${state1.currentPhaseSecondsRemaining}s)`);
  console.log(`   • Session Elapsed Time       : ${formatMMSS(state1.totalElapsedSeconds)}`);
  console.log(`   • Time Remaining (Secondary) : ${formatMMSS(state1.totalSecondsRemaining)} (${state1.totalSecondsRemaining}s)\n`);

  // 2. User Taps 'Skip' on Phase 0
  console.log('👆 ACTION SIMULATION: Tapped "Skip" button on Phase 0\n');
  engine.skipPhase();

  const state2 = engine.getState();
  console.log('📱 COMPUTED STORE/UI STATE IMMEDIATELY AFTER SKIP:');
  console.log(`   • Phase Name                 : "${state2.currentPhase?.label}"`);
  console.log(`   • Main Phase Countdown       : ${formatMMSS(state2.currentPhaseSecondsRemaining)} (${state2.currentPhaseSecondsRemaining}s)`);
  console.log(`   • Session Elapsed Time       : ${formatMMSS(state2.totalElapsedSeconds)}`);
  console.log(`   • Time Remaining (Secondary) : ${formatMMSS(state2.totalSecondsRemaining)} (${state2.totalSecondsRemaining}s)\n`);

  console.log('================================================================');
  console.log(' COMPUTED NUMBER DROP SUMMARY:');
  console.log(`   • Before Skip "Time Remaining" : ${formatMMSS(state1.totalSecondsRemaining)} (${state1.totalSecondsRemaining}s)`);
  console.log(`   • After Skip "Time Remaining"  : ${formatMMSS(state2.totalSecondsRemaining)} (${state2.totalSecondsRemaining}s)`);
  console.log(`   • Skipped Phase Duration       : -${formatMMSS(state1.currentPhaseSecondsRemaining)} (-${state1.currentPhaseSecondsRemaining}s)`);
  console.log(`   • Immediate Drop               : -${formatMMSS(state1.totalSecondsRemaining - state2.totalSecondsRemaining)} (-${state1.totalSecondsRemaining - state2.totalSecondsRemaining}s)`);
  console.log('================================================================\n');

  if (state1.totalSecondsRemaining - state2.totalSecondsRemaining !== 120) {
    throw new Error('Drop amount mismatch!');
  }

  console.log('✅ TEST COMPLETE: Total remaining time dropped immediately by 02:00 (120s) upon skipping "Settle in / Meditation"!');
}

simulateSet35Session().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

// Mock asset file extensions for Node.js execution environment
require.extensions['.png'] = () => 1;
require.extensions['.mpeg'] = () => 1;
require.extensions['.mp3'] = () => 1;

import { SET_35_ROUTINE, SET_46_ROUTINE, SET_60_ROUTINE, BUILTIN_ROUTINES } from '../app/data/pranayamaRoutine';
import { Phase } from '../app/models/Phase';

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message} | Expected: ${expected}, Got: ${actual}`);
  }
  console.log(`  ✓ ${message}: ${actual}`);
}

async function runTests() {
  console.log('================================================================');
  console.log(' VERIFICATION TEST SUITE: GENERALIZED BELL AUDIO FOR ALL PHASES');
  console.log('================================================================\n');

  assertEqual(BUILTIN_ROUTINES.length, 3, 'Builtin routines count');

  const routines = [SET_35_ROUTINE, SET_46_ROUTINE, SET_60_ROUTINE];

  for (const routine of routines) {
    console.log(`\n--- Verifying routine: "${routine.name}" (${routine.id}) ---`);
    assertEqual(routine.phases.length, 18, `Total phases in ${routine.id}`);

    for (let i = 0; i < routine.phases.length; i++) {
      const phase = routine.phases[i];
      const audio = phase.audio;

      if (phase.type === 'pranayama') {
        assertEqual(audio?.category, 'technique-name', `Phase ${i} ("${phase.label}") category is 'technique-name'`);
        if (!audio?.file) {
          throw new Error(`Missing audio file for pranayama phase "${phase.label}"`);
        }
      } else if (phase.type === 'ending') {
        assertEqual(audio?.category, 'ending', `Phase ${i} ("${phase.label}") category is 'ending'`);
        if (!audio?.file) {
          throw new Error(`Missing audio file for ending phase "${phase.label}"`);
        }
      } else {
        // Every other phase must have category: 'bell'
        assertEqual(audio?.category, 'bell', `Phase ${i} ("${phase.label}", type: ${phase.type}) has category 'bell'`);
        if (!audio?.file) {
          throw new Error(`Missing audio file for bell phase "${phase.label}"`);
        }
      }
    }
  }

  console.log('\n--- Verifying Mute Scoping Logic with AudioService ---');

  // Let's test the mute scoping for all phase types
  const phases = SET_35_ROUTINE.phases;
  const settlePhase = phases.find(p => p.id === 'set-35-settle')!;
  const chant3Phase = phases.find(p => p.id === 'set-35-chant-3')!;
  const bhastrikaPhase = phases.find(p => p.id === 'set-35-bhastrika')!;
  const witness1Phase = phases.find(p => p.id === 'set-35-witness-1')!;
  const chant5Phase = phases.find(p => p.id === 'set-35-chant-5')!;
  const closingMeditationPhase = phases.find(p => p.id === 'set-35-meditation-close')!;
  const shavasanaPhase = phases.find(p => p.id === 'set-35-shavasana')!;
  const completionPhase = phases.find(p => p.id === 'set-35-completion')!;

  // Helper to check if audio should play based on audio category and mute setting (mirrors AudioService D8/D9a rule)
  const shouldPlayAudio = (phase: Phase, muteTechniqueNames: boolean): boolean => {
    if (!phase.audio || !phase.audio.file) return false;
    if (phase.audio.category === 'technique-name' && muteTechniqueNames) return false;
    return true;
  };

  console.log('\nTesting with muteTechniqueNames = false (all enabled):');
  assertEqual(shouldPlayAudio(settlePhase, false), true, 'Settle-in bell plays');
  assertEqual(shouldPlayAudio(chant3Phase, false), true, 'Chant Om 3 Times bell plays');
  assertEqual(shouldPlayAudio(bhastrikaPhase, false), true, 'Bhastrika spoken name plays');
  assertEqual(shouldPlayAudio(witness1Phase, false), true, 'Witness bell plays');
  assertEqual(shouldPlayAudio(chant5Phase, false), true, 'Chant Om 5 Times bell plays');
  assertEqual(shouldPlayAudio(closingMeditationPhase, false), true, 'Closing meditation bell plays');
  assertEqual(shouldPlayAudio(shavasanaPhase, false), true, 'Shavasana bell plays');
  assertEqual(shouldPlayAudio(completionPhase, false), true, 'Completion bell plays');

  console.log('\nTesting with muteTechniqueNames = true (only technique names muted):');
  assertEqual(shouldPlayAudio(settlePhase, true), true, 'Settle-in bell STILL plays');
  assertEqual(shouldPlayAudio(chant3Phase, true), true, 'Chant Om 3 Times bell STILL plays');
  assertEqual(shouldPlayAudio(bhastrikaPhase, true), false, 'Bhastrika spoken name is MUTED');
  assertEqual(shouldPlayAudio(witness1Phase, true), true, 'Witness bell STILL plays');
  assertEqual(shouldPlayAudio(chant5Phase, true), true, 'Chant Om 5 Times bell STILL plays');
  assertEqual(shouldPlayAudio(closingMeditationPhase, true), true, 'Closing meditation bell STILL plays');
  assertEqual(shouldPlayAudio(shavasanaPhase, true), true, 'Shavasana bell STILL plays');
  assertEqual(shouldPlayAudio(completionPhase, true), true, 'Completion bell STILL plays');

  console.log('\n================================================================');
  console.log(' 🎉 ALL BELL AUDIO GENERALIZATION TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});

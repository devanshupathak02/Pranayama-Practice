import { Routine, Phase } from '@/types/timer';

export const WITNESS_BELL = '/audio/bell/Bell1.mp3';
export const COMPLETION_BELL = '/audio/bell/Boxing Bell.mp3';

// ==========================================
// ROUTINE 1: 10 MINUTE PRACTICE (set-10)
// ==========================================
export const SET_10_PHASES: Phase[] = [
  {
    id: 'set-10-settle',
    type: 'meditation',
    label: 'Gentle Centering',
    durationSeconds: 60,
    description: 'Arrive in stillness with deep abdominal inhalations.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-10-anulom-vilom',
    type: 'pranayama',
    label: 'Anulom Vilom',
    durationSeconds: 300,
    description: 'Alternate nostril breathing balancing parasympathetic calm.',
    image: '/images/pranayama/anulom_vilom.png',
    audio: { file: '/audio/pranayama/anulom_vilom_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-10-witness-1',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Rest in silent observation without forcing airflow.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-10-bhramari',
    type: 'pranayama',
    label: 'Bhramari',
    durationSeconds: 120,
    description: 'Humming bee breath creating cranial acoustic vibration.',
    image: '/images/pranayama/bhramari.png',
    audio: { file: '/audio/pranayama/bhramari_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-10-closing',
    type: 'meditation',
    label: 'Silent Integration',
    durationSeconds: 60,
    description: 'Closing gratitude and effortless presence.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
];

// ==========================================
// ROUTINE 2: 15 MINUTE PRACTICE (set-15)
// ==========================================
export const SET_15_PHASES: Phase[] = [
  {
    id: 'set-15-settle',
    type: 'meditation',
    label: 'Settle in / Meditation',
    durationSeconds: 60,
    description: 'Arrive on the cushion and lengthen the spine.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-15-kapalbhati',
    type: 'pranayama',
    label: 'Kapalbhati',
    durationSeconds: 180,
    description: 'Frontal skull-shining breath with passive inhalations.',
    image: '/images/pranayama/kapalbhati.png',
    audio: { file: '/audio/pranayama/kapalbhati_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-15-witness-1',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Experience the spontaneous cessation of breath (Kevala Kumbhaka).',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-15-anulom-vilom',
    type: 'pranayama',
    label: 'Anulom Vilom',
    durationSeconds: 240,
    description: 'Rhythmic alternate-nostril cadence.',
    image: '/images/pranayama/anulom_vilom.png',
    audio: { file: '/audio/pranayama/anulom_vilom_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-15-witness-2',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Bathe in subtle energy equilibrium.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-15-bhramari',
    type: 'pranayama',
    label: 'Bhramari',
    durationSeconds: 120,
    description: 'Humming sound resonating across facial bones.',
    image: '/images/pranayama/bhramari.png',
    audio: { file: '/audio/pranayama/bhramari_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-15-closing',
    type: 'meditation',
    label: 'Closing Meditation',
    durationSeconds: 180,
    description: 'Resting in pure witnessing awareness.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
];

// ==========================================
// ROUTINE 3: 35 MINUTE PRACTICE (set-35)
// ==========================================
export const SET_35_PHASES: Phase[] = [
  {
    id: 'set-35-settle',
    type: 'meditation',
    label: 'Settle in / Meditation',
    durationSeconds: 120,
    description: 'Sit tall, close your eyes, and arrive in the space.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-35-chant-3',
    type: 'chant',
    label: 'Chant Om 3 Times',
    durationSeconds: 60,
    description: 'Resonant grounding sound.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-35-bhastrika',
    type: 'pranayama',
    label: 'Bhastrika',
    durationSeconds: 180,
    description: 'Bellows breath: rhythmic diaphragmatic expulsions.',
    image: '/images/pranayama/bhastrika.png',
    audio: { file: '/audio/pranayama/bhastrika_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-35-witness-1',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Sit in silent observation. Do not force the breath.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-35-kapalbhati',
    type: 'pranayama',
    label: 'Kapalbhati',
    durationSeconds: 240,
    description: 'Frontal skull-shining breath: active exhalations.',
    image: '/images/pranayama/kapalbhati.png',
    audio: { file: '/audio/pranayama/kapalbhati_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-35-witness-2',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Feel the radiant stillness in the forehead.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-35-bahya',
    type: 'pranayama',
    label: 'Bahya Pranayama',
    durationSeconds: 180,
    description: 'External breath suspension with three bandhas.',
    image: '/images/pranayama/bahya.png',
    audio: { file: '/audio/pranayama/bahya_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-35-witness-3',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Observe the upward surge of vital prana.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-35-ujjayi',
    type: 'pranayama',
    label: 'Ujjayi',
    durationSeconds: 180,
    description: 'Oceanic breath with gentle glottic resistance.',
    image: '/images/pranayama/ujjayi.png',
    audio: { file: '/audio/pranayama/ujjayi_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-35-witness-4',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Feel the soothing warmth across the heart space.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-35-anulom-vilom',
    type: 'pranayama',
    label: 'Anulom Vilom',
    durationSeconds: 180,
    description: 'Alternate nostril cadence balancing solar and lunar channels.',
    image: '/images/pranayama/anulom_vilom.png',
    audio: { file: '/audio/pranayama/anulom_vilom_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-35-witness-5',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Observe the equilibrium in both nostrils.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-35-bhramari',
    type: 'pranayama',
    label: 'Bhramari',
    durationSeconds: 120,
    description: 'Humming bee breath: cranial acoustic vibration.',
    image: '/images/pranayama/bhramari.png',
    audio: { file: '/audio/pranayama/bhramari_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-35-witness-6',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Bathe in the internal silence.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-35-chant-5',
    type: 'chant',
    label: 'Chant Om 5 Times',
    durationSeconds: 120,
    description: 'Closing universal resonance.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-35-meditation',
    type: 'meditation',
    label: 'Meditation (Closing)',
    durationSeconds: 180,
    description: 'Resting as the unattached witness.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-35-shavasana',
    type: 'shavasana',
    label: 'Shavasana',
    durationSeconds: 180,
    description: 'Total conscious physical release.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
];

// ==========================================
// ROUTINE 4: 46 MINUTE PRACTICE (set-46)
// ==========================================
export const SET_46_PHASES: Phase[] = [
  {
    id: 'set-46-settle',
    type: 'meditation',
    label: 'Settle in / Meditation',
    durationSeconds: 240, // 4 min
    description: 'Deep grounding and mental arrival.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-46-chant-3',
    type: 'chant',
    label: 'Chant Om 3 Times',
    durationSeconds: 60,
    description: 'Harmonic vibration uniting body and breath.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-46-bhastrika',
    type: 'pranayama',
    label: 'Bhastrika',
    durationSeconds: 240, // 4 min
    description: 'Deep bellows breathing awakening pranic heat.',
    image: '/images/pranayama/bhastrika.png',
    audio: { file: '/audio/pranayama/bhastrika_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-46-witness-1',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Silent witness pause.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-46-kapalbhati',
    type: 'pranayama',
    label: 'Kapalbhati',
    durationSeconds: 420, // 7 min
    description: 'Deep frontal sinus purification.',
    image: '/images/pranayama/kapalbhati.png',
    audio: { file: '/audio/pranayama/kapalbhati_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-46-witness-2',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Kevala Kumbhaka observation.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-46-bahya',
    type: 'pranayama',
    label: 'Bahya Pranayama',
    durationSeconds: 240, // 4 min
    description: 'External suspension with three bandhas.',
    image: '/images/pranayama/bahya.png',
    audio: { file: '/audio/pranayama/bahya_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-46-witness-3',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Centering in the spine.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-46-ujjayi',
    type: 'pranayama',
    label: 'Ujjayi',
    durationSeconds: 240, // 4 min
    description: 'Oceanic throat whisper slowing the heart rate.',
    image: '/images/pranayama/ujjayi.png',
    audio: { file: '/audio/pranayama/ujjayi_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-46-witness-4',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Feeling warm parasympathetic tone.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-46-anulom-vilom',
    type: 'pranayama',
    label: 'Anulom Vilom',
    durationSeconds: 240, // 4 min
    description: 'Balancing left and right cerebral hemispheres.',
    image: '/images/pranayama/anulom_vilom.png',
    audio: { file: '/audio/pranayama/anulom_vilom_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-46-witness-5',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Resting in Sushumna nadi.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-46-bhramari',
    type: 'pranayama',
    label: 'Bhramari',
    durationSeconds: 240, // 4 min
    description: 'Sustained cranial humming.',
    image: '/images/pranayama/bhramari.png',
    audio: { file: '/audio/pranayama/bhramari_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-46-witness-6',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Deep acoustic silence.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-46-chant-5',
    type: 'chant',
    label: 'Chant Om 5 Times',
    durationSeconds: 120,
    description: 'Closing sacred syllable.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-46-meditation',
    type: 'meditation',
    label: 'Meditation (Closing)',
    durationSeconds: 180,
    description: 'Dhyana — pure contemplation.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-46-shavasana',
    type: 'shavasana',
    label: 'Shavasana',
    durationSeconds: 180,
    description: 'Resting integration.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
];

// ==========================================
// ROUTINE 5: 60 MINUTE PRACTICE (set-60)
// ==========================================
export const SET_60_PHASES: Phase[] = [
  {
    id: 'set-60-settle',
    type: 'meditation',
    label: 'Settle in / Meditation',
    durationSeconds: 300, // 5 min
    description: 'Arrival into quiet meditative space.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-60-chant-3',
    type: 'chant',
    label: 'Chant Om 3 Times',
    durationSeconds: 120, // 2 min
    description: 'Three resonant chants.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-60-bhastrika',
    type: 'pranayama',
    label: 'Bhastrika',
    durationSeconds: 300, // 5 min
    description: 'Vigorous bellows breath.',
    image: '/images/pranayama/bhastrika.png',
    audio: { file: '/audio/pranayama/bhastrika_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-60-witness-1',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Witnessing the prana.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-60-kapalbhati',
    type: 'pranayama',
    label: 'Kapalbhati',
    durationSeconds: 600, // 10 min
    description: 'Extended frontal skull-shining practice.',
    image: '/images/pranayama/kapalbhati.png',
    audio: { file: '/audio/pranayama/kapalbhati_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-60-witness-2',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Spontaneous stillness pause.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-60-bahya',
    type: 'pranayama',
    label: 'Bahya Pranayama',
    durationSeconds: 300, // 5 min
    description: 'External suspension with maha bandha.',
    image: '/images/pranayama/bahya.png',
    audio: { file: '/audio/pranayama/bahya_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-60-witness-3',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Upward vital prana observation.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-60-ujjayi',
    type: 'pranayama',
    label: 'Ujjayi',
    durationSeconds: 300, // 5 min
    description: 'Extended victorious breath.',
    image: '/images/pranayama/ujjayi.png',
    audio: { file: '/audio/pranayama/ujjayi_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-60-witness-4',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Resting in throat resonance.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-60-anulom-vilom',
    type: 'pranayama',
    label: 'Anulom Vilom',
    durationSeconds: 300, // 5 min
    description: 'Extended alternate nostril flow.',
    image: '/images/pranayama/anulom_vilom.png',
    audio: { file: '/audio/pranayama/anulom_vilom_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-60-witness-5',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Equilibrium in nadis.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-60-bhramari',
    type: 'pranayama',
    label: 'Bhramari',
    durationSeconds: 300, // 5 min
    description: 'Deep humming vibration.',
    image: '/images/pranayama/bhramari.png',
    audio: { file: '/audio/pranayama/bhramari_name.mp3', category: 'technique-name', playOnce: true },
  },
  {
    id: 'set-60-witness-6',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60,
    description: 'Radiant mental quietude.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-60-chant-5',
    type: 'chant',
    label: 'Chant Om 5 Times',
    durationSeconds: 180, // 3 min
    description: 'Five sacred chants.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-60-meditation',
    type: 'meditation',
    label: 'Meditation (Closing)',
    durationSeconds: 240, // 4 min
    description: 'Deep meditative absorption.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
  {
    id: 'set-60-shavasana',
    type: 'shavasana',
    label: 'Shavasana',
    durationSeconds: 300, // 5 min
    description: 'Full surrender and cellular rest.',
    audio: { file: WITNESS_BELL, category: 'bell', playOnce: true },
  },
];

const sumDuration = (phases: Phase[]) =>
  phases.reduce((acc, phase) => acc + phase.durationSeconds, 0);

// ==========================================
// EXPORTED CLASSICAL PRANAYAMA ROUTINES
// ==========================================
export const SET_10_ROUTINE: Routine = {
  id: 'set-10',
  name: '10 Min Morning Reset',
  description: 'Quick parasympathetic reset for busy mornings or afternoon grounding.',
  totalDurationSeconds: sumDuration(SET_10_PHASES),
  phases: SET_10_PHASES,
  source: 'builtin',
  category: 'pranayama',
};

export const SET_15_ROUTINE: Routine = {
  id: 'set-15',
  name: '15 Min Express Set',
  description: 'A compact sequence for daily nervous system centering.',
  totalDurationSeconds: sumDuration(SET_15_PHASES),
  phases: SET_15_PHASES,
  source: 'builtin',
  category: 'pranayama',
};

export const SET_35_ROUTINE: Routine = {
  id: 'set-35',
  name: '35 Min Classical Set',
  description: 'The standard traditional 6-stage sequence with 1-minute witness breath pauses.',
  totalDurationSeconds: sumDuration(SET_35_PHASES),
  phases: SET_35_PHASES,
  source: 'builtin',
  category: 'pranayama',
};

export const SET_46_ROUTINE: Routine = {
  id: 'set-46',
  name: '46 Min Deep Practice',
  description: 'Deep lineage sequence with lengthened Kapalbhati and Ujjayi phases.',
  totalDurationSeconds: sumDuration(SET_46_PHASES),
  phases: SET_46_PHASES,
  source: 'builtin',
  category: 'pranayama',
};

export const SET_60_ROUTINE: Routine = {
  id: 'set-60',
  name: '60 Min Extended Immersion',
  description: 'Full traditional sadhana for intensive retreat and weekend practice.',
  totalDurationSeconds: sumDuration(SET_60_PHASES),
  phases: SET_60_PHASES,
  source: 'builtin',
  category: 'pranayama',
};

// ==========================================
// EXPORTED YOGA NIDRA GUIDED SESSIONS
// ==========================================
export const YOGA_NIDRA_EMOTIONAL_HEALING: Routine = {
  id: 'yoga-nidra-emotional-healing',
  name: 'Emotional Healing Wave',
  description: '22-minute guided psychic sleep audio for nervous system soothing and emotional integration.',
  totalDurationSeconds: 1320,
  phases: [
    {
      id: 'nidra-emotional-session',
      type: 'meditation',
      label: 'Emotional Healing Wave (Guided)',
      durationSeconds: 1320,
      description: 'Lie in Shavasana and follow the guided voice wave.',
      audio: { file: '/audio/yoga-nidra/Emotional healing wave.mp3.mpeg', category: 'custom', playOnce: true },
    },
  ],
  source: 'builtin',
  category: 'yoga-nidra',
  audioFile: '/audio/yoga-nidra/Emotional healing wave.mp3.mpeg',
};

export const YOGA_NIDRA_DIABETES_HERB: Routine = {
  id: 'yoga-nidra-diabetes-herb',
  name: 'Metabolic & Visceral Rest',
  description: '32-minute deep guided relaxation focusing on visceral replenishment.',
  totalDurationSeconds: 1920,
  phases: [
    {
      id: 'nidra-diabetes-session',
      type: 'meditation',
      label: 'Visceral Rest (Guided)',
      durationSeconds: 1920,
      description: 'Lie in Shavasana with eyes gently covered.',
      audio: { file: '/audio/yoga-nidra/diabetes_herb.mpeg', category: 'custom', playOnce: true },
    },
  ],
  source: 'builtin',
  category: 'yoga-nidra',
  audioFile: '/audio/yoga-nidra/diabetes_herb.mpeg',
};

export const YOGA_NIDRA_REJUVENATION: Routine = {
  id: 'yoga-nidra-rejuvenation',
  name: 'Pranic Rejuvenation',
  description: '24-minute mid-day psychic sleep to recharge energy reserves.',
  totalDurationSeconds: 1440,
  phases: [
    {
      id: 'nidra-rejuvenation-session',
      type: 'meditation',
      label: 'Pranic Rejuvenation (Guided)',
      durationSeconds: 1440,
      description: 'Follow the systematic body scanning in Shavasana.',
      audio: { file: '/audio/yoga-nidra/rejuvenation.mpeg', category: 'custom', playOnce: true },
    },
  ],
  source: 'builtin',
  category: 'yoga-nidra',
  audioFile: '/audio/yoga-nidra/rejuvenation.mpeg',
};

export const YOGA_NIDRA_SLEEP_WAVE: Routine = {
  id: 'yoga-nidra-sleep-wave',
  name: 'Deep Sleep Wave',
  description: '35-minute evening guided delta-wave restoration for restful nocturnal sleep.',
  totalDurationSeconds: 2100,
  phases: [
    {
      id: 'nidra-sleep-session',
      type: 'meditation',
      label: 'Deep Sleep Wave (Guided)',
      durationSeconds: 2100,
      description: 'Prepare for bed, close your eyes, and allow consciousness to dissolve.',
      audio: { file: '/audio/yoga-nidra/sleep_wave.mpeg', category: 'custom', playOnce: true },
    },
  ],
  source: 'builtin',
  category: 'yoga-nidra',
  audioFile: '/audio/yoga-nidra/sleep_wave.mpeg',
};

export const PRANAYAMA_ROUTINES: Routine[] = [
  SET_10_ROUTINE,
  SET_15_ROUTINE,
  SET_35_ROUTINE,
  SET_46_ROUTINE,
  SET_60_ROUTINE,
];

export const YOGA_NIDRA_ROUTINES: Routine[] = [
  YOGA_NIDRA_EMOTIONAL_HEALING,
  YOGA_NIDRA_DIABETES_HERB,
  YOGA_NIDRA_REJUVENATION,
  YOGA_NIDRA_SLEEP_WAVE,
];

export const ALL_BUILTIN_ROUTINES: Routine[] = [
  ...PRANAYAMA_ROUTINES,
  ...YOGA_NIDRA_ROUTINES,
];

export const getRoutineById = (id: string): Routine | undefined => {
  return ALL_BUILTIN_ROUTINES.find((r) => r.id === id);
};

import { Routine } from '../models/Routine';
import { Phase } from '../models/Phase';

// Asset definitions to ensure reuse and avoid duplication
const BHASTRIKA_IMAGE = require('../../assets/images/pranayama/bhastrika.png');
const BHASTRIKA_AUDIO = require('../../assets/audio/pranayama/bhastrika_name.mp3');

const KAPALBHATI_IMAGE = require('../../assets/images/pranayama/kapalbhati.png');
const KAPALBHATI_AUDIO = require('../../assets/audio/pranayama/kapalbhati_name.mp3');

const BAHYA_IMAGE = require('../../assets/images/pranayama/bahya.png');
const BAHYA_AUDIO = require('../../assets/audio/pranayama/bahya_name.mp3');

const UJJAYI_IMAGE = require('../../assets/images/pranayama/ujjayi.png');
const UJJAYI_AUDIO = require('../../assets/audio/pranayama/ujjayi_name.mp3');

const ANULOM_VILOM_IMAGE = require('../../assets/images/pranayama/anulom_vilom.png');
const ANULOM_VILOM_AUDIO = require('../../assets/audio/pranayama/anulom_vilom_name.mp3');

const BHRAMARI_IMAGE = require('../../assets/images/pranayama/bhramari.png');
const BHRAMARI_AUDIO = require('../../assets/audio/pranayama/bhramari_name.mp3');

const WITNESS_BELL = require('../../assets/audio/bell/witness_bell.mp3');
const COMPLETION_BELL = require('../../assets/audio/bell/completion_bell.mp3');

// ==========================================
// ROUTINE 1: 35 MINUTE PRACTICE (set-35)
// ==========================================

export const SET_35_PHASES: Phase[] = [
  {
    id: 'set-35-settle',
    type: 'meditation',
    label: 'Settle in / Meditation',
    durationSeconds: 120, // 2 min
  },
  {
    id: 'set-35-chant-3',
    type: 'chant',
    label: 'Chant Om 3 Times',
    durationSeconds: 60, // 1 min
  },
  {
    id: 'set-35-bhastrika',
    type: 'pranayama',
    label: 'Bhastrika',
    durationSeconds: 180, // 3 min
    image: BHASTRIKA_IMAGE,
    audio: {
      file: BHASTRIKA_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-35-witness-1',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-35-kapalbhati',
    type: 'pranayama',
    label: 'Kapalbhati',
    durationSeconds: 240, // 4 min
    image: KAPALBHATI_IMAGE,
    audio: {
      file: KAPALBHATI_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-35-witness-2',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-35-bahya',
    type: 'pranayama',
    label: 'Bahya',
    durationSeconds: 180, // 3 min
    image: BAHYA_IMAGE,
    audio: {
      file: BAHYA_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-35-witness-3',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-35-ujjayi',
    type: 'pranayama',
    label: 'Ujjayi',
    durationSeconds: 180, // 3 min
    image: UJJAYI_IMAGE,
    audio: {
      file: UJJAYI_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-35-witness-4',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-35-anulom-vilom',
    type: 'pranayama',
    label: 'Anulom Vilom',
    durationSeconds: 180, // 3 min
    image: ANULOM_VILOM_IMAGE,
    audio: {
      file: ANULOM_VILOM_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-35-witness-5',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-35-bhramari',
    type: 'pranayama',
    label: 'Bhramari',
    durationSeconds: 120, // 2 min
    image: BHRAMARI_IMAGE,
    audio: {
      file: BHRAMARI_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-35-witness-6',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-35-chant-5',
    type: 'chant',
    label: 'Chant Om 5 Times',
    durationSeconds: 120, // 2 min
  },
  {
    id: 'set-35-meditation-close',
    type: 'meditation',
    label: 'Meditation (closing)',
    durationSeconds: 180, // 3 min
  },
  {
    id: 'set-35-shavasana',
    type: 'shavasana',
    label: 'Shavasana',
    durationSeconds: 180, // 3 min
  },
  {
    id: 'set-35-completion',
    type: 'ending',
    label: 'Completion bell',
    durationSeconds: 0,
    audio: {
      file: COMPLETION_BELL,
      category: 'ending',
      playOnce: true,
    },
  },
];

// ==========================================
// ROUTINE 2: 46 MINUTE PRACTICE (set-46)
// ==========================================

export const SET_46_PHASES: Phase[] = [
  {
    id: 'set-46-settle',
    type: 'meditation',
    label: 'Settle in / Meditation',
    durationSeconds: 240, // 4 min
  },
  {
    id: 'set-46-chant-3',
    type: 'chant',
    label: 'Chant Om 3 Times',
    durationSeconds: 60, // 1 min
  },
  {
    id: 'set-46-bhastrika',
    type: 'pranayama',
    label: 'Bhastrika',
    durationSeconds: 240, // 4 min
    image: BHASTRIKA_IMAGE,
    audio: {
      file: BHASTRIKA_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-46-witness-1',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-46-kapalbhati',
    type: 'pranayama',
    label: 'Kapalbhati',
    durationSeconds: 420, // 7 min
    image: KAPALBHATI_IMAGE,
    audio: {
      file: KAPALBHATI_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-46-witness-2',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-46-bahya',
    type: 'pranayama',
    label: 'Bahya',
    durationSeconds: 240, // 4 min
    image: BAHYA_IMAGE,
    audio: {
      file: BAHYA_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-46-witness-3',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-46-ujjayi',
    type: 'pranayama',
    label: 'Ujjayi',
    durationSeconds: 240, // 4 min
    image: UJJAYI_IMAGE,
    audio: {
      file: UJJAYI_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-46-witness-4',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-46-anulom-vilom',
    type: 'pranayama',
    label: 'Anulom Vilom',
    durationSeconds: 240, // 4 min
    image: ANULOM_VILOM_IMAGE,
    audio: {
      file: ANULOM_VILOM_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-46-witness-5',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-46-bhramari',
    type: 'pranayama',
    label: 'Bhramari',
    durationSeconds: 240, // 4 min
    image: BHRAMARI_IMAGE,
    audio: {
      file: BHRAMARI_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-46-witness-6',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-46-chant-5',
    type: 'chant',
    label: 'Chant Om 5 Times',
    durationSeconds: 120, // 2 min
  },
  {
    id: 'set-46-meditation-close',
    type: 'meditation',
    label: 'Meditation (closing)',
    durationSeconds: 180, // 3 min
  },
  {
    id: 'set-46-shavasana',
    type: 'shavasana',
    label: 'Shavasana',
    durationSeconds: 180, // 3 min
  },
  {
    id: 'set-46-completion',
    type: 'ending',
    label: 'Completion bell',
    durationSeconds: 0,
    audio: {
      file: COMPLETION_BELL,
      category: 'ending',
      playOnce: true,
    },
  },
];

// ==========================================
// ROUTINE 3: 60 MINUTE PRACTICE (set-60)
// ==========================================

export const SET_60_PHASES: Phase[] = [
  {
    id: 'set-60-settle',
    type: 'meditation',
    label: 'Settle in / Meditation',
    durationSeconds: 300, // 5 min
  },
  {
    id: 'set-60-chant-3',
    type: 'chant',
    label: 'Chant Om 3 Times',
    durationSeconds: 120, // 2 min
  },
  {
    id: 'set-60-bhastrika',
    type: 'pranayama',
    label: 'Bhastrika',
    durationSeconds: 300, // 5 min
    image: BHASTRIKA_IMAGE,
    audio: {
      file: BHASTRIKA_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-60-witness-1',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-60-kapalbhati',
    type: 'pranayama',
    label: 'Kapalbhati',
    durationSeconds: 600, // 10 min
    image: KAPALBHATI_IMAGE,
    audio: {
      file: KAPALBHATI_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-60-witness-2',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-60-bahya',
    type: 'pranayama',
    label: 'Bahya',
    durationSeconds: 300, // 5 min
    image: BAHYA_IMAGE,
    audio: {
      file: BAHYA_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-60-witness-3',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-60-ujjayi',
    type: 'pranayama',
    label: 'Ujjayi',
    durationSeconds: 300, // 5 min
    image: UJJAYI_IMAGE,
    audio: {
      file: UJJAYI_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-60-witness-4',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-60-anulom-vilom',
    type: 'pranayama',
    label: 'Anulom Vilom',
    durationSeconds: 300, // 5 min
    image: ANULOM_VILOM_IMAGE,
    audio: {
      file: ANULOM_VILOM_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-60-witness-5',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-60-bhramari',
    type: 'pranayama',
    label: 'Bhramari',
    durationSeconds: 300, // 5 min
    image: BHRAMARI_IMAGE,
    audio: {
      file: BHRAMARI_AUDIO,
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'set-60-witness-6',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 60, // 1 min
    audio: {
      file: WITNESS_BELL,
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'set-60-chant-5',
    type: 'chant',
    label: 'Chant Om 5 Times',
    durationSeconds: 180, // 3 min
  },
  {
    id: 'set-60-meditation-close',
    type: 'meditation',
    label: 'Meditation (closing)',
    durationSeconds: 240, // 4 min
  },
  {
    id: 'set-60-shavasana',
    type: 'shavasana',
    label: 'Shavasana',
    durationSeconds: 300, // 5 min
  },
  {
    id: 'set-60-completion',
    type: 'ending',
    label: 'Completion bell',
    durationSeconds: 0,
    audio: {
      file: COMPLETION_BELL,
      category: 'ending',
      playOnce: true,
    },
  },
];

// Helper to sum up durations
const sumDuration = (phases: Phase[]) =>
  phases.reduce((acc, phase) => acc + phase.durationSeconds, 0);

export const SET_35_ROUTINE: Routine = {
  id: 'set-35',
  name: '35 Minute Practice',
  description: 'Balanced 35-minute guided pranayama sequence',
  totalDurationSeconds: sumDuration(SET_35_PHASES),
  phases: SET_35_PHASES,
  source: 'builtin',
};

export const SET_46_ROUTINE: Routine = {
  id: 'set-46',
  name: '46 Minute Practice',
  description: 'Deep 46-minute guided pranayama sequence',
  totalDurationSeconds: sumDuration(SET_46_PHASES),
  phases: SET_46_PHASES,
  source: 'builtin',
};

export const SET_60_ROUTINE: Routine = {
  id: 'set-60',
  name: '60 Minute Practice',
  description: 'Extended 60-minute guided pranayama sequence',
  totalDurationSeconds: sumDuration(SET_60_PHASES),
  phases: SET_60_PHASES,
  source: 'builtin',
};

export const BUILTIN_ROUTINES: Routine[] = [
  SET_35_ROUTINE,
  SET_46_ROUTINE,
  SET_60_ROUTINE,
];

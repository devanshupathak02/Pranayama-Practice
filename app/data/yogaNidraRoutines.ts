import { Routine } from '../models/Routine';

// Audio Assets using exact filenames from assets/audio/yoga-nidra/
const EMOTIONAL_HEALING_WAVE_AUDIO = require('../../assets/audio/yoga-nidra/Emotional healing wave.mp3.mpeg');
const DIABETES_HERB_AUDIO = require('../../assets/audio/yoga-nidra/diabetes_herb.mpeg');
const REJUVENATION_AUDIO = require('../../assets/audio/yoga-nidra/rejuvenation.mpeg');
const SLEEP_WAVE_AUDIO = require('../../assets/audio/yoga-nidra/sleep_wave.mpeg');

export const YOGA_NIDRA_EMOTIONAL_HEALING: Routine = {
  id: 'yoga-nidra-emotional-healing-wave',
  name: 'Emotional Healing Wave',
  description: 'Guided Yoga Nidra session for emotional balance, relaxation, and inner healing',
  totalDurationSeconds: 1201,
  source: 'builtin',
  category: 'yoga-nidra',
  phases: [
    {
      id: 'nidra-emotional-healing-main',
      type: 'meditation',
      label: 'Emotional Healing Wave Guided Session',
      durationSeconds: 1201,
      audio: {
        file: EMOTIONAL_HEALING_WAVE_AUDIO,
        category: 'ending',
        playOnce: true,
      },
    },
  ],
};

export const YOGA_NIDRA_DIABETES_HERB: Routine = {
  id: 'yoga-nidra-diabetes-herb',
  name: 'Diabetes Care & Health',
  description: 'Therapeutic guided Yoga Nidra for metabolic balance and physical vitality',
  totalDurationSeconds: 1800,
  source: 'builtin',
  category: 'yoga-nidra',
  phases: [
    {
      id: 'nidra-diabetes-herb-main',
      type: 'meditation',
      label: 'Diabetes Care & Health Guided Session',
      durationSeconds: 1800,
      audio: {
        file: DIABETES_HERB_AUDIO,
        category: 'ending',
        playOnce: true,
      },
    },
  ],
};

export const YOGA_NIDRA_REJUVENATION: Routine = {
  id: 'yoga-nidra-rejuvenation',
  name: 'Rejuvenation',
  description: 'Deep restorative practice to revitalize the body, breath, and mind',
  totalDurationSeconds: 1294,
  source: 'builtin',
  category: 'yoga-nidra',
  phases: [
    {
      id: 'nidra-rejuvenation-main',
      type: 'meditation',
      label: 'Rejuvenation Guided Session',
      durationSeconds: 1294,
      audio: {
        file: REJUVENATION_AUDIO,
        category: 'ending',
        playOnce: true,
      },
    },
  ],
};

export const YOGA_NIDRA_SLEEP_WAVE: Routine = {
  id: 'yoga-nidra-sleep-wave',
  name: 'Sleep Wave',
  description: 'Soothing guided Yoga Nidra to unwind and prepare for deep, restful sleep',
  totalDurationSeconds: 1451,
  source: 'builtin',
  category: 'yoga-nidra',
  phases: [
    {
      id: 'nidra-sleep-wave-main',
      type: 'meditation',
      label: 'Sleep Wave Guided Session',
      durationSeconds: 1451,
      audio: {
        file: SLEEP_WAVE_AUDIO,
        category: 'ending',
        playOnce: true,
      },
    },
  ],
};

export const YOGA_NIDRA_ROUTINES: Routine[] = [
  YOGA_NIDRA_EMOTIONAL_HEALING,
  YOGA_NIDRA_DIABETES_HERB,
  YOGA_NIDRA_REJUVENATION,
  YOGA_NIDRA_SLEEP_WAVE,
];

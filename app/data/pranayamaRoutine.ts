import { Routine } from '../models/Routine';
import { Phase } from '../models/Phase';

/**
 * Client-approved Pranayama routine data (v1).
 * Exactly 18 phases, matching spec in 04-routine-data.md.
 * Total runtime: 2070 seconds (~34 minutes 30 seconds).
 *
 * Media Assets Wired (Component 1):
 * - 7 Technique Images in assets/images/pranayama/
 * - 7 Spoken Technique Audio Files in assets/audio/pranayama/
 * - 2 Bell Chime Audio Files in assets/audio/bell/
 */
export const PRANAYAMA_PHASES: Phase[] = [
  {
    id: 'p1-prep',
    type: 'preparation',
    label: 'Preparation',
    durationSeconds: 10,
  },
  {
    id: 'p2-meditation-open',
    type: 'meditation',
    label: 'Pranav (opening meditation)',
    durationSeconds: 60,
  },
  {
    id: 'p3-bhastrika',
    type: 'pranayama',
    label: 'Bhastrika Pranayam (Bellows Breath)',
    durationSeconds: 120,
    image: require('../../assets/images/pranayama/bhastrika.png'),
    audio: {
      file: require('../../assets/audio/pranayama/bhastrika_name.mp3'),
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'p4-witness-1',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 35,
    audio: {
      file: require('../../assets/audio/bell/witness_bell.mp3'),
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'p5-kapalbhati',
    type: 'pranayama',
    label: 'Kapalbhati Pranayam',
    durationSeconds: 300,
    image: require('../../assets/images/pranayama/kapalbhati.png'),
    audio: {
      file: require('../../assets/audio/pranayama/kapalbhati_name.mp3'),
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'p6-witness-2',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 35,
    audio: {
      file: require('../../assets/audio/bell/witness_bell.mp3'),
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'p7-bahya',
    type: 'pranayama',
    label: 'Bahya Pranayam',
    durationSeconds: 120,
    image: require('../../assets/images/pranayama/bahya.png'),
    audio: {
      file: require('../../assets/audio/pranayama/bahya_name.mp3'),
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'p8-witness-3',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 35,
    audio: {
      file: require('../../assets/audio/bell/witness_bell.mp3'),
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'p9-ujjayi',
    type: 'pranayama',
    label: 'Ujjayi Pranayam',
    durationSeconds: 120,
    image: require('../../assets/images/pranayama/ujjayi.png'),
    audio: {
      file: require('../../assets/audio/pranayama/ujjayi_name.mp3'),
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'p10-witness-4',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 35,
    audio: {
      file: require('../../assets/audio/bell/witness_bell.mp3'),
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'p11-anulom-vilom',
    type: 'pranayama',
    label: 'Anulom Vilom Pranayam',
    durationSeconds: 300,
    image: require('../../assets/images/pranayama/anulom_vilom.png'),
    audio: {
      file: require('../../assets/audio/pranayama/anulom_vilom_name.mp3'),
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'p12-witness-5',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 35,
    audio: {
      file: require('../../assets/audio/bell/witness_bell.mp3'),
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'p13-bhramari',
    type: 'pranayama',
    label: 'Bhramari Pranayam',
    durationSeconds: 180,
    image: require('../../assets/images/pranayama/bhramari.png'),
    audio: {
      file: require('../../assets/audio/pranayama/bhramari_name.mp3'),
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'p14-witness-6',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 35,
    audio: {
      file: require('../../assets/audio/bell/witness_bell.mp3'),
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'p15-udgeeth',
    type: 'pranayama',
    label: 'Udgeeth Pranayam (chant Om ×5)',
    durationSeconds: 240,
    image: require('../../assets/images/pranayama/udgeeth.png'),
    audio: {
      file: require('../../assets/audio/pranayama/udgeeth_name.mp3'),
      category: 'technique-name',
      playOnce: true,
    },
  },
  {
    id: 'p16-witness-7',
    type: 'witness',
    label: 'Normal Breath / Witness',
    durationSeconds: 35,
    audio: {
      file: require('../../assets/audio/bell/witness_bell.mp3'),
      category: 'bell',
      playOnce: true,
    },
  },
  {
    id: 'p17-meditation-close',
    type: 'meditation',
    label: 'Pranav (closing meditation)',
    durationSeconds: 300,
  },
  {
    id: 'p18-completion',
    type: 'ending',
    label: 'Completion',
    durationSeconds: 0,
    audio: {
      file: require('../../assets/audio/bell/completion_bell.mp3'),
      category: 'ending',
      playOnce: true,
    },
  },
];

const TOTAL_ROUTINE_DURATION_SECONDS = PRANAYAMA_PHASES.reduce(
  (acc, phase) => acc + phase.durationSeconds,
  0
);

export const PRANAYAMA_ROUTINE: Routine = {
  id: 'pranayama-v1',
  name: 'Pranayama',
  description: 'Fixed 34-minute guided pranayama sequence with witness pauses',
  totalDurationSeconds: TOTAL_ROUTINE_DURATION_SECONDS,
  phases: PRANAYAMA_PHASES,
};

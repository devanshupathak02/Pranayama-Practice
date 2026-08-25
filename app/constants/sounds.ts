export interface SoundOption {
  id: string;
  label: string;
  description: string;
  asset: number;
}

export const WITNESS_SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'bell1',
    label: 'Bell 1',
    description: 'Clear, gentle transition chime (Default)',
    asset: require('../../assets/audio/bell/Bell1.mp3'),
  },
  {
    id: 'gong1',
    label: 'Gong 1',
    description: 'Resonant acoustic gong sound',
    asset: require('../../assets/audio/bell/Gong.mp3'),
  },
  {
    id: 'gong2',
    label: 'Gong 2',
    description: 'Deep, grounding warm gong tone',
    asset: require('../../assets/audio/bell/Gong2.mp3'),
  },
];

export const DEFAULT_WITNESS_SOUND_ID = 'bell1';

import { createAudioPlayer, AudioModule, AudioPlayer } from 'expo-audio';
import { Phase } from '../models/Phase';

/**
 * Decoupled AudioService managing audio playback using expo-audio.
 * Configured for background audio playback on iOS and Android.
 * Respects scoped audio muting (D8, D9a) and single-play audio cues (04-routine-data.md Rule 3).
 */
class AudioService {
  private activePlayer: AudioPlayer | null = null;

  constructor() {
    this.initAudioMode();
  }

  private async initAudioMode(): Promise<void> {
    try {
      if (AudioModule && typeof AudioModule.setAudioModeAsync === 'function') {
        await AudioModule.setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
      }
    } catch (error) {
      console.warn('Failed to initialize AudioModule background audio mode:', error);
    }
  }

  /**
   * Plays the audio cue for a phase if applicable.
   *
   * @param phase Target phase
   * @param muteTechniqueNames Scoped mute setting (silences only 'technique-name' category)
   */
  public async playPhaseAudio(
    phase: Phase,
    muteTechniqueNames: boolean
  ): Promise<void> {
    const audio = phase.audio;

    if (!audio || !audio.file) {
      return;
    }

    // D8/D9a: Scoped mute check — technique names can be muted, bells/endings cannot.
    if (audio.category === 'technique-name' && muteTechniqueNames) {
      return;
    }

    try {
      // Clean up any previously active player
      this.stopCurrentPlayer();

      // Rule 3: Audio plays ONCE at phase start, not looped for duration
      const player = createAudioPlayer(audio.file);
      player.loop = false;
      player.volume = 1.0;
      this.activePlayer = player;

      player.play();
    } catch (error) {
      // Rule 11: Never let a failed sound file crash the app
      console.error(`Failed to play audio cue for phase "${phase.label}":`, error);
    }
  }

  public stopCurrentPlayer(): void {
    if (this.activePlayer) {
      try {
        this.activePlayer.pause();
        if (typeof this.activePlayer.remove === 'function') {
          this.activePlayer.remove();
        }
      } catch (error) {
        // Ignore error during cleanup
      }
      this.activePlayer = null;
    }
  }
}

export const audioService = new AudioService();

import { createAudioPlayer, AudioModule, AudioPlayer } from 'expo-audio';
import { Phase } from '../models/Phase';
import { WITNESS_SOUND_OPTIONS, DEFAULT_WITNESS_SOUND_ID } from '../constants/sounds';

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
   * @param witnessSoundId Configured transition sound for Normal breath / Witness phases
   */
  public async playPhaseAudio(
    phase: Phase,
    muteTechniqueNames: boolean,
    witnessSoundId?: string
  ): Promise<void> {
    const audio = phase.audio;
    if (!audio || !audio.file) {
      return;
    }

    // D8/D9a: Scoped mute check — technique names can be muted, bells/endings cannot.
    if (audio.category === 'technique-name' && muteTechniqueNames) {
      return;
    }

    // Always stop and clean up any existing active player before starting a new track
    this.stop();

    // Resolve audio source: use configured witnessSoundId ONLY for witness/transition bells
    let soundFile = audio.file;
    if (phase.type === 'witness' || audio.category === 'bell') {
      const selectedId = witnessSoundId || DEFAULT_WITNESS_SOUND_ID;
      const soundOption = WITNESS_SOUND_OPTIONS.find((opt) => opt.id === selectedId);
      if (soundOption && soundOption.asset) {
        soundFile = soundOption.asset;
      }
    }

    try {
      // Rule 3: Audio plays ONCE at phase start, not looped for duration
      const player = createAudioPlayer(soundFile);
      player.loop = false;
      player.volume = 1.0;
      this.activePlayer = player;

      player.play();
    } catch (error) {
      // Rule 11: Never let a failed sound file crash the app
      console.error(`Failed to play audio cue for phase "${phase.label}":`, error);
    }
  }

  /**
   * Previews a sound asset once. Stops any currently active player.
   */
  public async previewSound(assetSource: number): Promise<void> {
    this.stop();
    try {
      const player = createAudioPlayer(assetSource);
      player.loop = false;
      player.volume = 1.0;
      this.activePlayer = player;
      player.play();
    } catch (error) {
      console.error('[AudioService] Error previewing sound:', error);
    }
  }

  /**
   * Stops any sound preview or currently playing audio.
   */
  public stopPreview(): void {
    this.stop();
  }

  /**
   * Plays the session start bell (reuses the same Boxing Bell.mp3 completion bell asset - D18).
   */
  public async playStartBell(): Promise<void> {
    this.stop();
    try {
      const startBellAsset = require('../../assets/audio/bell/Boxing Bell.mp3');
      const player = createAudioPlayer(startBellAsset);
      player.loop = false;
      player.volume = 1.0;
      this.activePlayer = player;
      player.play();
    } catch (error) {
      console.error('[AudioService] Error playing session start bell:', error);
    }
  }

  /**
   * Plays the completion bell (Boxing Bell.mp3) when a session finishes.
   */
  public async playCompletionBell(): Promise<void> {
    this.stop();
    try {
      const completionBellAsset = require('../../assets/audio/bell/Boxing Bell.mp3');
      const player = createAudioPlayer(completionBellAsset);
      player.loop = false;
      player.volume = 1.0;
      this.activePlayer = player;
      player.play();
    } catch (error) {
      console.error('[AudioService] Error playing completion bell:', error);
    }
  }

  /**
   * Pauses the currently active audio player if playing.
   */
  public pause(): void {
    if (this.activePlayer) {
      try {
        this.activePlayer.pause();
      } catch (error) {
        console.error('[AudioService] Error pausing audio player:', error);
      }
    }
  }

  /**
   * Resumes playback of the currently active audio player if paused.
   */
  public resume(): void {
    if (this.activePlayer) {
      try {
        this.activePlayer.play();
      } catch (error) {
        console.error('[AudioService] Error resuming audio player:', error);
      }
    }
  }

  /**
   * Stops and disposes the currently active audio player.
   */
  public stop(): void {
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

  /**
   * Alias for stop() for backwards compatibility.
   */
  public stopCurrentPlayer(): void {
    this.stop();
  }
}

export const audioService = new AudioService();


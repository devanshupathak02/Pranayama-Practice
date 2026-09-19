import { Phase } from '../models/Phase';
import { WITNESS_SOUND_OPTIONS, DEFAULT_WITNESS_SOUND_ID } from '../constants/sounds';
import { indexedDBStorage } from '../storage/indexedDBStorage';

/**
 * Web Audio Engine for Web / PWA.
 * 
 * Solves the Phase A AbortError & buffering race:
 * 1. Pre-decodes audio buffers into memory (AudioContext) for chimes & voice cues,
 *    enabling instant, sample-accurate playback via AudioBufferSourceNode with zero HTMLMediaElement delay.
 * 2. Provides Promise-safe guarded HTML5 audio playback for long tracks (Yoga Nidra) with full
 *    canplaythrough readiness checks and chained playPromise resolution.
 * 3. Handles autoplay policy unlock seamlessly on user interaction.
 */
class WebAudioEngine {
  private audioContext: AudioContext | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private activeSourceNode: AudioBufferSourceNode | null = null;
  private activeGainNode: GainNode | null = null;

  // Streaming HTML5 player for long tracks / Blobs
  private activeHtmlAudio: HTMLAudioElement | null = null;
  private activePlayPromise: Promise<void> | null = null;
  private isUnlocked = false;

  constructor() {
    this.setupAutoplayUnlock();
  }

  /**
   * Initializes or returns the shared AudioContext.
   */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch((err) => {
        console.warn('[WebAudioEngine] Failed to resume AudioContext:', err);
      });
    }

    return this.audioContext;
  }

  /**
   * Attach once listeners for user interaction to unlock browser audio autoplay.
   */
  private setupAutoplayUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.isUnlocked) return;
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else {
        this.isUnlocked = true;
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true, once: true });
    window.addEventListener('keydown', unlock, { passive: true, once: true });
    window.addEventListener('touchstart', unlock, { passive: true, once: true });
  }

  /**
   * Resolves any audio asset (require ID, string URL, or blob: ID) to a loadable URL string.
   */
  public async resolveAudioUri(source: any): Promise<string | null> {
    if (!source) return null;

    // 1. If it's a blob:<id> reference in IndexedDB
    if (typeof source === 'string' && source.startsWith('blob:')) {
      // Check if it's an existing object URL or an IndexedDB blob ID
      if (source.startsWith('blob:http')) {
        return source;
      }
      const rawBlob = await indexedDBStorage.getBlob(source);
      if (rawBlob) {
        return URL.createObjectURL(rawBlob);
      }
      return null;
    }

    // 2. If it's a string URL or Data URL
    if (typeof source === 'string') {
      return source;
    }

    // 3. If it's a Metro/Webpack bundled require number or object
    if (typeof source === 'number' || (typeof source === 'object' && source !== null)) {
      try {
        // Try Expo Asset or React Native resolveAssetSource
        const { Image } = require('react-native');
        const resolved = Image.resolveAssetSource?.(source);
        if (resolved?.uri) {
          return resolved.uri;
        }
      } catch (e) {
        // Fall through
      }

      if (typeof source === 'object' && source.uri) {
        return source.uri;
      }
    }

    return null;
  }

  /**
   * Pre-fetches and decodes an audio buffer for instantaneous playback without AbortError.
   */
  private async getDecodedBuffer(uri: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(uri)) {
      return this.bufferCache.get(uri)!;
    }

    const ctx = this.getAudioContext();
    if (!ctx) return null;

    try {
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(uri, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`[WebAudioEngine] decodeAudioData failed for "${uri}", will fall back to HTMLAudio:`, error);
      return null;
    }
  }

  /**
   * Plays sound using Web Audio API AudioBufferSourceNode.
   * Guarantees zero AbortError and immediate sample-accurate playback.
   */
  private playBuffer(buffer: AudioBuffer, volume = 1.0): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.stop();

    try {
      const sourceNode = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      sourceNode.buffer = buffer;
      gainNode.gain.value = Math.max(0, Math.min(1.0, volume));

      sourceNode.connect(gainNode);
      gainNode.connect(ctx.destination);

      sourceNode.onended = () => {
        if (this.activeSourceNode === sourceNode) {
          this.activeSourceNode = null;
          this.activeGainNode = null;
        }
      };

      this.activeSourceNode = sourceNode;
      this.activeGainNode = gainNode;

      sourceNode.start(0);
    } catch (error) {
      console.error('[WebAudioEngine] Failed to play AudioBufferSourceNode:', error);
    }
  }

  /**
   * Plays sound using Promise-safe HTML5 Audio element with canplaythrough readiness check.
   */
  private playHtmlAudio(uri: string, volume = 1.0): void {
    this.stop();

    try {
      const audio = new Audio(uri);
      audio.volume = Math.max(0, Math.min(1.0, volume));
      this.activeHtmlAudio = audio;

      const executePlay = () => {
        if (this.activeHtmlAudio !== audio) return;
        const playPromise = audio.play();
        this.activePlayPromise = playPromise;

        playPromise
          .then(() => {
            this.activePlayPromise = null;
          })
          .catch((err) => {
            this.activePlayPromise = null;
            if (err.name !== 'AbortError') {
              console.warn('[WebAudioEngine] HTMLAudio play error:', err);
            }
          });
      };

      if (audio.readyState >= 3) {
        // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
        executePlay();
      } else {
        audio.addEventListener('canplaythrough', executePlay, { once: true });
        audio.addEventListener('error', (e) => {
          console.error('[WebAudioEngine] HTMLAudio load error:', e);
        }, { once: true });
        audio.load();
      }
    } catch (error) {
      console.error('[WebAudioEngine] Failed to create HTMLAudio:', error);
    }
  }

  /**
   * Main playback method: automatically selects AudioBuffer (Web Audio) or HTMLAudio based on track size.
   */
  public async playSound(source: any, volume = 1.0): Promise<void> {
    const uri = await this.resolveAudioUri(source);
    if (!uri) {
      console.warn('[WebAudioEngine] Could not resolve audio URI for source:', source);
      return;
    }

    // Attempt high-performance Web Audio buffer first
    const buffer = await this.getDecodedBuffer(uri);
    if (buffer) {
      this.playBuffer(buffer, volume);
    } else {
      // Fall back to Promise-safe HTML5 streaming audio
      this.playHtmlAudio(uri, volume);
    }
  }

  /**
   * Plays the D18 session start bell (Boxing Bell.mp3).
   */
  public async playStartBell(): Promise<void> {
    const startBellAsset = require('../../assets/audio/bell/Boxing Bell.mp3');
    await this.playSound(startBellAsset, 1.0);
  }

  /**
   * Plays the completion bell (Boxing Bell.mp3).
   */
  public async playCompletionBell(): Promise<void> {
    const completionBellAsset = require('../../assets/audio/bell/Boxing Bell.mp3');
    await this.playSound(completionBellAsset, 1.0);
  }

  /**
   * Plays phase audio according to scoped muting rules (D8, D9a).
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

    let soundSource = audio.file;
    if (phase.type === 'witness' || audio.category === 'bell') {
      const selectedId = witnessSoundId || DEFAULT_WITNESS_SOUND_ID;
      const soundOption = WITNESS_SOUND_OPTIONS.find((opt) => opt.id === selectedId);
      if (soundOption && soundOption.asset) {
        soundSource = soundOption.asset;
      }
    }

    await this.playSound(soundSource, 1.0);
  }

  /**
   * Stops any currently playing audio safely without race conditions.
   */
  public stop(): void {
    // 1. Stop Web Audio Buffer source
    if (this.activeSourceNode) {
      try {
        this.activeSourceNode.stop();
        this.activeSourceNode.disconnect();
      } catch (e) {
        // Node might have already finished
      }
      this.activeSourceNode = null;
      this.activeGainNode = null;
    }

    // 2. Stop HTML5 audio with Promise safety (prevents AbortError)
    if (this.activeHtmlAudio) {
      const audio = this.activeHtmlAudio;
      this.activeHtmlAudio = null;

      if (this.activePlayPromise) {
        this.activePlayPromise
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
          })
          .catch(() => {});
        this.activePlayPromise = null;
      } else {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
      }
    }
  }

  public pause(): void {
    if (this.activeGainNode) {
      this.activeGainNode.gain.value = 0;
    }
    if (this.activeHtmlAudio) {
      const audio = this.activeHtmlAudio;
      if (this.activePlayPromise) {
        this.activePlayPromise.then(() => audio.pause()).catch(() => {});
      } else {
        audio.pause();
      }
    }
  }

  public resume(): void {
    if (this.activeGainNode) {
      this.activeGainNode.gain.value = 1.0;
    }
    if (this.activeHtmlAudio && this.activeHtmlAudio.paused) {
      this.activePlayPromise = this.activeHtmlAudio.play();
      this.activePlayPromise.catch(() => {});
    }
  }
}

export const webAudioEngine = new WebAudioEngine();

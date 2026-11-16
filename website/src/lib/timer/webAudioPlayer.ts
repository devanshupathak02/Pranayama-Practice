import { Phase, AppSettings } from '@/types/timer';
import { getCachedAudioBlobUrl, backgroundAudioCache } from '@/lib/storage/offlineAudio';

class WebAudioPlayer {
  private audioContext: AudioContext | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private activeSourceNode: AudioBufferSourceNode | null = null;
  private activeStreamingAudio: HTMLAudioElement | null = null;
  private activeBlobUrl: string | null = null;
  private currentPlayId: number = 0;
  private isUnlocked: boolean = false;
  private isMuted: boolean = false;

  // Lazy constructor: Does not initialize AudioContext or attach global listeners during app launch
  constructor() {}

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.activeStreamingAudio) {
      this.activeStreamingAudio.muted = muted;
    }
    if (muted && this.activeSourceNode) {
      try {
        this.activeSourceNode.stop();
        this.activeSourceNode.disconnect();
      } catch {
        // Ignore
      }
      this.activeSourceNode = null;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public unlock(): void {
    if (typeof window === 'undefined' || this.isUnlocked) return;
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else {
      this.isUnlocked = true;
    }
  }

  public getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    return this.audioContext;
  }

  /**
   * Preload short audio cues into Web Audio memory buffers (e.g. bells, technique spoken cues).
   * Guarded: Never decodes long-form audio (>= 5MB) into raw PCM memory.
   */
  public async preloadBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }

    // Never decode long-form yoga nidra tracks into memory buffers
    if (url.includes('/yoga-nidra/') || url.endsWith('.mpeg')) {
      return null;
    }

    const ctx = this.getAudioContext();
    if (!ctx) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(url, audioBuffer);
      return audioBuffer;
    } catch {
      return null;
    }
  }

  /**
   * Complete hard stop of all media elements, audio nodes, and streams.
   * Cancels in-flight requests and releases system audio hardware immediately.
   */
  public stop(): void {
    // Invalidate any in-flight playback promises
    this.currentPlayId++;

    // 1. Stop and disconnect Web Audio source node
    if (this.activeSourceNode) {
      try {
        this.activeSourceNode.stop();
        this.activeSourceNode.disconnect();
      } catch {
        // Already stopped
      }
      this.activeSourceNode = null;
    }

    // 2. Stop and release HTML5 streaming audio
    if (this.activeStreamingAudio) {
      try {
        this.activeStreamingAudio.pause();
        this.activeStreamingAudio.currentTime = 0;
        this.activeStreamingAudio.removeAttribute('src');
        this.activeStreamingAudio.load(); // Forces mobile Safari/Chrome to release audio pipeline
      } catch {
        // Ignore
      }
      this.activeStreamingAudio = null;
    }

    // 3. Revoke active Blob URL if generated from offline storage
    if (this.activeBlobUrl) {
      try {
        URL.revokeObjectURL(this.activeBlobUrl);
      } catch {
        // Ignore
      }
      this.activeBlobUrl = null;
    }
  }

  public playSynthesizedChime(frequency: number = 528): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(frequency, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 2, now); // harmonic octave

      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.0);
      osc2.stop(now + 3.0);
    } catch {
      // Audio autoplay policy
    }
  }

  /**
   * Phase audio router:
   * - Long-form guided sessions stream via HTML5 streaming.
   * - Short bells and technique voice cues play via Web Audio buffer.
   */
  public async playPhaseAudio(phase: Phase, settings: AppSettings): Promise<void> {
    if (this.isMuted || settings.muteAllAudio) {
      return;
    }

    const audioConfig = phase.audio;
    if (!audioConfig || !audioConfig.file) {
      return;
    }

    // Granular Mute check: technique names can be muted while bells and ending chimes play
    if (audioConfig.category === 'technique-name' && settings.muteTechniqueNames) {
      return;
    }

    // Long-form track detected: Delegate immediately to progressive streaming pipeline
    const isLongForm = audioConfig.category === 'custom' ||
      audioConfig.file.includes('/yoga-nidra/') ||
      phase.durationSeconds > 600;

    if (isLongForm) {
      await this.playStreamingAudio(audioConfig.file, settings);
      return;
    }

    this.stop();

    const ctx = this.getAudioContext();
    if (!ctx) {
      this.playSynthesizedChime(528);
      return;
    }

    try {
      // Short cue: Try to play decoded buffer for instant zero-latency precision
      let buffer = this.bufferCache.get(audioConfig.file);
      if (!buffer) {
        buffer = (await this.preloadBuffer(audioConfig.file)) || undefined;
      }

      if (buffer) {
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        source.buffer = buffer;
        gainNode.gain.setValueAtTime(0.85, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        this.activeSourceNode = source;
        source.start();
        return;
      }

      // Fallback for short audio
      const audioEl = new Audio(audioConfig.file);
      audioEl.volume = 0.85;
      this.activeStreamingAudio = audioEl;
      await audioEl.play();
    } catch {
      // Harmonic synthesized singing bowl chime fallback
      this.playSynthesizedChime(audioConfig.category === 'ending' ? 440 : 528);
    }
  }

  /**
   * HTML5 Audio streaming pipeline for long-form sessions (Yoga Nidra).
   * - Checks offline CacheStorage first for instant 0ms local playback.
   * - Falls back to progressive HTTP Range streaming with < 1s startup.
   * - Enforces single active instance and ignores aborted/stale requests.
   */
  public async playStreamingAudio(
    fileUrl: string,
    settings?: AppSettings,
    onPlaybackStarted?: () => void
  ): Promise<void> {
    if (settings?.muteAllAudio) {
      return;
    }

    // Synchronously stop any active playback
    this.stop();

    const requestId = ++this.currentPlayId;

    try {
      let resolvedSrc = fileUrl;

      // 1. Check if the audio track is cached offline in CacheStorage
      try {
        const cachedBlobUrl = await getCachedAudioBlobUrl(fileUrl);
        // Abort if another play or stop request occurred while waiting for cache
        if (requestId !== this.currentPlayId) {
          if (cachedBlobUrl) URL.revokeObjectURL(cachedBlobUrl);
          return;
        }

        if (cachedBlobUrl) {
          resolvedSrc = cachedBlobUrl;
          this.activeBlobUrl = cachedBlobUrl;
        }
      } catch {
        // Fall back to direct fileUrl stream
      }

      // 2. Instantiate and configure managed HTML5 Audio element
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = resolvedSrc;
      audio.volume = 0.9;
      audio.muted = this.isMuted || !!settings?.muteAllAudio;

      // Buffer priority: If live playback stalls/buffers, deprioritize background caching
      audio.addEventListener('waiting', () => {
        backgroundAudioCache.pauseOrCancel(fileUrl);
      });

      this.activeStreamingAudio = audio;

      // 3. Start playback
      await audio.play();

      if (requestId === this.currentPlayId) {
        onPlaybackStarted?.();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Play request was superseded or aborted by user
        return;
      }
      console.warn('[WebAudioPlayer] Streaming audio failed to start:', err);
    }
  }

  public pauseStreamingAudio(): void {
    if (this.activeStreamingAudio) {
      try {
        this.activeStreamingAudio.pause();
      } catch {
        // Ignore
      }
    }
  }

  public resumeStreamingAudio(): void {
    if (this.activeStreamingAudio && this.activeStreamingAudio.paused) {
      this.activeStreamingAudio.play().catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.warn('[WebAudioPlayer] Streaming resume failed:', err);
      });
    }
  }
}

export const webAudioPlayer = new WebAudioPlayer();

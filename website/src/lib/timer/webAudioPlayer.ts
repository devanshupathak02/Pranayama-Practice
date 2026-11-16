import { Phase, AppSettings } from '@/types/timer';

class WebAudioPlayer {
  private audioContext: AudioContext | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private activeSourceNode: AudioBufferSourceNode | null = null;
  private activeStreamingAudio: HTMLAudioElement | null = null;
  private isUnlocked: boolean = false;

  // Lazy constructor: Does not initialize AudioContext or attach global listeners during app launch
  constructor() {}

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

  public async preloadBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
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

  public stop(): void {
    if (this.activeSourceNode) {
      try {
        this.activeSourceNode.stop();
        this.activeSourceNode.disconnect();
      } catch {
        // Already stopped
      }
      this.activeSourceNode = null;
    }

    if (this.activeStreamingAudio) {
      try {
        this.activeStreamingAudio.pause();
        this.activeStreamingAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.activeStreamingAudio = null;
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

  public async playPhaseAudio(phase: Phase, settings: AppSettings): Promise<void> {
    if (settings.muteAllAudio) {
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

    this.stop();

    const ctx = this.getAudioContext();
    if (!ctx) {
      this.playSynthesizedChime(528);
      return;
    }

    try {
      // 1. Try to play decoded buffer for instant precision
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

      // 2. Fallback to HTML5 audio element
      const audioEl = new Audio(audioConfig.file);
      audioEl.volume = 0.85;
      this.activeStreamingAudio = audioEl;
      await audioEl.play();
    } catch {
      // 3. Fallback to harmonic synthesized singing bowl chime
      this.playSynthesizedChime(audioConfig.category === 'ending' ? 440 : 528);
    }
  }

  public async playStreamingAudio(fileUrl: string): Promise<void> {
    this.stop();
    try {
      const audio = new Audio(fileUrl);
      audio.volume = 0.9;
      this.activeStreamingAudio = audio;
      await audio.play();
    } catch (err) {
      console.warn('Streaming audio failed to start:', err);
    }
  }

  public pauseStreamingAudio(): void {
    if (this.activeStreamingAudio) {
      this.activeStreamingAudio.pause();
    }
  }

  public resumeStreamingAudio(): void {
    if (this.activeStreamingAudio) {
      this.activeStreamingAudio.play().catch(() => {});
    }
  }
}

export const webAudioPlayer = new WebAudioPlayer();

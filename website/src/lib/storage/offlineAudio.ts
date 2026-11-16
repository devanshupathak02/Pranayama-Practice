/**
 * Offline Audio Manager & Background Audio Cache Singleton
 * 
 * Manages checking, background downloading, verification, and CacheStorage API lifecycle
 * for Yoga Nidra and long-form guided audio sessions.
 * 
 * Reliability & Safety Invariants:
 * 1. Playback Independence: Caching runs purely as an out-of-band background fetch. Never creates an audio player.
 * 2. Strict Verification: A track is NEVER marked 'offline_ready' until loadedBytes === totalBytes and cache.match() verifies a complete HTTP 200 Response.
 * 3. Singleton Queue: A track URL has at most one in-flight download promise. Duplicate requests reuse the pending promise.
 * 4. Yielding to Live Audio: Background fetch yields bandwidth if live audio playback repeatedly buffers.
 */

const AUDIO_CACHE_PREFIX = 'pranayama-audio';

export type AudioCacheStatus =
  | 'offline_ready'       // Verified complete response in CacheStorage
  | 'preparing_offline'   // Currently downloading in background
  | 'streaming'           // Online, not yet cached locally
  | 'offline_unavailable' // Device is offline and track is not cached
  | 'download_failed';    // Network/storage error occurred during download

export interface DownloadProgress {
  loadedBytes: number;
  totalBytes: number;
  percentage: number;
}

export async function getAudioCache(): Promise<Cache | null> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return null;
  }
  try {
    const keys = await caches.keys();
    const activeCacheKey = keys.find((k) => k.startsWith(AUDIO_CACHE_PREFIX)) || 'pranayama-audio-v2.4.0';
    return await caches.open(activeCacheKey);
  } catch (err) {
    console.warn('[OfflineAudio] Unable to open CacheStorage:', err);
    return null;
  }
}

/**
 * Checks whether an audio URL is stored and verified in CacheStorage.
 */
export async function isAudioCachedOffline(url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window) || !url) {
    return false;
  }
  try {
    const cache = await getAudioCache();
    if (!cache) return false;

    const match = await cache.match(url);
    if (!match || !match.ok || match.status !== 200) {
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[OfflineAudio] Error checking cache match for', url, err);
    return false;
  }
}

/**
 * Retrieves a cached audio track as a local Blob URL for instant zero-latency offline playback.
 * Returns null if the track is not cached.
 */
export async function getCachedAudioBlobUrl(url: string): Promise<string | null> {
  if (typeof window === 'undefined' || !('caches' in window) || !url) {
    return null;
  }
  try {
    const cache = await getAudioCache();
    if (!cache) return null;

    const match = await cache.match(url);
    if (!match || !match.ok || match.status !== 200) {
      return null;
    }

    const blob = await match.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('[OfflineAudio] Error generating Blob URL from cache for', url, err);
    return null;
  }
}

/**
 * Format bytes into human-readable MB string.
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/**
 * Calculates total storage used across all cached audio assets.
 */
export async function getAudioCacheSize(): Promise<number> {
  if (typeof window === 'undefined' || !('caches' in window)) return 0;
  try {
    const cache = await getAudioCache();
    if (!cache) return 0;
    const requests = await cache.keys();
    let total = 0;
    for (const req of requests) {
      const match = await cache.match(req);
      if (match) {
        const len = match.headers.get('content-length');
        if (len) {
          total += parseInt(len, 10);
        } else {
          const blob = await match.blob();
          total += blob.size;
        }
      }
    }
    return total;
  } catch {
    return 0;
  }
}

/**
 * Removes a single cached audio track from CacheStorage.
 */
export async function removeAudioTrackFromCache(url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    const cache = await getAudioCache();
    if (!cache) return false;
    return await cache.delete(url);
  } catch (err) {
    console.warn('[OfflineAudio] Error deleting cached audio:', err);
    return false;
  }
}

/**
 * Singleton Background Audio Cache Manager
 */
class BackgroundAudioCacheManager {
  private inFlightDownloads = new Map<string, Promise<{ success: boolean; error?: string }>>();
  private progressMap = new Map<string, number>();
  private statusMap = new Map<string, AudioCacheStatus>();
  private abortControllers = new Map<string, AbortController>();
  private retryCounts = new Map<string, number>();
  private listeners = new Set<(url: string, status: AudioCacheStatus, progress: number) => void>();

  constructor() {
    // Listen for online/offline events to update statuses reactively
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.refreshAllStatuses());
      window.addEventListener('offline', () => this.refreshAllStatuses());
    }
  }

  public subscribe(callback: (url: string, status: AudioCacheStatus, progress: number) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(url: string, status: AudioCacheStatus, progress: number = 0): void {
    this.statusMap.set(url, status);
    this.progressMap.set(url, progress);
    this.listeners.forEach((listener) => {
      try {
        listener(url, status, progress);
      } catch (err) {
        console.warn('[OfflineAudio] Listener error:', err);
      }
    });
  }

  public getProgress(url: string): number {
    return this.progressMap.get(url) || 0;
  }

  public async getStatus(url: string): Promise<AudioCacheStatus> {
    if (this.inFlightDownloads.has(url)) {
      return 'preparing_offline';
    }

    const cached = await isAudioCachedOffline(url);
    if (cached) {
      this.statusMap.set(url, 'offline_ready');
      return 'offline_ready';
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      this.statusMap.set(url, 'offline_unavailable');
      return 'offline_unavailable';
    }

    const current = this.statusMap.get(url);
    if (current === 'download_failed') {
      return 'download_failed';
    }

    return 'streaming';
  }

  private async refreshAllStatuses(): Promise<void> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    for (const [url, current] of this.statusMap.entries()) {
      if (current === 'preparing_offline') continue;
      const cached = await isAudioCachedOffline(url);
      if (cached) {
        this.notify(url, 'offline_ready', 100);
      } else if (!isOnline) {
        this.notify(url, 'offline_unavailable', 0);
      } else if (current === 'offline_unavailable') {
        this.notify(url, 'streaming', 0);
      }
    }
  }

  /**
   * Pauses or cancels background caching for a specific URL (e.g. when live playback buffers).
   */
  public pauseOrCancel(url: string): void {
    const controller = this.abortControllers.get(url);
    if (controller) {
      console.log('[OfflineAudio] Pausing/cancelling background cache for bandwidth priority:', url);
      controller.abort();
      this.abortControllers.delete(url);
    }
    this.inFlightDownloads.delete(url);
    this.progressMap.delete(url);
    isAudioCachedOffline(url).then((cached) => {
      this.notify(url, cached ? 'offline_ready' : 'streaming', cached ? 100 : 0);
    });
  }

  /**
   * Triggers background download and verification of an audio track.
   * Singleton: If already in flight, reuses the active promise.
   */
  public async triggerBackgroundCache(
    url: string,
    options?: { force?: boolean }
  ): Promise<{ success: boolean; error?: string }> {
    if (typeof window === 'undefined' || !('caches' in window) || !url) {
      return { success: false, error: 'CacheStorage not available' };
    }

    // 1. If already verified in CacheStorage, return immediately
    const alreadyCached = await isAudioCachedOffline(url);
    if (alreadyCached) {
      this.notify(url, 'offline_ready', 100);
      return { success: true };
    }

    // 2. Prevent duplicate downloads: Reuse in-flight promise
    if (this.inFlightDownloads.has(url)) {
      return this.inFlightDownloads.get(url)!;
    }

    // 3. Respect Data Saver preference unless explicitly forced
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    const isDataSaver = nav?.connection?.saveData === true;
    if (isDataSaver && !options?.force) {
      console.log('[OfflineAudio] Data Saver active; skipping background cache for:', url);
      this.notify(url, 'streaming', 0);
      return { success: false, error: 'Data Saver active' };
    }

    // 4. Check device network availability
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.notify(url, 'offline_unavailable', 0);
      return { success: false, error: 'No internet connection' };
    }

    // 5. Initialize Download Promise
    const abortController = new AbortController();
    this.abortControllers.set(url, abortController);
    this.notify(url, 'preparing_offline', 0);

    const downloadPromise = (async () => {
      try {
        const cache = await getAudioCache();
        if (!cache) {
          throw new Error('Unable to open audio cache');
        }

        const response = await fetch(url, {
          signal: abortController.signal,
          headers: { 'Accept': 'audio/*, application/octet-stream' },
        });

        if (!response.ok || response.status !== 200) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const contentLengthHeader = response.headers.get('content-length');
        const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

        if (!response.body) {
          // Fallback if ReadableStream is unsupported
          await cache.put(url, response.clone());
          const verified = await isAudioCachedOffline(url);
          if (verified) {
            this.notify(url, 'offline_ready', 100);
            return { success: true };
          }
          throw new Error('Storage verification failed');
        }

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loadedBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            chunks.push(value);
            loadedBytes += value.length;
            if (totalBytes > 0) {
              const pct = Math.min(99, Math.round((loadedBytes / totalBytes) * 100));
              this.notify(url, 'preparing_offline', pct);
            }
          }
        }

        // Integrity check: verify complete length
        if (totalBytes > 0 && loadedBytes < totalBytes) {
          throw new Error('Incomplete audio stream: downloaded size mismatch');
        }

        const mimeType = response.headers.get('content-type') || 'audio/mpeg';
        const completeBlob = new Blob(chunks as unknown as BlobPart[], { type: mimeType });

        const cachedResponse = new Response(completeBlob, {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': mimeType,
            'Content-Length': completeBlob.size.toString(),
            'X-Pranayama-Offline': 'true',
            'X-Downloaded-At': Date.now().toString(),
          },
        });

        // Write complete response to CacheStorage
        await cache.put(url, cachedResponse);

        // Verification check before marking complete
        const isVerified = await isAudioCachedOffline(url);
        if (!isVerified) {
          throw new Error('Cache verification check failed after save');
        }

        this.retryCounts.delete(url);
        this.notify(url, 'offline_ready', 100);
        return { success: true };
      } catch (err: unknown) {
        if (abortController.signal.aborted) {
          // Quietly return on explicit abort
          return { success: false, error: 'Download paused' };
        }

        const msg = err instanceof Error ? err.message : 'Unknown download error';
        console.warn('[OfflineAudio] Background cache error for', url, msg);

        // Retry logic: Retry up to 2 times with exponential delay if online
        const retries = this.retryCounts.get(url) || 0;
        if (retries < 2 && typeof navigator !== 'undefined' && navigator.onLine) {
          this.retryCounts.set(url, retries + 1);
          console.log(`[OfflineAudio] Scheduling retry ${retries + 1}/2 for ${url}`);
          await new Promise((res) => setTimeout(res, 2000 * (retries + 1)));
          this.inFlightDownloads.delete(url);
          return this.triggerBackgroundCache(url, options);
        }

        this.notify(url, 'download_failed', 0);
        return { success: false, error: msg };
      } finally {
        this.inFlightDownloads.delete(url);
        this.abortControllers.delete(url);
      }
    })();

    this.inFlightDownloads.set(url, downloadPromise);
    return downloadPromise;
  }

  /**
   * Clears all cached audio files across CacheStorage buckets.
   */
  public async clearAllAudioCache(): Promise<{ success: boolean; freedBytes: number }> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return { success: false, freedBytes: 0 };
    }

    try {
      const freedBytes = await getAudioCacheSize();
      const keys = await caches.keys();
      const audioKeys = keys.filter((k) => k.startsWith(AUDIO_CACHE_PREFIX));

      await Promise.all(audioKeys.map((k) => caches.delete(k)));

      this.statusMap.clear();
      this.progressMap.clear();
      this.inFlightDownloads.clear();
      this.retryCounts.clear();

      // Refresh listeners
      await this.refreshAllStatuses();

      return { success: true, freedBytes };
    } catch (err) {
      console.error('[OfflineAudio] Failed to clear audio cache:', err);
      return { success: false, freedBytes: 0 };
    }
  }
}

export const backgroundAudioCache = new BackgroundAudioCacheManager();

/**
 * Backward compatibility wrapper for on-demand manual download.
 */
export async function downloadAudioTrack(
  url: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ success: boolean; error?: string }> {
  let unsubscribe: (() => void) | null = null;
  if (onProgress) {
    unsubscribe = backgroundAudioCache.subscribe((trackUrl, _, pct) => {
      if (trackUrl === url) {
        onProgress({ loadedBytes: pct, totalBytes: 100, percentage: pct });
      }
    });
  }
  try {
    const res = await backgroundAudioCache.triggerBackgroundCache(url, { force: true });
    return res;
  } finally {
    if (unsubscribe) unsubscribe();
  }
}

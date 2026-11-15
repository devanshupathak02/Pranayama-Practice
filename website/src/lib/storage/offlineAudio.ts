/**
 * Offline Audio Manager
 * Manages checking, caching, and downloading long-form audio assets (such as Yoga Nidra)
 * using the browser CacheStorage API.
 *
 * Invariant: Never claim a track is available offline until cache.match() verifies
 * a complete, successful Response exists in the CacheStorage bucket.
 */

const AUDIO_CACHE_PREFIX = 'pranayama-audio';

async function getAudioCache(): Promise<Cache | null> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return null;
  }
  try {
    const keys = await caches.keys();
    const activeCacheKey = keys.find((k) => k.startsWith(AUDIO_CACHE_PREFIX)) || 'pranayama-audio-v2.0.0';
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
    if (!match) return false;

    // Must be a complete 200 OK response with content
    if (!match.ok || match.status !== 200) {
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[OfflineAudio] Error checking cache match for', url, err);
    return false;
  }
}

export interface DownloadProgress {
  loadedBytes: number;
  totalBytes: number;
  percentage: number;
}

/**
 * Downloads and caches an audio track with progress reporting.
 * Handles storage quota limits, network drops, and aborted streams safely.
 */
export async function downloadAudioTrack(
  url: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { success: false, error: 'Offline storage not supported in this browser' };
  }

  try {
    const cache = await getAudioCache();
    if (!cache) {
      return { success: false, error: 'Unable to open audio cache' };
    }

    // 1. Fetch with streaming to track download progress
    const response = await fetch(url);
    if (!response.ok || response.status !== 200) {
      return { success: false, error: `Server returned HTTP ${response.status}` };
    }

    const contentLengthHeader = response.headers.get('content-length');
    const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

    if (!response.body) {
      // Fallback if ReadableStream is not available
      await cache.put(url, response.clone());
      const verified = await isAudioCachedOffline(url);
      return { success: verified };
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loadedBytes = 0;

    // 2. Read stream chunks and report progress
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        loadedBytes += value.length;
        if (onProgress && totalBytes > 0) {
          onProgress({
            loadedBytes,
            totalBytes,
            percentage: Math.min(100, Math.round((loadedBytes / totalBytes) * 100)),
          });
        }
      }
    }

    // 3. Assemble complete response blob
    const mimeType = response.headers.get('content-type') || 'audio/mpeg';
    const completeBlob = new Blob(chunks as unknown as BlobPart[], { type: mimeType });

    // Validate size before claiming complete
    if (totalBytes > 0 && loadedBytes < totalBytes) {
      return { success: false, error: 'Download was interrupted before completion' };
    }

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

    // 4. Put into CacheStorage
    await cache.put(url, cachedResponse);

    // 5. Verify the cache actually stores the item
    const isVerified = await isAudioCachedOffline(url);
    if (!isVerified) {
      return { success: false, error: 'Storage verification failed after saving' };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown download error';
    console.error('[OfflineAudio] Download failed for', url, msg);

    // If quota exceeded
    if (msg.toLowerCase().includes('quota')) {
      return { success: false, error: 'Device storage quota exceeded' };
    }

    return { success: false, error: msg };
  }
}

/**
 * Removes a cached audio track to free up device space.
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

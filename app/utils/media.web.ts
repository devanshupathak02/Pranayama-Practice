import { indexedDBStorage } from '../storage/indexedDBStorage';

/**
 * Web-native HTML5 media pickers and storage for PWA (Phase B).
 * Uses raw Blob storage in IndexedDB (no 33% Base64 bloat) for audio and images.
 */

/**
 * On web, copies/persists a file to IndexedDB raw blob storage if needed.
 */
export const copyFileToAppDirectory = async (sourceUri: string, _isAudio: boolean): Promise<string> => {
  return sourceUri;
};

/**
 * Launches the browser file dialog to pick an image.
 * Reads the File object and returns a Data URL or Blob reference.
 */
export const pickImage = async (): Promise<string | null> => {
  if (typeof document === 'undefined') {
    return null;
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const id = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const blobRef = await indexedDBStorage.saveBlob(id, file);
        
        // Also create an Object URL or FileReader data URL so it renders in <img> immediately
        const reader = new FileReader();
        reader.onload = () => {
          resolve((reader.result as string) || blobRef);
        };
        reader.onerror = () => {
          resolve(blobRef);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('[media.web] Failed to process image file:', error);
        resolve(null);
      } finally {
        input.remove();
      }
    };

    input.oncancel = () => {
      resolve(null);
      input.remove();
    };

    document.body.appendChild(input);
    input.click();
  });
};

/**
 * Launches the browser file dialog to pick an audio file.
 * Stores the raw File (Blob) directly into IndexedDB without Base64 string inflation.
 */
export const pickAudio = async (): Promise<string | null> => {
  if (typeof document === 'undefined') {
    return null;
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.style.display = 'none';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const id = `audio_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const blobRef = await indexedDBStorage.saveBlob(id, file);
        resolve(blobRef);
      } catch (error) {
        console.error('[media.web] Failed to store raw audio blob in IndexedDB:', error);
        resolve(null);
      } finally {
        input.remove();
      }
    };

    input.oncancel = () => {
      resolve(null);
      input.remove();
    };

    document.body.appendChild(input);
    input.click();
  });
};

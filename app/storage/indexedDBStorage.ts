/**
 * IndexedDB storage adapter (D21) for web / PWA.
 * Implements the standard AsyncStorage interface for key-value pairs
 * and provides a raw Blob media store for custom audio/images without Base64 overhead.
 */

const DB_NAME = 'pranayama_timer_db';
const DB_VERSION = 1;
const KV_STORE_NAME = 'key_value_store';
const MEDIA_STORE_NAME = 'media_blobs';

const LOCAL_STORAGE_MIGRATION_KEYS = [
  'pranayama_app_settings_v1',
  'pranayama_session_history_v1',
  'pranayama_custom_routines_v1',
];

let dbPromise: Promise<IDBDatabase> | null = null;
let isMigrated = false;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(KV_STORE_NAME)) {
        db.createObjectStore(KV_STORE_NAME);
      }
      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME);
      }
    };

    request.onsuccess = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!isMigrated) {
        await migrateFromLocalStorage(db);
        isMigrated = true;
      }
      resolve(db);
    };

    request.onerror = () => {
      console.error('[IndexedDB] Failed to open database:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * One-time migration from localStorage into IndexedDB to preserve Phase A data.
 */
async function migrateFromLocalStorage(db: IDBDatabase): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const tx = db.transaction([KV_STORE_NAME], 'readwrite');
    const store = tx.objectStore(KV_STORE_NAME);

    for (const key of LOCAL_STORAGE_MIGRATION_KEYS) {
      const localVal = window.localStorage.getItem(key);
      if (localVal) {
        // Check if already in IndexedDB
        const getReq = store.get(key);
        getReq.onsuccess = () => {
          if (!getReq.result) {
            store.put(localVal, key);
          }
        };
      }
    }
  } catch (error) {
    console.warn('[IndexedDB] Error during localStorage migration:', error);
  }
}

/**
 * AsyncStorage-compatible key-value API backed by IndexedDB.
 */
export const indexedDBStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([KV_STORE_NAME], 'readonly');
        const store = tx.objectStore(KV_STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          resolve((req.result as string) || null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.warn(`[IndexedDB] getItem failed for "${key}", falling back to localStorage:`, error);
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([KV_STORE_NAME], 'readwrite');
        const store = tx.objectStore(KV_STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.warn(`[IndexedDB] setItem failed for "${key}", falling back to localStorage:`, error);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([KV_STORE_NAME], 'readwrite');
        const store = tx.objectStore(KV_STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.warn(`[IndexedDB] removeItem failed for "${key}":`, error);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    }
  },

  async clear(): Promise<void> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([KV_STORE_NAME], 'readwrite');
        const store = tx.objectStore(KV_STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.warn('[IndexedDB] clear failed:', error);
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([KV_STORE_NAME], 'readonly');
        const store = tx.objectStore(KV_STORE_NAME);
        const req = store.getAllKeys();
        req.onsuccess = () => resolve((req.result as string[]) || []);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.warn('[IndexedDB] getAllKeys failed:', error);
      return [];
    }
  },

  /**
   * Direct Raw Blob Storage API (for audio and image media without Base64 bloat).
   */
  async saveBlob(id: string, blob: Blob): Promise<string> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([MEDIA_STORE_NAME], 'readwrite');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve(`blob:${id}`);
      req.onerror = () => reject(req.error);
    });
  },

  async getBlob(id: string): Promise<Blob | null> {
    const cleanId = id.startsWith('blob:') ? id.substring(5) : id;
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([MEDIA_STORE_NAME], 'readonly');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const req = store.get(cleanId);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });
  },

  async deleteBlob(id: string): Promise<void> {
    const cleanId = id.startsWith('blob:') ? id.substring(5) : id;
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([MEDIA_STORE_NAME], 'readwrite');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const req = store.delete(cleanId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
};

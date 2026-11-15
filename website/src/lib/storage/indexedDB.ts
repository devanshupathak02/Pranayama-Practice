import { AppSettings, DEFAULT_SETTINGS, SessionRecord } from '@/types/timer';

const DB_NAME = 'PranayamaTimesDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_key_value';

const STORAGE_KEYS = {
  SETTINGS: 'pranayama_app_settings_v1',
  HISTORY: 'pranayama_session_history_v1',
};

class IndexedDBClient {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private isClient(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private async openDB(): Promise<IDBDatabase> {
    if (!this.isClient()) {
      throw new Error('IndexedDB is not supported on this platform');
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  public async getItem<T>(key: string): Promise<T | null> {
    if (!this.isClient()) return null;

    try {
      const db = await this.openDB();
      return new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          resolve(req.result !== undefined ? req.result : null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to localStorage
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    }
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    if (!this.isClient()) return;

    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to localStorage
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage quota or private browsing restriction
      }
    }
  }

  public async removeItem(key: string): Promise<void> {
    if (!this.isClient()) return;

    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    }
  }
}

export const dbClient = new IndexedDBClient();

export async function loadAppSettings(): Promise<AppSettings> {
  const settings = await dbClient.getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
  return settings || DEFAULT_SETTINGS;
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await dbClient.setItem(STORAGE_KEYS.SETTINGS, settings);
}

export async function loadSessionHistory(): Promise<SessionRecord[]> {
  const history = await dbClient.getItem<SessionRecord[]>(STORAGE_KEYS.HISTORY);
  return Array.isArray(history) ? history : [];
}

export async function recordCompletedSession(record: SessionRecord): Promise<void> {
  const existing = await loadSessionHistory();
  const updated = [record, ...existing].slice(0, 100); // keep last 100 sessions
  await dbClient.setItem(STORAGE_KEYS.HISTORY, updated);
}

export async function clearAllSessionHistory(): Promise<void> {
  await dbClient.removeItem(STORAGE_KEYS.HISTORY);
}

export async function importSessionHistory(records: SessionRecord[]): Promise<SessionRecord[]> {
  const existing = await loadSessionHistory();
  const existingIds = new Set(existing.map((r) => r.id));
  const newRecords = records.filter((r) => !existingIds.has(r.id) && r.id && r.routineName);
  const merged = [...newRecords, ...existing].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  ).slice(0, 200);
  await dbClient.setItem(STORAGE_KEYS.HISTORY, merged);
  return merged;
}

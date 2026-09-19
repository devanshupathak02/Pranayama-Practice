import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { indexedDBStorage } from './indexedDBStorage';
import { SessionRecord } from '../models/SessionHistory';
import { Routine } from '../models/Routine';
import { DEFAULT_WITNESS_SOUND_ID } from '../constants/sounds';

export interface AppSettings {
  muteTechniqueNames: boolean;
  witnessSoundId: string;
}

const storageClient = Platform.OS === 'web' ? indexedDBStorage : AsyncStorage;
export const storage = storageClient;

const STORAGE_KEYS = {
  SETTINGS: 'pranayama_app_settings_v1',
  HISTORY: 'pranayama_session_history_v1',
  CUSTOM_ROUTINES: 'pranayama_custom_routines_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  muteTechniqueNames: false,
  witnessSoundId: DEFAULT_WITNESS_SOUND_ID,
};

/**
 * Low-level storage wrapper for persistent storage (D4 / D21).
 * Uses IndexedDB on Web and AsyncStorage on Native.
 * All methods wrap storage calls in try/catch to degrade gracefully.
 */

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const raw = await storageClient.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      muteTechniqueNames:
        typeof parsed.muteTechniqueNames === 'boolean'
          ? parsed.muteTechniqueNames
          : DEFAULT_SETTINGS.muteTechniqueNames,
      witnessSoundId:
        typeof parsed.witnessSoundId === 'string'
          ? parsed.witnessSoundId
          : DEFAULT_SETTINGS.witnessSoundId,
    };
  } catch (error) {
    console.error('Failed to load settings from storage:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await storageClient.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to storage:', error);
  }
};

export const loadSessionHistory = async (): Promise<SessionRecord[]> => {
  try {
    const raw = await storageClient.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as SessionRecord[];
  } catch (error) {
    console.error('Failed to load session history from storage:', error);
    return [];
  }
};

export const saveSessionRecord = async (record: SessionRecord): Promise<void> => {
  try {
    const existing = await loadSessionHistory();
    const updated = [record, ...existing];
    await storageClient.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save session record to storage:', error);
  }
};

export const clearSessionHistory = async (): Promise<void> => {
  try {
    await storageClient.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Failed to clear session history:', error);
  }
};

/**
 * Load all custom routines from persistent storage.
 */
export const loadCustomRoutines = async (): Promise<Routine[]> => {
  try {
    const raw = await storageClient.getItem(STORAGE_KEYS.CUSTOM_ROUTINES);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as Routine[];
  } catch (error) {
    console.error('Failed to load custom routines from storage:', error);
    return [];
  }
};

/**
 * Save a custom routine (inserts or updates).
 */
export const saveCustomRoutine = async (routine: Routine): Promise<void> => {
  try {
    const routines = await loadCustomRoutines();
    const index = routines.findIndex((r) => r.id === routine.id);
    if (index >= 0) {
      routines[index] = routine;
    } else {
      routines.push(routine);
    }
    await storageClient.setItem(STORAGE_KEYS.CUSTOM_ROUTINES, JSON.stringify(routines));
  } catch (error) {
    console.error('Failed to save custom routine to storage:', error);
  }
};

/**
 * Delete a custom routine by ID.
 */
export const deleteCustomRoutine = async (id: string): Promise<void> => {
  try {
    const routines = await loadCustomRoutines();
    const updated = routines.filter((r) => r.id !== id);
    await storageClient.setItem(STORAGE_KEYS.CUSTOM_ROUTINES, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete custom routine from storage:', error);
  }
};

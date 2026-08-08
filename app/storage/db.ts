import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionRecord } from '../models/SessionHistory';
import { Routine } from '../models/Routine';

export interface AppSettings {
  muteTechniqueNames: boolean;
}

const STORAGE_KEYS = {
  SETTINGS: 'pranayama_app_settings_v1',
  HISTORY: 'pranayama_session_history_v1',
  CUSTOM_ROUTINES: 'pranayama_custom_routines_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  muteTechniqueNames: false,
};

/**
 * Low-level AsyncStorage wrapper for persistent storage (D4).
 * All methods wrap storage calls in try/catch to degrade gracefully.
 */

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      muteTechniqueNames:
        typeof parsed.muteTechniqueNames === 'boolean'
          ? parsed.muteTechniqueNames
          : DEFAULT_SETTINGS.muteTechniqueNames,
    };
  } catch (error) {
    console.error('Failed to load settings from storage:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to storage:', error);
  }
};

export const loadSessionHistory = async (): Promise<SessionRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
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
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save session record to storage:', error);
  }
};

export const clearSessionHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Failed to clear session history:', error);
  }
};

/**
 * Load all custom routines from persistent storage.
 */
export const loadCustomRoutines = async (): Promise<Routine[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES);
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
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINES, JSON.stringify(routines));
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
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINES, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete custom routine from storage:', error);
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionRecord } from '../models/SessionHistory';

export interface AppSettings {
  muteTechniqueNames: boolean;
}

const STORAGE_KEYS = {
  SETTINGS: 'pranayama_app_settings_v1',
  HISTORY: 'pranayama_session_history_v1',
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

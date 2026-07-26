import { create } from 'zustand';
import { SessionRecord } from '../models/SessionHistory';
import { loadSessionHistory, saveSessionRecord, clearSessionHistory as clearStorageHistory } from '../storage/db';

interface HistoryState {
  history: SessionRecord[];
  isLoading: boolean;
  loadHistory: () => Promise<void>;
  addRecord: (record: SessionRecord) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  isLoading: false,

  loadHistory: async () => {
    set({ isLoading: true });
    const history = await loadSessionHistory();
    set({ history, isLoading: false });
  },

  addRecord: async (record: SessionRecord) => {
    await saveSessionRecord(record);
    const updated = [record, ...get().history];
    set({ history: updated });
  },

  clearHistory: async () => {
    await clearStorageHistory();
    set({ history: [] });
  },
}));

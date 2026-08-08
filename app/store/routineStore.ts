import { create } from 'zustand';
import { Routine } from '../models/Routine';
import { PRANAYAMA_ROUTINE } from '../data/pranayamaRoutine';
import { loadCustomRoutines, saveCustomRoutine, deleteCustomRoutine } from '../storage/db';

interface RoutineState {
  routines: Routine[];
  isLoading: boolean;
  loadRoutines: () => Promise<void>;
  saveRoutine: (routine: Routine) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set) => ({
  routines: [PRANAYAMA_ROUTINE],
  isLoading: false,

  loadRoutines: async () => {
    set({ isLoading: true });
    try {
      const custom = await loadCustomRoutines();
      set({ routines: [PRANAYAMA_ROUTINE, ...custom] });
    } catch (error) {
      console.error('Failed to load custom routines into store:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveRoutine: async (routine: Routine) => {
    try {
      await saveCustomRoutine(routine);
      const custom = await loadCustomRoutines();
      set({ routines: [PRANAYAMA_ROUTINE, ...custom] });
    } catch (error) {
      console.error('Failed to save routine in store:', error);
    }
  },

  deleteRoutine: async (id: string) => {
    try {
      await deleteCustomRoutine(id);
      const custom = await loadCustomRoutines();
      set({ routines: [PRANAYAMA_ROUTINE, ...custom] });
    } catch (error) {
      console.error('Failed to delete routine in store:', error);
    }
  },
}));

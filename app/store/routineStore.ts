import { create } from 'zustand';
import { Routine } from '../models/Routine';
import { BUILTIN_ROUTINES as PRANAYAMA_ROUTINES } from '../data/pranayamaRoutine';
import { YOGA_NIDRA_ROUTINES } from '../data/yogaNidraRoutines';
import { loadCustomRoutines, saveCustomRoutine, deleteCustomRoutine } from '../storage/db';

const ALL_BUILTIN_ROUTINES: Routine[] = [...PRANAYAMA_ROUTINES, ...YOGA_NIDRA_ROUTINES];

interface RoutineState {
  routines: Routine[];
  isLoading: boolean;
  loadRoutines: () => Promise<void>;
  saveRoutine: (routine: Routine) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set) => ({
  routines: ALL_BUILTIN_ROUTINES,
  isLoading: false,

  loadRoutines: async () => {
    set({ isLoading: true });
    try {
      const custom = await loadCustomRoutines();
      set({ routines: [...ALL_BUILTIN_ROUTINES, ...custom] });
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
      set({ routines: [...ALL_BUILTIN_ROUTINES, ...custom] });
    } catch (error) {
      console.error('Failed to save routine in store:', error);
    }
  },

  deleteRoutine: async (id: string) => {
    try {
      set((state) => ({
        routines: state.routines.filter((r) => r.id !== id),
      }));
      await deleteCustomRoutine(id);
      const custom = await loadCustomRoutines();
      set({ routines: [...ALL_BUILTIN_ROUTINES, ...custom] });
    } catch (error) {
      console.error('Failed to delete routine in store:', error);
      const custom = await loadCustomRoutines();
      set({ routines: [...ALL_BUILTIN_ROUTINES, ...custom] });
    }
  },
}));

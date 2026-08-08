import { Routine } from '../models/Routine';
import { useRoutineStore } from '../store/routineStore';

/**
 * Available routines registry.
 * Dynamically proxies to useRoutineStore.getState().routines to support custom routines.
 */
export const ROUTINES = new Proxy<Routine[]>([], {
  get(_, prop) {
    const list = useRoutineStore.getState().routines;
    const value = Reflect.get(list, prop);
    return typeof value === 'function' ? value.bind(list) : value;
  },
  ownKeys() {
    return Reflect.ownKeys(useRoutineStore.getState().routines);
  },
  getOwnPropertyDescriptor(_, prop) {
    return Reflect.getOwnPropertyDescriptor(useRoutineStore.getState().routines, prop);
  }
});

/**
 * Helper to look up a routine by its unique identifier.
 */
export const getRoutineById = (id: string): Routine | undefined => {
  return useRoutineStore.getState().routines.find((routine) => routine.id === id);
};

/**
 * Primary routine used for v1.
 */
export const DEFAULT_ROUTINE = new Proxy<Routine>({} as Routine, {
  get(_, prop) {
    const defaultRoutine = useRoutineStore.getState().routines[0];
    if (!defaultRoutine) return undefined;
    const value = Reflect.get(defaultRoutine, prop);
    return typeof value === 'function' ? value.bind(defaultRoutine) : value;
  }
});


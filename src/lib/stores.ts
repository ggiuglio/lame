import { writable, derived, get } from 'svelte/store';

export type Person = {
  id: string;
  name: string;
  dateOfInjury: string;
  injuredLeg: 'Left' | 'Right' | 'Both' | 'Other';
};

function createPeopleStore() {
  const STORAGE_KEY = 'people-table-v1';
  const isLoading = writable(true);
  const error = writable<string>('');
  const data = writable<Person[]>([]);
  const isSaving = writable(false);
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  function saveToLocalStorage(newData: Person[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  async function saveWithRetry(newData: Person[]): Promise<void> {
    isSaving.set(true);
    error.set('');

    try {
      await saveToLocalStorage(newData);
      retryCount = 0;
    } catch (e) {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return saveWithRetry(newData);
      }
      throw e;
    } finally {
      isSaving.set(false);
    }
  }

  // Load initial data
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) data.set(JSON.parse(raw));
    } catch (e) {
      error.set(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      isLoading.set(false);
    }
  }

  // Cleanup function to clear any pending saves
  function cleanup() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
  }

  const peopleStore = derived([data, isLoading, error, isSaving], ([$data, $isLoading, $error, $isSaving]) => ({ 
    data: $data, 
    loading: $isLoading, 
    error: $error,
    saving: $isSaving
  }));

  const store = {
    subscribe: (run: (value: { data: Person[]; loading: boolean; error: string; saving: boolean }) => void) => {
      const unsubscribe = peopleStore.subscribe(run);
      return () => {
        cleanup();
        unsubscribe();
      };
    },
    set: data.set,
    load: () => {
      isLoading.set(true);
      if (typeof window === 'undefined') {
        isLoading.set(false);
        return;
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) data.set(JSON.parse(raw));
      } catch (e) {
        error.set(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        isLoading.set(false);
      }
    },
    save: (newData: Person[]) => {
      if (typeof window === 'undefined') return;
      try {
        const sortedData = newData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedData));
        data.set(sortedData);
        error.set('');
      } catch (e) {
        error.set(e instanceof Error ? e.message : 'Failed to save data');
      }
    },
    add: (person: Omit<Person, 'id'>) => {
      const id = crypto.randomUUID();
      const newPerson = { ...person, id };
      
      // Optimistic update
      data.update(people => [newPerson, ...people]);
      
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        try {
          const currentData = get(data);
          await saveWithRetry(currentData);
        } catch (e) {
          error.set(e instanceof Error ? e.message : 'Failed to save data');
          // Revert on error
          data.update(people => people.filter(p => p.id !== id));
        }
      }, 300);
    },
    update: (id: string, updates: Partial<Omit<Person, 'id'>>) => {
      const originalPeople = get(data);
      const idx = originalPeople.findIndex((p: Person) => p.id === id);
      if (idx === -1) return;

      // Optimistic update
      data.update(people => {
        const newPeople = [...people];
        newPeople[idx] = { ...people[idx], ...updates };
        return newPeople;
      });

      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        try {
          const currentData = get(data);
          await saveWithRetry(currentData);
        } catch (e) {
          error.set(e instanceof Error ? e.message : 'Failed to save data');
          // Revert on error
          data.set(originalPeople);
        }
      }, 300);
    },
    remove: (id: string) => {
      const originalPeople = get(data);
      const personToRemove = originalPeople.find((p: Person) => p.id === id);
      if (!personToRemove) return;

      // Optimistic update
      data.update(people => people.filter(p => p.id !== id));

      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        try {
          const currentData = get(data);
          await saveWithRetry(currentData);
        } catch (e) {
          error.set(e instanceof Error ? e.message : 'Failed to save data');
          // Revert on error
          data.set(originalPeople);
        }
      }, 300);
    }
  };
  return store;
}

export const people = createPeopleStore();
export type PeopleStore = ReturnType<typeof createPeopleStore>;

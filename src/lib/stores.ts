import { writable, derived, get } from 'svelte/store';
import { database } from './firebase';
import { ref, set, push, remove, onValue, off } from 'firebase/database';

export type Person = {
  id: string;
  name: string;
  dateOfInjury: string;
  injuredLeg: 'Left' | 'Right' | 'Both' | 'Other';
};

function createPeopleStore() {
  const isLoading = writable(true);
  const error = writable<string>('');
  const data = writable<Person[]>([]);
  const isSaving = writable(false);
  let retryCount = 0;
  const MAX_RETRIES = 3;

  const lamesRef = ref(database, 'lames');

  async function saveToFirebase(personId: string, personData: Omit<Person, 'id'>): Promise<void> {
    return new Promise((resolve, reject) => {
      set(ref(database, `lames/${personId}`), personData)
        .then(() => resolve())
        .catch(reject);
    });
  }

  async function saveWithRetry(personId: string, personData: Omit<Person, 'id'>): Promise<void> {
    isSaving.set(true);
    error.set('');

    try {
      await saveToFirebase(personId, personData);
      retryCount = 0;
    } catch (e) {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return saveWithRetry(personId, personData);
      }
      throw e;
    } finally {
      isSaving.set(false);
    }
  }

  // Load initial data from Firebase
  if (typeof window !== 'undefined') {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Firebase loading timeout - falling back to empty data');
      error.set('Connection timeout - using empty data');
      data.set([]);
      isLoading.set(false);
    }, 5000);

    try {
      onValue(lamesRef, (snapshot) => {
        clearTimeout(loadingTimeout);
        try {
          const firebaseData = snapshot.val();
          if (firebaseData) {
            const peopleArray: Person[] = Object.entries(firebaseData).map(([id, person]: [string, any]) => ({
              id,
              ...person
            }));
            data.set(peopleArray);
          } else {
            data.set([]);
          }
          error.set('');
        } catch (e) {
          console.error('Firebase data parsing error:', e);
          error.set(e instanceof Error ? e.message : 'Failed to load data from Firebase');
          data.set([]);
        } finally {
          isLoading.set(false);
        }
      }, (e) => {
        clearTimeout(loadingTimeout);
        console.error('Firebase connection error:', e);
        error.set(e.message || 'Failed to connect to Firebase - using empty data');
        data.set([]);
        isLoading.set(false);
      });
    } catch (e) {
      clearTimeout(loadingTimeout);
      console.error('Firebase initialization error:', e);
      error.set('Firebase initialization failed - using empty data');
      data.set([]);
      isLoading.set(false);
    }
  } else {
    // Server-side or no window - set empty data
    data.set([]);
    isLoading.set(false);
  }

  // Cleanup function
  function cleanup() {
    if (typeof window !== 'undefined') {
      off(lamesRef);
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
      // Firebase handles loading automatically via onValue listener
      // This method is kept for compatibility
    },
    save: (newData: Person[]) => {
      // Firebase handles saving automatically via individual operations
      // This method is kept for compatibility
    },
    add: async (person: Omit<Person, 'id'>) => {
      const id = crypto.randomUUID();
      const newPerson = { ...person, id };
      
      // Optimistic update
      data.update(people => [newPerson, ...people]);
      
      try {
        await saveWithRetry(id, person);
      } catch (e) {
        error.set(e instanceof Error ? e.message : 'Failed to save data to Firebase');
        // Revert on error
        data.update(people => people.filter(p => p.id !== id));
      }
    },
    update: async (id: string, updates: Partial<Omit<Person, 'id'>>) => {
      const originalPeople = get(data);
      const idx = originalPeople.findIndex((p: Person) => p.id === id);
      if (idx === -1) return;

      const updatedPerson = { ...originalPeople[idx], ...updates };
      const { id: _, ...personData } = updatedPerson;

      // Optimistic update
      data.update(people => {
        const newPeople = [...people];
        newPeople[idx] = updatedPerson;
        return newPeople;
      });

      try {
        await saveWithRetry(id, personData);
      } catch (e) {
        error.set(e instanceof Error ? e.message : 'Failed to update data in Firebase');
        // Revert on error
        data.set(originalPeople);
      }
    },
    remove: async (id: string) => {
      const originalPeople = get(data);
      const personToRemove = originalPeople.find((p: Person) => p.id === id);
      if (!personToRemove) return;

      // Optimistic update
      data.update(people => people.filter(p => p.id !== id));

      try {
        await remove(ref(database, `lames/${id}`));
      } catch (e) {
        error.set(e instanceof Error ? e.message : 'Failed to remove data from Firebase');
        // Revert on error
        data.set(originalPeople);
      }
    }
  };
  return store;
}

export const people = createPeopleStore();
export type PeopleStore = ReturnType<typeof createPeopleStore>;

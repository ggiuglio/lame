import { writable, get } from 'svelte/store';
import { database } from '../firebase';
import { ref, set, remove as firebaseRemove, onValue, off } from 'firebase/database';

export type DndDay = {
  date: string;
  isDndDay: boolean;
  isTentative: boolean;
};

export type PlayerAvailability = {
  id: string;
  date: string;
  playerName: string;
  canPlay: boolean | 'tentative';
};

function createDndDaysStore() {
  const store = writable<DndDay[]>([]);
  const { subscribe, set: setStore } = store;

  const dndDaysRef = ref(database, 'dndDays');

  // Load data from Firebase
  if (typeof window !== 'undefined') {
    onValue(dndDaysRef, (snapshot) => {
      const firebaseData = snapshot.val();
      if (firebaseData) {
        const daysArray: DndDay[] = Object.entries(firebaseData).map(([date, data]: [string, any]) => ({
          date,
          isDndDay: data.isDndDay || false,
          isTentative: data.isTentative || false
        }));
        setStore(daysArray);
      } else {
        setStore([]);
      }
    });
  }

  return {
    subscribe,
    setDndDay: async (date: string, isDndDay: boolean, isTentative: boolean = false) => {
      try {
        if (isDndDay || isTentative) {
          await set(ref(database, `dndDays/${date}`), { isDndDay, isTentative });
        } else {
          await firebaseRemove(ref(database, `dndDays/${date}`));
        }
      } catch (e) {
        console.error('Failed to update D&D day:', e);
      }
    },
    isDndDay: (date: string) => {
      const days = get(store);
      return days.find(d => d.date === date)?.isDndDay || false;
    },
    isTentative: (date: string) => {
      const days = get(store);
      return days.find(d => d.date === date)?.isTentative || false;
    }
  };
}

function createPlayerAvailabilityStore() {
  const store = writable<PlayerAvailability[]>([]);
  const { subscribe, set: setStore } = store;

  const availabilityRef = ref(database, 'playerAvailability');

  // Load data from Firebase
  if (typeof window !== 'undefined') {
    onValue(availabilityRef, (snapshot) => {
      const firebaseData = snapshot.val();
      if (firebaseData) {
        const availabilityArray: PlayerAvailability[] = Object.entries(firebaseData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setStore(availabilityArray);
      } else {
        setStore([]);
      }
    });
  }

  return {
    subscribe,
    add: async (availability: Omit<PlayerAvailability, 'id'>) => {
      const id = crypto.randomUUID();
      try {
        await set(ref(database, `playerAvailability/${id}`), availability);
      } catch (e) {
        console.error('Failed to add player availability:', e);
      }
    },
    remove: async (id: string) => {
      try {
        await firebaseRemove(ref(database, `playerAvailability/${id}`));
      } catch (e) {
        console.error('Failed to remove player availability:', e);
      }
    },
    getByDate: (date: string) => {
      const availabilities = get(store);
      return availabilities.filter(a => a.date === date);
    }
  };
}

export const dndDays = createDndDaysStore();
export const playerAvailability = createPlayerAvailabilityStore();

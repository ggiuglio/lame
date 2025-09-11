import { writable, get } from 'svelte/store';

export type Appointment = {
  id: string;
  date: string;
  time: string;
  visitorName: string;
};

function createAppointmentsStore() {
  const { subscribe, update } = writable<Appointment[]>([]);

  return {
    subscribe,
    add: (appointment: Omit<Appointment, 'id'>) => {
      update(appointments => [
        ...appointments,
        { ...appointment, id: crypto.randomUUID() }
      ]);
    },
    remove: (id: string) => {
      update(appointments => appointments.filter(a => a.id !== id));
    },
    getByDate: (date: string) => {
      return get(appointments).filter(a => a.date === date);
    }
  };
}

export const appointments = createAppointmentsStore();

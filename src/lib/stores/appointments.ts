import { writable, get } from 'svelte/store';

export type Appointment = {
  id: string;
  date: string;
  time: string; // ISO time string HH:mm in local timezone
  visitorName: string;
};

function createAppointmentsStore() {
  const store = writable<Appointment[]>([]);
  const { subscribe, update } = store;

  return {
    subscribe,
    isTimeSlotAvailable: (date: string, time: string) => {
      const currentAppointments = get(store);
      console.log('Checking availability for:', date, time, currentAppointments);
      return !currentAppointments.some(a => a.date === date && a.time === time);
    },
    add: (appointment: Omit<Appointment, 'id'>) => {
      const currentAppointments = get(store);
      console.log('Adding appointment:', appointment, 'Current appointments:', currentAppointments);
      if (!currentAppointments.some(a => a.date === appointment.date && a.time === appointment.time)) {
        const newAppointment = { ...appointment, id: crypto.randomUUID() };
        update(state => [...state, newAppointment]);
        console.log('Added appointment:', newAppointment);
        return true;
      }
      return false;
    },
    remove: (id: string) => {
      const currentAppointments = get(store);
      update(state => state.filter(a => a.id !== id));
    },
    getByDate: (date: string) => {
      const currentAppointments = get(store);
      const filtered = currentAppointments.filter(a => a.date === date);
      console.log('Getting appointments for date:', date, filtered);
      return filtered;
    }
  };
}

export const appointments = createAppointmentsStore();

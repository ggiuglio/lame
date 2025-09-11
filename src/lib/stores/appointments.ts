import { writable, get } from 'svelte/store';

export type Appointment = {
  id: string;
  date: string;
  time: string; // ISO time string HH:mm in local timezone
  visitorName: string;
};

function createAppointmentsStore() {
  const { subscribe, update } = writable<Appointment[]>([]);

  return {
    subscribe,
    isTimeSlotAvailable: (date: string, time: string) => {
      const currentAppointments = get(appointments);
      return !currentAppointments.some(a => a.date === date && a.time === time);
    },
    add: (appointment: Omit<Appointment, 'id'>) => {
      const currentAppointments = get(appointments);
      if (!currentAppointments.some(a => a.date === appointment.date && a.time === appointment.time)) {
        update(currentAppointments => [
          ...currentAppointments,
          { ...appointment, id: crypto.randomUUID() }
        ]);
        return true;
      }
      return false;
    },
    remove: (id: string) => {
      update(appointments => appointments.filter(a => a.id !== id));
    },
    getByDate: (date: string) => {
      const currentAppointments = get(appointments);
      return currentAppointments.filter(a => a.date === date);
    }
  };
}

export const appointments = createAppointmentsStore();

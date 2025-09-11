<script lang="ts">
  import { appointments } from './stores/appointments';
  import type { Appointment } from './stores/appointments';

  export let day: number;
  export let year: number;
  export let month: number;
  export let isToday: boolean;
  export let onClick: () => void;

  function formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  $: date = formatDate(new Date(year, month, day));
  $: dayAppointments = $appointments.filter(a => a.date === date);
</script>

<button 
  class="aspect-square p-2 rounded-lg {isToday ? 'bg-[#142833] ring-2 ring-pirate-gold' : 'bg-[#142833]/50'} hover:bg-[#1A3240] text-pirate-parchment transition flex flex-col relative focus:outline-none focus:ring-2 focus:ring-pirate-gold/60"
  on:click={onClick}
  tabindex="0"
  on:keydown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }}
>
  <span class="text-sm font-medium">{day}</span>
  {#each dayAppointments as appointment}
    <div class="flex items-center gap-0.5 mt-0.5">
      <div class="w-0.5 h-0.5 rounded-full bg-pirate-gold flex-shrink-0" />
      <div class="truncate text-[0.65rem] text-pirate-parchment/90">{appointment.time.split(':')[0]}:00 • {appointment.visitorName}</div>
    </div>
  {/each}
</button>

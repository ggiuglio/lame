<script lang="ts">
  import type { Appointment } from './stores/appointments';
  import DayAppointments from './DayAppointments.svelte';

  export let day: number;
  export let appointments: Appointment[];
  export let isToday: boolean;
  export let onClick: () => void;
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
  {#if appointments.length > 0}
    <DayAppointments {appointments} />
  {/if}
</button>

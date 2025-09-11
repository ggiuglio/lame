<script lang="ts">
  import type { Appointment } from './stores/appointments';
  export let appointments: Appointment[];
</script>

<div class="mt-1 flex flex-col gap-1 text-[0.7rem] leading-tight">
  {#each [...appointments].sort((a, b) => a.time.localeCompare(b.time)).slice(0, 3) as appointment}
    <div class="flex items-center gap-1 group relative">
      <div class="w-1 h-1 rounded-full bg-pirate-gold flex-shrink-0"></div>
      <div class="truncate text-pirate-parchment/90">{appointment.time.split(':')[0]}:00 {appointment.visitorName}</div>
      
      <!-- Tooltip -->
      <div class="absolute bottom-full left-0 mb-1 w-48 bg-[#091E26] border border-[#1C2F3A] rounded-lg p-2 text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 shadow-lg shadow-black/50">
        <div class="font-medium">{appointment.visitorName}</div>
        <div class="text-pirate-parchment/70">{appointment.time} - {`${((parseInt(appointment.time.split(':')[0]) + 1) % 24).toString().padStart(2, '0')}:00`}</div>
      </div>
    </div>
  {/each}
  {#if appointments.length > 3}
    <div class="text-pirate-gold/90 text-center text-[0.65rem]">+{appointments.length - 3} more</div>
  {/if}
</div>

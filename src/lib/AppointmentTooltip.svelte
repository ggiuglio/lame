<script lang="ts">
  import type { Appointment } from './stores/appointments';

  export let appointment: Appointment;

  function formatTimeRange(time: string): string {
    const startHour = time.split(':')[0];
    const endHour = ((parseInt(startHour) + 1) % 24).toString().padStart(2, '0');
    return `${time} - ${endHour}:00`;
  }
</script>

<div class="absolute bottom-full left-0 mb-1 w-48 bg-[#091E26] border border-[#1C2F3A] rounded-lg p-2 text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg shadow-black/50">
  <div class="absolute -bottom-1 left-4 w-2 h-2 bg-[#091E26] border-b border-r border-[#1C2F3A] rotate-45"></div>
  <div class="font-medium">{appointment.visitorName}</div>
  <div class="text-pirate-parchment/70">{formatTimeRange(appointment.time)}</div>
</div>

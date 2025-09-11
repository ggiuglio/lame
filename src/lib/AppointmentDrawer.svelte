<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { appointments } from './stores/appointments';

  export let open = false;
  export let selectedDate: Date | null = null;

  const dispatch = createEventDispatcher<{
    close: void;
    save: { visitorName: string; time: string; };
  }>();

  let visitorName = '';
  let time = '';
  let errorMessage = '';

  function close() {
    dispatch('close');
  }

  function handleSubmit() {
    if (!visitorName || !time || !selectedDate) return;

    const date = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    
    if (!appointments.isTimeSlotAvailable(date, time)) {
      errorMessage = 'Your Lame is busy at that time';
      return;
    }

    errorMessage = '';
    dispatch('save', { visitorName, time });
    visitorName = '';
    time = '';
    close();
  }

  $: if (time) errorMessage = '';

  $: selectedDayAppointments = selectedDate ? $appointments.filter(a => {
    const date = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return a.date === date;
  }).sort((a, b) => a.time.localeCompare(b.time)) : [];
</script>

<aside
  class="fixed right-0 top-0 h-full w-full sm:w-[420px] max-w-full z-50 transform transition-transform duration-300
         bg-[#091E26] border-l border-[#1C2F3A] flex flex-col shadow-2xl shadow-black/50"
  style:transform={open ? 'translateX(0)' : 'translateX(100%)'}
  aria-modal="true"
  role="dialog"
  aria-labelledby="drawer-title"
>
  <!-- Drawer header -->
  <div class="p-4 border-b border-[#1C2F3A] flex items-center justify-between">
    <h1 id="drawer-title" class="text-lg font-bold text-pirate-gold tracking-wide gothic-font">
      {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || ''}
    </h1>
    <button
      class="rounded-lg p-2 bg-[#1C2F3A] hover:bg-[#2A3F4D] text-pirate-parchment transition"
      on:click={close}
      aria-label="Close drawer"
    >✕</button>
  </div>

  <!-- Drawer content -->
  <div class="flex-1 overflow-auto">
    <!-- Panel 1: Existing appointments -->
    <div class="p-4 border-b border-[#1C2F3A]">
      <h2 class="text-lg font-bold text-pirate-gold mb-4 gothic-font">Existing Lame Appointments</h2>
      {#if selectedDayAppointments.length > 0}
        <div class="space-y-2">
          {#each selectedDayAppointments as appointment}
            <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-[#142833]/50 hover:bg-[#1A3240] transition group">
              <div class="flex items-center gap-3">
                <span class="text-pirate-parchment font-medium">{appointment.visitorName}</span>
                <span class="text-pirate-parchment font-medium tracking-wide text-base">• {appointment.time} - {`${((parseInt(appointment.time.split(':')[0]) + 1) % 24).toString().padStart(2, '0')}:00`}</span>
              </div>
              <button 
                class="rounded-lg p-1.5 bg-[#1A3240] hover:bg-red-900/80 text-pirate-parchment transition opacity-0 group-hover:opacity-100 hover:text-red-100"
                on:click={() => {
                  if (confirm(`Are you sure you want to remove ${appointment.visitorName}'s appointment?`)) {
                    appointments.remove(appointment.id);
                  }
                }}
              >
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center text-pirate-gold py-4 text-lg">
          Your Lame is completely free today
        </div>
      {/if}
    </div>

    <!-- Panel 2: New appointment form -->
    <div class="p-4">
      <h2 class="text-lg font-bold text-pirate-gold mb-4 gothic-font">Make a New Lame Appointment</h2>
      <form id="appointmentForm" class="space-y-4" on:submit|preventDefault={handleSubmit}>
        {#if errorMessage}
          <div class="p-2 rounded bg-red-900/20 border border-red-900/30 text-red-300 text-sm">
            {errorMessage}
          </div>
        {/if}
    <div>
      <label class="block text-sm font-medium text-pirate-gold" for="visitorName">Visitor Name</label>
      <input
        id="visitorName"
        class="mt-1 block w-full rounded-xl border border-white/10 bg-black/25 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pirate-gold/60"
        bind:value={visitorName}
        required
        placeholder="Enter visitor's name"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-pirate-gold" for="time">Time</label>
      <div class="relative">
        <select
          id="time"
          class="mt-1 block w-full rounded-xl border border-white/10 bg-black/25 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 appearance-none pr-8"
          style="color-scheme: dark"
          bind:value={time}
          required
        >
          <option value="" disabled>Select a time slot</option>
          {#each Array.from({ length: 24 }, (_, i) => i) as hour}
            <option value={`${hour.toString().padStart(2, '0')}:00`}>{hour.toString().padStart(2, '0')}:00 - {((hour + 1) % 24).toString().padStart(2, '0')}:00</option>
          {/each}
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>

  </form>

    <!-- Save button at bottom of panel -->
    <div class="p-4 border-t border-[#1C2F3A] mt-auto">
      <button
        type="submit"
        form="appointmentForm"
        class="w-full rounded-lg px-3 py-2 bg-pirate-gold/90 hover:bg-pirate-gold text-[#1B2A34] transition shadow-lg shadow-black/30 ring-1 ring-black/40 focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 focus:ring-offset-2 focus:ring-offset-[#06131A]"
      >
        Save Appointment
      </button>
    </div>
  </div>
</aside>

{#if open}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
    on:click={close}
    aria-hidden="true"
  />
{/if}

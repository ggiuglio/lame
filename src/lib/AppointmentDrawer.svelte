<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let selectedDate: Date | null = null;

  const dispatch = createEventDispatcher<{
    close: void;
    save: { visitorName: string; time: string; };
  }>();

  let visitorName = '';
  let time = '';

  function close() {
    dispatch('close');
  }

  function handleSubmit() {
    if (!visitorName || !time) return;
    dispatch('save', { visitorName, time });
    visitorName = '';
    time = '';
    close();
  }
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
  <form class="p-4 space-y-4 overflow-auto flex-1" on:submit|preventDefault={handleSubmit}>
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
          {#each Array.from({ length: 9 }, (_, i) => i + 9) as hour}
            <option value={`${hour.toString().padStart(2, '0')}:00`}>{hour.toString().padStart(2, '0')}:00 - {(hour + 1).toString().padStart(2, '0')}:00</option>
          {/each}
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>

    <div class="pt-2 flex justify-end gap-2">
      <button
        type="button"
        class="rounded-lg px-3 py-1 bg-[#142833] hover:bg-[#1A3240] text-pirate-parchment transition"
        on:click={close}
      >
        Cancel
      </button>
      <button
        type="submit"
        class="rounded-lg px-3 py-1 bg-pirate-gold/90 hover:bg-pirate-gold text-[#1B2A34] transition shadow-lg shadow-black/30 ring-1 ring-black/40 focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 focus:ring-offset-2 focus:ring-offset-[#06131A]"
      >
        Save
      </button>
    </div>
  </form>
</aside>

{#if open}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
    on:click={close}
    aria-hidden="true"
  />
{/if}

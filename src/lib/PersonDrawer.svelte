<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let open = false;
  export let mode: 'create' | 'edit' = 'create';
  export let editingPerson: {
    id: string;
    name: string;
    dateOfInjury: string;
    injuredLeg: 'Left' | 'Right' | 'Both' | 'Other';
  } | null = null;

  let formName = '';
  let formDate = '';
  let formLeg: 'Left' | 'Right' | 'Both' | 'Other' = 'Left';
  let firstFieldEl: HTMLInputElement | null = null;

  $: if (editingPerson && mode === 'edit') {
    formName = editingPerson.name;
    formDate = editingPerson.dateOfInjury;
    formLeg = editingPerson.injuredLeg;
  }

  function validISODate(s: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
  }

  function close() {
    formName = '';
    formDate = '';
    formLeg = 'Left';
    dispatch('close');
  }

  function submitForm() {
    const name = formName.trim();
    if (!name || !validISODate(formDate)) return;

    dispatch('submit', {
      name,
      dateOfInjury: formDate,
      injuredLeg: formLeg,
      id: editingPerson?.id
    });

    formName = '';
    formDate = '';
    formLeg = 'Left';
    close();
  }
</script>

<!-- Right Drawer -->
<aside
  id="person-drawer"
  class="fixed right-0 top-0 h-full w-full sm:w-[420px] max-w-full z-50 transform transition-transform duration-300
         bg-[#091E26] border-l border-[#1C2F3A] flex flex-col shadow-2xl shadow-black/50"
  style:transform={open ? 'translateX(0)' : 'translateX(100%)'}
  aria-modal="true"
  role="dialog"
  aria-labelledby="drawer-title"
>
  <!-- Drawer header -->
  <div class="p-4 border-b border-[#1C2F3A] flex items-center justify-between">
    <h1 id="drawer-title" class="text-4xl font-bold text-pirate-gold tracking-wide gothic-font drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
      {mode === 'create' ? 'Add Lame' : 'Edit Lame'}
    </h1>
    <button
      class="rounded-lg px-2 py-1 bg-[#1C2F3A] hover:bg-[#2A3F4D] text-pirate-parchment"
      on:click={close}
      aria-label="Close drawer"
    >✕</button>
  </div>

  <!-- Drawer content -->
  <form class="p-4 space-y-4 overflow-auto flex-1" on:submit|preventDefault={submitForm}>
    <div>
      <label class="block text-sm font-medium text-pirate-gold" for="name">Name</label>
      <input
        id="name"
        class="mt-1 block w-full rounded-xl border border-white/10 bg-black/25 text-white px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-pirate-gold/60"
        bind:this={firstFieldEl}
        bind:value={formName}
        required
        minlength="2"
        placeholder="Full name"
      />
      {#if !formName.trim()}
        <div class="text-[#FF4444] text-sm mt-1 flex items-center">
          Please enter a name
        </div>
      {/if}
    </div>

    <div>
      <label class="block text-sm font-medium text-pirate-gold" for="doi">Date of injury</label>
      <input
        id="doi"
        type="date"
        style="color-scheme: dark"
        class="mt-1 block w-full rounded-xl border border-white/10 bg-black/25 text-white px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-pirate-gold/60"
        bind:value={formDate}
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-pirate-gold" for="leg">Injured leg</label>
      <div class="relative">
        <select
          id="leg"
          class="mt-1 block w-full rounded-xl border border-white/10 bg-black/25 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 appearance-none pr-8"
          style="color-scheme: dark"
          bind:value={formLeg}
        >
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
          <option>Left</option>
          <option>Right</option>
          <option>Both</option>
          <option>Other</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>

    <div class="pt-2 flex gap-2">
      <button
        type="submit"
        class="rounded-xl px-4 py-2 font-semibold bg-pirate-gold/90 hover:bg-pirate-gold text-[#1B2A34] transition shadow-lg shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-pirate-gold/90"
        disabled={!formName.trim() || !validISODate(formDate)}
      >
        {mode === 'create' ? 'Add Lame' : 'Save changes'}
      </button>
      <button
        type="button"
        on:click={close}
        class="rounded-xl px-4 py-2 font-medium bg-[#142833] hover:bg-[#1A3240] text-pirate-parchment transition"
      >
        Cancel
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


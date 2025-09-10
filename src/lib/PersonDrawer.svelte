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

  $: if (editingPerson) {
    formName = editingPerson.name;
    formDate = editingPerson.dateOfInjury;
    formLeg = editingPerson.injuredLeg;
  }

  function validISODate(s: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
  }

  function close() {
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

    close();
  }
</script>

<!-- Right Drawer -->
<aside
  id="person-drawer"
  class="fixed right-0 top-0 h-full w-full sm:w-[420px] max-w-full z-50 transform transition-transform duration-300
         bg-[#0E1F29] border-l border-[#0C1A22] flex flex-col shadow-2xl shadow-black/50"
  style:transform={open ? 'translateX(0)' : 'translateX(100%)'}
  aria-modal="true"
  role="dialog"
  aria-labelledby="drawer-title"
>
  <!-- Drawer header -->
  <div class="p-4 border-b border-[#0C1A22] flex items-center justify-between bg-[#0B1720]">
    <h2 id="drawer-title" class="text-lg font-semibold text-pirate-gold">
      {mode === 'create' ? 'Add person' : 'Edit person'}
    </h2>
    <button
      class="rounded-lg px-2 py-1 bg-[#142833] hover:bg-[#1A3240] text-pirate-parchment"
      on:click={close}
      aria-label="Close drawer"
    >✕</button>
  </div>

  <!-- Drawer content -->
  <form class="p-4 space-y-4 overflow-auto flex-1" on:submit|preventDefault={submitForm}>
    <div>
      <label class="block text-sm font-medium text-pirate-parchment/90" for="name">Name</label>
      <input
        id="name"
        class="mt-1 block w-full rounded-xl border border-[#1C2F3A] bg-[#0B1720] text-[#E9E2D0] px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-pirate-gold/60"
        bind:this={firstFieldEl}
        bind:value={formName}
        required
        minlength="2"
        placeholder="Full name"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-pirate-parchment/90" for="doi">Date of injury</label>
      <input
        id="doi"
        type="date"
        class="mt-1 block w-full rounded-xl border border-[#1C2F3A] bg-[#0B1720] text-[#E9E2D0] px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-pirate-gold/60"
        bind:value={formDate}
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-pirate-parchment/90" for="leg">Lame leg</label>
      <select
        id="leg"
        class="mt-1 block w-full rounded-xl border border-[#1C2F3A] bg-[#0B1720] text-[#E9E2D0] px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-pirate-gold/60"
        bind:value={formLeg}
      >
        <option>Left</option>
        <option>Right</option>
        <option>Both</option>
        <option>Other</option>
      </select>
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

  <div class="p-4 text-[11px] text-pirate-muted border-t border-[#0C1A22] bg-[#0B1720]">
    Press <span class="px-1 rounded bg-[#142833] text-pirate-parchment">Esc</span> to close
  </div>
</aside>

{#if open}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
    on:click={close}
    aria-hidden="true"
  />
{/if}


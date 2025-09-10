<!-- Pirate-styled version (drop-in) -->
<script lang="ts">
  // ⬇️ Keep your original script exactly as-is
  import { onMount, tick } from 'svelte';
  import { browser } from '$app/environment';

  type Person = {
    id: string;
    name: string;
    dateOfInjury: string; // ISO yyyy-mm-dd
    injuredLeg: 'Left' | 'Right' | 'Both' | 'Other';
  };

  const uuid = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  export let initialPeople: Person[] = [
    { id: 'p1', name: 'Alice Johnson', dateOfInjury: '2022-04-15', injuredLeg: 'Left' },
    { id: 'p2', name: 'Brian Smith',  dateOfInjury: '2021-11-30', injuredLeg: 'Right' },
    { id: 'p3', name: 'Carla Brown',  dateOfInjury: '2020-07-10', injuredLeg: 'Left' }
  ];

  let people: Person[] = [];

  type DrawerMode = 'create' | 'edit';
  let drawerOpen = false;
  let drawerMode: DrawerMode = 'create';

  let formName = '';
  let formDate = '';
  let formLeg: Person['injuredLeg'] = 'Left';
  let editingId: string | null = null;

  const STORAGE_KEY = 'people-table-v1';
  let addButtonEl: HTMLButtonElement | null = null;
  let firstFieldEl: HTMLInputElement | null = null;

  onMount(() => {
    if (browser) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        people = raw ? (JSON.parse(raw) as Person[]) : initialPeople;
      } catch {
        people = initialPeople;
      }
    } else {
      people = initialPeople;
    }
  });

  let persistTimer: ReturnType<typeof setTimeout> | null = null;
  $: if (browser) {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(people)); } catch {}
    }, 120);
  }

  function openCreate() {
    drawerMode = 'create';
    editingId = null;
    formName = '';
    formDate = '';
    formLeg = 'Left';
    openDrawer();
  }
  function openEdit(p: Person) {
    drawerMode = 'edit';
    editingId = p.id;
    formName = p.name;
    formDate = p.dateOfInjury;
    formLeg = p.injuredLeg;
    openDrawer();
  }
  async function openDrawer() {
    drawerOpen = true;
    await tick();
    firstFieldEl?.focus();
  }
  function closeDrawer() {
    drawerOpen = false;
    addButtonEl?.focus();
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && drawerOpen) closeDrawer();
  }
  function validISODate(s: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
  }
  function submitForm() {
    const name = formName.trim();
    if (!name || !validISODate(formDate)) return;
    if (drawerMode === 'create') {
      people = [
        { id: uuid(), name, dateOfInjury: formDate, injuredLeg: formLeg },
        ...people
      ].sort((a, b) => (a.dateOfInjury < b.dateOfInjury ? 1 : -1));
    } else if (drawerMode === 'edit' && editingId) {
      const idx = people.findIndex((p) => p.id === editingId);
      if (idx !== -1) {
        const next = [...people];
        next[idx] = { ...people[idx], name, dateOfInjury: formDate, injuredLeg: formLeg };
        people = next.sort((a, b) => (a.dateOfInjury < b.dateOfInjury ? 1 : -1));
      }
    }
    closeDrawer();
  }
  function removePerson(id: string) {
    if (!confirm('Remove this entry?')) return;
    people = people.filter((p) => p.id !== id);
    if (editingId === id) closeDrawer();
  }
  function formatDate(iso: string) {
    try {
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(iso));
    } catch { return iso; }
  }
</script>

<svelte:window on:keydown={onKey} />

<!-- Full page -->
<div class="pirate-bg min-h-screen w-full text-[#E9E2D0] flex flex-col relative overflow-hidden">
  <!-- Header -->
  <header class="px-8 pt-8 pb-4 text-center">
    <h1 class="text-5xl md:text-6xl font-bold text-pirate-gold tracking-wide gothic-font drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
      Book a Lame
    </h1>
    <img src="/images/jolly roger 4.png" alt="Jolly Roger" class="w-52 h-52 mx-auto mt-8 mb-6 opacity-45 drop-shadow-[0_4px_12px_rgba(212,175,55,0.15)]" />
  </header>

  <!-- Toolbar -->
  <div class="px-8 pb-4 flex justify-end">
    <button
      bind:this={addButtonEl}
      class="rounded-xl px-4 py-2 font-semibold bg-pirate-gold/90 hover:bg-pirate-gold text-[#1B2A34] transition shadow-lg shadow-black/30 ring-1 ring-black/40"
      on:click={openCreate}
      aria-label="Add person"
      aria-controls="person-drawer"
      aria-expanded={drawerOpen}
    >
      Add a Lame
    </button>
  </div>

  <!-- Table -->
  <div class="px-8 pb-8 flex-1">
    <h3 class="text-xl md:text-xl font-bold text-pirate-gold tracking-wide gothic-font">
      Your Lames
    </h3>
    <div class="h-full overflow-auto rounded-xl border border-[#0C1A22] bg-[#0E1F29]/60 backdrop-blur-sm shadow-inner shadow-black/40">
      <table class="min-w-full text-sm text-left">
        <thead class="sticky top-0 z-10 bg-[#3B0A0A] text-pirate-parchment uppercase tracking-wide">
          <tr class="[&>th]:px-4 [&>th]:py-3">
            <th>Name</th>
            <th>Date of Injury</th>
            <th>Injured Leg</th>
            <th class="w-44">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if people.length === 0}
            <tr class="bg-[#0B1720]">
              <td colspan="4" class="px-4 py-8 text-center text-pirate-muted">
                No entries yet.
                <button class="ml-2 underline text-pirate-gold hover:text-[#F6E6A3]" on:click={openCreate}>Create one</button>
              </td>
            </tr>
          {/if}

          {#each people as person, i (person.id)}
            <tr class={i % 2 === 0 ? 'bg-[#0B1720]/80' : 'bg-[#102532]/80'}>
              <td class="px-4 py-3">{person.name}</td>
              <td class="px-4 py-3">{formatDate(person.dateOfInjury)}</td>
              <td class="px-4 py-3">{person.injuredLeg}</td>
              <td class="px-4 py-3 space-x-2">
                <button
                  class="rounded-lg px-3 py-1 bg-pirate-gold/90 hover:bg-pirate-gold text-[#1B2A34] transition shadow shadow-black/40"
                  on:click={() => openEdit(person)}
                >Edit</button>
                <button
                  class="rounded-lg px-3 py-1 bg-[#7A0000] hover:bg-[#9D0B0B] text-pirate-parchment transition shadow shadow-black/40"
                  on:click={() => removePerson(person.id)}
                >Remove</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Backdrop -->
  {#if drawerOpen}
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
      on:click={closeDrawer}
      aria-hidden="true"
    />
  {/if}

  <!-- Right Drawer -->
  <aside
    id="person-drawer"
    class="fixed right-0 top-0 h-full w-full sm:w-[420px] max-w-full z-50 transform transition-transform duration-300
           bg-[#0E1F29] border-l border-[#0C1A22] flex flex-col shadow-2xl shadow-black/50"
    style:transform={drawerOpen ? 'translateX(0)' : 'translateX(100%)'}
    aria-modal="true"
    role="dialog"
    aria-labelledby="drawer-title"
  >
    <!-- Drawer header -->
    <div class="p-4 border-b border-[#0C1A22] flex items-center justify-between bg-[#0B1720]">
      <h2 id="drawer-title" class="text-lg font-semibold text-pirate-gold">
        {drawerMode === 'create' ? 'Add person' : 'Edit person'}
      </h2>
      <button
        class="rounded-lg px-2 py-1 bg-[#142833] hover:bg-[#1A3240] text-pirate-parchment"
        on:click={closeDrawer}
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
          class="rounded-xl px-4 py-2 font-semibold bg-pirate-gold/90 hover:bg-pirate-gold text-[#1B2A34] transition shadow-lg shadow-black/30"
          disabled={!formName.trim() || !validISODate(formDate)}
        >
          {drawerMode === 'create' ? 'Add Lame' : 'Save changes'}
        </button>
        <button
          type="button"
          on:click={closeDrawer}
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
</div>

<style>
  /* Pirate palette via CSS variables */
  :root {
    --pirate-gold: #D4AF37;
    --pirate-parchment: #F2E8C9;
    --pirate-muted: #B6A88A;
  }
  .text-pirate-gold { color: var(--pirate-gold); }
  .bg-pirate-gold { background-color: var(--pirate-gold); }
  .text-pirate-parchment { color: var(--pirate-parchment); }
  .text-pirate-muted { color: var(--pirate-muted); }

  /* Background: stormy sea + subtle flag watermark */
  .pirate-bg {
    background: linear-gradient(180deg, #06131A 0%, #091E26 40%, #0B1720 100%);
    position: relative;
  }

  /* Gothic title keeps the swagger */
  @import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap');
  .gothic-font { font-family: 'UnifrakturCook', cursive; }

  /* Convenience utilities mapped to CSS vars for Tailwind-ish usage */
  .text-pirate-gold { color: var(--pirate-gold); }
  .bg-pirate-gold\/90 { background-color: color-mix(in oklab, var(--pirate-gold) 90%, transparent); }
  .text-pirate-parchment { color: var(--pirate-parchment); }
  .text-pirate-muted { color: var(--pirate-muted); }
  /* Fallback if color-mix unsupported */
  @supports not (background-color: color-mix(in oklab, white, black)) {
    .bg-pirate-gold\/90 { background-color: #c6a232; }
  }
</style>

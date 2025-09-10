<!-- Pirate-styled version (drop-in) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { PeopleTable } from '$lib';
  import { browser } from '$app/environment';
  import PersonDrawer from '$lib/PersonDrawer.svelte';

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
  let drawerOpen = false;
  let drawerMode: 'create' | 'edit' = 'create';
  let editingPerson: Person | null = null;
  let addButtonEl: HTMLButtonElement | null = null;

  const STORAGE_KEY = 'people-table-v1';

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
    editingPerson = null;
    drawerOpen = true;
  }

  function openEdit(person: Person) {
    drawerMode = 'edit';
    editingPerson = person;
    drawerOpen = true;
  }

  function closeDrawer() {
    drawerOpen = false;
    addButtonEl?.focus();
  }

  function handleEdit(e: CustomEvent<Person>) {
    openEdit(e.detail);
  }

  function handleRemove(e: CustomEvent<string>) {
    removePerson(e.detail);
  }

  function handleSubmit(event: CustomEvent<{ name: string; dateOfInjury: string; injuredLeg: Person['injuredLeg']; id?: string }>) {
    const { name, dateOfInjury, injuredLeg, id } = event.detail;

    if (drawerMode === 'create') {
      people = [
        { id: uuid(), name, dateOfInjury, injuredLeg },
        ...people
      ].sort((a, b) => (a.dateOfInjury < b.dateOfInjury ? 1 : -1));
    } else if (drawerMode === 'edit' && id) {
      const idx = people.findIndex((p) => p.id === id);
      if (idx !== -1) {
        const next = [...people];
        next[idx] = { ...people[idx], name, dateOfInjury, injuredLeg };
        people = next.sort((a, b) => (a.dateOfInjury < b.dateOfInjury ? 1 : -1));
      }
    }
  }
  function removePerson(id: string) {
    if (!confirm('Remove this entry?')) return;
    people = people.filter((p) => p.id !== id);
    if (editingPerson?.id === id) closeDrawer();
  }
  function formatDate(iso: string) {
    try {
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(iso));
    } catch { return iso; }
  }
</script>


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
    <PeopleTable
      {people}
      on:create={openCreate}
      on:edit={handleEdit}
      on:remove={handleRemove}
    />
  </div>


  <PersonDrawer
    open={drawerOpen}
    mode={drawerMode}
    editingPerson={editingPerson}
    on:close={closeDrawer}
    on:submit={handleSubmit}
  />
</div>

<style>
  /* Background: stormy sea + subtle flag watermark */
  .pirate-bg {
    background: linear-gradient(180deg, #06131A 0%, #091E26 40%, #0B1720 100%);
    position: relative;
  }
</style>

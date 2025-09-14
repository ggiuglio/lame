<!-- Pirate-styled version (drop-in) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { PeopleTable } from '$lib';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { people } from '$lib/stores';
  import type { Person } from '$lib/stores';
  import PersonDrawer from '$lib/PersonDrawer.svelte';


  let drawerOpen = false;
  let drawerMode: 'create' | 'edit' = 'create';
  let editingPerson: Person | null = null;
  let addButtonEl: HTMLButtonElement | null = null;

  let sortedPeople: Person[] = [];

  onMount(() => {
    people.load();
  });

  $: sortedPeople = $people.data ? [...$people.data].sort((a, b) => a.dateOfInjury < b.dateOfInjury ? 1 : -1) : [];

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

  function handleSubmit(event: CustomEvent<{ name: string; dateOfInjury: string; injuredLeg: Person['injuredLeg']; id?: string }>) {
    const { name, dateOfInjury, injuredLeg, id } = event.detail;

    if (drawerMode === 'create') {
      people.add({ name, dateOfInjury, injuredLeg });
    } else if (drawerMode === 'edit' && id) {
      people.update(id, { name, dateOfInjury, injuredLeg });
    }
    closeDrawer();
  }

  function handleEdit(e: CustomEvent<Person>) {
    openEdit(e.detail);
  }

  function handleRemove(e: CustomEvent<string>) {
    people.remove(e.detail);
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
      class="rounded-xl px-4 py-2 font-semibold bg-pirate-gold/90 hover:bg-pirate-gold text-[#1B2A34] transition shadow-lg shadow-black/30 ring-1 ring-black/40 focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 focus:ring-offset-2 focus:ring-offset-[#06131A]"
      aria-controls="person-drawer"
      aria-expanded={drawerOpen}
      on:click={openCreate}
      aria-label="Add person"
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
      people={sortedPeople}
      loading={$people.loading}
      error={$people.error}
      on:create={openCreate}
      on:edit={handleEdit}
      on:remove={handleRemove}
    />
  </div>
</div>

<PersonDrawer
  open={drawerOpen}
  mode={drawerMode}
  editingPerson={editingPerson}
  on:close={closeDrawer}
  on:submit={handleSubmit}
/>

<style>
  /* Background: stormy sea + subtle flag watermark */
  .pirate-bg {
    background: linear-gradient(180deg, #06131A 0%, #091E26 40%, #0B1720 100%);
    position: relative;
  }
</style>

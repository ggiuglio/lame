<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  type Person = {
    id: number;
    name: string;
    date: string;
    leg: 'left' | 'right';
  };

  let people = writable<Person[]>([
    { id: 1, name: 'Alice', date: '2025-09-01', leg: 'left' },
    { id: 2, name: 'Bob', date: '2025-08-25', leg: 'right' }
  ]);

  let showDrawer = false;
  let drawerMode: 'add' | 'edit' = 'add';
  let editingPerson: Person | null = null;

  let form = {
    name: '',
    date: '',
    leg: 'left'
  };

  function openAddDrawer() {
    form = { name: '', date: '', leg: 'left' };
    drawerMode = 'add';
    showDrawer = true;
  }

  function openEditDrawer(person: Person) {
    form = { name: person.name, date: person.date, leg: person.leg };
    editingPerson = person;
    drawerMode = 'edit';
    showDrawer = true;
  }

  function closeDrawer() {
    showDrawer = false;
    editingPerson = null;
  }

  function savePerson() {
    if (drawerMode === 'add') {
      people.update(list => [
        ...list,
        {
          id: Date.now(),
          name: form.name,
          date: form.date,
          leg: form.leg as 'left' | 'right'
        }
      ]);
    } else if (editingPerson) {
      people.update(list =>
        list.map(p =>
          p.id === editingPerson!.id
            ? { ...editingPerson!, ...form }
            : p
        )
      );
    }
    closeDrawer();
  }

  function deletePerson(id: number) {
    people.update(list => list.filter(p => p.id !== id));
  }
</script>

<div class="min-h-screen bg-violet-100 p-8">
  <h1 class="text-4xl font-bold text-violet-800 mb-8">Book a lame</h1>

  <div class="bg-white rounded-xl shadow p-6">
    <button
      class="mb-4 px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
      on:click={openAddDrawer}
    >Add person</button>
    <table class="min-w-full border">
      <thead>
        <tr class="bg-violet-200">
          <th class="px-4 py-2 text-left">Name</th>
          <th class="px-4 py-2 text-left">Date of Injury</th>
          <th class="px-4 py-2 text-left">Injured Leg</th>
          <th class="px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {#each $people as person}
          <tr class="border-b">
            <td class="px-4 py-2">{person.name}</td>
            <td class="px-4 py-2">{person.date}</td>
            <td class="px-4 py-2 capitalize">{person.leg}</td>
            <td class="px-4 py-2 text-right">
              <button class="px-3 py-1 mr-2 bg-violet-100 text-violet-700 rounded hover:bg-violet-200"
                on:click={() => openEditDrawer(person)}>Edit</button>
              <button class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                on:click={() => deletePerson(person.id)}>Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Drawer -->
  {#if showDrawer}
    <div class="fixed inset-0 bg-black bg-opacity-30 z-40" on:click={closeDrawer}></div>
    <aside class="fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-xl z-50 flex flex-col">
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-semibold text-violet-700">{drawerMode === 'add' ? 'Add Person' : 'Edit Person'}</h2>
        <button class="text-gray-400 hover:text-gray-600 text-xl" on:click={closeDrawer}>&times;</button>
      </div>
      <form class="p-6 flex-1 flex flex-col gap-4" on:submit|preventDefault={savePerson}>
        <label>
          <span class="block text-sm font-medium mb-1">Name</span>
          <input type="text" bind:value={form.name} required class="w-full border rounded px-3 py-2" />
        </label>
        <label>
          <span class="block text-sm font-medium mb-1">Date of Injury</span>
          <input type="date" bind:value={form.date} required class="w-full border rounded px-3 py-2" />
        </label>
        <label>
          <span class="block text-sm font-medium mb-1">Injured Leg</span>
          <select bind:value={form.leg} class="w-full border rounded px-3 py-2">
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>
        <div class="mt-auto flex gap-2">
          <button type="submit" class="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700">
            {drawerMode === 'add' ? 'Add' : 'Save'}
          </button>
          <button type="button" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" on:click={closeDrawer}>
            Cancel
          </button>
        </div>
      </form>
    </aside>
  {/if}
</div>

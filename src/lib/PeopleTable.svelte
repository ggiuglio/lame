<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  type Person = {
    id: string;
    name: string;
    dateOfInjury: string;
    injuredLeg: 'Left' | 'Right' | 'Both' | 'Other';
  };

  export let people: Person[] = [];

  const dispatch = createEventDispatcher<{
    create: void;
    edit: Person;
    remove: string;
  }>();

  function handleEdit(person: Person) {
    dispatch('edit', person);
  }

  function handleRemove(id: string) {
    dispatch('remove', id);
  }

  function handleCreate() {
    dispatch('create');
  }

  function formatDate(iso: string) {
    try {
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(iso));
    } catch { return iso; }
  }
</script>

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
            <button class="ml-2 underline text-pirate-gold hover:text-[#F6E6A3]" on:click={handleCreate}>Create one</button>
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
              on:click={() => handleEdit(person)}
            >Edit</button>
            <button
              class="rounded-lg px-3 py-1 bg-[#7A0000] hover:bg-[#9D0B0B] text-pirate-parchment transition shadow shadow-black/40"
              on:click={() => handleRemove(person.id)}
            >Remove</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>


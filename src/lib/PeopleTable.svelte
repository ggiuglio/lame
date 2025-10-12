<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';

  type Person = {
    id: string;
    name: string;
    dateOfInjury: string;
    injuredLeg: 'Left' | 'Right' | 'Both' | 'Other';
  };

  export let people: Person[] = [];
  export let loading = false;
  export let error = '';

  type SortField = 'name' | 'dateOfInjury' | 'injuredLeg';
  type SortDirection = 'asc' | 'desc';

  let sortField: SortField = 'dateOfInjury';
  let sortDirection: SortDirection = 'desc';

  $: sortedPeople = [...people].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    const aValue = a[sortField];
    const bValue = b[sortField];
    return aValue < bValue ? -1 * modifier : aValue > bValue ? 1 * modifier : 0;
  });

  const dispatch = createEventDispatcher<{
    create: void;
    edit: Person;
    remove: string;
  }>();

  function handleEdit(person: Person) {
    dispatch('edit', person);
  }

  function handleRemove(person: Person) {
    if (confirm('Are you sure you want to remove this lame?')) {
      dispatch('remove', person.id);
    }
  }

  function handleCreate() {
    dispatch('create');
  }

  // Ensure navigation works reliably in SPA: use relative internal route
  function navigateTo(personId: string) {
    goto(`/lame?id=${personId}`);
  }

  function navigateToDnd(personId: string) {
    goto(`/diendi?id=${personId}`);
  }

  function formatDate(iso: string) {
    try {
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(iso));
    } catch { return iso; }
  }
</script>

<div class="h-full overflow-auto rounded-xl border border-[#0C1A22] bg-[#0E1F29]/60 backdrop-blur-sm shadow-inner shadow-black/40">
  {#if loading}
    <table class="min-w-full text-sm text-left">
      <thead class="sticky top-0 z-10 bg-[#3B0A0A] text-pirate-parchment uppercase tracking-wide">
        <tr class="[&>th]:px-4 [&>th]:py-3">
          <th>Name</th>
          <th>Date of Injury</th>
          <th>Injured Leg</th>
          <th class="w-28"></th>
        </tr>
      </thead>
      <tbody>
        {#each Array(3) as _, i}
          <tr class={i % 2 === 0 ? 'bg-[#0B1720]/80' : 'bg-[#102532]/80'} aria-hidden="true">
            <td class="px-4 py-3">
              <div class="h-4 w-32 bg-[#142833] rounded animate-pulse"></div>
            </td>
            <td class="px-4 py-3">
              <div class="h-4 w-24 bg-[#142833] rounded animate-pulse"></div>
            </td>
            <td class="px-4 py-3">
              <div class="h-4 w-16 bg-[#142833] rounded animate-pulse"></div>
            </td>
            <td class="px-4 py-3 space-x-2">
              <div class="inline-block h-8 w-10 bg-[#142833] rounded-lg animate-pulse"></div>
              <div class="inline-block h-8 w-10 bg-[#142833] rounded-lg animate-pulse"></div>
              <div class="inline-block h-8 w-10 bg-[#142833] rounded-lg animate-pulse"></div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if error}
    <div class="flex items-center justify-center py-12">
      <div class="flex items-center gap-2 text-sm text-[#FF4444]">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        {error}
      </div>
    </div>
  {:else}
    <table class="min-w-full text-sm text-left">
    <thead class="sticky top-0 z-10 bg-[#3B0A0A] text-pirate-parchment uppercase tracking-wide">
      <tr class="[&>th]:px-4 [&>th]:py-3">
        <th>
          <button
            class="flex items-center gap-1 hover:text-pirate-gold transition focus:outline-none focus:text-pirate-gold"
            on:click={() => {
              if (sortField === 'name') {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
              } else {
                sortField = 'name';
                sortDirection = 'asc';
              }
            }}
          >
            <span>Name</span>
            {#if sortField === 'name'}
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                {#if sortDirection === 'asc'}
                  <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                {:else}
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                {/if}
              </svg>
            {/if}
          </button>
        </th>
        <th>
          <button
            class="flex items-center gap-1 hover:text-pirate-gold transition focus:outline-none focus:text-pirate-gold"
            on:click={() => {
              if (sortField === 'dateOfInjury') {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
              } else {
                sortField = 'dateOfInjury';
                sortDirection = 'desc';
              }
            }}
          >
            <span>Date of Injury</span>
            {#if sortField === 'dateOfInjury'}
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                {#if sortDirection === 'asc'}
                  <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                {:else}
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                {/if}
              </svg>
            {/if}
          </button>
        </th>
        <th>
          <button
            class="flex items-center gap-1 hover:text-pirate-gold transition focus:outline-none focus:text-pirate-gold"
            on:click={() => {
              if (sortField === 'injuredLeg') {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
              } else {
                sortField = 'injuredLeg';
                sortDirection = 'asc';
              }
            }}
          >
            <span>Injured Leg</span>
            {#if sortField === 'injuredLeg'}
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                {#if sortDirection === 'asc'}
                  <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                {:else}
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                {/if}
              </svg>
            {/if}
          </button>
        </th>
        <th class="w-28">
        </th>
      </tr>
    </thead>
    <tbody>
      {#if people.length === 0}
        <tr class="bg-[#0B1720]">
          <td colspan="4" class="px-4 py-12 text-center">
            <div class="text-pirate-gold text-lg gothic-font tracking-wide">
              No Lames today, but just wait the crocodiles' season is about to start!
            </div>
          </td>
        </tr>
      {/if}

      {#each sortedPeople as person, i (person.id)}
        <tr 
          class={`${i % 2 === 0 ? 'bg-[#0B1720]/80' : 'bg-[#102532]/80'}`}
        >
          <td class="px-4 py-3">
            <div class="block w-full h-full focus:outline-none">
              {person.name}
            </div>
          </td>
          <td class="px-4 py-3">
            <div class="block w-full h-full focus:outline-none">
              {formatDate(person.dateOfInjury)}
            </div>
          </td>
          <td class="px-4 py-3">
            <div class="block w-full h-full focus:outline-none">
              {person.injuredLeg}
            </div>
          </td>
          <td class="px-4 py-3 space-x-2 whitespace-nowrap">
            <button
              class="rounded-lg overflow-hidden hover:opacity-80 transition focus:outline-none focus:ring-2 focus:ring-purple-600/60 focus:ring-offset-2 focus:ring-offset-[#0B1720] w-12 h-6"
              on:click|stopPropagation={() => navigateToDnd(person.id)}
              aria-label="Play D&D">
              <img src="/images/dnd2.png" alt="D&D" class="w-full h-full object-cover" />
            </button>
            <button
              class="rounded-lg p-2 bg-pirate-gold/90 hover:bg-pirate-gold text-[#1B2A34] transition shadow shadow-black/40 focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 focus:ring-offset-2 focus:ring-offset-[#0B1720]"
              on:click|stopPropagation={() => handleEdit(person)}
            aria-label="Edit lame">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              class="rounded-lg p-2 bg-[#7A0000] hover:bg-[#9D0B0B] text-pirate-parchment transition shadow shadow-black/40 focus:outline-none focus:ring-2 focus:ring-[#9D0B0B]/60 focus:ring-offset-2 focus:ring-offset-[#0B1720]"
              on:click|stopPropagation={() => handleRemove(person)}
              aria-label="Remove lame">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {/if}
</div>


<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { dndDays, playerAvailability } from './stores/dndSessions';
  import type { Person } from './stores';

  export let open = false;
  export let selectedDate: Date | null = null;
  export let person: Person | null = null;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  let isDndDay = false;
  let isTentative = false;
  let playerName = '';
  let availability: 'can' | 'cannot' | 'tentative' | '' = '';

  function close() {
    dispatch('close');
  }

  function formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  async function handleAvailabilitySubmit() {
    if (!playerName || !availability || !selectedDate) return;
    
    const date = formatDate(selectedDate);
    
    // Remove any existing entry for this friend on this date
    const existingEntry = dayAvailabilities.find(a => a.playerName === playerName);
    if (existingEntry) {
      await playerAvailability.remove(existingEntry.id);
    }
    
    // Add the new entry
    await playerAvailability.add({
      date,
      playerName,
      canPlay: availability === 'can' ? true : availability === 'cannot' ? false : 'tentative'
    });
    
    // Reset form
    playerName = '';
    availability = '';
  }

  // Track previous tentative state to detect changes
  let previousTentative = false;
  let lastProcessedDate = '';

  // Load existing data when date changes
  $: if (selectedDate) {
    const date = formatDate(selectedDate);
    if (date !== lastProcessedDate) {
      const dayData = $dndDays.find(d => d.date === date);
      isDndDay = dayData?.isDndDay || false;
      isTentative = dayData?.isTentative || false;
      previousTentative = isTentative;
      lastProcessedDate = date;
    }
  }

  // Handle tentative toggle and auto-add friends
  async function handleTentativeToggle() {
    if (!selectedDate) return;
    
    const date = formatDate(selectedDate);
    const wasNotTentative = !previousTentative;
    
    // Toggle the state
    isTentative = !isTentative;
    
    // If marking as tentative (and wasn't before), add tentative status for unanswered friends
    if (isTentative && wasNotTentative && person?.friends) {
      const answeredPlayers = dayAvailabilities.map(a => a.playerName);
      const unansweredFriends = person.friends.filter(friend => !answeredPlayers.includes(friend));
      
      // Add tentative status for each unanswered friend
      for (const friend of unansweredFriends) {
        await playerAvailability.add({
          date,
          playerName: friend,
          canPlay: 'tentative'
        });
      }
    }
    
    // Save the day status
    await dndDays.setDndDay(date, isDndDay, isTentative);
    previousTentative = isTentative;
  }

  // Save D&D day status when toggle changes
  $: if (selectedDate) {
    const date = formatDate(selectedDate);
    if (isDndDay) {
      // If marking as D&D day, clear tentative
      isTentative = false;
      dndDays.setDndDay(date, isDndDay, false);
    } else {
      // If unmarking as D&D day, update with current tentative state
      dndDays.setDndDay(date, false, isTentative);
    }
  }

  // Get player availabilities for selected date
  $: dayAvailabilities = selectedDate ? $playerAvailability.filter(a => {
    const date = formatDate(selectedDate);
    return a.date === date;
  }) : [];
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
  <div class="flex-1 overflow-auto p-4 space-y-6">
    <!-- Panel 1: D&D Day Toggle -->
    <div class="p-4 rounded-xl bg-[#0E1F29]/60 border border-[#1C2F3A]">
      <h2 class="text-lg font-bold text-pirate-gold mb-4 gothic-font">D&D Day</h2>
      <div class="flex items-center justify-between">
        <span class="text-pirate-parchment">Mark this day as a D&D day</span>
        <button
          type="button"
          role="switch"
          aria-checked={isDndDay}
          aria-label="Toggle D&D day"
          on:click={() => isDndDay = !isDndDay}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 focus:ring-offset-2 focus:ring-offset-[#091E26] {isDndDay ? 'bg-pirate-gold shadow-pirate-gold' : 'bg-[#1C2F3A]'}"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {isDndDay ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </div>
      {#if isDndDay}
        <div class="mt-3 p-2 rounded bg-pirate-gold/10 border border-pirate-gold/20">
          <p class="text-sm text-pirate-gold">✓ Hooray we all get lame today</p>
        </div>
      {/if}
    </div>

    <!-- Panel 1.5: Tentative Toggle -->
    <div class="p-4 rounded-xl bg-[#0E1F29]/60 border border-[#1C2F3A] {isDndDay ? 'opacity-50' : ''}">
      <h2 class="text-lg font-bold text-pirate-gold mb-4 gothic-font">Can our lames play today?</h2>
      <div class="flex items-center justify-between">
        <span class="text-pirate-parchment">Mark this day as tentative</span>
        <button
          type="button"
          role="switch"
          aria-checked={isTentative}
          aria-label="Toggle tentative day"
          disabled={isDndDay}
          on:click={() => !isDndDay && handleTentativeToggle()}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 focus:ring-offset-2 focus:ring-offset-[#091E26] {isTentative && !isDndDay ? 'bg-pirate-gold shadow-pirate-gold' : 'bg-[#1C2F3A]'} {isDndDay ? 'cursor-not-allowed' : 'cursor-pointer'}"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {isTentative ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </div>
      {#if isTentative}
        <div class="mt-3 p-2 rounded bg-pirate-gold/10 border border-pirate-gold/20">
          <p class="text-sm text-pirate-gold">Is today the day we all get lame?</p>
        </div>
      {/if}
    </div>

    <!-- Panel 2: Player Availability Form -->
    <div class="p-4 rounded-xl bg-[#0E1F29]/60 border border-[#1C2F3A]">
      <h2 class="text-lg font-bold text-pirate-gold mb-4 gothic-font">Player Availability</h2>
      
      <!-- Show existing availabilities -->
      {#if dayAvailabilities.length > 0}
        <div class="mb-4 space-y-2">
          {#each dayAvailabilities as avail}
            <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-[#142833]/50 group">
              <span class="{avail.canPlay === true ? 'text-green-400' : avail.canPlay === 'tentative' ? 'text-pink-400' : 'text-red-400'} font-medium">
                {avail.playerName} - {avail.canPlay === true ? 'Can play' : avail.canPlay === 'tentative' ? "Don't know" : 'Cannot play'}
              </span>
              <button
                type="button"
                class="rounded-lg p-1.5 bg-[#1A3240] hover:bg-red-900/80 text-pirate-parchment transition opacity-0 group-hover:opacity-100"
                on:click={() => playerAvailability.remove(avail.id)}
                aria-label="Remove availability"
              >
                <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <form class="space-y-4" on:submit|preventDefault={handleAvailabilitySubmit}>
        <div>
          <label class="block text-sm font-medium text-pirate-gold mb-2" for="playerName">Friend Name</label>
          {#if person?.friends && person.friends.length > 0}
            <div class="relative">
              <select
                id="playerName"
                class="block w-full rounded-xl border border-white/10 bg-black/25 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 appearance-none pr-8"
                style="color-scheme: dark"
                bind:value={playerName}
                required
              >
                <option value="" disabled>Select a friend</option>
                {#each person.friends as friend}
                  <option value={friend}>{friend}</option>
                {/each}
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          {:else}
            <div class="p-3 rounded-lg bg-[#142833]/50 border border-[#1C2F3A]">
              <p class="text-sm text-pirate-parchment/70">No friends added yet. Add friends to {person?.name || 'this person'} on the home page.</p>
            </div>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-pirate-gold mb-2" for="availability">Availability</label>
          <div class="relative">
            <select
              id="availability"
              class="block w-full rounded-xl border border-white/10 bg-black/25 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 appearance-none pr-8"
              style="color-scheme: dark"
              bind:value={availability}
              required
            >
              <option value="" disabled>Select your availability</option>
              <option value="can">I can play today</option>
              <option value="cannot">I cannot play today</option>
              <option value="tentative">I don't know if I can play</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="w-full rounded-lg px-3 py-2 bg-pirate-gold/90 hover:bg-pirate-gold text-[#1B2A34] transition shadow-lg shadow-black/30 ring-1 ring-black/40 focus:outline-none focus:ring-2 focus:ring-pirate-gold/60 focus:ring-offset-2 focus:ring-offset-[#06131A] font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-pirate-gold/90"
          disabled={!person?.friends || person.friends.length === 0}
        >
          Submit Availability
        </button>
      </form>
    </div>
  </div>
</aside>

{#if open}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
    on:click={close}
    aria-hidden="true"
  ></div>
{/if}

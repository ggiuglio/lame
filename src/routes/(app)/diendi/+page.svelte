<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { people } from '$lib/stores';
  import type { Person } from '$lib/stores';
  import { playerAvailability, type PlayerAvailability, dndDays, type DndDay } from '$lib/stores/dndSessions';
  import DndSessionDrawer from '$lib/DndSessionDrawer.svelte';
  
  let person: Person | null = null;
  
  $: if ($page.url.searchParams.get('id') && $people.data) {
    const personId = $page.url.searchParams.get('id');
    person = $people.data.find((p: Person) => p.id === personId) || null;
  }

  const today = new Date();
  let currentDate = new Date();
  $: isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  let sessionDrawerOpen = false;
  let selectedDate: Date | null = null;

  function handleDayClick(day: number) {
    selectedDate = new Date(year, month, day);
    sessionDrawerOpen = true;
  }

  $: year = currentDate.getFullYear();
  $: month = currentDate.getMonth();
  $: monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

  function isToday(day: number) {
    return year === today.getFullYear() && 
           month === today.getMonth() && 
           day === today.getDate();
  }

  function previousMonth() {
    currentDate = new Date(year, month - 1, 1);
  }

  function nextMonth() {
    currentDate = new Date(year, month + 1, 1);
  }

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  $: daysInMonth = getDaysInMonth(year, month);
  $: firstDayOfMonth = getFirstDayOfMonth(year, month);

  function formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  $: calendarDays = Array(42).fill(null).map((_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
  });
</script>

<div class="pirate-bg min-h-screen w-full text-[#E9E2D0] flex flex-col relative overflow-hidden">
  <header class="px-8 pt-8 pb-4 text-center">
    <div class="flex justify-start mb-4">
      <button
        class="rounded-lg px-3 py-1 bg-[#142833] hover:bg-[#1A3240] text-pirate-parchment transition"
        on:click={() => goto('/')}
      >← Back</button>
    </div>
    <h1 class="text-5xl md:text-6xl font-bold text-pirate-gold tracking-wide gothic-font drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
      Play D&D with my lame {person?.name || ''}
    </h1>
    <img src="/images/jolly roger 4.png" alt="Jolly Roger" class="w-52 h-52 mx-auto mt-8 mb-6 opacity-45 drop-shadow-[0_4px_12px_rgba(212,175,55,0.15)]" />
  </header>

  <!-- Calendar Section -->
  <div class="px-8 pb-8 flex-1">
    <div class="max-w-3xl mx-auto bg-[#0E1F29]/60 backdrop-blur-sm rounded-xl border border-[#1C2F3A] shadow-lg shadow-black/20">
      <!-- Calendar Header -->
      <div class="p-4 border-b border-[#1C2F3A] flex items-center justify-between">
        <button 
          class="rounded-lg p-2 bg-[#142833] hover:bg-[#1A3240] text-pirate-parchment transition focus:outline-none focus:ring-2 focus:ring-pirate-gold/60"
          on:click={previousMonth}
          aria-label="Previous month"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <h3 class="text-xl font-bold text-pirate-gold tracking-wide gothic-font">
          {monthName} {year}
          {#if isCurrentMonth}
            <span class="text-sm text-pirate-gold/60 ml-2">(Current)</span>
          {/if}
        </h3>
        <button 
          class="rounded-lg p-2 bg-[#142833] hover:bg-[#1A3240] text-pirate-parchment transition focus:outline-none focus:ring-2 focus:ring-pirate-gold/60"
          on:click={nextMonth}
          aria-label="Next month"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="p-4">
        <!-- Days of Week -->
        <div class="grid grid-cols-7 gap-1 mb-2 text-center text-sm text-pirate-parchment/70">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-2">
          {#each calendarDays as day, i}
            {#if day !== null}
              {@const date = formatDate(new Date(year, month, day))}
              {@const dayPlayers = $playerAvailability.filter((a: PlayerAvailability) => a.date === date)}
              {@const dayData = $dndDays.find((d: DndDay) => d.date === date)}
              {@const isDndDayMarked = dayData?.isDndDay || false}
              {@const isTentativeDay = dayData?.isTentative || false}
              {@const canPlayPlayers = dayPlayers.filter((p: PlayerAvailability) => p.canPlay === true)}
              {@const cannotPlayPlayers = dayPlayers.filter((p: PlayerAvailability) => p.canPlay === false)}
              {@const tentativePlayers = dayPlayers.filter((p: PlayerAvailability) => p.canPlay === 'tentative')}
              {@const canPlayCount = canPlayPlayers.length}
              {@const cannotPlayCount = cannotPlayPlayers.length}
              {@const tentativeCount = tentativePlayers.length}
              {@const totalFriends = person?.friends?.length || 0}
              {@const totalResponses = dayPlayers.length}
              {@const allFriendsAvailable = totalFriends > 0 && canPlayCount === totalFriends}
              <button 
                class="aspect-square p-1 rounded-lg {allFriendsAvailable ? 'bg-green-400/20' : isToday(day) ? 'bg-[#142833]' : 'bg-[#142833]/50'} {isDndDayMarked ? 'ring-2 ring-pirate-gold' : isTentativeDay ? 'ring-2 ring-pink-500' : allFriendsAvailable ? 'ring-2 ring-green-400' : ''} hover:bg-[#1A3240] text-pirate-parchment transition flex flex-col relative focus:outline-none focus:ring-2 focus:ring-pirate-gold/60"
                on:click={() => handleDayClick(day)}
                tabindex="0"
                on:keydown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDayClick(day);
                  }
                }}
              >
                <span class="text-sm font-medium mb-0.5 relative z-10">{day}</span>
                <div class="flex-1 overflow-hidden text-left">
                  <!-- Desktop: Show names -->
                  <div class="hidden md:block">
                    {#each dayPlayers as player}
                      <div class="text-[0.6rem] truncate {player.canPlay === true ? 'text-green-400' : player.canPlay === 'tentative' ? 'text-pink-400' : 'text-red-400'}">
                        {player.playerName}
                      </div>
                    {/each}
                  </div>
                  <!-- Mobile: Show counts -->
                  <div class="md:hidden flex gap-0.5 text-[0.5rem] font-bold leading-none">
                    {#if canPlayCount > 0}
                      <span class="text-green-400">✓{canPlayCount}</span>
                    {/if}
                    {#if tentativeCount > 0}
                      <span class="text-pink-400">?{tentativeCount}</span>
                    {/if}
                    {#if cannotPlayCount > 0}
                      <span class="text-red-400">✗{cannotPlayCount}</span>
                    {/if}
                  </div>
                </div>
              </button>
            {:else}
              <div class="aspect-square p-1 rounded-lg bg-[#142833]/20 text-pirate-parchment/30 flex items-center justify-center">
                <span>·</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>

      <!-- D&D Days List -->
      <div class="p-4 border-t border-[#1C2F3A]">
        <h4 class="text-lg font-bold text-pirate-gold tracking-wide gothic-font mb-4">D&D Days This Month</h4>
        <div class="space-y-2">
          {#each $dndDays.filter((d: DndDay) => {
            const dndDate = new Date(d.date);
            return (d.isDndDay || d.isTentative) && dndDate.getMonth() === month && dndDate.getFullYear() === year;
          }).sort((a: DndDay, b: DndDay) => a.date.localeCompare(b.date)) as dndDay}
            <div class="flex items-center justify-between p-3 rounded-lg bg-[#142833]/50 hover:bg-[#1A3240] transition">
              <div class="flex items-center gap-2">
                <span class="text-pirate-parchment font-medium">
                  {new Date(dndDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                {#if dndDay.isTentative}
                  <span class="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">Tentative</span>
                {/if}
              </div>
              <button 
                class="rounded-lg p-2 bg-[#142833] hover:bg-[#1A3240] text-pirate-parchment transition"
                on:click={() => {
                  if (confirm(`Remove this day as a D&D day?`)) {
                    dndDays.setDndDay(dndDay.date, false);
                  }
                }}
                aria-label="Remove D&D day"
              >
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          {:else}
            <div class="text-center text-pirate-gold py-4 text-lg gothic-font tracking-wide">
              No D&D days scheduled this month
            </div>
          {/each}
        </div>
      </div>

    </div>
  </div>
</div>

<DndSessionDrawer
  open={sessionDrawerOpen}
  selectedDate={selectedDate}
  person={person}
  on:close={() => sessionDrawerOpen = false}
/>

<style>
  /* Background: stormy sea + subtle flag watermark */
  .pirate-bg {
    background: linear-gradient(180deg, #06131A 0%, #091E26 40%, #0B1720 100%);
    position: relative;
  }
</style>

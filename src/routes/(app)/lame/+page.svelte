<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Person } from '$lib/stores';
  import { appointments, type Appointment } from '$lib/stores/appointments';
  import AppointmentDrawer from '$lib/AppointmentDrawer.svelte';
  import CalendarTile from '$lib/CalendarTile.svelte';

  import { page } from '$app/stores';
  import { people } from '$lib/stores';
  
  let person: Person | null = null;
  
  $: if ($page.url.searchParams.get('id') && $people.data) {
    const personId = $page.url.searchParams.get('id');
    person = $people.data.find(p => p.id === personId) || null;
  }

  const today = new Date(2025, 8, 11); // September 11, 2025
  let currentDate = new Date(2025, 8, 1); // September 2025
  $: isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  let appointmentDrawerOpen = false;
  let selectedDate: Date | null = null;

  function handleDayClick(day: number) {
    selectedDate = new Date(year, month, day);
    console.log('Selected date:', selectedDate, 'year:', year, 'month:', month, 'day:', day);
    appointmentDrawerOpen = true;
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

  function formatTimeRange(time: string): string {
    const startHour = time.split(':')[0];
    const endHour = ((parseInt(startHour) + 1) % 24).toString().padStart(2, '0');
    return `${time} - ${endHour}:00`;
  }

  function getAppointmentsForDay(day: number) {
    if (!day) return [];
    const date = formatDate(new Date(year, month, day));
    return $appointments.filter(a => a.date === date).sort((a, b) => a.time.localeCompare(b.time));
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
    <h1 class="text-5xl md:text-6xl font-bold text-pirate-gold tracking-wide gothic-font drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] mb-8">
      My Lame {person?.name || ''} Appointments
    </h1>
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
        <div class="grid grid-cols-7 gap-1">
          {#each calendarDays as day, i}
            {#if day !== null}
              <CalendarTile
                {day}
                {year}
                {month}
                isToday={isToday(day)}
                onClick={() => handleDayClick(day)}
              />
            {:else}
              <div class="aspect-square p-1 rounded-lg bg-[#142833]/20 text-pirate-parchment/30 flex items-center justify-center">
                <span>·</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Appointments List -->
      <div class="p-4 border-t border-[#1C2F3A]">
        <h4 class="text-lg font-bold text-pirate-gold tracking-wide gothic-font mb-4">Upcoming Appointments</h4>
        <div class="space-y-3">
          {#each [...$appointments].sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            return dateCompare || a.time.localeCompare(b.time);
          }) as appointment}
            <div class="flex items-center justify-between p-3 rounded-lg bg-[#142833]/50 hover:bg-[#1A3240] transition">
              <div>
                <div class="text-pirate-parchment font-medium">{appointment.visitorName}</div>
                <div class="text-sm text-pirate-parchment/70">
                  {new Date(appointment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {formatTimeRange(appointment.time)}
                </div>
              </div>
              <button 
                class="rounded-lg p-2 bg-[#142833] hover:bg-[#1A3240] text-pirate-parchment transition"
                on:click={() => {
                  if (confirm(`Are you sure you want to remove ${appointment.visitorName}'s appointment?`)) {
                    appointments.remove(appointment.id);
                  }
                }}
              >
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          {:else}
            <div class="text-center text-pirate-gold py-4 text-lg gothic-font tracking-wide">
              Your Lame is completely free today
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Background: stormy sea + subtle flag watermark */
  .pirate-bg {
    background: linear-gradient(180deg, #06131A 0%, #091E26 40%, #0B1720 100%);
    position: relative;
  }
</style>

<AppointmentDrawer
  open={appointmentDrawerOpen}
  selectedDate={selectedDate}
  on:close={() => appointmentDrawerOpen = false}
  on:save={({ detail: { visitorName, time } }) => {
    if (!selectedDate) return;
    const date = formatDate(selectedDate);
    const success = appointments.add({
      date,
      visitorName,
      time
    });
    if (success) {
      appointmentDrawerOpen = false;
    }
  }}
/>

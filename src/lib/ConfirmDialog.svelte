<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let title = '';
  export let message = '';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let confirmClass = 'bg-[#7A0000] hover:bg-[#9D0B0B] text-pirate-parchment';

  const dispatch = createEventDispatcher<{
    confirm: void;
    cancel: void;
  }>();

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') {
      dispatch('cancel');
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
      on:click={() => dispatch('cancel')}
      aria-hidden="true"
    />

    <!-- Dialog -->
    <div
      class="relative rounded-xl bg-[#0E1F29] border border-[#1C2F3A] p-6 shadow-xl shadow-black/40 w-full max-w-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <h2 id="dialog-title" class="text-xl font-bold text-pirate-gold mb-3">
        {title}
      </h2>
      <p class="text-pirate-parchment mb-6">
        {message}
      </p>
      <div class="flex justify-end gap-3">
        <button
          class="rounded-lg px-3 py-1 bg-[#142833] hover:bg-[#1A3240] text-pirate-parchment transition focus:outline-none focus:ring-2 focus:ring-[#1A3240]/60 focus:ring-offset-2 focus:ring-offset-[#0E1F29]"
          on:click={() => dispatch('cancel')}
        >
          {cancelText}
        </button>
        <button
          class="rounded-lg px-3 py-1 {confirmClass} transition focus:outline-none focus:ring-2 focus:ring-[#9D0B0B]/60 focus:ring-offset-2 focus:ring-offset-[#0E1F29]"
          on:click={() => dispatch('confirm')}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}]]>

<script lang="ts">
  import { onMount } from "svelte";

  let data: {
    artist: string;
    track: string;
    nowPlaying: boolean;
  } | null = $state(null);

  async function update() {
    const response = await fetch("https://lastfmworker.dragsbruh.workers.dev/");
    data = await response.json();
  }

  onMount(() => {
    update();
    const interval = setInterval(update, 10 * 1000);
    return () => clearInterval(interval);
  });
</script>

{#if data}
  <div
    class="border border-lines bg-surface-alt h-max rounded-xl hover:scale-105 transition-all p-4"
  >
    <h2 class="text-gray-300">
      {data.nowPlaying ? "now listening to" : "last listened to"}:
    </h2>

    <div class="py-2">
      <h1 class="text-xl">{data.track}</h1>
      <h2 class="text-sm">by {data.artist}</h2>
    </div>
  </div>
{/if}

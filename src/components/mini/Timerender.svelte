<script lang="ts">
  import { onMount } from "svelte";

  const { start, end }: { start: Date; end?: Date } = $props();
  const duration = end ? (end.getTime() - start.getTime()) / 1000 : null;

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");

    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }

  let now = $state(new Date());
  let elapsedSeconds = $derived.by(() => {
    return Math.floor((now.getTime() - start.getTime()) / 1000);
  });

  let formatted = $derived.by(() => {
    return {
      start: formatTime(elapsedSeconds),
      end: duration ? formatTime(duration) : null,
      progress: duration ? elapsedSeconds / duration : null,
    };
  });

  onMount(() => {
    const interval = setInterval(() => {
      now = new Date();
    }, 700);
    return () => clearInterval(interval);
  });
</script>

<span>{formatted.start}</span>
{#if formatted.end && formatted.progress}
  <div class="grow px-1 flex items-center">
    <span
      class="bg-accent block h-1"
      style="width: {formatted.progress * 100}%;"
    ></span>
    <span class="bg-black block h-1 grow"></span>
  </div>
  <span>{formatted.end}</span>
{/if}

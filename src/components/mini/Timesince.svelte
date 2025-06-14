<script lang="ts">
  import { onMount } from "svelte";

  const { timestamp }: { timestamp: Date } = $props();

  let now = $state(new Date());
  let elapsedSeconds = $derived.by(() => {
    return Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  });
  let formatted = $derived.by(() => {
    const h = Math.floor(elapsedSeconds / 3600);
    const m = Math.floor((elapsedSeconds % 3600) / 60);
    const s = elapsedSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");

    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  });

  onMount(() => {
    const interval = setInterval(() => {
      now = new Date();
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<span>{formatted}</span>

<script lang="ts">
  import { onMount } from "svelte";
  import qts from "../../assets/qts.json";

  let qt = $state("");
  onMount(() => (qt = qts[Math.floor(Math.random() * qts.length)]));
</script>

<div class="fixed right-0 bottom-0">
  <img
    alt="furina"
    src="https://catbox.moe/pictures/qts/{qt}"
    class="max-w-48"
  />
</div>

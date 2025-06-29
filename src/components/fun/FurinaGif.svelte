<script lang="ts">
  import { onMount } from "svelte";
  import gifs from "../../assets/furinas.json";

  let gif = $state("");
  onMount(() => (gif = gifs[Math.floor(Math.random() * gifs.length)]));

</script>

<img alt="furina" src="https://c.tenor.com/qHaIJIuuAT0AAAAd/tenor.gif" class="rounded-xl" />

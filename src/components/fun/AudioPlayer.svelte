<script lang="ts">
  import { onMount } from "svelte";
  import coverArt from "../assets/music/covers/la_vaguelette.jpg";
  import music from "../assets/music/la_vaguelette.ogg";
  import PlayPause from "../mini/PlayPause.svelte";

  let audioElement: HTMLAudioElement;
  let paused = $state(true);
  let duration = $state(0);
  let currentTime = $state(0);

  let isSeeking = false;

  onMount(() => {
    const update = () => {
      duration = audioElement.duration;
      if (!isSeeking) currentTime = audioElement.currentTime;
    };

    audioElement.addEventListener("timeupdate", update);
    audioElement.addEventListener("loadedmetadata", update);

    return () => {
      audioElement.removeEventListener("timeupdate", update);
      audioElement.removeEventListener("loadedmetadata", update);
    };
  });

  function handleSeek(e: Event) {
    const target = e.target as HTMLInputElement;
    const time = parseFloat(target.value);
    currentTime = time;
    audioElement.currentTime = time;
  }
</script>

<div
  class="bg-surface-alt flex not-prose rounded-2xl border border-lines hover:scale-[102%] hover:bg-surface transition-all"
>
  <img
    src={coverArt.src}
    alt="Cover"
    class="w-24 aspect-square object-cover m-0 rounded-l-2xl"
  />
  <div class="flex flex-col justify-evenly flex-grow mx-4">
    <div class="flex-col flex gap-2">
      <h1 class="text-lg">La Vaguelette</h1>
      <h2 class="text-sm leading-0 text-typo-muted">HOYO-MiX</h2>
    </div>
    <div class="flex gap-2">
      <button
        class="w-6 aspect-square cursor-pointer hover:scale-105 transition-transform"
        onclick={() => {
          paused = !paused;
          if (paused) audioElement.pause();
          else audioElement.play();
        }}
      >
        <PlayPause bind:paused />
      </button>
      <input
        type="range"
        class="w-full flex-grow cursor-pointer"
        max={duration}
        min={0}
        value={currentTime}
        oninput={handleSeek}
        onmousedown={() => (isSeeking = true)}
        onmouseup={() => (isSeeking = false)}
      />
    </div>
  </div>
</div>

<audio src={music} bind:this={audioElement}></audio>

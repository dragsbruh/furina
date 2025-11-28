<script lang="ts">
  import { onMount } from "svelte";
  import {
    getActivityVerb,
    type DiscordPresence,
  } from "../../stores/discord.svelte";
  import Timerender from "../mini/Timerender.svelte";

  let { activity }: { activity: DiscordPresence["activities"][number] } =
    $props();

  $inspect(activity.name, activity.timestamps);
  onMount(() => {});
</script>

<div
  class="flex flex-col gap-2 bg-surface rounded-xl p-4 hover:scale-[102%] transition-transform"
>
  <p class="text-xs text-muted font-bold">
    {getActivityVerb(activity.type)}
  </p>
  <div class="flex gap-2 w-full">
    <div class="relative hover:scale-105 transition-transform w-16">
      {#if activity.assets}
        {#if activity.assets.large_image_url}
          <img
            src={activity.assets.large_image_url}
            alt=""
            class="w-16 rounded-lg"
          />
          {#if activity.assets.small_image_url}
            <img
              src={activity.assets.small_image_url}
              alt=""
              class="absolute -bottom-1 -right-1 w-6 rounded-sm"
            />
          {/if}
        {:else if activity.assets.small_image_url}
          <img
            src={activity.assets.small_image_url}
            alt=""
            class="w-16 rounded-lg"
          />
        {/if}
      {:else}
        <div
          class="w-16 aspect-square flex justify-center items-center text-muted border border-border"
        >
          ?
        </div>
      {/if}
    </div>
    <div class="flex flex-col gap-1 grow">
      <h2 class="text-sm truncate w-48 font-extrabold">
        {activity.name}
      </h2>
      <h3 class="text-xs leading-none text-muted truncate w-48">
        {activity.details}
      </h3>
      <h4 class="text-xs leading-none text-muted truncate w-48">
        {activity.state}
      </h4>
      {#if activity.timestamps?.start}
        <div class="flex gap-2">
          <div class="text-activity-timestamp">
            <svg
              aria-hidden="true"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="currentColor"
              viewBox="0 0 24 24"
              ><path
                fill="var(--text-positive)"
                fill-rule="evenodd"
                d="M20.97 4.06c0 .18.08.35.24.43.55.28.9.82 1.04 1.42.3 1.24.75 3.7.75 7.09v4.91a3.09 3.09 0 0 1-5.85 1.38l-1.76-3.51a1.09 1.09 0 0 0-1.23-.55c-.57.13-1.36.27-2.16.27s-1.6-.14-2.16-.27c-.49-.11-1 .1-1.23.55l-1.76 3.51A3.09 3.09 0 0 1 1 17.91V13c0-3.38.46-5.85.75-7.1.15-.6.49-1.13 1.04-1.4a.47.47 0 0 0 .24-.44c0-.7.48-1.32 1.2-1.47l2.93-.62c.5-.1 1 .06 1.36.4.35.34.78.71 1.28.68a42.4 42.4 0 0 1 4.4 0c.5.03.93-.34 1.28-.69.35-.33.86-.5 1.36-.39l2.94.62c.7.15 1.19.78 1.19 1.47ZM20 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5 7a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 1 1 0-2h1V7Z"
                clip-rule="evenodd"
                class=""
              ></path></svg
            >
          </div>
          <p
            class="text-[11px] leading-none font-bold text-activity-timestamp w-full flex"
          >
            <Timerender
              start={activity.timestamps.start}
              end={activity.timestamps.end}
            />
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>

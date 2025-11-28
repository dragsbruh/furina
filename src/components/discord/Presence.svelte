<script lang="ts">
  import {
    badges,
    discordServer,
    getStatusColor,
    presence,
    pronouns,
    beginUpdating,
    type DiscordPresence,
  } from "../../stores/discord.svelte";
  import Activity from "./Activity.svelte";
  import { onMount } from "svelte";

  const defaultPrescence: DiscordPresence = {
    discord_status: "offline",
    discord_user: {
      id: "",
      username: "dragsbruh",
      display_name: "Furina De Fontaine!!!",
      avatar: "https://furina.is-a.dev/avatar.png",
      primary_guild: null,
      avatar_decoration_data: null,
    },
    activities: [],
    listening_to_spotify: false,
    spotify: null,
  };

  let currentPresence: DiscordPresence = $state(defaultPrescence);
  presence.subscribe((p) => (currentPresence = p ?? defaultPrescence));

  onMount(() => {
    const controller = new AbortController();
    beginUpdating(controller.signal);
    return () => controller.abort();
  });
</script>

<div
  class="border border-lines bg-surface-alt h-max rounded-xl hover:scale-105 transition-all"
>
  <div class="relative w-full h-30">
    <div
      class="w-full h-20 bg-surface border-lines border-b rounded-t-xl"
    ></div>
    <div class="absolute bottom-0 left-0">
      <div
        class="ml-4 relative w-24 aspect-square flex justify-center items-center hover:scale-105 transition-transform cursor-pointer"
      >
        <img
          src={currentPresence.discord_user.avatar}
          alt=""
          class="h-20 rounded-full"
        />
        {#if currentPresence.discord_user.avatar_decoration_data}
          <img
            src={currentPresence.discord_user.avatar_decoration_data.image}
            alt=""
            class="absolute top-0 left-0 w-24"
          />
        {/if}
      </div>
      <div class="absolute -bottom-1 -right-1">
        <div class="relative flex size-2">
          <span
            class="absolute inline-flex h-full w-full animate-ping {getStatusColor(
              currentPresence.discord_status
            )} opacity-75"
          ></span>
          <span
            class="relative inline-flex h-full w-full {getStatusColor(
              currentPresence.discord_status
            )}"
          ></span>
        </div>
      </div>
    </div>
  </div>
  <div class="px-4 pb-4 pt-2">
    <div class="flex flex-col gap-1">
      <div class="flex flex-col">
        <h2 class="text-lg font-bold leading-tight">
          <a href={discordServer} class="hover:underline">
            {currentPresence.discord_user.display_name}
          </a>
        </h2>
        <p class="text-sm text-muted leading-none flex items-center gap-2">
          <a href={discordServer} class="hover:underline">
            {currentPresence.discord_user.username}
          </a>
          <span class="w-1 h-1 bg-muted inline-block"></span>
          {pronouns}
        </p>
      </div>

      <div class="flex gap-1 select-none">
        {#if currentPresence.discord_user.primary_guild}
          <div
            class="flex gap-1 items-center bg-surface-alt-extra w-max px-1 py-1/2"
          >
            <img
              src={currentPresence.discord_user.primary_guild.image}
              alt=""
              class="h-2"
            />
            <p class=" text-xs font-bold text-muted">
              {currentPresence.discord_user.primary_guild.tag}
            </p>
          </div>
        {/if}
        {#each badges as badge}
          <div class="relative inline-block pointer-events-auto">
            <img
              src={badge.image}
              alt=""
              class="h-4 aspect-square cursor-pointer"
              onmouseover={() => (badge.hovered = true)}
              onmouseleave={() => (badge.hovered = false)}
              onfocus={() => {}}
            />

            <div
              class="absolute left-1/2 z-10 w-64 px-4 py-2 text-muted bg-surface-alt border border-border scale-95 transition-all duration-200 ease-in-out origin-top"
              style="top: calc(100% + 8px);"
              class:hidden={!badge.hovered}
            >
              {badge.title}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="py-2 mt-2">
      <div class="text-[13px] leading-8">
        <blockquote class="border-l border-dim pl-4">
          <p>"I must say also a few words. Leave me; I am inexorable."</p>
          <i>- Grall, Frankenstein</i>
        </blockquote>

        <a
          href="https://furina.is-a.dev"
          class="text-accent hover:border-accent border-b border-transparent border-dashed w-max"
          >https://furina.is-a.dev</a
        >
        <p>
          homelab:
          <a
            href="https://hearth.is-a.dev"
            class="text-accent hover:border-accent border-b border-transparent border-dashed w-max"
            >https://hearth.is-a.dev</a
          >
        </p>
        <p>i use arch, btw</p>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      {#each currentPresence.activities as activity (activity.id)}
        {#if activity.type != 4}
          <Activity {activity} />
        {/if}
      {/each}
    </div>
  </div>
</div>

<script lang="ts">
  import {
    badges,
    bio,
    discordServer,
    getActivityVerb,
    getStatusColor,
    presence,
    pronouns,
    updatePresence,
    type DiscordPresence,
  } from "../stores/discord.svelte";
  import Timesince from "./mini/Timesince.svelte";
  import { onMount } from "svelte";

  let currentPresence: DiscordPresence | null = $state(null);
  let bioTruncated = $state(true);

  presence.subscribe((p) => (currentPresence = p));

  function truncateHTML(html: string, limit: number): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;

    let count = 0;

    function truncateTextNodes(node: Node) {
      if (count >= limit) {
        node.parentNode?.removeChild(node);
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        const remaining = limit - count;

        if (text.length > remaining) {
          node.textContent = text.slice(0, remaining);
          count = limit;
        } else {
          count += text.length;
        }
      }

      for (const child of Array.from(node.childNodes)) {
        truncateTextNodes(child);
      }
    }

    function removeEmptyElements(node: Element) {
      for (const child of Array.from(node.children)) {
        removeEmptyElements(child);
      }

      const isEmpty =
        node.textContent?.trim().length === 0 &&
        !node.querySelector("img, video, iframe");

      if (isEmpty) {
        node.remove();
      }
    }

    truncateTextNodes(body);
    removeEmptyElements(body);

    return body.innerHTML;
  }

  onMount(() => {
    updatePresence().then(() => setInterval(updatePresence, 1000 * 10));
  });
</script>

{#if currentPresence}
  <div class="border border-lines bg-surface-alt h-max rounded-xl hover:scale-105 transition-all">
    <div class="relative w-full h-30">
      <div
        class="w-full h-20 bg-surface border-lines border-b rounded-t-xl"
      ></div>
      <div class="absolute bottom-0 left-0">
        <div
          class="ml-4 relative w-24 aspect-square flex justify-center items-center hover:scale-105 transition-transform cursor-pointer"
        >
          <img
            src={currentPresence.data.discord_user.avatar}
            alt=""
            class="h-20 rounded-full"
          />
          {#if currentPresence.data.discord_user.avatar_decoration_data}
            <img
              src={currentPresence.data.discord_user.avatar_decoration_data
                .image}
              alt=""
              class="absolute top-0 left-0 w-24"
            />
          {/if}
        </div>
        <div class="absolute -bottom-1 -right-1">
          <div class="relative flex size-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping {getStatusColor(
                currentPresence.data.discord_status
              )} opacity-75"
            ></span>
            <span
              class="relative inline-flex h-full w-full {getStatusColor(
                currentPresence.data.discord_status
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
              {currentPresence.data.discord_user.display_name}
            </a>
          </h2>
          <p class="text-sm text-muted leading-none flex items-center gap-2">
            <a href={discordServer} class="hover:underline">
              {currentPresence.data.discord_user.username}
            </a>
            <span class="w-1 h-1 bg-muted inline-block"></span>
            {pronouns}
          </p>
        </div>

        <div class="flex gap-1 select-none">
          {#if currentPresence.data.discord_user.clan}
            <div
              class="flex gap-1 items-center bg-surface-alt-extra w-max px-1 py-1/2"
            >
              <img
                src={currentPresence.data.discord_user.clan.image}
                alt=""
                class="h-2"
              />
              <p class=" text-xs font-bold text-muted">
                {currentPresence.data.discord_user.clan.tag}
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
        <div class="text-[13px]">
          {#if bioTruncated}
            {@html truncateHTML(bio, 41)}
            <button
              class="text-[#888] hover:underline hover:text-muted hover:cursor-pointer w-max"
              onclick={() => (bioTruncated = false)}>View Full Bio</button
            >
          {:else}
            {@html bio}
          {/if}
        </div>
      </div>

      <div class="flex flex-col gap-2">
        {#each currentPresence.data.activities as activity}
          {#if activity.type != 4}
            <div class="flex flex-col gap-2 bg-surface rounded-xl p-4 hover:scale-[102%] transition-transform">
              <p class="text-xs text-muted font-bold">
                {getActivityVerb(activity.type)}
              </p>
              <div
                class="flex gap-2 w-max {activity.assets?.small_image_url
                  ? 'mb-1'
                  : ''}"
              >
                <div class="relative hover:scale-105 transition-transform">
                  {#if activity.assets}
                    {#if activity.assets.large_image_url}
                      <img
                        src={activity.assets.large_image_url}
                        alt=""
                        class="w-16"
                      />
                      {#if activity.assets.small_image_url}
                        <img
                          src={activity.assets.small_image_url}
                          alt=""
                          class="absolute -bottom-1 -right-1 w-6"
                        />
                      {/if}
                    {:else if activity.assets.small_image_url}
                      <img
                        src={activity.assets.small_image_url}
                        alt=""
                        class="w-16"
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
                <div class="flex flex-col gap-1">
                  <h2 class="text-sm">{activity.name}</h2>
                  <h3 class="text-xs leading-none text-muted">
                    {activity.details}
                  </h3>
                  <h4 class="text-xs leading-none text-muted">
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
                        class="text-[11px] leading-none font-bold text-activity-timestamp"
                      >
                        <Timesince timestamp={activity.timestamps.start} />
                      </p>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="p-4">loading...</div>
{/if}

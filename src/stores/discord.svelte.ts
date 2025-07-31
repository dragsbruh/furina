import { atom, type PreinitializedWritableAtom } from "nanostores";
import { z } from "zod";

export const user_id = "781445370177126401";
export const pronouns = "regina/of/all/waters";
export const discordServer = "https://discord.gg/BK9sBWdWC4";

export const badges = $state([
  {
    title: "HypeSquad Bravery",
    image:
      "https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png",
    hovered: false,
  },
  {
    title: "Originally known as JUSTDRAGS#4281",
    image:
      "https://cdn.discordapp.com/badge-icons/6de6d34650760ba5551a79732e98ed60.png",
    hovered: false,
  },
  {
    title: "Completed a Quest",
    image:
      "https://cdn.discordapp.com/badge-icons/7d9ae358c8c5e118768335dbe68b4fb8.png",
    hovered: false,
  },
]);

export const lanyardSchema = z.object({
  data: z.object({
    discord_user: z
      .object({
        id: z.string(),
        username: z.string(),
        avatar: z.string().nullable(),

        clan: z
          .object({
            tag: z.string(),
            identity_guild_id: z.string(),
            badge: z.string(),
          })
          .transform((o) => ({
            ...o,
            image: `https://cdn.discordapp.com/clan-badges/${o.identity_guild_id}/${o.badge}.png`, // FIXME: make a head request to determine extension like .png or .jpg or .webp, not priority
          }))
          .nullable(),

        avatar_decoration_data: z
          .object({
            sku_id: z.string(),
            asset: z.string(),
          })
          .transform((o) => ({
            ...o,
            image: `https://cdn.discordapp.com/avatar-decoration-presets/${o.asset}.png?passthrough=true`,
          }))
          .nullable(),

        display_name: z.string(),
      })
      .transform((u) => ({
        ...u,
        avatar: u.avatar
          ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${
              u.avatar.startsWith("a_") ? "gif" : "png"
            }?size=1024`
          : `https://cdn.discordapp.com/embed/avatars/${Number(
              BigInt(u.id) % 5n
            )}.png`,
      })),
    activities: z
      .array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            type: z.number(),
            state: z.string().optional(),
            session_id: z.string().optional(),
            details: z.string().optional(),
            created_at: z.coerce.date().optional(),
            timestamps: z
              .object({
                start: z.coerce.date().optional(),
              })
              .optional(),
            assets: z
              .object({
                large_image: z.string().optional(),
                large_text: z.string().optional(),
                small_image: z.string().optional(),
                small_text: z.string().optional(),
              })
              .optional(),
            application_id: z.string().optional(),
          })
          .transform((o) => ({
            ...o,
            assets: o.assets
              ? {
                  ...o.assets,
                  large_image_url:
                    (o.application_id || o.id.startsWith("spotify")) &&
                    o.assets?.large_image
                      ? parseDiscordImage(o.assets.large_image, o)
                      : undefined,
                  small_image_url:
                    o.application_id && o.assets?.small_image
                      ? `https://cdn.discordapp.com/app-assets/${o.application_id}/${o.assets.small_image}.png?size=512`
                      : undefined,
                }
              : undefined,
          }))
      )
      .transform((a) => a.filter((v) => v.name !== "music")), // filter out mpd-discord-rpc
    discord_status: z.enum(["dnd", "offline", "online", "idle"]),
    listening_to_spotify: z.boolean(),

    spotify: z
      .object({
        song: z.string(),
        artist: z.string(),
        album: z.string(),
        album_art_url: z.string(),
        timestamps: z.object({
          start: z.number(),
          end: z.number(),
        }),
      })
      .nullable(),
  }),
});
export type DiscordPresence = z.infer<typeof lanyardSchema>;

export const lastfmSchema = z.object({
  track: z.string(),
  artist: z.string(),
  album: z.string(),
  cover: z.string(),
  trackUrl: z.string(),
  nowPlaying: z.boolean(),
});

export const presence: PreinitializedWritableAtom<DiscordPresence | null> =
  atom(null);

export const getStatusColor = (
  status: "dnd" | "offline" | "idle" | "online"
) => {
  switch (status) {
    case "online":
      return "bg-online";
    case "dnd":
      return "bg-dnd";
    case "idle":
      return "bg-idle";
    case "offline":
      return "bg-offline";
  }
};

export const getActivityVerb = (type: number) => {
  switch (type) {
    case 0:
      return "Playing";
    case 1:
      return "Streaming";
    case 2:
      return "Listening to";
    case 3:
      return "Watching";
    case 4:
      return "CustomSTATUS!!! <3 !!!";
    case 5:
      return "Competing in";
    default:
      return "dOiNg SoMeThInG sUs";
  }
};

export const updatePresence = async () => {
  const [lanyardRes, lastfmRes] = await Promise.all([
    fetch(`https://api.lanyard.rest/v1/users/${user_id}`),
    fetch("https://lastfmworker.dragsbruh.workers.dev"),
  ]);
  if (!lanyardRes.ok) {
    console.error(
      "http status error while fetching presence from lanyard",
      lanyardRes.headers.get("Content-Type") === "application/json"
        ? lanyardRes.json()
        : lanyardRes.text()
    );
    return;
  }
  if (!lastfmRes.ok) {
    console.error(
      "http status error while fetching lastfm data",
      lastfmRes.status,
      lastfmRes.statusText
    );
    return;
  }

  const result = await lanyardSchema.safeParseAsync(await lanyardRes.json());
  if (!result.success) {
    console.error("schema error while parsing presence", result.error);
    return;
  }
  const lastfm = await lastfmSchema.safeParseAsync(await lastfmRes.json());
  if (!lastfm.success) {
    console.error("schema error while parsing lastfm", result.error);
    return;
  }

  result.data.data.activities = [
    {
      name: lastfm.data.track,
      details: `${lastfm.data.artist} / ${lastfm.data.album}`,
      state: lastfm.data.nowPlaying ? "Now listening" : "Last listened to",
      type: 2,
      assets: {
        large_image_url: lastfm.data.cover,
        small_image_url: undefined,
      },
      id: "lastfm",
    },
    ...result.data.data.activities,
  ];

  presence.set(result.data);
};

function parseDiscordImage(url: string, o: any) {
  if (url.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${url.split(":")[1]}`;
  } else if (url.startsWith("mp:external")) {
    const parts = url.split("/");
    if (parts.length < 5) return null;

    const protocol = parts[2];
    const host = parts[3];
    const path = parts.slice(4).join("/");

    return `${protocol}://${host}/${path}`;
  }

  return `https://cdn.discordapp.com/app-assets/${o.application_id}/${o.assets.large_image}.png?size=512`;
}

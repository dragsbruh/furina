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

const lanyardDataSchema = z.object({
  discord_user: z
    .object({
      id: z.string(),
      username: z.string(),
      avatar: z.string().nullable(),

      primary_guild: z
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
              end: z.coerce.date().optional(),
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
                  o.application_id &&
                  o.assets?.large_image
                    ? parseDiscordImage(
                        o.assets.large_image,
                        o.assets.large_image,
                        o.application_id
                      )
                    : undefined,
                small_image_url:
                  o.application_id && o.assets?.small_image
                    ? parseDiscordImage(
                        o.assets.small_image,
                        o.assets.small_image,
                        o.application_id
                      )
                    : undefined,
              }
            : undefined,
        }))
    )
    .transform((a) =>
      a.map((v) => {
        if (v.name !== "music") return v;
        v.name = v.details ?? "Unknown Track";
        v.details = v.state ?? "Unknown Artist";
        v.state = "";
        return v;
      })
    ),
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
});

export type DiscordPresence = z.infer<typeof lanyardDataSchema>;

export const presence: PreinitializedWritableAtom<DiscordPresence | null> =
  atom(null);

export const lanyardSocketSchema = {
  hello: z.object({
    op: z.literal(1),
    d: z.object({ heartbeat_interval: z.number() }),
  }),

  initialize: z.object({
    op: z.literal(2),
    d: z.union([
      z.strictObject({
        subscribe_to_ids: z.array(z.string()),
      }),
      z.strictObject({
        subscribe_to_all: z.boolean(),
      }),
    ]),
  }),

  presenceUpdate: z.object({
    op: z.literal(0),
    t: z.literal("PRESENCE_UPDATE"),
    d: lanyardDataSchema.extend({ user_id: z.string().optional() }),
  }),

  presenceInit: z.object({
    op: z.literal(0),
    t: z.literal("INIT_STATE"),
    d: z.record(lanyardDataSchema),
  }),
};

const lanyardPresenceSchema = z.discriminatedUnion("t", [
  lanyardSocketSchema.presenceUpdate,
  lanyardSocketSchema.presenceInit,
]);

type LanyardInit = z.infer<typeof lanyardSocketSchema.initialize>;

export const beginUpdating = async (signal: AbortSignal) => {
  const ws = new WebSocket("wss://api.lanyard.rest/socket");
  signal.addEventListener("abort", () => ws.close());

  const heartbeatTime = await new Promise<number>((resolve, reject) => {
    ws.onmessage = (ev) => {
      const data = lanyardSocketSchema.hello.parse(JSON.parse(ev.data));
      resolve(data.d.heartbeat_interval * 1000);

      const init: LanyardInit = { op: 2, d: { subscribe_to_ids: [user_id] } };

      ws.send(JSON.stringify(init));
    };
    ws.onclose = () => reject();
  });

  ws.onmessage = (ev) => {
    const data = lanyardPresenceSchema.parse(JSON.parse(ev.data));

    if (data.t === "INIT_STATE") {
      data.d[user_id] && presence.set(data.d[user_id]);
    } else if (data.t === "PRESENCE_UPDATE") {
      presence.set(data.d);
    }
  };

  const interval = setInterval(() => {
    ws.send(JSON.stringify({ op: 3 }));
  }, heartbeatTime);
  signal.addEventListener("abort", () => clearInterval(interval));
};

function parseDiscordImage(
  url: string,
  image_id: string,
  application_id: string
) {
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

  return `https://cdn.discordapp.com/app-assets/${application_id}/${image_id}.png?size=512`;
}

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

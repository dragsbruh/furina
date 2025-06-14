import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      date: z.coerce.date(),
      description: z.string().optional(),
      hero: image().optional(),
      hero_position: z.string().optional(),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { blog };

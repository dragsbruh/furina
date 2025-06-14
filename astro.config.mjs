// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? "https://furina.is-a.dev",
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    allowedHosts: true,
  },

  integrations: [mdx(), svelte(), sitemap()],
});

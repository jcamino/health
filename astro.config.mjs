import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from "@astrojs/cloudflare";

// Cloudflare Workers deploy (static assets + a fallback worker) via the
// @astrojs/cloudflare adapter. Pages are prerendered by default; the adapter
// emits the dist/_worker.js that wrangler.jsonc points `main` at.
export default defineConfig({
  site: 'https://health.jcamino.net',
  integrations: [mdx(), svelte(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  adapter: cloudflare()
});
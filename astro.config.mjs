import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from "@astrojs/cloudflare";

// Static output (default). No adapter needed for Cloudflare Pages.
export default defineConfig({
  site: 'https://health.jcamino.net',
  integrations: [mdx(), svelte(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  adapter: cloudflare()
});
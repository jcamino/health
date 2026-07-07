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
  // Canonical URLs and the sitemap already use trailing slashes, and Cloudflare
  // redirects `/heart` -> `/heart/`. Make that explicit so the dev server matches
  // production and internal links stay on the canonical (redirect-free) form.
  trailingSlash: 'always',
  integrations: [mdx(), svelte(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  adapter: cloudflare()
});
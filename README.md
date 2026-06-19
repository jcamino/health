# health.jcamino.net

Static Astro site (educational longevity tools), deployed on **Cloudflare Workers**
(static assets) via the `@astrojs/cloudflare` adapter.

## Develop
```bash
nvm use            # Node 24 (see .nvmrc)
npm install
npm run dev        # http://localhost:4321 (Astro dev server)
npm test           # Vitest (pure calculator logic)
npm run build      # prerenders the static site to dist/ (+ Workers assets)
npm run preview    # build, then serve via `wrangler dev` (Workers runtime)
```

## Deploy — Cloudflare Workers
The repo is connected to Cloudflare (Workers Builds via the GitHub integration), so
**every push to `main` triggers a build and deploy** automatically. Worker/asset
config lives in `wrangler.jsonc` (assets served from `dist/`).

- Manual deploy (if needed): `npm run deploy` (runs `astro build && wrangler deploy`).
- Custom domain `health.jcamino.net` is configured in the Cloudflare dashboard
  (DNS already on Cloudflare).
- `output` is left default (static): every page is prerendered to static HTML; the
  interactive calculators are client-side Svelte islands. No SSR / server app logic.

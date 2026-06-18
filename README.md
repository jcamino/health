# health.jcamino.net

Static Astro site. Educational longevity tools.

## Develop
```bash
nvm use            # Node 24 (see .nvmrc)
npm install
npm run dev        # http://localhost:4321
npm test           # Vitest (pure calculator logic)
npm run build      # outputs static site to dist/
```

## Deploy — Cloudflare Pages (manual, one-time setup)
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → select this repo.
2. Build settings:
   - Production branch: **main**
   - Framework preset: **Astro**
   - Build command: **`npm run build`**
   - Build output directory: **`dist`**
   - Environment variable: **`NODE_VERSION` = `24`**
3. Save & deploy. Then **Custom domains** → add **health.jcamino.net**
   (DNS is already on Cloudflare → one click).

Every push to `main` redeploys; other branches/PRs get preview URLs.
No adapter or Functions — pure static output.

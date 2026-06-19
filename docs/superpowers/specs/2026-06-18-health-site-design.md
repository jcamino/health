# Health & Longevity Site — Design

**Date:** 2026-06-18
**Status:** Approved design, pending spec review
**Scope:** **MVP = heart page** (metabolism deferred — §13)
**Domain:** `health.jcamino.net` (Cloudflare Pages, deployed from `main`)

## 1. Overview & goals

A static, content-first website teaching evidence-based longevity concepts, with
interactive client-side calculators. Eventual routes:

- `/` — landing page: longevity suggestions, links into the pillars.
- `/heart` — cardiovascular: ApoB, cumulative exposure ("ApoB-years"), Lp(a), blood pressure, statins.
- `/metabolism` — metabolic health *(deferred post-MVP — see §13)*.

**MVP scope (v1):** the **heart page is the focus**. v1 ships the site shell
(layout, nav, footer, disclaimer), a **minimal landing page**, and the **full
`/heart` page** with its calculators. The `/metabolism` page and its calculators
are deferred (§13).

Guiding principles:

1. **Static-only.** No backend, no accounts, nothing stored server-side. Every
   calculation runs in the browser.
2. **Mostly static HTML, with islands of interactivity.** Content pages ship zero
   JS; only calculators/charts hydrate.
3. **Medical math is pure, tested TypeScript, separate from UI, and carries its
   own citations.** A calculator cannot ship without linking its sources.
4. **Lifetime perspective over short-horizon.** Cumulative exposure is the primary
   lens; 10-year scores are secondary and explicitly contextualized.

## 2. Non-goals

- No user accounts, auth, or saved/persisted results.
- No SSR or server-side app logic, and no database. (Deployment uses the
  `@astrojs/cloudflare` adapter to host on Cloudflare Workers static assets, but
  every page is prerendered to static HTML.)
- No CMS — content is authored in MDX in the repo.
- No SSR; output is a static `dist/`.

## 3. Tech stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Meta-framework | **Astro** (static output, file-based routing)       |
| Content        | **MDX** (`@astrojs/mdx`)                             |
| Styling        | **Tailwind CSS** + **@tailwindcss/typography**      |
| Interactivity  | **Svelte islands** (`@astrojs/svelte`)              |
| Charts         | **Chart.js** (wrapped in Svelte components)         |
| Language       | **TypeScript** throughout                           |
| Tests          | **Vitest** (unit tests on the pure formula modules) |
| Formatting     | **Prettier** (+ Astro/Svelte plugins)               |
| Runtime        | **Node 24** (pinned via `.nvmrc`)                   |
| Hosting        | **Cloudflare Workers** (static assets) via `@astrojs/cloudflare` adapter; pages prerendered |
| Theming        | Manual light/dark toggle (class `dark` variant + `localStorage`); defaults to OS preference |

Rationale: Astro fits "content-heavy pages + pockets of interactivity" better than
a full app framework (Next/SvelteKit would add unused SSR machinery) or a no-build
approach (which loses MDX authoring and component reuse). Svelte gives concise
reactive widgets that compile to tiny JS — ideal for "slider changes → chart
redraws." See §11 for alternatives considered.

## 4. Repo structure

```
health/
├── public/                       # favicon, OG images, static assets
├── src/
│   ├── pages/
│   │   ├── index.mdx             # landing — minimal for MVP
│   │   ├── heart.mdx             # ApoB, ApoB-years, Lp(a), BP, statins
│   │   └── metabolism.mdx        # DEFERRED (post-MVP)
│   ├── layouts/
│   │   └── BaseLayout.astro      # shell, nav, footer, disclaimer, SEO meta
│   ├── components/
│   │   ├── calculators/          # Svelte widgets (UI only — call lib/)
│   │   ├── charts/               # Chart.js wrappers (e.g. LineChart.svelte)
│   │   └── ui/                   # Callout, Citation, Sources, Disclaimer
│   ├── lib/
│   │   ├── calculators/          # PURE TS: formulas, typed I/O, sources[]
│   │   │   ├── apoB.ts           # tiers + ApoB-years exposure (+ threshold)
│   │   │   ├── lpa.ts            # Lp(a) tier / risk readout
│   │   │   ├── bloodPressure.ts  # BP category (ACC/AHA 2017)
│   │   │   ├── prevent.ts        # 10-year ASCVD — AHA PREVENT 2024 (race-free)
│   │   │   └── metabolic.ts      # DEFERRED (post-MVP)
│   │   └── references.ts         # central citation registry (single source)
│   └── styles/global.css         # Tailwind entry + base styles
├── tests/                        # Vitest unit tests for lib/calculators
├── .nvmrc                        # 24
├── astro.config.mjs
├── package.json
└── README.md                     # dev / build / deploy notes
```

## 5. Calculator & citation architecture (core)

The defining constraint: **every formula links to its source(s).** This is enforced
structurally, not by convention.

- **Pure functions** in `src/lib/calculators/` — typed inputs/outputs, no DOM, no
  framework. These hold all medical logic and are unit-tested in isolation.
- **One citation registry** (`src/lib/references.ts`). Every reference is defined
  once with a real, verified URL/DOI.
- **Each formula module declares the sources it rests on** via an exported
  `sources` array referencing registry entries.
- **Svelte widgets are dumb**: import the pure function, bind the form, call it
  reactively, render the result **and** a `<Sources>` block built from that
  `sources` array. No sources → nothing to render → the omission is obvious.
- **MDX prose cites the same registry** via `<Citation id="..." />`, so inline
  references and calculator references never drift.

Shape (illustrative; URLs verified during implementation):

```ts
// references.ts — every citation lives here, defined once
export interface Reference {
  id: string;
  title: string;
  authors?: string;
  year?: number;
  url: string;   // real, verified link — required
  doi?: string;
}

export const refs = {
  ference2017apoB: { /* cumulative ApoB/LDL exposure — Ference et al. */ },
  sniderman2019:   { /* ApoB as the primary atherogenic measure */ },
  lpaConsensus:    { /* Lp(a) high-risk cut-points + causality */ },
  ascvdPce2013:    { /* ACC/AHA Pooled Cohort Equations */ },
  // ...
} satisfies Record<string, Reference>;

// apoB.ts — math + the sources it rests on
import { refs } from "../references";
export const sources = [refs.ference2017apoB, refs.sniderman2019];
export function apoBTier(apoB_mgdl: number): ApoBTier { /* ... */ }
export function apoBYears(trajectory: ApoBPoint[]): number { /* AUC */ }
```

## 6. Medical accuracy, framing & disclaimer

- **Validated scores use published equations**, verified against worked examples
  from their source papers (see §8 test vectors).
- **The ApoB-years cumulative-exposure model is the hero of the heart page**, framed
  as the lifetime view: atherosclerosis tracks the *area under the ApoB curve*
  (magnitude × duration), per the cumulative-exposure literature. Exposure is
  integrated **from birth (age 0)**, with ApoB **rising with age at a user-adjustable
  per-decade rate** (anchored to the user's current ApoB and clamped to a floor); an
  optional intervention drops ApoB and then holds it flat. It is a teaching
  model of a well-supported relationship, labeled as such — not a packaged clinical
  risk score. The chart overlays a **cumulative-exposure threshold reference line** —
  the accumulated exposure around which atherosclerotic burden becomes clinically
  meaningful (commonly cited as **~5,000 mg·years for LDL-C**; the ApoB-equivalent
  value and units to be verified and sourced) — so users see how their trajectory
  compares.
- **ApoB risk tiers target optimal, plaque-stabilizing levels (~60–65 mg/dL and
  below)** for those pursuing regression, with standard guideline cut-points shown
  alongside for contrast. All thresholds sourced.
- **Lp(a) is covered as an independent, largely genetic risk factor.** An explainer
  plus a tier readout (enter Lp(a) in mg/dL or nmol/L → risk tier against accepted
  high-risk cut-points), noting it's measured ~once in a lifetime, not meaningfully
  lowered by statins/lifestyle, and **additive to ApoB risk**. Sourced.
- **10-year ASCVD is secondary and explicitly contextualized**: computed with the
  **AHA PREVENT (2024) equations — race-free and current** — kept because it's
  validated, but presented as a short-horizon tool that systematically
  under-weights younger people — which is precisely why the lifetime/cumulative
  view matters. Paired with a lifetime perspective.
- **Disclaimer** — site-wide in the footer, and prominent on every calculator:

  > **Educational only — not medical advice.** These tools illustrate concepts and
  > estimates and can't account for your full history. Discuss your numbers with a
  > [preventive cardiologist or clinical lipidologist](https://www.google.com/maps/search/?api=1&query=preventive+cardiologist).

  The linked phrase opens a Google Maps search localized to the reader.

## 7. MVP calculator scope (heart)

**Heart (`/heart`)** — the focus of v1:

1. **ApoB-years cumulative exposure (hero).** Model an ApoB trajectory **from birth
   (age 0)** — anchored to the user's current ApoB, **rising with age at a
   user-adjustable per-decade rate** (clamped to a floor), with an optional
   intervention that drops ApoB and then holds it flat — and visualize the
   cumulative area ("ApoB-years"). Overlay a **cumulative-exposure
   threshold reference line** (~5,000 mg·years for LDL-C as the commonly cited
   anchor; ApoB-equivalent value/units verified and sourced) so users see how their
   trajectory compares. Compare scenarios (e.g., no intervention vs. lowering ApoB to
   60 at age 40). Sourced.
2. **ApoB risk-tier readout.** Enter ApoB → tier, oriented to optimal targets
   (~60–65 and below) with guideline context. Sourced.
3. **Lp(a) explainer + tier readout.** Enter Lp(a) (mg/dL or nmol/L) → risk tier
   against accepted high-risk cut-points; explain it as independent, largely
   genetic, measured once, and additive to ApoB risk. Sourced.
4. **Blood pressure explainer + category readout.** Enter systolic/diastolic →
   category (normal / elevated / stage 1 / stage 2) per the 2017 ACC/AHA
   guideline; explain how hypertension compounds ApoB-driven risk. Sourced.
5. **10-year risk — AHA PREVENT 2024 (secondary), race-free.** Validated equation,
   contextualized as short-horizon and paired with the lifetime view. Sourced.
6. **Statin reference table.** Intensity/potency and when each is indicated.
   Informational, sourced.

**Landing (`/`)** — minimal for MVP: a short intro, a clear link into `/heart`, and a
**Pillar 0 — Foundations (nutrition, exercise, sleep)** entry marked *(coming soon)*.
Fuller longevity suggestions come later.

**Deferred (post-MVP):** the `/metabolism` page (HOMA-IR, TG/HDL ratio,
metabolic-syndrome criteria) — see §13.

## 8. Testing

- **Vitest unit tests on `src/lib/calculators/*`** — the correctness boundary.
  Each validated formula is tested against **published worked examples** (known
  inputs → known expected outputs) from its source paper, within a tolerance.
- The `apoBYears` AUC integration (and its threshold comparison) is tested against
  hand-computed trajectories; ApoB and Lp(a) tier boundaries are tested at their
  cut-points.
- **UI tests kept minimal** (YAGNI). A passing `astro build` is part of routine
  verification.

## 9. Deployment (Cloudflare Workers)

- Connected to Cloudflare via the GitHub integration (Workers Builds): **every push
  to `main` auto-builds and deploys**. (`origin/cloudflare/workers-autoconfig`,
  merged 2026-06-18, added this config.)
- Build via the **`@astrojs/cloudflare` adapter**: `npm run build` prerenders to
  `dist/` and emits a `_worker.js` for asset serving; config in `wrangler.jsonc`
  (assets→`dist`, `nodejs_compat`). `public/.assetsignore` excludes `_worker.js`.
- `output` stays default (**static**): pages are prerendered HTML; calculators are
  client-side Svelte islands. No SSR app logic.
- Node **24** (`.nvmrc`). Custom domain **`health.jcamino.net`** in the Cloudflare
  dashboard (DNS already on Cloudflare).
- Local: `npm run preview` (build + `wrangler dev`); `npm run deploy` for manual deploy.

## 10. Tooling & quality

- TypeScript everywhere; Prettier (with Astro/Svelte plugins) for formatting.
- `README.md` documenting `npm run dev`, `npm run build`, `npm test`, and the
  Cloudflare settings above.
- ESLint optional — start without it to stay lean; add if needed.

## 11. Alternatives considered

- **Eleventy + vanilla JS** — great SSG and Markdown, but no component-hydration
  model; interactive widgets get hand-wired and embedding them in content is
  clunkier. Fine for a couple of static calculators; weaker as widgets become
  interactive.
- **Plain HTML/CSS/JS, no build** — simplest to deploy, but loses Markdown
  authoring, duplicates layout/nav across pages, and makes everything manual.
  Fights a content-heavy, multi-page, charts-included site.
- **Next.js / SvelteKit** — overkill for static-only; their SSR/server machinery
  is unused weight. (YAGNI.)
- **Preact / vanilla islands instead of Svelte** — viable; Svelte chosen for the
  most concise reactive forms and smallest output. Revisitable per-widget.
- **Observable Plot / uPlot instead of Chart.js** — Chart.js chosen for
  approachability and good area/line support; Observable Plot is the upgrade path
  if richer statistical graphics are wanted later.

## 12. References to verify & pin during implementation

Every entry below must be resolved to a real, verified URL/DOI in `references.ts`
before the corresponding calculator ships (per §5). Candidate sources by topic:

- **Cumulative ApoB/LDL exposure → atherosclerosis** (the ApoB-years thesis):
  Ference et al. (Mendelian randomization of cumulative LDL exposure); Sniderman
  et al. on ApoB as the primary atherogenic measure.
- **Cumulative-exposure threshold** (the hero chart's reference line): source for
  the ~5,000 mg·years LDL-C anchor and its ApoB-equivalent value/units.
- **ApoB optimal/target thresholds**: relevant lipid guideline(s) and
  plaque-regression evidence.
- **Lp(a)**: consensus statement(s) defining high-risk cut-points (mg/dL and
  nmol/L) and establishing independent causality.
- **Blood pressure categories**: 2017 ACC/AHA high blood pressure guideline
  (Whelton et al.) defining normal / elevated / stage 1 / stage 2 thresholds.
- **10-year risk**: AHA PREVENT equations (Khan SS et al., Circulation 2024) — now
  pinned in `references.ts` as `preventEquations2024` (and any lifetime-risk
  companion used).
- **Statin intensity/indications**: guideline statin-intensity table.
- **Metabolic markers** *(post-MVP)*: HOMA-IR original description; TG/HDL ratio
  evidence; metabolic-syndrome diagnostic criteria.

## 13. Open questions / future

- **`/metabolism` page (deferred from MVP):** HOMA-IR, TG/HDL ratio, and
  metabolic-syndrome criteria — then expand (CGM concepts, fasting insulin, etc.).
- Add a lifetime ASCVD estimate alongside the 10-year score?
- Fuller longevity-suggestions content on the landing page.
- **Pillar 0 — Foundations page (nutrition, exercise, sleep):** shown as *(coming
  soon)* on the landing now; build the page later.
- Possible future pillars (e.g., fitness/VO₂max) as additional routes.

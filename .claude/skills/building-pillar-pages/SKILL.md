---
name: building-pillar-pages
description: Use when creating or fleshing out a content/"pillar" page (metabolism, brain, cancer, foundations, etc.) on the health.jcamino.net Astro site, including its interactive widgets and deployment.
---

# Building pillar pages

## Overview

A "pillar" page is an **MDX file in `src/pages/<pillar>.mdx`** that uses `BaseLayout`
(via frontmatter), mixes static prose with **interactive Svelte 5 islands** (the
calculators), and cites everything. `src/pages/heart.mdx` and `src/pages/metabolism.mdx`
are the canonical, complete examples — copy their structure.

**REQUIRED SUB-SKILL:** build each calculator first with adding-sourced-calculator
(pure tested module + verified citation). Widgets only bind to those.

## Stack facts (don't relearn these)

- Astro 5, **static output**, deployed to **Cloudflare Workers** via
  `@astrojs/cloudflare`. Build = `npm run build` → `dist/`. Node 24.
- **Svelte 5 runes only**: `$state`, `$derived`, `$derived.by`, `$effect`, `$props`,
  `onclick=`. NEVER `export let` or `on:click`.
- Tailwind v4, class-based dark mode (`dark:` works via the `.dark` toggle). Wrap
  widgets in `not-prose` so the page's `prose` typography doesn't restyle them.
- Charts: Chart.js, inside the island (client-only).
- Shared UI: `src/components/ui/Sources.svelte` (renders `Reference[]`),
  `Citation.astro` (inline `<Citation id="..." />`), `Disclaimer.astro` (already in
  the footer via `BaseLayout` — do not re-add it).

## Workflow

### 1. Build the calculators
adding-sourced-calculator for each. Done when `npm test` is green.

### 2. Write the widget(s) — `src/components/calculators/<Name>.svelte`

Svelte 5 island. The guard is the key: it must be the **logical negation of the pure
function's throw conditions** (finite + in range), so a cleared field shows a message
instead of NaN or a thrown error.

```svelte
<script lang="ts">
  import { bpCategory, sources } from '../../lib/calculators/bloodPressure';
  import Sources from '../ui/Sources.svelte';

  let systolic = $state(120);
  let diastolic = $state(80);
  const result = $derived(
    Number.isFinite(systolic) && Number.isFinite(diastolic) && systolic > 0 && diastolic > 0
      ? bpCategory(systolic, diastolic)
      : null,
  );
  const color: Record<string, string> = {
    normal: 'text-emerald-600', elevated: 'text-yellow-600',
    'stage-1': 'text-orange-600', 'stage-2': 'text-red-600', crisis: 'text-red-700',
  };
</script>

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <div class="flex flex-wrap items-end gap-3">
    <label class="text-sm font-medium">Systolic (mmHg)
      <input type="number" min="0" max="300" bind:value={systolic}
        class="mt-1 block w-28 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm font-medium">Diastolic (mmHg)
      <input type="number" min="0" max="200" bind:value={diastolic}
        class="mt-1 block w-28 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
  </div>
  {#if result}
    <p class="mt-3">Category: <span class={`font-semibold ${color[result.category]}`}>{result.label}</span></p>
  {/if}
  <Sources {sources} />
</div>
```

**Charts** — see `ApoBExposure.svelte`. Non-obvious musts:
- `<canvas>` in a fixed-height container (`class="h-64"`) + `maintainAspectRatio: false`.
- x axis `type: 'linear'` with `{ x, y }` data — a category axis duplicates labels
  and spaces points evenly (wrong for ages/time).
- For a curved/integral quantity (cumulative exposure), **sample finely** (e.g.
  yearly): two breakpoints draw a straight chord and hide the curvature.
- `onMount` create the chart, `$effect` re-render on data change, `onDestroy` destroy.
- If a widget can take a proxy input (e.g. LDL→ApoB), merge the conversion's
  `sources` into the displayed list so the conversion is cited too.

### 3. Write the page — `src/pages/<pillar>.mdx`

```mdx
---
layout: ../layouts/BaseLayout.astro
title: "Metabolism: insulin resistance and visceral fat"
description: "..."
---
import HomaIr from '../components/calculators/HomaIr.svelte';
import Citation from '../components/ui/Citation.astro';

# Heading that frames the lifetime/prevention angle

Prose. Cite factual claims inline <Citation id="someRegistryId" />.

## A section

<HomaIr client:visible />

A sentence of context after the widget.

> Educational only. See the disclaimer below before acting on any of this.
```

- `client:visible` on every interactive widget (essential for Chart.js islands).
- `<Citation id="..." />` reads `references.ts`; the id **must** exist there.
- The disclaimer (with the preventive-cardiologist Google Maps link) is already in
  the footer via `BaseLayout` — just close with a one-line "educational only" note.

### 4. Link it from the landing page
Edit `src/pages/index.mdx` Pillars list: change the pillar from `*(coming soon)*` to a
real link `[Pillar N — X](/x)`. Add a nav link in `BaseLayout.astro` if it should be
top-level.

### 5. Verify (always, before pushing)
```
npm test            # all green
npx astro check     # 0 errors
npm run build       # PASS; dist/<pillar>/index.html exists
```
Then grep the built page to confirm rendering: section headings, each widget's island
script (e.g. `grep <Name> dist/<pillar>/index.html`), each `<Sources>` block, and the
citation DOIs.

### 6. Deploy
Commit on `main`, **one commit per calculator as you finish it** (so progress survives
an interruption — important when a long build may be cut off). **Push only at
functional milestones** — Cloudflare allows ~500 builds/month and every push to `main`
triggers a build. Batch related commits; push once the page is complete and verified.
(Project memory: `push-to-main-workflow`, `cloudflare-workers-deploy`.)

## Quick reference

| Thing | Where / copy from |
| --- | --- |
| Page | `src/pages/<pillar>.mdx` (copy `heart.mdx`) |
| Simple widget | `src/components/calculators/<Name>.svelte` (copy `BloodPressure.svelte`) |
| Chart widget | copy `ApoBExposure.svelte` (linear axis, fine sampling, h-64) |
| Calculator + test + citation | adding-sourced-calculator |
| Inline citation / source list | `<Citation id>` / `<Sources sources={...} />` |
| Landing pillar list | `src/pages/index.mdx` |
| Disclaimer | already in `BaseLayout.astro` footer |

## Common mistakes

- Widget shows NaN or throws on a cleared field → add the finite/range `$derived`
  guard (the negation of the pure fn's throw conditions).
- Chart looks flat/straight for a rising quantity → linear x-axis + fine yearly
  sampling, not 2 breakpoints.
- Forgot `client:visible` → the widget renders static, no interactivity.
- Forgot `not-prose` → the page's typography mangles the widget.
- Re-added the disclaimer → it's already in the footer.
- Used `export let` / `on:click` → Svelte 5 runes only.
- Pushed every commit → burns the build budget; push at milestones.

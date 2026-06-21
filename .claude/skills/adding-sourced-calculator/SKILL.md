---
name: adding-sourced-calculator
description: Use when adding any medical/risk calculator, score, tier, category, threshold, ratio, conversion, or numeric health formula to the health.jcamino.net site (e.g. for a new pillar page or widget).
---

# Adding a sourced calculator

## Overview

Every numeric health claim on this site is a **pure TypeScript function** in
`src/lib/calculators/` that is **unit-tested** and **carries a verified citation**.
UI (Svelte) holds zero medical logic — it calls these functions and renders the
result plus a `<Sources>` block. This separation is the project's core invariant:
**a calculator cannot ship without its sources.**

**The non-negotiable rule: every number is sourced. Never fabricate a coefficient,
threshold, cut-point, conversion factor, or DOI.** If you cannot verify it against a
real source, do not ship it — report BLOCKED.

## When to use

- Adding a risk score, tier classifier, category, ratio, conversion, or any
  threshold/coefficient that will appear on the site.
- Building the data layer for a new page — do this **before** the widget (see
  building-pillar-pages).

## The three files you touch

1. `src/lib/references.ts` — add + verify the citation(s).
2. `tests/<name>.test.ts` — the failing test, written FIRST.
3. `src/lib/calculators/<name>.ts` — the pure module.

(Plain reference-data modules live directly in `src/lib/` and import `./references`;
formula modules live in `src/lib/calculators/` and import `../references`.)

## Step 1 — Add + VERIFY the citation in `references.ts`

`refs` is one object `satisfies Record<string, Reference>` (this preserves literal
keys so `ReferenceId` is a union; `getRef(id)` powers MDX `<Citation>`). Every entry
needs a real `url` in `https://doi.org/<doi>` form.

```ts
accAhaBp2017: {
  id: 'accAhaBp2017',
  title: '2017 ACC/AHA Guideline ... High Blood Pressure in Adults',
  authors: 'Whelton PK, et al.',
  year: 2018,
  source: 'Hypertension',
  url: 'https://doi.org/10.1161/HYP.0000000000000065',
  doi: '10.1161/HYP.0000000000000065',
},
```

**Verify it resolves.** Try WebFetch on the DOI / WebSearch the exact title.
Publisher pages (AHA/EAS/Springer) and PubMed itself frequently 403 / CAPTCHA bots.
When they do, verify authoritatively via the **NCBI E-utilities API** (no CAPTCHA) —
WebFetch `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=<title-or-DOI>`
for the PMID, then `.../esummary.fcgi?db=pubmed&id=<PMID>&retmode=json` for structured
title/journal/year/DOI. Confirm the DOI redirects to the correct publisher host.
Never invent a DOI.

## Step 2 — Write the failing test FIRST (`tests/<name>.test.ts`)

Vitest. Run `npx vitest run tests/<name>.test.ts` and confirm it fails with
"Cannot find module" (failing for the right reason) before implementing. Cover:
representative inputs, **exact boundaries**, validation throws, `sources` non-empty,
and — **for a published equation — reproduce a published worked example within
tolerance** (this is the correctness gate).

```ts
import { describe, it, expect } from 'vitest';
import { bpCategory, sources } from '../src/lib/calculators/bloodPressure';

describe('bpCategory (ACC/AHA 2017)', () => {
  it('classifies; higher of systolic/diastolic wins', () => {
    expect(bpCategory(118, 76).category).toBe('normal');
    expect(bpCategory(125, 82).category).toBe('stage-1'); // DBP drives it
    expect(bpCategory(150, 95).category).toBe('stage-2');
  });
  it('respects boundaries', () => {
    expect(bpCategory(129, 79).category).toBe('elevated');
    expect(bpCategory(130, 79).category).toBe('stage-1');
  });
  it('validates input and ships sources', () => {
    expect(() => bpCategory(0, 80)).toThrow();
    expect(sources.length).toBeGreaterThan(0);
  });
});
```

## Step 3 — Write the pure module (`src/lib/calculators/<name>.ts`)

Rules: typed I/O; `throw` on non-finite / out-of-range / non-physiologic input;
`export const sources: Reference[]`; import ONLY `../references`; no DOM, no Svelte,
no side effects.

Pick the matching pattern — copy from these real files:

| Pattern | Example | Shape |
| --- | --- | --- |
| Tier classifier | `apoB.ts` | descending `TIERS` array + `.find(v >= lower)` |
| Category ladder ("higher wins") | `bloodPressure.ts` | ordered `if / else if`, validated thresholds |
| Per-unit cut-points | `lpa.ts` | `Record<Unit, {...}>` — **never** interconvert units |
| Validated regression | `prevent.ts` | group coefficient constants + logistic; worked-example test |
| Sourced linear conversion | `apoBFromLipids.ts` | slope/intercept fit from a guideline's corresponding-goals table |
| Model + chart sampling | `exposure.ts` | breakpoints for exact area + `sampleTrajectory` for the curve |

Complete example (the category-ladder pattern):

```ts
import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.accAhaBp2017];

export type BpCategoryName = 'normal' | 'elevated' | 'stage-1' | 'stage-2' | 'crisis';
export interface BpCategory { category: BpCategoryName; label: string; }

const LABELS: Record<BpCategoryName, string> = {
  normal: 'Normal', elevated: 'Elevated',
  'stage-1': 'Stage 1 hypertension', 'stage-2': 'Stage 2 hypertension',
  crisis: 'Hypertensive crisis',
};

/** ACC/AHA 2017. When systolic/diastolic disagree, the HIGHER category applies. */
export function bpCategory(systolic: number, diastolic: number): BpCategory {
  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic) || systolic <= 0 || diastolic <= 0) {
    throw new Error(`bpCategory: invalid reading ${systolic}/${diastolic}`);
  }
  let category: BpCategoryName;
  if (systolic > 180 || diastolic > 120) category = 'crisis';
  else if (systolic >= 140 || diastolic >= 90) category = 'stage-2';
  else if (systolic >= 130 || diastolic >= 80) category = 'stage-1';
  else if (systolic >= 120) category = 'elevated'; // diastolic < 80 guaranteed here
  else category = 'normal';
  return { category, label: LABELS[category] };
}
```

## Step 4 — Verify

```
npx vitest run tests/<name>.test.ts   # red → green
npm test                              # whole suite green
npx astro check                       # 0 errors
```

## The sourcing discipline (the hard part)

- **Primary source first.** Find the paper/guideline, add it, WebFetch the DOI to
  confirm it resolves to that exact work.
- **Bot-blocked (403/CAPTCHA)?** Verify the *citation* via NCBI E-utilities (Step 1).
  For the *numbers* (coefficients/thresholds) when the source PDF is unreadable, use a
  peer-reviewed transcription (a CRAN package, a guideline's "corresponding goals"
  table, StatPearls) — still cite the primary source, and report what you used + the
  anchor numbers you derived/checked.
- **Validated equation → worked-example gate.** Do not ship until the function
  reproduces a published example (or the official calculator's output) within a stated
  **tolerance** — assert `Math.abs(got - expected) <= tol`, not exact equality.
  Published values are pre-rounded and floats bite (e.g. `28.7×6 − 46.7 = 125.4999…`,
  so `Math.round` gives 125, not the table's 126 — assert ±1). No worked example
  obtainable → report **BLOCKED**, don't approximate.
- **Illustrative ≠ validated.** Label teaching illustrations as such in the code
  comment AND the UI (e.g. the cumulative-exposure threshold is LDL-C-derived, not
  ApoB-specific). Never dress an illustration up as a clinical score.
- **Population/assay-dependent cut-points** (HOMA-IR, TG/HDL ratio, waist
  circumference, etc.): cite the *specific* population/assay the cut-point came from,
  label it approximate in code + UI, expose a population option where one exists
  (e.g. waist: US AHA/NHLBI vs IDF-Europid), and frame it as a trend, not a hard
  diagnosis.
- **Historical / qualitative claims** still need a citation — use a peer-reviewed
  review (e.g. `hypertensionHistory2011`).
- **Prefer current, equitable models** — this site uses AHA PREVENT 2024 (race-free),
  not the race-based Pooled Cohort Equations.

## Common mistakes

- Fabricating a coefficient/DOI "to fill it in" → never; BLOCK instead.
- Interconverting mg/dL ↔ nmol/L (Lp(a)) → use per-unit cut-points.
- Putting math in the widget → all logic lives here, pure + tested.
- Skipping the worked-example test for a published equation.
- Forgetting to export `sources` → the widget's `<Sources>` renders empty.

## Red flags — STOP

- "I'll just estimate the coefficient." → find the source or BLOCK.
- "The DOI is probably right." → WebFetch and confirm.
- "It's basically a clinical score." (for an illustration) → label it illustrative.

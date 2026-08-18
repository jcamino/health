# Heart hero: years over the line — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-track exposure hero on `/heart/` with four lifetime bars showing how much of an eighty-year span each ApoB level spends past the cumulative-exposure threshold — from the top of a lab's normal range (42 years) down to the guideline's strictest goal (0).

**Architecture:** A zero-JS Astro component reads two pure functions and one sourced constant at build time. The new cut-point (ApoB 130) is added to `references.ts` and `apoB.ts` with a verified citation, because the project forbids any unsourced number. Bars are HTML + CSS, not SVG, so labels stay real text; the fill animates with a CSS transform only.

**Tech Stack:** Astro 5 · MDX · Tailwind CSS v4 · TypeScript (strict) · Vitest. No new dependencies.

**Source spec:** `docs/superpowers/specs/2026-08-18-heart-hero-years-over-line-design.md`

---

## Before you start

**The citation is already verified. Do not re-verify or substitute it.** The spec records the NCBI E-utilities check (DOI `10.3390/diagnostics13203194` → PMID 37892015 → esummary confirming title, journal, year, volume, issue). Use exactly the entry given in Task 1.

**Every number in this plan comes from the model or that citation.** If you find yourself wanting a number that is neither, stop and report BLOCKED — adding one is governed by the project's `adding-sourced-calculator` skill and is outside this plan.

### Gotchas that will cost you an hour each

**1. Never run `npm run build` or `npm run check` while `npm run dev` is running.** They share the Vite dep-optimisation cache; doing so leaves the dev server serving pages with Svelte islands silently missing from the HTML. It looks exactly like a rendering bug in your component. Kill the dev server first (`pgrep -fa "astro|vite"` to confirm it's dead).

**2. `.prose` rules are unlayered and beat `@layer components`.** The component root must keep `not-prose`. Do not add new `.prose <element>` rules.

**3. Do not run `npm run format` on the repo.** Prettier reflows JSX in MDX into block context and can split styled tags. Run prettier only on the specific files you touched, then re-check `git diff src/pages/`.

**4. The hero's fill is `position: absolute` inside the bar.** `left` is set inline from the model; `right: 0` is in the stylesheet. Do not set width inline — the animation scales the element, and a width plus a transform will fight.

### Taking screenshots

No Playwright package is installed, but the managed Chromium binary works standalone:

```bash
SHOT=/home/jcamino/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell
$SHOT --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --window-size=1280,1200 --screenshot=/tmp/heart.png \
  --virtual-time-budget=10000 http://localhost:4321/heart/
```

`--force-dark-mode` does **not** flip this site — the theme comes from `localStorage.theme`, read by an inline script in `BaseLayout.astro`. For dark mode, drop a temporary probe in `public/` and **delete it before committing**:

```html
<!-- public/__probe.html -->
<!doctype html>
<meta charset="utf-8" />
<script>
  const p = new URLSearchParams(location.search);
  localStorage.setItem("theme", p.get("theme") || "light");
  location.replace(p.get("to") || "/heart/");
</script>
```

Then screenshot `http://localhost:4321/__probe.html?theme=dark`.

---

## File Structure

| Path                               | Responsibility                                                        |
| ---------------------------------- | --------------------------------------------------------------------- |
| `src/lib/references.ts`            | **Modify.** Add the verified Choi 2023 entry                          |
| `src/lib/calculators/apoB.ts`      | **Modify.** Export the reference-interval upper limit; add its source |
| `tests/apoB.test.ts`               | **Modify.** Pin the constant and its citation                         |
| `src/lib/calculators/exposure.ts`  | **Modify.** Add `yearsOverThreshold()`                                |
| `tests/exposure.test.ts`           | **Modify.** Unit tests for it                                         |
| `src/components/ExposureGap.astro` | **Rewrite.** Same filename, same placement, new device                |
| `src/styles/global.css`            | **Modify.** Replace the `.gap-*` block (currently lines 348–435)      |
| `src/pages/heart.mdx`              | **Modify.** Fold prose gains the 130 figure and its citation          |

---

## Task 1: Add the sourced reference-interval constant

The 130 mg/dL figure is a cut-point, so it lives in the pure layer with its citation rather than being typed into the component.

**Files:**

- Modify: `src/lib/references.ts`
- Modify: `src/lib/calculators/apoB.ts`
- Test: `tests/apoB.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `tests/apoB.test.ts`:

```ts
describe("APOB_REFERENCE_INTERVAL_UPPER_MGDL", () => {
  it("is the top of a typical laboratory reference interval", () => {
    expect(APOB_REFERENCE_INTERVAL_UPPER_MGDL).toBe(130);
  });

  it("stays inside the reference intervals its source reports", () => {
    expect(APOB_REFERENCE_INTERVAL_UPPER_MGDL).toBeGreaterThanOrEqual(129);
    expect(APOB_REFERENCE_INTERVAL_UPPER_MGDL).toBeLessThanOrEqual(134);
  });

  it("lands in this site's very-high tier, which is the hero's whole point", () => {
    expect(apoBTier(APOB_REFERENCE_INTERVAL_UPPER_MGDL).tier).toBe("very-high");
  });

  it("carries the reference-interval citation", () => {
    expect(referenceIntervalSources.map((s) => s.id)).toContain(
      "choiApoBReferenceInterval2023",
    );
  });
});
```

The bounds test is the one that matters: it ties the round 130 to the intervals the cited study actually reports, so someone later "rounding" to 120 or 140 breaks the build rather than quietly drifting from the source.

Update the import at the top of the same file to add the new names:

```ts
import {
  apoBTier,
  apoBBands,
  sources,
  referenceIntervalSources,
  APOB_REFERENCE_INTERVAL_UPPER_MGDL,
} from "../src/lib/calculators/apoB";
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd ~/health && npx vitest run tests/apoB.test.ts`
Expected: FAIL — the constant and `referenceIntervalSources` are both undefined, so the value, bounds and tier assertions fail and the citation lookup throws.

- [ ] **Step 3: Add the verified citation**

In `src/lib/references.ts`, add this entry to the `refs` object, immediately after the `verve102BaseEditing2026` entry (the last one in the object):

```ts
  choiApoBReferenceInterval2023: {
    id: "choiApoBReferenceInterval2023",
    title:
      "Exploring Utilization and Establishing Reference Intervals for the Apolipoprotein B Test in the Korean Population",
    authors: "Choi R, et al.",
    year: 2023,
    source: "Diagnostics (Basel)",
    url: "https://doi.org/10.3390/diagnostics13203194",
    doi: "10.3390/diagnostics13203194",
  },
```

- [ ] **Step 4: Export the constant**

**Leave the existing `sources` array alone.** `ApoBTier.svelte` imports it and renders it through `<Sources {sources} />`, and that widget ships on both `heart.mdx` and `brain.mdx`. Adding this citation there would list a lab reference-interval study as a source for tier boundaries it has nothing to do with, on two pages. Give it its own export instead.

Append to the end of `src/lib/calculators/apoB.ts`:

```ts
/** Source for the laboratory reference interval below — not for the tier boundaries. */
export const referenceIntervalSources: Reference[] = [
  refs.choiApoBReferenceInterval2023,
];

/**
 * Upper limit of a typical laboratory ApoB reference interval (mg/dL) — roughly
 * the point above which a standard panel starts flagging the result. Reference
 * intervals are laboratory- and assay-dependent; this is a representative round
 * figure from the cited study's parametric (mean ± 2 SD) intervals of 46–134
 * mg/dL in men and 49–129 mg/dL in women, measured in 334 Korean adults
 * attending routine health checks who had otherwise normal conventional lipids.
 * That narrow base is why the page says "a standard lab's normal range" and
 * never "the normal range".
 */
export const APOB_REFERENCE_INTERVAL_UPPER_MGDL = 130;
```

Naming the population is required by the project's `adding-sourced-calculator` skill, and matches how `homaIr.ts` names the Spanish EPIRCE cohort and `tgHdlRatio.ts` names insulin-resistant overweight adults.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd ~/health && npx vitest run tests/apoB.test.ts`
Expected: PASS, all describes green.

- [ ] **Step 6: Commit**

```bash
cd ~/health && npx prettier --write src/lib/references.ts src/lib/calculators/apoB.ts tests/apoB.test.ts
git add src/lib/references.ts src/lib/calculators/apoB.ts tests/apoB.test.ts
git commit -m "feat: source the top of a standard lab's ApoB reference interval"
```

---

## Task 2: Count the years spent over the threshold

**Files:**

- Modify: `src/lib/calculators/exposure.ts`
- Test: `tests/exposure.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `tests/exposure.test.ts`:

```ts
describe("yearsOverThreshold", () => {
  it("counts the years past the threshold inside the drawn span", () => {
    expect(yearsOverThreshold(130)).toBeCloseTo(41.54, 1);
    expect(yearsOverThreshold(110)).toBeCloseTo(34.55, 1);
    expect(yearsOverThreshold(90)).toBeCloseTo(24.44, 1);
  });

  it("renders as the four integers the hero draws", () => {
    const drawn = [130, 110, 90, 55].map((apoB) =>
      Math.round(yearsOverThreshold(apoB)),
    );
    expect(drawn).toEqual([42, 35, 24, 0]);
  });

  it("returns zero when the level never crosses inside the span", () => {
    expect(yearsOverThreshold(55)).toBe(0);
  });

  it("treats zero as 'not within this span' rather than a floor", () => {
    expect(yearsOverThreshold(55, 100)).toBeGreaterThan(0);
  });

  it("falls as ApoB falls", () => {
    expect(yearsOverThreshold(110)).toBeGreaterThan(yearsOverThreshold(90));
  });

  it("rejects a non-positive ApoB", () => {
    expect(() => yearsOverThreshold(0)).toThrow();
  });
});
```

Add the new name to the existing import block at the top of that file:

```ts
import {
  buildTrajectory,
  sampleTrajectory,
  apoBYears,
  cumulativeSeries,
  ageAtThreshold,
  ageAtThresholdForFlatApoB,
  yearsOverThreshold,
  CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS,
  sources,
} from "../src/lib/calculators/exposure";
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd ~/health && npx vitest run tests/exposure.test.ts`
Expected: FAIL — `yearsOverThreshold is not a function`.

- [ ] **Step 3: Implement it**

Append to `src/lib/calculators/exposure.ts`:

```ts
/**
 * How many of a drawn `span` of years are spent past the cumulative-exposure
 * threshold, for a lifelong-flat ApoB integrated from birth. Returns 0 when the
 * level does not cross inside the span — which is a statement about the drawn
 * span, not a claim of immunity, and is why the hero's caption says so. Rounding
 * for display is the caller's job.
 */
export function yearsOverThreshold(apoB: number, span = 80): number {
  const age = ageAtThresholdForFlatApoB(apoB, span);
  return age === null ? 0 : span - age;
}
```

`ageAtThresholdForFlatApoB` already throws on a non-positive ApoB and on a non-positive span (via `buildTrajectory`), so the guard test passes without extra validation.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd ~/health && npx vitest run tests/exposure.test.ts`
Expected: PASS, all describes green.

- [ ] **Step 5: Commit**

```bash
cd ~/health && npx prettier --write src/lib/calculators/exposure.ts tests/exposure.test.ts
git add src/lib/calculators/exposure.ts tests/exposure.test.ts
git commit -m "feat: count the years a flat ApoB spends over the exposure threshold"
```

---

## Task 3: Rewrite the hero component

**Files:**

- Rewrite: `src/components/ExposureGap.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Replace the component**

Replace the **entire contents** of `src/components/ExposureGap.astro` with:

```astro
---
// The heart page's thesis, drawn: four ApoB levels, each as a lifetime from
// birth to 80, with the years spent past the cumulative-exposure threshold
// filled in. The top two are levels a standard panel waves through; the bottom
// one never fills. Every figure is computed from the sourced, unit-tested model
// at build time, so the graphic cannot drift from the prose that cites it.
import {
  ageAtThresholdForFlatApoB,
  yearsOverThreshold,
} from "../lib/calculators/exposure";
import { APOB_REFERENCE_INTERVAL_UPPER_MGDL } from "../lib/calculators/apoB";

const SPAN = 80; // years, the drawn lifetime

interface Bar {
  apoB: number;
  note: string;
  age: number | null;
  startPct: number | null;
  years: number;
}

const bars: Bar[] = [
  {
    apoB: APOB_REFERENCE_INTERVAL_UPPER_MGDL,
    note: "the top of a standard lab's normal range",
  },
  { apoB: 110, note: "a typical adult level" },
  { apoB: 90, note: "the guideline's most lenient goal" },
  { apoB: 55, note: "the guideline's strictest goal" },
].map((level) => {
  const age = ageAtThresholdForFlatApoB(level.apoB, SPAN);
  return {
    ...level,
    age,
    startPct: age === null ? null : (age / SPAN) * 100,
    years: Math.round(yearsOverThreshold(level.apoB, SPAN)),
  };
});

// The fold "Why 'normal' on a lab panel is already too high" quotes these three
// ages. If the model ever moves them the page would contradict itself, so fail
// the build rather than ship the mismatch. Fix the prose, never the graphic.
const QUOTED_AGES: ReadonlyArray<[number, number]> = [
  [130, 38],
  [110, 45],
  [90, 56],
];
for (const [apoB, quoted] of QUOTED_AGES) {
  const age = ageAtThresholdForFlatApoB(apoB, SPAN);
  const actual = age === null ? "never" : String(Math.round(age));
  if (actual !== String(quoted)) {
    throw new Error(
      `ExposureGap: ApoB ${apoB} now crosses at ${actual}, but the heart page prose says ${quoted}.`,
    );
  }
}

// Branch on `age`, never on the rounded count. A level that crosses at 79.9
// rounds to zero years over, and captioning that "never crosses" would
// contradict the tick drawn at 80. None of the four shipped levels hits that
// window, but the wording should not depend on that staying true.
const summary = bars
  .map((b) =>
    b.age === null
      ? `ApoB ${b.apoB}, ${b.note}, never crosses within ${SPAN} years`
      : `ApoB ${b.apoB}, ${b.note}, spends about ${b.years} years over the line`,
  )
  .join("; ");
---

<figure class="gap not-prose">
  {
    /* role=img on the plot only: the caption below must stay readable text,
      which it would not be if the whole figure collapsed to a single label. */
  }
  <div
    class="gap-plot"
    role="img"
    aria-label={`Years spent over the cumulative-exposure threshold, out of ${SPAN}. ${summary}.`}
  >
    <p class="gap-head">Years over<br />the line</p>
    {
      bars.map((b, i) => (
        <div class="gap-row">
          <p class="gap-key">
            <b>ApoB {b.apoB}</b>
            <span>{b.note}</span>
          </p>
          <div class="gap-bar">
            {b.startPct !== null && (
              <span
                class="gap-fill"
                style={`left:${b.startPct}%;animation-delay:${i * 140}ms`}
              />
            )}
          </div>
          <p class="gap-count" data-empty={b.years === 0}>
            {b.years}
          </p>
        </div>
      ))
    }
    <div class="gap-axis">
      <span class="gap-axis-start">Birth</span>
      {
        bars.map((b) =>
          b.age === null || b.startPct === null ? null : (
            <span class="gap-tick" style={`left:${b.startPct}%`}>
              {Math.round(b.age)}
            </span>
          ),
        )
      }
      <span class="gap-axis-end">{SPAN}</span>
    </div>
  </div>
  <figcaption class="gap-caption">
    "The line" is ~5,000 mg·years of cumulative exposure — the illustrative
    marker of plaque burden at which events typically begin — out of a drawn
    lifetime of eighty. Risk rises continuously, so crossing it is not an
    appointment and an empty bar is not immunity.
  </figcaption>
</figure>
```

- [ ] **Step 2: Replace the styles**

In `src/styles/global.css`, delete the whole existing exposure-gap block — it starts at the comment `/* ---- The exposure gap ---` and ends with the closing brace of `.gap-caption`, immediately before the `/* ---- The slip ---` comment. Replace it with:

```css
/* ---- Years over the line ---------------------------------------------
     Four ApoB levels, each drawn as a lifetime from birth to 80, with the years
     spent past the cumulative-exposure threshold filled in. The count in the
     right gutter is the headline. The fill wipes in on load; the default state
     is the finished state, so reduced-motion users never see empty bars. */
.gap {
  margin: 2.5rem 0;
}

.gap-head {
  width: 3.5rem;
  margin: 0 0 0.9rem auto;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-rule);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  line-height: 1.35;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: right;
  color: var(--color-ink-faint);
}

.gap-row {
  display: grid;
  grid-template-columns: 1fr 3.5rem;
  column-gap: 1rem;
  align-items: center;
}

.gap-row + .gap-row {
  margin-top: 1.35rem;
}

.gap-key {
  grid-column: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 0.5rem;
  margin-bottom: 0.4375rem;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.gap-key b {
  font-weight: 500;
  color: var(--color-ink);
}

/* The lifetime. The outline is the drawn span; the fill is the part of it
     spent past the threshold. */
.gap-bar {
  grid-column: 1;
  position: relative;
  height: 1.5rem;
  border: 1px solid var(--color-rule);
}

.gap-fill {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background: var(--color-blood);
  opacity: 0.85;
}

.gap-count {
  grid-column: 2;
  grid-row: 1 / span 2;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 1.0625rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--color-blood);
}

.gap-count[data-empty="true"] {
  color: var(--color-ink-muted);
}

/* Aligned to the bars, not the gutter: same right inset as the count column. */
.gap-axis {
  position: relative;
  height: 1.15rem;
  margin: 0.8rem calc(3.5rem + 1rem) 0 0;
  border-top: 1px solid var(--color-rule);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
}

.gap-axis span {
  position: absolute;
  top: 0.4rem;
  line-height: 1;
}

.gap-axis-start {
  left: 0;
}

.gap-axis-end {
  right: 0;
}

.gap-tick {
  transform: translateX(-50%);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-blood);
}

.gap-caption {
  max-width: 64ch;
  margin-top: 1.1rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
}

@keyframes gap-fill {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* Applied only under no-preference, so the rendered default is the finished
     state. Animating by default and disabling it inside a `reduce` query would
     flash empty bars at exactly the users who asked for less motion. */
@media (prefers-reduced-motion: no-preference) {
  .gap-fill {
    transform-origin: left center;
    animation: gap-fill 900ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
  }
}

@media (max-width: 40rem) {
  .gap-head {
    display: none;
  }

  .gap-row {
    grid-template-columns: 1fr auto;
    column-gap: 0.75rem;
  }

  .gap-key {
    grid-column: 1;
    grid-row: 1;
    margin-bottom: 0;
  }

  .gap-count {
    grid-column: 2;
    grid-row: 1;
    font-size: 0.9375rem;
  }

  .gap-count::after {
    content: " yrs over";
    letter-spacing: 0.06em;
  }

  .gap-bar {
    grid-column: 1 / -1;
    grid-row: 2;
    height: 1.375rem;
    margin-top: 0.4375rem;
  }

  .gap-axis {
    margin-right: 0;
  }

  /* The crossing ticks collide below ~640px; 38 and 45 are seven years apart. */
  .gap-tick {
    display: none;
  }
}
```

- [ ] **Step 3: Verify it compiles**

Confirm no dev server is running (`pgrep -fa "astro|vite" || true`), then run: `cd ~/health && npm run check`
Expected: `0 errors`, `0 warnings`, `0 hints`.

- [ ] **Step 4: Commit**

```bash
cd ~/health && npx prettier --write src/components/ExposureGap.astro src/styles/global.css
git add src/components/ExposureGap.astro src/styles/global.css
git commit -m "feat: rebuild the hero as years over the line"
```

---

## Task 4: Give the page the prose to defend the new figure

The hero now shows a number that appears nowhere in the text. The site's rule is that a number on screen is a number the page can defend, so the fold gains the figure and its citation.

**Files:**

- Modify: `src/pages/heart.mdx`

- [ ] **Step 1: Rewrite the fold's list**

In `src/pages/heart.mdx`, inside the `<details>` fold titled "Why 'normal' on a lab panel is already too high", find this passage:

```mdx
    Take two people a standard lab calls normal (illustrative, using the same
    cumulative-exposure model as the chart above against its 5,000 mg·years
    threshold):

    - An ApoB of **90 mg/dL**, exactly at the guideline's most lenient goal,
      crosses the lifetime-exposure threshold around **age 56**.
    - An ApoB of **110 mg/dL** crosses it around **age 45**, about a decade earlier.
```

Replace it with:

```mdx
    Take three people a standard lab calls normal (illustrative, using the same
    cumulative-exposure model as the chart above against its 5,000 mg·years
    threshold):

    - An ApoB of **130 mg/dL**, around the top of a typical lab reference
      interval <Citation id="choiApoBReferenceInterval2023" />, crosses the
      lifetime-exposure threshold around **age 38**.
    - An ApoB of **110 mg/dL** crosses it around **age 45**.
    - An ApoB of **90 mg/dL**, exactly at the guideline's most lenient goal,
      crosses it around **age 56** — still the best of the three, and still
      decades of accrued damage before anyone would call it a disease.

    Reference intervals vary by laboratory and assay; the study above reports
    46 to 134 mg/dL in men and 49 to 129 in women, which is why this page says
    "a standard lab's normal range" and never "the normal range."
```

Keep the four-space indentation — MDX treats these lines as part of the `<details>` block, and changing the indent will break the fold.

- [ ] **Step 2: Verify it compiles and formats cleanly**

```bash
cd ~/health && npm run check
npx prettier --check src/pages/heart.mdx
```

Expected: `0 errors` from check. If prettier complains, run `npx prettier --write src/pages/heart.mdx` **on that file only**, then `git diff src/pages/heart.mdx` and confirm it did not reflow any other part of the page (gotcha 3).

- [ ] **Step 3: Commit**

```bash
cd ~/health && git add src/pages/heart.mdx
git commit -m "content: cite where a lab's normal range actually tops out"
```

---

## Task 5: Verify the built page

**Files:** none modified — this task is verification only, plus deleting the temporary probe.

- [ ] **Step 1: Start the dev server and screenshot both themes**

```bash
cd ~/health && npm run dev   # leave running; do NOT run build/check against it
```

Create `public/__probe.html` from the recipe at the top of this plan, then capture four screenshots: light and dark at `--window-size=1280,1200`, and light and dark at `--window-size=390,1400`.

- [ ] **Step 2: Check each screenshot**

View every screenshot and confirm:

- The four counts read **42, 35, 24, 0** and the axis ticks read **38, 45, 56**.
- The fills start at roughly 48%, 57% and 69% of the bar width (ages 38.5, 45.5 and 55.6 of 80), and the bottom bar is empty.
- Both themes are legible and the oxblood flips with the theme; nothing is hardcoded.
- At 390px the ticks are gone, each count sits beside its label reading "42 yrs over", and nothing overflows horizontally.
- The lead paragraph above the hero is still visibly larger than body text — the hero sits after it, and the `.prose h1 + p` rule depends on that order.
- The action slip below is still readable as its own block rather than being drowned by the hero.

- [ ] **Step 3: Confirm the page agrees with itself**

The fold further down must print the same three ages the hero draws: **38**, **45**, **56**. The build-time assertion in the component enforces this, so a mismatch will already have failed the build — but confirm visually that the prose and the picture match.

- [ ] **Step 4: Full verification**

Kill the dev server and confirm it is dead (`pgrep -fa "astro|vite" || true`), then:

```bash
cd ~/health && npm run check    # expect 0 errors
cd ~/health && npm run build    # runs vitest via prebuild; expect 100+ tests passing, build Complete
```

- [ ] **Step 5: Confirm the hero still ships zero JavaScript**

```bash
cd ~/health && sed -n '/<figure class="gap/,/<\/figure>/p' dist/heart/index.html | grep -c "<script" || true
```

Expected: `0`.

- [ ] **Step 6: Delete the probe and commit**

```bash
cd ~/health && rm -f public/__probe.html
git status --short          # confirm no stray files
```

If `git status` is clean, there is nothing to commit and the work is done.

---

## Definition of done

- [ ] `APOB_REFERENCE_INTERVAL_UPPER_MGDL` exists, is unit-tested, and carries the Choi 2023 citation via its own `referenceIntervalSources` export — **not** in `apoB.ts`'s `sources`, which feeds the tier gauge's rendered citations on two pages.
- [ ] `yearsOverThreshold` exists, is unit-tested, and is the only source of the counts on screen.
- [ ] Exactly one new entry in `src/lib/references.ts`, with the DOI given in Task 1 and no other.
- [ ] The hero ships zero JavaScript (no `client:*`, no `<script>` in the built figure).
- [ ] The counts read 42 / 35 / 24 / 0 and the ticks read 38 / 45 / 56, in both themes, at 390px and 1280px.
- [ ] The fold prints the same three ages, with the reference-interval citation and its variability caveat.
- [ ] `npm run check` clean; `npm run build` green.
- [ ] `public/__probe.html` is gone.

## Out of scope

- The interactive `ApoBExposure.svelte` chart. It stays exactly where it is; this hero is not a replacement and must not duplicate its interactivity.
- Making the hero interactive.
- A page-wide rhythm pass beyond the hero.
- Re-examining the "a typical adult level" label on the 110 bar — it carries over unchanged from the shipped component.
- Any claim about the age at which plaque starts or the typical age at diagnosis.

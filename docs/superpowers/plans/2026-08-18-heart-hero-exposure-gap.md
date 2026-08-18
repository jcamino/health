# Heart Hero: the exposure gap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `/heart/` a hero graphic that draws the page's own thesis — "heart disease starts decades before the diagnosis" — as two lifetime exposure tracks whose crossing ages are computed from the site's already-sourced exposure model.

**Architecture:** A zero-JS Astro component (`ExposureGap.astro`) that calls a new pure function in `src/lib/calculators/exposure.ts` at build time. Rendered as HTML + CSS (not SVG or Chart.js) so labels stay real text that reflows and scales. Every number on it is derived from the existing unit-tested model, so the component cannot display an unsourced figure.

**Tech Stack:** Astro 5 · MDX · Tailwind CSS v4 · TypeScript (strict) · Vitest. No new dependencies.

**Source spec:** `docs/superpowers/specs/2026-06-18-health-site-design.md`

---

## Why this was deferred, and what unblocks it

This was scoped during the August 2026 design pass (commit `bfb1b1b`) and deliberately left out. The reason matters, because it constrains the whole design:

The page's thesis is a claim about **time** — damage accrues for decades before anything shows up. Drawing that means putting ages on a graphic. But this project's core invariant (see `.claude/skills/adding-sourced-calculator/SKILL.md`) is:

> **Every number is sourced. Never fabricate a coefficient, threshold, cut-point, conversion factor, or DOI.**

So a hero with hand-picked ages ("plaque starts ~20, diagnosis ~65") would need new verified citations, turning a styling task into a research task.

**What unblocks it:** the numbers are already in the codebase. `src/lib/calculators/exposure.ts` is unit-tested and carries five verified citations, and the heart page already publishes its output in prose. The fold "Why 'normal' on a lab panel is already too high" states:

- ApoB **90** mg/dL crosses the lifetime-exposure threshold around **age 56**
- ApoB **110** mg/dL crosses it around **age 45**, about a decade earlier

Those are outputs of `ageAtThreshold(buildTrajectory(...), 5000)`. Verified against the current model on 2026-08-18:

| ApoB (flat from birth) | Crossing age |
| ---------------------- | ------------ |
| 65                     | 76.92        |
| 90                     | 55.56        |
| 110                    | 45.45        |

So the hero visualises numbers the page already makes, from a function that already ships with its sources. **No new `references.ts` entries are required.** That is the entire reason this is now a small task.

**If you find yourself wanting to add a number that is not an output of this model — stop.** That is a different piece of work and needs the `adding-sourced-calculator` skill.

---

## Design constraints

The heart page was just rebuilt around a single loud element, the action slip (`.slip` in `src/styles/global.css`, rendered by `src/components/ThreeChecks.svelte`). The slip is the page's one bold block, and the hero **must not compete with it**.

- **Quiet in value, loud in meaning.** Hairline rules, mono labels, oxblood only on the two crossing markers. No fill, no card, no background tint — the tinted field is the slip's device.
- **Theme-aware via tokens only.** Use `var(--color-rule)`, `var(--color-blood)`, `var(--color-ink-muted)`. Never hardcode a hex; the tokens flip in `.dark` automatically.
- **Zero JavaScript.** It is a static diagram. Do not make it a Svelte island, do not add Chart.js. The interactive cumulative-exposure chart (`ApoBExposure.svelte`) stays where it is, mid-page — this hero is not a replacement for it and should not duplicate its interactivity.
- **Honest copy.** The page already hedges the threshold: "Crossing it is not an appointment with an event, and staying under it is not immunity; risk rises continuously." The hero's caption must carry that hedge. Do not let the graphic imply a cliff.

---

## File Structure

| Path                                    | Responsibility                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/lib/calculators/exposure.ts`       | **Modify.** Add `ageAtThresholdForFlatApoB()` — pure, keeps the model logic out of UI |
| `tests/exposure.test.ts`                | **Modify.** Unit tests for the new function                                           |
| `src/components/ExposureGap.astro`      | **Create.** The hero: markup + build-time call into the model                          |
| `src/styles/global.css`                 | **Modify.** `.gap-*` component styles, inside `@layer components`                      |
| `src/pages/heart.mdx`                   | **Modify.** Import and place the component                                             |

---

## Gotchas that will cost you an hour each

Read these before you start. All four were hit during the last pass.

**1. Custom `.prose` rules and `.not-prose`.** `global.css` styles bare elements under `.prose` (`.prose h2`, `.prose a`, …). Those rules are written unlayered, so they beat anything in `@layer components` on both specificity **and** layer order. Any component that carries its own heading or link must be excluded, and the existing rules already do this:

```css
.prose h2:not(:where(.not-prose, .not-prose *)) { … }
```

Put `not-prose` on the component's root element, and if you add a new `.prose <element>` rule, carry the same `:not(:where(…))` guard. Symptom if you get this wrong: a stray oxblood tick and a 3rem gap appear above your component's heading.

**2. The lead-paragraph rule is positional.** `global.css` has:

```css
.prose h1 + p:not(:where(.not-prose, .not-prose *)) { font-size: 1.1875rem; … }
```

If you insert the hero **between** the H1 and the first paragraph, that selector stops matching and the lead silently drops to body size. This plan places the hero *after* the lead paragraph for exactly that reason. If you decide to move it above, you must update the selector too.

**3. Do not run `npm run build` or `npm run check` while `npm run dev` is running.** They share the project's Vite dep-optimisation cache, and doing so leaves the dev server serving pages with Svelte islands silently missing from the HTML. It looks exactly like a rendering bug in your component. Kill the dev server first, or restart it after.

**4. `npm run format` is safe now** (the repo was formatted in commit `55792e2`), but `.mdx` is still the one risky target: prettier reflows JSX in MDX into block context and can split styled `<p>` tags. That is why styled markup lives in `.astro`/`.svelte` components rather than inline in the MDX. After any format, re-check `git diff src/pages/`.

---

## Taking screenshots

There is no Playwright package installed, but the Playwright-managed Chromium binary is on disk and works standalone:

```bash
SHOT=/home/jcamino/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell
$SHOT --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --window-size=1280,1200 --screenshot=/tmp/heart.png \
  --virtual-time-budget=10000 http://localhost:4321/heart/
```

`--force-dark-mode` does **not** flip this site — the theme comes from `localStorage.theme`, read by an inline script in `BaseLayout.astro`. To screenshot dark mode, drop a temporary probe in `public/` that sets the key and redirects, then **delete it before committing**:

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

## Task 1: Derive the crossing age from the model

Keeps the modelling decision (flat ApoB, integrated from birth) in the tested pure layer instead of the component, per the project's "UI holds zero medical logic" rule.

**Files:**

- Modify: `src/lib/calculators/exposure.ts`
- Test: `tests/exposure.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `tests/exposure.test.ts`:

```ts
describe("ageAtThresholdForFlatApoB", () => {
  it("matches the ages the heart page already publishes", () => {
    // The "Why 'normal' on a lab panel is already too high" fold cites ~56 and ~45.
    expect(ageAtThresholdForFlatApoB(90)).toBeCloseTo(55.56, 1);
    expect(ageAtThresholdForFlatApoB(110)).toBeCloseTo(45.45, 1);
  });

  it("pushes the crossing later as ApoB falls", () => {
    expect(ageAtThresholdForFlatApoB(65)).toBeCloseTo(76.92, 1);
    expect(ageAtThresholdForFlatApoB(65)!).toBeGreaterThan(
      ageAtThresholdForFlatApoB(90)!,
    );
  });

  it("returns null when the threshold is never reached in a lifetime", () => {
    expect(ageAtThresholdForFlatApoB(20)).toBeNull();
  });

  it("rejects a non-positive ApoB", () => {
    expect(() => ageAtThresholdForFlatApoB(0)).toThrow();
  });
});
```

Add the new name to the existing import block at the top of the file:

```ts
import {
  buildTrajectory,
  sampleTrajectory,
  apoBYears,
  cumulativeSeries,
  ageAtThreshold,
  ageAtThresholdForFlatApoB,
  CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS,
  sources,
} from "../src/lib/calculators/exposure";
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/exposure.test.ts`
Expected: FAIL — `ageAtThresholdForFlatApoB is not a function`.

- [ ] **Step 3: Implement it**

Append to `src/lib/calculators/exposure.ts`:

```ts
/**
 * Age at which a lifelong-flat ApoB crosses the cumulative-exposure threshold,
 * integrated from birth. This is the model behind the "an ApoB of 90 crosses
 * around 56" figures on the heart page; the hero graphic reads from here so it
 * cannot drift from the prose. Returns null if the threshold is not reached by
 * `endAge`.
 */
export function ageAtThresholdForFlatApoB(
  apoB: number,
  endAge = 120,
): number | null {
  const trajectory = buildTrajectory({
    currentAge: 0,
    currentApoB: apoB,
    risePerYear: 0,
    startAge: 0,
    endAge,
  });
  return ageAtThreshold(trajectory, CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS);
}
```

`buildTrajectory` already throws on `apoB <= 0` and on non-finite input, so the guard test passes without extra validation.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/exposure.test.ts`
Expected: PASS, all describes green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculators/exposure.ts tests/exposure.test.ts
git commit -m "feat: derive the flat-ApoB threshold crossing age from the exposure model"
```

---

## Task 2: Build the hero component

**Files:**

- Create: `src/components/ExposureGap.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create the component**

Create `src/components/ExposureGap.astro`:

```astro
---
// The heart page's thesis, drawn: two ApoB levels a standard panel waves
// through, and the decade between the ages at which each one accumulates
// enough exposure for events to typically begin. Every age here is computed
// from the sourced, unit-tested exposure model — nothing is hand-entered, so
// the graphic cannot drift from the prose that cites the same numbers.
import { ageAtThresholdForFlatApoB } from "../lib/calculators/exposure";

const AXIS_END = 80; // years, the drawn span
const TICKS = [20, 40, 60, 80];

interface Track {
  apoB: number;
  note: string;
  age: number | null;
}

const tracks: Track[] = [
  { apoB: 110, note: "a typical adult level" },
  { apoB: 90, note: "the guideline's most lenient goal" },
].map((t) => ({ ...t, age: ageAtThresholdForFlatApoB(t.apoB) }));

// Drop any level that never crosses inside the drawn span rather than clamping
// it, which would put the marker somewhere the model never said.
const drawn = tracks.filter(
  (t): t is Track & { age: number } => t.age !== null && t.age <= AXIS_END,
);

const pct = (age: number) => (age / AXIS_END) * 100;
const summary = drawn
  .map((t) => `ApoB ${t.apoB} crosses at about age ${Math.round(t.age)}`)
  .join("; ");
---

<figure class="gap not-prose">
  <!-- role=img on the plot only: the caption below must stay readable text,
       which it would not be if the whole figure collapsed to a single label. -->
  <div
    class="gap-plot"
    role="img"
    aria-label={`Cumulative exposure by age. ${summary}.`}
  >
    {
      drawn.map((t) => (
        <div class="gap-track">
          <p class="gap-key">
            <b>ApoB {t.apoB}</b>
            <span>{t.note}</span>
          </p>
          <div class="gap-line">
            <span class="gap-dot" style={`left:${pct(t.age)}%`} />
            <span class="gap-age" style={`left:${pct(t.age)}%`}>
              {Math.round(t.age)}
            </span>
          </div>
        </div>
      ))
    }
    <div class="gap-axis">
      {TICKS.map((age) => <span style={`left:${pct(age)}%`}>{age}</span>)}
    </div>
  </div>
  <figcaption class="gap-caption">
    Age at which each level accumulates ~5,000 mg·years of exposure, an
    illustrative marker of the plaque burden at which events typically begin.
    Risk rises continuously — crossing it is not an appointment. The age is the
    part you can move.
  </figcaption>
</figure>
```

- [ ] **Step 2: Add the styles**

Insert into `src/styles/global.css`, inside `@layer components`, immediately **before** the `/* ---- The slip ---- */` comment block:

```css
  /* ---- The exposure gap ------------------------------------------------
     The page's thesis as a picture: two lifetime tracks on a shared age axis,
     with a marker where each crosses the exposure threshold. Deliberately
     hairline — the slip below it is the page's one loud element, and this must
     stay quiet in value while carrying the argument. */
  .gap {
    margin: 2.5rem 0;
  }

  .gap-plot {
    padding-bottom: 1.25rem;
  }

  .gap-track + .gap-track {
    margin-top: 1.5rem;
  }

  .gap-key {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 0.5rem;
    margin-bottom: 0.4375rem;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ink-muted);
  }

  .gap-key b {
    font-weight: 500;
    color: var(--color-ink);
  }

  /* The lifetime track. The rule is the accruing exposure; the dot is where it
     reaches the threshold. */
  .gap-line {
    position: relative;
    height: 1px;
    background: var(--color-rule-strong);
  }

  .gap-dot {
    position: absolute;
    top: 50%;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--color-blood);
    transform: translate(-50%, -50%);
  }

  .gap-age {
    position: absolute;
    top: 0.5rem;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    color: var(--color-blood);
  }

  .gap-axis {
    position: relative;
    height: 1.25rem;
    margin-top: 1.75rem;
    border-top: 1px solid var(--color-rule);
  }

  .gap-axis span {
    position: absolute;
    top: 0.375rem;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    color: var(--color-ink-faint);
  }

  .gap-caption {
    max-width: 62ch;
    font-size: 0.8125rem;
    line-height: 1.6;
    color: var(--color-ink-muted);
  }
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run check`
Expected: `0 errors`, `0 warnings`, `0 hints`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ExposureGap.astro src/styles/global.css
git commit -m "feat: add the exposure-gap hero component"
```

---

## Task 3: Place it on the page and verify

**Files:**

- Modify: `src/pages/heart.mdx`

- [ ] **Step 1: Import the component**

In `src/pages/heart.mdx`, add to the import block (keep it alphabetical among the non-calculator imports):

```js
import ExposureGap from "../components/ExposureGap.astro";
```

- [ ] **Step 2: Place it after the lead paragraph, before the slip**

The page currently runs: H1 → lead paragraph → `<ThreeChecks client:load />`. Insert the hero between the lead and the slip, so the sequence is thesis-in-words → thesis-in-a-picture → what-to-do:

```mdx
as of 2026, US guidelines have moved a long way toward this view <Citation id="accAhaDyslipidemia2026" />.

<ExposureGap />

<ThreeChecks client:load />
```

Do **not** put it between the H1 and the paragraph — see gotcha 2, it silently kills the lead-paragraph styling.

- [ ] **Step 3: Run the dev server and screenshot both themes**

```bash
npm run dev   # leave running; do NOT run build/check against it (gotcha 3)
```

Screenshot light and dark at 1280 and at 390 using the recipe above. Check:

- The two dots sit at roughly 57% and 69% of the axis width (ages 45.5 and 55.6 of 80).
- Nothing competes with the slip below it.
- Both themes legible; no hardcoded colours surviving the flip.
- The age labels do not collide with the axis numbers at 390px wide.

- [ ] **Step 4: Confirm the numbers match the prose**

The fold "Why 'normal' on a lab panel is already too high" further down the page cites **56** and **45**. The hero must render the same two integers. If they differ, the model changed and the prose is now stale — fix the prose, do not hardcode the graphic.

- [ ] **Step 5: Full verification**

Kill the dev server first, then:

```bash
npm run check    # expect 0 errors
npm run build    # runs vitest via prebuild; expect 88+ tests passing, build Complete
```

- [ ] **Step 6: Delete the probe and commit**

```bash
rm -f public/__probe.html
git status --short          # confirm only intended files
git add src/pages/heart.mdx
git commit -m "feat: open the heart page with the exposure gap"
```

---

## Definition of done

- [ ] `ageAtThresholdForFlatApoB` exists, is unit-tested, and is the only source of the ages on screen.
- [ ] No new entries in `src/lib/references.ts` — and if you felt you needed one, you have gone outside this plan's scope.
- [ ] The hero ships zero JavaScript (no `client:*` directive on it).
- [ ] Legible and correct in light and dark, at 390px and 1280px.
- [ ] The rendered ages match the prose in the ApoB fold.
- [ ] `npm run check` clean; `npm run build` green.
- [ ] `public/__probe.html` is gone.

## Out of scope

- Changing the interactive `ApoBExposure.svelte` chart. It stays mid-page; this hero is not a replacement.
- Any claim about the age at which plaque *starts*, or the typical age at *diagnosis*. Both are real, citable facts, but neither is an output of the current model, so both need the `adding-sourced-calculator` skill and verified sources first. If the hero feels like it wants them, that is a follow-up piece of work, not a widened scope here.
- A third "optimal" track at ApoB 65 (crosses at 76.9). It fits and it is sourced, but three tracks crowd the graphic and the two-value comparison is the one the page's prose already makes. Try it only after the two-track version is reviewed.

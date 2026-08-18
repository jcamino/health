# Heart hero: years over the line — Design

**Date:** 2026-08-18
**Status:** Approved design, pending spec review
**Scope:** The `/heart` hero graphic, plus one new sourced constant it depends on
**Supersedes:** the two-track hero shipped in `docs/superpowers/plans/2026-08-18-heart-hero-exposure-gap.md`

## 1. Why

The hero shipped earlier today draws two hairline tracks with a dot on each, marking the
ages at which ApoB 110 and 90 cross the cumulative-exposure threshold. It was deliberately
quiet, so as not to compete with the action slip below it. In review the verdict was that
it reads as plain: a lot of vertical space spent stating a conclusion, with no visual
weight and nothing that shows the mechanism behind it.

The replacement keeps the same thesis — damage accrues for decades before diagnosis — but
draws it as a quantity you can see at a glance: **how much of a lifetime is spent past the
exposure threshold**, across four ApoB levels that run from the top of what a lab calls
normal down to the strictest goal medicine currently sets.

The argument the picture makes is that "normal" is the problem. The top two bars are
levels a standard panel waves through; both spend more than a third of a life past the
threshold. The page's own prose already notes that those same levels rate as "High" and
"Very high" on this site's prevention-optimal scale, so the graphic dramatises a gap the
text already claims.

## 2. The design

Four full-width horizontal bars, one per ApoB level, each spanning birth to age 80. Within
a bar, the years before the crossing are an empty hairline outline; the years after it are
a solid oxblood field. A mono numeral in a right-hand gutter counts those years, under the
column header **YEARS OVER THE LINE**. Crossing ages sit as ticks on a shared axis beneath
the bars, aligned to the x-position where each fill begins.

```
                                                        YEARS OVER
                                                          THE LINE
                                                        ──────────
APOB 130   the top of a standard lab's normal range
  [                     |█████████████████████████]             42
APOB 110   a typical adult level
  [                          |████████████████████]             35
APOB 90    the guideline's most lenient goal
  [                                |██████████████]             24
APOB 55    the guideline's strictest goal
  [                                              ]               0
  BIRTH                   38   45      56          80
```

The bottom bar never fills. That is the argument's other end: at the strictest goal the
threshold is not reached inside the drawn eighty years at all.

### Levels, labels and provenance

| ApoB | Label                                    | Crossing | Years over | Source of the number                          |
| ---- | ---------------------------------------- | -------- | ---------- | --------------------------------------------- |
| 130  | the top of a standard lab's normal range | 38       | 42         | **New:** Choi 2023 reference-interval study   |
| 110  | a typical adult level                    | 45       | 35         | Carried over unchanged from the shipped hero  |
| 90   | the guideline's most lenient goal        | 56       | 24         | 2026 ACC/AHA guideline, already cited on page |
| 55   | the guideline's strictest goal           | none     | 0          | Same guideline, same existing citation        |

The 70 mg/dL rung of the guideline ladder is deliberately omitted. It is the least
rhetorically useful of the three goals, and dropping it gives a clean two-and-two
structure: two levels a lab calls normal, two levels medicine aims for.

### The new source

Adding the 130 bar means adding one reference, which makes this work subject to the
project's `adding-sourced-calculator` skill rather than a pure styling change.

> Choi R, et al. "Exploring Utilization and Establishing Reference Intervals for the
> Apolipoprotein B Test in the Korean Population." _Diagnostics (Basel)_ 2023;13(20):3194.
> DOI `10.3390/diagnostics13203194` · PMID 37892015

Verified via NCBI E-utilities (esearch on the DOI → PMID 37892015 → esummary confirming
title, journal, year, volume and issue), as that skill requires. The study establishes
ApoB reference intervals of 46–134 mg/dL for men and 49–129 mg/dL for women, so 130 sits
at the top of that interval.

**Its limitations must be stated where the number is used, not buried.** It is a single
cohort of 334 Korean adults, which is a weaker source than the guidelines and megatrials
that make up the rest of `references.ts`, and reference intervals vary by laboratory and
assay. The fold prose must therefore say "a standard lab's normal range typically tops out
around 130" rather than asserting 130 as a universal cut-point.

### The prose change this requires

The hero introduces a figure that appears nowhere else on the page, so the claim and its
citation must also live in the text. The fold "Why 'normal' on a lab panel is already too
high" currently says only that "many panels do not flag ApoB until well above any of
those". That sentence gains the concrete number and the citation, and a third bullet joins
the two existing ones:

- An ApoB of **130 mg/dL**, around the top of a standard lab's normal range, crosses the
  threshold around **age 38**.

This keeps the site's rule that a number on screen is a number the page can defend, and it
makes the fold state the same three ages the hero draws (38, 45, 56), which is what the
build-time assertion checks.

### Why not a severity word, or "above standard risk"

`apoB.ts` already defines tiers — very-high ≥100, high ≥80, borderline ≥65 — and
`prevent.ts` defines risk bands — Low, Borderline, Intermediate, High — for the PREVENT
calculator further down the same page. Labelling a bar "high", or the count "years above
standard risk", would collide with both vocabularies and imply a relationship to the
PREVENT bands that does not exist. "Standard risk" is not a band in either set nor in the
guideline, so using it would mean coining a clinical category, which the sourcing rule
forbids. Naming each bar for its provenance sidesteps this entirely — and in the case of
the 130 and 110 bars, the tension between "what a lab calls normal" and what this site's
own gauge calls those levels is the point being made.

### Copy

Column header: **YEARS OVER THE LINE**, set on two lines in the gutter, mono, uppercase,
`--color-ink-faint`, with a hairline rule beneath it.

Caption (real text, outside the `role="img"` region):

> "The line" is ~5,000 mg·years of cumulative exposure — the illustrative marker of plaque
> burden at which events typically begin — out of a drawn lifetime of eighty. Risk rises
> continuously, so crossing is not an appointment and an empty bar is not immunity.

Three hedges are load-bearing and must survive any copy edit:

- **"Out of a drawn lifetime of eighty"** — ApoB 55 does cross the threshold at about age 91. The empty bar is a statement about the drawn span, not about a lifetime.
- **"An empty bar is not immunity"** — carries the continuous-risk hedge the page makes
  elsewhere, and blocks the cliff reading this device invites more strongly than the
  previous one did.
- **"A standard lab's normal range"** on the 130 bar, never "the normal range" — the
  interval is lab- and assay-dependent, and the supporting study is one cohort.

### Motion

The fills wipe in left-to-right on load: `transform: scaleX()` from 0 to 1 with
`transform-origin: left`, about 900ms, ease-out, staggered roughly 140ms per bar so it
reads as a cascade rather than four things twitching at once. Pure CSS, no JavaScript.

The animation is applied only inside `@media (prefers-reduced-motion: no-preference)`, so
the default rendered state is the finished state. Attaching the animation unconditionally
and disabling it inside a `reduce` query would leave reduced-motion users with a flash of
empty bars before the override applies.

### Phone (≤ 640px)

- The crossing-age ticks are dropped from the axis; at 390px they collide, and 38 and 45
  are only seven years apart.
- The count moves up beside its label as "42 yrs over", where it reads as a headline.
- The gutter and its column header are therefore not rendered, since each count is
  labelled in place.
- Bar height reduces from 24px to 22px.

## 3. Architecture

Unchanged principles: the hero ships zero JavaScript, holds no medical logic, and every
number on screen is an output of the tested model or a sourced constant.

| Path                               | Responsibility                                                        |
| ---------------------------------- | --------------------------------------------------------------------- |
| `src/lib/references.ts`            | **Modify.** Add the verified Choi 2023 entry                          |
| `src/lib/calculators/apoB.ts`      | **Modify.** Export the reference-interval upper limit + its source    |
| `tests/apoB.test.ts`               | **Modify.** Pin the constant and its citation                         |
| `src/lib/calculators/exposure.ts`  | **Modify.** Add `yearsOverThreshold()`                                |
| `tests/exposure.test.ts`           | **Modify.** Unit tests for it                                         |
| `src/components/ExposureGap.astro` | **Rewrite.** Same file, same placement, new device                    |
| `src/styles/global.css`            | **Modify.** Replace the `.gap-*` rules                                |
| `src/pages/heart.mdx`              | **Modify.** Fold prose gains the concrete 130 figure and its citation |

### The sourced constant

The 130 is a cut-point, so it lives in the pure layer with its citation rather than being
typed into the component:

```ts
/**
 * Upper limit of a typical laboratory ApoB reference interval (mg/dL) — the point
 * above which a standard panel starts flagging the result. Reference intervals are
 * lab- and assay-dependent; this is a representative round figure from the cited
 * study's 46–134 (men) / 49–129 (women) intervals.
 */
export const APOB_REFERENCE_INTERVAL_UPPER_MGDL = 130;
```

Its source is appended to `apoB.ts`'s existing `sources` array so the citation travels
with the module.

### The model function

```ts
export function yearsOverThreshold(apoB: number, span = 80): number;
```

Returns `span − crossingAge`, or `0` when the level does not cross within `span`. It
composes the existing `ageAtThresholdForFlatApoB`, so it inherits that function's
validation: a non-positive ApoB throws, and a non-positive span throws via
`buildTrajectory`. It returns the exact value; **rounding for display is the component's
job**, keeping the model free of presentation concerns.

### The build-time guard changes

The current component throws if a track does not cross inside the drawn span. That guard
existed because a silently dropped track would have contradicted the prose. Under this
design a non-crossing level is the point of the graphic, nothing is ever filtered, and
that failure mode no longer exists — so the filter and its throw are removed.

Replacing it: a build-time assertion that the ages the prose quotes still round to the
integers it prints — ApoB 130 → 38, 110 → 45, 90 → 56. If the model changes such that they
don't, the build fails rather than shipping a hero that contradicts the fold further down
the page. This guards the real drift risk instead of a hypothetical one.

The 55 bar is not asserted, because no age is quoted for it; a model change that made it
cross inside eighty years would change the picture without making the page contradict
itself.

### Accessibility

- `role="img"` stays on the plot region only, with an `aria-label` summarising all four
  rows including each count and its provenance label. Children of a `role="img"` are
  presentational, so the visible labels, header and numerals are not double-announced.
- The caption remains real text outside that region.
- Colour comes only from theme tokens, so both themes flip correctly.
- Reduced motion is honoured as described above.

## 4. Testing

For the constant, in `tests/apoB.test.ts`: it equals 130, it sits above every tier
boundary the module defines, and `sources` includes the Choi entry.

For `yearsOverThreshold`, in `tests/exposure.test.ts`:

- The four displayed integers are 42, 35, 24 and 0 — this pins the design's headline
  numbers to the model.
- ApoB 55 returns exactly 0 within an 80-year span, and something greater than 0 when the
  span widens to 100, confirming the zero means "not within the drawn span" rather than a
  floor.
- Monotonicity: a lower ApoB yields fewer years over the line.
- A non-positive ApoB throws.

Existing checks continue to apply: `npm run check` clean, `npm run build` green with the
full vitest suite passing, and visual verification in both themes at 390px and 1280px.

## 5. Decisions recorded

**The hero is now louder than it was, and that is intended.** The previous design's
constraint was that the hero must not compete with the action slip. This one puts a solid
oxblood field above it. The judgement is that they coexist because they are different
devices at different scales — four thin bands versus one large tinted block — and this was
reviewed against a mockup with the slip in place. If it proves too loud in the built page,
the documented fallback is to drop the fill to `--color-blood-wash` with a solid leading
edge at the crossing point, which keeps the shape and sheds about half the weight.

**The filename and CSS namespace stay.** The component remains `ExposureGap.astro` with
`.gap-*` classes, now describing the gap between rungs of the ladder rather than between
two tracks. Renaming would churn the import, the stylesheet and the git history for no
functional gain.

**The 130 bar's source is the weakest link and is documented as such.** It was chosen over
converting an LDL-C cut-point through `apoBFromLdl()` because it measures ApoB directly
rather than inferring it through an approximate population conversion. The alternative
remains available if a stronger ApoB reference-interval source turns up later.

## 6. Out of scope

- The interactive `ApoBExposure.svelte` chart mid-page. It stays exactly as it is; this
  hero is not a replacement for it and must not duplicate its interactivity.
- Making the hero interactive. Considered and rejected: it would duplicate that chart,
  ship JavaScript at the top of a content page, and open with a stranger's ApoB instead of
  a fact, before the page has taught what ApoB is.
- A page-wide rhythm and texture pass. The page beyond the hero was explicitly left alone
  for now; if the page still reads flat once this lands, that is separate work.
- Any new claim about the age at which plaque starts or the typical age at diagnosis.
- Re-examining the "a typical adult level" label on the 110 bar. It carries over unchanged
  from the shipped component and is not a new claim introduced here.

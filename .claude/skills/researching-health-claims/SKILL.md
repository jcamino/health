---
name: researching-health-claims
description: Use when researching, sourcing, or fact-checking the medical claims and prose for a health.jcamino.net pillar page — risk associations, mechanisms, guideline positions, intervention/trial effects. The evidence behind the words, as opposed to a calculator's numbers.
---

# Researching health claims

## Overview

Every factual medical claim in a page's prose must trace to a **primary source that
actually supports it**, be **graded by evidence strength**, and be **phrased to match
that strength**. This is the prose analogue of adding-sourced-calculator (which governs
numbers): there every *number* is sourced; here **every *claim* is sourced, verified,
and honestly framed.**

Cover **current guideline / standard-of-care medicine first, then evidence-backed
Medicine 3.0** (proactive, longevity/lifetime-exposure) refinements — gated on real
outcome or strong mechanistic evidence, each labeled by tier. Never dress an unproven
longevity idea up as established. (Project memory: `medicine-3-0-evidence-gating`.)

**REQUIRED SUB-SKILL:** record every source via adding-sourced-calculator's citation
step (a verified `refs` entry in `references.ts`). Prose only cites ids that exist.

## When to use

- Writing or fact-checking a pillar page's prose: "X is linked to Y", mechanisms,
  guideline recommendations, "trial Z showed…", population risk shares.
- Deciding which risk factors / interventions a page should feature.
- **NOT** for a calculator's coefficients/thresholds/cut-points → adding-sourced-calculator.

## Evidence hierarchy (prefer the top; label the tier you used)

1. **Major guidelines / consensus statements** (ACC/AHA, WHO, USPSTF, EAS, ADA, Lancet
   Commissions) — the "current medicine" backbone; cite these for standard-of-care claims.
2. **Systematic reviews / meta-analyses & large RCTs** — strongest for causal /
   interventional claims ("treatment reduced…").
3. **Large prospective cohorts** — associations only; write "associated with", not "causes".
4. **Mechanistic / small / animal studies** — hypotheses; can support a Medicine 3.0
   claim only when strong, convergent, and labeled as mechanistic.
5. **Narrative reviews, expert / longevity opinion (e.g. Attia)** — framing only, never
   the sole support for a claim. Label it as opinion/perspective.

## The verification workflow (run for every claim)

1. Find the **primary** source — the trial or guideline itself, not a news article,
   university press release, or podcast.
2. **Confirm it states what you claim.** Read the abstract/results (full text for an
   exact figure). A source *existing* ≠ a source *supporting your sentence*.
3. **Check it is current and live**: not retracted, not superseded by a newer effect
   size. Search `"<paper> retracted"` and look for the latest guideline/Commission.
4. Verify the DOI resolves (WebFetch the `https://doi.org/…` link; when the publisher
   blocks bots — Lancet/Elsevier/AHA/Springer often do — confirm via NCBI E-utilities
   `esearch` then `esummary`, no CAPTCHA).
5. Add the verified entry to `references.ts`; cite inline with `<Citation id="…" />`.

## Phrasing = evidence strength (the honest-framing gate)

- Observational → "associated with / linked to". RCT → "reduced / lowered".
- **A subgroup is not the headline.** If a trial's primary outcome was null and the
  effect lives in a subgroup, say both (e.g. the ACHIEVE hearing-aid trial: no overall
  cognitive benefit, benefit only in a pre-specified higher-risk subgroup).
- Relative vs absolute risk — give the absolute change or base rate when it changes the
  reader's takeaway.
- A population-attributable fraction ("up to X% of cases are associated with modifiable
  factors") is a population estimate, not an individual guarantee.

## Medicine 3.0 — include it, but gated and labeled

State the guideline position, then the proactive refinement, each labeled:

- ✅ "Guidelines classify ≥130/80 as stage-1 hypertension; the Lancet Commission
  recommends keeping systolic ≤130 mmHg from age 40 to lower dementia risk (pooled
  trials, OR 0.93)." — earlier/lower target, still trial-sourced.
- ❌ An "earlier and lower is always better" target backed only by mechanism or a
  podcast, stated as fact → label it unproven, or leave it out.

## Landmines (check on every page)

- **Retracted / withdrawn papers** — verify before citing (a 2023 *Lancet Public
  Health* hearing-aid/dementia paper was retracted).
- **Superseded effect sizes** — use the current meta-analysis (hearing-loss→dementia RR
  was revised 1.9 → 1.4 by the 2024 Commission).
- **Press-release inflation** — cite the paper's numbers, not the PR headline.
- **A single small study** carrying a load-bearing claim → find the review, or soften
  the phrasing to match.

## Common mistakes

- Citing a source that is topically related but does not state your specific claim.
- Causal verbs on observational data.
- Quoting a subgroup or secondary outcome as "the trial's result".
- Treating longevity-podcast framing as primary evidence.
- A `<Citation id>` whose id is not in `references.ts` (type/build error).

## Red flags — STOP

- "This news article / blog says…" → find and read the primary source.
- "The DOI is probably right." → WebFetch or E-utilities confirm it resolves.
- "Close enough to what the paper says." → read the result; match the phrasing exactly.
- "Attia / a podcast says so." → framing only; needs primary evidence or a
  labeled-unproven tag.

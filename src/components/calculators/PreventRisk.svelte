<script lang="ts">
  import {
    preventAscvd10yr,
    preventAscvd30yr,
    preventRiskBand,
    AGE_MAX_30YR,
    type PreventInput,
    sources,
  } from "../../lib/calculators/prevent";
  import Sources from "../ui/Sources.svelte";

  let age = $state(50);
  let sex = $state<"female" | "male">("female");
  let totalCholesterol = $state(200);
  let hdl = $state(50);
  let systolicBP = $state(120);
  let bpTreated = $state(false);
  let diabetic = $state(false);
  let smoker = $state(false);
  let egfr = $state(90);

  const numericValid = $derived(
    [age, totalCholesterol, hdl, systolicBP, egfr].every((n) =>
      Number.isFinite(n),
    ),
  );
  const ageInRange = $derived(age >= 30 && age <= 79);

  const input = $derived.by((): PreventInput | null => {
    if (!numericValid || !ageInRange) return null;
    return {
      age,
      sex,
      totalCholesterol,
      hdl,
      systolicBP,
      bpTreated,
      diabetic,
      smoker,
      egfr,
    };
  });

  const result = $derived.by(() => {
    if (!input) return null;
    try {
      return preventAscvd10yr(input);
    } catch {
      return null;
    }
  });

  // 30-year risk: the model is derived for ages 30-59 only.
  const result30 = $derived.by(() => {
    if (!input || age > AGE_MAX_30YR) return null;
    try {
      return preventAscvd30yr(input);
    } catch {
      return null;
    }
  });

  const band = $derived(result ? preventRiskBand(result.tenYearPercent) : null);

  // 2026-guideline action bands, colored like the other tier gauges.
  const bandColor: Record<string, string> = {
    low: "text-emerald-600 dark:text-emerald-400",
    borderline: "text-amber-600 dark:text-amber-400",
    intermediate: "text-orange-600 dark:text-orange-400",
    high: "text-red-600 dark:text-red-400",
  };
</script>

<div class="card not-prose">
  <div class="grid grid-cols-2 items-end gap-3 sm:grid-cols-3">
    <label class="field"
      >Age (30–79)
      <input
        type="number"
        min="30"
        max="79"
        bind:value={age}
        class="input w-full"
      /></label
    >
    <label class="field"
      >Sex
      <select bind:value={sex} class="input w-full">
        <option value="female">Female</option>
        <option value="male">Male</option>
      </select></label
    >
    <label class="field"
      >Total cholesterol (mg/dL)
      <input
        type="number"
        min="50"
        max="500"
        bind:value={totalCholesterol}
        class="input w-full"
      /></label
    >
    <label class="field"
      >HDL-C (mg/dL)
      <input
        type="number"
        min="10"
        max="150"
        bind:value={hdl}
        class="input w-full"
      /></label
    >
    <label class="field"
      >Systolic BP (mmHg)
      <input
        type="number"
        min="70"
        max="250"
        bind:value={systolicBP}
        class="input w-full"
      /></label
    >
    <label class="field"
      >eGFR (mL/min/1.73m²)
      <input
        type="number"
        min="10"
        max="150"
        bind:value={egfr}
        class="input w-full"
      /></label
    >
  </div>
  <div class="mt-3 flex flex-wrap gap-4 text-sm">
    <label class="flex items-center gap-2"
      ><input type="checkbox" bind:checked={bpTreated} /> BP treated</label
    >
    <label class="flex items-center gap-2"
      ><input type="checkbox" bind:checked={diabetic} /> Diabetes</label
    >
    <label class="flex items-center gap-2"
      ><input type="checkbox" bind:checked={smoker} /> Current smoker</label
    >
  </div>

  {#if result}
    <p class="mt-4 text-sm">
      Estimated 10-year ASCVD risk: <strong class="font-mono"
        >{result.tenYearPercent.toFixed(1)}%</strong
      >
      {#if band}
        · <span class={`font-semibold ${bandColor[band.band]}`}
          >{band.label}</span
        >
      {/if}
    </p>
    {#if result30}
      <p class="mt-1 text-sm">
        Estimated 30-year ASCVD risk: <strong class="font-mono"
          >{result30.thirtyYearPercent.toFixed(1)}%</strong
        >
      </p>
    {:else}
      <p class="mt-1 text-xs text-ink-muted">
        30-year risk is modeled for ages 30–{AGE_MAX_30YR}.
      </p>
    {/if}
  {:else if !ageInRange}
    <p class="mt-4 text-sm text-red-600 dark:text-red-400">
      PREVENT is validated for ages 30–79.
    </p>
  {:else}
    <p class="mt-4 text-sm text-red-600 dark:text-red-400">
      Fill in all fields with valid numbers.
    </p>
  {/if}

  <p class="hint">
    AHA PREVENT (race-free), the risk engine the 2026 guideline runs on. Its
    10-year action bands: under 3% low, 3–5% borderline, 5–10% intermediate,
    10%+ high. A 10-year window under-weights younger people, which is exactly
    what the 30-year figure and the lifetime exposure above are for.
  </p>

  <Sources {sources} />
</div>

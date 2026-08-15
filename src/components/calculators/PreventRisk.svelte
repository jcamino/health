<script lang="ts">
  import {
    preventAscvd10yr,
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

  const result = $derived.by(() => {
    if (!numericValid || !ageInRange) return null;
    try {
      const input: PreventInput = {
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
      return preventAscvd10yr(input);
    } catch {
      return null;
    }
  });
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
    </p>
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
    A short-horizon estimate (AHA PREVENT, race-free). 10-year risk
    under-weights younger people, so read it alongside the lifetime exposure
    above, which is what early prevention targets.
  </p>

  <Sources {sources} />
</div>

<script lang="ts">
  import { preventAscvd10yr, type PreventInput, sources } from '../../lib/calculators/prevent';
  import Sources from '../ui/Sources.svelte';

  let age = $state(50);
  let sex = $state<'female' | 'male'>('female');
  let totalCholesterol = $state(200);
  let hdl = $state(50);
  let systolicBP = $state(120);
  let bpTreated = $state(false);
  let diabetic = $state(false);
  let smoker = $state(false);
  let egfr = $state(90);

  const numericValid = $derived(
    [age, totalCholesterol, hdl, systolicBP, egfr].every((n) => Number.isFinite(n)),
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

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
    <label class="text-sm">Age (30–79)
      <input type="number" min="30" max="79" bind:value={age} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm">Sex
      <select bind:value={sex} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800">
        <option value="female">Female</option>
        <option value="male">Male</option>
      </select></label>
    <label class="text-sm">Total cholesterol (mg/dL)
      <input type="number" min="50" max="500" bind:value={totalCholesterol} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm">HDL-C (mg/dL)
      <input type="number" min="10" max="150" bind:value={hdl} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm">Systolic BP (mmHg)
      <input type="number" min="70" max="250" bind:value={systolicBP} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm">eGFR (mL/min/1.73m²)
      <input type="number" min="10" max="150" bind:value={egfr} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
  </div>
  <div class="mt-2 flex flex-wrap gap-4 text-sm">
    <label class="flex items-center gap-1"><input type="checkbox" bind:checked={bpTreated} /> BP treated</label>
    <label class="flex items-center gap-1"><input type="checkbox" bind:checked={diabetic} /> Diabetes</label>
    <label class="flex items-center gap-1"><input type="checkbox" bind:checked={smoker} /> Current smoker</label>
  </div>

  {#if result}
    <p class="mt-3">Estimated 10-year ASCVD risk: <strong>{result.tenYearPercent.toFixed(1)}%</strong></p>
  {:else if !ageInRange}
    <p class="mt-3 text-sm text-red-600">PREVENT is validated for ages 30–79.</p>
  {:else}
    <p class="mt-3 text-sm text-red-600">Fill in all fields with valid numbers.</p>
  {/if}

  <p class="mt-2 text-xs text-slate-500">
    A short-horizon estimate (AHA PREVENT, race-free). 10-year risk under-weights
    younger people — read it alongside the lifetime exposure above, which is what
    early prevention targets.
  </p>

  <Sources {sources} />
</div>

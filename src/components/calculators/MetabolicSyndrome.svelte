<script lang="ts">
  import {
    evaluateCriteria,
    metabolicSyndrome,
    waistThresholdCm,
    sources,
    type Sex,
  } from '../../lib/calculators/metabolicSyndrome';
  import Sources from '../ui/Sources.svelte';

  let sex = $state<Sex>('male');
  let waistCm = $state(90);
  let triglyceridesMgDl = $state(120);
  let hdlMgDl = $state(50);
  let systolic = $state(120);
  let diastolic = $state(78);
  let glucoseMgDl = $state(92);
  let bpTreated = $state(false);
  let lipidTreated = $state(false);
  let glucoseTreated = $state(false);

  const allFinite = $derived(
    [waistCm, triglyceridesMgDl, hdlMgDl, systolic, diastolic, glucoseMgDl].every(
      (n) => Number.isFinite(n) && n > 0,
    ),
  );

  const criteria = $derived(
    allFinite
      ? evaluateCriteria({
          sex,
          waistCm,
          triglyceridesMgDl,
          hdlMgDl,
          systolic,
          diastolic,
          glucoseMgDl,
          bpTreated,
          lipidTreated,
          glucoseTreated,
        })
      : null,
  );
  const result = $derived(criteria ? metabolicSyndrome(criteria) : null);
  const waistCut = $derived(waistThresholdCm(sex));

  const rows = $derived(
    criteria
      ? [
          { key: 'waist', met: criteria.waist, label: `Waist ≥ ${waistCut} cm` },
          { key: 'tg', met: criteria.triglycerides, label: 'Triglycerides ≥ 150 mg/dL (or treated)' },
          { key: 'hdl', met: criteria.hdl, label: `HDL < ${sex === 'male' ? 40 : 50} mg/dL (or treated)` },
          { key: 'bp', met: criteria.bloodPressure, label: 'BP ≥ 130/85 mmHg (or treated)' },
          { key: 'glu', met: criteria.glucose, label: 'Fasting glucose ≥ 100 mg/dL (or treated)' },
        ]
      : [],
  );
</script>

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <div class="flex flex-wrap items-end gap-3">
    <label class="text-sm font-medium">Sex
      <select bind:value={sex} class="mt-1 block rounded border border-slate-300 px-2 py-1 dark:bg-slate-800">
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select></label>
    <label class="text-sm font-medium">Waist (cm)
      <input type="number" min="0" max="250" bind:value={waistCm}
        class="mt-1 block w-24 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm font-medium">Triglycerides (mg/dL)
      <input type="number" min="0" max="2000" bind:value={triglyceridesMgDl}
        class="mt-1 block w-28 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm font-medium">HDL (mg/dL)
      <input type="number" min="0" max="200" bind:value={hdlMgDl}
        class="mt-1 block w-24 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm font-medium">Systolic (mmHg)
      <input type="number" min="0" max="300" bind:value={systolic}
        class="mt-1 block w-24 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm font-medium">Diastolic (mmHg)
      <input type="number" min="0" max="200" bind:value={diastolic}
        class="mt-1 block w-24 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm font-medium">Fasting glucose (mg/dL)
      <input type="number" min="0" max="600" bind:value={glucoseMgDl}
        class="mt-1 block w-28 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
  </div>

  <div class="mt-3 flex flex-wrap gap-4 text-sm">
    <label class="flex items-center gap-2"><input type="checkbox" bind:checked={bpTreated} /> On BP medication</label>
    <label class="flex items-center gap-2"><input type="checkbox" bind:checked={lipidTreated} /> On lipid medication</label>
    <label class="flex items-center gap-2"><input type="checkbox" bind:checked={glucoseTreated} /> On glucose medication</label>
  </div>

  {#if result}
    <ul class="mt-4 space-y-1 text-sm">
      {#each rows as row (row.key)}
        <li>
          <span class={row.met ? 'text-orange-600' : 'text-emerald-600'}>{row.met ? '✓' : '·'}</span>
          {row.label}
        </li>
      {/each}
    </ul>
    <p class="mt-3">
      <span class="font-semibold">{result.count} of 5</span> criteria met,
      <span class={`font-semibold ${result.meets ? 'text-red-600' : 'text-emerald-600'}`}>
        {result.meets ? 'meets metabolic syndrome' : 'does not meet metabolic syndrome'}
      </span>
    </p>
    <p class="mt-2 text-xs text-slate-500">
      Waist cut-points are population-specific; shown here are the AHA/NHLBI (US)
      values (≥102 cm men, ≥88 cm women). Diagnosis = any 3 of 5.
    </p>
  {:else}
    <p class="mt-3 text-sm text-slate-500">Enter all measurements.</p>
  {/if}
  <Sources {sources} />
</div>

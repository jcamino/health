<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import {
    buildTrajectory,
    apoBYears,
    cumulativeSeries,
    ageAtThreshold,
    CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS,
    sources as exposureSources,
  } from '../../lib/calculators/exposure';
  import {
    apoBFromLdl,
    apoBFromNonHdl,
    sources as conversionSources,
  } from '../../lib/calculators/apoBFromLipids';
  import Sources from '../ui/Sources.svelte';

  type InputMode = 'apoB' | 'nonHdl' | 'ldl';

  let inputMode = $state<InputMode>('apoB');
  let currentAge = $state(40);
  let currentValue = $state(90); // in the selected unit
  let risePerDecade = $state(3); // ApoB mg/dL per decade
  let useIntervention = $state(true);
  let interventionAge = $state(50);
  let interventionValue = $state(60); // in the selected unit

  const endAge = 100; // fixed lifetime window: birth (0) → 100

  const unitLabel = $derived(
    inputMode === 'apoB' ? 'ApoB' : inputMode === 'nonHdl' ? 'non-HDL-C' : 'LDL-C',
  );

  function toApoB(v: number): number {
    if (inputMode === 'apoB') return v;
    if (inputMode === 'nonHdl') return apoBFromNonHdl(v);
    return apoBFromLdl(v);
  }

  const inputsValid = $derived(
    [currentAge, currentValue, risePerDecade].every((n) => Number.isFinite(n)) &&
      currentValue > 0 &&
      (!useIntervention ||
        ([interventionAge, interventionValue].every((n) => Number.isFinite(n)) &&
          interventionValue > 0)),
  );

  const estimatedApoB = $derived(
    inputMode !== 'apoB' && Number.isFinite(currentValue) && currentValue > 0
      ? Math.round(toApoB(currentValue))
      : null,
  );

  const scenario = $derived.by(() => {
    if (!inputsValid) return null;
    try {
      return buildTrajectory({
        startAge: 0,
        currentAge,
        currentApoB: toApoB(currentValue),
        risePerYear: risePerDecade / 10,
        endAge,
        intervention: useIntervention
          ? { age: interventionAge, apoB: toApoB(interventionValue) }
          : undefined,
      });
    } catch {
      return null;
    }
  });

  const totalExposure = $derived(scenario ? Math.round(apoBYears(scenario)) : null);
  const crossingAge = $derived(
    scenario ? ageAtThreshold(scenario, CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS) : null,
  );

  const displaySources = $derived(
    inputMode === 'apoB' ? exposureSources : [...exposureSources, ...conversionSources],
  );

  let canvas: HTMLCanvasElement;
  let chart: Chart | undefined;

  function render() {
    if (!chart || !scenario) return;
    const series = cumulativeSeries(scenario);
    chart.data.datasets[0].data = series.map((p) => ({ x: p.age, y: p.cumulative }));
    const first = series[0].age;
    const last = series[series.length - 1].age;
    chart.data.datasets[1].data = [
      { x: first, y: CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS },
      { x: last, y: CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS },
    ];
    chart.update();
  }

  onMount(() => {
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        datasets: [
          { label: 'Cumulative ApoB exposure (mg·years)', data: [], fill: true, tension: 0 },
          {
            label: 'Illustrative threshold (LDL-C–derived)',
            data: [],
            borderDash: [6, 6],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { type: 'linear', title: { display: true, text: 'Age' } },
          y: {
            title: { display: true, text: 'Cumulative ApoB-years (mg·years)' },
            beginAtZero: true,
          },
        },
      },
    });
    render();
  });

  $effect(() => {
    scenario;
    render();
  });

  onDestroy(() => chart?.destroy());
</script>

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <label class="text-sm">Enter as
      <select bind:value={inputMode} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800">
        <option value="apoB">ApoB (best)</option>
        <option value="nonHdl">non-HDL-C</option>
        <option value="ldl">LDL-C</option>
      </select></label>
    <label class="text-sm">Your age now
      <input type="number" min="1" max="120" bind:value={currentAge} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm">Your {unitLabel} now (mg/dL)
      <input type="number" min="1" max="400" bind:value={currentValue} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm">ApoB rise per decade (mg/dL)
      <input type="number" min="0" max="50" bind:value={risePerDecade} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
  </div>

  {#if estimatedApoB !== null}
    <p class="mt-2 text-xs text-slate-500">Estimated ApoB ≈ <strong>{estimatedApoB} mg/dL</strong> (converted from {unitLabel}).</p>
  {/if}

  <label class="mt-3 flex items-center gap-2 text-sm">
    <input type="checkbox" bind:checked={useIntervention} /> Model an intervention (e.g. a statin lowers it, then held)
  </label>
  {#if useIntervention}
    <div class="mt-2 grid grid-cols-2 gap-3">
      <label class="text-sm">Intervention age
        <input type="number" min="1" max="99" bind:value={interventionAge} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
      <label class="text-sm">{unitLabel} after (mg/dL)
        <input type="number" min="1" max="400" bind:value={interventionValue} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    </div>
  {/if}

  <div class="mt-4 h-64"><canvas bind:this={canvas} aria-label="Cumulative ApoB exposure from birth over age"></canvas></div>

  {#if scenario}
    <p class="mt-3 text-sm">
      Cumulative exposure from birth to age {endAge}: <strong>{totalExposure} mg·years</strong>.
      {#if crossingAge !== null}
        Crosses the illustrative threshold at about <strong>age {Math.round(crossingAge)}</strong>.
      {:else}
        Stays under the illustrative threshold across this range.
      {/if}
    </p>
  {:else}
    <p class="mt-3 text-sm text-red-600">Check the inputs — all fields must be positive numbers, and any intervention age must be under {endAge}.</p>
  {/if}

  <p class="mt-2 text-xs text-slate-500">
    ApoB or non-HDL-C are preferred; LDL-C is converted approximately and individual
    ApoB can differ (which is why measuring ApoB is best). Illustrative model:
    exposure accrues from birth; ApoB is assumed to rise linearly with age (adjust
    the per-decade rate), anchored to your current value. An intervention drops ApoB
    and holds it. Real trajectories vary.
  </p>

  <Sources sources={displaySources} />
</div>

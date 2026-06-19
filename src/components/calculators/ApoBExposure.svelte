<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import {
    buildTrajectory,
    apoBYears,
    cumulativeSeries,
    ageAtThreshold,
    CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS,
    sources,
  } from '../../lib/calculators/exposure';
  import Sources from '../ui/Sources.svelte';

  let startAge = $state(20);
  let endAge = $state(80);
  let baselineApoB = $state(90);
  let useIntervention = $state(true);
  let interventionAge = $state(40);
  let interventionApoB = $state(60);

  // Guard: <input type=number> yields NaN when cleared. Only build when all
  // relevant inputs are finite, so we never display NaN.
  const inputsValid = $derived(
    [startAge, endAge, baselineApoB].every((n) => Number.isFinite(n)) &&
      (!useIntervention ||
        [interventionAge, interventionApoB].every((n) => Number.isFinite(n))),
  );

  const scenario = $derived.by(() => {
    if (!inputsValid) return null;
    try {
      return buildTrajectory({
        startAge,
        endAge,
        baselineApoB,
        intervention: useIntervention
          ? { age: interventionAge, apoB: interventionApoB }
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

  let canvas: HTMLCanvasElement;
  let chart: Chart | undefined;

  function render() {
    if (!chart || !scenario) return;
    const series = cumulativeSeries(scenario);
    // Linear age axis: plot {x: age, y: ...} so points sit at their true ages.
    // An intervention yields two points at the same age (a slope kink, not a
    // duplicate tick), and unequal spans (e.g. 14 vs 65 years) render to scale.
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
          x: {
            type: 'linear',
            title: { display: true, text: 'Age' },
          },
          y: {
            title: { display: true, text: 'Cumulative ApoB-years (mg·years)' },
            beginAtZero: true,
          },
        },
      },
    });
    render();
  });

  // Re-render whenever the scenario changes.
  $effect(() => {
    scenario;
    render();
  });

  onDestroy(() => chart?.destroy());
</script>

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
    <label class="text-sm">Start age
      <input type="number" min="0" max="120" bind:value={startAge} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm">End age
      <input type="number" min="1" max="120" bind:value={endAge} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm">Baseline ApoB
      <input type="number" min="0" max="300" bind:value={baselineApoB} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
  </div>

  <label class="mt-3 flex items-center gap-2 text-sm">
    <input type="checkbox" bind:checked={useIntervention} /> Model an intervention (lower ApoB at an age)
  </label>
  {#if useIntervention}
    <div class="mt-2 grid grid-cols-2 gap-3">
      <label class="text-sm">Intervention age
        <input type="number" min="0" max="120" bind:value={interventionAge} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
      <label class="text-sm">New ApoB
        <input type="number" min="0" max="300" bind:value={interventionApoB} class="mt-1 block w-full rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    </div>
  {/if}

  <div class="mt-4 h-64"><canvas bind:this={canvas} aria-label="Cumulative ApoB exposure over age"></canvas></div>

  {#if scenario}
    <p class="mt-3 text-sm">
      Total exposure to age {endAge}: <strong>{totalExposure} mg·years</strong>.
      {#if crossingAge !== null}
        Crosses the illustrative threshold at about <strong>age {Math.round(crossingAge)}</strong>.
      {:else}
        Stays under the illustrative threshold across this range.
      {/if}
    </p>
  {:else}
    <p class="mt-3 text-sm text-red-600">Check the inputs — end age must be greater than start age, any intervention age must fall between them, and all fields must be filled in.</p>
  {/if}

  <Sources {sources} />
</div>

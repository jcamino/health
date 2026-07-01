<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import { bpCategory, BP_THRESHOLDS, sources } from '../../lib/calculators/bloodPressure';
  import Sources from '../ui/Sources.svelte';

  let systolic = $state(120);
  let diastolic = $state(80);

  const result = $derived(
    Number.isFinite(systolic) && Number.isFinite(diastolic) && systolic > 0 && diastolic > 0
      ? bpCategory(systolic, diastolic)
      : null,
  );

  const textColor: Record<string, string> = {
    normal: 'text-emerald-600',
    elevated: 'text-yellow-600',
    'stage-1': 'text-orange-600',
    'stage-2': 'text-red-600',
    crisis: 'text-red-700',
  };
  // Translucent fills for the zones, solid colors for the plotted point.
  const zoneFill: Record<string, string> = {
    normal: 'rgba(16,185,129,0.18)',
    elevated: 'rgba(234,179,8,0.20)',
    'stage-1': 'rgba(249,115,22,0.20)',
    'stage-2': 'rgba(239,68,68,0.22)',
    crisis: 'rgba(153,27,27,0.32)',
  };
  const pointColor: Record<string, string> = {
    normal: '#059669',
    elevated: '#ca8a04',
    'stage-1': '#ea580c',
    'stage-2': '#dc2626',
    crisis: '#991b1b',
  };

  const X = { min: 40, max: 130 }; // diastolic axis
  const Y = { min: 70, max: 200 }; // systolic axis

  let canvas: HTMLCanvasElement;
  let chart: Chart | undefined;

  // Paint the ACC/AHA category map. Bands are "higher of the two wins", so each
  // tier is an L-shaped union (systolic-threshold OR diastolic-threshold). Painting
  // from least to most severe lets the more severe layers overwrite correctly.
  const zonesPlugin = {
    id: 'bpZones',
    beforeDatasetsDraw(c: Chart) {
      const { ctx, chartArea, scales } = c;
      if (!chartArea) return;
      const S = BP_THRESHOLDS.systolic;
      const D = BP_THRESHOLDS.diastolic;
      const px = (v: number) => Math.max(chartArea.left, Math.min(chartArea.right, scales.x.getPixelForValue(v)));
      const py = (v: number) => Math.max(chartArea.top, Math.min(chartArea.bottom, scales.y.getPixelForValue(v)));
      const fill = (d0: number, d1: number, s0: number, s1: number, css: string) => {
        const x0 = px(d0), x1 = px(d1), y0 = py(s0), y1 = py(s1);
        ctx.fillStyle = css;
        ctx.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
      };
      ctx.save();
      fill(X.min, X.max, Y.min, Y.max, zoneFill.normal); // normal everywhere
      fill(X.min, D.stage1, S.elevated, S.stage1, zoneFill.elevated); // 120-129 systolic, diastolic < 80
      fill(X.min, X.max, S.stage1, Y.max, zoneFill['stage-1']); // systolic >= 130
      fill(D.stage1, X.max, Y.min, Y.max, zoneFill['stage-1']); // diastolic >= 80
      fill(X.min, X.max, S.stage2, Y.max, zoneFill['stage-2']); // systolic >= 140
      fill(D.stage2, X.max, Y.min, Y.max, zoneFill['stage-2']); // diastolic >= 90
      fill(X.min, X.max, S.crisis, Y.max, zoneFill.crisis); // systolic > 180
      fill(D.crisis, X.max, Y.min, Y.max, zoneFill.crisis); // diastolic > 120
      // Prevention-optimal target: outline the "aim for under 120/80" corner
      // (2025 ACC/AHA "as close to <120/80 as tolerated"). This is a target, not the
      // diagnostic boundary; 120/80 is the low end the intensive trials actually tested.
      const tx = px(D.stage1), ty = py(S.elevated);
      const cx = px(X.min), cy = py(Y.min);
      ctx.strokeStyle = pointColor.normal;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(Math.min(cx, tx), Math.min(cy, ty), Math.abs(tx - cx), Math.abs(ty - cy));
      ctx.setLineDash([]);
      ctx.restore();
    },
  };

  function render() {
    if (!chart) return;
    const ds = chart.data.datasets[0];
    if (result) {
      ds.data = [{ x: diastolic, y: systolic }];
      (ds as { pointBackgroundColor?: string }).pointBackgroundColor = pointColor[result.category];
    } else {
      ds.data = [];
    }
    chart.update();
  }

  onMount(() => {
    chart = new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Your reading',
            data: [],
            pointRadius: 7,
            pointHoverRadius: 8,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { type: 'linear', min: X.min, max: X.max, title: { display: true, text: 'Diastolic (mmHg)' } },
          y: { type: 'linear', min: Y.min, max: Y.max, title: { display: true, text: 'Systolic (mmHg)' } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: () => `${systolic}/${diastolic} mmHg${result ? `: ${result.label}` : ''}`,
            },
          },
        },
      },
      plugins: [zonesPlugin],
    });
    render();
  });

  $effect(() => {
    systolic;
    diastolic;
    result;
    render();
  });

  onDestroy(() => chart?.destroy());
</script>

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <div class="flex flex-wrap items-end gap-3">
    <label class="text-sm font-medium">Systolic (mmHg)
      <input type="number" min="0" max="300" bind:value={systolic}
        class="mt-1 block w-28 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm font-medium">Diastolic (mmHg)
      <input type="number" min="0" max="200" bind:value={diastolic}
        class="mt-1 block w-28 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
  </div>

  {#if result}
    <p class="mt-3">Category: <span class={`font-semibold ${textColor[result.category]}`}>{result.label}</span></p>
  {:else}
    <p class="mt-3 text-sm text-red-600">Enter a systolic and diastolic value.</p>
  {/if}

  <div class="mt-4 h-80">
    <canvas bind:this={canvas} aria-label="Blood-pressure category chart: diastolic on the x-axis, systolic on the y-axis, with colored ACC/AHA zones and your reading plotted as a point"></canvas>
  </div>
  <p class="mt-2 text-xs text-slate-500">
    Zones follow the 2017 ACC/AHA categories; because the higher of the systolic and
    diastolic categories applies, the bands are L-shaped. Your reading is the dot. The
    dashed green box is the prevention-optimal target: the 2025 ACC/AHA guidance to get
    <span class="whitespace-nowrap">as close to under 120/80 as tolerated</span>. Judge
    yourself against home readings (rested, seated, averaged); office readings run high.
  </p>

  <Sources {sources} />
</div>

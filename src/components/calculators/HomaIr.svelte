<script lang="ts">
  import { homaIr, sources } from '../../lib/calculators/homaIr';
  import Sources from '../ui/Sources.svelte';

  let glucose = $state(90);
  let insulin = $state(8);
  const result = $derived(
    Number.isFinite(glucose) && Number.isFinite(insulin) && glucose > 0 && insulin > 0
      ? homaIr(glucose, insulin)
      : null,
  );
</script>

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <div class="flex flex-wrap items-end gap-3">
    <label class="text-sm font-medium">Fasting glucose (mg/dL)
      <input type="number" min="0" max="600" step="1" bind:value={glucose}
        class="mt-1 block w-32 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm font-medium">Fasting insulin (µU/mL)
      <input type="number" min="0" max="300" step="0.1" bind:value={insulin}
        class="mt-1 block w-32 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
  </div>
  {#if result}
    <p class="mt-3">
      HOMA-IR: <span class="font-semibold">{result.value.toFixed(2)}</span>
      —
      <span class={`font-semibold ${result.insulinResistant ? 'text-orange-600' : 'text-emerald-600'}`}>
        {result.insulinResistant ? 'above the insulin-resistance cut-point' : 'below the insulin-resistance cut-point'}
      </span>
    </p>
    <p class="mt-2 text-xs text-slate-500">
      Approximate cut-point ≈ {result.cutPoint} (90th percentile in a general adult
      population). HOMA-IR thresholds vary by population, age, and sex — this is an
      illustrative reference point, not a diagnosis.
    </p>
  {:else}
    <p class="mt-3 text-sm text-slate-500">Enter fasting glucose and insulin.</p>
  {/if}
  <Sources {sources} />
</div>

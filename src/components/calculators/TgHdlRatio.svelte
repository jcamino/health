<script lang="ts">
  import { tgHdlRatio, sources } from '../../lib/calculators/tgHdlRatio';
  import Sources from '../ui/Sources.svelte';

  let triglycerides = $state(120);
  let hdl = $state(50);
  const result = $derived(
    Number.isFinite(triglycerides) && Number.isFinite(hdl) && triglycerides > 0 && hdl > 0
      ? tgHdlRatio(triglycerides, hdl)
      : null,
  );
</script>

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <div class="flex flex-wrap items-end gap-3">
    <label class="text-sm font-medium">Triglycerides (mg/dL)
      <input type="number" min="0" max="2000" bind:value={triglycerides}
        class="mt-1 block w-32 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
    <label class="text-sm font-medium">HDL (mg/dL)
      <input type="number" min="0" max="200" bind:value={hdl}
        class="mt-1 block w-28 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
  </div>
  {#if result}
    <p class="mt-3">
      TG/HDL ratio: <span class="font-semibold">{result.ratio.toFixed(1)}</span>
      —
      <span class={`font-semibold ${result.insulinResistanceLikely ? 'text-orange-600' : 'text-emerald-600'}`}>
        {result.insulinResistanceLikely ? 'above the insulin-resistance cut-point' : 'below the insulin-resistance cut-point'}
      </span>
    </p>
    <p class="mt-2 text-xs text-slate-500">
      Cut-point ≈ {result.cutPoint.toFixed(1)} (mg/dL units). A surrogate marker of
      insulin resistance, not a diagnosis; performance varies by population.
    </p>
  {:else}
    <p class="mt-3 text-sm text-slate-500">Enter triglycerides and HDL.</p>
  {/if}
  <Sources {sources} />
</div>

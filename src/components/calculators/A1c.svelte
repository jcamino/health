<script lang="ts">
  import { a1cStatus, sources } from '../../lib/calculators/a1c';
  import Sources from '../ui/Sources.svelte';

  let a1c = $state(5.4);
  const result = $derived(
    Number.isFinite(a1c) && a1c > 0 && a1c <= 30 ? a1cStatus(a1c) : null,
  );

  const color: Record<string, string> = {
    normal: 'text-emerald-600',
    prediabetes: 'text-yellow-600',
    diabetes: 'text-red-600',
  };
</script>

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <div class="flex flex-wrap items-end gap-3">
    <label class="text-sm font-medium">A1C (%)
      <input type="number" min="0" max="30" step="0.1" bind:value={a1c}
        class="mt-1 block w-28 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" /></label>
  </div>
  {#if result}
    <p class="mt-3">
      Category: <span class={`font-semibold ${color[result.category]}`}>{result.label}</span>
    </p>
    <p class="mt-1">
      Estimated average glucose: <span class="font-semibold">{Math.round(result.eAG)} mg/dL</span>
    </p>
    <p class="mt-2 text-xs text-slate-500">
      ADA cut-points: normal &lt;5.7%, prediabetes 5.7–6.4%, diabetes ≥6.5%.
      eAG via the ADAG regression (28.7 × A1C − 46.7).
    </p>
  {:else}
    <p class="mt-3 text-sm text-slate-500">Enter your A1C.</p>
  {/if}
  <Sources {sources} />
</div>

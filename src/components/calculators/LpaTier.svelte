<script lang="ts">
  import { lpaTier, type LpaUnit, sources } from '../../lib/calculators/lpa';
  import Sources from '../ui/Sources.svelte';

  let value = $state(30);
  let unit = $state<LpaUnit>('mg/dL');
  const result = $derived(value >= 0 && Number.isFinite(value) ? lpaTier(value, unit) : null);
</script>

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <div class="flex flex-wrap items-end gap-3">
    <label class="block text-sm font-medium">
      Your Lp(a)
      <input type="number" min="0" bind:value
        class="mt-1 block w-28 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" />
    </label>
    <label class="block text-sm font-medium">
      Unit
      <select bind:value={unit} class="mt-1 block rounded border border-slate-300 px-2 py-1 dark:bg-slate-800">
        <option value="mg/dL">mg/dL</option>
        <option value="nmol/L">nmol/L</option>
      </select>
    </label>
  </div>
  {#if result}
    <p class="mt-3">Risk: <span class="font-semibold">{result.label}</span></p>
  {/if}
  <p class="mt-2 text-xs text-slate-500">
    Lp(a) is largely genetic, measured ~once in a lifetime, not meaningfully lowered
    by statins or lifestyle, and adds to ApoB-driven risk.
  </p>
  <Sources {sources} />
</div>

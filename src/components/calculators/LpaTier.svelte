<script lang="ts">
  import { lpaTier, lpaBands, type LpaUnit, sources } from '../../lib/calculators/lpa';
  import Sources from '../ui/Sources.svelte';
  import TierGauge from '../ui/TierGauge.svelte';

  let value = $state(30);
  let unit = $state<LpaUnit>('mg/dL');
  const result = $derived(value >= 0 && Number.isFinite(value) ? lpaTier(value, unit) : null);

  const tierColor: Record<string, string> = {
    low: 'text-emerald-600',
    borderline: 'text-yellow-600',
    high: 'text-orange-600',
    'very-high': 'text-red-600',
  };
  const barColor: Record<string, string> = {
    low: 'bg-emerald-500',
    borderline: 'bg-yellow-400',
    high: 'bg-orange-500',
    'very-high': 'bg-red-600',
  };
  const shortLabel: Record<string, string> = {
    low: 'Low',
    borderline: 'Borderline',
    high: 'High',
    'very-high': 'Very high',
  };
  const segments = $derived(
    lpaBands(unit).map((b) => ({
      lower: b.lower,
      upper: b.upper,
      label: shortLabel[b.name],
      barClass: barColor[b.name],
    })),
  );
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

  <TierGauge {segments} value={Number.isFinite(value) ? value : null} {unit} />

  {#if result}
    <p class="mt-3">Risk: <span class={`font-semibold ${tierColor[result.tier]}`}>{result.label}</span></p>
  {/if}
  <p class="mt-2 text-xs text-slate-500">
    Lp(a) is largely genetic, measured ~once in a lifetime, not meaningfully lowered
    by statins or lifestyle, and adds to ApoB-driven risk.
  </p>
  <Sources {sources} />
</div>

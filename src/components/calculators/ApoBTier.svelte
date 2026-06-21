<script lang="ts">
  import { apoBTier, apoBBands, sources } from '../../lib/calculators/apoB';
  import Sources from '../ui/Sources.svelte';
  import TierGauge from '../ui/TierGauge.svelte';

  let value = $state(90);
  const result = $derived(value >= 0 && Number.isFinite(value) ? apoBTier(value) : null);

  const tierColor: Record<string, string> = {
    optimal: 'text-emerald-600',
    borderline: 'text-yellow-600',
    high: 'text-orange-600',
    'very-high': 'text-red-600',
  };
  const barColor: Record<string, string> = {
    optimal: 'bg-emerald-500',
    borderline: 'bg-yellow-400',
    high: 'bg-orange-500',
    'very-high': 'bg-red-600',
  };
  const segments = apoBBands.map((b) => ({
    lower: b.lower,
    upper: b.upper,
    label: b.label,
    barClass: barColor[b.name],
  }));
</script>

<div class="not-prose rounded-xl border border-slate-200 p-5 dark:border-slate-700">
  <label class="block text-sm font-medium">
    Your ApoB (mg/dL)
    <input type="number" min="0" max="300" bind:value
      class="mt-1 block w-32 rounded border border-slate-300 px-2 py-1 dark:bg-slate-800" />
  </label>

  <TierGauge {segments} value={Number.isFinite(value) ? value : null} unit="mg/dL" />

  {#if result}
    <p class="mt-3">
      Tier: <span class={`font-semibold ${tierColor[result.tier]}`}>{result.label}</span>
    </p>
  {/if}
  <Sources {sources} />
</div>

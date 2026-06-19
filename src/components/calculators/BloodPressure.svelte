<script lang="ts">
  import { bpCategory, sources } from '../../lib/calculators/bloodPressure';
  import Sources from '../ui/Sources.svelte';

  let systolic = $state(120);
  let diastolic = $state(80);
  const result = $derived(
    Number.isFinite(systolic) && Number.isFinite(diastolic) && systolic > 0 && diastolic > 0
      ? bpCategory(systolic, diastolic)
      : null,
  );

  const color: Record<string, string> = {
    normal: 'text-emerald-600',
    elevated: 'text-yellow-600',
    'stage-1': 'text-orange-600',
    'stage-2': 'text-red-600',
    crisis: 'text-red-700',
  };
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
    <p class="mt-3">Category: <span class={`font-semibold ${color[result.category]}`}>{result.label}</span></p>
  {/if}
  <Sources {sources} />
</div>

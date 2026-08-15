<script lang="ts">
  import { apoBTier, apoBBands, sources } from "../../lib/calculators/apoB";
  import Sources from "../ui/Sources.svelte";
  import TierGauge from "../ui/TierGauge.svelte";

  let value = $state(90);
  const result = $derived(
    value >= 0 && Number.isFinite(value) ? apoBTier(value) : null,
  );

  const tierColor: Record<string, string> = {
    optimal: "text-emerald-600 dark:text-emerald-400",
    borderline: "text-amber-600 dark:text-amber-400",
    high: "text-orange-600 dark:text-orange-400",
    "very-high": "text-red-600 dark:text-red-400",
  };
  const barColor: Record<string, string> = {
    optimal: "bg-emerald-500",
    borderline: "bg-amber-400",
    high: "bg-orange-500",
    "very-high": "bg-red-600",
  };
  const segments = apoBBands.map((b) => ({
    lower: b.lower,
    upper: b.upper,
    label: b.label,
    barClass: barColor[b.name],
  }));
</script>

<div class="card not-prose">
  <label class="field">
    Your ApoB (mg/dL)
    <input type="number" min="0" max="300" bind:value class="input w-32" />
  </label>

  <TierGauge
    {segments}
    value={Number.isFinite(value) ? value : null}
    unit="mg/dL"
  />

  {#if result}
    <p class="mt-4 text-sm">
      Tier: <span class={`font-semibold ${tierColor[result.tier]}`}
        >{result.label}</span
      >
    </p>
  {/if}
  <Sources {sources} />
</div>

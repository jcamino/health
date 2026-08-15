<script lang="ts">
  import {
    lpaTier,
    lpaBands,
    type LpaUnit,
    sources,
  } from "../../lib/calculators/lpa";
  import Sources from "../ui/Sources.svelte";
  import TierGauge from "../ui/TierGauge.svelte";

  let value = $state(30);
  let unit = $state<LpaUnit>("mg/dL");
  const result = $derived(
    value >= 0 && Number.isFinite(value) ? lpaTier(value, unit) : null,
  );

  const tierColor: Record<string, string> = {
    low: "text-emerald-600 dark:text-emerald-400",
    borderline: "text-amber-600 dark:text-amber-400",
    high: "text-orange-600 dark:text-orange-400",
    "very-high": "text-red-600 dark:text-red-400",
  };
  const barColor: Record<string, string> = {
    low: "bg-emerald-500",
    borderline: "bg-amber-400",
    high: "bg-orange-500",
    "very-high": "bg-red-600",
  };
  const shortLabel: Record<string, string> = {
    low: "Low",
    borderline: "Borderline",
    high: "High",
    "very-high": "Very high",
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

<div class="card not-prose">
  <div class="flex flex-wrap items-end gap-3">
    <label class="field">
      Your Lp(a)
      <input type="number" min="0" bind:value class="input w-28" />
    </label>
    <label class="field">
      Unit
      <select bind:value={unit} class="input">
        <option value="mg/dL">mg/dL</option>
        <option value="nmol/L">nmol/L</option>
      </select>
    </label>
  </div>

  <TierGauge {segments} value={Number.isFinite(value) ? value : null} {unit} />

  {#if result}
    <p class="mt-4 text-sm">
      Risk: <span class={`font-semibold ${tierColor[result.tier]}`}
        >{result.label}</span
      >
    </p>
  {/if}
  <p class="hint">
    Lp(a) is largely genetic, measured ~once in a lifetime, not meaningfully
    lowered by statins or lifestyle, and adds to ApoB-driven risk.
  </p>
  <Sources {sources} />
</div>

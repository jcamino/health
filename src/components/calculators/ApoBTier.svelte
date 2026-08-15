<script lang="ts">
  import { apoBTier, apoBBands, sources } from "../../lib/calculators/apoB";
  import Sources from "../ui/Sources.svelte";
  import TierGauge from "../ui/TierGauge.svelte";

  type ApoBUnit = "mg/dL" | "g/L";

  let value = $state(90);
  let unit = $state<ApoBUnit>("mg/dL");

  // Unlike Lp(a)'s assay-dependent units, ApoB's are a pure mass conversion
  // (1 g/L = 100 mg/dL), so switching units converts the entered value in place.
  function setUnit(next: ApoBUnit) {
    if (next === unit) return;
    if (Number.isFinite(value)) {
      value =
        next === "g/L" ? Math.round(value) / 100 : Math.round(value * 100);
    }
    unit = next;
  }

  const valueMgdl = $derived(unit === "g/L" ? value * 100 : value);
  const result = $derived(
    valueMgdl >= 0 && Number.isFinite(valueMgdl) ? apoBTier(valueMgdl) : null,
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
  const segments = $derived(
    apoBBands.map((b) => ({
      lower: unit === "g/L" ? b.lower / 100 : b.lower,
      upper: b.upper === null ? null : unit === "g/L" ? b.upper / 100 : b.upper,
      label: b.label,
      barClass: barColor[b.name],
    })),
  );
</script>

<div class="card not-prose">
  <div class="flex flex-wrap items-end gap-3">
    <label class="field">
      Your ApoB
      <input
        type="number"
        min="0"
        max={unit === "g/L" ? 3 : 300}
        step={unit === "g/L" ? 0.01 : 1}
        bind:value
        class="input w-32"
      />
    </label>
    <label class="field">
      Unit
      <select
        value={unit}
        onchange={(e) => setUnit(e.currentTarget.value as ApoBUnit)}
        class="input"
      >
        <option value="mg/dL">mg/dL</option>
        <option value="g/L">g/L</option>
      </select>
    </label>
  </div>

  <TierGauge {segments} value={Number.isFinite(value) ? value : null} {unit} />

  {#if result}
    <p class="mt-4 text-sm">
      Tier: <span class={`font-semibold ${tierColor[result.tier]}`}
        >{result.label}</span
      >
    </p>
  {/if}
  <Sources {sources} />
</div>

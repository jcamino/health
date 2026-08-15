<script lang="ts">
  import { homaIr, sources } from "../../lib/calculators/homaIr";
  import Sources from "../ui/Sources.svelte";

  let glucose = $state(90);
  let insulin = $state(8);
  const result = $derived(
    Number.isFinite(glucose) &&
      Number.isFinite(insulin) &&
      glucose > 0 &&
      insulin > 0
      ? homaIr(glucose, insulin)
      : null,
  );
</script>

<div class="card not-prose">
  <div class="flex flex-wrap items-end gap-3">
    <label class="field"
      >Fasting glucose (mg/dL)
      <input
        type="number"
        min="0"
        max="600"
        step="1"
        bind:value={glucose}
        class="input w-32"
      /></label
    >
    <label class="field"
      >Fasting insulin (µU/mL)
      <input
        type="number"
        min="0"
        max="300"
        step="0.1"
        bind:value={insulin}
        class="input w-32"
      /></label
    >
  </div>
  {#if result}
    <p class="mt-4 text-sm">
      HOMA-IR: <span class="font-mono font-semibold"
        >{result.value.toFixed(2)}</span
      >,
      <span
        class={`font-semibold ${result.insulinResistant ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}
      >
        {result.insulinResistant
          ? "above the insulin-resistance cut-point"
          : "below the insulin-resistance cut-point"}
      </span>
    </p>
    <p class="hint">
      Approximate cut-point ≈ {result.cutPoint} (90th percentile in a general adult
      population). HOMA-IR thresholds vary by population, age, and sex. This is an
      illustrative reference point, not a diagnosis.
    </p>
  {:else}
    <p class="mt-4 text-sm text-ink-muted">
      Enter fasting glucose and insulin.
    </p>
  {/if}
  <Sources {sources} />
</div>

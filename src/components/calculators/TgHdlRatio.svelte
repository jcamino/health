<script lang="ts">
  import { tgHdlRatio, sources } from "../../lib/calculators/tgHdlRatio";
  import Sources from "../ui/Sources.svelte";

  let triglycerides = $state(120);
  let hdl = $state(50);
  const result = $derived(
    Number.isFinite(triglycerides) &&
      Number.isFinite(hdl) &&
      triglycerides > 0 &&
      hdl > 0
      ? tgHdlRatio(triglycerides, hdl)
      : null,
  );
</script>

<div class="card not-prose">
  <div class="flex flex-wrap items-end gap-3">
    <label class="field"
      >Triglycerides (mg/dL)
      <input
        type="number"
        min="0"
        max="2000"
        bind:value={triglycerides}
        class="input w-32"
      /></label
    >
    <label class="field"
      >HDL (mg/dL)
      <input
        type="number"
        min="0"
        max="200"
        bind:value={hdl}
        class="input w-28"
      /></label
    >
  </div>
  {#if result}
    <p class="mt-4 text-sm">
      TG/HDL ratio: <span class="font-mono font-semibold"
        >{result.ratio.toFixed(1)}</span
      >,
      <span
        class={`font-semibold ${result.insulinResistanceLikely ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}
      >
        {result.insulinResistanceLikely
          ? "above the insulin-resistance cut-point"
          : "below the insulin-resistance cut-point"}
      </span>
    </p>
    <p class="hint">
      Cut-point ≈ {result.cutPoint.toFixed(1)} (mg/dL units). A surrogate marker of
      insulin resistance, not a diagnosis; performance varies by population.
    </p>
  {:else}
    <p class="mt-4 text-sm text-ink-muted">Enter triglycerides and HDL.</p>
  {/if}
  <Sources {sources} />
</div>

<script lang="ts">
  import { a1cStatus, sources } from "../../lib/calculators/a1c";
  import Sources from "../ui/Sources.svelte";

  let a1c = $state(5.4);
  const result = $derived(
    Number.isFinite(a1c) && a1c > 0 && a1c <= 30 ? a1cStatus(a1c) : null,
  );

  const color: Record<string, string> = {
    normal: "text-emerald-600 dark:text-emerald-400",
    prediabetes: "text-amber-600 dark:text-amber-400",
    diabetes: "text-red-600 dark:text-red-400",
  };
</script>

<div class="card not-prose">
  <div class="flex flex-wrap items-end gap-3">
    <label class="field"
      >A1C (%)
      <input
        type="number"
        min="0"
        max="30"
        step="0.1"
        bind:value={a1c}
        class="input w-28"
      /></label
    >
  </div>
  {#if result}
    <p class="mt-4 text-sm">
      Category: <span class={`font-semibold ${color[result.category]}`}
        >{result.label}</span
      >
    </p>
    <p class="mt-1 text-sm">
      Estimated average glucose: <span class="font-mono font-semibold"
        >{Math.round(result.eAG)} mg/dL</span
      >
    </p>
    <p class="hint">
      ADA cut-points: normal &lt;5.7%, prediabetes 5.7–6.4%, diabetes ≥6.5%. eAG
      via the ADAG regression (28.7 × A1C − 46.7).
    </p>
  {:else}
    <p class="mt-4 text-sm text-ink-muted">Enter your A1C.</p>
  {/if}
  <Sources {sources} />
</div>

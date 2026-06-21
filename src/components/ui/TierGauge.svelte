<script lang="ts">
  // Horizontal green→red risk gauge. Renders each tier as an equal-width colored
  // band labeled with its value range, plus a marker at the current value. Holds
  // no medical thresholds: callers pass bands derived from a sourced calculator.
  interface Segment {
    /** Inclusive lower bound of the band. */
    lower: number;
    /** Exclusive upper bound, or null for the open-ended top band. */
    upper: number | null;
    label: string;
    /** Tailwind background class for the band, e.g. 'bg-emerald-500'. */
    barClass: string;
  }

  let {
    segments,
    value,
    unit = '',
  }: { segments: Segment[]; value: number | null; unit?: string } = $props();

  function rangeText(s: Segment): string {
    if (s.lower <= 0) return `<${s.upper}`;
    if (s.upper === null) return `≥${s.lower}`;
    return `${s.lower}–${s.upper}`;
  }

  // Equal-width bands; the marker sits proportionally within its band. The
  // open-ended top band borrows the previous band's width as a nominal span.
  function markerPercent(v: number): number {
    const n = segments.length;
    const segW = 100 / n;
    for (let i = 0; i < n; i++) {
      const s = segments[i];
      if (s.upper === null) {
        const span = Math.max(s.lower - (segments[i - 1]?.lower ?? 0), 1);
        const f = Math.max(0, Math.min((v - s.lower) / span, 1));
        return i * segW + f * segW;
      }
      if (v < s.upper) {
        const f = Math.max(0, Math.min((v - s.lower) / (s.upper - s.lower), 1));
        return i * segW + f * segW;
      }
    }
    return 100;
  }

  function activeIndex(v: number): number {
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].upper === null || v < segments[i].upper!) return i;
    }
    return segments.length - 1;
  }

  const valid = $derived(value !== null && Number.isFinite(value));
  const pct = $derived(valid ? markerPercent(value as number) : null);
  const activeIdx = $derived(valid ? activeIndex(value as number) : -1);
  const labelPct = $derived(pct === null ? null : Math.max(4, Math.min(96, pct)));
  const ariaLabel = $derived(
    activeIdx < 0
      ? 'Risk band gauge'
      : `Value ${value}${unit ? ` ${unit}` : ''} is in the ${segments[activeIdx].label} band (${rangeText(segments[activeIdx])})`,
  );
</script>

<div class="not-prose mt-3" role="img" aria-label={ariaLabel}>
  <div class="relative pt-7">
    {#if labelPct !== null}
      <div
        class="pointer-events-none absolute top-0 -translate-x-1/2 text-center text-slate-700 dark:text-slate-200"
        style={`left:${labelPct}%`}
      >
        <div class="text-[11px] font-semibold leading-none">{value}{unit ? ` ${unit}` : ''}</div>
        <div class="text-xs leading-none">▼</div>
      </div>
    {/if}
    <div class="flex h-3 overflow-hidden rounded-full">
      {#each segments as s}
        <div class={`flex-1 ${s.barClass}`}></div>
      {/each}
    </div>
  </div>
  <div class="mt-1 flex text-center">
    {#each segments as s, i}
      <div class="min-w-0 flex-1 px-0.5">
        <div
          class={`text-[11px] leading-tight ${i === activeIdx ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-600 dark:text-slate-300'}`}
        >
          {rangeText(s)}
        </div>
        <div class="truncate text-[10px] leading-tight text-slate-500">{s.label}</div>
      </div>
    {/each}
  </div>
</div>

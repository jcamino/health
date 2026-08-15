<script lang="ts">
  import type { Reference } from "../../lib/references";
  let { sources }: { sources: Reference[] } = $props();
</script>

{#if sources.length}
  <section class="mt-5 border-t border-rule pt-3 text-xs text-ink-muted">
    <p class="font-mono text-[10px] font-medium uppercase tracking-[0.16em]">
      Sources
    </p>
    <ul class="mt-1.5 space-y-1">
      {#each sources as ref (ref.id)}
        <li>
          <a
            class="underline underline-offset-2 hover:text-ink"
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ref.authors ? `${ref.authors} ` : ""}{ref.title}{ref.year
              ? ` (${ref.year})`
              : ""}
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}

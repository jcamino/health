<script lang="ts">
  import type { Reference } from '../../lib/references';
  let { sources }: { sources: Reference[] } = $props();
</script>

{#if sources.length}
  <section class="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700">
    <p class="font-semibold">Sources</p>
    <ul class="mt-1 space-y-1">
      {#each sources as ref (ref.id)}
        <li>
          <a class="underline" href={ref.url} target="_blank" rel="noopener noreferrer">
            {ref.authors ? `${ref.authors} ` : ''}{ref.title}{ref.year ? ` (${ref.year})` : ''}
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}

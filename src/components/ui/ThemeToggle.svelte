<script lang="ts">
  import { onMount } from 'svelte';
  let dark = $state(false);
  onMount(() => {
    dark = document.documentElement.classList.contains('dark');
  });
  function toggle() {
    dark = !dark;
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }
</script>

<button
  type="button"
  onclick={toggle}
  aria-label="Toggle dark mode"
  aria-pressed={dark}
  class="rounded p-1 text-lg leading-none hover:bg-slate-100 dark:hover:bg-slate-800"
>{dark ? '☀️' : '🌙'}</button>

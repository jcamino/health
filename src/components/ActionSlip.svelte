<script lang="ts">
  // The heart page's payload: your labs, then your blood pressure. The lines
  // under the labs run in order (the statin line is conditional on the two tests
  // above it, so the order carries information). Everything else on the page is
  // evidence for these, so this is built as a requisition slip — the form you
  // take to your doctor — rather than a callout panel. See .slip in global.css
  // for why it is the page's one inverted block.
  //
  // It also lives as a component rather than inline MDX because formatters
  // reflow JSX in MDX into block context, which splits styled <p> tags apart
  // (MDX parses children that start on their own line as markdown blocks,
  // nesting <p> inside <p>).
  import { onMount } from "svelte";

  // Named when the slip had three checks; kept so existing ticks survive.
  const STORE_KEY = "heart:three-checks";

  const points = [
    {
      title: "Check your labs.",
      note: "Labs",
      checks: [
        {
          id: "lpa",
          href: "#lpa",
          action: "Lp(a), once.",
          detail:
            "A largely genetic risk multiplier. About 1 in 5 people carry a high level, and almost none of them know it.",
          note: "Lp(a) — a one-time test; about 1 in 5 people have an elevated level.",
        },
        {
          id: "apob",
          href: "#apob",
          action: "ApoB.",
          detail:
            "The real driver of atherosclerosis, and a better measure than standard LDL-C.",
          note: "ApoB — a better measure of risk than standard LDL-C.",
        },
        {
          id: "statins",
          href: "#statins",
          // Non-breaking space so the line breaks at the clause, not inside "are up".
          action: "If your numbers are up, ask about a statin.",
          detail:
            "The highest-leverage lever. Guidelines now support starting as early as your 30s.",
          note: "If those are up, whether a statin makes sense now.",
        },
      ],
    },
    {
      title: "Check your blood pressure.",
      note: "Blood pressure",
      checks: [
        {
          id: "bp",
          href: "#blood-pressure",
          action: "Average a week of home readings.",
          detail:
            "Office readings run high. Normal is under 120/80; if your average is 130/80 or higher, take it to your doctor.",
          note: "A week of home readings, averaged; normal is under 120/80.",
        },
      ],
    },
  ];
  const checks = points.flatMap((p) => p.checks);

  let done = $state<Record<string, boolean>>({});
  let copyState = $state<"idle" | "copied" | "failed">("idle");
  let timer: ReturnType<typeof setTimeout> | undefined;

  const doneCount = $derived(checks.filter((c) => done[c.id]).length);

  // Ticks are a local to-do, not health data: a few booleans, this browser only.
  onMount(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) done = JSON.parse(raw);
    } catch {
      // Private mode or a corrupt value: start unticked.
    }
    return () => clearTimeout(timer);
  });

  function toggle(id: string) {
    done = { ...done, [id]: !done[id] };
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(done));
    } catch {
      // Nothing to persist to; the ticks still work for this visit.
    }
  }

  async function copyList() {
    const text = [
      "Two things to ask about (from health.jcamino.net/heart/):",
      "",
      ...points.flatMap((p, i) => [
        `${i + 1}. ${p.note}`,
        ...p.checks.map((c) => `   - ${c.note}`),
      ]),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      copyState = "copied";
    } catch {
      copyState = "failed";
    }
    clearTimeout(timer);
    timer = setTimeout(() => (copyState = "idle"), 2500);
  }

  const copyLabel = $derived(
    { idle: "Copy the list", copied: "Copied", failed: "Couldn't copy" }[
      copyState
    ],
  );
</script>

<aside class="slip not-prose" aria-labelledby="action-slip-title">
  <header class="slip-head">
    <h2 class="slip-title" id="action-slip-title">If you do only two things</h2>
    <p class="slip-sub">One blood draw · one week of home readings</p>
  </header>

  <ol>
    {#each points as point, i (point.title)}
      <li class="slip-point">
        <p class="slip-point-title">
          <span class="slip-n" aria-hidden="true">{i + 1}</span>
          <span>{point.title}</span>
        </p>
        <ol>
          {#each point.checks as check (check.id)}
            <li class="slip-row" class:is-done={done[check.id]}>
              <input
                type="checkbox"
                class="slip-check"
                checked={!!done[check.id]}
                onchange={() => toggle(check.id)}
                aria-label={`Mark done: ${check.action}`}
              />
              <p class="slip-action">
                <a href={check.href}>{check.action}</a>
              </p>
              <p class="slip-detail">{check.detail}</p>
            </li>
          {/each}
        </ol>
      </li>
    {/each}
  </ol>

  <div class="slip-foot">
    <p>
      {doneCount > 0
        ? `${doneCount} of ${checks.length} done`
        : "Tick these off as you go"} — saved in this browser only.
    </p>
    <button type="button" class="slip-copy" onclick={copyList}>
      {copyLabel}
    </button>
  </div>
</aside>

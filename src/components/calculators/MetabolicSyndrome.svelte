<script lang="ts">
  import {
    evaluateCriteria,
    metabolicSyndrome,
    waistThresholdCm,
    sources,
    type Sex,
  } from "../../lib/calculators/metabolicSyndrome";
  import Sources from "../ui/Sources.svelte";

  let sex = $state<Sex>("male");
  let waistCm = $state(90);
  let triglyceridesMgDl = $state(120);
  let hdlMgDl = $state(50);
  let systolic = $state(120);
  let diastolic = $state(78);
  let glucoseMgDl = $state(92);
  let bpTreated = $state(false);
  let lipidTreated = $state(false);
  let glucoseTreated = $state(false);

  const allFinite = $derived(
    [
      waistCm,
      triglyceridesMgDl,
      hdlMgDl,
      systolic,
      diastolic,
      glucoseMgDl,
    ].every((n) => Number.isFinite(n) && n > 0),
  );

  const criteria = $derived(
    allFinite
      ? evaluateCriteria({
          sex,
          waistCm,
          triglyceridesMgDl,
          hdlMgDl,
          systolic,
          diastolic,
          glucoseMgDl,
          bpTreated,
          lipidTreated,
          glucoseTreated,
        })
      : null,
  );
  const result = $derived(criteria ? metabolicSyndrome(criteria) : null);
  const waistCut = $derived(waistThresholdCm(sex));

  const rows = $derived(
    criteria
      ? [
          {
            key: "waist",
            met: criteria.waist,
            label: `Waist ≥ ${waistCut} cm`,
          },
          {
            key: "tg",
            met: criteria.triglycerides,
            label: "Triglycerides ≥ 150 mg/dL (or treated)",
          },
          {
            key: "hdl",
            met: criteria.hdl,
            label: `HDL < ${sex === "male" ? 40 : 50} mg/dL (or treated)`,
          },
          {
            key: "bp",
            met: criteria.bloodPressure,
            label: "BP ≥ 130/85 mmHg (or treated)",
          },
          {
            key: "glu",
            met: criteria.glucose,
            label: "Fasting glucose ≥ 100 mg/dL (or treated)",
          },
        ]
      : [],
  );
</script>

<div class="card not-prose">
  <div class="flex flex-wrap items-end gap-3">
    <label class="field"
      >Sex
      <select bind:value={sex} class="input">
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select></label
    >
    <label class="field"
      >Waist (cm)
      <input
        type="number"
        min="0"
        max="250"
        bind:value={waistCm}
        class="input w-24"
      /></label
    >
    <label class="field"
      >Triglycerides (mg/dL)
      <input
        type="number"
        min="0"
        max="2000"
        bind:value={triglyceridesMgDl}
        class="input w-28"
      /></label
    >
    <label class="field"
      >HDL (mg/dL)
      <input
        type="number"
        min="0"
        max="200"
        bind:value={hdlMgDl}
        class="input w-24"
      /></label
    >
    <label class="field"
      >Systolic (mmHg)
      <input
        type="number"
        min="0"
        max="300"
        bind:value={systolic}
        class="input w-24"
      /></label
    >
    <label class="field"
      >Diastolic (mmHg)
      <input
        type="number"
        min="0"
        max="200"
        bind:value={diastolic}
        class="input w-24"
      /></label
    >
    <label class="field"
      >Fasting glucose (mg/dL)
      <input
        type="number"
        min="0"
        max="600"
        bind:value={glucoseMgDl}
        class="input w-28"
      /></label
    >
  </div>

  <div class="mt-4 flex flex-wrap gap-4 text-sm">
    <label class="flex items-center gap-2"
      ><input type="checkbox" bind:checked={bpTreated} /> On BP medication</label
    >
    <label class="flex items-center gap-2"
      ><input type="checkbox" bind:checked={lipidTreated} /> On lipid medication</label
    >
    <label class="flex items-center gap-2"
      ><input type="checkbox" bind:checked={glucoseTreated} /> On glucose medication</label
    >
  </div>

  {#if result}
    <ul class="mt-4 space-y-1 text-sm">
      {#each rows as row (row.key)}
        <li>
          <span
            class={`font-mono ${row.met ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}
            >{row.met ? "✓" : "·"}</span
          >
          {row.label}
        </li>
      {/each}
    </ul>
    <p class="mt-4 text-sm">
      <span class="font-mono font-semibold">{result.count} of 5</span> criteria
      met,
      <span
        class={`font-semibold ${result.meets ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
      >
        {result.meets
          ? "meets metabolic syndrome"
          : "does not meet metabolic syndrome"}
      </span>
    </p>
    <p class="hint">
      Waist cut-points are population-specific; shown here are the AHA/NHLBI
      (US) values (≥102 cm men, ≥88 cm women). Diagnosis = any 3 of 5.
    </p>
  {:else}
    <p class="mt-4 text-sm text-ink-muted">Enter all measurements.</p>
  {/if}
  <Sources {sources} />
</div>

import { refs, type Reference } from '../references';

export const sources: Reference[] = [
  refs.easLdlCausality2017,
  refs.snidermanApoB2019,
  refs.ferenceLipids2018,
];

export interface ApoBPoint {
  age: number;
  apoB: number; // mg/dL
}

export interface TrajectoryParams {
  /** The person's age now (anchor). */
  currentAge: number;
  /** ApoB (mg/dL) at currentAge (anchor). */
  currentApoB: number;
  /** Age-related rise in ApoB, mg/dL per YEAR (UI typically supplies per-decade / 10). >= 0. */
  risePerYear: number;
  /** Project cumulative exposure out to this age. */
  endAge: number;
  /** Where integration begins; defaults to 0 (birth). */
  startAge?: number;
  /** Optional intervention: at `age`, ApoB drops to `apoB` and is then held flat. */
  intervention?: { age: number; apoB: number };
}

/** Hard floor so back-extrapolation can't yield non-physiologic ApoB. */
const MIN_APOB = 10;

/**
 * Illustrative cumulative-exposure threshold, 5000 mg·years. This is a sourced
 * *LDL-C* value (Ference et al., JACC Health Promotion Series 2018), not an
 * ApoB-specific one; the hero chart labels the line "illustrative (LDL-C–derived)".
 */
export const CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS = 5000;

/** ApoB on the untreated, age-rising line, anchored at currentApoB @ currentAge. */
function risingApoB(age: number, p: TrajectoryParams): number {
  return Math.max(MIN_APOB, p.currentApoB + p.risePerYear * (age - p.currentAge));
}

/**
 * Build a lifetime ApoB trajectory (piecewise linear) from `startAge` (default 0
 * = birth) to `endAge`. ApoB rises with age at `risePerYear`, anchored to the
 * user's current value. An optional intervention drops ApoB at a given age and
 * holds it flat thereafter.
 */
export function buildTrajectory(p: TrajectoryParams): ApoBPoint[] {
  const startAge = p.startAge ?? 0;
  if (!Number.isFinite(startAge) || startAge < 0) {
    throw new Error('buildTrajectory: startAge must be a finite value >= 0');
  }
  if (!(p.endAge > startAge)) {
    throw new Error('buildTrajectory: endAge must be greater than startAge');
  }
  if (![p.currentAge, p.currentApoB, p.risePerYear].every((n) => Number.isFinite(n))) {
    throw new Error('buildTrajectory: currentAge, currentApoB and risePerYear must be finite');
  }
  if (p.currentApoB <= 0) throw new Error('buildTrajectory: currentApoB must be positive');
  if (p.risePerYear < 0) throw new Error('buildTrajectory: risePerYear must be >= 0');

  if (p.intervention) {
    const { age, apoB } = p.intervention;
    if (!Number.isFinite(age) || !Number.isFinite(apoB)) {
      throw new Error('buildTrajectory: intervention values must be finite');
    }
    if (age <= startAge || age >= p.endAge) {
      throw new Error('buildTrajectory: intervention age must be within (startAge, endAge)');
    }
    if (apoB <= 0) throw new Error('buildTrajectory: intervention apoB must be positive');
    const held = Math.max(MIN_APOB, apoB);
    return [
      { age: startAge, apoB: risingApoB(startAge, p) },
      { age, apoB: risingApoB(age, p) }, // pre-intervention (rising)
      { age, apoB: held }, // drop
      { age: p.endAge, apoB: held }, // held flat
    ];
  }
  return [
    { age: startAge, apoB: risingApoB(startAge, p) },
    { age: p.endAge, apoB: risingApoB(p.endAge, p) },
  ];
}

/**
 * Fine-grained (default yearly) samples of the same model `buildTrajectory`
 * describes, used for charting so the cumulative-exposure curve shows its true
 * convex shape when ApoB rises with age. (A 2-point trajectory draws a straight
 * chord and hides the curvature.) Integrates to the same area as
 * `buildTrajectory` for integer intervention ages.
 */
export function sampleTrajectory(p: TrajectoryParams, stepYears = 1): ApoBPoint[] {
  buildTrajectory(p); // reuse input validation (throws on invalid input)
  const startAge = p.startAge ?? 0;
  const valueAt = (age: number): number =>
    p.intervention && age >= p.intervention.age
      ? Math.max(MIN_APOB, p.intervention.apoB)
      : risingApoB(age, p);

  const ages = new Set<number>();
  for (let a = startAge; a <= p.endAge; a += stepYears) ages.add(Math.min(a, p.endAge));
  ages.add(p.endAge);
  if (p.intervention) ages.add(p.intervention.age);

  const out: ApoBPoint[] = [];
  for (const age of [...ages].sort((x, y) => x - y)) {
    if (p.intervention && age === p.intervention.age) {
      out.push({ age, apoB: risingApoB(age, p) }); // pre-intervention (rising)
      out.push({ age, apoB: Math.max(MIN_APOB, p.intervention.apoB) }); // held after
    } else {
      out.push({ age, apoB: valueAt(age) });
    }
  }
  return out;
}

/** Trapezoidal integral of ApoB over age. Units: (mg/dL)·years. */
export function apoBYears(trajectory: ApoBPoint[]): number {
  let total = 0;
  for (let i = 1; i < trajectory.length; i++) {
    const dt = trajectory[i].age - trajectory[i - 1].age;
    const avg = (trajectory[i].apoB + trajectory[i - 1].apoB) / 2;
    total += dt * avg;
  }
  return total;
}

/** Running cumulative exposure at each trajectory point. */
export function cumulativeSeries(trajectory: ApoBPoint[]): { age: number; cumulative: number }[] {
  const out = [{ age: trajectory[0].age, cumulative: 0 }];
  let total = 0;
  for (let i = 1; i < trajectory.length; i++) {
    const dt = trajectory[i].age - trajectory[i - 1].age;
    const avg = (trajectory[i].apoB + trajectory[i - 1].apoB) / 2;
    total += dt * avg;
    out.push({ age: trajectory[i].age, cumulative: total });
  }
  return out;
}

/** Age at which cumulative exposure crosses `threshold`, or null if never. */
export function ageAtThreshold(trajectory: ApoBPoint[], threshold: number): number | null {
  const s = cumulativeSeries(trajectory);
  for (let i = 1; i < s.length; i++) {
    if (s[i].cumulative >= threshold) {
      const span = s[i].cumulative - s[i - 1].cumulative;
      if (span === 0) return s[i].age;
      const frac = (threshold - s[i - 1].cumulative) / span;
      return s[i - 1].age + frac * (s[i].age - s[i - 1].age);
    }
  }
  return null;
}

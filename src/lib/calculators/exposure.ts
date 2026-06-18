import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.easLdlCausality2017, refs.snidermanApoB2019];

export interface ApoBPoint {
  age: number;
  apoB: number; // mg/dL
}

export interface TrajectoryParams {
  startAge: number;
  endAge: number;
  baselineApoB: number;
  intervention?: { age: number; apoB: number };
}

/**
 * Illustrative cumulative-exposure threshold. ~5,000 is the commonly cited
 * anchor for cumulative *LDL-C* (mg·years) in the FH/causality literature; the
 * ApoB-equivalent must be confirmed in Task 7 Step 6. Until confirmed, the hero
 * chart labels this line "illustrative (LDL-C–derived)".
 */
export const CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS = 5000;

export function buildTrajectory(p: TrajectoryParams): ApoBPoint[] {
  if (!(p.endAge > p.startAge)) {
    throw new Error('buildTrajectory: endAge must be greater than startAge');
  }
  if (p.intervention) {
    const { age, apoB } = p.intervention;
    if (age <= p.startAge || age >= p.endAge) {
      throw new Error('buildTrajectory: intervention age must be within (startAge, endAge)');
    }
    return [
      { age: p.startAge, apoB: p.baselineApoB },
      { age, apoB: p.baselineApoB },
      { age, apoB },
      { age: p.endAge, apoB },
    ];
  }
  return [
    { age: p.startAge, apoB: p.baselineApoB },
    { age: p.endAge, apoB: p.baselineApoB },
  ];
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

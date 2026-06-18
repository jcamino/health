import { describe, it, expect } from 'vitest';
import {
  buildTrajectory,
  apoBYears,
  cumulativeSeries,
  ageAtThreshold,
  CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS,
  sources,
} from '../src/lib/calculators/exposure';

describe('buildTrajectory', () => {
  it('flat trajectory has two points', () => {
    const t = buildTrajectory({ startAge: 20, endAge: 50, baselineApoB: 100 });
    expect(t).toEqual([
      { age: 20, apoB: 100 },
      { age: 50, apoB: 100 },
    ]);
  });

  it('intervention inserts a step down at the intervention age', () => {
    const t = buildTrajectory({
      startAge: 20,
      endAge: 60,
      baselineApoB: 100,
      intervention: { age: 40, apoB: 60 },
    });
    expect(t).toEqual([
      { age: 20, apoB: 100 },
      { age: 40, apoB: 100 },
      { age: 40, apoB: 60 },
      { age: 60, apoB: 60 },
    ]);
  });

  it('rejects endAge <= startAge and out-of-range intervention', () => {
    expect(() => buildTrajectory({ startAge: 50, endAge: 50, baselineApoB: 100 })).toThrow();
    expect(() =>
      buildTrajectory({ startAge: 20, endAge: 60, baselineApoB: 100, intervention: { age: 70, apoB: 60 } }),
    ).toThrow();
  });
});

describe('apoBYears (trapezoidal AUC, mg·years)', () => {
  it('flat 100 mg/dL for 30 years = 3000', () => {
    expect(apoBYears(buildTrajectory({ startAge: 20, endAge: 50, baselineApoB: 100 }))).toBeCloseTo(3000);
  });

  it('intervention reduces the area', () => {
    const t = buildTrajectory({ startAge: 20, endAge: 60, baselineApoB: 100, intervention: { age: 40, apoB: 60 } });
    // 20y @100 = 2000, 20y @60 = 1200 => 3200
    expect(apoBYears(t)).toBeCloseTo(3200);
  });
});

describe('cumulativeSeries', () => {
  it('starts at 0 and ends at the total AUC', () => {
    const t = buildTrajectory({ startAge: 20, endAge: 50, baselineApoB: 100 });
    const s = cumulativeSeries(t);
    expect(s[0]).toEqual({ age: 20, cumulative: 0 });
    expect(s.at(-1)!.cumulative).toBeCloseTo(3000);
  });
});

describe('ageAtThreshold', () => {
  it('finds the crossing age by linear interpolation', () => {
    const t = buildTrajectory({ startAge: 0, endAge: 100, baselineApoB: 100 });
    // cumulative = 100 * age; crosses 5000 at age 50
    expect(ageAtThreshold(t, 5000)).toBeCloseTo(50);
  });

  it('returns null when the threshold is never reached', () => {
    const t = buildTrajectory({ startAge: 20, endAge: 30, baselineApoB: 50 });
    expect(ageAtThreshold(t, 5000)).toBeNull();
  });
});

describe('exposure module', () => {
  it('exposes a positive threshold constant and sources', () => {
    expect(CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS).toBeGreaterThan(0);
    expect(sources.length).toBeGreaterThan(0);
  });
});

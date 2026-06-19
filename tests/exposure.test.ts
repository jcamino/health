import { describe, it, expect } from 'vitest';
import {
  buildTrajectory,
  apoBYears,
  cumulativeSeries,
  ageAtThreshold,
  CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS,
  sources,
} from '../src/lib/calculators/exposure';

describe('buildTrajectory (lifetime, from birth, with age-rise)', () => {
  it('flat (rise 0) integrates from birth as two points', () => {
    const t = buildTrajectory({ currentAge: 20, currentApoB: 100, risePerYear: 0, endAge: 50 });
    expect(t).toEqual([
      { age: 0, apoB: 100 },
      { age: 50, apoB: 100 },
    ]);
  });

  it('rises linearly with age, anchored at currentApoB @ currentAge', () => {
    const t = buildTrajectory({ currentAge: 0, currentApoB: 100, risePerYear: 2, endAge: 10 });
    expect(t).toEqual([
      { age: 0, apoB: 100 },
      { age: 10, apoB: 120 },
    ]);
  });

  it('back-extrapolates to birth below the current value', () => {
    const t = buildTrajectory({ currentAge: 40, currentApoB: 100, risePerYear: 1, startAge: 0, endAge: 40 });
    expect(t).toEqual([
      { age: 0, apoB: 60 },
      { age: 40, apoB: 100 },
    ]);
  });

  it('clamps non-physiologic back-extrapolation to the floor (10)', () => {
    const t = buildTrajectory({ currentAge: 60, currentApoB: 50, risePerYear: 2, startAge: 0, endAge: 60 });
    expect(t[0]).toEqual({ age: 0, apoB: 10 });
    expect(t[1]).toEqual({ age: 60, apoB: 50 });
  });

  it('intervention drops ApoB and holds it flat after', () => {
    const t = buildTrajectory({
      currentAge: 20,
      currentApoB: 100,
      risePerYear: 0,
      startAge: 0,
      endAge: 60,
      intervention: { age: 40, apoB: 60 },
    });
    expect(t).toEqual([
      { age: 0, apoB: 100 },
      { age: 40, apoB: 100 },
      { age: 40, apoB: 60 },
      { age: 60, apoB: 60 },
    ]);
  });

  it('rejects bad inputs', () => {
    expect(() => buildTrajectory({ currentAge: 40, currentApoB: 90, risePerYear: 0, endAge: 0 })).toThrow();
    expect(() => buildTrajectory({ currentAge: 40, currentApoB: -1, risePerYear: 0, endAge: 80 })).toThrow();
    expect(() => buildTrajectory({ currentAge: 40, currentApoB: 90, risePerYear: 0, endAge: 80, intervention: { age: 0, apoB: 60 } })).toThrow();
    expect(() => buildTrajectory({ currentAge: 40, currentApoB: 90, risePerYear: NaN, endAge: 80 })).toThrow();
  });
});

describe('apoBYears (trapezoidal AUC, mg·years)', () => {
  it('flat 100 from birth to 50 = 5000', () => {
    expect(apoBYears(buildTrajectory({ currentAge: 20, currentApoB: 100, risePerYear: 0, endAge: 50 }))).toBeCloseTo(5000);
  });

  it('back-extrapolated rise 60->100 over 0-40 = 3200', () => {
    const t = buildTrajectory({ currentAge: 40, currentApoB: 100, risePerYear: 1, startAge: 0, endAge: 40 });
    expect(apoBYears(t)).toBeCloseTo(3200);
  });

  it('intervention reduces the area', () => {
    const t = buildTrajectory({ currentAge: 20, currentApoB: 100, risePerYear: 0, startAge: 0, endAge: 60, intervention: { age: 40, apoB: 60 } });
    expect(apoBYears(t)).toBeCloseTo(5200);
  });
});

describe('cumulativeSeries', () => {
  it('starts at 0 and ends at total AUC', () => {
    const t = buildTrajectory({ currentAge: 20, currentApoB: 100, risePerYear: 0, endAge: 50 });
    const s = cumulativeSeries(t);
    expect(s[0]).toEqual({ age: 0, cumulative: 0 });
    expect(s.at(-1)!.cumulative).toBeCloseTo(5000);
  });
});

describe('ageAtThreshold', () => {
  it('finds the crossing age (flat 100 crosses 5000 at age 50)', () => {
    const t = buildTrajectory({ currentAge: 0, currentApoB: 100, risePerYear: 0, startAge: 0, endAge: 100 });
    expect(ageAtThreshold(t, 5000)).toBeCloseTo(50);
  });
  it('returns null when never reached', () => {
    const t = buildTrajectory({ currentAge: 0, currentApoB: 50, risePerYear: 0, startAge: 0, endAge: 30 });
    expect(ageAtThreshold(t, 5000)).toBeNull();
  });
});

describe('exposure module', () => {
  it('exposes a positive threshold and sources', () => {
    expect(CUMULATIVE_EXPOSURE_THRESHOLD_MG_YEARS).toBeGreaterThan(0);
    expect(sources.length).toBeGreaterThan(0);
  });
});

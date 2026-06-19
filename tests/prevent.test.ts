import { describe, it, expect } from 'vitest';
import { preventAscvd10yr, sources } from '../src/lib/calculators/prevent';
import type { PreventInput } from '../src/lib/calculators/prevent';

/**
 * Worked examples transcribed from the supplemental appendix of Khan SS et al.,
 * "Development and Validation of the American Heart Association's PREVENT
 * Equations," Circulation 2024;149:430-449 (DOI 10.1161/CIRCULATIONAHA.123.067626).
 *
 * Base model, 10-year ASCVD outcome:
 *  - Female example (supplemental Table S25 / supplemental Excel): the inputs
 *    below yield a 10-year ASCVD risk of 0.092 (9.2%).
 *  - Male counterpart (same inputs, sex = male): 0.102 (10.2%).
 *
 * Both values were independently re-derived from the published coefficients and
 * transformations (logistic model, cholesterol in mmol/L = mg/dL / 38.67).
 */

const baseFemale: PreventInput = {
  age: 50,
  sex: 'female',
  totalCholesterol: 200, // mg/dL
  hdl: 45, // mg/dL
  systolicBP: 160,
  bpTreated: true,
  diabetic: true,
  smoker: false,
  egfr: 90,
};

const baseMale: PreventInput = { ...baseFemale, sex: 'male' };

describe('preventAscvd10yr (AHA PREVENT 2024, base 10-year ASCVD)', () => {
  it('matches the published female worked example (9.2%)', () => {
    const { tenYearPercent } = preventAscvd10yr(baseFemale);
    expect(tenYearPercent).toBeCloseTo(9.2, 0); // within ~0.5 absolute %
    expect(Math.abs(tenYearPercent - 9.2)).toBeLessThanOrEqual(0.5);
  });

  it('matches the male counterpart worked example (10.2%)', () => {
    const { tenYearPercent } = preventAscvd10yr(baseMale);
    expect(Math.abs(tenYearPercent - 10.2)).toBeLessThanOrEqual(0.5);
  });

  it('returns a higher risk for an older, smoking, untreated-hypertensive male', () => {
    const low = preventAscvd10yr({
      age: 40,
      sex: 'female',
      totalCholesterol: 170,
      hdl: 60,
      systolicBP: 110,
      bpTreated: false,
      diabetic: false,
      smoker: false,
      egfr: 100,
    });
    const high = preventAscvd10yr({
      age: 70,
      sex: 'male',
      totalCholesterol: 260,
      hdl: 35,
      systolicBP: 160,
      bpTreated: false,
      diabetic: true,
      smoker: true,
      egfr: 55,
    });
    expect(high.tenYearPercent).toBeGreaterThan(low.tenYearPercent);
    expect(low.tenYearPercent).toBeGreaterThan(0);
    expect(high.tenYearPercent).toBeLessThan(100);
  });

  it('rejects out-of-range age (validated for 30-79)', () => {
    expect(() => preventAscvd10yr({ ...baseFemale, age: 25 })).toThrow();
    expect(() => preventAscvd10yr({ ...baseFemale, age: 85 })).toThrow();
  });

  it('rejects non-finite inputs', () => {
    expect(() => preventAscvd10yr({ ...baseFemale, totalCholesterol: NaN })).toThrow();
    expect(() => preventAscvd10yr({ ...baseFemale, hdl: Infinity })).toThrow();
    expect(() => preventAscvd10yr({ ...baseFemale, systolicBP: NaN })).toThrow();
    expect(() => preventAscvd10yr({ ...baseFemale, egfr: Number.NaN })).toThrow();
  });

  it('ships a non-empty sources list', () => {
    expect(sources.length).toBeGreaterThan(0);
    expect(sources[0].doi).toBe('10.1161/CIRCULATIONAHA.123.067626');
  });
});

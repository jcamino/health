import { describe, it, expect } from 'vitest';
import { a1cStatus, eAG, sources } from '../src/lib/calculators/a1c';

describe('eAG (ADAG, Nathan 2008): eAG = 28.7 * A1C - 46.7', () => {
  it('reproduces published ADAG worked-example anchors within the table rounding tolerance', () => {
    // Published ADAG eAG table values (Diabetes Care 2008;31:1473-8):
    //   A1C 6% -> 126 mg/dL, 7% -> 154 mg/dL, 8% -> 183 mg/dL.
    // 28.7*6 - 46.7 = 125.5 (table rounds half-up to 126); assert within ±0.5
    // of the unrounded value and within ±1 mg/dL of each published table value.
    expect(eAG(6)).toBeCloseTo(125.5, 5);
    expect(Math.abs(eAG(6) - 126)).toBeLessThanOrEqual(1);
    expect(eAG(7)).toBeCloseTo(154.2, 1);
    expect(Math.abs(eAG(7) - 154)).toBeLessThanOrEqual(1);
    expect(eAG(8)).toBeCloseTo(182.9, 1);
    expect(Math.abs(eAG(8) - 183)).toBeLessThanOrEqual(1);
  });

  it('throws on non-finite or non-physiologic A1C', () => {
    expect(() => eAG(NaN)).toThrow();
    expect(() => eAG(Infinity)).toThrow();
    expect(() => eAG(0)).toThrow();
    expect(() => eAG(-1)).toThrow();
    expect(() => eAG(60)).toThrow(); // implausibly high
  });
});

describe('a1cStatus (ADA: normal <5.7, prediabetes 5.7-6.4, diabetes >=6.5)', () => {
  it('classifies representative values', () => {
    expect(a1cStatus(5.4).category).toBe('normal');
    expect(a1cStatus(6.0).category).toBe('prediabetes');
    expect(a1cStatus(7.2).category).toBe('diabetes');
  });

  it('respects ADA category boundaries exactly', () => {
    expect(a1cStatus(5.69).category).toBe('normal');
    expect(a1cStatus(5.7).category).toBe('prediabetes');
    expect(a1cStatus(6.4).category).toBe('prediabetes');
    expect(a1cStatus(6.49).category).toBe('prediabetes');
    expect(a1cStatus(6.5).category).toBe('diabetes');
  });

  it('includes the eAG on the result', () => {
    expect(a1cStatus(7).eAG).toBeCloseTo(154.2, 1);
  });

  it('validates input and ships sources', () => {
    expect(() => a1cStatus(0)).toThrow();
    expect(() => a1cStatus(NaN)).toThrow();
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((s) => s.doi === '10.2337/dc24-S002')).toBe(true);
    expect(sources.some((s) => s.doi === '10.2337/dc08-0545')).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { homaIr, sources } from '../src/lib/calculators/homaIr';

describe('homaIr (Matthews 1985)', () => {
  it('computes the value via glucose(mg/dL) * insulin(uU/mL) / 405', () => {
    // 100 mg/dL * 5 uU/mL / 405 = 1.2345...
    expect(homaIr(100, 5).value).toBeCloseTo(1.2346, 3);
    // 90 * 4.05 / 405 = 0.9 exactly
    expect(homaIr(90, 4.05).value).toBeCloseTo(0.9, 6);
    // 180 * 15 / 405 = 6.6666...
    expect(homaIr(180, 15).value).toBeCloseTo(6.6667, 3);
  });

  it('classifies relative to the cited EPIRCE 3.46 cut-point (insulin-resistant at/above)', () => {
    // just below 3.46: 100 * 14 / 405 = 3.4568 -> not insulin resistant
    expect(homaIr(100, 14).insulinResistant).toBe(false);
    expect(homaIr(100, 14).category).toBe('normal');
    // at/above 3.46: 100 * 15 / 405 = 3.7037 -> insulin resistant
    expect(homaIr(100, 15).insulinResistant).toBe(true);
    expect(homaIr(100, 15).category).toBe('insulin-resistant');
  });

  it('respects the cut-point boundary exactly (3.46)', () => {
    // construct an input that lands on exactly 3.46: insulin = 3.46*405/glucose
    const glucose = 100;
    const insulinAtCut = (3.46 * 405) / glucose; // 14.013
    expect(homaIr(glucose, insulinAtCut).value).toBeCloseTo(3.46, 6);
    expect(homaIr(glucose, insulinAtCut).insulinResistant).toBe(true); // >= cut-point
    const insulinJustBelow = (3.4599 * 405) / glucose;
    expect(homaIr(glucose, insulinJustBelow).insulinResistant).toBe(false);
  });

  it('throws on non-finite or non-physiologic inputs', () => {
    expect(() => homaIr(NaN, 5)).toThrow();
    expect(() => homaIr(100, Infinity)).toThrow();
    expect(() => homaIr(0, 5)).toThrow();
    expect(() => homaIr(100, 0)).toThrow();
    expect(() => homaIr(-100, 5)).toThrow();
    expect(() => homaIr(100, -5)).toThrow();
  });

  it('ships a non-empty sources list including Matthews and the cut-point source', () => {
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((s) => s.doi === '10.1007/BF00280883')).toBe(true);
    expect(sources.some((s) => s.doi === '10.1186/1472-6823-13-47')).toBe(true);
  });
});

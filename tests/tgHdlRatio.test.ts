import { describe, it, expect } from 'vitest';
import { tgHdlRatio, sources } from '../src/lib/calculators/tgHdlRatio';

describe('tgHdlRatio (McLaughlin 2003, mg/dL units)', () => {
  it('computes triglycerides / HDL in mg/dL', () => {
    expect(tgHdlRatio(150, 50).ratio).toBeCloseTo(3, 6);
    expect(tgHdlRatio(90, 60).ratio).toBeCloseTo(1.5, 6);
    expect(tgHdlRatio(300, 40).ratio).toBeCloseTo(7.5, 6);
  });

  it('flags likely insulin resistance at/above the cited 3.0 cut-point', () => {
    expect(tgHdlRatio(149, 50).insulinResistanceLikely).toBe(false); // 2.98
    expect(tgHdlRatio(150, 50).insulinResistanceLikely).toBe(true); // exactly 3.0
    expect(tgHdlRatio(151, 50).insulinResistanceLikely).toBe(true); // 3.02
  });

  it('throws on non-finite or non-positive inputs', () => {
    expect(() => tgHdlRatio(NaN, 50)).toThrow();
    expect(() => tgHdlRatio(150, 0)).toThrow();
    expect(() => tgHdlRatio(-150, 50)).toThrow();
    expect(() => tgHdlRatio(150, Infinity)).toThrow();
  });

  it('ships the McLaughlin source', () => {
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((s) => s.doi === '10.7326/0003-4819-139-10-200311180-00007')).toBe(true);
  });
});

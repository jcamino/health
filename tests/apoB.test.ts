import { describe, it, expect } from 'vitest';
import { apoBTier, apoBBands, sources } from '../src/lib/calculators/apoB';

describe('apoBTier', () => {
  it('classifies representative values', () => {
    expect(apoBTier(55).tier).toBe('optimal');
    expect(apoBTier(70).tier).toBe('borderline');
    expect(apoBTier(90).tier).toBe('high');
    expect(apoBTier(120).tier).toBe('very-high');
  });

  it('uses correct boundaries (lower bound inclusive of the higher tier)', () => {
    expect(apoBTier(64.9).tier).toBe('optimal');
    expect(apoBTier(65).tier).toBe('borderline');
    expect(apoBTier(80).tier).toBe('high');
    expect(apoBTier(100).tier).toBe('very-high');
  });

  it('rejects non-physiologic input', () => {
    expect(() => apoBTier(-1)).toThrow();
    expect(() => apoBTier(NaN)).toThrow();
  });

  it('ships with at least one source', () => {
    expect(sources.length).toBeGreaterThan(0);
  });
});

describe('apoBBands', () => {
  it('are ascending, contiguous, and open-ended at the top', () => {
    expect(apoBBands.map((b) => b.lower)).toEqual([0, 65, 80, 100]);
    expect(apoBBands.map((b) => b.upper)).toEqual([65, 80, 100, null]);
  });

  it('agree with apoBTier at representative values', () => {
    for (const v of [10, 64, 65, 79, 80, 99, 100, 150]) {
      const band = apoBBands.find((b) => b.upper === null || v < b.upper)!;
      expect(band.name).toBe(apoBTier(v).tier);
    }
  });
});

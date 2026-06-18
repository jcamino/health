import { describe, it, expect } from 'vitest';
import { apoBTier, sources } from '../src/lib/calculators/apoB';

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

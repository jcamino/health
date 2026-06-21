import { describe, it, expect } from 'vitest';
import { lpaTier, lpaBands, sources } from '../src/lib/calculators/lpa';

describe('lpaTier (mg/dL)', () => {
  it('classifies representative values', () => {
    expect(lpaTier(20, 'mg/dL').tier).toBe('low');
    expect(lpaTier(40, 'mg/dL').tier).toBe('borderline');
    expect(lpaTier(90, 'mg/dL').tier).toBe('high');
    expect(lpaTier(200, 'mg/dL').tier).toBe('very-high');
  });
  it('boundaries are lower-inclusive of the higher tier', () => {
    expect(lpaTier(29.9, 'mg/dL').tier).toBe('low');
    expect(lpaTier(30, 'mg/dL').tier).toBe('borderline');
    expect(lpaTier(50, 'mg/dL').tier).toBe('high');
    expect(lpaTier(180, 'mg/dL').tier).toBe('very-high');
  });
});

describe('lpaTier (nmol/L)', () => {
  it('uses nmol/L cut-points', () => {
    expect(lpaTier(74, 'nmol/L').tier).toBe('low');
    expect(lpaTier(75, 'nmol/L').tier).toBe('borderline');
    expect(lpaTier(125, 'nmol/L').tier).toBe('high');
    expect(lpaTier(430, 'nmol/L').tier).toBe('very-high');
  });
});

describe('lpa module', () => {
  it('validates input and ships sources', () => {
    expect(() => lpaTier(-1, 'mg/dL')).toThrow();
    expect(sources.length).toBeGreaterThan(0);
  });
});

describe('lpaBands', () => {
  it('match the mg/dL cut-points and are open-ended at the top', () => {
    const b = lpaBands('mg/dL');
    expect(b.map((x) => x.lower)).toEqual([0, 30, 50, 180]);
    expect(b.map((x) => x.upper)).toEqual([30, 50, 180, null]);
  });

  it('match the nmol/L cut-points', () => {
    const b = lpaBands('nmol/L');
    expect(b.map((x) => x.lower)).toEqual([0, 75, 125, 430]);
    expect(b.map((x) => x.upper)).toEqual([75, 125, 430, null]);
  });

  it('agree with lpaTier', () => {
    for (const v of [10, 30, 49, 50, 179, 180, 300]) {
      const band = lpaBands('mg/dL').find((x) => x.upper === null || v < x.upper)!;
      expect(band.name).toBe(lpaTier(v, 'mg/dL').tier);
    }
  });
});

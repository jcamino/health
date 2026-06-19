import { describe, it, expect } from 'vitest';
import { lpaTier, sources } from '../src/lib/calculators/lpa';

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

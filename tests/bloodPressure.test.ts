import { describe, it, expect } from 'vitest';
import { bpCategory, BP_THRESHOLDS, sources } from '../src/lib/calculators/bloodPressure';

describe('bpCategory (ACC/AHA 2017)', () => {
  it('classifies representative readings', () => {
    expect(bpCategory(118, 76).category).toBe('normal');
    expect(bpCategory(123, 78).category).toBe('elevated');
    expect(bpCategory(135, 85).category).toBe('stage-1');
    expect(bpCategory(150, 95).category).toBe('stage-2');
    expect(bpCategory(185, 100).category).toBe('crisis');
    expect(bpCategory(120, 125).category).toBe('crisis'); // diastolic > 120
  });

  it('uses the higher of the systolic/diastolic categories', () => {
    expect(bpCategory(125, 82).category).toBe('stage-1'); // DBP 80–89 wins
    expect(bpCategory(145, 70).category).toBe('stage-2'); // SBP wins
    expect(bpCategory(110, 92).category).toBe('stage-2'); // DBP wins
  });

  it('respects category boundaries', () => {
    expect(bpCategory(119, 79).category).toBe('normal');
    expect(bpCategory(120, 79).category).toBe('elevated');
    expect(bpCategory(129, 79).category).toBe('elevated');
    expect(bpCategory(130, 79).category).toBe('stage-1');
    expect(bpCategory(139, 89).category).toBe('stage-1');
    expect(bpCategory(140, 89).category).toBe('stage-2');
  });

  it('validates input and ships sources', () => {
    expect(() => bpCategory(0, 80)).toThrow();
    expect(() => bpCategory(120, NaN)).toThrow();
    expect(sources.length).toBeGreaterThan(0);
  });

  it('exposes thresholds consistent with the classifier', () => {
    expect(BP_THRESHOLDS.systolic).toEqual({ elevated: 120, stage1: 130, stage2: 140, crisis: 180 });
    expect(BP_THRESHOLDS.diastolic).toEqual({ stage1: 80, stage2: 90, crisis: 120 });
  });
});

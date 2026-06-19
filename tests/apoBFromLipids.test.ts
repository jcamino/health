import { describe, it, expect } from 'vitest';
import {
  apoBFromLdl,
  apoBFromNonHdl,
  sources,
} from '../src/lib/calculators/apoBFromLipids';

describe('apoBFromLdl', () => {
  it('returns a positive ApoB for a positive LDL-C', () => {
    expect(apoBFromLdl(100)).toBeGreaterThan(0);
  });

  it('is monotonically increasing in LDL-C', () => {
    expect(apoBFromLdl(120)).toBeGreaterThan(apoBFromLdl(80));
    expect(apoBFromLdl(80)).toBeGreaterThan(apoBFromLdl(50));
  });

  it('throws on non-finite or non-positive input', () => {
    expect(() => apoBFromLdl(0)).toThrow();
    expect(() => apoBFromLdl(-1)).toThrow();
    expect(() => apoBFromLdl(NaN)).toThrow();
    expect(() => apoBFromLdl(Infinity)).toThrow();
  });

  // Reproduce the 2019 ESC/EAS corresponding-goals anchor points.
  // LDL <55 / <70 / <100 correspond to ApoB <65 / <80 / <100.
  it('reproduces the cited LDL-C → ApoB anchor points', () => {
    expect(Math.abs(apoBFromLdl(55) - 65)).toBeLessThanOrEqual(8); // ~65 ±8
    expect(Math.abs(apoBFromLdl(70) - 80)).toBeLessThanOrEqual(8); // ~80 ±8
    expect(Math.abs(apoBFromLdl(100) - 100)).toBeLessThanOrEqual(10); // ~100 ±10
  });
});

describe('apoBFromNonHdl', () => {
  it('returns a positive ApoB for a positive non-HDL-C', () => {
    expect(apoBFromNonHdl(130)).toBeGreaterThan(0);
  });

  it('is monotonically increasing in non-HDL-C', () => {
    expect(apoBFromNonHdl(150)).toBeGreaterThan(apoBFromNonHdl(100));
    expect(apoBFromNonHdl(100)).toBeGreaterThan(apoBFromNonHdl(85));
  });

  it('throws on non-finite or non-positive input', () => {
    expect(() => apoBFromNonHdl(0)).toThrow();
    expect(() => apoBFromNonHdl(-5)).toThrow();
    expect(() => apoBFromNonHdl(NaN)).toThrow();
    expect(() => apoBFromNonHdl(Infinity)).toThrow();
  });

  // Reproduce the 2019 ESC/EAS corresponding-goals anchor points.
  // non-HDL <85 / <100 / <130 correspond to ApoB <65 / <80 / <100.
  it('reproduces the cited non-HDL-C → ApoB anchor points', () => {
    expect(Math.abs(apoBFromNonHdl(85) - 65)).toBeLessThanOrEqual(8); // ~65 ±8
    expect(Math.abs(apoBFromNonHdl(100) - 80)).toBeLessThanOrEqual(8); // ~80 ±8
    expect(Math.abs(apoBFromNonHdl(130) - 100)).toBeLessThanOrEqual(5); // ~100 ±5
  });
});

describe('apoBFromLipids module', () => {
  it('exposes a non-empty sources list with absolute URLs', () => {
    expect(sources.length).toBeGreaterThan(0);
    for (const ref of sources) {
      expect(ref.url).toMatch(/^https?:\/\//);
    }
  });
});

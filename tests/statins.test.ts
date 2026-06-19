import { describe, it, expect } from 'vitest';
import { statinIntensity, sources } from '../src/lib/statins';

describe('statin intensity data', () => {
  it('has the three intensity bands', () => {
    const bands = statinIntensity.map((b) => b.intensity);
    expect(bands).toEqual(['high', 'moderate', 'low']);
  });
  it('each band lists at least one regimen and an LDL-C lowering range', () => {
    for (const band of statinIntensity) {
      expect(band.regimens.length).toBeGreaterThan(0);
      expect(band.ldlReduction).toMatch(/%/);
    }
  });
  it('ships sources', () => {
    expect(sources.length).toBeGreaterThan(0);
  });
});

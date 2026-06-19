import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.easLpa2022];

export type LpaUnit = 'mg/dL' | 'nmol/L';
export type LpaTierName = 'low' | 'borderline' | 'high' | 'very-high';

export interface LpaTier {
  tier: LpaTierName;
  label: string;
}

/**
 * Cut-points per the EAS 2022 Lp(a) consensus. mg/dL and nmol/L are NOT linearly
 * interconvertible, so each unit has its own thresholds rather than converting.
 */
const CUTPOINTS: Record<LpaUnit, { borderline: number; high: number; veryHigh: number }> = {
  'mg/dL': { borderline: 30, high: 50, veryHigh: 180 },
  'nmol/L': { borderline: 75, high: 125, veryHigh: 430 },
};

const LABELS: Record<LpaTierName, string> = {
  low: 'Low risk',
  borderline: 'Borderline / grey zone',
  high: 'High risk',
  'very-high': 'Very high risk',
};

export function lpaTier(value: number, unit: LpaUnit): LpaTier {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`lpaTier: invalid Lp(a) value: ${value}`);
  }
  const c = CUTPOINTS[unit];
  let tier: LpaTierName = 'low';
  if (value >= c.veryHigh) tier = 'very-high';
  else if (value >= c.high) tier = 'high';
  else if (value >= c.borderline) tier = 'borderline';
  return { tier, label: LABELS[tier] };
}

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

export interface LpaBand {
  name: LpaTierName;
  label: string;
  /** Inclusive lower bound, in `unit`. */
  lower: number;
  /** Exclusive upper bound, in `unit`, or null for the open-ended top tier. */
  upper: number | null;
}

/**
 * The same tiers as `lpaTier`, in ascending order and with upper bounds, for the
 * selected unit. Derived from `CUTPOINTS` so the thresholds stay single-sourced.
 */
export function lpaBands(unit: LpaUnit): LpaBand[] {
  const c = CUTPOINTS[unit];
  return [
    { name: 'low', label: LABELS.low, lower: 0, upper: c.borderline },
    { name: 'borderline', label: LABELS.borderline, lower: c.borderline, upper: c.high },
    { name: 'high', label: LABELS.high, lower: c.high, upper: c.veryHigh },
    { name: 'very-high', label: LABELS['very-high'], lower: c.veryHigh, upper: null },
  ];
}

import { refs, type Reference } from '../references';

export const sources: Reference[] = [
  refs.snidermanApoB2019,
  refs.easLdlCausality2017,
  refs.fourierVeryLowLdl2017,
];

export type ApoBTierName = 'optimal' | 'borderline' | 'high' | 'very-high';

export interface ApoBTier {
  tier: ApoBTierName;
  label: string;
  /** Inclusive lower bound of this tier, mg/dL. */
  lowerBound: number;
}

/**
 * Tier boundaries (mg/dL) oriented to lifetime/prevention-optimal targets, not
 * population "normal". Plaque-stabilizing target is ~<65; ~<80 is a common
 * secondary-prevention goal; >=100 is clearly elevated.
 * Boundaries must remain consistent with the cited guidance (see `sources`).
 */
const TIERS: ReadonlyArray<{ name: ApoBTierName; label: string; lower: number }> = [
  { name: 'very-high', label: 'Very high', lower: 100 },
  { name: 'high', label: 'High', lower: 80 },
  { name: 'borderline', label: 'Borderline', lower: 65 },
  { name: 'optimal', label: 'Optimal', lower: 0 },
];

export function apoBTier(apoB_mgdl: number): ApoBTier {
  if (!Number.isFinite(apoB_mgdl) || apoB_mgdl < 0) {
    throw new Error(`apoBTier: invalid ApoB value: ${apoB_mgdl}`);
  }
  const match = TIERS.find((t) => apoB_mgdl >= t.lower)!; // optimal lower=0 always matches
  return { tier: match.name, label: match.label, lowerBound: match.lower };
}

export interface ApoBBand {
  name: ApoBTierName;
  label: string;
  /** Inclusive lower bound, mg/dL. */
  lower: number;
  /** Exclusive upper bound, mg/dL, or null for the open-ended top tier. */
  upper: number | null;
}

/**
 * The same tiers as `apoBTier`, in ascending order and with upper bounds, for
 * axis/gauge display. Derived from `TIERS` so the thresholds stay single-sourced.
 */
export const apoBBands: ApoBBand[] = [...TIERS]
  .sort((a, b) => a.lower - b.lower)
  .map((t, i, arr) => ({
    name: t.name,
    label: t.label,
    lower: t.lower,
    upper: i < arr.length - 1 ? arr[i + 1].lower : null,
  }));

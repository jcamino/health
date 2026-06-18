import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.snidermanApoB2019, refs.easLdlCausality2017];

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

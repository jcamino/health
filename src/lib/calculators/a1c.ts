import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.adaDiagnosis2024, refs.nathanAdag2008];

export type A1cCategory = 'normal' | 'prediabetes' | 'diabetes';

export interface A1cResult {
  category: A1cCategory;
  label: string;
  /** Estimated average glucose, mg/dL (ADAG regression). */
  eAG: number;
}

const LABELS: Record<A1cCategory, string> = {
  normal: 'Normal',
  prediabetes: 'Prediabetes',
  diabetes: 'Diabetes range',
};

/** A1C must be a plausible percentage (HbA1c is typically ~4–20%). */
function assertA1c(a1cPercent: number): void {
  if (!Number.isFinite(a1cPercent) || a1cPercent <= 0 || a1cPercent > 30) {
    throw new Error(`a1c: implausible A1C value: ${a1cPercent}%`);
  }
}

/**
 * Estimated average glucose from A1C, per the ADAG study (Nathan DM et al.,
 * Diabetes Care 2008): eAG (mg/dL) = 28.7 × A1C(%) − 46.7  (R² = 0.84).
 */
export function eAG(a1cPercent: number): number {
  assertA1c(a1cPercent);
  return 28.7 * a1cPercent - 46.7;
}

/**
 * A1C diagnostic category per ADA Standards of Care 2024 (Diagnosis &
 * Classification): normal <5.7%, prediabetes 5.7–6.4%, diabetes ≥6.5%.
 */
export function a1cStatus(a1cPercent: number): A1cResult {
  assertA1c(a1cPercent);
  let category: A1cCategory;
  if (a1cPercent >= 6.5) category = 'diabetes';
  else if (a1cPercent >= 5.7) category = 'prediabetes';
  else category = 'normal';
  return { category, label: LABELS[category], eAG: eAG(a1cPercent) };
}

import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.matthewsHoma1985, refs.gayosoHomaIr2013];

export type HomaIrCategory = 'normal' | 'insulin-resistant';

export interface HomaIrResult {
  /** HOMA-IR index value (dimensionless). */
  value: number;
  category: HomaIrCategory;
  /** True when value is at or above the cited cut-point. */
  insulinResistant: boolean;
  /** The cut-point used (see note about population-dependence). */
  cutPoint: number;
}

/**
 * Approximate insulin-resistance cut-point. HOMA-IR thresholds are strongly
 * population-, age-, and sex-dependent and are NOT a clinical diagnosis. This is
 * the 90th-percentile value reported for a general adult (Spanish) population in
 * the EPIRCE study (Gayoso-Diz et al. 2013). Label as approximate in the UI.
 */
const IR_CUTPOINT = 3.46;

/**
 * Homeostasis Model Assessment of Insulin Resistance (Matthews DR et al.,
 * Diabetologia 1985). Simplified mg/dL form:
 *   HOMA-IR = fasting glucose (mg/dL) × fasting insulin (µU/mL) / 405.
 * (The original SI form uses mmol/L × µU/mL / 22.5; 22.5 × 18 ≈ 405, where 18 is
 * the mg/dL-per-mmol/L glucose conversion.)
 */
export function homaIr(glucoseMgDl: number, insulinUuMl: number): HomaIrResult {
  if (
    !Number.isFinite(glucoseMgDl) ||
    !Number.isFinite(insulinUuMl) ||
    glucoseMgDl <= 0 ||
    insulinUuMl <= 0
  ) {
    throw new Error(
      `homaIr: invalid inputs glucose=${glucoseMgDl} mg/dL, insulin=${insulinUuMl} µU/mL`,
    );
  }
  const value = (glucoseMgDl * insulinUuMl) / 405;
  const insulinResistant = value >= IR_CUTPOINT;
  return {
    value,
    category: insulinResistant ? 'insulin-resistant' : 'normal',
    insulinResistant,
    cutPoint: IR_CUTPOINT,
  };
}

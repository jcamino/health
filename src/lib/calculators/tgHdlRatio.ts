import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.mclaughlinTgHdl2003];

export interface TgHdlResult {
  ratio: number;
  /** True at/above the cited cut-point (mg/dL units). */
  insulinResistanceLikely: boolean;
  cutPoint: number;
}

/**
 * Cut-point for the triglyceride/HDL-C ratio (mg/dL units) as an
 * insulin-resistance surrogate, from McLaughlin T et al., Ann Intern Med 2003:
 * a ratio of 3.0 (mg/dL) best identified insulin-resistant overweight adults
 * (≈ 1.8 in SI/mmol-L units). Surrogate marker, not a diagnosis; performance
 * (AUC ≈ 0.78) and applicability vary by population. Label as approximate.
 */
const TG_HDL_CUTPOINT = 3.0;

/**
 * Triglyceride/HDL-C ratio in conventional (mg/dL) units. Both inputs must be
 * in mg/dL; the cut-point above is unit-specific (mg/dL), so do NOT mix units.
 */
export function tgHdlRatio(triglyceridesMgDl: number, hdlMgDl: number): TgHdlResult {
  if (
    !Number.isFinite(triglyceridesMgDl) ||
    !Number.isFinite(hdlMgDl) ||
    triglyceridesMgDl <= 0 ||
    hdlMgDl <= 0
  ) {
    throw new Error(
      `tgHdlRatio: invalid inputs TG=${triglyceridesMgDl} mg/dL, HDL=${hdlMgDl} mg/dL`,
    );
  }
  const ratio = triglyceridesMgDl / hdlMgDl;
  return {
    ratio,
    insulinResistanceLikely: ratio >= TG_HDL_CUTPOINT,
    cutPoint: TG_HDL_CUTPOINT,
  };
}

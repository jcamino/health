import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.escEasDyslipidaemia2019];

/**
 * Approximate, population-level conversions from a standard lipid panel to an
 * estimated ApoB (mg/dL).
 *
 * Method (transparent and citable): the 2019 ESC/EAS dyslipidaemia guidelines
 * (Mach F, et al. Eur Heart J 2020;41(1):111-188, DOI 10.1093/eurheartj/ehz455)
 * publish a set of *corresponding* treatment goals across LDL-C, non-HDL-C and
 * ApoB by cardiovascular-risk category:
 *
 *   risk        LDL-C   non-HDL-C   ApoB   (all mg/dL)
 *   very high   <55     <85         <65
 *   high        <70     <100        <80
 *   moderate    <100    <130        <100
 *
 * Treating each column as paired anchor points, a least-squares line through the
 * three (LDL-C, ApoB) points and through the three (non-HDL-C, ApoB) points
 * gives a simple linear conversion. Both lines share the same slope (the three
 * non-HDL-C anchors are exactly +30 mg/dL relative to the LDL-C anchors), so
 * they differ only in intercept.
 *
 *   ApoB ≈ 0.7619 * LDL-C    + 24.5238
 *   ApoB ≈ 0.7619 * nonHDL-C +  1.6667
 *
 * Slope = 800/1050 = 16/21 ≈ 0.761905. These are POPULATION APPROXIMATIONS with
 * real individual scatter; a given person's measured ApoB can differ materially
 * from the estimate, which is exactly why directly measuring ApoB is preferred.
 * The UI labels these conversions as approximate.
 */

/** Shared slope of both fits: least-squares through the ESC/EAS anchor points. */
const SLOPE = 800 / 1050; // = 16/21 ≈ 0.761905

/** Intercept for the LDL-C → ApoB least-squares line (mg/dL). */
const LDL_INTERCEPT = 24.523809523809522;

/** Intercept for the non-HDL-C → ApoB least-squares line (mg/dL). */
const NON_HDL_INTERCEPT = 1.6666666666666714;

function requirePositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name}: value must be a finite number > 0, got ${value}`);
  }
}

/**
 * Estimate ApoB (mg/dL) from LDL-C (mg/dL) using the ESC/EAS-derived linear fit.
 * This is an APPROXIMATE population conversion; measured ApoB is preferred.
 * Throws on non-finite or non-positive input.
 */
export function apoBFromLdl(ldl_mgdl: number): number {
  requirePositiveFinite(ldl_mgdl, 'apoBFromLdl');
  return SLOPE * ldl_mgdl + LDL_INTERCEPT;
}

/**
 * Estimate ApoB (mg/dL) from non-HDL-C (mg/dL) using the ESC/EAS-derived linear
 * fit. This is an APPROXIMATE population conversion; measured ApoB is preferred.
 * Throws on non-finite or non-positive input.
 */
export function apoBFromNonHdl(nonHdl_mgdl: number): number {
  requirePositiveFinite(nonHdl_mgdl, 'apoBFromNonHdl');
  return SLOPE * nonHdl_mgdl + NON_HDL_INTERCEPT;
}

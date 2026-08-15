import { refs, type Reference } from '../references';

export const sources: Reference[] = [
  refs.preventEquations2024,
  refs.accAhaDyslipidemia2026,
];

/**
 * Inputs for the AHA PREVENT base 10-year ASCVD risk equation.
 *
 * Units:
 *  - `totalCholesterol` and `hdl` are in **mg/dL** (converted internally to
 *    mmol/L by dividing by 38.67, per the source).
 *  - `systolicBP` is in mmHg.
 *  - `egfr` is in mL/min/1.73m^2.
 *
 * The model is validated for ages 30-79 (race-free, sex-specific).
 *
 * Note on scope: this implements the PREVENT **base** model for the **10-year
 * ASCVD** outcome only. In that model BMI carries a coefficient of exactly 0
 * (BMI is informative for total-CVD and heart-failure outcomes, not ASCVD), so
 * BMI is intentionally not an input here. The base ASCVD model does include a
 * statin term; this calculator targets the untreated-statin scenario (statin =
 * false), matching the source's worked example, and so omits statin from the
 * public input. Both omitted terms therefore evaluate to zero and the published
 * worked examples are reproduced exactly.
 */
export interface PreventInput {
  age: number;
  sex: 'female' | 'male';
  /** Total cholesterol, mg/dL */
  totalCholesterol: number;
  /** HDL cholesterol, mg/dL */
  hdl: number;
  /** Systolic blood pressure, mmHg */
  systolicBP: number;
  /** On antihypertensive treatment */
  bpTreated: boolean;
  diabetic: boolean;
  smoker: boolean;
  /** Estimated GFR, mL/min/1.73m^2 */
  egfr: number;
}

/** mg/dL -> mmol/L for cholesterol (per the PREVENT source). */
const MG_DL_TO_MMOL = 1 / 38.67;

const AGE_MIN = 30;
const AGE_MAX = 79;

/**
 * Coefficient set for one sex, base 10-year ASCVD model. Transcribed verbatim
 * from the supplemental appendix of Khan SS et al., Circulation 2024
 * (DOI 10.1161/CIRCULATIONAHA.123.067626). Variable names mirror the source's
 * centered/scaled predictors.
 *
 * Centering / scaling (the transformations applied before multiplying by betas):
 *  - age:        (age - 55) / 10
 *  - nonHdl:     ((totalC - hdl) in mmol/L) - 3.5
 *  - hdl:        ((hdl in mmol/L) - 1.3) / 0.3
 *  - sbpLt110:   (min(sbp, 110) - 110) / 20
 *  - sbpGe110:   (max(sbp, 110) - 130) / 20
 *  - egfrLt60:   (min(egfr, 60) - 60) / -15
 *  - egfrGe60:   (max(egfr, 60) - 90) / -15
 *  - diabetes, smoking, bpTreated: 0/1 indicators
 *  - interaction terms are products of the above
 */
interface AscvdCoefficients {
  age: number;
  /**
   * Coefficient on ((age - 55) / 10)^2. Present only in the 30-year models;
   * the 10-year models have no age-squared term, expressed here as 0.
   */
  ageSquared: number;
  nonHdl: number;
  hdl: number;
  sbpLt110: number;
  sbpGe110: number;
  diabetes: number;
  smoking: number;
  egfrLt60: number;
  egfrGe60: number;
  bpTreated: number;
  bpTreatedSbpGe110: number;
  ageNonHdl: number;
  ageHdl: number;
  ageSbpGe110: number;
  ageDiabetes: number;
  ageSmoking: number;
  ageEgfrLt60: number;
  constant: number;
}

// Female, base model, 10-year ASCVD.
const FEMALE: AscvdCoefficients = {
  age: 0.719883,
  ageSquared: 0,
  nonHdl: 0.1176967,
  hdl: -0.151185,
  sbpLt110: -0.0835358,
  sbpGe110: 0.3592852,
  diabetes: 0.8348585,
  smoking: 0.4831078,
  egfrLt60: 0.4864619,
  egfrGe60: 0.0397779,
  bpTreated: 0.2265309,
  bpTreatedSbpGe110: -0.0395762,
  ageNonHdl: -0.0567839,
  ageHdl: 0.0325692,
  ageSbpGe110: -0.1035985,
  ageDiabetes: -0.2417542,
  ageSmoking: -0.0791142,
  ageEgfrLt60: -0.1671492,
  constant: -3.819975,
};

// Male, base model, 10-year ASCVD.
const MALE: AscvdCoefficients = {
  age: 0.7099847,
  ageSquared: 0,
  nonHdl: 0.1658663,
  hdl: -0.1144285,
  sbpLt110: -0.2837212,
  sbpGe110: 0.3239977,
  diabetes: 0.7189597,
  smoking: 0.3956973,
  egfrLt60: 0.3690075,
  egfrGe60: 0.0203619,
  bpTreated: 0.2036522,
  bpTreatedSbpGe110: -0.0322916,
  ageNonHdl: -0.0300005,
  ageHdl: 0.0232747,
  ageSbpGe110: -0.0927024,
  ageDiabetes: -0.2018525,
  ageSmoking: -0.0970527,
  ageEgfrLt60: -0.1217081,
  constant: -3.500655,
};

/**
 * Base model, 30-year ASCVD. Same source, transformations, and interaction set
 * as the 10-year model, plus one structural addition: an age-squared term,
 * ((age - 55) / 10)^2. Coefficients cross-checked to agree exactly across three
 * independent transcriptions of the source's supplemental tables (the preventr
 * R package, PyPREVENT, and the Medical Software Foundation implementation).
 * As with the 10-year model, the statin terms are omitted (statin = false),
 * matching the source's worked example.
 *
 * The 30-year models were derived in ages 30-59; risk is not reported above 59.
 */
const FEMALE_30: AscvdCoefficients = {
  age: 0.4669202,
  ageSquared: -0.0893118,
  nonHdl: 0.1256901,
  hdl: -0.1542255,
  sbpLt110: -0.0018093,
  sbpGe110: 0.322949,
  diabetes: 0.6296707,
  smoking: 0.268292,
  egfrLt60: 0.100106,
  egfrGe60: 0.0499663,
  bpTreated: 0.1875292,
  bpTreatedSbpGe110: -0.0276123,
  ageNonHdl: -0.0521962,
  ageHdl: 0.0316918,
  ageSbpGe110: -0.1046101,
  ageDiabetes: -0.2727793,
  ageSmoking: -0.1530907,
  ageEgfrLt60: -0.1299149,
  constant: -1.974074,
};

const MALE_30: AscvdCoefficients = {
  age: 0.3994099,
  ageSquared: -0.0937484,
  nonHdl: 0.1744643,
  hdl: -0.120203,
  sbpLt110: -0.0665117,
  sbpGe110: 0.2753037,
  diabetes: 0.4790257,
  smoking: 0.1782635,
  egfrLt60: -0.0218789, // genuinely negative in the source
  egfrGe60: 0.0602553,
  bpTreated: 0.1421182,
  bpTreatedSbpGe110: -0.0218265,
  ageNonHdl: -0.0312619,
  ageHdl: 0.020673,
  ageSbpGe110: -0.0920935,
  ageDiabetes: -0.2159947,
  ageSmoking: -0.1548811,
  ageEgfrLt60: -0.0712547,
  constant: -1.736444,
};

/** Upper age bound for the 30-year models (derived in ages 30-59). */
export const AGE_MAX_30YR = 59;

function requireFinite(value: number, name: string, fn: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${fn}: ${name} must be a finite number (got ${value})`);
  }
}

/** Shared logistic-model risk computation for the base ASCVD models. */
function ascvdRiskPercent(
  input: PreventInput,
  c: AscvdCoefficients,
  fn: string,
): number {
  const {
    age,
    sex,
    totalCholesterol,
    hdl,
    systolicBP,
    bpTreated,
    diabetic,
    smoker,
    egfr,
  } = input;

  requireFinite(age, 'age', fn);
  requireFinite(totalCholesterol, 'totalCholesterol', fn);
  requireFinite(hdl, 'hdl', fn);
  requireFinite(systolicBP, 'systolicBP', fn);
  requireFinite(egfr, 'egfr', fn);
  if (sex !== 'female' && sex !== 'male') {
    throw new Error(`${fn}: sex must be 'female' or 'male' (got ${sex})`);
  }

  // Centered / scaled predictors (cholesterol converted mg/dL -> mmol/L).
  const ageC = (age - 55) / 10;
  const nonHdl = (totalCholesterol - hdl) * MG_DL_TO_MMOL - 3.5;
  const hdlC = (hdl * MG_DL_TO_MMOL - 1.3) / 0.3;
  const sbpLt110 = (Math.min(systolicBP, 110) - 110) / 20;
  const sbpGe110 = (Math.max(systolicBP, 110) - 130) / 20;
  const egfrLt60 = (Math.min(egfr, 60) - 60) / -15;
  const egfrGe60 = (Math.max(egfr, 60) - 90) / -15;
  const dm = diabetic ? 1 : 0;
  const smk = smoker ? 1 : 0;
  const bpTx = bpTreated ? 1 : 0;

  const logOdds =
    c.constant +
    c.age * ageC +
    c.ageSquared * ageC * ageC +
    c.nonHdl * nonHdl +
    c.hdl * hdlC +
    c.sbpLt110 * sbpLt110 +
    c.sbpGe110 * sbpGe110 +
    c.diabetes * dm +
    c.smoking * smk +
    c.egfrLt60 * egfrLt60 +
    c.egfrGe60 * egfrGe60 +
    c.bpTreated * bpTx +
    c.bpTreatedSbpGe110 * (bpTx * sbpGe110) +
    c.ageNonHdl * (ageC * nonHdl) +
    c.ageHdl * (ageC * hdlC) +
    c.ageSbpGe110 * (ageC * sbpGe110) +
    c.ageDiabetes * (ageC * dm) +
    c.ageSmoking * (ageC * smk) +
    c.ageEgfrLt60 * (ageC * egfrLt60);

  const risk = Math.exp(logOdds) / (1 + Math.exp(logOdds));
  return risk * 100;
}

/**
 * Estimate 10-year ASCVD risk with the AHA PREVENT base equation (Khan 2024).
 *
 * Uses a sex-specific logistic model:
 *   logOdds = constant + sum(beta_i * x_i)
 *   risk    = exp(logOdds) / (1 + exp(logOdds))
 * with predictors centered/scaled as documented on {@link AscvdCoefficients}.
 *
 * @returns `{ tenYearPercent }`: the 10-year ASCVD risk as a percentage (0-100).
 * @throws if age is outside 30-79 or any numeric input is non-finite.
 */
export function preventAscvd10yr(input: PreventInput): {
  tenYearPercent: number;
} {
  if (
    Number.isFinite(input.age) &&
    (input.age < AGE_MIN || input.age > AGE_MAX)
  ) {
    throw new Error(
      `preventAscvd10yr: age ${input.age} is outside the validated range ${AGE_MIN}-${AGE_MAX}`,
    );
  }
  const c = input.sex === 'female' ? FEMALE : MALE;
  return { tenYearPercent: ascvdRiskPercent(input, c, 'preventAscvd10yr') };
}

/**
 * Estimate 30-year ASCVD risk with the AHA PREVENT base equation (Khan 2024).
 * Same model family as {@link preventAscvd10yr} plus an age-squared term.
 *
 * @returns `{ thirtyYearPercent }`: the 30-year ASCVD risk as a percentage (0-100).
 * @throws if age is outside 30-59 (the range the 30-year models were derived
 *   in) or any numeric input is non-finite.
 */
export function preventAscvd30yr(input: PreventInput): {
  thirtyYearPercent: number;
} {
  if (
    Number.isFinite(input.age) &&
    (input.age < AGE_MIN || input.age > AGE_MAX_30YR)
  ) {
    throw new Error(
      `preventAscvd30yr: age ${input.age} is outside the validated range ${AGE_MIN}-${AGE_MAX_30YR}`,
    );
  }
  const c = input.sex === 'female' ? FEMALE_30 : MALE_30;
  return { thirtyYearPercent: ascvdRiskPercent(input, c, 'preventAscvd30yr') };
}

export type PreventBandName = 'low' | 'borderline' | 'intermediate' | 'high';

export interface PreventBand {
  band: PreventBandName;
  label: string;
}

/**
 * 10-year ASCVD risk bands per the 2026 ACC/AHA Multisociety Dyslipidemia
 * Guideline: low <3%, borderline 3 to <5%, intermediate 5 to <10%, high >=10%.
 * These replace the PCE-era 7.5%/20% bands (PREVENT recalibrates risk lower,
 * so the action thresholds moved down with it).
 */
export function preventRiskBand(tenYearPercent: number): PreventBand {
  if (!Number.isFinite(tenYearPercent) || tenYearPercent < 0) {
    throw new Error(`preventRiskBand: invalid risk percent: ${tenYearPercent}`);
  }
  if (tenYearPercent >= 10) return { band: 'high', label: 'High' };
  if (tenYearPercent >= 5)
    return { band: 'intermediate', label: 'Intermediate' };
  if (tenYearPercent >= 3) return { band: 'borderline', label: 'Borderline' };
  return { band: 'low', label: 'Low' };
}

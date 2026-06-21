import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.preventEquations2024];

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

function requireFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`preventAscvd10yr: ${name} must be a finite number (got ${value})`);
  }
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
export function preventAscvd10yr(input: PreventInput): { tenYearPercent: number } {
  const { age, sex, totalCholesterol, hdl, systolicBP, bpTreated, diabetic, smoker, egfr } =
    input;

  requireFinite(age, 'age');
  requireFinite(totalCholesterol, 'totalCholesterol');
  requireFinite(hdl, 'hdl');
  requireFinite(systolicBP, 'systolicBP');
  requireFinite(egfr, 'egfr');

  if (age < AGE_MIN || age > AGE_MAX) {
    throw new Error(
      `preventAscvd10yr: age ${age} is outside the validated range ${AGE_MIN}-${AGE_MAX}`,
    );
  }
  if (sex !== 'female' && sex !== 'male') {
    throw new Error(`preventAscvd10yr: sex must be 'female' or 'male' (got ${sex})`);
  }

  const c = sex === 'female' ? FEMALE : MALE;

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
  return { tenYearPercent: risk * 100 };
}

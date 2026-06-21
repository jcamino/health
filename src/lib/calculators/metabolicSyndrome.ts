import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.albertiMetSyndrome2009];

export type Sex = 'male' | 'female';

/** Which population's waist-circumference cut-points to apply. */
export type WaistPopulation = 'aha-nhlbi-us' | 'idf-europid';

/** The five harmonized criteria, each already evaluated to met/not-met. */
export interface MetSCriteria {
  waist: boolean;
  triglycerides: boolean;
  hdl: boolean;
  bloodPressure: boolean;
  glucose: boolean;
}

export interface MetSResult {
  /** Number of criteria met (0–5). */
  count: number;
  /** True when ≥3 of 5 criteria are met (harmonized 2009 definition). */
  meets: boolean;
}

/**
 * Count met criteria and apply the 3-of-5 rule from the 2009 harmonized
 * definition of metabolic syndrome (Alberti KGMM et al., Circulation 2009).
 */
export function metabolicSyndrome(criteria: MetSCriteria): MetSResult {
  const flags = [
    criteria.waist,
    criteria.triglycerides,
    criteria.hdl,
    criteria.bloodPressure,
    criteria.glucose,
  ];
  for (const f of flags) {
    if (typeof f !== 'boolean') {
      throw new Error('metabolicSyndrome: each criterion must be a boolean');
    }
  }
  const count = flags.filter(Boolean).length;
  return { count, meets: count >= 3 };
}

/**
 * Waist-circumference cut-point (cm). The harmonized statement defers waist to
 * national/regional cut-points; we default to the AHA/NHLBI (US, ATP III)
 * values (≥102 cm men, ≥88 cm women) and also offer the IDF Europid values
 * (≥94 cm men, ≥80 cm women). Population-specific, so label as such in the UI.
 */
export function waistThresholdCm(sex: Sex, population: WaistPopulation = 'aha-nhlbi-us'): number {
  const TABLE: Record<WaistPopulation, Record<Sex, number>> = {
    'aha-nhlbi-us': { male: 102, female: 88 },
    'idf-europid': { male: 94, female: 80 },
  };
  return TABLE[population][sex];
}

export interface MetSMeasurements {
  sex: Sex;
  waistCm: number;
  triglyceridesMgDl: number;
  hdlMgDl: number;
  systolic: number;
  diastolic: number;
  glucoseMgDl: number;
  /** On BP-lowering drug treatment (counts as meeting the BP criterion). */
  bpTreated: boolean;
  /** On lipid drug treatment (counts as meeting the TG and HDL criteria). */
  lipidTreated: boolean;
  /** On glucose-lowering drug treatment (counts as meeting the glucose criterion). */
  glucoseTreated: boolean;
  /** Optional non-US waist cut-points. */
  waistPopulation?: WaistPopulation;
}

/**
 * Evaluate the five harmonized criteria from raw measurements. Thresholds
 * (Alberti 2009): triglycerides ≥150 mg/dL; HDL <40 (men) / <50 (women);
 * BP systolic ≥130 and/or diastolic ≥85 mmHg; fasting glucose ≥100 mg/dL;
 * waist ≥ population-specific cut-point. Drug treatment for a component counts
 * as meeting that component.
 */
export function evaluateCriteria(m: MetSMeasurements): MetSCriteria {
  const nums = [m.waistCm, m.triglyceridesMgDl, m.hdlMgDl, m.systolic, m.diastolic, m.glucoseMgDl];
  for (const n of nums) {
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error('evaluateCriteria: all measurements must be finite, positive numbers');
    }
  }
  const hdlCut = m.sex === 'male' ? 40 : 50;
  return {
    waist: m.waistCm >= waistThresholdCm(m.sex, m.waistPopulation),
    triglycerides: m.lipidTreated || m.triglyceridesMgDl >= 150,
    hdl: m.lipidTreated || m.hdlMgDl < hdlCut,
    bloodPressure: m.bpTreated || m.systolic >= 130 || m.diastolic >= 85,
    glucose: m.glucoseTreated || m.glucoseMgDl >= 100,
  };
}

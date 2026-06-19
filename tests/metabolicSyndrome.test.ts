import { describe, it, expect } from 'vitest';
import {
  metabolicSyndrome,
  evaluateCriteria,
  waistThresholdCm,
  sources,
  type MetSCriteria,
} from '../src/lib/calculators/metabolicSyndrome';

const none: MetSCriteria = {
  waist: false,
  triglycerides: false,
  hdl: false,
  bloodPressure: false,
  glucose: false,
};

describe('metabolicSyndrome (harmonized 2009, 3 of 5)', () => {
  it('counts the criteria met', () => {
    expect(metabolicSyndrome(none).count).toBe(0);
    expect(metabolicSyndrome({ ...none, waist: true, hdl: true }).count).toBe(2);
  });

  it('requires at least 3 of 5 for a diagnosis (boundary)', () => {
    expect(metabolicSyndrome({ ...none, waist: true, hdl: true }).meets).toBe(false); // 2
    const three = { ...none, waist: true, hdl: true, glucose: true };
    expect(metabolicSyndrome(three).count).toBe(3);
    expect(metabolicSyndrome(three).meets).toBe(true); // exactly 3
    const all = { waist: true, triglycerides: true, hdl: true, bloodPressure: true, glucose: true };
    expect(metabolicSyndrome(all).count).toBe(5);
    expect(metabolicSyndrome(all).meets).toBe(true);
  });

  it('throws if a criterion flag is not a boolean', () => {
    // @ts-expect-error intentional bad input
    expect(() => metabolicSyndrome({ ...none, waist: undefined })).toThrow();
  });

  it('ships sources including the harmonized statement', () => {
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((s) => s.doi === '10.1161/CIRCULATIONAHA.109.192644')).toBe(true);
  });
});

describe('waistThresholdCm (population-specific cut-points)', () => {
  it('uses AHA/NHLBI US cut-points by default (102 cm men, 88 cm women)', () => {
    expect(waistThresholdCm('male')).toBe(102);
    expect(waistThresholdCm('female')).toBe(88);
  });
  it('supports IDF Europid cut-points (94 cm men, 80 cm women)', () => {
    expect(waistThresholdCm('male', 'idf-europid')).toBe(94);
    expect(waistThresholdCm('female', 'idf-europid')).toBe(80);
  });
});

describe('evaluateCriteria (thresholds from the harmonized table)', () => {
  it('applies each harmonized threshold (or-treated)', () => {
    // All abnormal -> all 5 true
    const all = evaluateCriteria({
      sex: 'male',
      waistCm: 110, // >=102
      triglyceridesMgDl: 200, // >=150
      hdlMgDl: 35, // <40 male
      systolic: 135, // >=130
      diastolic: 80,
      glucoseMgDl: 110, // >=100
      bpTreated: false,
      lipidTreated: false,
      glucoseTreated: false,
    });
    expect(all).toEqual({
      waist: true,
      triglycerides: true,
      hdl: true,
      bloodPressure: true,
      glucose: true,
    });
  });

  it('honors HDL sex-specific cut-points (<40 men, <50 women)', () => {
    const base = {
      waistCm: 70,
      triglyceridesMgDl: 100,
      systolic: 110,
      diastolic: 70,
      glucoseMgDl: 90,
      bpTreated: false,
      lipidTreated: false,
      glucoseTreated: false,
    };
    expect(evaluateCriteria({ ...base, sex: 'male', hdlMgDl: 45 }).hdl).toBe(false); // 45 not <40
    expect(evaluateCriteria({ ...base, sex: 'female', hdlMgDl: 45 }).hdl).toBe(true); // 45 <50
  });

  it('respects exact boundaries (>=150 TG, >=130/85 BP, >=100 glucose)', () => {
    const base = {
      sex: 'female' as const,
      waistCm: 70,
      hdlMgDl: 60,
      bpTreated: false,
      lipidTreated: false,
      glucoseTreated: false,
    };
    expect(evaluateCriteria({ ...base, triglyceridesMgDl: 149, systolic: 129, diastolic: 84, glucoseMgDl: 99 })).toEqual({
      waist: false, triglycerides: false, hdl: false, bloodPressure: false, glucose: false,
    });
    expect(evaluateCriteria({ ...base, triglyceridesMgDl: 150, systolic: 129, diastolic: 84, glucoseMgDl: 99 }).triglycerides).toBe(true);
    expect(evaluateCriteria({ ...base, triglyceridesMgDl: 149, systolic: 130, diastolic: 84, glucoseMgDl: 99 }).bloodPressure).toBe(true);
    expect(evaluateCriteria({ ...base, triglyceridesMgDl: 149, systolic: 129, diastolic: 85, glucoseMgDl: 99 }).bloodPressure).toBe(true);
    expect(evaluateCriteria({ ...base, triglyceridesMgDl: 149, systolic: 129, diastolic: 84, glucoseMgDl: 100 }).glucose).toBe(true);
  });

  it('drug treatment counts as meeting the relevant criterion', () => {
    const base = {
      sex: 'male' as const,
      waistCm: 70,
      triglyceridesMgDl: 100,
      hdlMgDl: 60,
      systolic: 110,
      diastolic: 70,
      glucoseMgDl: 90,
    };
    expect(evaluateCriteria({ ...base, bpTreated: true, lipidTreated: false, glucoseTreated: false }).bloodPressure).toBe(true);
    expect(evaluateCriteria({ ...base, bpTreated: false, lipidTreated: true, glucoseTreated: false }).triglycerides).toBe(true);
    expect(evaluateCriteria({ ...base, bpTreated: false, lipidTreated: true, glucoseTreated: false }).hdl).toBe(true);
    expect(evaluateCriteria({ ...base, bpTreated: false, lipidTreated: false, glucoseTreated: true }).glucose).toBe(true);
  });

  it('throws on non-finite measurements', () => {
    expect(() =>
      evaluateCriteria({
        sex: 'male', waistCm: NaN, triglyceridesMgDl: 100, hdlMgDl: 50,
        systolic: 120, diastolic: 80, glucoseMgDl: 90,
        bpTreated: false, lipidTreated: false, glucoseTreated: false,
      }),
    ).toThrow();
  });
});

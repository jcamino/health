import { refs, type Reference } from './references';

export const sources: Reference[] = [refs.accAhaCholesterol2018];

export type StatinIntensity = 'high' | 'moderate' | 'low';

export interface StatinBand {
  intensity: StatinIntensity;
  /** Approximate LDL-C lowering for the band, per the cited guideline. */
  ldlReduction: string;
  regimens: string[];
  whenTypicallyUsed: string;
}

/** Statin intensity bands per the 2018 AHA/ACC cholesterol guideline. */
export const statinIntensity: StatinBand[] = [
  {
    intensity: 'high',
    ldlReduction: '≥50%',
    regimens: ['Atorvastatin 40–80 mg', 'Rosuvastatin 20–40 mg'],
    whenTypicallyUsed:
      'Clinical ASCVD, LDL-C ≥190 mg/dL, or high estimated risk; goal of maximal lowering.',
  },
  {
    intensity: 'moderate',
    ldlReduction: '30–49%',
    regimens: [
      'Atorvastatin 10–20 mg',
      'Rosuvastatin 5–10 mg',
      'Simvastatin 20–40 mg',
      'Pravastatin 40–80 mg',
    ],
    whenTypicallyUsed:
      'Intermediate risk, or when high-intensity is not tolerated.',
  },
  {
    intensity: 'low',
    ldlReduction: '<30%',
    regimens: ['Pravastatin 10–20 mg', 'Simvastatin 10 mg'],
    whenTypicallyUsed: 'When higher intensities are not tolerated.',
  },
];

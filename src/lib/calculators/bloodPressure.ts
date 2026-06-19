import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.accAhaBp2017];

export type BpCategoryName = 'normal' | 'elevated' | 'stage-1' | 'stage-2' | 'crisis';

export interface BpCategory {
  category: BpCategoryName;
  label: string;
}

const LABELS: Record<BpCategoryName, string> = {
  normal: 'Normal',
  elevated: 'Elevated',
  'stage-1': 'Stage 1 hypertension',
  'stage-2': 'Stage 2 hypertension',
  crisis: 'Hypertensive crisis',
};

/**
 * Categorize a blood-pressure reading per the 2017 ACC/AHA guideline
 * (Whelton et al.). When systolic and diastolic imply different categories, the
 * HIGHER category applies — handled by the ordered checks below.
 */
export function bpCategory(systolic: number, diastolic: number): BpCategory {
  if (
    !Number.isFinite(systolic) ||
    !Number.isFinite(diastolic) ||
    systolic <= 0 ||
    diastolic <= 0
  ) {
    throw new Error(`bpCategory: invalid reading ${systolic}/${diastolic}`);
  }
  let category: BpCategoryName;
  if (systolic > 180 || diastolic > 120) category = 'crisis';
  else if (systolic >= 140 || diastolic >= 90) category = 'stage-2';
  else if (systolic >= 130 || diastolic >= 80) category = 'stage-1';
  else if (systolic >= 120) category = 'elevated'; // diastolic < 80 guaranteed here
  else category = 'normal';
  return { category, label: LABELS[category] };
}

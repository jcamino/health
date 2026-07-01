import { refs, type Reference } from '../references';

export const sources: Reference[] = [refs.accAhaBp2017, refs.accAhaBp2025];

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
 * Category thresholds (mmHg) per ACC/AHA 2017, exported so the 2-D chart's zone
 * boundaries stay consistent with the classifier. Crisis is a strict `>`; the
 * other tiers are inclusive `>=`.
 */
export const BP_THRESHOLDS = {
  systolic: { elevated: 120, stage1: 130, stage2: 140, crisis: 180 },
  diastolic: { stage1: 80, stage2: 90, crisis: 120 },
} as const;

/**
 * Categorize a blood-pressure reading per the 2017 ACC/AHA guideline
 * (Whelton et al.). When systolic and diastolic imply different categories, the
 * HIGHER category applies, handled by the ordered checks below.
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
  const s = BP_THRESHOLDS.systolic;
  const d = BP_THRESHOLDS.diastolic;
  let category: BpCategoryName;
  if (systolic > s.crisis || diastolic > d.crisis) category = 'crisis';
  else if (systolic >= s.stage2 || diastolic >= d.stage2) category = 'stage-2';
  else if (systolic >= s.stage1 || diastolic >= d.stage1) category = 'stage-1';
  else if (systolic >= s.elevated) category = 'elevated'; // diastolic < 80 guaranteed here
  else category = 'normal';
  return { category, label: LABELS[category] };
}

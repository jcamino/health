export interface Reference {
  id: string;
  title: string;
  authors?: string;
  year?: number;
  source?: string; // journal / publisher
  url: string;     // real, verified link (REQUIRED)
  doi?: string;
}

/**
 * Single source of truth for every citation on the site.
 * URLs below are best-known starting points and MUST be opened and confirmed
 * in Step 4 before any calculator using them ships (per the spec's
 * "every formula links to a real, verified source" rule).
 */
export const refs = {
  easLdlCausality2017: {
    id: 'easLdlCausality2017',
    title:
      'Low-density lipoproteins cause atherosclerotic cardiovascular disease. 1. Evidence from genetic, epidemiologic, and clinical studies. A consensus statement from the EAS Consensus Panel',
    authors: 'Ference BA, et al.',
    year: 2017,
    source: 'European Heart Journal',
    url: 'https://doi.org/10.1093/eurheartj/ehx144',
    doi: '10.1093/eurheartj/ehx144',
  },
  snidermanApoB2019: {
    id: 'snidermanApoB2019',
    title:
      'Apolipoprotein B Particles and Cardiovascular Disease: A Narrative Review',
    authors: 'Sniderman AD, et al.',
    year: 2019,
    source: 'JAMA Cardiology',
    url: 'https://doi.org/10.1001/jamacardio.2019.3780',
    doi: '10.1001/jamacardio.2019.3780',
  },
  ferenceLipids2018: {
    id: 'ferenceLipids2018',
    title:
      'Impact of Lipids on Cardiovascular Health: JACC Health Promotion Series',
    authors: 'Ference BA, Graham I, Tokgozoglu L, Catapano AL',
    year: 2018,
    source: 'Journal of the American College of Cardiology',
    url: 'https://doi.org/10.1016/j.jacc.2018.06.046',
    doi: '10.1016/j.jacc.2018.06.046',
  },
  easLpa2022: {
    id: 'easLpa2022',
    title:
      'Lipoprotein(a) in atherosclerotic cardiovascular disease and aortic stenosis: a European Atherosclerosis Society consensus statement',
    authors: 'Kronenberg F, et al.',
    year: 2022,
    source: 'European Heart Journal',
    url: 'https://doi.org/10.1093/eurheartj/ehac361',
    doi: '10.1093/eurheartj/ehac361',
  },
  accAhaBp2017: {
    id: 'accAhaBp2017',
    title:
      '2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults',
    authors: 'Whelton PK, et al.',
    year: 2018,
    source: 'Hypertension',
    url: 'https://doi.org/10.1161/HYP.0000000000000065',
    doi: '10.1161/HYP.0000000000000065',
  },
  accAhaCholesterol2018: {
    id: 'accAhaCholesterol2018',
    title:
      '2018 AHA/ACC/Multisociety Guideline on the Management of Blood Cholesterol',
    authors: 'Grundy SM, et al.',
    year: 2019,
    source: 'Circulation',
    url: 'https://doi.org/10.1161/CIR.0000000000000625',
    doi: '10.1161/CIR.0000000000000625',
  },
  accAhaRisk2013: {
    id: 'accAhaRisk2013',
    title: '2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk',
    authors: 'Goff DC Jr, et al.',
    year: 2014,
    source: 'Circulation',
    url: 'https://doi.org/10.1161/01.cir.0000437741.48606.98',
    doi: '10.1161/01.cir.0000437741.48606.98',
  },
  escEasDyslipidaemia2019: {
    id: 'escEasDyslipidaemia2019',
    title:
      '2019 ESC/EAS Guidelines for the management of dyslipidaemias: lipid modification to reduce cardiovascular risk',
    authors: 'Mach F, et al.',
    year: 2020,
    source: 'European Heart Journal',
    url: 'https://doi.org/10.1093/eurheartj/ehz455',
    doi: '10.1093/eurheartj/ehz455',
  },
  preventEquations2024: {
    id: 'preventEquations2024',
    title:
      "Development and Validation of the American Heart Association's PREVENT Equations",
    authors: 'Khan SS, et al.',
    year: 2024,
    source: 'Circulation',
    url: 'https://doi.org/10.1161/CIRCULATIONAHA.123.067626',
    doi: '10.1161/CIRCULATIONAHA.123.067626',
  },
  sprint2015: {
    id: 'sprint2015',
    title: 'A Randomized Trial of Intensive versus Standard Blood-Pressure Control (SPRINT)',
    authors: 'SPRINT Research Group',
    year: 2015,
    source: 'New England Journal of Medicine',
    url: 'https://doi.org/10.1056/NEJMoa1511939',
    doi: '10.1056/NEJMoa1511939',
  },
  hypertensionHistory2011: {
    id: 'hypertensionHistory2011',
    title:
      'Historical Trends and Milestones in Hypertension Research: A Model of the Process of Translational Research',
    authors: 'Kotchen TA',
    year: 2011,
    source: 'Hypertension',
    url: 'https://doi.org/10.1161/HYPERTENSIONAHA.111.177766',
    doi: '10.1161/HYPERTENSIONAHA.111.177766',
  },
  matthewsHoma1985: {
    id: 'matthewsHoma1985',
    title:
      'Homeostasis model assessment: insulin resistance and β-cell function from fasting plasma glucose and insulin concentrations in man',
    authors: 'Matthews DR, et al.',
    year: 1985,
    source: 'Diabetologia',
    url: 'https://doi.org/10.1007/BF00280883',
    doi: '10.1007/BF00280883',
  },
  gayosoHomaIr2013: {
    id: 'gayosoHomaIr2013',
    title:
      'Insulin resistance (HOMA-IR) cut-off values and the metabolic syndrome in a general adult population: effect of gender and age: EPIRCE cross-sectional study',
    authors: 'Gayoso-Diz P, et al.',
    year: 2013,
    source: 'BMC Endocrine Disorders',
    url: 'https://doi.org/10.1186/1472-6823-13-47',
    doi: '10.1186/1472-6823-13-47',
  },
  adaDiagnosis2024: {
    id: 'adaDiagnosis2024',
    title:
      '2. Diagnosis and Classification of Diabetes: Standards of Care in Diabetes—2024',
    authors: 'American Diabetes Association Professional Practice Committee',
    year: 2024,
    source: 'Diabetes Care',
    url: 'https://doi.org/10.2337/dc24-S002',
    doi: '10.2337/dc24-S002',
  },
  nathanAdag2008: {
    id: 'nathanAdag2008',
    title: 'Translating the A1C assay into estimated average glucose values',
    authors: 'Nathan DM, et al. (A1c-Derived Average Glucose Study Group)',
    year: 2008,
    source: 'Diabetes Care',
    url: 'https://doi.org/10.2337/dc08-0545',
    doi: '10.2337/dc08-0545',
  },
  albertiMetSyndrome2009: {
    id: 'albertiMetSyndrome2009',
    title:
      'Harmonizing the metabolic syndrome: a joint interim statement of the IDF Task Force on Epidemiology and Prevention; NHLBI; AHA; World Heart Federation; International Atherosclerosis Society; and International Association for the Study of Obesity',
    authors: 'Alberti KGMM, et al.',
    year: 2009,
    source: 'Circulation',
    url: 'https://doi.org/10.1161/CIRCULATIONAHA.109.192644',
    doi: '10.1161/CIRCULATIONAHA.109.192644',
  },
  mclaughlinTgHdl2003: {
    id: 'mclaughlinTgHdl2003',
    title:
      'Use of metabolic markers to identify overweight individuals who are insulin resistant',
    authors: 'McLaughlin T, et al.',
    year: 2003,
    source: 'Annals of Internal Medicine',
    url: 'https://doi.org/10.7326/0003-4819-139-10-200311180-00007',
    doi: '10.7326/0003-4819-139-10-200311180-00007',
  },
} satisfies Record<string, Reference>;

export type ReferenceId = keyof typeof refs;

export function getRef(id: ReferenceId): Reference {
  const ref = refs[id];
  if (!ref) throw new Error(`Unknown reference id: ${id}`);
  return ref;
}

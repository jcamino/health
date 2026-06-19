export interface Reference {
  id: string;
  title: string;
  authors?: string;
  year?: number;
  source?: string; // journal / publisher
  url: string;     // real, verified link — REQUIRED
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
} satisfies Record<string, Reference>;

export type ReferenceId = keyof typeof refs;

export function getRef(id: ReferenceId): Reference {
  const ref = refs[id];
  if (!ref) throw new Error(`Unknown reference id: ${id}`);
  return ref;
}

export interface Reference {
  id: string;
  title: string;
  authors?: string;
  year?: number;
  source?: string; // journal / publisher
  url: string; // real, verified link (REQUIRED)
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
    id: "easLdlCausality2017",
    title:
      "Low-density lipoproteins cause atherosclerotic cardiovascular disease. 1. Evidence from genetic, epidemiologic, and clinical studies. A consensus statement from the EAS Consensus Panel",
    authors: "Ference BA, et al.",
    year: 2017,
    source: "European Heart Journal",
    url: "https://doi.org/10.1093/eurheartj/ehx144",
    doi: "10.1093/eurheartj/ehx144",
  },
  snidermanApoB2019: {
    id: "snidermanApoB2019",
    title:
      "Apolipoprotein B Particles and Cardiovascular Disease: A Narrative Review",
    authors: "Sniderman AD, et al.",
    year: 2019,
    source: "JAMA Cardiology",
    url: "https://doi.org/10.1001/jamacardio.2019.3780",
    doi: "10.1001/jamacardio.2019.3780",
  },
  ferenceLipids2018: {
    id: "ferenceLipids2018",
    title:
      "Impact of Lipids on Cardiovascular Health: JACC Health Promotion Series",
    authors: "Ference BA, Graham I, Tokgozoglu L, Catapano AL",
    year: 2018,
    source: "Journal of the American College of Cardiology",
    url: "https://doi.org/10.1016/j.jacc.2018.06.046",
    doi: "10.1016/j.jacc.2018.06.046",
  },
  easLpa2022: {
    id: "easLpa2022",
    title:
      "Lipoprotein(a) in atherosclerotic cardiovascular disease and aortic stenosis: a European Atherosclerosis Society consensus statement",
    authors: "Kronenberg F, et al.",
    year: 2022,
    source: "European Heart Journal",
    url: "https://doi.org/10.1093/eurheartj/ehac361",
    doi: "10.1093/eurheartj/ehac361",
  },
  accAhaBp2017: {
    id: "accAhaBp2017",
    title:
      "2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults",
    authors: "Whelton PK, et al.",
    year: 2018,
    source: "Hypertension",
    url: "https://doi.org/10.1161/HYP.0000000000000065",
    doi: "10.1161/HYP.0000000000000065",
  },
  accAhaBp2025: {
    id: "accAhaBp2025",
    title:
      "2025 AHA/ACC/Multisociety Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults",
    authors: "Jones DW, et al.",
    year: 2025,
    source: "Journal of the American College of Cardiology",
    url: "https://doi.org/10.1016/j.jacc.2025.07.010",
    doi: "10.1016/j.jacc.2025.07.010",
  },
  accAhaCholesterol2018: {
    id: "accAhaCholesterol2018",
    title:
      "2018 AHA/ACC/Multisociety Guideline on the Management of Blood Cholesterol",
    authors: "Grundy SM, et al.",
    year: 2019,
    source: "Circulation",
    url: "https://doi.org/10.1161/CIR.0000000000000625",
    doi: "10.1161/CIR.0000000000000625",
  },
  accAhaRisk2013: {
    id: "accAhaRisk2013",
    title: "2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk",
    authors: "Goff DC Jr, et al.",
    year: 2014,
    source: "Circulation",
    url: "https://doi.org/10.1161/01.cir.0000437741.48606.98",
    doi: "10.1161/01.cir.0000437741.48606.98",
  },
  escEasDyslipidaemia2019: {
    id: "escEasDyslipidaemia2019",
    title:
      "2019 ESC/EAS Guidelines for the management of dyslipidaemias: lipid modification to reduce cardiovascular risk",
    authors: "Mach F, et al.",
    year: 2020,
    source: "European Heart Journal",
    url: "https://doi.org/10.1093/eurheartj/ehz455",
    doi: "10.1093/eurheartj/ehz455",
  },
  preventEquations2024: {
    id: "preventEquations2024",
    title:
      "Development and Validation of the American Heart Association's PREVENT Equations",
    authors: "Khan SS, et al.",
    year: 2024,
    source: "Circulation",
    url: "https://doi.org/10.1161/CIRCULATIONAHA.123.067626",
    doi: "10.1161/CIRCULATIONAHA.123.067626",
  },
  sprint2015: {
    id: "sprint2015",
    title:
      "A Randomized Trial of Intensive versus Standard Blood-Pressure Control (SPRINT)",
    authors: "SPRINT Research Group",
    year: 2015,
    source: "New England Journal of Medicine",
    url: "https://doi.org/10.1056/NEJMoa1511939",
    doi: "10.1056/NEJMoa1511939",
  },
  fourierVeryLowLdl2017: {
    id: "fourierVeryLowLdl2017",
    title:
      "Clinical efficacy and safety of achieving very low LDL-cholesterol concentrations with the PCSK9 inhibitor evolocumab: a prespecified secondary analysis of the FOURIER trial",
    authors: "Giugliano RP, et al.",
    year: 2017,
    source: "The Lancet",
    url: "https://doi.org/10.1016/S0140-6736(17)32290-0",
    doi: "10.1016/S0140-6736(17)32290-0",
  },
  oKeefeOptimalLdl2004: {
    id: "oKeefeOptimalLdl2004",
    title:
      "Optimal low-density lipoprotein is 50 to 70 mg/dl: lower is better and physiologically normal",
    authors: "O'Keefe JH Jr, Cordain L, Harris WH, Moe RM, Vogel R",
    year: 2004,
    source: "Journal of the American College of Cardiology",
    url: "https://doi.org/10.1016/j.jacc.2004.03.046",
    doi: "10.1016/j.jacc.2004.03.046",
  },
  samsonStatins2020: {
    id: "samsonStatins2020",
    title:
      "N-of-1 Trial of a Statin, Placebo, or No Treatment to Assess Side Effects",
    authors: "Wood FA, et al.",
    year: 2020,
    source: "New England Journal of Medicine",
    url: "https://doi.org/10.1056/NEJMc2031173",
    doi: "10.1056/NEJMc2031173",
  },
  statinwise2021: {
    id: "statinwise2021",
    title:
      "Statin treatment and muscle symptoms: series of randomised, placebo controlled n-of-1 trials",
    authors: "Herrett E, et al.",
    year: 2021,
    source: "BMJ",
    url: "https://doi.org/10.1136/bmj.n135",
    doi: "10.1136/bmj.n135",
  },
  hypertensionHistory2011: {
    id: "hypertensionHistory2011",
    title:
      "Historical Trends and Milestones in Hypertension Research: A Model of the Process of Translational Research",
    authors: "Kotchen TA",
    year: 2011,
    source: "Hypertension",
    url: "https://doi.org/10.1161/HYPERTENSIONAHA.111.177766",
    doi: "10.1161/HYPERTENSIONAHA.111.177766",
  },
  matthewsHoma1985: {
    id: "matthewsHoma1985",
    title:
      "Homeostasis model assessment: insulin resistance and β-cell function from fasting plasma glucose and insulin concentrations in man",
    authors: "Matthews DR, et al.",
    year: 1985,
    source: "Diabetologia",
    url: "https://doi.org/10.1007/BF00280883",
    doi: "10.1007/BF00280883",
  },
  gayosoHomaIr2013: {
    id: "gayosoHomaIr2013",
    title:
      "Insulin resistance (HOMA-IR) cut-off values and the metabolic syndrome in a general adult population: effect of gender and age: EPIRCE cross-sectional study",
    authors: "Gayoso-Diz P, et al.",
    year: 2013,
    source: "BMC Endocrine Disorders",
    url: "https://doi.org/10.1186/1472-6823-13-47",
    doi: "10.1186/1472-6823-13-47",
  },
  adaDiagnosis2024: {
    id: "adaDiagnosis2024",
    title:
      "2. Diagnosis and Classification of Diabetes: Standards of Care in Diabetes—2024",
    authors: "American Diabetes Association Professional Practice Committee",
    year: 2024,
    source: "Diabetes Care",
    url: "https://doi.org/10.2337/dc24-S002",
    doi: "10.2337/dc24-S002",
  },
  nathanAdag2008: {
    id: "nathanAdag2008",
    title: "Translating the A1C assay into estimated average glucose values",
    authors: "Nathan DM, et al. (A1c-Derived Average Glucose Study Group)",
    year: 2008,
    source: "Diabetes Care",
    url: "https://doi.org/10.2337/dc08-0545",
    doi: "10.2337/dc08-0545",
  },
  albertiMetSyndrome2009: {
    id: "albertiMetSyndrome2009",
    title:
      "Harmonizing the metabolic syndrome: a joint interim statement of the IDF Task Force on Epidemiology and Prevention; NHLBI; AHA; World Heart Federation; International Atherosclerosis Society; and International Association for the Study of Obesity",
    authors: "Alberti KGMM, et al.",
    year: 2009,
    source: "Circulation",
    url: "https://doi.org/10.1161/CIRCULATIONAHA.109.192644",
    doi: "10.1161/CIRCULATIONAHA.109.192644",
  },
  mclaughlinTgHdl2003: {
    id: "mclaughlinTgHdl2003",
    title:
      "Use of metabolic markers to identify overweight individuals who are insulin resistant",
    authors: "McLaughlin T, et al.",
    year: 2003,
    source: "Annals of Internal Medicine",
    url: "https://doi.org/10.7326/0003-4819-139-10-200311180-00007",
    doi: "10.7326/0003-4819-139-10-200311180-00007",
  },
  lancetDementia2024: {
    id: "lancetDementia2024",
    title:
      "Dementia prevention, intervention, and care: 2024 report of the Lancet standing Commission",
    authors: "Livingston G, et al.",
    year: 2024,
    source: "The Lancet",
    url: "https://doi.org/10.1016/S0140-6736(24)01296-0",
    doi: "10.1016/S0140-6736(24)01296-0",
  },
  lancetDementia2020: {
    id: "lancetDementia2020",
    title:
      "Dementia prevention, intervention, and care: 2020 report of the Lancet Commission",
    authors: "Livingston G, et al.",
    year: 2020,
    source: "The Lancet",
    url: "https://doi.org/10.1016/S0140-6736(20)30367-6",
    doi: "10.1016/S0140-6736(20)30367-6",
  },
  accAhaDyslipidemia2026: {
    id: "accAhaDyslipidemia2026",
    title:
      "2026 ACC/AHA/AACVPR/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Guideline on the Management of Dyslipidemia",
    authors: "Blumenthal RS, et al.",
    year: 2026,
    source: "Circulation",
    url: "https://doi.org/10.1161/CIR.0000000000001423",
    doi: "10.1161/CIR.0000000000001423",
  },
  zhangCumulativeLdl2021: {
    id: "zhangCumulativeLdl2021",
    title:
      "Association Between Cumulative Low-Density Lipoprotein Cholesterol Exposure During Young Adulthood and Middle Age and Risk of Cardiovascular Events",
    authors: "Zhang Y, et al.",
    year: 2021,
    source: "JAMA Cardiology",
    url: "https://doi.org/10.1001/jamacardio.2021.3508",
    doi: "10.1001/jamacardio.2021.3508",
  },
  ferenceMendelian2012: {
    id: "ferenceMendelian2012",
    title:
      "Effect of Long-Term Exposure to Lower Low-Density Lipoprotein Cholesterol Beginning Early in Life on the Risk of Coronary Heart Disease: A Mendelian Randomization Analysis",
    authors: "Ference BA, et al.",
    year: 2012,
    source: "Journal of the American College of Cardiology",
    url: "https://doi.org/10.1016/j.jacc.2012.09.017",
    doi: "10.1016/j.jacc.2012.09.017",
  },
  byrneStatinAbsolute2022: {
    id: "byrneStatinAbsolute2022",
    title:
      "Evaluating the Association Between Low-Density Lipoprotein Cholesterol Reduction and Relative and Absolute Effects of Statin Treatment: A Systematic Review and Meta-analysis",
    authors: "Byrne P, et al.",
    year: 2022,
    source: "JAMA Internal Medicine",
    url: "https://doi.org/10.1001/jamainternmed.2022.0134",
    doi: "10.1001/jamainternmed.2022.0134",
  },
  uspstfStatins2022: {
    id: "uspstfStatins2022",
    title:
      "Statin Use for the Primary Prevention of Cardiovascular Disease in Adults: US Preventive Services Task Force Recommendation Statement",
    authors: "US Preventive Services Task Force, Mangione CM, et al.",
    year: 2022,
    source: "JAMA",
    url: "https://doi.org/10.1001/jama.2022.13044",
    doi: "10.1001/jama.2022.13044",
  },
  ldlDurationMeta2024: {
    id: "ldlDurationMeta2024",
    title:
      "Course of the effects of LDL-cholesterol reduction on cardiovascular risk over time: A meta-analysis of 60 randomized controlled trials",
    authors: "Burger PM, et al.",
    year: 2024,
    source: "Atherosclerosis",
    url: "https://doi.org/10.1016/j.atherosclerosis.2024.118540",
    doi: "10.1016/j.atherosclerosis.2024.118540",
  },
  caughtCad2025: {
    id: "caughtCad2025",
    title:
      "Effects of Combining Coronary Calcium Score With Treatment on Plaque Progression in Familial Coronary Artery Disease: A Randomized Clinical Trial (CAUGHT-CAD)",
    authors: "Nerlekar N, et al.",
    year: 2025,
    source: "JAMA",
    url: "https://doi.org/10.1001/jama.2025.0584",
    doi: "10.1001/jama.2025.0584",
  },
  vesaliusCv2025: {
    id: "vesaliusCv2025",
    title:
      "Evolocumab in Patients without a Previous Myocardial Infarction or Stroke (VESALIUS-CV)",
    authors: "Bohula EA, et al.",
    year: 2025,
    source: "New England Journal of Medicine",
    url: "https://doi.org/10.1056/NEJMoa2514428",
    doi: "10.1056/NEJMoa2514428",
  },
  alpacaLepodisiran2025: {
    id: "alpacaLepodisiran2025",
    title:
      "Lepodisiran — A Long-Duration Small Interfering RNA Targeting Lipoprotein(a) (ALPACA)",
    authors: "Nissen SE, et al.",
    year: 2025,
    source: "New England Journal of Medicine",
    url: "https://doi.org/10.1056/NEJMoa2415818",
    doi: "10.1056/NEJMoa2415818",
  },
  clearOutcomes2023: {
    id: "clearOutcomes2023",
    title:
      "Bempedoic Acid and Cardiovascular Outcomes in Statin-Intolerant Patients (CLEAR Outcomes)",
    authors: "Nissen SE, et al.",
    year: 2023,
    source: "New England Journal of Medicine",
    url: "https://doi.org/10.1056/NEJMoa2215024",
    doi: "10.1056/NEJMoa2215024",
  },
  sattarStatinDiabetes2010: {
    id: "sattarStatinDiabetes2010",
    title:
      "Statins and risk of incident diabetes: a collaborative meta-analysis of randomised statin trials",
    authors: "Sattar N, et al.",
    year: 2010,
    source: "The Lancet",
    url: "https://doi.org/10.1016/S0140-6736(09)61965-6",
    doi: "10.1016/S0140-6736(09)61965-6",
  },
  statinDementiaMeta2025: {
    id: "statinDementiaMeta2025",
    title:
      "Statin use and dementia risk: A systematic review and updated meta-analysis",
    authors: "Westphal Filho FL, et al.",
    year: 2025,
    source:
      "Alzheimer's & Dementia: Translational Research & Clinical Interventions",
    url: "https://doi.org/10.1002/trc2.70039",
    doi: "10.1002/trc2.70039",
  },
  hooperSatFat2020: {
    id: "hooperSatFat2020",
    title: "Reduction in saturated fat intake for cardiovascular disease",
    authors: "Hooper L, et al.",
    year: 2020,
    source: "Cochrane Database of Systematic Reviews",
    url: "https://doi.org/10.1002/14651858.CD011737.pub3",
    doi: "10.1002/14651858.CD011737.pub3",
  },
  jovanovskiPsyllium2018: {
    id: "jovanovskiPsyllium2018",
    title:
      "Effect of psyllium (Plantago ovata) fiber on LDL cholesterol and alternative lipid targets, non-HDL cholesterol and apolipoprotein B: a systematic review and meta-analysis of randomized controlled trials",
    authors: "Jovanovski E, et al.",
    year: 2018,
    source: "The American Journal of Clinical Nutrition",
    url: "https://doi.org/10.1093/ajcn/nqy115",
    doi: "10.1093/ajcn/nqy115",
  },
  weightLossLipids2020: {
    id: "weightLossLipids2020",
    title:
      "Weight Loss and Serum Lipids in Overweight and Obese Adults: A Systematic Review and Meta-Analysis",
    authors: "Hasan B, et al.",
    year: 2020,
    source: "The Journal of Clinical Endocrinology & Metabolism",
    url: "https://doi.org/10.1210/clinem/dgaa673",
    doi: "10.1210/clinem/dgaa673",
  },
  holmeOsloExercise2007: {
    id: "holmeOsloExercise2007",
    title:
      "ApoB but not LDL-cholesterol is reduced by exercise training in overweight healthy men. Results from the 1-year randomized Oslo Diet and Exercise Study",
    authors: "Holme I, et al.",
    year: 2007,
    source: "Journal of Internal Medicine",
    url: "https://doi.org/10.1111/j.1365-2796.2007.01806.x",
    doi: "10.1111/j.1365-2796.2007.01806.x",
  },
  mandsagerFitness2018: {
    id: "mandsagerFitness2018",
    title:
      "Association of Cardiorespiratory Fitness With Long-term Mortality Among Adults Undergoing Exercise Treadmill Testing",
    authors: "Mandsager K, et al.",
    year: 2018,
    source: "JAMA Network Open",
    url: "https://doi.org/10.1001/jamanetworkopen.2018.3605",
    doi: "10.1001/jamanetworkopen.2018.3605",
  },
  smokingCessation2025: {
    id: "smokingCessation2025",
    title:
      "Cardiovascular Effects of Smoking and Smoking Cessation: A 2024 Update",
    authors: "Rahman M, et al.",
    year: 2025,
    source: "Global Heart",
    url: "https://doi.org/10.5334/gh.1399",
    doi: "10.5334/gh.1399",
  },
  biddingerAlcohol2022: {
    id: "biddingerAlcohol2022",
    title:
      "Association of Habitual Alcohol Intake With Risk of Cardiovascular Disease",
    authors: "Biddinger KJ, et al.",
    year: 2022,
    source: "JAMA Network Open",
    url: "https://doi.org/10.1001/jamanetworkopen.2022.3849",
    doi: "10.1001/jamanetworkopen.2022.3849",
  },
  lloydJonesEssential8: {
    id: "lloydJonesEssential8",
    title:
      "Life's Essential 8: Updating and Enhancing the American Heart Association's Construct of Cardiovascular Health",
    authors: "Lloyd-Jones DM, et al.",
    year: 2022,
    source: "Circulation",
    url: "https://doi.org/10.1161/CIR.0000000000001078",
    doi: "10.1161/CIR.0000000000001078",
  },
  quispeRemnant2021: {
    id: "quispeRemnant2021",
    title:
      "Remnant cholesterol predicts cardiovascular disease beyond LDL and ApoB: a primary prevention study",
    authors: "Quispe R, et al.",
    year: 2021,
    source: "European Heart Journal",
    url: "https://doi.org/10.1093/eurheartj/ehab432",
    doi: "10.1093/eurheartj/ehab432",
  },
  parikhPregnancy2021: {
    id: "parikhPregnancy2021",
    title:
      "Adverse Pregnancy Outcomes and Cardiovascular Disease Risk: Unique Opportunities for Cardiovascular Disease Prevention in Women",
    authors: "Parikh NI, et al.",
    year: 2021,
    source: "Circulation",
    url: "https://doi.org/10.1161/CIR.0000000000000961",
    doi: "10.1161/CIR.0000000000000961",
  },
  menopauseLipids2023: {
    id: "menopauseLipids2023",
    title:
      "Low-density lipoprotein subclasses over the menopausal transition and risk of coronary calcification and carotid atherosclerosis: the SWAN Heart and HDL ancillary studies",
    authors: "El Khoudary SR, et al.",
    year: 2023,
    source: "Menopause",
    url: "https://doi.org/10.1097/GME.0000000000002245",
    doi: "10.1097/GME.0000000000002245",
  },
  nlaYouthScreening: {
    id: "nlaYouthScreening",
    title: "Cholesterol Screening in Children, Adolescents and Young Adults",
    authors: "National Lipid Association",
    year: 2015,
    source: "National Lipid Association",
    url: "https://www.lipid.org/nla/cholesterol-screening-children-adolescents-and-young-adults",
  },
  stareeTrial: {
    id: "stareeTrial",
    title:
      "A Clinical Trial of STAtin Therapy for Reducing Events in the Elderly (STAREE)",
    authors: "STAREE Investigators, Monash University",
    year: 2026,
    source: "ClinicalTrials.gov NCT02099123",
    url: "https://clinicaltrials.gov/study/NCT02099123",
  },
  preventableTrial: {
    id: "preventableTrial",
    title:
      "Pragmatic Evaluation of Events And Benefits of Lipid-lowering in Older Adults (PREVENTABLE)",
    authors: "PREVENTABLE Investigators",
    year: 2026,
    source: "ClinicalTrials.gov NCT04262206",
    url: "https://clinicaltrials.gov/study/NCT04262206",
  },
  fourierPrimary2017: {
    id: "fourierPrimary2017",
    title:
      "Evolocumab and Clinical Outcomes in Patients with Cardiovascular Disease (FOURIER)",
    authors: "Sabatine MS, et al.",
    year: 2017,
    source: "New England Journal of Medicine",
    url: "https://doi.org/10.1056/NEJMoa1615664",
    doi: "10.1056/NEJMoa1615664",
  },
  orionInclisiran2020: {
    id: "orionInclisiran2020",
    title:
      "Two Phase 3 Trials of Inclisiran in Patients with Elevated LDL Cholesterol (ORION-10 and ORION-11)",
    authors: "Ray KK, et al.",
    year: 2020,
    source: "New England Journal of Medicine",
    url: "https://doi.org/10.1056/NEJMoa1912387",
    doi: "10.1056/NEJMoa1912387",
  },
  ldlExposureHypothesis2024: {
    id: "ldlExposureHypothesis2024",
    title:
      "The LDL cumulative exposure hypothesis: evidence and practical applications",
    authors: "Ference BA, Braunwald E, Catapano AL",
    year: 2024,
    source: "Nature Reviews Cardiology",
    url: "https://doi.org/10.1038/s41569-024-01039-5",
    doi: "10.1038/s41569-024-01039-5",
  },
  verve102BaseEditing2026: {
    id: "verve102BaseEditing2026",
    title:
      "In Vivo Base Editing of PCSK9 with VERVE-102 for Hypercholesterolemia",
    authors: "Vafai SB, et al.",
    year: 2026,
    source: "New England Journal of Medicine",
    url: "https://doi.org/10.1056/NEJMoa2601283",
    doi: "10.1056/NEJMoa2601283",
  },
} satisfies Record<string, Reference>;

export type ReferenceId = keyof typeof refs;

export function getRef(id: ReferenceId): Reference {
  const ref = refs[id];
  if (!ref) throw new Error(`Unknown reference id: ${id}`);
  return ref;
}

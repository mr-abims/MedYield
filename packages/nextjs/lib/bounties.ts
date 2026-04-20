import type { Bounty } from "./types";

const day = 86400000;

export const BOUNTIES: Bounty[] = [
  {
    id: "b1",
    org: "Novartis Research",
    verified: true,
    title: "Cardiovascular Risk Study",
    description: "Understanding blood pressure patterns in adults aged 40–65.",
    fields: [
      { name: "Age", min: 40, max: 65, unit: "yrs", type: "integer" },
      { name: "Systolic BP", min: 80, max: 200, unit: "mmHg", type: "integer" },
      { name: "Smoker", min: 0, max: 1, unit: "yes/no", type: "boolean" },
    ],
    templateLabel: "Aggregate Stats",
    computeDescription:
      "We'll compute average blood pressure across participants — individual readings are never revealed.",
    pricePerRecord: 3.5,
    escrow: 7000,
    escrowUsed: 4200,
    minSubmissions: 500,
    maxSubmissions: 2000,
    submissions: 1200,
    validatedSubmissions: 1147,
    deadline: Date.now() + 8 * day,
    status: "OPEN",
  },
  {
    id: "b2",
    org: "MIT Health Lab",
    verified: true,
    title: "Diabetes Screening Cohort",
    description:
      "Identifying HbA1c patterns in pre-diabetic adults for a prevention study.",
    fields: [
      { name: "Age", min: 30, max: 75, unit: "yrs", type: "integer" },
      { name: "HbA1c", min: 5.0, max: 10.0, unit: "%", type: "decimal" },
      { name: "BMI", min: 18, max: 45, unit: "kg/m²", type: "decimal" },
    ],
    templateLabel: "Eligibility Count",
    computeDescription:
      "We'll count how many of you qualify for our prevention trial — we never see your individual answers.",
    pricePerRecord: 5.0,
    escrow: 5000,
    escrowUsed: 1500,
    minSubmissions: 300,
    maxSubmissions: 1000,
    submissions: 300,
    validatedSubmissions: 284,
    deadline: Date.now() + 3 * day,
    status: "OPEN",
  },
  {
    id: "b3",
    org: "PulmoHealth Inc.",
    verified: false,
    title: "Respiratory Health Survey",
    description:
      "Studying peak expiratory flow in adults with respiratory conditions.",
    fields: [
      { name: "Age", min: 18, max: 80, unit: "yrs", type: "integer" },
      { name: "Peak Flow", min: 100, max: 700, unit: "L/min", type: "integer" },
      { name: "Smoker", min: 0, max: 1, unit: "yes/no", type: "boolean" },
    ],
    templateLabel: "Risk Score",
    computeDescription:
      "We'll calculate an average respiratory risk score — individual scores are never revealed.",
    pricePerRecord: 2.0,
    escrow: 2000,
    escrowUsed: 400,
    minSubmissions: 200,
    maxSubmissions: 1000,
    submissions: 198,
    validatedSubmissions: 192,
    deadline: Date.now() + 14 * day,
    status: "OPEN",
  },
  {
    id: "b4",
    org: "Stanford Sleep Center",
    verified: true,
    title: "Sleep Disorders Research",
    description:
      "Mapping sleep quality metrics to predict apnea risk across age groups.",
    fields: [
      { name: "Age", min: 18, max: 75, unit: "yrs", type: "integer" },
      { name: "Sleep Hours", min: 3, max: 12, unit: "hrs/night", type: "decimal" },
      { name: "Snoring", min: 0, max: 1, unit: "yes/no", type: "boolean" },
    ],
    templateLabel: "Risk Score",
    computeDescription:
      "We'll compute an average sleep apnea risk score — no individual data is ever exposed.",
    pricePerRecord: 4.0,
    escrow: 8000,
    escrowUsed: 2400,
    minSubmissions: 400,
    maxSubmissions: 2000,
    submissions: 600,
    validatedSubmissions: 577,
    deadline: Date.now() + 20 * day,
    status: "OPEN",
  },
];

export function findBounty(id: string): Bounty | undefined {
  return BOUNTIES.find((b) => b.id === id);
}

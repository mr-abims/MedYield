export type Role = "patient" | "org";

export type FieldType = "integer" | "decimal" | "boolean";

export interface BountyField {
  name: string;
  min: number;
  max: number;
  unit: string;
  type: FieldType;
}

export type BountyStatus = "OPEN" | "COMPUTING" | "COMPLETED" | "EXPIRED";

export interface Bounty {
  id: string;
  org: string;
  verified: boolean;
  title: string;
  description: string;
  fields: BountyField[];
  templateLabel: string;
  computeDescription: string;
  pricePerRecord: number;
  escrow: number;
  escrowUsed: number;
  minSubmissions: number;
  maxSubmissions: number;
  submissions: number;
  validatedSubmissions: number;
  deadline: number;
  status: BountyStatus;
}

export type SubmissionStatus = "paid" | "pending" | "rejected";

export interface Submission {
  bountyId: string;
  bountyTitle: string;
  org: string;
  date: string;
  amount: number;
  status: SubmissionStatus;
}

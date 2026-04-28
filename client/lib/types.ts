export type Role =
  | "borrower"
  | "sales"
  | "sanction"
  | "disbursement"
  | "collection"
  | "admin";

export type EmploymentMode = "salaried" | "self_employed" | "unemployed";

export type LoanStatus = "applied" | "sanctioned" | "rejected" | "disbursed" | "closed";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  breStatus?: "pending" | "passed" | "failed";
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface PersonalDetails {
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

export interface LoanSummary {
  id: string;
  status: LoanStatus;
  amount: number;
  tenure: number;
  totalRepayment: number;
}

export interface BorrowerProfile {
  id: string;
  name: string;
  email: string;
  currentStep: "welcome" | "personal" | "upload" | "loan" | "status" | "closed";
  breStatus: "pending" | "passed" | "failed";
  breFailReason?: string;
  personalDetails: PersonalDetails | null;
  salarySlipUrl?: string;
  hasLoan: boolean;
  loan: LoanSummary | null;
}

export interface PaymentRecord {
  _id: string;
  amount: number;
  utr: string;
  paymentDate: string;
  createdAt: string;
}

export interface SalesLead {
  _id: string;
  name: string;
  email: string;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  createdAt: string;
}

export interface LoanQueueItem {
  _id: string;
  borrowerId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        monthlySalary?: number;
      };
  amount: number;
  tenure: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  rejectionReason?: string;
  createdAt: string;
  sanctionedAt?: string;
  disbursedAt?: string;
}

export interface CollectionQueueItem extends LoanQueueItem {
  totalPaid: number;
  outstanding: number;
}

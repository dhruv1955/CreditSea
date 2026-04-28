import mongoose, { Document, Schema, Types } from "mongoose";

export type LoanStatus = "applied" | "sanctioned" | "rejected" | "disbursed" | "closed";

export interface ILoan extends Document {
  borrowerId: Types.ObjectId;
  amount: number;
  tenure: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  rejectionReason?: string;
  salarySlipUrl: string;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    borrowerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    tenure: { type: Number, required: true },
    interestRate: { type: Number, required: true, default: 12 },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    status: {
      type: String,
      enum: ["applied", "sanctioned", "rejected", "disbursed", "closed"],
      required: true,
      default: "applied",
    },
    rejectionReason: { type: String },
    salarySlipUrl: { type: String, required: true },
    sanctionedAt: { type: Date },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const Loan = mongoose.model<ILoan>("Loan", loanSchema);

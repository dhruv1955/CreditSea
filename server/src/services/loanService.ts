import { Payment } from "../models/Payment";
import { Types } from "mongoose";
import { FIXED_INTEREST_RATE } from "../constants/validators";

export interface LoanCalculation {
  simpleInterest: number;
  totalRepayment: number;
}

export const calculateLoan = (principal: number, tenureDays: number): LoanCalculation => {
  const simpleInterest = (principal * FIXED_INTEREST_RATE * tenureDays) / (365 * 100);
  const totalRepayment = principal + simpleInterest;
  return {
    simpleInterest: Number(simpleInterest.toFixed(2)),
    totalRepayment: Number(totalRepayment.toFixed(2)),
  };
};

export const getOutstandingBalance = async (loanId: string, totalRepayment: number): Promise<number> => {
  const aggregation = await Payment.aggregate<{ totalPaid: number }>([
    { $match: { loanId: { $eq: new Types.ObjectId(loanId) } } },
    { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
  ]);
  const totalPaid = aggregation[0]?.totalPaid ?? 0;
  return Number((totalRepayment - totalPaid).toFixed(2));
};

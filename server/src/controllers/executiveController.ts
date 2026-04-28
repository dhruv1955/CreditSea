import { Request, Response } from "express";
import mongoose from "mongoose";
import { Loan } from "../models/Loan";
import { Payment } from "../models/Payment";
import { User } from "../models/User";
import { getOutstandingBalance } from "../services/loanService";

interface RejectBody {
  rejectionReason: string;
}

interface PaymentBody {
  utr: string;
  amount: number;
  paymentDate: string;
}

export const getSalesLeads = async (_req: Request, res: Response) => {
  try {
    const leads = await User.aggregate([
      { $match: { role: "borrower" } },
      {
        $lookup: {
          from: "loans",
          localField: "_id",
          foreignField: "borrowerId",
          as: "loans",
        },
      },
      {
        $match: {
          $or: [
            { loans: { $size: 0 } },
            {
              loans: {
                $not: {
                  $elemMatch: { status: { $in: ["applied", "sanctioned", "disbursed", "closed"] } },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          monthlySalary: 1,
          employmentMode: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({ success: true, data: leads });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Failed to fetch sales leads" });
  }
};

export const getSanctionQueue = async (_req: Request, res: Response) => {
  try {
    const loans = await Loan.find({ status: "applied" }).populate("borrowerId", "name email monthlySalary").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: loans });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Failed to fetch sanction queue" });
  }
};

export const approveLoan = async (req: Request<{ loanId: string }>, res: Response) => {
  try {
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }
    if (loan.status !== "applied") {
      return res.status(400).json({ success: false, message: "Only applied loans can be sanctioned" });
    }

    loan.status = "sanctioned";
    loan.sanctionedAt = new Date();
    await loan.save();

    return res.status(200).json({ success: true, message: "Loan sanctioned", data: loan });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Failed to sanction loan" });
  }
};

export const rejectLoan = async (req: Request<{ loanId: string }, unknown, RejectBody>, res: Response) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: "rejectionReason is required" });
    }

    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }
    if (loan.status !== "applied") {
      return res.status(400).json({ success: false, message: "Only applied loans can be rejected" });
    }

    loan.status = "rejected";
    loan.rejectionReason = rejectionReason;
    await loan.save();

    return res.status(200).json({ success: true, message: "Loan rejected", data: loan });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Failed to reject loan" });
  }
};

export const getDisbursementQueue = async (_req: Request, res: Response) => {
  try {
    const loans = await Loan.find({ status: "sanctioned" }).populate("borrowerId", "name email").sort({ sanctionedAt: -1 });
    return res.status(200).json({ success: true, data: loans });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Failed to fetch disbursement queue" });
  }
};

export const disburseLoan = async (req: Request<{ loanId: string }>, res: Response) => {
  try {
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }
    if (loan.status !== "sanctioned") {
      return res.status(400).json({ success: false, message: "Only sanctioned loans can be disbursed" });
    }

    loan.status = "disbursed";
    loan.disbursedAt = new Date();
    await loan.save();

    return res.status(200).json({ success: true, message: "Loan disbursed", data: loan });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Failed to disburse loan" });
  }
};

export const getCollectionQueue = async (_req: Request, res: Response) => {
  try {
    const loans = await Loan.find({ status: "disbursed" }).populate("borrowerId", "name email").sort({ disbursedAt: -1 }).lean();

    const enriched = await Promise.all(
      loans.map(async (loan) => {
        const payments = await Payment.aggregate<{ totalPaid: number }>([
          { $match: { loanId: new mongoose.Types.ObjectId(loan._id.toString()) } },
          { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
        ]);
        const totalPaid = payments[0]?.totalPaid ?? 0;
        const outstanding = Number((loan.totalRepayment - totalPaid).toFixed(2));
        return { ...loan, totalPaid, outstanding };
      })
    );

    return res.status(200).json({ success: true, data: enriched });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Failed to fetch collection queue" });
  }
};

export const recordPayment = async (
  req: Request<{ loanId: string }, unknown, PaymentBody>,
  res: Response
) => {
  try {
    const { loanId } = req.params;
    const { utr, amount, paymentDate } = req.body;

    if (!utr || amount === undefined || amount === null || !paymentDate) {
      return res.status(400).json({ success: false, message: "utr, amount and paymentDate are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Payment amount must be greater than 0" });
    }

    const parsedDate = new Date(paymentDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid paymentDate format" });
    }
    if (parsedDate > new Date()) {
      return res.status(400).json({ success: false, message: "paymentDate cannot be in the future" });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }
    if (loan.status !== "disbursed") {
      return res.status(400).json({ success: false, message: "Payments allowed only for disbursed loans" });
    }

    const existingUtr = await Payment.findOne({ utr });
    if (existingUtr) {
      return res.status(409).json({ success: false, message: "UTR already exists" });
    }

    const outstanding = await getOutstandingBalance(loan._id.toString(), loan.totalRepayment);
    if (amount > outstanding) {
      return res.status(400).json({ success: false, message: "Payment amount exceeds outstanding balance" });
    }

    await Payment.create({
      loanId: loan._id,
      borrowerId: loan.borrowerId,
      amount,
      utr,
      paymentDate: parsedDate,
    });

    const outstandingAfter = await getOutstandingBalance(loan._id.toString(), loan.totalRepayment);
    if (outstandingAfter <= 0) {
      loan.status = "closed";
      loan.closedAt = new Date();
      await loan.save();
    }

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: { loanId: loan._id, outstanding: outstandingAfter, status: loan.status },
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({ success: false, message: "UTR already exists" });
    }
    return res.status(500).json({ success: false, message: "Failed to record payment" });
  }
};

export const getCollectionPaymentHistory = async (
  req: Request<{ loanId: string }>,
  res: Response
) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }

    const payments = await Payment.find({ loanId: loan._id }).sort({ paymentDate: -1 });

    return res.status(200).json({
      success: true,
      data: {
        loanId: loan._id,
        borrowerId: loan.borrowerId,
        totalRepayment: loan.totalRepayment,
        payments,
      },
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Failed to fetch payment history" });
  }
};

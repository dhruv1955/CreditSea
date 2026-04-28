"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPayment = exports.getCollectionQueue = exports.disburseLoan = exports.getDisbursementQueue = exports.rejectLoan = exports.approveLoan = exports.getSanctionQueue = exports.getSalesLeads = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Loan_1 = require("../models/Loan");
const Payment_1 = require("../models/Payment");
const User_1 = require("../models/User");
const loanService_1 = require("../services/loanService");
const getSalesLeads = async (_req, res) => {
    try {
        const leads = await User_1.User.aggregate([
            { $match: { role: "borrower", breStatus: "passed" } },
            {
                $lookup: {
                    from: "loans",
                    localField: "_id",
                    foreignField: "borrowerId",
                    as: "loans",
                },
            },
            { $match: { loans: { $size: 0 } } },
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
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to fetch sales leads" });
    }
};
exports.getSalesLeads = getSalesLeads;
const getSanctionQueue = async (_req, res) => {
    try {
        const loans = await Loan_1.Loan.find({ status: "applied" }).populate("borrowerId", "name email monthlySalary").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: loans });
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to fetch sanction queue" });
    }
};
exports.getSanctionQueue = getSanctionQueue;
const approveLoan = async (req, res) => {
    try {
        const loan = await Loan_1.Loan.findById(req.params.loanId);
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
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to sanction loan" });
    }
};
exports.approveLoan = approveLoan;
const rejectLoan = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        if (!rejectionReason) {
            return res.status(400).json({ success: false, message: "rejectionReason is required" });
        }
        const loan = await Loan_1.Loan.findById(req.params.loanId);
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
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to reject loan" });
    }
};
exports.rejectLoan = rejectLoan;
const getDisbursementQueue = async (_req, res) => {
    try {
        const loans = await Loan_1.Loan.find({ status: "sanctioned" }).populate("borrowerId", "name email").sort({ sanctionedAt: -1 });
        return res.status(200).json({ success: true, data: loans });
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to fetch disbursement queue" });
    }
};
exports.getDisbursementQueue = getDisbursementQueue;
const disburseLoan = async (req, res) => {
    try {
        const loan = await Loan_1.Loan.findById(req.params.loanId);
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
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to disburse loan" });
    }
};
exports.disburseLoan = disburseLoan;
const getCollectionQueue = async (_req, res) => {
    try {
        const loans = await Loan_1.Loan.find({ status: "disbursed" }).populate("borrowerId", "name email").sort({ disbursedAt: -1 }).lean();
        const enriched = await Promise.all(loans.map(async (loan) => {
            const payments = await Payment_1.Payment.aggregate([
                { $match: { loanId: new mongoose_1.default.Types.ObjectId(loan._id.toString()) } },
                { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
            ]);
            const totalPaid = payments[0]?.totalPaid ?? 0;
            const outstanding = Number((loan.totalRepayment - totalPaid).toFixed(2));
            return { ...loan, totalPaid, outstanding };
        }));
        return res.status(200).json({ success: true, data: enriched });
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to fetch collection queue" });
    }
};
exports.getCollectionQueue = getCollectionQueue;
const recordPayment = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { utr, amount, paymentDate } = req.body;
        if (!utr || !amount || !paymentDate) {
            return res.status(400).json({ success: false, message: "utr, amount and paymentDate are required" });
        }
        const loan = await Loan_1.Loan.findById(loanId);
        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }
        if (loan.status !== "disbursed") {
            return res.status(400).json({ success: false, message: "Payments allowed only for disbursed loans" });
        }
        const existingUtr = await Payment_1.Payment.findOne({ utr });
        if (existingUtr) {
            return res.status(409).json({ success: false, message: "UTR already exists" });
        }
        const outstanding = await (0, loanService_1.getOutstandingBalance)(loan._id.toString(), loan.totalRepayment);
        if (amount > outstanding) {
            return res.status(400).json({ success: false, message: "Payment amount exceeds outstanding balance" });
        }
        await Payment_1.Payment.create({
            loanId: loan._id,
            borrowerId: loan.borrowerId,
            amount,
            utr,
            paymentDate: new Date(paymentDate),
        });
        const outstandingAfter = await (0, loanService_1.getOutstandingBalance)(loan._id.toString(), loan.totalRepayment);
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
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "UTR already exists" });
        }
        return res.status(500).json({ success: false, message: "Failed to record payment" });
    }
};
exports.recordPayment = recordPayment;

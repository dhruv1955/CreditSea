"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutstandingBalance = exports.calculateLoan = exports.FIXED_INTEREST_RATE = void 0;
const Payment_1 = require("../models/Payment");
const mongoose_1 = require("mongoose");
exports.FIXED_INTEREST_RATE = 12;
const calculateLoan = (principal, tenureDays) => {
    const simpleInterest = (principal * exports.FIXED_INTEREST_RATE * tenureDays) / (365 * 100);
    const totalRepayment = principal + simpleInterest;
    return {
        simpleInterest: Number(simpleInterest.toFixed(2)),
        totalRepayment: Number(totalRepayment.toFixed(2)),
    };
};
exports.calculateLoan = calculateLoan;
const getOutstandingBalance = async (loanId, totalRepayment) => {
    const aggregation = await Payment_1.Payment.aggregate([
        { $match: { loanId: { $eq: new mongoose_1.Types.ObjectId(loanId) } } },
        { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
    ]);
    const totalPaid = aggregation[0]?.totalPaid ?? 0;
    return Number((totalRepayment - totalPaid).toFixed(2));
};
exports.getOutstandingBalance = getOutstandingBalance;

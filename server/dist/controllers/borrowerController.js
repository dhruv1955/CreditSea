"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyLoan = exports.applyLoan = exports.uploadSalarySlip = exports.savePersonalDetails = void 0;
const Loan_1 = require("../models/Loan");
const User_1 = require("../models/User");
const breService_1 = require("../services/breService");
const loanService_1 = require("../services/loanService");
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const getBorrower = async (userId) => User_1.User.findOne({ _id: userId, role: "borrower" });
const savePersonalDetails = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { name, pan, dob, monthlySalary, employmentMode } = req.body;
        if (!name || !pan || !dob || monthlySalary === undefined || !employmentMode) {
            return res.status(400).json({ success: false, message: "All personal fields are required" });
        }
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }
        if (typeof pan !== "string" || !PAN_REGEX.test(pan.toUpperCase())) {
            return res.status(400).json({ success: false, message: "PAN format is invalid" });
        }
        const salary = Number(monthlySalary);
        if (!Number.isFinite(salary) || salary <= 0) {
            return res.status(400).json({ success: false, message: "Monthly salary must be a valid positive number" });
        }
        if (!["salaried", "self_employed", "unemployed"].includes(employmentMode)) {
            return res.status(400).json({ success: false, message: "Invalid employment mode" });
        }
        const user = await getBorrower(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Borrower not found" });
        }
        const dobDate = new Date(dob);
        if (Number.isNaN(dobDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date of birth" });
        }
        const breResult = (0, breService_1.runBre)({
            pan: pan.toUpperCase(),
            dob: dobDate,
            monthlySalary: salary,
            employmentMode,
        });
        user.name = name;
        user.pan = pan.toUpperCase();
        user.dob = dobDate;
        user.monthlySalary = salary;
        user.employmentMode = employmentMode;
        user.breStatus = breResult.passed ? "passed" : "failed";
        user.breFailReason = breResult.passed ? undefined : breResult.reason;
        await user.save();
        if (!breResult.passed) {
            return res.status(400).json({ success: false, message: breResult.reason, data: { breStatus: "failed" } });
        }
        return res.status(200).json({ success: true, message: "Personal details saved", data: { breStatus: "passed" } });
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to save personal details" });
    }
};
exports.savePersonalDetails = savePersonalDetails;
const uploadSalarySlip = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = await getBorrower(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Borrower not found" });
        }
        if (user.breStatus !== "passed") {
            return res.status(403).json({ success: false, message: "BRE must pass before upload" });
        }
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: "Salary slip file is required" });
        }
        user.salarySlipUrl = `/uploads/${file.filename}`;
        await user.save();
        return res.status(200).json({ success: true, message: "File uploaded", data: { salarySlipUrl: `/uploads/${file.filename}` } });
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to upload salary slip" });
    }
};
exports.uploadSalarySlip = uploadSalarySlip;
const applyLoan = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { amount, tenure } = req.body;
        if (amount === undefined || amount === null || tenure === undefined || tenure === null) {
            return res.status(400).json({ success: false, message: "amount and tenure are required" });
        }
        if (amount < 50000 || amount > 500000) {
            return res.status(400).json({ success: false, message: "Amount must be between 50000 and 500000" });
        }
        if (tenure < 30 || tenure > 365) {
            return res.status(400).json({ success: false, message: "Tenure must be between 30 and 365 days" });
        }
        const user = await getBorrower(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Borrower not found" });
        }
        if (user.breStatus !== "passed") {
            return res.status(403).json({ success: false, message: "BRE must pass before applying loan" });
        }
        const existingLoan = await Loan_1.Loan.findOne({ borrowerId: user._id });
        if (existingLoan) {
            return res.status(400).json({ success: false, message: "Loan already exists for this borrower" });
        }
        if (!user.salarySlipUrl) {
            return res.status(400).json({ success: false, message: "Upload salary slip before applying" });
        }
        const { simpleInterest, totalRepayment } = (0, loanService_1.calculateLoan)(amount, tenure);
        const createdLoan = await Loan_1.Loan.create({
            borrowerId: user._id,
            amount,
            tenure,
            interestRate: loanService_1.FIXED_INTEREST_RATE,
            simpleInterest,
            totalRepayment,
            status: "applied",
            salarySlipUrl: user.salarySlipUrl,
        });
        return res.status(201).json({
            success: true,
            message: "Loan applied successfully",
            data: {
                id: createdLoan._id,
                amount: createdLoan.amount,
                tenure: createdLoan.tenure,
                interestRate: createdLoan.interestRate,
                simpleInterest: createdLoan.simpleInterest,
                totalRepayment: createdLoan.totalRepayment,
                status: createdLoan.status,
            },
        });
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to apply loan" });
    }
};
exports.applyLoan = applyLoan;
const getMyLoan = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const loan = await Loan_1.Loan.findOne({ borrowerId: userId });
        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }
        return res.status(200).json({ success: true, data: loan });
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to fetch loan" });
    }
};
exports.getMyLoan = getMyLoan;

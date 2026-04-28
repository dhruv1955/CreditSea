"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_MONTHLY_SALARY = exports.MAX_AGE_FOR_LOAN = exports.MIN_AGE_FOR_LOAN = exports.FIXED_INTEREST_RATE = exports.MAX_TENURE_DAYS = exports.MIN_TENURE_DAYS = exports.MAX_LOAN_AMOUNT = exports.MIN_LOAN_AMOUNT = exports.PAN_REGEX = void 0;
// Shared validation regex patterns and constants
exports.PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
// Loan constants
exports.MIN_LOAN_AMOUNT = 50000;
exports.MAX_LOAN_AMOUNT = 500000;
exports.MIN_TENURE_DAYS = 30;
exports.MAX_TENURE_DAYS = 365;
exports.FIXED_INTEREST_RATE = 12;
// BRE constraints
exports.MIN_AGE_FOR_LOAN = 23;
exports.MAX_AGE_FOR_LOAN = 50;
exports.MIN_MONTHLY_SALARY = 25000;

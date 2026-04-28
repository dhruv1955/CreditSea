"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBre = void 0;
const validators_1 = require("../constants/validators");
const getAge = (dob) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const beforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate());
    if (beforeBirthday) {
        age -= 1;
    }
    return age;
};
const runBre = ({ pan, dob, monthlySalary, employmentMode }) => {
    const age = getAge(dob);
    if (age < validators_1.MIN_AGE_FOR_LOAN || age > validators_1.MAX_AGE_FOR_LOAN) {
        return { passed: false, reason: `Age must be between ${validators_1.MIN_AGE_FOR_LOAN} and ${validators_1.MAX_AGE_FOR_LOAN}` };
    }
    if (monthlySalary < validators_1.MIN_MONTHLY_SALARY) {
        return { passed: false, reason: `Monthly salary must be at least ${validators_1.MIN_MONTHLY_SALARY}` };
    }
    if (!validators_1.PAN_REGEX.test(pan)) {
        return { passed: false, reason: "PAN format is invalid" };
    }
    if (employmentMode === "unemployed") {
        return { passed: false, reason: "Employment mode cannot be unemployed" };
    }
    return { passed: true };
};
exports.runBre = runBre;

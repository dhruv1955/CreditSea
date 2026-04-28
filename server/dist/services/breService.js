"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBre = void 0;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
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
    if (age < 23 || age > 50) {
        return { passed: false, reason: "Age must be between 23 and 50" };
    }
    if (monthlySalary < 25000) {
        return { passed: false, reason: "Monthly salary must be at least 25000" };
    }
    if (!PAN_REGEX.test(pan)) {
        return { passed: false, reason: "PAN format is invalid" };
    }
    if (employmentMode === "unemployed") {
        return { passed: false, reason: "Employment mode cannot be unemployed" };
    }
    return { passed: true };
};
exports.runBre = runBre;

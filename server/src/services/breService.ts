import { EmploymentMode } from "../models/User";
import { PAN_REGEX, MIN_AGE_FOR_LOAN, MAX_AGE_FOR_LOAN, MIN_MONTHLY_SALARY } from "../constants/validators";

interface BreInput {
  pan: string;
  dob: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

interface BreResultPassed {
  passed: true;
}

interface BreResultFailed {
  passed: false;
  reason: string;
}

export type BreResult = BreResultPassed | BreResultFailed;

const getAge = (dob: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const beforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate());
  if (beforeBirthday) {
    age -= 1;
  }
  return age;
};

export const runBre = ({ pan, dob, monthlySalary, employmentMode }: BreInput): BreResult => {
  const age = getAge(dob);
  if (age < MIN_AGE_FOR_LOAN || age > MAX_AGE_FOR_LOAN) {
    return { passed: false, reason: `Age must be between ${MIN_AGE_FOR_LOAN} and ${MAX_AGE_FOR_LOAN}` };
  }

  if (monthlySalary < MIN_MONTHLY_SALARY) {
    return { passed: false, reason: `Monthly salary must be at least ${MIN_MONTHLY_SALARY}` };
  }

  if (!PAN_REGEX.test(pan)) {
    return { passed: false, reason: "PAN format is invalid" };
  }

  if (employmentMode === "unemployed") {
    return { passed: false, reason: "Employment mode cannot be unemployed" };
  }

  return { passed: true };
};

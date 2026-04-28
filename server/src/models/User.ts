import mongoose, { Document, Schema } from "mongoose";
import { Role } from "../types";

export type EmploymentMode = "salaried" | "self_employed" | "unemployed";
export type BreStatus = "pending" | "passed" | "failed";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  pan?: string;
  dob?: Date;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  salarySlipUrl?: string;
  breStatus: BreStatus;
  breFailReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["borrower", "sales", "sanction", "disbursement", "collection", "admin"],
      required: true,
    },
    pan: { type: String, trim: true, uppercase: true },
    dob: { type: Date },
    monthlySalary: { type: Number },
    employmentMode: { type: String, enum: ["salaried", "self_employed", "unemployed"] },
    salarySlipUrl: { type: String },
    breStatus: { type: String, enum: ["pending", "passed", "failed"], default: "pending" },
    breFailReason: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);

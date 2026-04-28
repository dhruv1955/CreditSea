import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { User } from "./models/User";
import { Role } from "./types";

dotenv.config();

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const users: SeedUser[] = [
  { name: "Admin User", email: "admin@lms.com", password: "Admin@123", role: "admin" },
  { name: "Sales User", email: "sales@lms.com", password: "Sales@123", role: "sales" },
  { name: "Sanction User", email: "sanction@lms.com", password: "Sanction@123", role: "sanction" },
  { name: "Disbursement User", email: "disburse@lms.com", password: "Disburse@123", role: "disbursement" },
  { name: "Collection User", email: "collect@lms.com", password: "Collect@123", role: "collection" },
  { name: "Borrower User", email: "borrower@lms.com", password: "Borrower@123", role: "borrower" },
];

const seed = async () => {
  await connectDB();

  for (const item of users) {
    const existing = await User.findOne({ email: item.email });
    if (existing) {
      continue;
    }

    const hashedPassword = await bcrypt.hash(item.password, 10);
    await User.create({
      name: item.name,
      email: item.email,
      password: hashedPassword,
      role: item.role,
    });
  }

  console.log("Seed complete");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});

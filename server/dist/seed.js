"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const User_1 = require("./models/User");
dotenv_1.default.config();
const users = [
    { name: "Admin User", email: "admin@lms.com", password: "Admin@123", role: "admin" },
    { name: "Sales User", email: "sales@lms.com", password: "Sales@123", role: "sales" },
    { name: "Sanction User", email: "sanction@lms.com", password: "Sanction@123", role: "sanction" },
    { name: "Disbursement User", email: "disburse@lms.com", password: "Disburse@123", role: "disbursement" },
    { name: "Collection User", email: "collect@lms.com", password: "Collect@123", role: "collection" },
    { name: "Borrower User", email: "borrower@lms.com", password: "Borrower@123", role: "borrower" },
];
const seed = async () => {
    await (0, db_1.connectDB)();
    for (const item of users) {
        const existing = await User_1.User.findOne({ email: item.email });
        if (existing) {
            continue;
        }
        const hashedPassword = await bcrypt_1.default.hash(item.password, 10);
        await User_1.User.create({
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

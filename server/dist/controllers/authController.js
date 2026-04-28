"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "name, email and password are required" });
        }
        const existing = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await User_1.User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "borrower",
        });
        return res.status(201).json({
            success: true,
            data: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to signup" });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "email and password are required" });
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const passwordMatches = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const secret = process.env.JWT_SECRET;
        const expiresIn = (process.env.JWT_EXPIRES_IN || "7d");
        if (!secret) {
            throw new Error("JWT_SECRET missing");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), role: user.role, email: user.email }, secret, { expiresIn });
        return res.status(200).json({
            success: true,
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role, breStatus: user.breStatus },
            },
        });
    }
    catch (_error) {
        return res.status(500).json({ success: false, message: "Failed to login" });
    }
};
exports.login = login;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
const auth_1 = __importDefault(require("./routes/auth"));
const borrower_1 = __importDefault(require("./routes/borrower"));
const executive_1 = __importDefault(require("./routes/executive"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 5000);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.resolve(process.env.UPLOAD_DIR || "uploads/")));
app.get("/api/health", (_req, res) => {
    res.status(200).json({ success: true, message: "LMS server healthy" });
});
app.use("/api/auth", auth_1.default);
app.use("/api/borrower", borrower_1.default);
app.use("/api/executive", executive_1.default);
app.use((error, _req, res, _next) => {
    if (error.message.includes("Only PDF, JPG, PNG files are allowed")) {
        return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message.toLowerCase().includes("file too large")) {
        return res.status(400).json({ success: false, message: "File exceeds max size of 5MB" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
});
const start = async () => {
    try {
        await (0, db_1.connectDB)();
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
void start();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const borrowerController_1 = require("../controllers/borrowerController");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, process.env.UPLOAD_DIR || "uploads/");
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedMimeTypes.includes(file.mimetype) && [".pdf", ".jpg", ".jpeg", ".png"].includes(ext)) {
            cb(null, true);
            return;
        }
        cb(new Error("Only PDF, JPG, PNG files are allowed"));
    },
});
router.post("/personal", authenticate_1.authenticate, (0, authorize_1.authorize)(["borrower"]), borrowerController_1.savePersonalDetails);
router.post("/upload", authenticate_1.authenticate, (0, authorize_1.authorize)(["borrower"]), upload.single("salarySlip"), borrowerController_1.uploadSalarySlip);
router.post("/apply", authenticate_1.authenticate, (0, authorize_1.authorize)(["borrower"]), borrowerController_1.applyLoan);
router.get("/loan", authenticate_1.authenticate, (0, authorize_1.authorize)(["borrower"]), borrowerController_1.getMyLoan);
router.get("/profile", authenticate_1.authenticate, (0, authorize_1.authorize)(["borrower"]), borrowerController_1.getProfile);
router.get("/loan/:loanId/payments", authenticate_1.authenticate, (0, authorize_1.authorize)(["borrower"]), borrowerController_1.getPaymentHistory);
exports.default = router;

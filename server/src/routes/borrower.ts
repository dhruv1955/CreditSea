import { Router } from "express";
import multer from "multer";
import path from "path";
import { applyLoan, getMyLoan, savePersonalDetails, uploadSalarySlip, getProfile, getPaymentHistory } from "../controllers/borrowerController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { storage } from "../config/cloudinary";

const router = Router();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) && [".pdf", ".jpg", ".jpeg", ".png"].includes(ext)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF, JPG, PNG files are allowed"));
  },
});

router.post("/personal", authenticate, authorize(["borrower"]), savePersonalDetails);
router.post("/upload", authenticate, authorize(["borrower"]), upload.single("salarySlip"), uploadSalarySlip);
router.post("/apply", authenticate, authorize(["borrower"]), applyLoan);
router.get("/loan", authenticate, authorize(["borrower"]), getMyLoan);
router.get("/profile", authenticate, authorize(["borrower"]), getProfile);
router.get("/loan/:loanId/payments", authenticate, authorize(["borrower"]), getPaymentHistory);

export default router;

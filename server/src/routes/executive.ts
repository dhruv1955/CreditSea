import { Router } from "express";
import {
  approveLoan,
  disburseLoan,
  getCollectionQueue,
  getCollectionPaymentHistory,
  getDisbursementQueue,
  getSalesLeads,
  getSanctionQueue,
  recordPayment,
  rejectLoan,
} from "../controllers/executiveController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/sales", authenticate, authorize(["sales", "admin"]), getSalesLeads);
router.get("/sanction", authenticate, authorize(["sanction", "admin"]), getSanctionQueue);
router.patch("/sanction/:loanId/approve", authenticate, authorize(["sanction", "admin"]), approveLoan);
router.patch("/sanction/:loanId/reject", authenticate, authorize(["sanction", "admin"]), rejectLoan);
router.get("/disbursement", authenticate, authorize(["disbursement", "admin"]), getDisbursementQueue);
router.patch("/disbursement/:loanId/disburse", authenticate, authorize(["disbursement", "admin"]), disburseLoan);
router.get("/collection", authenticate, authorize(["collection", "admin"]), getCollectionQueue);
router.get("/collection/:loanId/payments", authenticate, authorize(["collection", "admin"]), getCollectionPaymentHistory);
router.post("/collection/:loanId/payment", authenticate, authorize(["collection", "admin"]), recordPayment);

export default router;

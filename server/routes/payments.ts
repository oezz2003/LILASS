import { Router } from "express";
import { initiatePayment } from "../controllers/paymentController";
import { authenticateJwt } from "../middleware/auth";

const router = Router();

router.post("/", authenticateJwt, initiatePayment);

export default router;




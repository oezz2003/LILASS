import { Router } from "express";
import { listFeedback, createFeedback, listCustomers } from "../controllers/customerServiceController";

const router = Router();

router.get("/feedback", listFeedback);
router.post("/feedback", createFeedback);
router.get("/customers", listCustomers);

export default router;



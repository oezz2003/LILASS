import { Router } from "express";
import { listInvoices, summaryInvoices, listCosts, createCost, deleteCost } from "../controllers/financeController";

const router = Router();

router.get("/invoices", listInvoices);
router.get("/invoices/summary", summaryInvoices);

router.get("/costs", listCosts);
router.post("/costs", createCost);
router.delete("/costs/:id", deleteCost);

export default router;



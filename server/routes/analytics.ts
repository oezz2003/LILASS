import { Router } from "express";
import { getOverviewAnalytics } from "../controllers/analyticsController";

const router = Router();

router.get("/overview", getOverviewAnalytics);

export default router;



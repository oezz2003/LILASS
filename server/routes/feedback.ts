import { Router } from "express";
import { getFeedbackSummary } from "../controllers/feedbackController";

const router = Router();

router.get("/summary", getFeedbackSummary);

export default router;



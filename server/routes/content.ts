import { Router } from "express";
import { getHomeContent, getPageContent } from "../controllers/contentController";

const router = Router();

router.get("/home", getHomeContent);
router.get("/pages/:slug", getPageContent);

export default router;



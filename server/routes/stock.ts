import { Router } from "express";
import { getLowStock, getProductsCoverage, getProductRecipe, getForecast, reorderStock, adjustStock, setReorderLevel } from "../controllers/stockController";

const router = Router();

router.get("/low", getLowStock);
router.get("/products-coverage", getProductsCoverage);
router.get("/product/:id/recipe", getProductRecipe);
router.get("/forecast", getForecast);
router.post("/reorder", reorderStock);
router.patch("/adjust", adjustStock);
router.patch("/reorder-level", setReorderLevel);

export default router;



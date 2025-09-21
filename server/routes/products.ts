import { Router } from "express";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "../controllers/productController";

const router = Router();

router.get("/", getAllProducts);
router.get("/related", getRelatedProducts);
router.get("/:slug", getProductBySlug);

export default router;




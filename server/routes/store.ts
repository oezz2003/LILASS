import { Router } from "express";
import { listStoreProducts, createStoreProduct, updateStoreProduct, deleteStoreProduct } from "../controllers/storeController";

const router = Router();

router.get("/products", listStoreProducts);
router.post("/products", createStoreProduct);
router.patch("/products/:id", updateStoreProduct);
router.delete("/products/:id", deleteStoreProduct);

export default router;



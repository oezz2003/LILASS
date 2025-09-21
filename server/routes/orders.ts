import { Router } from "express";
import { createOrder, getOrder, getMyOrders } from "../controllers/orderController";
import { authenticateJwt } from "../middleware/auth";

const router = Router();

// Create order (can be used by guests or authenticated users)
router.post("/", createOrder);

// Get specific order (public route for order confirmation)
router.get("/:id", getOrder);

// Get user's orders (requires authentication)
router.get("/", authenticateJwt, getMyOrders);

export default router;




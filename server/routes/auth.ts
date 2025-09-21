import { Router } from "express";
import { register, login, me, adminCreateUser } from "../controllers/authController";
import { authenticateJwt, requireRole } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateJwt, me);
router.post("/users", authenticateJwt, requireRole("admin"), adminCreateUser);

export default router;




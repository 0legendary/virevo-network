// src/presentation/routes/adminRoutes.ts
import { Router } from "express";
import { userDashboard } from "../controllers/userController";
import { verifyToken, authorizeRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/dashboard", verifyToken, authorizeRole(["superadmin", "admin", "expert", "user"]), userDashboard);

export default router;

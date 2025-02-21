// src/presentation/routes/adminRoutes.ts
import { Router } from "express";
import { userDashboard } from "../controllers/userController";
import { authenticateUser, authorizeRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/dashboard", authenticateUser, authorizeRole(["superadmin", "admin", "expert", "user"]), userDashboard);

export default router;

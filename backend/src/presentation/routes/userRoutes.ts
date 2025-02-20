// src/presentation/routes/adminRoutes.ts
import { Router } from "express";
import { userDashboard } from "../controllers/userController";

const router = Router();

router.get("/dashboard", userDashboard);

export default router;

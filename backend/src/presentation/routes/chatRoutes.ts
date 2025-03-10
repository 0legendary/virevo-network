// src/presentation/routes/adminRoutes.ts
import { Router } from "express";
import { verifyToken, authorizeRole } from "../middlewares/authMiddleware";
import { getChatHistory, getChatMessages } from "../controllers/chatController";

const router = Router();

router.get("/chat-history", verifyToken, authorizeRole(["superadmin", "admin", "expert", "user"]), getChatHistory);
router.get("/messages/:chatId", verifyToken, authorizeRole(["superadmin", "admin", "expert", "user"]), getChatMessages);

export default router;

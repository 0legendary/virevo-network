import { Router } from "express";
import { login, signup, newOtp, verifyOtp, newUser, updatePassword } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/new-otp", newOtp);
router.post("/verify-otp", verifyOtp);
router.post("/new-user", newUser);
router.post("/signup", signup);
router.post("/update-password", updatePassword);

export default router;

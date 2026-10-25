import { Router } from "express";
import { registerUser, verifyEmail, loginUser , logOutUser, forgotPassword, resetUserPassword} from "../controllers/auth.controller.js";


const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);
router.get("/logout", logOutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetUserPassword);
export default router;

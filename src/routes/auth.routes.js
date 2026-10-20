import { Router } from "express";
import { registerUser, verifyEmail, loginUser , logOutUser} from "../controllers/auth.controller.js";


const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);
router.get("/logout", logOutUser);
export default router;

import express from "express";
import { login, me, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, me);
router.put("/change-password", protect, changePassword);

export default router;
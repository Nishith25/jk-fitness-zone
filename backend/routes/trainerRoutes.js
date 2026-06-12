import express from "express";
import { createTrainer, getTrainers } from "../controllers/trainerController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, allowRoles("admin"), createTrainer);
router.get("/", protect, allowRoles("admin"), getTrainers);

export default router;
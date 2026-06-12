import express from "express";
import {
  markAttendance,
  getAttendance,
  getMyAttendance,
} from "../controllers/attendanceController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/mark",
  protect,
  allowRoles("admin", "trainer"),
  markAttendance
);

router.get(
  "/",
  protect,
  allowRoles("admin", "trainer"),
  getAttendance
);

router.get("/my", protect, allowRoles("customer"), getMyAttendance);

export default router;
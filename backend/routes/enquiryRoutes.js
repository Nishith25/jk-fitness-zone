import express from "express";

import {
  addEnquiry,
  getEnquiries,
  updateEnquiry,
  deleteEnquiry,
  getEnquirySummary,
} from "../controllers/enquiryController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getEnquirySummary);

router.post("/", protect, addEnquiry);
router.get("/", protect, getEnquiries);
router.put("/:id", protect, updateEnquiry);
router.delete("/:id", protect, deleteEnquiry);

export default router;
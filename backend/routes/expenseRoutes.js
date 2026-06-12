import express from "express";
import {
  addExpense,
  getExpenses,
  deleteExpense,
  getBalanceSheet,
} from "../controllers/expenseController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addExpense);
router.get("/", protect, getExpenses);
router.delete("/:id", protect, deleteExpense);

router.get("/balance-sheet/summary", protect, getBalanceSheet);

export default router;
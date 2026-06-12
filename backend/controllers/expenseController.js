import Expense from "../models/Expense.js";
import User from "../models/User.js";

/* ================= ADMIN CHECK ================= */

const isAdmin = (req) => {
  return req.user && req.user.role === "admin";
};

/* ================= ADD EXPENSE ================= */

export const addExpense = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can add expenses",
      });
    }

    const { title, category, amount, paymentMode, expenseDate, note } = req.body;

    if (!title || !amount) {
      return res.status(400).json({
        success: false,
        message: "Title and amount are required",
      });
    }

    const expense = await Expense.create({
      title,
      category: category || "Other",
      amount: Number(amount),
      paymentMode: paymentMode || "cash",
      expenseDate: expenseDate || new Date(),
      note: note || "",
      createdBy: req.user._id || req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add expense",
      error: error.message,
    });
  }
};

/* ================= GET EXPENSES ================= */

export const getExpenses = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can view expenses",
      });
    }

    const { from, to, category } = req.query;

    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (from || to) {
      filter.expenseDate = {};

      if (from) {
        filter.expenseDate.$gte = new Date(from);
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        filter.expenseDate.$lte = endDate;
      }
    }

    const expenses = await Expense.find(filter)
      .populate("createdBy", "name phone role")
      .sort({ expenseDate: -1, createdAt: -1 });

    const totalExpense = expenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const categorySummary = {};

    expenses.forEach((item) => {
      const cat = item.category || "Other";
      categorySummary[cat] =
        (categorySummary[cat] || 0) + Number(item.amount || 0);
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalExpense,
      categorySummary,
      expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};

/* ================= DELETE EXPENSE ================= */

export const deleteExpense = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete expenses",
      });
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
      error: error.message,
    });
  }
};

/* ================= BALANCE SHEET ================= */

export const getBalanceSheet = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can view balance sheet",
      });
    }

    const { from, to } = req.query;

    const expenseFilter = {};

    if (from || to) {
      expenseFilter.expenseDate = {};

      if (from) {
        expenseFilter.expenseDate.$gte = new Date(from);
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        expenseFilter.expenseDate.$lte = endDate;
      }
    }

    const customers = await User.find({ role: "customer" });
    const expenses = await Expense.find(expenseFilter);

    let totalCollection = 0;
    let totalDue = 0;
    let expectedRevenue = 0;

    customers.forEach((customer) => {
      const membership = customer.membership || {};

      const finalAmount = Number(
        membership.finalAmount ||
          membership.totalAmount ||
          membership.planAmount ||
          0
      );

      const amountPaid = Number(membership.amountPaid || 0);

      const dueAmount = Number(
        membership.dueAmount !== undefined
          ? membership.dueAmount
          : finalAmount - amountPaid
      );

      expectedRevenue += finalAmount;
      totalCollection += amountPaid;
      totalDue += dueAmount > 0 ? dueAmount : 0;
    });

    const totalExpenses = expenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const netBalance = totalCollection - totalExpenses;

    const categorySummary = {};

    expenses.forEach((item) => {
      const category = item.category || "Other";
      categorySummary[category] =
        (categorySummary[category] || 0) + Number(item.amount || 0);
    });

    res.status(200).json({
      success: true,
      summary: {
        totalCustomers: customers.length,
        expectedRevenue,
        totalCollection,
        totalDue,
        totalExpenses,
        netBalance,
      },
      categorySummary,
    });
  } catch (error) {
    console.error("Balance sheet error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch balance sheet",
      error: error.message,
    });
  }
};
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Rent",
        "Electricity",
        "Salary",
        "Equipment",
        "Maintenance",
        "Marketing",
        "Supplements",
        "Other",
      ],
      default: "Other",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "card", "bank", "other"],
      default: "cash",
    },

    expenseDate: {
      type: Date,
      default: Date.now,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
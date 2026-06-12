import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    isVipNumber: { type: Boolean, default: false },

    planName: { type: String },

    planAmount: { type: Number, default: 0 },

    discountType: {
      type: String,
      enum: ["none", "percentage", "flat"],
      default: "none",
    },

    discountValue: { type: Number, default: 0 },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "card", "bank_transfer", "other"],
      default: "cash",
    },

    amountPaid: { type: Number, default: 0 },

    dueAmount: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },

    finalAmount: { type: Number, default: 0 },

    startDate: { type: Date },

    expiryDate: { type: Date },

    status: {
      type: String,
      enum: ["active", "expired", "frozen", "pending"],
      default: "active",
    },

    freeze: {
      isFrozen: {
        type: Boolean,
        default: false,
      },

      freezeStartDate: {
        type: Date,
        default: null,
      },

      freezeEndDate: {
        type: Date,
        default: null,
      },

      freezeDays: {
        type: Number,
        default: 0,
      },

      freezeReason: {
        type: String,
        default: "",
      },

      frozenAt: {
        type: Date,
        default: null,
      },

      unfrozenAt: {
        type: Date,
        default: null,
      },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "trainer", "customer"],
      required: true,
    },

    loginId: {
      type: String,
      unique: true,
      sparse: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    photo: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    membership: membershipSchema,

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
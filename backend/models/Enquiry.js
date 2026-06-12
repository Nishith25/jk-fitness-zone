import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
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

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    age: {
      type: Number,
      default: null,
    },

    goal: {
      type: String,
      trim: true,
      default: "",
    },

    interestedPlan: {
      type: String,
      trim: true,
      default: "",
    },

    source: {
      type: String,
      enum: ["walk-in", "phone", "whatsapp", "instagram", "referral", "other"],
      default: "walk-in",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "follow-up", "converted", "closed"],
      default: "new",
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    convertedCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Enquiry", enquirySchema);
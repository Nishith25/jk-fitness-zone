import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await User.findOneAndUpdate(
      { role: "admin", phone: process.env.ADMIN_PHONE },
      {
        role: "admin",
        name: process.env.ADMIN_NAME || "JK Fitness Zone Admin",
        phone: process.env.ADMIN_PHONE,
        password: hashedPassword,
        status: "active",
      },
      { upsert: true, new: true }
    );

    console.log("Admin reset/created successfully");
    console.log("Phone:", process.env.ADMIN_PHONE);
    console.log("Password:", process.env.ADMIN_PASSWORD);

    process.exit();
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
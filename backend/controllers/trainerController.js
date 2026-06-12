import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const createTrainer = async (req, res) => {
  try {
    const { name, phone, password, address, gender } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "Name, phone and password are required" });
    }

    const existing = await User.findOne({ role: "trainer", phone });
    if (existing) {
      return res.status(400).json({ message: "Trainer already exists with this phone" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trainer = await User.create({
      role: "trainer",
      name,
      phone,
      password: hashedPassword,
      address,
      gender,
      createdBy: req.user._id,
      status: "active",
    });

    res.status(201).json({
      message: "Trainer created successfully",
      trainer: {
        id: trainer._id,
        name: trainer.name,
        phone: trainer.phone,
        role: trainer.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Trainer creation failed" });
  }
};

export const getTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: "trainer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ trainers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trainers" });
  }
};
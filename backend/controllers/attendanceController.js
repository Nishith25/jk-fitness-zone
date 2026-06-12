import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

const getToday = () => new Date().toISOString().split("T")[0];

export const markAttendance = async (req, res) => {
  try {
    const { customerId, date } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const customer = await User.findOne({
      role: "customer",
      $or: [{ _id: customerId }, { loginId: customerId }],
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const attendanceDate = date || getToday();

    const alreadyMarked = await Attendance.findOne({
      customer: customer._id,
      date: attendanceDate,
    });

    if (alreadyMarked) {
      return res.status(400).json({ message: "Already marked present" });
    }

    const attendance = await Attendance.create({
      customer: customer._id,
      markedBy: req.user._id,
      date: attendanceDate,
    });

    res.status(201).json({
      message: "Marked present",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Attendance failed",
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    const filter = {};
    if (date) filter.date = date;

    const records = await Attendance.find(filter)
      .populate("customer", "name phone loginId photo")
      .populate("markedBy", "name role")
      .sort({ createdAt: -1 });

    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ customer: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};
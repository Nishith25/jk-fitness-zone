import Enquiry from "../models/Enquiry.js";
import User from "../models/User.js";

/* ================= GET LOGGED-IN USER ================= */

const getLoggedInUser = async (req) => {
  const userId =
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    req.user?.uid;

  if (!userId) return null;

  return await User.findById(userId);
};

/* ================= ROLE CHECK ================= */

const checkAccess = async (req) => {
  const user = await getLoggedInUser(req);

  if (!user) {
    return {
      allowed: false,
      user: null,
      message: "User not found",
    };
  }

  if (!["admin", "trainer"].includes(user.role)) {
    return {
      allowed: false,
      user,
      message: "Only admin or trainer can access enquiries",
    };
  }

  return {
    allowed: true,
    user,
    message: "Allowed",
  };
};

/* ================= ADD ENQUIRY ================= */

export const addEnquiry = async (req, res) => {
  try {
    const access = await checkAccess(req);

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: access.message,
      });
    }

    const {
      name,
      phone,
      gender,
      age,
      goal,
      interestedPlan,
      source,
      status,
      followUpDate,
      note,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const enquiry = await Enquiry.create({
      name,
      phone,
      gender: gender || "",
      age: age || null,
      goal: goal || "",
      interestedPlan: interestedPlan || "",
      source: source || "walk-in",
      status: status || "new",
      followUpDate: followUpDate || null,
      note: note || "",
      createdBy: access.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Enquiry added successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Add enquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add enquiry",
      error: error.message,
    });
  }
};

/* ================= GET ENQUIRIES ================= */

export const getEnquiries = async (req, res) => {
  try {
    const access = await checkAccess(req);

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: access.message,
      });
    }

    const { search, status, from, to, followUpOnly } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { goal: { $regex: search, $options: "i" } },
        { interestedPlan: { $regex: search, $options: "i" } },
      ];
    }

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        filter.createdAt.$gte = new Date(from);
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    if (followUpOnly === "true") {
      filter.followUpDate = { $ne: null };
      filter.status = { $in: ["new", "contacted", "follow-up"] };
    }

    const enquiries = await Enquiry.find(filter)
      .populate("createdBy", "name phone role")
      .populate("convertedCustomer", "name phone loginId")
      .sort({ followUpDate: 1, createdAt: -1 });

    const summary = {
      total: enquiries.length,
      new: 0,
      contacted: 0,
      followUp: 0,
      converted: 0,
      closed: 0,
    };

    enquiries.forEach((item) => {
      if (item.status === "new") summary.new += 1;
      if (item.status === "contacted") summary.contacted += 1;
      if (item.status === "follow-up") summary.followUp += 1;
      if (item.status === "converted") summary.converted += 1;
      if (item.status === "closed") summary.closed += 1;
    });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      summary,
      enquiries,
    });
  } catch (error) {
    console.error("Get enquiries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
      error: error.message,
    });
  }
};

/* ================= UPDATE ENQUIRY ================= */

export const updateEnquiry = async (req, res) => {
  try {
    const access = await checkAccess(req);

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: access.message,
      });
    }

    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    const allowedFields = [
      "name",
      "phone",
      "gender",
      "age",
      "goal",
      "interestedPlan",
      "source",
      "status",
      "followUpDate",
      "note",
      "convertedCustomer",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        enquiry[field] = req.body[field];
      }
    });

    await enquiry.save();

    res.status(200).json({
      success: true,
      message: "Enquiry updated successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Update enquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update enquiry",
      error: error.message,
    });
  }
};

/* ================= DELETE ENQUIRY ================= */

export const deleteEnquiry = async (req, res) => {
  try {
    const access = await checkAccess(req);

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: access.message,
      });
    }

    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    await enquiry.deleteOne();

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete enquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete enquiry",
      error: error.message,
    });
  }
};

/* ================= ENQUIRY SUMMARY ================= */

export const getEnquirySummary = async (req, res) => {
  try {
    const access = await checkAccess(req);

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: access.message,
      });
    }

    const enquiries = await Enquiry.find();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const summary = {
      total: enquiries.length,
      new: 0,
      contacted: 0,
      followUp: 0,
      converted: 0,
      closed: 0,
      todayFollowUps: 0,
    };

    enquiries.forEach((item) => {
      if (item.status === "new") summary.new += 1;
      if (item.status === "contacted") summary.contacted += 1;
      if (item.status === "follow-up") summary.followUp += 1;
      if (item.status === "converted") summary.converted += 1;
      if (item.status === "closed") summary.closed += 1;

      if (
        item.followUpDate &&
        new Date(item.followUpDate) >= today &&
        new Date(item.followUpDate) < tomorrow
      ) {
        summary.todayFollowUps += 1;
      }
    });

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Enquiry summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry summary",
      error: error.message,
    });
  }
};
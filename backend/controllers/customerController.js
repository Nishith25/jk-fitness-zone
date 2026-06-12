import bcrypt from "bcryptjs";
import User from "../models/User.js";

const generateCustomerId = async () => {
  const year = new Date().getFullYear();
  const count = await User.countDocuments({ role: "customer" });
  return `JK${year}${String(count + 1).padStart(4, "0")}`;
};

const calculateFinalAmount = (amount, discountType, discountValue) => {
  const planAmount = Number(amount || 0);
  const discount = Number(discountValue || 0);

  if (discountType === "percentage") {
    return Math.max(planAmount - (planAmount * discount) / 100, 0);
  }

  if (discountType === "flat") {
    return Math.max(planAmount - discount, 0);
  }

  return planAmount;
};

const getLoggedInUser = async (req) => {
  const userId =
    req.user?._id || req.user?.id || req.user?.userId || req.user?.uid;

  if (!userId) return null;

  return await User.findById(userId);
};

const checkAdminOrTrainer = async (req) => {
  const loggedInUser = await getLoggedInUser(req);

  if (!loggedInUser) {
    return {
      allowed: false,
      user: null,
      message: "Logged-in user not found",
    };
  }

  if (!["admin", "trainer"].includes(loggedInUser.role)) {
    return {
      allowed: false,
      user: loggedInUser,
      message: "Only admin or trainer can perform this action",
    };
  }

  return {
    allowed: true,
    user: loggedInUser,
    message: "Allowed",
  };
};

export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      gender,
      isVipNumber,
      planName,
      planAmount,
      discountType,
      discountValue,
      paymentMode,
      startDate,
      expiryDate,
    } = req.body;

    if (!name || !phone || !address || !gender) {
      return res.status(400).json({
        message: "Name, phone, address and gender are required",
      });
    }

    const existingPhone = await User.findOne({ role: "customer", phone });

    if (existingPhone) {
      return res.status(400).json({
        message: "Customer already exists with this phone number",
      });
    }

    const vip = isVipNumber === "true" || isVipNumber === true;

    if (!vip && !planName) {
      return res.status(400).json({
        message: "Plan is required unless VIP number is selected",
      });
    }

    const loginId = await generateCustomerId();
    const hashedPassword = await bcrypt.hash(phone, 10);

    const finalAmount = vip
      ? 0
      : calculateFinalAmount(planAmount, discountType, discountValue);

    const paidAmount = vip ? 0 : Number(req.body.amountPaid || 0);
    const dueAmount = vip ? 0 : Math.max(finalAmount - paidAmount, 0);

    const customer = await User.create({
      role: "customer",
      loginId,
      name,
      phone,
      password: hashedPassword,
      photo: req.file ? `/uploads/${req.file.filename}` : "",
      address,
      gender,
      createdBy: req.user._id,
      mustChangePassword: true,
      membership: {
        isVipNumber: vip,
        planName: vip ? "VIP Number" : planName,
        planAmount: vip ? 0 : Number(planAmount || 0),
        discountType: vip ? "none" : discountType || "none",
        discountValue: vip ? 0 : Number(discountValue || 0),
        paymentMode: paymentMode || "cash",
        finalAmount,
        amountPaid: paidAmount,
        dueAmount,
        paymentStatus: vip
          ? "paid"
          : paidAmount >= finalAmount
          ? "paid"
          : paidAmount > 0
          ? "partial"
          : "unpaid",
        startDate: startDate || new Date(),
        expiryDate: expiryDate || null,
        status: "active",
        freeze: {
          isFrozen: false,
          freezeStartDate: null,
          freezeEndDate: null,
          freezeDays: 0,
          freezeReason: "",
          frozenAt: null,
          unfrozenAt: null,
        },
      },
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer: {
        id: customer._id,
        loginId: customer.loginId,
        name: customer.name,
        phone: customer.phone,
        defaultPassword: phone,
        photo: customer.photo,
        membership: customer.membership,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Customer creation failed",
      error: error.message,
    });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const { filter } = req.query;

    const customers = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedCustomers = customers.map((customer) => {
      const obj = customer.toObject();

      if (obj.membership?.freeze?.isFrozen) {
        obj.membership.status = "frozen";
      } else if (obj.membership?.expiryDate) {
        const expiry = new Date(obj.membership.expiryDate);
        expiry.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        obj.membership.daysLeft = diffDays;

        if (diffDays < 0) {
          obj.membership.status = "expired";
        } else {
          obj.membership.status = "active";
        }
      } else {
        obj.membership.daysLeft = null;
      }

      return obj;
    });

    let filteredCustomers = updatedCustomers;

    if (filter === "live") {
      filteredCustomers = updatedCustomers.filter(
        (c) => c.membership?.status === "active"
      );
    }

    if (filter === "expired") {
      filteredCustomers = updatedCustomers.filter(
        (c) => c.membership?.status === "expired"
      );
    }

    if (filter === "frozen") {
      filteredCustomers = updatedCustomers.filter(
        (c) => c.membership?.status === "frozen"
      );
    }

    if (filter === "expiring-1-3") {
      filteredCustomers = updatedCustomers.filter(
        (c) => c.membership?.daysLeft >= 1 && c.membership?.daysLeft <= 3
      );
    }

    if (filter === "expiring-4-7") {
      filteredCustomers = updatedCustomers.filter(
        (c) => c.membership?.daysLeft >= 4 && c.membership?.daysLeft <= 7
      );
    }

    if (filter === "expiring-8-15") {
      filteredCustomers = updatedCustomers.filter(
        (c) => c.membership?.daysLeft >= 8 && c.membership?.daysLeft <= 15
      );
    }

    res.json({ customers: filteredCustomers });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

export const updateCustomerPayment = async (req, res) => {
  try {
    const { amountPaid, paymentMode } = req.body;

    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const finalAmount = Number(customer.membership?.finalAmount || 0);
    const paid = Number(amountPaid || 0);
    const due = Math.max(finalAmount - paid, 0);

    customer.membership.amountPaid = paid;
    customer.membership.dueAmount = due;
    customer.membership.paymentMode =
      paymentMode || customer.membership.paymentMode;

    customer.membership.paymentStatus =
      paid >= finalAmount ? "paid" : paid > 0 ? "partial" : "unpaid";

    await customer.save();

    res.json({
      message: "Payment updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment update failed",
      error: error.message,
    });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { name, phone, address, gender } = req.body;

    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (address) customer.address = address;
    if (gender) customer.gender = gender;

    if (req.file) {
      customer.photo = `/uploads/${req.file.filename}`;
    }

    await customer.save();

    res.json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Customer update failed",
      error: error.message,
    });
  }
};

export const renewMembership = async (req, res) => {
  try {
    const {
      isVipNumber,
      planName,
      planAmount,
      amountPaid,
      discountType,
      discountValue,
      paymentMode,
      startDate,
      expiryDate,
    } = req.body;

    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const vip = isVipNumber === "true" || isVipNumber === true;

    if (!vip && !planName) {
      return res.status(400).json({
        message: "Plan is required unless VIP number is selected",
      });
    }

    const planAmt = vip ? 0 : Number(planAmount || 0);
    const discount = vip ? 0 : Number(discountValue || 0);

    let finalAmount = planAmt;

    if (discountType === "percentage") {
      finalAmount = Math.max(planAmt - (planAmt * discount) / 100, 0);
    }

    if (discountType === "flat") {
      finalAmount = Math.max(planAmt - discount, 0);
    }

    const paid = vip ? 0 : Number(amountPaid || 0);
    const due = Math.max(finalAmount - paid, 0);

    customer.membership = {
      isVipNumber: vip,
      planName: vip ? "VIP Number" : planName,
      planAmount: planAmt,
      discountType: vip ? "none" : discountType || "none",
      discountValue: discount,
      paymentMode: vip ? "other" : paymentMode || "cash",
      finalAmount,
      amountPaid: paid,
      dueAmount: due,
      paymentStatus:
        paid >= finalAmount ? "paid" : paid > 0 ? "partial" : "unpaid",
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: "active",
      freeze: {
        isFrozen: false,
        freezeStartDate: null,
        freezeEndDate: null,
        freezeDays: 0,
        freezeReason: "",
        frozenAt: null,
        unfrozenAt: null,
      },
    };

    await customer.save();

    res.json({
      message: "Membership renewed successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Membership renewal failed",
      error: error.message,
    });
  }
};

export const freezeMembership = async (req, res) => {
  try {
    const access = await checkAdminOrTrainer(req);

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: access.message,
      });
    }

    const { freezeStartDate, freezeEndDate, freezeReason } = req.body;

    if (!freezeStartDate || !freezeEndDate) {
      return res.status(400).json({
        success: false,
        message: "Freeze start date and end date are required",
      });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.membership) {
      return res.status(400).json({
        success: false,
        message: "Customer membership not found",
      });
    }

    if (!customer.membership.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Customer expiry date not found",
      });
    }

    if (customer.membership.freeze?.isFrozen) {
      return res.status(400).json({
        success: false,
        message: "Membership is already frozen",
      });
    }

    const start = new Date(freezeStartDate);
    const end = new Date(freezeEndDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid freeze dates",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "Freeze end date cannot be before start date",
      });
    }

    const freezeDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const oldExpiryDate = new Date(customer.membership.expiryDate);
    oldExpiryDate.setHours(0, 0, 0, 0);

    const newExpiryDate = new Date(oldExpiryDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + freezeDays);

    customer.membership.expiryDate = newExpiryDate;
    customer.membership.status = "frozen";

    customer.membership.freeze = {
      isFrozen: true,
      freezeStartDate: start,
      freezeEndDate: end,
      freezeDays,
      freezeReason: freezeReason || "",
      frozenAt: new Date(),
      unfrozenAt: null,
    };

    await customer.save();

    res.status(200).json({
      success: true,
      message: `Membership frozen for ${freezeDays} days and expiry extended`,
      freezeDays,
      oldExpiryDate,
      newExpiryDate,
      customer,
    });
  } catch (error) {
    console.error("Freeze membership error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to freeze membership",
      error: error.message,
    });
  }
};

export const unfreezeMembership = async (req, res) => {
  try {
    const access = await checkAdminOrTrainer(req);

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: access.message,
      });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.membership?.freeze?.isFrozen) {
      return res.status(400).json({
        success: false,
        message: "Membership is not frozen",
      });
    }

    customer.membership.freeze.isFrozen = false;
    customer.membership.freeze.unfrozenAt = new Date();

    if (customer.membership.expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiry = new Date(customer.membership.expiryDate);
      expiry.setHours(0, 0, 0, 0);

      customer.membership.status = expiry < today ? "expired" : "active";
    } else {
      customer.membership.status = "active";
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Membership unfrozen successfully",
      customer,
    });
  } catch (error) {
    console.error("Unfreeze membership error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to unfreeze membership",
      error: error.message,
    });
  }
};
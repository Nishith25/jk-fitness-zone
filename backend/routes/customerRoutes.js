import express from "express";
import {
  createCustomer,
  getCustomers,
  updateCustomerPayment,
  updateCustomer,
  renewMembership,
  freezeMembership,
  unfreezeMembership,
} from "../controllers/customerController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { uploadCustomerPhoto } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("admin", "trainer"),
  uploadCustomerPhoto.single("photo"),
  createCustomer
);

router.get("/", protect, allowRoles("admin", "trainer"), getCustomers);

router.put(
  "/:id/renew",
  protect,
  allowRoles("admin", "trainer"),
  renewMembership
);

router.put(
  "/:id/freeze",
  protect,
  allowRoles("admin", "trainer"),
  freezeMembership
);

router.put(
  "/:id/unfreeze",
  protect,
  allowRoles("admin", "trainer"),
  unfreezeMembership
);

router.put(
  "/:id/payment",
  protect,
  allowRoles("admin"),
  updateCustomerPayment
);

router.put(
  "/:id",
  protect,
  allowRoles("admin", "trainer"),
  uploadCustomerPhoto.single("photo"),
  updateCustomer
);

export default router;
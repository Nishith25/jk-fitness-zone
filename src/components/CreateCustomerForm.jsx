import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function CreateCustomerForm({ onCustomerCreated }) {
  const { API, token } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "male",
    isVipNumber: false,
    planName: "",
    planAmount: "",
    amountPaid: "",
    discountType: "none",
    discountValue: "",
    paymentMode: "cash",
    startDate: "",
    expiryDate: "",
  });

  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [createdCustomer, setCreatedCustomer] = useState(null);

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      address: "",
      gender: "male",
      isVipNumber: false,
      planName: "",
      planAmount: "",
      amountPaid: "",
      discountType: "none",
      discountValue: "",
      paymentMode: "cash",
      startDate: "",
      expiryDate: "",
    });
    setPhoto(null);
  };

  const update = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitCustomer = async (e) => {
    e.preventDefault();
    setMessage("");
    setCreatedCustomer(null);

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (photo) {
        data.append("photo", photo);
      }

      const res = await axios.post(`${API}/customers`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setCreatedCustomer(res.data.customer);
      setMessage("Customer created successfully");
      resetForm();

      if (onCustomerCreated) {
        onCustomerCreated();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Customer creation failed");
    }
  };

  return (
    <div className="card">
      <h2>Create Customer</h2>

      <p className="card-text">
        Customer ID will be generated automatically. Default password will be
        their phone number.
      </p>

      {message && <div className="info-box">{message}</div>}

      {createdCustomer && (
        <div className="success-box">
          <p>
            <strong>Customer ID:</strong> {createdCustomer.loginId}
          </p>
          <p>
            <strong>Default Password:</strong>{" "}
            {createdCustomer.defaultPassword}
          </p>
        </div>
      )}

      <form onSubmit={submitCustomer} className="auth-form">
        <label>Customer Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <label>Name</label>
        <input
          name="name"
          value={form.name}
          onChange={update}
          required
        />

        <label>Phone Number</label>
        <input
          name="phone"
          value={form.phone}
          onChange={update}
          required
        />

        <label>Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={update}
          required
        />

        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={update}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="isVipNumber"
            checked={form.isVipNumber}
            onChange={update}
          />
          VIP Number Customer
        </label>

        {!form.isVipNumber && (
          <>
            <label>Plan Name</label>
            <input
              name="planName"
              value={form.planName}
              onChange={update}
              required
            />

            <label>Plan Amount</label>
            <input
              type="number"
              name="planAmount"
              value={form.planAmount}
              onChange={update}
              required
            />

            <label>Amount Paid</label>
            <input
              type="number"
              name="amountPaid"
              value={form.amountPaid}
              onChange={update}
              placeholder="Enter paid amount"
            />

            <label>Discount Type</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={update}
            >
              <option value="none">No Discount</option>
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>
            </select>

            <label>Discount Value</label>
            <input
              type="number"
              name="discountValue"
              value={form.discountValue}
              onChange={update}
              placeholder="Enter discount value"
            />

            <label>Payment Mode</label>
            <select
              name="paymentMode"
              value={form.paymentMode}
              onChange={update}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>

            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={update}
            />

            <label>Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={update}
            />
          </>
        )}

        <button className="form-submit" type="submit">
          Create Customer
        </button>
      </form>
    </div>
  );
}
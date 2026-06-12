import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function RenewMembershipModal({ customer, onClose, onUpdated }) {
  const { API, token } = useAuth();

  const membership = customer?.membership;

  const [form, setForm] = useState({
    isVipNumber: membership?.isVipNumber || false,
    planName: membership?.planName === "VIP Number" ? "" : membership?.planName || "",
    planAmount: membership?.planAmount || "",
    amountPaid: membership?.amountPaid || "",
    discountType: membership?.discountType || "none",
    discountValue: membership?.discountValue || "",
    paymentMode: membership?.paymentMode || "cash",
    startDate: "",
    expiryDate: "",
  });

  const [message, setMessage] = useState("");

  const update = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitRenewal = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.put(
        `${API}/customers/${customer._id}/renew`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message);

      if (onUpdated) onUpdated();

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Membership renewal failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card payment-modal">
        <h2>Renew Membership</h2>
        <p className="card-text">
          Renew or update membership for {customer.name}.
        </p>

        {message && <div className="info-box">{message}</div>}

        <form onSubmit={submitRenewal} className="auth-form">
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
            </>
          )}

          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={update}
            required
          />

          <label>Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={update}
          />

          <button className="form-submit" type="submit">
            Renew Membership
          </button>

          <button type="button" className="logout-btn" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
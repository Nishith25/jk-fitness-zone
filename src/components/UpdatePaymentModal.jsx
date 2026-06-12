import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function UpdatePaymentModal({ customer, onClose, onUpdated }) {
  const { API, token } = useAuth();

  const [amountPaid, setAmountPaid] = useState(
    customer?.membership?.amountPaid || 0
  );
  const [paymentMode, setPaymentMode] = useState(
    customer?.membership?.paymentMode || "cash"
  );
  const [message, setMessage] = useState("");

  const updatePayment = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.put(
        `${API}/customers/${customer._id}/payment`,
        { amountPaid, paymentMode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Payment updated successfully");

      if (onUpdated) onUpdated();

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Payment update failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card payment-modal">
        <h2>Update Payment</h2>
        <p className="card-text">
          {customer.name} • {customer.loginId}
        </p>

        {message && <div className="info-box">{message}</div>}

        <form className="auth-form" onSubmit={updatePayment}>
          <label>Total Amount</label>
          <input value={customer?.membership?.finalAmount || 0} disabled />

          <label>Amount Paid</label>
          <input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />

          <label>Payment Mode</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>

          <button className="form-submit" type="submit">
            Save Payment
          </button>

          <button type="button" className="logout-btn" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
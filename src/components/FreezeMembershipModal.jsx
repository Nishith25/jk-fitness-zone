import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function FreezeMembershipModal({ customer, onClose, onUpdated }) {
  const { API, authHeaders } = useAuth();

  const [form, setForm] = useState({
    freezeStartDate: new Date().toISOString().split("T")[0],
    freezeEndDate: "",
    freezeReason: "",
  });

  const [loading, setLoading] = useState(false);

  const membership = customer?.membership;
  const freeze = membership?.freeze;

  const isFrozen = freeze?.isFrozen;

  const calculateFreezeDays = () => {
    if (!form.freezeStartDate || !form.freezeEndDate) return 0;

    const start = new Date(form.freezeStartDate);
    const end = new Date(form.freezeEndDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) return 0;

    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getNewExpiryPreview = () => {
    if (!membership?.expiryDate) return "-";

    const freezeDays = calculateFreezeDays();

    if (!freezeDays) return "-";

    const expiry = new Date(membership.expiryDate);
    expiry.setDate(expiry.getDate() + freezeDays);

    return expiry.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const freezeMembership = async (e) => {
    e.preventDefault();

    if (!form.freezeStartDate || !form.freezeEndDate) {
      alert("Please select freeze start and end date");
      return;
    }

    if (calculateFreezeDays() <= 0) {
      alert("Freeze end date cannot be before start date");
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${API}/customers/${customer._id}/freeze`,
        form,
        authHeaders
      );

      alert("Membership frozen successfully");

      if (onUpdated) onUpdated();
      onClose();
    } catch (error) {
      console.error("Freeze membership error:", error);
      alert(error.response?.data?.message || "Failed to freeze membership");
    } finally {
      setLoading(false);
    }
  };

  const unfreezeMembership = async () => {
    const confirmUnfreeze = window.confirm(
      "Are you sure you want to unfreeze this membership?"
    );

    if (!confirmUnfreeze) return;

    try {
      setLoading(true);

      await axios.put(
        `${API}/customers/${customer._id}/unfreeze`,
        {},
        authHeaders
      );

      alert("Membership unfrozen successfully");

      if (onUpdated) onUpdated();
      onClose();
    } catch (error) {
      console.error("Unfreeze membership error:", error);
      alert(error.response?.data?.message || "Failed to unfreeze membership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card freeze-modal">
        <div className="modal-header">
          <div>
            <h2>Freeze Membership</h2>
            <p className="card-text">
              Pause membership and auto-extend expiry date.
            </p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="freeze-customer-box">
          <p>
            <strong>Customer:</strong> {customer?.name}
          </p>
          <p>
            <strong>Customer ID:</strong> {customer?.loginId}
          </p>
          <p>
            <strong>Current Expiry:</strong>{" "}
            {formatDate(membership?.expiryDate)}
          </p>
        </div>

        {isFrozen && (
          <div className="freeze-active-box">
            <h3>Currently Frozen</h3>
            <p>
              <strong>Start:</strong>{" "}
              {formatDate(freeze?.freezeStartDate)}
            </p>
            <p>
              <strong>End:</strong> {formatDate(freeze?.freezeEndDate)}
            </p>
            <p>
              <strong>Freeze Days:</strong> {freeze?.freezeDays || 0}
            </p>
            <p>
              <strong>Reason:</strong> {freeze?.freezeReason || "-"}
            </p>

            <button
              className="danger-btn"
              type="button"
              onClick={unfreezeMembership}
              disabled={loading}
            >
              {loading ? "Processing..." : "Unfreeze Membership"}
            </button>
          </div>
        )}

        {!isFrozen && (
          <form onSubmit={freezeMembership}>
            <div className="form-group">
              <label>Freeze Start Date</label>
              <input
                type="date"
                name="freezeStartDate"
                value={form.freezeStartDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Freeze End Date</label>
              <input
                type="date"
                name="freezeEndDate"
                value={form.freezeEndDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                name="freezeReason"
                value={form.freezeReason}
                onChange={handleChange}
                placeholder="Example: Medical rest / travel / personal reason"
              />
            </div>

            <div className="freeze-preview">
              <p>
                <strong>Freeze Days:</strong> {calculateFreezeDays()} days
              </p>
              <p>
                <strong>New Expiry Preview:</strong> {getNewExpiryPreview()}
              </p>
            </div>

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Freezing..." : "Freeze Membership"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
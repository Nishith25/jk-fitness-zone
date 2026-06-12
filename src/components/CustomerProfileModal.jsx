import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import UpdatePaymentModal from "./UpdatePaymentModal";
import ReceiptModal from "./ReceiptModal";
import EditCustomerModal from "./EditCustomerModal";
import RenewMembershipModal from "./RenewMembershipModal";
import WhatsAppActions from "./WhatsAppActions";

export default function CustomerProfileModal({ customer, onClose, onUpdated }) {
  const { API, authHeaders, user } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showRenew, setShowRenew] = useState(false);

  const membership = customer?.membership;
  const freeze = membership?.freeze;

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${API}/attendance`, authHeaders);

        const customerAttendance = res.data.records.filter(
          (r) => r.customer?._id === customer._id
        );

        setAttendance(customerAttendance);
      } catch (err) {
        console.log("Attendance load failed");
      }
    };

    if (customer?._id) {
      fetchAttendance();
    }
  }, [API, authHeaders, customer]);

  const handleUpdatedAndClosePayment = () => {
    setShowPayment(false);
    if (onUpdated) onUpdated();
  };

  const handleUpdatedAndCloseEdit = () => {
    setShowEdit(false);
    if (onUpdated) onUpdated();
  };

  const handleUpdatedAndCloseRenew = () => {
    setShowRenew(false);
    if (onUpdated) onUpdated();
  };

  return (
    <div className="modal-overlay">
      <div className="card customer-profile-modal">
        {showPayment && (
          <UpdatePaymentModal
            customer={customer}
            onClose={() => setShowPayment(false)}
            onUpdated={handleUpdatedAndClosePayment}
          />
        )}

        {showReceipt && (
          <ReceiptModal
            customer={customer}
            onClose={() => setShowReceipt(false)}
          />
        )}

        {showEdit && (
          <EditCustomerModal
            customer={customer}
            onClose={() => setShowEdit(false)}
            onUpdated={handleUpdatedAndCloseEdit}
          />
        )}

        {showRenew && (
          <RenewMembershipModal
            customer={customer}
            onClose={() => setShowRenew(false)}
            onUpdated={handleUpdatedAndCloseRenew}
          />
        )}

        <div className="profile-header">
          <div className="profile-left">
            {customer.photo ? (
              <img
                src={`http://localhost:5001${customer.photo}`}
                alt={customer.name}
                className="profile-big-photo"
              />
            ) : (
              <div className="profile-big-photo empty-photo">No Photo</div>
            )}

            <div>
              <h2>{customer.name}</h2>
              <p>{customer.loginId}</p>

              <span
                className={
                  membership?.status === "expired"
                    ? "status-expired"
                    : membership?.status === "frozen"
                    ? "frozen-badge"
                    : "status-active"
                }
              >
                {membership?.status || customer.status}
              </span>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="small-action-btn"
              type="button"
              onClick={() => setShowEdit(true)}
            >
              Edit
            </button>

            <button
              className="small-action-btn secondary-small"
              type="button"
              onClick={() => setShowRenew(true)}
            >
              Renew
            </button>
          </div>

          <button className="logout-btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="profile-grid">
          <div className="profile-box">
            <h3>Personal Details</h3>

            <p>
              <strong>Customer ID:</strong> {customer.loginId}
            </p>

            <p>
              <strong>Name:</strong> {customer.name}
            </p>

            <p>
              <strong>Phone:</strong> {customer.phone}
            </p>

            <p>
              <strong>Gender:</strong> {customer.gender || "-"}
            </p>

            <p>
              <strong>Address:</strong> {customer.address || "-"}
            </p>
          </div>

          <div className="profile-box">
            <h3>Membership Details</h3>

            <p>
              <strong>VIP Number:</strong>{" "}
              {membership?.isVipNumber ? "Yes" : "No"}
            </p>

            <p>
              <strong>Plan:</strong> {membership?.planName || "-"}
            </p>

            <p>
              <strong>Status:</strong> {membership?.status || "-"}
            </p>

            <p>
              <strong>Days Left:</strong>{" "}
              {membership?.status === "frozen"
                ? "Frozen"
                : membership?.daysLeft ?? "-"}
            </p>

            <p>
              <strong>Start Date:</strong> {formatDate(membership?.startDate)}
            </p>

            <p>
              <strong>Expiry Date:</strong> {formatDate(membership?.expiryDate)}
            </p>

            {freeze?.isFrozen && (
              <div className="freeze-profile-box">
                <h4>Membership Frozen</h4>

                <p>
                  <strong>Freeze Start:</strong>{" "}
                  {formatDate(freeze.freezeStartDate)}
                </p>

                <p>
                  <strong>Freeze End:</strong>{" "}
                  {formatDate(freeze.freezeEndDate)}
                </p>

                <p>
                  <strong>Freeze Days:</strong> {freeze.freezeDays || 0}
                </p>

                <p>
                  <strong>Reason:</strong> {freeze.freezeReason || "-"}
                </p>
              </div>
            )}
          </div>

          {user?.role === "admin" && (
            <div className="profile-box">
              <h3>Payment Details</h3>

              <p>
                <strong>Total:</strong> ₹{membership?.finalAmount || 0}
              </p>

              <p>
                <strong>Paid:</strong> ₹{membership?.amountPaid || 0}
              </p>

              <p>
                <strong>Due:</strong> ₹{membership?.dueAmount || 0}
              </p>

              <p>
                <strong>Mode:</strong> {membership?.paymentMode || "-"}
              </p>

              <p>
                <strong>Status:</strong> {membership?.paymentStatus || "-"}
              </p>

              <div className="profile-actions">
                <button
                  className="small-action-btn"
                  type="button"
                  onClick={() => setShowPayment(true)}
                >
                  Update Payment
                </button>

                <button
                  className="small-action-btn secondary-small"
                  type="button"
                  onClick={() => setShowReceipt(true)}
                >
                  Receipt
                </button>
              </div>
            </div>
          )}

          <div className="profile-box">
            <WhatsAppActions customer={customer} />
          </div>

          <div className="profile-box">
            <h3>Attendance Summary</h3>

            <p>
              <strong>Total Attendance:</strong> {attendance.length}
            </p>

            <div className="mini-attendance-list">
              {attendance.slice(0, 6).map((a) => (
                <div key={a._id}>
                  <span>{a.date}</span>
                  <strong>
                    {new Date(a.checkInTime).toLocaleTimeString("en-IN")}
                  </strong>
                </div>
              ))}

              {attendance.length === 0 && <p>No attendance records found.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
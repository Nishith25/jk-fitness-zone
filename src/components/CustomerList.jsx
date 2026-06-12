import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import UpdatePaymentModal from "./UpdatePaymentModal";
import ReceiptModal from "./ReceiptModal";
import CustomerProfileModal from "./CustomerProfileModal";
import FreezeMembershipModal from "./FreezeMembershipModal";
import WhatsAppActions from "./WhatsAppActions";

export default function CustomerList({ refreshKey, filter = "" }) {
  const { API, authHeaders, user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [receiptCustomer, setReceiptCustomer] = useState(null);
  const [profileCustomer, setProfileCustomer] = useState(null);
  const [freezeCustomer, setFreezeCustomer] = useState(null);

  const [localRefresh, setLocalRefresh] = useState(0);

  const fetchCustomers = async () => {
    try {
      const url = filter
        ? `${API}/customers?filter=${filter}`
        : `${API}/customers`;

      const res = await axios.get(url, authHeaders);
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.log(err.response?.data?.message || "Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, filter, localRefresh]);

  const getStatusClass = (customer) => {
    const status = customer?.membership?.status;

    if (status === "expired") return "status-expired";
    if (status === "frozen") return "frozen-badge";

    return "status-active";
  };

  const getPaymentStatusClass = (paymentStatus) => {
    if (paymentStatus === "paid") return "status-active";
    return "status-expired";
  };

  const handleRefresh = () => {
    setLocalRefresh((x) => x + 1);
  };

  const actionColSpan = user?.role === "admin" ? "12" : "8";

  return (
    <div className="card">
      <h2>Customer List</h2>

      {selectedCustomer && (
        <UpdatePaymentModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdated={() => {
            setSelectedCustomer(null);
            handleRefresh();
          }}
        />
      )}

      {receiptCustomer && (
        <ReceiptModal
          customer={receiptCustomer}
          onClose={() => setReceiptCustomer(null)}
        />
      )}

      {profileCustomer && (
        <CustomerProfileModal
          customer={profileCustomer}
          onClose={() => setProfileCustomer(null)}
          onUpdated={() => {
            setProfileCustomer(null);
            handleRefresh();
          }}
        />
      )}

      {freezeCustomer && (
        <FreezeMembershipModal
          customer={freezeCustomer}
          onClose={() => setFreezeCustomer(null)}
          onUpdated={() => {
            setFreezeCustomer(null);
            handleRefresh();
          }}
        />
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Plan</th>

              {user?.role === "admin" && <th>Total</th>}
              {user?.role === "admin" && <th>Paid</th>}
              {user?.role === "admin" && <th>Due</th>}
              {user?.role === "admin" && <th>Payment</th>}

              <th>Days Left</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td>
                  {c.photo ? (
                    <img
                      src={`http://localhost:5001${c.photo}`}
                      alt={c.name}
                      className="customer-photo"
                    />
                  ) : (
                    "No Photo"
                  )}
                </td>

                <td>{c.loginId}</td>

                <td>
                  <button
                    className="link-button"
                    type="button"
                    onClick={() => setProfileCustomer(c)}
                  >
                    {c.name}
                  </button>
                </td>

                <td>{c.phone}</td>

                <td>{c.membership?.planName || "-"}</td>

                {user?.role === "admin" && (
                  <td>₹{c.membership?.finalAmount ?? 0}</td>
                )}

                {user?.role === "admin" && (
                  <td>₹{c.membership?.amountPaid ?? 0}</td>
                )}

                {user?.role === "admin" && (
                  <td>₹{c.membership?.dueAmount ?? 0}</td>
                )}

                {user?.role === "admin" && (
                  <td>
                    <span
                      className={getPaymentStatusClass(
                        c.membership?.paymentStatus
                      )}
                    >
                      {c.membership?.paymentStatus || "unpaid"}
                    </span>
                  </td>
                )}

                <td>
                  {c.membership?.status === "frozen"
                    ? "Frozen"
                    : c.membership?.daysLeft === null ||
                      c.membership?.daysLeft === undefined
                    ? "-"
                    : c.membership.daysLeft}
                </td>

                <td>
                  <span className={getStatusClass(c)}>
                    {c.membership?.status || c.status}
                  </span>
                </td>

                <td>
                  <div className="table-actions">
                    <button
                      className="small-action-btn secondary-small"
                      type="button"
                      onClick={() => setProfileCustomer(c)}
                    >
                      Profile
                    </button>

                    <WhatsAppActions customer={c} compact={true} />

                    <button
                      className={
                        c.membership?.freeze?.isFrozen
                          ? "small-action-btn warning-small"
                          : "small-action-btn"
                      }
                      type="button"
                      onClick={() => setFreezeCustomer(c)}
                    >
                      {c.membership?.freeze?.isFrozen ? "Frozen" : "Freeze"}
                    </button>

                    {user?.role === "admin" && (
                      <>
                        <button
                          className="small-action-btn"
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          Update Payment
                        </button>

                        <button
                          className="small-action-btn secondary-small"
                          type="button"
                          onClick={() => setReceiptCustomer(c)}
                        >
                          Receipt
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan={actionColSpan}>No customers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
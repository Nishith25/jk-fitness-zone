import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function WhatsAppActions({ customer, compact = false }) {
  const { user } = useAuth();

  const [customMessage, setCustomMessage] = useState("");

  const membership = customer?.membership || {};

  const cleanPhone = (phone) => {
    if (!phone) return "";

    let cleaned = String(phone).replace(/\D/g, "");

    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }

    if (cleaned.startsWith("0") && cleaned.length === 11) {
      cleaned = `91${cleaned.slice(1)}`;
    }

    return cleaned;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const openWhatsApp = (message) => {
    const phone = cleanPhone(customer?.phone);

    if (!phone) {
      alert("Customer phone number not found");
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;

    window.open(url, "_blank");
  };

  const sendExpiryReminder = () => {
    const message = `Hi ${customer?.name},

This is JK FITNESS ZONE.

Your gym membership ${
      membership?.daysLeft !== undefined && membership?.daysLeft !== null
        ? `has ${membership.daysLeft} day(s) left`
        : "is nearing expiry"
    }.

Plan: ${membership?.planName || "-"}
Expiry Date: ${formatDate(membership?.expiryDate)}

Please renew your membership to continue your fitness journey.

Thank you,
JK FITNESS ZONE`;

    openWhatsApp(message);
  };

  const sendPaymentReminder = () => {
    if (user?.role !== "admin") {
      alert("Only admin can send payment reminders");
      return;
    }

    const message = `Hi ${customer?.name},

This is JK FITNESS ZONE.

Your pending gym payment details:

Plan: ${membership?.planName || "-"}
Total Amount: ₹${membership?.finalAmount || 0}
Paid Amount: ₹${membership?.amountPaid || 0}
Due Amount: ₹${membership?.dueAmount || 0}

Please clear your due payment at the earliest.

Thank you,
JK FITNESS ZONE`;

    openWhatsApp(message);
  };

  const sendReceiptMessage = () => {
    if (user?.role !== "admin") {
      alert("Only admin can send receipt messages");
      return;
    }

    const message = `Hi ${customer?.name},

Payment received successfully at JK FITNESS ZONE.

Receipt Details:
Customer ID: ${customer?.loginId || "-"}
Plan: ${membership?.planName || "-"}
Paid Amount: ₹${membership?.amountPaid || 0}
Due Amount: ₹${membership?.dueAmount || 0}
Payment Status: ${membership?.paymentStatus || "-"}
Expiry Date: ${formatDate(membership?.expiryDate)}

Thank you,
JK FITNESS ZONE`;

    openWhatsApp(message);
  };

  const sendFreezeMessage = () => {
    const freeze = membership?.freeze;

    if (!freeze?.isFrozen) {
      alert("This customer membership is not frozen");
      return;
    }

    const message = `Hi ${customer?.name},

Your JK FITNESS ZONE membership has been frozen as requested.

Freeze Start: ${formatDate(freeze.freezeStartDate)}
Freeze End: ${formatDate(freeze.freezeEndDate)}
Freeze Days: ${freeze.freezeDays || 0}
New Expiry Date: ${formatDate(membership?.expiryDate)}
Reason: ${freeze.freezeReason || "-"}

Thank you,
JK FITNESS ZONE`;

    openWhatsApp(message);
  };

  const sendGeneralMessage = () => {
    if (!customMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    const message = `Hi ${customer?.name},

${customMessage}

Thank you,
JK FITNESS ZONE`;

    openWhatsApp(message);
    setCustomMessage("");
  };

  if (compact) {
    return (
      <div className="whatsapp-actions compact-whatsapp-actions">
        <button
          className="whatsapp-btn"
          type="button"
          onClick={sendExpiryReminder}
        >
          WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="whatsapp-actions">
      <h3>WhatsApp Actions</h3>

      <div className="whatsapp-button-grid">
        <button
          className="whatsapp-btn"
          type="button"
          onClick={sendExpiryReminder}
        >
          Expiry Reminder
        </button>

        {user?.role === "admin" && (
          <button
            className="whatsapp-btn"
            type="button"
            onClick={sendPaymentReminder}
          >
            Payment Reminder
          </button>
        )}

        {user?.role === "admin" && (
          <button
            className="whatsapp-btn"
            type="button"
            onClick={sendReceiptMessage}
          >
            Receipt Message
          </button>
        )}

        {membership?.freeze?.isFrozen && (
          <button
            className="whatsapp-btn"
            type="button"
            onClick={sendFreezeMessage}
          >
            Freeze Message
          </button>
        )}
      </div>

      <div className="custom-whatsapp-box">
        <label>Custom Message</label>

        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Type custom message for customer"
        />

        <button
          className="whatsapp-btn full"
          type="button"
          onClick={sendGeneralMessage}
        >
          Send Custom WhatsApp
        </button>
      </div>
    </div>
  );
}
export default function ReceiptModal({ customer, onClose }) {
  const membership = customer?.membership;

  const receiptNo = `JKFZ/REC/2026/${customer?.loginId || "001"}`;
  const receiptDate = new Date().toLocaleDateString("en-IN");

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="card receipt-modal">
        <div className="receipt-print-area">
          <div className="receipt-top-strip" />

          <div className="receipt-header-pro">
            <div className="receipt-brand">
              <img src="/logo.jpeg" alt="JK Fitness Zone" />
              <div>
                <h1>JK FITNESS ZONE</h1>
                <p>Train Beyond Limits</p>
              </div>
            </div>

            <div className="receipt-title-box">
              <h2>PAYMENT RECEIPT</h2>
              <p>{receiptNo}</p>
            </div>
          </div>

          <div className="receipt-gym-details">
            <p>
              Sri Rama Residency, Plot No: 14 & 15, Beside Nallapochamma
              Temple, Nizampet, Hyderabad - 500090
            </p>
            <p>Phone: 9246228642 / 7901425895</p>
          </div>

          <div className="receipt-meta-grid">
            <div>
              <span>Receipt No</span>
              <strong>{receiptNo}</strong>
            </div>
            <div>
              <span>Receipt Date</span>
              <strong>{receiptDate}</strong>
            </div>
            <div>
              <span>Payment Mode</span>
              <strong>{membership?.paymentMode || "-"}</strong>
            </div>
            <div>
              <span>Payment Status</span>
              <strong>{membership?.paymentStatus || "-"}</strong>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Customer Details</h3>

            <div className="receipt-info-grid">
              <p>
                <span>Customer ID</span>
                <strong>{customer.loginId}</strong>
              </p>
              <p>
                <span>Name</span>
                <strong>{customer.name}</strong>
              </p>
              <p>
                <span>Phone</span>
                <strong>{customer.phone}</strong>
              </p>
              <p>
                <span>Plan</span>
                <strong>{membership?.planName || "-"}</strong>
              </p>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Payment Summary</h3>

            <table className="receipt-payment-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Total Membership Amount</td>
                  <td>₹{membership?.finalAmount || 0}</td>
                </tr>
                <tr>
                  <td>Amount Paid</td>
                  <td>₹{membership?.amountPaid || 0}</td>
                </tr>
                <tr>
                  <td>Due Amount</td>
                  <td>₹{membership?.dueAmount || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="receipt-footer-pro">
            <div>
              <h4>Terms & Conditions</h4>
              <p>Fees once paid are non-refundable.</p>
              <p>This receipt is generated for offline payment record.</p>
            </div>

            <div className="signature-box">
              <div className="signature-text">JK</div>
<div className="signature-line" />
<strong>Owner</strong>
<span>Authorized Signature</span>
            </div>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="form-submit" onClick={printReceipt}>
            Print / Save PDF
          </button>
          <button className="logout-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
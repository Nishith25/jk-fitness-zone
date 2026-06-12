import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ReportsManager() {
  const { API, authHeaders, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return "";

    const stringValue = String(value).replace(/"/g, '""');

    if (
      stringValue.includes(",") ||
      stringValue.includes("\n") ||
      stringValue.includes('"')
    ) {
      return `"${stringValue}"`;
    }

    return stringValue;
  };

  const downloadCSV = (filename, rows) => {
    if (!rows || rows.length === 0) {
      alert("No data available to export");
      return;
    }

    const headers = Object.keys(rows[0]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        headers.map((header) => escapeCSV(row[header])).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const getTodayFileDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const exportCustomers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/customers`, authHeaders);
      const customers = res.data.customers || [];

      const rows = customers.map((customer) => ({
        "Customer ID": customer.loginId || "-",
        Name: customer.name || "-",
        Phone: customer.phone || "-",
        Gender: customer.gender || "-",
        Address: customer.address || "-",
        Plan: customer.membership?.planName || "-",
        "VIP Number": customer.membership?.isVipNumber ? "Yes" : "No",
        "Start Date": formatDate(customer.membership?.startDate),
        "Expiry Date": formatDate(customer.membership?.expiryDate),
        "Days Left":
          customer.membership?.daysLeft === null ||
          customer.membership?.daysLeft === undefined
            ? "-"
            : customer.membership.daysLeft,
        Status: customer.membership?.status || customer.status || "-",
        "Created At": formatDate(customer.createdAt),
      }));

      downloadCSV(`customer-report-${getTodayFileDate()}`, rows);
    } catch (error) {
      console.error("Customer report export error:", error);
      alert(error.response?.data?.message || "Failed to export customer report");
    } finally {
      setLoading(false);
    }
  };

  const exportPaymentDue = async () => {
    if (user?.role !== "admin") {
      alert("Only admin can export payment reports");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${API}/customers`, authHeaders);
      const customers = res.data.customers || [];

      const rows = customers.map((customer) => ({
        "Customer ID": customer.loginId || "-",
        Name: customer.name || "-",
        Phone: customer.phone || "-",
        Plan: customer.membership?.planName || "-",
        "Total Amount": customer.membership?.finalAmount || 0,
        "Paid Amount": customer.membership?.amountPaid || 0,
        "Due Amount": customer.membership?.dueAmount || 0,
        "Payment Status": customer.membership?.paymentStatus || "-",
        "Payment Mode": customer.membership?.paymentMode || "-",
        "Start Date": formatDate(customer.membership?.startDate),
        "Expiry Date": formatDate(customer.membership?.expiryDate),
        "Membership Status": customer.membership?.status || "-",
      }));

      downloadCSV(`payment-due-report-${getTodayFileDate()}`, rows);
    } catch (error) {
      console.error("Payment report export error:", error);
      alert(error.response?.data?.message || "Failed to export payment report");
    } finally {
      setLoading(false);
    }
  };

  const exportAttendance = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/attendance`, authHeaders);
      const records = res.data.records || [];

      const rows = records.map((record) => ({
        Date: record.date || "-",
        "Customer ID": record.customer?.loginId || "-",
        Name: record.customer?.name || "-",
        Phone: record.customer?.phone || "-",
        "Marked By": record.markedBy?.name || "-",
        "Marked By Role": record.markedBy?.role || "-",
        "Check-in Time": formatDateTime(record.checkInTime),
      }));

      downloadCSV(`attendance-report-${getTodayFileDate()}`, rows);
    } catch (error) {
      console.error("Attendance report export error:", error);
      alert(
        error.response?.data?.message || "Failed to export attendance report"
      );
    } finally {
      setLoading(false);
    }
  };

  const exportExpenses = async () => {
    if (user?.role !== "admin") {
      alert("Only admin can export expense reports");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${API}/expenses`, authHeaders);
      const expenses = res.data.expenses || [];

      const rows = expenses.map((expense) => ({
        Date: formatDate(expense.expenseDate),
        Title: expense.title || "-",
        Category: expense.category || "-",
        Amount: expense.amount || 0,
        "Payment Mode": expense.paymentMode || "-",
        Note: expense.note || "-",
        "Created By": expense.createdBy?.name || "-",
        "Created At": formatDateTime(expense.createdAt),
      }));

      downloadCSV(`expense-report-${getTodayFileDate()}`, rows);
    } catch (error) {
      console.error("Expense report export error:", error);
      alert(error.response?.data?.message || "Failed to export expense report");
    } finally {
      setLoading(false);
    }
  };

  const exportEnquiries = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/enquiries`, authHeaders);
      const enquiries = res.data.enquiries || [];

      const rows = enquiries.map((enquiry) => ({
        Date: formatDate(enquiry.createdAt),
        Name: enquiry.name || "-",
        Phone: enquiry.phone || "-",
        Gender: enquiry.gender || "-",
        Age: enquiry.age || "-",
        Goal: enquiry.goal || "-",
        "Interested Plan": enquiry.interestedPlan || "-",
        Source: enquiry.source || "-",
        Status: enquiry.status || "-",
        "Follow-up Date": formatDate(enquiry.followUpDate),
        Note: enquiry.note || "-",
        "Created By": enquiry.createdBy?.name || "-",
      }));

      downloadCSV(`enquiry-report-${getTodayFileDate()}`, rows);
    } catch (error) {
      console.error("Enquiry report export error:", error);
      alert(error.response?.data?.message || "Failed to export enquiry report");
    } finally {
      setLoading(false);
    }
  };

  const exportAllAdminReports = async () => {
    if (user?.role !== "admin") {
      alert("Only admin can export all reports");
      return;
    }

    await exportCustomers();
    await exportPaymentDue();
    await exportAttendance();
    await exportExpenses();
    await exportEnquiries();
  };

  return (
    <div className="reports-page">
      <div className="section-header">
        <div>
          <h2>Reports & Export</h2>
          <p>
            Download customer, attendance, payment, expense and enquiry reports.
          </p>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>Customer Report</h3>
          <p>
            Export customer ID, name, phone, plan, membership status, days left
            and expiry date.
          </p>

          <button
            className="primary-btn"
            type="button"
            onClick={exportCustomers}
            disabled={loading}
          >
            Export Customers CSV
          </button>
        </div>

        <div className="report-card">
          <h3>Attendance Report</h3>
          <p>
            Export attendance records with customer details, marked by and
            check-in time.
          </p>

          <button
            className="primary-btn"
            type="button"
            onClick={exportAttendance}
            disabled={loading}
          >
            Export Attendance CSV
          </button>
        </div>

        <div className="report-card">
          <h3>Enquiry Report</h3>
          <p>
            Export walk-ins, phone leads, follow-ups, enquiry status and notes.
          </p>

          <button
            className="primary-btn"
            type="button"
            onClick={exportEnquiries}
            disabled={loading}
          >
            Export Enquiries CSV
          </button>
        </div>

        {user?.role === "admin" && (
          <>
            <div className="report-card money-report">
              <h3>Payment / Due Report</h3>
              <p>
                Export total amount, paid amount, due amount, payment status and
                payment mode.
              </p>

              <button
                className="primary-btn"
                type="button"
                onClick={exportPaymentDue}
                disabled={loading}
              >
                Export Payment CSV
              </button>
            </div>

            <div className="report-card money-report">
              <h3>Expense Report</h3>
              <p>
                Export gym expenses with category, amount, payment mode and
                notes.
              </p>

              <button
                className="primary-btn"
                type="button"
                onClick={exportExpenses}
                disabled={loading}
              >
                Export Expenses CSV
              </button>
            </div>

            <div className="report-card all-report">
              <h3>Export All Reports</h3>
              <p>
                Download all available reports one by one. Your browser may ask
                permission for multiple downloads.
              </p>

              <button
                className="primary-btn"
                type="button"
                onClick={exportAllAdminReports}
                disabled={loading}
              >
                Export All CSV
              </button>
            </div>
          </>
        )}
      </div>

      {loading && <p className="card-text report-loading">Preparing report...</p>}
    </div>
  );
}
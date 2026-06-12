import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import DashboardCards from "../components/DashboardCards";
import CreateCustomerForm from "../components/CreateCustomerForm";
import CustomerList from "../components/CustomerList";
import CreateTrainerForm from "../components/CreateTrainerForm";
import TrainerList from "../components/TrainerList";
import MarkAttendance from "../components/MarkAttendance";
import AttendanceList from "../components/AttendanceList";
import ExpenseManager from "../components/ExpenseManager";
import BalanceSheet from "../components/BalanceSheet";
import EnquiryManager from "../components/EnquiryManager";
import ReportsManager from "../components/ReportsManager";

export default function AdminDashboard() {
  const { user, API, authHeaders } = useAuth();
  const navigate = useNavigate();
  const { section } = useParams();

  const activeSection = section || "overview";

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showTrainerForm, setShowTrainerForm] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [enquirySummary, setEnquirySummary] = useState(null);
  const [balanceSummary, setBalanceSummary] = useState(null);

  const [customerRefreshKey, setCustomerRefreshKey] = useState(0);
  const [trainerRefreshKey, setTrainerRefreshKey] = useState(0);
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);
  const [expenseRefreshKey, setExpenseRefreshKey] = useState(0);
  const [enquiryRefreshKey, setEnquiryRefreshKey] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  const openSection = (key) => {
    navigate(`/admin-dashboard/${key}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const now = new Date();

    expiry.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  };

  const getAmountPaid = (customer) => {
    return Number(customer?.membership?.amountPaid || 0);
  };

  const getFinalAmount = (customer) => {
    return Number(
      customer?.membership?.finalAmount ||
        customer?.membership?.totalAmount ||
        customer?.membership?.planAmount ||
        0
    );
  };

  const getDueAmount = (customer) => {
    const membership = customer?.membership || {};

    if (membership.dueAmount !== undefined) {
      return Number(membership.dueAmount || 0);
    }

    return Math.max(getFinalAmount(customer) - getAmountPaid(customer), 0);
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const customerRes = await axios.get(`${API}/customers`, authHeaders);

        const attendanceRes = await axios.get(
          `${API}/attendance?date=${today}`,
          authHeaders
        );

        setCustomers(customerRes.data.customers || []);
        setAttendance(attendanceRes.data.records || []);
      } catch (error) {
        console.log(error.response?.data?.message || "Dashboard load failed");
      }
    };

    loadStats();
  }, [API, authHeaders, customerRefreshKey, attendanceRefreshKey, today]);

  useEffect(() => {
    const loadFinancialStats = async () => {
      try {
        const res = await axios.get(
          `${API}/expenses/balance-sheet/summary`,
          authHeaders
        );

        setBalanceSummary(res.data.summary || null);
      } catch (error) {
        console.log(
          error.response?.data?.message || "Balance summary load failed"
        );
      }
    };

    loadFinancialStats();
  }, [API, authHeaders, expenseRefreshKey, customerRefreshKey]);

  useEffect(() => {
    const loadEnquiryStats = async () => {
      try {
        const res = await axios.get(`${API}/enquiries/summary`, authHeaders);
        setEnquirySummary(res.data.summary || null);
      } catch (error) {
        console.log(
          error.response?.data?.message || "Enquiry summary load failed"
        );
      }
    };

    loadEnquiryStats();
  }, [API, authHeaders, enquiryRefreshKey]);

  const stats = {
    totalCustomers: customers.length,

    liveMemberships: customers.filter((c) => {
      if (c.membership?.freeze?.isFrozen) return false;

      const days = getDaysLeft(c.membership?.expiryDate);
      return days === null || days >= 0;
    }).length,

    expiredMemberships: customers.filter((c) => {
      if (c.membership?.freeze?.isFrozen) return false;

      const days = getDaysLeft(c.membership?.expiryDate);
      return days !== null && days < 0;
    }).length,

    frozenMemberships: customers.filter((c) => c.membership?.freeze?.isFrozen)
      .length,

    expiring1to3: customers.filter((c) => {
      if (c.membership?.freeze?.isFrozen) return false;

      const days = getDaysLeft(c.membership?.expiryDate);
      return days >= 1 && days <= 3;
    }).length,

    expiring4to7: customers.filter((c) => {
      if (c.membership?.freeze?.isFrozen) return false;

      const days = getDaysLeft(c.membership?.expiryDate);
      return days >= 4 && days <= 7;
    }).length,

    expiring8to15: customers.filter((c) => {
      if (c.membership?.freeze?.isFrozen) return false;

      const days = getDaysLeft(c.membership?.expiryDate);
      return days >= 8 && days <= 15;
    }).length,

    todayAttendance: attendance.length,

    dueAmount:
      balanceSummary?.totalDue !== undefined
        ? balanceSummary.totalDue
        : customers.reduce((sum, c) => sum + getDueAmount(c), 0),

    todayCollection: customers.reduce((sum, c) => {
      const createdDate = c.createdAt
        ? new Date(c.createdAt).toISOString().split("T")[0]
        : null;

      if (createdDate === today) {
        return sum + getAmountPaid(c);
      }

      return sum;
    }, 0),

    totalCollection:
      balanceSummary?.totalCollection !== undefined
        ? balanceSummary.totalCollection
        : customers.reduce((sum, c) => sum + getAmountPaid(c), 0),

    expenses: balanceSummary?.totalExpenses || 0,

    enquiries: enquirySummary?.total || 0,
  };

  const renderSectionTitle = () => {
    const titles = {
      customers: "Customers",
      trainers: "Trainers",
      attendance: "Attendance",
      expenses: "Expenses",
      "balance-sheet": "Balance Sheet",
      enquiries: "Enquiries",
      reports: "Reports",
      "live-memberships": "Live Memberships",
      "expired-memberships": "Expired Memberships",
      "frozen-memberships": "Frozen Memberships",
      "expiring-1-3": "Expiring 1–3 Days",
      "expiring-4-7": "Expiring 4–7 Days",
      "expiring-8-15": "Expiring 8–15 Days",
      dues: "Due Amount",
      "today-collection": "Today Collection",
      "total-collection": "Total Collection",
    };

    return titles[activeSection] || "Dashboard";
  };

  const renderSection = () => {
    if (activeSection === "overview") {
      return (
        <div className="card dashboard-welcome-card">
          <h2>Dashboard Overview</h2>
          <p className="card-text">
            Select any card above or use the section buttons below to open that
            module on a separate dashboard page.
          </p>
        </div>
      );
    }

    if (activeSection === "customers") {
      return (
        <>
          <div className="section-action-row">
            <h2>Customers</h2>

            <button
              className="form-submit"
              type="button"
              onClick={() => setShowCustomerForm(!showCustomerForm)}
            >
              {showCustomerForm ? "Close Form" : "Add Customer"}
            </button>
          </div>

          {showCustomerForm && (
            <CreateCustomerForm
              onCustomerCreated={() => {
                setCustomerRefreshKey((x) => x + 1);
                setShowCustomerForm(false);
              }}
            />
          )}

          <CustomerList refreshKey={customerRefreshKey} />
        </>
      );
    }

    if (activeSection === "trainers") {
      return (
        <>
          <div className="section-action-row">
            <h2>Trainers</h2>

            <button
              className="form-submit"
              type="button"
              onClick={() => setShowTrainerForm(!showTrainerForm)}
            >
              {showTrainerForm ? "Close Form" : "Add Trainer"}
            </button>
          </div>

          {showTrainerForm && (
            <CreateTrainerForm
              onTrainerCreated={() => {
                setTrainerRefreshKey((x) => x + 1);
                setShowTrainerForm(false);
              }}
            />
          )}

          <TrainerList refreshKey={trainerRefreshKey} />
        </>
      );
    }

    if (activeSection === "attendance") {
      return (
        <>
          <MarkAttendance
            onMarked={() => setAttendanceRefreshKey((x) => x + 1)}
          />

          <AttendanceList refreshKey={attendanceRefreshKey} />
        </>
      );
    }

    if (activeSection === "expenses") {
      return (
        <ExpenseManager
          refreshKey={expenseRefreshKey}
          onExpenseAdded={() => setExpenseRefreshKey((x) => x + 1)}
          onExpenseDeleted={() => setExpenseRefreshKey((x) => x + 1)}
        />
      );
    }

    if (
      activeSection === "balance-sheet" ||
      activeSection === "dues" ||
      activeSection === "today-collection" ||
      activeSection === "total-collection"
    ) {
      return <BalanceSheet refreshKey={expenseRefreshKey} />;
    }

    if (activeSection === "enquiries") {
      return (
        <EnquiryManager
          refreshKey={enquiryRefreshKey}
          onEnquiryChanged={() => setEnquiryRefreshKey((x) => x + 1)}
        />
      );
    }

    if (activeSection === "reports") {
      return <ReportsManager />;
    }

    if (
      [
        "live-memberships",
        "expired-memberships",
        "frozen-memberships",
        "expiring-1-3",
        "expiring-4-7",
        "expiring-8-15",
      ].includes(activeSection)
    ) {
      const filterMap = {
        "live-memberships": "live",
        "expired-memberships": "expired",
        "frozen-memberships": "frozen",
        "expiring-1-3": "expiring-1-3",
        "expiring-4-7": "expiring-4-7",
        "expiring-8-15": "expiring-8-15",
      };

      return (
        <CustomerList
          refreshKey={customerRefreshKey}
          filter={filterMap[activeSection]}
        />
      );
    }

    return (
      <div className="card">
        <h2>Page Not Found</h2>
        <p className="card-text">This dashboard section does not exist.</p>
      </div>
    );
  };

  const tabItems = [
    { label: "Customers", key: "customers" },
    { label: "Trainers", key: "trainers" },
    { label: "Attendance", key: "attendance" },
    { label: "Expenses", key: "expenses" },
    { label: "Balance Sheet", key: "balance-sheet" },
    { label: "Enquiries", key: "enquiries" },
    { label: "Reports", key: "reports" },
  ];

  return (
    <section className="section page-top dashboard-page">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">Admin Dashboard</p>
            <h1>Welcome, {user?.name}</h1>
            <p className="card-text">
              Manage customers, trainers, attendance, enquiries, reports and
              financial overview.
            </p>
          </div>
        </div>

        <DashboardCards role="admin" stats={stats} onOpenSection={openSection} />

        <div className="dashboard-tabs">
          {tabItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeSection === item.key ? "active" : ""}
              onClick={() => openSection(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="dashboard-section-title">
          <p className="eyebrow">Current Section</p>
          <h2>{renderSectionTitle()}</h2>
        </div>

        <div className="dashboard-grid">{renderSection()}</div>
      </div>
    </section>
  );
}
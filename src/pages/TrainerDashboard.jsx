import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import DashboardCards from "../components/DashboardCards";
import CreateCustomerForm from "../components/CreateCustomerForm";
import CustomerList from "../components/CustomerList";
import MarkAttendance from "../components/MarkAttendance";
import AttendanceList from "../components/AttendanceList";
import EnquiryManager from "../components/EnquiryManager";
import ReportsManager from "../components/ReportsManager";

export default function TrainerDashboard() {
  const { user, logout, API, authHeaders } = useAuth();

  const [activeSection, setActiveSection] = useState("customers");
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [enquirySummary, setEnquirySummary] = useState(null);

  const [customerRefreshKey, setCustomerRefreshKey] = useState(0);
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);
  const [enquiryRefreshKey, setEnquiryRefreshKey] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const now = new Date();

    expiry.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
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
        console.log(error.response?.data?.message || "Failed to load dashboard");
      }
    };

    loadStats();
  }, [API, authHeaders, customerRefreshKey, attendanceRefreshKey, today]);

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

    enquiries: enquirySummary?.total || 0,
  };

  const renderSection = () => {
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
        <h2>{activeSection.replaceAll("-", " ").toUpperCase()}</h2>
        <p className="card-text">This module will be added next.</p>
      </div>
    );
  };

  return (
    <section className="section page-top">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">Trainer Dashboard</p>
            <h1>Welcome, {user?.name}</h1>
            <p className="card-text">
              Manage customers, attendance, enquiries and reports. Financial
              data is hidden for trainers.
            </p>
          </div>

          <button className="logout-btn" type="button" onClick={logout}>
            Logout
          </button>
        </div>

        <DashboardCards
          role="trainer"
          stats={stats}
          setActiveSection={setActiveSection}
        />

        <div className="dashboard-tabs">
          <button
            type="button"
            className={activeSection === "customers" ? "active" : ""}
            onClick={() => setActiveSection("customers")}
          >
            Customers
          </button>

          <button
            type="button"
            className={activeSection === "attendance" ? "active" : ""}
            onClick={() => setActiveSection("attendance")}
          >
            Attendance
          </button>

          <button
            type="button"
            className={activeSection === "enquiries" ? "active" : ""}
            onClick={() => setActiveSection("enquiries")}
          >
            Enquiries
          </button>

          <button
            type="button"
            className={activeSection === "reports" ? "active" : ""}
            onClick={() => setActiveSection("reports")}
          >
            Reports
          </button>
        </div>

        <div className="dashboard-grid">{renderSection()}</div>
      </div>
    </section>
  );
}
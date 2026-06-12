import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function EnquiryManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    from: "",
    to: "",
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    age: "",
    goal: "",
    interestedPlan: "",
    source: "walk-in",
    status: "new",
    followUpDate: "",
    note: "",
  });

  const statusOptions = ["new", "contacted", "follow-up", "converted", "closed"];

  const sourceOptions = [
    "walk-in",
    "phone",
    "whatsapp",
    "instagram",
    "referral",
    "other",
  ];

  const safeJsonParse = (value) => {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  const getToken = () => {
    const directToken =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("gymToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("adminToken");

    if (directToken) return directToken;

    const possibleUserKeys = [
      "user",
      "authUser",
      "userInfo",
      "currentUser",
      "loggedInUser",
      "gymUser",
      "admin",
    ];

    for (const key of possibleUserKeys) {
      const parsed = safeJsonParse(localStorage.getItem(key));

      if (!parsed) continue;

      const token =
        parsed.token ||
        parsed.accessToken ||
        parsed.jwt ||
        parsed.adminToken ||
        parsed?.user?.token ||
        parsed?.user?.accessToken ||
        parsed?.data?.token ||
        parsed?.data?.accessToken;

      if (token) return token;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);

      if (!value) continue;

      if (value.startsWith("eyJ")) {
        return value;
      }

      const parsed = safeJsonParse(value);

      if (!parsed) continue;

      const token =
        parsed.token ||
        parsed.accessToken ||
        parsed.jwt ||
        parsed.adminToken ||
        parsed?.user?.token ||
        parsed?.user?.accessToken ||
        parsed?.data?.token ||
        parsed?.data?.accessToken;

      if (token) return token;
    }

    return null;
  };

  const getAuthHeaders = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const goToLogin = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleApiError = (error, fallbackMessage) => {
    console.error(fallbackMessage, error);

    if (error.response?.status === 401) {
      alert("Session expired. Please login again.");
      goToLogin();
      return;
    }

    if (error.response?.status === 403) {
      alert("Only admin or trainer can access enquiry management.");
      return;
    }

    alert(error.response?.data?.message || fallbackMessage);
  };

  const buildQuery = () => {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);

    return params.toString();
  };

  const fetchEnquiries = async () => {
    try {
      const token = getToken();

      if (!token) {
        alert("Login token not found. Please login again.");
        goToLogin();
        return;
      }

      setLoading(true);

      const query = buildQuery();

      const res = await axios.get(
        `${API_URL}/api/enquiries${query ? `?${query}` : ""}`,
        getAuthHeaders()
      );

      setEnquiries(res.data.enquiries || []);
      setSummary(res.data.summary || null);
    } catch (error) {
      handleApiError(error, "Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.get(
        `${API_URL}/api/enquiries/summary`,
        getAuthHeaders()
      );

      setSummary(res.data.summary || null);
    } catch (error) {
      handleApiError(error, "Failed to fetch enquiry summary");
    }
  };

  useEffect(() => {
    fetchEnquiries();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const addEnquiry = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter name");
      return;
    }

    if (!form.phone.trim()) {
      alert("Please enter phone number");
      return;
    }

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        age: form.age ? Number(form.age) : null,
        followUpDate: form.followUpDate || null,
      };

      await axios.post(`${API_URL}/api/enquiries`, payload, getAuthHeaders());

      setForm({
        name: "",
        phone: "",
        gender: "",
        age: "",
        goal: "",
        interestedPlan: "",
        source: "walk-in",
        status: "new",
        followUpDate: "",
        note: "",
      });

      await fetchEnquiries();
      await fetchSummary();

      alert("Enquiry added successfully");
    } catch (error) {
      handleApiError(error, "Failed to add enquiry");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/api/enquiries/${id}`,
        { status },
        getAuthHeaders()
      );

      await fetchEnquiries();
      await fetchSummary();
    } catch (error) {
      handleApiError(error, "Failed to update enquiry status");
    }
  };

  const updateFollowUpDate = async (id, followUpDate) => {
    try {
      await axios.put(
        `${API_URL}/api/enquiries/${id}`,
        {
          followUpDate: followUpDate || null,
          status: followUpDate ? "follow-up" : "contacted",
        },
        getAuthHeaders()
      );

      await fetchEnquiries();
      await fetchSummary();
    } catch (error) {
      handleApiError(error, "Failed to update follow-up date");
    }
  };

  const deleteEnquiry = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/enquiries/${id}`, getAuthHeaders());

      await fetchEnquiries();
      await fetchSummary();

      alert("Enquiry deleted successfully");
    } catch (error) {
      handleApiError(error, "Failed to delete enquiry");
    }
  };

  const applyFilters = async () => {
    await fetchEnquiries();
  };

  const resetFilters = async () => {
    setFilters({
      search: "",
      status: "all",
      from: "",
      to: "",
    });

    setTimeout(async () => {
      await fetchEnquiries();
    }, 150);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "new") return "status-new";
    if (status === "contacted") return "status-contacted";
    if (status === "follow-up") return "status-followup";
    if (status === "converted") return "status-converted";
    if (status === "closed") return "status-closed";
    return "";
  };

  return (
    <div className="enquiry-page">
      <div className="section-header">
        <div>
          <h2>Enquiry Management</h2>
          <p>Track walk-ins, phone calls, follow-ups, and conversions</p>
        </div>
      </div>

      <div className="enquiry-summary-grid">
        <div className="enquiry-summary-card">
          <span>Total</span>
          <h3>{summary?.total || 0}</h3>
        </div>

        <div className="enquiry-summary-card">
          <span>New</span>
          <h3>{summary?.new || 0}</h3>
        </div>

        <div className="enquiry-summary-card">
          <span>Follow-ups</span>
          <h3>{summary?.followUp || 0}</h3>
        </div>

        <div className="enquiry-summary-card">
          <span>Converted</span>
          <h3>{summary?.converted || 0}</h3>
        </div>

        <div className="enquiry-summary-card">
          <span>Today Follow-ups</span>
          <h3>{summary?.todayFollowUps || 0}</h3>
        </div>
      </div>

      <div className="enquiry-layout">
        <div className="enquiry-form-card">
          <h3>Add Enquiry</h3>

          <form onSubmit={addEnquiry}>
            <div className="form-group">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Customer name"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
                placeholder="Phone number"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleFormChange}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleFormChange}
                  placeholder="Age"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Fitness Goal</label>
              <input
                name="goal"
                value={form.goal}
                onChange={handleFormChange}
                placeholder="Weight loss / muscle gain / general fitness"
              />
            </div>

            <div className="form-group">
              <label>Interested Plan</label>
              <input
                name="interestedPlan"
                value={form.interestedPlan}
                onChange={handleFormChange}
                placeholder="Monthly / Quarterly / Yearly"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Source</label>
                <select
                  name="source"
                  value={form.source}
                  onChange={handleFormChange}
                >
                  {sourceOptions.map((item) => (
                    <option key={item} value={item}>
                      {item.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  {statusOptions.map((item) => (
                    <option key={item} value={item}>
                      {item.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Follow-up Date</label>
              <input
                type="date"
                name="followUpDate"
                value={form.followUpDate}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Note</label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleFormChange}
                placeholder="Any additional note"
              />
            </div>

            <button className="primary-btn" type="submit">
              Add Enquiry
            </button>
          </form>
        </div>

        <div className="enquiry-list-card">
          <div className="expense-list-header">
            <div>
              <h3>Enquiry List</h3>
              <p>{enquiries.length} records found</p>
            </div>
          </div>

          <div className="filter-row">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search name, phone, goal"
            />

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">All Status</option>
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item.toUpperCase()}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
            />

            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
            />

            <button className="small-btn" type="button" onClick={applyFilters}>
              Apply
            </button>

            <button
              className="small-btn secondary"
              type="button"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>

          <div className="table-wrapper">
            <table className="enquiry-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Goal</th>
                  <th>Plan</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10">Loading enquiries...</td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan="10">No enquiries found</td>
                  </tr>
                ) : (
                  enquiries.map((enquiry) => (
                    <tr key={enquiry._id}>
                      <td>{formatDate(enquiry.createdAt)}</td>
                      <td>{enquiry.name}</td>
                      <td>{enquiry.phone}</td>
                      <td>{enquiry.goal || "-"}</td>
                      <td>{enquiry.interestedPlan || "-"}</td>
                      <td>{enquiry.source?.toUpperCase()}</td>
                      <td>
                        <select
                          className={`status-select ${getStatusClass(
                            enquiry.status
                          )}`}
                          value={enquiry.status}
                          onChange={(e) =>
                            updateStatus(enquiry._id, e.target.value)
                          }
                        >
                          {statusOptions.map((item) => (
                            <option key={item} value={item}>
                              {item.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="followup-date-input"
                          type="date"
                          value={
                            enquiry.followUpDate
                              ? enquiry.followUpDate.split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            updateFollowUpDate(enquiry._id, e.target.value)
                          }
                        />
                      </td>
                      <td>{enquiry.note || "-"}</td>
                      <td>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => deleteEnquiry(enquiry._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
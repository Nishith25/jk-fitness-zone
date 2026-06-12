import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState(null);
  const [categorySummary, setCategorySummary] = useState({});
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    category: "all",
  });

  const [form, setForm] = useState({
    title: "",
    category: "Other",
    amount: "",
    paymentMode: "cash",
    expenseDate: new Date().toISOString().split("T")[0],
    note: "",
  });

  const categories = [
    "Rent",
    "Electricity",
    "Salary",
    "Equipment",
    "Maintenance",
    "Marketing",
    "Supplements",
    "Other",
  ];

  const paymentModes = ["cash", "upi", "card", "bank", "other"];

  const safeJsonParse = (value) => {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  const getToken = () => {
    // Direct token keys
    const directToken =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("gymToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("adminToken");

    if (directToken) return directToken;

    // Token stored inside user object
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

    // Final fallback: scan full localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);

      if (!value) continue;

      // JWT usually starts with eyJ
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

    // Your app login is available from home/navbar.
    window.location.href = "/";
  };

  const handleAuthError = (error, fallbackMessage) => {
    console.error(fallbackMessage, error);

    if (error.response?.status === 401) {
      alert("Session expired. Please login again.");
      goToLogin();
      return;
    }

    if (error.response?.status === 403) {
      alert("Only admin can access Expense Manager.");
      return;
    }

    alert(error.response?.data?.message || fallbackMessage);
  };

  const buildExpenseQuery = () => {
    const params = new URLSearchParams();

    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);

    if (filters.category && filters.category !== "all") {
      params.append("category", filters.category);
    }

    return params.toString();
  };

  const buildBalanceQuery = () => {
    const params = new URLSearchParams();

    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);

    return params.toString();
  };

  const fetchExpenses = async () => {
    try {
      const token = getToken();

      if (!token) {
        console.log("LocalStorage keys:", Object.keys(localStorage));
        alert("Login token not found. Please login again.");
        goToLogin();
        return;
      }

      setLoading(true);

      const query = buildExpenseQuery();

      const res = await axios.get(
        `${API_URL}/api/expenses${query ? `?${query}` : ""}`,
        getAuthHeaders()
      );

      setExpenses(res.data.expenses || []);
      setCategorySummary(res.data.categorySummary || {});
    } catch (error) {
      handleAuthError(error, "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceSheet = async () => {
    try {
      const token = getToken();

      if (!token) return;

      const query = buildBalanceQuery();

      const res = await axios.get(
        `${API_URL}/api/expenses/balance-sheet/summary${
          query ? `?${query}` : ""
        }`,
        getAuthHeaders()
      );

      setBalance(res.data.summary || null);
    } catch (error) {
      handleAuthError(error, "Failed to fetch balance sheet");
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBalanceSheet();
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

  const addExpense = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter expense title");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert("Please enter valid amount");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert("Login token not found. Please login again.");
        goToLogin();
        return;
      }

      const payload = {
        ...form,
        title: form.title.trim(),
        amount: Number(form.amount),
      };

      await axios.post(`${API_URL}/api/expenses`, payload, getAuthHeaders());

      setForm({
        title: "",
        category: "Other",
        amount: "",
        paymentMode: "cash",
        expenseDate: new Date().toISOString().split("T")[0],
        note: "",
      });

      await fetchExpenses();
      await fetchBalanceSheet();

      alert("Expense added successfully");
    } catch (error) {
      handleAuthError(error, "Failed to add expense");
    }
  };

  const deleteExpense = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    try {
      const token = getToken();

      if (!token) {
        alert("Login token not found. Please login again.");
        goToLogin();
        return;
      }

      await axios.delete(`${API_URL}/api/expenses/${id}`, getAuthHeaders());

      await fetchExpenses();
      await fetchBalanceSheet();

      alert("Expense deleted successfully");
    } catch (error) {
      handleAuthError(error, "Failed to delete expense");
    }
  };

  const applyFilters = async () => {
    await fetchExpenses();
    await fetchBalanceSheet();
  };

  const resetFilters = async () => {
    setFilters({
      from: "",
      to: "",
      category: "all",
    });

    setTimeout(async () => {
      await fetchExpenses();
      await fetchBalanceSheet();
    }, 150);
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="expense-page">
      <div className="section-header">
        <div>
          <h2>Expense Manager + Balance Sheet</h2>
          <p>Admin-only financial tracking for JK Fitness Zone</p>
        </div>
      </div>

      <div className="balance-grid">
        <div className="balance-card">
          <span>Total Collection</span>
          <h3>{formatCurrency(balance?.totalCollection)}</h3>
        </div>

        <div className="balance-card warning">
          <span>Total Due</span>
          <h3>{formatCurrency(balance?.totalDue)}</h3>
        </div>

        <div className="balance-card danger">
          <span>Total Expenses</span>
          <h3>{formatCurrency(balance?.totalExpenses)}</h3>
        </div>

        <div className="balance-card success">
          <span>Net Balance</span>
          <h3>{formatCurrency(balance?.netBalance)}</h3>
        </div>
      </div>

      <div className="expense-layout">
        <div className="expense-form-card">
          <h3>Add Expense</h3>

          <form onSubmit={addExpense}>
            <div className="form-group">
              <label>Expense Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Example: Gym rent"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleFormChange}
                placeholder="Enter amount"
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Payment Mode</label>
              <select
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleFormChange}
              >
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Expense Date</label>
              <input
                type="date"
                name="expenseDate"
                value={form.expenseDate}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Note</label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleFormChange}
                placeholder="Optional note"
              />
            </div>

            <button className="primary-btn" type="submit">
              Add Expense
            </button>
          </form>
        </div>

        <div className="expense-list-card">
          <div className="expense-list-header">
            <div>
              <h3>Expense List</h3>
              <p>{expenses.length} records found</p>
            </div>
          </div>

          <div className="filter-row">
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

            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="all">All Categories</option>

              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

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

          <div className="category-summary">
            {Object.keys(categorySummary).length === 0 ? (
              <p>No category summary available</p>
            ) : (
              Object.entries(categorySummary).map(([category, amount]) => (
                <div key={category} className="category-pill">
                  <span>{category}</span>
                  <strong>{formatCurrency(amount)}</strong>
                </div>
              ))
            )}
          </div>

          <div className="table-wrapper">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">Loading expenses...</td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan="7">No expenses found</td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>{formatDate(expense.expenseDate)}</td>

                      <td>{expense.title}</td>

                      <td>
                        <span className="status-badge">
                          {expense.category}
                        </span>
                      </td>

                      <td>{expense.paymentMode?.toUpperCase()}</td>

                      <td>{formatCurrency(expense.amount)}</td>

                      <td>{expense.note || "-"}</td>

                      <td>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => deleteExpense(expense._id)}
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
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function BalanceSheet({ refreshKey }) {
  const { API, authHeaders } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const loadData = async () => {
    const customerRes = await axios.get(`${API}/customers`, authHeaders);
    const expenseRes = await axios.get(`${API}/expenses`, authHeaders);

    setCustomers(customerRes.data.customers || []);
    setExpenses(expenseRes.data.expenses || []);
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const totalCollection = customers.reduce(
    (sum, c) => sum + Number(c.membership?.amountPaid || 0),
    0
  );

  const totalDue = customers.reduce(
    (sum, c) => sum + Number(c.membership?.dueAmount || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  const balance = totalCollection - totalExpenses;

  return (
    <div className="card">
      <h2>Balance Sheet</h2>

      <div className="finance-grid">
        <div className="finance-card">
          <span>Total Collection</span>
          <h3>₹{totalCollection}</h3>
        </div>

        <div className="finance-card">
          <span>Total Due</span>
          <h3>₹{totalDue}</h3>
        </div>

        <div className="finance-card">
          <span>Total Expenses</span>
          <h3>₹{totalExpenses}</h3>
        </div>

        <div className="finance-card balance">
          <span>Balance</span>
          <h3>₹{balance}</h3>
        </div>
      </div>
    </div>
  );
}
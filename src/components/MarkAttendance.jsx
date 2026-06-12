import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const today = new Date().toISOString().split("T")[0];

export default function MarkAttendance({ onMarked }) {
  const { API, token, authHeaders } = useAuth();
  const [date, setDate] = useState(today);
  const [customers, setCustomers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [message, setMessage] = useState("");

  const fetchCustomers = async () => {
    const res = await axios.get(`${API}/customers`, authHeaders);
    setCustomers(res.data.customers || []);
  };

  const fetchAttendance = async (selectedDate = date) => {
    const res = await axios.get(
      `${API}/attendance?date=${selectedDate}`,
      authHeaders
    );
    setAttendance(res.data.records || []);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchAttendance(date);
  }, [date]);

  const isPresent = (customerId) => {
    return attendance.some((a) => a.customer?._id === customerId);
  };

  const markPresent = async (customerId) => {
    try {
      const res = await axios.post(
        `${API}/attendance/mark`,
        { customerId, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      await fetchAttendance(date);
      if (onMarked) onMarked();
    } catch (err) {
      setMessage(err.response?.data?.message || "Attendance failed");
    }
  };

  return (
    <div className="card">
      <h2>Mark Attendance</h2>
      <p className="card-text">
        Select a date and mark customers present with one click.
      </p>

      {message && <div className="info-box">{message}</div>}

      <div className="auth-form">
        <label>Select Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setMessage("");
            setDate(e.target.value);
          }}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Plan</th>
              <th>Attendance</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => {
              const present = isPresent(customer._id);

              return (
                <tr key={customer._id}>
                  <td>{customer.loginId}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.membership?.planName || "-"}</td>
                  <td>
                    {present ? (
                      <span className="present-badge">Present</span>
                    ) : (
                      <button
                        className="small-action-btn"
                        onClick={() => markPresent(customer._id)}
                      >
                        Mark Present
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
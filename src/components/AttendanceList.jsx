import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function AttendanceList({ refreshKey }) {
  const { API, authHeaders } = useAuth();
  const [records, setRecords] = useState([]);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API}/attendance`, authHeaders);
      setRecords(res.data.records);
    } catch (err) {
      console.log(err.response?.data?.message || "Failed to fetch attendance");
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [refreshKey]);

  return (
    <div className="card">
      <h2>Attendance Records</h2>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Marked By</th>
              <th>Check-in</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.date}</td>
                <td>{r.customer?.loginId}</td>
                <td>{r.customer?.name}</td>
                <td>{r.customer?.phone}</td>
                <td>{r.markedBy?.name}</td>
                <td>{new Date(r.checkInTime).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ChangePasswordForm from "../components/ChangePasswordForm";

export default function CustomerDashboard() {
  const { user, logout, API, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const profileRes = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(profileRes.data.user);

        const attendanceRes = await axios.get(`${API}/attendance/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAttendance(attendanceRes.data.records || []);
      } catch (error) {
        console.log(error.response?.data?.message || "Failed to load customer data");
      }
    };

    fetchCustomerData();
  }, [API, token]);

  const membership = profile?.membership;

  return (
    <section className="section page-top">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">Customer Dashboard</p>
            <h1>Welcome, {profile?.name || user?.name}</h1>
            <p className="card-text">
              Customer ID: {profile?.loginId || user?.loginId}
            </p>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h2>Profile Details</h2>

            {profile?.photo && (
              <img
                src={`http://localhost:5001${profile.photo}`}
                alt={profile.name}
                className="customer-profile-photo"
              />
            )}

            <p><strong>Name:</strong> {profile?.name}</p>
            <p><strong>Phone:</strong> {profile?.phone}</p>
            <p><strong>Gender:</strong> {profile?.gender}</p>
            <p><strong>Address:</strong> {profile?.address}</p>
          </div>

          <div className="card">
            <h2>Membership Details</h2>

            <p><strong>VIP Number:</strong> {membership?.isVipNumber ? "Yes" : "No"}</p>
            <p><strong>Plan:</strong> {membership?.planName || "-"}</p>
            <p><strong>Plan Amount:</strong> ₹{membership?.planAmount || 0}</p>
            <p>
              <strong>Discount:</strong>{" "}
              {membership?.discountType || "none"} {membership?.discountValue || 0}
            </p>
            <p><strong>Final Amount:</strong> ₹{membership?.finalAmount || 0}</p>
            <p><strong>Payment Mode:</strong> {membership?.paymentMode || "-"}</p>
            <p><strong>Status:</strong> {membership?.status || "-"}</p>
          </div>

          <div className="card">
            <h2>My Attendance</h2>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check-in Time</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map((a) => (
                      <tr key={a._id}>
                        <td>{a.date}</td>
                        <td>{new Date(a.checkInTime).toLocaleTimeString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No attendance records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {profile?.mustChangePassword && (
            <div className="info-box">
              Your default password is your phone number. Please change it.
            </div>
          )}

          <ChangePasswordForm />
        </div>
      </div>
    </section>
  );
}
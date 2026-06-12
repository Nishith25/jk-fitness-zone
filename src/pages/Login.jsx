import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("admin");
  const [phone, setPhone] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login({
        role,
        phone: role === "customer" ? undefined : phone,
        loginId: role === "customer" ? loginId : undefined,
        password,
      });

      if (user.role === "admin") navigate("/admin-dashboard");
      if (user.role === "trainer") navigate("/trainer-dashboard");
      if (user.role === "customer") navigate("/customer-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="section page-top">
      <div className="container auth-container">
        <div className="card auth-card">
          <h2>JK Fitness Zone Login</h2>
          <p className="card-text">
            Admin and trainer login with phone number. Customers login with generated Customer ID.
          </p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <label>Login Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="trainer">Trainer</option>
              <option value="customer">Customer</option>
            </select>

            {role === "customer" ? (
              <>
                <label>Customer ID</label>
                <input
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Example: JK20260001"
                />
              </>
            ) : (
              <>
                <label>Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </>
            )}

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />

            <button className="form-submit" type="submit">
              Login
            </button>
          </form>

          <p className="card-text small-text">
            Admin default login: 8985352525 / 8985352525
          </p>
        </div>
      </div>
    </section>
  );
}
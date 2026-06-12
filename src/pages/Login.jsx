import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Phone, UserRound, BadgeCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("admin");
  const [phone, setPhone] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleContent = {
    admin: {
      title: "Admin Login",
      text: "Manage customers, trainers, attendance, payments, expenses, enquiries and reports.",
      icon: <BadgeCheck size={20} />,
    },
    trainer: {
      title: "Trainer Login",
      text: "Manage assigned gym activities, customers, attendance and enquiries.",
      icon: <UserRound size={20} />,
    },
    customer: {
      title: "Customer Login",
      text: "View your profile, membership, payments and attendance details.",
      icon: <UserRound size={20} />,
    },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({
        role,
        phone: role === "customer" ? undefined : phone.trim(),
        loginId: role === "customer" ? loginId.trim().toUpperCase() : undefined,
        password,
      });

      if (user.role === "admin") navigate("/admin-dashboard");
      if (user.role === "trainer") navigate("/trainer-dashboard");
      if (user.role === "customer") navigate("/customer-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError("");
    setPhone("");
    setLoginId("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <section className="section page-top login-section">
      <div className="container auth-container">
        <div className="card auth-card login-card">
          <div className="login-top">
            <div className="login-icon-box">
              {roleContent[role].icon}
            </div>

            <div>
              <h2>JK Fitness Zone Login</h2>
              <p className="card-text">
                Secure access for gym admin, trainers and registered customers.
              </p>
            </div>
          </div>

          <div className="role-switcher">
            <button
              type="button"
              className={role === "admin" ? "role-pill active" : "role-pill"}
              onClick={() => handleRoleChange("admin")}
            >
              Admin
            </button>

            <button
              type="button"
              className={role === "trainer" ? "role-pill active" : "role-pill"}
              onClick={() => handleRoleChange("trainer")}
            >
              Trainer
            </button>

            <button
              type="button"
              className={role === "customer" ? "role-pill active" : "role-pill"}
              onClick={() => handleRoleChange("customer")}
            >
              Customer
            </button>
          </div>

          <div className="login-role-info">
            <h3>{roleContent[role].title}</h3>
            <p>{roleContent[role].text}</p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            {role === "customer" ? (
              <div className="input-icon-wrap">
                <label>Customer ID</label>
                <div className="input-with-icon">
                  <UserRound size={18} />
                  <input
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="Example: JK20260001"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="input-icon-wrap">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    autoComplete="username"
                    inputMode="tel"
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-icon-wrap">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="form-submit" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="card-text small-text login-note">
            Customers must use the Customer ID generated by the gym. Admin and trainer users must use their registered phone number.
          </p>
        </div>
      </div>
    </section>
  );
}
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ChangePasswordForm() {
  const { API, token } = useAuth();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.put(`${API}/auth/change-password`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message);
      setForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Password change failed");
    }
  };

  return (
    <div className="card">
      <h2>Change Password</h2>
      {message && <div className="info-box">{message}</div>}

      <form onSubmit={submit} className="auth-form">
        <label>Old Password</label>
        <input
          type="password"
          name="oldPassword"
          value={form.oldPassword}
          onChange={update}
          required
        />

        <label>New Password</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={update}
          required
        />

        <button className="form-submit" type="submit">
          Update Password
        </button>
      </form>
    </div>
  );
}
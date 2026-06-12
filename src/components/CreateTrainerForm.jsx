import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function CreateTrainerForm({ onTrainerCreated }) {
  const { API, token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    address: "",
    gender: "male",
  });
  if (onTrainerCreated) onTrainerCreated();
  const [message, setMessage] = useState("");

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(`${API}/trainers`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message);
      setForm({
        name: "",
        phone: "",
        password: "",
        address: "",
        gender: "male",
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Trainer creation failed");
    }
  };

  return (
    <div className="card">
      <h2>Create Trainer</h2>
      {message && <div className="info-box">{message}</div>}

      <form onSubmit={submit} className="auth-form">
        <label>Name</label>
        <input name="name" value={form.name} onChange={update} required />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={update} required />

        <label>Password</label>
        <input name="password" value={form.password} onChange={update} required />

        <label>Address</label>
        <textarea name="address" value={form.address} onChange={update} />

        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={update}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <button className="form-submit" type="submit">
          Create Trainer
        </button>
      </form>
    </div>
  );
}
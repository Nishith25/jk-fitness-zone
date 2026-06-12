import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function EditCustomerModal({ customer, onClose, onUpdated }) {
  const { API, token } = useAuth();

  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    gender: customer?.gender || "male",
  });

  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (photo) data.append("photo", photo);

      const res = await axios.put(`${API}/customers/${customer._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);

      if (onUpdated) onUpdated();

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Customer update failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card payment-modal">
        <h2>Edit Customer</h2>
        <p className="card-text">
          Update customer profile details and photo.
        </p>

        {message && <div className="info-box">{message}</div>}

        <form onSubmit={submitUpdate} className="auth-form">
          <label>Customer Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />

          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={update}
            required
          />

          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={update}
            required
          />

          <label>Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={update}
            required
          />

          <label>Gender</label>
          <select name="gender" value={form.gender} onChange={update}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <button className="form-submit" type="submit">
            Save Changes
          </button>

          <button type="button" className="logout-btn" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
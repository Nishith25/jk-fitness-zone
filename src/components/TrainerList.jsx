import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function TrainerList({ refreshKey }) {
  const { API, authHeaders } = useAuth();
  const [trainers, setTrainers] = useState([]);

  const fetchTrainers = async () => {
    try {
      const res = await axios.get(`${API}/trainers`, authHeaders);
      setTrainers(res.data.trainers);
    } catch (err) {
      console.log(err.response?.data?.message || "Failed to fetch trainers");
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [refreshKey]);

  return (
    <div className="card">
      <h2>Trainer List</h2>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Address</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {trainers.map((trainer) => (
              <tr key={trainer._id}>
                <td>{trainer.name}</td>
                <td>{trainer.phone}</td>
                <td>{trainer.gender || "-"}</td>
                <td>{trainer.address || "-"}</td>
                <td>{trainer.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
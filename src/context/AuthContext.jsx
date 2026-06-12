import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const API = "http://localhost:5001/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("jk_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("jk_token"));

  const login = async (payload) => {
    const res = await axios.post(`${API}/auth/login`, payload);

    localStorage.setItem("jk_token", res.data.token);
    localStorage.setItem("jk_user", JSON.stringify(res.data.user));

    setToken(res.data.token);
    setUser(res.data.user);

    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("jk_token");
    localStorage.removeItem("jk_user");
    setToken(null);
    setUser(null);
  };

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authHeaders, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
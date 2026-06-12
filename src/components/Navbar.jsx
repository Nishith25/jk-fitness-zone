import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";
import { siteConfig } from "../data/siteData";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setOpen(false);

  const dashboardLink =
    user?.role === "admin"
      ? "/admin-dashboard"
      : user?.role === "trainer"
      ? "/trainer-dashboard"
      : user?.role === "customer"
      ? "/customer-dashboard"
      : "/login";

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <NavLink to="/" className="brand logo-brand" onClick={closeMenu}>
          <img
            src="/logo.png"
            alt={siteConfig.name}
            className="navbar-full-logo"
          />
        </NavLink>

        <nav className={`nav-links ${open ? "show" : ""}`}>
          {!user && (
            <>
              <NavLink to="/" onClick={closeMenu}>
                Home
              </NavLink>

              <NavLink to="/about" onClick={closeMenu}>
                About
              </NavLink>

              <NavLink to="/programs" onClick={closeMenu}>
                Programs
              </NavLink>

              <NavLink to="/contact" onClick={closeMenu}>
                Contact
              </NavLink>

              <NavLink to="/login" onClick={closeMenu}>
                Login
              </NavLink>

              <div className="mobile-wa">
                <WhatsAppButton
                  text="Join Now"
                  message="Hi JK Fitness Zone, I want to know more about joining the gym."
                />
              </div>
            </>
          )}

          {user && (
            <>
              <NavLink to={dashboardLink} onClick={closeMenu}>
                Dashboard
              </NavLink>

              {user.role === "admin" && (
                <>
                  <NavLink to="/admin-dashboard/customers" onClick={closeMenu}>
                    Customers
                  </NavLink>

                  <NavLink to="/admin-dashboard/attendance" onClick={closeMenu}>
                    Attendance
                  </NavLink>

                  <NavLink to="/admin-dashboard/reports" onClick={closeMenu}>
                    Reports
                  </NavLink>
                </>
              )}

              {user.role === "trainer" && (
                <>
                  <NavLink to="/trainer-dashboard/customers" onClick={closeMenu}>
                    Customers
                  </NavLink>

                  <NavLink to="/trainer-dashboard/attendance" onClick={closeMenu}>
                    Attendance
                  </NavLink>
                </>
              )}

              <button
                className="navbar-logout-btn"
                type="button"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          )}
        </nav>

        {!user && (
          <div className="desktop-wa">
            <WhatsAppButton
              text="Join Now"
              message="Hi JK Fitness Zone, I want to know more about joining the gym."
            />
          </div>
        )}

        <button
          className="menu-btn"
          type="button"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
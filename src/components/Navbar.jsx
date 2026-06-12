import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";
import { siteConfig } from "../data/siteData";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <NavLink to="/" className="brand brand-logo-only" onClick={closeMenu}>
          <img
            src="/logo-wide.png"
            alt={siteConfig.name}
            className="brand-logo-wide"
          />
        </NavLink>

        <nav className={`nav-links ${open ? "show" : ""}`}>
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
        </nav>

        <div className="desktop-wa">
          <WhatsAppButton
            text="Join Now"
            message="Hi JK Fitness Zone, I want to know more about joining the gym."
          />
        </div>

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
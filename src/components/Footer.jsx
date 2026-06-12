import { NavLink } from "react-router-dom";
import { siteConfig } from "../data/siteData";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <img src="/logo.jpg" alt={siteConfig.name} className="brand-logo" />

            <div>
              <h2>{siteConfig.name}</h2>
              <p>{siteConfig.tagline}</p>
            </div>
          </div>

          <p className="footer-text">
            JK Fitness Zone offers gym training, Zumba, cardio, CrossFit,
            functional training, personal training, weight loss management, and
            diet guidance in Nizampet.
          </p>
        </div>

        <div>
          <h4>Pages</h4>

          <div className="footer-links">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/programs">Programs</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
        </div>

        <div>
          <h4>Contact</h4>

          <div className="footer-links">
            <span>{siteConfig.phoneDisplay}</span>
            <span>{siteConfig.address}</span>
            <span>{siteConfig.hours}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, MapPin, Dumbbell } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";
import { heroImages, heroHighlights, siteConfig } from "../data/siteData";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero">
      <AnimatePresence mode="wait">
        <motion.div
          key={heroImages[current]}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="hero-bg"
          style={{
            backgroundImage: `linear-gradient(rgba(5,8,12,.68), rgba(5,8,12,.88)), url(${heroImages[current]})`,
          }}
        />
      </AnimatePresence>

      <div className="container hero-content">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow">Gym • Fitness • Transformation</div>

          <h1>
            Train Better At <span>{siteConfig.name}</span>
          </h1>

          <p>
            A practical fitness space in Nizampet for gym training, cardio,
            functional workouts, CrossFit, Zumba, personal training, weight loss
            management, and diet guidance.
          </p>

          <div className="hero-actions">
            <WhatsAppButton
              text="Ask For Membership Plans"
              message="Hi JK Fitness Zone, I want to know the membership plans and available training options."
            />

            <button
              className="secondary-btn"
              type="button"
              onClick={() => navigate("/programs")}
            >
              View Services <ArrowRight size={18} />
            </button>
          </div>

          <div className="stats-grid">
            {heroHighlights.map((item) => (
              <div key={item.label} className="stat-card">
                <h3>{item.value}</h3>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="hero-panel"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="panel-grid">
            <div className="panel-card">
              <p>Training Options</p>
              <h3>Gym + Cardio + Zumba</h3>
              <span>
                Strength training, cardio sessions, Zumba, CrossFit and
                functional training available under one roof.
              </span>
            </div>

            <div className="panel-card highlight">
              <p>Guidance Available</p>
              <h3>Male & Female Trainers</h3>
              <span>
                Members can get workout support, form correction, personal
                training, and diet guidance based on their goals.
              </span>
            </div>
          </div>

          <div className="panel-bottom">
            <div>
              <h4>Open 365 Days</h4>

              <p>
                <Clock size={16} /> 5:00 AM to 10:00 PM
              </p>

              <p>
                <MapPin size={16} /> Nizampet, Hyderabad
              </p>
            </div>

            <div className="badge">
              <Dumbbell size={15} /> Plans on WhatsApp
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
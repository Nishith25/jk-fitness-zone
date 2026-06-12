import { motion } from "framer-motion";
import HeroSection from "../components/HeroSection";
import BMICalculator from "../components/BMICalculator";
import WhatsAppButton from "../components/WhatsAppButton";
import { features, programs } from "../data/siteData";

export default function Home() {
  return (
    <>
      <HeroSection />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p>Our Services</p>
            <h2>Fitness Support For Every Goal</h2>
            <span>
              JK Fitness Zone offers gym training, cardio, Zumba, CrossFit,
              functional training, personal training, weight loss management,
              and diet guidance.
            </span>
          </div>

          <div className="feature-grid">
            {features.map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -6 }}
                className="card"
              >
                <h3>{item.title}</h3>
                <p className="card-text">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark-section">
        <div className="container">
          <div className="section-head center">
            <p>Training Options</p>
            <h2>Choose Training That Fits Your Routine</h2>
            <span>
              Get guidance from the gym team for membership plans, personal
              training, weight loss support, and diet guidance.
            </span>
          </div>

          <div className="program-grid">
            {programs.slice(0, 3).map((program) => (
              <div key={program.title} className="card">
                <span className="mini-badge">{program.tag}</span>
                <h3>{program.title}</h3>
                <p className="card-text">{program.desc}</p>

                <WhatsAppButton
                  text="Enquire Now"
                  message={`Hi JK Fitness Zone, I want details about ${program.title}.`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <BMICalculator />
    </>
  );
}
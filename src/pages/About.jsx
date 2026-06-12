import WhatsAppButton from "../components/WhatsAppButton";
import { siteConfig } from "../data/siteData";

export default function About() {
  return (
    <section className="section page-top">
      <div className="container two-col">
        <div className="card">
          <div className="section-head">
            <p>About JK Fitness Zone</p>
            <h2>A Practical Fitness Space In Nizampet</h2>
            <span>
              JK Fitness Zone is a gym in Nizampet, Hyderabad, offering gym
              training, cardio, Zumba, CrossFit, functional training, personal
              training, weight loss management, and diet guidance.
            </span>
          </div>

          <div className="simple-grid">
            <div className="mini-card">Open 365 days</div>
            <div className="mini-card">5:00 AM to 10:00 PM</div>
            <div className="mini-card">Male and female trainer support</div>
            <div className="mini-card">Diet guidance available</div>
          </div>
        </div>

        <div className="card highlight-card">
          <h2>Why Choose Us</h2>

          <div className="list-box">
            <div>Gym, cardio, Zumba, CrossFit, and functional training</div>
            <div>Personal training for goal-based fitness support</div>
            <div>Weight loss management with workout and diet guidance</div>
            <div>Beginner-friendly support with form correction</div>
            <div>Convenient location in Nizampet, Hyderabad</div>
          </div>

          <p className="card-text">
            <strong>Timings:</strong> {siteConfig.hours}
          </p>

          <p className="card-text">
            <strong>Address:</strong> {siteConfig.address}
          </p>

          <WhatsAppButton
            text="Enquire Now"
            message="Hi JK Fitness Zone, I want to know more about your gym services and membership plans."
          />
        </div>
      </div>
    </section>
  );
}
import WhatsAppButton from "../components/WhatsAppButton";
import { programs } from "../data/siteData";

export default function Programs() {
  return (
    <section className="section page-top">
      <div className="container">
        <div className="section-head">
          <p>Our Services</p>
          <h2>Training Options Available At JK Fitness Zone</h2>
          <span>
            Choose from gym training, Zumba, cardio, CrossFit, functional
            training, personal training, weight loss management, and diet
            guidance.
          </span>
        </div>

        <div className="program-grid">
          {programs.map((program) => (
            <div key={program.title} className="card">
              <span className="mini-badge">{program.tag}</span>

              <h3>{program.title}</h3>

              <p className="card-text">{program.desc}</p>

              <WhatsAppButton
                text="Enquire Now"
                message={`Hi JK Fitness Zone, I want to know more about ${program.title}. Please share the details.`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
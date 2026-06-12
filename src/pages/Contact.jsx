import WhatsAppButton from "../components/WhatsAppButton";
import { siteConfig } from "../data/siteData";

export default function Contact() {
  return (
    <section className="section page-top">
      <div className="container">
        <div className="section-head">
          <p>Contact JK Fitness Zone</p>
          <h2>Visit Our Gym In Nizampet</h2>
          <span>
            For membership plans, personal training, Zumba, cardio, CrossFit,
            functional training, weight loss management, and diet guidance,
            contact the gym team or visit us directly.
          </span>
        </div>

        <div className="contact-grid">
          <div className="card">
            <h3>Gym Details</h3>

            <div className="contact-lines">
              <p>
                <strong>Location:</strong> {siteConfig.address}
              </p>

              <p>
                <strong>Phone / WhatsApp:</strong> {siteConfig.phoneDisplay}
              </p>

              
              <p>
                <strong>Working Hours:</strong> {siteConfig.hours}
              </p>
            </div>

            <WhatsAppButton
              text="Enquire Now"
              message="Hi JK Fitness Zone, I want to know about your gym services and membership plans."
            />
          </div>

          <div className="card highlight-card">
            <h3>Quick Enquiries</h3>

            <div className="quick-grid">
              <WhatsAppButton
                text="Membership Plans"
                message="Hi JK Fitness Zone, I want to know the current membership plans."
              />

              <WhatsAppButton
                text="Personal Training"
                message="Hi JK Fitness Zone, I want details about personal training."
              />

              <WhatsAppButton
                text="Weight Loss Support"
                message="Hi JK Fitness Zone, I want details about weight loss management and diet guidance."
              />

              <WhatsAppButton
                text="Zumba / Cardio"
                message="Hi JK Fitness Zone, I want details about Zumba and cardio training."
              />
            </div>
          </div>
        </div>

        <div className="map-wrap">
          <iframe
            title="JK Fitness Zone Map"
            src={siteConfig.mapEmbed}
            className="map-frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
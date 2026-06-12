import { MessageCircle } from "lucide-react";
import { siteConfig } from "../data/siteData";

export default function WhatsAppButton({
  message = "Hi JK Fitness Zone, I want to know more.",
  text = "Chat on WhatsApp",
  className = "",
}) {
  const href = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`wa-btn ${className}`}
    >
      <MessageCircle size={18} />
      <span>{text}</span>
    </a>
  );
}
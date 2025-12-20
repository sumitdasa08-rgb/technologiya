import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "918812910655"; // India country code + number
  const message = encodeURIComponent("Hi! I'm interested in your tech repair services.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-xl group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white fill-white" />
      
      {/* Tooltip */}
      <span className="absolute right-16 bg-foreground text-background text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Chat with us
      </span>
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
    </a>
  );
};

export default WhatsAppButton;

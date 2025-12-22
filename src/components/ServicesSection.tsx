import { Monitor, FileText, Smartphone, Volume2, HardDrive, Settings, Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Monitor,
    title: "Windows OS Upgrade",
    description: "Upgrade to the latest Windows version for enhanced security and performance.",
    price: "₹250",
  },
  {
    icon: Settings,
    title: "OS Changes & Updates",
    description: "System updates, driver installations, and performance optimization.",
    price: "₹300",
  },
  {
    icon: FileText,
    title: "Microsoft Office",
    description: "Complete MS Office suite installation with activation.",
    price: "₹350",
  },
  {
    icon: HardDrive,
    title: "Storage Solutions",
    description: "Mobile storage issues, cleanup, and data management solutions.",
    price: "₹250",
  },
  {
    icon: Smartphone,
    title: "Software Fixes",
    description: "Fix app crashes, system errors, and performance problems.",
    price: "₹300",
  },
  {
    icon: Volume2,
    title: "Audio Repair",
    description: "Audio driver fixes, speaker problems, and sound optimization.",
    price: "₹250",
  },
];

const ServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleServiceClick = (title: string, description: string, price: string) => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
      // Dispatch custom event to pre-fill form with service type for pricing
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("prefillContact", {
          detail: { 
            issue: title, 
            message: description,
            service_type: title,
            price: parseInt(price.replace(/[₹,]/g, ''))
          }
        }));
      }, 500);
    }
  };

  const handleBookSlot = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("prefillContact", {
          detail: { 
            issue: "Consultation", 
            message: "I want to book a slot for computer/mobile software related issue consultation.",
            service_type: "consultation",
            price: 150
          }
        }));
      }, 500);
    }
  };

  return (
    <section id="services" ref={sectionRef} className="py-32 bg-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        <div className={`text-center mb-20 transition-all duration-700 ease-apple ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Services</span>
          <h2 className="text-4xl md:text-6xl font-semibold text-foreground mt-4 mb-6 tracking-tight">
            What we offer.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
            Professional solutions for all your tech needs, with transparent pricing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              onClick={() => handleServiceClick(service.title, service.description, service.price)}
              className={`group glass-card p-8 rounded-3xl hover-lift cursor-pointer transition-all duration-500 ease-apple ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 transition-all duration-500 ease-apple group-hover:bg-foreground group-hover:scale-110 group-hover:rotate-3">
                <service.icon className="w-6 h-6 text-foreground group-hover:text-background transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-6 font-light leading-relaxed">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-foreground">{service.price}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Starting price</span>
              </div>
            </div>
          ))}
        </div>

        {/* Book Slot Section */}
        <div 
          className={`mt-16 glass-card p-8 md:p-12 rounded-3xl transition-all duration-700 ease-apple hover-lift ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
          style={{ transitionDelay: '600ms' }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-background" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 tracking-tight">Book Your Slot Now</h3>
                <p className="text-muted-foreground font-light">For any type of computer/mobile software related issue</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-3xl md:text-4xl font-semibold text-foreground">₹150</span>
              <Button 
                onClick={handleBookSlot}
                className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 rounded-full font-medium transition-all duration-500 ease-apple hover:scale-105 hover:shadow-lg"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

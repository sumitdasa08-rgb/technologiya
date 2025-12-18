import { Monitor, FileText, Smartphone, Volume2, HardDrive, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

  return (
    <section id="services" ref={sectionRef} className="py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Services</span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mt-4 mb-6 tracking-tight">
            What we offer.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
            Professional solutions for all your tech needs, with transparent pricing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className={`group p-8 rounded-3xl bg-card border border-border hover:border-foreground/20 transition-all duration-500 hover:shadow-xl cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-foreground group-hover:scale-110">
                <service.icon className="w-6 h-6 text-foreground group-hover:text-background transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-6 font-light leading-relaxed">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">{service.price}</span>
                <span className="text-xs text-muted-foreground">Starting price</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

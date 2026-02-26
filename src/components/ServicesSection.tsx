import { Monitor, FileText, Smartphone, Volume2, HardDrive, Settings, Calendar, ArrowRight, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRocketScroll } from "@/components/RocketScrollAnimation";
import { scrollToBookingSection } from "@/lib/scroll-utils";

interface ServiceItem {
  icon: LucideIcon;
  id: string;
  title: string;
  description: string;
}

const services: ServiceItem[] = [
  { icon: Monitor, id: "windows_upgrade", title: "Windows OS Installation", description: "Professional Windows installation and upgrade services for enhanced security and performance." },
  { icon: Settings, id: "software_repair", title: "Computer Troubleshooting", description: "Expert computer repair including system updates, driver installations, and performance optimization." },
  { icon: FileText, id: "consultation", title: "Microsoft Office Setup", description: "Complete MS Office suite installation with activation by our technical service experts." },
  { icon: HardDrive, id: "data_recovery", title: "Data Recovery & Storage", description: "Specialist storage issue handling, cleanup, and professional data recovery solutions." },
  { icon: Smartphone, id: "pc_optimization", title: "Laptop Repair & Fixes", description: "Laptop repair services to fix crashes, system errors, and performance problems." },
  { icon: Volume2, id: "sound_issues", title: "Hardware Diagnostics", description: "Professional IT support for audio, display, and hardware troubleshooting." },
];

const ServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const launchRocket = useRocketScroll();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleServiceClick = (service: ServiceItem) => {
    triggerHaptic();
    launchRocket(() => {
      scrollToBookingSection();
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("prefillContact", {
          detail: { issue: service.title, message: service.description, serviceId: service.id },
        }));
      }, 800);
    });
  };

  const handleBookSlot = () => {
    launchRocket(() => {
      scrollToBookingSection();
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("prefillContact", {
          detail: { issue: "Consultation", message: "I want to book a slot for computer/mobile software related issue consultation." },
        }));
      }, 800);
    });
  };

  return (
    <section id="services" ref={sectionRef} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary tracking-widest uppercase mb-6 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5">
            Our Services
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-6 tracking-tight font-display">
            What We <span className="text-primary">Fix</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Professional device repair and IT support — fast, reliable, and transparent.
          </p>
        </div>

        {/* Services Grid */}
        {/* Mobile: compact uniform list */}
        <div className="flex flex-col gap-2.5 md:hidden">
          {services.map((service, index) => (
            <div 
              key={index}
              onClick={() => handleServiceClick(service)}
              className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer border border-border/30 bg-card/40 active:scale-[0.98] will-change-[opacity,transform] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionProperty: 'opacity, transform',
                transitionDuration: '0.4s',
                transitionTimingFunction: 'ease-out',
                transitionDelay: isVisible ? `${index * 60}ms` : '0ms',
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <service.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground flex-1">{service.title}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>

        {/* Desktop: grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => (
            <div 
              key={index}
              onClick={() => handleServiceClick(service)}
              className={`group relative p-8 rounded-2xl cursor-pointer border border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 will-change-[opacity,transform] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{
                transitionProperty: 'opacity, transform, border-color, background-color, box-shadow',
                transitionDuration: isVisible ? '0.5s, 0.5s, 0.3s, 0.3s, 0.3s' : '0.5s',
                transitionTimingFunction: 'ease-out',
                transitionDelay: isVisible ? `${index * 80}ms` : '0ms',
              }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 flex-shrink-0 transition-colors duration-300 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20">
                <service.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="relative text-lg font-semibold text-foreground mb-2.5 tracking-tight font-display">{service.title}</h3>
              <p className="relative text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </div>
          ))}
        </div>

        <p 
          className={`text-center text-base text-muted-foreground mt-10 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '400ms' }}
        >
          ...and many more services. <button onClick={handleBookSlot} className="text-primary hover:underline underline-offset-4 font-medium">Get in touch →</button>
        </p>

        {/* CTA Card */}
        <div 
          className={`mt-14 relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 md:backdrop-blur-md p-8 md:p-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} 
          style={{ transitionDelay: '500ms' }}
        >
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1 tracking-tight font-display">Need Expert Help?</h3>
                <p className="text-muted-foreground text-sm md:text-base">Computer repair, laptop fixes, or device troubleshooting</p>
              </div>
            </div>
            <Button 
              onClick={handleBookSlot}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              aria-label="Contact Technologiya for device support"
            >
              Book a Slot
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

import { Monitor, FileText, Smartphone, Volume2, HardDrive, Settings, Calendar, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ServiceItem {
  icon: LucideIcon;
  id: string;
  title: string;
  description: string;
}

const services: ServiceItem[] = [
  { icon: Monitor, id: "windows_upgrade", title: "Windows OS Installation", description: "Technologiya provides professional Windows installation and upgrade services for enhanced security and performance." },
  { icon: Settings, id: "software_repair", title: "Computer Troubleshooting", description: "Expert Technologiya computer repair including system updates, driver installations, and performance optimization." },
  { icon: FileText, id: "consultation", title: "Microsoft Office Setup", description: "Complete MS Office suite installation with activation by Technologiya technical service experts." },
  { icon: HardDrive, id: "data_recovery", title: "Data Recovery & Storage", description: "Technologiya device repair specialists handle storage issues, cleanup, and data recovery solutions." },
  { icon: Smartphone, id: "pc_optimization", title: "Laptop Repair & Fixes", description: "Technologiya laptop repair services to fix crashes, system errors, and performance problems." },
  { icon: Volume2, id: "sound_issues", title: "Hardware Diagnostics", description: "Professional Technologiya IT support for audio, display, and hardware troubleshooting." },
];

const ServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const SCROLL_DURATION_MS = 1200;

  const smoothScrollTo = (element: HTMLElement, duration: number = SCROLL_DURATION_MS) => {
    const targetPosition = element.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const easeInOutCubic = (t: number): number =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  };

  const triggerHaptic = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleServiceClick = (service: ServiceItem) => {
    triggerHaptic();
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      smoothScrollTo(bookingSection, SCROLL_DURATION_MS);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("prefillContact", {
          detail: { issue: service.title, message: service.description },
        }));
      }, SCROLL_DURATION_MS + 100);
    }
  };

  const handleBookSlot = () => {
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      smoothScrollTo(bookingSection, SCROLL_DURATION_MS);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("prefillContact", {
          detail: { issue: "Consultation", message: "I want to book a slot for computer/mobile software related issue consultation." },
        }));
      }, SCROLL_DURATION_MS + 100);
    }
  };

  return (
    <section id="services" ref={sectionRef} className="py-24 md:py-32 bg-card relative overflow-hidden">
      <div className="absolute inset-0 glow-accent opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className={`text-center mb-16 md:mb-20 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            Technologiya Services
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-6 tracking-tight font-display">
            Technologiya Computer Solutions
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Professional Technologiya device repair and IT support solutions for all your tech needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              onClick={() => handleServiceClick(service)}
              className={`group glass-card p-5 md:p-8 rounded-2xl cursor-pointer transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center gap-4 md:block">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center md:mb-6 flex-shrink-0 transition-colors duration-300 group-hover:bg-primary">
                  <service.icon className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <div className="flex-1 md:hidden">
                  <h3 className="text-sm font-semibold text-foreground tracking-tight leading-tight">{service.title}</h3>
                </div>
              </div>
              <h3 className="hidden md:block text-xl font-semibold text-foreground mb-3 tracking-tight font-display">{service.title}</h3>
              <p className="hidden md:block text-muted-foreground text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        <p 
          className={`text-center text-lg md:text-xl text-muted-foreground mt-10 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '400ms' }}
        >
          ...and many more Technologiya technical services. Contact us today!
        </p>

        {/* CTA Card */}
        <div 
          className={`mt-16 glass-card p-8 md:p-12 rounded-2xl transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
          style={{ transitionDelay: '500ms' }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Calendar className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight font-display">Contact Technologiya</h3>
                <p className="text-muted-foreground">For any type of computer repair, laptop repair, or device troubleshooting</p>
              </div>
            </div>
            <Button 
              onClick={handleBookSlot}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-xl font-medium transition-colors duration-300 shadow-lg shadow-primary/30"
              aria-label="Contact Technologiya for device support"
            >
              Get Device Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

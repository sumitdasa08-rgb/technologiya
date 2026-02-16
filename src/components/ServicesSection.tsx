import { Monitor, FileText, Smartphone, Volume2, HardDrive, Settings, Calendar, ArrowRight, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

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
    <section id="services" ref={sectionRef} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary tracking-widest uppercase mb-6 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {services.map((service, index) => (
            <div 
              key={index}
              onClick={() => handleServiceClick(service)}
              className={`group relative p-5 md:p-8 rounded-2xl cursor-pointer border border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 md:hover:border-primary/30 md:hover:bg-card/80 md:hover:shadow-lg md:hover:shadow-primary/5 md:hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out, border-color 0.3s, background-color 0.3s, box-shadow 0.3s',
                transitionDelay: isVisible ? `${index * 80}ms` : '0ms',
              }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex items-center gap-4 md:block">
                <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center md:mb-5 flex-shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20">
                  <service.icon className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <div className="flex-1 md:hidden">
                  <h3 className="text-sm font-semibold text-foreground tracking-tight leading-tight">{service.title}</h3>
                </div>
              </div>
              <h3 className="hidden md:block relative text-lg font-semibold text-foreground mb-2.5 tracking-tight font-display">{service.title}</h3>
              <p className="hidden md:block relative text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              
              {/* Arrow indicator on hover */}
              <div className="hidden md:flex absolute bottom-6 right-6 w-8 h-8 rounded-full bg-primary/10 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
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
          className={`mt-14 relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md p-8 md:p-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} 
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
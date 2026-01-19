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
  {
    icon: Monitor,
    id: "windows_upgrade",
    title: "Windows OS Upgrade",
    description: "Upgrade to the latest Windows version for enhanced security and performance.",
  },
  {
    icon: Settings,
    id: "software_repair",
    title: "OS Changes & Updates",
    description: "System updates, driver installations, and performance optimization.",
  },
  {
    icon: FileText,
    id: "consultation",
    title: "Microsoft Office",
    description: "Complete MS Office suite installation with activation.",
  },
  {
    icon: HardDrive,
    id: "data_recovery",
    title: "Storage Solutions",
    description: "Mobile storage issues, cleanup, and data management solutions.",
  },
  {
    icon: Smartphone,
    id: "pc_optimization",
    title: "Software Fixes",
    description: "Fix app crashes, system errors, and performance problems.",
  },
  {
    icon: Volume2,
    id: "sound_issues",
    title: "Audio Repair",
    description: "Audio driver fixes, speaker problems, and sound optimization.",
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
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * ease);

      if (progress < 1) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  };

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleServiceClick = (service: ServiceItem) => {
    triggerHaptic();
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      smoothScrollTo(bookingSection, SCROLL_DURATION_MS);

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("prefillContact", {
            detail: {
              issue: service.title,
              message: service.description,
            },
          })
        );
      }, SCROLL_DURATION_MS + 100);
    }
  };

  const handleBookSlot = () => {
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      smoothScrollTo(bookingSection, SCROLL_DURATION_MS);

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("prefillContact", {
            detail: {
              issue: "Consultation",
              message: "I want to book a slot for computer/mobile software related issue consultation.",
            },
          })
        );
      }, SCROLL_DURATION_MS + 100);
    }
  };

  return (
    <section id="services" ref={sectionRef} className="py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        <div className={`text-center mb-20 transition-all duration-700 ease-apple ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Services</span>
          <h2 className="text-4xl md:text-6xl font-semibold text-foreground mt-4 mb-6 tracking-tight">
            What we offer.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
            Professional solutions for all your tech needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              onClick={() => handleServiceClick(service)}
              className={`group glass-card p-4 md:p-8 rounded-2xl md:rounded-3xl hover-lift cursor-pointer transition-all duration-500 ease-apple ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 md:block">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-foreground/5 flex items-center justify-center md:mb-6 flex-shrink-0 transition-all duration-500 ease-apple group-hover:bg-foreground group-hover:scale-110 group-hover:rotate-3">
                  <service.icon className="w-5 h-5 md:w-6 md:h-6 text-foreground group-hover:text-background transition-colors duration-300" />
                </div>
                <div className="flex-1 md:hidden">
                  <h3 className="text-sm font-semibold text-foreground tracking-tight leading-tight">{service.title}</h3>
                </div>
              </div>
              <h3 className="hidden md:block text-xl font-semibold text-foreground mb-3 tracking-tight">{service.title}</h3>
              <p className="hidden md:block text-muted-foreground text-sm font-light leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        <p 
          className={`text-center text-lg md:text-xl text-muted-foreground mt-8 font-light transition-all duration-700 ease-apple ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '500ms' }}
        >
          ...and many more, just contact us!
        </p>

        {/* Contact CTA */}
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
                <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 tracking-tight">Need Help?</h3>
                <p className="text-muted-foreground font-light">For any type of computer/mobile software related issue</p>
              </div>
            </div>
            <Button 
              onClick={handleBookSlot}
              className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 rounded-full font-medium transition-all duration-500 ease-apple hover:scale-105 hover:shadow-lg"
            >
              Contact Us Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

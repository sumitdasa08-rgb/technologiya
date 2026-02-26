import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRocketScroll } from "@/components/RocketScrollAnimation";
import { scrollToBookingSection } from "@/lib/scroll-utils";

const WhyChooseSection = () => {
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

  const launchRocket = useRocketScroll();

  const scrollToBooking = () => {
    launchRocket(() => scrollToBookingSection());
  };

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-card relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className={`text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 tracking-tight font-display transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Why Technologiya?
          </h2>

          {/* Subheadline */}
          <h3 className={`text-xl md:text-2xl lg:text-3xl font-semibold text-foreground/90 mb-8 font-display transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '100ms' }}>
            Your Device = Your Productivity Engine
          </h3>

          {/* Description */}
          <p className={`text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '200ms' }}>
            A broken device means lost time, missed opportunities, and endless frustration. 
            Technologiya gets you back on track quickly with expert repairs, transparent pricing, 
            and service you can trust.
          </p>

          {/* CTA */}
          <div className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '300ms' }}>
            <Button
              size="lg"
              onClick={scrollToBooking}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            >
              Schedule a repair
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;

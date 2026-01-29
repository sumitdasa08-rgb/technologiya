import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCharacter from "@/assets/hero-character.png";
import heroCharacterMobile from "@/assets/hero-character-mobile.webp";

const HeroSection = () => {
  const scrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      const mobileHeader = document.getElementById('booking-mobile-header');
      if (mobileHeader) {
        const offset = 20;
        const elementPosition = mobileHeader.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
        return;
      }
    }
    
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Gradient background with subtle glow */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 glow-accent opacity-50" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Accent glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-soft delay-500" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="opacity-0 animate-fade-up">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-8 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Device & Computer Solution Platform
              </span>
            </div>

            <h1 className="opacity-0 animate-fade-up delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-[1.1] tracking-tight font-display">
              Technologiya – Trusted Device & Computer Solution
            </h1>
            
            <p className="opacity-0 animate-fade-up delay-200 text-lg md:text-xl text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Expert computer repair, laptop repair & device troubleshooting with transparent pricing.
            </p>
            
            <p className="opacity-0 animate-fade-up delay-300 text-base text-muted-foreground/80 max-w-lg mx-auto lg:mx-0 mb-10">
              Technologiya IT support starting at ₹100 · Same-day technical service available
            </p>

            <div className="opacity-0 animate-fade-up delay-400 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 px-8 py-6 text-base font-medium rounded-xl hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
                asChild
              >
                <a href="#booking" onClick={scrollToBooking} aria-label="Get Device Support from Technologiya">
                  Get Device Support <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-border text-foreground hover:bg-secondary px-8 py-6 text-base font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:border-primary/50"
                asChild
              >
                <a href="#services" onClick={scrollToServices} aria-label="Explore Technologiya Services">Fix My Computer</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="opacity-0 animate-fade-up delay-500 mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { number: "500+", label: "Devices Fixed" },
                { number: "100%", label: "Transparent" },
                { number: "24hr", label: "Quick Service" },
                { number: "5★", label: "Rating" },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display">
                    {stat.number}
                  </div>
                  <div className="text-xs text-muted-foreground tracking-wide uppercase mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Character Image */}
          <div className="flex-1 flex justify-center lg:justify-end opacity-0 animate-fade-up delay-300">
            <div className="relative">
              {/* Glow behind character */}
              <div className="absolute inset-0 bg-primary/20 blur-3xl scale-75 rounded-full" />
              
              {/* Character with floating animation */}
              <div className="relative animate-float">
                <picture>
                  <source 
                    media="(max-width: 768px)" 
                    srcSet={heroCharacterMobile}
                    type="image/webp"
                  />
                  <img 
                    src={heroCharacter} 
                    alt="Technologiya computer repair and device solution expert - professional tech support" 
                    className="w-72 md:w-80 lg:w-[420px] h-auto drop-shadow-2xl"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    width="420"
                    height="420"
                  />
                </picture>
              </div>
              
              {/* Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-5 py-2.5 rounded-full shadow-lg shadow-primary/30">
                Available 24/7
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-600">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
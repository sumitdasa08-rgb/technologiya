import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCharacter from "@/assets/hero-character.png";

const HeroSection = () => {
  const scrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // On mobile, scroll to the LogicLabs header card
      const mobileHeader = document.getElementById('booking-mobile-header');
      if (mobileHeader) {
        const offset = 20;
        const elementPosition = mobileHeader.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
        return;
      }
    }
    
    // Desktop - scroll to booking section
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Clean monochrome gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
      
      {/* Subtle geometric patterns */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* Text Content - Left Side */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="opacity-0 animate-fade-up">
              <span className="inline-block text-sm font-medium text-muted-foreground tracking-widest uppercase mb-6 font-sans">
                Professional Tech Support
              </span>
            </div>

            <h1 className="opacity-0 animate-fade-up delay-100 text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 leading-[1.1] tracking-tight font-display">
              LogicLabs
            </h1>
            
            {/* Professional tagline */}
            <p className="opacity-0 animate-fade-up delay-200 text-xl md:text-2xl text-muted-foreground font-light mb-8 max-w-lg mx-auto lg:mx-0 font-sans">
              Expert device repairs with transparent pricing and fast turnaround.
            </p>
            
            <p className="opacity-0 animate-fade-up delay-300 text-base md:text-lg text-muted-foreground/80 max-w-lg mx-auto lg:mx-0 mb-10 font-light font-sans">
              Starting at just ₹100 · Same-day service available
            </p>

            <div className="opacity-0 animate-fade-up delay-400 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 px-8 py-6 text-base font-medium rounded-full hover:scale-105"
                asChild
              >
                <a href="#booking" onClick={scrollToBooking}>
                  Book Now <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 py-6 text-base font-medium rounded-full transition-all duration-300 hover:scale-105"
                asChild
              >
                <a href="#services" onClick={scrollToServices}>Explore Services</a>
              </Button>
            </div>

            {/* Stats - Clean professional style */}
            <div className="opacity-0 animate-fade-up delay-500 mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { number: "500+", label: "Devices Fixed" },
                { number: "100%", label: "Transparent" },
                { number: "24hr", label: "Quick Service" },
                { number: "5★", label: "Rating" },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                    {stat.number}
                  </div>
                  <div className="text-xs text-muted-foreground tracking-wide uppercase mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Character - Right Side */}
          <div className="flex-1 flex justify-center lg:justify-end opacity-0 animate-fade-up delay-300">
            <div className="relative">
              {/* Subtle shadow/glow behind character */}
              <div className="absolute inset-0 bg-foreground/5 blur-3xl scale-90 rounded-full" />
              
              {/* Character image with floating animation - optimized loading */}
              <div className="relative animate-[float_6s_ease-in-out_infinite]">
                <img 
                  src={heroCharacter} 
                  alt="3D Tech Repair Character" 
                  className="w-72 md:w-80 lg:w-[420px] h-auto drop-shadow-2xl"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width="420"
                  height="420"
                />
              </div>
              
              {/* Minimal floating badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full shadow-lg">
                Available 24/7
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-600">
        <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-foreground/40 rounded-full mt-2 animate-bounce" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

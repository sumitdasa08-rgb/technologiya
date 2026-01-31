import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

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

  return (
    <section className="relative min-h-screen bg-background">
      {/* Main bordered container - engine.fm style */}
      <div className="relative min-h-screen border border-border/40 m-2 md:m-3 lg:m-4 rounded-lg overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img 
            src={heroBg} 
            alt="Professional device repair service"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-background/75" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-10" />
        
        {/* Gradient glow effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
        
        {/* Left sidebar - engine.fm style */}
        <div className="hidden lg:flex absolute left-0 top-0 bottom-0 w-16 flex-col items-center justify-between py-8 z-20 border-r border-border/30 bg-background/30 backdrop-blur-sm">
          {/* Top - tagline vertical */}
          <span className="text-[10px] font-medium text-muted-foreground tracking-[0.25em] whitespace-nowrap transform -rotate-180 origin-center" style={{ writingMode: 'vertical-rl' }}>
            We Fix Devices Fast
          </span>
          
          {/* Scroll indicators */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-muted-foreground/50" />
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full border border-muted-foreground/50" />
            <div className="w-2 h-2 rounded-full border border-muted-foreground/50" />
          </div>
          
          {/* Brand name vertical */}
          <span className="text-[10px] font-medium text-muted-foreground tracking-[0.2em] transform -rotate-180 origin-center" style={{ writingMode: 'vertical-rl' }}>
            technologiya
          </span>
        </div>

        {/* Main content - offset for sidebar on desktop */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Spacer for navbar */}
          <div className="h-20 lg:h-24" />
          
          {/* Content area */}
          <div className="flex-1 flex items-center lg:pl-24 px-6 md:px-12 lg:px-16">
            <div className="max-w-3xl">
              {/* Main headline - engine.fm italic style */}
              <h1 className="opacity-0 animate-fade-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground mb-8 leading-[1.05] tracking-tight font-display">
                <span className="block font-light italic">Transform Your Device</span>
                <span className="block font-light italic">Problems into Solutions.</span>
              </h1>
              
              {/* Subheadline */}
              <p className="opacity-0 animate-fade-up delay-200 text-base md:text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed font-light tracking-wide">
                We provide expert computer repair, laptop repair, and device troubleshooting services, helping individuals and businesses fix their tech issues quickly and affordably.
              </p>

              {/* CTA Button */}
              <div className="opacity-0 animate-fade-up delay-300">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 px-8 py-6 text-base font-medium rounded-lg hover:scale-105"
                  asChild
                >
                  <a href="#booking" onClick={scrollToBooking} aria-label="Get Started with Technologiya">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom padding */}
          <div className="h-16 lg:h-20" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

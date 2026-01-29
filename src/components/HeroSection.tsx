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
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image - engine.fm style */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Professional device repair service"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-background/80" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      {/* Gradient glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
      
      {/* Left sidebar - engine.fm style */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-16 flex-col items-center justify-between py-8 z-20 border-r border-border/30 bg-background/50 backdrop-blur-sm">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <span className="text-primary-foreground font-bold text-lg">T</span>
        </div>
        
        {/* Vertical text */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground tracking-[0.3em] whitespace-nowrap transform -rotate-90 origin-center">
            We Fix Devices Fast
          </span>
        </div>
        
        {/* Scroll indicators */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>
        
        {/* Brand name vertical */}
        <span className="text-xs font-medium text-muted-foreground tracking-widest transform -rotate-90 origin-center whitespace-nowrap">
          technologiya
        </span>
      </div>

      {/* Main content - offset for sidebar on desktop */}
      <div className="relative z-10 container mx-auto px-4 lg:pl-24 pt-24 pb-16">
        <div className="max-w-4xl">
          {/* Pre-headline tag */}
          <div className="opacity-0 animate-fade-up mb-8">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Device & Computer Solution Platform
            </span>
          </div>

          {/* Main headline - engine.fm italic style */}
          <h1 className="opacity-0 animate-fade-up delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-8 leading-[1.05] tracking-tight font-display">
            <span className="block">Transform Your</span>
            <span className="block italic text-foreground/90">Device Problems</span>
            <span className="block">into Solutions.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="opacity-0 animate-fade-up delay-200 text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            We provide expert computer repair, laptop repair, and device troubleshooting services, helping individuals and businesses fix their tech issues quickly and affordably.
          </p>

          {/* CTA Button */}
          <div className="opacity-0 animate-fade-up delay-300">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 px-8 py-6 text-base font-medium rounded-xl hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
              asChild
            >
              <a href="#booking" onClick={scrollToBooking} aria-label="Get Started with Technologiya">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator at bottom center */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-600">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

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
      {/* Main container with border inset matching the frame */}
      <div className="relative min-h-screen">
        {/* Background image */}
        <div className="absolute inset-0">
          <img 
            src={heroBg} 
            alt="Professional device repair service"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-background/70" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-5" />
        
        {/* Left sidebar - engine.fm style */}
        <div className="hidden lg:flex fixed left-[20px] top-[20px] bottom-[20px] w-[60px] flex-col items-center justify-between py-8 z-40">
          {/* Top - tagline vertical */}
          <span className="text-[11px] font-normal text-white/70 tracking-[0.2em] whitespace-nowrap transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
            We Fix Devices Fast
          </span>
          
          {/* Scroll indicators - engine.fm style dots */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
          </div>
          
          {/* Brand name vertical */}
          <span className="text-[11px] font-normal text-white/70 tracking-[0.15em] transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
            technologiya
          </span>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Spacer for navbar */}
          <div className="h-20 lg:h-28" />
          
          {/* Content area - offset for sidebar on desktop */}
          <div className="flex-1 flex items-center lg:pl-[140px] px-8 md:px-16 lg:px-20">
            <div className="max-w-3xl">
              {/* Main headline - engine.fm italic style */}
              <h1 className="opacity-0 animate-fade-up text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[5rem] xl:text-[5.5rem] text-foreground mb-6 leading-[1.1] tracking-tight font-display">
                <span className="block font-light italic">Transform Your</span>
                <span className="block font-light italic">Expertise into</span>
                <span className="block font-light italic">Influence.</span>
              </h1>
              
              {/* Subheadline */}
              <p className="opacity-0 animate-fade-up delay-200 text-sm md:text-base text-muted-foreground mb-8 max-w-lg leading-relaxed font-light tracking-wide">
                We provide expert computer repair, laptop repair, and device troubleshooting services, helping individuals and businesses fix their tech issues quickly and affordably.
              </p>

              {/* CTA Button */}
              <div className="opacity-0 animate-fade-up delay-300">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 px-8 py-5 text-sm font-medium rounded-md"
                  asChild
                >
                  <a href="#booking" onClick={scrollToBooking} aria-label="Book now with Technologiya">
                    Book now
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

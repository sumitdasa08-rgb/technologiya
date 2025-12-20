import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Clean gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="opacity-0 animate-fade-up">
          <span className="inline-block text-sm font-medium text-muted-foreground tracking-widest uppercase mb-6">
            Professional Tech Support
          </span>
        </div>

        <h1 className="opacity-0 animate-fade-up delay-100 text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
          TechFix Pro
        </h1>
        
        <p className="opacity-0 animate-fade-up delay-200 text-xl md:text-2xl text-foreground/80 font-light mb-4 italic">
          "Your Tech in a Wreck? We Fix it in a Sec!"
        </p>
        
        <p className="opacity-0 animate-fade-up delay-300 text-lg text-muted-foreground max-w-xl mx-auto mb-10 font-light">
          Premium repairs. Transparent service. Starting at just ₹250.
        </p>

        <div className="opacity-0 animate-fade-up delay-400 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 px-8 py-6 text-base font-medium rounded-full"
            asChild
          >
            <a href="#contact">
              Book Now <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 py-6 text-base font-medium rounded-full transition-all duration-300"
            asChild
          >
            <a href="#services">Explore Services</a>
          </Button>
        </div>

        <div className="opacity-0 animate-fade-up delay-500 mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { number: "500+", label: "Devices Fixed" },
            { number: "100%", label: "Transparent" },
            { number: "24hr", label: "Quick Service" },
            { number: "5★", label: "Customer Rating" },
          ].map((stat, index) => (
            <div key={index} className="glass-card rounded-2xl p-6 text-center group hover-lift">
              <div className="text-3xl md:text-4xl font-semibold text-foreground mb-2 tracking-tight">
                {stat.number}
              </div>
              <div className="text-xs text-muted-foreground tracking-wide uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-600">
        <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-foreground/40 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

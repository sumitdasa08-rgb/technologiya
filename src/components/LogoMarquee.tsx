import { useEffect, useRef, useState } from "react";

// Trusted brand logos (simulated with text for now)
const trustedBrands = [
  "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "Apple", "Samsung", 
  "OnePlus", "Xiaomi", "Realme", "Intel", "AMD", "NVIDIA"
];

const LogoMarquee = () => {
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

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-card relative overflow-hidden border-y border-border/50">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-10" />
      
      <div className="container mx-auto px-4 mb-10">
        <p className={`text-center text-sm md:text-base text-muted-foreground transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          Technologiya repairs and services devices from leading brands:
        </p>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-card to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-card to-transparent z-10" />
        
        {/* Scrolling content */}
        <div className="flex animate-marquee">
          {[...trustedBrands, ...trustedBrands].map((brand, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-8 md:mx-12"
            >
              <span className="text-xl md:text-2xl font-semibold text-muted-foreground/50 hover:text-foreground/70 transition-colors duration-300 whitespace-nowrap font-display">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;

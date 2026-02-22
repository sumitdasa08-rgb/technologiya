import { useEffect, useRef, useState, useCallback } from "react";

const trustedBrands = [
  "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "Apple", "Samsung", 
  "OnePlus", "Xiaomi", "Realme", "Intel", "AMD", "NVIDIA"
];

const LogoMarquee = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLSpanElement[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const updateScales = useCallback(() => {
    const centerX = window.innerWidth / 2;
    const maxDist = window.innerWidth / 2;

    for (const el of itemsRef.current) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.left + rect.width / 2;
      const dist = Math.abs(elCenter - centerX);
      const proximity = Math.max(0, 1 - dist / maxDist);
      // Scale from 1.0 to 1.35 at center, opacity from 0.35 to 0.9
      const scale = 1 + proximity * 3.0; // Scale from 1.0 to 4.0 at center (1 + 3.0 = 4.0)
      const opacity = 0.35 + proximity * 0.55;
      el.style.transform = `scale(${scale})`;
      el.style.opacity = `${opacity}`;
    }

    rafRef.current = requestAnimationFrame(updateScales);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    rafRef.current = requestAnimationFrame(updateScales);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isVisible, updateScales]);

  const setItemRef = useCallback((el: HTMLSpanElement | null, index: number) => {
    if (el) itemsRef.current[index] = el;
  }, []);

  const doubled = [...trustedBrands, ...trustedBrands];

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-card relative overflow-hidden border-y border-border/30">
      <div className="absolute inset-0 glow-accent opacity-10" />
      
      <div className="container mx-auto px-4 mb-10">
        <p className={`text-center text-sm md:text-base text-muted-foreground transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          Technologiya repairs and services devices from leading brands:
        </p>
      </div>

      <div className="relative" ref={trackRef}>
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-card to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-card to-transparent z-10" />
        
        <div className="flex animate-marquee">
          {doubled.map((brand, index) => (
            <div key={index} className="flex-shrink-0 mx-8 md:mx-12">
              <span
                ref={(el) => setItemRef(el, index)}
                className="text-xl md:text-2xl font-semibold text-foreground whitespace-nowrap font-display will-change-transform"
                style={{ transition: 'transform 0.15s linear, opacity 0.15s linear', transformOrigin: 'center center' }}
              >
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

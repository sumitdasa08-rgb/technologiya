import { useEffect, useRef, useState } from "react";

const stats = [
  {
    value: "30 min",
    label: "Average Diagnosis Time",
  },
  {
    value: "Free",
    label: "Initial Consultation",
  },
  {
    value: "Transparent",
    label: "Pricing Policy",
  },
  {
    value: "Same Day",
    label: "Most Repairs",
  },
];

const WhatItTakesSection = () => {
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
    <section ref={sectionRef} className="py-20 md:py-24 bg-card relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight font-display">
            What it takes
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center p-6 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 font-display">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatItTakesSection;

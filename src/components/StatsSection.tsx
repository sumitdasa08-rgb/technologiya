import { useEffect, useRef, useState } from "react";

const stats = [
  {
    value: "30",
    suffix: "min",
    label: "Avg. Diagnosis",
  },
  {
    value: "500",
    suffix: "+",
    label: "Devices Fixed",
  },
  {
    value: "Same",
    suffix: "Day",
    label: "Most Repairs",
  },
  {
    value: "100",
    suffix: "%",
    label: "Transparency",
  },
];

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<string[]>(stats.map(() => "0"));
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    stats.forEach((stat, index) => {
      const numericValue = parseInt(stat.value);
      if (isNaN(numericValue)) {
        // Non-numeric values - just set immediately
        setTimeout(() => {
          setAnimatedValues(prev => {
            const next = [...prev];
            next[index] = stat.value;
            return next;
          });
        }, index * 200);
        return;
      }

      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          current = numericValue;
          clearInterval(timer);
        }
        setAnimatedValues(prev => {
          const next = [...prev];
          next[index] = Math.floor(current).toString();
          return next;
        });
      }, duration / steps);
    });
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-0 bg-background relative overflow-hidden">
      {/* Full-width stats bar */}
      <div className="border-y border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`relative py-12 md:py-16 text-center transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                } ${index < stats.length - 1 ? 'border-r border-border/30' : ''}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Large number */}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl md:text-6xl lg:text-7xl font-light text-foreground tracking-tight italic">
                    {animatedValues[index]}
                  </span>
                  <span className="text-xl md:text-2xl lg:text-3xl font-light text-primary italic">
                    {stat.suffix}
                  </span>
                </div>
                
                {/* Label */}
                <p className="text-sm md:text-base text-muted-foreground mt-3 tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

import { Monitor, Zap, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: Monitor,
    title: "Effortless Device Repair",
    description: "Get your computer, laptop, or mobile fixed with zero hassle. We handle everything from diagnosis to solution.",
  },
  {
    icon: Zap,
    title: "Quick Fixes That Last",
    description: "Most repairs completed same-day. We solve problems fast without compromising on quality or reliability.",
  },
  {
    icon: Shield,
    title: "Full-Service Support",
    description: "From Windows installation to virus removal, data recovery to hardware fixes—we handle it all under one roof.",
  },
];

const WhatWeDoSection = () => {
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
    <section ref={sectionRef} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight font-display">
            What We Do
          </h2>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group glass-card p-8 md:p-10 rounded-2xl transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-primary group-hover:scale-110">
                <feature.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4 font-display">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;

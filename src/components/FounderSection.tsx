import { useEffect, useRef, useState } from "react";

const FounderSection = () => {
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
    <section ref={sectionRef} className="py-24 md:py-32 bg-card relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight font-display">
              Meet the founder
            </h2>
          </div>

          {/* Founder card */}
          <div className={`glass-card p-8 md:p-12 rounded-2xl transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '100ms' }}>
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              {/* Avatar */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-5xl md:text-6xl font-bold text-primary font-display">T</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-2xl md:text-3xl font-semibold text-foreground mb-6 font-display">
                  I'm the founder of Technologiya.
                </p>

                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    I've spent years fixing computers, laptops, and devices for people across India. 
                    But my journey started long before Technologiya was born.
                  </p>

                  <p>
                    Growing up, I was always the one family and friends called when their computers 
                    crashed or phones stopped working. I realized that most people don't need expensive 
                    repair shops—they need someone who truly understands technology and can explain 
                    solutions in simple terms.
                  </p>

                  <p>
                    That's why I built <strong className="text-foreground">Technologiya</strong>—to make 
                    quality tech repair accessible, affordable, and transparent. Every repair we do is 
                    performed with the care and honesty I would want for my own devices.
                  </p>

                  <p>
                    We've helped <strong className="text-foreground">500+ customers</strong> get their 
                    devices working again. From students who needed their laptops fixed before exams, to 
                    businesses that couldn't afford downtime—we've been there for everyone.
                  </p>

                  <p>
                    Today, Technologiya continues to grow, but our mission remains the same: 
                    <strong className="text-foreground"> Fix devices fast, keep prices fair, and earn your trust.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;

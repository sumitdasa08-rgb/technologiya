import { Eye, Shield, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PrivacySection = () => {
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

  const features = [
    {
      icon: Eye,
      title: "Work In Your Presence",
      description: "Every repair is done right in front of you. No hidden processes.",
    },
    {
      icon: Shield,
      title: "Data Protection",
      description: "Your files and personal data remain untouched and secure.",
    },
    {
      icon: Lock,
      title: "No Snooping",
      description: "We never access your personal files without explicit permission.",
    },
  ];

  return (
    <section id="privacy" ref={sectionRef} className="py-24 md:py-32 bg-card relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              Privacy
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-6 tracking-tight font-display">
              Your trust matters.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              We ensure complete transparency in everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`text-center glass-card p-8 rounded-2xl transition-all duration-500 group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-3 font-display text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className={`glass-card p-10 rounded-2xl transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '300ms' }}>
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Our Promise</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                <span className="text-foreground font-medium">"We know your privacy is important."</span> That's why we do everything in front of you. 
                Watch us work, ask questions, and stay informed throughout the entire repair process. 
                Your trust is our top priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;
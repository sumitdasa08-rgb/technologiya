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
    <section id="privacy" ref={sectionRef} className="py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Privacy</span>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mt-4 mb-6 tracking-tight">
              Your trust matters.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
              We ensure complete transparency in everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`text-center p-8 rounded-3xl bg-background border border-border transition-all duration-500 hover:shadow-lg ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-foreground/5 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-light">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className={`p-10 rounded-3xl bg-background border border-border transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '300ms' }}>
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Promise</h3>
              <p className="text-muted-foreground leading-relaxed font-light text-lg">
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

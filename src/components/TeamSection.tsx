import { Users, Zap, Clock, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: Users,
    title: "Expert Technicians",
    description: "Certified professionals with years of experience.",
  },
  {
    icon: Zap,
    title: "Quick Resolution",
    description: "Fast diagnosis and repair without compromising quality.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Reach out anytime for urgent tech emergencies.",
  },
  {
    icon: MessageSquare,
    title: "Clear Communication",
    description: "We explain every step so you understand the process.",
  },
];

const TeamSection = () => {
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
    <section id="team" ref={sectionRef} className="py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Our Team</span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mt-4 mb-6 tracking-tight">
            Built to solve.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
            A dedicated team ready to discuss and resolve your tech issues fast.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`text-center group transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-foreground/5 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-foreground group-hover:scale-110">
                <feature.icon className="w-7 h-7 text-foreground group-hover:text-background transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground font-light">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className={`max-w-3xl mx-auto text-center p-12 rounded-3xl bg-foreground text-background transition-all duration-700 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`} style={{ transitionDelay: '400ms' }}>
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Need Immediate Assistance?
          </h3>
          <p className="text-background/70 mb-8 font-light">
            Our team is just a call away. We provide the best solution within your budget.
          </p>
          <a 
            href="tel:8812910655" 
            className="inline-block bg-background text-foreground px-8 py-4 rounded-full font-medium hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            Call Now: 8812910655
          </a>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

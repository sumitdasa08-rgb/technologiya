import { MessageSquare, Search, Wrench, CheckCircle, Truck, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const processSteps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Contact Us",
    description: "Reach out via WhatsApp, call, or our booking form. Tell us about your device issue.",
  },
  {
    icon: Search,
    number: "02",
    title: "Free Diagnosis",
    description: "We diagnose your device for free and provide an upfront quote with no hidden charges.",
  },
  {
    icon: Wrench,
    number: "03",
    title: "Expert Repair",
    description: "Our certified technicians fix your device right in front of you for complete transparency.",
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Quality Check",
    description: "Every repair undergoes thorough testing to ensure everything works perfectly.",
  },
  {
    icon: Truck,
    number: "05",
    title: "Fast Delivery",
    description: "Most repairs completed same-day. We get your device back to you as quickly as possible.",
  },
  {
    icon: ThumbsUp,
    number: "06",
    title: "Warranty & Support",
    description: "All repairs come with warranty. We're here for ongoing support whenever you need it.",
  },
];

const ProcessSection = () => {
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
    <section id="process" ref={sectionRef} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            Our Process
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight font-display">
            From broken to fixed, here's how we do it.
          </h2>
        </div>

        {/* Process grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {processSteps.map((step, index) => (
            <div
              key={index}
              className={`group glass-card p-8 rounded-2xl relative transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Step number */}
              <span className="absolute top-6 right-6 text-6xl font-bold text-muted-foreground/10 font-display">
                {step.number}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-primary group-hover:scale-110">
                <step.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-foreground mb-3 font-display">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

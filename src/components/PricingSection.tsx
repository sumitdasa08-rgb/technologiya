import { Check, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const pricingTiers = [
  {
    name: "Basic",
    subtitle: "Quick Fixes",
    price: "₹100",
    period: "starting at",
    features: [
      "Windows OS Upgrade",
      "Basic Software Installation",
      "System Cleanup",
      "Driver Updates",
      "Same-day Service",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Standard",
    subtitle: "Most Popular",
    price: "₹250",
    period: "starting at",
    features: [
      "Everything in Basic",
      "Software Troubleshooting",
      "MS Office Setup",
      "Performance Optimization",
      "Priority Support",
      "30-day Warranty",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Premium",
    subtitle: "Full Service",
    price: "₹350",
    period: "starting at",
    features: [
      "Everything in Standard",
      "Virus & Malware Removal",
      "Data Recovery",
      "Hardware Diagnostics",
      "On-site Support",
      "90-day Warranty",
      "24/7 Phone Support",
    ],
    cta: "Get Started",
    popular: false,
  },
];

const comparisonFeatures = [
  { feature: "Free Diagnosis", basic: true, standard: true, premium: true },
  { feature: "Windows Installation", basic: true, standard: true, premium: true },
  { feature: "Software Troubleshooting", basic: false, standard: true, premium: true },
  { feature: "Virus Removal", basic: false, standard: false, premium: true },
  { feature: "Data Recovery", basic: false, standard: false, premium: true },
  { feature: "Hardware Repair", basic: false, standard: false, premium: true },
  { feature: "On-site Support", basic: false, standard: false, premium: true },
  { feature: "Priority Queue", basic: false, standard: true, premium: true },
  { feature: "Warranty", basic: "7 days", standard: "30 days", premium: "90 days" },
];

const PricingSection = () => {
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

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" ref={sectionRef} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight font-display">
            Choose Your Service Plan
          </h2>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-16">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative glass-card p-8 rounded-2xl transition-all duration-500 ${
                tier.popular ? 'border-primary/50 shadow-lg shadow-primary/10' : ''
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground font-display">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tier.subtitle}</p>
                <div className="mt-6">
                  <span className="text-4xl md:text-5xl font-bold text-foreground font-display">{tier.price}</span>
                  <span className="text-muted-foreground ml-2">{tier.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={scrollToBooking}
                className={`w-full rounded-xl py-6 font-medium transition-all duration-300 hover:scale-105 ${
                  tier.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {tier.cta}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Comparison table - Desktop */}
        <div className={`hidden lg:block max-w-4xl mx-auto transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '400ms' }}>
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-6 text-foreground font-semibold">Features</th>
                  <th className="text-center p-6 text-foreground font-semibold">Basic</th>
                  <th className="text-center p-6 text-foreground font-semibold bg-primary/5">Standard</th>
                  <th className="text-center p-6 text-foreground font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, index) => (
                  <tr key={index} className="border-b border-border/50 last:border-0">
                    <td className="p-4 text-muted-foreground">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.basic === 'boolean' ? (
                        row.basic ? (
                          <Check className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">{row.basic}</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      {typeof row.standard === 'boolean' ? (
                        row.standard ? (
                          <Check className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">{row.standard}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <Check className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

import { Check, ArrowRight, Shield } from "lucide-react";
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

const PricingCard = ({ tier, index, isVisible, onBook }: {
  tier: typeof pricingTiers[0];
  index: number;
  isVisible: boolean;
  onBook: () => void;
}) => (
  <div
    className={`group relative rounded-2xl transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}
    style={{ transitionDelay: `${index * 120}ms` }}
  >
    {/* Popular glow */}
    {tier.popular && (
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/30 via-primary/10 to-transparent opacity-100" />
    )}

    <div className={`relative h-full rounded-2xl border bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 ${
      tier.popular
        ? 'border-primary/30 shadow-lg shadow-primary/5'
        : 'border-border/20 hover:border-border/40'
    }`}>
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">
            <Shield className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-medium text-primary tracking-widest uppercase mb-2">{tier.subtitle}</p>
        <h3 className="text-2xl font-bold text-foreground font-display">{tier.name}</h3>
        <div className="mt-6 flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-foreground font-display tracking-tight">{tier.price}</span>
          <span className="text-sm text-muted-foreground">{tier.period}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent mb-8" />

      {/* Features */}
      <ul className="space-y-4 mb-10">
        {tier.features.map((feature, fIndex) => (
          <li key={fIndex} className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={onBook}
        className={`w-full rounded-xl py-6 font-medium transition-all duration-300 group-hover:scale-[1.02] ${
          tier.popular
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
            : 'bg-secondary/80 text-foreground hover:bg-secondary'
        }`}
      >
        {tier.cta}
        <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Button>
    </div>
  </div>
);

const ComparisonTable = ({ isVisible }: { isVisible: boolean }) => (
  <div className={`hidden lg:block max-w-4xl mx-auto transition-all duration-700 ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
  }`} style={{ transitionDelay: '500ms' }}>
    <div className="rounded-2xl border border-border/20 bg-card/50 backdrop-blur-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/30">
            <th className="text-left p-5 text-sm text-foreground font-semibold">Features</th>
            <th className="text-center p-5 text-sm text-foreground font-semibold">Basic</th>
            <th className="text-center p-5 text-sm text-foreground font-semibold bg-primary/5 border-x border-primary/10">Standard</th>
            <th className="text-center p-5 text-sm text-foreground font-semibold">Premium</th>
          </tr>
        </thead>
        <tbody>
          {comparisonFeatures.map((row, index) => (
            <tr key={index} className="border-b border-border/10 last:border-0 transition-colors hover:bg-secondary/30">
              <td className="p-4 text-sm text-muted-foreground">{row.feature}</td>
              <td className="p-4 text-center">
                {typeof row.basic === 'boolean' ? (
                  row.basic ? (
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                  ) : (
                    <span className="text-muted-foreground/30">—</span>
                  )
                ) : (
                  <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">{row.basic}</span>
                )}
              </td>
              <td className="p-4 text-center bg-primary/5 border-x border-primary/10">
                {typeof row.standard === 'boolean' ? (
                  row.standard ? (
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                  ) : (
                    <span className="text-muted-foreground/30">—</span>
                  )
                ) : (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{row.standard}</span>
                )}
              </td>
              <td className="p-4 text-center">
                {typeof row.premium === 'boolean' ? (
                  row.premium ? (
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                  ) : (
                    <span className="text-muted-foreground/30">—</span>
                  )
                ) : (
                  <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">{row.premium}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PricingSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToBooking = () => {
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" ref={sectionRef} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle background dot grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight font-display mb-4">
            Choose Your Service Plan
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Transparent pricing with no hidden fees. Every plan includes free diagnosis.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-20">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={index} tier={tier} index={index} isVisible={isVisible} onBook={scrollToBooking} />
          ))}
        </div>

        {/* Comparison */}
        <ComparisonTable isVisible={isVisible} />
      </div>
    </section>
  );
};

export default PricingSection;

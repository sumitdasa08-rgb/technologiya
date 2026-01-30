import { useEffect, useRef, useState } from "react";
import { Linkedin, Twitter, Mail } from "lucide-react";

const teamMembers = [
  {
    name: "Founder",
    role: "Lead Technician & CEO",
    initial: "T",
    description: "10+ years fixing devices. Built Technologiya from the ground up.",
    color: "from-primary to-primary/50",
  },
  {
    name: "Hardware Expert",
    role: "Component Specialist",
    initial: "H",
    description: "Motherboard repairs, soldering, component-level diagnostics.",
    color: "from-purple-500 to-purple-500/50",
  },
  {
    name: "Software Lead",
    role: "OS & Recovery Expert",
    initial: "S",
    description: "Windows, Linux, macOS. Data recovery and virus removal.",
    color: "from-blue-500 to-blue-500/50",
  },
  {
    name: "Mobile Tech",
    role: "Phone & Tablet Repair",
    initial: "M",
    description: "Screen replacements, battery swaps, water damage recovery.",
    color: "from-green-500 to-green-500/50",
  },
];

const TeamGridSection = () => {
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
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            Our Team
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight font-display italic">
            Meet the experts behind every fix.
          </h2>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className={`group relative transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Card */}
              <div className="glass-card p-6 md:p-8 rounded-2xl h-full relative overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Avatar */}
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <span className="text-3xl md:text-4xl font-bold text-white font-display">
                    {member.initial}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-xl font-semibold text-foreground mb-1 font-display">
                  {member.name}
                </h3>
                <p className="text-sm text-primary mb-4">
                  {member.role}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {member.description}
                </p>

                {/* Social icons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-border/30">
                  <button className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`mt-16 text-center transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '500ms' }}>
          <p className="text-lg text-muted-foreground mb-4">
            We're always looking for talented technicians to join our team.
          </p>
          <a 
            href="mailto:technologiya.official@gmail.com?subject=Career Inquiry"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            <Mail className="w-4 h-4" />
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
};

export default TeamGridSection;

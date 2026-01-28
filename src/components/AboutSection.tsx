import { Shield, Award, Clock, Users, CheckCircle, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const AboutSection = () => {
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

  const trustPoints = [
    {
      icon: Shield,
      title: "Trusted by 500+ Customers",
      description: "Technologiya has successfully repaired over 500 devices across India with a 100% satisfaction rate."
    },
    {
      icon: Award,
      title: "Certified Technicians",
      description: "Our Technologiya experts are trained and certified in computer repair, laptop troubleshooting, and mobile device solutions."
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Most Technologiya computer solutions and device repairs are completed within 24 hours."
    },
    {
      icon: Users,
      title: "Dedicated IT Support",
      description: "Technologiya provides personalized technical service for individuals, students, and small businesses."
    }
  ];

  const services = [
    "Computer & laptop repair",
    "Device troubleshooting (hardware & software)",
    "Windows & software installation",
    "Virus removal & system optimization",
    "Data recovery & backup solutions",
    "Remote & on-site technical support",
    "Affordable IT solutions for businesses"
  ];

  return (
    <section 
      id="about" 
      ref={sectionRef} 
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ease-apple ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">About Us</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6 tracking-tight">
            About Technologiya
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Technologiya is India's trusted device and computer solution platform, dedicated to providing affordable, reliable, and professional tech repair services.
          </p>
        </div>

        {/* Main Content */}
        <div className={`grid lg:grid-cols-2 gap-12 mb-16 transition-all duration-700 ease-apple ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
          
          {/* Left Column - Story */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">
              Who We Are – Technologiya Computer Solution
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Founded with a mission to make technology accessible and hassle-free, <strong>Technologiya</strong> has grown into a trusted name for computer repair, laptop repair, and device troubleshooting services across India. We understand how frustrating tech problems can be – a slow computer, a cracked phone screen, or a virus-infected system can disrupt your entire day.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              That's where <strong>Technologiya technical service</strong> comes in. Our team of certified technicians specializes in diagnosing and fixing a wide range of issues, from Windows installation and software fixes to hardware repairs and data recovery. Whether you're a student needing your laptop fixed before an exam, a professional dealing with a work emergency, or a small business looking for reliable IT support – Technologiya has your back.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              At <strong>Technologiya</strong>, we believe in transparent pricing, fast turnaround times, and honest communication. We never overcharge or recommend unnecessary repairs. Our goal is simple: get your device working perfectly and get you back to what matters most.
            </p>

            {/* Services List */}
            <div className="pt-4">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Technologiya Services Include:
              </h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Trust Points */}
          <div className="grid sm:grid-cols-2 gap-6">
            {trustPoints.map((point, index) => (
              <div 
                key={index}
                className={`glass-card p-6 rounded-2xl transition-all duration-500 ease-apple hover-lift ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4">
                  <point.icon className="w-6 h-6 text-foreground" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {point.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Technologiya */}
        <div className={`glass-card p-8 md:p-12 rounded-3xl transition-all duration-700 ease-apple ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-2xl bg-foreground flex items-center justify-center flex-shrink-0">
              <Wrench className="w-10 h-10 text-background" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                Why Choose Technologiya?
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                When you choose <strong>Technologiya</strong>, you're choosing a partner who genuinely cares about solving your tech problems. We combine expertise with affordability, offering premium computer solutions and device repair services at prices that won't break the bank. With same-day service availability, transparent quotes, and a commitment to excellence, Technologiya is the smart choice for all your technology needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

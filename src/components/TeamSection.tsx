import { Users, Zap, Clock, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Expert Technicians",
    description: "Our team consists of certified professionals with years of experience in tech repair.",
  },
  {
    icon: Zap,
    title: "Quick Resolution",
    description: "We diagnose and resolve issues as fast as possible without compromising quality.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Got an urgent issue? Reach out anytime and we'll be there to help.",
  },
  {
    icon: MessageSquare,
    title: "Clear Communication",
    description: "We explain every step of the repair process so you're never left in the dark.",
  },
];

const TeamSection = () => {
  return (
    <section id="team" className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Our Team</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Dedicated to Solving Your Tech Problems
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A passionate team ready to discuss, diagnose, and resolve your tech issues as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Need Immediate Assistance?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Our team is just a call away. We discuss your issues thoroughly and provide the best possible solution within your budget.
          </p>
          <a 
            href="tel:8812910655" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Call Us: 8812910655
          </a>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

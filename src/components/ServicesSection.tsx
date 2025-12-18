import { Monitor, FileText, Smartphone, Volume2, HardDrive, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Monitor,
    title: "Windows OS Upgrade",
    description: "Upgrade to the latest Windows version for enhanced security and performance.",
    price: "₹250",
  },
  {
    icon: Settings,
    title: "OS Changes & Updates",
    description: "System updates, driver installations, and performance optimization.",
    price: "₹300",
  },
  {
    icon: FileText,
    title: "Microsoft Office Installation",
    description: "Complete MS Office suite installation with activation.",
    price: "₹350",
  },
  {
    icon: HardDrive,
    title: "Storage Troubleshooting",
    description: "Mobile storage issues, cleanup, and data management solutions.",
    price: "₹250",
  },
  {
    icon: Smartphone,
    title: "Software Issues",
    description: "Fix app crashes, system errors, and performance problems.",
    price: "₹300",
  },
  {
    icon: Volume2,
    title: "Sound Related Issues",
    description: "Audio driver fixes, speaker problems, and sound optimization.",
    price: "₹250",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">What We Offer</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Premium Tech Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From Windows upgrades to mobile fixes, we've got all your tech needs covered with transparent pricing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10"
            >
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {service.price}
                  </span>
                  <span className="text-xs text-muted-foreground">Starting price</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

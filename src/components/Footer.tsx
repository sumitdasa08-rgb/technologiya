import { Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
              <span className="text-foreground font-bold text-lg">TF</span>
            </div>
            <div>
              <span className="text-xl font-semibold">TechFix Pro</span>
              <p className="text-xs text-background/60 mt-1">Your Tech in a Wreck? We Fix it in a Sec!</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {["Services", "Reviews", "Team", "Privacy", "Contact"].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-background/60 hover:text-background transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <a 
            href="tel:8812910655"
            className="flex items-center gap-2 bg-background text-foreground px-5 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <Phone className="w-4 h-4" />
            <span>8812910655</span>
          </a>
        </div>

        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/40">
          <p>© 2024 TechFix Pro. All rights reserved.</p>
          <p>Designed with precision for better tech support.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Phone, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">TF</span>
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">TechFix Pro</span>
              <p className="text-xs text-muted-foreground">Your Tech in a Wreck? We Fix it in a Sec!</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/30">
            <Phone className="w-4 h-4 text-primary" />
            <a href="tel:8812910655" className="text-foreground font-medium hover:text-primary transition-colors">
              8812910655
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2024 TechFix Pro. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> for better tech support
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

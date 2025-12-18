import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">TF</span>
          </div>
          <span className="text-xl font-bold text-foreground">TechFix Pro</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
          <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
          <a href="#team" className="text-muted-foreground hover:text-foreground transition-colors">Team</a>
          <a href="#privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/30">
          <Phone className="w-4 h-4 text-primary" />
          <span className="text-foreground font-medium">8812910655</span>
        </div>

        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card border-t border-border p-4 space-y-4">
          <a href="#services" className="block text-muted-foreground hover:text-foreground transition-colors">Services</a>
          <a href="#testimonials" className="block text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
          <a href="#team" className="block text-muted-foreground hover:text-foreground transition-colors">Team</a>
          <a href="#privacy" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
          <a href="#contact" className="block text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          <div className="flex items-center gap-2 text-primary">
            <Phone className="w-4 h-4" />
            <span className="font-medium">8812910655</span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

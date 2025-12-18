import { Phone, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-background font-bold text-lg">TF</span>
          </div>
          <span className="text-xl font-semibold text-foreground hidden sm:block">TechFix Pro</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {["Services", "Reviews", "Team", "Privacy", "Contact"].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <a 
          href="tel:8812910655"
          className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
        >
          <Phone className="w-4 h-4" />
          <span>8812910655</span>
        </a>

        <button 
          className="md:hidden text-foreground p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-background border-b border-border transition-all duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}>
        <div className="container mx-auto px-4 py-6 space-y-4">
          {["Services", "Reviews", "Team", "Privacy", "Contact"].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`}
              className="block text-lg text-foreground hover:opacity-70 transition-opacity"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="pt-4 border-t border-border flex items-center gap-2 text-foreground">
            <Phone className="w-4 h-4" />
            <span className="font-medium">8812910655</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

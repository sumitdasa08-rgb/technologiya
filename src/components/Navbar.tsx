import { Phone, Menu, X, Package, Newspaper } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-apple ${
      scrolled ? "glass border-b border-border/50" : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-background font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-semibold text-foreground hidden sm:block">Technologiya</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {["Services", "Reviews", "Team", "Privacy", "Booking"].map((item) => (
            <a 
              key={item}
              href={`/#${item.toLowerCase()}`} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <Link 
            to="/track"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
          >
            <Package className="w-4 h-4" />
            Track Repair
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link 
            to="/blog"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
          >
            <Newspaper className="w-4 h-4" />
            Blog
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        <a 
          href="tel:+913613597940"
          className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
        >
          <Phone className="w-4 h-4" />
          <span>+91 361 359 7940</span>
        </a>

        <div ref={menuRef} className="md:hidden">
          <button 
            className="text-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 glass border-b border-border/50 transition-all duration-500 ease-apple ${
        isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
      }`}>
        <div className="container mx-auto px-4 py-6 space-y-4">
          {["Services", "Reviews", "Team", "Privacy", "Booking"].map((item) => (
            <a 
              key={item}
              href={`/#${item.toLowerCase()}`}
              className="block text-lg text-foreground hover:opacity-70 transition-opacity"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </a>
          ))}
          <Link 
            to="/track"
            className="flex items-center gap-2 text-lg text-foreground hover:opacity-70 transition-opacity"
            onClick={() => setIsOpen(false)}
          >
            <Package className="w-5 h-5" />
            Track Repair
          </Link>
          <Link 
            to="/blog"
            className="flex items-center gap-2 text-lg text-foreground hover:opacity-70 transition-opacity"
            onClick={() => setIsOpen(false)}
          >
            <Newspaper className="w-5 h-5" />
            Blog
          </Link>
          <a href="tel:+913613597940" className="pt-4 border-t border-border flex items-center gap-2 text-foreground">
            <Phone className="w-4 h-4" />
            <span className="font-medium">+91 361 359 7940</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

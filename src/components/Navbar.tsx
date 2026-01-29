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

  const navItems = [
    { name: "Home", href: "/#" },
    { name: "About Us", href: "/#about" },
    { name: "Services", href: "/#services" },
    { name: "Pricing", href: "/#pricing" },
  ];

  return (
    <nav className={`fixed top-2 md:top-3 lg:top-4 left-2 md:left-3 lg:left-4 right-2 md:right-3 lg:right-4 z-50 transition-all duration-500 ease-apple`}>
      {/* Inner container with border - engine.fm style */}
      <div className={`rounded-lg border transition-all duration-500 ${
        scrolled 
          ? "bg-background/90 backdrop-blur-xl border-border/50" 
          : "bg-transparent border-transparent"
      }`}>
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group z-10">
            <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary/50">
              <span className="text-foreground font-bold text-lg font-display">T</span>
            </div>
          </a>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-8 lg:gap-10">
            {navItems.map((item) => (
              <a 
                key={item.name}
                href={item.href} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium tracking-wide"
              >
                {item.name}
              </a>
            ))}
            <Link 
              to="/track"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium tracking-wide"
            >
              Track Repair
            </Link>
            <Link 
              to="/blog"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium tracking-wide"
            >
              Blog
            </Link>
          </div>

          {/* Get Started Button */}
          <a 
            href="/#booking"
            className="hidden md:flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-lg transition-all duration-300 hover:bg-primary/90"
          >
            Get Started
          </a>

          {/* Mobile menu button */}
          <div ref={menuRef} className="md:hidden">
            <button 
              className="text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Technologiya navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-lg transition-all duration-500 ease-apple ${
        isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"
      }`}>
        <div className="px-4 py-6 space-y-4">
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.href}
              className="block text-lg text-foreground hover:text-primary transition-colors py-2 font-medium"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <Link 
            to="/track"
            className="flex items-center gap-2 text-lg text-foreground hover:text-primary transition-colors py-2 font-medium"
            onClick={() => setIsOpen(false)}
          >
            <Package className="w-5 h-5" />
            Track Repair
          </Link>
          <Link 
            to="/blog"
            className="flex items-center gap-2 text-lg text-foreground hover:text-primary transition-colors py-2 font-medium"
            onClick={() => setIsOpen(false)}
          >
            <Newspaper className="w-5 h-5" />
            Blog
          </Link>
          <div className="pt-4 border-t border-border">
            <a 
              href="/#booking" 
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </a>
            <a href="tel:+918812910655" className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
              <Phone className="w-4 h-4 text-primary" />
              <span className="font-medium">+91 88129 10655</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-apple ${
      scrolled 
        ? "bg-background/80 backdrop-blur-glass border-b border-border/50 py-3" 
        : "bg-transparent py-5"
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-semibold text-foreground hidden sm:block font-display">Technologiya</span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.href} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <Link 
            to="/track"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
          >
            <Package className="w-4 h-4" />
            Track Repair
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link 
            to="/blog"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
          >
            <Newspaper className="w-4 h-4" />
            Blog
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        {/* Get Started Button */}
        <a 
          href="/#booking"
          className="hidden md:flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
        >
          Get Started
        </a>

        {/* Mobile menu button */}
        <div ref={menuRef} className="md:hidden">
          <button 
            className="text-foreground p-2 rounded-xl hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Technologiya navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-glass border-b border-border/50 transition-all duration-500 ease-apple ${
        isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"
      }`}>
        <div className="container mx-auto px-4 py-6 space-y-4">
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.href}
              className="block text-lg text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <Link 
            to="/track"
            className="flex items-center gap-2 text-lg text-foreground hover:text-primary transition-colors py-2"
            onClick={() => setIsOpen(false)}
          >
            <Package className="w-5 h-5" />
            Track Repair
          </Link>
          <Link 
            to="/blog"
            className="flex items-center gap-2 text-lg text-foreground hover:text-primary transition-colors py-2"
            onClick={() => setIsOpen(false)}
          >
            <Newspaper className="w-5 h-5" />
            Blog
          </Link>
          <div className="pt-4 border-t border-border">
            <a 
              href="/#booking" 
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium"
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

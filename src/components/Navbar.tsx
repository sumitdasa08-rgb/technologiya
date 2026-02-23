import { Phone, Menu, X, Package, Newspaper } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
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
      document.addEventListener('touchend', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [isOpen]);

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Force full page reload to trigger loading screen
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
    // If on another page, normal navigation will remount Index
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/#about" },
    { name: "Services", href: "/#services" },
  ];

  return (
    <nav className="fixed top-2 md:top-3 lg:top-4 left-2 md:left-3 lg:left-4 right-2 md:right-3 lg:right-4 z-[60]">
      <div className={`rounded-xl border transition-colors duration-300 ${
        scrolled 
          ? "bg-card/95 md:bg-card/90 md:backdrop-blur-xl border-border/30" 
          : "bg-transparent border-transparent"
      }`}>
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
          <a href="/" onClick={handleHomeClick} className="flex items-center gap-3 group z-10">
            <div className="w-10 h-10 rounded-xl bg-card border border-border/30 flex items-center justify-center transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
              <span className="text-foreground font-bold text-lg font-display">T</span>
            </div>
          </a>

          <div className="hidden md:flex items-center justify-center flex-1 gap-8 lg:gap-10">
            {navItems.map((item) => (
              <a 
                key={item.name} 
                href={item.href} 
                onClick={item.name === 'Home' ? handleHomeClick : undefined}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium tracking-wide"
              >
                {item.name}
              </a>
            ))}
            <Link to="/track" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium tracking-wide">
              Track Repair
            </Link>
            <Link to="/blog" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium tracking-wide">
              Blog
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <a href="/#booking" className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-lg transition-colors duration-300 hover:bg-primary/90">
              Book now
            </a>
          </div>

          <div ref={menuRef} className="md:hidden relative z-[60]">
            <button 
              className="text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Technologiya navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Menu - fixed position for reliable touch handling */}
            {isOpen && (
              <div 
                className="fixed left-2 right-2 bg-card border border-border/30 rounded-xl z-[70]"
                style={{ top: '70px' }}
              >
                <div className="px-4 py-6 space-y-4">
                  {navItems.map((item) => (
                    <a 
                      key={item.name} 
                      href={item.href} 
                      className="block text-lg text-foreground hover:text-primary transition-colors py-2 font-medium"
                      onClick={(e) => {
                        setIsOpen(false);
                        if (item.name === 'Home') handleHomeClick(e);
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                  <Link to="/track" className="flex items-center gap-2 text-lg text-foreground hover:text-primary transition-colors py-2 font-medium" onClick={() => setIsOpen(false)}>
                    <Package className="w-5 h-5" />
                    Track Repair
                  </Link>
                  <Link to="/blog" className="flex items-center gap-2 text-lg text-foreground hover:text-primary transition-colors py-2 font-medium" onClick={() => setIsOpen(false)}>
                    <Newspaper className="w-5 h-5" />
                    Blog
                  </Link>
                  <div className="pt-4 border-t border-border flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Theme</span>
                      <ThemeToggle />
                    </div>
                    <a href="/#booking" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium" onClick={() => setIsOpen(false)}>
                      Book now
                    </a>
                    <a href="tel:+918812910655" className="flex items-center justify-center gap-2 text-muted-foreground mt-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="font-medium">+91 88129 10655</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

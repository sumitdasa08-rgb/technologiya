import { useEffect, useRef, useState, useCallback } from "react";

const zigzagItems = [
  {
    emoji: "🚀",
    title: "Technologiya",
    subtitle: "Your Tech Bestie",
    description: "We're not just another repair shop — we're your go-to tech squad that actually gets it. Gen Z energy, professional results.",
    color: "from-primary/20 to-primary/5 border-primary/40",
  },
  {
    emoji: "🔧",
    title: "Device Repair",
    subtitle: "Laptops, PCs, Phones",
    description: "Cracked screen? Dead laptop? We fix it all. Hardware or software — bring it in and we'll make it slap again.",
    color: "from-purple-500/20 to-purple-500/5 border-purple-500/40",
  },
  {
    emoji: "⚡",
    title: "24hr Turnaround",
    subtitle: "Speed is our thing",
    description: "We know you can't survive without your device. Most repairs done within 24 hours — no cap.",
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/40",
  },
  {
    emoji: "💯",
    title: "500+ Happy Customers",
    subtitle: "No cap, fr fr",
    description: "Our community trusts us because we deliver results. Check the reviews — people are actually happy.",
    color: "from-green-500/20 to-green-500/5 border-green-500/40",
  },
  {
    emoji: "💸",
    title: "Budget Friendly",
    subtitle: "We don't gatekeep",
    description: "Quality repairs shouldn't cost a kidney. We keep prices real so everyone can afford good tech service.",
    color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/40",
  },
  {
    emoji: "🤝",
    title: "1:1 Support",
    subtitle: "We got you",
    description: "No bots, no hold music. You talk to a real human who actually understands your problem.",
    color: "from-pink-500/20 to-pink-500/5 border-pink-500/40",
  },
  {
    emoji: "🏆",
    title: "Certified Techs",
    subtitle: "Actually know stuff",
    description: "Our team is trained and certified. We don't just YouTube fixes — we actually know what we're doing.",
    color: "from-orange-500/20 to-orange-500/5 border-orange-500/40",
  },
  {
    emoji: "🌐",
    title: "Remote Help",
    subtitle: "Wherever you are",
    description: "Can't come to us? We'll fix it remotely. Software issues, setup, troubleshooting — all from your couch.",
    color: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/40",
  },
];

const serviceChips = [
  { text: "Windows Install", emoji: "💻" },
  { text: "Virus Removal", emoji: "🦠" },
  { text: "Data Recovery", emoji: "💾" },
  { text: "Hardware Fix", emoji: "🔩" },
  { text: "Software Debug", emoji: "🐛" },
  { text: "Speed Boost", emoji: "🚀" },
  { text: "Screen Repair", emoji: "📱" },
];

const HorizontalCard = ({
  item,
  index,
  isVisible,
}: {
  item: (typeof zigzagItems)[0];
  index: number;
  isVisible: boolean;
}) => {
  return (
    <div
      className={`relative flex-shrink-0 w-[280px] md:w-[320px] group cursor-pointer transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        className={`relative rounded-2xl border-2 bg-gradient-to-br ${item.color} p-6 shadow-lg md:group-hover:shadow-2xl md:group-hover:-translate-y-3 md:group-hover:scale-[1.03] transition-transform duration-300 h-full`}
      >
        {/* Number badge */}
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-4xl md:text-5xl">{item.emoji}</span>
          <div>
            <h3 className="text-lg font-bold text-foreground leading-tight">
              {item.title}
            </h3>
            <span className="text-sm text-primary font-medium">
              {item.subtitle}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Bottom progress line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/60 to-primary/20"
            style={{ width: `${((index + 1) / zigzagItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Connector line between cards */}
      {index < zigzagItems.length - 1 && (
        <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/30 to-transparent hidden md:block" />
      )}
    </div>
  );
};

const AboutSection = () => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const headerObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeaderVisible(true);
      },
      { threshold: 0.1 }
    );
    const cardsObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCardsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) headerObs.observe(headerRef.current);
    if (cardsRef.current) cardsObs.observe(cardsRef.current);
    return () => {
      headerObs.disconnect();
      cardsObs.disconnect();
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft: sl, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setScrollProgress(maxScroll > 0 ? sl / maxScroll : 0);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <section id="about" className="py-16 md:py-24 bg-card relative overflow-hidden">
      {/* Static background grid - no animation */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-10 md:mb-14 transition-opacity duration-500 ${
            headerVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            ✨ About Us ✨
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-4 tracking-tight font-display">
            the <span className="gradient-text">lowdown</span> on us 🧠
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            here's everything you need to know about technologiya{" "}
            <span className="text-primary">no cap</span> ⬇️
          </p>
        </div>

        {/* Scroll hint */}
        <div
          className={`flex items-center justify-center gap-2 mb-6 transition-opacity duration-500 ${
            cardsVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">
            Swipe to explore
          </span>
          <span className="inline-block text-primary">→</span>
        </div>

        {/* Horizontal scroll container */}
        <div ref={cardsRef} className="relative">
          <div
            ref={scrollContainerRef}
            className={`flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="flex-shrink-0 w-2 md:w-8" />
            {zigzagItems.map((item, index) => (
              <div key={item.title} className="snap-start">
                <HorizontalCard item={item} index={index} isVisible={cardsVisible} />
              </div>
            ))}
            <div className="flex-shrink-0 w-2 md:w-8" />
          </div>

          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {/* Scroll progress bar */}
          <div className="mt-4 mx-auto max-w-xs h-1 rounded-full bg-border/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
              style={{ width: `${Math.max(10, scrollProgress * 100)}%` }}
            />
          </div>

          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-card to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card to-transparent z-10" />
        </div>

        {/* Service chips */}
        <div
          className={`flex flex-wrap justify-center gap-3 mt-12 transition-opacity duration-500 ${
            headerVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {serviceChips.map((chip) => (
            <span
              key={chip.text}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border/30 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors duration-300 cursor-default"
            >
              <span>{chip.emoji}</span>
              <span>{chip.text}</span>
            </span>
          ))}
        </div>

        {/* Bottom tagline */}
        <div
          className={`text-center mt-10 transition-opacity duration-500 ${
            headerVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-lg md:text-xl text-muted-foreground">
            <span className="text-foreground font-semibold">tldr;</span> we fix
            your tech fast, cheap, and right 👊
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            (and we're actually nice about it)
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

import { useEffect, useRef, useState } from "react";

const zigzagItems = [
  {
    emoji: "🚀",
    title: "Technologiya",
    subtitle: "Your Tech Bestie",
    description: "We're not just another repair shop — we're your go-to tech squad that actually gets it. Gen Z energy, professional results.",
    color: "from-primary/20 to-primary/5 border-primary/40",
    glowColor: "bg-primary/20",
  },
  {
    emoji: "🔧",
    title: "Device Repair",
    subtitle: "Laptops, PCs, Phones",
    description: "Cracked screen? Dead laptop? We fix it all. Hardware or software — bring it in and we'll make it slap again.",
    color: "from-purple-500/20 to-purple-500/5 border-purple-500/40",
    glowColor: "bg-purple-500/20",
  },
  {
    emoji: "⚡",
    title: "24hr Turnaround",
    subtitle: "Speed is our thing",
    description: "We know you can't survive without your device. Most repairs done within 24 hours — no cap.",
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/40",
    glowColor: "bg-blue-500/20",
  },
  {
    emoji: "💯",
    title: "500+ Happy Customers",
    subtitle: "No cap, fr fr",
    description: "Our community trusts us because we deliver results. Check the reviews — people are actually happy.",
    color: "from-green-500/20 to-green-500/5 border-green-500/40",
    glowColor: "bg-green-500/20",
  },
  {
    emoji: "💸",
    title: "Budget Friendly",
    subtitle: "We don't gatekeep",
    description: "Quality repairs shouldn't cost a kidney. We keep prices real so everyone can afford good tech service.",
    color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/40",
    glowColor: "bg-yellow-500/20",
  },
  {
    emoji: "🤝",
    title: "1:1 Support",
    subtitle: "We got you",
    description: "No bots, no hold music. You talk to a real human who actually understands your problem.",
    color: "from-pink-500/20 to-pink-500/5 border-pink-500/40",
    glowColor: "bg-pink-500/20",
  },
  {
    emoji: "🏆",
    title: "Certified Techs",
    subtitle: "Actually know stuff",
    description: "Our team is trained and certified. We don't just YouTube fixes — we actually know what we're doing.",
    color: "from-orange-500/20 to-orange-500/5 border-orange-500/40",
    glowColor: "bg-orange-500/20",
  },
  {
    emoji: "🌐",
    title: "Remote Help",
    subtitle: "Wherever you are",
    description: "Can't come to us? We'll fix it remotely. Software issues, setup, troubleshooting — all from your couch.",
    color: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/40",
    glowColor: "bg-cyan-500/20",
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

const ZigzagCard = ({
  item,
  index,
  isLeft,
}: {
  item: (typeof zigzagItems)[0];
  index: number;
  isLeft: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`flex items-center w-full gap-4 md:gap-8 transition-all duration-700 ${
        visible
          ? "opacity-100 translate-x-0"
          : isLeft
          ? "opacity-0 -translate-x-16"
          : "opacity-0 translate-x-16"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Left spacer on right-aligned cards */}
      {!isLeft && <div className="hidden md:block md:w-1/2" />}

      {/* Card */}
      <div
        className={`relative w-full md:w-1/2 group cursor-pointer ${
          isLeft ? "md:pr-12" : "md:pl-12"
        }`}
      >
        <div
          className={`relative rounded-2xl border-2 bg-gradient-to-br ${item.color} backdrop-blur-sm p-6 md:p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]`}
        >
          {/* Roadmap dot on the timeline */}
          <div
            className={`hidden md:flex absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/40 z-20 ${
              isLeft ? "-right-[2.1rem]" : "-left-[2.1rem]"
            }`}
          />

          {/* Connector line from card to dot */}
          <div
            className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-0.5 w-6 bg-gradient-to-r from-primary/60 to-primary/20 ${
              isLeft ? "-right-6" : "-left-6"
            }`}
          />

          <div className="flex items-start gap-4">
            <span className="text-4xl md:text-5xl flex-shrink-0 mt-1">
              {item.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                {item.title}
              </h3>
              <span className="text-sm text-primary font-medium">
                {item.subtitle}
              </span>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          {/* Hover glow */}
          <div
            className={`absolute inset-0 rounded-2xl ${item.glowColor} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
          />
        </div>
      </div>

      {/* Right spacer on left-aligned cards */}
      {isLeft && <div className="hidden md:block md:w-1/2" />}
    </div>
  );
};

const AboutSection = () => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeaderVisible(true);
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="py-24 md:py-32 bg-card relative overflow-hidden"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div
        className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-soft"
        style={{ animationDelay: "1s" }}
      />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 md:mb-24 transition-all duration-700 ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
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

        {/* Zig-Zag Road */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central road line (desktop) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/10 via-primary/30 to-primary/10 rounded-full" />

          {/* Animated road dashes (desktop) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 overflow-hidden rounded-full">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, hsl(var(--primary)) 0px, hsl(var(--primary)) 12px, transparent 12px, transparent 28px)`,
                animation: "roadScroll 2s linear infinite",
              }}
            />
          </div>

          {/* Mobile road line */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/10 via-primary/30 to-primary/10 rounded-full" />

          {/* Cards */}
          <div className="flex flex-col gap-8 md:gap-12 relative">
            {zigzagItems.map((item, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div key={item.title} className="relative">
                  {/* Mobile dot */}
                  <div className="md:hidden absolute left-[1.15rem] top-8 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/40 z-20" />

                  {/* Mobile card wrapper with left padding */}
                  <div className="md:hidden pl-14">
                    <div
                      className={`relative rounded-2xl border-2 bg-gradient-to-br ${item.color} backdrop-blur-sm p-5 shadow-lg`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl flex-shrink-0 mt-1">
                          {item.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-foreground leading-tight">
                            {item.title}
                          </h3>
                          <span className="text-xs text-primary font-medium">
                            {item.subtitle}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop zig-zag card */}
                  <div className="hidden md:block">
                    <ZigzagCard
                      item={item}
                      index={index}
                      isLeft={isLeft}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Road start indicator */}
          <div className="hidden md:flex absolute -top-4 left-1/2 -translate-x-1/2 items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>
          </div>

          {/* Road end indicator */}
          <div className="hidden md:flex absolute -bottom-4 left-1/2 -translate-x-1/2 items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* Service chips */}
        <div
          className={`flex flex-wrap justify-center gap-3 mt-16 transition-all duration-700 ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          {serviceChips.map((chip) => (
            <span
              key={chip.text}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border/30 backdrop-blur-sm text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-300 hover:scale-105 cursor-default"
            >
              <span>{chip.emoji}</span>
              <span>{chip.text}</span>
            </span>
          ))}
        </div>

        {/* Bottom tagline */}
        <div
          className={`text-center mt-12 transition-all duration-700 ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <p className="text-lg md:text-xl text-muted-foreground">
            <span className="text-foreground font-semibold">tldr;</span> we fix
            your tech fast, cheap, and right
            <span className="inline-block ml-2 animate-bounce">👊</span>
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            (and we're actually nice about it)
          </p>
        </div>
      </div>

      {/* Road scroll animation */}
      <style>{`
        @keyframes roadScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(28px); }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;

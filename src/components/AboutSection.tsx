import { useEffect, useRef, useState } from "react";

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Mind map nodes data
  const mindMapNodes = [
    {
      id: "center",
      emoji: "🚀",
      title: "Technologiya",
      subtitle: "Your Tech Bestie",
      position: "center",
      size: "large",
      color: "primary"
    },
    {
      id: "repair",
      emoji: "🔧",
      title: "Device Repair",
      subtitle: "Laptops, PCs, Phones",
      position: "top-left",
      size: "medium",
      color: "purple"
    },
    {
      id: "fast",
      emoji: "⚡",
      title: "24hr Turnaround",
      subtitle: "Speed is our thing",
      position: "top-right",
      size: "medium",
      color: "blue"
    },
    {
      id: "trusted",
      emoji: "💯",
      title: "500+ Happy Customers",
      subtitle: "No cap, fr fr",
      position: "right",
      size: "medium",
      color: "green"
    },
    {
      id: "affordable",
      emoji: "💸",
      title: "Budget Friendly",
      subtitle: "We don't gatekeep",
      position: "bottom-right",
      size: "medium",
      color: "yellow"
    },
    {
      id: "support",
      emoji: "🤝",
      title: "1:1 Support",
      subtitle: "We got you",
      position: "bottom",
      size: "medium",
      color: "pink"
    },
    {
      id: "certified",
      emoji: "🏆",
      title: "Certified Techs",
      subtitle: "Actually know stuff",
      position: "bottom-left",
      size: "medium",
      color: "orange"
    },
    {
      id: "remote",
      emoji: "🌐",
      title: "Remote Help",
      subtitle: "Wherever you are",
      position: "left",
      size: "medium",
      color: "cyan"
    }
  ];

  // Services as floating tags
  const floatingTags = [
    { text: "Windows Install", emoji: "💻" },
    { text: "Virus Removal", emoji: "🦠" },
    { text: "Data Recovery", emoji: "💾" },
    { text: "Hardware Fix", emoji: "🔩" },
    { text: "Software Debug", emoji: "🐛" },
    { text: "Speed Boost", emoji: "🚀" },
    { text: "Screen Repair", emoji: "📱" }
  ];

  const getNodePosition = (position: string) => {
    const positions: Record<string, string> = {
      "center": "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
      "top-left": "left-[10%] md:left-[15%] top-[15%] md:top-[10%]",
      "top-right": "right-[10%] md:right-[15%] top-[15%] md:top-[10%]",
      "right": "right-[5%] md:right-[8%] top-1/2 -translate-y-1/2",
      "bottom-right": "right-[10%] md:right-[15%] bottom-[15%] md:bottom-[10%]",
      "bottom": "left-1/2 -translate-x-1/2 bottom-[5%] md:bottom-[8%]",
      "bottom-left": "left-[10%] md:left-[15%] bottom-[15%] md:bottom-[10%]",
      "left": "left-[5%] md:left-[8%] top-1/2 -translate-y-1/2"
    };
    return positions[position] || positions["center"];
  };

  const getNodeColor = (color: string) => {
    const colors: Record<string, string> = {
      "primary": "from-primary/20 to-primary/5 border-primary/40 shadow-primary/20",
      "purple": "from-purple-500/20 to-purple-500/5 border-purple-500/40 shadow-purple-500/20",
      "blue": "from-blue-500/20 to-blue-500/5 border-blue-500/40 shadow-blue-500/20",
      "green": "from-green-500/20 to-green-500/5 border-green-500/40 shadow-green-500/20",
      "yellow": "from-yellow-500/20 to-yellow-500/5 border-yellow-500/40 shadow-yellow-500/20",
      "pink": "from-pink-500/20 to-pink-500/5 border-pink-500/40 shadow-pink-500/20",
      "orange": "from-orange-500/20 to-orange-500/5 border-orange-500/40 shadow-orange-500/20",
      "cyan": "from-cyan-500/20 to-cyan-500/5 border-cyan-500/40 shadow-cyan-500/20"
    };
    return colors[color] || colors["primary"];
  };

  return (
    <section 
      id="about" 
      ref={sectionRef} 
      className="py-24 md:py-32 bg-card relative overflow-hidden"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header - Gen Z style */}
        <div className={`text-center mb-8 md:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            ✨ About Us ✨
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-4 tracking-tight font-display">
            the <span className="gradient-text">lowdown</span> on us 🧠
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            here's everything you need to know about technologiya <span className="text-primary">no cap</span> ⬇️
          </p>
        </div>

        {/* Mind Map Container */}
        <div className={`relative h-[600px] md:h-[700px] lg:h-[800px] transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Animated dashed lines from center to nodes */}
            <g className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <line x1="50%" y1="50%" x2="20%" y2="15%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="8,8" className="animate-pulse-soft" />
              <line x1="50%" y1="50%" x2="80%" y2="15%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="8,8" className="animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
              <line x1="50%" y1="50%" x2="92%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="8,8" className="animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
              <line x1="50%" y1="50%" x2="80%" y2="85%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="8,8" className="animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
              <line x1="50%" y1="50%" x2="50%" y2="92%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="8,8" className="animate-pulse-soft" style={{ animationDelay: '0.8s' }} />
              <line x1="50%" y1="50%" x2="20%" y2="85%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="8,8" className="animate-pulse-soft" style={{ animationDelay: '1s' }} />
              <line x1="50%" y1="50%" x2="8%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="8,8" className="animate-pulse-soft" style={{ animationDelay: '1.2s' }} />
            </g>
          </svg>

          {/* Mind Map Nodes */}
          {mindMapNodes.map((node, index) => (
            <div
              key={node.id}
              className={`absolute ${getNodePosition(node.position)} z-10 transition-all duration-700 hover:scale-110 cursor-pointer group ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`
                ${node.size === 'large' ? 'w-40 h-40 md:w-52 md:h-52' : 'w-28 h-28 md:w-36 md:h-36'}
                rounded-full bg-gradient-to-br ${getNodeColor(node.color)}
                border-2 backdrop-blur-sm
                flex flex-col items-center justify-center text-center
                shadow-lg group-hover:shadow-2xl
                transition-all duration-300
                ${node.size === 'large' ? 'animate-pulse-soft' : ''}
              `}>
                <span className={`${node.size === 'large' ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'} mb-1 md:mb-2`}>
                  {node.emoji}
                </span>
                <span className={`${node.size === 'large' ? 'text-sm md:text-lg' : 'text-xs md:text-sm'} font-bold text-foreground leading-tight px-2`}>
                  {node.title}
                </span>
                <span className={`${node.size === 'large' ? 'text-xs md:text-sm' : 'text-[10px] md:text-xs'} text-muted-foreground mt-0.5 px-2`}>
                  {node.subtitle}
                </span>
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}

          {/* Floating service tags */}
          <div className="absolute inset-0 pointer-events-none">
            {floatingTags.map((tag, index) => {
              const positions = [
                "top-[30%] left-[30%]",
                "top-[25%] right-[25%]",
                "top-[60%] right-[20%]",
                "bottom-[30%] right-[30%]",
                "bottom-[25%] left-[25%]",
                "top-[65%] left-[18%]",
                "top-[40%] right-[12%]"
              ];
              return (
                <div
                  key={tag.text}
                  className={`absolute ${positions[index]} hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border/30 backdrop-blur-sm text-xs text-muted-foreground transition-all duration-700 hover:scale-110 hover:text-foreground pointer-events-auto cursor-default ${
                    isVisible ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ 
                    transitionDelay: `${800 + index * 100}ms`,
                    animation: isVisible ? `float 4s ease-in-out infinite ${index * 0.5}s` : 'none'
                  }}
                >
                  <span>{tag.emoji}</span>
                  <span>{tag.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className={`text-center mt-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '1200ms' }}>
          <p className="text-lg md:text-xl text-muted-foreground">
            <span className="text-foreground font-semibold">tldr;</span> we fix your tech fast, cheap, and right 
            <span className="inline-block ml-2 animate-bounce">👊</span>
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

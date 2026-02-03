import { useEffect, useRef, useState } from "react";

const processSteps = [
  {
    emoji: "📱",
    milestone: "START",
    title: "hit us up",
    description: "slide into our DMs (or just fill the form lol)",
    vibe: "chill",
    tag: "easy peasy"
  },
  {
    emoji: "🔍",
    milestone: "CHECKPOINT 1",
    title: "free diagnosis",
    description: "we check what's wrong - no 💰 needed yet",
    vibe: "smart",
    tag: "no cap"
  },
  {
    emoji: "🔧",
    milestone: "CHECKPOINT 2", 
    title: "fixing time",
    description: "our certified nerds work their magic ✨",
    vibe: "fire",
    tag: "watch us cook"
  },
  {
    emoji: "✅",
    milestone: "CHECKPOINT 3",
    title: "quality check",
    description: "testing everything so it hits different",
    vibe: "valid",
    tag: "no bugs fr"
  },
  {
    emoji: "🚀",
    milestone: "CHECKPOINT 4",
    title: "speed delivery",
    description: "same-day return bc we don't play",
    vibe: "goated",
    tag: "speedrun"
  },
  {
    emoji: "🏆",
    milestone: "FINISH",
    title: "warranty vibes",
    description: "we got your back even after, bestie",
    vibe: "W",
    tag: "always here"
  },
];

const ProcessSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate steps sequentially
          processSteps.forEach((_, index) => {
            setTimeout(() => setActiveStep(index), index * 300);
          });
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="process" ref={sectionRef} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 text-4xl opacity-20 animate-float">🎮</div>
      <div className="absolute top-20 right-20 text-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>💻</div>
      <div className="absolute bottom-20 left-20 text-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>⚡</div>
      <div className="absolute bottom-10 right-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🛠️</div>

      <div className="container mx-auto px-4 relative">
        {/* Header - Gen Z style */}
        <div className={`text-center mb-12 md:mb-20 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            🗺️ The Journey 🗺️
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight font-display mb-4">
            your <span className="gradient-text">repair roadmap</span> 🛣️
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            from "it's broken" to "slay" in 6 easy steps <span className="text-primary">→</span>
          </p>
        </div>

        {/* Roadmap Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Main Road Path - Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2">
            {/* Road background */}
            <div className="absolute inset-0 bg-card rounded-full border-2 border-border/50" />
            {/* Animated progress line */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
              style={{ 
                height: isVisible ? '100%' : '0%',
                transitionDelay: '0.5s'
              }}
            />
            {/* Road dashes */}
            <div className="absolute inset-0 flex flex-col items-center justify-evenly py-8">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-0.5 h-4 bg-muted-foreground/30 transition-all duration-300 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Mobile Road Path */}
          <div className="md:hidden absolute left-8 top-0 bottom-0 w-3">
            <div className="absolute inset-0 bg-card rounded-full border-2 border-border/50" />
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
              style={{ height: isVisible ? '100%' : '0%' }}
            />
          </div>

          {/* Roadmap Steps */}
          <div className="relative space-y-8 md:space-y-0">
            {processSteps.map((step, index) => {
              const isLeft = index % 2 === 0;
              const isActive = index <= activeStep;
              
              return (
                <div
                  key={index}
                  className={`relative flex items-center md:justify-center transition-all duration-700 ${
                    isActive ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Desktop Layout */}
                  <div className={`hidden md:flex items-center w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Content Card */}
                    <div className={`w-[calc(50%-40px)] ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div 
                        className={`group glass-card p-6 rounded-2xl transition-all duration-500 hover:scale-105 cursor-pointer relative overflow-hidden ${
                          isActive ? 'border-primary/30' : ''
                        }`}
                      >
                        {/* Milestone badge */}
                        <div className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase mb-3 px-2 py-1 rounded-full ${
                          step.milestone === 'START' ? 'bg-green-500/20 text-green-400' :
                          step.milestone === 'FINISH' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {step.milestone}
                        </div>
                        
                        {/* Title with emoji */}
                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 font-display flex items-center gap-2 justify-end">
                          {isLeft ? (
                            <>
                              {step.title}
                              <span className="text-2xl">{step.emoji}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-2xl">{step.emoji}</span>
                              {step.title}
                            </>
                          )}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-sm text-muted-foreground mb-3">
                          {step.description}
                        </p>
                        
                        {/* Tag */}
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-card border border-border/50 text-muted-foreground">
                          #{step.tag}
                        </span>

                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      </div>
                    </div>

                    {/* Center Node */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
                        isActive 
                          ? 'bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/40 scale-110' 
                          : 'bg-card border-2 border-border/50'
                      }`}>
                        {isActive ? step.emoji : '⏳'}
                      </div>
                      {/* Pulse effect when active */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                      )}
                    </div>

                    {/* Empty space for opposite side */}
                    <div className="w-[calc(50%-40px)]" />
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden flex items-start gap-6 pl-4">
                    {/* Node */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-500 ${
                        isActive 
                          ? 'bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/40' 
                          : 'bg-card border-2 border-border/50'
                      }`}>
                        {isActive ? step.emoji : '⏳'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="glass-card p-5 rounded-xl">
                        <div className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase mb-2 px-2 py-1 rounded-full ${
                          step.milestone === 'START' ? 'bg-green-500/20 text-green-400' :
                          step.milestone === 'FINISH' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {step.milestone}
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1 font-display flex items-center gap-2">
                          <span>{step.emoji}</span>
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {step.description}
                        </p>
                        <span className="inline-flex text-xs px-2 py-1 rounded-full bg-card border border-border/50 text-muted-foreground">
                          #{step.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Finish Flag */}
          <div className={`flex justify-center mt-12 transition-all duration-700 ${
            activeStep >= processSteps.length - 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}>
            <div className="flex flex-col items-center gap-3">
              <div className="text-5xl animate-bounce">🏁</div>
              <p className="text-lg font-bold text-foreground font-display">device = fixed</p>
              <p className="text-sm text-muted-foreground">you = happy</p>
              <p className="text-xs text-primary">gg ez 🎮</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '1500ms' }}>
          <p className="text-muted-foreground mb-4">
            ready to start your journey? 
            <span className="inline-block ml-2 animate-pulse">👀</span>
          </p>
          <a 
            href="#booking" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:scale-105 transition-transform duration-300"
          >
            let's gooo 
            <span className="text-lg">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

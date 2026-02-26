import { useEffect, useRef, useState } from "react";

const processSteps = [
  { emoji: "📱", milestone: "START", title: "hit us up", description: "slide into our DMs (or just fill the form lol)", tag: "easy peasy" },
  { emoji: "🔍", milestone: "CHECKPOINT 1", title: "free diagnosis", description: "we check what's wrong - no 💰 needed yet", tag: "no cap" },
  { emoji: "🔧", milestone: "CHECKPOINT 2", title: "fixing time", description: "our certified nerds work their magic ✨", tag: "watch us cook" },
  { emoji: "✅", milestone: "CHECKPOINT 3", title: "quality check", description: "testing everything so it hits different", tag: "no bugs fr" },
  { emoji: "🚀", milestone: "CHECKPOINT 4", title: "speed delivery", description: "same-day return bc we don't play", tag: "speedrun" },
  { emoji: "🏆", milestone: "FINISH", title: "warranty vibes", description: "we got your back even after, bestie", tag: "always here" },
];

// Hook for per-element visibility
// Reveal hook with hysteresis — prevents flicker at threshold boundary during Lenis scroll
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const stateRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting !== stateRef.current) {
          stateRef.current = e.isIntersecting;
          setVisible(e.isIntersecting);
        }
      },
      { threshold: [0, 0.12], rootMargin: '20px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

const StepCard = ({ step, index, isLeft }: { step: typeof processSteps[0]; index: number; isLeft: boolean }) => {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className="relative flex items-center md:justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0) scale(1)' : 'translate3d(0,20px,0) scale(0.97)',
        transition: 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Desktop Layout */}
      <div className={`hidden md:flex items-center w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`w-[calc(50%-40px)] ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
          <div className="group glass-card p-6 rounded-2xl md:hover:scale-105 cursor-pointer relative overflow-hidden border-primary/30" style={{ transition: 'transform 0.3s ease-out' }}>
            <div className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase mb-3 px-2 py-1 rounded-full ${
              step.milestone === 'START' ? 'bg-green-500/20 text-green-400' :
              step.milestone === 'FINISH' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-primary/20 text-primary'
            }`}>
              {step.milestone}
            </div>
            
            <h3 className={`text-xl md:text-2xl font-bold text-foreground mb-2 font-display flex items-center gap-2 ${isLeft ? 'justify-end' : 'justify-start'}`}>
              {isLeft ? (
                <>{step.title}<span className="text-2xl">{step.emoji}</span></>
              ) : (
                <><span className="text-2xl">{step.emoji}</span>{step.title}</>
              )}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
            
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-card border border-border/50 text-muted-foreground">
              #{step.tag}
            </span>
          </div>
        </div>

        {/* Center Node */}
        <div className="relative z-10 flex-shrink-0">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/40"
            style={{
              transform: visible ? 'scale(1.1)' : 'scale(0.7)',
              transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {step.emoji}
          </div>
        </div>

        <div className="w-[calc(50%-40px)]" />
      </div>

      {/* Mobile Layout — zigzag */}
      <div className={`md:hidden flex items-start gap-4 ${isLeft ? 'flex-row pl-4' : 'flex-row-reverse pr-4'}`}>
        <div className="relative z-10 flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/40"
            style={{
              transform: visible ? 'scale(1)' : 'scale(0.6)',
              transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {step.emoji}
          </div>
        </div>

        <div className="flex-1 pb-8">
          <div className={`glass-card p-5 rounded-xl ${isLeft ? 'text-left' : 'text-right'}`} style={{ transition: 'none' }}>
            <div className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase mb-2 px-2 py-1 rounded-full ${
              step.milestone === 'START' ? 'bg-green-500/20 text-green-400' :
              step.milestone === 'FINISH' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-primary/20 text-primary'
            }`}>
              {step.milestone}
            </div>
            <h3 className={`text-lg font-bold text-foreground mb-1 font-display flex items-center gap-2 ${isLeft ? 'justify-start' : 'justify-end'}`}>
              {isLeft ? (
                <><span>{step.emoji}</span>{step.title}</>
              ) : (
                <>{step.title}<span>{step.emoji}</span></>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
            <span className="inline-flex text-xs px-2 py-1 rounded-full bg-card border border-border/50 text-muted-foreground">
              #{step.tag}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProcessSection = () => {
  const { ref: headerRef, visible: headerVisible } = useReveal();
  const { ref: footerRef, visible: footerVisible } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();
  const roadRef = useRef<HTMLDivElement>(null);

  // Animate road progress via passive scroll listener — throttled with rAF
  useEffect(() => {
    const el = roadRef.current;
    if (!el) return;

    let ticking = false;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (rect.height + vh * 0.5)));
      el.style.setProperty('--road-progress', `${progress * 100}%`);
      el.style.setProperty('--road-progress-frac', `${progress}`);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    update(); // initial
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="process" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Static grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div
          ref={headerRef}
          className="text-center mb-12 md:mb-20"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          }}
        >
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
        <div ref={roadRef} className="relative max-w-5xl mx-auto">
          {/* Main Road Path - Desktop: use scaleY instead of height to avoid layout */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2">
            <div className="absolute inset-0 bg-card rounded-full border-2 border-border/50" />
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-purple-500 to-pink-500 rounded-full origin-top"
              style={{ transform: `scaleY(var(--road-progress-frac, 0))` }}
            />
          </div>

          {/* Mobile Road Path — centered */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-3">
            <div className="absolute inset-0 bg-card rounded-full border-2 border-border/50" />
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-primary via-purple-500 to-pink-500 rounded-full"
              style={{ height: 'var(--road-progress, 0%)', willChange: 'height' }}
            />
          </div>

          {/* Roadmap Steps */}
          <div className="relative space-y-8 md:space-y-0">
            {processSteps.map((step, index) => (
              <StepCard key={index} step={step} index={index} isLeft={index % 2 === 0} />
            ))}
          </div>

          {/* Finish Flag */}
          <div
            ref={footerRef}
            className="flex justify-center mt-12"
            style={{
              opacity: footerVisible ? 1 : 0,
              transform: footerVisible ? 'scale(1)' : 'scale(0.9)',
              transition: 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-5xl">🏁</div>
              <p className="text-lg font-bold text-foreground font-display">device = fixed</p>
              <p className="text-sm text-muted-foreground">you = happy</p>
              <p className="text-xs text-primary">gg ez 🎮</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          ref={ctaRef}
          className="text-center mt-16"
          style={{
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          }}
        >
          <p className="text-muted-foreground mb-4">
            ready to start your journey? 👀
          </p>
          <a 
            href="#booking" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium md:hover:scale-105 transition-transform duration-300"
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

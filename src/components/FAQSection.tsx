import { useState, useEffect, useRef } from "react";
import { HelpCircle, ChevronDown, Phone } from "lucide-react";
import { Helmet } from "react-helmet-async";

const FAQ_DATA = [
  {
    id: "cost",
    emoji: "💰",
    question: "How much does it cost?",
    shortQ: "cost?",
    answer: "Starting at just ₹100! Simple fixes = affordable. Hardware = bit more. Free diagnosis before any work 🙌",
    tag: "budget friendly"
  },
  {
    id: "time",
    emoji: "⏱️",
    question: "How long does it take?",
    shortQ: "time?",
    answer: "Most repairs done in 30 mins - 2 hours. Complex stuff = 24-48 hrs. We're fast fr fr ⚡",
    tag: "quick turnaround"
  },
  {
    id: "doorstep",
    emoji: "🏠",
    question: "Doorstep service?",
    shortQ: "home visit?",
    answer: "Yes bestie! We come to you, diagnose it, fix it on spot. No need to leave your couch 🛋️",
    tag: "convenient"
  },
  {
    id: "data",
    emoji: "🔒",
    question: "Is my data safe?",
    shortQ: "privacy?",
    answer: "100% secure. Strict privacy protocols. Your data stays your data. We recommend backing up tho 💾",
    tag: "no cap"
  },
  {
    id: "devices",
    emoji: "📱",
    question: "What devices?",
    shortQ: "which ones?",
    answer: "Laptops, desktops, phones (iPhone, Samsung, OnePlus, Xiaomi), tablets - we fix em all 🔧",
    tag: "everything"
  },
  {
    id: "warranty",
    emoji: "✅",
    question: "Warranty included?",
    shortQ: "guarantee?",
    answer: "Yup! 30 days for software, up to 90 days for hardware replacements. We got you covered 🛡️",
    tag: "peace of mind"
  },
  {
    id: "water",
    emoji: "💧",
    question: "Water damage fix?",
    shortQ: "wet phone?",
    answer: "Yes! Turn it off ASAP, don't charge it, bring it quick. The faster = better chance of saving it 🚨",
    tag: "emergency"
  },
  {
    id: "track",
    emoji: "📍",
    question: "Track my repair?",
    shortQ: "status?",
    answer: "Hit our Track Repair page, enter your details, get real-time updates. Easy peasy 📲",
    tag: "transparent"
  },
  {
    id: "appointment",
    emoji: "📅",
    question: "Need appointment?",
    shortQ: "walk-in?",
    answer: "Walk-ins welcome! But booking via WhatsApp = faster service, less waiting 🎯",
    tag: "flexible"
  },
  {
    id: "payment",
    emoji: "💳",
    question: "Payment options?",
    shortQ: "how to pay?",
    answer: "Cash, UPI (GPay, PhonePe, Paytm), cards, bank transfer - whatever works for you 💸",
    tag: "easy pay"
  }
];

const generateFAQSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

const FAQSection = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  // Organize FAQs in a tree structure - left and right branches
  const leftBranch = FAQ_DATA.slice(0, 5);
  const rightBranch = FAQ_DATA.slice(5, 10);

  return (
    <section 
      ref={sectionRef}
      id="faq" 
      className="py-20 md:py-32 bg-background relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 glow-accent opacity-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 text-4xl opacity-20 animate-float">❓</div>
      <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-float delay-300">💡</div>
      <div className="absolute top-1/3 right-20 text-3xl opacity-15 animate-float delay-500">🤔</div>
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema())}
        </script>
      </Helmet>
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <HelpCircle className="h-4 w-4" />
            got questions? 🤷‍♂️
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-display">
            FAQ Tree 🌳
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            tap any branch to get the answers you need, no cap
          </p>
        </div>

        {/* Tree Mind Map Layout */}
        <div className={`relative max-w-6xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          
          {/* SVG Tree Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
            {/* Main trunk */}
            <line 
              x1="50%" y1="0" x2="50%" y2="100%" 
              stroke="hsl(var(--border))" 
              strokeWidth="2" 
              strokeDasharray="8 4"
              className="opacity-40"
            />
            {/* Left branches */}
            {leftBranch.map((_, idx) => (
              <line 
                key={`left-${idx}`}
                x1="50%" 
                y1={`${(idx + 0.5) * (100 / leftBranch.length)}%`}
                x2="25%" 
                y2={`${(idx + 0.5) * (100 / leftBranch.length)}%`}
                stroke="hsl(var(--border))" 
                strokeWidth="1.5" 
                strokeDasharray="6 3"
                className="opacity-30"
              />
            ))}
            {/* Right branches */}
            {rightBranch.map((_, idx) => (
              <line 
                key={`right-${idx}`}
                x1="50%" 
                y1={`${(idx + 0.5) * (100 / rightBranch.length)}%`}
                x2="75%" 
                y2={`${(idx + 0.5) * (100 / rightBranch.length)}%`}
                stroke="hsl(var(--border))" 
                strokeWidth="1.5" 
                strokeDasharray="6 3"
                className="opacity-30"
              />
            ))}
          </svg>

          {/* Desktop: Two column tree layout */}
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
            {/* Left Branch */}
            <div className="space-y-4 pr-8">
              {leftBranch.map((faq, idx) => (
                <div 
                  key={faq.id}
                  className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <button
                    onClick={() => setActiveId(activeId === faq.id ? null : faq.id)}
                    className={`w-full text-left group transition-all duration-300 ${
                      activeId === faq.id 
                        ? 'scale-[1.02]' 
                        : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`relative p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                      activeId === faq.id
                        ? 'bg-card border-primary/40 shadow-lg'
                        : 'bg-card/50 border-border/30 hover:border-primary/20 hover:bg-card/80'
                    }`}>
                      {/* Tag */}
                      <span className="absolute -top-2 right-4 px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border/30 rounded-full">
                        #{faq.tag}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{faq.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm md:text-base truncate">
                            {faq.question}
                          </h3>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                          activeId === faq.id ? 'rotate-180' : ''
                        }`} />
                      </div>
                      
                      {/* Answer */}
                      <div className={`overflow-hidden transition-all duration-300 ${
                        activeId === faq.id ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <p className="text-muted-foreground text-sm leading-relaxed pl-11">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Center Trunk */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center animate-pulse-soft">
                <span className="text-2xl">🌳</span>
              </div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/30 via-border/30 to-primary/30 rounded-full" />
              <div className="w-12 h-12 rounded-full bg-card border border-border/30 flex items-center justify-center">
                <span className="text-xl">❓</span>
              </div>
            </div>

            {/* Right Branch */}
            <div className="space-y-4 pl-8">
              {rightBranch.map((faq, idx) => (
                <div 
                  key={faq.id}
                  className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                  style={{ transitionDelay: `${(idx + 5) * 100}ms` }}
                >
                  <button
                    onClick={() => setActiveId(activeId === faq.id ? null : faq.id)}
                    className={`w-full text-left group transition-all duration-300 ${
                      activeId === faq.id 
                        ? 'scale-[1.02]' 
                        : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`relative p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                      activeId === faq.id
                        ? 'bg-card border-primary/40 shadow-lg'
                        : 'bg-card/50 border-border/30 hover:border-primary/20 hover:bg-card/80'
                    }`}>
                      {/* Tag */}
                      <span className="absolute -top-2 left-4 px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border/30 rounded-full">
                        #{faq.tag}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{faq.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm md:text-base truncate">
                            {faq.question}
                          </h3>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                          activeId === faq.id ? 'rotate-180' : ''
                        }`} />
                      </div>
                      
                      {/* Answer */}
                      <div className={`overflow-hidden transition-all duration-300 ${
                        activeId === faq.id ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <p className="text-muted-foreground text-sm leading-relaxed pl-11">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Single column with tree line */}
          <div className="md:hidden relative">
            {/* Vertical tree line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-border/30 to-primary/30 rounded-full" />
            
            <div className="space-y-4 pl-12">
              {FAQ_DATA.map((faq, idx) => (
                <div 
                  key={faq.id}
                  className={`relative transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  {/* Branch dot */}
                  <div className="absolute -left-[2.65rem] top-6 w-3 h-3 rounded-full bg-primary/30 border border-primary/50" />
                  
                  <button
                    onClick={() => setActiveId(activeId === faq.id ? null : faq.id)}
                    className="w-full text-left"
                  >
                    <div className={`relative p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                      activeId === faq.id
                        ? 'bg-card border-primary/40 shadow-lg'
                        : 'bg-card/50 border-border/30'
                    }`}>
                      <span className="absolute -top-2 right-4 px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border/30 rounded-full">
                        #{faq.tag}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{faq.emoji}</span>
                        <h3 className="flex-1 font-semibold text-foreground text-sm">
                          {faq.question}
                        </h3>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                          activeId === faq.id ? 'rotate-180' : ''
                        }`} />
                      </div>
                      
                      <div className={`overflow-hidden transition-all duration-300 ${
                        activeId === faq.id ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <p className="text-muted-foreground text-sm leading-relaxed pl-9">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-muted-foreground mb-4 text-lg">
            still confused? hit us up, we don't bite 😄
          </p>
          <a 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg" 
            href="tel:+918812910655"
            aria-label="Call Technologiya for support"
          >
            <Phone className="w-4 h-4" />
            Call: +91 88129 10655
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
import { Star, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

const testimonials = [
  {
    name: "Rahul S.",
    role: "Business Owner",
    content: "Fixed my laptop in hours! They did everything right in front of me. 🔥",
    rating: 5,
    emoji: "💼",
  },
  {
    name: "Priya P.",
    role: "Student",
    content: "Affordable and trustworthy! Upgraded my Windows perfectly. Worth it! ✨",
    rating: 5,
    emoji: "📚",
  },
  {
    name: "Amit K.",
    role: "Freelancer",
    content: "Sound issues? Fixed on the spot! Super impressed with the speed! 🚀",
    rating: 5,
    emoji: "🎨",
  },
  {
    name: "Sneha G.",
    role: "Teacher",
    content: "Transparent work, data safe. My old PC feels brand new now! 💯",
    rating: 5,
    emoji: "👩‍🏫",
  },
];

const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isUserInteraction = useRef(false);
  
  // Embla carousel for swipe gestures
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    skipSnaps: false,
  });

  // Haptic feedback function - only triggers on manual interaction
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator && isUserInteraction.current) {
      navigator.vibrate(10);
      isUserInteraction.current = false;
    }
  }, []);

  const scrollPrev = useCallback(() => {
    isUserInteraction.current = true;
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    isUserInteraction.current = true;
    emblaApi?.scrollNext();
  }, [emblaApi]);

  // Sync active index with carousel and add haptic feedback only on user interaction
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
      triggerHaptic();
    };

    const onPointerDown = () => {
      isUserInteraction.current = true;
    };
    
    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', onPointerDown);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', onPointerDown);
    };
  }, [emblaApi, triggerHaptic]);

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

  // Auto-play carousel
  useEffect(() => {
    if (!isVisible || !emblaApi) return;
    
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, emblaApi]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  return (
    <section id="reviews" ref={sectionRef} className="py-10 md:py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-6 md:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-primary tracking-widest uppercase mb-2">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
            Real Reviews
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
          </span>
          <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
            Loved by customers ❤️
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto font-light">
            Swipe to see what our happy customers say
          </p>
        </div>

        {/* Mobile Swipeable Carousel */}
        <div className="md:hidden relative">
          {/* Central Node with Swipe Hint */}
          <div className={`flex justify-center items-center gap-3 mb-4 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <ChevronLeft className="w-4 h-4 text-muted-foreground animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl shadow-lg animate-pulse">
              ⭐
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground animate-pulse" />
          </div>

          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_88%] min-w-0 pl-3 first:pl-0"
                >
                  <div
                    className={`relative p-4 rounded-xl border transition-all duration-500
                      ${activeIndex === index 
                        ? 'bg-primary/10 border-primary shadow-lg scale-100' 
                        : 'bg-background border-border scale-95 opacity-70'
                      }
                    `}
                  >
                    {/* Floating Emoji */}
                    <div className={`absolute -top-2 -right-1 text-2xl transition-transform duration-300 ${activeIndex === index ? 'scale-125 animate-bounce' : 'scale-100'}`}>
                      {testimonial.emoji}
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 fill-primary text-primary transition-all duration-300 ${activeIndex === index ? 'scale-110' : ''}`}
                          style={{ transitionDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-foreground text-sm leading-relaxed mb-3">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{testimonial.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>

                    {/* Active Indicator Pulse */}
                    {activeIndex === index && (
                      <div className="absolute inset-0 rounded-xl border-2 border-primary animate-ping opacity-20 pointer-events-none" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots & Arrows Combined */}
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={scrollPrev}
              className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-foreground active:bg-primary active:text-primary-foreground transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { isUserInteraction.current = true; scrollTo(index); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === index ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={scrollNext}
              className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-foreground active:bg-primary active:text-primary-foreground transition-colors duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mind Map Layout - Desktop */}
        <div className="hidden md:block relative max-w-6xl mx-auto">
          {/* Central Hub */}
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl">
              <div className="text-center">
                <span className="text-4xl">⭐</span>
                <p className="text-xs font-bold text-primary-foreground mt-1">5.0</p>
              </div>
            </div>
            {/* Pulsing Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
          </div>

          {/* Mind Map Grid */}
          <div className="relative h-[500px]">
            {/* SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {testimonials.map((_, index) => {
                const positions = [
                  { x1: '50%', y1: '50%', x2: '15%', y2: '20%' },
                  { x1: '50%', y1: '50%', x2: '85%', y2: '20%' },
                  { x1: '50%', y1: '50%', x2: '15%', y2: '80%' },
                  { x1: '50%', y1: '50%', x2: '85%', y2: '80%' },
                ];
                const pos = positions[index];
                return (
                  <line
                    key={index}
                    x1={pos.x1}
                    y1={pos.y1}
                    x2={pos.x2}
                    y2={pos.y2}
                    stroke="hsl(var(--primary) / 0.2)"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  />
                );
              })}
            </svg>

            {/* Testimonial Nodes */}
            {testimonials.map((testimonial, index) => {
              const positions = [
                'top-0 left-0',
                'top-0 right-0',
                'bottom-0 left-0',
                'bottom-0 right-0',
              ];
              const hoverTransforms = [
                'hover:-translate-x-2 hover:-translate-y-2',
                'hover:translate-x-2 hover:-translate-y-2',
                'hover:-translate-x-2 hover:translate-y-2',
                'hover:translate-x-2 hover:translate-y-2',
              ];

              return (
                <div
                  key={index}
                  className={`absolute ${positions[index]} w-[280px] p-6 rounded-3xl bg-background border border-border 
                    transition-all duration-500 hover:shadow-xl hover:border-primary/50 group cursor-pointer
                    ${hoverTransforms[index]}
                    ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                  `}
                  style={{ 
                    transitionDelay: `${300 + index * 150}ms`,
                    animation: isVisible ? `float ${4 + index * 0.3}s ease-in-out infinite` : 'none',
                    animationDelay: `${index * 0.5}s`
                  }}
                >
                  {/* Emoji Badge */}
                  <div className="absolute -top-4 -right-4 text-3xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                    {testimonial.emoji}
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4 fill-primary text-primary transition-transform duration-200 group-hover:scale-110" 
                        style={{ transitionDelay: `${i * 30}ms` }}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-foreground text-sm leading-relaxed mb-5 group-hover:text-foreground/90">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 rounded-3xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-10 w-2 h-2 rounded-full bg-primary/30 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className={`absolute top-1/3 right-20 w-3 h-3 rounded-full bg-primary/20 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }} />
        <div className={`absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/25 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '2s' }} />
      </div>
    </section>
  );
};

export default TestimonialsSection;

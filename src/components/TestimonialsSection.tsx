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
  
  // Embla carousel for swipe gestures
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    skipSnaps: false,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Sync active index with carousel
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

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
    <section id="reviews" ref={sectionRef} className="py-16 md:py-32 bg-card overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-widest uppercase mb-4">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Real Reviews
            <Sparkles className="w-4 h-4 animate-pulse" />
          </span>
          <h2 className="text-3xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Loved by customers ❤️
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto font-light">
            Swipe to see what our happy customers say
          </p>
        </div>

        {/* Mobile Swipeable Carousel */}
        <div className="md:hidden relative">
          {/* Central Node */}
          <div className={`flex justify-center mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl shadow-lg animate-pulse">
              ⭐
            </div>
          </div>

          {/* Swipe Hint */}
          <div className={`flex justify-center items-center gap-2 mb-4 text-muted-foreground text-xs transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <ChevronLeft className="w-4 h-4 animate-pulse" />
            <span>Swipe</span>
            <ChevronRight className="w-4 h-4 animate-pulse" />
          </div>

          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_85%] min-w-0 pl-4 first:pl-0"
                >
                  <div
                    className={`relative p-6 rounded-2xl border transition-all duration-500
                      ${activeIndex === index 
                        ? 'bg-primary/10 border-primary shadow-lg scale-100' 
                        : 'bg-background border-border scale-95 opacity-70'
                      }
                    `}
                  >
                    {/* Floating Emoji */}
                    <div className={`absolute -top-3 -right-2 text-3xl transition-transform duration-300 ${activeIndex === index ? 'scale-125 animate-bounce' : 'scale-100'}`}>
                      {testimonial.emoji}
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 fill-primary text-primary transition-all duration-300 ${activeIndex === index ? 'scale-110' : ''}`}
                          style={{ transitionDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-foreground text-base leading-relaxed mb-4">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>

                    {/* Active Indicator Pulse */}
                    {activeIndex === index && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-20 pointer-events-none" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-300"
            >
              <ChevronRight className="w-5 h-5" />
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

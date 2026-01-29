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
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    skipSnaps: false,
  });

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
    <section id="reviews" ref={sectionRef} className="py-16 md:py-24 bg-card overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`text-center mb-10 md:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <Sparkles className="w-4 h-4" />
            Real Reviews
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight font-display">
            Loved by customers ❤️
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Swipe to see what our happy customers say
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div className={`flex justify-center items-center gap-3 mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <ChevronLeft className="w-4 h-4 text-muted-foreground animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl shadow-lg shadow-primary/30">
              ⭐
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground animate-pulse" />
          </div>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_88%] min-w-0 pl-3 first:pl-0"
                >
                  <div
                    className={`relative glass-card p-5 rounded-2xl transition-all duration-500
                      ${activeIndex === index 
                        ? 'border-primary/50 shadow-lg shadow-primary/10' 
                        : 'scale-95 opacity-70'
                      }
                    `}
                  >
                    <div className={`absolute -top-2 -right-1 text-2xl transition-transform duration-300 ${activeIndex === index ? 'scale-125 animate-bounce' : 'scale-100'}`}>
                      {testimonial.emoji}
                    </div>

                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-4 h-4 fill-primary text-primary"
                        />
                      ))}
                    </div>

                    <p className="text-foreground text-sm leading-relaxed mb-4">
                      "{testimonial.content}"
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { isUserInteraction.current = true; scrollTo(index); }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`glass-card p-6 rounded-2xl transition-all duration-500 group cursor-pointer
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="absolute -top-2 -right-2 text-2xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                {testimonial.emoji}
              </div>

              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 fill-primary text-primary" 
                  />
                ))}
              </div>

              <p className="text-foreground text-sm leading-relaxed mb-5">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Business Owner",
    company: "Tech Solutions Pvt.",
    content: "Technologiya saved our entire office network. They diagnosed a critical server issue in under an hour and had us back online the same day. Absolutely reliable!",
    rating: 5,
    avatar: "RS",
  },
  {
    name: "Priya Patel",
    role: "Student",
    company: "Delhi University",
    content: "My laptop crashed before finals and I thought I lost everything. They recovered all my data and upgraded my system. Lifesavers!",
    rating: 5,
    avatar: "PP",
  },
  {
    name: "Amit Kumar",
    role: "Freelance Designer",
    company: "Self-Employed",
    content: "Fast, transparent, and affordable. They fixed my MacBook's display issue right in front of me. No hidden charges, no surprises. Highly recommend!",
    rating: 5,
    avatar: "AK",
  },
  {
    name: "Sneha Gupta",
    role: "Teacher",
    company: "Government School",
    content: "My old PC feels brand new now! Windows installation, virus removal, and hardware cleanup—all done in one visit. Exceptional service!",
    rating: 5,
    avatar: "SG",
  },
  {
    name: "Vikram Singh",
    role: "Startup Founder",
    company: "InnovateTech",
    content: "We've partnered with Technologiya for all our device repairs. Their response time and expertise are unmatched. A true technology partner!",
    rating: 5,
    avatar: "VS",
  },
];

const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isUserInteraction = useRef(false);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
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
      if (!isUserInteraction.current) {
        emblaApi.scrollNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, emblaApi]);

  const scrollTo = useCallback((index: number) => {
    isUserInteraction.current = true;
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  return (
    <section id="reviews" ref={sectionRef} className="py-24 md:py-32 bg-card overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`mb-12 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transition: 'opacity 0.5s ease-out, transform 0.5s ease-out' }}>
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight font-display italic">
              What our clients say.
            </h2>
          </div>
          
          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={scrollPrev}
              className="w-12 h-12 rounded-xl border border-border bg-secondary/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="w-12 h-12 rounded-xl border border-border bg-secondary/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4 md:-ml-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 md:pl-6"
              >
                <div
                  className={`relative glass-card p-8 md:p-10 rounded-2xl h-full transition-all duration-500 group
                    ${activeIndex === index 
                      ? 'border-primary/30 shadow-lg shadow-primary/5' 
                      : 'hover:border-primary/20'
                    }
                  `}
                >
                  {/* Quote icon */}
                  <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 fill-primary text-primary"
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-foreground text-lg leading-relaxed mb-8">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-border/30">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots navigation */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === index ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden justify-center items-center gap-4 mt-6">
          <button
            onClick={scrollPrev}
            className="w-12 h-12 rounded-xl border border-border bg-secondary/50 flex items-center justify-center text-foreground active:bg-primary active:text-primary-foreground transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="w-12 h-12 rounded-xl border border-border bg-secondary/50 flex items-center justify-center text-foreground active:bg-primary active:text-primary-foreground transition-colors duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
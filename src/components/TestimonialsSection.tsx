import { Star, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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

  // Auto-cycle through testimonials on mobile
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % testimonials.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

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
            See what our happy customers are saying
          </p>
        </div>

        {/* Mind Map Layout - Mobile */}
        <div className="md:hidden relative">
          {/* Central Node */}
          <div className={`flex justify-center mb-8 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl shadow-lg animate-pulse">
              ⭐
            </div>
          </div>

          {/* Connecting Lines SVG */}
          <svg className="absolute top-20 left-1/2 -translate-x-1/2 w-full h-32 pointer-events-none" viewBox="0 0 400 100">
            <path
              d="M200 0 Q100 50 50 100"
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth="2"
              fill="none"
              className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              strokeDasharray="5,5"
            />
            <path
              d="M200 0 Q300 50 350 100"
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth="2"
              fill="none"
              className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              strokeDasharray="5,5"
            />
          </svg>

          {/* Testimonial Cards - Stacked with Animation */}
          <div className="relative mt-16 space-y-4">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative p-5 rounded-2xl border transition-all duration-500 cursor-pointer
                  ${activeIndex === index 
                    ? 'bg-primary/10 border-primary scale-[1.02] shadow-lg' 
                    : 'bg-background border-border hover:border-primary/50'
                  }
                  ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
                `}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  animation: isVisible ? `float ${3 + index * 0.5}s ease-in-out infinite` : 'none',
                  animationDelay: `${index * 0.2}s`
                }}
              >
                {/* Floating Emoji */}
                <div className={`absolute -top-3 -right-2 text-2xl transition-transform duration-300 ${activeIndex === index ? 'scale-125 animate-bounce' : ''}`}>
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
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                {/* Active Indicator Pulse */}
                {activeIndex === index && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-20 pointer-events-none" />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index ? 'w-6 bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
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

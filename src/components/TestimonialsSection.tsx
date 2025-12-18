import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Business Owner",
    content: "My laptop was completely unresponsive, and they fixed it within hours! The best part? They did everything right in front of me.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Student",
    content: "Affordable and trustworthy! They upgraded my Windows and installed all necessary software. Worth every rupee spent!",
    rating: 5,
  },
  {
    name: "Amit Kumar",
    role: "Freelancer",
    content: "Had major sound issues on my phone. The team diagnosed it quickly and fixed it on the spot. Super impressed!",
    rating: 5,
  },
  {
    name: "Sneha Gupta",
    role: "Teacher",
    content: "I was worried about my data privacy, but they assured me and worked transparently. My old PC feels brand new now!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
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

  return (
    <section id="testimonials" ref={sectionRef} className="py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Testimonials</span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mt-4 mb-6 tracking-tight">
            Loved by customers.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
            Real feedback from real people who trust us with their devices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`p-8 rounded-3xl bg-background border border-border transition-all duration-500 hover:shadow-lg ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-foreground text-foreground" />
                ))}
              </div>
              <p className="text-foreground text-lg mb-8 leading-relaxed font-light">"{testimonial.content}"</p>
              <div>
                <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

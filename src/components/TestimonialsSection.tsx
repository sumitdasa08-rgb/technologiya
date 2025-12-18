import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Business Owner",
    content: "My laptop was completely unresponsive, and they fixed it within hours! The best part? They did everything right in front of me. Highly professional!",
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
    content: "Had major sound issues on my phone. The team diagnosed it quickly and fixed it on the spot. Super impressed with their expertise!",
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
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it — hear from our satisfied customers who trust us with their devices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="bg-card border-border hover:border-primary/30 transition-all duration-300"
            >
              <CardContent className="p-6">
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                <p className="text-foreground mb-6 leading-relaxed">{testimonial.content}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

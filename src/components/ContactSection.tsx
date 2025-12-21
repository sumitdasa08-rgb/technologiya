import { Phone, Mail, Clock, MapPin, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    issue: "",
    message: "",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Listen for prefill events from services section
  useEffect(() => {
    const handlePrefill = (e: CustomEvent<{ issue: string; message: string }>) => {
      setFormData(prev => ({
        ...prev,
        issue: e.detail.issue,
        message: e.detail.message,
      }));
    };

    window.addEventListener("prefillContact", handlePrefill as EventListener);
    return () => window.removeEventListener("prefillContact", handlePrefill as EventListener);
  }, []);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.issue) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: 150,
          name: formData.name,
          phone: formData.phone,
          issue: formData.issue,
        },
      });

      if (error) throw error;

      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'TechFix Pro',
        description: `Service Booking - ${formData.issue}`,
        order_id: data.orderId,
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: { color: '#000000' },
        handler: (response: RazorpayResponse) => {
          console.log('Payment successful:', response);
          toast.success("Payment successful! We'll contact you shortly.");
          setFormData({ name: "", phone: "", issue: "", message: "" });
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    { icon: Phone, label: "Phone", value: "8812910655", href: "tel:8812910655" },
    { icon: Mail, label: "Email", value: "techfixpro@service.com", href: "mailto:techfixpro@service.com" },
    { icon: Clock, label: "Hours", value: "Mon-Sat: 9AM-9PM", href: null },
    { icon: MapPin, label: "Service", value: "Home Visit Available", href: null },
  ];

  return (
    <section id="contact" ref={sectionRef} className="py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Contact</span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mt-4 mb-6 tracking-tight">
            Get in touch.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
            Ready to fix your tech? Fill out the form or call us directly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className={`space-y-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            {contactInfo.map((item, index) => (
              <div key={index} className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                  {item.href ? (
                    <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="glass-card p-6 rounded-2xl mt-8">
              <p className="text-foreground font-medium mb-2">Quick Tip</p>
              <p className="text-sm text-muted-foreground font-light">
                Call us directly at <span className="text-foreground font-medium">8812910655</span> for faster response and immediate booking!
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form 
            onSubmit={handleSubmit} 
            className={`glass-card p-8 rounded-3xl transition-all duration-700 ease-apple ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background/50 border-border/50 rounded-xl h-12 backdrop-blur-sm transition-all duration-300 focus:bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <Input
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="bg-background/50 border-border/50 rounded-xl h-12 backdrop-blur-sm transition-all duration-300 focus:bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Issue Type</label>
                <Input
                  placeholder="e.g., Windows upgrade, Sound issue"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  required
                  className="bg-background/50 border-border/50 rounded-xl h-12 backdrop-blur-sm transition-all duration-300 focus:bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Describe Your Issue</label>
                <Textarea
                  placeholder="Tell us more about the problem..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="bg-background/50 border-border/50 resize-none rounded-xl backdrop-blur-sm transition-all duration-300 focus:bg-background"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 rounded-full font-medium transition-all duration-500 ease-apple hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₹150 & Book <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
              {/* Money Back Guarantee */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">100% Money Back Guarantee</span> if not solved
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

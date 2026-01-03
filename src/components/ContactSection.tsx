import { Phone, Mail, Clock, MapPin, ArrowRight, ShieldCheck, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    issue: "",
    message: "",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

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
      setIsSubmitted(false);
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    };

    window.addEventListener("prefillContact", handlePrefill as EventListener);
    return () => window.removeEventListener("prefillContact", handlePrefill as EventListener);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedIssue = formData.issue.trim();

    if (!trimmedName || !trimmedPhone || !trimmedIssue) {
      toast.error("Please fill in all required fields");
      return;
    }

    const phoneDigits = trimmedPhone.replace(/[\s\-\(\)]/g, '');
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      toast.error("Please enter a valid phone number (10-15 digits)");
      return;
    }

    if (trimmedName.length > 100) {
      toast.error("Name must be less than 100 characters");
      return;
    }

    if (trimmedIssue.length > 500) {
      toast.error("Issue description must be less than 500 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-telegram', {
        body: {
          name: trimmedName,
          phone: trimmedPhone,
          issue: trimmedIssue,
          message: formData.message.trim(),
        },
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Request sent! We'll call you back shortly.");
    } catch (error) {
      console.error('Contact error:', error);
      toast.error("Failed to send. Please call us directly at 8812910655");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRequest = () => {
    setFormData({ name: "", phone: "", issue: "", message: "" });
    setIsSubmitted(false);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi! I need tech support. Can you help me?");
    window.open(`https://wa.me/918812910655?text=${message}`, '_blank');
  };

  const contactInfo = [
    { icon: Phone, label: "Phone", value: "8812910655", href: "tel:8812910655" },
    { icon: Mail, label: "Email", value: "connect.das@outlook.com", href: "mailto:connect.das@outlook.com" },
    { icon: Clock, label: "Hours", value: "Mon-Sun: 24 hrs", href: null },
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
                Call us directly at <span className="text-foreground font-medium">8812910655</span> for faster response!
              </p>
            </div>

            {/* WhatsApp Button */}
            <Button
              onClick={handleWhatsAppClick}
              variant="outline"
              className="w-full h-12 rounded-full gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </Button>
          </div>

          {/* Contact Form */}
          <div 
            className={`glass-card p-8 rounded-3xl transition-all duration-700 ease-apple ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            {isSubmitted ? (
              <div className="text-center space-y-6 py-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Request Received!</h3>
                  <p className="text-muted-foreground">
                    Thank you! Our team will call you back within 30 minutes.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleNewRequest}
                    variant="outline"
                    className="w-full h-12 rounded-full font-medium"
                  >
                    Submit Another Request
                  </Button>
                  
                  <Button 
                    onClick={handleWhatsAppClick}
                    className="w-full h-12 rounded-full font-medium gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Your Name *</label>
                    <Input
                      ref={nameInputRef}
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-background/50 border-border/50 rounded-xl h-12 backdrop-blur-sm transition-all duration-300 focus:bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                    <Input
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="bg-background/50 border-border/50 rounded-xl h-12 backdrop-blur-sm transition-all duration-300 focus:bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Issue Type *</label>
                    <Input
                      placeholder="e.g., Windows upgrade, Sound issue"
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      required
                      className="bg-background/50 border-border/50 rounded-xl h-12 backdrop-blur-sm transition-all duration-300 focus:bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Additional Details</label>
                    <Textarea
                      placeholder="Tell us more about the problem (optional)"
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
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Request <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    We'll call you back within 30 minutes
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

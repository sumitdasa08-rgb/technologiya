import { Phone, ArrowRight, ShieldCheck, Loader2, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { setCustomerCookie } from "@/lib/cookies";
import { useNavigate } from "react-router-dom";
import UPIPayment from "./UPIPayment";

const BookingSection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    issue: "",
    message: "",
  });
  const [selectedService, setSelectedService] = useState({
    service_type: "consultation",
    price: 10
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUPIPayment, setShowUPIPayment] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedCustomer, setConfirmedCustomer] = useState<{ name: string; phone: string } | null>(null);
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
    const handlePrefill = (e: CustomEvent<{ issue: string; message: string; service_type?: string; price?: number }>) => {
      setFormData(prev => ({
        ...prev,
        issue: e.detail.issue,
        message: e.detail.message,
      }));
      if (e.detail.service_type && e.detail.price) {
        setSelectedService({
          service_type: e.detail.service_type,
          price: e.detail.price
        });
      }
      setShowUPIPayment(false);
      setBookingRef(null);
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
      const { data, error } = await supabase.functions.invoke('create-upi-booking', {
        body: {
          service_type: selectedService.service_type,
          name: trimmedName,
          phone: trimmedPhone,
          issue: trimmedIssue,
          description: formData.message.trim(),
        },
      });

      if (error) throw error;

      setBookingRef(data.bookingRef);
      setShowUPIPayment(true);
      toast.success("Booking created! Please complete payment via UPI.");
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentConfirmed = async () => {
    const customerName = formData.name.trim();
    const customerPhone = formData.phone.trim();
    
    // Set cookie and redirect immediately - don't wait for API
    setCustomerCookie({ name: customerName, phone: customerPhone });
    toast.success("Payment submitted! Redirecting to track your repair...", {
      description: "We're verifying your payment. This usually takes 15-30 minutes."
    });
    
    // Navigate immediately - customer will see "Payment Processing" status
    navigate('/track-repair');
    
    // Update payment status in background (don't block the user)
    try {
      await supabase.functions.invoke('update-payment-status', {
        body: {
          razorpay_order_id: bookingRef,
          razorpay_payment_id: `UPI-CONFIRMED-${Date.now()}`,
          razorpay_signature: 'upi-manual-confirmation',
        },
      });
    } catch (error) {
      console.error('Background payment update error:', error);
      // Don't show error to user - they're already on track page
    }
  };

  const handleNewBooking = () => {
    setFormData({ name: "", phone: "", issue: "", message: "" });
    setSelectedService({ service_type: "consultation", price: 10 });
    setBookingConfirmed(false);
    setConfirmedCustomer(null);
    setBookingRef(null);
  };

  const handleTrackRepair = () => {
    navigate('/track-repair');
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi! I need tech support. Can you help me?");
    window.open(`https://wa.me/918812910655?text=${message}`, '_blank');
  };

  return (
    <section id="booking" ref={sectionRef} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Quick Booking
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Book Your Repair Service
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fill the form below to schedule your service, or reach us directly via WhatsApp for instant support.
            </p>
          </div>

          {/* Mobile Only - Name and Why Choose Us */}
          <div id="booking-mobile-header" className="md:hidden bg-primary rounded-2xl p-6 mb-6 text-primary-foreground">
            <h3 className="text-2xl font-bold text-center mb-4">LogicLabs</h3>
            <div className="text-center mb-4">
              <span className="text-sm opacity-90">Why Choose Us?</span>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">24/7 Support</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">Home Visit</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">Transparent Pricing</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">Money-Back</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleWhatsAppClick}
                variant="secondary"
                size="sm"
                className="flex-1 gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="flex-1 gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <a href="tel:8812910655">
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              </Button>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-5">
              {/* Left Side - Info Panel (hidden on mobile) */}
              <div className="hidden md:block md:col-span-2 bg-primary p-8 text-primary-foreground">
                <h3 className="text-xl font-semibold mb-6">Why Choose Us?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">24/7 Expert Support Available</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Home Visit Service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Transparent Pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Money-Back Guarantee</span>
                  </li>
                </ul>

                <div className="mt-8 pt-8 border-t border-primary-foreground/20">
                  <p className="text-sm opacity-90 mb-4">Prefer to chat directly?</p>
                  <Button
                    onClick={handleWhatsAppClick}
                    variant="secondary"
                    className="w-full gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </Button>
                  <a 
                    href="tel:8812910655" 
                    className="flex items-center justify-center gap-2 mt-3 text-sm opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <Phone className="w-4 h-4" />
                    Call: 8812910655
                  </a>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="md:col-span-3 p-5 sm:p-6 md:p-8">
                {bookingConfirmed ? (
                  <div className="text-center space-y-6 py-6 md:py-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Booking Confirmed!</h3>
                      <p className="text-muted-foreground">
                        Thank you, {confirmedCustomer?.name}! Our team will verify your payment and contact you within 30 minutes.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={handleTrackRepair}
                        className="w-full h-12 sm:h-14 rounded-xl font-medium text-base"
                      >
                        Track Your Repair <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={handleNewBooking}
                        className="w-full h-12 sm:h-14 rounded-xl font-medium text-base"
                      >
                        Book Another Service
                      </Button>
                    </div>
                  </div>
                ) : showUPIPayment ? (
                  <UPIPayment 
                    amount={selectedService.price} 
                    onPaymentConfirmed={handlePaymentConfirmed}
                    isLoading={isLoading}
                  />
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 text-left max-w-md mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground text-left">Your Name *</label>
                        <Input
                          ref={nameInputRef}
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="h-12 sm:h-14 rounded-xl w-full text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground text-left">Phone Number *</label>
                        <Input
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="h-12 sm:h-14 rounded-xl w-full text-base"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground text-left">Issue Type *</label>
                      <Input
                        placeholder="e.g., Windows upgrade, Sound issue, Screen repair"
                        value={formData.issue}
                        onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                        required
                        className="h-12 sm:h-14 rounded-xl w-full text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground text-left">Additional Details</label>
                      <Textarea
                        placeholder="Tell us more about the problem (optional)"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={3}
                        className="resize-none rounded-xl w-full text-base min-h-[100px]"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-14 rounded-xl font-medium text-base mt-3"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Book & Pay <span className="line-through text-muted-foreground">₹150</span> ₹{selectedService.price} via UPI <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    {/* WhatsApp Alternative */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-1">
                      <span>or</span>
                      <button
                        type="button"
                        onClick={handleWhatsAppClick}
                        className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium min-h-[44px] px-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Book via WhatsApp
                      </button>
                    </div>
                    
                    {/* Guarantee */}
                    <div className="flex items-center justify-center gap-2 pt-1 pb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-muted-foreground text-center">
                        <span className="font-medium text-foreground">₹10 service fee non-refundable</span> | Extra amount refundable if unfixable
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;

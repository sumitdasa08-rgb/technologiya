import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, IndianRupee, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

const BookingSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    issue: "",
  });
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  // Fetch active product pricing
  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setProduct(data);
      }
    };

    fetchProduct();
  }, []);

  // Listen for prefill events from services section
  useEffect(() => {
    const handlePrefill = (e: CustomEvent<{ issue: string; message: string }>) => {
      setFormData(prev => ({
        ...prev,
        issue: e.detail.issue || e.detail.message,
      }));
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

    const phoneDigits = trimmedPhone.replace(/[\s\-\(\)]/g, "");
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      toast.error("Please enter a valid phone number (10-15 digits)");
      return;
    }

    if (!product) {
      toast.error("Service not available. Please try again later.");
      return;
    }

    setIsLoading(true);

    try {
      // Create booking in database
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          customer_name: trimmedName,
          phone: phoneDigits,
          product_id: product.id,
          amount: product.price,
          payment_status: "processing",
          repair_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Send Telegram notification
      await supabase.functions.invoke("send-booking-telegram", {
        body: {
          booking_id: booking.id,
          customer_name: trimmedName,
          phone: phoneDigits,
          amount: product.price,
        },
      });

      // Navigate to status page with booking ID
      navigate(`/status?booking_id=${booking.id}`);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateUPILink = () => {
    if (!product) return "";
    const upiId = "8812910655@ybl";
    const businessName = "TechnoLogiya";
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${product.price}&cu=INR&tn=${encodeURIComponent("Repair Service")}`;
  };

  return (
    <section id="booking" ref={sectionRef} className="py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
            Book Now
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mt-4 mb-6 tracking-tight">
            Schedule Repair
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
            Book your repair slot and pay securely via UPI
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div
            className={`glass-card p-8 rounded-3xl transition-all duration-700 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* Price Display */}
            {product && (
              <div className="text-center mb-8 p-4 bg-foreground/5 rounded-2xl">
                <p className="text-sm text-muted-foreground mb-1">Service Charge</p>
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="w-8 h-8 text-foreground" />
                  <span className="text-4xl font-bold text-foreground">{product.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{product.name}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Name *
                </label>
                <Input
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background/50 border-border/50 rounded-xl h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <Input
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="bg-background/50 border-border/50 rounded-xl h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Issue Description *
                </label>
                <Textarea
                  placeholder="Describe your device issue"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  required
                  rows={3}
                  className="bg-background/50 border-border/50 rounded-xl resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !product}
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 rounded-full font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Book & Pay via UPI
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                After booking, you'll be redirected to pay via your UPI app
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;

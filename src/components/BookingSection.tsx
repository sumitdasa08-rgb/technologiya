import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight, IndianRupee, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ServicePricing {
  id: string;
  label: string;
  description: string | null;
  price: number;
  is_active: boolean;
  display_order: number;
}

const BookingSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    issue: "",
  });
  const [services, setServices] = useState<ServicePricing[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const locationRequestedRef = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Smart location collection - request once when user starts interacting
  const requestLocation = () => {
    if (locationRequestedRef.current || userLocation) return;
    locationRequestedRef.current = true;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation(`${latitude.toFixed(6)},${longitude.toFixed(6)}`);
        },
        () => {
          // Silently fail - location is optional
          setUserLocation(null);
        },
        { 
          enableHighAccuracy: false, 
          timeout: 10000, 
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    }
  };

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

  // Fetch active services from service_pricing
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("service_pricing")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (data && !error) {
        setServices(data);
      }
    };

    fetchServices();
  }, []);

  // Listen for prefill events from services section
  useEffect(() => {
    const handlePrefill = (e: CustomEvent<{ issue: string; message: string; serviceId?: string }>) => {
      setFormData((prev) => ({
        ...prev,
        issue: e.detail.issue || e.detail.message,
      }));
      // If a serviceId is provided, select it
      if (e.detail.serviceId) {
        setSelectedServiceId(e.detail.serviceId);
      }
      // Request location when user is directed to booking
      requestLocation();
    };

    window.addEventListener("prefillContact", handlePrefill as EventListener);
    return () => window.removeEventListener("prefillContact", handlePrefill as EventListener);
  }, []);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleInputFocus = () => {
    // Request location when user starts filling the form
    requestLocation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedIssue = formData.issue.trim();

    if (!trimmedName || !trimmedPhone || !trimmedIssue) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!selectedServiceId || !selectedService) {
      toast.error("Please select a service");
      return;
    }

    const phoneDigits = trimmedPhone.replace(/[\s\-\(\)]/g, "");
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      toast.error("Please enter a valid phone number (10-15 digits)");
      return;
    }

    setIsLoading(true);

    try {
      // Create booking in database with location
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          customer_name: trimmedName,
          phone: phoneDigits,
          service_id: selectedServiceId,
          amount: selectedService.price,
          payment_status: "processing",
          repair_status: "pending",
          location: userLocation,
        })
        .select()
        .single();

      if (error) throw error;

      // Send Telegram notification with short_ref and location
      await supabase.functions.invoke("send-booking-telegram", {
        body: {
          booking_id: booking.id,
          short_ref: booking.short_ref,
          customer_name: trimmedName,
          phone: phoneDigits,
          amount: booking.amount,
          service: selectedService.label,
          location: userLocation,
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

  return (
    <section id="booking" ref={sectionRef} className="py-16 md:py-32 bg-secondary/30">
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
            Book your repair slot in seconds.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div
            className={`glass-card p-8 rounded-3xl transition-all duration-700 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* Service Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Service *
              </label>
              <Select 
                value={selectedServiceId} 
                onValueChange={(value) => {
                  setSelectedServiceId(value);
                  requestLocation();
                }}
              >
                <SelectTrigger className="bg-background/50 border-border/50 rounded-xl h-12">
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.label} - ₹{service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Display - Show only when service is selected */}
            {selectedService && (
              <div className="text-center mb-8 p-4 bg-foreground/5 rounded-2xl">
                <p className="text-sm text-muted-foreground mb-1">Service Charge</p>
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="w-8 h-8 text-foreground" />
                  <span className="text-4xl font-bold text-foreground">{selectedService.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{selectedService.label}</p>
                {selectedService.description && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedService.description}</p>
                )}
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
                  onFocus={handleInputFocus}
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
                  onFocus={handleInputFocus}
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
                  onFocus={handleInputFocus}
                  required
                  rows={3}
                  className="bg-background/50 border-border/50 rounded-xl resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !selectedService}
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
                    Book for ₹{selectedService?.price || "..."}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                After booking, you'll be redirected to your status page
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
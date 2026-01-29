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
    email: "",
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
          setUserLocation(null);
        },
        { 
          enableHighAccuracy: false, 
          timeout: 10000, 
          maximumAge: 300000
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

  useEffect(() => {
    const handlePrefill = (e: CustomEvent<{ issue: string; message: string; serviceId?: string }>) => {
      setFormData((prev) => ({
        ...prev,
        issue: e.detail.issue || e.detail.message,
      }));
      if (e.detail.serviceId) {
        setSelectedServiceId(e.detail.serviceId);
      }
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
    requestLocation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedIssue = formData.issue.trim();

    if (!trimmedName || !trimmedPhone) {
      toast.error("Please fill in name and phone number");
      return;
    }

    if (trimmedEmail) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(trimmedEmail)) {
        toast.error("Please enter a valid email address");
        return;
      }
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
      const { data: response, error: createError } = await supabase.functions.invoke("create-booking", {
        body: {
          customer_name: trimmedName,
          phone: phoneDigits,
          email: trimmedEmail || null,
          service_id: selectedServiceId,
          location: userLocation,
        },
      });

      if (createError) throw createError;
      
      if (!response?.success || !response?.booking) {
        throw new Error(response?.error || "Failed to create booking");
      }

      const booking = response.booking;
      navigate(`/status?booking_id=${booking.id}`);
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create booking";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="booking" ref={sectionRef} className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div
          className={`text-center mb-12 md:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            Book Now
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-6 tracking-tight font-display">
            Schedule Repair
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Book your repair slot in seconds.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div
            className={`glass-card p-8 rounded-2xl transition-all duration-700 ${
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
                <SelectTrigger className="bg-secondary border-border rounded-xl h-12">
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

            {/* Price Display */}
            {selectedService && (
              <div className="text-center mb-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Service Charge</p>
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="w-8 h-8 text-primary" />
                  <span className="text-4xl font-bold text-foreground font-display">{selectedService.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{selectedService.label}</p>
                {selectedService.description && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedService.description}</p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="bg-secondary border-border rounded-xl h-12"
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
                  className="bg-secondary border-border rounded-xl h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email for updates"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={handleInputFocus}
                  className="bg-secondary border-border rounded-xl h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get payment confirmations and repair updates via email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Issue Description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Textarea
                  placeholder="Describe your device issue"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  onFocus={handleInputFocus}
                  rows={3}
                  className="bg-secondary border-border rounded-xl resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !selectedService}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-medium shadow-lg shadow-primary/20"
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
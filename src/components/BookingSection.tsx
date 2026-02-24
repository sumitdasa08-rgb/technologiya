import { useState, useEffect, useRef, useMemo } from "react";
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
import { Loader2, ArrowRight, ArrowLeft, IndianRupee, Smartphone, Shield, Clock, CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ServicePricing {
  id: string;
  label: string;
  description: string | null;
  price: number;
  is_active: boolean;
  display_order: number;
}

type BookingStep = "datetime" | "details";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const TIME_SLOTS = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const BookingSection = () => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<BookingStep>("datetime");
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

  // Calendar state
  const today = useMemo(() => new Date(), []);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [use24h, setUse24h] = useState(false);
  const [mobileTimeCollapsed, setMobileTimeCollapsed] = useState(false);

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
        () => setUserLocation(null),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("service_pricing")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (data && !error) setServices(data);
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const handlePrefill = (e: CustomEvent<{ issue: string; message: string; serviceId?: string }>) => {
      setFormData((prev) => ({ ...prev, issue: e.detail.issue || e.detail.message }));
      if (e.detail.serviceId) setSelectedServiceId(e.detail.serviceId);
      requestLocation();
    };
    window.addEventListener("prefillContact", handlePrefill as EventListener);
    return () => window.removeEventListener("prefillContact", handlePrefill as EventListener);
  }, []);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleInputFocus = () => requestLocation();

  // Calendar helpers
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const isPastDate = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayStart;
  };

  // Sundays are now open — no day-of-week restrictions
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === calMonth && selectedDate.getFullYear() === calYear;
  };

  const isToday = (day: number) => {
    return day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };

  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const canGoPrev = calYear > today.getFullYear() || (calYear === today.getFullYear() && calMonth > today.getMonth());

  const to24h = (time12: string): string => {
    const [time, period] = time12.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "";
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][selectedDate.getDay()];
    return `${dayName} ${selectedDate.getDate()}`;
  };

  // Filter out past time slots if selected date is today
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return TIME_SLOTS;
    const isSelectedToday = selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear();
    if (!isSelectedToday) return TIME_SLOTS;
    const now = today.getHours() * 60 + today.getMinutes();
    return TIME_SLOTS.filter((slot) => {
      const [time, period] = slot.split(" ");
      let [h, m] = time.split(":").map(Number);
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      return h * 60 + m > now + 30; // 30 min buffer
    });
  }, [selectedDate, today]);

  const handleDateTimeNext = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }
    triggerHaptic();
    requestLocation();
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedEmail = formData.email.trim();

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

      navigate(`/status?booking_id=${response.booking.id}`);
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create booking";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Build calendar grid
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <section id="booking" ref={sectionRef} className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 id="booking-mobile-header" className="text-2xl md:text-3xl font-bold text-foreground tracking-tight font-display">
              Technologiya Repair Booking
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
              Available now
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Quick booking · Fast turnaround</p>
        </div>

        {/* Main Card */}
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-6"}`} style={{ transitionDelay: '150ms' }}>
          <div className="rounded-2xl border border-border/40 bg-card/50 md:backdrop-blur-md overflow-hidden">
            
            {/* Step: Date & Time */}
            {step === "datetime" && (
              <div className="flex flex-col lg:flex-row">
                {/* Left sidebar info */}
                <div className="lg:w-[220px] p-6 border-b lg:border-b-0 lg:border-r border-border/30">
                  <div className="flex lg:flex-col items-center lg:items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-lg font-display">T</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Technologiya</p>
                      <h3 className="text-lg font-semibold text-foreground font-display">Repair Booking</h3>
                      <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm">30 min slot</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span className="text-sm">Asia/Kolkata</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar */}
                <div className="flex-1 p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-border/30">
                  {/* Month nav */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground font-display">
                      {MONTH_NAMES[calMonth]} <span className="text-muted-foreground font-normal">{calYear}</span>
                    </h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrevMonth}
                        disabled={!canGoPrev}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {DAYS.map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarCells.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} />;
                      const past = isPastDate(day);
                      const disabled = past;
                      const sel = isSelected(day);
                      const todayCell = isToday(day);

                      return (
                        <button
                          key={day}
                          disabled={disabled}
                          onClick={() => {
                            setSelectedDate(new Date(calYear, calMonth, day));
                            setSelectedTime(null);
                          }}
                          className={`
                            relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                            ${disabled ? "text-muted-foreground/30 cursor-not-allowed" : "hover:bg-secondary cursor-pointer"}
                            ${sel ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                            ${todayCell && !sel ? "ring-1 ring-primary/40" : ""}
                            ${!disabled && !sel ? "text-foreground" : ""}
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div className="lg:w-[200px] p-4 md:p-6">
                  {selectedDate ? (
                    <>
                      {/* Mobile: collapsed state after time selected */}
                      {isMobile && selectedTime && mobileTimeCollapsed ? (
                        <div className="space-y-3">
                          <button
                            onClick={() => setMobileTimeCollapsed(false)}
                            className="w-full flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium text-foreground">
                                {formatSelectedDate()} · {use24h ? to24h(selectedTime) : selectedTime}
                              </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <Button
                            size="lg"
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20"
                            onClick={() => setStep("details")}
                          >
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-foreground">{formatSelectedDate()}</h4>
                            <div className="flex items-center rounded-full border border-border/50 overflow-hidden text-xs">
                              <button
                                onClick={() => setUse24h(false)}
                                className={`px-2.5 py-1 transition-colors ${!use24h ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                              >
                                12h
                              </button>
                              <button
                                onClick={() => setUse24h(true)}
                                className={`px-2.5 py-1 transition-colors ${use24h ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                              >
                                24h
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                            {availableTimeSlots.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-4">No slots available today</p>
                            ) : (
                              availableTimeSlots.map((slot) => (
                                <button
                                  key={slot}
                                  onClick={() => {
                                    setSelectedTime(slot);
                                    if (isMobile) setMobileTimeCollapsed(true);
                                  }}
                                  className={`
                                    w-full py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-200
                                    ${selectedTime === slot
                                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                      : "border-border/50 text-foreground hover:border-primary/40 hover:bg-secondary/50"
                                    }
                                  `}
                                >
                                  {use24h ? to24h(slot) : slot}
                                </button>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                      <CalendarDays className="w-8 h-8 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">Select a date to see available times</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step: Details */}
            {step === "details" && (
              <div className="p-6 md:p-8 max-w-md mx-auto">
                {/* Back & summary */}
                <button
                  onClick={() => setStep("datetime")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-secondary/30 mb-6">
                  <CalendarDays className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="text-sm">
                    <span className="text-foreground font-medium">
                      {selectedDate?.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="text-muted-foreground"> at </span>
                    <span className="text-foreground font-medium">{use24h && selectedTime ? to24h(selectedTime) : selectedTime}</span>
                  </div>
                </div>

                {/* Service Selection */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Service <span className="text-primary">*</span>
                  </label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl h-12 transition-colors focus:border-primary/40">
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.label} — ₹{service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Display */}
                {selectedService && (
                  <div className="text-center mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Service Charge</p>
                    <div className="flex items-center justify-center gap-1">
                      <IndianRupee className="w-7 h-7 text-primary" />
                      <span className="text-4xl font-bold text-foreground font-display">{selectedService.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{selectedService.label}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Name <span className="text-primary">*</span>
                    </label>
                    <Input
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onFocus={handleInputFocus}
                      required
                      className="bg-secondary/50 border-border/50 rounded-xl h-12 transition-colors focus:border-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number <span className="text-primary">*</span>
                    </label>
                    <Input
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onFocus={handleInputFocus}
                      required
                      className="bg-secondary/50 border-border/50 rounded-xl h-12 transition-colors focus:border-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="For booking updates"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={handleInputFocus}
                      className="bg-secondary/50 border-border/50 rounded-xl h-12 transition-colors focus:border-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Issue <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                    </label>
                    <Textarea
                      placeholder="Describe your device issue"
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      onFocus={handleInputFocus}
                      rows={3}
                      className="bg-secondary/50 border-border/50 rounded-xl resize-none transition-colors focus:border-primary/40"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !selectedService}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
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

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Secure booking · Redirects to status page</p>
                  </div>
                </form>
              </div>
            )}

            {/* Continue button for datetime step */}
            {step === "datetime" && (
              <div className="border-t border-border/30 p-4 md:p-6 flex justify-end">
                <Button
                  onClick={handleDateTimeNext}
                  disabled={!selectedDate || !selectedTime}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 h-11 font-medium shadow-lg shadow-primary/20 disabled:opacity-40"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;

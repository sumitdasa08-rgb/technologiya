import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Clock, CheckCircle, XCircle, AlertCircle, Home, Package, Phone, Wrench, Settings, PartyPopper, Wifi, WifiOff, Copy, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface Booking {
  id: string;
  short_ref: string;
  customer_name: string;
  phone: string;
  amount: number | string;
  payment_status: string;
  repair_status: string;
  created_at: string;
  service_id?: string;
}

// Repair status steps in order
const REPAIR_STAGES = [
  { key: "pending", label: "Booking Received", icon: Package, description: "Your booking has been received" },
  { key: "technician_called", label: "Technician Assigned", icon: Phone, description: "A technician has been assigned" },
  { key: "technician_fixing", label: "Repair In Progress", icon: Wrench, description: "Your device is being repaired" },
  { key: "fixed", label: "Device Fixed", icon: Settings, description: "Your device has been fixed" },
  { key: "customer_satisfied", label: "Completed", icon: PartyPopper, description: "Repair completed successfully" },
];

const Track = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-search if ref is in URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferenceNumber(ref);
      // Trigger search after state update
      setTimeout(() => {
        const form = document.querySelector("form");
        if (form) form.dispatchEvent(new Event("submit", { bubbles: true }));
      }, 100);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedRef = referenceNumber.trim().toUpperCase();
    if (!trimmedRef) {
      setError("Please enter your booking reference number");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const { data: response, error: fetchError } = await supabase.functions.invoke("get-booking-status", {
        body: { short_ref: trimmedRef }
      });

      if (fetchError) throw fetchError;

      if (!response?.success || !response?.booking) {
        setError(response?.error || "No booking found with this reference number. Please check and try again.");
        setBooking(null);
      } else {
        setBooking(response.booking);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
      setError("Failed to search. Please try again.");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription for booking updates
  useEffect(() => {
    if (!booking?.id) return;

    const channel = supabase
      .channel(`track-booking-${booking.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${booking.id}`,
        },
        (payload) => {
          const newData = payload.new as Booking;
          const previousStatus = booking.repair_status;
          
          setBooking(newData);
          
          // Show toast when repair status changes
          if (previousStatus !== newData.repair_status) {
            const stage = REPAIR_STAGES.find(s => s.key === newData.repair_status);
            if (stage) {
              toast.success(`Status Updated: ${stage.label}`, {
                description: stage.description,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      channel.unsubscribe();
    };
  }, [booking?.id, booking?.repair_status]);

  // Copy to clipboard
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case "confirmed":
        return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Payment Confirmed" };
      case "failed":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Payment Failed" };
      default:
        return { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Awaiting Payment" };
    }
  };

  const getCurrentStageIndex = (status: string) => {
    const index = REPAIR_STAGES.findIndex(s => s.key === status);
    return index === -1 ? 0 : index;
  };

  const paymentInfo = booking ? getPaymentStatusInfo(booking.payment_status) : null;
  const currentStageIndex = booking ? getCurrentStageIndex(booking.repair_status) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Connection Status */}
      {booking && (
        <div className="fixed top-20 right-4 z-50">
          <div className="flex items-center gap-2 text-xs bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-sm">
            {realtimeConnected ? (
              <>
                <Wifi className="w-3 h-3 text-green-500" />
                <span className="text-muted-foreground">Live Updates</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-yellow-500" />
                <span className="text-muted-foreground">Connecting...</span>
              </>
            )}
          </div>
        </div>
      )}
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foreground/10 flex items-center justify-center">
              <Package className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Repair</h1>
            <p className="text-muted-foreground">
              Enter your booking reference number to check the status of your repair
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="glass-card p-6 rounded-2xl">
              <label className="block text-sm font-medium text-foreground mb-2">
                Booking Reference Number
              </label>
              <div className="flex gap-3">
                <Input
                  placeholder="e.g., D9B26BD3"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                  className="bg-background/50 border-border/50 rounded-xl h-12 font-mono uppercase"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-foreground text-background hover:bg-foreground/90 h-12 px-6 rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                You can find your reference number in the WhatsApp message we sent you
              </p>
            </div>
          </form>

          {/* Error State */}
          {error && searched && (
            <div className="glass-card p-6 rounded-2xl text-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-foreground font-medium mb-2">Booking Not Found</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Booking Found */}
          {booking && (
            <div className="glass-card p-6 rounded-2xl space-y-6 animate-in fade-in duration-300">
              {/* Customer Info with Copy */}
              <div className="text-center pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground">Booking for</p>
                <p className="text-xl font-semibold text-foreground">{booking.customer_name}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {booking.short_ref}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(booking.short_ref, "Booking ID")}
                  >
                    {copiedField === "Booking ID" ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Payment Status */}
              {paymentInfo && (
                <div className={`p-4 rounded-xl ${paymentInfo.bg} flex items-center gap-3`}>
                  <paymentInfo.icon className={`w-8 h-8 ${paymentInfo.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Status</p>
                    <p className={`font-medium ${paymentInfo.color}`}>{paymentInfo.label}</p>
                  </div>
                </div>
              )}

              {/* Repair Status Timeline */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground mb-4">Repair Progress</p>
                <div className="relative">
                  {REPAIR_STAGES.map((stage, index) => {
                    const isCompleted = index <= currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    const StageIcon = stage.icon;
                    
                    return (
                      <div key={stage.key} className="flex items-start gap-4 relative">
                        {/* Connecting Line */}
                        {index < REPAIR_STAGES.length - 1 && (
                          <div 
                            className={`absolute left-[18px] top-[36px] w-0.5 h-[calc(100%-8px)] ${
                              index < currentStageIndex ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                        
                        {/* Icon */}
                        <div 
                          className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isCompleted 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted text-muted-foreground"
                          } ${isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                        >
                          <StageIcon className="w-4 h-4" />
                        </div>
                        
                        {/* Content */}
                        <div className={`pb-6 ${isCurrent ? "" : ""}`}>
                          <p className={`font-medium text-sm ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {stage.label}
                          </p>
                          <p className={`text-xs ${isCompleted ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                            {stage.description}
                          </p>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              Current Status
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-foreground">₹{booking.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booked On</span>
                  <span className="font-medium text-foreground">
                    {new Date(booking.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* View Full Status Button */}
              <Button
                onClick={() => navigate(`/status?booking_id=${booking.id}`)}
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 rounded-full"
              >
                View Full Status & Payment Options
              </Button>
            </div>
          )}

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Track;

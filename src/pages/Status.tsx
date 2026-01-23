import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Home, Clock, CheckCircle, XCircle, IndianRupee, AlertCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import upiQrImage from "@/assets/upi-qr.jpg";

// Merchant UPI details
const MERCHANT_UPI_ID = "sumitdasa99-3@oksbi";
const MERCHANT_NAME = "Sumit Das";
const MERCHANT_BANK = "Federal Bank";

interface Booking {
  id: string;
  customer_name: string;
  phone: string;
  amount: number | string;
  payment_status: string;
  repair_status: string;
  created_at: string;
  service_id?: string;
}

// Generate dynamic QR code URL using external API
const generateDynamicQRUrl = (amount: number, bookingRef: string) => {
  const upiString = `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Booking-${bookingRef}`)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
};

const Status = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking_id");
  const { playSuccessChime } = useNotificationSound();
  const previousPaymentStatus = useRef<string | null>(null);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showStaticQR, setShowStaticQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBooking = async () => {
    if (!bookingId) {
      setError("No booking ID provided");
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("Booking not found");
      } else {
        setBooking(data);
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
      setError("Failed to load booking");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchBooking();

    // Subscribe to realtime updates for this booking
    if (bookingId) {
      const channel = supabase
        .channel(`booking-${bookingId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `id=eq.${bookingId}`
          },
          (payload) => {
            console.log('Realtime update received:', payload);
            const newBooking = payload.new as Booking;
            
            // Check if payment status just changed to confirmed
            if (
              previousPaymentStatus.current && 
              previousPaymentStatus.current !== 'confirmed' && 
              newBooking.payment_status === 'confirmed'
            ) {
              // Play success chime and show toast
              playSuccessChime();
              toast.success('🎉 Payment Confirmed!', {
                description: 'Your payment has been verified. Repair will begin shortly!',
                duration: 6000,
              });
            }
            
            previousPaymentStatus.current = newBooking.payment_status;
            setBooking(newBooking);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [bookingId, playSuccessChime]);

  // Track initial payment status
  useEffect(() => {
    if (booking && !previousPaymentStatus.current) {
      previousPaymentStatus.current = booking.payment_status;
    }
  }, [booking]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooking();
  };

  const getPaymentStatusDisplay = () => {
    if (!booking) return null;

    switch (booking.payment_status) {
      case "processing":
        return {
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          title: "Payment Processing",
          description: "Please complete payment using the options below.",
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
        };
      case "confirmed":
        return {
          icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
          title: "Payment Confirmed",
          description: "Your payment has been verified. Repair in progress!",
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
        };
      case "failed":
        return {
          icon: <XCircle className="w-8 h-8 text-destructive" />,
          title: "Payment Not Received",
          description: "We couldn't verify your payment. Please try booking again.",
          color: "text-destructive",
          bgColor: "bg-destructive/10",
        };
      default:
        return {
          icon: <AlertCircle className="w-8 h-8 text-muted-foreground" />,
          title: "Unknown Status",
          description: "Please contact support.",
          color: "text-muted-foreground",
          bgColor: "bg-muted/50",
        };
    }
  };

  const getRepairStatusSteps = () => {
    const steps = [
      { key: "pending", label: "Booking Received", icon: "📋" },
      { key: "technician_called", label: "Technician Assigned", icon: "📞" },
      { key: "technician_fixing", label: "Repair In Progress", icon: "🔧" },
      { key: "fixed", label: "Device Fixed", icon: "✅" },
      { key: "customer_satisfied", label: "Completed", icon: "🎉" },
    ];

    const currentIndex = steps.findIndex((s) => s.key === booking?.repair_status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {error || "Booking Not Found"}
            </h1>
            <p className="text-muted-foreground mb-6">
              Unable to find your booking. Please check the booking ID or create a new booking.
            </p>
            <Button onClick={() => navigate("/")} className="rounded-full">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const paymentStatus = getPaymentStatusDisplay();
  const repairSteps = getRepairStatusSteps();
  const bookingAmount = typeof booking.amount === 'string' ? parseFloat(booking.amount) : booking.amount;
  const bookingRef = booking.id.substring(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Booking Status
            </h1>
            <p className="text-muted-foreground">
              Booking ID: <code className="bg-muted px-2 py-1 rounded text-sm">{bookingRef}</code>
            </p>
          </div>

          {/* Booking Info Card */}
          <div className="glass-card p-6 rounded-2xl mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{booking.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{booking.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 text-foreground" />
                  <span className="font-medium text-foreground">{bookingAmount}</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Booked On</p>
                <p className="font-medium text-foreground">
                  {new Date(booking.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus && (
            <div className={`p-6 rounded-2xl mb-6 ${paymentStatus.bgColor}`}>
              <div className="flex items-center gap-4">
                {paymentStatus.icon}
                <div>
                  <h3 className={`font-semibold ${paymentStatus.color}`}>
                    {paymentStatus.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {paymentStatus.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* UPI Payment Section - Show if processing */}
          {booking.payment_status === "processing" && (
            <div className="glass-card p-6 rounded-2xl mb-6">
              {/* Amount Display */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="w-8 h-8 text-foreground" />
                  <span className="text-4xl font-bold text-foreground">{bookingAmount}</span>
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-3">Scan QR to pay exact amount</p>
                <img 
                  src={generateDynamicQRUrl(bookingAmount, bookingRef)}
                  alt="UPI Payment QR Code" 
                  className="w-56 h-56 mx-auto border border-border rounded-lg bg-white p-2"
                  onError={(e) => {
                    // Fallback to static QR if dynamic fails
                    (e.target as HTMLImageElement).src = upiQrImage;
                    setShowStaticQR(true);
                  }}
                />
                {showStaticQR && (
                  <p className="text-xs text-yellow-500 mt-2">
                    Using static QR - please enter amount manually: ₹{bookingAmount}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  Open any UPI app → Scan this QR → Pay
                </p>
              </div>

              {/* Copy UPI ID Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(MERCHANT_UPI_ID);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center justify-center gap-2 w-full bg-foreground hover:bg-foreground/90 text-background py-3 px-4 rounded-full font-medium transition-colors mb-3"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    UPI ID Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy UPI ID to Pay Manually
                  </>
                )}
              </button>

              {/* UPI ID Display */}
              <div className="text-center pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Pay to UPI ID</p>
                <p className="font-mono text-sm text-foreground bg-muted px-3 py-2 rounded-lg inline-block">
                  {MERCHANT_UPI_ID}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {MERCHANT_NAME} • {MERCHANT_BANK}
                </p>
              </div>

              {/* Static QR Fallback */}
              <details className="mt-6 text-center">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  QR not scanning? Use alternate QR
                </summary>
                <div className="mt-4 p-4 bg-muted/50 rounded-xl">
                  <img 
                    src={upiQrImage} 
                    alt="Static UPI QR" 
                    className="w-32 h-32 mx-auto rounded-lg"
                  />
                  <p className="text-xs text-yellow-500 mt-2">
                    ⚠️ Enter amount manually: ₹{bookingAmount}
                  </p>
                </div>
              </details>
            </div>
          )}

          {/* Failed Payment - Show retry option */}
          {booking.payment_status === "failed" && (
            <div className="glass-card p-6 rounded-2xl mb-6">
              <Button
                onClick={() => navigate("/#booking")}
                className="w-full rounded-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Create New Booking
              </Button>
            </div>
          )}

          {/* Repair Status Timeline - Show only if payment confirmed */}
          {booking.payment_status === "confirmed" && (
            <div className="glass-card p-6 rounded-2xl mb-6">
              <h3 className="font-semibold text-foreground mb-6">Repair Progress</h3>
              <div className="space-y-4">
                {repairSteps.map((step, index) => (
                  <div key={step.key} className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        step.completed
                          ? "bg-emerald-500/20"
                          : "bg-muted"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          step.completed ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.current && (
                        <p className="text-xs text-emerald-500">Current Status</p>
                      )}
                    </div>
                    {step.completed && (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Status updates automatically in real-time
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Status;
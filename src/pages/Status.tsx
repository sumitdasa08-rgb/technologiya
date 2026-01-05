import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, RefreshCw, Home, Clock, CheckCircle, XCircle, Smartphone, IndianRupee, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Booking {
  id: string;
  customer_name: string;
  phone: string;
  amount: number | string;
  payment_status: string;
  repair_status: string;
  created_at: string;
}

const Status = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking_id");
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  

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

  useEffect(() => {
    fetchBooking();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchBooking, 10000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooking();
  };

  const UPI_ID = "8812910655-3@nyes";
  const PAYEE_NAME = "Sumit Das";

  const handlePayNow = () => {
    if (!booking) return;

    const amountNum = Number(booking.amount);

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      console.log("[UPI] Invalid amount, not redirecting:", booking.amount);
      toast.error("Payment not initiated. Please retry.");
      return;
    }

    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amountNum}&cu=INR`;

    console.log("[UPI] Redirecting to:", upiUrl);
    window.location.href = upiUrl;
  };

  const getPaymentStatusDisplay = () => {
    if (!booking) return null;

    switch (booking.payment_status) {
      case "processing":
        return {
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          title: "Payment Processing",
          description: "Waiting for admin confirmation. Please complete payment via UPI.",
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
              Booking ID: <code className="bg-muted px-2 py-1 rounded text-sm">{booking.id.substring(0, 8)}</code>
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
                  <span className="font-medium text-foreground">{booking.amount}</span>
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
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Complete Payment
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to pay via your UPI app (GPay, PhonePe, Paytm, etc.)
              </p>
              <Button onClick={handlePayNow} className="w-full rounded-full h-12">
                <IndianRupee className="w-4 h-4 mr-1" />
                Pay ₹{booking.amount} via UPI
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                After payment, admin will confirm and update your status
              </p>
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
            Page auto-refreshes every 10 seconds
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Status;

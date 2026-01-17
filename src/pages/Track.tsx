import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Clock, CheckCircle, XCircle, AlertCircle, Home, Package } from "lucide-react";
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
  service_id?: string;
}

const Track = () => {
  const navigate = useNavigate();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedRef = referenceNumber.trim();
    if (!trimmedRef) {
      setError("Please enter your booking reference number");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Search by full ID or partial match (first 8 chars)
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .or(`id.eq.${trimmedRef},id.ilike.${trimmedRef}%`)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("No booking found with this reference number. Please check and try again.");
        setBooking(null);
      } else {
        setBooking(data);
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

  const getRepairStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Repair Completed" };
      case "in_progress":
        return { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", label: "Repair In Progress" };
      case "cancelled":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Cancelled" };
      default:
        return { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted", label: "Pending" };
    }
  };

  const paymentInfo = booking ? getPaymentStatusInfo(booking.payment_status) : null;
  const repairInfo = booking ? getRepairStatusInfo(booking.repair_status) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
                  placeholder="e.g., 76772884 or full ID"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="bg-background/50 border-border/50 rounded-xl h-12 font-mono"
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
              {/* Customer Info */}
              <div className="text-center pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground">Booking for</p>
                <p className="text-xl font-semibold text-foreground">{booking.customer_name}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  Ref: {booking.id.substring(0, 8).toUpperCase()}
                </p>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Payment Status */}
                {paymentInfo && (
                  <div className={`p-4 rounded-xl ${paymentInfo.bg}`}>
                    <paymentInfo.icon className={`w-6 h-6 ${paymentInfo.color} mb-2`} />
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <p className={`text-sm font-medium ${paymentInfo.color}`}>{paymentInfo.label}</p>
                  </div>
                )}

                {/* Repair Status */}
                {repairInfo && (
                  <div className={`p-4 rounded-xl ${repairInfo.bg}`}>
                    <repairInfo.icon className={`w-6 h-6 ${repairInfo.color} mb-2`} />
                    <p className="text-xs text-muted-foreground">Repair</p>
                    <p className={`text-sm font-medium ${repairInfo.color}`}>{repairInfo.label}</p>
                  </div>
                )}
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

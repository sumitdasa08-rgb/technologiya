import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Home, Clock, CheckCircle, XCircle, AlertCircle, Copy, Check, MessageCircle, Building2, Wifi, WifiOff, ChevronDown, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import paymentQrCode from "@/assets/payment-qr.jpg";
import paymentQrCode100 from "@/assets/payment-qr-100.jpg";
import paymentQrCode200 from "@/assets/payment-qr-200.jpg";
import paymentQrCode300 from "@/assets/payment-qr-300.jpg";
import paymentQrCode350 from "@/assets/payment-qr-350.jpg";

// Merchant details
const MERCHANT_UPI_ID = "sumitdasa99-3@oksbi";
const MERCHANT_NAME = "Sumit Das";
const MERCHANT_WHATSAPP = "918812910655";

// Bank details for manual transfer
const BANK_DETAILS = {
  accountName: "Sumit Das",
  accountNumber: "10690200039498",
  ifsc: "FDRL0001069",
  bankName: "Federal Bank",
  branch: "Agartala"
};
const Status = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    playSuccessChime
  } = useNotificationSound();
  const bookingId = searchParams.get("booking_id") || searchParams.get("id");

  // Core booking state
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(true);
  const [pollingActive, setPollingActive] = useState(false);

  // Fetch booking details
  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setError("No booking ID provided");
      setIsLoading(false);
      return;
    }
    try {
      const {
        data,
        error: fetchError
      } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
      if (fetchError) throw fetchError;
      if (data) {
        const previousStatus = booking?.payment_status;
        setBooking(data);

        // Play sound on payment confirmation
        if (previousStatus === "pending" && data.payment_status === "confirmed") {
          playSuccessChime();
          toast.success("Payment Confirmed! ✅", {
            description: "Your payment has been verified successfully."
          });
        }
      }
    } catch (err: any) {
      console.error("Error fetching booking:", err);
      setError(err.message || "Failed to fetch booking details");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, booking?.payment_status, playSuccessChime]);

  // Initial fetch
  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // Realtime subscription with fallback to polling
  useEffect(() => {
    if (!bookingId) return;
    let pollingInterval: NodeJS.Timeout | null = null;
    let realtimeFailures = 0;
    const channel = supabase.channel(`booking-${bookingId}`).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "bookings",
      filter: `id=eq.${bookingId}`
    }, payload => {
      const newData = payload.new as any;
      const previousStatus = booking?.payment_status;
      setBooking(newData);
      if (previousStatus === "pending" && newData.payment_status === "confirmed") {
        playSuccessChime();
        toast.success("Payment Confirmed! ✅", {
          description: "Your payment has been verified successfully."
        });
      }
    }).subscribe(status => {
      if (status === "SUBSCRIBED") {
        setRealtimeConnected(true);
        setPollingActive(false);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        realtimeFailures++;
        setRealtimeConnected(false);

        // Start polling as fallback after 2 failures
        if (realtimeFailures >= 2 && !pollingInterval) {
          setPollingActive(true);
          pollingInterval = setInterval(() => {
            fetchBooking();
          }, 15000);
        }
      }
    });
    return () => {
      channel.unsubscribe();
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [bookingId, booking?.payment_status, fetchBooking, playSuccessChime]);

  // Copy to clipboard handler
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Copy failed - please copy manually");
    }
  };

  // Generate WhatsApp payment link
  const generateWhatsAppPayLink = () => {
    const amount = booking?.amount || 0;
    const shortRef = booking?.short_ref || bookingId?.slice(0, 8);
    const message = encodeURIComponent(`Hi, I want to pay ₹${amount} for booking #${shortRef}.\n\nUPI ID: ${MERCHANT_UPI_ID}\n\nPlease confirm once received.`);
    return `https://wa.me/${MERCHANT_WHATSAPP}?text=${message}`;
  };

  // Render status icon
  const renderStatusIcon = () => {
    const status = booking?.payment_status;
    if (status === "confirmed") {
      return <CheckCircle className="w-16 h-16 text-green-500" />;
    } else if (status === "pending" || status === "processing") {
      return <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />;
    }
    return <XCircle className="w-16 h-16 text-red-500" />;
  };

  // Render status text
  const getStatusText = () => {
    switch (booking?.payment_status) {
      case "confirmed":
        return "Payment Confirmed";
      case "pending":
      case "processing":
        return "Awaiting Payment";
      case "failed":
        return "Payment Failed";
      default:
        return "Unknown Status";
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </div>;
  }

  // Error state
  if (error || !booking) {
    return <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold">Booking Not Found</h2>
              <p className="text-muted-foreground">{error || "Unable to find booking details"}</p>
              <Button onClick={() => navigate("/")} className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Connection Status */}
      <div className="fixed top-20 right-4 z-50">
        <div className="flex items-center gap-2 text-xs bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-sm">
          {realtimeConnected ? <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-muted-foreground">Live</span>
            </> : pollingActive ? <>
              <WifiOff className="w-3 h-3 text-yellow-500" />
              <span className="text-muted-foreground">Polling</span>
            </> : <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="text-muted-foreground">Offline</span>
            </>}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Status Card */}
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            {renderStatusIcon()}
            <div>
              <h1 className="text-2xl font-bold">{getStatusText()}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Booking #{booking.short_ref || bookingId?.slice(0, 8)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details Card */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{booking.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{booking.phone}</p>
              </div>
              {booking.email && <div className="col-span-2">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{booking.email}</p>
                </div>}
              {booking.location && <div className="col-span-2">
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{booking.location}</p>
                </div>}
            </div>
          </CardContent>
        </Card>

        {/* Payment Section - Only show if pending */}
        {(booking.payment_status === "pending" || booking.payment_status === "processing") && <Card className="border-primary/50">
            <CardContent className="pt-6 space-y-6">
              {/* Amount Display */}
              <div className="text-center py-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                <p className="text-4xl font-bold text-primary">₹{booking.amount}</p>
              </div>

              {/* Scan to Pay QR Code */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <QrCode className="w-4 h-4" />
                  <p className="text-sm font-medium">Scan to Pay or Take a Screenshot and upload to any UPI App</p>
                </div>
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl shadow-sm border">
                    <img src={booking.amount === 100 ? paymentQrCode100 : booking.amount === 200 ? paymentQrCode200 : booking.amount === 300 ? paymentQrCode300 : booking.amount === 350 ? paymentQrCode350 : paymentQrCode} alt="UPI QR Code for payment" className="w-48 h-48 object-contain" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan with any UPI app (GPay, PhonePe, Paytm, etc.)
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* WhatsApp Pay Button */}
              <a href={generateWhatsAppPayLink()} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full h-14 text-lg gap-3 bg-green-600 hover:bg-green-700" size="lg">
                  <MessageCircle className="w-6 h-6" />
                  Pay ₹{booking.amount} via WhatsApp
                </Button>
              </a>

              <p className="text-center text-sm text-muted-foreground">
                Tap to open WhatsApp and complete your payment. We'll confirm once received.
              </p>

              {/* UPI ID Display */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">UPI ID</p>
                  <p className="font-mono text-sm">{MERCHANT_UPI_ID}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(MERCHANT_UPI_ID, "UPI ID")}>
                  {copiedField === "UPI ID" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              {/* Bank Transfer Option */}
              <Collapsible open={showBankDetails} onOpenChange={setShowBankDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Bank Transfer Details
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showBankDetails ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    {Object.entries({
                  "Account Name": BANK_DETAILS.accountName,
                  "Account Number": BANK_DETAILS.accountNumber,
                  "IFSC Code": BANK_DETAILS.ifsc,
                  "Bank Name": BANK_DETAILS.bankName,
                  "Branch": BANK_DETAILS.branch
                }).map(([label, value]) => <div key={label} className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="font-mono text-sm">{value}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(value, label)}>
                          {copiedField === label ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>)}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    After transfer, send screenshot via WhatsApp for faster confirmation
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>}

        {/* Confirmed State */}
        {booking.payment_status === "confirmed" && <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-600">Payment Successful!</h3>
                <p className="text-muted-foreground mt-2">
                  Thank you for your payment. We'll start working on your repair soon.
                </p>
              </div>
              <Link to={`/track?ref=${booking.short_ref || bookingId?.slice(0, 8)}`}>
                <Button className="w-full mt-4">
                  Track Your Repair
                </Button>
              </Link>
            </CardContent>
          </Card>}

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>Need help? Contact us on WhatsApp</p>
          <a href={`https://wa.me/${MERCHANT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
            <MessageCircle className="w-4 h-4" />
            +91 88129 10655
          </a>
        </div>

        {/* Home Button */}
        <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <Footer />
    </div>;
};
export default Status;
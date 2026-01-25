import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Home, Clock, CheckCircle, XCircle, IndianRupee, AlertCircle, Copy, Check, Smartphone, MessageCircle, Building2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import upiQrImage from "@/assets/upi-qr.jpg";

// Merchant details
const MERCHANT_UPI_ID = "sumitdasa99-3@oksbi";
const MERCHANT_NAME = "Sumit Das";
const MERCHANT_BANK = "Federal Bank";
const MERCHANT_WHATSAPP = "918812910655";

// UPI App definitions with package names (Android) and URL schemes (iOS)
// Enhanced for maximum compatibility across all UPI apps
const UPI_APPS = {
  gpay: { 
    name: 'Google Pay', 
    package: 'com.google.android.apps.nbu.paisa.user',
    iosScheme: 'tez',
    icon: '💳',
    color: 'bg-blue-600 hover:bg-blue-700',
    isChat: false
  },
  phonepe: { 
    name: 'PhonePe', 
    package: 'com.phonepe.app',
    iosScheme: 'phonepe',
    icon: '📱',
    color: 'bg-purple-600 hover:bg-purple-700',
    isChat: false
  },
  paytm: { 
    name: 'Paytm', 
    package: 'net.one97.paytm',
    iosScheme: 'paytmmp',
    icon: '💰',
    color: 'bg-sky-600 hover:bg-sky-700',
    isChat: false
  },
  // BHIM removed: Deep links require NPCI merchant registration. QR scanning works reliably.
  amazonpay: { 
    name: 'Amazon Pay', 
    package: 'in.amazon.mShop.android.shopping',
    iosScheme: 'amazonpay',
    icon: '🛒',
    color: 'bg-amber-600 hover:bg-amber-700',
    isChat: false
  },
  cred: { 
    name: 'CRED', 
    package: 'com.dreamplug.androidapp',
    iosScheme: 'cred',
    icon: '💎',
    color: 'bg-gray-700 hover:bg-gray-800',
    isChat: false
  },
  whatsapp: { 
    name: 'WhatsApp Pay', 
    package: 'com.whatsapp',
    iosScheme: 'whatsapp',
    icon: '💬',
    color: 'bg-green-600 hover:bg-green-700',
    isChat: true
  },
} as const;

// Bank transfer details
const BANK_DETAILS = {
  accountName: "Sumit Das",
  accountNumber: "14730100014181",
  ifscCode: "FDRL0001473",
  bankName: "Federal Bank",
  branch: "Memari Branch"
};

// QR Code providers with auto-fallback
const QR_PROVIDERS = [
  (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}`,
  (data: string) => `https://quickchart.io/qr?text=${encodeURIComponent(data)}&size=250`,
  (data: string) => `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(data)}&chs=250x250`,
];

// Connection health types
type ConnectionHealth = 'connected' | 'reconnecting' | 'offline';

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

// Generate UPI string for QR - Optimized for NPCI standards and BHIM compatibility
// Key fixes: Added mandatory 'tr' parameter, removed 'mode=02', use '+' for spaces
// transactionRef is now passed in to prevent regeneration on every render
const generateUPIString = (amount: number, bookingRef: string, transactionRef: string) => {
  const simpleRef = bookingRef.replace(/[^A-Za-z0-9]/g, '');
  const formattedAmount = amount.toFixed(2);
  // Use + for spaces (BHIM works better with this), include mandatory 'tr' parameter
  const merchantName = MERCHANT_NAME.replace(/ /g, '+');
  return `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${merchantName}&am=${formattedAmount}&cu=INR&tn=Order${simpleRef}&tr=${transactionRef}`;
};

// Generate Android intent URL for specific UPI app
// transactionRef is now passed in to prevent regeneration on every render
const generateAndroidIntent = (amount: number, bookingRef: string, packageName: string, transactionRef: string) => {
  const simpleRef = bookingRef.replace(/[^A-Za-z0-9]/g, '');
  const formattedAmount = amount.toFixed(2);
  const merchantName = MERCHANT_NAME.replace(/ /g, '+');
  
  // Other apps: use intent:// for app-specific launching
  const params = `pa=${MERCHANT_UPI_ID}&pn=${merchantName}&am=${formattedAmount}&cu=INR&tn=Order${simpleRef}&tr=${transactionRef}`;
  return `intent://pay?${params}#Intent;scheme=upi;package=${packageName};end`;
};

// Generate iOS deep link for specific UPI app
// transactionRef is now passed in to prevent regeneration on every render
const generateIOSLink = (amount: number, bookingRef: string, iosScheme: string, transactionRef: string) => {
  const simpleRef = bookingRef.replace(/[^A-Za-z0-9]/g, '');
  const formattedAmount = amount.toFixed(2);
  const merchantName = MERCHANT_NAME.replace(/ /g, '+');
  
  // GPay (tez) on iOS works with standard upi:// format
  if (iosScheme === 'tez') {
    return `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${merchantName}&am=${formattedAmount}&cu=INR&tn=Order${simpleRef}&tr=${transactionRef}`;
  }
  return `${iosScheme}://pay?pa=${MERCHANT_UPI_ID}&pn=${merchantName}&am=${formattedAmount}&cu=INR&tn=Order${simpleRef}&tr=${transactionRef}`;
};

// Generate generic UPI deep link as system chooser fallback
// transactionRef is now passed in to prevent regeneration on every render
const generateUPIDeepLink = (amount: number, bookingRef: string, transactionRef: string) => {
  const simpleRef = bookingRef.replace(/[^A-Za-z0-9]/g, '');
  const formattedAmount = amount.toFixed(2);
  const merchantName = MERCHANT_NAME.replace(/ /g, '+');
  return `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${merchantName}&am=${formattedAmount}&cu=INR&tn=Order${simpleRef}&tr=${transactionRef}`;
};

// Generate WhatsApp chat link for WhatsApp Pay
const generateWhatsAppPayLink = (amount: number, bookingRef: string) => {
  const message = `Hi! I'd like to pay ₹${amount} for Booking #${bookingRef}. Please share your UPI ID or payment link so I can complete the payment via WhatsApp Pay.`;
  return `https://wa.me/${MERCHANT_WHATSAPP}?text=${encodeURIComponent(message)}`;
};

// Log client-side errors silently to database
const logPaymentError = async (bookingId: string, eventType: string, errorMessage: string, metadata?: object) => {
  try {
    await supabase.from('payment_logs').insert({
      booking_id: bookingId,
      event_type: `client_${eventType}`,
      error_message: errorMessage,
      metadata: { ...metadata, userAgent: navigator.userAgent, timestamp: new Date().toISOString() },
    });
  } catch {
    // Silently fail - don't disrupt user experience
    console.warn('Failed to log payment error');
  }
};

const Status = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking_id");
  const { playSuccessChime } = useNotificationSound();
  const previousPaymentStatus = useRef<string | null>(null);
  const reconnectAttempts = useRef(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showStaticQR, setShowStaticQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrProviderIndex, setQrProviderIndex] = useState(0);
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>('connected');
  const [qrLoadFailed, setQrLoadFailed] = useState(false);
  const [qrRefreshKey, setQrRefreshKey] = useState(Date.now());
  const [qrCountdown, setQrCountdown] = useState(60);
  const [qrLoading, setQrLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  
  // Stable transaction reference - only changes on manual refresh or booking change
  const [currentTransactionRef, setCurrentTransactionRef] = useState<string>('');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fetchBooking = useCallback(async (silent = false) => {
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
        // Check if payment status changed (for polling mode)
        if (booking && booking.payment_status !== data.payment_status) {
          if (data.payment_status === 'confirmed' && booking.payment_status !== 'confirmed') {
            playSuccessChime();
            toast.success('🎉 Payment Confirmed!', {
              description: 'Your payment has been verified. Repair will begin shortly!',
              duration: 6000,
            });
          }
        }
        setBooking(data);
        previousPaymentStatus.current = data.payment_status;
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
      if (!silent) {
        setError("Failed to load booking");
      }
      // Log fetch error
      if (bookingId) {
        logPaymentError(bookingId, 'fetch_failed', String(err));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookingId, booking, playSuccessChime]);

  // Setup realtime subscription with auto-reconnect
  const setupRealtimeSubscription = useCallback(() => {
    if (!bookingId) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`booking-${bookingId}-${Date.now()}`)
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
      .subscribe((status) => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setConnectionHealth('connected');
          reconnectAttempts.current = 0;
          // Clear polling if we're back online
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnectionHealth('reconnecting');
          
          // Log connection issue
          if (bookingId) {
            logPaymentError(bookingId, 'realtime_disconnected', `Status: ${status}`);
          }
          
          // Auto-reconnect with exponential backoff
          if (reconnectAttempts.current < 5) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            setTimeout(() => {
              reconnectAttempts.current++;
              setupRealtimeSubscription();
            }, delay);
          } else {
            // Give up on realtime, switch to polling
            setConnectionHealth('offline');
            toast.info('Live updates unavailable', {
              description: 'We\'ll check for updates every 15 seconds',
            });
          }
        }
      });

    channelRef.current = channel;
  }, [bookingId, playSuccessChime]);

  // Fallback polling when realtime fails
  useEffect(() => {
    if (connectionHealth === 'offline' && booking?.payment_status === 'processing') {
      pollIntervalRef.current = setInterval(() => {
        fetchBooking(true);
      }, 15000); // Poll every 15 seconds
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [connectionHealth, booking?.payment_status, fetchBooking]);

  // Scroll to top and detect mobile/platform when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
    setIsMobile(mobile);
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));
    setIsAndroid(/Android/i.test(ua));
  }, []);

  // Auto-refresh QR every 60 seconds with visual countdown
  useEffect(() => {
    if (booking?.payment_status === 'processing') {
      const countdownInterval = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) {
            // Reset countdown and refresh QR
            setQrRefreshKey(Date.now());
            setQrProviderIndex(0);
            setQrLoadFailed(false);
            setShowStaticQR(false);
            setQrLoading(true);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [booking?.payment_status]);

  // Generate stable transaction ref only when qrRefreshKey or booking changes
  useEffect(() => {
    if (booking?.id) {
      const simpleRef = booking.id.replace(/[^A-Za-z0-9]/g, '').substring(0, 8);
      const timestamp = qrRefreshKey.toString().slice(-6);
      setCurrentTransactionRef(`TXN${simpleRef}${timestamp}`);
    }
  }, [qrRefreshKey, booking?.id]);

  // Preload next QR provider for instant failover
  useEffect(() => {
    if (booking?.payment_status === 'processing' && qrProviderIndex < QR_PROVIDERS.length - 1 && currentTransactionRef) {
      const bookingAmount = typeof booking.amount === 'string' ? parseFloat(booking.amount) : booking.amount;
      const bookingRef = booking.id.substring(0, 8);
      const nextUrl = QR_PROVIDERS[qrProviderIndex + 1](generateUPIString(bookingAmount, bookingRef, currentTransactionRef));
      const preloadImg = new Image();
      preloadImg.src = `${nextUrl}&_t=${qrRefreshKey}`;
    }
  }, [qrProviderIndex, qrRefreshKey, booking, currentTransactionRef]);

  useEffect(() => {
    fetchBooking();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Track initial payment status
  useEffect(() => {
    if (booking && !previousPaymentStatus.current) {
      previousPaymentStatus.current = booking.payment_status;
    }
  }, [booking]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooking();
    // Also try to reconnect realtime if offline
    if (connectionHealth === 'offline') {
      reconnectAttempts.current = 0;
      setupRealtimeSubscription();
    }
  };

  // Handle QR code load error with auto-fallback
  const handleQRError = () => {
    if (qrProviderIndex < QR_PROVIDERS.length - 1) {
      // Try next provider
      setQrProviderIndex(prev => prev + 1);
      if (bookingId) {
        logPaymentError(bookingId, 'qr_provider_failed', `Provider ${qrProviderIndex} failed, trying next`);
      }
    } else {
      // All providers failed, show static QR
      setShowStaticQR(true);
      setQrLoadFailed(true);
      if (bookingId) {
        logPaymentError(bookingId, 'all_qr_providers_failed', 'Falling back to static QR');
      }
    }
  };

  // Get current QR URL with cache-busting - memoized to prevent unnecessary regeneration
  const getCurrentQRUrl = useCallback((amount: number, bookingRef: string) => {
    if (!currentTransactionRef) return '';
    const upiString = generateUPIString(amount, bookingRef, currentTransactionRef);
    const baseUrl = QR_PROVIDERS[qrProviderIndex](upiString);
    // Add cache-busting parameter to prevent stale QR
    return `${baseUrl}&_t=${qrRefreshKey}`;
  }, [currentTransactionRef, qrProviderIndex, qrRefreshKey]);

  // Manual QR refresh handler
  const handleQRRefresh = () => {
    setQrRefreshKey(Date.now());
    setQrProviderIndex(0);
    setQrLoadFailed(false);
    setShowStaticQR(false);
    setQrLoading(true);
    setQrCountdown(60);
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

              {/* Mobile: App Selection Grid */}
              {isMobile && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Choose your UPI App to pay ₹{bookingAmount}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(UPI_APPS).map(([key, app]) => {
                      // WhatsApp uses chat link, others use UPI intents
                      const href = app.isChat
                        ? generateWhatsAppPayLink(bookingAmount, bookingRef)
                        : isIOS 
                          ? generateIOSLink(bookingAmount, bookingRef, app.iosScheme, currentTransactionRef)
                          : generateAndroidIntent(bookingAmount, bookingRef, app.package, currentTransactionRef);
                      
                      return (
                        <a
                          key={key}
                          href={href}
                          target={app.isChat ? '_blank' : undefined}
                          rel={app.isChat ? 'noopener noreferrer' : undefined}
                          onClick={() => {
                            if (app.isChat) {
                              toast.info('Opening WhatsApp', {
                                description: 'You can pay via WhatsApp Pay in the chat',
                              });
                              return;
                            }
                            // Detect if app didn't open after 1.5s
                            setTimeout(() => {
                              if (document.visibilityState === 'visible') {
                                toast.info(`${app.name} may not be installed`, {
                                  description: 'Try another app or scan QR code below',
                                });
                              }
                            }, 1500);
                          }}
                          className={`flex flex-col items-center justify-center gap-1 ${app.color} text-white py-3 px-2 rounded-xl font-medium transition-colors text-xs`}
                        >
                          <span className="text-xl">{app.icon}</span>
                          {app.name}
                        </a>
                      );
                    })}
                  </div>
                  
                  {/* Generic UPI fallback - System chooser */}
                  <a
                    href={generateUPIDeepLink(bookingAmount, bookingRef, currentTransactionRef)}
                    className="flex items-center justify-center gap-2 w-full mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-4 rounded-xl font-medium transition-all text-sm"
                  >
                    <Smartphone className="w-4 h-4" />
                    Any Other UPI App
                  </a>
                  
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    👆 Tap your preferred UPI app • All apps use NPCI standards
                  </p>
                </div>
              )}

              {/* Desktop/Fallback: Generic UPI Link */}
              {!isMobile && (
                <div className="mb-6">
                  <a 
                    href={generateUPIDeepLink(bookingAmount, bookingRef, currentTransactionRef)}
                    className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-4 rounded-full font-semibold transition-colors text-lg"
                  >
                    <Smartphone className="w-6 h-6" />
                    Pay ₹{bookingAmount} via UPI App
                  </a>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    📱 Open on mobile to tap and pay via GPay, PhonePe, Paytm etc.
                  </p>
                </div>
              )}

              {/* Secondary: Dynamic QR Code with auto-fallback and auto-refresh */}
              <div className="text-center mb-6 pt-4 border-t border-border">
                {/* BHIM users callout - QR is the reliable method for BHIM */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-orange-400">🏦 Using BHIM? Scan the QR code below</p>
                  <p className="text-xs text-muted-foreground mt-1">BHIM app buttons may not work, but QR scanning is fully supported</p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <p className="text-sm text-muted-foreground">Scan QR to pay</p>
                  <button
                    onClick={handleQRRefresh}
                    className="p-1 rounded-md hover:bg-muted transition-colors"
                    title="Refresh QR Code"
                  >
                    <RefreshCw className={`w-3 h-3 text-muted-foreground ${qrLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="relative inline-block">
                  {!qrLoadFailed ? (
                    <img 
                      src={getCurrentQRUrl(bookingAmount, bookingRef)}
                      alt="UPI Payment QR Code" 
                      className={`w-48 h-48 mx-auto border border-border rounded-lg bg-white p-2 transition-opacity ${qrLoading ? 'opacity-50' : 'opacity-100'}`}
                      onLoad={() => setQrLoading(false)}
                      onError={handleQRError}
                    />
                  ) : (
                    <img 
                      src={upiQrImage} 
                      alt="Static UPI QR" 
                      className="w-48 h-48 mx-auto border border-border rounded-lg bg-white p-2"
                    />
                  )}
                  {qrLoading && !qrLoadFailed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    </div>
                  )}
                </div>
                
                {/* Countdown Timer */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>QR refreshes in {qrCountdown}s</span>
                  {qrCountdown <= 30 && (
                    <button
                      onClick={handleQRRefresh}
                      className="text-emerald-600 hover:text-emerald-700 underline ml-1"
                    >
                      Refresh now
                    </button>
                  )}
                </div>
                
                {showStaticQR && (
                  <p className="text-xs text-yellow-500 mt-1">
                    Using backup QR - please enter amount manually: ₹{bookingAmount}
                  </p>
                )}
                {qrProviderIndex > 0 && !qrLoadFailed && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Using backup QR provider ({qrProviderIndex + 1}/{QR_PROVIDERS.length})
                  </p>
                )}
              </div>

              {/* Tertiary: WhatsApp Pay Button */}
              <a 
                href={generateWhatsAppPayLink(bookingAmount, bookingRef)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-full font-medium transition-colors mb-4"
              >
                <MessageCircle className="w-5 h-5" />
                Pay via WhatsApp
              </a>

              {/* Copy UPI ID Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(MERCHANT_UPI_ID);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center justify-center gap-2 w-full bg-foreground hover:bg-foreground/90 text-background py-3 px-4 rounded-full font-medium transition-colors mb-4"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    UPI ID Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy UPI ID
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

              {/* Bank Transfer Collapsible */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Prefer Bank Transfer? Click here
                </summary>
                <div className="mt-4 space-y-3 p-4 bg-muted/50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Name</p>
                      <p className="font-medium text-foreground">{BANK_DETAILS.accountName}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(BANK_DETAILS.accountName, 'accountName')}
                      className="p-2 rounded-lg bg-background hover:bg-accent transition-colors"
                    >
                      {copiedField === 'accountName' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <p className="font-medium font-mono text-foreground">{BANK_DETAILS.accountNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, 'accountNumber')}
                      className="p-2 rounded-lg bg-background hover:bg-accent transition-colors"
                    >
                      {copiedField === 'accountNumber' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">IFSC Code</p>
                      <p className="font-medium font-mono text-foreground">{BANK_DETAILS.ifscCode}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(BANK_DETAILS.ifscCode, 'ifscCode')}
                      className="p-2 rounded-lg bg-background hover:bg-accent transition-colors"
                    >
                      {copiedField === 'ifscCode' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">{BANK_DETAILS.bankName} • {BANK_DETAILS.branch}</p>
                  </div>
                  <p className="text-xs text-yellow-500">
                    ⚠️ Please enter amount: ₹{bookingAmount}
                  </p>
                </div>
              </details>

              {/* Static QR Fallback */}
              <details className="mt-4 text-center">
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

          {/* Connection Health Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {connectionHealth === 'connected' && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-500" />
                Live updates active
              </p>
            )}
            {connectionHealth === 'reconnecting' && (
              <p className="text-xs text-yellow-500 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Reconnecting to live updates...
              </p>
            )}
            {connectionHealth === 'offline' && (
              <p className="text-xs text-orange-500 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Checking every 15s
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Status;
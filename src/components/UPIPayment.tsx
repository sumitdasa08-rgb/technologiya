import { useEffect, useMemo, useState } from "react";
import { Check, Clock, Copy, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface UPIPaymentEnhancedProps {
  amount: number;
  bookingRef?: string;
  onPaymentConfirmed: () => void;
  isLoading: boolean;
}

const UPI_ID = "8812910655@upi";
const COUNTDOWN_SECONDS = 20;

// UPI app configurations with package names for Android intents
const UPI_APPS = [
  {
    name: "Google Pay",
    shortName: "GPay",
    package: "com.google.android.apps.nbu.paisa.user",
    color: "bg-[#4285F4]",
    textColor: "text-white",
  },
  {
    name: "PhonePe",
    shortName: "PhonePe",
    package: "com.phonepe.app",
    color: "bg-[#5f259f]",
    textColor: "text-white",
  },
  {
    name: "Paytm",
    shortName: "Paytm",
    package: "net.one97.paytm",
    color: "bg-[#00BAF2]",
    textColor: "text-white",
  },
  {
    name: "BHIM",
    shortName: "BHIM",
    package: "in.org.npci.upiapp",
    color: "bg-[#00529B]",
    textColor: "text-white",
  },
];

function toMMSS(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export default function UPIPaymentEnhanced({
  amount,
  bookingRef,
  onPaymentConfirmed,
  isLoading,
}: UPIPaymentEnhancedProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [showAllApps, setShowAllApps] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setShowConfirmButton(true);
      return;
    }

    const t = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowConfirmButton(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [countdown]);

  const txnRef = useMemo(() => bookingRef ?? `TXN-${Date.now()}`, [bookingRef]);

  const payeeName = "TechFixPro";
  const displayAmount = Number.isFinite(amount) ? amount : 0;
  const isAmountValid = displayAmount > 0;

  // Base UPI link with amount
  const upiFullLink = useMemo(() => {
    const formattedAmount = displayAmount.toFixed(2);
    return `upi://pay?pa=${UPI_ID}&pn=${payeeName}&am=${formattedAmount}&cu=INR`;
  }, [displayAmount]);

  // Manual pay link (user enters amount inside the UPI app)
  const upiMinimalLink = useMemo(() => {
    return `upi://pay?pa=${UPI_ID}&pn=${payeeName}&cu=INR&tr=${txnRef}`;
  }, [txnRef]);

  // Generate app-specific intent for Android
  const getAppSpecificIntent = (packageName: string, withAmount: boolean) => {
    const baseParams = `pa=${UPI_ID}&pn=${payeeName}&cu=INR`;
    const amountParam = withAmount ? `&am=${displayAmount.toFixed(2)}` : "";
    const refParam = !withAmount ? `&tr=${txnRef}` : "";
    return `intent://pay?${baseParams}${amountParam}${refParam}#Intent;scheme=upi;package=${packageName};end`;
  };

  const qrFullUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiFullLink)}`;
  }, [upiFullLink]);

  const qrMinimalUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiMinimalLink)}`;
  }, [upiMinimalLink]);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success("UPI ID copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy UPI ID");
    }
  };

  const handleCopyAmount = async () => {
    try {
      await navigator.clipboard.writeText(displayAmount.toString());
      toast.success("Amount copied");
    } catch {
      toast.error("Failed to copy amount");
    }
  };

  const handleOpenUpi = (href: string) => {
    window.location.href = href;
  };

  const handleOpenApp = (app: typeof UPI_APPS[0], withAmount: boolean) => {
    if (isAndroid()) {
      // Use Android intent for specific app
      const intent = getAppSpecificIntent(app.package, withAmount);
      window.location.href = intent;
    } else {
      // Fallback to generic UPI link for iOS/desktop
      window.location.href = withAmount ? upiFullLink : upiMinimalLink;
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="bg-background/80 border border-border/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Pay ₹{displayAmount} via UPI
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose your UPI app or scan the QR code to pay.
        </p>

        <Tabs defaultValue="apps" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="apps">Choose App</TabsTrigger>
            <TabsTrigger value="qr">Scan QR</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          {/* App Chooser Tab */}
          <TabsContent value="apps" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(showAllApps ? UPI_APPS : UPI_APPS.slice(0, 2)).map((app) => (
                <Button
                  key={app.package}
                  type="button"
                  variant="outline"
                  className={`h-12 rounded-xl border-2 hover:scale-[1.02] transition-transform ${app.color} ${app.textColor} border-transparent hover:opacity-90`}
                  onClick={() => handleOpenApp(app, true)}
                  disabled={!isAmountValid}
                >
                  {app.shortName}
                </Button>
              ))}
            </div>
            
            {!showAllApps && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAllApps(true)}
                className="text-xs text-muted-foreground"
              >
                Show more apps
              </Button>
            )}

            <div className="pt-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full rounded-full"
                onClick={() => handleOpenUpi(upiFullLink)}
                disabled={!isAmountValid}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Open Any UPI App
              </Button>
            </div>

            {!isAmountValid && (
              <p className="text-xs text-destructive">
                Invalid amount. Please select a service and try again.
              </p>
            )}

            <p className="text-xs text-muted-foreground pt-2">
              If an app shows "request not supported", try another app or use the QR/Manual tab.
            </p>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="mt-4 space-y-4">
            <div className="flex justify-center">
              <div className="bg-background rounded-xl border border-border p-3">
                <img
                  src={qrFullUrl}
                  alt="UPI payment QR code for TechFixPro booking"
                  className="w-52 h-52"
                  loading="lazy"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Scan with any UPI app to pay ₹{displayAmount}
            </p>
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="mt-4 space-y-4">
            <div className="flex justify-center">
              <div className="bg-background rounded-xl border border-border p-3">
                <img
                  src={qrMinimalUrl}
                  alt="UPI QR code for manual amount entry"
                  className="w-44 h-44"
                  loading="lazy"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Enter amount manually in your app:
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-primary">₹{displayAmount}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAmount}
                  className="h-8"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {UPI_APPS.slice(0, 2).map((app) => (
                <Button
                  key={app.package}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`rounded-lg ${app.color} ${app.textColor} border-transparent`}
                  onClick={() => handleOpenApp(app, false)}
                >
                  {app.shortName}
                </Button>
              ))}
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-full"
              onClick={() => handleOpenUpi(upiMinimalLink)}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Open Any UPI App
            </Button>

            <p className="text-xs text-muted-foreground">
              Open app → Enter ₹{displayAmount} → Complete payment
            </p>
          </TabsContent>
        </Tabs>

        {/* UPI ID */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <span className="text-sm text-muted-foreground">UPI ID:</span>
          <code className="bg-muted px-3 py-1 rounded-lg text-foreground font-mono text-sm">
            {UPI_ID}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyUPI}
            className="h-8 w-8 p-0"
            aria-label="Copy UPI ID"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Countdown */}
        <div className="border-t border-border/50 pt-4 mt-4">
          {!showConfirmButton ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {toMMSS(countdown)}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-linear"
                  style={{
                    width: `${((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Complete payment first. Confirm button appears after the timer.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-3">
              After payment, click the button below to confirm your booking.
            </p>
          )}
        </div>
      </div>

      {showConfirmButton ? (
        <Button
          type="button"
          onClick={onPaymentConfirmed}
          disabled={isLoading}
          className="w-full h-12 rounded-full"
        >
          {isLoading ? "Processing..." : "I've Completed Payment"}
        </Button>
      ) : (
        <div className="w-full bg-muted/50 text-muted-foreground h-12 rounded-full font-medium flex items-center justify-center">
          <Clock className="w-4 h-4 mr-2" />
          Please wait {toMMSS(countdown)} to confirm
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Our team will verify your payment and contact you within 30 minutes.
      </p>
    </div>
  );
}

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

const UPI_ID = "sumitdasa99-3@okaxis";
const COUNTDOWN_SECONDS = 20;

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function toMMSS(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  const payeeName = useMemo(() => encodeURIComponent("TechFixPro"), []);
  const transactionNote = useMemo(
    () => encodeURIComponent("Service Booking"),
    []
  );

  // Full intent: may be blocked by some apps due to their risk policy.
  const upiFullLink = useMemo(() => {
    const formattedAmount = encodeURIComponent(amount.toFixed(2));
    return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${payeeName}&am=${formattedAmount}&cu=INR&tn=${transactionNote}&tr=${encodeURIComponent(txnRef)}`;
  }, [amount, payeeName, transactionNote, txnRef]);

  // Minimal intent: user enters amount manually in the app (often more compatible).
  const upiMinimalLink = useMemo(() => {
    return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${payeeName}&cu=INR&tr=${encodeURIComponent(txnRef)}`;
  }, [payeeName, txnRef]);

  const upiFullIntentLink = useMemo(() => {
    // Android intent fallback (opens UPI chooser more reliably on some devices)
    return `intent://pay?${upiFullLink.replace("upi://pay?", "")}#Intent;scheme=upi;end`;
  }, [upiFullLink]);

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

  const handleOpenUpi = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className="space-y-6 text-center">
      <div className="bg-background/80 border border-border/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Pay ₹{amount} via UPI
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Some apps (BHIM/Paytm) may warn due to their own risk policy—try “Scan &
          enter amount” if “Pay ₹{amount}” is blocked.
        </p>

        <Tabs defaultValue="full" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="full">Pay ₹{amount}</TabsTrigger>
            <TabsTrigger value="manual">Scan & enter amount</TabsTrigger>
          </TabsList>

          <TabsContent value="full" className="mt-4 space-y-4">
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

            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              onClick={() => handleOpenUpi(isAndroid() ? upiFullIntentLink : upiFullLink)}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Open UPI App
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="mt-4 space-y-4">
            <div className="flex justify-center">
              <div className="bg-background rounded-xl border border-border p-3">
                <img
                  src={qrMinimalUrl}
                  alt="UPI QR code for manual amount entry"
                  className="w-52 h-52"
                  loading="lazy"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Scan this QR, then enter ₹{amount} in your UPI app.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              onClick={() => handleOpenUpi(upiMinimalLink)}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Open UPI (manual)
            </Button>
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

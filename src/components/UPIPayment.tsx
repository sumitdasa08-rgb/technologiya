import { useState, useEffect } from "react";
import { Copy, Check, Smartphone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UPIPaymentProps {
  amount: number;
  onPaymentConfirmed: () => void;
  isLoading: boolean;
}

const UPI_ID = "sumitdasa99-3@okaxis";
const COUNTDOWN_SECONDS = 20; // 20 seconds

const UPIPayment = ({ amount, onPaymentConfirmed, isLoading }: UPIPaymentProps) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) {
      setShowConfirmButton(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowConfirmButton(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success("UPI ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy UPI ID");
    }
  };

  // Format countdown as MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate UPI deep link for mobile
  const upiDeepLink = `upi://pay?pa=${UPI_ID}&pn=TechFix%20Pro&am=${amount}&cu=INR&tn=Service%20Booking`;

  // QR code URL using a free API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`;

  return (
    <div className="space-y-6 text-center">
      <div className="bg-background/80 border border-border/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Pay ₹{amount} via UPI
        </h3>
        
        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-xl">
            <img 
              src={qrCodeUrl} 
              alt="UPI QR Code" 
              className="w-48 h-48"
              loading="lazy"
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Scan with Google Pay, PhonePe, Paytm or any UPI app
        </p>

        {/* UPI ID */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">UPI ID:</span>
          <code className="bg-foreground/10 px-3 py-1 rounded-lg text-foreground font-mono text-sm">
            {UPI_ID}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyUPI}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Mobile Deep Link */}
        <a
          href={upiDeepLink}
          className="inline-flex items-center justify-center gap-2 bg-foreground/10 hover:bg-foreground/20 text-foreground px-4 py-2 rounded-full text-sm font-medium transition-colors mb-4"
        >
          <Smartphone className="w-4 h-4" />
          Open UPI App
        </a>

        <div className="border-t border-border/50 pt-4 mt-4">
          {!showConfirmButton ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <Clock className="w-5 h-5 animate-pulse" />
                <span className="text-lg font-semibold">{formatCountdown(countdown)}</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Complete your payment. Confirmation button will appear after the timer.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-3">
              After payment, click the button below to confirm your booking
            </p>
          )}
        </div>
      </div>

      {showConfirmButton ? (
        <Button
          type="button"
          onClick={onPaymentConfirmed}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-full font-medium transition-all duration-300"
        >
          {isLoading ? "Processing..." : "I've Completed Payment ✓"}
        </Button>
      ) : (
        <div className="w-full bg-muted/50 text-muted-foreground h-12 rounded-full font-medium flex items-center justify-center">
          <Clock className="w-4 h-4 mr-2" />
          Please wait {formatCountdown(countdown)} to confirm
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Our team will verify your payment and contact you within 30 minutes
      </p>
    </div>
  );
};

export default UPIPayment;

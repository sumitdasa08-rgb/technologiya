import { useState, useEffect, useCallback } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const AUTO_DISMISS_DURATION = 3000; // 3 seconds
const PROGRESS_INTERVAL = 30; // Update every 30ms for smooth animation

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed the banner before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true);
        setProgress(100); // Reset progress when showing
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!showBanner || isPaused) return;

    const decrementAmount = (100 / AUTO_DISMISS_DURATION) * PROGRESS_INTERVAL;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrementAmount;
        if (newProgress <= 0) {
          clearInterval(interval);
          handleDismiss();
          return 0;
        }
        return newProgress;
      });
    }, PROGRESS_INTERVAL);

    return () => clearInterval(interval);
  }, [showBanner, isPaused]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  }, []);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (isInstalled || !showBanner || !deferredPrompt) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 z-50 animate-fade-up sm:left-auto sm:right-4 sm:max-w-sm"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
    >
      <div className="glass-card rounded-2xl p-4 border border-border/50 shadow-xl overflow-hidden">
        {/* Progress bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30">
          <div 
            className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={handleDismiss}
          className="absolute right-3 top-4 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3 mt-1">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-primary-foreground" />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-semibold text-foreground text-sm">
              Install LogicLabs
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add to home screen for quick access & offline use
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-1 text-muted-foreground"
          >
            Not now
          </Button>
          <Button
            size="sm"
            onClick={handleInstall}
            className="flex-1 gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Install
          </Button>
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <p className="text-[10px] text-muted-foreground text-center mt-2 animate-fade-in">
            ⏸ Paused
          </p>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;

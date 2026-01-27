import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const UpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) return;

    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        setRegistration(reg);

        // Listen for new service worker installations
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            // When new SW is installed and waiting, show prompt
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setShowUpdate(true);
            }
          });
        });

        // Check if there's already a waiting worker
        if (reg.waiting && navigator.serviceWorker.controller) {
          setShowUpdate(true);
        }

        // Also check for updates periodically (every 60 seconds)
        const interval = setInterval(() => {
          reg.update().catch(console.error);
        }, 60000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error("Service worker registration error:", error);
      }
    };

    checkForUpdates();

    // Listen for controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const handleRefresh = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      // Fallback: just reload the page
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-fade-in">
      <div className="bg-primary text-primary-foreground px-4 py-3 shadow-lg">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <p className="text-sm font-medium">
              A new version is available!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="secondary"
              className="h-8 px-4 text-xs font-semibold"
            >
              Refresh Now
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-primary-foreground/10 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePrompt;

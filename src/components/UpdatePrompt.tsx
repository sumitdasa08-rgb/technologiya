import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

const UpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleRefresh = useCallback(() => {
    // Force a hard refresh bypassing cache
    if (caches) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;

        // Listen for new service worker installations
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            // When new SW is installed and waiting, trigger update
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setShowUpdate(true);
              // Tell the new SW to take over immediately
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        // Check if there's already a waiting worker
        if (reg.waiting && navigator.serviceWorker.controller) {
          setShowUpdate(true);
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        // Check for updates on page load and periodically
        reg.update().catch(console.error);
        const interval = setInterval(() => {
          reg.update().catch(console.error);
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
      } catch (error) {
        console.error("Service worker registration error:", error);
      }
    };

    checkForUpdates();

    // Listen for controller change - this fires when new SW takes over
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      handleRefresh();
    });
  }, [handleRefresh]);

  // Countdown timer for auto-refresh
  useEffect(() => {
    if (!showUpdate) return;

    if (countdown <= 0) {
      handleRefresh();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showUpdate, countdown, handleRefresh]);

  if (!showUpdate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-fade-in">
      <div className="bg-primary text-primary-foreground px-4 py-3 shadow-lg">
        <div className="container mx-auto flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <p className="text-sm font-medium">
            New update available! Refreshing in {countdown}...
          </p>
          <button
            onClick={handleRefresh}
            className="text-xs underline hover:no-underline font-semibold"
          >
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePrompt;

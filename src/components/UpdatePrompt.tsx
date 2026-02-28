import { useEffect, useCallback } from "react";

const UpdatePrompt = () => {
  const handleRefresh = useCallback(() => {
    // Force a hard refresh bypassing cache
    if (caches) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name).catch((err) => console.error(`Failed to delete cache ${name}:`, err));
        });
      }).catch((err) => console.error("Failed to clear caches:", err));
    }
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reloading = false;

    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;

        // If a new service worker is already waiting, activate it immediately
        if (reg.waiting && navigator.serviceWorker.controller) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        // Check for updates on page load
        reg.update().catch(console.error);
      } catch (error) {
        console.error("Service worker registration error:", error);
      }
    };

    checkForUpdates();

    // Listen for controller change - this fires when new SW takes over
    const handleControllerChange = () => {
      if (reloading) return;
      reloading = true;
      handleRefresh();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, [handleRefresh]);

  // No visible UI - updates happen silently on page load
  return null;
};

export default UpdatePrompt;
